from typing import Dict, List, Any, Optional, Tuple
import numpy as np
from datetime import datetime
import asyncio
import json
from collections import defaultdict

try:
    import torch
    import torch.nn as nn
    import torch.optim as optim
    TORCH_AVAILABLE = True
except ImportError:
    TORCH_AVAILABLE = False

from ai_engine.vector_store import VectorStore
from ai_engine.knowledge_base import KnowledgeBase
from ai_engine.embedding_model import AdvancedEmbeddingModel
from config import settings
from utils.logger import setup_logger

logger = setup_logger(__name__)


class LearningNetwork(nn.Module if TORCH_AVAILABLE else object):

    def __init__(self, input_dim: int = 384, output_dim: int = 10):
        if TORCH_AVAILABLE:
            super().__init__()
            self.network = nn.Sequential(
                nn.Linear(input_dim, 256),
                nn.ReLU(),
                nn.Dropout(0.2),
                nn.Linear(256, 128),
                nn.ReLU(),
                nn.Dropout(0.2),
                nn.Linear(128, output_dim),
                nn.Softmax(dim=-1)
            )
        self.input_dim = input_dim
        self.output_dim = output_dim
        self.use_torch = TORCH_AVAILABLE

    def forward(self, x: Any) -> Any:
        if self.use_torch:
            return self.network(x)
        else:

            return np.random.rand(self.output_dim)


