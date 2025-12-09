from typing import Dict, List, Any, Optional
from supabase import create_client, Client
import httpx

from config import settings
from utils.logger import setup_logger

logger = setup_logger(__name__)


class DataRetrievalService:

    def __init__(self):
        self.supabase: Optional[Client] = None
        self.ready = False

    async def initialize(self):
        logger.info("Initializing data retrieval service...")

        try:
            if not settings.supabase_url or not settings.supabase_key:
                logger.warning("Supabase credentials not configured - data service will work in offline mode")
                self.ready = True
                return

            self.supabase = create_client(settings.supabase_url, settings.supabase_key)

            try:
                import asyncio

                loop = asyncio.get_event_loop()
                result = await asyncio.wait_for(
                    loop.run_in_executor(
                        None,
                        lambda: self.supabase.table("demo_properties").select("id").limit(1).execute()
                    ),
                    timeout=5.0
                )
                self.ready = True
                logger.info("Data retrieval service initialized and connected to Supabase")
            except asyncio.TimeoutError:
                logger.warning("Supabase connection timeout - service will work in offline mode using knowledge base only")
                self.ready = True
            except Exception as conn_error:
                logger.warning(f"Could not connect to Supabase database: {conn_error}. Service will work in offline mode using knowledge base only.")
                self.ready = True
        except Exception as e:
            logger.warning(f"Data service initialization issue: {e}. Service will work in offline mode.")
            self.ready = True

    def is_ready(self) -> bool:
        return self.ready

    async def fetch_properties(self, filters: Dict[str, Any]) -> List[Dict[str, Any]]:
        if not self.ready or not self.supabase:
            logger.debug("Data service not ready, returning empty properties list")
            return []

        try:
            query = self.supabase.table("demo_properties").select("*").eq("is_active", True)


            if "location" in filters:
                location = filters["location"]
                if isinstance(location, str):
                    query = query.or_(f"city.ilike.%{location}%,state.ilike.%{location}%")

            if "budget" in filters:
                budget = filters["budget"]
                if isinstance(budget, dict) and "max" in budget:
                    query = query.lte("token_price", budget["max"])

            response = query.execute()
            return response.data if response.data else []
        except (httpx.ConnectError, httpx.ConnectTimeout, Exception) as e:

            logger.debug(f"Database unavailable for properties fetch: {type(e).__name__}")
            return []

    async def fetch_portfolio(self, user_id: str) -> Optional[Dict[str, Any]]:
        if not self.ready or not self.supabase:
            logger.debug("Data service not ready, returning None for portfolio")
            return None

        try:


            response = self.supabase.table("user_portfolios").select("*").eq("user_id", user_id).execute()
            return response.data[0] if response.data else None
        except (httpx.ConnectError, httpx.ConnectTimeout, Exception) as e:

            logger.debug(f"Database unavailable for portfolio fetch: {type(e).__name__}")
            return None

    async def fetch_investments(self, user_id: str) -> List[Dict[str, Any]]:
        if not self.ready or not self.supabase:
            logger.debug("Data service not ready, returning empty investments list")
            return []

        try:
            response = self.supabase.table("investments").select("*,demo_properties(*)").eq("user_id", user_id).execute()
            return response.data if response.data else []
        except (httpx.ConnectError, httpx.ConnectTimeout, Exception) as e:

            logger.debug(f"Database unavailable for investments fetch: {type(e).__name__}")
            return []

    async def fetch_wallet(self, user_id: str) -> Optional[Dict[str, Any]]:
        if not self.ready or not self.supabase:
            logger.debug("Data service not ready, returning None for wallet")
            return None

        try:
            response = self.supabase.table("user_wallets").select("*").eq("user_id", user_id).execute()
            return response.data[0] if response.data else None
        except (httpx.ConnectError, httpx.ConnectTimeout, Exception) as e:

            logger.debug(f"Database unavailable for wallet fetch: {type(e).__name__}")
            return None

    async def fetch_market_data(self, location: str) -> Optional[Dict[str, Any]]:
        if not self.ready or not self.supabase:
            logger.debug("Data service not ready, returning None for market data")
            return None

        try:

            parts = location.split(",")
            city = parts[0].strip()
            state = parts[1].strip() if len(parts) > 1 else ""



            query = self.supabase.table("market_trends").select("*")
            if city:
                query = query.ilike("city", f"%{city}%")
            if state:
                query = query.ilike("state", f"%{state}%")

            response = query.execute()
            return response.data[0] if response.data else None
        except (httpx.ConnectError, httpx.ConnectTimeout, Exception) as e:

            logger.debug(f"Database unavailable for market data fetch: {type(e).__name__}")
            return None
