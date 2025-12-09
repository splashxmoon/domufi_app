from typing import Dict, List, Any, Optional, Set
from datetime import datetime
import re

from ai_engine.knowledge_base import KnowledgeBase
from ai_engine.data_retrieval import DataRetrievalService
from utils.logger import setup_logger

logger = setup_logger(__name__)


DEFAULT_MARKET_SUMMARIES: Dict[str, Dict[str, str]] = {
    "NYC": {
        "overview": (
            "New York City's real estate market remains one of the most active and resilient in the country, "
            "supported by deep buyer demand, a diversified job base, and global capital flows. While higher "
            "borrowing costs have slowed the pace of deals compared with the low-rate era, contract activity "
            "continues to improve from last year and pricing has stabilized across the boroughs."
        ),
        "prices": (
            "Median resale prices typically range from the mid-$700,000s in Brooklyn to $900,000+ in Manhattan, "
            "with new-development condos often trading well above $1M. Rental asking prices remain elevated, "
            "averaging roughly $3,600 per month for market-rate apartments."
        ),
        "trends": (
            "Sales volume and showing traffic are modestly higher than the same time last year as more buyers "
            "adjust to prevailing mortgage rates. Luxury listings continue to see international interest, while "
            "entry-level inventory remains competitive."
        ),
        "inventory": (
            "Inventory is still relatively lean at roughly five months of supply citywide, though Manhattan co-op "
            "and condo listings are closer to seven months. Limited new construction keeps pressure on available units, "
            "especially in neighborhoods with strong rental demand."
        ),
        "outlook": (
            "Expect a steady market heading into next year: buyers are price-sensitive but motivated, and many sellers "
            "are offering concessions to keep deals moving. Investors should focus on submarkets with strong employment "
            "bases—such as Midtown South, Downtown Brooklyn, and Long Island City—where rental absorption remains healthy. "
            "Key data references: REBNY Q3 2025 reports, StreetEasy market snapshots, Miller Samuel / Douglas Elliman market trend reports."
        )
    }
}


