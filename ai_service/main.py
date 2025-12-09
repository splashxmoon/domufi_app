from fastapi import FastAPI, HTTPException, Depends, Header, Body, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
import uvicorn
from datetime import datetime
import asyncio
import logging

from config import settings
from ai_engine.reasoning_engine_fixed import AdvancedReasoningEngine
from ai_engine.knowledge_base import KnowledgeBase
from ai_engine.data_retrieval import DataRetrievalService
from utils.logger import setup_logger


logger = setup_logger(__name__)


app = FastAPI(
    title="Domufi AI Service",
    description="Advanced AI reasoning engine with ChatGPT-like capabilities",
    version="1.0.0"
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)


reasoning_engine = None
knowledge_base = None
data_service = None
platform_trainer = None
online_pretrainer = None
continuous_learner_bg = None
feedback_finetuner = None
self_learning_system = None


@app.on_event("shutdown")
async def shutdown_event():
    global reasoning_engine, feedback_finetuner, continuous_learner_bg, online_pretrainer

    logger.info("💾 Saving all learned data before shutdown...")

    try:

        if reasoning_engine and reasoning_engine.vector_store:
            await reasoning_engine.vector_store._save_to_disk()
            logger.info("✅ Vector store saved")


        if feedback_finetuner:
            await feedback_finetuner._save_to_disk()
            logger.info("✅ Feedback patterns saved")


        if continuous_learner_bg:
            await continuous_learner_bg._save_to_disk()
            logger.info("✅ Learning progress saved")

        logger.info("💾 All learned data saved successfully")
    except Exception as e:
        logger.error(f"Error saving data on shutdown: {e}", exc_info=True)


