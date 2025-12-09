import httpx
import asyncio
from typing import Dict, List, Any, Optional
from datetime import datetime, timedelta
import os
import json

from config import settings
from utils.logger import setup_logger

logger = setup_logger(__name__)


class ExternalAPIService:

    def __init__(self):
        self.api_keys = {
            "fred": os.getenv("FRED_API_KEY", ""),
            "alpha_vantage": os.getenv("ALPHA_VANTAGE_API_KEY", ""),
            "news_api": os.getenv("NEWS_API_KEY", ""),
            "zillow": os.getenv("ZILLOW_API_KEY", ""),
            "census": os.getenv("CENSUS_API_KEY", ""),
            "google_maps": os.getenv("GOOGLE_MAPS_API_KEY", ""),
            "openai": os.getenv("OPENAI_API_KEY", ""),
            "bls": os.getenv("BLS_API_KEY", ""),
        }
        self.client = httpx.AsyncClient(timeout=30.0)
        self.cache = {}
        self.cache_ttl = 3600

    async def fetch_fred_data(self, series_id: str, start_date: Optional[str] = None) -> Optional[Dict]:
        if not self.api_keys["fred"]:
            logger.warning("FRED API key not configured")
            return None

        cache_key = f"fred_{series_id}_{start_date}"
        if cache_key in self.cache:
            cached_data, cached_time = self.cache[cache_key]
            if (datetime.now() - cached_time).seconds < self.cache_ttl:
                return cached_data

        url = "https://api.stlouisfed.org/fred/series/observations"
        params = {
            "series_id": series_id,
            "api_key": self.api_keys["fred"],
            "file_type": "json"
        }
        if start_date:
            params["observation_start"] = start_date

        try:
            response = await self.client.get(url, params=params)
            data = response.json()
            if "observations" in data:
                self.cache[cache_key] = (data, datetime.now())
                return data
            return None
        except Exception as e:
            logger.error(f"Error fetching FRED data for {series_id}: {e}")
            return None

    async def fetch_news(self, query: str, limit: int = 5) -> List[Dict]:
        if not self.api_keys["news_api"]:
            logger.warning("NewsAPI key not configured")
            return []

        cache_key = f"news_{query}_{limit}"
        if cache_key in self.cache:
            cached_data, cached_time = self.cache[cache_key]
            if (datetime.now() - cached_time).seconds < 600:
                return cached_data

        url = "https://newsapi.org/v2/everything"
        params = {
            "q": query,
            "apiKey": self.api_keys["news_api"],
            "pageSize": limit,
            "sortBy": "publishedAt",
            "language": "en"
        }

        try:
            response = await self.client.get(url, params=params)
            data = response.json()
            articles = data.get("articles", [])
            self.cache[cache_key] = (articles, datetime.now())
            return articles
        except Exception as e:
            logger.error(f"Error fetching news for {query}: {e}")
            return []

    async def fetch_census_data(self, dataset: str, variables: List[str], geography: str) -> Optional[Dict]:
        if not self.api_keys["census"]:
            logger.warning("Census API key not configured")
            return None

        cache_key = f"census_{dataset}_{'_'.join(variables)}_{geography}"
        if cache_key in self.cache:
            cached_data, cached_time = self.cache[cache_key]
            if (datetime.now() - cached_time).seconds < self.cache_ttl:
                return cached_data

        url = f"https://api.census.gov/data/{dataset}"
        params = {
            "get": ",".join(variables),
            "for": geography,
            "key": self.api_keys["census"]
        }

        try:
            response = await self.client.get(url, params=params)
            data = response.json()
            self.cache[cache_key] = (data, datetime.now())
            return data
        except Exception as e:
            logger.error(f"Error fetching census data: {e}")
            return None

    async def fetch_yfinance_data(self, symbol: str, period: str = "1y") -> Optional[Dict]:
        try:
            import yfinance as yf
            ticker = yf.Ticker(symbol)
            data = ticker.history(period=period)
            return {
                "symbol": symbol,
                "data": data.to_dict(),
                "info": ticker.info
            }
        except ImportError:
            logger.warning("yfinance not installed. Install with: pip install yfinance")
            return None
        except Exception as e:
            logger.error(f"Error fetching yfinance data for {symbol}: {e}")
            return None

    async def fetch_bls_data(self, series_id: str, start_year: str = None, end_year: str = None) -> Optional[Dict]:
        if not self.api_keys["bls"]:
            logger.warning("BLS API key not configured")
            return None

        url = "https://api.bls.gov/publicAPI/v2/timeseries/data/"

        payload = {
            "seriesid": [series_id],
            "registrationkey": self.api_keys["bls"]
        }

        if start_year and end_year:
            payload["startyear"] = start_year
            payload["endyear"] = end_year

        try:
            response = await self.client.post(url, json=payload)
            data = response.json()
            return data
        except Exception as e:
            logger.error(f"Error fetching BLS data: {e}")
            return None

    async def geocode_location(self, location: str) -> Optional[Dict]:
        if not self.api_keys["google_maps"]:
            logger.warning("Google Maps API key not configured")
            return None

        url = "https://maps.googleapis.com/maps/api/geocode/json"
        params = {
            "address": location,
            "key": self.api_keys["google_maps"]
        }

        try:
            response = await self.client.get(url, params=params)
            data = response.json()
            if data.get("status") == "OK" and data.get("results"):
                return data["results"][0]
            return None
        except Exception as e:
            logger.error(f"Error geocoding location {location}: {e}")
            return None

    async def fetch_market_intelligence(self, location: str) -> Dict[str, Any]:
        intelligence = {
            "location": location,
            "sources": [],
            "data": {}
        }


        tasks = [
            self.fetch_fred_data("UNRATE", start_date="2023-01-01"),
            self.fetch_fred_data("INTDSRUSM193N", start_date="2023-01-01"),
            self.fetch_news(f"real estate {location}", limit=5),
            self.fetch_yfinance_data("^GSPC", period="1y"),
        ]

        results = await asyncio.gather(*tasks, return_exceptions=True)

        if isinstance(results[0], dict):
            intelligence["data"]["unemployment"] = results[0]
            intelligence["sources"].append("FRED API")

        if isinstance(results[1], dict):
            intelligence["data"]["interest_rates"] = results[1]
            intelligence["sources"].append("FRED API")

        if isinstance(results[2], list):
            intelligence["data"]["news"] = results[2]
            intelligence["sources"].append("NewsAPI")

        if isinstance(results[3], dict):
            intelligence["data"]["market_trends"] = results[3]
            intelligence["sources"].append("Yahoo Finance")


        geocode_result = await self.geocode_location(location)
        if geocode_result:
            intelligence["data"]["geography"] = geocode_result
            intelligence["sources"].append("Google Maps API")

        return intelligence

    async def cleanup(self):
        await self.client.aclose()

    def is_api_available(self, api_name: str) -> bool:
        return bool(self.api_keys.get(api_name, ""))
