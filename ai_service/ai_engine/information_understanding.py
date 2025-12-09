from typing import Dict, List, Any, Optional
import re
from datetime import datetime

from ai_engine.embedding_model import AdvancedEmbeddingModel
from ai_engine.vector_store import VectorStore
from utils.logger import setup_logger

logger = setup_logger(__name__)


class InformationUnderstandingEngine:

    def __init__(
        self,
        embedding_model: AdvancedEmbeddingModel,
        vector_store: VectorStore
    ):
        self.embedding_model = embedding_model
        self.vector_store = vector_store
        self.ready = False

    async def initialize(self):
        self.ready = True
        logger.info("Information Understanding Engine initialized")

    async def cleanup(self):
        self.ready = False

    def is_ready(self) -> bool:
        return self.ready

    async def understand_and_reason(
        self,
        extracted_info: Dict[str, Any],
        user_query: str,
        context: Dict[str, Any],
        prior_knowledge: List[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        if not self.ready:
            return {"understood_insights": [], "reasoning": [], "synthesized_info": ""}

        understanding_result = {
            "understood_insights": [],
            "reasoning": [],
            "synthesized_info": "",
            "key_takeaways": [],
            "confidence": 0.5
        }

        try:

            web_content = extracted_info.get("synthesized_info", "")
            web_facts = extracted_info.get("key_facts", [])

            if not web_content and not web_facts:
                return understanding_result


            understood_insights = await self._understand_meaning(
                web_content,
                web_facts,
                user_query
            )
            understanding_result["understood_insights"] = understood_insights


            reasoning = await self._reason_about_relevance(
                understood_insights,
                user_query,
                context
            )
            understanding_result["reasoning"] = reasoning


            if prior_knowledge:
                synthesized = await self._synthesize_with_knowledge(
                    understood_insights,
                    prior_knowledge,
                    user_query
                )
                understanding_result["synthesized_info"] = synthesized
            else:

                understanding_result["synthesized_info"] = await self._synthesize_insights(
                    understood_insights,
                    user_query
                )


            understanding_result["key_takeaways"] = await self._extract_takeaways(
                understanding_result["synthesized_info"],
                user_query
            )

            # If we still don't have synthesized info, try multiple fallbacks
            if not understanding_result["synthesized_info"] or len(understanding_result["synthesized_info"].strip()) < 50:
                logger.debug(f"Trying fallback synthesis for '{user_query}' - current length: {len(understanding_result.get('synthesized_info', '') or '')}")


                if web_content and len(web_content.strip()) > 50:

                    sentences = re.split(r'[.!?]+', web_content)
                    meaningful = []
                    for sentence in sentences[:10]:
                        sentence = sentence.strip()

                        if 30 <= len(sentence) <= 400:

                            if not self._is_junk_sentence(sentence):
                                meaningful.append(sentence)
                    if meaningful:
                        understanding_result["synthesized_info"] = ". ".join(meaningful[:5])
                        logger.info(f"Fallback 1 succeeded: extracted {len(meaningful)} sentences from web content")


                if (not understanding_result["synthesized_info"] or len(understanding_result["synthesized_info"].strip()) < 50) and understood_insights:
                    insight_texts = [insight.get("text", "") for insight in understood_insights[:5]]
                    insight_texts = [t for t in insight_texts if t and len(t.strip()) >= 30]
                    if insight_texts:
                        understanding_result["synthesized_info"] = ". ".join(insight_texts[:3])
                        logger.info(f"Fallback 2 succeeded: used {len(insight_texts)} insights directly")


                if (not understanding_result["synthesized_info"] or len(understanding_result["synthesized_info"].strip()) < 50) and web_facts:
                    fact_texts = [fact for fact in web_facts if fact and len(fact.strip()) >= 30]
                    if fact_texts:
                        understanding_result["synthesized_info"] = ". ".join(fact_texts[:3])
                        logger.info(f"Fallback 3 succeeded: used {len(fact_texts)} facts directly")


            understanding_result["confidence"] = self._calculate_understanding_confidence(
                understood_insights,
                reasoning,
                understanding_result["synthesized_info"]
            )


            if understood_insights:
                logger.info(f"Understood {len(understood_insights)} insights with {len(reasoning)} reasoning items")
            else:
                logger.warning(f"No insights understood for query '{user_query}' - web_content: {len(web_content) if web_content else 0} chars, web_facts: {len(web_facts)}")

            if understanding_result["synthesized_info"]:
                logger.info(f"Synthesized {len(understanding_result['synthesized_info'])} chars of understood information")
            else:
                logger.warning(f"No synthesized info for query '{user_query}' - insights: {len(understood_insights)}, web_content: {len(web_content) if web_content else 0} chars")

        except Exception as e:
            logger.error(f"Error in understanding engine: {e}", exc_info=True)

        return understanding_result

    async def _understand_meaning(
        self,
        content: str,
        facts: List[str],
        query: str
    ) -> List[Dict[str, Any]]:
        insights = []


        if content:
            content = self._remove_junk_patterns(content)


        if content:
            sentences = re.split(r'[.!?]+', content)
            for sentence in sentences:
                sentence = sentence.strip()

                if len(sentence) < 40 or len(sentence) > 500:
                    continue


                if self._is_junk_sentence(sentence):
                    continue


                try:
                    similarity = await self.embedding_model.similarity(query, sentence)

                    if similarity > 0.3:
                        insights.append({
                            "text": sentence,
                            "type": "insight",
                            "relevance": similarity,
                            "source": "web_content"
                        })
                except Exception as e:
                    logger.debug(f"Error calculating similarity: {e}")

                    query_words = set(re.findall(r'\b[a-z]{4,}\b', query.lower()))
                    sentence_lower = sentence.lower()
                    keyword_matches = sum(1 for word in query_words if word in sentence_lower)
                    has_market_keywords = any(kw in sentence_lower for kw in ['market', 'price', 'rent', 'property', 'real estate', 'housing', 'investment', 'growth', 'trend', 'yield', 'appreciation'])


                    if keyword_matches >= 1 and self._is_well_formed_sentence(sentence):
                        insights.append({
                            "text": sentence,
                            "type": "insight",
                            "relevance": 0.5,
                            "source": "web_content"
                        })


        for fact in facts:
            fact = fact.strip()
            if len(fact) < 40 or len(fact) > 300:
                continue


            if self._is_junk_sentence(fact):
                continue

            try:
                similarity = await self.embedding_model.similarity(query, fact)
                if similarity > 0.3:
                    insights.append({
                        "text": fact,
                        "type": "fact",
                        "relevance": similarity,
                        "source": "web_facts"
                    })
            except Exception as e:
                logger.debug(f"Error processing fact: {e}")

                query_words = set(re.findall(r'\b[a-z]{4,}\b', query.lower()))
                fact_lower = fact.lower()
                keyword_matches = sum(1 for word in query_words if word in fact_lower)
                has_market_keywords = any(kw in fact_lower for kw in ['market', 'price', 'rent', 'property', 'real estate', 'housing', 'investment', 'growth', 'trend', 'yield', 'appreciation'])


                if keyword_matches >= 1 and self._is_well_formed_sentence(fact):
                    insights.append({
                        "text": fact,
                        "type": "fact",
                        "relevance": 0.5,
                        "source": "web_facts"
                    })


        insights.sort(key=lambda x: x.get("relevance", 0), reverse=True)


        return insights[:10]

    def _remove_junk_patterns(self, text: str) -> str:
        if not text:
            return ""

        junk_patterns = [
            r'Focus\):\s*',
            r'^[A-Z][a-z]+\):\s*',
            r'Members\s*•.*?(?=[A-Z]|$)',
            r'(Français|Русский|हिन्दी|Deutsch|Español|中文|한국어|Ελληνικά|Norsk|Türkçe|Magyar|ไทย|Bahasa|Português|日本語|Italiano)\s*•',
            r'\b(members|subscribers)\s*•',
            r'Cookie\s+Policy|Privacy\s+Policy|Terms\s+of\s+Service',
            r'Sign\s+up|Subscribe|Newsletter|Click\s+here',
            r'Read\s+more|Continue\s+reading|View\s+more',
            r'Cute_Surround_\d+',
            r'com\s*\|\s*Straightforward',
            r'Best Cities to Invest in Real Estate in \d+ \(U',
        ]

        for pattern in junk_patterns:
            text = re.sub(pattern, '', text, flags=re.IGNORECASE | re.MULTILINE)

        return text.strip()

    def _is_junk_sentence(self, sentence: str) -> bool:
        sentence_lower = sentence.lower()


        junk_indicators = [
            r'focus\):\s*',
            r'members\s*•',
            r'cute_surround_\d+',
            r'com\s*\|\s*straightforward',
            r'best cities to invest.*\(u',
            r'that model broke when',
        ]

        for pattern in junk_indicators:
            if re.search(pattern, sentence_lower):
                return True


        special_char_ratio = sum(1 for c in sentence if c in '•|·|▪|▫|→|←|↑|↓') / len(sentence) if sentence else 0
        if special_char_ratio > 0.2:
            return True


        if len(sentence) < 50:
            uppercase_ratio = sum(1 for c in sentence if c.isupper()) / len(sentence) if sentence else 0
            if uppercase_ratio > 0.7:
                return True

        return False

    def _is_well_formed_sentence(self, sentence: str) -> bool:
        if not sentence or len(sentence) < 40:
            return False


        has_verb = bool(re.search(r'\b(is|are|was|were|has|have|will|can|should|do|does|did)\b', sentence.lower()))
        has_noun = bool(re.search(r'\b(the|a|an)\s+[a-z]+\b', sentence.lower()))


        alpha_ratio = sum(1 for c in sentence if c.isalpha()) / len(sentence) if sentence else 0
        if alpha_ratio < 0.6:
            return False

        return True

    async def _reason_about_relevance(
        self,
        insights: List[Dict[str, Any]],
        query: str,
        context: Dict[str, Any]
    ) -> List[Dict[str, Any]]:
        reasoning = []

        for insight in insights[:10]:
            text = insight.get("text", "")
            relevance = insight.get("relevance", 0)


            if relevance > 0.25:
                reasoning_item = {
                    "insight": text[:150] + "..." if len(text) > 150 else text,
                    "relevance_score": relevance,
                    "reasoning": self._generate_reasoning_explanation(text, query),
                    "importance": "high" if relevance > 0.7 else "medium" if relevance > 0.5 else "low"
                }
                reasoning.append(reasoning_item)

        return reasoning

    def _generate_reasoning_explanation(self, text: str, query: str) -> str:
        text_lower = text.lower()
        query_lower = query.lower()


        query_words = set(re.findall(r'\b[a-z]{4,}\b', query_lower))


        matching_concepts = []
        for word in query_words:
            if word in text_lower:
                matching_concepts.append(word)

        if matching_concepts:
            return f"Directly addresses: {', '.join(matching_concepts[:3])}"
        elif any(kw in text_lower for kw in ['market', 'price', 'rent', 'property', 'housing']):
            return "Contains relevant market/property information"
        else:
            return "Semantically related to query"

    async def _synthesize_with_knowledge(
        self,
        insights: List[Dict[str, Any]],
        prior_knowledge: List[Dict[str, Any]],
        query: str
    ) -> str:

        insight_points = [insight.get("text", "") for insight in insights[:8]]


        knowledge_points = []
        for kb_item in prior_knowledge[:5]:
            text = kb_item.get("text", "")
            if text:
                knowledge_points.append(text)


        synthesized_parts = []


        if knowledge_points:
            synthesized_parts.append("Based on established knowledge and current market data:")
        else:
            synthesized_parts.append("Current market insights:")


        # Be more inclusive - add insights even if they don't perfectly match
        for insight in insight_points:

            if knowledge_points and any(kp.lower() in insight.lower()[:100] or insight.lower()[:100] in kp.lower() for kp in knowledge_points):

                synthesized_parts.append(insight)
            elif any(kw in insight.lower() for kw in ['market', 'price', 'rent', 'trend', 'growth', 'property', 'housing', 'real estate', 'investment', 'appreciation', 'yield']):

                synthesized_parts.append(insight)
            elif len(insight) > 40:  # If it's substantial, include it
                synthesized_parts.append(insight)


        if len(synthesized_parts) <= 2 and insight_points:
            # Add more insights even if they're not perfect matches
            for insight in insight_points[:5]:
                if insight not in synthesized_parts:
                    synthesized_parts.append(insight)


        synthesized = " ".join(synthesized_parts[:10])


        result = self._make_coherent(synthesized, query)


        if len(result.strip()) < 100 and content:

            sentences = re.split(r'[.!?]+', content)
            meaningful = []
            for sentence in sentences[:5]:
                sentence = sentence.strip()
                if 40 <= len(sentence) <= 300:
                    sentence_lower = sentence.lower()

                    if any(kw in sentence_lower for kw in ['atlanta', 'market', 'price', 'rent', 'property', 'housing', 'growth', 'trend']):
                        meaningful.append(sentence)
            if meaningful:
                result = ". ".join(meaningful[:3])

        return result

    async def _synthesize_insights(
        self,
        insights: List[Dict[str, Any]],
        query: str
    ) -> str:
        if not insights:
            logger.debug(f"No insights to synthesize for query: {query}")
            return ""


        insight_texts = []
        filtered_count = 0
        for insight in sorted(insights, key=lambda x: x.get("relevance", 0), reverse=True):
            text = insight.get("text", "").strip()

            if text and len(text) >= 40 and len(text) <= 400 and self._is_well_formed_sentence(text):

                text = self._remove_junk_patterns(text)
                if text and len(text) >= 40:
                    insight_texts.append(text)
                else:
                    filtered_count += 1
            else:
                filtered_count += 1


        if not insight_texts and insights:
            logger.warning(f"All {len(insights)} insights filtered out for '{query}'. Trying lenient mode...")

            for insight in sorted(insights, key=lambda x: x.get("relevance", 0), reverse=True):
                text = insight.get("text", "").strip()

                if text and len(text) >= 30 and len(text) <= 500:
                    text = self._remove_junk_patterns(text)
                    if text and len(text) >= 30:
                        insight_texts.append(text)
                        if len(insight_texts) >= 3:
                            break

        if not insight_texts:
            logger.warning(f"No usable insights after lenient filtering for '{query}' (filtered {filtered_count}/{len(insights)} insights)")
            return ""


        synthesized = self._create_coherent_synthesis(insight_texts, query)

        if not synthesized:
            logger.warning(f"Synthesis failed for '{query}' despite {len(insight_texts)} insight texts")

        return synthesized

    def _create_coherent_synthesis(self, sentences: List[str], query: str) -> str:
        if not sentences:
            return ""


        unique_sentences = []
        seen_signatures = set()

        for sentence in sentences:

            signature = sentence.lower()[:60].strip()
            if signature not in seen_signatures and len(signature) > 20:
                seen_signatures.add(signature)
                unique_sentences.append(sentence)

        if not unique_sentences:
            return ""


        synthesis_sentences = unique_sentences[:6]


        synthesized = ". ".join(synthesis_sentences)


        if not re.search(r'[.!?]$', synthesized):
            synthesized += "."


        return synthesized[:600].strip()

    def _make_coherent(self, text: str, query: str) -> str:
        if not text:
            return ""


        text = self._remove_junk_patterns(text)


        sentences = re.split(r'[.!?]+', text)
        seen = set()
        unique_sentences = []

        for sentence in sentences:
            sentence = sentence.strip()
            if len(sentence) < 40:
                continue


            if self._is_junk_sentence(sentence):
                continue


            if not self._is_well_formed_sentence(sentence):
                continue


            signature = sentence.lower()[:50]
            if signature not in seen:
                seen.add(signature)
                unique_sentences.append(sentence)

        if not unique_sentences:
            return ""


        coherent = ". ".join(unique_sentences[:5])


        if not re.search(r'[.!?]$', coherent):
            coherent += "."

        return coherent[:500].strip()

    async def _extract_takeaways(
        self,
        synthesized_info: str,
        query: str
    ) -> List[str]:
        if not synthesized_info:
            return []


        sentences = re.split(r'[.!?]+', synthesized_info)
        takeaways = []


        important_keywords = ['price', 'rent', 'market', 'growth', 'trend', 'investment', 'yield']

        for sentence in sentences:
            sentence = sentence.strip()
            if len(sentence) < 40:
                continue

            sentence_lower = sentence.lower()


            has_important_keyword = any(kw in sentence_lower for kw in important_keywords)
            has_numbers = bool(re.search(r'\$?\d+', sentence))

            if has_important_keyword or has_numbers:

                takeaway = sentence[:150] + "..." if len(sentence) > 150 else sentence
                takeaways.append(takeaway)

        return takeaways[:5]

    def _calculate_understanding_confidence(
        self,
        insights: List[Dict[str, Any]],
        reasoning: List[Dict[str, Any]],
        synthesized: str
    ) -> float:
        if not insights or not synthesized:
            return 0.3


        high_relevance_count = sum(1 for i in insights if i.get("relevance", 0) > 0.7)
        total_insights = len(insights)

        if total_insights == 0:
            return 0.3

        relevance_score = high_relevance_count / total_insights if total_insights > 0 else 0
        synthesis_score = min(1.0, len(synthesized) / 300)

        confidence = (relevance_score * 0.6 + synthesis_score * 0.4)

        return min(0.95, confidence)