@app.on_event("startup")
async def startup_event():
    global reasoning_engine, knowledge_base, data_service

    start_time = datetime.utcnow()
    print("\n" + "="*70)
    print("[START] INITIALIZING DOMUFI AI SERVICE")
    print("="*70)
    print(f"[TIME] Start Time: {start_time.strftime('%Y-%m-%d %H:%M:%S')} UTC\n")

    logger.info("Initializing AI components...")

    try:

        print("[1/7] Initializing Knowledge Base...")
        knowledge_base = KnowledgeBase()
        await knowledge_base.initialize()
        logger.info("Knowledge base initialized")
        print("     [OK] Knowledge base initialized\n")


        print("[2/7] Initializing Data Retrieval Service...")
        data_service = DataRetrievalService()
        await data_service.initialize()
        logger.info("Data retrieval service initialized")
        print("     [OK] Data retrieval service initialized\n")


        print("[3/7] Initializing Advanced Reasoning Engine...")
        reasoning_engine = AdvancedReasoningEngine(
            knowledge_base=knowledge_base,
            data_service=data_service
        )
        await reasoning_engine.initialize()
        logger.info("Reasoning engine initialized")
        print("     [OK] Reasoning engine initialized\n")


        print("[4/7] Initializing Platform Trainer...")
        from ai_engine.platform_trainer import PlatformTrainer
        global platform_trainer
        platform_trainer = PlatformTrainer(
            vector_store=reasoning_engine.vector_store,
            knowledge_base=knowledge_base,
            embedding_model=reasoning_engine.embedding_model,
            data_service=data_service
        )
        await platform_trainer.initialize()
        logger.info("Platform trainer initialized and trained on platform knowledge")
        print("     [OK] Platform trainer initialized\n")


        print("[5/7] Initializing Online Pretrainer...")
        from ai_engine.online_pretrainer import OnlinePretrainer
        global online_pretrainer
        online_pretrainer = OnlinePretrainer(
            vector_store=reasoning_engine.vector_store,
            embedding_model=reasoning_engine.embedding_model,
            information_understanding=reasoning_engine.information_understanding
        )
        await online_pretrainer.initialize()
        logger.info("Online pretrainer initialized - ready to learn from web sources")
        print("     [OK] Online pretrainer initialized\n")


        print("[6/7] Initializing Continuous Background Learner...")
        from ai_engine.continuous_background_learner import ContinuousBackgroundLearner
        global continuous_learner_bg
        continuous_learner_bg = ContinuousBackgroundLearner(
            vector_store=reasoning_engine.vector_store,
            embedding_model=reasoning_engine.embedding_model,
            information_understanding=reasoning_engine.information_understanding,
            web_scraper=reasoning_engine.multi_source_data.web_scraper
        )
        await continuous_learner_bg.initialize()
        logger.info("Continuous background learner initialized - learning 24/7")
        print("     [OK] Continuous background learner initialized\n")


        print("[7/7] Initializing User Feedback Fine-Tuner...")
        from ai_engine.user_feedback_finetuner import UserFeedbackFineTuner
        global feedback_finetuner
        feedback_finetuner = UserFeedbackFineTuner(
            vector_store=reasoning_engine.vector_store,
            embedding_model=reasoning_engine.embedding_model
        )
        await feedback_finetuner.initialize()
        logger.info("User feedback fine-tuner initialized - learning from user interactions")
        print("     [OK] User feedback fine-tuner initialized\n")


        print("[8/8] Initializing Self-Learning System...")
        from ai_engine.self_learning_system import SelfLearningSystem
        global self_learning_system
        self_learning_system = SelfLearningSystem(
            vector_store=reasoning_engine.vector_store,
            embedding_model=reasoning_engine.embedding_model,
            information_understanding=reasoning_engine.information_understanding,
            web_scraper=reasoning_engine.multi_source_data.web_scraper
        )
        await self_learning_system.initialize()
        logger.info("Self-learning system initialized - automated testing and improvement")
        print("     [OK] Self-learning system initialized\n")


        reasoning_engine.platform_trainer = platform_trainer
        logger.info("Platform trainer linked to reasoning engine")


        logger.info("Starting continuous self-learning loop...")
        asyncio.create_task(self_learning_system.run_continuous_self_learning(reasoning_engine, interval_minutes=10))
        logger.info("Self-learning loop started - will test and improve every 10 minutes")


        logger.info("Triggering initial pretraining for major markets...")
        asyncio.create_task(online_pretrainer.pretrain_specific_market("NYC"))
        asyncio.create_task(online_pretrainer.pretrain_specific_market("Miami"))
        asyncio.create_task(online_pretrainer.pretrain_specific_market("Atlanta"))
        logger.info("Initial pretraining started in background for NYC, Miami, and Atlanta")

        end_time = datetime.utcnow()
        init_duration = (end_time - start_time).total_seconds()

        logger.info("All AI components initialized successfully")
        print("="*70)
        print("[OK] AI SERVICE FULLY INITIALIZED AND READY!")
        print("="*70)
        print(f"[TIME] Initialization Time: {init_duration:.2f} seconds")
        print(f"[TIME] Ready Time: {end_time.strftime('%Y-%m-%d %H:%M:%S')} UTC")
        print(f"[API] Running on: http://localhost:8000")
        print(f"[API] Docs: http://localhost:8000/docs")
        print(f"[API] Health Check: http://localhost:8000/health")
        print(f"[API] Test Connection: http://localhost:8000/test")
        print(f"[API] Ping: http://localhost:8000/ping")
        print(f"[API] Self-Learning Report: http://localhost:8000/self-learning/report")
        print("="*70)
        print("\n[READY] You can now use the chat! The AI is ready to respond.")
        print("[SELF-LEARN] Automated testing and improvement running every 30 minutes.\n")

    except Exception as e:
        logger.error(f"Error initializing AI components: {e}", exc_info=True)
        print("\n" + "="*70)
        print("[ERROR] INITIALIZATION FAILED")
        print("="*70)
        print(f"Error: {e}")
        print("Check logs for details: ai_service/logs/ai_service.log")
        print("="*70 + "\n")
        raise


@app.on_event("shutdown")
async def shutdown_event():
    global reasoning_engine, feedback_finetuner, continuous_learner_bg, online_pretrainer

    logger.info("💾 Saving all learned data before shutdown...")

    try:

        if reasoning_engine and reasoning_engine.vector_store:
            await reasoning_engine.vector_store._save_to_disk()
            logger.info("✅ Vector store saved")


        if feedback_finetuner:
            await feedback_finetuner._save_to_disk()
            logger.info("✅ Feedback patterns saved")


        if continuous_learner_bg:
            await continuous_learner_bg._save_to_disk()
            logger.info("✅ Learning progress saved")

        logger.info("💾 All learned data saved successfully")


        if reasoning_engine:
            await reasoning_engine.cleanup()
        if knowledge_base:
            await knowledge_base.cleanup()
    except Exception as e:
        logger.error(f"Error saving data on shutdown: {e}", exc_info=True)



