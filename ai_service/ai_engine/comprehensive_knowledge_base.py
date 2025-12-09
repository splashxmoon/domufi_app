from typing import Dict, List, Any, Optional
import json
from datetime import datetime

logger = None

def get_logger():
    global logger
    if logger is None:
        from utils.logger import setup_logger
        logger = setup_logger(__name__)
    return logger


class ComprehensiveKnowledgeBase:

    @staticmethod
    def get_real_estate_investment_knowledge() -> Dict[str, Any]:
        return {
            "investment_strategies": {
                "buy_and_hold": {
                    "description": "Long-term investment strategy where you purchase properties and hold them for rental income and appreciation",
                    "benefits": ["Steady cash flow", "Property appreciation", "Tax benefits", "Hedge against inflation"],
                    "best_for": "Investors seeking long-term wealth building and passive income",
                    "time_horizon": "5-30+ years",
                    "risk_level": "Medium to High",
                    "key_metrics": ["Cash-on-cash return", "Cap rate", "ROI", "Appreciation rate"]
                },
                "diversification": {
                    "description": "Spreading investments across multiple properties, locations, and property types to reduce risk",
                    "benefits": ["Risk reduction", "Market exposure", "Income stability", "Growth opportunities"],
                    "best_for": "All investors, especially beginners",
                    "strategy": "Invest in 5-10 different properties across different markets",
                    "property_types": ["Residential", "Commercial", "Mixed-use", "Industrial"],
                    "geographic_diversification": "Invest in multiple cities/states to reduce location-specific risk"
                },
                "value_investing": {
                    "description": "Finding undervalued properties in good locations with growth potential",
                    "indicators": ["Below market prices", "Rising neighborhoods", "Infrastructure development", "Job growth"],
                    "analysis_factors": ["Comparable sales", "Rental yields", "Future development plans", "Demographics"]
                },
                "cash_flow_focus": {
                    "description": "Prioritizing properties that generate positive monthly cash flow",
                    "target_metrics": ["Positive cash flow", "Cash-on-cash return > 8%", "Low vacancy rates"],
                    "best_locations": "Markets with strong rental demand and reasonable property prices"
                },
                "appreciation_focus": {
                    "description": "Investing in properties in high-growth areas expected to appreciate significantly",
                    "target_metrics": ["High growth potential", "Population growth", "Economic development"],
                    "best_locations": "Emerging markets, tech hubs, areas with planned infrastructure"
                }
            },

            "investment_metrics": {
                "roi_return_on_investment": {
                    "definition": "Total return on investment as a percentage of initial investment",
                    "formula": "(Total Return - Initial Investment) / Initial Investment × 100%",
                    "good_range": "8-15% annually is considered good for real estate",
                    "calculation": {
                        "example": "If you invest $10,000 and receive $1,200 in returns, ROI = (1,200/10,000) × 100% = 12%"
                    }
                },
                "cash_on_cash_return": {
                    "definition": "Annual cash flow divided by total cash invested",
                    "formula": "Annual Cash Flow / Total Cash Invested × 100%",
                    "good_range": "6-10% is good, 10%+ is excellent",
                    "calculation": {
                        "example": "If you invest $10,000 and receive $800/year in cash flow, Cash-on-Cash = 8%"
                    }
                },
                "cap_rate_capitalization_rate": {
                    "definition": "Net operating income divided by property value",
                    "formula": "Net Operating Income (NOI) / Property Value × 100%",
                    "good_range": "4-8% depending on market",
                    "use_case": "Comparing investment properties in same market"
                },
                "rental_yield": {
                    "definition": "Annual rental income as percentage of property value",
                    "formula": "Annual Rental Income / Property Value × 100%",
                    "good_range": "5-10% depending on location and property type",
                    "types": ["Gross yield", "Net yield (after expenses)"]
                },
                "debt_service_coverage_ratio": {
                    "definition": "Property's ability to cover debt payments",
                    "formula": "Net Operating Income / Annual Debt Service",
                    "good_range": "1.25-1.5x minimum",
                    "significance": "Higher DSCR = safer investment"
                },
                "net_operating_income": {
                    "definition": "Property's income minus operating expenses (excluding debt)",
                    "formula": "Gross Rental Income - Operating Expenses",
                    "components": {
                        "income": ["Rental income", "Other income (parking, storage)"],
                        "expenses": ["Property management", "Maintenance", "Insurance", "Property taxes", "Utilities", "Vacancy allowance"]
                    }
                }
            },

            "property_types": {
                "residential": {
                    "types": ["Single-family homes", "Multi-family (2-4 units)", "Condos", "Townhouses"],
                    "pros": ["Higher rental demand", "Easier to understand", "More liquid"],
                    "cons": ["Lower returns than commercial", "More maintenance", "Tenant turnover"],
                    "best_for": "Beginner investors, diversification"
                },
                "commercial": {
                    "types": ["Office buildings", "Retail spaces", "Warehouses", "Mixed-use"],
                    "pros": ["Higher returns", "Longer leases", "Tenants pay expenses"],
                    "cons": ["Higher entry cost", "More complex", "Less liquid"],
                    "best_for": "Experienced investors, larger portfolios"
                },
                "industrial": {
                    "types": ["Warehouses", "Manufacturing", "Distribution centers"],
                    "pros": ["Long leases", "Low maintenance", "Growing demand"],
                    "cons": ["Location dependent", "Large capital required"],
                    "trend": "Growing due to e-commerce"
                }
            },

            "risk_factors": {
                "market_risk": {
                    "description": "Property values decline due to economic conditions",
                    "mitigation": ["Diversification", "Long-term hold", "Location research", "Market timing awareness"]
                },
                "liquidity_risk": {
                    "description": "Difficulty selling property quickly at fair price",
                    "mitigation": ["Fractional ownership (tokens)", "Diversification", "Market research"]
                },
                "tenant_risk": {
                    "description": "Non-payment, damage, vacancy",
                    "mitigation": ["Tenant screening", "Proper insurance", "Professional management", "Emergency fund"]
                },
                "location_risk": {
                    "description": "Declining neighborhood, economic downturn in area",
                    "mitigation": ["Research demographics", "Job market analysis", "Infrastructure plans", "Diversify locations"]
                },
                "interest_rate_risk": {
                    "description": "Rising rates affect property values and financing costs",
                    "mitigation": ["Fixed-rate financing", "Cash purchases", "Rate monitoring"]
                }
            },

            "investment_timeline": {
                "short_term_1_3_years": {
                    "strategy": "Fix-and-flip, quick appreciation plays",
                    "risk": "High",
                    "returns": "Variable, potentially high",
                    "best_for": "Active investors with renovation skills"
                },
                "medium_term_3_7_years": {
                    "strategy": "Buy-and-hold with value-add improvements",
                    "risk": "Medium",
                    "returns": "Moderate to good",
                    "best_for": "Balanced approach"
                },
                "long_term_7_plus_years": {
                    "strategy": "Buy-and-hold for cash flow and appreciation",
                    "risk": "Lower",
                    "returns": "Steady, compounding",
                    "best_for": "Passive investors, retirement planning"
                }
            }
        }

    @staticmethod
    def get_market_analysis_knowledge() -> Dict[str, Any]:
        return {
            "market_indicators": {
                "economic_indicators": {
                    "gdp_growth": {
                        "description": "Economic growth indicates strong real estate market",
                        "impact": "Positive GDP growth → Strong demand → Price appreciation",
                        "thresholds": "2-3% growth is healthy for real estate"
                    },
                    "unemployment_rate": {
                        "description": "Low unemployment = strong rental demand and buying power",
                        "impact": "Low unemployment → More tenants/buyers → Higher rents/prices",
                        "thresholds": "< 5% is excellent, 5-7% is good, > 7% is concerning"
                    },
                    "job_growth": {
                        "description": "Job creation drives population growth and housing demand",
                        "impact": "Strong job growth → Population influx → Higher demand",
                        "sectors": "Tech, healthcare, finance sectors are strong indicators"
                    },
                    "population_growth": {
                        "description": "Growing population = increasing housing demand",
                        "impact": "Population growth → Demand increase → Price appreciation",
                        "sources": "Migration, natural growth, job opportunities"
                    },
                    "income_growth": {
                        "description": "Rising incomes increase affordability and rental capacity",
                        "impact": "Income growth → Higher rent capacity → Better returns",
                        "tracking": "Median household income trends"
                    }
                },

                "real_estate_indicators": {
                    "inventory_levels": {
                        "description": "Months of supply - how long inventory would last at current sales pace",
                        "interpretation": {
                            "low_inventory_<6_months": "Seller's market - prices likely to rise",
                            "balanced_6_7_months": "Balanced market",
                            "high_inventory_>7_months": "Buyer's market - prices may decline"
                        }
                    },
                    "days_on_market": {
                        "description": "Average time properties take to sell",
                        "interpretation": {
                            "fast_<30_days": "Hot market, high demand",
                            "normal_30_90_days": "Balanced market",
                            "slow_>90_days": "Cooling market, low demand"
                        }
                    },
                    "price_per_square_foot": {
                        "description": "Standardized price comparison metric",
                        "use": "Compare properties of different sizes, track market trends",
                        "factors": "Location, condition, amenities, property type affect price/sqft"
                    },
                    "rent_to_price_ratio": {
                        "description": "Annual rent divided by property price",
                        "good_range": "0.05-0.10 (5-10%) indicates good investment",
                        "interpretation": "Higher ratio = better cash flow potential"
                    },
                    "cap_rate_trends": {
                        "description": "Tracking cap rate changes over time",
                        "interpretation": {
                            "rising_cap_rates": "Market cooling, prices declining or rents increasing",
                            "falling_cap_rates": "Market heating, prices rising faster than rents"
                        }
                    }
                },

                "demographic_indicators": {
                    "age_distribution": {
                        "description": "Millennials and Gen Z drive rental demand",
                        "trends": "Young professionals prefer renting, families prefer buying",
                        "impact": "Young population = strong rental market"
                    },
                    "household_formation": {
                        "description": "New households being created (marriage, leaving parents)",
                        "impact": "High household formation = strong demand",
                        "trends": "Delayed marriage/children = more renters longer"
                    },
                    "homeownership_rate": {
                        "description": "Percentage of households that own vs rent",
                        "interpretation": {
                            "declining_rate": "More renters = stronger rental market",
                            "rising_rate": "More buyers, but still rental demand"
                        }
                    }
                }
            },

            "market_phases": {
                "recovery": {
                    "characteristics": ["Rising from bottom", "Increasing sales", "Low inventory", "Prices stabilizing"],
                    "strategy": "Good time to buy before prices rise significantly",
                    "indicators": "Declining inventory, increasing sales volume, stable/rising prices"
                },
                "expansion": {
                    "characteristics": ["Strong demand", "Rising prices", "Low inventory", "Fast sales"],
                    "strategy": "Buy for appreciation, expect competition",
                    "indicators": "Low days on market, multiple offers, price increases"
                },
                "hyper_supply": {
                    "characteristics": ["High inventory", "Slowing sales", "Price growth slowing", "Increasing days on market"],
                    "strategy": "Be selective, look for value, consider waiting",
                    "indicators": "High inventory levels, slower sales, price growth moderation"
                },
                "recession": {
                    "characteristics": ["Declining prices", "High inventory", "Low sales", "Economic downturn"],
                    "strategy": "Opportunities for value investors, cash is king",
                    "indicators": "Price declines, high inventory, low sales, economic indicators negative"
                }
            },

            "location_analysis": {
                "key_factors": {
                    "job_market": "Strong job market = stable rental demand and price growth",
                    "schools": "Good schools = higher property values and demand",
                    "crime_rate": "Low crime = higher values, better tenants",
                    "transportation": "Access to transit = higher values and rental demand",
                    "amenities": "Restaurants, parks, shopping = higher desirability",
                    "infrastructure": "New developments, roads, public projects = growth potential",
                    "future_development": "Planned projects can boost property values"
                },
                "neighborhood_types": {
                    "established": {
                        "characteristics": "Stable, predictable, established amenities",
                        "pros": "Lower risk, stable returns, proven track record",
                        "cons": "Limited appreciation potential, higher prices"
                    },
                    "emerging": {
                        "characteristics": "Up-and-coming, improving, developing",
                        "pros": "Higher appreciation potential, lower entry prices",
                        "cons": "Higher risk, uncertain future, may take time"
                    },
                    "declining": {
                        "characteristics": "Older, potential issues, uncertain future",
                        "pros": "Lower prices, potential for improvement",
                        "cons": "Higher risk, may not improve, tenant quality concerns"
                    }
                }
            }
        }

    @staticmethod
    def get_investment_advice_knowledge() -> Dict[str, Any]:
        return {
            "beginner_guidance": {
                "starting_out": {
                    "steps": [
                        "1. Set investment goals (income, growth, timeline)",
                        "2. Assess risk tolerance (conservative, moderate, aggressive)",
                        "3. Determine investment budget",
                        "4. Start with fractional ownership for diversification",
                        "5. Research markets and properties",
                        "6. Start small and learn",
                        "7. Reinvest profits for compound growth",
                        "8. Track and analyze performance"
                    ],
                    "first_investment_tips": [
                        "Start with $500-$1,000 to learn",
                        "Choose established markets for lower risk",
                        "Focus on properties with positive cash flow",
                        "Diversify across 3-5 different properties",
                        "Use fractional ownership for instant diversification",
                        "Track all metrics and learn from performance"
                    ]
                },
                "budget_planning": {
                    "assessment": "Evaluate available capital, monthly savings, and investment capacity",
                    "allocation": "Don't invest more than you can afford to lose",
                    "emergency_fund": "Keep 3-6 months expenses in emergency fund before investing",
                    "diversification": "Spread investments - don't put all money in one property"
                },
                "risk_management": {
                    "principles": [
                        "Never invest more than you can afford to lose",
                        "Diversify across properties, locations, types",
                        "Maintain emergency fund separate from investments",
                        "Research thoroughly before investing",
                        "Start small and scale up as you learn",
                        "Monitor investments regularly"
                    ],
                    "common_mistakes": [
                        "Investing without research",
                        "Putting all money in one property",
                        "Ignoring cash flow (only focusing on appreciation)",
                        "Not having emergency fund",
                        "Following trends without analysis",
                        "Over-leveraging"
                    ]
                }
            },

            "portfolio_building": {
                "diversification_strategy": {
                    "property_count": "Aim for 5-10 different properties for good diversification",
                    "geographic_diversity": "Invest in 3-5 different markets/cities",
                    "property_types": "Mix residential, commercial if possible",
                    "price_ranges": "Mix lower and higher priced properties",
                    "cash_flow_vs_appreciation": "Balance cash flow properties with growth properties"
                },
                "allocation_strategies": {
                    "conservative": {
                        "allocation": "70% established markets, 30% emerging",
                        "focus": "Cash flow over appreciation",
                        "property_types": "Primarily residential, established locations"
                    },
                    "moderate": {
                        "allocation": "50% established, 50% emerging markets",
                        "focus": "Balanced cash flow and appreciation",
                        "property_types": "Mix of residential and commercial"
                    },
                    "aggressive": {
                        "allocation": "30% established, 70% emerging/growth markets",
                        "focus": "Appreciation over cash flow",
                        "property_types": "Higher growth potential properties"
                    }
                },
                "rebalancing": {
                    "when": "Annually or when portfolio allocation drifts significantly",
                    "strategy": "Sell underperformers, buy more of winners, maintain target allocation"
                }
            },

            "property_selection": {
                "evaluation_criteria": {
                    "location": {
                        "importance": "Most important factor - location drives value and demand",
                        "factors": ["Job market", "Schools", "Crime", "Transportation", "Amenities", "Future development"]
                    },
                    "cash_flow": {
                        "importance": "Positive cash flow = sustainable investment",
                        "target": "Aim for 6-10% cash-on-cash return minimum",
                        "calculation": "Rental income - expenses = cash flow"
                    },
                    "condition": {
                        "importance": "Affects maintenance costs and tenant quality",
                        "evaluation": "Age, recent renovations, structural issues, systems condition"
                    },
                    "growth_potential": {
                        "importance": "Appreciation drives long-term returns",
                        "factors": ["Market trends", "Demographics", "Infrastructure", "Economic growth"]
                    },
                    "management": {
                        "importance": "Professional management affects returns",
                        "factors": ["Management quality", "Fees", "Experience", "Reputation"]
                    }
                },
                "red_flags": [
                    "Negative cash flow with no growth potential",
                    "High crime area with no improvement plans",
                    "Declining population/job market",
                    "Structural issues or major repairs needed",
                    "Overpriced relative to comparables",
                    "Poor property management",
                    "High vacancy rates in area",
                    "Environmental concerns"
                ]
            },

            "market_timing": {
                "when_to_buy": {
                    "good_times": [
                        "During market recovery (buying before prices rise)",
                        "When inventory is high (more options, less competition)",
                        "When interest rates are low",
                        "When you find value (undervalued properties)",
                        "When you have capital and market knowledge"
                    ],
                    "avoid": [
                        "Buying at peak without research",
                        "FOMO (Fear of Missing Out) buying",
                        "Buying when over-leveraged",
                        "Buying without due diligence"
                    ]
                },
                "when_to_sell": {
                    "consider_selling": [
                        "Property has significantly appreciated",
                        "Cash flow has declined",
                        "Better opportunities available",
                        "Rebalancing portfolio",
                        "Market is at peak with declining indicators"
                    ]
                }
            }
        }

    @staticmethod
    def get_platform_features_knowledge() -> Dict[str, Any]:
        return {
            "marketplace": {
                "description": "Browse and invest in fractional real estate properties",
                "features": [
                    "Property search with advanced filters (location, price, ROI, type)",
                    "Detailed property analytics (returns, growth, risk)",
                    "Property comparisons",
                    "Investment calculator",
                    "Property history and performance",
                    "Virtual tours and photos"
                ],
                "filters": {
                    "location": "Search by city, state, neighborhood",
                    "price_range": "Filter by token price or total property value",
                    "roi": "Filter by expected return on investment",
                    "property_type": "Residential, commercial, mixed-use",
                    "cash_flow": "Filter by monthly/annual cash flow",
                    "risk_level": "Conservative, moderate, aggressive"
                },
                "how_to_use": [
                    "1. Browse available properties",
                    "2. Use filters to narrow down options",
                    "3. Click on property for detailed view",
                    "4. Review analytics, location, returns",
                    "5. Compare with other properties",
                    "6. Calculate investment returns",
                    "7. Purchase tokens"
                ]
            },

            "portfolio": {
                "description": "Track all your investments, returns, and performance",
                "features": [
                    "Investment overview dashboard",
                    "Individual property performance",
                    "Total portfolio value",
                    "Cash flow tracking",
                    "ROI calculations",
                    "Performance graphs and charts",
                    "Dividend history",
                    "Property details and updates"
                ],
                "metrics_shown": [
                    "Total invested",
                    "Current portfolio value",
                    "Total returns (cash flow + appreciation)",
                    "Overall ROI",
                    "Monthly/annual cash flow",
                    "Best and worst performers",
                    "Asset allocation"
                ],
                "how_to_use": [
                    "1. View portfolio dashboard for overview",
                    "2. Click property for detailed analytics",
                    "3. Track cash flow and dividends",
                    "4. Monitor performance over time",
                    "5. Analyze which properties perform best",
                    "6. Use insights to guide future investments"
                ]
            },

            "wallet": {
                "description": "Manage your funds, deposits, and withdrawals securely",
                "features": [
                    "Secure balance storage",
                    "Deposit funds via bank transfer, card",
                    "Withdraw funds to bank account",
                    "Transaction history",
                    "Investment allocation tracking",
                    "Pending transactions"
                ],
                "deposit_methods": [
                    "Bank transfer (ACH)",
                    "Credit/debit card",
                    "Wire transfer",
                    "Other payment methods"
                ],
                "security": [
                    "Bank-level encryption",
                    "Secure authentication",
                    "Transaction monitoring",
                    "Regulatory compliance"
                ],
                "how_to_use": [
                    "1. Add funds to wallet",
                    "2. Funds are securely stored",
                    "3. Use wallet balance to purchase tokens",
                    "4. Receive dividends to wallet",
                    "5. Withdraw funds when needed"
                ]
            },

            "analytics": {
                "description": "Detailed property and portfolio analytics and insights",
                "features": [
                    "Property performance metrics",
                    "Market trend analysis",
                    "Comparative analytics",
                    "Risk assessment",
                    "Return projections",
                    "Cash flow forecasts"
                ],
                "available_analytics": [
                    "ROI trends",
                    "Cash flow analysis",
                    "Market comparisons",
                    "Risk metrics",
                    "Growth projections",
                    "Benchmark comparisons"
                ]
            }
        }

    @staticmethod
    def get_common_questions() -> Dict[str, Any]:
        return {
            "fractional_ownership_faqs": {
                "what_is_fractional_ownership": {
                    "question": "What is fractional ownership?",
                    "answer": "Fractional ownership allows you to own a portion (share/token) of a real estate property instead of the entire property. Properties are divided into tokens, and you can purchase as many tokens as you want based on your budget."
                },
                "how_much_to_invest": {
                    "question": "How much do I need to invest?",
                    "answer": "You can start with as little as $50-$500 per token. There's no minimum total investment - you can start small and add more over time."
                },
                "how_do_i_make_money": {
                    "question": "How do I make money from fractional ownership?",
                    "answer": "You earn money in two ways: 1) Monthly rental income dividends (cash flow), and 2) Property appreciation over time (value increase). Both are proportional to your ownership percentage."
                },
                "can_i_sell": {
                    "question": "Can I sell my tokens?",
                    "answer": "Yes! You can sell your tokens on the secondary market anytime. Tokens are more liquid than traditional real estate, though liquidity depends on market demand."
                },
                "what_are_risks": {
                    "question": "What are the risks?",
                    "answer": "Risks include: property value decline, rental income fluctuation, lower liquidity than stocks, management dependency, and market risks. However, fractional ownership reduces risk through diversification."
                },
                "who_manages_property": {
                    "question": "Who manages the property?",
                    "answer": "Professional property management companies handle all property operations - tenant relations, maintenance, rent collection, repairs. You don't need to do anything as an investor."
                },
                "tax_implications": {
                    "question": "What are the tax implications?",
                    "answer": "You receive tax forms (1099) for rental income. You may be able to deduct your share of property expenses and depreciation. Consult a tax professional for your specific situation."
                }
            },

            "investment_faqs": {
                "best_property_type": {
                    "question": "What's the best property type to invest in?",
                    "answer": "There's no single best type - it depends on your goals. Residential offers stability and easier understanding. Commercial offers higher returns but more complexity. Diversifying across types reduces risk."
                },
                "how_to_choose_location": {
                    "question": "How do I choose the best location?",
                    "answer": "Look for: strong job market, population growth, good schools, low crime, good transportation, amenities, and future development plans. Established markets are safer; emerging markets offer more growth potential."
                },
                "what_roi_expect": {
                    "question": "What ROI should I expect?",
                    "answer": "Good real estate investments typically return 8-15% annually (cash flow + appreciation). Cash flow alone: 6-10% is good. Higher returns come with higher risk. Diversification helps achieve consistent returns."
                },
                "when_to_invest": {
                    "question": "When is the best time to invest?",
                    "answer": "The best time is when you have capital, have done research, and found a good opportunity. Market timing is difficult - dollar-cost averaging (investing regularly) often works better than trying to time the market."
                },
                "how_much_diversify": {
                    "question": "How much should I diversify?",
                    "answer": "Aim for 5-10 different properties across 3-5 different markets for good diversification. Don't put all money in one property or location. Start small and diversify as you invest more."
                }
            },

            "platform_faqs": {
                "how_to_start": {
                    "question": "How do I get started?",
                    "answer": "1) Create account, 2) Complete identity verification, 3) Add funds to wallet, 4) Browse marketplace, 5) Research properties, 6) Purchase tokens, 7) Track in portfolio"
                },
                "minimum_investment": {
                    "question": "What's the minimum investment?",
                    "answer": "The minimum is typically the price of one token (usually $50-$100). There's no maximum - invest as much as you're comfortable with."
                },
                "fees": {
                    "question": "What fees are involved?",
                    "answer": "Common fees: platform fees (small % on transactions), property management fees (included in expenses, reduce cash flow), and potentially withdrawal fees. Always check fee structure before investing."
                },
                "how_often_dividends": {
                    "question": "How often do I receive dividends?",
                    "answer": "Typically monthly - rental income is distributed monthly to token holders proportional to ownership. Some properties may distribute quarterly."
                },
                "platform_security": {
                    "question": "Is the platform secure?",
                    "answer": "Reputable platforms use bank-level encryption, secure authentication, regulatory compliance, and insurance. Research the platform's security measures and regulatory status before investing."
                }
            }
        }

    @staticmethod
    def get_all_knowledge() -> Dict[str, Any]:
        return {
            "real_estate_investment": ComprehensiveKnowledgeBase.get_real_estate_investment_knowledge(),
            "market_analysis": ComprehensiveKnowledgeBase.get_market_analysis_knowledge(),
            "investment_advice": ComprehensiveKnowledgeBase.get_investment_advice_knowledge(),
            "platform_features": ComprehensiveKnowledgeBase.get_platform_features_knowledge(),
            "common_questions": ComprehensiveKnowledgeBase.get_common_questions()
        }
