from typing import Dict, List, Any, Optional
import json
from datetime import datetime
import asyncio

from ai_engine.vector_store import VectorStore
from ai_engine.knowledge_base import KnowledgeBase
from ai_engine.embedding_model import AdvancedEmbeddingModel
from ai_engine.data_retrieval import DataRetrievalService
from ai_engine.comprehensive_knowledge_base import ComprehensiveKnowledgeBase
from utils.logger import setup_logger

logger = setup_logger(__name__)


class PlatformTrainer:

    def __init__(
        self,
        vector_store: VectorStore,
        knowledge_base: KnowledgeBase,
        embedding_model: AdvancedEmbeddingModel,
        data_service: DataRetrievalService
    ):
        self.vector_store = vector_store
        self.knowledge_base = knowledge_base
        self.embedding_model = embedding_model
        self.data_service = data_service
        self.ready = False


        self.platform_knowledge = self._build_platform_knowledge()
        self.investment_knowledge = self._build_investment_knowledge()
        self.market_knowledge = self._build_market_knowledge()
        self.user_help_knowledge = self._build_user_help_knowledge()


        self.comprehensive_kb = ComprehensiveKnowledgeBase.get_all_knowledge()

    async def initialize(self):
        logger.info("Initializing platform trainer with comprehensive knowledge base...")

        try:

            await self._load_comprehensive_knowledge()


            await self._load_platform_knowledge()

            self.ready = True
            logger.info("Platform trainer initialized with extensive prior knowledge")
        except Exception as e:
            logger.error(f"Error initializing platform trainer: {e}", exc_info=True)
            raise

    async def _load_comprehensive_knowledge(self):
        logger.info("Loading comprehensive knowledge base into vector store...")

        knowledge_count = 0


        investment_knowledge = self.comprehensive_kb.get("real_estate_investment", {})
        knowledge_count += await self._embed_and_store_knowledge(
            investment_knowledge,
            knowledge_type="real_estate_investment",
            category="investment_strategies"
        )


        market_knowledge = self.comprehensive_kb.get("market_analysis", {})
        knowledge_count += await self._embed_and_store_knowledge(
            market_knowledge,
            knowledge_type="market_analysis",
            category="market_indicators"
        )


        advice_knowledge = self.comprehensive_kb.get("investment_advice", {})
        knowledge_count += await self._embed_and_store_knowledge(
            advice_knowledge,
            knowledge_type="investment_advice",
            category="investment_guidance"
        )


        features_knowledge = self.comprehensive_kb.get("platform_features", {})
        knowledge_count += await self._embed_and_store_knowledge(
            features_knowledge,
            knowledge_type="platform_features",
            category="platform_help"
        )


        faq_knowledge = self.comprehensive_kb.get("common_questions", {})
        knowledge_count += await self._embed_and_store_knowledge(
            faq_knowledge,
            knowledge_type="faq",
            category="user_help"
        )

        logger.info(f"Loaded {knowledge_count} knowledge items into vector store")

    async def _embed_and_store_knowledge(
        self,
        knowledge_dict: Dict[str, Any],
        knowledge_type: str,
        category: str,
        parent_key: str = ""
    ) -> int:
        count = 0

        for key, value in knowledge_dict.items():
            full_key = f"{parent_key}.{key}" if parent_key else key

            if isinstance(value, dict):

                count += await self._embed_and_store_knowledge(
                    value, knowledge_type, category, full_key
                )
            elif isinstance(value, (str, list)):

                if isinstance(value, list):
                    text = "\n".join([str(item) for item in value])
                else:
                    text = str(value)


                knowledge_text = f"{category}: {full_key}\n\n{text}"


                await self.vector_store.add(
                    text=knowledge_text,
                    metadata={
                        "type": "prior_knowledge",
                        "knowledge_type": knowledge_type,
                        "category": category,
                        "key": full_key,
                        "source": "comprehensive_knowledge_base",
                        "loaded_at": datetime.utcnow().isoformat()
                    }
                )
                count += 1

        return count

    async def _load_platform_knowledge(self):

        all_platform_knowledge = {
            **self.platform_knowledge,
            **self.investment_knowledge,
            **self.market_knowledge,
            **self.user_help_knowledge
        }

        await self._embed_and_store_knowledge(
            all_platform_knowledge,
            knowledge_type="platform_specific",
            category="platform_knowledge"
        )

    def is_ready(self) -> bool:
        return self.ready

    def _build_platform_knowledge(self) -> Dict[str, Any]:
        return {
            "fractional_ownership": {
                "concept": "Fractional ownership allows multiple investors to own shares of a property, making real estate investment accessible with lower capital requirements. Each property is divided into tokens (shares), and investors purchase tokens based on their budget.",
                "benefits": [
                    "Lower entry barrier - invest with smaller amounts ($50-$500 per token)",
                    "Diversification - own multiple properties with same capital",
                    "Professional management included - no landlord responsibilities",
                    "Passive income from rental yields - monthly dividends",
                    "Potential appreciation in property value over time",
                    "Liquidity - buy/sell tokens on secondary market",
                    "Transparency - blockchain-based ownership tracking",
                    "Accessibility - invest in premium properties you couldn't afford alone"
                ],
                "how_it_works": [
                    "Step 1: Browse available properties on the marketplace with detailed analytics",
                    "Step 2: Research property details (location, ROI, rental yield, growth potential)",
                    "Step 3: Select a property and decide investment amount",
                    "Step 4: Purchase fractional shares (tokens) based on your budget",
                    "Step 5: Receive proportional rental income (monthly dividends)",
                    "Step 6: Track performance in your portfolio dashboard",
                    "Step 7: Benefit from property appreciation over time",
                    "Step 8: Sell shares on secondary market when desired"
                ],
                "vs_traditional_real_estate": {
                    "fractional": "Low entry cost ($50-$500), diversification, professional management, liquid tokens",
                    "traditional": "High entry cost ($50k-$500k+), single property focus, self-management, illiquid"
                },
                "key_features": [
                    "Marketplace: Browse properties with filters (location, ROI, price, type)",
                    "Portfolio: Track all investments, returns, and performance analytics",
                    "Wallet: Manage funds, deposits, withdrawals securely",
                    "AI Assistant: Get personalized investment advice and market insights",
                    "Analytics: Detailed property and portfolio performance metrics",
                    "Notifications: Updates on dividends, property news, market changes"
                ],
                "risks_and_considerations": [
                    "Property values can decrease due to market conditions",
                    "Rental income may fluctuate based on occupancy and market rates",
                    "Less liquidity than stocks - tokens may not always sell immediately",
                    "Market risk - real estate markets can be cyclical",
                    "Management fees - professional management costs reduce returns",
                    "Platform risk - dependent on platform's continued operation"
                ]
            },
            "platform_features": {
                "marketplace": "Browse and invest in fractional real estate properties",
                "portfolio": "Track all your investments, returns, and performance",
                "wallet": "Manage your funds, deposits, and withdrawals",
                "ai_assistant": "Get investment advice, market analysis, and platform help",
                "analytics": "View detailed property and portfolio analytics"
            },
            "getting_started": {
                "steps": [
                    "Create an account and verify identity",
                    "Add funds to your wallet",
                    "Browse properties in the marketplace",
                    "Review property details and potential returns",
                    "Make your first investment",
                    "Monitor performance in your portfolio"
                ],
                "tips": [
                    "Start with smaller investments to learn",
                    "Diversify across different properties and locations",
                    "Research market trends before investing",
                    "Use AI assistant for investment advice",
                    "Monitor your portfolio regularly"
                ]
            }
        }

    def _build_investment_knowledge(self) -> Dict[str, Any]:
        return {
            "investment_principles": {
                "diversification": "Spread investments across multiple properties and locations to reduce risk",
                "location_importance": "Location is crucial - consider growth areas, job markets, and infrastructure",
                "cash_flow": "Look for properties with positive cash flow from rental income",
                "appreciation": "Consider long-term appreciation potential of the area",
                "risk_assessment": "Evaluate market stability, property condition, and tenant demand",
                "time_horizon": "Real estate is typically a long-term investment (5+ years)"
            },
            "property_evaluation": {
                "metrics": [
                    "Rental yield - annual rental income as % of property value",
                    "Cap rate - net operating income / property value",
                    "Cash-on-cash return - annual cash flow / total investment",
                    "Appreciation potential - expected value growth",
                    "Vacancy rate - percentage of time property is unoccupied"
                ],
                "factors": [
                    "Location and neighborhood quality",
                    "Property type (residential, commercial, etc.)",
                    "Property condition and age",
                    "Rental market demand",
                    "Economic indicators in the area",
                    "Future development plans"
                ]
            },
            "market_analysis": {
                "indicators": [
                    "Population growth trends",
                    "Job market strength",
                    "Median income levels",
                    "Property price trends",
                    "Rental demand and vacancy rates",
                    "Infrastructure development"
                ],
                "red_flags": [
                    "Declining population",
                    "High unemployment",
                    "Oversupply of properties",
                    "Economic decline",
                    "High crime rates",
                    "Lack of infrastructure"
                ]
            },
            "investment_strategies": {
                "beginners": {
                    "approach": "Start with stable, established markets with proven track records",
                    "focus": "Properties in growing metropolitan areas with strong fundamentals",
                    "amount": "Begin with smaller investments to learn and diversify gradually"
                },
                "growth": {
                    "approach": "Focus on emerging markets with high growth potential",
                    "focus": "Areas with new infrastructure, job growth, and population increase",
                    "risk": "Higher risk but potential for higher returns"
                },
                "income": {
                    "approach": "Prioritize cash flow over appreciation",
                    "focus": "Properties with high rental yields in stable markets",
                    "benefit": "Steady passive income stream"
                }
            }
        }

    def _build_market_knowledge(self) -> Dict[str, Any]:
        return {
            "major_markets": {
                "New York, NY": {
                    "characteristics": "High property values averaging $800K-$1.5M for condos, strong rental demand with average rent $3,500/month, stable appreciation of 3-5% annually, low vacancy rates around 2-3%",
                    "investment_profile": "Established market with high entry cost ($100K+ typically needed), strong long-term stability, good for cash flow (4-6% yields), excellent for appreciation seekers, high liquidity",
                    "best_for": "Conservative investors, long-term appreciation seekers, investors with larger capital ($100K+)",
                    "market_indicators": {
                        "median_home_price": "$750,000",
                        "average_rent": "$3,500/month",
                        "rental_yield": "4-6% annually",
                        "appreciation_rate": "3-5% per year",
                        "vacancy_rate": "2-3% (very low)",
                        "population_growth": "Stable, slight growth",
                        "job_market": "Strong - Finance, Tech, Media",
                        "economic_stability": "Very stable, diverse economy",
                        "risk_level": "Low to moderate",
                        "investment_timeline": "Long-term (5+ years recommended)"
                    },
                    "key_neighborhoods": {
                        "Manhattan": "Premium prices, high demand, excellent liquidity",
                        "Brooklyn": "Growing rapidly, good value, strong rental yields",
                        "Queens": "More affordable, steady growth, family-friendly"
                    },
                    "investment_advice": "NYC is an excellent market for fractional ownership due to high property values making individual ownership difficult. Fractional shares allow investors to participate in this stable, appreciating market with lower capital requirements. Focus on Manhattan and Brooklyn for best returns, Queens for more affordable entry points."
                },
                "Los Angeles, CA": {
                    "characteristics": "Diverse market with varying prices ($500K-$2M+), strong demand especially in tech hubs, moderate to high appreciation (2-4%), rental yields 3-5%",
                    "investment_profile": "Moderate to high risk depending on neighborhood, potential for strong growth in emerging areas, good for diversification",
                    "best_for": "Investors comfortable with market variations, tech-savvy investors, those seeking California exposure",
                    "market_indicators": {
                        "median_home_price": "$850,000",
                        "average_rent": "$2,800/month",
                        "rental_yield": "3-5% annually",
                        "appreciation_rate": "2-4% per year",
                        "vacancy_rate": "3-5%",
                        "population_growth": "Growing steadily",
                        "job_market": "Strong - Entertainment, Tech, Aerospace",
                        "economic_stability": "Stable with tech sector growth",
                        "risk_level": "Moderate to high",
                        "investment_timeline": "Medium to long-term (3-7 years)"
                    },
                    "key_neighborhoods": {
                        "West LA": "Premium, high demand, tech workers",
                        "Hollywood": "Tourism-driven, good short-term rentals",
                        "Downtown LA": "Revitalizing, emerging value"
                    },
                    "investment_advice": "LA offers diverse opportunities. West LA and Silicon Beach areas benefit from tech sector growth. Consider neighborhoods near major employers for steady rental demand."
                },
                "Miami, FL": {
                    "characteristics": "Tourism-driven market, growing population, moderate prices ($400K-$800K), good rental yields (5-7%), strong appreciation potential (4-6%), international buyer interest",
                    "investment_profile": "Moderate risk, good rental yields, growth potential, affordable entry compared to NYC/LA",
                    "best_for": "Investors seeking balanced risk-return, cash flow focused, those wanting Florida tax benefits",
                    "market_indicators": {
                        "median_home_price": "$450,000",
                        "average_rent": "$2,200/month",
                        "rental_yield": "5-7% annually (strong)",
                        "appreciation_rate": "4-6% per year",
                        "vacancy_rate": "4-6%",
                        "population_growth": "Rapid growth, international migration",
                        "job_market": "Growing - Finance, Tech, Tourism",
                        "economic_stability": "Stable, benefiting from remote work migration",
                        "risk_level": "Moderate",
                        "investment_timeline": "Medium-term (3-5 years)"
                    },
                    "investment_advice": "Miami offers excellent value with strong rental yields. The city benefits from remote work migration and international investment. Good for investors seeking cash flow with growth potential."
                },
                "Chicago, IL": {
                    "characteristics": "Affordable entry ($250K-$500K average), stable market, good cash flow potential (6-8% yields), moderate appreciation (2-3%), strong rental demand",
                    "investment_profile": "Lower entry cost, moderate appreciation, excellent cash flow, stable economy",
                    "best_for": "Cash flow focused investors, beginners, those seeking affordability",
                    "market_indicators": {
                        "median_home_price": "$280,000",
                        "average_rent": "$1,800/month",
                        "rental_yield": "6-8% annually (excellent)",
                        "appreciation_rate": "2-3% per year",
                        "vacancy_rate": "5-7%",
                        "population_growth": "Stable",
                        "job_market": "Strong - Finance, Manufacturing, Tech",
                        "economic_stability": "Very stable, diverse economy",
                        "risk_level": "Low to moderate",
                        "investment_timeline": "Long-term (5+ years) for best returns"
                    },
                    "investment_advice": "Chicago is excellent for cash flow investors. Lower entry prices mean better yields. The market is stable with steady rental demand. Great for building a portfolio with multiple properties."
                },
                "Atlanta, GA": {
                    "characteristics": "Growing market, very affordable prices ($200K-$400K), strong job growth, excellent rental yields (7-9%), good appreciation (3-5%), business-friendly environment",
                    "investment_profile": "Good growth potential, moderate risk, very affordable entry, strong fundamentals",
                    "best_for": "Growth-oriented investors, beginners, cash flow seekers",
                    "market_indicators": {
                        "median_home_price": "$280,000",
                        "average_rent": "$1,600/month",
                        "rental_yield": "7-9% annually (very strong)",
                        "appreciation_rate": "3-5% per year",
                        "vacancy_rate": "4-6%",
                        "population_growth": "Rapid growth, major migration destination",
                        "job_market": "Very strong - Fortune 500 companies, Tech, Film",
                        "economic_stability": "Strong and growing",
                        "risk_level": "Low to moderate",
                        "investment_timeline": "Medium to long-term (3-7 years)"
                    },
                    "investment_advice": "Atlanta is one of the best markets for fractional ownership. Strong job growth, affordable prices, and excellent yields make it perfect for both cash flow and growth. The city is attracting major employers which drives demand."
                },
                "Seattle, WA": {
                    "characteristics": "Tech-driven economy, high demand, price appreciation (4-6%), high entry cost ($600K-$1M+), moderate yields (3-4%), low vacancy (2-4%)",
                    "investment_profile": "Higher entry cost, strong appreciation potential, lower yields but steady demand, tech worker base",
                    "best_for": "Investors betting on continued tech growth, appreciation-focused, long-term holders",
                    "market_indicators": {
                        "median_home_price": "$750,000",
                        "average_rent": "$2,500/month",
                        "rental_yield": "3-4% annually",
                        "appreciation_rate": "4-6% per year (strong)",
                        "vacancy_rate": "2-4% (very low)",
                        "population_growth": "Growing rapidly",
                        "job_market": "Very strong - Tech (Amazon, Microsoft, Google)",
                        "economic_stability": "Very stable, tech-driven",
                        "risk_level": "Moderate (tech concentration)",
                        "investment_timeline": "Long-term (5+ years) for appreciation"
                    },
                    "investment_advice": "Seattle is driven by the tech sector. While yields are lower, appreciation is strong. Good for investors comfortable with tech sector risk and seeking long-term growth."
                }
            },
            "market_trends": {
                "factors": [
                    "Interest rates affect property affordability - lower rates = higher demand",
                    "Economic growth drives demand - strong GDP growth = more buyers",
                    "Population shifts influence markets - growing cities = opportunity",
                    "Employment trends impact rental demand - job growth = higher rents",
                    "Infrastructure development creates opportunities - new transit = appreciation"
                ],
                "analysis_questions": [
                    "What is the population trend? Growing, stable, or declining?",
                    "Are jobs growing or declining? Check unemployment and job creation",
                    "What is the rental demand? Low vacancy = strong demand",
                    "Are property prices rising or falling? Check recent trends",
                    "What infrastructure is planned? New developments boost values"
                ],
                "general_trends_2024": {
                    "interest_rates": "Moderate rates, affecting affordability but not blocking demand",
                    "remote_work": "Continuing migration to affordable cities with good quality of life",
                    "supply_constraints": "Limited new construction keeps inventory tight",
                    "institutional_investment": "Growing interest in residential real estate",
                    "fractional_ownership": "Increasing popularity as entry prices rise"
                }
            }
        }

    def _build_user_help_knowledge(self) -> Dict[str, Any]:
        return {
            "common_questions": {
                "how_to_invest": "Browse properties in the marketplace, select one, choose your investment amount, and complete the purchase. Funds will be deducted from your wallet.",
                "how_to_add_funds": "Go to your wallet, click 'Add Funds', enter the amount, and complete the payment process.",
                "how_to_track_investments": "View your portfolio page to see all investments, returns, rental income, and performance metrics.",
                "how_to_sell": "Go to your portfolio, select the investment, and use the sell option to list shares on the secondary market.",
                "what_is_fractional_ownership": "Fractional ownership lets multiple investors own shares of a single property, making real estate investment accessible with lower amounts.",
                "how_do_i_earn": "You earn through rental income (distributed proportionally) and potential property appreciation when you sell shares."
            },
            "platform_navigation": {
                "marketplace": "Browse and filter properties by location, price, yield, and other criteria",
                "portfolio": "View all investments, track performance, see returns and income",
                "wallet": "Manage funds, add money, withdraw earnings, view transaction history",
                "analytics": "Deep dive into property and portfolio analytics, market insights",
                "ai_assistant": "Get personalized investment advice, market analysis, and answers"
            },
            "troubleshooting": {
                "cant_find_property": "Use filters in the marketplace to narrow down by location, price range, or property type",
                "investment_failed": "Check your wallet balance, ensure sufficient funds, and verify payment method",
                "not_receiving_income": "Rental income is distributed monthly. Check your portfolio and transaction history",
                "cant_sell_shares": "Shares may have a minimum holding period. Check property terms or contact support"
            }
        }

    async def _train_platform_knowledge(self):
        logger.info("Training on platform knowledge...")


        ownership_info = self.platform_knowledge["fractional_ownership"]
        await self._add_knowledge_entry(
            "fractional_ownership",
            f"What is fractional ownership? {ownership_info['concept']} Benefits: {', '.join(ownership_info['benefits'])}. How it works: {' '.join(ownership_info['how_it_works'])}",
            intent="explanation",
            entities={"topic": "fractional ownership"}
        )


        for feature, description in self.platform_knowledge["platform_features"].items():
            await self._add_knowledge_entry(
                f"platform_feature_{feature}",
                f"The {feature} feature: {description}",
                intent="platform_help",
                entities={"feature": feature}
            )


        getting_started = self.platform_knowledge["getting_started"]
        steps_text = " ".join([f"{i+1}. {step}" for i, step in enumerate(getting_started["steps"])])
        tips_text = " ".join(getting_started["tips"])

        await self._add_knowledge_entry(
            "getting_started",
            f"Getting started on the platform: {steps_text} Tips: {tips_text}",
            intent="new_user_help",
            entities={"topic": "getting started"}
        )

        logger.info("✅ Platform knowledge trained")

    async def _train_investment_knowledge(self):
        logger.info("Training on investment knowledge...")


        principles = self.investment_knowledge["investment_principles"]
        for principle, explanation in principles.items():
            await self._add_knowledge_entry(
                f"investment_principle_{principle}",
                f"Investment principle: {principle}. {explanation}",
                intent="investment_advice",
                entities={"topic": principle}
            )


        evaluation = self.investment_knowledge["property_evaluation"]
        metrics_text = " ".join(evaluation["metrics"])
        factors_text = " ".join(evaluation["factors"])

        await self._add_knowledge_entry(
            "property_evaluation",
            f"How to evaluate properties: Key metrics - {metrics_text}. Important factors - {factors_text}",
            intent="investment_advice",
            entities={"topic": "property evaluation"}
        )


        analysis = self.investment_knowledge["market_analysis"]
        indicators_text = " ".join(analysis["indicators"])
        red_flags_text = " ".join(analysis["red_flags"])

        await self._add_knowledge_entry(
            "market_analysis_guide",
            f"Market analysis: Key indicators - {indicators_text}. Red flags to watch - {red_flags_text}",
            intent="market_analysis",
            entities={}
        )


        strategies = self.investment_knowledge["investment_strategies"]
        for strategy_type, details in strategies.items():
            strategy_text = f"Strategy: {details['approach']}. Focus: {details['focus']}"
            if 'amount' in details:
                strategy_text += f" Amount: {details['amount']}"
            if 'risk' in details:
                strategy_text += f" Risk: {details['risk']}"

            await self._add_knowledge_entry(
                f"investment_strategy_{strategy_type}",
                strategy_text,
                intent="investment_advice",
                entities={"strategy": strategy_type}
            )

        logger.info("✅ Investment knowledge trained")

    async def _train_market_knowledge(self):
        logger.info("Training on market knowledge...")


        markets = self.market_knowledge["major_markets"]
        for location, info in markets.items():

            market_text = f"Market analysis for {location}: {info['characteristics']}. Investment profile: {info['investment_profile']}. Best for: {info['best_for']}. "


            if "market_indicators" in info:
                indicators = info["market_indicators"]
                market_text += f"Market indicators: Median home price {indicators.get('median_home_price', 'N/A')}, "
                market_text += f"Average rent {indicators.get('average_rent', 'N/A')}, "
                market_text += f"Rental yield {indicators.get('rental_yield', 'N/A')}, "
                market_text += f"Appreciation rate {indicators.get('appreciation_rate', 'N/A')}, "
                market_text += f"Vacancy rate {indicators.get('vacancy_rate', 'N/A')}, "
                market_text += f"Population growth: {indicators.get('population_growth', 'N/A')}, "
                market_text += f"Job market: {indicators.get('job_market', 'N/A')}, "
                market_text += f"Risk level: {indicators.get('risk_level', 'N/A')}, "
                market_text += f"Investment timeline: {indicators.get('investment_timeline', 'N/A')}. "


            if "key_neighborhoods" in info:
                neighborhoods_text = " ".join([f"{neighborhood}: {desc}" for neighborhood, desc in info["key_neighborhoods"].items()])
                market_text += f"Key neighborhoods: {neighborhoods_text}. "


            if "investment_advice" in info:
                market_text += f"Investment advice: {info['investment_advice']}"

            await self._add_knowledge_entry(
                f"market_{location.replace(' ', '_').replace(',', '')}",
                market_text,
                intent="market_analysis",
                entities={"location": location}
            )


        trends = self.market_knowledge["market_trends"]
        factors_text = " ".join(trends["factors"])
        questions_text = " ".join(trends["analysis_questions"])


        trends_text = factors_text + " " + questions_text
        if "general_trends_2024" in trends:
            general_trends = trends["general_trends_2024"]
            trends_text += " " + " ".join([f"{key}: {value}" for key, value in general_trends.items()])

        await self._add_knowledge_entry(
            "market_trends",
            f"Understanding market trends: Key factors - {trends_text}",
            intent="market_analysis",
            entities={}
        )

        logger.info("✅ Market knowledge trained")

    async def _train_user_help_knowledge(self):
        logger.info("Training on user help knowledge...")


        questions = self.user_help_knowledge["common_questions"]
        for question_topic, answer in questions.items():
            await self._add_knowledge_entry(
                f"help_{question_topic}",
                f"Q: {question_topic.replace('_', ' ').title()}? A: {answer}",
                intent="new_user_help",
                entities={"topic": question_topic}
            )


        navigation = self.user_help_knowledge["platform_navigation"]
        for section, description in navigation.items():
            await self._add_knowledge_entry(
                f"navigation_{section}",
                f"How to use {section}: {description}",
                intent="platform_help",
                entities={"section": section}
            )


        troubleshooting = self.user_help_knowledge["troubleshooting"]
        for issue, solution in troubleshooting.items():
            await self._add_knowledge_entry(
                f"troubleshoot_{issue}",
                f"Problem: {issue.replace('_', ' ')}. Solution: {solution}",
                intent="platform_help",
                entities={"issue": issue}
            )

        logger.info("✅ User help knowledge trained")

    async def _train_from_database(self):
        logger.info("Training on database data (if available)...")

        try:

            properties = await self.data_service.fetch_properties({})

            if properties and len(properties) > 0:
                logger.info(f"Found {len(properties)} properties in database")


                locations = {}
                for prop in properties:
                    location = f"{prop.get('city', '')}, {prop.get('state', '')}"
                    if location not in locations:
                        locations[location] = []
                    locations[location].append(prop)


                for location, props in locations.items():
                    if location and location != ", ":
                        avg_price = sum(p.get('price', 0) or 0 for p in props) / len(props)
                        avg_yield = sum(p.get('yield', 0) or 0 for p in props) / len(props)

                        market_insight = f"Market data for {location}: {len(props)} properties available. Average price: ${avg_price:,.0f}. Average yield: {avg_yield:.2f}%"

                        await self._add_knowledge_entry(
                            f"database_market_{location.replace(' ', '_').replace(',', '')}",
                            market_insight,
                            intent="market_analysis",
                            entities={"location": location}
                        )

                logger.info(f"✅ Trained on {len(locations)} market locations from database")
            else:
                logger.info("No properties found in database - using knowledge base only")

        except Exception as e:
            logger.warning(f"Could not fetch database data: {e} - continuing with knowledge base only")

    async def _add_knowledge_entry(
        self,
        topic: str,
        content: str,
        intent: str,
        entities: Dict[str, Any]
    ):
        try:
            await self.vector_store.add(
                text=content,
                metadata={
                    "type": "knowledge",
                    "topic": topic,
                    "intent": intent,
                    "entities": json.dumps(entities),
                    "source": "platform_trainer",
                    "trained_at": datetime.utcnow().isoformat()
                }
            )
        except Exception as e:
            logger.warning(f"Error adding knowledge entry for {topic}: {e}")

    async def retrain_on_interaction(
        self,
        user_message: str,
        intent: str,
        entities: Dict[str, Any],
        response: str,
        confidence: float
    ):

        if confidence > 0.8:
            await self._add_knowledge_entry(
                f"learned_pattern_{intent}_{datetime.utcnow().timestamp()}",
                f"User asked: {user_message}. Response: {response}",
                intent=intent,
                entities=entities
            )

    async def get_training_stats(self) -> Dict[str, Any]:
        try:

            all_knowledge = await self.vector_store.search(
                query="knowledge platform trainer",
                top_k=1000,
                threshold=0.1
            )

            stats = {
                "total_knowledge_entries": len(all_knowledge),
                "by_intent": {},
                "by_source": {}
            }

            for entry in all_knowledge:
                intent = entry.get("intent", "unknown")
                source = entry.get("source", "unknown")

                stats["by_intent"][intent] = stats["by_intent"].get(intent, 0) + 1
                stats["by_source"][source] = stats["by_source"].get(source, 0) + 1

            return stats
        except Exception as e:
            logger.error(f"Error getting training stats: {e}")
            return {"error": str(e)}