class ChatRequest(BaseModel):
    message: str = Field(..., description="User message")
    context: Optional[Dict[str, Any]] = Field(None, description="Additional context")
    session_id: Optional[str] = Field("default", description="Session ID")
    user_id: Optional[str] = Field("anonymous", description="User ID")
    conversation_history: Optional[List[Dict[str, str]]] = Field(None, description="Previous messages")


class ChatResponse(BaseModel):
    answer: str = Field(..., description="AI response")
    confidence: float = Field(..., description="Confidence score (0-1)")
    reasoning_steps: Optional[List[Dict[str, Any]]] = Field(None, description="Reasoning steps")
    entities: Optional[Dict[str, Any]] = Field(None, description="Extracted entities")
    intent: Optional[str] = Field(None, description="Detected intent")
    suggestions: Optional[List[str]] = Field(None, description="Follow-up suggestions")
    actions: Optional[List[Dict[str, Any]]] = Field(None, description="Suggested actions")
    data_sources: Optional[List[str]] = Field(None, description="Data sources used")
    timestamp: str = Field(default_factory=lambda: datetime.utcnow().isoformat())
    model_info: Optional[Dict[str, Any]] = Field(None, description="Model information")


class HealthResponse(BaseModel):
    status: str
    version: str
    components: Dict[str, str]
    model_info: Optional[Dict[str, Any]] = None




@app.get("/", response_model=Dict[str, str])
async def root():
    try:
        is_ready = reasoning_engine.is_ready() if reasoning_engine else False
        return {
            "service": "Domufi AI Service",
            "version": "1.0.0",
            "status": "running",
            "docs": "/docs",
            "reasoning_engine_ready": is_ready,
            "ready_to_chat": is_ready
        }
    except Exception as e:
        return {
            "service": "Domufi AI Service",
            "version": "1.0.0",
            "status": "running",
            "error": str(e)
        }

@app.get("/ping", response_model=Dict[str, str])
async def ping():
    return {
        "status": "ok",
        "message": "Server is running",
        "timestamp": datetime.utcnow().isoformat()
    }

@app.get("/test", response_model=Dict[str, str])
async def test_connection():
    try:
        is_ready = reasoning_engine.is_ready() if reasoning_engine else False
        return {
            "status": "connected" if is_ready else "initializing",
            "message": "AI service is running and ready" if is_ready else "AI service is still initializing",
            "reasoning_engine_ready": is_ready,
            "ready_to_chat": is_ready,
            "timestamp": datetime.utcnow().isoformat()
        }
    except Exception as e:
        logger.error(f"Error in test endpoint: {e}")
        return {
            "status": "error",
            "message": f"Error checking status: {str(e)}",
            "reasoning_engine_ready": False,
            "ready_to_chat": False,
            "timestamp": datetime.utcnow().isoformat()
        }

@app.get("/self-learning/report", response_model=Dict[str, Any])
async def get_self_learning_report():
    global self_learning_system
    if not self_learning_system:
        raise HTTPException(status_code=503, detail="Self-learning system not initialized")

    try:
        report = await self_learning_system.get_learning_report()
        return report
    except Exception as e:
        logger.error(f"Error getting self-learning report: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/self-learning/test-results", response_model=Dict[str, Any])
async def get_test_results(limit: int = 50):
    global self_learning_system
    if not self_learning_system:
        raise HTTPException(status_code=503, detail="Self-learning system not initialized")

    try:
        results = await self_learning_system.get_detailed_test_results(limit=limit)
        return results
    except Exception as e:
        logger.error(f"Error getting test results: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/self-learning/test-response", response_model=Dict[str, Any])
async def get_test_response(question: str = Query(..., description="Exact test question to retrieve the latest response for")):
    global self_learning_system
    if not self_learning_system:
        raise HTTPException(status_code=503, detail="Self-learning system not initialized")
    try:
        result = await self_learning_system.get_latest_test_response(question)
        if not result:
            raise HTTPException(status_code=404, detail="No stored test response found for that question")
        return result
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting test response: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/self-learning/test-suite", response_model=Dict[str, Any])
async def get_test_suite_info():
    global self_learning_system
    if not self_learning_system:
        raise HTTPException(status_code=503, detail="Self-learning system not initialized")

    try:
        info = await self_learning_system.get_test_suite_info()
        return info
    except Exception as e:
        logger.error(f"Error getting test suite info: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/self-learning/validate-criteria")
