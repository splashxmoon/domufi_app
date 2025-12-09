from typing import Dict, List, Any, Optional
import asyncio
from datetime import datetime, timedelta
import random

from ai_engine.vector_store import VectorStore
from ai_engine.embedding_model import AdvancedEmbeddingModel
from ai_engine.web_scraper import IntelligentWebScraper
from ai_engine.information_understanding import InformationUnderstandingEngine
from utils.logger import setup_logger

logger = setup_logger(__name__)


class ContinuousBackgroundLearner:

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
        self.ready = False
        self.is_learning = False
        self.learning_stats = {
            "total_learning_cycles": 0,
            "total_knowledge_learned": 0,
            "last_learning_cycle": None,
            "topics_learned": [],
            "active_learning_threads": 0
        }


        self.learning_history = []
        self.max_history_size = 1000


        self.learning_interval = 300
        self.active_learning_interval = 30
        self.max_parallel_learning = 8

        # Track what we've learned to avoid duplicates (with timestamps for time-based re-learning)
        self.learned_topics = {}
        self.relearn_after_days = 2
        self.force_relearn_hours = 12
        self.variation_learning_enabled = True
        self.learning_queue = asyncio.Queue()


        from pathlib import Path
        self.storage_path = Path("memory/background_learner")
        self.storage_path.mkdir(parents=True, exist_ok=True)

    async def initialize(self):
        logger.info("Initializing continuous background learner...")


        await self._load_from_disk()

        self.ready = True


        asyncio.create_task(self._continuous_learning_loop())
        asyncio.create_task(self._active_learning_loop())
        asyncio.create_task(self._trending_topic_learner())

        logger.info(f"[OK] Continuous background learner initialized - {len(self.learned_topics)} topics loaded, learning 24/7")

    async def _continuous_learning_loop(self):
        logger.info("[CONTINUOUS] Starting continuous learning loop...")

        while True:
            try:
                if not self.is_learning:
                    await self._learn_new_data()


                await asyncio.sleep(self.learning_interval)

            except Exception as e:
                logger.error(f"Error in continuous learning loop: {e}", exc_info=True)
                await asyncio.sleep(600)

    async def _active_learning_loop(self):
        logger.info("[ACTIVE] Starting active learning loop...")

        while True:
            try:
                print(f"[ACTIVE LEARNING] Training on trending topics at {datetime.utcnow().strftime('%H:%M:%S')}")

                await self._learn_trending_topics()
                await self._learn_market_updates()
                print(f"[OK] [ACTIVE LEARNING] Completed trending topics training")

                await asyncio.sleep(self.active_learning_interval)

            except Exception as e:
                logger.error(f"Error in active learning loop: {e}", exc_info=True)
                await asyncio.sleep(300)

    async def _trending_topic_learner(self):
        logger.info("[TRENDING] Starting trending topic learner...")

        trending_queries = [
            "real estate market trends 2024",
            "fractional ownership news",
            "property investment trends",
            "real estate market updates",
            "housing market latest news",
            "investment opportunities 2024",
            "real estate market forecast",
            "property market analysis",
            "real estate investment news",
            "housing market predictions",
            "commercial real estate trends",
            "residential property market",
            "real estate technology",
            "property investment strategies",
            "real estate market data",
            "real estate financing news",
            "property management trends",
            "real estate tax updates",
            "real estate law changes",
            "real estate economics news",
            "proptech innovations",
            "real estate investment strategies",
            "market analysis real estate",
            "real estate market research",
            "property valuation trends",
            "real estate investment opportunities",
            "rental market trends",
            "real estate market cycles",
            "real estate investment risks",
            "real estate market indicators"
        ]

        while True:
            try:

                query = random.choice(trending_queries)

                print(f"[TRENDING TOPIC] Learning: {query}")

                await self._learn_from_query(query, category="trending_updates")
                print(f"[OK] [TRENDING TOPIC] Completed: {query}")


                await asyncio.sleep(120)

            except Exception as e:
                logger.debug(f"Error in trending topic learner: {e}")
                await asyncio.sleep(600)

    async def _learn_new_data(self):
        if self.is_learning:
            return

        self.is_learning = True
        self.learning_stats["total_learning_cycles"] += 1

        try:
            cycle_num = self.learning_stats['total_learning_cycles']
            logger.info(f"[TRAINING] [TRAINING STARTED] Learning cycle
            print(f"\n{'='*60}")
            print(f"[AI TRAINING] Cycle
            print(f"Time: {datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S')} UTC")
            print(f"{'='*60}\n")


            learning_topics = [

                {
                    "query": "fractional ownership real estate",
                    "category": "fractional_ownership",
                    "variations": [
                        "fractional ownership benefits",
                        "fractional ownership investment",
                        "property tokenization",
                        "fractional ownership vs traditional",
                        "REITs vs fractional ownership",
                        "fractional ownership platform",
                        "property co-ownership"
                    ]
                },

                {
                    "query": "real estate market analysis",
                    "category": "market_analysis",
                    "variations": [
                        "how to analyze real estate markets",
                        "market indicators real estate",
                        "property market trends",
                        "real estate investment analysis",
                        "housing market indicators",
                        "property valuation methods",
                        "market forecasting real estate"
                    ]
                },

                {
                    "query": "NYC real estate market",
                    "category": "market_analysis",
                    "variations": [
                        "New York City housing market",
                        "NYC property prices",
                        "Manhattan real estate",
                        "Brooklyn Queens real estate",
                        "NYC rental market",
                        "NYC property investment trends"
                    ]
                },
                {
                    "query": "Miami real estate market",
                    "category": "market_analysis",
                    "variations": [
                        "Miami housing market",
                        "Florida real estate",
                        "Miami property investment",
                        "Miami Beach real estate",
                        "Florida property market trends"
                    ]
                },
                {
                    "query": "Atlanta real estate market",
                    "category": "market_analysis",
                    "variations": [
                        "Atlanta housing market",
                        "Georgia real estate",
                        "Atlanta property investment",
                        "Atlanta rental market"
                    ]
                },
                {
                    "query": "Los Angeles real estate market",
                    "category": "market_analysis",
                    "variations": [
                        "LA housing market",
                        "California real estate",
                        "Los Angeles property prices",
                        "LA rental market"
                    ]
                },
                {
                    "query": "Chicago real estate market",
                    "category": "market_analysis",
                    "variations": [
                        "Chicago housing market",
                        "Illinois real estate",
                        "Chicago property investment"
                    ]
                },
                {
                    "query": "Dallas real estate market",
                    "category": "market_analysis",
                    "variations": [
                        "Dallas housing market",
                        "Texas real estate",
                        "Dallas property investment"
                    ]
                },

                {
                    "query": "real estate investment strategies",
                    "category": "investment_strategies",
                    "variations": [
                        "property investment strategies",
                        "real estate investment tips",
                        "investment portfolio real estate",
                        "cash flow vs appreciation",
                        "buy and hold strategy",
                        "fix and flip strategy",
                        "real estate diversification",
                        "passive income real estate"
                    ]
                },

                {
                    "query": "residential real estate investment",
                    "category": "property_types",
                    "variations": [
                        "single family homes investment",
                        "multi-family properties",
                        "condos vs houses",
                        "residential rental properties"
                    ]
                },
                {
                    "query": "commercial real estate investment",
                    "category": "property_types",
                    "variations": [
                        "office buildings investment",
                        "retail properties",
                        "commercial real estate returns",
                        "commercial property valuation"
                    ]
                },

                {
                    "query": "real estate financial analysis",
                    "category": "financial_analysis",
                    "variations": [
                        "cap rate calculation",
                        "cash on cash return",
                        "NOI calculation",
                        "real estate ROI analysis",
                        "IRR calculation real estate",
                        "GRM gross rent multiplier",
                        "debt service coverage ratio",
                        "loan to value ratio LTV"
                    ]
                },

                {
                    "query": "real estate financing",
                    "category": "real_estate_finance",
                    "variations": [
                        "mortgage loans real estate",
                        "commercial real estate loans",
                        "hard money loans",
                        "real estate private lending",
                        "seller financing",
                        "real estate crowdfunding",
                        "real estate syndication financing",
                        "bridge loans real estate",
                        "construction loans",
                        "real estate investment loans"
                    ]
                },

                {
                    "query": "property management",
                    "category": "property_management",
                    "variations": [
                        "rental property management",
                        "commercial property management",
                        "tenant screening",
                        "lease agreements",
                        "property maintenance",
                        "rent collection",
                        "eviction process",
                        "property management software",
                        "landlord responsibilities",
                        "property management fees"
                    ]
                },

                {
                    "query": "real estate law",
                    "category": "real_estate_law",
                    "variations": [
                        "real estate contracts",
                        "property rights",
                        "real estate regulations",
                        "zoning laws",
                        "landlord tenant law",
                        "real estate disclosures",
                        "title insurance",
                        "real estate closing process",
                        "real estate attorney",
                        "property easements"
                    ]
                },

                {
                    "query": "real estate tax strategies",
                    "category": "real_estate_tax",
                    "variations": [
                        "real estate depreciation",
                        "1031 exchange",
                        "real estate tax deductions",
                        "capital gains tax real estate",
                        "property tax assessment",
                        "real estate tax planning",
                        "passive income tax real estate",
                        "real estate tax benefits",
                        "cost segregation",
                        "real estate tax deferral"
                    ]
                },

                {
                    "query": "San Francisco real estate market",
                    "category": "market_analysis",
                    "variations": [
                        "SF housing market",
                        "Bay Area real estate",
                        "San Francisco property prices",
                        "Silicon Valley real estate"
                    ]
                },
                {
                    "query": "Boston real estate market",
                    "category": "market_analysis",
                    "variations": [
                        "Boston housing market",
                        "Massachusetts real estate",
                        "Boston property investment"
                    ]
                },
                {
                    "query": "Austin real estate market",
                    "category": "market_analysis",
                    "variations": [
                        "Austin housing market",
                        "Texas real estate",
                        "Austin property investment"
                    ]
                },
                {
                    "query": "Portland real estate market",
                    "category": "market_analysis",
                    "variations": [
                        "Portland housing market",
                        "Oregon real estate",
                        "Portland property investment"
                    ]
                },
                {
                    "query": "Las Vegas real estate market",
                    "category": "market_analysis",
                    "variations": [
                        "Las Vegas housing market",
                        "Nevada real estate",
                        "Vegas property investment"
                    ]
                },

                {
                    "query": "industrial real estate investment",
                    "category": "property_types",
                    "variations": [
                        "warehouse investment",
                        "distribution centers",
                        "manufacturing facilities",
                        "industrial property returns"
                    ]
                },
                {
                    "query": "land investment",
                    "category": "property_types",
                    "variations": [
                        "raw land investment",
                        "agricultural land",
                        "development land",
                        "land banking"
                    ]
                },
                {
                    "query": "multifamily real estate investment",
                    "category": "property_types",
                    "variations": [
                        "apartment buildings",
                        "duplex triplex fourplex",
                        "multifamily property management",
                        "multifamily returns"
                    ]
                },
                {
                    "query": "vacation rental investment",
                    "category": "property_types",
                    "variations": [
                        "short term rentals",
                        "Airbnb investment",
                        "vacation property management",
                        "vacation rental returns"
                    ]
                },

                {
                    "query": "real estate wholesaling",
                    "category": "investment_strategies",
                    "variations": [
                        "wholesaling houses",
                        "wholesale real estate contracts",
                        "wholesaling strategies",
                        "wholesale real estate profits"
                    ]
                },
                {
                    "query": "BRRRR method real estate",
                    "category": "investment_strategies",
                    "variations": [
                        "buy rehab rent refinance repeat",
                        "BRRRR strategy",
                        "real estate BRRRR method",
                        "BRRRR investment"
                    ]
                },
                {
                    "query": "real estate arbitrage",
                    "category": "investment_strategies",
                    "variations": [
                        "rental arbitrage",
                        "real estate market arbitrage",
                        "arbitrage opportunities",
                        "rental arbitrage strategy"
                    ]
                },
                {
                    "query": "real estate value investing",
                    "category": "investment_strategies",
                    "variations": [
                        "value add real estate",
                        "distressed property investment",
                        "fixer upper investment",
                        "value add strategies"
                    ]
                },

                {
                    "query": "real estate market research",
                    "category": "market_analysis",
                    "variations": [
                        "market research real estate",
                        "real estate data analysis",
                        "market trends analysis",
                        "real estate market reports"
                    ]
                },
                {
                    "query": "property valuation methods",
                    "category": "market_analysis",
                    "variations": [
                        "real estate appraisal",
                        "comparative market analysis",
                        "income approach valuation",
                        "cost approach valuation"
                    ]
                },
                {
                    "query": "real estate market cycles",
                    "category": "market_analysis",
                    "variations": [
                        "real estate cycle phases",
                        "market cycle analysis",
                        "real estate bubble",
                        "market cycle timing"
                    ]
                },

                {
                    "query": "proptech real estate technology",
                    "category": "real_estate_tech",
                    "variations": [
                        "real estate technology",
                        "proptech startups",
                        "real estate software",
                        "real estate automation",
                        "real estate AI",
                        "blockchain real estate"
                    ]
                },

                {
                    "query": "real estate investment risks",
                    "category": "risk_management",
                    "variations": [
                        "real estate risk management",
                        "property investment risks",
                        "real estate market risks",
                        "tenant risk management",
                        "real estate insurance",
                        "real estate due diligence"
                    ]
                },

                {
                    "query": "real estate economics",
                    "category": "real_estate_economics",
                    "variations": [
                        "real estate market economics",
                        "housing economics",
                        "real estate supply demand",
                        "real estate market forces",
                        "interest rates real estate",
                        "economic indicators real estate"
                    ]
                }
            ]


            learned_count = 0
            unlearned_topics = []
            recently_learned_topics = []


            for topic in learning_topics:
                query_key = f"{topic['category']}:{topic['query'].lower()}"
                if query_key not in self.learned_topics:
                    unlearned_topics.append(topic)
                else:
                    # Check if it's been more than 2 days (re-learn period)
                    last_learned = self.learned_topics[query_key]
                    if isinstance(last_learned, str):
                        try:
                            last_learned = datetime.fromisoformat(last_learned.replace('Z', '+00:00'))
                        except:
                            last_learned = datetime.utcnow() - timedelta(days=self.relearn_after_days + 1)
                    elif not isinstance(last_learned, datetime):
                        last_learned = datetime.utcnow() - timedelta(days=self.relearn_after_days + 1)

                    days_since = (datetime.utcnow() - last_learned.replace(tzinfo=None)).days if isinstance(last_learned, datetime) else self.relearn_after_days + 1
                    hours_since = (datetime.utcnow() - last_learned.replace(tzinfo=None)).total_seconds() / 3600 if isinstance(last_learned, datetime) else self.force_relearn_hours + 1

                    if days_since >= self.relearn_after_days or hours_since >= self.force_relearn_hours:
                        recently_learned_topics.append(topic)


            topics_to_learn = unlearned_topics + recently_learned_topics
            if not topics_to_learn:


                logger.info(f"All {len(learning_topics)} topics recently learned. Focusing on variations, expansions, and forced re-learning...")
                topics_to_learn = learning_topics
                # Don't skip main queries - force re-learn some even if recently learned
                # This ensures we're always learning something
                skip_main_queries = False

                force_relearn_count = min(5, len(learning_topics))
                topics_to_learn = sorted(learning_topics, key=lambda t: self.learned_topics.get(f"{t['category']}:{t['query'].lower()}", datetime.min))[:force_relearn_count]
                logger.info(f"Forcing re-learn of {len(topics_to_learn)} oldest topics to ensure continuous learning")
            else:
                skip_main_queries = False


            random.shuffle(topics_to_learn)

            for topic in topics_to_learn[:20]:
                try:

                    count = await self._learn_from_query(
                        topic["query"],
                        category=topic["category"],
                        is_variation=False
                    )
                    learned_count += count
                    if count > 0:
                        logger.info(f"Successfully learned {count} items from main query '{topic['query']}'")
                    else:
                        logger.debug(f"No new knowledge from main query '{topic['query']}' - will try variations")



                    if topic.get("variations") and self.variation_learning_enabled:
                        num_variations = min(random.randint(4, 6), len(topic["variations"]))
                        variations = random.sample(topic["variations"], num_variations)
                        logger.info(f"Learning {len(variations)} variations for '{topic['query']}'")
                        for variation in variations:
                            count = await self._learn_from_query(
                                variation,
                                category=topic["category"],
                                is_variation=True
                            )
                            learned_count += count
                            if count > 0:
                                logger.info(f"Successfully learned {count} items from variation '{variation}'")
                            await asyncio.sleep(0.5)


                    if self.variation_learning_enabled:

                        related_queries = self._generate_related_queries(topic["query"], topic["category"])
                        num_related = min(5, len(related_queries))
                        logger.info(f"Learning {num_related} related queries for '{topic['query']}'")
                        for related_query in related_queries[:num_related]:
                            count = await self._learn_from_query(
                                related_query,
                                category=topic["category"],
                                is_variation=True
                            )
                            learned_count += count
                            if count > 0:
                                logger.info(f"Successfully learned {count} items from related query '{related_query}'")
                            await asyncio.sleep(0.5)

                    await asyncio.sleep(1)

                except Exception as e:
                    logger.warning(f"Error learning from topic {topic['query']}: {e}")
                    continue

            self.learning_stats["total_knowledge_learned"] += learned_count
            self.learning_stats["last_learning_cycle"] = datetime.utcnow().isoformat()


            await self._save_to_disk()


            if learned_count == 0:
                logger.warning(f"[TRAINING COMPLETE] Cycle

            logger.info(f"[OK] [TRAINING COMPLETE] Learning cycle
            print(f"\n{'='*60}")
            print(f"[OK] [AI TRAINING] Cycle
            print(f"Knowledge Learned: {learned_count} items")
            print(f"Unlearned Topics: {len(unlearned_topics)}, Recently Learned: {len(recently_learned_topics)}")
            print(f"[SAVED] Saved to memory - Total knowledge: {self.learning_stats['total_knowledge_learned']} items")
            print(f"Time: {datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S')} UTC")
            print(f"{'='*60}\n")

        except Exception as e:
            logger.error(f"Error in learning cycle: {e}", exc_info=True)
        finally:
            self.is_learning = False

    async def _learn_from_query(self, query: str, category: str, is_variation: bool = False) -> int:
        try:
            # Check if we've already learned this (time-based duplicate detection)
            query_key = f"{category}:{query.lower()}"
            now = datetime.utcnow()


            relearn_period = 0.25 if is_variation else self.relearn_after_days

            # Check if we've learned this recently (within re-learn period)
            if query_key in self.learned_topics:
                last_learned = self.learned_topics[query_key]
                if isinstance(last_learned, str):

                    try:
                        last_learned = datetime.fromisoformat(last_learned.replace('Z', '+00:00'))
                    except:
                        # If parsing fails, assume it's old and allow re-learning
                        last_learned = datetime.utcnow() - timedelta(days=self.relearn_after_days + 1)
                elif isinstance(last_learned, datetime):
                    pass
                else:

                    last_learned = datetime.utcnow() - timedelta(days=self.relearn_after_days + 1)


                if isinstance(last_learned, datetime):
                    time_diff = now - last_learned.replace(tzinfo=None)
                    days_since = time_diff.days
                    hours_since = time_diff.total_seconds() / 3600
                else:
                    days_since = relearn_period + 1
                    hours_since = (relearn_period + 1) * 24


                if is_variation:
                    time_since = hours_since
                    time_threshold = relearn_period * 24
                    time_unit = "hours"
                else:
                    time_since = days_since
                    time_threshold = relearn_period
                    time_unit = "days"


                if time_since < time_threshold:
                    logger.debug(f"Skipping '{query}' ({'variation' if is_variation else 'main'}) - learned {time_since:.1f} {time_unit} ago (re-learn after {time_threshold} {time_unit})")
                    return 0
                else:
                    logger.info(f"Re-learning '{query}' ({'variation' if is_variation else 'main'}) - last learned {time_since:.1f} {time_unit} ago (allowing re-learn)")


            research_result = await self.web_scraper.comprehensive_research(
                query,
                max_sources=3
            )

            if not research_result:
                logger.warning(f"Web scraper returned no results for '{query}'")
                return 0


            if not research_result.get("synthesized_info") and not research_result.get("key_facts"):
                logger.warning(f"No synthesized_info or key_facts for '{query}'")
                return 0


            understanding_result = await self.information_understanding.understand_and_reason(
                extracted_info=research_result,
                user_query=query,
                context={},
                prior_knowledge=[]
            )


            if not understanding_result.get("synthesized_info") and not understanding_result.get("understood_insights") and not understanding_result.get("key_takeaways"):

                raw_content = research_result.get("synthesized_info", "") or ""
                if raw_content and len(raw_content.strip()) >= 50:

                    logger.info(f"Storing raw web content as fallback for '{query}' ({len(raw_content)} chars)")
                    await self.vector_store.add(
                        text=raw_content[:500],
                        metadata={
                            "type": "continuous_learning",
                            "query": query,
                            "category": category,
                            "source": "background_learner",
                            "subtype": "raw_content_fallback",
                            "learned_at": datetime.utcnow().isoformat(),
                            "confidence": 0.3
                        }
                    )
                    self.learned_topics[query_key] = now
                    return 1

                logger.warning(f"No usable content from understanding engine for '{query}' - web scraper returned: {len(research_result.get('synthesized_info', '') or '')} chars, {len(research_result.get('key_facts', []) or [])} facts")
                return 0


            count = await self._store_learned_knowledge(
                query=query,
                understood_info=understanding_result,
                category=category
            )


            if count > 0:
                self.learned_topics[query_key] = now
                logger.info(f"Learned {count} items from '{query}' (category: {category})")


                learning_entry = {
                    "timestamp": now.isoformat(),
                    "query": query,
                    "category": category,
                    "items_learned": count,
                    "source": "continuous_background_learner"
                }
                self._add_to_learning_history(learning_entry)
            else:
                logger.warning(f"No knowledge stored from '{query}' - content may have been filtered out")

            return count

        except Exception as e:
            logger.debug(f"Error learning from query '{query}': {e}")
            return 0

    async def _store_learned_knowledge(
        self,
        query: str,
        understood_info: Dict[str, Any],
        category: str
    ) -> int:
        count = 0
        stored_items = []

        try:

            synthesized = understood_info.get("synthesized_info", "")
            if synthesized and len(synthesized.strip()) >= 50:
                await self.vector_store.add(
                    text=synthesized,
                    metadata={
                        "type": "continuous_learning",
                        "query": query,
                        "category": category,
                        "source": "background_learner",
                        "learned_at": datetime.utcnow().isoformat(),
                        "confidence": understood_info.get("confidence", 0.5)
                    }
                )
                count += 1
                stored_items.append(f"synthesized_info ({len(synthesized)} chars)")
            elif synthesized and len(synthesized.strip()) > 0:
                logger.debug(f"Synthesized info too short ({len(synthesized.strip())} chars) - threshold: 50")


            takeaways = understood_info.get("key_takeaways", [])
            for takeaway in takeaways:
                if len(takeaway.strip()) >= 25:
                    await self.vector_store.add(
                        text=takeaway,
                        metadata={
                            "type": "continuous_learning",
                            "query": query,
                            "category": category,
                            "subtype": "key_takeaway",
                            "source": "background_learner",
                            "learned_at": datetime.utcnow().isoformat()
                        }
                    )
                    count += 1
                    stored_items.append(f"takeaway ({len(takeaway)} chars)")
            if takeaways:
                filtered = [t for t in takeaways if len(t.strip()) < 25]
                if filtered:
                    logger.debug(f"Filtered {len(filtered)} takeaways (below 25 char threshold)")


            insights = understood_info.get("understood_insights", [])
            for insight in insights[:5]:
                text = insight.get("text", "")
                if text and len(text.strip()) >= 30:
                    await self.vector_store.add(
                        text=text,
                        metadata={
                            "type": "continuous_learning",
                            "query": query,
                            "category": category,
                            "subtype": "insight",
                            "relevance": insight.get("relevance", 0),
                            "source": "background_learner",
                            "learned_at": datetime.utcnow().isoformat()
                        }
                    )
                    count += 1
                    stored_items.append(f"insight ({len(text)} chars, relevance: {insight.get('relevance', 0):.2f})")

            if insights:
                filtered = [i for i in insights if not i.get("text") or len(i.get("text", "").strip()) < 30]
                if filtered:
                    logger.debug(f"Filtered {len(filtered)} insights (below 30 char threshold)")


            if count > 0:
                logger.info(f"Stored {count} knowledge items from '{query}': {', '.join(stored_items)}")
            else:
                logger.warning(f"No knowledge stored from '{query}' - all content filtered out")

                if synthesized and len(synthesized.strip()) >= 30:

                    await self.vector_store.add(
                        text=synthesized[:200],
                        metadata={
                            "type": "continuous_learning",
                            "query": query,
                            "category": category,
                            "source": "background_learner",
                            "subtype": "partial_synthesis",
                            "learned_at": datetime.utcnow().isoformat(),
                            "confidence": understood_info.get("confidence", 0.3)
                        }
                    )
                    count += 1
                    logger.info(f"Stored partial synthesis ({len(synthesized)} chars) as fallback")

        except Exception as e:
            logger.warning(f"Error storing learned knowledge: {e}", exc_info=True)

        return count

    def _generate_related_queries(self, query: str, category: str) -> List[str]:
        related = []
        query_lower = query.lower()


        if "2024" not in query_lower and "2025" not in query_lower:
            related.append(f"{query} 2024")
            related.append(f"{query} 2025")


        if "latest" not in query_lower and "trend" not in query_lower:
            related.append(f"{query} latest")
            related.append(f"{query} trends")


        if "how" not in query_lower and "guide" not in query_lower:
            related.append(f"how {query} works")
            related.append(f"{query} guide")


        if category == "market_analysis" and "market" in query_lower:
            locations = ["NYC", "Miami", "Atlanta", "Chicago", "Los Angeles", "Seattle", "Boston", "Austin"]
            for loc in random.sample(locations, 2):
                related.append(f"{loc} {query}")

        return related[:5]

    async def _learn_trending_topics(self):
        trending_queries = [
            "real estate market news today",
            "property investment opportunities",
            "housing market trends",
            "fractional ownership latest",
            "real estate market updates"
        ]

        query = random.choice(trending_queries)
        await self._learn_from_query(query, category="trending_updates")

    async def _learn_market_updates(self):
        markets = ["NYC", "Miami", "Atlanta", "Chicago", "Los Angeles", "Seattle"]
        market = random.choice(markets)

        queries = [
            f"{market} real estate market update",
            f"{market} housing market latest",
            f"{market} property market trends"
        ]

        query = random.choice(queries)
        await self._learn_from_query(query, category="market_analysis")

    async def learn_from_interaction(
        self,
        user_query: str,
        intent: str,
        entities: Dict[str, Any],
        response: str,
        confidence: float
    ):
        if confidence > 0.7:

            await self.learning_queue.put({
                "type": "interaction",
                "user_query": user_query,
                "intent": intent,
                "entities": entities,
                "response": response,
                "confidence": confidence,
                "timestamp": datetime.utcnow().isoformat()
            })


            asyncio.create_task(self._learn_from_interaction_async(user_query, intent, entities))

    async def _learn_from_interaction_async(
        self,
        user_query: str,
        intent: str,
        entities: Dict[str, Any]
    ):
        try:

            if intent == "market_analysis" and entities.get("location"):
                location = entities.get("location")

                await self._learn_from_query(
                    f"{location} real estate market",
                    category="market_analysis"
                )
            elif intent == "explanation" and entities.get("topic"):
                topic = entities.get("topic")

                await self._learn_from_query(
                    f"{topic} explanation",
                    category="platform_help"
                )
            elif intent == "investment_advice":

                await self._learn_from_query(
                    "real estate investment advice",
                    category="investment_strategies"
                )
        except Exception as e:
            logger.debug(f"Error learning from interaction: {e}")

    def get_learning_stats(self) -> Dict[str, Any]:
        return {
            **self.learning_stats,
            "is_learning": self.is_learning,
            "learned_topics_count": len(self.learned_topics),
            "relearn_after_days": self.relearn_after_days,
            "queue_size": self.learning_queue.qsize()
        }

    def is_ready(self) -> bool:
        return self.ready

    async def _save_to_disk(self):
        try:
            import pickle


            topics_path = self.storage_path / "learned_topics.pkl"
            with open(topics_path, 'wb') as f:

                topics_to_save = {}
                for key, value in self.learned_topics.items():
                    if isinstance(value, datetime):
                        topics_to_save[key] = value.isoformat()
                    else:
                        topics_to_save[key] = value
                pickle.dump(topics_to_save, f)


            stats_path = self.storage_path / "learning_stats.pkl"
            with open(stats_path, 'wb') as f:
                pickle.dump(self.learning_stats, f)

            logger.debug(f"Saved learning progress: {len(self.learned_topics)} topics, {self.learning_stats['total_knowledge_learned']} knowledge items")
        except Exception as e:
            logger.error(f"Error saving background learner data: {e}", exc_info=True)

    async def _load_from_disk(self):
        try:
            import pickle


            topics_path = self.storage_path / "learned_topics.pkl"
            if topics_path.exists():
                with open(topics_path, 'rb') as f:
                    loaded_data = pickle.load(f)

                    if isinstance(loaded_data, set):

                        self.learned_topics = {key: datetime.utcnow() - timedelta(days=self.relearn_after_days + 1) for key in loaded_data}
                        logger.info(f"Migrated {len(self.learned_topics)} learned topics from old format (set) to new format (dict)")
                    elif isinstance(loaded_data, list):

                        self.learned_topics = {key: datetime.utcnow() - timedelta(days=self.relearn_after_days + 1) for key in loaded_data}
                        logger.info(f"Migrated {len(self.learned_topics)} learned topics from old format (list) to new format (dict)")
                    else:

                        self.learned_topics = loaded_data

                        for key, value in self.learned_topics.items():
                            if isinstance(value, str):
                                try:
                                    self.learned_topics[key] = datetime.fromisoformat(value.replace('Z', '+00:00'))
                                except:

                                    self.learned_topics[key] = datetime.utcnow() - timedelta(days=self.relearn_after_days + 1)
                logger.info(f"Loaded {len(self.learned_topics)} learned topics from disk")


            stats_path = self.storage_path / "learning_stats.pkl"
            if stats_path.exists():
                with open(stats_path, 'rb') as f:
                    loaded_stats = pickle.load(f)

                    for key, value in loaded_stats.items():
                        if isinstance(value, (int, float)) and key in self.learning_stats:
                            self.learning_stats[key] = max(self.learning_stats[key], value)
                        elif key not in self.learning_stats:
                            self.learning_stats[key] = value
                logger.info("Loaded learning stats from disk")
        except Exception as e:
            logger.warning(f"Error loading background learner data: {e}, starting fresh")
            self.learned_topics = {}

    def _add_to_learning_history(self, entry: Dict[str, Any]):
        self.learning_history.append(entry)

        if len(self.learning_history) > self.max_history_size:
            self.learning_history = self.learning_history[-self.max_history_size:]

    def get_learning_history(self, limit: int = 100, category: Optional[str] = None) -> List[Dict[str, Any]]:
        history = self.learning_history[-limit:] if limit else self.learning_history

        if category:
            history = [entry for entry in history if entry.get("category") == category]


        return list(reversed(history))

