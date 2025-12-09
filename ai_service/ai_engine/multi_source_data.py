from typing import Dict, List, Any, Optional
import asyncio
from datetime import datetime, timedelta
import json

from config import settings
from utils.logger import setup_logger

logger = setup_logger(__name__)


class MultiSourceDataService:

    def __init__(self, data_service):
        self.data_service = data_service
        self.web_scraper = None
        self.ready = False
        self.cache = {}
        self.cache_ttl = 3600

    async def initialize(self):
        logger.info("Initializing multi-source data service with web scraping...")
        try:

            from ai_engine.web_scraper import IntelligentWebScraper
            self.web_scraper = IntelligentWebScraper()
            await self.web_scraper.initialize()
            self.ready = True
            logger.info("[OK] Multi-source data service initialized with intelligent web scraping")
        except Exception as e:
            logger.warning(f"Web scraper not available: {e} - continuing without web data")
            self.ready = True

    def is_ready(self) -> bool:
        return self.ready

    async def fetch_market_data(
        self,
        location: str,
        include_external: bool = True
    ) -> Dict[str, Any]:

        if not location or not isinstance(location, str):
            logger.warning(f"Invalid location provided: {location}, type: {type(location)}")
            return {
                "location": location or "Unknown",
                "sources": [],
                "data": {}
            }

        logger.debug(f"fetch_market_data called with location: '{location}'")
        market_data = {
            "location": location,
            "sources": [],
            "data": {}
        }


        try:
            platform_data = await self.data_service.fetch_market_data(location)
            if platform_data:
                market_data["data"]["platform"] = platform_data
                market_data["sources"].append("Platform Database")
        except Exception as e:
            logger.warning(f"Error fetching platform market data: {e}")


        if include_external:

            external_data = await self._fetch_external_market_data(location)
            market_data["data"].update(external_data)
            market_data["sources"].extend(external_data.get("sources", []))

        return market_data

    async def _fetch_external_market_data(self, location: str) -> Dict[str, Any]:
        external_data = {
            "sources": [],
            "economic_indicators": {},
            "market_news": [],
            "demographics": {},
            "market_trends": {},
            "scraped_data": {}
        }

        if not self.web_scraper:
            logger.warning("Web scraper not initialized")
            return external_data

        try:


            if not location or location.strip() == "":
                logger.warning("Location is empty or None, skipping market data fetch")
                return external_data


            logger.info(f"Scraping market data for {location} (with 5s timeout)...")
            try:
                market_data = await asyncio.wait_for(
                    self.web_scraper.get_market_data_from_web(location),
                    timeout=5.0
                )
                external_data.update(market_data)
                external_data["sources"].extend(market_data.get("sources", []))
            except asyncio.TimeoutError:
                logger.warning(f"Market data scraping timed out for {location} - using cached/prior knowledge")



            economic_queries = [
                f"unemployment rate {location}",
                f"job market {location}",
                f"economic growth {location}"
            ]

            for query in economic_queries:
                try:
                    research = await asyncio.wait_for(
                        self.web_scraper.comprehensive_research(query, max_sources=2),
                        timeout=3.0
                    )
                    if research.get("synthesized_info"):
                        external_data["economic_indicators"][query] = research.get("synthesized_info")
                        external_data["sources"].extend([s.get("source", "Web") for s in research.get("sources", [])])
                except asyncio.TimeoutError:
                    logger.debug(f"Economic indicator query timed out: {query}")
                    continue

            logger.info(f"Scraped market data from {len(external_data['sources'])} sources")

        except Exception as e:
            logger.error(f"Error fetching market data via web scraping: {e}", exc_info=True)

        return external_data

    async def _fetch_economic_indicators(self, location: str) -> Dict[str, Any]:
        try:

            state = self._extract_state(location)





            return {
                "economic_indicators": {
                    "unemployment_rate": None,
                    "gdp_growth": None,
                    "median_income": None,
                    "population_growth": None
                },
                "sources": ["Economic Data APIs"]
            }
        except Exception as e:
            logger.warning(f"Error fetching economic indicators: {e}")
            return {}

    async def _fetch_real_estate_trends(self, location: str) -> Dict[str, Any]:
        try:



            return {
                "real_estate_trends": {
                    "median_home_price": None,
                    "price_change_yoy": None,
                    "inventory_levels": None,
                    "days_on_market": None
                },
                "sources": ["Real Estate APIs"]
            }
        except Exception as e:
            logger.warning(f"Error fetching real estate trends: {e}")
            return {}

    async def _fetch_market_news(self, location: str) -> Dict[str, Any]:
        try:


            return {
                "market_news": [],
                "sources": ["News APIs"]
            }
        except Exception as e:
            logger.warning(f"Error fetching market news: {e}")
            return {}

    async def fetch_property_insights(
        self,
        property_id: Optional[str] = None,
        filters: Optional[Dict] = None
    ) -> Dict[str, Any]:
        insights = {
            "property_data": {},
            "market_comparison": {},
            "investment_analysis": {},
            "sources": []
        }


        try:
            if property_id:

                properties = await self.data_service.fetch_properties({"id": property_id})
            else:
                properties = await self.data_service.fetch_properties(filters or {})

            if properties:
                insights["property_data"]["platform"] = properties
                insights["sources"].append("Platform Database")
        except Exception as e:
            logger.warning(f"Error fetching property data: {e}")


        external_insights = await self._fetch_external_property_insights(
            property_id, filters
        )
        insights.update(external_insights)

        return insights

    async def _fetch_external_property_insights(
        self,
        property_id: Optional[str],
        filters: Optional[Dict]
    ) -> Dict[str, Any]:

        return {
            "external_data": {},
            "sources": []
        }

    async def fetch_investment_advice_data(
        self,
        user_context: Dict[str, Any]
    ) -> Dict[str, Any]:
        advice_data = {
            "user_context": user_context,
            "properties": [],
            "market_data": {},
            "trends": {},
            "recommendations": {},
            "sources": []
        }

        # Fetch user's current portfolio
        try:
            if user_context.get("user_id"):
                portfolio = await self.data_service.fetch_portfolio(user_context["user_id"])
                investments = await self.data_service.fetch_investments(user_context["user_id"])

                advice_data["user_context"]["portfolio"] = portfolio
                advice_data["user_context"]["investments"] = investments
                advice_data["sources"].append("User Portfolio")
        except Exception as e:
            logger.warning(f"Error fetching user portfolio: {e}")


        try:
            filters = user_context.get("filters", {})
            properties = await self.data_service.fetch_properties(filters)
            advice_data["properties"] = properties
            advice_data["sources"].append("Properties Database")
        except Exception as e:
            logger.warning(f"Error fetching properties: {e}")


        locations = self._extract_locations_from_context(user_context)
        for location in locations:
            market_data = await self.fetch_market_data(location, include_external=True)
            advice_data["market_data"][location] = market_data
            advice_data["sources"].extend(market_data.get("sources", []))

        return advice_data

    def _extract_state(self, location: str) -> Optional[str]:

        parts = location.split(",")
        if len(parts) > 1:
            return parts[-1].strip()

        state_map = {
            "NYC": "NY", "New York": "NY",
            "LA": "CA", "Los Angeles": "CA",
            "Miami": "FL", "Chicago": "IL",
            "Atlanta": "GA", "Seattle": "WA"
        }

        return state_map.get(location, None)

    def _extract_locations_from_context(self, context: Dict[str, Any]) -> List[str]:
        locations = []


        if "filters" in context and "location" in context["filters"]:
            locations.append(context["filters"]["location"])


        if "entities" in context and "location" in context["entities"]:
            locations.append(context["entities"]["location"])


        if "investments" in context:
            for investment in context["investments"]:
                prop = investment.get("demo_properties")
                if prop and "city" in prop:
                    location = f"{prop['city']}, {prop.get('state', '')}"
                    if location not in locations:
                        locations.append(location)

        return locations

    async def fetch_learning_data(
        self,
        topic: str,
        intent: str
    ) -> Dict[str, Any]:
        learning_data = {
            "topic": topic,
            "intent": intent,
            "sources": [],
            "data": {}
        }




        return learning_data