async def validate_test_criteria(request: Dict[str, Any]):
    global self_learning_system
    if not self_learning_system:
        raise HTTPException(status_code=503, detail="Self-learning system not initialized")

    try:

        question = request.get("question")
        sample_response = request.get("sample_response", "")

        if not question:
            raise HTTPException(status_code=400, detail="Question is required")


        test_case = None
        for test in self_learning_system.test_suite:
            if test["question"].lower() == question.lower():
                test_case = test
                break

        if not test_case:
            raise HTTPException(status_code=404, detail="Test case not found")

        validation = await self_learning_system.validate_test_criteria(test_case, sample_response)
        return validation
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error validating criteria: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/self-learning/test")
async def trigger_self_test(request: Optional[Dict[str, Any]] = Body(None)):
    global self_learning_system, reasoning_engine
    if not self_learning_system:
        raise HTTPException(status_code=503, detail="Self-learning system not initialized")
    if not reasoning_engine:
        raise HTTPException(status_code=503, detail="Reasoning engine not initialized")

    try:
        request = request or {}
        quick_mode = request.get("quick_mode", False)
        focused_mode = request.get("focused_mode")
        test_subset = request.get("test_subset")

        result = await self_learning_system.run_self_test_cycle(
            reasoning_engine, 
            quick_mode=quick_mode,
            focused_mode=focused_mode,
            test_subset=test_subset
        )
        return {
            "status": "success",
            "message": "Self-test cycle completed",
            "results": result
        }
    except Exception as e:
        logger.error(f"Error running self-test: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/self-learning/learn-gaps")
async def trigger_gap_learning(request: Dict[str, Any]):
    global self_learning_system
    if not self_learning_system:
        raise HTTPException(status_code=503, detail="Self-learning system not initialized")

    try:
        knowledge_gaps = request.get("knowledge_gaps", [])
        category = request.get("category", "general")

        if not knowledge_gaps:
            raise HTTPException(status_code=400, detail="knowledge_gaps is required")

        await self_learning_system._trigger_gap_learning(knowledge_gaps, category)

        return {
            "status": "success",
            "message": f"Gap learning triggered for {len(knowledge_gaps)} gaps",
            "gaps": knowledge_gaps,
            "category": category
        }
    except Exception as e:
        logger.error(f"Error triggering gap learning: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/status", response_model=Dict[str, Any])
async def get_status():
    global platform_trainer, online_pretrainer, continuous_learner_bg, feedback_finetuner, self_learning_system

    try:
        components = {
            "knowledge_base": knowledge_base.is_ready() if knowledge_base else False,
            "data_service": data_service.is_ready() if data_service else False,
            "reasoning_engine": reasoning_engine.is_ready() if reasoning_engine else False,
            "platform_trainer": platform_trainer is not None,
            "online_pretrainer": online_pretrainer is not None,
            "continuous_learner": continuous_learner_bg is not None,
            "feedback_finetuner": feedback_finetuner is not None,
            "self_learning_system": self_learning_system is not None and self_learning_system.is_ready() if self_learning_system else False
        }


        # Note: data_service can work in offline mode, so it's not truly critical
        critical_components = ["knowledge_base", "reasoning_engine"]
        critical_ready = all(components.get(c, False) for c in critical_components)
        all_ready = all(components.values())

        return {
            "status": "ready" if all_ready else ("ready_basic" if critical_ready else "initializing"),
            "ready_to_chat": critical_ready,
            "fully_ready": all_ready,
            "components": components,
            "critical_components": {k: components[k] for k in critical_components},
            "ready_count": sum(1 for v in components.values() if v),
            "total_components": len(components),
            "message": (
                "All components initialized and ready for chat" if all_ready 
                else "Core components ready - chat available (background learners still loading)" if critical_ready
                else "Components are still initializing - please wait"
            ),
            "timestamp": datetime.utcnow().isoformat()
        }
    except Exception as e:
        logger.error(f"Error in status endpoint: {e}")
        return {
            "status": "error",
            "ready_to_chat": False,
            "fully_ready": False,
            "error": str(e),
            "timestamp": datetime.utcnow().isoformat()
        }


