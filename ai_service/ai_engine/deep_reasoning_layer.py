from typing import Dict, List, Any, Optional, Tuple
import numpy as np
from datetime import datetime
import asyncio
import json

try:
    import torch
    import torch.nn as nn
    import torch.nn.functional as F
    TORCH_AVAILABLE = True
except ImportError:
    TORCH_AVAILABLE = False
    print("Warning: PyTorch not available. Using numpy-based fallback.")

from ai_engine.embedding_model import AdvancedEmbeddingModel
from ai_engine.vector_store import VectorStore
from config import settings
from utils.logger import setup_logger

logger = setup_logger(__name__)


class DeepReasoningNetwork(nn.Module if TORCH_AVAILABLE else object):

    def __init__(self, input_dim: int = 384, hidden_dims: List[int] = [768, 512, 384, 256, 128, 96]):
        if TORCH_AVAILABLE:
            super().__init__()



            layers = []
            prev_dim = input_dim

            for i, hidden_dim in enumerate(hidden_dims):
                layers.append(nn.Linear(prev_dim, hidden_dim))
                layers.append(nn.LayerNorm(hidden_dim))
                layers.append(nn.GELU())
                layers.append(nn.Dropout(0.15 if i < len(hidden_dims) - 1 else 0.1))


                if i > 0 and prev_dim == hidden_dim:
                    layers.append(nn.Identity())

                prev_dim = hidden_dim

            self.deep_layers = nn.Sequential(*layers)



            num_heads = 12
            self.self_attention = nn.MultiheadAttention(prev_dim, num_heads=num_heads, batch_first=True, dropout=0.1)
            self.cross_attention = nn.MultiheadAttention(prev_dim, num_heads=num_heads, batch_first=True, dropout=0.1)


            self.feedforward = nn.Sequential(
                nn.Linear(prev_dim, prev_dim * 4),
                nn.GELU(),
                nn.Dropout(0.1),
                nn.Linear(prev_dim * 4, prev_dim),
                nn.Dropout(0.1)
            )


            self.intent_head = nn.Linear(prev_dim, 15)
            self.entity_head = nn.Linear(prev_dim, prev_dim)
            self.reasoning_head = nn.Linear(prev_dim, prev_dim)
            self.confidence_head = nn.Sequential(
                nn.Linear(prev_dim, 64),
                nn.ReLU(),
                nn.Linear(64, 1),
                nn.Sigmoid()
            )


            self.layer_norm1 = nn.LayerNorm(prev_dim)
            self.layer_norm2 = nn.LayerNorm(prev_dim)
            self.layer_norm3 = nn.LayerNorm(prev_dim)

        self.input_dim = input_dim
        self.hidden_dims = hidden_dims
        self.use_torch = TORCH_AVAILABLE

    def forward(self, embeddings: Any, context: Optional[Any] = None) -> Dict[str, Any]:
        if not self.use_torch:

            return self._numpy_forward(embeddings, context)


        x = embeddings
        deep_features = self.deep_layers(x)


        deep_features_expanded = deep_features.unsqueeze(1)
        attended_features, attention_weights = self.self_attention(
            deep_features_expanded,
            deep_features_expanded,
            deep_features_expanded
        )
        attended_features = attended_features.squeeze(1)
        deep_features = self.layer_norm1(deep_features + attended_features)


        if context is not None:
            if TORCH_AVAILABLE:
                import torch
                if isinstance(context, torch.Tensor):
                    context_expanded = context.unsqueeze(1) if len(context.shape) == 1 else context
                    cross_attended, _ = self.cross_attention(
                        deep_features_expanded,
                        context_expanded,
                        context_expanded
                    )
                    deep_features = self.layer_norm2(deep_features + cross_attended.squeeze(1))


        ff_output = self.feedforward(deep_features)
        deep_features = self.layer_norm3(deep_features + ff_output)


        reasoning_output = self.reasoning_head(deep_features)
        intent_logits = self.intent_head(deep_features)
        entity_features = self.entity_head(deep_features)
        confidence_score = self.confidence_head(deep_features).squeeze(-1)

        return {
            "reasoning_features": reasoning_output,
            "intent_logits": intent_logits,
            "entity_features": entity_features,
            "confidence_score": confidence_score,
            "deep_features": deep_features,
            "attention_weights": attention_weights
        }

    def _numpy_forward(self, embeddings: np.ndarray, context: Optional[np.ndarray] = None) -> Dict[str, Any]:

        features = embeddings
        for dim in self.hidden_dims:

            features = np.tanh(features @ np.random.randn(features.shape[-1], dim) * 0.1)

        return {
            "reasoning_features": features,
            "intent_logits": features[:, :10] if len(features.shape) > 1 else features[:10],
            "deep_features": features
        }


