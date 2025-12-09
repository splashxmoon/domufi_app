import re
from typing import Dict, List, Any, Optional
from datetime import datetime

from ai_engine.knowledge_base import KnowledgeBase
from utils.logger import setup_logger

logger = setup_logger(__name__)


class SemanticAnalyzer:

    def __init__(self, knowledge_base: KnowledgeBase):
        self.knowledge_base = knowledge_base
        self.ready = False
        self.intent_patterns = self._load_intent_patterns()
        self.entity_patterns = self._load_entity_patterns()

    async def initialize(self):
        self.ready = True
        logger.info("✅ Semantic analyzer initialized")

    async def cleanup(self):
        self.ready = False

    def is_ready(self) -> bool:
        return self.ready

    def _load_intent_patterns(self) -> Dict[str, List[str]]:
        return {
            "investment_advice": [
                "what should i invest", "recommend", "suggest", "what to invest",
                "best investment", "investment advice", "what should i buy"
            ],
            "market_analysis": [
                "how is the market", "market in", "market analysis", "market condition",
                "market trend", "best market", "which market"
            ],
            "portfolio_inquiry": [
                "portfolio", "my investment", "show me my", "what do i own"
            ],
            "wallet_inquiry": [
                "wallet", "balance", "funds", "how much money"
            ],
            "explanation": [
                "how does", "what is", "explain", "tell me about", "what are",
                "define", "how do", "how can", "can you explain"
            ],
            "comparison": [
                "compare", "vs", "versus", "difference", "better", "best"
            ],
            "property_search": [
                "properties", "available", "browse", "find", "search", "show me properties"
            ],
            "new_user_help": [
                "getting started", "help", "how do i", "new user", "beginner", "guide"
            ]
        }

    def _load_entity_patterns(self) -> Dict[str, str]:
        return {
            "location": r"\b(?:in|at|near|around)\s+([A-Z][a-zA-Z\s,]+(?:City|State|NY|CA|FL|TX|IL|GA|WA))|\b(?:NYC|LA|Miami|Chicago|Atlanta|Seattle)\b",
            "budget": r"(?:under|below|less than|up to|maximum|max|at most)\s*\$?(\d+(?:,\d{3})*(?:\.\d{2})?)",
            "amount": r"\$?(\d+(?:,\d{3})*(?:\.\d{2})?)",
            "topic": r"(?:what is|explain|tell me about|what are|define)\s+([a-zA-Z\s]+)",
        }

    async def analyze(
        self,
        message: str,
        conversation_history: List[Dict[str, str]],
        context: Dict[str, Any]
    ) -> Dict[str, Any]:
        msg_lower = message.lower()


        intent, intent_confidence = self._detect_intent(msg_lower, conversation_history)


        entities = self._extract_entities(message, intent)


        topics = self._extract_topics(message, intent)


        is_follow_up = self._is_follow_up(message, conversation_history)

        return {
            "intent": intent,
            "confidence": intent_confidence,
            "entities": entities,
            "topics": topics,
            "is_follow_up": is_follow_up,
            "message": message
        }

    def _detect_intent(self, message: str, conversation_history: List[Dict]) -> tuple:
        intent_scores = {}


        for intent, patterns in self.intent_patterns.items():
            score = 0
            for pattern in patterns:
                if pattern in message:
                    score += 1

            if score > 0:
                intent_scores[intent] = score / len(patterns)

        if not intent_scores:
            return "general_inquiry", 0.5


        best_intent = max(intent_scores.items(), key=lambda x: x[1])


        if conversation_history:
            last_intent = self._get_last_intent(conversation_history)
            if last_intent == best_intent[0]:

                confidence = min(0.95, best_intent[1] + 0.2)
            else:
                confidence = best_intent[1]
        else:
            confidence = best_intent[1]

        return best_intent[0], confidence

    def _extract_entities(self, message: str, intent: str) -> Dict[str, Any]:
        entities = {}


        location_match = re.search(self.entity_patterns["location"], message, re.IGNORECASE)
        if location_match:
            location = location_match.group(1) or location_match.group(0)
            entities["location"] = self._normalize_location(location)


        budget_match = re.search(self.entity_patterns["budget"], message, re.IGNORECASE)
        if budget_match:
            amount = float(budget_match.group(1).replace(',', ''))
            entities["budget"] = {"max": amount, "type": "max"}


        amount_matches = re.findall(self.entity_patterns["amount"], message)
        if amount_matches and "budget" not in entities:
            amounts = [float(amt.replace(',', '')) for amt in amount_matches]
            if amounts:
                entities["amount"] = max(amounts)


        if intent == "explanation":
            topic_match = re.search(self.entity_patterns["topic"], message, re.IGNORECASE)
            if topic_match:
                entities["topic"] = topic_match.group(1).strip()

        return entities

    def _extract_topics(self, message: str, intent: str) -> List[str]:
        topics = []


        if intent == "explanation":
            topic_pattern = r"(?:what is|explain|tell me about|how does)\s+([a-zA-Z\s]+)"
            match = re.search(topic_pattern, message, re.IGNORECASE)
            if match:
                topics.append(match.group(1).strip())

        return topics

    def _is_follow_up(self, message: str, conversation_history: List[Dict]) -> bool:
        if not conversation_history:
            return False


        follow_up_indicators = ["it", "that", "this", "them", "they", "what about", "how about", "and"]
        msg_lower = message.lower()


        if len(message.split()) < 5 and any(indicator in msg_lower for indicator in follow_up_indicators):
            return True


        if any(msg_lower.startswith(indicator) for indicator in ["what about", "how about", "and"]):
            return True

        return False

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

    def _get_last_intent(self, conversation_history: List[Dict]) -> Optional[str]:

        return None