@app.get("/health", response_model=HealthResponse)
async def health_check():
    components_status = {}
    model_info = None

    try:

        if reasoning_engine:
            try:
                components_status["reasoning_engine"] = "healthy" if reasoning_engine.is_ready() else "unhealthy"
            except:
                components_status["reasoning_engine"] = "unhealthy"
        else:
            components_status["reasoning_engine"] = "unhealthy"

        if knowledge_base:
            try:
                components_status["knowledge_base"] = "healthy" if knowledge_base.is_ready() else "unhealthy"
            except:
                components_status["knowledge_base"] = "unhealthy"
        else:
            components_status["knowledge_base"] = "unhealthy"

        if data_service:
            try:
                components_status["data_service"] = "healthy" if data_service.is_ready() else "unhealthy"
            except:
                components_status["data_service"] = "unhealthy"
        else:
            components_status["data_service"] = "unhealthy"


        if reasoning_engine and reasoning_engine.is_ready():
            try:
                model_info = await asyncio.wait_for(
                    reasoning_engine.get_model_info(),
                    timeout=1.0
                )
            except (asyncio.TimeoutError, Exception):
                model_info = {"status": "available"}
    except Exception as e:
        logger.error(f"Health check error: {e}")
        components_status["error"] = str(e)

    return HealthResponse(
        status="healthy" if all(v == "healthy" for v in components_status.values()) else "degraded",
        version="1.0.0",
        components=components_status,
        model_info=model_info
    )


@app.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    if not reasoning_engine:
        raise HTTPException(
            status_code=503, 
            detail="AI service not initialized. Please check server logs."
        )

    if not reasoning_engine.is_ready():
        raise HTTPException(
            status_code=503,
            detail="AI reasoning engine is not ready. Initialization may still be in progress."
        )

    try:
        logger.info(f"Processing message from user {request.user_id}: {request.message[:100]}...")


        try:
            result = await asyncio.wait_for(
                reasoning_engine.process_message(
                    message=request.message,
                    user_id=request.user_id,
                    session_id=request.session_id,
                    context=request.context or {},
                    conversation_history=request.conversation_history or []
                ),
                timeout=55.0
            )
        except asyncio.TimeoutError:
            logger.error("Chat request timed out after 55 seconds")
            raise HTTPException(
                status_code=504,
                detail="Request timed out. The query may be too complex or the service is busy. Please try again with a simpler query."
            )

        logger.info(f"Response generated with confidence: {result.get('confidence', 0):.2f}")

        return ChatResponse(
            answer=result.get("answer", "I apologize, but I encountered an error processing your request."),
            confidence=result.get("confidence", 0.5),
            reasoning_steps=result.get("reasoning_steps", []),
            entities=result.get("entities", {}),
            intent=result.get("intent", "general_inquiry"),
            suggestions=result.get("suggestions", []),
            actions=result.get("actions", []),
            data_sources=result.get("data_sources", []),
            model_info=result.get("model_info", {})
        )

    except Exception as e:
        logger.error(f"Error processing chat message: {e}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"Error processing message: {str(e)}"
        )


@app.post("/learn")
async def learn_from_interaction(interaction: Dict[str, Any]):
    if not knowledge_base:
        raise HTTPException(status_code=503, detail="Knowledge base not initialized")

    try:
        await knowledge_base.learn_from_interaction(interaction)
        return {"status": "success", "message": "Learning completed"}
    except Exception as e:
        logger.error(f"Error learning from interaction: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/knowledge/{topic}")
async def get_knowledge(topic: str):
    if not knowledge_base:
        raise HTTPException(status_code=503, detail="Knowledge base not initialized")

    try:
        knowledge = await knowledge_base.get_knowledge(topic)
        return {"topic": topic, "knowledge": knowledge}
    except Exception as e:
        logger.error(f"Error retrieving knowledge: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/training/stats")