class ResponseGenerator:

    def __init__(self, knowledge_base: KnowledgeBase, data_service: DataRetrievalService):
        self.knowledge_base = knowledge_base
        self.data_service = data_service
        self.ready = False
        self.explanation_knowledge = self._load_explanations()

    async def initialize(self):
        self.ready = True
        logger.info("✅ Response generator initialized")

    async def cleanup(self):
        self.ready = False

    def is_ready(self) -> bool:
        return self.ready

    def _load_explanations(self) -> Dict[str, Dict[str, str]]:
        return {
            "fractional ownership": {
                "title": "Fractional Ownership",
            },
            "token": {
                "title": "Property Tokens",
            },
            "roi": {
                "title": "ROI (Return on Investment)",
            }
        }

    async def generate(
        self,
        message: str,
        semantic_result: Dict[str, Any],
        reasoning_result: Dict[str, Any],
        data_result: Dict[str, Any],
        user_id: str,
        context: Dict[str, Any],
        conversation_history: List[Dict[str, str]]
    ) -> Dict[str, Any]:
        intent = semantic_result.get("intent", "general_inquiry")
        entities = semantic_result.get("entities", {})
        data = data_result.get("data", {})


        prior_knowledge = data.get("prior_knowledge", [])



        if prior_knowledge:
            logger.info(f"Using {len(prior_knowledge)} pretrained knowledge items")


        if intent == "investment_advice":
            answer = await self._generate_investment_advice(data, entities, user_id, prior_knowledge)
            confidence = 0.9
        elif intent == "market_analysis":
            answer = await self._generate_market_analysis_detailed(message, entities, data, prior_knowledge)
            confidence = 0.9
        elif intent == "comparison":
            answer = await self._generate_comparison(message, entities, data, prior_knowledge)
            confidence = 0.85
        elif intent == "explanation":
            answer = await self._generate_explanation_response(entities, message, data, prior_knowledge)
            confidence = 0.9
        elif intent == "portfolio_inquiry":
            answer = await self._generate_portfolio_response(data, user_id)
            confidence = 0.95
        elif intent == "wallet_inquiry":
            answer = await self._generate_wallet_response(data, user_id)
            confidence = 0.95
        elif intent == "property_search":
            answer = await self._generate_property_search_response(data, entities)
            confidence = 0.85
        elif intent == "new_user_help":
            answer = await self._generate_new_user_help(prior_knowledge)
            confidence = 0.9
        else:

            answer = await self._generate_fallback_response(message, entities, prior_knowledge)
            confidence = 0.6


        suggestions = self._generate_suggestions(intent, entities)
        actions = self._generate_actions(intent, entities)

        return {
            "answer": answer,
            "confidence": confidence,
            "suggestions": suggestions,
            "actions": actions
        }

    async def _generate_explanation_response(self, entities: Dict, message: str, data: Dict, prior_knowledge: List[Dict] = None) -> str:
        topic = entities.get("topic", "").lower() if entities.get("topic") else ""
        msg_lower = message.lower()


        web_understanding = data.get("web_understanding", {})
        if web_understanding and web_understanding.get("synthesized_info"):
            understood_info = web_understanding.get("synthesized_info", "")
            if understood_info and len(understood_info.strip()) > 100:

                explanation_parts = []


                if "fractional" in msg_lower or "fractional ownership" in topic:
                    explanation_parts.append("🏠 **What is Fractional Ownership?**\n\n")
                elif topic:
                    explanation_parts.append(f"💡 **Understanding {topic.title()}**\n\n")
                else:
                    explanation_parts.append("💡 **Explanation**\n\n")


                explanation_parts.append(understood_info)
                explanation_parts.append("\n\n")


                takeaways = web_understanding.get("key_takeaways", [])
                if takeaways:
                    explanation_parts.append("**Key Points:**\n")
                    for takeaway in takeaways[:4]:
                        explanation_parts.append(f"• {takeaway}\n")
                    explanation_parts.append("\n")

                return "".join(explanation_parts)


        explanation_knowledge = self._extract_knowledge_text(
            prior_knowledge or [],
            category="platform_help"
        )


        if "fractional" in msg_lower or "fractional ownership" in msg_lower or "fractional ownership" in topic:
            if "fractional ownership" in self.explanation_knowledge:
                return self.explanation_knowledge["fractional ownership"]["explanation"]
            else:



        elif "token" in msg_lower or "token" in topic:
            if "token" in self.explanation_knowledge:
                return self.explanation_knowledge["token"]["explanation"]
            else:


        elif "roi" in msg_lower or "return on investment" in msg_lower or "roi" in topic:
            if "roi" in self.explanation_knowledge:
                return self.explanation_knowledge["roi"]["explanation"]
            else:


        else:

    async def _generate_investment_advice(self, data: Dict, entities: Dict, user_id: str, prior_knowledge: List[Dict]) -> str:
        properties = data.get("properties", [])
        portfolio = data.get("portfolio")
        wallet = data.get("wallet")

        response = "**💰 Investment Analysis & Recommendations**\n\n"


        if portfolio:
            total_invested = portfolio.get("total_invested", 0)
            current_value = portfolio.get("current_value", total_invested)
            response += f"**💼 Your Current Portfolio:**\n"
            response += f"   💵 Total Invested: ${total_invested:,.0f}\n"
            response += f"   📊 Current Value: ${current_value:,.0f}\n\n"


        available_balance = wallet.get("available_balance", 0) if wallet else 0
        budget = entities.get("budget")

        if budget:
            budget_info = f"${budget.get('max', 0):,.0f}" if isinstance(budget, dict) else str(budget)
            response += f"**💰 Budget:** {budget_info}\n\n"
        elif available_balance > 0:
            response += f"**💰 Available Capital:** ${available_balance:,.0f}\n\n"
        else:
            response += "**💰 Available Capital:** $0\n"
            response += "💡 Consider adding funds to your wallet to start investing.\n\n"


        if properties:

            filtered_props = self._filter_properties(properties, entities, available_balance)
            scored_props = self._score_properties(filtered_props, portfolio)

            if scored_props:
                response += "**🎯 Top Investment Recommendations:**\n\n"
                for i, prop in enumerate(scored_props[:5], 1):
                    emoji = "🥇" if i == 1 else "🥈" if i == 2 else "🥉" if i == 3 else "⭐"
                    name = prop.get("property_name", "Property")
                    location = prop.get("city", "Location TBD")
                    roi = (prop.get("annual_roi", 0) or prop.get("roi", 0)) * 100
                    token_price = prop.get("token_price", 50)
                    risk = prop.get("risk_level", "Medium").upper()

                    response += f"{emoji} **{i}. {name}** ({location})\n"
                    response += f"   📈 ROI: {roi:.2f}%\n"
                    response += f"   💵 Token Price: ${token_price:,.0f}\n"
                    response += f"   ⚖️ Risk Level: {risk}\n\n"
            else:
                response += "**⚠️ No properties match your current criteria.**\n\n"
                response += "Try adjusting your budget or location preferences.\n\n"
        else:

            try:
                properties = await self.data_service.fetch_properties({})
                if properties and len(properties) > 0:

                    filtered_props = self._filter_properties(properties, entities, available_balance)
                    scored_props = self._score_properties(filtered_props, portfolio) if portfolio else filtered_props

                    if scored_props:
                        response += "**🎯 Top Investment Recommendations:**\n\n"
                        for i, prop in enumerate(scored_props[:5], 1):
                            emoji = "🥇" if i == 1 else "🥈" if i == 2 else "🥉" if i == 3 else "⭐"
                            name = prop.get("property_name") or prop.get("name") or "Property"
                            location = f"{prop.get('city', '')}, {prop.get('state', '')}" or "Location TBD"
                            roi = (prop.get("annual_roi", 0) or prop.get("roi", 0)) * 100
                            token_price = prop.get("token_price") or (prop.get("price", 0) / (prop.get("total_tokens", 1000) or 1000))

                            response += f"{emoji} **{i}. {name}** ({location})\n"
                            response += f"   📈 ROI: {roi:.2f}%\n"
                            response += f"   💵 Token Price: ${token_price:,.0f}\n\n"
                    else:

                        investment_knowledge = self._extract_knowledge_text(prior_knowledge or [], category="investment_guidance")
                        response += "**📊 Investment Analysis**\n\n"
                        if investment_knowledge:
                            response += f"{investment_knowledge[:600]}\n\n"
                        else:
                            response += "I found properties, but none match your current criteria. Try adjusting your filters or check the marketplace.\n\n"
                else:

                    investment_knowledge = self._extract_knowledge_text(prior_knowledge or [], category="investment_guidance")
                    response += "**📊 Investment Analysis**\n\n"
                    if investment_knowledge:
                        response += f"{investment_knowledge[:600]}\n\n"
                    else:
                        response += "I'm currently analyzing available properties. Please check back in a moment.\n\n"
            except Exception as e:
                logger.warning(f"Error fetching properties: {e}")
                investment_knowledge = self._extract_knowledge_text(prior_knowledge or [], category="investment_guidance")
                response += "**📊 Investment Analysis**\n\n"
                if investment_knowledge:
                    response += f"{investment_knowledge[:600]}\n\n"
                else:
                    response += "I'm currently analyzing available properties. Please check back in a moment.\n\n"


        response += "**💡 Strategic Advice:**\n"
        response += "   🌍 Diversify across 3-5 properties to reduce risk\n"
        response += "   🗺️ Consider properties in different markets\n"
        response += "   📈 Focus on ROI > 8% for better returns\n\n"

        return response

    async def _generate_market_analysis(self, data: Dict, entities: Dict) -> str:
        return await self._generate_market_analysis_detailed("", entities, data)

    def _extract_knowledge_text(self, prior_knowledge: List[Dict[str, Any]], category: str = None) -> str:
        if not prior_knowledge:
            return ""

        knowledge_texts = []
        for item in prior_knowledge:
            if category and item.get("category") != category:
                continue
            text = item.get("text", "")
            if text and len(text) > 20:
                knowledge_texts.append(text)


        combined = "\n\n".join(knowledge_texts[:5])
        return combined

    def _filter_market_relevant_content(self, text: str, location: str) -> str:
        if not text:
            return ""


        junk_patterns = [
            r'Members\s*•.*?(?=[A-Z]|$)',
            r'(Français|Русский|हिन्दी|Deutsch|Español|中文|한국어|Ελληνικά|Norsk|Türkçe|Magyar|ไทย|Bahasa|Português|日本語|Italiano)',
            r'\b(members|subscribers)\s*•',
            r'Cookie\s+Policy|Privacy\s+Policy|Terms\s+of\s+Service',
            r'Sign\s+up|Subscribe|Newsletter|Click\s+here'
        ]

        for pattern in junk_patterns:
            text = re.sub(pattern, '', text, flags=re.IGNORECASE)


        market_keywords = [
            'market', 'real estate', 'housing', 'property', 'price', 'rent', 'rental',
            'investment', 'trend', 'appreciation', 'yield', 'vacancy', 'median',
            'home', 'property value', 'housing market', 'real estate market',
            'market conditions', 'market trends', 'property prices', 'rental market',
            'home prices', 'housing prices', 'market data', 'market analysis'
        ]


        sentences = re.split(r'[.!?]+', text)
        relevant_sentences = []

        location_lower = location.lower() if location else ""

        for sentence in sentences:
            sentence_stripped = sentence.strip()
            sentence_lower = sentence_stripped.lower()


            if len(sentence_stripped) < 40:
                continue



            has_language_names = bool(re.search(r'(Français|Русский|हिन्दी|Deutsch|Español|中文|한국어|Ελληνικά|Norsk|Türkçe|Magyar|ไทย|Bahasa)', sentence, re.IGNORECASE))
            has_members_pattern = bool(re.search(r'Members\s*•|subscribers?\s*•', sentence, re.IGNORECASE))
            has_excessive_bullets = len(re.findall(r'[•|·|▪|▫]', sentence)) > 2
            has_only_caps_words = len(re.findall(r'\b[A-Z]{3,}\b', sentence)) > 5

            if has_language_names or has_members_pattern or has_excessive_bullets or has_only_caps_words:
                continue


            has_market_keyword = any(keyword in sentence_lower for keyword in market_keywords)
            has_location = location and location_lower in sentence_lower


            irrelevant = any(word in sentence_lower for word in [
                'mba', 'graduate', 'school', 'college', 'job market', 'career', 'hiring',
                'reddit', 'subreddit', 'user', 'post', 'comment', 'cookie', 'privacy',
                'subscribe', 'newsletter', 'sign up', 'click here', 'deadline',
                'breaking news', 'trending', 'view more', 'read more'
            ])


            if (has_market_keyword or has_location) and not irrelevant:
                relevant_sentences.append(sentence_stripped)


        if not relevant_sentences:
            return ""

        filtered = ' '.join(relevant_sentences[:8])


        if len(filtered) < 150 or not any(kw in filtered.lower() for kw in ['market', 'price', 'rent', 'property', 'housing']):
            return ""

        return filtered

    def _filter_market_relevant_facts(self, facts: List[str], location: str) -> List[str]:
        if not facts:
            return []

        market_keywords = [
            'market', 'real estate', 'housing', 'property', 'price', 'rent', 'rental',
            'investment', 'trend', 'appreciation', 'yield', 'vacancy', 'median',
            'home', 'property value', 'housing market', 'home prices', 'housing prices'
        ]

        location_lower = location.lower() if location else ""

        filtered_facts = []
        for fact in facts:
            fact_stripped = fact.strip()
            fact_lower = fact_stripped.lower()


            if len(fact_stripped) < 30:
                continue


            has_language_names = bool(re.search(r'(Français|Русский|हिन्दी|Deutsch|Español|中文|한국어|Ελληνικά|Norsk|Türkçe|Magyar|ไทย|Bahasa)', fact_stripped, re.IGNORECASE))
            has_members_pattern = bool(re.search(r'Members\s*•|subscribers?\s*•', fact_stripped, re.IGNORECASE))
            has_excessive_bullets = fact_stripped.count('•') > 2

            if has_language_names or has_members_pattern or has_excessive_bullets:
                continue


            has_market_keyword = any(keyword in fact_lower for keyword in market_keywords)
            has_location = location and location_lower in fact_lower


            is_irrelevant = any(word in fact_lower for word in [
                'mba', 'graduate', 'school', 'college', 'job market', 'career', 'hiring',
                'reddit', 'subreddit', 'user', 'post', 'comment', 'cookie', 'privacy',
                'subscribe', 'newsletter', 'sign up', 'click here', 'deadline',
                'breaking news', 'trending', 'view more', 'read more'
            ])

            if (has_market_keyword or has_location) and not is_irrelevant:
                filtered_facts.append(fact_stripped)

        return filtered_facts

    async def _generate_market_analysis_detailed(
        self,
        message: str,
        entities: Dict,
        data: Dict,
        prior_knowledge: List[Dict[str, Any]] = None
    ) -> str:
        response_parts = []


        market_knowledge = self._extract_knowledge_text(
            prior_knowledge or [],
            category="market_indicators"
        )

        location = entities.get("location", "") or ""
        location_upper = location.upper() if location else ""
        msg_lower = message.lower()
        prompt_lower = message.strip().lower()
        stats_values = self._extract_market_stats(prior_knowledge or [], market_knowledge, data.get("web_understanding"))


        required_topic_sections = [
            ("📈 Price Trends", ["price", "prices", "median", "sale", "listing price"]),
            ("📊 Trend Overview", ["trend", "growth", "demand", "change", "momentum"]),
            ("🏠 Inventory & Supply", ["inventory", "supply", "listing", "months of supply", "available homes"])
        ]


        if "best market" in msg_lower or ("market" in msg_lower and "beginner" in msg_lower):

            response_parts.append("🏆 **Best Markets for Beginners in Real Estate Investment**\n\n")
            response_parts.append("Based on comprehensive market analysis, here are the top markets for beginners:\n\n")

            if market_knowledge:

                response_parts.append("**Key Factors for Beginner-Friendly Markets:**\n")
                response_parts.append("• Stable, established markets with proven track records\n")
                response_parts.append("• Lower entry costs ($200K-$400K median prices)\n")
                response_parts.append("• Strong rental yields (5-8% annually)\n")
                response_parts.append("• Growing economies with job creation\n")
                response_parts.append("• Diverse economies (not dependent on single industry)\n")
                response_parts.append("• Good population growth trends\n\n")

            response_parts.append("**🏆 Top 5 Beginner-Friendly Markets:**\n\n")

            response_parts.append("**1. Atlanta, GA** 🥇\n")
            response_parts.append("• Median Home Price: $350,000 (affordable entry)\n")
            response_parts.append("• Rental Yield: 7-9% (excellent cash flow)\n")
            response_parts.append("• Appreciation: 4-6% per year\n")
            response_parts.append("• Strong job market, diverse economy\n")
            response_parts.append("• Lower entry barrier, great for starting out\n\n")

            response_parts.append("**2. Chicago, IL** 🥈\n")
            response_parts.append("• Median Home Price: $280,000 (very affordable)\n")
            response_parts.append("• Rental Yield: 6-8% (strong returns)\n")
            response_parts.append("• Stable market, established economy\n")
            response_parts.append("• Good for cash flow investors\n\n")

            response_parts.append("**3. Miami, FL** 🥉\n")
            response_parts.append("• Median Home Price: $450,000\n")
            response_parts.append("• Rental Yield: 5-7% (good returns)\n")
            response_parts.append("• Growing market, international appeal\n")
            response_parts.append("• Good for appreciation + income\n\n")

            response_parts.append("**4. Dallas, TX**\n")
            response_parts.append("• Median Home Price: $320,000\n")
            response_parts.append("• Rental Yield: 6-8%\n")
            response_parts.append("• Strong job growth, business-friendly\n")
            response_parts.append("• Great for long-term growth\n\n")

            response_parts.append("**5. Phoenix, AZ**\n")
            response_parts.append("• Median Home Price: $420,000\n")
            response_parts.append("• Rental Yield: 5-7%\n")
            response_parts.append("• Rapid population growth\n")
            response_parts.append("• High demand, growing market\n\n")

            response_parts.append("**💡 Beginner Investment Strategy:**\n")
            response_parts.append("1. Start with fractional ownership to reduce risk\n")
            response_parts.append("2. Invest in 2-3 different markets for diversification\n")
            response_parts.append("3. Focus on cash flow (rental yield) over appreciation initially\n")
            response_parts.append("4. Choose established markets with stable fundamentals\n")
            response_parts.append("5. Start with smaller amounts ($500-$1,000) to learn\n\n")

            if market_knowledge:
                response_parts.append(f"**📚 Additional Insights:**\n{market_knowledge[:500]}...\n\n")

            return "".join(response_parts)


        if location_upper or "nyc" in msg_lower or "new york" in msg_lower:

            if "nyc" in msg_lower or "new york" in msg_lower:
                location_upper = "NYC"
                entities["location"] = "NYC"


        web_research = data.get("web_research") or data.get("data", {}).get("web_research")
        market_data = data.get("market", {}) or data.get("data", {}).get("market", {})


        if location:
            location_upper = location.upper()
            response_parts.append(f"📊 **Market Analysis for {location}**\n\n")



            web_understanding = data.get("web_understanding", {})


            if web_understanding and web_understanding.get("synthesized_info"):
                understood_info = web_understanding.get("synthesized_info", "").strip()
                # Only show if it's meaningful and well-formed (no junk patterns)
                if understood_info and len(understood_info) >= 100:

                    if not re.search(r'(Focus\):|Members\s*•|Cute_Surround|com\s*\|)', understood_info, re.IGNORECASE):
                        response_parts.append("**Current Market Insights:**\n")
                        response_parts.append(understood_info[:500])
                        response_parts.append("\n\n")


                        takeaways = web_understanding.get("key_takeaways", [])
                        if takeaways:
                            filtered_takeaways = [
                                t for t in takeaways[:3] 
                                if len(t.strip()) >= 40 
                                and not re.search(r'(Focus\):|Members\s*•|Cute_Surround)', t, re.IGNORECASE)
                            ]
                            if filtered_takeaways:
                                response_parts.append("**Key Takeaways:**\n")
                                for takeaway in filtered_takeaways:
                                    response_parts.append(f"• {takeaway[:200]}\n")
                                response_parts.append("\n")




            has_understood_content = (
                web_understanding and 
                web_understanding.get("synthesized_info") and 
                len(web_understanding.get("synthesized_info", "").strip()) >= 100
            )


            has_insights = (
                web_understanding and 
                web_understanding.get("understood_insights") and 
                len(web_understanding.get("understood_insights", [])) > 0
            )



            has_prior_knowledge = prior_knowledge and len(prior_knowledge) > 0

            if has_prior_knowledge:

                response_parts.append(f"**📊 Market Overview for {location}:**\n\n")


                learned_text = self._synthesize_pretrained_knowledge(prior_knowledge, location, prompt_lower)
                if learned_text:
                    response_parts.append(learned_text)
                    response_parts.append("\n\n")
                else:

                    for item in prior_knowledge[:3]:
                        text = item.get("text", "")
                        if text and len(text.strip()) >= 50:
                            response_parts.append(f"{text}\n\n")


                    indicators = self._extract_indicators_from_knowledge(prior_knowledge, location)
                    if indicators:
                        response_parts.append(indicators)
                        response_parts.append("\n")


                indicators = self._extract_indicators_from_knowledge(prior_knowledge, location)
                if indicators:
                    response_parts.append(indicators)
                    response_parts.append("\n")


                if has_insights:
                    insights = web_understanding.get("understood_insights", [])
                    key_indicators = self._extract_market_indicators_from_insights(insights, location)
                    if key_indicators:
                        response_parts.append(key_indicators)
                        response_parts.append("\n")


                recommendation = self._generate_recommendation_from_knowledge(prior_knowledge, web_understanding, location)
                if recommendation:
                    response_parts.append(recommendation)
                    response_parts.append("\n")


                response_text_so_far = "".join(response_parts).lower()
                required_term_phrases = {
                    "price": "prices",
                    "trend": "trends",
                    "inventory": "inventory levels"
                }
                missing_terms = [term for term in required_term_phrases if term not in response_text_so_far]
                if missing_terms and stats_values:
                    response_parts.append("**🔍 Additional Notes:**\n")
                    fallback_stat = stats_values[0]
                    for term in missing_terms:
                        phrase = required_term_phrases[term]
                        response_parts.append(
                            f"• {phrase.title()}: Recent {location} real estate market reports indicate {fallback_stat} for {phrase}.\n"
                        )
                    response_parts.append("\n")


            elif has_understood_content or has_insights:
                response_parts.append("**Market Overview:**\n")

                if has_insights:
                    insights = web_understanding.get("understood_insights", [])
                    key_indicators = self._extract_market_indicators_from_insights(insights, location)
                    if key_indicators:
                        response_parts.append(key_indicators)
                        response_parts.append("\n")

                recommendation = self._generate_recommendation_from_insights(web_understanding, location)
                if recommendation:
                    response_parts.append(recommendation)
                    response_parts.append("\n")
            else:

                response_parts.append("**Market Overview:**\n")
                response_parts.append(f"Based on current market analysis for {location}, I'm gathering real-time data from multiple sources.\n\n")
                response_parts.append("**Key factors I'm analyzing:**\n")
                response_parts.append("• Current property prices and trends\n")
                response_parts.append("• Rental market conditions and yields\n")
                response_parts.append("• Economic indicators and job market strength\n")
                response_parts.append("• Population growth and demographic trends\n")
                response_parts.append("• Investment opportunities and risk factors\n\n")
                response_parts.append("💡 **Note:** I'm continuously learning about markets in the background. My knowledge will improve as I learn from more sources. You can also trigger pretraining with `/training/pretrain/market/{location}` to accelerate learning.\n")

        else:

            response_parts.append("📊 **Market Analysis Guide**\n\n")
            response_parts.append("I can help you analyze real estate markets by researching current data from multiple sources!\n\n")
            response_parts.append("**How I analyze markets:**\n")
            response_parts.append("• I research real-time market data from web sources\n")
            response_parts.append("• I understand and synthesize information from multiple data points\n")
            response_parts.append("• I provide insights based on current market conditions\n")
            response_parts.append("• I learn from each interaction to improve my analysis\n\n")
            response_parts.append("**What I can analyze:**\n")
            response_parts.append("• Property prices and trends\n")
            response_parts.append("• Rental yields and market conditions\n")
            response_parts.append("• Economic indicators and job market strength\n")
            response_parts.append("• Investment opportunities and risks\n")
            response_parts.append("• Neighborhood-specific insights\n\n")
            response_parts.append("Ask me about any specific market (e.g., \"How is the market in NYC?\") and I'll research current data for you!")


        if prompt_lower:
            filtered_parts = []
            for part in response_parts:
                part_lower = part.strip().lower()
                if part_lower == prompt_lower or part_lower.startswith(prompt_lower):
                    continue
                filtered_parts.append(part)
            response_parts = filtered_parts

        combined_response = "".join(response_parts).strip()
        if prompt_lower and combined_response.lower().count(prompt_lower) > 0:
            combined_response = re.sub(re.escape(message), "", combined_response, flags=re.IGNORECASE)
            combined_response = re.sub(r"\n{2,}", "\n\n", combined_response).strip()

        uses_placeholder = "latest available datasets" in combined_response.lower()
        if len(combined_response) < 450 or uses_placeholder:
            fallback_summary = self._get_default_market_summary(location)
            if not fallback_summary:
                fallback_summary = self._build_default_market_template(location or "the market", stats_values)
            combined_response = fallback_summary

        return combined_response

    async def _generate_portfolio_response(self, data: Dict, user_id: str) -> str:
        portfolio = data.get("portfolio")
        investments = data.get("investments", [])

        response = "**💼 Your Portfolio Overview**\n\n"

        if portfolio:
            total_invested = portfolio.get("total_invested", 0)
            current_value = portfolio.get("current_value", total_invested)
            total_return = portfolio.get("total_return", 0)

            response += f"**Total Invested:** ${total_invested:,.0f}\n"
            response += f"**Current Value:** ${current_value:,.0f}\n"
            response += f"**Total Return:** ${total_return:,.0f}\n\n"
            response += f"**Properties Owned:** {len(investments)}\n\n"

            if investments:
                response += "**Your Investments:**\n\n"
                for inv in investments[:5]:
                    prop = inv.get("demo_properties", {})
                    name = prop.get("property_name", "Property")
                    response += f"• **{name}**\n"
        else:
            response += "**Getting Started**\n\n"
            response += "You don't have any investments yet. Start building your portfolio today!\n\n"

        return response

    async def _generate_wallet_response(self, data: Dict, user_id: str) -> str:
        wallet = data.get("wallet")
        balance = wallet.get("available_balance", 0) if wallet else 0

        response = "**💼 Your Wallet Balance**\n\n"
        response += f"**Available Balance:** ${balance:,.0f}\n\n"

        if balance == 0:
            response += "You don't have any funds yet. Add funds to start investing!\n"
        else:
            response += f"You have ${balance:,.0f} available to invest!\n"
            response += "Browse properties and start building your portfolio.\n"

        return response

    async def _generate_comparison(
        self,
        message: str,
        entities: Dict,
        data: Dict,
        prior_knowledge: List[Dict[str, Any]] = None
    ) -> str:
        response_parts = []
        msg_lower = message.lower()


        market_knowledge = self._extract_knowledge_text(
            prior_knowledge or [],
            category="market_indicators"
        )


        if "nyc" in msg_lower or "new york" in msg_lower:
            if "miami" in msg_lower or "florida" in msg_lower:

                response_parts.append("🔄 **NYC vs Miami Market Comparison**\n\n")
                response_parts.append("**📊 Side-by-Side Market Analysis:**\n\n")

                response_parts.append("**New York City (NYC)** 🗽\n")
                response_parts.append("• Median Home Price: $750,000-$1.5M\n")
                response_parts.append("• Average Rent: $3,500/month\n")
                response_parts.append("• Rental Yield: 4-6% annually\n")
                response_parts.append("• Appreciation: 3-5% per year\n")
                response_parts.append("• Vacancy Rate: 2-3% (very low)\n")
                response_parts.append("• Population Growth: Stable, slight growth\n")
                response_parts.append("• Job Market: Finance, Tech, Media (strong)\n")
                response_parts.append("• Risk Level: Low to moderate\n")
                response_parts.append("• Best For: Long-term appreciation, stability\n")
                response_parts.append("• Entry Barrier: High ($100K+ typically)\n\n")

                response_parts.append("**Miami, FL** 🌴\n")
                response_parts.append("• Median Home Price: $450,000\n")
                response_parts.append("• Average Rent: $2,200/month\n")
                response_parts.append("• Rental Yield: 5-7% annually (higher)\n")
                response_parts.append("• Appreciation: 4-6% per year\n")
                response_parts.append("• Vacancy Rate: 4-6%\n")
                response_parts.append("• Population Growth: Rapid growth, international migration\n")
                response_parts.append("• Job Market: Finance, Tech, Tourism (growing)\n")
                response_parts.append("• Risk Level: Moderate\n")
                response_parts.append("• Best For: Cash flow, growth potential\n")
                response_parts.append("• Entry Barrier: Moderate ($50K-$100K)\n\n")

                response_parts.append("**⚖️ Key Differences:**\n")
                response_parts.append("1. **Entry Cost:** Miami is more affordable ($450K vs $750K+)\n")
                response_parts.append("2. **Rental Yield:** Miami offers better cash flow (5-7% vs 4-6%)\n")
                response_parts.append("3. **Stability:** NYC is more established and stable\n")
                response_parts.append("4. **Growth:** Miami has faster population and price growth\n")
                response_parts.append("5. **Market Maturity:** NYC is mature, Miami is expanding\n\n")

                response_parts.append("**💡 Investment Recommendation:**\n")
                response_parts.append("• **Choose NYC if:** You want maximum stability, long-term appreciation, and can afford higher entry costs\n")
                response_parts.append("• **Choose Miami if:** You want better cash flow (rental yields), faster growth potential, and lower entry costs\n")
                response_parts.append("• **Best Strategy:** Consider fractional ownership in both markets for diversification!\n\n")

                return "".join(response_parts)


        response_parts.append("🔄 **Comparison Analysis**\n\n")
        response_parts.append("I can compare markets, properties, or investment strategies.\n\n")
        if market_knowledge:
            response_parts.append(f"Here's what I know:\n{market_knowledge[:500]}...\n\n")
        response_parts.append("Try asking: \"Compare NYC to Miami markets\" or \"Compare property A to property B\"\n")

        return "".join(response_parts)

    async def _generate_property_search_response(self, data: Dict, entities: Dict) -> str:
        properties = data.get("properties", [])

        response = "**🏠 Available Properties**\n\n"

        if properties:
            response += f"Found {len(properties)} properties:\n\n"
            for prop in properties[:5]:
                name = prop.get("property_name", "Property")
                location = prop.get("city", "Location")
                response += f"• **{name}** - {location}\n"
        else:
            response += "No properties found matching your criteria. Try adjusting your search.\n"

        return response

    async def _generate_general_response(self, message: str, entities: Dict, data: Dict) -> str:

    def _filter_properties(self, properties: List[Dict], entities: Dict, available_balance: float) -> List[Dict]:
        filtered = []
        budget = entities.get("budget")

        for prop in properties:

            token_price = prop.get("token_price", 50)
            if budget:
                if isinstance(budget, dict) and "max" in budget:
                    if token_price > budget["max"]:
                        continue


            location = entities.get("location")
            if location:
                prop_location = f"{prop.get('city', '')}, {prop.get('state', '')}"
                if location.lower() not in prop_location.lower():
                    continue

            filtered.append(prop)

        return filtered

    def _score_properties(self, properties: List[Dict], portfolio: Optional[Dict]) -> List[Dict]:
        scored = []
        for prop in properties:
            score = 0
            roi = (prop.get("annual_roi", 0) or prop.get("roi", 0)) * 100


            if roi > 10:
                score += 40
            elif roi > 8:
                score += 30
            elif roi > 6:
                score += 20


            risk = prop.get("risk_level", "medium").lower()
            if risk == "low":
                score += 20
            elif risk == "medium":
                score += 10

            scored.append({**prop, "_score": score})

        return sorted(scored, key=lambda x: x.get("_score", 0), reverse=True)

    def _generate_suggestions(self, intent: str, entities: Dict) -> List[str]:
        suggestions = []

        if intent == "investment_advice":
            suggestions = [
                "Show me properties under $500",
                "What's the best market for beginners?",
                "Compare NYC to Miami markets"
            ]
        elif intent == "market_analysis":
            suggestions = [
                "What properties are available in this market?",
                "Compare this market to others",
                "What's a good investment strategy here?"
            ]
        else:
            suggestions = [
                "What should I invest in?",
                "How is the market in NYC?",
                "Show me my portfolio"
            ]

        return suggestions

    def _generate_actions(self, intent: str, entities: Dict) -> List[Dict]:
        actions = []

        if intent == "investment_advice":
            actions.append({
                "type": "navigate",
                "label": "Browse Properties",
                "url": "/marketplace"
            })
        elif intent == "portfolio_inquiry":
            actions.append({
                "type": "navigate",
                "label": "View Portfolio",
                "url": "/portfolio"
            })

        return actions

    def _extract_market_indicators_from_insights(self, insights: List[Dict[str, Any]], location: str) -> str:
        if not insights:
            return ""

        indicators = []


        for insight in insights[:10]:
            text = insight.get("text", "").lower()
            relevance = insight.get("relevance", 0)


            if relevance < 0.5:
                continue


            price_match = re.search(r'\$[\d,]+(?:k|m|,\d{3})?', insight.get("text", ""), re.IGNORECASE)
            if price_match and ("price" in text or "median" in text or "home" in text):
                price = price_match.group(0)
                indicators.append(f"• Median Home Price: {price}")


            rent_match = re.search(r'\$[\d,]+(?:/month|/mo|per month)', insight.get("text", ""), re.IGNORECASE)
            if rent_match and "rent" in text:
                rent = rent_match.group(0)
                indicators.append(f"• Average Rent: {rent}")


            yield_match = re.search(r'(\d+(?:\.\d+)?)\s*%', insight.get("text", ""))
            if yield_match and ("yield" in text or "roi" in text or "return" in text):
                yield_pct = yield_match.group(1)
                indicators.append(f"• Rental Yield: {yield_pct}% annually")

        if indicators:
            return "**Key Market Indicators:**\n" + "\n".join(indicators[:8])
        return ""

    def _generate_recommendation_from_insights(self, web_understanding: Dict[str, Any], location: str) -> str:
        if not web_understanding:
            return ""

        synthesized = web_understanding.get("synthesized_info", "")
        insights = web_understanding.get("understood_insights", [])


        recommendation_parts = []


        if synthesized and len(synthesized) >= 100:

            sentences = re.split(r'[.!?]+', synthesized)
            relevant_sentences = []
            for sentence in sentences:
                sentence_lower = sentence.lower()
                if any(kw in sentence_lower for kw in ['investment', 'recommend', 'good', 'excellent', 'strong', 'yield', 'return', 'growth', 'opportunity']):
                    if len(sentence.strip()) >= 40:
                        relevant_sentences.append(sentence.strip())

            if relevant_sentences:
                recommendation_parts.append("💡 **Key Insights:**\n")
                for sentence in relevant_sentences[:5]:
                    recommendation_parts.append(f"• {sentence[:200]}\n")
                recommendation_parts.append("\n")


        if recommendation_parts:
            recommendation_parts.append(f"✅ **Recommendation:** Based on current market analysis for {location}, ")
            if synthesized:

                first_sentence = synthesized.split('.')[0] if '.' in synthesized else synthesized[:150]
                recommendation_parts.append(f"{first_sentence}. ")
            recommendation_parts.append("Consider fractional ownership as a way to participate in this market with lower capital requirements.\n")

        return "".join(recommendation_parts) if recommendation_parts else ""

    def _synthesize_pretrained_knowledge(
        self,
        prior_knowledge: List[Dict[str, Any]],
        location: str,
        prompt_lower: Optional[str] = None
    ) -> str:
        if not prior_knowledge:
            return ""


        sorted_knowledge = sorted(prior_knowledge, key=lambda x: x.get("similarity", x.get("relevance", 0)), reverse=True)


        market_texts = []
        location_lower = location.lower() if location else ""


        for item in sorted_knowledge[:10]:
            text = item.get("text", "")
            category = item.get("category", "")
            similarity = item.get("similarity", item.get("relevance", 0))
            if prompt_lower and text.strip().lower() == prompt_lower:
                continue
            if prompt_lower and prompt_lower in text.strip().lower() and len(text.strip()) <= len(prompt_lower) + 5:
                continue






            has_location = location and location_lower in text.lower()
            has_market_category = category in ["market_analysis", "investment_strategies", "gap_learning", "continuous_learning"]
            has_market_keywords = any(kw in text.lower() for kw in ["market", "real estate", "property", "price", "rent", "investment", "trend"])
            has_good_similarity = similarity > 0.2

            if (has_location or has_market_category or has_market_keywords) and has_good_similarity:
                if len(text.strip()) >= 30:
                    market_texts.append(text)

        if not market_texts:

            if location:
                for item in sorted_knowledge[:15]:
                    text = item.get("text", "")
                    if prompt_lower and text.strip().lower() == prompt_lower:
                        continue
                    if location_lower in text.lower() and len(text.strip()) >= 30:
                        market_texts.append(text)

        if not market_texts:
            return ""


        synthesized = ". ".join(market_texts[:5])
        if synthesized:

            if not re.search(r'[.!?]$', synthesized):
                synthesized += "."

            return synthesized[:1000]

        return ""

    def _generate_recommendation_from_knowledge(
        self,
        prior_knowledge: List[Dict[str, Any]],
        web_understanding: Dict[str, Any],
        location: str
    ) -> str:
        recommendation_parts = []


        if prior_knowledge:
            sorted_knowledge = sorted(prior_knowledge, key=lambda x: x.get("relevance", 0), reverse=True)


            investment_insights = []
            for item in sorted_knowledge[:5]:
                text = item.get("text", "").lower()
                if any(kw in text for kw in ['investment', 'recommend', 'good', 'excellent', 'strong', 'yield', 'return', 'opportunity']):
                    if len(item.get("text", "")) >= 40:
                        investment_insights.append(item.get("text", ""))

            if investment_insights:
                recommendation_parts.append("💡 **Key Insights:**\n")
                for insight in investment_insights[:4]:
                    recommendation_parts.append(f"• {insight[:200]}\n")
                recommendation_parts.append("\n")


        if web_understanding and web_understanding.get("synthesized_info"):
            synthesized = web_understanding.get("synthesized_info", "")
            if synthesized and len(synthesized) >= 100:

                sentences = re.split(r'[.!?]+', synthesized)
                relevant_sentences = []
                for sentence in sentences[:3]:
                    sentence = sentence.strip()
                    if len(sentence) >= 40 and any(kw in sentence.lower() for kw in ['market', 'price', 'rent', 'investment', 'growth', 'trend']):
                        relevant_sentences.append(sentence)

                if relevant_sentences and not recommendation_parts:
                    recommendation_parts.append("💡 **Key Insights:**\n")
                    for sentence in relevant_sentences:
                        recommendation_parts.append(f"• {sentence[:200]}\n")
                    recommendation_parts.append("\n")


        if recommendation_parts:
            recommendation_parts.append(f"✅ **Recommendation:** Based on comprehensive analysis of {location}, ")
            if prior_knowledge:

                top_knowledge = sorted(prior_knowledge, key=lambda x: x.get("relevance", 0), reverse=True)[0]
                rec_text = top_knowledge.get("text", "")
                if "investment" in rec_text.lower() or "recommend" in rec_text.lower():

                    sentences = re.split(r'[.!?]+', rec_text)
                    for sentence in sentences:
                        if len(sentence.strip()) >= 40:
                            recommendation_parts.append(f"{sentence.strip()}. ")
                            break
            recommendation_parts.append("Consider fractional ownership as a way to participate in this market with lower capital requirements.\n")

        return "".join(recommendation_parts) if recommendation_parts else ""

    def _extract_indicators_from_knowledge(self, prior_knowledge: List[Dict[str, Any]], location: str) -> str:
        if not prior_knowledge:
            return ""

        indicators = []
        location_lower = location.lower() if location else ""


        sorted_knowledge = sorted(prior_knowledge, key=lambda x: x.get("relevance", 0), reverse=True)

        for item in sorted_knowledge[:10]:
            text = item.get("text", "").lower()


            price_match = re.search(r'\$[\d,]+(?:k|m|,\d{3})?', item.get("text", ""), re.IGNORECASE)
            if price_match and ("price" in text or "median" in text or "home" in text) and location_lower in text:
                price = price_match.group(0)
                if f"Median Home Price: {price}" not in indicators:
                    indicators.append(f"• Median Home Price: {price}")


            rent_match = re.search(r'\$[\d,]+(?:/month|/mo|per month)', item.get("text", ""), re.IGNORECASE)
            if rent_match and "rent" in text and location_lower in text:
                rent = rent_match.group(0)
                if f"Average Rent: {rent}" not in indicators:
                    indicators.append(f"• Average Rent: {rent}")


            yield_match = re.search(r'(\d+(?:\.\d+)?)\s*%', item.get("text", ""))
            if yield_match and ("yield" in text or "roi" in text or "return" in text) and location_lower in text:
                yield_pct = yield_match.group(1)
                if f"Rental Yield: {yield_pct}% annually" not in indicators:
                    indicators.append(f"• Rental Yield: {yield_pct}% annually")


            if "vacancy" in text and location_lower in text:
                vacancy_match = re.search(r'(\d+(?:-\d+)?)\s*%', item.get("text", ""))
                if vacancy_match:
                    vacancy = vacancy_match.group(1)
                    if f"Vacancy Rate: {vacancy}%" not in indicators:
                        indicators.append(f"• Vacancy Rate: {vacancy}%")

            if "appreciation" in text and location_lower in text:
                appr_match = re.search(r'(\d+(?:-\d+)?)\s*%', item.get("text", ""))
                if appr_match:
                    appr = appr_match.group(1)
                    if f"Appreciation Rate: {appr}% per year" not in indicators:
                        indicators.append(f"• Appreciation Rate: {appr}% per year")

        if indicators:
            return "**Key Market Indicators:**\n" + "\n".join(indicators[:8])
        return ""

    def _extract_market_stats(
        self,
        prior_knowledge: List[Dict[str, Any]],
        market_knowledge: Optional[str],
        web_understanding: Optional[Dict[str, Any]] = None
    ) -> List[str]:
        stats: List[str] = []
        sources: List[str] = []

        for item in prior_knowledge or []:
            text = item.get("text", "")
            if text:
                sources.append(text)

        if market_knowledge:
            sources.append(market_knowledge)

        if web_understanding:
            synthesized = web_understanding.get("synthesized_info")
            if synthesized:
                sources.append(synthesized)
            for fact in web_understanding.get("key_facts", []) or []:
                if isinstance(fact, str):
                    sources.append(fact)

        pattern = re.compile(r'(?:\$\s?\d[\d,]*(?:\.\d+)?(?:\s?(?:million|billion|trillion|k|m))?|\d+(?:\.\d+)?%)')

        for text in sources:
            for match in pattern.findall(text):
                cleaned = match.strip()
                if cleaned and cleaned not in stats:
                    stats.append(cleaned)
            if len(stats) >= 12:
                break

        return stats

    def _build_default_market_template(self, location: str, stats_values: List[str]) -> str:
        if not location:
            location = "the market"

        price_stat = next((s for s in stats_values if "$" in s), "current sale comps")
        trend_stat = next((s for s in stats_values if "%" in s), "steady year-over-year momentum")
        inventory_stat = next((s for s in stats_values if "month" in s.lower()), "tight supply under three months of inventory")

        template_lines = [
            f"**📈 Price Trends**\n",
            f"• Median listing prices in the {location} real estate market are hovering around {price_stat}, reflecting consistent buyer demand for urban inventory.\n\n",
            f"**📊 Trend Overview**\n",
            f"• Transaction activity across the {location} real estate market shows {trend_stat} compared with last year as relocations and steady job growth keep liquidity healthy.\n\n",
            f"**🏠 Inventory & Supply**\n",
            f"• Available inventory within the {location} real estate market remains limited; {inventory_stat} keeps competition elevated and supports pricing power for sellers.\n\n",
            f"**💡 Investor Takeaway**\n",
            f"• Expect continued competition for quality listings in the {location} real estate market, so investors should be prepared with financing pre-arranged and focus on neighborhoods where rental demand remains durable.\n"
        ]

        return "".join(template_lines)

    def _get_default_market_summary(self, location: str) -> Optional[str]:
        if not location:
            return None
        summary = DEFAULT_MARKET_SUMMARIES.get(location.upper())
        if not summary:
            return None
        parts = [
            f"📊 **Market Analysis for {location}**\n\n",
            f"{summary['overview']}\n\n",
            "**📈 Price Trends**\n",
            f"• {summary['prices']}\n\n",
            "**📊 Market Trends**\n",
            f"• {summary['trends']}\n\n",
            "**🏠 Inventory & Supply**\n",
            f"• {summary['inventory']}\n\n",
            "**💡 Outlook & Strategy**\n",
            f"• {summary['outlook']}\n"
        ]
        return "".join(parts)

    def _compose_topic_section(
        self,
        header: str,
        keywords: List[str],
        location: str,
        prior_knowledge: List[Dict[str, Any]],
        market_knowledge: Optional[str],
        web_understanding: Optional[Dict[str, Any]],
        stats_list: List[str],
        indicator_text: Optional[str],
        market_data: Optional[Dict[str, Any]]
    ) -> str:
        header_line = header if header.endswith("\n") else f"{header}\n"
        lines: List[str] = [header_line]
        added_lines: Set[str] = set()
        matched = False
        location_lower = location.lower()

        def add_line(line: str) -> None:
            nonlocal matched
            cleaned = line.strip()
            if not cleaned:
                return
            if cleaned in added_lines:
                return
            lines.append(f"{cleaned if cleaned.startswith('•') else '• ' + cleaned}\n")
            added_lines.add(cleaned)
            matched = True


        if isinstance(market_data, dict):
            for key, value in market_data.items():
                if isinstance(value, dict):
                    for sub_key, sub_val in value.items():
                        if sub_val and any(k in sub_key.lower() for k in keywords):
                            add_line(f"{sub_key.replace('_', ' ').title()}: {sub_val}")
                elif value and any(k in key.lower() for k in keywords):
                    add_line(f"{key.replace('_', ' ').title()}: {value}")


        if indicator_text:
            for bullet in indicator_text.split("\n"):
                if bullet.strip().startswith("•") and any(k in bullet.lower() for k in keywords):
                    add_line(bullet.strip())


        for item in prior_knowledge:
            text = item.get("text", "")
            if not text:
                continue
            lower = text.lower()
            if location_lower and location_lower not in lower:
                continue
            if any(k in lower for k in keywords):
                for sentence in self._find_sentences_with_keywords(text, keywords):
                    add_line(sentence)


        if market_knowledge:
            for sentence in self._find_sentences_with_keywords(market_knowledge, keywords):
                add_line(sentence)


        if web_understanding:
            synthesized = web_understanding.get("synthesized_info", "")
            for sentence in self._find_sentences_with_keywords(synthesized, keywords):
                add_line(sentence)
            for takeaway in web_understanding.get("key_takeaways", []) or []:
                for sentence in self._find_sentences_with_keywords(takeaway, keywords):
                    add_line(sentence)
            for insight in web_understanding.get("understood_insights", []) or []:
                if isinstance(insight, dict):
                    text = insight.get("insight", "")
                    for sentence in self._find_sentences_with_keywords(text, keywords):
                        add_line(sentence)


        if not matched and stats_list:
            add_line(f"Key metric: {stats_list[0]} (latest reported value)")

        if matched and len(lines) > 1:
            return "".join(lines) + "\n"
        return ""

    def _find_sentences_with_keywords(self, text: str, keywords: List[str], max_sentences: int = 2) -> List[str]:
        if not text:
            return []
        sentences = re.split(r'(?<=[.!?])\s+', text)
        results: List[str] = []
        for sentence in sentences:
            cleaned = sentence.strip()
            if len(cleaned) < 50:
                continue
            lower = cleaned.lower()
            if any(keyword in lower for keyword in keywords):
                if not cleaned.endswith(('.', '!', '?')):
                    cleaned += '.'
                results.append(f"• {cleaned}")
            if len(results) >= max_sentences:
                break
        return results

    def _calculate_confidence(self, semantic_result: Dict, data: Dict, answer: str) -> float:
        base_confidence = semantic_result.get("confidence", 0.5)


        if data:
            base_confidence += 0.2


        if len(answer) > 200:
            base_confidence += 0.1

        return min(0.95, base_confidence)
