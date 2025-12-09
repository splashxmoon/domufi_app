from typing import Dict, List, Any, Optional
import asyncio
from datetime import datetime
import re

from ai_engine.vector_store import VectorStore
from ai_engine.embedding_model import AdvancedEmbeddingModel
from ai_engine.web_scraper import IntelligentWebScraper
from ai_engine.information_understanding import InformationUnderstandingEngine
from utils.logger import setup_logger

logger = setup_logger(__name__)


class OnlinePretrainer:

    def __init__(
        self,
        vector_store: VectorStore,
        embedding_model: AdvancedEmbeddingModel,
        information_understanding: InformationUnderstandingEngine
    ):
        self.vector_store = vector_store
        self.embedding_model = embedding_model
        self.information_understanding = information_understanding
        self.web_scraper = None
        self.ready = False
        self.training_stats = {
            "total_sources_scraped": 0,
            "total_knowledge_items": 0,
            "topics_covered": [],
            "last_training": None
        }

    async def initialize(self):
        logger.info("Initializing online pretrainer...")
        try:
            self.web_scraper = IntelligentWebScraper()
            await self.web_scraper.initialize()
            self.ready = True
            logger.info("[OK] Online pretrainer initialized")
        except Exception as e:
            logger.error(f"Error initializing pretrainer: {e}", exc_info=True)
            raise

    async def pretrain_comprehensive(self):
        logger.info("[START] Starting comprehensive pretraining from online sources...")
        print(f"\n{'='*60}")
        print(f"[START] [COMPREHENSIVE PRETRAINING] Starting...")
        print(f"Time: {datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S')} UTC")
        print(f"{'='*60}\n")

        training_topics = [

            {
                "topic": "fractional real estate ownership",
                "queries": [
                    "what is fractional ownership real estate",
                    "how does fractional ownership work",
                    "fractional ownership benefits and risks",
                    "fractional ownership vs traditional real estate",
                    "fractional ownership investment strategies",
                    "fractional ownership use cases",
                    "real estate tokenization",
                    "property shares investment",
                    "fractional ownership legal structure",
                    "fractional ownership tax implications",
                    "fractional ownership exit strategies",
                    "fractional ownership property management",
                    "tokenized real estate assets",
                    "blockchain real estate ownership",
                    "fractional ownership ROI calculation",
                    "fractional ownership vs REITs",
                    "fractional ownership minimum investment",
                    "fractional ownership liquidity"
                ],
                "category": "fractional_ownership"
            },

            {
                "topic": "real estate market analysis",
                "queries": [
                    "how to analyze real estate markets",
                    "real estate market indicators",
                    "property market trends 2024",
                    "real estate investment analysis",
                    "housing market indicators",
                    "rental yield analysis",
                    "property appreciation factors",
                    "cap rate analysis real estate",
                    "NOI calculation real estate",
                    "comparable sales analysis",
                    "market cycle analysis real estate",
                    "supply and demand real estate",
                    "vacancy rate analysis",
                    "absorption rate real estate",
                    "price per square foot analysis",
                    "days on market analysis",
                    "market saturation analysis",
                    "real estate market forecasting"
                ],
                "category": "market_analysis"
            },

            {
                "topic": "real estate investment strategies",
                "queries": [
                    "real estate investment strategies for beginners",
                    "real estate investment best practices",
                    "property investment analysis",
                    "real estate portfolio diversification",
                    "cash flow vs appreciation real estate",
                    "real estate investment risks",
                    "property investment ROI calculation",
                    "buy and hold real estate strategy",
                    "house flipping strategy",
                    "BRRRR method real estate",
                    "real estate wholesaling",
                    "real estate syndication",
                    "value add real estate strategy",
                    "turnkey real estate investment",
                    "real estate tax strategies",
                    "1031 exchange real estate",
                    "real estate leverage strategies",
                    "real estate investment due diligence",
                    "real estate investment exit strategies",
                    "real estate portfolio optimization",
                    "risk management real estate",
                    "real estate investment timing"
                ],
                "category": "investment_strategies"
            },

            {
                "topic": "NYC real estate market",
                "queries": [
                    "NYC real estate market analysis 2024",
                    "New York City housing prices trends",
                    "NYC rental market conditions",
                    "NYC real estate investment opportunities",
                    "Manhattan Brooklyn Queens real estate",
                    "NYC property market forecast",
                    "New York real estate market indicators",
                    "NYC luxury real estate market",
                    "NYC affordable housing market",
                    "NYC commercial real estate",
                    "NYC real estate trends 2024"
                ],
                "category": "market_analysis"
            },
            {
                "topic": "Miami real estate market",
                "queries": [
                    "Miami real estate market 2024",
                    "Miami housing prices trends",
                    "Miami rental market conditions",
                    "Miami investment opportunities",
                    "Florida real estate market",
                    "Miami Beach real estate",
                    "Miami commercial real estate",
                    "Miami luxury real estate"
                ],
                "category": "market_analysis"
            },
            {
                "topic": "Atlanta real estate market",
                "queries": [
                    "Atlanta real estate market 2024",
                    "Atlanta housing market trends",
                    "Atlanta rental yields",
                    "Atlanta investment opportunities",
                    "Georgia real estate market",
                    "Atlanta commercial real estate"
                ],
                "category": "market_analysis"
            },
            {
                "topic": "Chicago real estate market",
                "queries": [
                    "Chicago real estate market 2024",
                    "Chicago housing prices",
                    "Chicago rental market",
                    "Chicago investment opportunities",
                    "Illinois real estate market"
                ],
                "category": "market_analysis"
            },
            {
                "topic": "Los Angeles real estate market",
                "queries": [
                    "LA real estate market 2024",
                    "Los Angeles housing prices",
                    "LA rental market",
                    "Los Angeles investment opportunities",
                    "California real estate market",
                    "LA luxury real estate"
                ],
                "category": "market_analysis"
            },
            {
                "topic": "Seattle real estate market",
                "queries": [
                    "Seattle real estate market 2024",
                    "Seattle housing prices",
                    "Seattle rental market",
                    "Seattle investment opportunities",
                    "Washington real estate market"
                ],
                "category": "market_analysis"
            },
            {
                "topic": "Dallas real estate market",
                "queries": [
                    "Dallas real estate market 2024",
                    "Dallas housing prices",
                    "Dallas rental market",
                    "Dallas investment opportunities",
                    "Texas real estate market"
                ],
                "category": "market_analysis"
            },
            {
                "topic": "Houston real estate market",
                "queries": [
                    "Houston real estate market 2024",
                    "Houston housing prices",
                    "Houston rental market",
                    "Houston investment opportunities"
                ],
                "category": "market_analysis"
            },
            {
                "topic": "Phoenix real estate market",
                "queries": [
                    "Phoenix real estate market 2024",
                    "Phoenix housing prices",
                    "Phoenix rental market",
                    "Phoenix investment opportunities",
                    "Arizona real estate market"
                ],
                "category": "market_analysis"
            },
            {
                "topic": "Denver real estate market",
                "queries": [
                    "Denver real estate market 2024",
                    "Denver housing prices",
                    "Denver rental market",
                    "Denver investment opportunities",
                    "Colorado real estate market"
                ],
                "category": "market_analysis"
            },
            {
                "topic": "Boston real estate market",
                "queries": [
                    "Boston real estate market 2024",
                    "Boston housing prices",
                    "Boston rental market",
                    "Boston investment opportunities",
                    "Massachusetts real estate market"
                ],
                "category": "market_analysis"
            },
            {
                "topic": "San Francisco real estate market",
                "queries": [
                    "San Francisco real estate market 2024",
                    "SF housing prices",
                    "San Francisco rental market",
                    "SF investment opportunities",
                    "Bay Area real estate market"
                ],
                "category": "market_analysis"
            },
            {
                "topic": "Austin real estate market",
                "queries": [
                    "Austin real estate market 2024",
                    "Austin housing prices",
                    "Austin rental market",
                    "Austin investment opportunities"
                ],
                "category": "market_analysis"
            },
            {
                "topic": "Nashville real estate market",
                "queries": [
                    "Nashville real estate market 2024",
                    "Nashville housing prices",
                    "Nashville rental market",
                    "Nashville investment opportunities",
                    "Tennessee real estate market"
                ],
                "category": "market_analysis"
            },
            {
                "topic": "Portland real estate market",
                "queries": [
                    "Portland real estate market 2024",
                    "Portland housing prices",
                    "Portland rental market",
                    "Portland investment opportunities",
                    "Oregon real estate market"
                ],
                "category": "market_analysis"
            },
            {
                "topic": "Las Vegas real estate market",
                "queries": [
                    "Las Vegas real estate market 2024",
                    "Vegas housing prices",
                    "Las Vegas rental market",
                    "Vegas investment opportunities",
                    "Nevada real estate market"
                ],
                "category": "market_analysis"
            },
            {
                "topic": "Charlotte real estate market",
                "queries": [
                    "Charlotte real estate market 2024",
                    "Charlotte housing prices",
                    "Charlotte rental market",
                    "Charlotte investment opportunities",
                    "North Carolina real estate market"
                ],
                "category": "market_analysis"
            },
            {
                "topic": "Raleigh real estate market",
                "queries": [
                    "Raleigh real estate market 2024",
                    "Raleigh housing prices",
                    "Raleigh rental market",
                    "Raleigh investment opportunities"
                ],
                "category": "market_analysis"
            },
            {
                "topic": "Tampa real estate market",
                "queries": [
                    "Tampa real estate market 2024",
                    "Tampa housing prices",
                    "Tampa rental market",
                    "Tampa investment opportunities",
                    "Florida real estate market"
                ],
                "category": "market_analysis"
            },
            {
                "topic": "Orlando real estate market",
                "queries": [
                    "Orlando real estate market 2024",
                    "Orlando housing prices",
                    "Orlando rental market",
                    "Orlando investment opportunities"
                ],
                "category": "market_analysis"
            },
            {
                "topic": "San Diego real estate market",
                "queries": [
                    "San Diego real estate market 2024",
                    "San Diego housing prices",
                    "San Diego rental market",
                    "San Diego investment opportunities"
                ],
                "category": "market_analysis"
            },
            {
                "topic": "Philadelphia real estate market",
                "queries": [
                    "Philadelphia real estate market 2024",
                    "Philly housing prices",
                    "Philadelphia rental market",
                    "Philadelphia investment opportunities",
                    "Pennsylvania real estate market"
                ],
                "category": "market_analysis"
            },
            {
                "topic": "Detroit real estate market",
                "queries": [
                    "Detroit real estate market 2024",
                    "Detroit housing prices",
                    "Detroit rental market",
                    "Detroit investment opportunities",
                    "Michigan real estate market"
                ],
                "category": "market_analysis"
            },
            {
                "topic": "Minneapolis real estate market",
                "queries": [
                    "Minneapolis real estate market 2024",
                    "Minneapolis housing prices",
                    "Minneapolis rental market",
                    "Minneapolis investment opportunities",
                    "Minnesota real estate market"
                ],
                "category": "market_analysis"
            },
            {
                "topic": "Indianapolis real estate market",
                "queries": [
                    "Indianapolis real estate market 2024",
                    "Indianapolis housing prices",
                    "Indianapolis rental market",
                    "Indianapolis investment opportunities",
                    "Indiana real estate market"
                ],
                "category": "market_analysis"
            },
            {
                "topic": "Columbus real estate market",
                "queries": [
                    "Columbus real estate market 2024",
                    "Columbus housing prices",
                    "Columbus rental market",
                    "Columbus investment opportunities",
                    "Ohio real estate market"
                ],
                "category": "market_analysis"
            },
            {
                "topic": "San Antonio real estate market",
                "queries": [
                    "San Antonio real estate market 2024",
                    "San Antonio housing prices",
                    "San Antonio rental market",
                    "San Antonio investment opportunities"
                ],
                "category": "market_analysis"
            },
            {
                "topic": "Fort Worth real estate market",
                "queries": [
                    "Fort Worth real estate market 2024",
                    "Fort Worth housing prices",
                    "Fort Worth rental market",
                    "Fort Worth investment opportunities"
                ],
                "category": "market_analysis"
            },
            {
                "topic": "Jacksonville real estate market",
                "queries": [
                    "Jacksonville real estate market 2024",
                    "Jacksonville housing prices",
                    "Jacksonville rental market",
                    "Jacksonville investment opportunities"
                ],
                "category": "market_analysis"
            },
            {
                "topic": "major US real estate markets",
                "queries": [
                    "best real estate markets 2024",
                    "top cities for real estate investment",
                    "affordable real estate markets",
                    "high growth real estate markets",
                    "real estate markets by city",
                    "property investment markets comparison",
                    "emerging real estate markets",
                    "best rental markets 2024",
                    "best appreciation markets",
                    "best cash flow markets"
                ],
                "category": "market_analysis"
            },

            {
                "topic": "residential real estate investment",
                "queries": [
                    "single family home investment",
                    "multi family property investment",
                    "condo investment strategies",
                    "townhouse investment",
                    "residential rental properties",
                    "house hacking strategy",
                    "residential property management",
                    "residential real estate ROI"
                ],
                "category": "property_types"
            },
            {
                "topic": "commercial real estate investment",
                "queries": [
                    "commercial real estate investment",
                    "office building investment",
                    "retail property investment",
                    "industrial real estate",
                    "warehouse investment",
                    "commercial property analysis",
                    "commercial real estate cap rates",
                    "commercial property management"
                ],
                "category": "property_types"
            },
            {
                "topic": "vacation rental investment",
                "queries": [
                    "vacation rental investment strategy",
                    "Airbnb investment properties",
                    "short term rental market",
                    "vacation rental ROI",
                    "vacation property management",
                    "short term rental regulations",
                    "vacation rental market analysis"
                ],
                "category": "property_types"
            },

            {
                "topic": "real estate financial analysis",
                "queries": [
                    "real estate ROI calculation",
                    "cap rate calculation",
                    "cash on cash return",
                    "NOI calculation",
                    "DSCR calculation real estate",
                    "real estate IRR calculation",
                    "property valuation methods",
                    "real estate pro forma analysis",
                    "real estate financial modeling",
                    "break even analysis real estate"
                ],
                "category": "financial_analysis"
            },

            {
                "topic": "real estate risk management",
                "queries": [
                    "real estate investment risks",
                    "property investment risk assessment",
                    "real estate market risk",
                    "real estate insurance",
                    "real estate due diligence",
                    "property investment pitfalls",
                    "real estate market cycles",
                    "real estate recession strategies"
                ],
                "category": "risk_management"
            },

            {
                "topic": "real estate financing",
                "queries": [
                    "mortgage loans for real estate investment",
                    "commercial real estate loans",
                    "hard money loans real estate",
                    "private money lending real estate",
                    "seller financing real estate",
                    "real estate crowdfunding",
                    "real estate syndication financing",
                    "bridge loans real estate",
                    "construction loans",
                    "real estate investment loans",
                    "DSCR loans",
                    "portfolio loans real estate",
                    "real estate financing strategies",
                    "real estate leverage",
                    "real estate loan terms",
                    "real estate financing options"
                ],
                "category": "real_estate_finance"
            },

            {
                "topic": "property management",
                "queries": [
                    "rental property management",
                    "commercial property management",
                    "tenant screening process",
                    "lease agreements real estate",
                    "property maintenance management",
                    "rent collection strategies",
                    "eviction process landlord",
                    "property management software",
                    "landlord responsibilities",
                    "property management fees",
                    "tenant relations",
                    "property inspections",
                    "property management best practices",
                    "self management vs professional management",
                    "property management companies"
                ],
                "category": "property_management"
            },

            {
                "topic": "real estate law",
                "queries": [
                    "real estate contracts",
                    "property rights law",
                    "real estate regulations",
                    "zoning laws real estate",
                    "landlord tenant law",
                    "real estate disclosures",
                    "title insurance",
                    "real estate closing process",
                    "real estate attorney",
                    "property easements",
                    "real estate litigation",
                    "real estate compliance",
                    "fair housing laws",
                    "real estate licensing",
                    "real estate legal structures"
                ],
                "category": "real_estate_law"
            },

            {
                "topic": "real estate tax strategies",
                "queries": [
                    "real estate depreciation",
                    "1031 exchange real estate",
                    "real estate tax deductions",
                    "capital gains tax real estate",
                    "property tax assessment",
                    "real estate tax planning",
                    "passive income tax real estate",
                    "real estate tax benefits",
                    "cost segregation real estate",
                    "real estate tax deferral",
                    "real estate tax shelters",
                    "real estate tax credits",
                    "real estate tax strategies",
                    "real estate tax implications",
                    "real estate tax optimization"
                ],
                "category": "real_estate_tax"
            },

            {
                "topic": "advanced real estate investment strategies",
                "queries": [
                    "real estate wholesaling",
                    "BRRRR method real estate",
                    "real estate arbitrage",
                    "real estate value investing",
                    "real estate flipping",
                    "real estate buy and hold",
                    "real estate development",
                    "real estate syndication",
                    "real estate partnerships",
                    "real estate joint ventures",
                    "real estate options",
                    "real estate lease options",
                    "real estate seller financing",
                    "real estate creative financing",
                    "real estate investment strategies"
                ],
                "category": "investment_strategies"
            },

            {
                "topic": "real estate economics",
                "queries": [
                    "real estate market economics",
                    "housing economics",
                    "real estate supply and demand",
                    "real estate market forces",
                    "interest rates real estate impact",
                    "economic indicators real estate",
                    "real estate market cycles",
                    "real estate bubble",
                    "real estate market trends",
                    "real estate market forecasting",
                    "real estate macroeconomics",
                    "real estate microeconomics",
                    "real estate market dynamics"
                ],
                "category": "real_estate_economics"
            },

            {
                "topic": "real estate technology proptech",
                "queries": [
                    "proptech real estate technology",
                    "real estate technology trends",
                    "real estate software",
                    "real estate automation",
                    "real estate AI artificial intelligence",
                    "blockchain real estate",
                    "real estate data analytics",
                    "real estate marketplaces",
                    "real estate investment platforms",
                    "real estate technology startups",
                    "real estate fintech",
                    "virtual reality real estate",
                    "real estate technology innovation"
                ],
                "category": "real_estate_tech"
            },

            {
                "topic": "industrial real estate investment",
                "queries": [
                    "industrial real estate investment",
                    "warehouse investment",
                    "distribution centers investment",
                    "manufacturing facilities",
                    "industrial property returns",
                    "industrial real estate market",
                    "industrial property management"
                ],
                "category": "property_types"
            },
            {
                "topic": "land investment",
                "queries": [
                    "land investment strategies",
                    "raw land investment",
                    "agricultural land investment",
                    "development land",
                    "land banking",
                    "land investment returns",
                    "land investment risks"
                ],
                "category": "property_types"
            },
            {
                "topic": "multifamily real estate investment",
                "queries": [
                    "multifamily real estate investment",
                    "apartment building investment",
                    "duplex triplex fourplex investment",
                    "multifamily property management",
                    "multifamily returns",
                    "multifamily real estate market",
                    "multifamily investment strategies"
                ],
                "category": "property_types"
            },

            {
                "topic": "San Diego real estate market",
                "queries": [
                    "San Diego real estate market 2024",
                    "San Diego housing prices",
                    "San Diego rental market",
                    "San Diego investment opportunities",
                    "California real estate market"
                ],
                "category": "market_analysis"
            },
            {
                "topic": "Philadelphia real estate market",
                "queries": [
                    "Philadelphia real estate market 2024",
                    "Philadelphia housing prices",
                    "Philadelphia rental market",
                    "Philadelphia investment opportunities",
                    "Pennsylvania real estate market"
                ],
                "category": "market_analysis"
            },
            {
                "topic": "Detroit real estate market",
                "queries": [
                    "Detroit real estate market 2024",
                    "Detroit housing prices",
                    "Detroit rental market",
                    "Detroit investment opportunities",
                    "Michigan real estate market"
                ],
                "category": "market_analysis"
            },
            {
                "topic": "Minneapolis real estate market",
                "queries": [
                    "Minneapolis real estate market 2024",
                    "Minneapolis housing prices",
                    "Minneapolis rental market",
                    "Minneapolis investment opportunities",
                    "Minnesota real estate market"
                ],
                "category": "market_analysis"
            },
            {
                "topic": "Sacramento real estate market",
                "queries": [
                    "Sacramento real estate market 2024",
                    "Sacramento housing prices",
                    "Sacramento rental market",
                    "Sacramento investment opportunities",
                    "California real estate market"
                ],
                "category": "market_analysis"
            },

            {
                "topic": "Domufi platform features",
                "queries": [
                    "fractional ownership platform features",
                    "real estate investment platform",
                    "property tokenization platform",
                    "fractional ownership marketplace",
                    "real estate investment apps",
                    "fractional ownership technology",
                    "real estate crowdfunding platform",
                    "property investment platform",
                    "tokenized real estate platform"
                ],
                "category": "platform_features"
            }
        ]

        total_learned = 0

        for topic_group in training_topics:
            logger.info(f"[TRAINING] Pretraining on: {topic_group['topic']}")
            print(f"[TRAINING] [PRETRAINING] Topic: {topic_group['topic']}")

            for query in topic_group["queries"]:
                try:

                    research_result = await self.web_scraper.comprehensive_research(
                        query,
                        max_sources=5
                    )

                    if research_result and research_result.get("synthesized_info"):

                        understanding_result = await self.information_understanding.understand_and_reason(
                            extracted_info=research_result,
                            user_query=query,
                            context={},
                            prior_knowledge=[]
                        )


                        if understanding_result.get("synthesized_info"):
                            learned_count = await self._store_learned_knowledge(
                                topic=query,
                                understood_info=understanding_result,
                                category=topic_group["category"]
                            )
                            total_learned += learned_count
                            self.training_stats["total_sources_scraped"] += len(research_result.get("sources", []))

                    # Rate limiting - don't overwhelm sources
                    await asyncio.sleep(2)

                except Exception as e:
                    logger.warning(f"Error pretraining on query '{query}': {e}")
                    continue

            logger.info(f"[OK] Completed pretraining on {topic_group['topic']}")

        self.training_stats["total_knowledge_items"] = total_learned
        self.training_stats["last_training"] = datetime.utcnow().isoformat()

        logger.info(f"[COMPLETE] Pretraining complete! Learned {total_learned} knowledge items from {self.training_stats['total_sources_scraped']} sources")
        print(f"\n{'='*60}")
        print(f"[COMPLETE] [COMPREHENSIVE PRETRAINING] Complete!")
        print(f"Total Knowledge: {total_learned} items")
        print(f"Sources: {self.training_stats['total_sources_scraped']}")
        print(f"Time: {datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S')} UTC")
        print(f"{'='*60}\n")

        return {
            "status": "success",
            "total_learned": total_learned,
            "sources_scraped": self.training_stats["total_sources_scraped"],
            "topics_covered": [tg["topic"] for tg in training_topics]
        }

    async def _store_learned_knowledge(
        self,
        topic: str,
        understood_info: Dict[str, Any],
        category: str
    ) -> int:
        count = 0


        synthesized = understood_info.get("synthesized_info", "")
        if synthesized and len(synthesized.strip()) >= 100:
            await self.vector_store.add(
                text=synthesized,
                metadata={
                    "type": "pretrained_knowledge",
                    "topic": topic,
                    "category": category,
                    "source": "online_pretraining",
                    "trained_at": datetime.utcnow().isoformat(),
                    "understanding_confidence": understood_info.get("confidence", 0.5)
                }
            )
            count += 1


        takeaways = understood_info.get("key_takeaways", [])
        for takeaway in takeaways:
            if len(takeaway.strip()) >= 40:
                await self.vector_store.add(
                    text=takeaway,
                    metadata={
                        "type": "pretrained_knowledge",
                        "topic": topic,
                        "category": category,
                        "subtype": "key_takeaway",
                        "source": "online_pretraining",
                        "trained_at": datetime.utcnow().isoformat()
                    }
                )
                count += 1


        insights = understood_info.get("understood_insights", [])
        for insight in insights[:5]:
            text = insight.get("text", "")
            if text and len(text.strip()) >= 50:
                await self.vector_store.add(
                    text=text,
                    metadata={
                        "type": "pretrained_knowledge",
                        "topic": topic,
                        "category": category,
                        "subtype": "insight",
                        "relevance": insight.get("relevance", 0),
                        "source": "online_pretraining",
                        "trained_at": datetime.utcnow().isoformat()
                    }
                )
                count += 1

        return count

    async def pretrain_specific_market(self, location: str):
        logger.info(f"[PRETRAINING] Pretraining on market: {location}")

        queries = [
            f"real estate market {location} 2024",
            f"housing prices {location}",
            f"rental market {location}",
            f"property investment {location}",
            f"real estate trends {location}",
            f"market analysis {location}",
            f"investment opportunities {location}"
        ]

        total_learned = 0

        for query in queries:
            try:
                research_result = await self.web_scraper.comprehensive_research(
                    query,
                    max_sources=4
                )

                if research_result and research_result.get("synthesized_info"):
                    understanding_result = await self.information_understanding.understand_and_reason(
                        extracted_info=research_result,
                        user_query=query,
                        context={"location": location},
                        prior_knowledge=[]
                    )

                    if understanding_result.get("synthesized_info"):
                        learned_count = await self._store_learned_knowledge(
                            topic=query,
                            understood_info=understanding_result,
                            category="market_analysis"
                        )
                        total_learned += learned_count

                await asyncio.sleep(1.5)

            except Exception as e:
                logger.warning(f"Error pretraining on {query}: {e}")
                continue

        logger.info(f"[OK] Pretrained on {location}: {total_learned} knowledge items learned")
        return total_learned

    async def continuous_learning(self):
        logger.info("[CONTINUOUS] Starting continuous learning mode...")

        while True:
            try:

                trending_topics = [
                    "real estate market trends 2024",
                    "fractional ownership trends",
                    "property investment opportunities"
                ]

                for topic in trending_topics:
                    try:
                        research = await self.web_scraper.comprehensive_research(topic, max_sources=3)
                        if research:
                            understanding = await self.information_understanding.understand_and_reason(
                                extracted_info=research,
                                user_query=topic,
                                context={},
                                prior_knowledge=[]
                            )
                            if understanding.get("synthesized_info"):
                                await self._store_learned_knowledge(
                                    topic=topic,
                                    understood_info=understanding,
                                    category="trending_updates"
                                )
                    except Exception as e:
                        logger.debug(f"Error in continuous learning for {topic}: {e}")


                await asyncio.sleep(900)

            except Exception as e:
                logger.error(f"Error in continuous learning: {e}")
                await asyncio.sleep(3600)

    def get_training_stats(self) -> Dict[str, Any]:
        return self.training_stats

    def is_ready(self) -> bool:
        return self.ready

