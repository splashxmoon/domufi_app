

import { propertyAPI, marketAPI, portfolioAPI, investmentAPI, userAPI } from '../lib/api/dynamicAPI';





class AdvancedKnowledgeBase {
  constructor() {
    this.memory = this.loadMemory();
    this.marketCache = new Map();
    this.propertyCache = new Map();
    this.economicDataCache = new Map();
    this.platformDataCache = new Map();
    this.conversationContext = new Map(); 
    this.embeddingCache = new Map(); 
    this.cacheExpiry = 5 * 60 * 1000; 
    this.contextWindowSize = 10; 
  }

  loadMemory() {
    try {
      const stored = localStorage.getItem('ai_knowledge_base');
      const baseMemory = stored ? JSON.parse(stored) : {
        conversationHistory: [],
        userPreferences: {},
        learnedPatterns: {},
        marketKnowledge: {},
        propertyKnowledge: {},
        platformKnowledge: {},
        queryPatterns: {},
        successRate: {},
        userFeedback: [],
        recommendationHistory: [],
        interactionStats: {},
        timestamp: Date.now()
      };
      
      
      return {
        ...baseMemory,
        userFeedback: baseMemory.userFeedback || [],
        recommendationHistory: baseMemory.recommendationHistory || [],
        interactionStats: baseMemory.interactionStats || {}
      };
    } catch (error) {
      console.error('Error loading memory:', error);
      return {
        conversationHistory: [],
        userPreferences: {},
        learnedPatterns: {},
        marketKnowledge: {},
        propertyKnowledge: {},
        platformKnowledge: {},
        queryPatterns: {},
        successRate: {},
        userFeedback: [],
        recommendationHistory: [],
        interactionStats: {},
        timestamp: Date.now()
      };
    }
  }

  saveMemory() {
    try {
      localStorage.setItem('ai_knowledge_base', JSON.stringify(this.memory));
    } catch (error) {
      console.error('Error saving memory:', error);
    }
  }

  
  learn(pattern, outcome, confidence, context = {}) {
    if (!this.memory.learnedPatterns[pattern]) {
      this.memory.learnedPatterns[pattern] = {
        count: 0,
        successes: 0,
        averageConfidence: 0,
        outcomes: [],
        contexts: [],
        lastUpdated: Date.now()
      };
    }
    
    const patternData = this.memory.learnedPatterns[pattern];
    patternData.count++;
    patternData.outcomes.push({ outcome, confidence, timestamp: Date.now(), ...context });
    if (confidence > 0.7) patternData.successes++;
    patternData.averageConfidence = patternData.outcomes.reduce((sum, o) => sum + o.confidence, 0) / patternData.count;
    patternData.contexts.push(context);
    patternData.lastUpdated = Date.now();
    
    
    if (patternData.outcomes.length > 50) {
      patternData.outcomes = patternData.outcomes.slice(-50);
    }
    if (patternData.contexts.length > 50) {
      patternData.contexts = patternData.contexts.slice(-50);
    }
    
    this.saveMemory();
  }

  
  learnFromFeedback(query, response, feedback, userContext) {
    const feedbackEntry = {
      query,
      response,
      feedback, 
      userContext,
      timestamp: Date.now()
    };
    
    this.memory.userFeedback.push(feedbackEntry);
    
    
    if (this.memory.userFeedback.length > 100) {
      this.memory.userFeedback = this.memory.userFeedback.slice(-100);
    }
    
    
    const queryKey = query.toLowerCase().trim();
    if (!this.memory.successRate[queryKey]) {
      this.memory.successRate[queryKey] = { positive: 0, negative: 0, total: 0 };
    }
    
    this.memory.successRate[queryKey].total++;
    if (feedback === 'positive' || (typeof feedback === 'object' && feedback.rating > 3)) {
      this.memory.successRate[queryKey].positive++;
    } else {
      this.memory.successRate[queryKey].negative++;
    }
    
    this.saveMemory();
  }

  
  trackRecommendation(recommendation, userAction, outcome) {
    this.memory.recommendationHistory.push({
      recommendation,
      userAction, 
      outcome,
      timestamp: Date.now()
    });
    
    
    if (this.memory.recommendationHistory.length > 200) {
      this.memory.recommendationHistory = this.memory.recommendationHistory.slice(-200);
    }
    
    this.saveMemory();
  }

  
  getConversationContext(sessionId = 'default') {
    const context = this.conversationContext.get(sessionId) || [];
    return context.slice(-this.contextWindowSize);
  }

  
  addToContext(sessionId, role, content, metadata = {}) {
    if (!this.conversationContext.has(sessionId)) {
      this.conversationContext.set(sessionId, []);
    }
    
    const context = this.conversationContext.get(sessionId);
    context.push({
      role, 
      content,
      timestamp: Date.now(),
      ...metadata
    });
    
    
    if (context.length > this.contextWindowSize) {
      context.shift();
    }
  }

  
  calculateSimilarity(str1, str2) {
    const tokens1 = str1.toLowerCase().split(/\s+/);
    const tokens2 = str2.toLowerCase().split(/\s+/);
    const set1 = new Set(tokens1);
    const set2 = new Set(tokens2);
    
    const intersection = new Set([...set1].filter(x => set2.has(x)));
    const union = new Set([...set1, ...set2]);
    
    return intersection.size / union.size; 
  }

  
  findSimilarInteractions(query, limit = 3) {
    const cacheKey = `similar_${query.toLowerCase().trim()}`;
    const cached = this.embeddingCache.get(cacheKey);
    if (cached && (Date.now() - cached.timestamp) < this.cacheExpiry) {
      return cached.data;
    }

    const similar = this.memory.userFeedback
      .map(fb => ({
        ...fb,
        similarity: this.calculateSimilarity(query, fb.query)
      }))
      .filter(fb => fb.similarity > 0.3)
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, limit);

    this.embeddingCache.set(cacheKey, { data: similar, timestamp: Date.now() });
    return similar;
  }

  getMarketKnowledge(market) {
    return this.memory.marketKnowledge[market] || null;
  }

  updateMarketKnowledge(market, data) {
    this.memory.marketKnowledge[market] = {
      ...data,
      lastUpdated: Date.now(),
      source: 'api',
      accessCount: (this.memory.marketKnowledge[market]?.accessCount || 0) + 1
    };
    this.saveMemory();
  }

  
  getLocationKnowledge(city, state) {
    const locationKey = `${city},${state}`.toLowerCase();
    const locationData = this.memory.locationKnowledge || {};
    
    
    if (locationData[locationKey]) {
      return locationData[locationKey];
    }
    
    
    if (locationData[city.toLowerCase()]) {
      return locationData[city.toLowerCase()];
    }
    
    
    const builtInKnowledge = this.getBuiltInLocationKnowledge(city, state);
    if (builtInKnowledge) {
      return builtInKnowledge;
    }
    
    return null;
  }

  
  getBuiltInLocationKnowledge(city, state) {
    const cityLower = city.toLowerCase();
    
    
    if (cityLower.includes('new york') || cityLower.includes('nyc') || cityLower === 'manhattan') {
      return {
        growthPotential: 'high',
        demandLevel: 'high',
        trendDirection: 'growing',
        marketHealth: 85,
        outlook: 'positive',
        riskLevel: 'medium',
        insights: [
          'World-class real estate market with strong fundamentals',
          'High demand from both residents and investors',
          'Strong rental yields in many neighborhoods',
          'Diversified economy supporting property values'
        ],
        recommendations: [
          'Focus on properties with strong rental potential',
          'Consider long-term appreciation opportunities',
          'Diversify across different neighborhoods'
        ]
      };
    }
    
    
    if (cityLower.includes('los angeles') || cityLower.includes('la') || cityLower.includes('california')) {
      return {
        growthPotential: 'high',
        demandLevel: 'high',
        trendDirection: 'growing',
        marketHealth: 80,
        outlook: 'positive',
        riskLevel: 'medium',
        insights: [
          'Large, diverse real estate market',
          'Strong tech and entertainment economy',
          'High demand in premium locations'
        ]
      };
    }
    
    
    if (cityLower.includes('miami') || cityLower.includes('florida')) {
      return {
        growthPotential: 'high',
        demandLevel: 'high',
        trendDirection: 'growing',
        marketHealth: 75,
        outlook: 'positive',
        riskLevel: 'medium',
        insights: [
          'Growing international investment destination',
          'Strong vacation rental market',
          'Favorable tax environment'
        ]
      };
    }
    
    return null;
  }

  
  getMarketHistory(city, state) {
    const locationKey = `${city},${state}`.toLowerCase();
    const history = this.memory.marketHistory || {};
    
    return history[locationKey] || null;
  }

  
  updateMarketHistory(city, state, trendData) {
    if (!this.memory.marketHistory) {
      this.memory.marketHistory = {};
    }
    
    const locationKey = `${city},${state}`.toLowerCase();
    if (!this.memory.marketHistory[locationKey]) {
      this.memory.marketHistory[locationKey] = [];
    }
    
    this.memory.marketHistory[locationKey].push({
      ...trendData,
      timestamp: Date.now()
    });
    
    
    const oneYearAgo = Date.now() - (365 * 24 * 60 * 60 * 1000);
    this.memory.marketHistory[locationKey] = this.memory.marketHistory[locationKey]
      .filter(entry => entry.timestamp > oneYearAgo);
    
    this.saveMemory();
  }

  updatePlatformKnowledge(key, data) {
    this.memory.platformKnowledge[key] = {
      ...data,
      lastUpdated: Date.now(),
      source: 'api',
      accessCount: (this.memory.platformKnowledge[key]?.accessCount || 0) + 1
    };
    this.saveMemory();
  }

  getPlatformKnowledge(key) {
    return this.memory.platformKnowledge[key] || null;
  }

  
  getUserPreferences(userId) {
    return this.memory.userPreferences[userId] || {
      preferredLocations: [],
      preferredPropertyTypes: [],
      riskTolerance: 'medium',
      investmentGoals: [],
      minROI: 0,
      maxInvestment: null
    };
  }

  updateUserPreferences(userId, preferences) {
    if (!this.memory.userPreferences[userId]) {
      this.memory.userPreferences[userId] = {};
    }
    this.memory.userPreferences[userId] = {
      ...this.memory.userPreferences[userId],
      ...preferences,
      lastUpdated: Date.now()
    };
    this.saveMemory();
  }
}

const knowledgeBase = new AdvancedKnowledgeBase();


export { knowledgeBase };





const getCurrentUserId = () => {
  try {
    const authData = localStorage.getItem('auth');
    if (authData) {
      const { user } = JSON.parse(authData);
      return user?.id || user?.email || null;
    }
  } catch (error) {
    console.error('Error getting user ID:', error);
  }
  return null;
};





