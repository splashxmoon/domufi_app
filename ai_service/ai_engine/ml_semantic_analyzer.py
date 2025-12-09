from typing import Dict, List, Any, Optional, Tuple
import re
import json
from datetime import datetime

from ai_engine.embedding_model import AdvancedEmbeddingModel
from ai_engine.vector_store import VectorStore
from ai_engine.knowledge_base import KnowledgeBase
from utils.logger import setup_logger

logger = setup_logger(__name__)


class MLSemanticAnalyzer:

    def __init__(
        self,
        embedding_model: AdvancedEmbeddingModel,
        vector_store: VectorStore,
        knowledge_base: KnowledgeBase
    ):
        self.embedding_model = embedding_model
        self.vector_store = vector_store
        self.knowledge_base = knowledge_base
        self.ready = False


        self.intent_examples = {}
        self.entity_models = {}

    async def initialize(self):
        logger.info("Initializing ML-based semantic analyzer...")

        try:

            await self._load_learned_patterns()

            self.ready = True
            logger.info("✅ ML semantic analyzer initialized")
        except Exception as e:
            logger.error(f"Error initializing ML semantic analyzer: {e}", exc_info=True)
            raise

    async def cleanup(self):
        self.ready = False

    def is_ready(self) -> bool:
        return self.ready

    async def _load_learned_patterns(self):

        intents = ["investment_advice", "market_analysis", "portfolio_inquiry",
                  "wallet_inquiry", "explanation", "comparison", "property_search",
                  "new_user_help", "general_inquiry"]

        for intent in intents:
            examples = await self.vector_store.get_by_intent(intent, top_k=10)
            self.intent_examples[intent] = [ex["text"] for ex in examples]

    async def analyze(
        self,
        message: str,
        conversation_history: List[Dict[str, str]],
        context: Dict[str, Any]
    ) -> Dict[str, Any]:

        intent, intent_confidence = await self._detect_intent_ml(message)


        entities = await self._extract_entities_ml(message, intent)


        topics = await self._extract_topics_ml(message)


        is_follow_up = await self._is_follow_up_ml(message, conversation_history)


        contextual_intent = await self._apply_context(message, intent, conversation_history, context)

        return {
            "intent": contextual_intent or intent,
            "confidence": intent_confidence,
            "entities": entities,
            "topics": topics,
            "is_follow_up": is_follow_up,
            "message": message,
            "original_intent": intent
        }

    async def _detect_intent_ml(self, message: str) -> Tuple[str, float]:
        msg_lower = message.lower()



        if any(keyword in msg_lower for keyword in [
            "how is the market", "market in", "market conditions", "market trends",
            "best market", "what's the market", "market analysis", "market data",
            "how is the housing market", "real estate market"
        ]):
            return "market_analysis", 0.95


        if any(keyword in msg_lower for keyword in [
            "show me properties", "show properties", "find properties", "search properties",
            "properties under", "available properties", "list properties"
        ]):
            return "property_search", 0.9


        if any(keyword in msg_lower for keyword in [
            "what should i invest", "recommend", "suggest", "best investment",
            "what to invest", "investment recommendation"
        ]):
            return "investment_advice", 0.9


        explanation_keywords = [
            "how does", "how do", "how is", "how are", "how can",
            "what is", "what are", "what does", "what do",
            "explain", "tell me about", "describe", "define",
            "why does", "why do", "why is", "why are"
        ]

        if any(keyword in msg_lower for keyword in explanation_keywords):
            # Check if there's a topic mentioned (like "fractional ownership")
            if "fractional" in msg_lower or "ownership" in msg_lower or "token" in msg_lower:
                return "explanation", 0.95
            # Check if it's about a concept, not a market
            if not any(market_word in msg_lower for market_word in ["market", "nyc", "miami", "city", "location"]):
                return "explanation", 0.85


        if any(keyword in msg_lower for keyword in [
            "show my portfolio", "my investments", "my portfolio",
            "portfolio overview", "view portfolio"
        ]):
            # Make sure it's not about properties
            if "properties" not in msg_lower and "property" not in msg_lower:
                return "portfolio_inquiry", 0.9


        if any(keyword in msg_lower for keyword in ["wallet", "balance", "how much do i have"]):
            return "wallet_inquiry", 0.9


        if any(keyword in msg_lower for keyword in ["compare", "vs", "versus", "difference between"]):
            return "comparison", 0.85


        if any(keyword in msg_lower for keyword in ["find properties", "search for", "show properties", "available properties"]):
            return "property_search", 0.85


        if not self.intent_examples or all(not ex for ex in self.intent_examples.values()):

            return "general_inquiry", 0.5


        intent_scores = {}

        for intent, examples in self.intent_examples.items():
            if not examples:
                continue


            similarities = await self.embedding_model.find_most_similar(
                query=message,
                candidates=examples,
                top_k=min(3, len(examples)),
                threshold=0.3
            )

            if similarities:

                avg_similarity = sum(score for _, score in similarities) / len(similarities)
                intent_scores[intent] = avg_similarity


        similar_patterns = await self.vector_store.search(
            query=message,
            top_k=5,
            filter_metadata={"type": "user_pattern"},
            threshold=0.5
        )


        for pattern in similar_patterns:
            pattern_intent = pattern.get("intent", "general_inquiry")
            if pattern_intent not in intent_scores:
                intent_scores[pattern_intent] = 0.0
            intent_scores[pattern_intent] += pattern.get("similarity", 0) * 0.3

        if not intent_scores:
            return "general_inquiry", 0.5


        best_intent = max(intent_scores.items(), key=lambda x: x[1])
        confidence = min(0.95, best_intent[1])

        return best_intent[0], confidence

    async def _extract_entities_ml(self, message: str, intent: str) -> Dict[str, Any]:
        entities = {}
        msg_lower = message.lower()


        entity_patterns = await self.vector_store.search(
            query=message,
            top_k=3,
            filter_metadata={"type": "entity_pattern"},
            threshold=0.4
        )


        for pattern in entity_patterns:
            pattern_entities = pattern.get("entities", {})
            if isinstance(pattern_entities, str):
                try:
                    pattern_entities = json.loads(pattern_entities)
                except:
                    continue


            similarity = pattern.get("similarity", 0.5)
            for key, value in pattern_entities.items():
                if key not in entities or similarity > 0.7:
                    entities[key] = value



        msg_lower_for_location = message.lower()
        city_map = {
            "nyc": "NYC", "new york": "NYC", "ny": "NYC",
            "miami": "Miami, FL", "florida": "Miami, FL",
            "los angeles": "Los Angeles, CA", "la": "Los Angeles, CA",
            "atlanta": "Atlanta, GA", "chicago": "Chicago, IL",
            "seattle": "Seattle, WA", "dallas": "Dallas, TX",
            "phoenix": "Phoenix, AZ"
        }



        for city_key, city_value in city_map.items():

            pattern = r'\b' + re.escape(city_key) + r'\b'
            if re.search(pattern, msg_lower_for_location, re.IGNORECASE):
                entities["location"] = city_value
                logger.debug(f"Extracted location '{city_value}' from message using direct match")
                break


        if "location" not in entities:
            location_patterns = [
                r"\b(?:in|at|near|around)\s+(NYC|New\s+York|Miami|Atlanta|Chicago|Los\s+Angeles|LA|Seattle|Dallas|Phoenix|NY|FL|CA|TX|IL|GA|WA)\b",
                r"\b(NYC|LA|Miami|Chicago|Atlanta|Seattle|New York|Los Angeles)\b",
                r"\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*),\s*([A-Z]{2})\b"
            ]

            for pattern in location_patterns:
                match = re.search(pattern, message, re.IGNORECASE)
                if match:
                    location = match.group(0) if match.lastindex == 0 else match.group(1)
                    normalized = self._normalize_location(location.strip())
                    if normalized:
                        entities["location"] = normalized
                        break


        budget_patterns = [
            r"(?:under|below|less than|up to|maximum|max|at most)\s*\$?(\d+(?:,\d{3})*(?:\.\d{2})?)",
            r"(?:budget|have|spend|invest)\s*(?:of|:)?\s*\$?(\d+(?:,\d{3})*(?:\.\d{2})?)",
            r"\$(\d+(?:,\d{3})*(?:\.\d{2})?)"
        ]

        for pattern in budget_patterns:
            match = re.search(pattern, message, re.IGNORECASE)
            if match:
                amount = float(match.group(1).replace(',', ''))
                entities["budget"] = {"max": amount, "type": "max"}
                break


        if intent == "explanation":

            topic_patterns = [
                r"(?:what is|explain|tell me about|how does|what are|define|describe)\s+([a-zA-Z\s]+?)(?:\s+work|\?|$|\.)",
                r"how does\s+([a-zA-Z\s]+?)\s+work",
                r"what is\s+([a-zA-Z\s]+?)(?:\?|$|\.)",
                r"explain\s+([a-zA-Z\s]+?)(?:\?|$|\.)",
                r"tell me about\s+([a-zA-Z\s]+?)(?:\?|$|\.)",
            ]

            for pattern in topic_patterns:
                match = re.search(pattern, message, re.IGNORECASE)
                if match:
                    topic = match.group(1).strip()

                    topic = re.sub(r'\b(the|a|an|how|does|is|are|work)\b', '', topic, flags=re.IGNORECASE).strip()
                    if topic:
                        entities["topic"] = topic
                        break


            if "fractional" in msg_lower or "fractional ownership" in msg_lower:
                entities["topic"] = "fractional ownership"
            elif "token" in msg_lower:
                entities["topic"] = "token"
            elif "roi" in msg_lower or "return on investment" in msg_lower:
                entities["topic"] = "roi"

        return entities

    async def _extract_topics_ml(self, message: str) -> List[str]:

        similar_knowledge = await self.vector_store.search(
            query=message,
            top_k=3,
            filter_metadata={"type": "knowledge"},
            threshold=0.5
        )

        topics = []
        for item in similar_knowledge:
            topic = item.get("topic") or item.get("text", "")
            if topic and topic not in topics:
                topics.append(topic)

        return topics[:5]

    async def _is_follow_up_ml(
        self,
        message: str,
        conversation_history: List[Dict[str, str]]
    ) -> bool:
        if not conversation_history:
            return False


        last_assistant_msg = None
        for msg in reversed(conversation_history):
            if msg.get("role") == "assistant":
                last_assistant_msg = msg.get("content", "")
                break

        if not last_assistant_msg:
            return False


        similarity = await self.embedding_model.similarity(message, last_assistant_msg)


        if len(message.split()) < 8 and similarity > 0.4:
            return True


        follow_up_examples = [
            "tell me more", "what about", "how about", "and", "also",
            "can you explain", "what does that mean"
        ]

        for example in follow_up_examples:
            if await self.embedding_model.similarity(message.lower(), example) > 0.6:
                return True

        return False

    async def _apply_context(
        self,
        message: str,
        intent: str,
        conversation_history: List[Dict[str, str]],
        context: Dict[str, Any]
    ) -> Optional[str]:
        if not conversation_history:
            return None


        recent_topics = []
        for msg in conversation_history[-5:]:
            topics = await self._extract_topics_ml(msg.get("content", ""))
            recent_topics.extend(topics)


        if recent_topics:
            message_topics = await self._extract_topics_ml(message)
            if any(topic in message_topics for topic in recent_topics):
                return intent

        return None

    def _normalize_location(self, location: str) -> str:
        location_map = {
            "nyc": "New York, NY",
            "new york city": "New York, NY",
            "new york": "New York, NY",
            "la": "Los Angeles, CA",
            "los angeles": "Los Angeles, CA",
            "miami": "Miami, FL",
            "chicago": "Chicago, IL",
            "atlanta": "Atlanta, GA",
            "seattle": "Seattle, WA"
        }

        location_lower = location.lower().strip()
        return location_map.get(location_lower, location)