class AdvancedLearningSystem:

    def __init__(
        self,
        vector_store: VectorStore,
        knowledge_base: KnowledgeBase,
        embedding_model: AdvancedEmbeddingModel
    ):
        self.vector_store = vector_store
        self.knowledge_base = knowledge_base
        self.embedding_model = embedding_model
        self.learning_network = None
        self.ready = False


        self.learning_stats = {
            "total_interactions": 0,
            "successful_learnings": 0,
            "pattern_updates": 0,
            "intent_improvements": 0,
            "entity_improvements": 0
        }


        self.pattern_frequency = defaultdict(int)
        self.success_patterns = []
        self.failure_patterns = []


        self.learning_queue = asyncio.Queue()
        self.learning_active = False

    async def initialize(self):
        logger.info("Initializing advanced learning system...")

        try:
            embedding_dim = self.embedding_model.get_embedding_dimension()

            if TORCH_AVAILABLE:
                self.learning_network = LearningNetwork(
                    input_dim=embedding_dim,
                    output_dim=10
                )
                self.optimizer = optim.Adam(self.learning_network.parameters(), lr=0.001)
                logger.info("✅ Learning network initialized with PyTorch")
            else:
                self.learning_network = LearningNetwork(
                    input_dim=embedding_dim,
                    output_dim=10
                )
                logger.info("✅ Learning network initialized (numpy fallback)")


            self.learning_active = True
            asyncio.create_task(self._learning_loop())

            self.ready = True
            logger.info("✅ Advanced learning system initialized")
        except Exception as e:
            logger.error(f"Error initializing advanced learning system: {e}", exc_info=True)
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
        context: Dict[str, Any],
        feedback: Optional[Dict[str, Any]] = None
    ):
        learning_task = {
            "user_message": user_message,
            "intent": intent,
            "entities": entities,
            "response": response,
            "confidence": confidence,
            "user_id": user_id,
            "context": context,
            "feedback": feedback or {},
            "timestamp": datetime.utcnow().isoformat()
        }

        await self.learning_queue.put(learning_task)

    async def _learning_loop(self):
        while self.learning_active:
            try:

                try:
                    task = await asyncio.wait_for(
                        self.learning_queue.get(),
                        timeout=1.0
                    )
                except asyncio.TimeoutError:
                    continue


                await self._process_learning_task(task)


                self.learning_stats["total_interactions"] += 1

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
            feedback = task.get("feedback", {})


            await self._learn_pattern_recognition(
                user_message, intent, entities, confidence
            )


            if feedback:
                await self._reinforcement_learning(
                    user_message, intent, response, feedback
                )


            if confidence > 0.7:
                await self._improve_intent_classification(
                    user_message, intent, confidence
                )


            if entities:
                await self._improve_entity_extraction(
                    user_message, entities, intent
                )


            await self._learn_response_patterns(
                intent, entities, response, confidence
            )


            user_id = task.get("user_id")
            if user_id and user_id != "anonymous":
                await self._learn_user_preferences(
                    user_id, intent, entities, task.get("context", {})
                )

            self.learning_stats["successful_learnings"] += 1

        except Exception as e:
            logger.error(f"Error processing learning task: {e}", exc_info=True)

    async def _learn_pattern_recognition(
        self,
        user_message: str,
        intent: str,
        entities: Dict[str, Any],
        confidence: float
    ):
        if confidence < 0.7:
            return


        pattern_key = f"{intent}_{len(entities)}"
        self.pattern_frequency[pattern_key] += 1


        await self.vector_store.add(
            text=user_message,
            metadata={
                "type": "learned_pattern",
                "intent": intent,
                "entities": json.dumps(entities),
                "confidence": confidence,
                "frequency": self.pattern_frequency[pattern_key],
                "learned_at": datetime.utcnow().isoformat()
            }
        )

        self.learning_stats["pattern_updates"] += 1

    async def _reinforcement_learning(
        self,
        user_message: str,
        intent: str,
        response: str,
        feedback: Dict[str, Any]
    ):
        reward = feedback.get("reward", 0.5)

        if reward > 0.7:

            await self.vector_store.add(
                text=user_message,
                metadata={
                    "type": "positive_pattern",
                    "intent": intent,
                    "reward": reward,
                    "reinforced_at": datetime.utcnow().isoformat()
                }
            )
            self.success_patterns.append({
                "message": user_message,
                "intent": intent,
                "reward": reward
            })
        elif reward < 0.3:

            await self.vector_store.add(
                text=user_message,
                metadata={
                    "type": "negative_pattern",
                    "intent": intent,
                    "reward": reward,
                    "avoided_at": datetime.utcnow().isoformat()
                }
            )
            self.failure_patterns.append({
                "message": user_message,
                "intent": intent,
                "reward": reward
            })


        if TORCH_AVAILABLE and self.learning_network:
            await self._update_learning_network(user_message, intent, reward)

    async def _update_learning_network(
        self,
        user_message: str,
        intent: str,
        reward: float
    ):
        try:

            embeddings = await self.embedding_model.encode([user_message])

            if len(embeddings) == 0:
                return


            input_tensor = torch.tensor(embeddings[0], dtype=torch.float32).unsqueeze(0)


            prediction = self.learning_network(input_tensor)


            intent_map = {
                "investment_advice": 0, "market_analysis": 1, "portfolio_inquiry": 2,
                "wallet_inquiry": 3, "explanation": 4, "comparison": 5,
                "property_search": 6, "new_user_help": 7, "general_inquiry": 8
            }
            target_idx = intent_map.get(intent, 9)
            target = torch.zeros(10)
            target[target_idx] = reward


            loss = nn.MSELoss()(prediction, target.unsqueeze(0))


            self.optimizer.zero_grad()
            loss.backward()
            self.optimizer.step()

        except Exception as e:
            logger.warning(f"Error updating learning network: {e}")

    async def _improve_intent_classification(
        self,
        user_message: str,
        intent: str,
        confidence: float
    ):

        await self.vector_store.add(
            text=user_message,
            metadata={
                "type": "intent_example",
                "intent": intent,
                "confidence": confidence,
                "learned_at": datetime.utcnow().isoformat()
            }
        )

        self.learning_stats["intent_improvements"] += 1

    async def _improve_entity_extraction(
        self,
        user_message: str,
        entities: Dict[str, Any],
        intent: str
    ):

        await self.vector_store.add(
            text=user_message,
            metadata={
                "type": "entity_example",
                "intent": intent,
                "entities": json.dumps(entities),
                "entity_count": len(entities),
                "learned_at": datetime.utcnow().isoformat()
            }
        )

        self.learning_stats["entity_improvements"] += 1

    async def _learn_response_patterns(
        self,
        intent: str,
        entities: Dict[str, Any],
        response: str,
        confidence: float
    ):
        if confidence < 0.7:
            return


        await self.vector_store.add(
            text=response,
            metadata={
                "type": "response_example",
                "intent": intent,
                "entities": json.dumps(entities),
                "confidence": confidence,
                "response_length": len(response),
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

        await self.vector_store.add(
            text=f"user_{user_id}_{intent}",
            metadata={
                "type": "user_preference",
                "user_id": user_id,
                "intent": intent,
                "entities": json.dumps(entities),
                "context": json.dumps(context),
                "learned_at": datetime.utcnow().isoformat()
            }
        )

    async def get_learning_stats(self) -> Dict[str, Any]:
        return {
            **self.learning_stats,
            "pattern_diversity": len(self.pattern_frequency),
            "success_rate": len(self.success_patterns) / max(1, len(self.success_patterns) + len(self.failure_patterns)),
            "most_common_patterns": dict(sorted(
                self.pattern_frequency.items(),
                key=lambda x: x[1],
                reverse=True
            )[:10])
        }

    async def predict_best_response(
        self,
        user_message: str,
        candidate_responses: List[str]
    ) -> Tuple[str, float]:
        if not candidate_responses:
            return "", 0.0


        scores = []
        for response in candidate_responses:

            similar = await self.vector_store.search(
                query=response,
                top_k=3,
                filter_metadata={"type": "positive_pattern"},
                threshold=0.6
            )

            score = len(similar) * 0.3


            failures = await self.vector_store.search(
                query=response,
                top_k=3,
                filter_metadata={"type": "negative_pattern"},
                threshold=0.6
            )
            score -= len(failures) * 0.5

            scores.append((response, max(0.0, min(1.0, score))))


        if scores:
            best_response, best_score = max(scores, key=lambda x: x[1])
            return best_response, best_score

        return candidate_responses[0], 0.5
