from typing import Dict, List, Any, Optional
import asyncio
import json
from datetime import datetime, timedelta
from pathlib import Path
import logging
import re

from ai_engine.vector_store import VectorStore
from ai_engine.embedding_model import AdvancedEmbeddingModel
from ai_engine.web_scraper import IntelligentWebScraper
from ai_engine.information_understanding import InformationUnderstandingEngine
from utils.logger import setup_logger

logger = setup_logger(__name__)


class SelfLearningSystem:

    def __init__(
        self,
        vector_store: VectorStore,
        embedding_model: AdvancedEmbeddingModel,
        information_understanding: InformationUnderstandingEngine,
        web_scraper: IntelligentWebScraper
    ):
        self.vector_store = vector_store
        self.embedding_model = embedding_model
        self.information_understanding = information_understanding
        self.web_scraper = web_scraper


        self.test_suite = self._build_test_suite()


        self.topic_synonyms = {
            "nyc": {"nyc", "new york", "new york city", "manhattan"},
            "miami": {"miami", "south florida"},
            "atlanta": {"atlanta", "atl"},
            "los angeles": {"los angeles", "la", "l.a.", "southern california"},
            "fractional ownership": {"fractional ownership", "fractional investing"},
            "first investment": {"first investment", "beginner investment", "first-time investor"},
            "roi": {"roi", "return on investment"},
            "vacation rental": {"vacation rental", "short-term rental", "airbnb"},
            "interest rates": {"interest rate", "interest rates", "rate hikes", "federal reserve"},
            "diversification": {"diversification", "diversified", "spread risk"}
        }


        self.learning_stats = {
            "total_tests": 0,
            "passed_tests": 0,
            "failed_tests": 0,
            "self_corrections": 0,
            "knowledge_gaps_identified": 0,
            "improvements_made": 0,
            "accuracy_trend": [],
            "last_test_time": None
        }


        self.learning_history = []
        self.max_history_size = 500


        self.mastered_questions = {}
        self.current_focus_question = None
        self.focused_training_enabled = True
        self.min_pass_count = 2


        self.storage_path = Path("memory/self_learning")
        self.storage_path.mkdir(parents=True, exist_ok=True)

        self.ready = False

    def _build_test_suite(self) -> List[Dict[str, Any]]:
        return [

            {
                "category": "market_analysis",
                "question": "How is the real estate market in NYC right now?",
                "expected_topics": ["NYC", "real estate market", "prices", "trends", "inventory"],
                "expected_structure": ["overview", "current_trends", "data_points"],
                "validation_criteria": {
                    "min_length": 200,
                    "requires_data": True,
                    "requires_recent_info": True
                }
            },
            {
                "category": "market_analysis",
                "question": "What's happening with the Miami real estate market?",
                "expected_topics": ["Miami", "real estate", "market conditions", "growth"],
                "validation_criteria": {
                    "min_length": 150,
                    "requires_data": True
                }
            },
            {
                "category": "investment_knowledge",
                "question": "How does fractional ownership work?",
                "expected_topics": ["fractional ownership", "shares", "benefits", "process"],
                "validation_criteria": {
                    "min_length": 300,
                    "requires_explanation": True,
                    "requires_benefits": True
                }
            },
            {
                "category": "investment_knowledge",
                "question": "What should I invest in for my first real estate investment?",
                "expected_topics": ["first investment", "recommendations", "risk", "strategy"],
                "validation_criteria": {
                    "min_length": 250,
                    "requires_recommendations": True
                }
            },
            {
                "category": "financial_knowledge",
                "question": "How do I calculate ROI on a fractional real estate investment?",
                "expected_topics": ["ROI", "calculation", "formula", "example"],
                "validation_criteria": {
                    "min_length": 200,
                    "requires_formula": True,
                    "requires_example": True
                }
            },
            {
                "category": "market_comparison",
                "question": "Compare the real estate markets in Atlanta and Los Angeles",
                "expected_topics": ["Atlanta", "Los Angeles", "comparison", "differences"],
                "validation_criteria": {
                    "min_length": 300,
                    "requires_comparison": True,
                    "requires_both_markets": True
                }
            },
            {
                "category": "market_analysis",
                "question": "What are the best real estate markets to invest in 2025?",
                "expected_topics": ["best markets", "investment", "2025", "recommendations"],
                "validation_criteria": {
                    "min_length": 250,
                    "requires_recommendations": True,
                    "requires_reasoning": True
                }
            },
            {
                "category": "property_knowledge",
                "question": "What should I look for when buying a vacation rental property?",
                "expected_topics": ["vacation rental", "location", "features", "factors"],
                "validation_criteria": {
                    "min_length": 200,
                    "requires_checklist": True
                }
            },
            {
                "category": "economic_knowledge",
                "question": "How do interest rates affect real estate prices?",
                "expected_topics": ["interest rates", "real estate prices", "relationship", "impact"],
                "validation_criteria": {
                    "min_length": 200,
                    "requires_explanation": True
                }
            },
            {
                "category": "investment_strategy",
                "question": "What's a good diversification strategy for real estate investing?",
                "expected_topics": ["diversification", "strategy", "portfolio", "risk"],
                "validation_criteria": {
                    "min_length": 250,
                    "requires_strategy": True
                }
            }
        ]

    async def initialize(self):
        logger.info("Initializing self-learning system...")


        await self._load_from_disk()


        await self._load_mastered_questions()

        self.ready = True
        logger.info("[OK] Self-learning system initialized")
        if self.focused_training_enabled:
            logger.info(f"[FOCUSED TRAINING] Enabled - {len([q for q in self.mastered_questions.values() if q.get('passed')])} questions mastered")

    async def run_self_test_cycle(
        self,
        reasoning_engine,
        test_subset: Optional[List[str]] = None,
        quick_mode: bool = False,
        focused_mode: bool = None
    ) -> Dict[str, Any]:

        use_focused = (focused_mode if focused_mode is not None else self.focused_training_enabled)

        logger.info(f"[SELF-TEST] Starting automated self-test cycle... (focused_mode: {use_focused})")
        print(f"\n{'='*70}")
        print(f"[SELF-TEST] Starting Automated Testing Cycle")
        print(f"Time: {datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S')} UTC")
        print(f"Mode: {'Focused (One-by-One)' if use_focused else ('Quick' if quick_mode else 'Full')}")
        print(f"{'='*70}\n")

        results = {
            "total_tests": 0,
            "passed": 0,
            "failed": 0,
            "issues_found": [],
            "improvements_made": [],
            "knowledge_gaps": [],
            "mode": "focused" if use_focused else ("quick" if quick_mode else "full"),
            "test_details": []
        }


        if use_focused:

            current_question = self._get_next_focus_question()

            if current_question:
                self.current_focus_question = current_question["question"]
                print(f"[FOCUSED TRAINING] Focusing on: {current_question['question']}")
                print(f"[FOCUSED TRAINING] Category: {current_question['category']}")
                print(f"[FOCUSED TRAINING] Mastered: {len([q for q in self.mastered_questions.values() if q.get('passed')])}/{len(self.test_suite)} questions\n")


                tests_to_run = [current_question]
            else:

                print(f"[FOCUSED TRAINING] ✅ ALL QUESTIONS MASTERED! ({len(self.test_suite)}/{len(self.test_suite)})")
                tests_to_run = []
        else:

            tests_to_run = self.test_suite
            if test_subset:
                tests_to_run = [t for t in self.test_suite if t["category"] in test_subset]
            elif quick_mode:

                categories_tested = {}
                tests_to_run = []
                for test_case in self.test_suite:
                    cat = test_case["category"]
                    if cat not in categories_tested:
                        categories_tested[cat] = 0
                    if categories_tested[cat] < 2:
                        tests_to_run.append(test_case)
                        categories_tested[cat] += 1

        for test_case in tests_to_run:
            results["total_tests"] += 1
            test_result = await self._test_single_response(
                reasoning_engine,
                test_case
            )
            results["test_details"].append(test_result)

            if test_result["passed"]:
                results["passed"] += 1
                logger.info(f"[SELF-TEST] PASSED: {test_case['question'][:50]}...")


                if use_focused:
                    question_key = test_case["question"]
                    if question_key not in self.mastered_questions:
                        self.mastered_questions[question_key] = {
                            "passed": False,
                            "pass_count": 0,
                            "last_passed": None,
                            "total_attempts": 0
                        }

                    self.mastered_questions[question_key]["pass_count"] += 1
                    self.mastered_questions[question_key]["last_passed"] = datetime.utcnow().isoformat()
                    self.mastered_questions[question_key]["total_attempts"] = self.mastered_questions[question_key].get("total_attempts", 0) + 1


                    if self.mastered_questions[question_key]["pass_count"] >= self.min_pass_count:
                        self.mastered_questions[question_key]["passed"] = True
                        print(f"\n{'='*70}")
                        print(f"[FOCUSED TRAINING] ✅ MASTERED: {test_case['question'][:60]}...")
                        print(f"[FOCUSED TRAINING] Passed {self.mastered_questions[question_key]['pass_count']} times")
                        print(f"[FOCUSED TRAINING] Moving to next question...")
                        print(f"{'='*70}\n")
                        logger.info(f"[FOCUSED TRAINING] Question mastered: {test_case['question'][:50]}...")
                        await self._save_mastered_questions()
                    else:
                        print(f"[FOCUSED TRAINING] Passed {self.mastered_questions[question_key]['pass_count']}/{self.min_pass_count} times - need {self.min_pass_count - self.mastered_questions[question_key]['pass_count']} more")
            else:
                results["failed"] += 1
                results["issues_found"].append(test_result)
                logger.warning(f"[SELF-TEST] FAILED: {test_case['question'][:50]}... - {test_result['reason']}")


                if use_focused:
                    question_key = test_case["question"]
                    if question_key not in self.mastered_questions:
                        self.mastered_questions[question_key] = {
                            "passed": False,
                            "pass_count": 0,
                            "last_passed": None,
                            "total_attempts": 0
                        }
                    self.mastered_questions[question_key]["total_attempts"] = self.mastered_questions[question_key].get("total_attempts", 0) + 1
                    self.mastered_questions[question_key]["pass_count"] = 0
                    print(f"[FOCUSED TRAINING] Failed - Attempt
                    print(f"[FOCUSED TRAINING] Issues: {test_result['reason'][:100]}...")


                correction_result = await self._attempt_self_correction(
                    test_case,
                    test_result
                )

                if correction_result["corrected"]:
                    results["improvements_made"].append(correction_result)
                    self.learning_stats["self_corrections"] += 1


                    if use_focused:
                        knowledge_gaps = correction_result.get("knowledge_gaps", [])
                        if knowledge_gaps:
                            print(f"[FOCUSED TRAINING] Learning extensively on gaps: {', '.join(knowledge_gaps[:5])}...")

                            await self._extensive_gap_learning(knowledge_gaps, test_case["category"])


        self.learning_stats["total_tests"] += results["total_tests"]
        self.learning_stats["passed_tests"] += results["passed"]
        self.learning_stats["failed_tests"] += results["failed"]
        self.learning_stats["last_test_time"] = datetime.utcnow().isoformat()


        if results["total_tests"] > 0:
            accuracy = (results["passed"] / results["total_tests"]) * 100
            self.learning_stats["accuracy_trend"].append({
                "timestamp": datetime.utcnow().isoformat(),
                "accuracy": accuracy,
                "tests_run": results["total_tests"]
            })

            if len(self.learning_stats["accuracy_trend"]) > 100:
                self.learning_stats["accuracy_trend"] = self.learning_stats["accuracy_trend"][-100:]


        await self._save_to_disk()
        await self._save_test_results(results)


        accuracy = (results["passed"] / results["total_tests"]) * 100 if results["total_tests"] > 0 else 0
        print(f"\n{'='*70}")
        print(f"[SELF-TEST] Testing Cycle Complete")
        print(f"Tests: {results['passed']}/{results['total_tests']} passed ({accuracy:.1f}% accuracy)")
        print(f"Issues Found: {len(results['issues_found'])}")
        print(f"Improvements Made: {len(results['improvements_made'])}")
        print(f"Time: {datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S')} UTC")
        print(f"{'='*70}\n")

        logger.info(f"[SELF-TEST] Cycle complete: {results['passed']}/{results['total_tests']} passed")

        return results

    async def _test_single_response(
        self,
        reasoning_engine,
        test_case: Dict[str, Any]
    ) -> Dict[str, Any]:
        try:

            result = await reasoning_engine.process_message(
                message=test_case["question"],
                user_id="self_test",
                session_id="self_test_session",
                context={},
                conversation_history=[]
            )

            response_text = result.get("answer", "")


            validation_result = self._validate_response(
                response_text,
                test_case
            )

            return {
                "passed": validation_result["passed"],
                "question": test_case["question"],
                "category": test_case["category"],
                "response_length": len(response_text),
                "response": response_text,
                "validation_details": validation_result,
                "reason": validation_result.get("failure_reason", "Passed")
            }

        except Exception as e:
            logger.error(f"Error testing response: {e}", exc_info=True)
            return {
                "passed": False,
                "question": test_case["question"],
                "category": test_case["category"],
                "reason": f"Error during testing: {str(e)}"
            }

    def _validate_response(
        self,
        response: str,
        test_case: Dict[str, Any]
    ) -> Dict[str, Any]:
        criteria = test_case.get("validation_criteria", {})
        issues = []


        if len(response) < criteria.get("min_length", 100):
            issues.append(f"Response too short: {len(response)} chars (min: {criteria.get('min_length', 100)})")


        expected_topics = test_case.get("expected_topics", [])
        response_lower = response.lower()
        missing_topics = []
        for topic in expected_topics:
            if not self._topic_present(topic, response_lower):
                missing_topics.append(topic)

        if missing_topics:
            issues.append(f"Missing topics: {', '.join(missing_topics)}")


        if criteria.get("requires_data") and not self._contains_numeric_insight(response_lower):
            issues.append("Missing data/statistics")

        if criteria.get("requires_recent_info") and not any(word in response_lower for word in ["2023", "2024", "2025", "current", "recent", "now", "today"]):
            issues.append("Missing recent/current information")

        if criteria.get("requires_explanation") and not any(word in response_lower for word in ["explain", "means", "work", "how", "because", "this means"]):
            issues.append("Missing explanation")

        if criteria.get("requires_formula") and not self._contains_formula(response_lower):
            issues.append("Missing formula/calculation")

        if criteria.get("requires_comparison") and not any(word in response_lower for word in ["compare", "versus", "vs", "difference", "similar", "better", "contrast", "relative to"]):
            issues.append("Missing comparison")


        generic_phrases = [
            "i don't have specific information",
            "i cannot provide",
            "unable to",
            "hardcoded",
            "placeholder"
        ]

        if any(phrase in response_lower for phrase in generic_phrases):
            issues.append("Contains generic/hardcoded content")


        quality_issues = []


        if "\n" not in response and len(response) > 200:
            quality_issues.append("Poor structure (no paragraphs)")


        words = response_lower.split()
        if len(words) > 0:
            unique_ratio = len(set(words)) / len(words)
            if unique_ratio < 0.25:
                quality_issues.append("Too repetitive")

        if quality_issues:
            issues.extend(quality_issues)

        return {
            "passed": len(issues) == 0,
            "issues": issues,
            "failure_reason": "; ".join(issues) if issues else None
        }

    async def _attempt_self_correction(
        self,
        test_case: Dict[str, Any],
        test_result: Dict[str, Any]
    ) -> Dict[str, Any]:
        try:
            issues = test_result.get("validation_details", {}).get("issues", [])


            knowledge_gaps = []
            for issue in issues:
                if isinstance(issue, str) and issue.lower().startswith("missing topics"):
                    missing_part = issue.split(":", 1)[1] if ":" in issue else ""
                    for gap in missing_part.split(","):
                        cleaned = gap.strip()
                        if cleaned:
                            knowledge_gaps.append(cleaned)


            if not knowledge_gaps and any(
                isinstance(issue, str) and "missing topics" in issue.lower() for issue in issues
            ):
                knowledge_gaps.extend(test_case.get("expected_topics", []))

            knowledge_gaps = list({gap for gap in knowledge_gaps if gap})


            correction_pattern = {
                "question": test_case["question"],
                "category": test_case["category"],
                "issues": issues,
                "knowledge_gaps": knowledge_gaps,
                "learned_at": datetime.utcnow().isoformat()
            }


            await self.vector_store.add(
                text=f"Question: {test_case['question']}\nRequired Knowledge: {', '.join(test_case.get('expected_topics', []))}\nCommon Issues: {', '.join(issues)}",
                metadata={
                    "type": "self_learning_correction",
                    "category": test_case["category"],
                    "issues": json.dumps(issues),
                    "learned_at": datetime.utcnow().isoformat()
                }
            )

            if knowledge_gaps:
                self.learning_stats["knowledge_gaps_identified"] += 1

                await self._trigger_gap_learning(knowledge_gaps, test_case["category"])

            return {
                "corrected": bool(knowledge_gaps),
                "knowledge_gaps": knowledge_gaps,
                "correction_pattern": correction_pattern
            }

        except Exception as e:
            logger.error(f"Error in self-correction: {e}", exc_info=True)
            return {"corrected": False, "error": str(e)}

    async def _trigger_gap_learning(
        self,
        knowledge_gaps: List[str],
        category: str
    ):
        logger.info(f"[SELF-LEARN] Triggering gap learning for: {', '.join(knowledge_gaps)}")


        learning_queries = []
        for gap in knowledge_gaps:
            if category == "market_analysis":
                learning_queries.append(f"Current real estate market trends in {gap}")
                learning_queries.append(f"{gap} real estate market analysis 2025")
                learning_queries.append(f"{gap} real estate market conditions growth")
            elif category == "investment_knowledge":
                learning_queries.append(f"Detailed explanation of {gap}")
                learning_queries.append(f"How {gap} works in real estate")
                learning_queries.append(f"{gap} benefits process real estate investing")
            elif category == "financial_knowledge":
                learning_queries.append(f"{gap} calculation formula example real estate")
                learning_queries.append(f"How to calculate {gap} real estate investment")
            elif category == "market_comparison":
                learning_queries.append(f"Compare {gap} real estate markets differences")
            else:
                learning_queries.append(f"{gap} in real estate investing")
                learning_queries.append(f"{gap} real estate")


        learned_count = 0
        for query in learning_queries[:10]:
            try:

                research_result = await self.web_scraper.comprehensive_research(
                    query,
                    max_sources=3
                )

                if not research_result:
                    continue


                has_content = (
                    research_result.get("synthesized_info") or 
                    research_result.get("key_facts") or
                    research_result.get("insights")
                )

                if not has_content:
                    continue


                understanding_result = await self.information_understanding.understand_and_reason(
                    extracted_info=research_result,
                    user_query=query,
                    context={"category": category, "gap_learning": True},
                    prior_knowledge=[]
                )


                stored = False


                synthesized = understanding_result.get("synthesized_info", "")
                if synthesized and len(synthesized.strip()) >= 50:
                    await self.vector_store.add(
                        text=synthesized,
                        metadata={
                            "type": "gap_learning",
                            "category": category,
                            "query": query,
                            "gap": gap,
                            "learned_at": datetime.utcnow().isoformat(),
                            "source": "self_learning_system"
                        }
                    )
                    stored = True
                    learned_count += 1


                takeaways = understanding_result.get("key_takeaways", [])
                for takeaway in takeaways:
                    if len(takeaway.strip()) >= 25:
                        await self.vector_store.add(
                            text=takeaway,
                            metadata={
                                "type": "gap_learning",
                                "category": category,
                                "query": query,
                                "gap": gap,
                                "subtype": "key_takeaway",
                                "learned_at": datetime.utcnow().isoformat(),
                                "source": "self_learning_system"
                            }
                        )
                        learned_count += 1


                insights = understanding_result.get("understood_insights", [])
                for insight in insights[:5]:
                    if isinstance(insight, dict):
                        insight_text = insight.get("insight", "")
                        if insight_text and len(insight_text.strip()) >= 30:
                            await self.vector_store.add(
                                text=insight_text,
                                metadata={
                                    "type": "gap_learning",
                                    "category": category,
                                    "query": query,
                                    "gap": gap,
                                    "subtype": "insight",
                                    "relevance": insight.get("relevance", 0.5),
                                    "learned_at": datetime.utcnow().isoformat(),
                                    "source": "self_learning_system"
                                }
                            )
                            learned_count += 1

                if stored:
                    self.learning_stats["improvements_made"] += 1
                    logger.info(f"[SELF-LEARN] Learned from gap query: {query[:60]}... ({learned_count} items)")


                    learning_entry = {
                        "timestamp": datetime.utcnow().isoformat(),
                        "query": query,
                        "category": category,
                        "gap": gap,
                        "items_learned": learned_count,
                        "source": "self_learning_system",
                        "learning_type": "gap_learning"
                    }
                    self._add_to_learning_history(learning_entry)

            except Exception as e:
                logger.warning(f"Gap learning query failed for {query}: {e}")

        logger.info(f"[SELF-LEARN] Gap learning complete: {learned_count} knowledge items learned for {category}")

    async def _extensive_gap_learning(
        self,
        knowledge_gaps: List[str],
        category: str
    ):
        logger.info(f"[FOCUSED TRAINING] Starting EXTENSIVE gap learning for: {', '.join(knowledge_gaps)}")


        learned_count = 0


        for gap in knowledge_gaps:

            gap_queries = []
            if category == "market_analysis":
                gap_queries.extend([
                    f"Current real estate market trends in {gap}",
                    f"{gap} real estate market analysis 2025",
                    f"{gap} real estate market conditions growth",
                    f"{gap} property prices trends 2025",
                    f"{gap} rental market conditions",
                    f"{gap} real estate investment opportunities",
                    f"{gap} housing market data statistics",
                    f"{gap} market inventory levels"
                ])
            elif category == "investment_knowledge":
                gap_queries.extend([
                    f"Detailed explanation of {gap}",
                    f"How {gap} works in real estate",
                    f"{gap} benefits process real estate investing",
                    f"{gap} step by step guide",
                    f"{gap} examples real estate",
                    f"{gap} best practices"
                ])
            elif category == "financial_knowledge":
                gap_queries.extend([
                    f"{gap} calculation formula example real estate",
                    f"How to calculate {gap} real estate investment",
                    f"{gap} formula step by step",
                    f"{gap} examples with numbers",
                    f"{gap} calculator real estate"
                ])
            else:
                gap_queries.extend([
                    f"{gap} in real estate investing",
                    f"{gap} real estate",
                    f"{gap} explained",
                    f"{gap} guide"
                ])


            for query in gap_queries[:20]:
                try:
                    research_result = await self.web_scraper.comprehensive_research(
                        query,
                        max_sources=5
                    )

                    if not research_result:
                        continue

                    has_content = (
                        research_result.get("synthesized_info") or 
                        research_result.get("key_facts") or
                        research_result.get("insights")
                    )

                    if not has_content:
                        continue

                    understanding_result = await self.information_understanding.understand_and_reason(
                        extracted_info=research_result,
                        user_query=query,
                        context={"category": category, "gap_learning": True, "focused_training": True},
                        prior_knowledge=[]
                    )

                    stored = False


                    synthesized = understanding_result.get("synthesized_info", "")
                    if self._is_valid_knowledge(synthesized, query, min_length=120):
                        await self.vector_store.add(
                            text=synthesized,
                            metadata={
                                "type": "gap_learning",
                                "category": category,
                                "query": query,
                                "gap": gap,
                                "learned_at": datetime.utcnow().isoformat(),
                                "source": "self_learning_system",
                                "focused_training": True
                            }
                        )
                        stored = True
                        learned_count += 1


                    takeaways = understanding_result.get("key_takeaways", [])
                    for takeaway in takeaways:
                        if self._is_valid_knowledge(takeaway, query, min_length=90):
                            await self.vector_store.add(
                                text=takeaway.strip(),
                                metadata={
                                    "type": "gap_learning",
                                    "category": category,
                                    "query": query,
                                    "gap": gap,
                                    "subtype": "key_takeaway",
                                    "learned_at": datetime.utcnow().isoformat(),
                                    "source": "self_learning_system",
                                    "focused_training": True
                                }
                            )
                            stored = True
                            learned_count += 1


                    insights = understanding_result.get("understood_insights", [])
                    for insight in insights[:10]:
                        if isinstance(insight, dict):
                            insight_text = insight.get("insight", "")
                            if self._is_valid_knowledge(insight_text, query, min_length=90):
                                await self.vector_store.add(
                                    text=insight_text.strip(),
                                    metadata={
                                        "type": "gap_learning",
                                        "category": category,
                                        "query": query,
                                        "gap": gap,
                                        "subtype": "insight",
                                        "relevance": insight.get("relevance", 0.5),
                                        "learned_at": datetime.utcnow().isoformat(),
                                        "source": "self_learning_system",
                                        "focused_training": True
                                    }
                                )
                                stored = True
                                learned_count += 1


                    for fact in research_result.get("key_facts", []) or []:
                        if isinstance(fact, str) and self._is_valid_knowledge(fact, query, min_length=60, require_numeric=True):
                            await self.vector_store.add(
                                text=fact.strip(),
                                metadata={
                                    "type": "gap_learning",
                                    "category": category,
                                    "query": query,
                                    "gap": gap,
                                    "subtype": "key_fact",
                                    "learned_at": datetime.utcnow().isoformat(),
                                    "source": "self_learning_system",
                                    "focused_training": True
                                }
                            )
                            stored = True
                            learned_count += 1

                    if stored:
                        self.learning_stats["improvements_made"] += 1

                except Exception as e:
                    logger.warning(f"Extensive gap learning query failed for {query}: {e}")

        logger.info(f"[FOCUSED TRAINING] Extensive gap learning complete: {learned_count} knowledge items learned")
        return learned_count

    def _get_next_focus_question(self) -> Optional[Dict[str, Any]]:
        for test_case in self.test_suite:
            question_key = test_case["question"]
            mastered = self.mastered_questions.get(question_key, {}).get("passed", False)
            if not mastered:
                return test_case
        return None

    async def _load_mastered_questions(self):
        try:
            mastered_path = self.storage_path / "mastered_questions.json"
            if mastered_path.exists():
                with open(mastered_path, 'r', encoding='utf-8') as f:
                    self.mastered_questions = json.load(f)
                logger.info(f"Loaded {len([q for q in self.mastered_questions.values() if q.get('passed')])} mastered questions")
        except Exception as e:
            logger.warning(f"Error loading mastered questions: {e}")
            self.mastered_questions = {}

    async def _save_mastered_questions(self):
        try:
            mastered_path = self.storage_path / "mastered_questions.json"
            with open(mastered_path, 'w', encoding='utf-8') as f:
                json.dump(self.mastered_questions, f, indent=2, ensure_ascii=False)
        except Exception as e:
            logger.error(f"Error saving mastered questions: {e}")

    def _add_to_learning_history(self, entry: Dict[str, Any]):
        self.learning_history.append(entry)

        if len(self.learning_history) > self.max_history_size:
            self.learning_history = self.learning_history[-self.max_history_size:]

    def get_learning_history(self, limit: int = 100, category: Optional[str] = None) -> List[Dict[str, Any]]:
        history = self.learning_history[-limit:] if limit else self.learning_history

        if category:
            history = [entry for entry in history if entry.get("category") == category]


        return list(reversed(history))

    async def run_continuous_self_learning(self, reasoning_engine, interval_minutes: int = 10):
        logger.info(f"[SELF-LEARN] Starting continuous self-learning (every {interval_minutes} minutes)")
        print(f"[SELF-LEARN] Continuous self-learning active - testing every {interval_minutes} minutes")
        if self.focused_training_enabled:
            print(f"[FOCUSED TRAINING] FOCUSED MODE ENABLED - Training one question at a time until mastery")


        await asyncio.sleep(300)

        cycle_count = 0

        while True:
            try:
                cycle_count += 1


                if self.focused_training_enabled:

                    await self.run_self_test_cycle(reasoning_engine, focused_mode=True)

                    await asyncio.sleep(5 * 60)
                else:

                    quick_mode = (cycle_count % 3 != 0)
                    await self.run_self_test_cycle(reasoning_engine, quick_mode=quick_mode)
                    await asyncio.sleep(interval_minutes * 60)

            except Exception as e:
                logger.error(f"Error in continuous self-learning: {e}", exc_info=True)

                await asyncio.sleep(60)

    async def get_learning_report(self) -> Dict[str, Any]:
        total_tests = self.learning_stats["total_tests"]
        accuracy = (self.learning_stats["passed_tests"] / total_tests * 100) if total_tests > 0 else 0


        recent_accuracy = 0
        if self.learning_stats["accuracy_trend"]:
            recent = self.learning_stats["accuracy_trend"][-10:]
            if recent:
                recent_accuracy = sum(r["accuracy"] for r in recent) / len(recent)


        mastered_count = len([q for q in self.mastered_questions.values() if q.get("passed")])
        total_questions = len(self.test_suite)
        current_focus = self.current_focus_question

        return {
            "total_tests": total_tests,
            "passed": self.learning_stats["passed_tests"],
            "failed": self.learning_stats["failed_tests"],
            "overall_accuracy": accuracy,
            "recent_accuracy": recent_accuracy,
            "self_corrections": self.learning_stats["self_corrections"],
            "knowledge_gaps_identified": self.learning_stats["knowledge_gaps_identified"],
            "improvements_made": self.learning_stats["improvements_made"],
            "last_test_time": self.learning_stats["last_test_time"],
            "accuracy_trend": self.learning_stats["accuracy_trend"][-20:],
            "test_suite_size": len(self.test_suite),
            "test_categories": list(set(t["category"] for t in self.test_suite)),
            "focused_training": {
                "enabled": self.focused_training_enabled,
                "mastered_questions": mastered_count,
                "total_questions": total_questions,
                "mastery_progress": f"{mastered_count}/{total_questions}",
                "current_focus": current_focus,
                "mastered_list": [
                    {
                        "question": q,
                        "pass_count": info.get("pass_count", 0),
                        "total_attempts": info.get("total_attempts", 0),
                        "last_passed": info.get("last_passed")
                    }
                    for q, info in self.mastered_questions.items()
                    if info.get("passed")
                ]
            }
        }

    async def get_detailed_test_results(self, limit: int = 50) -> Dict[str, Any]:

        try:
            import pickle
            results_path = self.storage_path / "test_results.pkl"
            if results_path.exists():
                with open(results_path, 'rb') as f:
                    all_results = pickle.load(f)

                return {
                    "recent_tests": all_results[-limit:],
                    "total_stored": len(all_results)
                }
        except Exception as e:
            logger.debug(f"No test results stored yet: {e}")

        return {
            "recent_tests": [],
            "total_stored": 0,
            "message": "No test results stored yet. Run a test cycle first."
        }

    async def get_latest_test_response(self, question: str) -> Optional[Dict[str, Any]]:
        try:
            import pickle
            results_path = self.storage_path / "test_results.pkl"
            if not results_path.exists():
                return None
            with open(results_path, 'rb') as f:
                all_results = pickle.load(f)
            question_lower = question.strip().lower()
            for entry in reversed(all_results):
                cycle_results = entry.get("results", {})
                for detail in cycle_results.get("test_details", []):
                    if detail.get("question", "").strip().lower() == question_lower:
                        return {
                            "timestamp": entry.get("timestamp"),
                            "question": detail.get("question"),
                            "response": detail.get("response"),
                            "response_length": detail.get("response_length"),
                            "passed": detail.get("passed"),
                            "validation_details": detail.get("validation_details"),
                            "reason": detail.get("reason"),
                            "test_cycle_summary": {
                                "total_tests": cycle_results.get("total_tests"),
                                "passed": cycle_results.get("passed"),
                                "failed": cycle_results.get("failed"),
                                "mode": cycle_results.get("mode")
                            }
                        }
        except Exception as e:
            logger.error(f"Error retrieving latest test response: {e}", exc_info=True)
        return None

    async def validate_test_criteria(self, test_case: Dict[str, Any], sample_response: str) -> Dict[str, Any]:
        validation_result = self._validate_response(sample_response, test_case)

        expected_topics = test_case.get("expected_topics", [])
        sample_lower = sample_response.lower()
        return {
            "test_question": test_case["question"],
            "category": test_case["category"],
            "expected_topics": expected_topics,
            "validation_criteria": test_case.get("validation_criteria", {}),
            "sample_response_length": len(sample_response),
            "validation_result": validation_result,
            "topics_found": [
                topic for topic in expected_topics
                if self._topic_present(topic, sample_lower)
            ],
            "topics_missing": [
                topic for topic in expected_topics
                if not self._topic_present(topic, sample_lower)
            ]
        }

    async def get_test_suite_info(self) -> Dict[str, Any]:
        categories = {}
        for test in self.test_suite:
            cat = test["category"]
            if cat not in categories:
                categories[cat] = {
                    "count": 0,
                    "questions": [],
                    "validation_criteria": []
                }
            categories[cat]["count"] += 1
            categories[cat]["questions"].append({
                "question": test["question"],
                "expected_topics": test.get("expected_topics", []),
                "criteria": test.get("validation_criteria", {})
            })

        return {
            "total_tests": len(self.test_suite),
            "categories": categories,
            "validation_criteria_examples": self._get_validation_criteria_examples()
        }

    def _get_validation_criteria_examples(self) -> Dict[str, Any]:
        criteria_found = {}
        for test in self.test_suite:
            for key, value in test.get("validation_criteria", {}).items():
                if key not in criteria_found:
                    criteria_found[key] = {
                        "description": self._get_criteria_description(key),
                        "example_value": value,
                        "used_in_tests": 0
                    }
                criteria_found[key]["used_in_tests"] += 1
        return criteria_found

    def _get_criteria_description(self, criterion: str) -> str:
        descriptions = {
            "min_length": "Minimum response length in characters",
            "requires_data": "Response must contain data/statistics",
            "requires_recent_info": "Response must contain recent/current information",
            "requires_explanation": "Response must contain explanations",
            "requires_formula": "Response must contain formulas/calculations",
            "requires_comparison": "Response must contain comparisons",
            "requires_recommendations": "Response must contain recommendations",
            "requires_reasoning": "Response must contain reasoning/analysis",
            "requires_benefits": "Response must list benefits",
            "requires_checklist": "Response must contain checklist/list",
            "requires_strategy": "Response must contain strategic advice",
            "requires_both_markets": "Response must cover both markets in comparison"
        }
        return descriptions.get(criterion, f"Unknown criterion: {criterion}")

    async def _save_to_disk(self):
        try:
            import pickle

            stats_path = self.storage_path / "learning_stats.pkl"
            with open(stats_path, 'wb') as f:
                pickle.dump(self.learning_stats, f)

        except Exception as e:
            logger.error(f"Error saving self-learning stats: {e}", exc_info=True)

    async def _save_test_results(self, results: Dict[str, Any]):
        try:
            import pickle

            results_path = self.storage_path / "test_results.pkl"
            existing_results = []
            if results_path.exists():
                with open(results_path, 'rb') as f:
                    existing_results = pickle.load(f)


            results_with_time = {
                "timestamp": datetime.utcnow().isoformat(),
                "results": results
            }
            existing_results.append(results_with_time)


            if len(existing_results) > 100:
                existing_results = existing_results[-100:]

            with open(results_path, 'wb') as f:
                pickle.dump(existing_results, f)

        except Exception as e:
            logger.error(f"Error saving test results: {e}", exc_info=True)

    async def _load_from_disk(self):
        try:
            import pickle

            stats_path = self.storage_path / "learning_stats.pkl"
            if stats_path.exists():
                with open(stats_path, 'rb') as f:
                    self.learning_stats = pickle.load(f)
                logger.info(f"[SELF-LEARN] Loaded learning stats: {self.learning_stats['total_tests']} tests")
        except Exception as e:
            logger.debug(f"No previous learning stats to load: {e}")

    def is_ready(self) -> bool:
        return self.ready

    def _topic_present(self, topic: str, response_lower: str) -> bool:
        if not topic:
            return True
        normalized = self._normalize_topic(topic)
        variants = set(self.topic_synonyms.get(normalized, set()))
        variants.add(normalized)

        for variant in variants:
            if variant and variant in response_lower:
                return True


        keyword_tokens = [token for token in re.split(r"[\s\-]+", normalized) if len(token) > 2]
        if keyword_tokens and all(token in response_lower for token in keyword_tokens):
            return True

        return False

    @staticmethod
    def _normalize_topic(topic: str) -> str:
        return topic.lower().strip()

    @staticmethod
    def _contains_numeric_insight(response_lower: str) -> bool:
        if re.search(r"\d{2,}", response_lower):
            return True
        numeric_keywords = [
            "percent",
            "%",
            "bps",
            "basis points",
            "million",
            "billion",
            "growth",
            "increase",
            "decrease",
            "trend",
            "rate",
            "price",
            "$",
            "rent",
            "yield"
        ]
        return any(keyword in response_lower for keyword in numeric_keywords)

    @staticmethod
    def _contains_formula(response_lower: str) -> bool:
        if "formula" in response_lower or "calculate" in response_lower or "calculation" in response_lower:
            return True
        if re.search(r"(roi|return)\s*=", response_lower):
            return True
        if re.search(r"\b\d+\s*/\s*\d+", response_lower):
            return True
        return False

    def _is_valid_knowledge(self, text: str, query: str, min_length: int = 80, require_numeric: bool = False) -> bool:
        if not text:
            return False
        normalized = text.strip()
        if len(normalized) < min_length:
            return False
        lower = normalized.lower()
        q = query.strip().lower()
        if q and q in lower:
            return False
        if require_numeric and not any(ch.isdigit() for ch in normalized):
            return False
        return True

