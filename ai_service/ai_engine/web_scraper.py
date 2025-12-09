import httpx
import asyncio
from typing import Dict, List, Any, Optional, Tuple
from datetime import datetime
import re
from urllib.parse import quote, urljoin, urlparse
import json

from bs4 import BeautifulSoup
from utils.logger import setup_logger

logger = setup_logger(__name__)


class IntelligentWebScraper:

    def __init__(self):
        self.client = httpx.AsyncClient(
            timeout=10.0,
            follow_redirects=True,
            headers={
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
            }
        )
        self.cache = {}
        self.learned_patterns = {}
        self.ready = False

    async def initialize(self):
        self.ready = True
        logger.info("[OK] Intelligent web scraper initialized")

    async def cleanup(self):
        await self.client.aclose()
        self.ready = False

    def is_ready(self) -> bool:
        return self.ready

    async def intelligent_search(
        self,
        query: str,
        max_results: int = 5,
        sources: Optional[List[str]] = None
    ) -> List[Dict[str, Any]]:
        results = []


        try:
            wikipedia_results = await asyncio.wait_for(
                self._search_wikipedia(query),
                timeout=5.0
            )
            if wikipedia_results:
                results.extend(wikipedia_results)
        except Exception as e:
            logger.debug(f"Wikipedia search failed: {e}")


        try:
            reddit_results = await asyncio.wait_for(
                self._search_reddit(query, max_results=3),
                timeout=5.0
            )
            if reddit_results:
                results.extend(reddit_results)
        except Exception as e:
            logger.debug(f"Reddit search failed: {e}")


        if len(results) < max_results:
            try:
                duckduckgo_results = await asyncio.wait_for(
                    self._search_duckduckgo(query, max_results),
                    timeout=5.0
                )
                if duckduckgo_results:
                    results.extend(duckduckgo_results)
            except Exception as e:
                logger.debug(f"DuckDuckGo search failed (using fallbacks): {e}")


        if not results:
            try:

                alt_query = query.replace(" ", "_")
                wikipedia_results = await asyncio.wait_for(
                    self._search_wikipedia(alt_query),
                    timeout=3.0
                )
                if wikipedia_results:
                    results.extend(wikipedia_results)
            except Exception:
                pass


        results = self._deduplicate_results(results)
        results = results[:max_results]

        return results

    async def _search_duckduckgo(self, query: str, max_results: int = 5) -> List[Dict[str, Any]]:
        try:

            url = f"https://html.duckduckgo.com/html/?q={quote(query)}"
            response = await self.client.get(url)

            if response.status_code != 200:
                return []

            soup = BeautifulSoup(response.text, 'html.parser')
            results = []


            result_divs = soup.find_all('div', class_='result')[:max_results]

            for div in result_divs:
                title_elem = div.find('a', class_='result__a')
                snippet_elem = div.find('a', class_='result__snippet')

                if title_elem:
                    title = title_elem.get_text(strip=True)
                    link = title_elem.get('href', '')


                    if link.startswith('//'):
                        link = 'https:' + link

                    snippet = snippet_elem.get_text(strip=True) if snippet_elem else ""

                    results.append({
                        "title": title,
                        "url": link,
                        "snippet": snippet,
                        "source": "DuckDuckGo"
                    })

            return results
        except Exception as e:

            logger.debug(f"DuckDuckGo search failed: {e}")
            return []

    async def _search_wikipedia(self, query: str) -> List[Dict[str, Any]]:
        try:

            url = "https://en.wikipedia.org/api/rest_v1/page/summary/" + quote(query)
            response = await self.client.get(url)

            if response.status_code == 200:
                data = response.json()
                if 'extract' in data:
                    return [{
                        "title": data.get('title', query),
                        "url": data.get('content_urls', {}).get('desktop', {}).get('page', ''),
                        "snippet": data.get('extract', ''),
                        "full_content": data.get('extract', ''),
                        "source": "Wikipedia"
                    }]
        except Exception as e:
            logger.debug(f"Wikipedia search failed for {query}: {e}")

        return []

    async def _search_reddit(self, query: str, max_results: int = 3) -> List[Dict[str, Any]]:
        try:

            url = f"https://www.reddit.com/search.json?q={quote(query)}&limit={max_results}"
            response = await self.client.get(url, headers={
                "User-Agent": "Mozilla/5.0"
            })

            if response.status_code == 200:
                data = response.json()
                results = []

                for post in data.get('data', {}).get('children', [])[:max_results]:
                    post_data = post.get('data', {})
                    results.append({
                        "title": post_data.get('title', ''),
                        "url": f"https://reddit.com{post_data.get('permalink', '')}",
                        "snippet": post_data.get('selftext', '')[:500],
                        "score": post_data.get('score', 0),
                        "source": "Reddit"
                    })

                return results
        except Exception as e:
            logger.debug(f"Reddit search failed: {e}")

        return []

    async def scrape_and_understand(
        self,
        url: str,
        query: Optional[str] = None
    ) -> Dict[str, Any]:
        try:
            response = await self.client.get(url)

            if response.status_code != 200:
                return {"error": f"Failed to fetch: {response.status_code}"}

            soup = BeautifulSoup(response.text, 'html.parser')


            content = self._extract_main_content(soup)


            title = soup.find('title')
            title_text = title.get_text(strip=True) if title else ""


            meta_desc = soup.find('meta', attrs={'name': 'description'})
            description = meta_desc.get('content', '') if meta_desc else ""


            structured_data = self._extract_structured_data(soup)


            relevant_info = self._extract_relevant_info(content, query) if query else content

            return {
                "url": url,
                "title": title_text,
                "description": description,
                "content": content[:5000],
                "relevant_info": relevant_info,
                "structured_data": structured_data,
                "scraped_at": datetime.utcnow().isoformat()
            }
        except Exception as e:
            logger.error(f"Error scraping {url}: {e}")
            return {"error": str(e)}

    def _extract_main_content(self, soup: BeautifulSoup) -> str:

        for script in soup(["script", "style", "nav", "header", "footer", "aside"]):
            script.decompose()


        main_content = (
            soup.find('main') or
            soup.find('article') or
            soup.find('div', class_=re.compile(r'content|main|article|post', re.I)) or
            soup.find('body')
        )

        if main_content:
            text = main_content.get_text(separator=' ', strip=True)

            text = re.sub(r'\s+', ' ', text)
            return text[:10000]

        return soup.get_text(separator=' ', strip=True)[:10000]

    def _extract_structured_data(self, soup: BeautifulSoup) -> Dict[str, Any]:
        structured = {}

        for script in soup.find_all('script', type='application/ld+json'):
            try:
                data = json.loads(script.string)
                structured.update(data)
            except:
                pass

        return structured

    def _extract_relevant_info(self, content: str, query: str) -> str:
        query_terms = query.lower().split()


        sentences = re.split(r'[.!?]+', content)
        relevant_sentences = []

        for sentence in sentences:
            sentence_lower = sentence.lower()
            relevance_score = sum(1 for term in query_terms if term in sentence_lower)

            if relevance_score > 0:
                relevant_sentences.append((sentence.strip(), relevance_score))


        relevant_sentences.sort(key=lambda x: x[1], reverse=True)
        relevant_text = ' '.join([s[0] for s in relevant_sentences[:10]])

        return relevant_text if relevant_text else content[:1000]

    def _deduplicate_results(self, results: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        seen_urls = set()
        unique_results = []

        for result in results:
            url = result.get('url', '')
            if url and url not in seen_urls:
                seen_urls.add(url)
                unique_results.append(result)

        return unique_results

    async def comprehensive_research(
        self,
        topic: str,
        max_sources: int = 5
    ) -> Dict[str, Any]:
        logger.info(f"Researching topic: {topic}")


        search_results = await self.intelligent_search(topic, max_results=max_sources)


        scraped_data = []
        tasks = []

        for result in search_results[:max_sources]:
            url = result.get('url')
            if url:
                tasks.append(self.scrape_and_understand(url, topic))

        if tasks:
            scraped_results = await asyncio.gather(*tasks, return_exceptions=True)

            for i, scraped in enumerate(scraped_results):
                if isinstance(scraped, dict) and 'error' not in scraped:
                    scraped_data.append({
                        **search_results[i],
                        **scraped
                    })


        synthesized_info = self._synthesize_information(scraped_data, topic)

        return {
            "topic": topic,
            "sources": scraped_data,
            "synthesized_info": synthesized_info,
            "key_facts": self._extract_key_facts(scraped_data, topic),
            "timestamp": datetime.utcnow().isoformat()
        }

    def _synthesize_information(
        self,
        scraped_data: List[Dict[str, Any]],
        topic: str
    ) -> str:
        if not scraped_data:
            return f"No information found about {topic}"


        topic_lower = topic.lower()
        topic_keywords = self._extract_topic_keywords(topic_lower)


        combined_info = []

        for data in scraped_data:
            relevant = data.get('relevant_info') or data.get('content', '') or data.get('snippet', '')
            if relevant:

                relevant = self._remove_junk_patterns(relevant)


                filtered_relevant = self._filter_for_relevance(relevant, topic_keywords, topic_lower)
                if filtered_relevant and len(filtered_relevant.strip()) > 50:
                    combined_info.append(filtered_relevant[:800])

        if not combined_info:
            return f"Found sources but no relevant information about {topic}"


        synthesized = ' '.join(combined_info)


        final_synthesis = self._extract_relevant_summary(synthesized, topic_keywords, topic_lower)


        if final_synthesis:
            final_synthesis = self._remove_junk_patterns(final_synthesis)

        return final_synthesis[:1500] if final_synthesis else synthesized[:1500]

    def _remove_junk_patterns(self, text: str) -> str:
        if not text:
            return ""


        junk_patterns = [
            r'Focus\):\s*',
            r'^[A-Z][a-z]+\):\s*',
            r'Members\s*•.*?(?=[A-Z]|$)',
            r'(Français|Русский|हिन्दी|Deutsch|Español|中文|한국어|Ελληνικά|Norsk|Türkçe|Magyar|ไทย|Bahasa|Português|日本語|Italiano)\s*•',
            r'\b(members|subscribers)\s*•',
            r'Cookie\s+Policy|Privacy\s+Policy|Terms\s+of\s+Service',
            r'Sign\s+up|Subscribe|Newsletter|Click\s+here',
            r'Read\s+more|Continue\s+reading|View\s+more',

            r'^[A-Z][a-z]+\s+\):\s*[A-Z][^.]{0,20}$',

            r'[•|·|▪|▫]{3,}',
        ]

        for pattern in junk_patterns:
            text = re.sub(pattern, '', text, flags=re.IGNORECASE | re.MULTILINE)


        lines = text.split('\n')
        cleaned_lines = []
        for line in lines:
            line_stripped = line.strip()
            if not line_stripped:
                continue

            uppercase_ratio = sum(1 for c in line_stripped if c.isupper()) / len(line_stripped) if line_stripped else 0
            special_char_ratio = sum(1 for c in line_stripped if c in '•|·|▪|▫|→|←|↑|↓') / len(line_stripped) if line_stripped else 0

            if uppercase_ratio > 0.7 and len(line_stripped) < 50:
                continue
            if special_char_ratio > 0.3:
                continue

            cleaned_lines.append(line_stripped)


        cleaned = ' '.join(cleaned_lines)
        cleaned = re.sub(r'\s+', ' ', cleaned)
        cleaned = re.sub(r'\s+([.!?])', r'\1', cleaned)

        return cleaned.strip()

    def _extract_topic_keywords(self, topic: str) -> List[str]:

        stopwords = {'the', 'is', 'are', 'for', 'in', 'on', 'at', 'to', 'a', 'an', 'and', 'or', 'but', 'how', 'what', 'where', 'when', 'why'}


        words = re.findall(r'\b[a-z]{3,}\b', topic.lower())
        keywords = [w for w in words if w not in stopwords and len(w) > 2]


        if any(word in topic for word in ['market', 'real estate', 'housing', 'property', 'investment']):
            keywords.extend(['market', 'real estate', 'housing', 'property', 'price', 'rent', 'investment', 'trend'])


        location_keywords = ['nyc', 'new york', 'miami', 'atlanta', 'chicago', 'los angeles', 'seattle', 'dallas']
        for loc in location_keywords:
            if loc in topic:
                keywords.append(loc)

        return list(set(keywords))

    def _filter_for_relevance(self, text: str, keywords: List[str], topic: str) -> str:
        if not keywords:
            return ""



        junk_patterns = [
            r'Members\s*•.*?(?=[A-Z]|$)',
            r'Français|Русский|हिन्दी|Deutsch|Español|中文|한국어|Ελληνικά|Norsk|Türkçe|Magyar|ไทย|Bahasa',
            r'\b(members|subscribers)\s*•',
            r'Cookie\s+Policy|Privacy\s+Policy|Terms\s+of\s+Service',
            r'Sign\s+up|Subscribe|Newsletter',
            r'Click\s+here|Read\s+more|Continue\s+reading'
        ]

        for pattern in junk_patterns:
            text = re.sub(pattern, '', text, flags=re.IGNORECASE)

        sentences = re.split(r'[.!?]+', text)
        relevant_sentences = []

        for sentence in sentences:
            sentence_stripped = sentence.strip()
            sentence_lower = sentence_stripped.lower()


            if len(sentence_stripped) < 25:
                continue



            has_language_names = bool(re.search(r'(Français|Русский|हिन्दी|Deutsch|Español|中文|한국어|Ελληνικά|Norsk|Türkçe|Magyar|ไทย|Bahasa|Português|日本語|Italiano)', sentence, re.IGNORECASE))
            has_members_pattern = bool(re.search(r'Members\s*•|subscribers?\s*•', sentence, re.IGNORECASE))
            has_mostly_special_chars = len(re.findall(r'[•|·|▪|▫|→|←|↑|↓]', sentence)) > 2
            has_excessive_whitespace = len(re.findall(r'\s{3,}', sentence)) > 0

            if has_language_names or has_members_pattern or has_mostly_special_chars or has_excessive_whitespace:
                continue


            keyword_matches = sum(1 for keyword in keywords if keyword in sentence_lower)
            topic_word_matches = sum(1 for word in topic.split() if len(word) > 3 and word in sentence_lower)


            irrelevant_patterns = [
                r'\b(mba|graduate|school|college|degree|job market|career|salary|employer|hiring)\b',
                r'\b(reddit|subreddit|user|post|comment|upvote|downvote|karma)\b',
                r'\b(cookie|privacy|terms|subscribe|newsletter|sign up|sign in|log in)\b',
                r'\b(deadline|breaking news|latest news|trending)\b',
                r'\b(click|view|read more|continue reading|show more)\b'
            ]

            has_irrelevant = any(re.search(pattern, sentence_lower) for pattern in irrelevant_patterns)


            if (keyword_matches > 0 or topic_word_matches > 1) and not has_irrelevant:
                score = keyword_matches * 2 + topic_word_matches
                relevant_sentences.append((sentence_stripped, score))


        if not relevant_sentences:
            return ""

        relevant_sentences.sort(key=lambda x: x[1], reverse=True)

        if relevant_sentences[0][1] < 1:
            return ""

        filtered_text = ' '.join([s[0] for s in relevant_sentences[:12]])

        return filtered_text

    def _extract_relevant_summary(self, text: str, keywords: List[str], topic: str) -> str:
        if not keywords:
            return text


        paragraphs = re.split(r'\n\n+', text)
        relevant_paragraphs = []

        for para in paragraphs:
            para_lower = para.lower()
            keyword_count = sum(1 for keyword in keywords if keyword in para_lower)


            if keyword_count >= 2:
                relevant_paragraphs.append((para, keyword_count))

        if relevant_paragraphs:
            relevant_paragraphs.sort(key=lambda x: x[1], reverse=True)
            return ' '.join([p[0] for p in relevant_paragraphs[:5]])

        return text

    def _extract_key_facts(self, scraped_data: List[Dict[str, Any]], topic: str = "") -> List[str]:
        facts = []


        if not topic and scraped_data and scraped_data[0].get('title'):
            topic = scraped_data[0].get('title', '').lower()

        topic_lower = topic.lower() if topic else ""
        topic_keywords = self._extract_topic_keywords(topic_lower) if topic else []

        for data in scraped_data:
            snippet = data.get('snippet', '')
            relevant = data.get('relevant_info', '')


            text = relevant or snippet


            sentences = re.split(r'[.!?]+', text)

            for sentence in sentences:
                line = sentence.strip()
                if len(line) < 30:
                    continue

                line_lower = line.lower()


                irrelevant_patterns = [
                    r'\b(mba|graduate|school|college|degree|job market|career)\b',
                    r'\b(reddit|subreddit|user|post|comment|upvote)\b',
                    r'\b(cookie|privacy|terms|subscribe|newsletter)\b',
                    r'\b(click here|read more|learn more|sign up)\b'
                ]

                if any(re.search(pattern, line_lower) for pattern in irrelevant_patterns):
                    continue

                # Check if it's a relevant fact
                is_bullet_point = (line.startswith('•') or line.startswith('-') or re.match(r'^\d+[\.\)]', line))
                has_keywords = topic_keywords and any(keyword in line_lower for keyword in topic_keywords)
                is_substantive = len(line) > 50 and any(word in line_lower for word in ['is', 'are', 'has', 'have', 'can', 'will', 'price', 'market', 'rent', 'property', 'investment'])

                # Include if it's a bullet point OR has relevant keywords OR is substantive
                if is_bullet_point or has_keywords or (is_substantive and len(facts) < 5):

                    if topic_lower and any(word in topic_lower for word in ['market', 'real estate', 'housing', 'property']):
                        if any(word in line_lower for word in ['market', 'real estate', 'housing', 'property', 'price', 'rent', 'investment', 'trend', 'appreciation', 'yield', 'vacancy']):
                            facts.append(line[:300])
                    else:
                        facts.append(line[:300])

                    if len(facts) >= 8:
                        break

            if len(facts) >= 8:
                break

        return facts[:8]

    async def get_market_data_from_web(self, location: str) -> Dict[str, Any]:
        queries = [
            f"real estate market {location} 2024",
            f"housing prices {location}",
            f"rental market {location}",
            f"property market trends {location}"
        ]

        all_results = []

        for query in queries:
            research = await self.comprehensive_research(query, max_sources=2)
            all_results.append(research)


        market_data = {
            "location": location,
            "sources": [],
            "data": {
                "market_analysis": [],
                "price_trends": [],
                "rental_data": [],
                "news_updates": []
            }
        }

        for research in all_results:
            market_data["sources"].extend([s.get("source", "Web") for s in research.get("sources", [])])
            market_data["data"]["market_analysis"].append(research.get("synthesized_info", ""))
            market_data["data"]["price_trends"].extend(research.get("key_facts", []))

        return market_data

    async def learn_from_content(self, content: str, topic: str):

        self.learned_patterns[topic] = {
            "content_sample": content[:500],
            "learned_at": datetime.utcnow().isoformat()
        }