class DeepReasoningLayer:

    def __init__(
        self,
        embedding_model: AdvancedEmbeddingModel,
        vector_store: VectorStore
    ):
        self.embedding_model = embedding_model
        self.vector_store = vector_store
        self.reasoning_network = None
        self.ready = False


        self.layer_states = {
            "semantic_layer": {},
            "contextual_layer": {},
            "inferential_layer": {},
            "synthesis_layer": {},
            "verification_layer": {}
        }

    async def initialize(self):
        logger.info("Initializing deep reasoning layer...")

        try:
            embedding_dim = self.embedding_model.get_embedding_dimension()

            if TORCH_AVAILABLE:
                self.reasoning_network = DeepReasoningNetwork(
                    input_dim=embedding_dim,
                    hidden_dims=[768, 512, 384, 256, 128, 96]
                )
                self.reasoning_network.eval()
                logger.info("✅ ENHANCED Deep reasoning network initialized with PyTorch (6 layers, 12-head attention)")
            else:
                self.reasoning_network = DeepReasoningNetwork(
                    input_dim=embedding_dim,
                    hidden_dims=[768, 512, 384, 256, 128, 96]
                )
                logger.info("✅ ENHANCED Deep reasoning network initialized (numpy fallback, 6 layers)")

            self.ready = True
        except Exception as e:
            logger.error(f"Error initializing deep reasoning layer: {e}", exc_info=True)
            raise

    def is_ready(self) -> bool:
        return self.ready

    async def cleanup(self):
        self.reasoning_network = None
        self.ready = False

    async def deep_reason(
        self,
        message: str,
        context: Dict[str, Any],
        conversation_history: List[Dict[str, str]],
        intent: str,
        entities: Dict[str, Any]
    ) -> Dict[str, Any]:
        reasoning_result = {
            "layers": {},
            "confidence": 0.0,
            "insights": [],
            "reasoning_path": []
        }


        semantic_result = await self._semantic_layer(
            message, intent, entities
        )
        reasoning_result["layers"]["semantic"] = semantic_result
        reasoning_result["reasoning_path"].append("semantic_understanding")


        contextual_result = await self._contextual_layer(
            message, conversation_history, context, semantic_result
        )
        reasoning_result["layers"]["contextual"] = contextual_result
        reasoning_result["reasoning_path"].append("contextual_understanding")


        inferential_result = await self._inferential_layer(
            message, semantic_result, contextual_result, entities
        )
        reasoning_result["layers"]["inferential"] = inferential_result
        reasoning_result["reasoning_path"].append("inferential_reasoning")


        synthesis_result = await self._synthesis_layer(
            semantic_result, contextual_result, inferential_result
        )
        reasoning_result["layers"]["synthesis"] = synthesis_result
        reasoning_result["reasoning_path"].append("synthesis")


        verification_result = await self._verification_layer(
            message, reasoning_result
        )
        reasoning_result["layers"]["verification"] = verification_result
        reasoning_result["reasoning_path"].append("verification")


        confidences = [
            semantic_result.get("confidence", 0.5),
            contextual_result.get("confidence", 0.5),
            inferential_result.get("confidence", 0.5),
            synthesis_result.get("confidence", 0.5),
            verification_result.get("confidence", 0.5)
        ]
        reasoning_result["confidence"] = np.mean(confidences)

        return reasoning_result

    async def _semantic_layer(
        self,
        message: str,
        intent: str,
        entities: Dict[str, Any]
    ) -> Dict[str, Any]:

        embeddings = await self.embedding_model.encode([message])


        if TORCH_AVAILABLE and self.reasoning_network:
            with torch.no_grad():
                embeddings_tensor = torch.tensor(embeddings, dtype=torch.float32)
                network_output = self.reasoning_network(embeddings_tensor)

                reasoning_features = network_output["reasoning_features"].numpy()
                intent_logits = F.softmax(network_output["intent_logits"], dim=-1).numpy()
        else:
            network_output = self.reasoning_network._numpy_forward(embeddings[0])
            reasoning_features = network_output["reasoning_features"]
            intent_logits = network_output["intent_logits"]


        similar_patterns = await self.vector_store.search(
            query=message,
            top_k=5,
            threshold=0.6
        )

        return {
            "deep_embedding": reasoning_features[0] if len(reasoning_features.shape) > 1 else reasoning_features,
            "intent_probabilities": intent_logits[0] if len(intent_logits.shape) > 1 else intent_logits,
            "similar_patterns": similar_patterns,
            "confidence": 0.8,
            "semantic_features": {
                "complexity": self._calculate_complexity(message),
                "ambiguity": self._calculate_ambiguity(message, intent),
                "specificity": len(entities) / 5.0
            }
        }

    async def _contextual_layer(
        self,
        message: str,
        conversation_history: List[Dict[str, str]],
        context: Dict[str, Any],
        semantic_result: Dict[str, Any]
    ) -> Dict[str, Any]:

        contextual_insights = []


        if conversation_history:
            recent_messages = conversation_history[-5:]
            for hist_msg in recent_messages:
                similarity = await self.embedding_model.similarity(
                    message, hist_msg.get("content", "")
                )
                if similarity > 0.7:
                    contextual_insights.append({
                        "type": "reference",
                        "message": hist_msg,
                        "similarity": similarity
                    })


        context_features = {}
        if context.get("wallet"):
            context_features["has_wallet"] = True
            context_features["wallet_balance"] = context["wallet"].get("balance", 0)
        if context.get("portfolio"):
            context_features["has_portfolio"] = True
            context_features["portfolio_size"] = len(context["portfolio"].get("investments", []))


        contextual_embedding = semantic_result.get("deep_embedding", np.zeros(64))
        if contextual_insights:

            contextual_embedding = contextual_embedding * 1.2

        return {
            "contextual_insights": contextual_insights,
            "context_features": context_features,
            "contextual_embedding": contextual_embedding,
            "confidence": 0.75,
            "context_relevance": len(contextual_insights) / 5.0
        }

    async def _inferential_layer(
        self,
        message: str,
        semantic_result: Dict[str, Any],
        contextual_result: Dict[str, Any],
        entities: Dict[str, Any]
    ) -> Dict[str, Any]:
        inferences = []


        if entities.get("location") and not entities.get("budget"):
            inferences.append({
                "type": "implicit_need",
                "inference": "User may be interested in properties in this location",
                "confidence": 0.7
            })


        intent_probs = semantic_result.get("intent_probabilities", [])
        if len(intent_probs) > 0 and np.max(intent_probs) < 0.6:
            inferences.append({
                "type": "intent_uncertainty",
                "inference": "Message may have multiple intents",
                "confidence": 0.6
            })


        context_features = contextual_result.get("context_features", {})
        if context_features.get("has_wallet") and context_features.get("wallet_balance", 0) > 0:
            inferences.append({
                "type": "readiness",
                "inference": "User has funds and may be ready to invest",
                "confidence": 0.8
            })


        if entities.get("topic"):

            related_topics = await self._find_related_topics(entities["topic"])
            if related_topics:
                inferences.append({
                    "type": "topic_expansion",
                    "related_topics": related_topics,
                    "confidence": 0.7
                })

        return {
            "inferences": inferences,
            "inference_count": len(inferences),
            "confidence": np.mean([inf.get("confidence", 0.5) for inf in inferences]) if inferences else 0.5,
            "reasoning_depth": len(inferences) * 0.2
        }

    async def _synthesis_layer(
        self,
        semantic_result: Dict[str, Any],
        contextual_result: Dict[str, Any],
        inferential_result: Dict[str, Any]
    ) -> Dict[str, Any]:

        semantic_emb = semantic_result.get("deep_embedding", np.zeros(64))
        contextual_emb = contextual_result.get("contextual_embedding", np.zeros(64))


        synthesis_embedding = (
            semantic_emb * 0.5 +
            contextual_emb * 0.3 +
            np.array(inferential_result.get("reasoning_depth", 0)) * 0.2
        )


        synthesized_insights = []
        synthesized_insights.extend(semantic_result.get("similar_patterns", [])[:3])
        synthesized_insights.extend(contextual_result.get("contextual_insights", [])[:2])
        synthesized_insights.extend(inferential_result.get("inferences", [])[:3])


        priority_actions = []
        if inferential_result.get("inference_count", 0) > 0:
            priority_actions.append("provide_detailed_response")
        if contextual_result.get("context_relevance", 0) > 0.5:
            priority_actions.append("use_context")
        if semantic_result.get("semantic_features", {}).get("complexity", 0) > 0.7:
            priority_actions.append("break_down_explanation")

        return {
            "synthesis_embedding": synthesis_embedding,
            "synthesized_insights": synthesized_insights,
            "priority_actions": priority_actions,
            "confidence": 0.8,
            "coherence": self._calculate_coherence(synthesized_insights)
        }

    async def _verification_layer(
        self,
        message: str,
        reasoning_result: Dict[str, Any]
    ) -> Dict[str, Any]:
        checks = []


        semantic_conf = reasoning_result["layers"]["semantic"].get("confidence", 0.5)
        if semantic_conf > 0.7:
            checks.append({"check": "semantic_consistency", "passed": True})
        else:
            checks.append({"check": "semantic_consistency", "passed": False})


        context_relevance = reasoning_result["layers"]["contextual"].get("context_relevance", 0)
        if context_relevance > 0.5:
            checks.append({"check": "context_relevance", "passed": True})
        else:
            checks.append({"check": "context_relevance", "passed": False})


        inference_conf = reasoning_result["layers"]["inferential"].get("confidence", 0.5)
        if inference_conf > 0.6:
            checks.append({"check": "inference_quality", "passed": True})
        else:
            checks.append({"check": "inference_quality", "passed": False})


        coherence = reasoning_result["layers"]["synthesis"].get("coherence", 0)
        if coherence > 0.7:
            checks.append({"check": "synthesis_coherence", "passed": True})
        else:
            checks.append({"check": "synthesis_coherence", "passed": False})

        passed_checks = sum(1 for c in checks if c["passed"])
        overall_verification = passed_checks / len(checks) if checks else 0.5

        return {
            "checks": checks,
            "passed_checks": passed_checks,
            "total_checks": len(checks),
            "confidence": overall_verification,
            "reasoning_quality": "high" if overall_verification > 0.75 else "medium" if overall_verification > 0.5 else "low"
        }

    async def _find_related_topics(self, topic: str) -> List[str]:

        similar_topics = await self.vector_store.search(
            query=topic,
            top_k=3,
            threshold=0.6
        )
        return [t.get("text", "")[:50] for t in similar_topics]

    def _calculate_complexity(self, message: str) -> float:

        word_count = len(message.split())
        avg_word_length = np.mean([len(word) for word in message.split()]) if word_count > 0 else 0

        complexity = min(1.0, (word_count / 50.0) * 0.5 + (avg_word_length / 10.0) * 0.5)
        return complexity

    def _calculate_ambiguity(self, message: str, intent: str) -> float:

        ambiguous_words = ["maybe", "perhaps", "might", "could", "possibly"]
        ambiguity_score = sum(1 for word in ambiguous_words if word in message.lower()) / len(ambiguous_words)
        return min(1.0, ambiguity_score)

    def _calculate_coherence(self, insights: List[Dict]) -> float:
        if not insights:
            return 0.5


        return min(1.0, len(insights) / 10.0)
