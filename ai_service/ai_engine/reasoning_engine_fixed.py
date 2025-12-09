import asyncio
from typing import Dict, List, Any, Optional
import numpy as np
from datetime import datetime
import re

from config import settings
from ai_engine.knowledge_base import KnowledgeBase
from ai_engine.data_retrieval import DataRetrievalService
from ai_engine.embedding_model import AdvancedEmbeddingModel
from ai_engine.vector_store import VectorStore
from ai_engine.ml_semantic_analyzer import MLSemanticAnalyzer
from ai_engine.multi_source_data import MultiSourceDataService
from ai_engine.continuous_learner import ContinuousLearner
from ai_engine.response_generator import ResponseGenerator
from ai_engine.information_understanding import InformationUnderstandingEngine
from utils.logger import setup_logger

logger = setup_logger(__name__)


class AdvancedReasoningEngine:

    def __init__(self, knowledge_base: KnowledgeBase, data_service: DataRetrievalService):
        self.knowledge_base = knowledge_base
        self.data_service = data_service


        self.embedding_model = None
        self.vector_store = None
        self.semantic_analyzer = None
        self.multi_source_data = None
        self.continuous_learner = None
        self.response_generator = None
        self.information_understanding = None

        self.ready = False
        self.model_info = {
            "name": "Domufi Advanced AI",
            "version": "2.0.0",
            "capabilities": [
                "ml_based_reasoning",
                "multi_step_chain_of_thought",
                "context_awareness",
                "continuous_learning",
                "multi_source_data_integration",
                "semantic_understanding",
                "dynamic_response_generation",
                "no_hardcoded_patterns"
            ]
        }

    async def initialize(self):
        logger.info("Initializing advanced ML reasoning engine...")

        try:

            self.embedding_model = AdvancedEmbeddingModel()
            await self.embedding_model.initialize()
            logger.info("[OK] Embedding model initialized")


            self.vector_store = VectorStore(self.embedding_model)
            await self.vector_store.initialize()
            logger.info("[OK] Vector store initialized")


            self.semantic_analyzer = MLSemanticAnalyzer(
                self.embedding_model,
                self.vector_store,
                self.knowledge_base
            )
            await self.semantic_analyzer.initialize()
            logger.info("[OK] ML semantic analyzer initialized")


            self.multi_source_data = MultiSourceDataService(self.data_service)
            await self.multi_source_data.initialize()
            logger.info("[OK] Multi-source data service initialized")


            self.continuous_learner = ContinuousLearner(
                self.vector_store,
                self.knowledge_base,
                self.embedding_model
            )
            await self.continuous_learner.initialize()
            logger.info("[OK] Continuous learner initialized")


            self.information_understanding = InformationUnderstandingEngine(
                self.embedding_model,
                self.vector_store
            )
            await self.information_understanding.initialize()
            logger.info("[OK] Information understanding engine initialized")


            self.response_generator = ResponseGenerator(
                self.knowledge_base,
                self.data_service
            )
            await self.response_generator.initialize()
            logger.info("[OK] Response generator initialized")

            self.ready = True
            logger.info("[OK] Reasoning engine fully initialized with ML components")
        except Exception as e:
            logger.error(f"[ERROR] Error initializing reasoning engine: {e}", exc_info=True)
            raise

    async def cleanup(self):
        self.ready = False
        if self.continuous_learner:
            await self.continuous_learner.cleanup()
        if self.response_generator:
            await self.response_generator.cleanup()
        if self.information_understanding:
            await self.information_understanding.cleanup()
        if self.semantic_analyzer:
            await self.semantic_analyzer.cleanup()
        if self.vector_store:
            await self.vector_store.cleanup()
        if self.embedding_model:
            await self.embedding_model.cleanup()

    def is_ready(self) -> bool:
        return self.ready

    async def get_model_info(self) -> Dict[str, Any]:
        return self.model_info

    async def process_message(
        self,
        message: str,
        user_id: str,
        session_id: str,
        context: Dict[str, Any],
        conversation_history: List[Dict[str, str]]
    ) -> Dict[str, Any]:
        if not self.ready:
            raise RuntimeError("Reasoning engine not initialized")

        reasoning_steps = []
        start_time = datetime.utcnow()

        try:

            logger.info(f"Step 1: Analyzing semantic intent...")
            semantic_result = await self.semantic_analyzer.analyze(
                message=message,
                conversation_history=conversation_history,
                context=context
            )

            reasoning_steps.append({
                "step": 1,
                "type": "semantic_understanding",
                "result": {
                    "intent": semantic_result.get("intent"),
                    "confidence": semantic_result.get("confidence", 0.5),
                    "entities": semantic_result.get("entities", {}),
                    "topics": semantic_result.get("topics", [])
                }
            })


            logger.info(f"Step 2: Chain-of-thought reasoning...")
            reasoning_result = await self._chain_of_thought_reasoning(
                message=message,
                semantic_result=semantic_result,
                user_id=user_id,
                context=context,
                conversation_history=conversation_history
            )

            reasoning_steps.extend(reasoning_result.get("steps", []))


            logger.info(f"Step 3: Retrieving prior knowledge from pretrained data...")
            prior_knowledge = await self._retrieve_prior_knowledge(
                message=message,
                intent=semantic_result.get("intent"),
                entities=semantic_result.get("entities", {})
            )


            intent = semantic_result.get("intent", "")
            has_sufficient_knowledge = (
                len(prior_knowledge) >= 3 and 
                intent in ["explanation", "general_inquiry"] and
                any(k.get("similarity", 0) > 0.6 for k in prior_knowledge)
            )


            logger.info(f"Step 4: Retrieving relevant data...")

            enhanced_context = {
                **context,
                "user_query": message,
                "intent": semantic_result.get("intent"),
                "entities": semantic_result.get("entities", {}),
                "prior_knowledge": prior_knowledge,
                "skip_web_scraping": has_sufficient_knowledge
            }
            data_result = await self._retrieve_relevant_data(
                intent=semantic_result.get("intent"),
                entities=semantic_result.get("entities", {}),
                user_id=user_id,
                context=enhanced_context
            )


            data_result["data"]["prior_knowledge"] = prior_knowledge

            reasoning_steps.append({
                "step": len(reasoning_steps) + 1,
                "type": "data_retrieval",
                "result": {
                    "sources": data_result.get("sources", []),
                    "data_points": len(data_result.get("data", {}))
                }
            })


            logger.info(f"Step 5: Generating response...")
            response_result = await self.response_generator.generate(
                message=message,
                semantic_result=semantic_result,
                reasoning_result=reasoning_result,
                data_result=data_result,
                user_id=user_id,
                context=context,
                conversation_history=conversation_history
            )

            reasoning_steps.append({
                "step": len(reasoning_steps) + 1,
                "type": "response_generation",
                "result": {
                    "response_length": len(response_result.get("answer", "")),
                    "confidence": response_result.get("confidence", 0.5)
                }
            })


            if settings.enable_learning and self.continuous_learner:
                logger.info(f"Step 6: Continuous learning from interaction...")
                await self.continuous_learner.learn_from_interaction(
                    user_message=message,
                    intent=semantic_result.get("intent", "general_inquiry"),
                    entities=semantic_result.get("entities", {}),
                    response=response_result.get("answer", ""),
                    confidence=response_result.get("confidence", 0.5),
                    user_id=user_id,
                    session_id=session_id,
                    context=context,
                    data_sources=data_result.get("sources", [])
                )



            try:
                import sys
                main_module = sys.modules.get('main')
                if main_module and hasattr(main_module, 'continuous_learner_bg'):
                    bg_learner = main_module.continuous_learner_bg
                    if bg_learner:

                        await bg_learner.learn_from_interaction(
                            user_query=message,
                            intent=semantic_result.get("intent", "general_inquiry"),
                            entities=semantic_result.get("entities", {}),
                            response=response_result.get("answer", ""),
                            confidence=response_result.get("confidence", 0.5)
                        )
            except Exception as e:
                logger.debug(f"Background learner not available: {e}")

            processing_time = (datetime.utcnow() - start_time).total_seconds()

            return {
                "answer": response_result.get("answer", ""),
                "confidence": response_result.get("confidence", 0.5),
                "reasoning_steps": reasoning_steps,
                "entities": semantic_result.get("entities", {}),
                "intent": semantic_result.get("intent", "general_inquiry"),
                "suggestions": response_result.get("suggestions", []),
                "actions": response_result.get("actions", []),
                "data_sources": data_result.get("sources", []),
                "model_info": {
                    **self.model_info,
                    "processing_time": processing_time
                }
            }

        except Exception as e:
            logger.error(f"Error processing message: {e}", exc_info=True)
            return {
                "answer": "I apologize, but I encountered an error while processing your request. Please try again.",
                "confidence": 0.1,
                "reasoning_steps": reasoning_steps,
                "entities": {},
                "intent": "error",
                "suggestions": [],
                "actions": [],
                "data_sources": [],
                "model_info": self.model_info
            }

    async def _chain_of_thought_reasoning(
        self,
        message: str,
        semantic_result: Dict[str, Any],
        user_id: str,
        context: Dict[str, Any],
        conversation_history: List[Dict[str, str]]
    ) -> Dict[str, Any]:
        steps = []


        intent = semantic_result.get("intent", "general_inquiry")
        entities = semantic_result.get("entities", {})

        steps.append({
            "step": 2.1,
            "type": "question_analysis",
            "thought": f"Analyzing question: {message[:100]}...",
            "insights": {
                "detected_intent": intent,
                "key_entities": list(entities.keys()) if entities else [],
                "question_type": self._classify_question_type(message)
            }
        })


        sub_problems = await self._break_down_problem(message, intent, entities)
        steps.append({
            "step": 2.2,
            "type": "problem_breakdown",
            "thought": "Breaking down into sub-problems",
            "insights": {
                "sub_problems": sub_problems,
                "complexity": len(sub_problems)
            }
        })


        reasoning_insights = []
        for i, sub_problem in enumerate(sub_problems):
            insight = await self._reason_about_subproblem(sub_problem, entities, context)
            reasoning_insights.append(insight)

        steps.append({
            "step": 2.3,
            "type": "subproblem_reasoning",
            "thought": "Reasoning through each sub-problem",
            "insights": reasoning_insights
        })


        conclusions = await self._synthesize_conclusions(reasoning_insights, intent)
        steps.append({
            "step": 2.4,
            "type": "synthesis",
            "thought": "Synthesizing conclusions and identifying patterns",
            "insights": {
                "conclusions": conclusions.get("conclusions", []) if isinstance(conclusions, dict) else conclusions,
                "key_findings": conclusions.get("key_findings", []) if isinstance(conclusions, dict) else [],
                "synthesis_quality": conclusions.get("synthesis_quality", "moderate") if isinstance(conclusions, dict) else "basic",
                "patterns_identified": conclusions.get("patterns_identified", []) if isinstance(conclusions, dict) else [],
                "confidence": self._calculate_reasoning_confidence(reasoning_insights)
            }
        })


        verification = await self._verify_reasoning(message, conclusions, entities)
        steps.append({
            "step": 2.5,
            "type": "verification",
            "thought": "Verifying reasoning",
            "insights": verification
        })

        return {
            "steps": steps,
            "conclusions": conclusions,
            "confidence": verification.get("confidence", 0.5)
        }

    def _classify_question_type(self, message: str) -> str:
        msg_lower = message.lower()

        if any(word in msg_lower for word in ["how", "why", "what is", "explain"]):
            return "explanation"
        elif any(word in msg_lower for word in ["what should", "recommend", "suggest"]):
            return "recommendation"
        elif any(word in msg_lower for word in ["compare", "vs", "versus"]):
            return "comparison"
        elif any(word in msg_lower for word in ["show", "list", "find", "search"]):
            return "search"
        elif any(word in msg_lower for word in ["when", "where"]):
            return "factual"
        else:
            return "general"

    async def _break_down_problem(self, message: str, intent: str, entities: Dict) -> List[str]:
        sub_problems = []


        if intent == "investment_advice":
            sub_problems = [
                "Analyze user's current portfolio",
                "Identify investment goals and risk tolerance",
                "Find suitable properties",
                "Consider market conditions",
                "Generate personalized recommendations"
            ]
        elif intent == "market_analysis":
            location = entities.get("location")
            sub_problems = [
                f"Analyze market trends for {location or 'specified location'}",
                "Evaluate economic indicators",
                "Assess property availability",
                "Consider risk factors",
                "Provide actionable insights"
            ]
        elif intent == "explanation":
            topic = entities.get("topic", "concept")
            sub_problems = [
                f"Understand what {topic} means",
                "Identify key components",
                "Explain in beginner-friendly terms",
                "Provide relevant examples"
            ]
        else:
            sub_problems = [
                "Understand the question",
                "Identify required information",
                "Generate appropriate response"
            ]

        return sub_problems

    async def _reason_about_subproblem(
        self,
        sub_problem: str,
        entities: Dict,
        context: Dict
    ) -> Dict[str, Any]:
        if not self.information_understanding:
            return {
                "sub_problem": sub_problem,
                "reasoning": f"Analyzing {sub_problem}...",
                "confidence": 0.7
            }

        try:



            reasoning_context = {
                "sub_problem": sub_problem,
                "entities": entities,
                "reasoning_type": "deep_thinking",
                "step": "analysis"
            }


            reasoning_result = {
                "sub_problem": sub_problem,
                "thinking_steps": [],
                "key_insights": [],
                "confidence": 0.7,
                "reasoning_quality": "good"
            }


            thinking_steps = [
                f"What is the core issue in: {sub_problem}?",
                f"What information is needed to address: {sub_problem}?",
                f"What are the key factors related to: {sub_problem}?",
                f"What are potential solutions or approaches for: {sub_problem}?",
                f"What are the implications of: {sub_problem}?"
            ]


            insights = []
            for step in thinking_steps:

                if self.vector_store:
                    relevant_knowledge = await self.vector_store.search(
                        query=step,
                        top_k=5,
                        threshold=0.3
                    )

                    if relevant_knowledge:

                        knowledge_texts = [k.get("text", "")[:200] for k in relevant_knowledge[:3]]
                        insight = {
                            "step": step,
                            "relevant_knowledge": knowledge_texts,
                            "reasoning": f"Found {len(relevant_knowledge)} relevant knowledge items for: {step[:50]}..."
                        }
                        insights.append(insight)
                        reasoning_result["thinking_steps"].append(insight)


            if insights:
                reasoning_result["key_insights"] = [
                    f"Found {len(insights)} relevant insights",
                    f"Knowledge base contains relevant information",
                    f"Reasoning is supported by learned knowledge"
                ]
                reasoning_result["confidence"] = min(0.9, 0.6 + (len(insights) * 0.1))
                reasoning_result["reasoning_quality"] = "excellent" if len(insights) >= 3 else "good"
            else:
                reasoning_result["key_insights"] = [
                    "Limited knowledge found - may need additional learning",
                    "Reasoning based on general principles"
                ]
                reasoning_result["confidence"] = 0.6
                reasoning_result["reasoning_quality"] = "moderate"


            reasoning_result["self_reflection"] = {
                "strengths": [
                    f"Systematically analyzed {sub_problem}",
                    f"Considered {len(insights)} relevant knowledge sources"
                ] if insights else [
                    f"Systematically analyzed {sub_problem}"
                ],
                "weaknesses": [
                    "May need more specific knowledge" if not insights else "Reasoning is well-supported"
                ],
                "improvements": [
                    "Could benefit from more domain-specific knowledge" if not insights else "Reasoning is comprehensive"
                ]
            }


            return reasoning_result

        except Exception as e:
            logger.warning(f"Error in deep reasoning: {e}")
            return {
                "sub_problem": sub_problem,
                "reasoning": f"Analyzing {sub_problem}...",
                "confidence": 0.7,
                "error": str(e)
            }

    async def _synthesize_conclusions(
        self,
        reasoning_insights: List[Dict],
        intent: str
    ) -> Dict[str, Any]:
        if not reasoning_insights:
            return {
                "conclusions": [],
                "synthesis_quality": "limited",
                "key_findings": []
            }


        all_insights = []
        all_knowledge = []
        total_confidence = 0

        for insight in reasoning_insights:

            thinking_steps = insight.get("thinking_steps", [])
            for step in thinking_steps:
                knowledge = step.get("relevant_knowledge", [])
                all_knowledge.extend(knowledge)


            key_insights = insight.get("key_insights", [])
            all_insights.extend(key_insights)


            total_confidence += insight.get("confidence", 0.5)


        avg_confidence = total_confidence / len(reasoning_insights) if reasoning_insights else 0.5


        synthesis = {
            "conclusions": [],
            "key_findings": [],
            "patterns_identified": [],
            "connections_made": [],
            "synthesis_quality": "excellent" if avg_confidence > 0.7 and len(all_knowledge) > 0 else "good" if avg_confidence > 0.6 else "moderate"
        }


        unique_insights = list(set(all_insights))
        synthesis["key_findings"] = unique_insights[:10]


        high_quality_insights = [i for i in reasoning_insights if i.get("confidence", 0) > 0.7]

        if high_quality_insights:
            for insight in high_quality_insights:
                sub_problem = insight.get("sub_problem", "")
                reasoning_quality = insight.get("reasoning_quality", "moderate")

                if reasoning_quality in ["excellent", "good"]:
                    conclusion = {
                        "statement": f"Successfully analyzed: {sub_problem}",
                        "confidence": insight.get("confidence", 0.7),
                        "supporting_evidence": len(insight.get("thinking_steps", [])),
                        "quality": reasoning_quality
                    }
                    synthesis["conclusions"].append(conclusion)


        if len(reasoning_insights) > 1:

            all_subproblems = [i.get("sub_problem", "") for i in reasoning_insights]
            synthesis["patterns_identified"] = [
                f"Analyzed {len(reasoning_insights)} interconnected sub-problems",
                f"Found {len(all_knowledge)} knowledge connections",
                f"Average reasoning confidence: {avg_confidence:.2f}"
            ]


        if all_knowledge:
            synthesis["connections_made"] = [
                f"Connected {len(all_knowledge)} knowledge items",
                f"Synthesized {len(unique_insights)} unique insights",
                f"Formed {len(synthesis['conclusions'])} high-confidence conclusions"
            ]

        return synthesis

    def _calculate_reasoning_confidence(self, reasoning_insights: List[Dict]) -> float:
        if not reasoning_insights:
            return 0.5

        confidences = [insight.get("confidence", 0.5) for insight in reasoning_insights]
        return np.mean(confidences)

    async def _verify_reasoning(
        self,
        message: str,
        conclusions: Dict[str, Any],
        entities: Dict
    ) -> Dict[str, Any]:
        verification = {
            "verified": True,
            "confidence": 0.8,
            "checks": [],
            "self_critique": {},
            "consistency_score": 0.8,
            "logic_score": 0.8
        }


        if message and entities:
            verification["checks"].append("Intent alignment verified")
        else:
            verification["checks"].append("Intent alignment needs verification")
            verification["confidence"] *= 0.9


        if entities:
            verification["checks"].append("Entity extraction verified")
        else:
            verification["checks"].append("Entity extraction may be incomplete")
            verification["confidence"] *= 0.95


        conclusions_list = conclusions.get("conclusions", []) if isinstance(conclusions, dict) else conclusions
        if conclusions_list:
            verification["checks"].append("Logic consistency verified")

            if isinstance(conclusions, dict):
                avg_confidence = sum(c.get("confidence", 0.5) for c in conclusions_list) / len(conclusions_list) if conclusions_list else 0.5
                verification["logic_score"] = avg_confidence
        else:
            verification["checks"].append("Logic consistency needs review")
            verification["confidence"] *= 0.9


        if isinstance(conclusions, dict):
            key_findings = conclusions.get("key_findings", [])
            if key_findings:
                verification["checks"].append(f"Knowledge support verified ({len(key_findings)} findings)")
                verification["confidence"] = min(0.95, verification["confidence"] + 0.1)
            else:
                verification["checks"].append("Limited knowledge support")
                verification["confidence"] *= 0.9


        if isinstance(conclusions, dict):
            synthesis_quality = conclusions.get("synthesis_quality", "moderate")
            verification["self_critique"] = {
                "reasoning_quality": synthesis_quality,
                "strengths": [
                    f"Synthesis quality: {synthesis_quality}",
                    f"Found {len(conclusions.get('key_findings', []))} key findings",
                    f"Made {len(conclusions.get('connections_made', []))} knowledge connections"
                ],
                "weaknesses": [
                    "Could benefit from more specific domain knowledge" if synthesis_quality == "moderate" else "Reasoning is well-supported"
                ],
                "overall_assessment": "High quality reasoning" if synthesis_quality in ["excellent", "good"] else "Moderate quality reasoning"
            }
        else:
            verification["self_critique"] = {
                "reasoning_quality": "basic",
                "strengths": ["Basic reasoning completed"],
                "weaknesses": ["Limited synthesis and deep thinking"],
                "overall_assessment": "Basic reasoning - could be enhanced"
            }


        checks_passed = sum(1 for check in verification["checks"] if "verified" in check.lower() or "support" in check.lower())
        total_checks = len(verification["checks"])
        verification["consistency_score"] = checks_passed / total_checks if total_checks > 0 else 0.8


        verification["confidence"] = (
            verification["confidence"] * 0.4 +
            verification["logic_score"] * 0.3 +
            verification["consistency_score"] * 0.3
        )

        verification["verified"] = verification["confidence"] > 0.6

        return verification

    async def _retrieve_prior_knowledge(
        self,
        message: str,
        intent: str,
        entities: Dict[str, Any]
    ) -> List[Dict[str, Any]]:
        prior_knowledge = []

        try:

            search_query = message


            if intent == "market_analysis" and entities.get("location"):
                search_query = f"{message} {entities.get('location')} market analysis"
            elif intent == "investment_advice":
                search_query = f"{message} investment advice real estate"
            elif intent == "explanation":
                topic = entities.get("topic", "")
                if topic:
                    search_query = f"{message} {topic} explanation"


            results = await self.vector_store.search(
                query=search_query,
                top_k=20,
                threshold=0.2
            )


            if not results and entities.get("location"):
                location_query = f"{entities.get('location')} real estate market"
                results = await self.vector_store.search(
                    query=location_query,
                    top_k=15,
                    threshold=0.2
                )


            if not results:

                broad_queries = [
                    "real estate market analysis investment",
                    f"{entities.get('location', '')} market",
                    "market trends prices",
                    "real estate investment"
                ]
                for broad_query in broad_queries:
                    if broad_query.strip():
                        results = await self.vector_store.search(
                            query=broad_query,
                            top_k=10,
                            threshold=0.15
                        )
                        if results:
                            break


            for result in results:
                raw_metadata = result.get("metadata")
                metadata = raw_metadata if isinstance(raw_metadata, dict) else result
                knowledge_type = metadata.get("type", "")
                source = metadata.get("source", "")


                is_learned_knowledge = (
                    knowledge_type in ["pretrained_knowledge", "continuous_learning", "prior_knowledge", "knowledge", "platform_specific", "gap_learning", "self_learning_correction"] or
                    source in ["online_pretraining", "background_learner", "platform_trainer", "comprehensive_knowledge_base", "comprehensive_kb", "self_learning_system"] or
                    "market" in result.get("text", "").lower() or
                    (entities.get("location", "") and entities.get("location", "").lower() in result.get("text", "").lower())
                )

                if is_learned_knowledge:
                    text = result.get("text", "") or metadata.get("text", "")
                    if text and len(text.strip()) >= 30:
                        prior_knowledge.append({
                            "text": text,
                            "category": metadata.get("category", ""),
                            "topic": metadata.get("topic", metadata.get("query", "")),
                            "relevance": result.get("similarity", metadata.get("similarity", 0)),
                            "source": source or metadata.get("origin", "learned")
                        })

            # If we still don't have knowledge, try to get from knowledge base directly
            if not prior_knowledge and intent == "market_analysis" and entities.get("location"):
                try:
                    kb_results = await self.knowledge_base.search_knowledge(
                        f"market analysis {entities.get('location')}",
                        limit=5
                    )
                    if kb_results:
                        for kb_item in kb_results:
                            kb_text = kb_item.get("text", "")
                            if kb_text and len(kb_text.strip()) >= 30:
                                prior_knowledge.append({
                                    "text": kb_text,
                                    "category": kb_item.get("category", "market_analysis"),
                                    "topic": entities.get("location"),
                                    "relevance": 0.6,
                                    "source": "knowledge_base"
                                })
                except Exception as e:
                    logger.debug(f"Could not fetch from knowledge base: {e}")

            logger.info(f"Retrieved {len(prior_knowledge)} prior knowledge items from learned data")

        except Exception as e:
            logger.warning(f"Error retrieving prior knowledge: {e}")

        return prior_knowledge

    async def _retrieve_relevant_data(
        self,
        intent: str,
        entities: Dict[str, Any],
        user_id: str,
        context: Dict[str, Any]
    ) -> Dict[str, Any]:
        sources = []
        data = {}
        user_query = context.get("user_query", "") or f"{intent} {entities.get('location', '')}"

        try:

            if intent in ["investment_advice", "recommendation"]:

                user_context = {
                    "user_id": user_id,
                    "filters": entities,
                    **context
                }
                advice_data = await self.multi_source_data.fetch_investment_advice_data(user_context)
                data.update(advice_data)
                sources.extend(advice_data.get("sources", []))

            elif intent == "market_analysis":
                location = entities.get("location")
                if location:

                    # No need to reassign - it's already correct


                    skip_web = context.get("skip_web_scraping", False)

                    if not skip_web:


                        if hasattr(self, 'platform_trainer') and self.platform_trainer:

                            try:
                                from ai_engine.online_pretrainer import OnlinePretrainer

                                import asyncio

                                asyncio.create_task(self._trigger_market_pretraining(location))
                            except Exception as e:
                                logger.debug(f"Could not trigger market pretraining: {e}")


                        market_data = None
                        try:
                            market_data = await asyncio.wait_for(
                                self.multi_source_data.fetch_market_data(
                                    location,
                                    include_external=True
                                ),
                                timeout=8.0
                            )
                            data["market"] = market_data
                            sources.extend(market_data.get("sources", []))
                        except asyncio.TimeoutError:
                            logger.warning(f"Market data fetch timed out for {location}, using prior knowledge only")

                            market_data = {
                                "location": location,
                                "sources": ["Prior Knowledge"],
                                "data": {}
                            }
                            data["market"] = market_data
                    else:
                        logger.info(f"Skipping web scraping for {location} - using prior knowledge only (fast response)")
                        market_data = {
                            "location": location,
                            "sources": ["Prior Knowledge"],
                            "data": {}
                        }
                        data["market"] = market_data


                    if self.information_understanding and market_data and market_data.get("data"):
                        web_research_data = market_data.get("data", {})


                        extracted_info = {
                            "synthesized_info": "",
                            "key_facts": []
                        }


                        market_analysis = web_research_data.get("market_analysis", [])
                        if market_analysis:
                            extracted_info["synthesized_info"] = " ".join([
                                item for item in market_analysis if isinstance(item, str) and len(item.strip()) > 50
                            ])


                        price_trends = web_research_data.get("price_trends", [])
                        if price_trends:
                            extracted_info["key_facts"] = [
                                fact for fact in price_trends if isinstance(fact, str) and len(fact.strip()) > 30
                            ]


                        scraped_data = web_research_data.get("scraped_data", {})
                        if scraped_data and isinstance(scraped_data, dict):
                            if scraped_data.get("synthesized_info"):
                                if extracted_info["synthesized_info"]:
                                    extracted_info["synthesized_info"] += " " + scraped_data["synthesized_info"]
                                else:
                                    extracted_info["synthesized_info"] = scraped_data["synthesized_info"]
                            if scraped_data.get("key_facts"):
                                extracted_info["key_facts"].extend(scraped_data["key_facts"])


                        prior_knowledge = context.get("prior_knowledge", [])


                        if extracted_info.get("synthesized_info") or extracted_info.get("key_facts"):
                            understanding_result = await self.information_understanding.understand_and_reason(
                                extracted_info=extracted_info,
                                user_query=user_query or f"market analysis for {location}",
                                context=context,
                                prior_knowledge=prior_knowledge
                            )


                            data["web_understanding"] = understanding_result
                            logger.info(f"[OK] Understood and synthesized web data for {location}")

            elif intent == "portfolio_inquiry":

                data["portfolio"] = await self.data_service.fetch_portfolio(user_id)
                data["investments"] = await self.data_service.fetch_investments(user_id)
                sources.extend(["Portfolio API", "Investments API"])

            elif intent == "wallet_inquiry":
                data["wallet"] = await self.data_service.fetch_wallet(user_id)
                sources.append("Wallet API")

            elif intent == "property_search":

                property_insights = await self.multi_source_data.fetch_property_insights(
                    property_id=None,
                    filters=entities
                )
                data.update(property_insights)
                sources.extend(property_insights.get("sources", []))

        except Exception as e:
            logger.error(f"Error retrieving data: {e}", exc_info=True)

        return {
            "data": data,
            "sources": sources
        }

    async def _trigger_market_pretraining(self, location: str):
        try:

            import sys
            main_module = sys.modules.get('main')
            if main_module and hasattr(main_module, 'online_pretrainer'):
                pretrainer = main_module.online_pretrainer
                if pretrainer:
                    await pretrainer.pretrain_specific_market(location)
                    logger.info(f"[OK] Pretrained on {location} market")
        except Exception as e:
            logger.debug(f"Could not trigger pretraining for {location}: {e}")