const advancedDataRetrieval = {
  
  async fetchAllRelevantData(intent, context = {}) {
    const userId = context.userId || getCurrentUserId();
    const dataPromises = {};
    const message = context.message || '';
    
    
    const dataNeeds = this.determineDataNeeds(intent, { ...context, message });
    
    
    const msgLower = message.toLowerCase();
    const isMultiLocationQuery = msgLower.includes('compare') && 
      ((msgLower.includes('nyc') || msgLower.includes('new york')) && 
       (msgLower.includes('miami') || msgLower.includes('la') || msgLower.includes('los angeles')));
    
    
    const isBestMarketQuery = (msgLower.includes('best market') || msgLower.includes('which market')) && 
                              (msgLower.includes('beginner') || msgLower.includes('new') || msgLower.includes('start') || msgLower.includes('best'));
    
    let locationsToFetch = [];
    if (isMultiLocationQuery) {
      if (msgLower.includes('nyc') || msgLower.includes('new york')) {
        locationsToFetch.push('New York, NY');
      }
      if (msgLower.includes('miami')) {
        locationsToFetch.push('Miami, FL');
      }
      if (msgLower.includes('la') || msgLower.includes('los angeles')) {
        locationsToFetch.push('Los Angeles, CA');
      }
      if (msgLower.includes('chicago')) {
        locationsToFetch.push('Chicago, IL');
      }
      if (msgLower.includes('atlanta')) {
        locationsToFetch.push('Atlanta, GA');
      }
    } else if (isBestMarketQuery) {
      
      locationsToFetch = ['New York, NY', 'Miami, FL', 'Los Angeles, CA', 'Chicago, IL', 'Atlanta, GA'];
    }
    
    
    if (dataNeeds.includes('properties')) {
      dataPromises.properties = this.fetchPlatformProperties(context.filters || {})
        .catch(err => {
          console.error('Error fetching properties:', err);
          return [];
        });
    }
    
    if (dataNeeds.includes('portfolio') && userId) {
      dataPromises.portfolio = this.fetchUserPortfolio(userId)
        .catch(err => {
          console.error('Error fetching portfolio:', err);
          return null;
        });
    }
    
    if (dataNeeds.includes('investments') && userId) {
      dataPromises.investments = this.fetchUserInvestments(userId)
        .catch(err => {
          console.error('Error fetching investments:', err);
          return [];
        });
    }
    
    if (dataNeeds.includes('wallet') && userId) {
      dataPromises.wallet = this.fetchUserWallet(userId)
        .catch(err => {
          console.error('Error fetching wallet:', err);
          return null;
        });
    }
    
    if (dataNeeds.includes('market')) {
      
      if (isMultiLocationQuery && locationsToFetch.length > 0) {
        
        dataPromises.market = Promise.all(
          locationsToFetch.map(location => 
            this.fetchMarketData(location).catch(err => {
              console.error(`Error fetching market data for ${location}:`, err);
              return null;
            })
          )
        ).then(results => results.filter(r => r !== null));
      } else if (context.location) {
        
        dataPromises.market = this.fetchMarketData(context.location)
          .catch(err => {
            console.error('Error fetching market data:', err);
            return null;
          });
      } else {
        
        const location = extractLocation(message);
        if (location) {
          const normalizedLocation = normalizeLocationForAPI(location);
          dataPromises.market = this.fetchMarketData(normalizedLocation)
            .catch(err => {
              console.error('Error fetching market data:', err);
              return null;
            });
        }
      }
    }
    
    if (dataNeeds.includes('economic')) {
      dataPromises.economic = this.fetchEconomicData()
        .catch(err => {
          console.error('Error fetching economic data:', err);
          return null;
        });
    }
    
    
    const results = await Promise.allSettled(Object.values(dataPromises));
    const data = {};
    
    
    const keys = Object.keys(dataPromises);
    results.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        data[keys[index]] = result.value;
      } else {
        data[keys[index]] = null;
      }
    });
    
    
    if (!data.properties || !Array.isArray(data.properties)) {
      data.properties = [];
    }
    
    return data;
  },

  
  determineDataNeeds(intent, context = {}) {
    const needs = new Set();
    const message = context.message || '';
    const msgLower = message.toLowerCase();
    
    
    const isBestMarketQuery = (msgLower.includes('best market') || msgLower.includes('which market')) && 
                              (msgLower.includes('beginner') || msgLower.includes('new') || msgLower.includes('start') || msgLower.includes('best'));
    
    switch (intent) {
      case 'investment_advice':
      case 'recommendation':
        needs.add('properties');
        needs.add('portfolio');
        needs.add('investments');
        needs.add('wallet');
        needs.add('market');
        break;
      case 'portfolio_inquiry':
      case 'portfolio_performance':
        needs.add('portfolio');
        needs.add('investments');
        needs.add('wallet');
        needs.add('properties'); 
        break;
      case 'market_analysis':
      case 'market_inquiry':
        needs.add('market');
        needs.add('economic');
        needs.add('properties');
        
        break;
      case 'property_search':
        needs.add('properties');
        needs.add('market');
        break;
      case 'wallet_inquiry':
        needs.add('wallet');
        needs.add('portfolio');
        break;
      default:
        
        needs.add('portfolio');
        needs.add('wallet');
    }
    
    return Array.from(needs);
  },

  
  async fetchPlatformProperties(filters = {}) {
    const cacheKey = 'platform_properties';
    const cached = knowledgeBase.platformDataCache.get(cacheKey);
    
    if (cached && (Date.now() - cached.timestamp) < knowledgeBase.cacheExpiry) {
      return cached.data;
    }

    try {
      const properties = await propertyAPI.getProperties(filters) || [];
      
      
      knowledgeBase.platformDataCache.set(cacheKey, { 
        data: properties, 
        timestamp: Date.now() 
      });
      
      
      knowledgeBase.updatePlatformKnowledge('properties', {
        count: properties.length,
        types: [...new Set(properties.map(p => p.property_type))],
        locations: [...new Set(properties.map(p => `${p.city}, ${p.state}`))],
        avgROI: properties.length > 0 ? 
          properties.reduce((sum, p) => sum + (p.annual_roi || 0), 0) / properties.length : 0
      });
      
      return properties;
    } catch (error) {
      console.error('Error fetching platform properties:', error);
      return [];
    }
  },

  
  async fetchUserPortfolio(userId) {
    if (!userId) return null;
    
    const cacheKey = `portfolio_${userId}`;
    const cached = knowledgeBase.platformDataCache.get(cacheKey);
    
    if (cached && (Date.now() - cached.timestamp) < knowledgeBase.cacheExpiry) {
      return cached.data;
    }

    try {
      const portfolio = await portfolioAPI.getPortfolioOverview(userId);
      
      
      knowledgeBase.platformDataCache.set(cacheKey, { 
        data: portfolio, 
        timestamp: Date.now() 
      });
      
      return portfolio;
    } catch (error) {
      console.error('Error fetching user portfolio:', error);
      return null;
    }
  },

  
  async fetchUserInvestments(userId) {
    if (!userId) return [];
    
    try {
      const investments = await investmentAPI.getUserInvestments(userId) || [];
      return investments;
    } catch (error) {
      console.error('Error fetching user investments:', error);
      return [];
    }
  },

  
  async fetchUserWallet(userId) {
    if (!userId) return null;
    
    try {
      const wallet = await userAPI.getWallet(userId);
      return wallet;
    } catch (error) {
      console.error('Error fetching user wallet:', error);
      return null;
    }
  },

  
  async fetchPortfolioPerformance(userId, period = '1Y') {
    if (!userId) return null;
    
    try {
      const performance = await portfolioAPI.getPortfolioPerformance(userId, period);
      return performance;
    } catch (error) {
      console.error('Error fetching portfolio performance:', error);
      return null;
    }
  },

  
  async fetchPortfolioAnalytics(userId) {
    if (!userId) return null;
    
    try {
      const analytics = await portfolioAPI.getPortfolioAnalytics(userId);
      return analytics;
    } catch (error) {
      console.error('Error fetching portfolio analytics:', error);
      return null;
    }
  },

  
  async searchProperties(searchCriteria) {
    try {
      const properties = await propertyAPI.searchProperties(searchCriteria) || [];
      return properties;
    } catch (error) {
      console.error('Error searching properties:', error);
      return [];
    }
  },

  
  async getPropertyDetails(propertyId) {
    try {
      const property = await propertyAPI.getProperty(propertyId);
      return property;
    } catch (error) {
      console.error('Error fetching property details:', error);
      return null;
    }
  },

  
  async generateInvestmentRecommendations(userId, userPreferences = {}) {
    try {
      
      const portfolio = await this.fetchUserPortfolio(userId);
      const wallet = await this.fetchUserWallet(userId);
      const availableBalance = wallet?.available_balance || 0;
      
      
      const allProperties = await this.fetchPlatformProperties();
      
      
      const recommendations = allProperties
        .filter(property => {
          
          const userInvestments = portfolio?.investments || [];
          const alreadyOwns = userInvestments.some(inv => inv.property_id === property.id);
          if (alreadyOwns) return false;
          
          
          const minInvestment = property.token_price * 1; 
          if (availableBalance > 0 && minInvestment > availableBalance) return false;
          
          
          if (userPreferences.location && 
              !property.city.toLowerCase().includes(userPreferences.location.toLowerCase()) &&
              !property.state.toLowerCase().includes(userPreferences.location.toLowerCase())) {
            return false;
          }
          
          if (userPreferences.propertyType && 
              property.property_type !== userPreferences.propertyType) {
            return false;
          }
          
          if (userPreferences.minROI && 
              (property.annual_roi || 0) < userPreferences.minROI) {
            return false;
          }
          
          return true;
        })
        .map(property => {
          
          let score = 0;
          
          
          score += (property.annual_roi || 0) * 2;
          
          
          const riskScores = { 'low': 30, 'medium': 20, 'high': 10 };
          score += riskScores[property.risk_level] || 15;
          
          
          if (portfolio?.investments) {
            const currentLocations = portfolio.investments.map(inv => 
              `${inv.demo_properties?.city}, ${inv.demo_properties?.state}`
            );
            const propertyLocation = `${property.city}, ${property.state}`;
            if (!currentLocations.includes(propertyLocation)) {
              score += 20; 
            }
          }
          
          
          if (property.available_tokens && property.total_tokens) {
            const availabilityPercentage = (property.available_tokens / property.total_tokens) * 100;
            score += Math.min(availabilityPercentage / 10, 10);
          }
          
          return {
            property,
            score,
            reasons: this.generateRecommendationReasons(property, portfolio, availableBalance)
          };
        })
        .sort((a, b) => b.score - a.score)
        .slice(0, 5); 
      
      return recommendations;
    } catch (error) {
      console.error('Error generating investment recommendations:', error);
      return [];
    }
  },

  
  generateRecommendationReasons(property, portfolio, availableBalance) {
    const reasons = [];
    
    if (property.annual_roi >= 10) {
      reasons.push(`High ROI of ${property.annual_roi}%`);
    } else if (property.annual_roi >= 8) {
      reasons.push(`Competitive ROI of ${property.annual_roi}%`);
    }
    
    if (property.risk_level === 'low') {
      reasons.push('Low risk profile - stable investment');
    }
    
    if (portfolio?.investments) {
      const currentLocations = portfolio.investments.map(inv => 
        `${inv.demo_properties?.city}, ${inv.demo_properties?.state}`
      );
      const propertyLocation = `${property.city}, ${property.state}`;
      if (!currentLocations.includes(propertyLocation)) {
        reasons.push(`Diversification opportunity in ${propertyLocation}`);
      }
    }
    
    const minInvestment = property.token_price * 1;
    if (availableBalance >= minInvestment) {
      reasons.push(`Affordable - minimum investment $${minInvestment}`);
    }
    
    if (property.occupancy_rate && property.occupancy_rate >= 90) {
      reasons.push(`High occupancy rate of ${property.occupancy_rate}%`);
    }
    
    return reasons;
  },

  
  analyzePortfolioForAdvice(userId, portfolio, investments, wallet) {
    const advice = [];
    
    
    const isNewUser = !investments || investments.length === 0;
    if (isNewUser) {
      advice.push({
        type: 'new_user',
        priority: 'high',
        title: 'Welcome! Start Your Investment Journey',
        message: 'You\'re new to the platform. I recommend starting with a small investment to learn how fractional ownership works. Consider properties with low risk profiles and good ROI.',
        action: 'Browse Marketplace'
      });
    }
    
    
    if (investments && investments.length > 0) {
      const locations = new Set(investments.map(inv => 
        `${inv.demo_properties?.city}, ${inv.demo_properties?.state}`
      ));
      const propertyTypes = new Set(investments.map(inv => inv.demo_properties?.property_type));
      
      if (locations.size < 3) {
        advice.push({
          type: 'diversification',
          priority: 'medium',
          title: 'Consider Geographic Diversification',
          message: `You're currently invested in ${locations.size} location(s). Diversifying across multiple markets can help reduce risk and capture opportunities in different regions.`,
          action: 'Explore New Markets'
        });
      }
      
      if (propertyTypes.size === 1) {
        advice.push({
          type: 'diversification',
          priority: 'medium',
          title: 'Consider Property Type Diversification',
          message: `You're currently invested only in ${Array.from(propertyTypes)[0]} properties. Consider adding other property types for better diversification.`,
          action: 'Browse Different Property Types'
        });
      }
    }
    
    
    if (portfolio) {
      const returnPercentage = portfolio.totalReturnPercentage || 0;
      
      if (returnPercentage < 0) {
        advice.push({
          type: 'performance',
          priority: 'high',
          title: 'Portfolio Underperformance',
          message: `Your portfolio is currently showing a ${returnPercentage.toFixed(2)}% return. This might be temporary market fluctuations, but consider reviewing your investments.`,
          action: 'Review Portfolio'
        });
      } else if (returnPercentage < 5) {
        advice.push({
          type: 'performance',
          priority: 'low',
          title: 'Consider Higher ROI Opportunities',
          message: `Your portfolio is performing at ${returnPercentage.toFixed(2)}%. Consider exploring properties with higher ROI potential while maintaining an appropriate risk level.`,
          action: 'Find High ROI Properties'
        });
      }
    }
    
    
    if (wallet) {
      const availableBalance = wallet.available_balance || 0;
      const totalInvested = portfolio?.totalInvested || 0;
      
      if (availableBalance > 1000 && totalInvested === 0) {
        advice.push({
          type: 'opportunity',
          priority: 'high',
          title: 'You Have Funds Available',
          message: `You have $${availableBalance.toFixed(2)} available in your wallet. Consider investing to start earning passive income.`,
          action: 'Invest Now'
        });
      } else if (availableBalance > totalInvested * 0.2 && totalInvested > 0) {
        advice.push({
          type: 'opportunity',
          priority: 'medium',
          title: 'Additional Investment Opportunity',
          message: `You have $${availableBalance.toFixed(2)} available. Consider adding to your portfolio or exploring new investment opportunities.`,
          action: 'Browse Investments'
        });
      }
    }
    
    
    if (investments && investments.length > 0 && portfolio) {
      const topInvestment = investments.reduce((max, inv) => {
        const value = inv.investment_amount || 0;
        return value > (max.investment_amount || 0) ? inv : max;
      }, investments[0]);
      
      const topInvestmentPercentage = portfolio.totalInvested > 0 ? 
        ((topInvestment.investment_amount || 0) / portfolio.totalInvested) * 100 : 0;
      
      if (topInvestmentPercentage > 50) {
        advice.push({
          type: 'risk',
          priority: 'medium',
          title: 'High Concentration Risk',
          message: `${topInvestmentPercentage.toFixed(0)}% of your portfolio is in one property. Consider diversifying to reduce risk.`,
          action: 'Diversify Portfolio'
        });
      }
    }
    
    return advice.sort((a, b) => {
      const priorityOrder = { 'high': 3, 'medium': 2, 'low': 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  },

  
  async fetchMarketData(location) {
    const cacheKey = `market_${location.toLowerCase()}`;
    const cached = knowledgeBase.marketCache.get(cacheKey);
    
    if (cached && (Date.now() - cached.timestamp) < knowledgeBase.cacheExpiry) {
      return cached.data;
    }

    try {
      
      const locationParts = location.split(',').map(s => s.trim());
      const city = locationParts[0];
      const state = locationParts[1] || dataRetrieval.extractState(city);
      
      
      const dataSources = {};
      
      
      try {
        dataSources.platform = await marketAPI.getMarketTrends(city, state) || [];
      } catch (apiError) {
        console.warn('Platform market API failed:', apiError);
      }
      
      
      let properties = [];
      try {
        properties = await propertyAPI.getProperties({ city, state }) || [];
        
        if (properties.length > 0) {
          const avgPrice = properties.reduce((sum, p) => sum + (p.current_value || p.price || 0), 0) / properties.length;
          const avgROI = properties.reduce((sum, p) => sum + (p.annual_roi || p.roi || 0), 0) / properties.length;
          const lowRiskCount = properties.filter(p => (p.risk_level || 'medium').toLowerCase() === 'low').length;
          
          dataSources.propertyAnalysis = {
            totalProperties: properties.length,
            averagePrice: avgPrice,
            averageROI: avgROI,
            lowRiskProperties: lowRiskCount,
            priceRange: {
              min: Math.min(...properties.map(p => p.current_value || p.price || 0)),
              max: Math.max(...properties.map(p => p.current_value || p.price || 0))
            },
            roiRange: {
              min: Math.min(...properties.map(p => p.annual_roi || p.roi || 0)),
              max: Math.max(...properties.map(p => p.annual_roi || p.roi || 0))
            }
          };
        }
      } catch (apiError) {
        console.warn('Properties API failed:', apiError);
      }
      
      
      const economicData = await dataRetrieval.fetchEconomicData() || {};
      
      
      const marketIntelligence = this.analyzeMarketIntelligence(city, state, dataSources, economicData, properties);
      
      
      const historicalTrends = knowledgeBase.getMarketHistory(city, state);
      
      
      const marketData = {
        location: { city, state },
        trends: dataSources.platform || [],
        propertyAnalysis: dataSources.propertyAnalysis,
        economicIndicators: economicData,
        marketIntelligence: marketIntelligence,
        historicalTrends: historicalTrends,
        properties: properties,
        analysis: this.generateMarketAnalysis(dataSources, economicData, marketIntelligence, properties),
        dataSources: Object.keys(dataSources).filter(k => dataSources[k]),
        timestamp: Date.now(),
        confidence: this.calculateMarketDataConfidence(dataSources)
      };

      
      knowledgeBase.marketCache.set(cacheKey, { data: marketData, timestamp: Date.now() });
      
      
      knowledgeBase.updateMarketKnowledge(location, marketData);
      
      return marketData;
    } catch (error) {
      console.error('Error fetching market data:', error);
      
      
      return this.generateIntelligentMarketFallback(location);
    }
  },

  
  analyzeMarketIntelligence(city, state, dataSources, economicData, properties) {
    const intelligence = {
      marketHealth: 0,
      investmentAppeal: 0,
      riskAssessment: 'medium',
      opportunities: [],
      warnings: [],
      trends: [],
      scores: {}
    };
    
    
    let healthScore = 50; 
    
    
    if (dataSources.propertyAnalysis) {
      const propAnalysis = dataSources.propertyAnalysis;
      if (propAnalysis.averageROI > 0.08) healthScore += 20;
      else if (propAnalysis.averageROI > 0.06) healthScore += 15;
      else if (propAnalysis.averageROI > 0.04) healthScore += 10;
      
      if (propAnalysis.lowRiskProperties > propAnalysis.totalProperties * 0.5) healthScore += 10;
      if (propAnalysis.totalProperties > 5) healthScore += 5;
    }
    
    
    if (economicData) {
      if (economicData.unemployment < 4) healthScore += 10;
      if (economicData.gdpGrowth > 2) healthScore += 10;
      if (economicData.inflation < 3) healthScore += 5;
      if (economicData.inflation > 5) healthScore -= 10;
    }
    
    
    const locationKnowledge = knowledgeBase.getLocationKnowledge(city, state);
    if (locationKnowledge) {
      if (locationKnowledge.growthPotential === 'high') healthScore += 15;
      if (locationKnowledge.demandLevel === 'high') healthScore += 10;
    }
    
    intelligence.marketHealth = Math.min(100, Math.max(0, healthScore));
    
    
    intelligence.investmentAppeal = healthScore * 0.8 + (dataSources.propertyAnalysis?.averageROI || 0) * 200;
    
    
    if (healthScore > 75) intelligence.riskAssessment = 'low';
    else if (healthScore < 40) intelligence.riskAssessment = 'high';
    else intelligence.riskAssessment = 'medium';
    
    
    if (dataSources.propertyAnalysis?.averageROI > 0.08) {
      intelligence.opportunities.push('High ROI opportunities available');
    }
    if (dataSources.propertyAnalysis?.lowRiskProperties > 0) {
      intelligence.opportunities.push('Low-risk investment options present');
    }
    if (locationKnowledge?.growthPotential === 'high') {
      intelligence.opportunities.push('Strong growth potential in this market');
    }
    
    
    if (economicData?.inflation > 5) {
      intelligence.warnings.push('High inflation may impact property values');
    }
    if (healthScore < 40) {
      intelligence.warnings.push('Market conditions are challenging - exercise caution');
    }
    
    
    if (dataSources.propertyAnalysis?.averageROI > 0.1) {
      intelligence.trends.push('Above-average returns expected');
    }
    if (economicData?.gdpGrowth > 3) {
      intelligence.trends.push('Strong economic growth supporting real estate');
    }
    
    intelligence.scores = {
      marketHealth: intelligence.marketHealth,
      investmentAppeal: intelligence.investmentAppeal,
      stability: healthScore > 60 ? 'high' : healthScore > 40 ? 'medium' : 'low',
      growthPotential: locationKnowledge?.growthPotential || 'medium'
    };
    
    return intelligence;
  },

  
  generateMarketAnalysis(dataSources, economicData, marketIntelligence, properties) {
    const analysis = {
      trendDirection: 'stable',
      marketHealth: marketIntelligence.marketHealth,
      investmentOutlook: 'neutral',
      keyInsights: [],
      recommendations: [],
      riskLevel: marketIntelligence.riskAssessment
    };
    
    
    if (marketIntelligence.marketHealth > 70) {
      analysis.trendDirection = 'growing';
      analysis.investmentOutlook = 'positive';
    } else if (marketIntelligence.marketHealth < 40) {
      analysis.trendDirection = 'declining';
      analysis.investmentOutlook = 'cautious';
    }
    
    
    if (dataSources.propertyAnalysis) {
      analysis.keyInsights.push(`Average ROI: ${(dataSources.propertyAnalysis.averageROI * 100).toFixed(2)}%`);
      analysis.keyInsights.push(`${dataSources.propertyAnalysis.totalProperties} properties available`);
    }
    
    if (economicData) {
      if (economicData.unemployment < 4) {
        analysis.keyInsights.push('Low unemployment supporting market strength');
      }
      if (economicData.gdpGrowth > 2) {
        analysis.keyInsights.push('Positive GDP growth indicating economic health');
      }
    }
    
    
    if (marketIntelligence.marketHealth > 70) {
      analysis.recommendations.push('Market conditions are favorable for investment');
      analysis.recommendations.push('Consider diversifying across multiple properties');
    } else if (marketIntelligence.marketHealth < 40) {
      analysis.recommendations.push('Exercise caution - market conditions are challenging');
      analysis.recommendations.push('Focus on low-risk opportunities');
    } else {
      analysis.recommendations.push('Market shows moderate potential');
      analysis.recommendations.push('Consider properties with strong fundamentals');
    }
    
    
    if (properties.length > 0) {
      const highROIProperties = properties.filter(p => (p.annual_roi || p.roi || 0) > 0.08);
      if (highROIProperties.length > 0) {
        analysis.keyInsights.push(`${highROIProperties.length} properties with ROI > 8%`);
      }
    }
    
    return analysis;
  },

  
  calculateMarketDataConfidence(dataSources) {
    let confidence = 0.5; 
    
    if (dataSources.platform && dataSources.platform.length > 0) confidence += 0.2;
    if (dataSources.propertyAnalysis) confidence += 0.15;
    if (dataSources.economic) confidence += 0.1;
    
    return Math.min(0.98, confidence);
  },

  
  generateIntelligentMarketFallback(location) {
    const locationParts = location.split(',').map(s => s.trim());
    const city = locationParts[0];
    const state = locationParts[1] || '';
    
    
    const knowledge = knowledgeBase.getLocationKnowledge(city, state);
    
    return {
      location: { city, state },
      analysis: {
        trendDirection: knowledge?.trendDirection || 'stable',
        marketHealth: knowledge?.marketHealth || 60,
        investmentOutlook: knowledge?.outlook || 'neutral',
        keyInsights: knowledge?.insights || [`Analyzing ${city} real estate market...`],
        recommendations: knowledge?.recommendations || ['Consider consulting with a real estate advisor'],
        riskLevel: knowledge?.riskLevel || 'medium'
      },
      dataSources: ['Knowledge Base'],
      timestamp: Date.now(),
      confidence: 0.7,
      fallback: true
    };
  },

  extractState(city) {
    const cityStateMap = {
      'miami': 'FL',
      'new york': 'NY',
      'nyc': 'NY',
      'new york city': 'NY',
      'austin': 'TX',
      'phoenix': 'AZ',
      'atlanta': 'GA',
      'san francisco': 'CA',
      'sf': 'CA',
      'los angeles': 'CA',
      'la': 'CA',
      'chicago': 'IL',
      'boston': 'MA',
      'seattle': 'WA',
      'denver': 'CO',
      'dallas': 'TX',
      'houston': 'TX'
    };
    return cityStateMap[city.toLowerCase()] || null;
  },

  async fetchEconomicData() {
    const cached = knowledgeBase.economicDataCache.get('economic');
    if (cached && (Date.now() - cached.timestamp) < knowledgeBase.cacheExpiry) {
      return cached.data;
    }

    try {
      
      
      const economicData = {
        interestRates: {
          mortgage30Year: 6.8,
          mortgage15Year: 6.2,
          fedRate: 5.25
        },
        indicators: {
          gdpGrowth: 2.8,
          unemployment: 3.7,
          inflation: 3.2
        },
        timestamp: Date.now()
      };

      knowledgeBase.economicDataCache.set('economic', { data: economicData, timestamp: Date.now() });
      return economicData;
    } catch (error) {
      console.error('Error fetching economic data:', error);
      return null;
    }
  },

  analyzeMarketTrends(trends) {
    if (!trends || trends.length === 0) return null;

    try {
      const recentTrends = trends.slice(0, 6); 
      
      
      const priceChanges = recentTrends
        .filter(t => t.median_price)
        .map(t => parseFloat(t.median_price));
      
      const priceGrowth = priceChanges.length > 1 
        ? ((priceChanges[0] - priceChanges[priceChanges.length - 1]) / priceChanges[priceChanges.length - 1]) * 100
        : 0;

      const inventoryTrends = recentTrends
        .filter(t => t.inventory_count)
        .map(t => parseFloat(t.inventory_count));
      
      const inventoryChange = inventoryTrends.length > 1
        ? ((inventoryTrends[0] - inventoryTrends[inventoryTrends.length - 1]) / inventoryTrends[inventoryTrends.length - 1]) * 100
        : 0;

      const daysOnMarket = recentTrends
        .filter(t => t.avg_days_on_market)
        .map(t => parseFloat(t.avg_days_on_market));
      
      const avgDaysOnMarket = daysOnMarket.length > 0
        ? daysOnMarket.reduce((sum, val) => sum + val, 0) / daysOnMarket.length
        : null;

      return {
        priceGrowth,
        inventoryChange,
        avgDaysOnMarket,
        marketHealth: dataRetrieval.calculateMarketHealth(priceGrowth, inventoryChange, avgDaysOnMarket),
        trendDirection: priceGrowth > 0 ? 'upward' : priceGrowth < 0 ? 'downward' : 'stable',
        supplyCondition: inventoryChange > 0 ? 'increasing' : inventoryChange < 0 ? 'decreasing' : 'stable'
      };
    } catch (error) {
      console.error('Error analyzing market trends:', error);
      return null;
    }
  },

  calculateMarketHealth(priceGrowth, inventoryChange, daysOnMarket) {
    let score = 50; 
    
    
    if (priceGrowth > 5) score += 20;
    else if (priceGrowth > 2) score += 10;
    else if (priceGrowth < -2) score -= 15;
    
    
    if (inventoryChange < 0 && priceGrowth > 0) score += 15; 
    else if (inventoryChange > 5) score -= 10; 
    
    
    if (daysOnMarket && daysOnMarket < 30) score += 10; 
    else if (daysOnMarket && daysOnMarket > 60) score -= 10; 
    
    return Math.max(0, Math.min(100, score));
  },

  async fetchPropertyData(filters = {}) {
    try {
      const properties = await propertyAPI.getProperties(filters);
      return properties || [];
    } catch (error) {
      console.error('Error fetching property data:', error);
      return [];
    }
  }
};


const dataRetrieval = advancedDataRetrieval;





const semanticEngine = {
  async analyzeQuery(query) {
    try {
      
      
      const lowerCaseQuery = query.toLowerCase();
      const patterns = knowledgeBase.memory.queryPatterns;

      for (const pattern in patterns) {
        if (lowerCaseQuery.includes(pattern)) {
          return {
            confidence: patterns[pattern].confidence,
            response: patterns[pattern].response
          };
        }
      }

      
      if (lowerCaseQuery.includes('market')) {
        return {
          confidence: 0.8,
          response: 'I can help you understand market trends. What market are you interested in?'
        };
      }
      if (lowerCaseQuery.includes('property')) {
        return {
          confidence: 0.8,
          response: 'I can help you find properties. What type of property are you looking for?'
        };
      }
      if (lowerCaseQuery.includes('investment')) {
        return {
          confidence: 0.8,
          response: 'I can help you with investment strategies. What type of investment are you considering?'
        };
      }
      if (lowerCaseQuery.includes('economy')) {
        return {
          confidence: 0.8,
          response: 'I can help you understand economic indicators. What specific economic data are you interested in?'
        };
      }

      return {
        confidence: 0.5,
        response: 'I can help you with a wide range of questions. How can I assist you?'
      };
    } catch (error) {
      console.error('Error analyzing query:', error);
      return {
        confidence: 0.3,
        response: 'I encountered an error while processing your request. Please try again later.'
      };
    }
  },

  async learnFromResponse(query, response) {
    const lowerCaseQuery = query.toLowerCase();
    const lowerCaseResponse = response.toLowerCase();

    
    if (lowerCaseResponse.includes('market')) {
      this.learnPattern('market', 'market', 0.9);
    }
    if (lowerCaseResponse.includes('property')) {
      this.learnPattern('property', 'property', 0.9);
    }
    if (lowerCaseResponse.includes('investment')) {
      this.learnPattern('investment', 'investment', 0.9);
    }
    if (lowerCaseResponse.includes('economy')) {
      this.learnPattern('economy', 'economy', 0.9);
    }

    
    if (lowerCaseQuery.includes('market')) {
      this.learnPattern('market', 'market', 0.8);
    }
    if (lowerCaseQuery.includes('property')) {
      this.learnPattern('property', 'property', 0.8);
    }
    if (lowerCaseQuery.includes('investment')) {
      this.learnPattern('investment', 'investment', 0.8);
    }
    if (lowerCaseQuery.includes('economy')) {
      this.learnPattern('economy', 'economy', 0.8);
    }
  },

  learnPattern(pattern, outcome, confidence) {
    knowledgeBase.learn(pattern, outcome, confidence);
  }
};





const responseGenerator = {
  async generateResponse(query, userContext) {
    try {
      
      const semanticAnalysis = await semanticEngine.analyzeQuery(query);
      const confidence = semanticAnalysis.confidence;
      let response = semanticAnalysis.response;

      
      if (confidence < 0.7) {
        await semanticEngine.learnFromResponse(query, response);
      }

      
      if (confidence < 0.7) {
        const marketData = await dataRetrieval.fetchMarketData(userContext.location);
        if (marketData.error) {
          response = `I encountered an error while fetching market data: ${marketData.error}.`;
        } else {
          response = `Based on the market data for ${marketData.location.city}, ${marketData.location.state}, the market is ${marketData.analysis.trendDirection}. The average days on market is ${marketData.analysis.avgDaysOnMarket}.`;
        }
      }

      
      if (confidence < 0.7) {
        const portfolio = await dataRetrieval.fetchUserPortfolio(userContext.userId);
        if (portfolio) {
          response = `Your current portfolio includes ${portfolio.properties.length} properties.`;
        } else {
          response = `I could not retrieve your portfolio.`;
        }
      }

      
      if (confidence < 0.7) {
        response = 'I can help you with a wide range of questions. How can I assist you?';
      }

      return {
        response: response,
        confidence: confidence,
        userContext: userContext
      };
    } catch (error) {
      console.error('Error generating response:', error);
      return {
        response: 'I encountered an error while processing your request. Please try again later.',
        confidence: 0.3,
        userContext: userContext
      };
    }
  },

  async provideFeedback(query, response, userContext) {
    try {
      
      
      console.log(`Feedback received: Query: "${query}", Response: "${response}", User Context:`, userContext);
      return { success: true };
    } catch (error) {
      console.error('Error providing feedback:', error);
      return { success: false, error: 'Failed to provide feedback' };
    }
  }
};





class CustomAIReasoningEngine {
  constructor() {
    this.userContext = {
      userId: 'default_user', 
      location: 'New York, NY', 
      preferences: {},
      learnedPatterns: {}
    };
    this.conversationHistory = [];
    this.feedbackLoop = true;
    this.feedbackInterval = 1000; 
  }

  async initialize() {
    console.log('Custom AI Reasoning Engine initialized.');
    
    
  }

  async startFeedbackLoop() {
    while (this.feedbackLoop) {
      await this.processFeedback();
      await new Promise(resolve => setTimeout(resolve, this.feedbackInterval));
    }
  }

  async processFeedback() {
    
    
    const query = 'What is the current market trend in New York?';
    const response = await responseGenerator.generateResponse(query, this.userContext);
    console.log(`Generated response: "${response.response}" (Confidence: ${response.confidence})`);

    
    const userFeedback = {
      query: query,
      response: response.response,
      confidence: response.confidence,
      userContext: response.userContext
    };

    await responseGenerator.provideFeedback(query, response.response, response.userContext);
  }

  async processQuery(query) {
    try {
      const response = await responseGenerator.generateResponse(query, this.userContext);
      this.conversationHistory.push({ query, response: response.response });
      return response;
    } catch (error) {
      console.error('Error processing query:', error);
      return {
        response: 'I encountered an error while processing your request. Please try again later.',
        confidence: 0.3,
        userContext: this.userContext
      };
    }
  }

  async stop() {
    this.feedbackLoop = false;
    console.log('Custom AI Reasoning Engine stopped.');
  }
}

const engine = new CustomAIReasoningEngine();
engine.initialize();
engine.startFeedbackLoop();






const extractLocation = (message) => {
  const locationPatterns = [
    /\b(new york|nyc|new york city|manhattan|brooklyn|queens|bronx|staten island)\b/i,
    /\b(los angeles|la|san francisco|sf|san diego|oakland)\b/i,
    /\b(chicago|miami|dallas|houston|phoenix|philadelphia|san antonio|san jose|austin|jacksonville)\b/i,
    /\b(seattle|denver|washington|boston|nashville|detroit|oklahoma city|portland|las vegas)\b/i,
    /\b([A-Z][a-z]+(?: [A-Z][a-z]+)*),\s*([A-Z]{2})\b/, 
    /\b([A-Z]{2})\b/ 
  ];

  for (const pattern of locationPatterns) {
    const match = message.match(pattern);
    if (match) {
      return match[0];
    }
  }
  return null;
};


const normalizeLocationForAPI = (location) => {
  const lower = location.toLowerCase().trim();
  const locationMap = {
    'nyc': 'New York, NY',
    'new york city': 'New York, NY',
    'new york': 'New York, NY',
    'la': 'Los Angeles, CA',
    'los angeles': 'Los Angeles, CA',
    'sf': 'San Francisco, CA',
    'san francisco': 'San Francisco, CA'
  };
  
  return locationMap[lower] || location;
};


const extractBudget = (message) => {
  const msgLower = message.toLowerCase();
  let budget = null;
  let maxBudget = null;
  let minBudget = null;
  
  
  
  const underPatterns = [
    /(?:under|below|less than|maximum|max|up to|at most)\s*\$?(\d+(?:,\d{3})*(?:\.\d{2})?)/i,
    /(?:under|below|less than|maximum|max|up to|at most)\s*\$?(\d+(?:,\d{3})*(?:\.\d{2})?)\s*(?:dollar|buck|budget)/i
  ];
  
  
  const overPatterns = [
    /(?:over|above|more than|at least|minimum|min)\s*\$?(\d+(?:,\d{3})*(?:\.\d{2})?)/i,
    /(?:over|above|more than|at least|minimum|min)\s*\$?(\d+(?:,\d{3})*(?:\.\d{2})?)\s*(?:dollar|buck|budget)/i
  ];
  
  
  const rangePatterns = [
    /(?:between|from)\s*\$?(\d+(?:,\d{3})*(?:\.\d{2})?)\s*(?:and|to|-)\s*\$?(\d+(?:,\d{3})*(?:\.\d{2})?)/i,
    /\$?(\d+(?:,\d{3})*(?:\.\d{2})?)\s*(?:-|to)\s*\$?(\d+(?:,\d{3})*(?:\.\d{2})?)/i
  ];
  
  
  const exactPatterns = [
    /(?:have|budget|with|can afford|want to invest|investing)\s*\$?(\d+(?:,\d{3})*(?:\.\d{2})?)/i,
    /\$?(\d+(?:,\d{3})*(?:\.\d{2})?)\s*(?:to invest|for investing|budget)/i
  ];
  
  
  for (const pattern of rangePatterns) {
    const match = message.match(pattern);
    if (match) {
      minBudget = parseFloat(match[1].replace(/,/g, ''));
      maxBudget = parseFloat(match[2].replace(/,/g, ''));
      if (minBudget > maxBudget) {
        [minBudget, maxBudget] = [maxBudget, minBudget]; 
      }
      return { min: minBudget, max: maxBudget, type: 'range' };
    }
  }
  
  
  for (const pattern of underPatterns) {
    const match = message.match(pattern);
    if (match) {
      maxBudget = parseFloat(match[1].replace(/,/g, ''));
      return { max: maxBudget, type: 'max' };
    }
  }
  
  
  for (const pattern of overPatterns) {
    const match = message.match(pattern);
    if (match) {
      minBudget = parseFloat(match[1].replace(/,/g, ''));
      return { min: minBudget, type: 'min' };
    }
  }
  
  
  for (const pattern of exactPatterns) {
    const match = message.match(pattern);
    if (match) {
      budget = parseFloat(match[1].replace(/,/g, ''));
      
      if (budget > 1000) {
        return { max: budget, type: 'max' };
      }
      
      return { exact: budget, type: 'exact' };
    }
  }
  
  return null;
};

const extractEntities = (message) => {
  const entities = [];
  
  
  const location = extractLocation(message);
  if (location) {
    entities.push({ type: 'location', values: [location] });
  }
  
  
  const amountRegex = /\$?(\d+(?:,\d{3})*(?:\.\d{2})?)/g;
  const amountMatches = message.match(amountRegex);
  if (amountMatches) {
    entities.push({ type: 'amount', values: amountMatches });
  }
  
  
  const budget = extractBudget(message);
  if (budget) {
    entities.push({ type: 'budget', values: [budget] });
  }
  
  return entities;
};


const explanationKnowledge = {
  'fractional ownership': {
    title: 'Fractional Real Estate Ownership',
    explanation: `**Fractional ownership** allows you to own a portion of a real estate property through tokens or shares. Here's how it works:\n\n**How It Works:**\n- You purchase tokens (minimum $50 each) that represent actual ownership percentage of a property\n- Each token gives you legal ownership rights to that portion of the property\n- You receive monthly dividends based on rental income proportional to your ownership\n- Property appreciation benefits you proportionally as the value increases\n- Professional property management handles all maintenance, tenants, and operations\n\n**Benefits:**\n- âœ… Start investing with just $50 (much lower than traditional real estate)\n- âœ… Diversify across multiple properties and markets\n- âœ… Passive income through monthly rental dividends\n- âœ… No need to manage properties yourself\n- âœ… Benefit from property appreciation\n- âœ… Liquid compared to traditional real estate\n\n**Example:** If a property worth $1,000,000 generates $10,000/month in rent, and you own 100 tokens ($5,000), you'd receive approximately $100/month in dividends.\n\n**Risks:**\n- Property values can decrease\n- Rental income may fluctuate\n- Less liquidity than stocks (tokens may not always be immediately sellable)\n\nFractional ownership democratizes real estate investing, making it accessible to everyone, not just the wealthy.`,
    confidence: 0.95
  },
  'fractional real estate': {
    title: 'Fractional Real Estate Ownership',
    explanation: `**Fractional real estate ownership** is a modern investment model where multiple investors own shares of a property.\n\n**Key Concepts:**\n- **Tokens**: Digital shares representing your ownership (e.g., $50 per token)\n- **Dividends**: Monthly payments from rental income based on your ownership percentage\n- **Appreciation**: When the property value increases, your share value increases proportionally\n- **Professional Management**: Properties are managed by experienced teams\n\nThis model makes real estate investing accessible to people who can't afford entire properties.`,
    confidence: 0.95
  },
  'real estate investing': {
    title: 'Real Estate Investing',
    explanation: `**Real Estate Investing** involves purchasing properties to generate income or profit.\n\n**Traditional vs. Fractional:**\n- **Traditional**: Buy entire properties (hundreds of thousands to millions)\n- **Fractional**: Own shares/tokens starting at $50\n\n**Benefits:**\n- Passive income through rent\n- Property value appreciation\n- Portfolio diversification\n- Hedge against inflation\n\nFractional ownership makes this accessible to more investors.`,
    confidence: 0.9
  },
  'token': {
    title: 'Property Tokens',
    explanation: `**Property tokens** are digital shares that represent ownership in a real estate property.\n\n**How Tokens Work:**\n- Each token = a percentage ownership in the property\n- Minimum investment: $50 per token\n- Tokens entitle you to:\n  - Monthly dividends from rental income\n  - Proportional share of property appreciation\n  - Legal ownership rights\n\n**Example:** A $1M property divided into 20,000 tokens means each token = 0.005% ownership. If you own 100 tokens, you own 0.5% of the property.`,
    confidence: 0.9
  },
  'roi': {
    title: 'Return on Investment (ROI)',
    explanation: `**ROI (Return on Investment)** measures how much profit you make relative to your investment.\n\n**Formula:** ROI = (Gains - Cost) / Cost Ã— 100\n\n**In Real Estate:**\n- **Rental Yield**: Annual rental income / property value (typically 6-10%)\n- **Appreciation**: Increase in property value over time (typically 3-7% annually)\n- **Total ROI**: Rental yield + appreciation\n\n**Example:** If you invest $5,000 and receive $500/year in dividends (10% yield) plus $300 in appreciation (6%), your total ROI is 16%.`,
    confidence: 0.9
  },
  'yield': {
    title: 'Investment Yield',
    explanation: `**Yield** is the annual return on your investment, expressed as a percentage.\n\n**Types:**\n- **Rental Yield**: Annual rental income / investment amount\n- **Current Yield**: Current annual income / current value\n- **Total Yield**: Includes both income and appreciation\n\n**Example:** If you invest $1,000 and receive $80/year in dividends, your yield is 8%.`,
    confidence: 0.9
  }
};


export const customAIReasoningEngine = {
  
  understandSemanticIntent: async (message, conversationHistory = []) => {
    try {
      
      
      let reasoningSteps = [];
      reasoningSteps.push({
        step: 1,
        thought: 'Initial query analysis',
        observation: `User said: "${message}"`
      });

      const safeMessage = message || '';
      const msgLower = safeMessage.toLowerCase().trim();
      
      
      reasoningSteps.push({
        step: 2,
        thought: 'Analyzing conversation context',
        observation: conversationHistory.length > 0 
          ? `Previous conversation has ${conversationHistory.length} messages`
          : 'This is a new conversation'
      });

      
      let isFollowUp = false;
      let resolvedTopics = [];
      const recentMessages = conversationHistory.slice(-6); 
      
      if (recentMessages.length > 0) {
        const lastAssistantMsg = recentMessages.filter(m => m.role === 'assistant').pop();
        const lastUserMsg = recentMessages.filter(m => m.role === 'user').pop();
        
        
        const followUpIndicators = ['it', 'that', 'this', 'them', 'those', 'the property', 'the market', 'they'];
        const hasPronoun = followUpIndicators.some(pronoun => msgLower.includes(pronoun));
        
        if (hasPronoun && lastAssistantMsg) {
          isFollowUp = true;
          reasoningSteps.push({
            step: 3,
            thought: 'Detected follow-up question',
            observation: `Query contains pronouns/references, likely following up on: "${lastAssistantMsg.content.substring(0, 50)}..."`
          });
          
          
          if (lastAssistantMsg.content.toLowerCase().includes('property')) resolvedTopics.push('properties');
          if (lastAssistantMsg.content.toLowerCase().includes('market')) resolvedTopics.push('market');
          if (lastAssistantMsg.content.toLowerCase().includes('investment')) resolvedTopics.push('investment');
          if (lastAssistantMsg.content.toLowerCase().includes('portfolio')) resolvedTopics.push('portfolio');
        }
      }

      
      let coreIntent = 'general_inquiry';
      let intentConfidence = 0.5;
      let intentReasoning = [];

      
      reasoningSteps.push({
        step: 4,
        thought: 'First pass: Explicit intent markers',
        observation: 'Scanning for clear intent indicators'
      });

      const intentChecks = [
        {
          name: 'explanation',
          patterns: ['what is', 'explain', 'tell me about', 'how does', 'what are', 'define', 'how do', 'how can', 'can you explain', 'what does', 'how work', 'how works'],
          weight: 1.0
        },
        {
          name: 'market_analysis',
          patterns: ['market', 'trend', 'prices', 'market analysis', 'market condition', 'market data', 'how is the market', 'market in', 'best market', 'which market', 'market for', 'market is best'],
          weight: 0.9
        },
        {
          name: 'investment_advice',
          patterns: ['recommend', 'suggest', 'should i', 'what should i invest', 'what should i', 'what to invest', 'best investment', 'investment advice', 'what to buy', 'what to invest in'],
          weight: 0.95
        },
        {
          name: 'comparison',
          patterns: ['compare', 'vs', 'versus', 'difference', 'better', 'best', 'which is', 'which one'],
          weight: 0.9
        },
        {
          name: 'new_user_help',
          patterns: ['getting started', 'help', 'how do i', 'how to', 'new user', 'beginner', 'guide', 'tutorial', 'i need help'],
          weight: 0.85
        },
        {
          name: 'wallet_inquiry',
          patterns: ['wallet', 'balance', 'funds', 'deposit', 'withdraw', 'add money', 'how much money', 'money do i have'],
          weight: 0.9
        },
        {
          name: 'portfolio_performance',
          patterns: ['performance', 'return', 'roi', 'earnings', 'profit', 'gain', 'loss', 'how is my', 'my portfolio'],
          weight: 0.85
        },
        {
          name: 'portfolio_inquiry',
          patterns: ['portfolio', 'my investment', 'i have', 'i own', 'my properties', 'what do i own', 'show my'],
          weight: 0.85
        },
        {
          name: 'property_search',
          patterns: ['property', 'properties', 'available', 'browse', 'find', 'search', 'marketplace', 'buy property', 'invest in', 'show me properties'],
          weight: 0.8
        }
      ];

      
      const intentScores = {};
      for (const intentCheck of intentChecks) {
        let score = 0;
        let matches = [];
        
        for (const pattern of intentCheck.patterns) {
          if (msgLower.includes(pattern.toLowerCase())) {
            score += intentCheck.weight;
            matches.push(pattern);
          }
        }
        
        if (score > 0) {
          intentScores[intentCheck.name] = {
            score,
            matches,
            weight: intentCheck.weight
          };
        }
      }

      
      reasoningSteps.push({
        step: 5,
        thought: 'Second pass: Context-aware re-evaluation',
        observation: `Found ${Object.keys(intentScores).length} potential intents`
      });

      
      if (intentScores['market_analysis'] && msgLower.includes('how is the market')) {
        
        intentScores['market_analysis'].score += 0.5; 
        if (intentScores['new_user_help']) {
          intentScores['new_user_help'].score *= 0.3; 
        }
        intentReasoning.push('Detected market inquiry phrase, prioritizing market_analysis over help');
      }

      if (intentScores['comparison'] && (msgLower.includes('properties') || msgLower.includes('compare'))) {
        intentScores['comparison'].score += 0.3;
        intentReasoning.push('Comparison query detected with property context');
      }

      
      if (Object.keys(intentScores).length > 0) {
        const sortedIntents = Object.entries(intentScores)
          .sort((a, b) => b[1].score - a[1].score);
        
        const bestIntent = sortedIntents[0];
        coreIntent = bestIntent[0];
        intentConfidence = Math.min(0.98, bestIntent[1].score / 2); 
        
        reasoningSteps.push({
          step: 6,
          thought: 'Intent selection',
          observation: `Selected: ${coreIntent} (confidence: ${(intentConfidence * 100).toFixed(0)}%)`,
          alternatives: sortedIntents.slice(1, 3).map(([name, data]) => `${name} (${data.score.toFixed(2)})`)
        });
        
        intentReasoning.push(`Selected ${coreIntent} based on pattern matches: ${bestIntent[1].matches.join(', ')}`);
      } else {
        reasoningSteps.push({
          step: 6,
          thought: 'Intent selection',
          observation: 'No clear intent found, defaulting to general_inquiry'
        });
      }

      
      reasoningSteps.push({
        step: 7,
        thought: 'Entity extraction',
        observation: 'Extracting locations, numbers, and other entities'
      });

      const entities = extractEntities(safeMessage);
      
      if (entities.location) {
        reasoningSteps.push({
          step: 7.1,
          thought: 'Location detected',
          observation: `Found location: ${entities.location}`
        });
      }

      
      let questionType = 'general';
      if (msgLower.startsWith('how')) questionType = 'how';
      else if (msgLower.startsWith('what')) questionType = 'what';
      else if (msgLower.startsWith('why')) questionType = 'why';
      else if (msgLower.startsWith('when')) questionType = 'when';
      else if (msgLower.startsWith('where')) questionType = 'where';
      else if (msgLower.startsWith('who')) questionType = 'who';

      
      reasoningSteps.push({
        step: 8,
        thought: 'Final reasoning summary',
        observation: `Processed query through ${reasoningSteps.length} reasoning steps`,
        conclusion: {
          intent: coreIntent,
          confidence: intentConfidence,
          questionType,
          isFollowUp,
          resolvedTopics
        }
      });

      return {
        message: safeMessage,
        coreIntent,
        intentConfidence,
        intentReasoning,
        reasoningSteps, 
        questionType,
        entities,
        context: {
          isFollowUp,
          resolvedTopics,
          conversationLength: conversationHistory.length,
          recentContext: recentMessages.slice(-2).map(m => m.content.substring(0, 50))
        },
        
        semanticAnalysis: await advancedSemanticEngine.analyzeQuery(safeMessage, conversationHistory)
      };
    } catch (error) {
      console.error('Error in understandSemanticIntent:', error);
      return {
        message: message || '',
        coreIntent: 'general_inquiry',
        intentConfidence: 0.5,
        questionType: 'general',
        entities: {},
        context: {}
      };
    }
  },

  
  chainOfThoughtReasoning: async (semanticAnalysis, userAccountData, knowledgeBaseRef) => {
    
    const userId = getCurrentUserId();
    const sessionId = userId || 'anonymous';
    
    
    const conversationHistory = knowledgeBase.getConversationContext(sessionId);
    
    
    
    
    
    return await advancedReasoningEngine.chainOfThoughtReasoning(
      semanticAnalysis,
      userAccountData,
      conversationHistory
    );
  },

  
  _legacyChainOfThoughtReasoning: async (semanticAnalysis, userAccountData, knowledgeBaseRef) => {
    try {
      const reasoningSteps = [];
      const understanding = {
        question: semanticAnalysis.message,
        facts: [],
        inferences: [],
        conclusions: [],
        dataSources: []
      };

      
      const userId = getCurrentUserId();
      const sessionId = userId || 'anonymous';
      const conversationContext = knowledgeBase.getConversationContext(sessionId);

      
      reasoningSteps.push({ step: 1, action: 'data_retrieval', result: 'Fetching relevant data...' });

      
      const legacyLocation = extractLocation(semanticAnalysis.message);
      const legacyNormalizedLocation = legacyLocation ? normalizeLocationForAPI(legacyLocation) : null;
      
      
      if (advancedDataRetrieval && advancedDataRetrieval.fetchAllRelevantData) {
        try {
          const allData = await advancedDataRetrieval.fetchAllRelevantData(
            semanticAnalysis.coreIntent,
            {
              userId,
              location: legacyNormalizedLocation,
              filters: semanticAnalysis.context?.filters || {}
            }
          );
          
          
          if (allData.properties && allData.properties.length > 0) {
            understanding.facts.push({
              type: 'platform_properties',
              source: 'platform_api',
              data: allData.properties,
              confidence: 0.95,
              timestamp: Date.now()
            });
            understanding.dataSources.push('Properties API');
          }
          if (allData.portfolio) {
            understanding.facts.push({
              type: 'portfolio_data',
              source: 'platform_api',
              data: allData.portfolio,
              confidence: 0.95,
              timestamp: Date.now()
            });
            understanding.dataSources.push('Portfolio API');
          }
          if (allData.investments && allData.investments.length > 0) {
            understanding.facts.push({
              type: 'investments_data',
              source: 'platform_api',
              data: allData.investments,
              confidence: 0.95,
              timestamp: Date.now()
            });
            understanding.dataSources.push('Investments API');
          }
          if (allData.wallet) {
            understanding.facts.push({
              type: 'wallet_data',
              source: 'platform_api',
              data: allData.wallet,
              confidence: 0.95,
              timestamp: Date.now()
            });
            understanding.dataSources.push('Wallet API');
          }
                
      if (allData.market) {
        if (Array.isArray(allData.market)) {
          
          allData.market.forEach((marketData, index) => {
            if (marketData && !marketData.error) {
              understanding.facts.push({
                type: 'market_data',
                source: 'api',
                data: marketData,
                confidence: marketData.confidence || 0.9,
                timestamp: Date.now(),
                index: index 
              });
              understanding.dataSources.push(`Market Data API (${marketData.location?.city || 'Location ' + (index + 1)})`);
            }
          });
        } else if (!allData.market.error) {
          
          understanding.facts.push({
            type: 'market_data',
            source: 'api',
            data: allData.market,
            confidence: allData.market.confidence || 0.9,
            timestamp: Date.now()
          });
          understanding.dataSources.push('Market Data API');
        }
      }
          if (allData.economic) {
            understanding.facts.push({
              type: 'economic_data',
              source: 'api',
              data: allData.economic,
              confidence: 0.9,
              timestamp: Date.now()
            });
            understanding.dataSources.push('Economic Data API');
          }
          
          
          reasoningSteps.push({
            step: 2,
            action: 'parallel_fetch_complete',
            result: `Fetched ${Object.keys(allData).length} data sources in parallel`
          });
        } catch (error) {
          console.warn('Parallel fetch failed, falling back to sequential:', error);
          
        }
      }

      
      if (understanding.facts.length === 0) {
        const location = extractLocation(semanticAnalysis.message);
        understanding.facts.push({
          type: 'location_detected',
          source: 'user_query',
          data: { location: normalizeLocationForAPI(location) },
          confidence: 0.8
        });
      }

      
      const dataNeeds = semanticAnalysis.dataNeeds || [];
      
      
      if (dataNeeds.includes('user_portfolio') || dataNeeds.includes('user_investments') || 
          semanticAnalysis.coreIntent === 'portfolio_inquiry' || 
          semanticAnalysis.coreIntent === 'portfolio_performance' ||
          semanticAnalysis.coreIntent === 'investment_advice') {
        try {
          const portfolio = await dataRetrieval.fetchUserPortfolio(userId);
          const investments = await dataRetrieval.fetchUserInvestments(userId);
          
          if (portfolio) {
            understanding.facts.push({
              type: 'portfolio_data',
              source: 'platform_api',
              data: portfolio,
              confidence: 0.95
            });
            understanding.dataSources.push('Portfolio API');
          }
          
          if (investments && investments.length > 0) {
            understanding.facts.push({
              type: 'investments_data',
              source: 'platform_api',
              data: investments,
              confidence: 0.95
            });
            understanding.dataSources.push('Investments API');
          }
        } catch (error) {
          console.error('Error fetching portfolio/investments:', error);
        }
      }
      
      
      if (dataNeeds.includes('user_wallet') || 
          semanticAnalysis.coreIntent === 'wallet_inquiry' ||
          semanticAnalysis.coreIntent === 'investment_advice') {
        try {
          const wallet = await dataRetrieval.fetchUserWallet(userId);
          if (wallet) {
            understanding.facts.push({
              type: 'wallet_data',
              source: 'platform_api',
              data: wallet,
              confidence: 0.95
            });
            understanding.dataSources.push('Wallet API');
          }
        } catch (error) {
          console.error('Error fetching wallet:', error);
        }
      }
      
      
      if (dataNeeds.includes('platform_properties') || 
          semanticAnalysis.coreIntent === 'property_search' ||
          semanticAnalysis.coreIntent === 'investment_advice' ||
          semanticAnalysis.coreIntent === 'recommendation' ||
          semanticAnalysis.coreIntent === 'new_user_help') {
        try {
          
          const filters = {};
          if (semanticAnalysis.context?.propertyType) {
            filters.property_type = semanticAnalysis.context.propertyType;
          }
          
          const properties = await dataRetrieval.fetchPlatformProperties(filters);
          if (properties && properties.length > 0) {
            understanding.facts.push({
              type: 'platform_properties',
              source: 'platform_api',
              data: properties,
              confidence: 0.95
            });
            understanding.dataSources.push('Properties API');
          }
        } catch (error) {
          console.error('Error fetching platform properties:', error);
        }
      }
      
      
      if (semanticAnalysis.coreIntent === 'investment_advice' || 
          semanticAnalysis.coreIntent === 'recommendation' ||
          semanticAnalysis.coreIntent === 'new_user_help') {
        try {
          const portfolio = understanding.facts.find(f => f.type === 'portfolio_data')?.data;
          const investments = understanding.facts.find(f => f.type === 'investments_data')?.data || [];
          const wallet = understanding.facts.find(f => f.type === 'wallet_data')?.data;
          
          
          const userPreferences = {};
          if (semanticAnalysis.context?.propertyType) {
            userPreferences.propertyType = semanticAnalysis.context.propertyType;
          }
          if (semanticAnalysis.context?.minROI) {
            userPreferences.minROI = semanticAnalysis.context.minROI;
          }
          if (semanticAnalysis.context?.maxPrice) {
            userPreferences.maxPrice = semanticAnalysis.context.maxPrice;
          }
          
          const recommendations = await dataRetrieval.generateInvestmentRecommendations(
            userId, 
            userPreferences
          );
          
          if (recommendations && recommendations.length > 0) {
            understanding.facts.push({
              type: 'investment_recommendations',
              source: 'platform_api',
              data: recommendations,
              confidence: 0.9
            });
            understanding.dataSources.push('Investment Recommendations Engine');
          }
          
          
          const advice = dataRetrieval.analyzePortfolioForAdvice(userId, portfolio, investments, wallet);
          if (advice && advice.length > 0) {
            understanding.facts.push({
              type: 'portfolio_advice',
              source: 'platform_analysis',
              data: advice,
              confidence: 0.85
            });
            understanding.dataSources.push('Portfolio Analysis Engine');
          }
        } catch (error) {
          console.error('Error generating recommendations/advice:', error);
        }
      }

      
      if (semanticAnalysis.coreIntent === 'explanation') {
        const msgLower = semanticAnalysis.message.toLowerCase();
        
        
        for (const [key, knowledge] of Object.entries(explanationKnowledge)) {
          if (msgLower.includes(key)) {
            understanding.facts.push({
              type: 'explanation_data',
              source: 'knowledge_base',
              data: knowledge,
              confidence: knowledge.confidence || 0.95,
              timestamp: Date.now()
            });
            understanding.dataSources.push('Knowledge Base');
            break; 
          }
        }
        
        
        if (!understanding.facts.find(f => f.type === 'explanation_data')) {
          understanding.facts.push({
            type: 'explanation_intent',
            source: 'intent_classification',
            data: { intent: 'explanation', query: semanticAnalysis.message },
            confidence: 0.8,
            timestamp: Date.now()
          });
          understanding.dataSources.push('Intent Classification');
        }
        
        
        
        reasoningSteps.push({
          step: 2,
          action: 'explanation_knowledge_retrieval',
          result: `Retrieved explanation data from knowledge base`
        });
        
        
        if (understanding.facts.find(f => f.type === 'explanation_data')) {
          understanding.confidence = 0.95;
        } else {
          understanding.confidence = 0.75; 
        }
        
        
        return {
          reasoningSteps,
          understanding,
          confidence: understanding.confidence,
          conversationContext
        };
      }
      
      reasoningSteps.push({ step: 2, action: 'parallel_data_fetching', result: 'Fetching data from multiple sources in parallel...' });
      
      const location = extractLocation(semanticAnalysis.message);
      const normalizedLocation = location ? normalizeLocationForAPI(location) : null;
      
      
      const allData = await advancedDataRetrieval.fetchAllRelevantData(
        semanticAnalysis.coreIntent,
        {
          userId,
          location: normalizedLocation,
          message: semanticAnalysis.message, 
          filters: semanticAnalysis.context?.filters || {}
        }
      );

      
      if (userAccountData && (semanticAnalysis.coreIntent === 'portfolio_inquiry' || semanticAnalysis.context?.personal)) {
        understanding.facts.push({
          type: 'user_data',
          source: 'user_account',
          data: userAccountData,
          confidence: 1.0
        });
        understanding.dataSources.push('User Account');
      }

      reasoningSteps.push({
        step: 2,
        action: 'fact_gathering',
        result: `Gathered ${understanding.facts.length} data sources: ${understanding.dataSources.join(', ') || 'none'}`
      });

      
      if (understanding.facts.length > 0) {
        const marketFact = understanding.facts.find(f => f.type === 'market_data');
        if (marketFact && marketFact.data && marketFact.data.analysis) {
          const analysis = marketFact.data.analysis;
          understanding.inferences.push({
            type: 'market_trend',
            conclusion: `Market shows ${analysis.trendDirection || 'stable'} trend`,
            confidence: 0.85
          });
        }
      }

      reasoningSteps.push({
        step: 3,
        action: 'logical_inference',
        result: `Generated ${understanding.inferences.length} inferences`
      });

      
      if (semanticAnalysis.coreIntent === 'market_analysis' && understanding.facts.length > 0) {
        const marketFact = understanding.facts.find(f => f.type === 'market_data');
        if (marketFact && marketFact.data && marketFact.data.analysis) {
          const analysis = marketFact.data.analysis;
          understanding.conclusions.push({
            type: 'market_assessment',
            assessment: (analysis.marketHealth || 50) > 70 ? 'Strong market conditions' : 'Moderate market conditions',
            confidence: 0.85
          });
        }
      }

      reasoningSteps.push({
        step: 4,
        action: 'conclusion_generation',
        result: `Reached ${understanding.conclusions.length} conclusions`
      });

      
      const confidence = Math.min(0.95, 0.7 + (understanding.facts.length * 0.05) + (understanding.inferences.length * 0.03));

      return {
        reasoningSteps,
        understanding,
        confidence
      };
    } catch (error) {
      console.error('Error in chainOfThoughtReasoning:', error);
      return {
        reasoningSteps: [{ step: 1, action: 'error', result: 'Error during reasoning' }],
        understanding: {
          question: semanticAnalysis.message,
          facts: [],
          inferences: [],
          conclusions: [],
          dataSources: []
        },
        confidence: 0.5
      };
    }
  },

  
  generateDynamicResponse: async (semanticAnalysis, reasoningResult, userAccountData) => {
    try {
      
      if (!semanticAnalysis || !semanticAnalysis.message) {
        return `I encountered an error while generating a response. Please try again.`;
      }
      
      
      const understanding = reasoningResult?.understanding || {};
      const conversationContext = reasoningResult?.conversationContext || [];
      const lastAssistantMessage = conversationContext.filter(m => m.role === 'assistant').pop();
      const isFollowUp = semanticAnalysis.context?.isFollowUp || false;
      const resolvedTopics = semanticAnalysis.context?.resolvedTopics || [];
      
      
      if (!understanding.facts) understanding.facts = [];
      if (!understanding.inferences) understanding.inferences = [];
      if (!understanding.conclusions) understanding.conclusions = [];
      if (!understanding.dataSources) understanding.dataSources = [];
      
      let response = '';
      const msgLower = semanticAnalysis.message.toLowerCase();

      
      if (semanticAnalysis.coreIntent === 'explanation') {
        try {
          
          const explanationFact = understanding.facts.find(f => f.type === 'explanation_data');
          
          if (explanationFact && explanationFact.data) {
            const knowledge = explanationFact.data;
            response = knowledge.explanation || knowledge.title || '';
            if (response) return response;
          }
          
          
          const directMatch = Object.entries(explanationKnowledge).find(([key]) => msgLower.includes(key));
          if (directMatch && directMatch[1]) {
            response = directMatch[1].explanation || directMatch[1].title || '';
            if (response) return response;
          }
          
          
          if (msgLower.includes('fractional') || msgLower.includes('fractional ownership')) {
            return explanationKnowledge['fractional ownership'].explanation;
          }
          if (msgLower.includes('token') && msgLower.includes('work')) {
            return explanationKnowledge['token'].explanation;
          }
          if (msgLower.includes('roi') || msgLower.includes('return on investment')) {
            return explanationKnowledge['roi'].explanation;
          }
          if (msgLower.includes('yield')) {
            return explanationKnowledge['yield'].explanation;
          }
          if (msgLower.includes('real estate') && (msgLower.includes('invest') || msgLower.includes('investing'))) {
            return explanationKnowledge['real estate investing'].explanation;
          }
          
          response = `I can explain various concepts related to fractional real estate ownership. Could you be more specific?`;
          return response;
        } catch (err) {
          console.error('Error handling explanation:', err);
        }
      }

      
      if (semanticAnalysis.coreIntent === 'investment_advice' || semanticAnalysis.coreIntent === 'recommendation') {
        if (isFollowUp && lastAssistantMessage) {
          response += `Following up on our previous discussion, `;
        }
        
        const recommendationsFact = understanding.facts.find(f => f.type === 'investment_recommendations');
        const platformPropertiesFact = understanding.facts.find(f => f.type === 'platform_properties');
        const portfolioFact = understanding.facts.find(f => f.type === 'portfolio_data');
        const investmentsFact = understanding.facts.find(f => f.type === 'investments_data');
        const walletFact = understanding.facts.find(f => f.type === 'wallet_data');
        const marketFact = understanding.facts.find(f => f.type === 'market_data');
        
        
        const budgetEntity = semanticAnalysis.entities?.find(e => e.type === 'budget') || 
                            extractEntities(semanticAnalysis.message).find(e => e.type === 'budget');
        const queryBudget = budgetEntity?.values?.[0] || null;

        const recommendations = recommendationsFact?.data || [];
        const allProperties = platformPropertiesFact?.data || [];
        const portfolio = portfolioFact?.data || {};
        const investments = investmentsFact?.data || [];
        const wallet = walletFact?.data || {};
        const marketData = marketFact?.data || null;

        response += `**💰 Investment Analysis & Recommendations**\n\n`;
        
        
        if (portfolio && portfolio.total_invested > 0) {
          response += `**💼 Your Current Portfolio:**\n`;
          response += `   💵 Total Invested: $${(portfolio.total_invested || 0).toLocaleString()}\n`;
          response += `   📊 Current Value: $${(portfolio.current_value || portfolio.total_invested || 0).toLocaleString()}\n`;
          response += `   📈 Total Return: $${(portfolio.total_return || 0).toLocaleString()} (${((portfolio.total_return_percentage || 0) * 100).toFixed(2)}%)\n`;
          response += `   🏠 Properties Owned: ${investments.length}\n\n`;
          
          if (investments.length > 0) {
            const markets = [...new Set(investments.map(inv => inv.property?.location || 'Unknown'))];
            response += `**🌍 Diversification:** You're invested in ${markets.length} different market${markets.length > 1 ? 's' : ''}.\n`;
            if (markets.length < 3) {
              response += `   💡 Consider diversifying across more markets for better risk management.\n`;
            }
            response += `\n`;
          }
        } else {
          response += `**🚀 Getting Started:** You're new to the platform! This is a great time to start building your real estate portfolio.\n\n`;
        }

        
        const availableBalance = queryBudget?.exact || queryBudget?.max || wallet?.available_balance || wallet?.balance || 0;
        const budgetInfo = queryBudget ? 
          (queryBudget.type === 'range' ? `between $${queryBudget.min?.toLocaleString()} and $${queryBudget.max?.toLocaleString()}` :
           queryBudget.type === 'max' ? `up to $${queryBudget.max?.toLocaleString()}` :
           queryBudget.type === 'min' ? `at least $${queryBudget.min?.toLocaleString()}` :
           `$${queryBudget.exact?.toLocaleString()}`) : null;
        
        if (queryBudget) {
          response += `**💰 Budget:** ${budgetInfo}\n\n`;
        } else if (availableBalance > 0) {
          response += `**💰 Available Capital:** $${availableBalance.toLocaleString()}\n\n`;
        } else {
          response += `**💰 Available Capital:** $0\n`;
          response += `💡 Consider adding funds to your wallet to start investing.\n\n`;
        }

        
        if (allProperties.length > 0) {
          const scoredProperties = allProperties
            .filter(prop => {
              const alreadyOwns = investments.some(inv => inv.property_id === prop.id);
              if (alreadyOwns) return false;
              
              const tokenPrice = prop.token_price || 50;
              const minInvestment = tokenPrice * 1; 
              
              
              if (queryBudget) {
                if (queryBudget.type === 'range') {
                  if (tokenPrice < queryBudget.min || tokenPrice > queryBudget.max) return false;
                } else if (queryBudget.type === 'max') {
                  if (tokenPrice > queryBudget.max) return false;
                } else if (queryBudget.type === 'min') {
                  if (tokenPrice < queryBudget.min) return false;
                } else if (queryBudget.type === 'exact') {
                  
                  if (tokenPrice > queryBudget.exact) return false;
                }
              }
              
              
              if (!queryBudget && availableBalance > 0 && minInvestment > availableBalance * 2) return false;
              
              return true;
            })
            .map(property => {
              let score = 0;
              const reasons = [];
              const roi = property.annual_roi || property.roi || 0;
              
              if (roi > 10) { score += 40; reasons.push('Excellent ROI'); }
              else if (roi > 8) { score += 30; reasons.push('Strong ROI'); }
              else if (roi > 6) { score += 20; reasons.push('Good ROI'); }
              else if (roi > 4) { score += 10; reasons.push('Moderate ROI'); }
              
              const riskLevel = (property.risk_level || 'medium').toLowerCase();
              if (riskLevel === 'low') { score += 20; reasons.push('Low risk'); }
              else if (riskLevel === 'medium') { score += 10; reasons.push('Moderate risk'); }
              
              const propLocation = property.location || property.city || '';
              if (portfolio && investments.length > 0) {
                const hasLocation = investments.some(inv => {
                  const invLocation = inv.property?.location || inv.property?.city || '';
                  return invLocation.toLowerCase() === propLocation.toLowerCase();
                });
                if (!hasLocation) { score += 20; reasons.push('New market diversification'); }
              } else { score += 15; reasons.push('Great starter investment'); }
              
              if (property.market_trend === 'growing' || property.market_condition === 'hot') {
                score += 10; reasons.push('Growing market');
              }
              
              const tokenPrice = property.token_price || 50;
              if (availableBalance > 0 && tokenPrice <= availableBalance) {
                score += 10; reasons.push('Within your budget');
              } else if (availableBalance === 0 || tokenPrice <= 500) {
                score += 5; reasons.push('Affordable entry');
              }
              
              return { property, score, reasons };
            })
            .sort((a, b) => b.score - a.score)
            .slice(0, 5);

          if (scoredProperties.length > 0) {
            response += `**🎯 Top Investment Recommendations:**\n\n`;
            scoredProperties.forEach((rec, index) => {
              const prop = rec.property;
              const roi = prop.annual_roi || prop.roi || 0;
              const tokenPrice = prop.token_price || 50;
              const location = prop.location || prop.city || prop.address || 'Location TBD';
              const emoji = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '⭐';
              response += `${emoji} **${index + 1}. ${prop.name || prop.address || 'Property'}** (${location})\n`;
              response += `   📈 ROI: ${(roi * 100).toFixed(2)}%\n`;
              response += `   💵 Token Price: $${tokenPrice.toLocaleString()}\n`;
              response += `   ⚖️ Risk Level: ${(prop.risk_level || 'Medium').toUpperCase()}\n`;
              if (rec.reasons.length > 0) {
                response += `   ✅ Why: ${rec.reasons.join(', ')}\n`;
              }
              response += `\n`;
            });

            if (portfolio && portfolio.total_invested > 0) {
              response += `**💡 Strategic Advice:**\n`;
              if (investments.length < 3) {
                response += `   🌍 Diversify across 3-5 properties to reduce risk\n`;
                response += `   🗺️ Consider properties in different markets\n`;
              } else {
                response += `   ✅ Your portfolio is well-diversified. Consider focusing on high-ROI opportunities.\n`;
              }
              response += `\n`;
            }

            if (marketData && marketData.analysis) {
              response += `**📊 Market Context:**\n`;
              response += `   📈 Market Trend: ${marketData.analysis.trendDirection || 'Stable'}\n`;
              if (marketData.analysis.avgDaysOnMarket) {
                response += `   ⏱️ Average Days on Market: ${marketData.analysis.avgDaysOnMarket}\n`;
              }
              response += `\n`;
            }
          } else {
            response += `**⚠️ Investment Analysis**\n\n`;
            response += `I've analyzed all available properties, but none match your current criteria perfectly. `;
            response += `Here's what you can do:\n\n`;
            response += `1. **🔄 Adjust Your Criteria:** Consider properties with slightly different risk profiles\n`;
            response += `2. **💰 Add More Capital:** Some higher-value opportunities may require more investment\n`;
            response += `3. **⏰ Check Back Later:** New properties are added regularly\n\n`;
            if (queryBudget) {
              response += `💡 **Tip:** Try adjusting your budget or asking "Show me all properties under $${(queryBudget.max || queryBudget.exact || 1000).toLocaleString()}"\n\n`;
            }
          }
        } else {
          response += `**📊 Investment Analysis**\n\n`;
          const propertiesFetched = platformPropertiesFact !== undefined;
          if (propertiesFetched && allProperties.length === 0) {
            response += `I've checked the platform, and there are currently no properties available for investment.\n\n`;
            response += `**🔜 Next Steps:**\n`;
            response += `   1. ⏰ Check back later for new investment opportunities\n`;
            response += `   2. 🏪 Visit the Marketplace to see upcoming properties\n\n`;
          } else {
            response += `I'm analyzing the latest property listings from the platform.\n\n`;
            response += `**🚀 Getting Started:**\n`;
            response += `   1. 💵 Start Small: Begin with $50-500\n`;
            response += `   2. 🌍 Diversify: Spread across multiple properties\n`;
            response += `   3. 📈 Focus on ROI > 8% for better returns\n`;
            response += `   4. 📊 Consider properties in growing markets\n\n`;
          }
          
          if (portfolio && portfolio.total_invested > 0) {
            response += `**💼 Your Portfolio Status:** You're already invested. Consider adding to existing positions.\n`;
          } else {
            response += `**🎯 Your Portfolio Status:** You're ready to start! Add funds to begin investing.\n`;
          }
        }

        if (investments.length > 0 && portfolio.total_return > 0) {
          response += `\n**🎉 Portfolio Insights:**\n`;
          response += `   📊 Active Investments: ${investments.length}\n`;
          response += `   💰 Performance: Your portfolio is generating positive returns! 🚀\n`;
        }

        return response;
      }

      
      if (semanticAnalysis.coreIntent === 'market_analysis') {
        const marketFact = understanding.facts.find(f => f.type === 'market_data');
        const location = semanticAnalysis.entities?.location || extractLocation(semanticAnalysis.message);
        
        if (marketFact && marketFact.data) {
          const marketData = marketFact.data;
          const city = marketData.location?.city || location || 'Selected Market';
          const state = marketData.location?.state || '';
          const locationName = state ? `${city}, ${state}` : city;
          
          response += `**📊 Comprehensive Market Analysis: ${locationName}**\n\n`;
          response += `I've analyzed the ${locationName} real estate market from multiple data sources to give you a complete picture. Here's what you need to know:\n\n`;
          
          
          if (marketData.marketIntelligence) {
            const intel = marketData.marketIntelligence;
            const healthScore = intel.marketHealth;
            
            response += `## 🎯 **Quick Market Summary**\n\n`;
            
            
            response += `**Market Health Score: ${healthScore}/100** `;
            if (healthScore >= 75) {
              response += `✅ **Excellent**\n`;
              response += `This market is in strong shape! Property values are likely to appreciate, and there's good demand from buyers and renters. This is generally a good time to invest.\n\n`;
            } else if (healthScore >= 60) {
              response += `✅ **Good**\n`;
              response += `The market is healthy with steady growth potential. It's a solid choice for investment, though you should still research specific properties carefully.\n\n`;
            } else if (healthScore >= 40) {
              response += `⚠️ **Moderate**\n`;
              response += `The market shows mixed signals. Exercise caution and focus on properties with strong fundamentals (good location, stable tenants, positive cash flow).\n\n`;
            } else {
              response += `⚠️ **Challenging**\n`;
              response += `The market is facing headwinds. Consider waiting for better conditions or focusing on very low-risk opportunities.\n\n`;
            }
            
            
            response += `**Risk Level: ${intel.riskAssessment.toUpperCase()}** `;
            if (intel.riskAssessment === 'low') {
              response += `✅\n`;
              response += `This market has lower risk, meaning property values are more stable and less likely to drop significantly. Great for conservative investors or beginners.\n\n`;
            } else if (intel.riskAssessment === 'medium') {
              response += `⚖️\n`;
              response += `Moderate risk means there's potential for both growth and some volatility. This is normal for most real estate markets and can offer good opportunities.\n\n`;
            } else {
              response += `⚠️\n`;
              response += `Higher risk means more volatility. Values could change more dramatically. Only invest if you're comfortable with potential ups and downs.\n\n`;
            }
            
            
            const appeal = intel.investmentAppeal;
            response += `**Investment Appeal: ${appeal > 70 ? 'HIGH' : appeal > 40 ? 'MODERATE' : 'LOW'}** `;
            if (appeal > 70) {
              response += `🔥\n`;
              response += `This market offers strong investment potential! Properties here are likely to generate good returns and appreciate over time.\n\n`;
            } else if (appeal > 40) {
              response += `📈\n`;
              response += `This market has decent investment potential. You can find good opportunities with proper research and property selection.\n\n`;
            } else {
              response += `📉\n`;
              response += `Investment potential is lower. Consider other markets or wait for conditions to improve.\n\n`;
            }
          }
          
          
          if (marketData.analysis) {
            const analysis = marketData.analysis;
            
            response += `## 📈 **Market Direction & Outlook**\n\n`;
            
            
            response += `**Current Trend: ${analysis.trendDirection.toUpperCase()}**\n`;
            if (analysis.trendDirection === 'growing') {
              response += `The market is on an upward trajectory. Property values are increasing, and demand is strong. This typically means:\n`;
              response += `• Your investment is likely to grow in value over time\n`;
              response += `• You may see higher rental income potential\n`;
              response += `• Properties may be more competitive to purchase\n\n`;
            } else if (analysis.trendDirection === 'declining') {
              response += `The market is experiencing downward pressure. Property values may be decreasing. This means:\n`;
              response += `• You might find better purchase prices\n`;
              response += `• But values may continue to decline short-term\n`;
              response += `• Focus on long-term fundamentals and cash flow\n\n`;
            } else {
              response += `The market is stable - neither rapidly growing nor declining. This means:\n`;
              response += `• Predictable, steady returns\n`;
              response += `• Less volatility than growing or declining markets\n`;
              response += `• Good for conservative, income-focused investments\n\n`;
            }
            
            
            response += `**Investment Outlook: ${analysis.investmentOutlook.toUpperCase()}**\n`;
            if (analysis.investmentOutlook === 'positive') {
              response += `The outlook for investors is favorable. Market conditions suggest your investment has good potential for returns.\n\n`;
            } else if (analysis.investmentOutlook === 'cautious') {
              response += `Be cautious with investments here. Consider properties with strong fundamentals and conservative returns.\n\n`;
            } else {
              response += `Market outlook is neutral. Research individual properties carefully before investing.\n\n`;
            }
            
            
            if (analysis.keyInsights && analysis.keyInsights.length > 0) {
              response += `## 💡 **Key Insights for Investors**\n\n`;
              analysis.keyInsights.forEach((insight, index) => {
                response += `${index + 1}. **${insight}**\n`;
                
                if (insight.includes('ROI')) {
                  response += `   💰 ROI (Return on Investment) tells you how much profit you'll make each year. Higher ROI means better returns!\n\n`;
                } else if (insight.includes('properties available')) {
                  response += `   🏠 More properties means more choices. Compare multiple options to find the best deal.\n\n`;
                } else if (insight.includes('unemployment')) {
                  response += `   👥 Low unemployment means people have jobs and can afford rent, which keeps your property occupied.\n\n`;
                } else if (insight.includes('GDP')) {
                  response += `   📊 GDP growth indicates a healthy economy, which supports real estate values.\n\n`;
                } else {
                  response += `\n`;
                }
              });
            }
          }
          
          
          if (marketData.propertyAnalysis) {
            const propAnalysis = marketData.propertyAnalysis;
            
            response += `## 🏘️ **Available Investment Opportunities**\n\n`;
            
            if (propAnalysis.totalProperties > 0) {
              response += `**${propAnalysis.totalProperties} Properties Available**\n`;
              response += `There are properties you can invest in right now on our platform. This gives you options to diversify your portfolio.\n\n`;
              
              if (propAnalysis.averagePrice) {
                response += `**Average Property Value: $${propAnalysis.averagePrice.toLocaleString()}**\n`;
                response += `This is the typical property value in this market. Remember, with fractional ownership, you can invest just a portion of this (starting from $50-$500 per token).\n\n`;
              }
              
              if (propAnalysis.averageROI) {
                response += `**Average Annual ROI: ${(propAnalysis.averageROI * 100).toFixed(2)}%**\n`;
                response += `This means if you invest $1,000, you can expect about $${(propAnalysis.averageROI * 1000).toFixed(0)} in returns per year. `;
                if (propAnalysis.averageROI > 0.08) {
                  response += `That's excellent! Most investors aim for 6-10% ROI.\n\n`;
                } else if (propAnalysis.averageROI > 0.06) {
                  response += `That's solid and above average for real estate investments.\n\n`;
                } else {
                  response += `That's moderate but still provides steady, predictable returns.\n\n`;
                }
              }
              
              if (propAnalysis.priceRange) {
                response += `**Investment Range: $${propAnalysis.priceRange.min?.toLocaleString() || 'N/A'} - $${propAnalysis.priceRange.max?.toLocaleString() || 'N/A'}**\n`;
                response += `There's a range of properties at different price points, so you can choose based on your budget.\n\n`;
              }
              
              if (propAnalysis.roiRange) {
                response += `**ROI Range: ${(propAnalysis.roiRange.min * 100).toFixed(2)}% - ${(propAnalysis.roiRange.max * 100).toFixed(2)}%**\n`;
                response += `Some properties offer higher returns (but may have higher risk), while others offer more stable, moderate returns.\n\n`;
              }
              
              if (propAnalysis.lowRiskProperties > 0) {
                response += `**${propAnalysis.lowRiskProperties} Low-Risk Properties Available**\n`;
                response += `These properties are safer investments - less likely to lose value, more stable returns. Great for beginners! 💚\n\n`;
              }
            } else {
              response += `Currently, no properties are available in this market on our platform. `;
              response += `New properties are added regularly, so check back soon or explore other markets.\n\n`;
            }
          }
          
          
          if (marketData.marketIntelligence) {
            const intel = marketData.marketIntelligence;
            
            if (intel.opportunities && intel.opportunities.length > 0) {
              response += `## ✨ **Investment Opportunities**\n\n`;
              intel.opportunities.forEach(opp => {
                response += `✅ **${opp}**\n`;
                if (opp.includes('High ROI')) {
                  response += `   → Look for properties with ROI above 8% for strong returns\n\n`;
                } else if (opp.includes('Low-risk')) {
                  response += `   → Perfect for building a stable foundation to your portfolio\n\n`;
                } else if (opp.includes('growth potential')) {
                  response += `   → Consider this for long-term appreciation - values may increase over time\n\n`;
                } else {
                  response += `\n`;
                }
              });
            }
            
            if (intel.warnings && intel.warnings.length > 0) {
              response += `## ⚠️ **Things to Watch Out For**\n\n`;
              intel.warnings.forEach(warning => {
                response += `⚠️ **${warning}**\n`;
                if (warning.includes('inflation')) {
                  response += `   → Your returns might not go as far due to rising prices. Consider properties with inflation protection.\n\n`;
                } else if (warning.includes('challenging')) {
                  response += `   → Take extra time to research, focus on properties with strong fundamentals (good location, stable income).\n\n`;
                } else {
                  response += `\n`;
                }
              });
            }
            
            if (intel.trends && intel.trends.length > 0) {
              response += `## 📊 **Market Trends to Know**\n\n`;
              intel.trends.forEach(trend => {
                response += `📈 **${trend}**\n`;
                if (trend.includes('returns')) {
                  response += `   → Properties in this market are performing above average. Good sign!\n\n`;
                } else if (trend.includes('economic growth')) {
                  response += `   → A strong economy supports real estate. Your investments are backed by solid fundamentals.\n\n`;
                } else {
                  response += `\n`;
                }
              });
            }
          }
          
          
          if (marketData.economicIndicators) {
            const econ = marketData.economicIndicators;
            
            response += `## 🏦 **Economic Health Check**\n\n`;
            response += `The overall economy affects real estate. Here's what's happening:\n\n`;
            
            if (econ.unemployment !== undefined) {
              response += `**Unemployment Rate: ${econ.unemployment}%** `;
              if (econ.unemployment < 4) {
                response += `✅ **Excellent**\n`;
                response += `Very low unemployment means people have jobs and can pay rent. Your properties are more likely to stay occupied and generate income.\n\n`;
              } else if (econ.unemployment < 6) {
                response += `✅ **Good**\n`;
                response += `Low unemployment supports the rental market. Your investment income should be stable.\n\n`;
              } else {
                response += `⚠️ **Higher**\n`;
                response += `Higher unemployment could mean fewer people can afford rent. Focus on properties in stable areas with good demand.\n\n`;
              }
            }
            
            if (econ.gdpGrowth !== undefined || econ.gdp !== undefined) {
              const gdp = econ.gdpGrowth || econ.gdp;
              response += `**GDP Growth: ${gdp}%** `;
              if (gdp > 2) {
                response += `✅ **Strong**\n`;
                response += `The economy is growing well, which supports property values and rental demand. This is positive for your investment.\n\n`;
              } else if (gdp > 0) {
                response += `⚖️ **Moderate**\n`;
                response += `Economy is growing slowly. Property values should remain stable, but growth may be modest.\n\n`;
              } else {
                response += `⚠️ **Slow/Declining**\n`;
                response += `Economic growth is weak. Be extra selective about properties - focus on those with strong, stable income.\n\n`;
              }
            }
            
            if (econ.inflation !== undefined) {
              response += `**Inflation Rate: ${econ.inflation}%** `;
              if (econ.inflation < 3) {
                response += `✅ **Stable**\n`;
                response += `Low inflation means your returns maintain their buying power. Good for preserving wealth.\n\n`;
              } else if (econ.inflation < 5) {
                response += `⚖️ **Moderate**\n`;
                response += `Moderate inflation is normal. Real estate often keeps pace with inflation, protecting your investment.\n\n`;
              } else {
                response += `⚠️ **High**\n`;
                response += `High inflation erodes purchasing power. Real estate is often a good hedge, but be mindful of rising costs.\n\n`;
              }
            }
          }
          
          
          response += `## 🎯 **What This Means for You**\n\n`;
          
          if (marketData.analysis) {
            if (marketData.analysis.investmentOutlook === 'positive') {
              response += `**Great news!** This market looks promising for investment. Here's what to do next:\n\n`;
              response += `1. **Explore Properties** - Browse available properties in this market on the platform\n`;
              response += `2. **Compare Options** - Look at ROI, risk levels, and property types to find your fit\n`;
              response += `3. **Start Small** - Consider investing $50-$500 in your first property to learn the ropes\n`;
              response += `4. **Diversify** - Don't put all your money in one property. Spread investments across multiple properties\n`;
            } else if (marketData.analysis.investmentOutlook === 'cautious') {
              response += `**Proceed with caution** in this market. Here's how to invest wisely:\n\n`;
              response += `1. **Focus on Low-Risk** - Look for properties marked as "Low Risk" with stable returns\n`;
              response += `2. **Research Thoroughly** - Review property details, location, and rental history carefully\n`;
              response += `3. **Start Small** - Begin with a small investment to test the waters\n`;
              response += `4. **Consider Other Markets** - Explore other cities with better outlooks\n`;
            } else {
              response += `**Neutral market conditions** mean you should be selective:\n\n`;
              response += `1. **Look for Value** - Find properties with strong ROI (8%+) and good fundamentals\n`;
              response += `2. **Research Carefully** - Compare multiple properties before investing\n`;
              response += `3. **Long-Term Focus** - Think 5+ years for best results\n`;
            }
          }
          
          response += `\n## 💡 **Remember**\n\n`;
          response += `• **ROI** (Return on Investment) is your annual profit percentage\n`;
          response += `• **Risk Level** tells you how stable/unstable the investment might be\n`;
          response += `• **Diversification** (spreading investments) reduces risk\n`;
          response += `• **Start Small** - You can always invest more later as you learn\n\n`;
          
          
          if (marketData.dataSources && marketData.dataSources.length > 0) {
            response += `---\n`;
            response += `*Analysis based on: ${marketData.dataSources.join(', ')}* | `;
            response += `*Confidence: ${((marketData.confidence || 0.7) * 100).toFixed(0)}%*\n`;
          }
          
          return response;
        } else {
          
          const locationName = location || 'your selected market';
          
          response += `**Market Analysis: ${locationName}**\n\n`;
          response += `I'm currently analyzing market conditions from multiple data sources.\n\n`;
          response += `**What I'm Evaluating:**\n`;
          response += `• Current property prices and trends\n`;
          response += `• Economic indicators (GDP, unemployment, inflation)\n`;
          response += `• Investment opportunities and ROI potential\n`;
          response += `• Risk assessment and market stability\n`;
          response += `• Historical trends and future projections\n\n`;
          response += `**To provide you with the most accurate analysis, I'm gathering:**\n`;
          response += `• Real-time market data from multiple sources\n`;
          response += `• Property-specific metrics and analytics\n`;
          response += `• Economic indicators affecting the market\n`;
          response += `• Comparative market analysis\n\n`;
          response += `Please check back in a moment, or specify a particular city/location for immediate analysis.`;
          
          return response;
        }
      }

      
      if (semanticAnalysis.coreIntent === 'portfolio_inquiry' || semanticAnalysis.coreIntent === 'portfolio_performance') {
        const portfolioFact = understanding.facts.find(f => f.type === 'portfolio_data');
        const investmentsFact = understanding.facts.find(f => f.type === 'investments_data');
        
        if (portfolioFact && portfolioFact.data) {
          const portfolio = portfolioFact.data;
          const investments = investmentsFact?.data || [];
          
          response += `**Your Portfolio Summary**\n\n`;
          response += `• Total Invested: $${(portfolio.total_invested || 0).toLocaleString()}\n`;
          response += `• Current Value: $${(portfolio.current_value || portfolio.total_invested || 0).toLocaleString()}\n`;
          response += `• Total Return: $${(portfolio.total_return || 0).toLocaleString()} (${((portfolio.total_return_percentage || 0) * 100).toFixed(2)}%)\n`;
          response += `• Properties Owned: ${investments.length}\n\n`;
          
          if (investments.length > 0) {
            response += `**Your Investments:**\n`;
            investments.slice(0, 5).forEach((inv, index) => {
              const prop = inv.property || {};
              response += `${index + 1}. ${prop.name || prop.address || 'Property'}\n`;
              if (inv.tokens_owned) {
                response += `   Tokens: ${inv.tokens_owned}\n`;
              }
              response += `\n`;
            });
          }
          
          return response;
        } else {
          response += `I can help you track your portfolio performance. `;
          response += `It looks like you may not have any investments yet, or I'm having trouble accessing your portfolio data. `;
          response += `Please try visiting your Portfolio page to see your investments.`;
          
          return response;
        }
      }

      
      if (semanticAnalysis.coreIntent === 'wallet_inquiry') {
        const walletFact = understanding.facts.find(f => f.type === 'wallet_data');
        
        if (walletFact && walletFact.data) {
          const wallet = walletFact.data;
          response += `**Your Wallet**\n\n`;
          response += `• Available Balance: $${(wallet.available_balance || wallet.balance || 0).toLocaleString()}\n`;
          if (wallet.total_deposited) {
            response += `• Total Deposited: $${wallet.total_deposited.toLocaleString()}\n`;
          }
          if (wallet.total_withdrawn) {
            response += `• Total Withdrawn: $${wallet.total_withdrawn.toLocaleString()}\n`;
          }
          
          return response;
        } else {
          response += `I can help you check your wallet balance. `;
          response += `Please visit your Wallet page to see your current balance and transaction history.`;
          
          return response;
        }
      }

      
      if (semanticAnalysis.coreIntent === 'new_user_help') {
        response += `**Welcome to DomufiAI!** 👋\n\n`;
        response += `I'm here to help you navigate fractional real estate investing. Here's how I can assist you:\n\n`;
        response += `**Getting Started:**\n`;
        response += `• "How does fractional ownership work?" - Learn the basics\n`;
        response += `• "What should I invest in?" - Get personalized recommendations\n`;
        response += `• "Show me available properties" - Browse investment opportunities\n\n`;
        response += `**Managing Your Portfolio:**\n`;
        response += `• "What's my portfolio performance?" - Track your investments\n`;
        response += `• "How much money do I have?" - Check your wallet balance\n`;
        response += `• "What are property tokens?" - Understand the investment model\n\n`;
        response += `**Market Insights:**\n`;
        response += `• "How is the market in NYC?" - Get market analysis\n`;
        response += `• "What's a good ROI?" - Learn about returns\n\n`;
        response += `Just ask me anything about real estate investing, your portfolio, or the platform!`;
        
        return response;
      }

      
      
      if (semanticAnalysis.coreIntent === 'comparison' && !msgLowerForComplex.includes('market')) {
        const platformPropertiesFact = understanding.facts.find(f => f.type === 'platform_properties');
        const portfolioFact = understanding.facts.find(f => f.type === 'portfolio_data');
        const investmentsFact = understanding.facts.find(f => f.type === 'investments_data');
        
        const allProperties = platformPropertiesFact?.data || [];
        const portfolio = portfolioFact?.data || {};
        const investments = investmentsFact?.data || [];
        
        response += `**Property Comparison Analysis**\n\n`;
        
        if (allProperties.length > 0) {
          
          const propertiesToCompare = allProperties
            .slice(0, 5)
            .sort((a, b) => {
              const scoreA = (a.annual_roi || a.roi || 0) + ((a.risk_level === 'low' ? 10 : a.risk_level === 'medium' ? 5 : 0));
              const scoreB = (b.annual_roi || b.roi || 0) + ((b.risk_level === 'low' ? 10 : b.risk_level === 'medium' ? 5 : 0));
              return scoreB - scoreA;
            });
          
          if (propertiesToCompare.length >= 2) {
            response += `I'll compare the top ${propertiesToCompare.length} properties for you:\n\n`;
            
            
            response += `| Property | Location | ROI | Token Price | Risk | Score |\n`;
            response += `|----------|----------|-----|-------------|------|-------|\n`;
            
            propertiesToCompare.forEach(prop => {
              const name = (prop.name || prop.address || 'Property').substring(0, 20);
              const location = (prop.location || prop.city || 'N/A').substring(0, 15);
              const roi = ((prop.annual_roi || prop.roi || 0) * 100).toFixed(2) + '%';
              const price = '$' + (prop.token_price || 50).toLocaleString();
              const risk = (prop.risk_level || 'Medium').toUpperCase();
              const score = ((prop.annual_roi || prop.roi || 0) * 10).toFixed(1);
              
              response += `| ${name} | ${location} | ${roi} | ${price} | ${risk} | ${score}/10 |\n`;
            });
            
            response += `\n**Key Differences:**\n\n`;
            
            
            const rois = propertiesToCompare.map(p => p.annual_roi || p.roi || 0);
            const avgROI = rois.reduce((a, b) => a + b, 0) / rois.length;
            const maxROI = Math.max(...rois);
            const minROI = Math.min(...rois);
            
            response += `• **ROI Range:** ${(minROI * 100).toFixed(2)}% - ${(maxROI * 100).toFixed(2)}% (Average: ${(avgROI * 100).toFixed(2)}%)\n`;
            
            const riskLevels = propertiesToCompare.map(p => p.risk_level || 'medium');
            const lowRiskCount = riskLevels.filter(r => r.toLowerCase() === 'low').length;
            const highRiskCount = riskLevels.filter(r => r.toLowerCase() === 'high').length;
            
            if (lowRiskCount > 0) {
              response += `• **Low-Risk Options:** ${lowRiskCount} property/properties available\n`;
            }
            if (highRiskCount > 0) {
              response += `• **High-Risk Options:** ${highRiskCount} property/properties (higher potential returns)\n`;
            }
            
            
            const bestProperty = propertiesToCompare[0];
            response += `\n**Best Overall:** ${bestProperty.name || bestProperty.address}\n`;
            response += `• Highest ROI: ${((bestProperty.annual_roi || bestProperty.roi || 0) * 100).toFixed(2)}%\n`;
            response += `• Risk Level: ${(bestProperty.risk_level || 'Medium').toUpperCase()}\n`;
            response += `• Entry Price: $${(bestProperty.token_price || 50).toLocaleString()}\n`;
            
            
            response += `\n**Investment Strategy Based on Comparison:**\n`;
            if (portfolio && portfolio.total_invested > 0) {
              response += `• You already have investments. Consider diversifying across different risk levels.\n`;
            } else {
              response += `• For beginners: Start with the low-risk option for stability\n`;
              response += `• For growth: Consider the highest ROI property\n`;
              response += `• For balance: Mix of medium-risk properties\n`;
            }
            
          } else {
            response += `I found ${allProperties.length} property/properties available. `;
            response += `To provide a meaningful comparison, I need at least 2 properties. `;
            response += `Please check back when more properties are available.`;
          }
        } else {
          response += `I'm currently analyzing available properties for comparison. `;
          response += `This will help you understand the differences between investment options.\n\n`;
          response += `**What I'll Compare:**\n`;
          response += `• Return on Investment (ROI)\n`;
          response += `• Risk levels\n`;
          response += `• Token prices and entry costs\n`;
          response += `• Location and market characteristics\n`;
          response += `• Investment suitability for your portfolio\n\n`;
          response += `Once properties are available, I'll provide a detailed side-by-side comparison.`;
        }
        
        return response;
      }

      
      if (semanticAnalysis.coreIntent === 'portfolio_inquiry' || semanticAnalysis.coreIntent === 'portfolio_performance' ||
          msgLower.includes('portfolio') || msgLower.includes('my investment') || msgLower.includes('show me my')) {
        
        const portfolioFact = understanding.facts.find(f => f.type === 'portfolio_data');
        const investmentsFact = understanding.facts.find(f => f.type === 'investments_data');
        
        let portfolio = portfolioFact?.data || {};
        let investments = investmentsFact?.data || [];
        
        
        if (!portfolioFact && !investmentsFact) {
          const userId = getCurrentUserId();
          if (userId) {
            try {
              
              const portfolioData = await advancedDataRetrieval.fetchUserPortfolio(userId);
              const investmentsData = await advancedDataRetrieval.fetchUserInvestments(userId);
              if (portfolioData) portfolio = portfolioData;
              if (investmentsData && Array.isArray(investmentsData)) investments = investmentsData;
            } catch (err) {
              console.warn('Could not fetch portfolio data:', err);
            }
          }
        }
        
        response += `**📊 Your Portfolio Overview**\n\n`;
        
        if (portfolio && portfolio.total_invested > 0) {
          response += `**Total Invested:** $${(portfolio.total_invested || 0).toLocaleString()}\n`;
          response += `**Current Value:** $${(portfolio.current_value || portfolio.total_invested || 0).toLocaleString()}\n`;
          response += `**Total Return:** $${(portfolio.total_return || 0).toLocaleString()} `;
          if (portfolio.total_return_percentage !== undefined) {
            const returnPercent = (portfolio.total_return_percentage * 100).toFixed(2);
            response += `(${returnPercent >= 0 ? '+' : ''}${returnPercent}%)\n`;
          }
          response += `\n`;
          
          response += `**Properties Owned:** ${investments.length}\n`;
          if (investments.length > 0) {
            response += `\n**Your Investments:**\n\n`;
            investments.slice(0, 5).forEach((inv, index) => {
              const prop = inv.property || {};
              response += `${index + 1}. **${prop.name || prop.address || 'Property'}**\n`;
              response += `   • Location: ${prop.location || prop.city || 'N/A'}\n`;
              if (prop.annual_roi || prop.roi) {
                response += `   • ROI: ${((prop.annual_roi || prop.roi || 0) * 100).toFixed(2)}%\n`;
              }
              if (inv.tokens_owned) {
                response += `   • Tokens Owned: ${inv.tokens_owned}\n`;
              }
              response += `\n`;
            });
            if (investments.length > 5) {
              response += `...and ${investments.length - 5} more properties\n\n`;
            }
            
            
            response += `**Portfolio Insights:**\n`;
            const markets = [...new Set(investments.map(inv => inv.property?.location || inv.property?.city || 'Unknown').filter(Boolean))];
            response += `• Markets: ${markets.length} different location${markets.length > 1 ? 's' : ''} (${markets.slice(0, 3).join(', ')}${markets.length > 3 ? '...' : ''})\n`;
            
            if (portfolio.total_return_percentage > 0) {
              response += `• ✅ Your portfolio is performing well with positive returns!\n`;
            }
            
            if (markets.length < 3) {
              response += `• 💡 Tip: Consider diversifying across more markets to reduce risk\n`;
            }
          }
        } else {
          response += `**Getting Started**\n\n`;
          response += `You don't have any investments yet. This is a great time to start building your real estate portfolio!\n\n`;
          response += `**Next Steps:**\n`;
          response += `1. Add funds to your wallet\n`;
          response += `2. Ask me "What should I invest in?" for personalized recommendations\n`;
          response += `3. Start with $50-$500 in your first property\n`;
          response += `4. Build your portfolio over time\n\n`;
          response += `**Why Invest?**\n`;
          response += `• Earn passive income through rental returns\n`;
          response += `• Benefit from property value appreciation\n`;
          response += `• Start with fractional ownership (no need to buy entire properties)\n`;
          response += `• Diversify your investment portfolio\n`;
        }
        
        return response;
      }

      
      if (semanticAnalysis.coreIntent === 'wallet_inquiry') {
        const walletFact = understanding.facts.find(f => f.type === 'wallet_data');
        const wallet = walletFact?.data || {};
        
        const balance = wallet.available_balance || wallet.balance || 0;
        
        response += `**Your Wallet Balance**\n\n`;
        response += `**Available Balance:** $${balance.toLocaleString()}\n\n`;
        
        if (balance === 0) {
          response += `You don't have any funds in your wallet yet.\n\n`;
          response += `**To get started:**\n`;
          response += `1. Add funds to your wallet\n`;
          response += `2. Browse available properties\n`;
          response += `3. Start investing with as little as $50\n\n`;
        } else {
          response += `You have $${balance.toLocaleString()} available to invest!\n\n`;
          response += `**What you can do:**\n`;
          response += `• Invest in properties starting from $50\n`;
          response += `• Diversify across multiple properties\n`;
          response += `• Ask me "What should I invest in?" for recommendations\n`;
        }
        
        return response;
      }

      
      const msgLowerForComplex = semanticAnalysis.message.toLowerCase();
      
      
      if ((msgLowerForComplex.includes('best market') || msgLowerForComplex.includes('which market')) && 
          (msgLowerForComplex.includes('beginner') || msgLowerForComplex.includes('new') || msgLowerForComplex.includes('start') || msgLowerForComplex.includes('best'))) {
        
        const marketFacts = understanding.facts.filter(f => f.type === 'market_data');
        
        response += `**🏆 Best Market for Beginners - Comprehensive Analysis**\n\n`;
        response += `I've analyzed major real estate markets to recommend the best option for beginners. Here's what I found:\n\n`;
        
        if (marketFacts.length > 0) {
          
          const beginnerFriendlyMarkets = marketFacts
            .map(fact => {
              const marketData = fact.data;
              if (!marketData) return null;
              
              let beginnerScore = 0;
              const reasons = [];
              
              
              if (marketData.marketIntelligence?.riskAssessment === 'low') {
                beginnerScore += 40;
                reasons.push('Low risk - more stable');
              } else if (marketData.marketIntelligence?.riskAssessment === 'medium') {
                beginnerScore += 20;
                reasons.push('Moderate risk');
              }
              
              
              const healthScore = marketData.marketIntelligence?.marketHealth || marketData.analysis?.marketHealth || 50;
              if (healthScore >= 70) {
                beginnerScore += 30;
                reasons.push('Strong market health');
              } else if (healthScore >= 60) {
                beginnerScore += 15;
                reasons.push('Good market conditions');
              }
              
              
              if (marketData.propertyAnalysis?.totalProperties > 0) {
                beginnerScore += 15;
                reasons.push(`${marketData.propertyAnalysis.totalProperties} properties available`);
              }
              
              
              if (marketData.propertyAnalysis?.lowRiskProperties > 0) {
                beginnerScore += 15;
                reasons.push(`${marketData.propertyAnalysis.lowRiskProperties} low-risk options`);
              }
              
              return {
                market: marketData,
                score: beginnerScore,
                reasons,
                location: `${marketData.location?.city || 'Unknown'}, ${marketData.location?.state || ''}`
              };
            })
            .filter(m => m !== null)
            .sort((a, b) => b.score - a.score);
          
          if (beginnerFriendlyMarkets.length > 0) {
            const bestMarket = beginnerFriendlyMarkets[0];
            
            response += `## 🏆 **Best Recommendation: ${bestMarket.location}**\n\n`;
            response += `**Beginner-Friendliness Score: ${bestMarket.score}/100**\n\n`;
            response += `**Why This Market is Great for Beginners:**\n`;
            bestMarket.reasons.forEach(reason => {
              response += `✓ ${reason}\n`;
            });
            response += `\n`;
            
            
            if (bestMarket.market.analysis) {
              response += `**Market Overview:**\n`;
              response += `• Trend: ${bestMarket.market.analysis.trendDirection || 'Stable'}\n`;
              response += `• Risk Level: ${(bestMarket.market.analysis.riskLevel || 'Medium').toUpperCase()}\n`;
              response += `• Investment Outlook: ${bestMarket.market.analysis.investmentOutlook || 'Neutral'}\n`;
              response += `\n`;
            }
            
            
            if (bestMarket.market.propertyAnalysis) {
              response += `**Investment Opportunities:**\n`;
              response += `• Properties Available: ${bestMarket.market.propertyAnalysis.totalProperties || 0}\n`;
              if (bestMarket.market.propertyAnalysis.averageROI) {
                response += `• Average ROI: ${(bestMarket.market.propertyAnalysis.averageROI * 100).toFixed(2)}%\n`;
              }
              if (bestMarket.market.propertyAnalysis.lowRiskProperties > 0) {
                response += `• Low-Risk Options: ${bestMarket.market.propertyAnalysis.lowRiskProperties}\n`;
              }
              response += `\n`;
            }
            
            
            if (beginnerFriendlyMarkets.length > 1) {
              response += `**Other Good Options for Beginners:**\n`;
              beginnerFriendlyMarkets.slice(1, 3).forEach((market, index) => {
                response += `${index + 2}. **${market.location}** (Score: ${market.score}/100)\n`;
              });
              response += `\n`;
            }
            
            response += `**Getting Started:**\n`;
            response += `1. Browse properties in ${bestMarket.location}\n`;
            response += `2. Start with a low-risk property (invest $50-$500)\n`;
            response += `3. Focus on properties with stable returns\n`;
            response += `4. Diversify across multiple properties as you learn\n`;
          } else {
            response += `I'm analyzing major markets to find the best option for beginners. `;
            response += `For now, I recommend focusing on markets with:\n`;
            response += `• Low to moderate risk levels\n`;
            response += `• Stable market conditions\n`;
            response += `• Multiple property options available\n`;
            response += `• Good ROI potential (6-8%+)\n\n`;
            response += `Ask me about specific markets like "How is the market in NYC?" to get detailed analysis.`;
          }
        } else {
          response += `**Recommended Markets for Beginners:**\n\n`;
          response += `Based on general market characteristics, here are markets typically good for beginners:\n\n`;
          response += `1. **Miami, FL**\n`;
          response += `   • Growing market with good opportunities\n`;
          response += `   • Vacation rental potential\n`;
          response += `   • Moderate risk, good ROI potential\n\n`;
          response += `2. **Atlanta, GA**\n`;
          response += `   • Affordable entry points\n`;
          response += `   • Stable market conditions\n`;
          response += `   • Lower risk profile\n\n`;
          response += `3. **Chicago, IL**\n`;
          response += `   • Established market\n`;
          response += `   • Multiple property types available\n`;
          response += `   • Moderate risk/return balance\n\n`;
          response += `**Getting Started Tips:**\n`;
          response += `• Start with $50-$500 in your first investment\n`;
          response += `• Focus on low-risk properties initially\n`;
          response += `• Ask me "What should I invest in?" for specific recommendations\n`;
          response += `• Research each market individually before investing\n`;
        }
        
        return response;
      }
      
      
      if ((msgLowerForComplex.includes('compare') && msgLowerForComplex.includes('market')) || 
          (msgLowerForComplex.includes('compare') && (msgLowerForComplex.includes('nyc') || msgLowerForComplex.includes('miami') || msgLowerForComplex.includes('la')) && msgLowerForComplex.includes('market'))) {
        
        const locations = [];
        if (msgLowerForComplex.includes('nyc') || msgLowerForComplex.includes('new york')) locations.push('New York, NY');
        if (msgLowerForComplex.includes('miami')) locations.push('Miami, FL');
        if (msgLowerForComplex.includes('la') || msgLowerForComplex.includes('los angeles')) locations.push('Los Angeles, CA');
        if (msgLowerForComplex.includes('chicago')) locations.push('Chicago, IL');
        if (msgLowerForComplex.includes('atlanta')) locations.push('Atlanta, GA');
        
        if (locations.length >= 2) {
          response += `**Market Comparison: ${locations.join(' vs ')}**\n\n`;
          response += `I'm analyzing both markets to give you a comprehensive comparison.\n\n`;
          
          
          const marketFacts = understanding.facts.filter(f => f.type === 'market_data');
          
          if (marketFacts.length > 0) {
            marketFacts.forEach((fact, index) => {
              const marketData = fact.data;
              if (marketData && marketData.location) {
                const locName = `${marketData.location.city}, ${marketData.location.state}`;
                response += `**${locName}:**\n`;
                if (marketData.analysis) {
                  response += `• Trend: ${marketData.analysis.trendDirection || 'Unknown'}\n`;
                  response += `• Outlook: ${marketData.analysis.investmentOutlook || 'Unknown'}\n`;
                  if (marketData.propertyAnalysis) {
                    response += `• Avg ROI: ${(marketData.propertyAnalysis.averageROI * 100).toFixed(2)}%\n`;
                    response += `• Properties Available: ${marketData.propertyAnalysis.totalProperties || 0}\n`;
                  }
                  response += `\n`;
                }
              }
            });
            
            response += `**Recommendation:** `;
            const bestMarket = marketFacts.reduce((best, current) => {
              const bestScore = best?.data?.marketIntelligence?.investmentAppeal || 0;
              const currentScore = current?.data?.marketIntelligence?.investmentAppeal || 0;
              return currentScore > bestScore ? current : best;
            }, marketFacts[0]);
            
            if (bestMarket && bestMarket.data) {
              const loc = bestMarket.data.location;
              response += `Based on my analysis, ${loc.city}, ${loc.state} shows the strongest investment potential.\n`;
            } else {
              response += `Both markets have their strengths. Choose based on your risk tolerance and investment goals.\n`;
            }
          } else {
            response += `I'm gathering market data for comparison. Here's what I'm analyzing:\n\n`;
            locations.forEach(loc => {
              response += `• ${loc}: Fetching market trends, property data, and economic indicators\n`;
            });
            response += `\nAsk me again in a moment for the complete comparison, or ask about a specific market individually.`;
          }
          
          return response;
        }
      }

      
      if (understanding.facts.length > 0) {
        response += `**Analysis Based on Available Data**\n\n`;
        
        
        const hasProperties = understanding.facts.some(f => f.type === 'platform_properties');
        const hasPortfolio = understanding.facts.some(f => f.type === 'portfolio_data');
        const hasMarket = understanding.facts.some(f => f.type === 'market_data');
        const hasWallet = understanding.facts.some(f => f.type === 'wallet_data');
        
        if (hasProperties) {
          const propFact = understanding.facts.find(f => f.type === 'platform_properties');
          const properties = propFact?.data || [];
          if (properties.length > 0) {
            response += `**Available Properties:** ${properties.length} properties found\n`;
            const topProperty = properties[0];
            response += `• Example: ${topProperty.name || topProperty.address || 'Property'} with ${((topProperty.annual_roi || topProperty.roi || 0) * 100).toFixed(2)}% ROI\n`;
            response += `\nAsk me "What should I invest in?" for detailed recommendations.\n\n`;
          }
        }
        
        if (hasPortfolio) {
          const portfolioFact = understanding.facts.find(f => f.type === 'portfolio_data');
          const portfolio = portfolioFact?.data || {};
          if (portfolio.total_invested > 0) {
            response += `**Your Portfolio:** $${(portfolio.total_invested || 0).toLocaleString()} invested\n`;
            response += `Total Return: ${((portfolio.total_return_percentage || 0) * 100).toFixed(2)}%\n\n`;
          }
        }
        
        if (hasMarket) {
          const marketFact = understanding.facts.find(f => f.type === 'market_data');
          const marketData = marketFact?.data;
          if (marketData && marketData.location) {
            response += `**Market Data:** ${marketData.location.city}, ${marketData.location.state}\n`;
            if (marketData.analysis) {
              response += `Trend: ${marketData.analysis.trendDirection || 'Unknown'}\n`;
            }
            response += `\n`;
          }
        }
        
        if (hasWallet) {
          const walletFact = understanding.facts.find(f => f.type === 'wallet_data');
          const wallet = walletFact?.data || {};
          const balance = wallet.available_balance || wallet.balance || 0;
          response += `**Wallet Balance:** $${balance.toLocaleString()}\n\n`;
        }
        
        response += `\nI found some relevant data. Could you be more specific about what you'd like to know? `;
        response += `For example:\n`;
        response += `• "What should I invest in?" - Get recommendations\n`;
        response += `• "How is the market in NYC?" - Market analysis\n`;
        response += `• "Show me my portfolio" - Portfolio overview\n`;
        
        return response;
      }

      
      response += `I understand you're asking about "${semanticAnalysis.message}". `;
      response += `I can help you with:\n\n`;
      response += `**Investment & Recommendations:**\n`;
      response += `• "What should I invest in?" - Get personalized property recommendations\n`;
      response += `• "Compare properties for me" - Side-by-side property comparison\n`;
      response += `• "What are the best investment opportunities?" - Top recommendations\n\n`;
      response += `**Market Analysis:**\n`;
      response += `• "How is the market in NYC?" - Detailed market analysis\n`;
      response += `• "Compare NYC to Miami markets" - Market comparison\n`;
      response += `• "What's the best market for beginners?" - Market recommendations\n\n`;
      response += `**Portfolio & Wallet:**\n`;
      response += `• "Show me my portfolio" - Portfolio overview\n`;
      response += `• "What's my wallet balance?" - Check available funds\n`;
      response += `• "How is my portfolio performing?" - Performance analysis\n\n`;
      response += `**Learning:**\n`;
      response += `• "How does fractional ownership work?" - Concept explanations\n`;
      response += `• "What is ROI?" - Investment term definitions\n`;
      response += `• "Explain property tokens" - Platform features\n\n`;
      response += `Try one of these questions, or ask your question more specifically!`;

      return response;
    } catch (error) {
      console.error('Error in generateDynamicResponse:', error);
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        semanticAnalysis,
        reasoningResult
      });
      return `I encountered an error while generating a response. Please try again later.`;
    }
  },

  determineQuestionType: function(message) {
    const msgLower = message.toLowerCase().trim();
    if (msgLower.startsWith('how')) return 'how';
    if (msgLower.startsWith('what')) return 'what';
    if (msgLower.startsWith('why')) return 'why';
    if (msgLower.startsWith('when')) return 'when';
    if (msgLower.startsWith('where')) return 'where';
    if (msgLower.startsWith('who')) return 'who';
    return 'general';
  }
};





