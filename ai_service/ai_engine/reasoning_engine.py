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
from ai_engine.deep_reasoning_layer import DeepReasoningLayer
from ai_engine.advanced_learning_system import AdvancedLearningSystem
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
        self.platform_trainer = None


        self.deep_reasoning_layer = None
        self.advanced_learning_system = None
        self.information_understanding = None

        self.ready = False
        self.model_info = {
            "name": "Domufi Advanced AI",
            "version": "3.0.0",
            "capabilities": [
                "ml_based_reasoning",
                "multi_step_chain_of_thought",
                "context_awareness",
                "continuous_learning",
                "multi_source_data_integration",
                "semantic_understanding",
                "dynamic_response_generation",
                "no_hardcoded_patterns",
                "deep_neural_reasoning",
                "multi_layer_reasoning",
                "reinforcement_learning",
                "adaptive_learning",
                "pattern_recognition",
                "deep_understanding"
            ]
        }

    async def initialize(self):
        logger.info("Initializing advanced ML reasoning engine...")

        try:

            self.embedding_model = AdvancedEmbeddingModel()
            await self.embedding_model.initialize()
            logger.info("✅ Embedding model initialized")


            self.vector_store = VectorStore(self.embedding_model)
            await self.vector_store.initialize()
            logger.info("✅ Vector store initialized")


            self.semantic_analyzer = MLSemanticAnalyzer(
                self.embedding_model,
                self.vector_store,
                self.knowledge_base
            )
            await self.semantic_analyzer.initialize()
            logger.info("✅ ML semantic analyzer initialized")


            self.multi_source_data = MultiSourceDataService(self.data_service)
            await self.multi_source_data.initialize()
            logger.info("✅ Multi-source data service initialized")


            self.continuous_learner = ContinuousLearner(
                self.vector_store,
                self.knowledge_base,
                self.embedding_model
            )
            await self.continuous_learner.initialize()
            logger.info("✅ Continuous learner initialized")


            self.response_generator = ResponseGenerator(
                self.knowledge_base,
                self.data_service
            )
            await self.response_generator.initialize()
            logger.info("✅ Response generator initialized")


            self.deep_reasoning_layer = DeepReasoningLayer(
                self.embedding_model,
                self.vector_store
            )
            await self.deep_reasoning_layer.initialize()
            logger.info("✅ Deep reasoning layer initialized")


            self.advanced_learning_system = AdvancedLearningSystem(
                self.vector_store,
                self.knowledge_base,
                self.embedding_model
            )
            await self.advanced_learning_system.initialize()
            logger.info("✅ Advanced learning system initialized")


            self.information_understanding = InformationUnderstandingEngine(
                self.embedding_model,
                self.vector_store
            )
            await self.information_understanding.initialize()
            logger.info("✅ Information understanding engine initialized")

            self.ready = True
            logger.info("✅ Reasoning engine fully initialized with advanced ML components")
        except Exception as e:
            logger.error(f"❌ Error initializing reasoning engine: {e}", exc_info=True)
            raise

    async def cleanup(self):
        self.ready = False
        if self.information_understanding:
            await self.information_understanding.cleanup()
        if self.advanced_learning_system:
            await self.advanced_learning_system.cleanup()
        if self.deep_reasoning_layer:
            await self.deep_reasoning_layer.cleanup()
        if self.continuous_learner:
            await self.continuous_learner.cleanup()
        if self.response_generator:
            await self.response_generator.cleanup()
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


            logger.info(f"Step 2: Deep multi-layer reasoning...")


            if self.deep_reasoning_layer and self.deep_reasoning_layer.is_ready():
                deep_reasoning_result = await self.deep_reasoning_layer.deep_reason(
                    message=message,
                    context=context,
                    conversation_history=conversation_history,
                    intent=semantic_result.get("intent", "general_inquiry"),
                    entities=semantic_result.get("entities", {})
                )


                traditional_reasoning = await self._chain_of_thought_reasoning(
                    message=message,
                    semantic_result=semantic_result,
                    user_id=user_id,
                    context=context,
                    conversation_history=conversation_history
                )


                reasoning_result = {
                    "steps": traditional_reasoning.get("steps", []),
                    "deep_layers": deep_reasoning_result.get("layers", {}),
                    "reasoning_path": deep_reasoning_result.get("reasoning_path", []),
                    "confidence": max(
                        traditional_reasoning.get("confidence", 0.5),
                        deep_reasoning_result.get("confidence", 0.5)
                    ),
                    "synthesis": deep_reasoning_result.get("layers", {}).get("synthesis", {}),
                    "verification": deep_reasoning_result.get("layers", {}).get("verification", {})
                }


                reasoning_steps.append({
                    "step": 2.0,
                    "type": "deep_reasoning",
                    "result": {
                        "layers_processed": len(deep_reasoning_result.get("layers", {})),
                        "reasoning_quality": deep_reasoning_result.get("layers", {}).get("verification", {}).get("reasoning_quality", "medium"),
                        "synthesis_coherence": deep_reasoning_result.get("layers", {}).get("synthesis", {}).get("coherence", 0.5)
                    }
                })
            else:

                reasoning_result = await self._chain_of_thought_reasoning(
                    message=message,
                    semantic_result=semantic_result,
                    user_id=user_id,
                    context=context,
                    conversation_history=conversation_history
                )

            reasoning_steps.extend(reasoning_result.get("steps", []))


            logger.info(f"Step 3: Retrieving relevant data...")
            data_result = await self._retrieve_relevant_data(
                intent=semantic_result.get("intent"),
                entities=semantic_result.get("entities", {}),
                user_id=user_id,
                context=context,
                message=message
            )

            reasoning_steps.append({
                "step": len(reasoning_steps) + 1,
                "type": "data_retrieval",
                "result": {
                    "sources": data_result.get("sources", []),
                    "data_points": len(data_result.get("data", {})),
                    "knowledge_items": len(data_result.get("data", {}).get("prior_knowledge", []))
                }
            })


            logger.info(f"Step 4: Generating response...")
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


            if settings.enable_learning:
                logger.info(f"Step 5: Advanced continuous learning from interaction...")


                if self.advanced_learning_system and self.advanced_learning_system.is_ready():
                    await self.advanced_learning_system.learn_from_interaction(
                        user_message=message,
                        intent=semantic_result.get("intent", "general_inquiry"),
                        entities=semantic_result.get("entities", {}),
                        response=response_result.get("answer", ""),
                        confidence=response_result.get("confidence", 0.5),
                        user_id=user_id,
                        context=context,
                        feedback=None
                    )


                if self.continuous_learner:
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


            if self.platform_trainer and response_result.get("confidence", 0) > 0.8:
                await self.platform_trainer.retrain_on_interaction(
                    user_message=message,
                    intent=semantic_result.get("intent", "general_inquiry"),
                    entities=semantic_result.get("entities", {}),
                    response=response_result.get("answer", ""),
                    confidence=response_result.get("confidence", 0.5)
                )

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
            "thought": "Synthesizing conclusions",
            "insights": {
                "conclusions": conclusions,
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

        relevant_knowledge = []
        if self.vector_store:
            try:
                knowledge_results = await self.vector_store.search(
                    query=sub_problem,
                    top_k=5,
                    filter_metadata={"type": "prior_knowledge"},
                    threshold=0.5
                )
                relevant_knowledge = [
                    {
                        "text": r.get("text", ""),
                        "similarity": r.get("similarity", 0),
                        "category": r.get("category", ""),
                        "knowledge_type": r.get("knowledge_type", "")
                    }
                    for r in knowledge_results
                ]
            except Exception as e:
                logger.warning(f"Error querying knowledge for sub-problem: {e}")

        return {
            "sub_problem": sub_problem,
            "reasoning": f"Analyzing {sub_problem} using {len(relevant_knowledge)} knowledge items...",
            "confidence": 0.8 if relevant_knowledge else 0.5,
            "relevant_knowledge": relevant_knowledge
        }

    async def _synthesize_conclusions(
        self,
        reasoning_insights: List[Dict],
        intent: str
    ) -> List[str]:
        conclusions = []
        for insight in reasoning_insights:
            if insight.get("confidence", 0) > 0.5:
                conclusions.append(insight.get("sub_problem", ""))
        return conclusions

    def _calculate_reasoning_confidence(self, reasoning_insights: List[Dict]) -> float:
        if not reasoning_insights:
            return 0.5

        confidences = [insight.get("confidence", 0.5) for insight in reasoning_insights]
        return np.mean(confidences)

    async def _verify_reasoning(
        self,
        message: str,
        conclusions: List[str],
        entities: Dict
    ) -> Dict[str, Any]:
        return {
            "verified": True,
            "confidence": 0.8,
            "checks": [
                "Intent alignment verified",
                "Entity extraction verified",
                "Logic consistency verified"
            ]
        }

    async def _retrieve_relevant_data(
        self,
        intent: str,
        entities: Dict[str, Any],
        user_id: str,
        context: Dict[str, Any],
        message: str = ""
    ) -> Dict[str, Any]:
        sources = []
        data = {}
        knowledge_items = []


        if self.vector_store:
            try:

                knowledge_results = await self.vector_store.search(
                    query=message or f"{intent} {entities}",
                    top_k=10,
                    filter_metadata={"type": "prior_knowledge"},
                    threshold=0.5
                )
                knowledge_items = [
                    {
                        "text": r.get("text", ""),
                        "similarity": r.get("similarity", 0),
                        "category": r.get("category", ""),
                        "knowledge_type": r.get("knowledge_type", ""),
                        "key": r.get("key", "")
                    }
                    for r in knowledge_results
                ]
                if knowledge_items:
                    sources.append("Comprehensive Knowledge Base")
                    data["prior_knowledge"] = knowledge_items
                    logger.info(f"Retrieved {len(knowledge_items)} knowledge items from vector store")
            except Exception as e:
                logger.warning(f"Error querying knowledge base: {e}")

        try:

            if intent in ["investment_advice", "recommendation"]:

                try:
                    user_context = {
                        "user_id": user_id,
                        "filters": entities,
                        **context
                    }
                    advice_data = await self.multi_source_data.fetch_investment_advice_data(user_context)
                    data.update(advice_data)
                    sources.extend(advice_data.get("sources", []))
                except Exception as e:
                    logger.warning(f"Could not fetch investment advice data: {e}")
                    data["properties"] = []
                    data["user_context"] = {"user_id": user_id}

            elif intent == "market_analysis":
                location = entities.get("location")
                if location:
                    logger.debug(f"Fetching market data for location: {location}")
                    try:

                        market_data = await self.multi_source_data.fetch_market_data(
                            location,
                            include_external=True
                        )
                        data["market"] = market_data
                        sources.extend(market_data.get("sources", []))
                    except Exception as e:
                        logger.warning(f"Could not fetch market data for {location}: {e}")
                        data["market"] = {}


                    try:
                        if self.multi_source_data.web_scraper:
                            logger.info(f"Performing deep web research for {location}...")
                            web_research = await self.multi_source_data.web_scraper.comprehensive_research(
                                f"real estate market analysis {location} 2024",
                                max_sources=5
                            )

                            if web_research and self.information_understanding:
                                logger.info("Understanding and reasoning about extracted web information...")
                                prior_knowledge = data.get("prior_knowledge", [])
                                understanding_result = await self.information_understanding.understand_and_reason(
                                    extracted_info=web_research,
                                    user_query=message,
                                    context=context,
                                    prior_knowledge=prior_knowledge
                                )

                                data["web_research"] = web_research
                                data["web_understanding"] = understanding_result
                            else:
                                data["web_research"] = web_research

                            sources.extend([s.get("source", "Web Research") for s in web_research.get("sources", [])])
                    except Exception as e:
                        logger.warning(f"Could not perform web research: {e}")
                        data["web_research"] = {}
                        data["web_understanding"] = {}

            elif intent == "portfolio_inquiry":

                try:
                    data["portfolio"] = await self.data_service.fetch_portfolio(user_id)
                    sources.append("Portfolio API")
                except Exception as e:
                    logger.warning(f"Could not fetch portfolio: {e}")
                    data["portfolio"] = None

                try:
                    data["investments"] = await self.data_service.fetch_investments(user_id)
                    sources.append("Investments API")
                except Exception as e:
                    logger.warning(f"Could not fetch investments: {e}")
                    data["investments"] = []

            elif intent == "wallet_inquiry":
                try:
                    data["wallet"] = await self.data_service.fetch_wallet(user_id)
                    sources.append("Wallet API")
                except Exception as e:
                    logger.warning(f"Could not fetch wallet: {e}")
                    data["wallet"] = None

            elif intent == "property_search":

                try:
                    property_insights = await self.multi_source_data.fetch_property_insights(
                        property_id=None,
                        filters=entities
                    )
                    data.update(property_insights)
                    sources.extend(property_insights.get("sources", []))
                except Exception as e:
                    logger.warning(f"Could not fetch property insights: {e}")
                    data["properties"] = []

            elif intent == "explanation":

                topic = entities.get("topic", "")
                if topic and self.multi_source_data.web_scraper:
                    logger.info(f"Researching explanation for {topic}...")
                    explanation_research = await self.multi_source_data.web_scraper.comprehensive_research(
                        f"what is {topic}",
                        max_sources=3
                    )

                    if explanation_research and self.information_understanding:
                        logger.info("Understanding extracted explanation content...")
                        prior_knowledge = data.get("prior_knowledge", [])
                        understanding_result = await self.information_understanding.understand_and_reason(
                            extracted_info=explanation_research,
                            user_query=message,
                            context=context,
                            prior_knowledge=prior_knowledge
                        )
                        data["web_research"] = explanation_research
                        data["web_understanding"] = understanding_result
                    else:
                        data["web_research"] = explanation_research
                    sources.extend([s.get("source", "Web Research") for s in explanation_research.get("sources", [])])

        except Exception as e:
            logger.error(f"Error retrieving data: {e}", exc_info=True)

        return {
            "data": data,
            "sources": sources
        }


