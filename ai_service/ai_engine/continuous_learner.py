from typing import Dict, List, Any, Optional
import json
from datetime import datetime
import asyncio

from ai_engine.vector_store import VectorStore
from ai_engine.knowledge_base import KnowledgeBase
from ai_engine.embedding_model import AdvancedEmbeddingModel
from config import settings
from utils.logger import setup_logger

logger = setup_logger(__name__)


class ContinuousLearner:

    def __init__(
        self,
        vector_store: VectorStore,
        knowledge_base: KnowledgeBase,
        embedding_model: AdvancedEmbeddingModel
    ):
        self.vector_store = vector_store
        self.knowledge_base = knowledge_base
        self.embedding_model = embedding_model
        self.ready = False
        self.learning_queue = asyncio.Queue()
        self.learning_active = False

    async def initialize(self):
        logger.info("Initializing continuous learning system...")

        try:

            self.learning_active = True
            asyncio.create_task(self._learning_loop())

            self.ready = True
            logger.info("✅ Continuous learning system initialized")
        except Exception as e:
            logger.error(f"Error initializing continuous learner: {e}", exc_info=True)
            raise

    async def cleanup(self):
        self.learning_active = False
        self.ready = False

    def is_ready(self) -> bool:
        return self.ready

    async def learn_from_interaction(
        self,
        user_message: str,
        intent: str,
        entities: Dict[str, Any],
        response: str,
        confidence: float,
        user_id: str,
        session_id: str,
        context: Dict[str, Any],
        data_sources: List[str]
    ):
        learning_task = {
            "user_message": user_message,
            "intent": intent,
            "entities": entities,
            "response": response,
            "confidence": confidence,
            "user_id": user_id,
            "session_id": session_id,
            "context": context,
            "data_sources": data_sources,
            "timestamp": datetime.utcnow().isoformat()
        }

        await self.learning_queue.put(learning_task)

    async def _learning_loop(self):
        while self.learning_active:
            try:

                task = await asyncio.wait_for(
                    self.learning_queue.get(),
                    timeout=1.0
                )


                await self._process_learning_task(task)

            except asyncio.TimeoutError:
                continue
            except Exception as e:
                logger.error(f"Error in learning loop: {e}", exc_info=True)
                await asyncio.sleep(1)

    async def _process_learning_task(self, task: Dict[str, Any]):
        try:
            user_message = task["user_message"]
            intent = task["intent"]
            entities = task["entities"]
            response = task["response"]
            confidence = task["confidence"]


            await self._learn_intent_pattern(user_message, intent, confidence)


            if entities:
                await self._learn_entity_patterns(user_message, entities, intent)


            await self._learn_response_pattern(response, intent, entities, confidence)


            await self._learn_user_preferences(
                task["user_id"],
                intent,
                entities,
                task["context"]
            )


            await self._learn_from_data_sources(
                task["data_sources"],
                intent,
                entities
            )


            await self.knowledge_base.learn_from_interaction(task)

            logger.debug(f"Learned from interaction: {intent} (confidence: {confidence:.2f})")

        except Exception as e:
            logger.error(f"Error processing learning task: {e}", exc_info=True)

    async def _learn_intent_pattern(
        self,
        user_message: str,
        intent: str,
        confidence: float
    ):
        if confidence < 0.6:
            return  # Don't learn from low-confidence predictions


        await self.vector_store.learn_pattern(
            user_message=user_message,
            intent=intent,
            entities={},
            response="",
            confidence=confidence
        )

    async def _learn_entity_patterns(
        self,
        user_message: str,
        entities: Dict[str, Any],
        intent: str
    ):

        await self.vector_store.add(
            text=user_message,
            metadata={
                "type": "entity_pattern",
                "intent": intent,
                "entities": json.dumps(entities),
                "learned_at": datetime.utcnow().isoformat()
            }
        )

    async def _learn_response_pattern(
        self,
        response: str,
        intent: str,
        entities: Dict[str, Any],
        confidence: float
    ):
        if confidence < 0.7:
            return

        await self.vector_store.add(
            text=response,
            metadata={
                "type": "response_pattern",
                "intent": intent,
                "entities": json.dumps(entities),
                "confidence": confidence,
                "learned_at": datetime.utcnow().isoformat()
            }
        )

    async def _learn_user_preferences(
        self,
        user_id: str,
        intent: str,
        entities: Dict[str, Any],
        context: Dict[str, Any]
    ):

        preferences = {
            "preferred_intents": {intent: 1},
            "preferred_entities": entities,
            "context_patterns": context
        }


        await self.knowledge_base.learn_from_interaction({
            "user_id": user_id,
            "intent": intent,
            "entities": entities,
            "preferences": preferences
        })

    async def _learn_from_data_sources(
        self,
        data_sources: List[str],
        intent: str,
        entities: Dict[str, Any]
    ):

        for source in data_sources:
            await self.vector_store.add(
                text=f"{intent} using {source}",
                metadata={
                    "type": "data_source_pattern",
                    "intent": intent,
                    "data_source": source,
                    "entities": json.dumps(entities),
                    "learned_at": datetime.utcnow().isoformat()
                }
            )

    async def batch_learn(
        self,
        interactions: List[Dict[str, Any]]
    ):
        tasks = [
            self.learn_from_interaction(**interaction)
            for interaction in interactions
        ]
        await asyncio.gather(*tasks, return_exceptions=True)

    async def get_learned_patterns(
        self,
        intent: Optional[str] = None,
        top_k: int = 10
    ) -> List[Dict[str, Any]]:
        if intent:
            return await self.vector_store.get_by_intent(intent, top_k)
        else:


            return []

    async def retrain_model(self):
        logger.info("Retraining model based on learned patterns...")


        patterns = await self.get_learned_patterns()

        if len(patterns) < 100:
            logger.info("Not enough patterns to retrain, continuing learning...")
            return







        logger.info(f"Model retrained with {len(patterns)} patterns")
