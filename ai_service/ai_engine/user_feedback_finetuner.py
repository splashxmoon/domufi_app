from typing import Dict, List, Any, Optional
import asyncio
from datetime import datetime
import json

from ai_engine.vector_store import VectorStore
from ai_engine.embedding_model import AdvancedEmbeddingModel
from utils.logger import setup_logger

logger = setup_logger(__name__)


class UserFeedbackFineTuner:

    def __init__(
        self,
        vector_store: VectorStore,
        embedding_model: AdvancedEmbeddingModel
    ):
        self.vector_store = vector_store
        self.embedding_model = embedding_model
        self.ready = False


        self.feedback_stats = {
            "total_feedback_received": 0,
            "positive_feedback": 0,
            "negative_feedback": 0,
            "patterns_learned": 0,
            "responses_improved": 0,
            "last_finetune": None
        }


        self.feedback_patterns = []
        self.learning_queue = asyncio.Queue()


        from pathlib import Path
        self.storage_path = Path("memory/feedback_finetuner")
        self.storage_path.mkdir(parents=True, exist_ok=True)

    async def initialize(self):
        logger.info("Initializing user feedback fine-tuner...")


        await self._load_from_disk()

        self.ready = True


        asyncio.create_task(self._feedback_processing_loop())

        logger.info(f"[OK] User feedback fine-tuner initialized - {len(self.feedback_patterns)} patterns loaded")

    async def _feedback_processing_loop(self):
        while True:
            try:
                if not self.learning_queue.empty():
                    feedback = await self.learning_queue.get()
                    await self._process_feedback(feedback)

                await asyncio.sleep(5)

            except Exception as e:
                logger.error(f"Error in feedback processing loop: {e}", exc_info=True)
                await asyncio.sleep(10)

    async def record_feedback(
        self,
        user_id: str,
        query: str,
        response: str,
        intent: str,
        entities: Dict[str, Any],
        feedback_type: str,
        feedback_data: Optional[Dict[str, Any]] = None,
        rating: Optional[float] = None
    ):
        if not self.ready:
            return

        self.feedback_stats["total_feedback_received"] += 1

        if feedback_type == "positive":
            self.feedback_stats["positive_feedback"] += 1
        elif feedback_type == "negative":
            self.feedback_stats["negative_feedback"] += 1


        feedback_entry = {
            "user_id": user_id,
            "query": query,
            "response": response,
            "intent": intent,
            "entities": entities,
            "feedback_type": feedback_type,
            "feedback_data": feedback_data or {},
            "rating": rating,
            "timestamp": datetime.utcnow().isoformat()
        }

        await self.learning_queue.put(feedback_entry)
        logger.info(f"[FEEDBACK] Feedback recorded: {feedback_type} for intent '{intent}'")

    async def _process_feedback(self, feedback: Dict[str, Any]):
        try:
            feedback_type = feedback.get("feedback_type")
            query = feedback.get("query")
            response = feedback.get("response")
            intent = feedback.get("intent")
            entities = feedback.get("entities", {})

            if feedback_type == "positive":

                await self._learn_from_positive_feedback(query, response, intent, entities)

            elif feedback_type == "negative":

                await self._learn_from_negative_feedback(query, response, intent, entities)

            elif feedback_type == "correction":

                corrected_response = feedback.get("feedback_data", {}).get("corrected_response", "")
                if corrected_response:
                    await self._learn_from_correction(query, response, corrected_response, intent, entities)


            await self._store_feedback_pattern(feedback)

        except Exception as e:
            logger.error(f"Error processing feedback: {e}", exc_info=True)

    async def _learn_from_positive_feedback(
        self,
        query: str,
        response: str,
        intent: str,
        entities: Dict[str, Any]
    ):
        try:

            await self.vector_store.add(
                text=f"Query: {query}\nResponse: {response}",
                metadata={
                    "type": "positive_feedback_pattern",
                    "intent": intent,
                    "entities": json.dumps(entities),
                    "source": "user_feedback",
                    "feedback_type": "positive",
                    "learned_at": datetime.utcnow().isoformat(),
                    "confidence": 0.9
                }
            )


            await self.vector_store.add(
                text=response,
                metadata={
                    "type": "successful_response_pattern",
                    "intent": intent,
                    "entities": json.dumps(entities),
                    "source": "user_feedback",
                    "learned_at": datetime.utcnow().isoformat()
                }
            )

            self.feedback_stats["patterns_learned"] += 1
            logger.debug(f"Learned from positive feedback for intent: {intent}")

        except Exception as e:
            logger.warning(f"Error learning from positive feedback: {e}")

    async def _learn_from_negative_feedback(
        self,
        query: str,
        response: str,
        intent: str,
        entities: Dict[str, Any]
    ):
        try:

            await self.vector_store.add(
                text=f"Query: {query}\nAvoid Response: {response}",
                metadata={
                    "type": "negative_feedback_pattern",
                    "intent": intent,
                    "entities": json.dumps(entities),
                    "source": "user_feedback",
                    "feedback_type": "negative",
                    "learned_at": datetime.utcnow().isoformat(),
                    "avoid": True
                }
            )


            await self.vector_store.add(
                text=query,
                metadata={
                    "type": "improved_query_pattern",
                    "intent": intent,
                    "entities": json.dumps(entities),
                    "source": "user_feedback",
                    "needs_improvement": True,
                    "learned_at": datetime.utcnow().isoformat()
                }
            )

            self.feedback_stats["patterns_learned"] += 1
            logger.debug(f"Learned from negative feedback for intent: {intent}")

        except Exception as e:
            logger.warning(f"Error learning from negative feedback: {e}")

    async def _learn_from_correction(
        self,
        query: str,
        original_response: str,
        corrected_response: str,
        intent: str,
        entities: Dict[str, Any]
    ):
        try:

            await self.vector_store.add(
                text=f"Query: {query}\nCorrect Response: {corrected_response}",
                metadata={
                    "type": "corrected_response_pattern",
                    "intent": intent,
                    "entities": json.dumps(entities),
                    "source": "user_feedback",
                    "feedback_type": "correction",
                    "original_response": original_response,
                    "learned_at": datetime.utcnow().isoformat(),
                    "confidence": 0.95
                }
            )


            await self.vector_store.add(
                text=corrected_response,
                metadata={
                    "type": "preferred_response_pattern",
                    "intent": intent,
                    "entities": json.dumps(entities),
                    "source": "user_correction",
                    "learned_at": datetime.utcnow().isoformat()
                }
            )

            self.feedback_stats["patterns_learned"] += 1
            self.feedback_stats["responses_improved"] += 1
            logger.info(f"[OK] Learned from correction for intent: {intent}")

        except Exception as e:
            logger.warning(f"Error learning from correction: {e}")

    async def _store_feedback_pattern(self, feedback: Dict[str, Any]):
        self.feedback_patterns.append(feedback)


        if len(self.feedback_patterns) > 5000:
            self.feedback_patterns = self.feedback_patterns[-5000:]


        if len(self.feedback_patterns) % 10 == 0:
            await self._save_to_disk()

    async def get_feedback_insights(self, intent: Optional[str] = None) -> Dict[str, Any]:
        if intent:
            patterns = [p for p in self.feedback_patterns if p.get("intent") == intent]
        else:
            patterns = self.feedback_patterns

        positive_count = sum(1 for p in patterns if p.get("feedback_type") == "positive")
        negative_count = sum(1 for p in patterns if p.get("feedback_type") == "negative")

        avg_rating = None
        ratings = [p.get("rating") for p in patterns if p.get("rating")]
        if ratings:
            avg_rating = sum(ratings) / len(ratings)

        return {
            "total_patterns": len(patterns),
            "positive_feedback": positive_count,
            "negative_feedback": negative_count,
            "average_rating": avg_rating,
            "improvement_rate": self.feedback_stats["responses_improved"] / max(1, self.feedback_stats["total_feedback_received"])
        }

    def get_finetune_stats(self) -> Dict[str, Any]:
        return {
            **self.feedback_stats,
            "feedback_patterns_stored": len(self.feedback_patterns)
        }

    def is_ready(self) -> bool:
        return self.ready

    async def _save_to_disk(self):
        try:
            import pickle


            patterns_path = self.storage_path / "feedback_patterns.pkl"
            with open(patterns_path, 'wb') as f:
                pickle.dump(self.feedback_patterns, f)


            stats_path = self.storage_path / "feedback_stats.pkl"
            with open(stats_path, 'wb') as f:
                pickle.dump(self.feedback_stats, f)

            logger.debug(f"Saved {len(self.feedback_patterns)} feedback patterns to disk")
        except Exception as e:
            logger.error(f"Error saving feedback finetuner data: {e}", exc_info=True)

    async def _load_from_disk(self):
        try:
            import pickle


            patterns_path = self.storage_path / "feedback_patterns.pkl"
            if patterns_path.exists():
                with open(patterns_path, 'rb') as f:
                    self.feedback_patterns = pickle.load(f)
                logger.info(f"Loaded {len(self.feedback_patterns)} feedback patterns from disk")


            stats_path = self.storage_path / "feedback_stats.pkl"
            if stats_path.exists():
                with open(stats_path, 'rb') as f:
                    loaded_stats = pickle.load(f)

                    for key, value in loaded_stats.items():
                        if key not in self.feedback_stats or self.feedback_stats[key] < value:
                            self.feedback_stats[key] = value
                logger.info("Loaded feedback stats from disk")
        except Exception as e:
            logger.warning(f"Error loading feedback finetuner data: {e}, starting fresh")
            self.feedback_patterns = []