async def get_training_stats():
    global platform_trainer, online_pretrainer, continuous_learner_bg, feedback_finetuner
    stats = {}

    if platform_trainer:
        try:
            stats["platform_trainer"] = await platform_trainer.get_training_stats()
        except Exception as e:
            logger.error(f"Error getting platform trainer stats: {e}")
            stats["platform_trainer"] = {"error": str(e)}

    if online_pretrainer:
        try:
            stats["online_pretrainer"] = online_pretrainer.get_training_stats()
        except Exception as e:
            logger.error(f"Error getting pretrainer stats: {e}")
            stats["online_pretrainer"] = {"error": str(e)}

    if continuous_learner_bg:
        try:
            stats["continuous_background_learner"] = continuous_learner_bg.get_learning_stats()
        except Exception as e:
            logger.error(f"Error getting background learner stats: {e}")
            stats["continuous_background_learner"] = {"error": str(e)}

    if feedback_finetuner:
        try:
            stats["feedback_finetuner"] = feedback_finetuner.get_finetune_stats()
        except Exception as e:
            logger.error(f"Error getting feedback finetuner stats: {e}")
            stats["feedback_finetuner"] = {"error": str(e)}

    return stats

@app.get("/learning/history")
async def get_learning_history(
    limit: int = Query(100, ge=1, le=1000),
    category: Optional[str] = Query(None)
):
    global continuous_learner_bg, online_pretrainer, self_learning_system

    all_history = []


    if continuous_learner_bg:
        try:
            bg_history = continuous_learner_bg.get_learning_history(limit=limit * 2, category=category)
            all_history.extend(bg_history)
        except Exception as e:
            logger.error(f"Error getting background learner history: {e}")


    if self_learning_system:
        try:
            sl_history = self_learning_system.get_learning_history(limit=limit * 2, category=category)
            all_history.extend(sl_history)
        except Exception as e:
            logger.error(f"Error getting self-learning history: {e}")


    all_history.sort(key=lambda x: x.get("timestamp", ""), reverse=True)


    all_history = all_history[:limit]


    by_source = {}
    by_category = {}
    for entry in all_history:
        source = entry.get("source", "unknown")
        cat = entry.get("category", "unknown")
        by_source[source] = by_source.get(source, 0) + entry.get("items_learned", 0)
        by_category[cat] = by_category.get(cat, 0) + entry.get("items_learned", 0)

    return {
        "total_entries": len(all_history),
        "limit": limit,
        "category_filter": category,
        "summary": {
            "total_items_learned": sum(entry.get("items_learned", 0) for entry in all_history),
            "by_source": by_source,
            "by_category": by_category
        },
        "history": all_history
    }


@app.post("/feedback")
async def submit_feedback(feedback_request: Dict[str, Any]):
    global feedback_finetuner
    if not feedback_finetuner:
        raise HTTPException(status_code=503, detail="Feedback fine-tuner not initialized")

    try:
        await feedback_finetuner.record_feedback(
            user_id=feedback_request.get("user_id", "anonymous"),
            query=feedback_request.get("query", ""),
            response=feedback_request.get("response", ""),
            intent=feedback_request.get("intent", "general_inquiry"),
            entities=feedback_request.get("entities", {}),
            feedback_type=feedback_request.get("feedback_type", "positive"),
            feedback_data=feedback_request.get("feedback_data"),
            rating=feedback_request.get("rating")
        )

        return {
            "status": "success",
            "message": "Feedback recorded and will be used for fine-tuning"
        }
    except Exception as e:
        logger.error(f"Error recording feedback: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/training/pretrain")
async def trigger_pretraining():
    global online_pretrainer
    if not online_pretrainer:
        raise HTTPException(status_code=503, detail="Online pretrainer not initialized")

    try:
        logger.info("Pretraining triggered via API")

        asyncio.create_task(online_pretrainer.pretrain_comprehensive())
        return {
            "status": "started",
            "message": "Pretraining started in background. Check /training/stats for progress."
        }
    except Exception as e:
        logger.error(f"Error triggering pretraining: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/training/pretrain/market/{location}")
async def pretrain_market(location: str):
    global online_pretrainer
    if not online_pretrainer:
        raise HTTPException(status_code=503, detail="Online pretrainer not initialized")

    try:
        logger.info(f"Market pretraining triggered for: {location}")

        asyncio.create_task(online_pretrainer.pretrain_specific_market(location))
        return {
            "status": "started",
            "location": location,
            "message": f"Pretraining for {location} started in background."
        }
    except Exception as e:
        logger.error(f"Error triggering market pretraining: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host=settings.api_host,
        port=settings.api_port,
        reload=True,
        log_level="info"
    )