const advancedSemanticEngine = {
  
  generateNGrams(text, n = 2) {
    const words = text.toLowerCase().split(/\s+/);
    const ngrams = [];
    for (let i = 0; i <= words.length - n; i++) {
      ngrams.push(words.slice(i, i + n).join(' '));
    }
    return ngrams;
  },

  
  calculatePatternScore(pattern, query, allPatterns) {
    const patternCount = allPatterns[pattern]?.count || 1;
    const totalPatterns = Object.keys(allPatterns).length;
    const patternFrequency = patternCount / totalPatterns;
    const queryContainsPattern = query.toLowerCase().includes(pattern.toLowerCase()) ? 1 : 0;
    const idf = Math.log(totalPatterns / (patternCount + 1));
    return queryContainsPattern * (1 / patternFrequency) * idf;
  },

  
  calculateEnhancedSimilarity(str1, str2) {
    const tokens1 = new Set(str1.toLowerCase().split(/\s+/));
    const tokens2 = new Set(str2.toLowerCase().split(/\s+/));
    const intersection = new Set([...tokens1].filter(x => tokens2.has(x)));
    const union = new Set([...tokens1, ...tokens2]);
    const jaccard = intersection.size / union.size;
    const ngrams1 = this.generateNGrams(str1, 2);
    const ngrams2 = this.generateNGrams(str2, 2);
    const ngramIntersection = ngrams1.filter(ng => ngrams2.includes(ng)).length;
    const ngramUnion = new Set([...ngrams1, ...ngrams2]).size;
    const ngramSimilarity = ngramUnion > 0 ? ngramIntersection / ngramUnion : 0;
    return (jaccard * 0.4) + (ngramSimilarity * 0.4) + (0.2); 
  },

  
  async analyzeQuery(query, conversationHistory = []) {
    try {
      const lowerCaseQuery = query.toLowerCase();
      
      
      const exactMatch = knowledgeBase.memory.userFeedback.find(
        fb => fb.query.toLowerCase().trim() === query.toLowerCase().trim()
      );
      if (exactMatch) {
        const successRate = knowledgeBase.memory.successRate[query.toLowerCase().trim()];
        if (successRate && successRate.total > 0 && (successRate.positive / successRate.total) > 0.8) {
          return {
            confidence: 0.95,
            response: exactMatch.response,
            context: exactMatch.userContext,
            source: 'exact_match',
            intent: this.detectIntentFromResponse(exactMatch.response)
          };
        }
      }

      
      const similarInteractions = knowledgeBase.memory.userFeedback
        .map(fb => ({
          ...fb,
          similarity: this.calculateEnhancedSimilarity(query, fb.query)
        }))
        .filter(fb => fb.similarity > 0.5)
        .sort((a, b) => b.similarity - a.similarity)
        .slice(0, 5);

      if (similarInteractions.length > 0 && similarInteractions[0].similarity > 0.75) {
        const bestMatch = similarInteractions[0];
        const successRate = knowledgeBase.memory.successRate[bestMatch.query.toLowerCase().trim()];
        if (successRate && successRate.total > 0 && (successRate.positive / successRate.total) > 0.7) {
          return {
            confidence: Math.min(0.95, 0.7 + (bestMatch.similarity * 0.25)),
            response: bestMatch.response,
            context: bestMatch.userContext,
            source: 'enhanced_pattern_match',
            intent: this.detectIntentFromResponse(bestMatch.response),
            similarity: bestMatch.similarity
          };
        }
      }

      
      const patterns = knowledgeBase.memory.learnedPatterns;
      const patternScores = {};
      for (const pattern in patterns) {
        if (lowerCaseQuery.includes(pattern)) {
          patternScores[pattern] = this.calculatePatternScore(pattern, query, patterns);
        }
      }
      const topPattern = Object.keys(patternScores).sort((a, b) => patternScores[b] - patternScores[a])[0];
      if (topPattern && patternScores[topPattern] > 0.5 && patterns[topPattern].averageConfidence > 0.7) {
        return {
          confidence: patterns[topPattern].averageConfidence,
          response: `Based on similar queries, I can help with ${topPattern}. Let me provide the most relevant information.`,
          source: 'tfidf_pattern_match',
          intent: this.detectIntentFromPattern(topPattern)
        };
      }

      
      const recentContext = conversationHistory.slice(-5);
      const contextKeywords = recentContext
        .filter(msg => msg.role === 'user')
        .map(msg => msg.content.toLowerCase())
        .join(' ');
      const combinedContext = `${contextKeywords} ${lowerCaseQuery}`;
      const intent = this.detectIntentEnhanced(lowerCaseQuery, combinedContext);

      return {
        confidence: 0.8,
        intent: intent,
        source: 'context_aware_analysis',
        contextUsed: recentContext.length > 0
      };
    } catch (error) {
      console.error('Error in advanced semantic analysis:', error);
      return {
        confidence: 0.3,
        source: 'error',
        intent: 'general_inquiry'
      };
    }
  },

  detectIntentEnhanced(query, context = '') {
    const combined = `${query} ${context}`.toLowerCase();
    
    if (/\b(what is|explain|tell me about|how does|what are|define|how do|how can|can you explain|what does|how work|how works)\b/.test(combined)) {
      return 'explanation';
    }
    if (/\b(wallet|balance|funds|deposit|withdraw|add money|money)\b/.test(combined)) return 'wallet_inquiry';
    if (/\b(recommend|suggest|should i|what should i invest|what should i|what to invest|best investment|investment advice|what to buy)\b/.test(combined)) return 'investment_advice';
    if (/\b(property|properties|available|browse|find|search|marketplace|buy property|invest in)\b/.test(combined)) return 'property_search';
    if (/\b(help|how do i|how to|getting started|new user|beginner|guide|tutorial)\b/.test(combined)) return 'new_user_help';
    if (/\b(performance|return|roi|earnings|profit|gain|loss)\b/.test(combined)) return 'portfolio_performance';
    if (/\b(market|trend|prices|market analysis|market condition|market data)\b/.test(combined)) return 'market_analysis';
    if (/\b(portfolio|my investment|i have|i own|my properties|my portfolio)\b/.test(combined)) return 'portfolio_inquiry';
    if (/\b(compare|vs|versus|difference|better|best)\b/.test(combined)) return 'comparison';
    return 'general_inquiry';
  },

  detectIntentFromResponse(response) {
    const lower = response.toLowerCase();
    if (lower.includes('portfolio') || lower.includes('investment')) return 'portfolio_inquiry';
    if (lower.includes('property')) return 'property_search';
    if (lower.includes('market')) return 'market_analysis';
    if (lower.includes('wallet') || lower.includes('balance')) return 'wallet_inquiry';
    return 'general_inquiry';
  },

  detectIntentFromPattern(pattern) {
    if (pattern.includes('market')) return 'market_analysis';
    if (pattern.includes('property')) return 'property_search';
    if (pattern.includes('investment') || pattern.includes('portfolio')) return 'portfolio_inquiry';
    if (pattern.includes('wallet')) return 'wallet_inquiry';
    return 'general_inquiry';
  },

  extractTopics(query, response) {
    const topics = [];
    const combined = `${query} ${response}`.toLowerCase();
    const topicKeywords = {
      'market': ['market', 'trend', 'price', 'valuation', 'demand', 'supply'],
      'property': ['property', 'real estate', 'home', 'apartment', 'building'],
      'investment': ['investment', 'invest', 'roi', 'return', 'yield', 'dividend'],
      'portfolio': ['portfolio', 'diversification', 'allocation', 'holdings'],
      'wallet': ['wallet', 'balance', 'fund', 'deposit', 'withdraw'],
      'risk': ['risk', 'safe', 'volatile', 'stability', 'security']
    };
    for (const [topic, keywords] of Object.entries(topicKeywords)) {
      if (keywords.some(keyword => combined.includes(keyword))) {
        topics.push(topic);
      }
    }
    return topics;
  }
};





const advancedReasoningEngine = {
  async chainOfThoughtReasoning(semanticAnalysis, userAccountData, conversationHistory = []) {
    try {
      const reasoningSteps = [];
      const understanding = {
        question: semanticAnalysis.message,
        facts: [],
        inferences: [],
        conclusions: [],
        dataSources: [],
        confidence: 0.7
      };

      const userId = getCurrentUserId();
      const sessionId = userId || 'anonymous';
      
      reasoningSteps.push({ step: 1, action: 'context_retrieval', result: 'Analyzing conversation context...' });
      const conversationContext = knowledgeBase.getConversationContext(sessionId);
      
      
      if (semanticAnalysis.reasoningSteps && semanticAnalysis.reasoningSteps.length > 0) {
        reasoningSteps.push({
          step: 0,
          action: 'multi_step_reasoning_review',
          result: `Reviewed ${semanticAnalysis.reasoningSteps.length} reasoning steps from intent detection`,
          details: semanticAnalysis.reasoningSteps.slice(-3) 
        });
      }

      
      if (semanticAnalysis.coreIntent === 'explanation') {
        const msgLower = semanticAnalysis.message.toLowerCase();
        
        
        for (const [key, knowledge] of Object.entries(explanationKnowledge)) {
          if (msgLower.includes(key)) {
            understanding.facts.push({
              type: 'explanation_data',
              source: 'knowledge_base',
              data: knowledge,
              confidence: knowledge.confidence || 0.95,
              timestamp: Date.now()
            });
            understanding.dataSources.push('Knowledge Base');
            break; 
          }
        }
        
        
        if (!understanding.facts.find(f => f.type === 'explanation_data')) {
          understanding.facts.push({
            type: 'explanation_intent',
            source: 'intent_classification',
            data: { intent: 'explanation', query: semanticAnalysis.message },
            confidence: 0.8,
            timestamp: Date.now()
          });
          understanding.dataSources.push('Intent Classification');
        }
        
        reasoningSteps.push({
          step: 2,
          action: 'explanation_knowledge_retrieval',
          result: `Retrieved explanation data from knowledge base`
        });
        
        
        if (understanding.facts.find(f => f.type === 'explanation_data')) {
          understanding.confidence = 0.95;
        } else {
          understanding.confidence = 0.75; 
        }
        
        
        return {
          reasoningSteps,
          understanding,
          confidence: understanding.confidence,
          conversationContext
        };
      }
      
      reasoningSteps.push({ step: 2, action: 'parallel_data_fetching', result: 'Fetching data from multiple sources in parallel...' });
      
      
      const location = extractLocation(semanticAnalysis.message);
      const normalizedLocation = location ? normalizeLocationForAPI(location) : null;
      
      if (location) {
        reasoningSteps.push({
          step: 2.1,
          action: 'location_extraction',
          result: `Extracted location: ${location} → ${normalizedLocation || location}`
        });
      }

      
      const msgLowerReasoning = semanticAnalysis.message.toLowerCase();
      const isBestMarketQuery = (msgLowerReasoning.includes('best market') || msgLowerReasoning.includes('which market')) && 
                                (msgLowerReasoning.includes('beginner') || msgLowerReasoning.includes('new') || msgLowerReasoning.includes('start') || msgLowerReasoning.includes('best'));
      
      if (semanticAnalysis.coreIntent === 'investment_advice' || semanticAnalysis.coreIntent === 'recommendation' || semanticAnalysis.coreIntent === 'comparison') {
        reasoningSteps.push({
          step: 2.2,
          action: 'data_needs_analysis',
          result: `Investment/comparison query requires: properties, portfolio, investments, wallet, market data`
        });
      } else if (semanticAnalysis.coreIntent === 'market_analysis' || isBestMarketQuery) {
        if (isBestMarketQuery) {
          reasoningSteps.push({
            step: 2.2,
            action: 'data_needs_analysis',
            result: `Best market query requires: market data for multiple major markets (NYC, Miami, LA, Chicago, Atlanta)`
          });
        } else {
          reasoningSteps.push({
            step: 2.2,
            action: 'data_needs_analysis',
            result: `Market analysis query requires: market data for ${normalizedLocation || 'selected location'}`
          });
        }
      }
      
      
      const allData = await advancedDataRetrieval.fetchAllRelevantData(
        semanticAnalysis.coreIntent,
        {
          userId,
          location: normalizedLocation,
          filters: semanticAnalysis.context?.filters || {}
        }
      );
      
      
      if (allData.properties && allData.properties.length > 0) {
        understanding.facts.push({
          type: 'platform_properties',
          source: 'platform_api',
          data: allData.properties,
          confidence: 0.95,
          timestamp: Date.now()
        });
        understanding.dataSources.push('Properties API');
      }
      if (allData.portfolio) {
        understanding.facts.push({
          type: 'portfolio_data',
          source: 'platform_api',
          data: allData.portfolio,
          confidence: 0.95,
          timestamp: Date.now()
        });
        understanding.dataSources.push('Portfolio API');
      }
      if (allData.investments && allData.investments.length > 0) {
        understanding.facts.push({
          type: 'investments_data',
          source: 'platform_api',
          data: allData.investments,
          confidence: 0.95,
          timestamp: Date.now()
        });
        understanding.dataSources.push('Investments API');
      }
      if (allData.wallet) {
        understanding.facts.push({
          type: 'wallet_data',
          source: 'platform_api',
          data: allData.wallet,
          confidence: 0.95,
          timestamp: Date.now()
        });
        understanding.dataSources.push('Wallet API');
      }
      if (allData.market) {
        understanding.facts.push({
          type: 'market_data',
          source: 'api',
          data: allData.market,
          confidence: allData.market.error ? 0.5 : 0.9,
          timestamp: Date.now()
        });
        understanding.dataSources.push('Market Data API');
      }
      if (allData.economic) {
        understanding.facts.push({
          type: 'economic_data',
          source: 'api',
          data: allData.economic,
          confidence: 0.9,
          timestamp: Date.now()
        });
        understanding.dataSources.push('Economic Data API');
      }

      reasoningSteps.push({ step: 3, action: 'user_preferences', result: 'Analyzing user preferences from past interactions...' });
      if (userId) {
        const userPreferences = knowledgeBase.getUserPreferences(userId);
        understanding.facts.push({
          type: 'user_preferences',
          source: 'learned_patterns',
          data: userPreferences,
          confidence: 0.8,
          timestamp: Date.now()
        });
      }

      reasoningSteps.push({ step: 4, action: 'multi_source_inference', result: 'Making inferences from multiple data sources...' });
      
      const marketFact = understanding.facts.find(f => f.type === 'market_data');
      if (marketFact && marketFact.data && marketFact.data.analysis) {
        const analysis = marketFact.data.analysis;
        understanding.inferences.push({
          type: 'market_trend',
          conclusion: `Market shows ${analysis.trendDirection || 'stable'} trend with ${analysis.marketHealth || 50}/100 health score`,
          confidence: 0.85,
          sources: ['Market Data API']
        });
      }
      
      const portfolioFact = understanding.facts.find(f => f.type === 'portfolio_data');
      if (portfolioFact && portfolioFact.data) {
        const portfolio = portfolioFact.data;
        const returnPercentage = portfolio.totalReturnPercentage || 0;
        if (returnPercentage > 0) {
          understanding.inferences.push({
            type: 'portfolio_performance',
            conclusion: `Portfolio performing well with ${returnPercentage.toFixed(2)}% return`,
            confidence: 0.9,
            sources: ['Portfolio API']
          });
        }
      }

      if ((semanticAnalysis.coreIntent === 'investment_advice' || semanticAnalysis.coreIntent === 'recommendation') && userId) {
        reasoningSteps.push({ step: 5, action: 'recommendation_generation', result: 'Generating personalized recommendations...' });
        try {
          const userPreferences = knowledgeBase.getUserPreferences(userId);
          
          
          if (allData.properties && allData.properties.length > 0) {
            const recommendations = await advancedDataRetrieval.generateInvestmentRecommendations(userId, userPreferences);
            if (recommendations && recommendations.length > 0) {
              understanding.facts.push({
                type: 'investment_recommendations',
                source: 'recommendation_engine',
                data: recommendations,
                confidence: 0.95, 
                timestamp: Date.now()
              });
              understanding.dataSources.push('Investment Recommendations Engine');
            } else {
              
              
              const portfolio = allData.portfolio;
              const wallet = allData.wallet;
              const availableBalance = wallet?.available_balance || 0;
              const userInvestments = allData.investments || [];
              
              
              const fallbackRecommendations = allData.properties
                .filter(prop => {
                  
                  const alreadyOwns = userInvestments.some(inv => inv.property_id === prop.id);
                  if (alreadyOwns) return false;
                  
                  
                  const minInvestment = (prop.token_price || 50) * 1;
                  if (availableBalance > 0 && minInvestment > availableBalance * 2) return false;
                  
                  return true;
                })
                .sort((a, b) => (b.annual_roi || 0) - (a.annual_roi || 0))
                .slice(0, 5)
                .map(property => ({
                  property,
                  score: (property.annual_roi || 0) * 10 + (property.risk_level === 'low' ? 20 : 0),
                  reasons: []
                }));
              
              if (fallbackRecommendations.length > 0) {
                understanding.facts.push({
                  type: 'investment_recommendations',
                  source: 'platform_properties_fallback',
                  data: fallbackRecommendations,
                  confidence: 0.85, 
                  timestamp: Date.now()
                });
                understanding.dataSources.push('Platform Properties (Fallback Recommendations)');
              }
            }
          }
          
          
          const advice = advancedDataRetrieval.analyzePortfolioForAdvice(userId, allData.portfolio, allData.investments || [], allData.wallet);
          if (advice && advice.length > 0) {
            understanding.facts.push({
              type: 'portfolio_advice',
              source: 'portfolio_analysis',
              data: advice,
              confidence: 0.85,
              timestamp: Date.now()
            });
            understanding.dataSources.push('Portfolio Analysis Engine');
          }
        } catch (error) {
          console.error('Error generating recommendations:', error);
        }
      }

      
      const factCount = understanding.facts.length;
      const inferenceCount = understanding.inferences.length;
      const dataSourceCount = understanding.dataSources.length;
      
      
      let baseConfidence = 0.6;
      
      
      if (factCount > 0) {
        baseConfidence += Math.min(0.25, factCount * 0.05); 
      }
      
      if (inferenceCount > 0) {
        baseConfidence += Math.min(0.10, inferenceCount * 0.03); 
      }
      
      if (dataSourceCount > 0) {
        baseConfidence += Math.min(0.08, dataSourceCount * 0.02); 
      }
      
      
      if (conversationContext.length > 0) {
        baseConfidence += 0.05; 
      }
      
      
      if ((semanticAnalysis.coreIntent === 'investment_advice' || semanticAnalysis.coreIntent === 'recommendation') && 
          understanding.facts.find(f => f.type === 'investment_recommendations')) {
        baseConfidence += 0.10; 
      }
      
      
      understanding.confidence = Math.min(0.98, baseConfidence);

      reasoningSteps.push({
        step: 6,
        action: 'confidence_calculation',
        result: `Calculated confidence: ${(understanding.confidence * 100).toFixed(1)}% from ${factCount} facts, ${inferenceCount} inferences, ${dataSourceCount} data sources`
      });

      return {
        reasoningSteps,
        understanding,
        confidence: understanding.confidence,
        conversationContext
      };
    } catch (error) {
      console.error('Error in advanced chainOfThoughtReasoning:', error);
      return {
        reasoningSteps: [{ step: 1, action: 'error', result: 'Error during reasoning' }],
        understanding: {
          question: semanticAnalysis.message,
          facts: [],
          inferences: [],
          conclusions: [],
          dataSources: [],
          confidence: 0.5
        },
        confidence: 0.5
      };
    }
  }
};
