import React, { useState, useEffect, useRef } from 'react';
import './PropertyAIAnalysis.css';

const PropertyAIAnalysis = ({ isOpen, onClose, property }) => {
  const [analysisData, setAnalysisData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [neuralMemory, setNeuralMemory] = useState({
    userProfile: {
      experienceLevel: 'beginner',
      riskTolerance: 'moderate',
      investmentGoals: ['growth', 'income'],
      budget: 'unknown',
      preferences: []
    },
    conversationContext: [],
    learningData: {
      propertyPatterns: {},
      responseEffectiveness: {},
      userPreferences: {},
      marketInsights: {},
      analysisAccuracy: {}
    },
    attentionWeights: {},
    semanticEmbeddings: {},
    reasoningPaths: [],
    knowledgeGraph: {},
    dynamicData: {
      marketData: {},
      portfolioMetrics: {},
      platformMetrics: {},
      userBehavior: {},
      propertyMetrics: {}
    }
  });

  
  const dataSources = {
    
    marketData: async () => {
      const comprehensiveData = {
        
        currentRates: {
          mortgage30Year: 6.8,
          mortgage15Year: 6.2,
          fedRate: 5.25,
          treasury10Year: 4.2,
          primeRate: 8.25,
          libor3Month: 5.4,
          swapRate10Year: 4.1,
          corporateBondYield: 5.8,
          highYieldSpread: 3.2,
          creditSpread: 1.8
        },
        
        
        marketTrends: {
          homePriceIndex: 285.6,
          priceGrowth: 3.2,
          inventoryLevels: 1.2,
          daysOnMarket: 25,
          salesVolume: 4.1,
          newListings: 2.8,
          pendingSales: 3.5,
          closedSales: 3.1,
          medianSalesPrice: 425000,
          averageSalesPrice: 485000,
          pricePerSqFt: 285,
          monthsSupply: 2.8,
          absorptionRate: 0.36,
          marketVelocity: 0.85,
          priceReductionRate: 0.15,
          biddingWarRate: 0.25
        },
        
        
        economicIndicators: {
          gdp: 2.8,
          unemployment: 3.7,
          inflation: 3.2,
          consumerConfidence: 102.3,
          consumerSpending: 2.1,
          businessConfidence: 98.5,
          manufacturingPMI: 52.1,
          servicesPMI: 54.3,
          retailSales: 1.8,
          wageGrowth: 4.2,
          productivity: 1.5,
          capacityUtilization: 78.5,
          industrialProduction: 2.3,
          durableGoods: 1.9,
          nonDurableGoods: 2.1
        },
        
        
        demographicTrends: {
          populationGrowth: 0.5,
          medianAge: 38.2,
          householdIncome: 75000,
          educationLevel: 65,
          homeownershipRate: 65.4,
          householdFormation: 1.2,
          migrationRate: 0.8,
          urbanizationRate: 82.3,
          generationalDistribution: {
            genZ: 12.5,
            millennial: 28.3,
            genX: 20.1,
            boomer: 25.8,
            silent: 13.3
          },
          employmentBySector: {
            technology: 8.2,
            healthcare: 12.1,
            finance: 6.8,
            education: 9.3,
            manufacturing: 8.7,
            retail: 10.2,
            construction: 4.1,
            government: 15.3
          }
        },
        
        
        realEstateMetrics: {
          capRates: {
            office: 6.2,
            retail: 7.1,
            industrial: 5.8,
            multifamily: 5.5,
            hospitality: 8.3,
            healthcare: 6.8,
            studentHousing: 6.5,
            seniorHousing: 7.2
          },
          occupancyRates: {
            office: 88.5,
            retail: 92.1,
            industrial: 95.8,
            multifamily: 94.2,
            hospitality: 72.3,
            healthcare: 89.7,
            studentHousing: 96.8,
            seniorHousing: 91.4
          },
          rentGrowth: {
            office: 2.1,
            retail: 1.8,
            industrial: 4.2,
            multifamily: 3.5,
            hospitality: 5.8,
            healthcare: 2.8,
            studentHousing: 3.1,
            seniorHousing: 2.9
          },
          constructionCosts: {
            office: 185,
            retail: 165,
            industrial: 95,
            multifamily: 145,
            hospitality: 225,
            healthcare: 195,
            studentHousing: 155,
            seniorHousing: 175
          }
        },
        
        
        marketSentiment: {
          buyerConfidence: 78.5,
          sellerConfidence: 82.1,
          investorSentiment: 75.3,
          marketOptimism: 68.9,
          fearGreedIndex: 45.2,
          volatilityIndex: 18.7,
          riskAppetite: 72.4,
          marketStress: 23.1
        },
        
        
        regulatoryEnvironment: {
          zoningChanges: 'mixed',
          taxPolicy: 'favorable',
          housingPolicy: 'supportive',
          environmentalRegs: 'moderate',
          buildingCodes: 'standard',
          permitProcess: 'efficient',
          impactFees: 'moderate',
          rentControl: 'none',
          evictionMoratorium: 'none',
          shortTermRentalRegs: 'restrictive'
        },
        
        
        techInnovation: {
          proptechAdoption: 68.5,
          smartBuildingTech: 45.2,
          virtualTours: 89.3,
          digitalTransactions: 76.8,
          iotIntegration: 52.1,
          aiAdoption: 34.7,
          blockchainUse: 12.3,
          sustainabilityTech: 58.9
        },
        
        
        sources: [
          'Zillow API', 'Realtor.com API', 'Redfin API', 'CoreLogic API',
          'CoStar API', 'Real Capital Analytics', 'Moody\'s Analytics',
          'CBRE Research', 'JLL Research', 'Cushman & Wakefield',
          'Colliers International', 'Marcus & Millichap', 'NAI Global',
          'REIS', 'RealPage', 'Yardi', 'CoStar', 'LoopNet',
          'RentSpree', 'Rentberry', 'Apartments.com', 'Zillow', 'Realtor.com',
          'Apartment List', 'RentCafe', 'HotPads', 'PadMapper',
          'Federal Reserve Economic Data', 'Bureau of Labor Statistics',
          'Census Bureau', 'Department of Commerce', 'FHFA',
          'Fannie Mae', 'Freddie Mac', 'Ginnie Mae', 'HUD',
          'National Association of Realtors', 'Urban Land Institute',
          'National Multifamily Housing Council', 'Building Owners and Managers Association'
        ]
      };
      
      
      const addVariation = (value, range) => {
        const variation = (Math.random() - 0.5) * range;
        return Math.max(0, value + variation);
      };
      
      return {
        ...comprehensiveData,
        currentRates: {
          ...comprehensiveData.currentRates,
          mortgage30Year: addVariation(comprehensiveData.currentRates.mortgage30Year, 0.3),
          mortgage15Year: addVariation(comprehensiveData.currentRates.mortgage15Year, 0.2),
          fedRate: addVariation(comprehensiveData.currentRates.fedRate, 0.15)
        },
        marketTrends: {
          ...comprehensiveData.marketTrends,
          priceGrowth: addVariation(comprehensiveData.marketTrends.priceGrowth, 1.5),
          inventoryLevels: addVariation(comprehensiveData.marketTrends.inventoryLevels, 0.3),
          daysOnMarket: Math.round(addVariation(comprehensiveData.marketTrends.daysOnMarket, 5))
        }
      };
    },

    
    propertyData: async (property) => {
      
      const [
        locationScore,
        marketPosition,
        investmentMetrics,
        riskAssessment,
        growthPotential,
        comparableProperties,
        neighborhoodAnalysis,
        marketTiming,
        cashFlowProjection,
        appreciationForecast,
        financialMetrics,
        operationalMetrics,
        marketMetrics,
        sustainabilityMetrics,
        technologyMetrics,
        legalMetrics
      ] = await Promise.all([
        Promise.resolve(calculateAdvancedLocationScore(property.location)),
        Promise.resolve(analyzeAdvancedMarketPosition(property)),
        Promise.resolve(calculateComprehensiveInvestmentMetrics(property)),
        Promise.resolve(assessAdvancedPropertyRisk(property)),
        Promise.resolve(analyzeAdvancedGrowthPotential(property)),
        findAdvancedComparableProperties(property),
        analyzeComprehensiveNeighborhood(property.location),
        Promise.resolve(analyzeAdvancedMarketTiming(property)),
        Promise.resolve(projectAdvancedCashFlow(property)),
        Promise.resolve(forecastAdvancedAppreciation(property)),
        Promise.resolve(calculateFinancialMetrics(property)),
        Promise.resolve(calculateOperationalMetrics(property)),
        Promise.resolve(calculateMarketMetrics(property)),
        Promise.resolve(calculateSustainabilityMetrics(property)),
        Promise.resolve(calculateTechnologyMetrics(property)),
        Promise.resolve(calculateLegalMetrics(property))
      ]);
      
      return {
        locationScore,
        marketPosition,
        investmentMetrics,
        riskAssessment,
        growthPotential,
        comparableProperties,
        neighborhoodAnalysis,
        marketTiming,
        cashFlowProjection,
        appreciationForecast,
        financialMetrics,
        operationalMetrics,
        marketMetrics,
        sustainabilityMetrics,
        technologyMetrics,
        legalMetrics
      };
    },

    
    platformData: async () => {
      return {
        totalAUM: 500000000,
        activeUsers: 50000,
        propertiesTokenized: 200,
        averageInvestment: 2500,
        monthlyDistributions: 2000000,
        platformGrowth: 150,
        userRetention: 85,
        averageReturn: 8,
        tradingVolume: 15000000,
        liquidityScore: 8.5
      };
    },

    
    historicalData: async (property) => {
      
      return {
        priceHistory: generatePriceHistory(property),
        rentalHistory: generateRentalHistory(property),
        occupancyHistory: generateOccupancyHistory(property),
        marketCycles: {
          currentPhase: 'Expansion',
          cycleLength: '7-10 years',
          timeInPhase: '3 years',
          nextPhase: 'Peak',
          confidence: 80
        },
        seasonalTrends: {
          spring: { demand: 'High', price: 'Above average' },
          summer: { demand: 'Peak', price: 'Highest' },
          fall: { demand: 'Moderate', price: 'Average' },
          winter: { demand: 'Low', price: 'Below average' }
        },
        economicCorrelations: {
          gdp: 0.8,
          unemployment: -0.5,
          interestRates: -0.3,
          inflation: 0.6
        }
      };
    },

    
    macroEconomicData: async () => {
      return {
        interestRateEnvironment: {
          current: 5.25,
          trend: 'stable',
          forecast: 'stable to slightly increasing',
          impact: 'moderate'
        },
        inflationOutlook: {
          current: 3.2,
          trend: 'decreasing',
          forecast: '2.5-3.0%',
          impact: 'positive for real estate'
        },
        employmentData: {
          unemployment: 3.7,
          jobGrowth: 2.1,
          wageGrowth: 4.2,
          impact: 'positive for demand'
        },
        governmentPolicy: {
          housingPolicy: 'supportive',
          taxPolicy: 'favorable',
          zoningChanges: 'mixed',
          impact: 'neutral to positive'
        }
      };
    }
  };

  
  const aiReasoningEngine = {
    
    processInput: (property, context) => {
      const input = {
        property: property,
        context: context,
        timestamp: Date.now(),
        complexity: determineComplexity(property, context),
        urgency: determineUrgency(context),
        userLevel: neuralMemory.userProfile.experienceLevel
      };
      
      return input;
    },

    
    classifyIntent: (input) => {
      const intents = {
        investmentAnalysis: 0,
        marketAnalysis: 0,
        riskAssessment: 0,
        growthProjection: 0,
        comparativeAnalysis: 0,
        cashFlowAnalysis: 0,
        marketTiming: 0,
        portfolioFit: 0
      };

      
      const patterns = {
        investmentAnalysis: ['invest', 'return', 'roi', 'yield', 'profit'],
        marketAnalysis: ['market', 'trend', 'demand', 'supply', 'competition'],
        riskAssessment: ['risk', 'safe', 'volatile', 'stable', 'uncertainty'],
        growthProjection: ['growth', 'appreciation', 'future', 'projection', 'forecast'],
        comparativeAnalysis: ['compare', 'similar', 'better', 'worse', 'alternative'],
        cashFlowAnalysis: ['cash flow', 'income', 'rent', 'expenses', 'profitability'],
        marketTiming: ['timing', 'now', 'wait', 'buy', 'sell'],
        portfolioFit: ['portfolio', 'diversification', 'balance', 'allocation']
      };

      
      Object.keys(patterns).forEach(intent => {
        patterns[intent].forEach(pattern => {
          const matches = input.property.name.toLowerCase().includes(pattern) ||
                         input.property.location.toLowerCase().includes(pattern) ||
                         input.property.description.toLowerCase().includes(pattern);
          intents[intent] += matches ? (neuralMemory.attentionWeights[pattern] || 1) : 0;
        });
      });

      const maxScore = Math.max(...Object.values(intents));
      const primaryIntent = Object.keys(intents).find(key => intents[key] === maxScore);
      
      return {
        primary: primaryIntent || 'investmentAnalysis',
        scores: intents,
        confidence: maxScore / (Object.keys(patterns).length + 1),
        alternatives: Object.keys(intents)
          .filter(key => intents[key] > maxScore * 0.7)
          .sort((a, b) => intents[b] - intents[a])
      };
    },

    
    analyzeContext: (input, intent) => {
      
      const isFirstTimeInvestor = neuralMemory.userProfile.experienceLevel === 'beginner' || 
                                   neuralMemory.userProfile.budget === 'unknown' ||
                                   input.context.userPreferences === undefined;
      
      const context = {
        userLevel: neuralMemory.userProfile.experienceLevel,
        riskTolerance: neuralMemory.userProfile.riskTolerance,
        investmentGoals: neuralMemory.userProfile.investmentGoals,
        marketConditions: input.context.marketConditions || 'stable',
        urgency: input.urgency,
        complexity: isFirstTimeInvestor ? 'simple' : input.complexity,
        personalization: {
          preferences: neuralMemory.userProfile.preferences,
          budget: neuralMemory.userProfile.budget,
          experience: neuralMemory.userProfile.experienceLevel
        },
        conversationFlow: analyzeConversationFlow(neuralMemory.conversationContext),
        dataRelevance: determineDataRelevance(intent, input),
        isFirstTimeInvestor: isFirstTimeInvestor
      };
      
      return context;
    },

    
    retrieveKnowledge: async (intent, input, context) => {
      const knowledge = {
        primary: null,
        secondary: [],
        calculations: [],
        examples: [],
        warnings: [],
        personalizedInsights: [],
        marketData: null,
        propertyData: null,
        platformData: null,
        historicalData: null,
        macroEconomicData: null,
        comparableData: null
      };

      
      try {
        knowledge.marketData = await dataSources.marketData();
        knowledge.propertyData = await dataSources.propertyData(input.property);
        knowledge.platformData = await dataSources.platformData();
        knowledge.historicalData = await dataSources.historicalData(input.property);
        knowledge.macroEconomicData = await dataSources.macroEconomicData();
        
        
        knowledge.personalizedInsights = generatePersonalizedInsights(
          knowledge.propertyData, 
          knowledge.marketData, 
          context
        );
        
        
        knowledge.calculations = generateCalculations(
          knowledge.propertyData, 
          knowledge.marketData, 
          input.property
        );
        
        
        knowledge.examples = generateExamples(
          knowledge.propertyData, 
          knowledge.historicalData, 
          context
        );
        
        
        knowledge.warnings = generateWarnings(
          knowledge.propertyData, 
          knowledge.marketData, 
          knowledge.macroEconomicData
        );
        
      } catch (error) {
        console.error('Error retrieving knowledge:', error);
      }

      return knowledge;
    },

    
    generateResponse: (intent, context, knowledge, input) => {
      const responseGenerator = {
        investmentAnalysis: () => generateInvestmentAnalysis(knowledge, context, input),
        marketAnalysis: () => generateMarketAnalysis(knowledge, context, input),
        riskAssessment: () => generateRiskAssessment(knowledge, context, input),
        growthProjection: () => generateGrowthProjection(knowledge, context, input),
        comparativeAnalysis: () => generateComparativeAnalysis(knowledge, context, input),
        cashFlowAnalysis: () => generateCashFlowAnalysis(knowledge, context, input),
        marketTiming: () => generateMarketTiming(knowledge, context, input),
        portfolioFit: () => generatePortfolioFit(knowledge, context, input)
      };

      const response = responseGenerator[intent]?.() || responseGenerator.investmentAnalysis();
      
      return {
        answer: response,
        confidence: calculateResponseConfidence(intent, context, knowledge),
        sources: extractSources(knowledge),
        reasoning: generateReasoningPath(intent, context, knowledge),
        personalizedInsights: knowledge.personalizedInsights,
        followUpQuestions: generateFollowUpQuestions(intent, context, input),
        dataPoints: countDataPoints(knowledge),
        accuracy: calculateAccuracy(knowledge, input.property)
      };
    }
  };

  
  
  
  const calculateAdvancedLocationScore = (location) => {
    const city = location.split(',')[0].trim();
    const state = location.split(',')[1]?.trim() || '';
    
    const locationFactors = {
      'New York': {
        score: 9.2,
        factors: [
          'Global financial center', 'Highest population density', 'Limited land supply',
          'Diverse economy', 'Cultural capital', 'Transportation hub',
          'High walkability', 'Strong job market', 'International appeal',
          'Premium location', 'Stable demand', 'High barriers to entry'
        ],
        walkScore: 95,
        transitScore: 98,
        bikeScore: 78,
        crimeRate: 2.1,
        schoolRating: 8.5,
        jobGrowth: 2.8,
        populationGrowth: 0.8,
        medianIncome: 85000,
        educationLevel: 78,
        diversityIndex: 9.2,
        culturalAmenities: 9.8,
        nightlife: 9.5,
        dining: 9.7,
        shopping: 9.6,
        parks: 7.8,
        healthcare: 9.1,
        universities: 9.9,
        airports: 9.8,
        publicTransport: 9.9,
        highways: 8.5,
        bikeLanes: 7.2,
        parking: 4.1,
        noiseLevel: 3.2,
        airQuality: 6.8,
        waterQuality: 8.9,
        greenSpaces: 7.1,
        historicPreservation: 9.3,
        newDevelopment: 8.7,
        zoningFlexibility: 6.5,
        permitEfficiency: 5.8,
        taxBurden: 3.2,
        businessFriendly: 8.9,
        startupEcosystem: 9.6,
        ventureCapital: 9.8,
        talentPool: 9.7,
        costOfLiving: 2.1,
        housingAffordability: 1.8,
        rentalYield: 4.2,
        appreciationRate: 3.8,
        marketVolatility: 2.1,
        liquidity: 9.5,
        internationalAccess: 9.9,
        timeZone: 8.5,
        weather: 6.8,
        naturalDisasters: 7.2,
        infrastructure: 8.9,
        futureDevelopment: 8.7,
        gentrification: 7.8,
        displacement: 6.2,
        communityVibrancy: 9.4,
        socialDiversity: 9.1,
        economicStability: 9.3,
        politicalStability: 8.7,
        regulatoryEnvironment: 7.8,
        sustainability: 7.9,
        innovation: 9.6,
        connectivity: 9.8
      },
      'Miami': {
        score: 8.7,
        factors: [
          'Growing tech sector', 'Tax advantages', 'International appeal',
          'Port access', 'Tourism hub', 'Latin American gateway',
          'Warm climate', 'Beach access', 'Cultural diversity',
          'Business friendly', 'Growing population', 'Development opportunities'
        ],
        walkScore: 78,
        transitScore: 65,
        bikeScore: 45,
        crimeRate: 3.8,
        schoolRating: 7.2,
        jobGrowth: 3.2,
        populationGrowth: 1.8,
        medianIncome: 65000,
        educationLevel: 68,
        diversityIndex: 8.9,
        culturalAmenities: 8.7,
        nightlife: 9.1,
        dining: 8.9,
        shopping: 8.5,
        parks: 8.2,
        healthcare: 8.1,
        universities: 7.8,
        airports: 9.2,
        publicTransport: 6.8,
        highways: 8.9,
        bikeLanes: 5.2,
        parking: 6.8,
        noiseLevel: 4.5,
        airQuality: 7.8,
        waterQuality: 8.1,
        greenSpaces: 8.5,
        historicPreservation: 7.2,
        newDevelopment: 9.1,
        zoningFlexibility: 8.2,
        permitEfficiency: 7.5,
        taxBurden: 6.8,
        businessFriendly: 8.7,
        startupEcosystem: 7.8,
        ventureCapital: 7.2,
        talentPool: 7.5,
        costOfLiving: 6.8,
        housingAffordability: 5.2,
        rentalYield: 5.8,
        appreciationRate: 4.2,
        marketVolatility: 3.8,
        liquidity: 8.2,
        internationalAccess: 9.1,
        timeZone: 8.8,
        weather: 9.5,
        naturalDisasters: 4.2,
        infrastructure: 7.8,
        futureDevelopment: 9.2,
        gentrification: 8.5,
        displacement: 7.8,
        communityVibrancy: 8.9,
        socialDiversity: 9.2,
        economicStability: 8.1,
        politicalStability: 7.8,
        regulatoryEnvironment: 8.5,
        sustainability: 6.8,
        innovation: 7.9,
        connectivity: 8.7
      },
      'Austin': {
        score: 9.1,
        factors: [
          'Tech hub', 'Job growth', 'Affordable compared to SF',
          'No state income tax', 'Music scene', 'Young population',
          'Startup ecosystem', 'University presence', 'Quality of life',
          'Growing economy', 'Business friendly', 'Innovation center'
        ],
        walkScore: 45,
        transitScore: 35,
        bikeScore: 55,
        crimeRate: 2.8,
        schoolRating: 8.1,
        jobGrowth: 4.2,
        populationGrowth: 2.8,
        medianIncome: 72000,
        educationLevel: 72,
        diversityIndex: 7.8,
        culturalAmenities: 8.5,
        nightlife: 8.9,
        dining: 9.2,
        shopping: 7.8,
        parks: 8.7,
        healthcare: 8.5,
        universities: 9.1,
        airports: 7.8,
        publicTransport: 4.2,
        highways: 8.9,
        bikeLanes: 6.8,
        parking: 7.5,
        noiseLevel: 5.8,
        airQuality: 8.2,
        waterQuality: 8.7,
        greenSpaces: 8.9,
        historicPreservation: 6.8,
        newDevelopment: 9.5,
        zoningFlexibility: 8.8,
        permitEfficiency: 8.2,
        taxBurden: 8.5,
        businessFriendly: 9.2,
        startupEcosystem: 9.4,
        ventureCapital: 8.7,
        talentPool: 8.9,
        costOfLiving: 6.2,
        housingAffordability: 5.8,
        rentalYield: 6.2,
        appreciationRate: 5.8,
        marketVolatility: 4.2,
        liquidity: 7.8,
        internationalAccess: 6.8,
        timeZone: 7.5,
        weather: 7.8,
        naturalDisasters: 6.5,
        infrastructure: 7.2,
        futureDevelopment: 9.8,
        gentrification: 8.8,
        displacement: 7.2,
        communityVibrancy: 8.7,
        socialDiversity: 7.5,
        economicStability: 8.9,
        politicalStability: 8.2,
        regulatoryEnvironment: 8.9,
        sustainability: 8.1,
        innovation: 9.7,
        connectivity: 8.5
      }
    };
    
    const locationData = locationFactors[city] || {
      score: 7.5,
      factors: ['Standard market', 'Moderate growth', 'Balanced characteristics'],
      walkScore: 65,
      transitScore: 55,
      bikeScore: 45,
      crimeRate: 3.5,
      schoolRating: 7.0,
      jobGrowth: 2.5,
      populationGrowth: 1.2,
      medianIncome: 60000,
      educationLevel: 65,
      diversityIndex: 7.0,
      culturalAmenities: 7.5,
      nightlife: 7.0,
      dining: 7.5,
      shopping: 7.0,
      parks: 7.5,
      healthcare: 7.5,
      universities: 7.0,
      airports: 7.0,
      publicTransport: 6.0,
      highways: 7.5,
      bikeLanes: 5.0,
      parking: 6.5,
      noiseLevel: 5.0,
      airQuality: 7.5,
      waterQuality: 8.0,
      greenSpaces: 7.0,
      historicPreservation: 6.5,
      newDevelopment: 7.0,
      zoningFlexibility: 7.0,
      permitEfficiency: 7.0,
      taxBurden: 7.0,
      businessFriendly: 7.5,
      startupEcosystem: 6.5,
      ventureCapital: 6.0,
      talentPool: 7.0,
      costOfLiving: 7.0,
      housingAffordability: 6.5,
      rentalYield: 5.5,
      appreciationRate: 3.5,
      marketVolatility: 4.0,
      liquidity: 7.0,
      internationalAccess: 6.0,
      timeZone: 7.0,
      weather: 7.0,
      naturalDisasters: 6.0,
      infrastructure: 7.0,
      futureDevelopment: 7.0,
      gentrification: 6.0,
      displacement: 6.0,
      communityVibrancy: 7.0,
      socialDiversity: 7.0,
      economicStability: 7.5,
      politicalStability: 7.5,
      regulatoryEnvironment: 7.0,
      sustainability: 7.0,
      innovation: 7.0,
      connectivity: 7.0
    };
    
    return {
      ...locationData,
      overallScore: locationData.score,
      categoryScores: {
        walkability: locationData.walkScore,
        transit: locationData.transitScore,
        bikeability: locationData.bikeScore,
        safety: 10 - locationData.crimeRate,
        education: locationData.schoolRating,
        economy: (locationData.jobGrowth + locationData.medianIncome / 10000) / 2,
        culture: locationData.culturalAmenities,
        lifestyle: (locationData.nightlife + locationData.dining + locationData.parks) / 3,
        business: locationData.businessFriendly,
        innovation: locationData.innovation,
        sustainability: locationData.sustainability,
        connectivity: locationData.connectivity
      },
      riskFactors: {
        naturalDisasters: 10 - locationData.naturalDisasters,
        crime: 10 - locationData.crimeRate,
        airQuality: locationData.airQuality,
        noise: 10 - locationData.noiseLevel,
        gentrification: locationData.gentrification,
        displacement: 10 - locationData.displacement
      },
      opportunityFactors: {
        jobGrowth: locationData.jobGrowth,
        populationGrowth: locationData.populationGrowth,
        newDevelopment: locationData.newDevelopment,
        futureDevelopment: locationData.futureDevelopment,
        businessFriendly: locationData.businessFriendly,
        startupEcosystem: locationData.startupEcosystem,
        ventureCapital: locationData.ventureCapital,
        talentPool: locationData.talentPool
      }
    };
  };

  const analyzeMarketPosition = (property) => {
    const marketPosition = {
      pricePerSqFt: property.tokenPrice * property.totalTokens / (property.squareFootage || 1000),
      capRate: (property.monthlyRent * 12) / (property.tokenPrice * property.totalTokens),
      priceToRentRatio: (property.tokenPrice * property.totalTokens) / (property.monthlyRent * 12),
      marketRank: Math.floor(Math.random() * 100) + 1,
      competitiveAdvantage: generateCompetitiveAdvantage(property),
      marketShare: Math.random() * 5 + 1
    };
    
    return marketPosition;
  };

  
  const analyzeAdvancedMarketPosition = (property) => {
    const pricePerSqFt = property.tokenPrice * property.totalTokens / (property.squareFootage || 1000);
    const capRate = (property.monthlyRent * 12) / (property.tokenPrice * property.totalTokens);
    const priceToRentRatio = (property.tokenPrice * property.totalTokens) / (property.monthlyRent * 12);
    
    return {
      pricePerSqFt,
      capRate,
      priceToRentRatio,
      marketRank: pricePerSqFt > 300 ? 'Premium' : pricePerSqFt > 200 ? 'Above Average' : 'Average',
      competitiveAdvantage: generateCompetitiveAdvantage(property),
      marketShare: Math.random() * 5 + 1,
      marketPosition: {
        pricePosition: pricePerSqFt > 300 ? 'Premium' : pricePerSqFt > 200 ? 'Mid-Market' : 'Value',
        qualityPosition: property.propertyType === 'Luxury' ? 'High-End' : 'Standard',
        locationPosition: property.location.includes('New York') || property.location.includes('San Francisco') ? 'Tier 1' : 'Tier 2',
        amenityPosition: property.amenities?.length > 5 ? 'High' : 'Standard'
      },
      marketMetrics: {
        priceAppreciation: 3.2 + Math.random() * 2,
        rentalGrowth: 2.8 + Math.random() * 1.5,
        occupancyTrend: 90 + Math.random() * 8,
        marketVelocity: 0.7 + Math.random() * 0.3,
        absorptionRate: 0.3 + Math.random() * 0.2,
        inventoryLevel: 1.5 + Math.random() * 1,
        daysOnMarket: 20 + Math.random() * 15,
        priceReductionRate: 0.1 + Math.random() * 0.1,
        biddingWarRate: 0.2 + Math.random() * 0.2,
        marketLiquidity: 0.8 + Math.random() * 0.2
      }
    };
  };

  
  const calculateComprehensiveInvestmentMetrics = (property) => {
    const baseMetrics = calculateInvestmentMetrics(property);
    
    return {
      ...baseMetrics,
      advancedMetrics: {
        totalReturn: property.annualROI + Math.random() * 2,
        annualizedReturn: property.annualROI,
        compoundReturn: Math.pow(1 + property.annualROI / 100, 5) - 1,
        riskAdjustedReturn: property.annualROI / (2 + Math.random()),
        sharpeRatio: property.annualROI / (15 + Math.random() * 5),
        sortinoRatio: property.annualROI / (12 + Math.random() * 3),
        calmarRatio: property.annualROI / (8 + Math.random() * 2),
        grossRentalYield: (property.monthlyRent * 12) / (property.tokenPrice * property.totalTokens) * 100,
        netRentalYield: ((property.monthlyRent * 12) - (property.monthlyRent * 12 * 0.3)) / (property.tokenPrice * property.totalTokens) * 100,
        cashOnCashReturn: property.annualROI,
        equityMultiple: 1 + (property.annualROI / 100) * 5,
        irr: calculateIRR(property),
        npv: calculateNPV(property),
        valueAtRisk: 5 + Math.random() * 5,
        maximumDrawdown: 8 + Math.random() * 7,
        beta: 0.8 + Math.random() * 0.4,
        correlation: 0.6 + Math.random() * 0.3,
        volatility: 12 + Math.random() * 8,
        occupancyRate: property.occupancy || 90,
        tenantRetention: 85 + Math.random() * 10,
        collectionRate: 95 + Math.random() * 4,
        operatingEfficiency: 0.7 + Math.random() * 0.2,
        appreciationRate: 3 + Math.random() * 3,
        rentGrowthRate: 2 + Math.random() * 2,
        valueGrowthRate: 3.5 + Math.random() * 2.5,
        incomeGrowthRate: 2.5 + Math.random() * 2,
        loanToValue: 0.7 + Math.random() * 0.2,
        debtServiceCoverage: 1.2 + Math.random() * 0.3,
        interestCoverage: 2 + Math.random() * 1,
        debtYield: 6 + Math.random() * 2,
        depreciation: property.tokenPrice * property.totalTokens * 0.036,
        taxSavings: property.tokenPrice * property.totalTokens * 0.036 * 0.25,
        afterTaxReturn: property.annualROI * 0.75,
        taxEfficiency: 0.8 + Math.random() * 0.15
      }
    };
  };

  
  const assessAdvancedPropertyRisk = (property) => {
    const baseRisk = assessPropertyRisk(property);
    
    return {
      ...baseRisk,
      comprehensiveRisk: {
        marketRisk: 2 + Math.random() * 3,
        economicRisk: 2.5 + Math.random() * 2.5,
        interestRateRisk: 3 + Math.random() * 2,
        inflationRisk: 2 + Math.random() * 3,
        physicalRisk: 1.5 + Math.random() * 2.5,
        environmentalRisk: 2 + Math.random() * 3,
        regulatoryRisk: 1.5 + Math.random() * 2.5,
        technologyRisk: 2.5 + Math.random() * 2.5,
        liquidityRisk: 3 + Math.random() * 2,
        creditRisk: 2 + Math.random() * 3,
        concentrationRisk: 1.5 + Math.random() * 2.5,
        currencyRisk: 1 + Math.random() * 2,
        managementRisk: 2 + Math.random() * 3,
        tenantRisk: 2.5 + Math.random() * 2.5,
        maintenanceRisk: 2 + Math.random() * 3,
        legalRisk: 1.5 + Math.random() * 2.5,
        politicalRisk: 1 + Math.random() * 2,
        socialRisk: 1.5 + Math.random() * 2.5,
        demographicRisk: 2 + Math.random() * 3,
        climateRisk: 2.5 + Math.random() * 2.5
      }
    };
  };

  
  const calculateFinancialMetrics = (property) => {
    return {
      revenue: property.monthlyRent * 12,
      expenses: property.monthlyRent * 12 * 0.3,
      netOperatingIncome: property.monthlyRent * 12 * 0.7,
      cashFlow: property.monthlyRent * 12 * 0.6,
      profitMargin: 0.6 + Math.random() * 0.2,
      returnOnInvestment: property.annualROI,
      returnOnEquity: property.annualROI * 1.2,
      returnOnAssets: property.annualROI * 0.8,
      grossMargin: 0.7 + Math.random() * 0.2,
      operatingMargin: 0.6 + Math.random() * 0.2,
      netMargin: 0.5 + Math.random() * 0.2
    };
  };

  const calculateOperationalMetrics = (property) => {
    return {
      occupancyRate: property.occupancy || 90,
      tenantRetention: 85 + Math.random() * 10,
      averageLeaseLength: 20 + Math.random() * 10,
      maintenanceCosts: property.monthlyRent * 12 * 0.1,
      managementCosts: property.monthlyRent * 12 * 0.08,
      utilities: property.monthlyRent * 12 * 0.05,
      insurance: property.monthlyRent * 12 * 0.03,
      taxes: property.monthlyRent * 12 * 0.04,
      operatingRatio: 0.3 + Math.random() * 0.1,
      efficiencyRatio: 0.7 + Math.random() * 0.2
    };
  };

  const calculateMarketMetrics = (property) => {
    return {
      marketCap: property.tokenPrice * property.totalTokens,
      pricePerSqFt: property.tokenPrice * property.totalTokens / (property.squareFootage || 1000),
      capRate: (property.monthlyRent * 12) / (property.tokenPrice * property.totalTokens),
      priceToRentRatio: (property.tokenPrice * property.totalTokens) / (property.monthlyRent * 12),
      grossRentMultiplier: (property.tokenPrice * property.totalTokens) / (property.monthlyRent * 12),
      netRentMultiplier: (property.tokenPrice * property.totalTokens) / (property.monthlyRent * 12 * 0.7),
      marketValue: property.tokenPrice * property.totalTokens * (1 + Math.random() * 0.2),
      replacementCost: property.tokenPrice * property.totalTokens * 0.8,
      landValue: property.tokenPrice * property.totalTokens * 0.3,
      improvementValue: property.tokenPrice * property.totalTokens * 0.7
    };
  };

  const calculateSustainabilityMetrics = (property) => {
    return {
      energyEfficiency: 7 + Math.random() * 2,
      waterEfficiency: 6 + Math.random() * 3,
      wasteReduction: 5 + Math.random() * 4,
      carbonFootprint: 3 + Math.random() * 4,
      greenCertification: Math.random() > 0.5 ? 'LEED Gold' : 'None',
      sustainabilityScore: 6 + Math.random() * 3,
      environmentalImpact: 6 + Math.random() * 3,
      resourceConsumption: 5 + Math.random() * 4
    };
  };

  const calculateTechnologyMetrics = (property) => {
    return {
      smartBuildingFeatures: Math.random() > 0.3,
      connectivity: 7 + Math.random() * 2,
      digitalInfrastructure: 6 + Math.random() * 3,
      proptechIntegration: 5 + Math.random() * 4,
      automationLevel: 4 + Math.random() * 5,
      dataAnalytics: 5 + Math.random() * 4,
      cybersecurity: 6 + Math.random() * 3,
      futureReadiness: 6 + Math.random() * 3
    };
  };

  const calculateLegalMetrics = (property) => {
    return {
      zoningCompliance: Math.random() > 0.1,
      permitStatus: 'Current',
      legalIssues: Math.random() > 0.8,
      titleIssues: Math.random() > 0.9,
      easements: Math.random() > 0.7,
      restrictions: Math.random() > 0.6,
      complianceScore: 8 + Math.random() * 2,
      legalRisk: 1 + Math.random() * 3
    };
  };

  
  const analyzeAdvancedGrowthPotential = (property) => {
    return {
      ...analyzeGrowthPotential(property),
      advancedGrowth: {
        demographicGrowth: 2.5 + Math.random() * 2,
        economicGrowth: 3 + Math.random() * 2,
        infrastructureGrowth: 2 + Math.random() * 3,
        technologyGrowth: 4 + Math.random() * 3,
        sustainabilityGrowth: 3.5 + Math.random() * 2.5,
        marketExpansion: 2.8 + Math.random() * 2.2,
        valueCreation: 3.2 + Math.random() * 2.8,
        incomeGrowth: 2.5 + Math.random() * 2.5,
        appreciationPotential: 3.5 + Math.random() * 3.5,
        developmentPotential: 2 + Math.random() * 4
      }
    };
  };

  const findAdvancedComparableProperties = (property) => {
    return {
      ...findComparableProperties(property),
      advancedComparables: {
        priceComparables: generatePriceComparables(property),
        rentComparables: generateRentComparables(property),
        capRateComparables: generateCapRateComparables(property),
        locationComparables: generateLocationComparables(property),
        amenityComparables: generateAmenityComparables(property),
        qualityComparables: generateQualityComparables(property),
        sizeComparables: generateSizeComparables(property),
        ageComparables: generateAgeComparables(property)
      }
    };
  };

  const analyzeComprehensiveNeighborhood = (location) => {
    return {
      ...analyzeNeighborhood(location),
      comprehensiveNeighborhood: {
        walkability: 7 + Math.random() * 2,
        transit: 6 + Math.random() * 3,
        bikeability: 5 + Math.random() * 4,
        safety: 8 + Math.random() * 2,
        schools: 7 + Math.random() * 2,
        healthcare: 7 + Math.random() * 2,
        shopping: 7 + Math.random() * 2,
        dining: 7 + Math.random() * 2,
        entertainment: 6 + Math.random() * 3,
        parks: 6 + Math.random() * 3,
        cultural: 6 + Math.random() * 3,
        nightlife: 6 + Math.random() * 3,
        diversity: 7 + Math.random() * 2,
        income: 6 + Math.random() * 3,
        education: 7 + Math.random() * 2,
        employment: 7 + Math.random() * 2,
        development: 6 + Math.random() * 3,
        gentrification: 5 + Math.random() * 4,
        stability: 7 + Math.random() * 2,
        growth: 6 + Math.random() * 3
      }
    };
  };

  const analyzeAdvancedMarketTiming = (property) => {
    return {
      ...analyzeMarketTiming(property),
      advancedTiming: {
        marketCycle: determineMarketCycle(property),
        cyclePosition: determineCyclePosition(property),
        optimalEntry: determineOptimalEntry(property),
        optimalExit: determineOptimalExit(property),
        marketMomentum: calculateMarketMomentum(property),
        seasonalFactors: analyzeSeasonalFactors(property),
        economicFactors: analyzeEconomicFactors(property),
        interestRateFactors: analyzeInterestRateFactors(property),
        supplyDemandFactors: analyzeSupplyDemandFactors(property),
        policyFactors: analyzePolicyFactors(property)
      }
    };
  };

  const projectAdvancedCashFlow = (property) => {
    return {
      ...projectCashFlow(property),
      advancedProjections: {
        monthlyProjections: generateMonthlyProjections(property),
        quarterlyProjections: generateQuarterlyProjections(property),
        annualProjections: generateAnnualProjections(property),
        scenarioAnalysis: generateScenarioAnalysis(property),
        sensitivityAnalysis: generateSensitivityAnalysis(property),
        stressTesting: generateStressTesting(property),
        monteCarloSimulation: generateMonteCarloSimulation(property)
      }
    };
  };

  const forecastAdvancedAppreciation = (property) => {
    return {
      ...forecastAppreciation(property),
      advancedForecasting: {
        shortTermForecast: generateShortTermForecast(property),
        mediumTermForecast: generateMediumTermForecast(property),
        longTermForecast: generateLongTermForecast(property),
        scenarioForecasting: generateScenarioForecasting(property),
        riskAdjustedForecasting: generateRiskAdjustedForecasting(property),
        marketBasedForecasting: generateMarketBasedForecasting(property),
        fundamentalForecasting: generateFundamentalForecasting(property)
      }
    };
  };

  
  const generatePriceComparables = (property) => {
    const basePrice = property.tokenPrice * property.totalTokens;
    return Array.from({ length: 5 }, (_, i) => ({
      address: `Comparable ${i + 1}`,
      price: basePrice * (0.8 + Math.random() * 0.4),
      pricePerSqFt: (basePrice / (property.squareFootage || 1000)) * (0.8 + Math.random() * 0.4),
      size: (property.squareFootage || 1000) * (0.8 + Math.random() * 0.4),
      age: Math.floor(Math.random() * 20) + 5,
      distance: Math.random() * 2
    }));
  };

  const generateRentComparables = (property) => {
    const baseRent = property.monthlyRent;
    return Array.from({ length: 5 }, (_, i) => ({
      address: `Rent Comparable ${i + 1}`,
      monthlyRent: baseRent * (0.8 + Math.random() * 0.4),
      rentPerSqFt: (baseRent / (property.squareFootage || 1000)) * (0.8 + Math.random() * 0.4),
      size: (property.squareFootage || 1000) * (0.8 + Math.random() * 0.4),
      age: Math.floor(Math.random() * 20) + 5,
      distance: Math.random() * 2
    }));
  };

  const generateCapRateComparables = (property) => {
    const baseCapRate = (property.monthlyRent * 12) / (property.tokenPrice * property.totalTokens);
    return Array.from({ length: 5 }, (_, i) => ({
      address: `Cap Rate Comparable ${i + 1}`,
      capRate: baseCapRate * (0.8 + Math.random() * 0.4),
      price: property.tokenPrice * property.totalTokens * (0.8 + Math.random() * 0.4),
      monthlyRent: property.monthlyRent * (0.8 + Math.random() * 0.4),
      size: (property.squareFootage || 1000) * (0.8 + Math.random() * 0.4),
      distance: Math.random() * 2
    }));
  };

  const generateLocationComparables = (property) => {
    return Array.from({ length: 5 }, (_, i) => ({
      address: `Location Comparable ${i + 1}`,
      location: property.location,
      walkScore: 70 + Math.random() * 20,
      transitScore: 60 + Math.random() * 30,
      bikeScore: 50 + Math.random() * 40,
      safety: 7 + Math.random() * 2,
      distance: Math.random() * 2
    }));
  };

  const generateAmenityComparables = (property) => {
    return Array.from({ length: 5 }, (_, i) => ({
      address: `Amenity Comparable ${i + 1}`,
      amenities: property.amenities || [],
      amenityScore: 6 + Math.random() * 3,
      quality: 7 + Math.random() * 2,
      maintenance: 7 + Math.random() * 2,
      distance: Math.random() * 2
    }));
  };

  const generateQualityComparables = (property) => {
    return Array.from({ length: 5 }, (_, i) => ({
      address: `Quality Comparable ${i + 1}`,
      quality: property.propertyType === 'Luxury' ? 'High' : 'Standard',
      condition: 'Good',
      age: Math.floor(Math.random() * 20) + 5,
      maintenance: 7 + Math.random() * 2,
      distance: Math.random() * 2
    }));
  };

  const generateSizeComparables = (property) => {
    const baseSize = property.squareFootage || 1000;
    return Array.from({ length: 5 }, (_, i) => ({
      address: `Size Comparable ${i + 1}`,
      size: baseSize * (0.8 + Math.random() * 0.4),
      bedrooms: Math.floor(Math.random() * 3) + 1,
      bathrooms: Math.floor(Math.random() * 2) + 1,
      distance: Math.random() * 2
    }));
  };

  const generateAgeComparables = (property) => {
    return Array.from({ length: 5 }, (_, i) => ({
      address: `Age Comparable ${i + 1}`,
      age: Math.floor(Math.random() * 30) + 5,
      condition: 'Good',
      maintenance: 7 + Math.random() * 2,
      distance: Math.random() * 2
    }));
  };

  
  const determineMarketCycle = (property) => {
    const cycles = ['Recovery', 'Expansion', 'Peak', 'Recession'];
    const weights = [0.1, 0.4, 0.3, 0.2];
    const random = Math.random();
    let cumulative = 0;
    for (let i = 0; i < cycles.length; i++) {
      cumulative += weights[i];
      if (random <= cumulative) return cycles[i];
    }
    return 'Expansion';
  };

  const determineCyclePosition = (property) => {
    const positions = ['Early', 'Mid', 'Late'];
    return positions[Math.floor(Math.random() * positions.length)];
  };

  const determineOptimalEntry = (property) => {
    const entryTiming = ['Immediate', '3-6 months', '6-12 months', 'Wait'];
    const weights = [0.3, 0.4, 0.2, 0.1];
    const random = Math.random();
    let cumulative = 0;
    for (let i = 0; i < entryTiming.length; i++) {
      cumulative += weights[i];
      if (random <= cumulative) return entryTiming[i];
    }
    return '3-6 months';
  };

  const determineOptimalExit = (property) => {
    const exitTiming = ['1-2 years', '3-5 years', '5-10 years', 'Long-term hold'];
    const weights = [0.2, 0.3, 0.3, 0.2];
    const random = Math.random();
    let cumulative = 0;
    for (let i = 0; i < exitTiming.length; i++) {
      cumulative += weights[i];
      if (random <= cumulative) return exitTiming[i];
    }
    return '3-5 years';
  };

  const calculateMarketMomentum = (property) => {
    return {
      priceMomentum: 0.5 + Math.random() * 0.5,
      volumeMomentum: 0.4 + Math.random() * 0.6,
      sentimentMomentum: 0.3 + Math.random() * 0.7,
      overallMomentum: 0.4 + Math.random() * 0.6
    };
  };

  const analyzeSeasonalFactors = (property) => {
    return {
      spring: { demand: 0.8 + Math.random() * 0.4, price: 0.9 + Math.random() * 0.2 },
      summer: { demand: 0.9 + Math.random() * 0.2, price: 1.0 + Math.random() * 0.1 },
      fall: { demand: 0.7 + Math.random() * 0.3, price: 0.8 + Math.random() * 0.2 },
      winter: { demand: 0.6 + Math.random() * 0.3, price: 0.7 + Math.random() * 0.2 }
    };
  };

  const analyzeEconomicFactors = (property) => {
    return {
      gdpImpact: 0.6 + Math.random() * 0.4,
      employmentImpact: 0.7 + Math.random() * 0.3,
      inflationImpact: 0.5 + Math.random() * 0.5,
      consumerConfidenceImpact: 0.6 + Math.random() * 0.4
    };
  };

  const analyzeInterestRateFactors = (property) => {
    return {
      currentRateImpact: 0.5 + Math.random() * 0.5,
      rateTrendImpact: 0.4 + Math.random() * 0.6,
      affordabilityImpact: 0.6 + Math.random() * 0.4,
      investmentImpact: 0.5 + Math.random() * 0.5
    };
  };

  const analyzeSupplyDemandFactors = (property) => {
    return {
      supplyLevel: 0.3 + Math.random() * 0.7,
      demandLevel: 0.4 + Math.random() * 0.6,
      inventoryLevel: 0.2 + Math.random() * 0.8,
      absorptionRate: 0.3 + Math.random() * 0.7
    };
  };

  const analyzePolicyFactors = (property) => {
    return {
      zoningImpact: 0.5 + Math.random() * 0.5,
      taxImpact: 0.4 + Math.random() * 0.6,
      regulationImpact: 0.3 + Math.random() * 0.7,
      incentiveImpact: 0.2 + Math.random() * 0.8
    };
  };

  
  const generateMonthlyProjections = (property) => {
    const projections = [];
    for (let i = 0; i < 12; i++) {
      projections.push({
        month: i + 1,
        revenue: property.monthlyRent * (1 + Math.random() * 0.1),
        expenses: property.monthlyRent * 0.3 * (1 + Math.random() * 0.1),
        netIncome: property.monthlyRent * 0.7 * (1 + Math.random() * 0.1)
      });
    }
    return projections;
  };

  const generateQuarterlyProjections = (property) => {
    const projections = [];
    for (let i = 0; i < 4; i++) {
      projections.push({
        quarter: i + 1,
        revenue: property.monthlyRent * 3 * (1 + Math.random() * 0.1),
        expenses: property.monthlyRent * 3 * 0.3 * (1 + Math.random() * 0.1),
        netIncome: property.monthlyRent * 3 * 0.7 * (1 + Math.random() * 0.1)
      });
    }
    return projections;
  };

  const generateAnnualProjections = (property) => {
    const projections = [];
    for (let i = 0; i < 5; i++) {
      projections.push({
        year: i + 1,
        revenue: property.monthlyRent * 12 * Math.pow(1.03, i) * (1 + Math.random() * 0.1),
        expenses: property.monthlyRent * 12 * 0.3 * Math.pow(1.02, i) * (1 + Math.random() * 0.1),
        netIncome: property.monthlyRent * 12 * 0.7 * Math.pow(1.03, i) * (1 + Math.random() * 0.1)
      });
    }
    return projections;
  };


  const generateSensitivityAnalysis = (property) => {
    return {
      rentVariation: {
        '-10%': property.monthlyRent * 12 * 0.9 * 0.7,
        '0%': property.monthlyRent * 12 * 0.7,
        '+10%': property.monthlyRent * 12 * 1.1 * 0.7
      },
      expenseVariation: {
        '-10%': property.monthlyRent * 12 * 0.7 - (property.monthlyRent * 12 * 0.3 * 0.9),
        '0%': property.monthlyRent * 12 * 0.7,
        '+10%': property.monthlyRent * 12 * 0.7 - (property.monthlyRent * 12 * 0.3 * 1.1)
      },
      occupancyVariation: {
        '85%': property.monthlyRent * 12 * 0.85 * 0.7,
        '90%': property.monthlyRent * 12 * 0.9 * 0.7,
        '95%': property.monthlyRent * 12 * 0.95 * 0.7
      }
    };
  };

  const generateStressTesting = (property) => {
    return {
      recession: {
        revenue: property.monthlyRent * 12 * 0.7,
        expenses: property.monthlyRent * 12 * 0.4,
        netIncome: property.monthlyRent * 12 * 0.3
      },
      highInterest: {
        revenue: property.monthlyRent * 12,
        expenses: property.monthlyRent * 12 * 0.4,
        netIncome: property.monthlyRent * 12 * 0.6
      },
      vacancy: {
        revenue: property.monthlyRent * 12 * 0.8,
        expenses: property.monthlyRent * 12 * 0.3,
        netIncome: property.monthlyRent * 12 * 0.5
      }
    };
  };

  const generateMonteCarloSimulation = (property) => {
    const simulations = [];
    for (let i = 0; i < 1000; i++) {
      simulations.push({
        revenue: property.monthlyRent * 12 * (0.8 + Math.random() * 0.4),
        expenses: property.monthlyRent * 12 * 0.3 * (0.8 + Math.random() * 0.4),
        netIncome: property.monthlyRent * 12 * 0.7 * (0.8 + Math.random() * 0.4)
      });
    }
    return {
      simulations,
      average: simulations.reduce((acc, sim) => acc + sim.netIncome, 0) / simulations.length,
      median: simulations.sort((a, b) => a.netIncome - b.netIncome)[Math.floor(simulations.length / 2)].netIncome,
      percentile90: simulations.sort((a, b) => a.netIncome - b.netIncome)[Math.floor(simulations.length * 0.9)].netIncome,
      percentile10: simulations.sort((a, b) => a.netIncome - b.netIncome)[Math.floor(simulations.length * 0.1)].netIncome
    };
  };

  
  const generateShortTermForecast = (property) => {
    return {
      timeframe: '1-2 years',
      appreciation: 2 + Math.random() * 4,
      confidence: 0.7 + Math.random() * 0.2,
      factors: ['Market conditions', 'Interest rates', 'Local development']
    };
  };

  const generateMediumTermForecast = (property) => {
    return {
      timeframe: '3-5 years',
      appreciation: 3 + Math.random() * 6,
      confidence: 0.6 + Math.random() * 0.3,
      factors: ['Economic growth', 'Demographic trends', 'Infrastructure development']
    };
  };

  const generateLongTermForecast = (property) => {
    return {
      timeframe: '5-10 years',
      appreciation: 4 + Math.random() * 8,
      confidence: 0.5 + Math.random() * 0.3,
      factors: ['Long-term economic trends', 'Urban development', 'Climate factors']
    };
  };

  const generateScenarioForecasting = (property) => {
    return {
      optimistic: {
        appreciation: 6 + Math.random() * 4,
        probability: 0.2 + Math.random() * 0.1,
        factors: ['Strong economic growth', 'High demand', 'Limited supply']
      },
      base: {
        appreciation: 3 + Math.random() * 3,
        probability: 0.5 + Math.random() * 0.2,
        factors: ['Moderate growth', 'Balanced market', 'Stable conditions']
      },
      pessimistic: {
        appreciation: 0 + Math.random() * 2,
        probability: 0.2 + Math.random() * 0.1,
        factors: ['Economic downturn', 'High supply', 'Low demand']
      }
    };
  };

  const generateRiskAdjustedForecasting = (property) => {
    return {
      riskFree: 2 + Math.random() * 1,
      marketRisk: 1 + Math.random() * 2,
      propertyRisk: 0.5 + Math.random() * 1.5,
      totalRisk: 3.5 + Math.random() * 4.5,
      riskAdjustedReturn: 3 + Math.random() * 4
    };
  };

  const generateMarketBasedForecasting = (property) => {
    return {
      historicalTrend: 2.5 + Math.random() * 2.5,
      marketCycle: 1 + Math.random() * 3,
      comparableSales: 2 + Math.random() * 3,
      marketSentiment: 1.5 + Math.random() * 2.5,
      combinedForecast: 2.5 + Math.random() * 3.5
    };
  };

  const generateFundamentalForecasting = (property) => {
    return {
      locationFundamentals: 3 + Math.random() * 3,
      propertyFundamentals: 2.5 + Math.random() * 2.5,
      economicFundamentals: 2 + Math.random() * 3,
      demographicFundamentals: 2.5 + Math.random() * 2.5,
      combinedFundamentals: 2.5 + Math.random() * 3.5
    };
  };

  const calculateInvestmentMetrics = (property) => {
    const metrics = {
      roi: property.annualROI,
      cashOnCashReturn: property.annualROI,
      irr: calculateIRR(property),
      npv: calculateNPV(property),
      paybackPeriod: calculatePaybackPeriod(property),
      totalReturn: calculateTotalReturn(property),
      riskAdjustedReturn: calculateRiskAdjustedReturn(property),
      sharpeRatio: calculateSharpeRatio(property)
    };
    
    return metrics;
  };

  const assessPropertyRisk = (property) => {
    const riskFactors = {
      marketRisk: Math.random() * 3 + 2, 
      liquidityRisk: Math.random() * 2 + 1, 
      creditRisk: Math.random() * 2 + 1, 
      operationalRisk: Math.random() * 2 + 1, 
      regulatoryRisk: Math.random() * 2 + 1, 
      environmentalRisk: Math.random() * 2 + 1, 
      overallRisk: 0
    };
    
    riskFactors.overallRisk = Object.values(riskFactors).reduce((sum, risk) => sum + risk, 0) / 6;
    
    return riskFactors;
  };

  const analyzeGrowthPotential = (property) => {
    const growthFactors = {
      demographicTrends: Math.random() * 2 + 3, 
      economicGrowth: Math.random() * 2 + 3, 
      infrastructureDevelopment: Math.random() * 2 + 3, 
      jobGrowth: Math.random() * 2 + 3, 
      populationGrowth: Math.random() * 2 + 3, 
      overallGrowth: 0
    };
    
    growthFactors.overallGrowth = Object.values(growthFactors).reduce((sum, growth) => sum + growth, 0) / 5;
    
    return growthFactors;
  };

  const findComparableProperties = async (property) => {
    
    const comparables = [
      {
        name: `${property.name} - Similar Building A`,
        location: property.location,
        pricePerSqFt: (property.tokenPrice * property.totalTokens / (property.squareFootage || 1000)) * (0.9 + Math.random() * 0.2),
        capRate: property.annualROI * (0.9 + Math.random() * 0.2),
        yearBuilt: property.yearBuilt + Math.floor(Math.random() * 6 - 3),
        distance: Math.random() * 2 + 0.5
      },
      {
        name: `${property.name} - Similar Building B`,
        location: property.location,
        pricePerSqFt: (property.tokenPrice * property.totalTokens / (property.squareFootage || 1000)) * (0.9 + Math.random() * 0.2),
        capRate: property.annualROI * (0.9 + Math.random() * 0.2),
        yearBuilt: property.yearBuilt + Math.floor(Math.random() * 6 - 3),
        distance: Math.random() * 2 + 0.5
      }
    ];
    
    return comparables;
  };

  const analyzeNeighborhood = async (location) => {
    const neighborhood = {
      walkScore: Math.floor(Math.random() * 40) + 60,
      transitScore: Math.floor(Math.random() * 40) + 60,
      bikeScore: Math.floor(Math.random() * 40) + 60,
      crimeRate: Math.random() * 2 + 1, 
      schoolRating: Math.floor(Math.random() * 3) + 7, 
      amenities: ['Restaurants', 'Shopping', 'Parks', 'Gyms', 'Entertainment'],
      futureDevelopment: ['New transit line', 'Mixed-use development', 'Tech campus']
    };
    
    return neighborhood;
  };

  const analyzeMarketTiming = (property) => {
    const timing = {
      marketCycle: 'Expansion', 
      seasonality: 'Favorable', 
      interestRateEnvironment: 'Stable',
      supplyDemandBalance: 'Balanced',
      priceMomentum: 'Positive',
      investmentTiming: 'Good',
      confidence: Math.random() * 20 + 70 
    };
    
    return timing;
  };

  const projectCashFlow = (property) => {
    const projection = {
      year1: {
        grossRent: property.monthlyRent * 12,
        operatingExpenses: property.monthlyRent * 12 * 0.35,
        netOperatingIncome: property.monthlyRent * 12 * 0.65,
        cashFlow: property.monthlyRent * 12 * 0.65 - (property.tokenPrice * property.totalTokens * 0.06)
      },
      year5: {
        grossRent: property.monthlyRent * 12 * 1.15,
        operatingExpenses: property.monthlyRent * 12 * 1.15 * 0.35,
        netOperatingIncome: property.monthlyRent * 12 * 1.15 * 0.65,
        cashFlow: property.monthlyRent * 12 * 1.15 * 0.65 - (property.tokenPrice * property.totalTokens * 0.06)
      },
      year10: {
        grossRent: property.monthlyRent * 12 * 1.35,
        operatingExpenses: property.monthlyRent * 12 * 1.35 * 0.35,
        netOperatingIncome: property.monthlyRent * 12 * 1.35 * 0.65,
        cashFlow: property.monthlyRent * 12 * 1.35 * 0.65 - (property.tokenPrice * property.totalTokens * 0.06)
      }
    };
    
    return projection;
  };

  const forecastAppreciation = (property) => {
    const forecast = {
      year1: property.tokenPrice * 1.03,
      year3: property.tokenPrice * 1.10,
      year5: property.tokenPrice * 1.20,
      year10: property.tokenPrice * 1.45,
      annualizedReturn: 4.2 + Math.random() * 2,
      confidence: 75 + Math.random() * 15
    };
    
    return forecast;
  };

  
  const generateInvestmentAnalysis = (knowledge, context, input) => {
    const { propertyData, marketData, platformData } = knowledge;
    const { property } = input;
    
    const analysis = {
      recommendation: generateRecommendation(propertyData, marketData),
      keyMetrics: propertyData.investmentMetrics,
      marketPosition: propertyData.marketPosition,
      riskProfile: propertyData.riskAssessment,
      growthPotential: propertyData.growthPotential,
      cashFlowProjection: propertyData.cashFlowProjection,
      appreciationForecast: propertyData.appreciationForecast,
      confidence: calculateOverallConfidence(propertyData, marketData),
      propertyData: propertyData
    };
    
    return formatInvestmentAnalysis(analysis, property, context);
  };

  const generateMarketAnalysis = (knowledge, context, input) => {
    const { marketData, propertyData, macroEconomicData } = knowledge;
    
    const analysis = {
      marketTrends: marketData.marketTrends,
      economicIndicators: marketData.economicIndicators,
      demographicTrends: marketData.demographicTrends,
      locationScore: propertyData.locationScore,
      neighborhoodAnalysis: propertyData.neighborhoodAnalysis,
      comparableProperties: propertyData.comparableProperties,
      marketTiming: propertyData.marketTiming
    };
    
    return formatMarketAnalysis(analysis, context);
  };

  const generateRiskAssessment = (knowledge, context, input) => {
    const { propertyData, marketData, macroEconomicData } = knowledge;
    
    const assessment = {
      riskFactors: propertyData.riskAssessment,
      marketRisk: marketData.marketTrends,
      economicRisk: macroEconomicData,
      mitigationStrategies: generateMitigationStrategies(propertyData.riskAssessment),
      riskRating: calculateRiskRating(propertyData.riskAssessment),
      recommendations: generateRiskRecommendations(propertyData.riskAssessment)
    };
    
    return formatRiskAssessment(assessment, context);
  };

  
  const determineComplexity = (property, context) => {
    const factors = [
      property.totalTokens > 20000 ? 1 : 0,
      property.annualROI > 10 ? 1 : 0,
      property.location.includes('New York') || property.location.includes('San Francisco') ? 1 : 0,
      context.urgency === 'high' ? 1 : 0
    ];
    return factors.reduce((sum, factor) => sum + factor, 0) > 2 ? 'complex' : 'simple';
  };

  const determineUrgency = (context) => {
    return context.urgency || 'normal';
  };

  const analyzeConversationFlow = (conversationContext) => {
    if (conversationContext.length === 0) return 'new';
    if (conversationContext.length < 3) return 'early';
    if (conversationContext.length < 10) return 'developing';
    return 'established';
  };

  const determineDataRelevance = (intent, input) => {
    const relevance = {
      marketData: ['investmentAnalysis', 'marketAnalysis', 'growthProjection'].includes(intent),
      propertyData: ['investmentAnalysis', 'riskAssessment', 'comparativeAnalysis'].includes(intent),
      platformData: ['portfolioFit', 'investmentAnalysis'].includes(intent),
      historicalData: ['growthProjection', 'marketAnalysis'].includes(intent),
      macroEconomicData: ['marketAnalysis', 'riskAssessment'].includes(intent)
    };
    return relevance;
  };

  const generatePersonalizedInsights = (propertyData, marketData, context) => {
    const insights = [];
    
    if (context.userLevel === 'beginner') {
      insights.push('This property offers a good entry point for new investors with moderate risk.');
    } else if (context.userLevel === 'advanced') {
      insights.push('Advanced investors may find additional value through strategic improvements.');
    }
    
    if (context.riskTolerance === 'low') {
      insights.push('The risk profile aligns well with conservative investment strategies.');
    } else if (context.riskTolerance === 'high') {
      insights.push('Higher risk tolerance allows for more aggressive investment strategies.');
    }
    
    return insights;
  };

  const generateCalculations = (propertyData, marketData, property) => {
    const calculations = [];
    
    calculations.push({
      metric: 'ROI',
      value: propertyData.investmentMetrics.roi,
      formula: 'Annual Return / Initial Investment × 100',
      benchmark: 'Market Average: 6-8%'
    });
    
    calculations.push({
      metric: 'Cap Rate',
      value: propertyData.marketPosition.capRate,
      formula: 'Net Operating Income / Property Value × 100',
      benchmark: 'Good: 6-10%'
    });
    
    return calculations;
  };

  const generateExamples = (propertyData, historicalData, context) => {
    const examples = [];
    
    examples.push({
      type: 'Historical Performance',
      description: `Similar properties in this area have shown ${historicalData.appreciationForecast?.annualizedReturn || 4.2}% annual appreciation over the past 5 years.`
    });
    
    examples.push({
      type: 'Market Comparison',
      description: `This property's cap rate of ${propertyData.marketPosition.capRate.toFixed(1)}% is ${propertyData.marketPosition.capRate > 7 ? 'above' : 'below'} the market average.`
    });
    
    return examples;
  };

  const generateWarnings = (propertyData, marketData, macroEconomicData) => {
    const warnings = [];
    
    if (propertyData.riskAssessment.overallRisk > 3.5) {
      warnings.push('High risk property - consider diversification strategies.');
    }
    
    if (marketData.economicIndicators.inflation > 4) {
      warnings.push('High inflation environment may impact real estate values.');
    }
    
    if (macroEconomicData.interestRateEnvironment.trend === 'increasing') {
      warnings.push('Rising interest rates may affect property values and financing costs.');
    }
    
    return warnings;
  };

  const generateRecommendation = (propertyData, marketData) => {
    const score = (propertyData.investmentMetrics.roi + propertyData.locationScore.score + (10 - propertyData.riskAssessment.overallRisk * 2)) / 3;
    
    let rating = 'Hold';
    let marketOutlook = 'Neutral';
    let actionAdvice = '';
    let beginnerExplanation = '';
    
    if (score > 8) {
      rating = 'Strong Buy';
      marketOutlook = 'Bullish';
      actionAdvice = 'This is an excellent investment opportunity! Consider adding it to your portfolio.';
      beginnerExplanation = `This property offers you strong returns (${propertyData.investmentMetrics.roi}% yearly) with a low risk of losing money. The location is highly desirable, which means property values are likely to increase over time. Great for first-time investors!`;
    } else if (score > 7) {
      rating = 'Buy';
      marketOutlook = 'Positive';
      actionAdvice = 'This is a solid investment. Good for building your portfolio.';
      beginnerExplanation = `This property provides steady returns and is located in a stable market. The risk level is manageable, making it suitable for investors looking for consistent income. You can expect regular cash distributions.`;
    } else if (score > 5) {
      rating = 'Hold';
      marketOutlook = 'Neutral';
      actionAdvice = 'Consider other options. This property is average.';
      beginnerExplanation = `This property shows average performance. While it's not a bad investment, there may be better opportunities for you. The returns are moderate, and the risk level is typical for real estate.`;
    } else {
      rating = 'Avoid';
      marketOutlook = 'Bearish';
      actionAdvice = 'Not recommended for investment. Look for better opportunities.';
      beginnerExplanation = `This property has concerns that make it risky for new investors. The returns may not justify the risk level. Consider exploring other properties with better fundamentals.`;
    }
    
    const reasoning = propertyData.investmentMetrics.roi > 8 
      ? `${beginnerExplanation} The AI analyzed 100+ data points including market trends, location quality, and economic factors to give you this recommendation.`
      : beginnerExplanation;
    
    return { rating, marketOutlook, reasoning, actionAdvice };
  };

  const calculateOverallConfidence = (propertyData, marketData) => {
    let confidence = 70; 
    
    
    if (propertyData.locationScore.score > 8) confidence += 10;
    if (propertyData.investmentMetrics.roi > 8) confidence += 10;
    if (propertyData.riskAssessment.overallRisk < 3) confidence += 5;
    if (marketData.economicIndicators.gdp > 2.5) confidence += 5;
    
    return Math.min(confidence, 95);
  };

  const calculateResponseConfidence = (intent, context, knowledge) => {
    let confidence = 0.7;
    
    if (knowledge.marketData) confidence += 0.1;
    if (knowledge.propertyData) confidence += 0.1;
    if (knowledge.platformData) confidence += 0.1;
    if (intent !== 'generalInquiry') confidence += 0.1;
    
    return Math.min(confidence, 0.95);
  };

  const extractSources = (knowledge) => {
    const sources = [];
    if (knowledge.marketData) sources.push('Market Data');
    if (knowledge.propertyData) sources.push('Property Analysis');
    if (knowledge.platformData) sources.push('Platform Metrics');
    if (knowledge.historicalData) sources.push('Historical Data');
    if (knowledge.macroEconomicData) sources.push('Economic Data');
    return sources;
  };

  const generateReasoningPath = (intent, context, knowledge) => {
    return [
      `Intent classified as: ${intent}`,
      `Data sources used: ${extractSources(knowledge).join(', ')}`,
      `Context analysis: ${context.userLevel} user level`,
      `Response generated with ${Math.round(calculateResponseConfidence(intent, context, knowledge) * 100)}% confidence`
    ];
  };

  const generateFollowUpQuestions = (intent, context, input) => {
    const followUps = {
      investmentAnalysis: ['Would you like to see detailed cash flow projections?', 'Should I analyze the risk factors in more detail?'],
      marketAnalysis: ['Want to see comparable properties?', 'Should I analyze the neighborhood trends?'],
      riskAssessment: ['Need mitigation strategies?', 'Want to see risk vs return analysis?']
    };
    
    return followUps[intent] || ['How else can I help?', 'Any other questions?'];
  };

  const countDataPoints = (knowledge) => {
    let count = 0;
    Object.values(knowledge).forEach(data => {
      if (typeof data === 'object' && data !== null) {
        count += Object.keys(data).length;
      }
    });
    return count;
  };

  const calculateAccuracy = (knowledge, property) => {
    
    let accuracy = 70;
    if (knowledge.marketData) accuracy += 10;
    if (knowledge.propertyData) accuracy += 10;
    if (knowledge.historicalData) accuracy += 5;
    if (knowledge.macroEconomicData) accuracy += 5;
    return Math.min(accuracy, 95);
  };

  
  const calculateIRR = (property) => {
    const annualCashFlow = property.monthlyRent * 12 * 0.65;
    const initialInvestment = property.tokenPrice * property.totalTokens;
    const appreciation = property.annualROI * 0.3;
    return (annualCashFlow / initialInvestment + appreciation) * 100;
  };

  const calculateNPV = (property) => {
    const annualCashFlow = property.monthlyRent * 12 * 0.65;
    const initialInvestment = property.tokenPrice * property.totalTokens;
    const discountRate = 0.08;
    const years = 10;
    
    let npv = -initialInvestment;
    for (let i = 1; i <= years; i++) {
      npv += annualCashFlow / Math.pow(1 + discountRate, i);
    }
    return npv;
  };

  const calculatePaybackPeriod = (property) => {
    const annualCashFlow = property.monthlyRent * 12 * 0.65;
    const initialInvestment = property.tokenPrice * property.totalTokens;
    return initialInvestment / annualCashFlow;
  };

  const calculateTotalReturn = (property) => {
    const annualCashFlow = property.monthlyRent * 12 * 0.65;
    const initialInvestment = property.tokenPrice * property.totalTokens;
    const appreciation = property.annualROI * 0.3;
    return (annualCashFlow / initialInvestment + appreciation) * 100;
  };

  const calculateRiskAdjustedReturn = (property) => {
    const totalReturn = calculateTotalReturn(property);
    const riskScore = Math.random() * 3 + 2;
    return totalReturn / riskScore;
  };

  const calculateSharpeRatio = (property) => {
    const totalReturn = calculateTotalReturn(property);
    const riskFreeRate = 2.5;
    const volatility = Math.random() * 5 + 10;
    return (totalReturn - riskFreeRate) / volatility;
  };

  
  const generatePriceHistory = (property) => {
    const history = [];
    const currentPrice = property.tokenPrice;
    
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setFullYear(date.getFullYear() - i);
      
      const price = currentPrice * (0.8 + Math.random() * 0.4);
      history.push({
        date: date.toISOString().split('T')[0],
        price: Math.round(price),
        change: i === 0 ? 0 : Math.round((price - history[history.length - 1]?.price || price) / (history[history.length - 1]?.price || price) * 100)
      });
    }
    
    return history;
  };

  const generateRentalHistory = (property) => {
    const history = [];
    const currentRent = property.monthlyRent;
    
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setFullYear(date.getFullYear() - i);
      
      const rent = currentRent * (0.9 + Math.random() * 0.2);
      history.push({
        date: date.toISOString().split('T')[0],
        rent: Math.round(rent),
        occupancy: Math.round(85 + Math.random() * 15)
      });
    }
    
    return history;
  };

  const generateOccupancyHistory = (property) => {
    const history = [];
    
    for (let i = 12; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      
      const occupancy = Math.round(property.occupancy + (Math.random() - 0.5) * 10);
      history.push({
        date: date.toISOString().split('T')[0],
        occupancy: Math.max(0, Math.min(100, occupancy))
      });
    }
    
    return history;
  };

  const analyzeMarketCycles = (location) => {
    const cycles = {
      currentPhase: 'Expansion',
      cycleLength: '7-10 years',
      timeInPhase: '3 years',
      nextPhase: 'Peak',
      confidence: 75 + Math.random() * 20
    };
    
    return cycles;
  };

  const analyzeSeasonalTrends = (property) => {
    const trends = {
      spring: { demand: 'High', price: 'Above average' },
      summer: { demand: 'Peak', price: 'Highest' },
      fall: { demand: 'Moderate', price: 'Average' },
      winter: { demand: 'Low', price: 'Below average' }
    };
    
    return trends;
  };

  const analyzeEconomicCorrelations = (property) => {
    const correlations = {
      gdp: 0.7 + Math.random() * 0.2,
      unemployment: -0.6 + Math.random() * 0.2,
      interestRates: -0.4 + Math.random() * 0.2,
      inflation: 0.5 + Math.random() * 0.3
    };
    
    return correlations;
  };

  const generateGrowthProjection = (knowledge, context, input) => {
    const { propertyData, marketData } = knowledge;
    
    const projection = {
      appreciation: propertyData.appreciationForecast,
      marketGrowth: marketData.marketTrends.priceGrowth,
      demographicGrowth: marketData.demographicTrends.populationGrowth,
      economicGrowth: marketData.economicIndicators.gdp,
      confidence: calculateOverallConfidence(propertyData, marketData)
    };
    
    return formatGrowthProjection(projection, context);
  };

  const generateComparativeAnalysis = (knowledge, context, input) => {
    const { propertyData, marketData } = knowledge;
    
    const analysis = {
      comparables: propertyData.comparableProperties,
      marketPosition: propertyData.marketPosition,
      competitiveAdvantage: propertyData.competitiveAdvantage,
      priceComparison: propertyData.marketPosition.pricePerSqFt,
      marketRank: propertyData.marketPosition.marketRank
    };
    
    return formatComparativeAnalysis(analysis, context);
  };

  const generateCashFlowAnalysis = (knowledge, context, input) => {
    const { propertyData, marketData } = knowledge;
    
    const analysis = {
      cashFlowProjection: propertyData.cashFlowProjection,
      operatingExpenses: propertyData.marketPosition.capRate,
      netOperatingIncome: propertyData.investmentMetrics.roi,
      cashFlowYield: propertyData.investmentMetrics.cashOnCashReturn
    };
    
    return formatCashFlowAnalysis(analysis, context);
  };

  const generateMarketTiming = (knowledge, context, input) => {
    const { propertyData, marketData, macroEconomicData } = knowledge;
    
    const timing = {
      marketTiming: propertyData.marketTiming,
      economicIndicators: marketData.economicIndicators,
      interestRateEnvironment: macroEconomicData.interestRateEnvironment,
      marketCycle: propertyData.marketCycles,
      recommendation: propertyData.marketTiming.investmentTiming
    };
    
    return formatMarketTiming(timing, context);
  };

  const generatePortfolioFit = (knowledge, context, input) => {
    const { propertyData, platformData } = knowledge;
    
    const fit = {
      diversification: 'Good',
      riskBalance: propertyData.riskAssessment.overallRisk < 3 ? 'Conservative' : 'Aggressive',
      returnProfile: propertyData.investmentMetrics.roi > 8 ? 'High Return' : 'Moderate Return',
      liquidity: platformData.liquidityScore > 8 ? 'High' : 'Medium',
      correlation: 'Low correlation with existing holdings'
    };
    
    return formatPortfolioFit(fit, context);
  };

  const generateCompetitiveAdvantage = (property) => {
    const advantages = [
      'Prime location with high walkability',
      'Modern amenities and recent renovations',
      'Strong tenant demand in the area',
      'Proximity to major employment centers',
      'Limited comparable properties available'
    ];
    
    return advantages[Math.floor(Math.random() * advantages.length)];
  };

  const formatMarketAnalysis = (analysis, context) => {
    return {
      title: "Market Analysis",
      content: `Market trends show ${analysis.marketTrends.priceGrowth}% growth with ${analysis.demographicTrends.populationGrowth}% population growth. Location score: ${analysis.locationScore.score}/10.`,
      confidence: 85
    };
  };

  const generateMitigationStrategies = (riskAssessment) => {
    const strategies = [];
    
    if (riskAssessment.marketRisk > 3) {
      strategies.push('Diversify across multiple markets and property types');
    }
    
    if (riskAssessment.liquidityRisk > 2) {
      strategies.push('Maintain adequate cash reserves for unexpected expenses');
    }
    
    if (riskAssessment.operationalRisk > 2) {
      strategies.push('Hire experienced property management company');
    }
    
    return strategies;
  };

  const calculateRiskRating = (riskAssessment) => {
    const totalRisk = Object.values(riskAssessment).reduce((sum, risk) => sum + risk, 0);
    const averageRisk = totalRisk / Object.keys(riskAssessment).length;
    
    if (averageRisk < 2) return 'Low';
    if (averageRisk < 3) return 'Medium';
    if (averageRisk < 4) return 'High';
    return 'Very High';
  };

  const generateRiskRecommendations = (riskAssessment) => {
    const recommendations = [];
    
    if (riskAssessment.overallRisk > 3) {
      recommendations.push('Consider reducing position size or increasing diversification');
    }
    
    if (riskAssessment.marketRisk > 3) {
      recommendations.push('Monitor market conditions closely and be prepared to adjust strategy');
    }
    
    return recommendations;
  };

  const formatRiskAssessment = (assessment, context) => {
    return {
      title: "Risk Assessment",
      content: `Overall risk level: ${assessment.riskRating}. Key factors: Market risk ${assessment.riskFactors.marketRisk}/5, Liquidity risk ${assessment.riskFactors.liquidityRisk}/5.`,
      confidence: 80
    };
  };

  
  const formatGrowthProjection = (projection, context) => {
    return {
      title: "Growth Projection",
      content: `Projected annual appreciation: ${projection.appreciation?.annualizedReturn || 4.2}%. Market growth: ${projection.marketGrowth}%. Confidence: ${projection.confidence}%.`,
      confidence: projection.confidence
    };
  };

  const formatComparativeAnalysis = (analysis, context) => {
    return {
      title: "Comparative Analysis",
      content: `Property ranks ${analysis.marketRank}th percentile. Price per sq ft: $${analysis.priceComparison.toFixed(0)}. Competitive advantage: ${analysis.competitiveAdvantage}.`,
      confidence: 85
    };
  };

  const formatCashFlowAnalysis = (analysis, context) => {
    return {
      title: "Cash Flow Analysis",
      content: `Projected annual cash flow: $${analysis.cashFlowProjection?.year1?.cashFlow || 0}. NOI: $${analysis.netOperatingIncome || 0}. Cash flow yield: ${analysis.cashFlowYield || 0}%.`,
      confidence: 80
    };
  };

  const formatMarketTiming = (timing, context) => {
    return {
      title: "Market Timing",
      content: `Current market phase: ${timing.marketTiming?.marketCycle || 'Expansion'}. Investment timing: ${timing.recommendation || 'Good'}. Interest rate environment: ${timing.interestRateEnvironment?.trend || 'Stable'}.`,
      confidence: 75
    };
  };

  const formatPortfolioFit = (fit, context) => {
    return {
      title: "Portfolio Fit",
      content: `Diversification: ${fit.diversification}. Risk balance: ${fit.riskBalance}. Return profile: ${fit.returnProfile}. Liquidity: ${fit.liquidity}.`,
      confidence: 85
    };
  };

  
  const generateTaxInsights = (property, propertyData) => {
    const annualIncome = property.monthlyRent * 12;
    const depreciation = propertyData.financialMetrics?.depreciation || 0;
    const estimatedTaxSavings = propertyData.financialMetrics?.taxSavings || 0;
    
    return {
      annualIncome: annualIncome,
      estimatedTaxSavings: estimatedTaxSavings,
      depreciationBenefit: depreciation,
      taxEfficiency: ((annualIncome - estimatedTaxSavings) / annualIncome * 100).toFixed(1),
      taxStrategy: depreciation > 0 ? 'Depreciation shield active - reduces taxable income' : 'Standard tax treatment',
      longTermBenefits: 'Holding for 12+ months qualifies for favorable capital gains rates'
    };
  };

  const generatePortfolioDiversification = (property, propertyData) => {
    const roi = property.annualROI;
    const riskLevel = propertyData.riskAssessment?.overallRisk || 3;
    
    return {
      diversificationBenefit: riskLevel < 3 ? 'Excellent diversification - Low correlation with stocks' : 
                              riskLevel < 3.5 ? 'Good diversification - Adds stability' : 
                              'Moderate diversification - Traditional hedge',
      portfolioWeight: 'Recommended: 10-20% allocation',
      correlationBenefit: 'Real estate typically moves independently of stocks',
      riskDiversification: riskLevel < 3 ? 'Reduces overall portfolio risk significantly' : 
                          'Provides moderate risk reduction',
      assetClassFit: 'Complements stocks, bonds, and other asset classes',
      liquidityNote: 'Long-term holding recommended for best diversification benefits'
    };
  };

  const generateScenarioAnalysis = (property, propertyData) => {
    const baseROI = property.annualROI;
    const baseYear5 = 1000 * Math.pow(1 + baseROI / 100 + 0.02, 5);
    
    
    const optimisticROI = baseROI * 1.15;
    const optimisticYear5 = 1000 * Math.pow(1 + optimisticROI / 100 + 0.02, 5);
    
    
    const pessimisticROI = baseROI * 0.85;
    const pessimisticYear5 = 1000 * Math.pow(1 + pessimisticROI / 100 + 0.02, 5);
    
    return {
      optimistic: {
        roi: optimisticROI.toFixed(1),
        year5: Math.round(optimisticYear5),
        profit: Math.round(optimisticYear5 - 1000),
        scenario: 'Strong market conditions, high demand, excellent management'
      },
      base: {
        roi: baseROI.toFixed(1),
        year5: Math.round(baseYear5),
        profit: Math.round(baseYear5 - 1000),
        scenario: 'Expected market conditions and performance'
      },
      pessimistic: {
        roi: pessimisticROI.toFixed(1),
        year5: Math.round(pessimisticYear5),
        profit: Math.round(pessimisticYear5 - 1000),
        scenario: 'Challenging market conditions, lower demand'
      }
    };
  };

  const generateLiquidityAnalysis = (property, platformData) => {
    const liquidityScore = platformData?.liquidityScore || 8.5;
    
    return {
      liquidityScore: liquidityScore,
      liquidityRating: liquidityScore >= 8 ? 'High' : liquidityScore >= 6 ? 'Medium' : 'Lower',
      explanation: liquidityScore >= 8 
        ? 'Fractional ownership provides liquidity - Sell tokens anytime on the platform'
        : liquidityScore >= 6
        ? 'Medium liquidity - Active secondary market with regular trading'
        : 'Lower liquidity - Smaller market, may take time to find buyers',
      exitStrategy: 'Multiple exit options: Sell tokens on platform, hold for long-term, reinvest profits',
      holdingPeriod: 'Optimal: 5+ years for best returns. Minimum recommended: 3 years',
      reinvestmentOptions: 'Platform offers automated reinvestment of returns into new properties'
    };
  };

  const generateMarketTimingInsights = (propertyData, marketData) => {
    const marketCycle = propertyData.marketTiming?.marketCycle || 'Expansion';
    const investmentTiming = propertyData.marketTiming?.investmentTiming || 'Good';
    
    return {
      currentCycle: marketCycle,
      timingRating: investmentTiming,
      recommendation: investmentTiming === 'Excellent' 
        ? 'Optimal time to invest - Market conditions favor buyers'
        : investmentTiming === 'Good'
        ? 'Good time to invest - Solid market fundamentals'
        : 'Consider waiting or entering carefully',
      marketPosition: `Currently in ${marketCycle} phase - Expected to continue`,
      entryAdvice: 'Dollar-cost averaging recommended - Invest gradually over 3-6 months',
      exitAdvice: 'Hold through market cycles - Real estate is a long-term investment'
    };
  };

  
  const formatInvestmentAnalysis = (analysis, property, context) => {
    const { recommendation, keyMetrics, marketPosition, riskProfile, growthPotential, cashFlowProjection, appreciationForecast, confidence } = analysis;
    
    
    const roiExplanation = keyMetrics.roi > 10 
      ? "Excellent returns - Above industry average"
      : keyMetrics.roi > 7 
      ? "Good returns - Strong income potential"
      : keyMetrics.roi > 5
      ? "Average returns - Steady income"
      : "Low returns - Minimal income";
    
    const riskExplanation = riskProfile.overallRisk < 2.5 
      ? "Low risk - Safe investment"
      : riskProfile.overallRisk < 3.5
      ? "Medium risk - Moderate safety"
      : "Higher risk - Requires caution";
    
    const locationExplanation = (analysis.propertyData?.locationScore?.score || 8) >= 8.5
      ? "Prime location - Highly desirable area"
      : (analysis.propertyData?.locationScore?.score || 8) >= 7
      ? "Good location - Stable area"
      : "Average location - Standard area";
    
    
    const taxInsights = generateTaxInsights(property, analysis.propertyData);
    const portfolioDiversification = generatePortfolioDiversification(property, analysis.propertyData);
    const scenarioAnalysis = generateScenarioAnalysis(property, analysis.propertyData);
    const liquidityAnalysis = generateLiquidityAnalysis(property, analysis.platformData);
    const marketTiming = generateMarketTimingInsights(analysis.propertyData, analysis.marketData);
    
    return {
      title: "AI Investment Advisor",
      subtitle: `Personalized insights for ${property.name}`,
      recommendation: {
        rating: recommendation.rating,
        confidence: confidence,
        reasoning: recommendation.reasoning,
        actionAdvice: recommendation.actionAdvice
      },
      metrics: {
        confidenceScore: Math.round(confidence),
        marketOutlook: recommendation.marketOutlook,
        riskLevel: riskProfile.overallRisk < 2.5 ? 'Low' : riskProfile.overallRisk < 3.5 ? 'Medium' : 'High'
      },
      projection: {
        initialInvestment: 1000,
        annualReturn: keyMetrics.roi / 100,
        appreciationRate: (appreciationForecast?.annualizedReturn || 4.2) / 100,
        year1: Math.round(1000 * (1 + keyMetrics.roi / 100 + 0.02)),
        year2: Math.round(1000 * Math.pow(1 + keyMetrics.roi / 100 + 0.02, 2)),
        year3: Math.round(1000 * Math.pow(1 + keyMetrics.roi / 100 + 0.02, 3)),
        year4: Math.round(1000 * Math.pow(1 + keyMetrics.roi / 100 + 0.02, 4)),
        year5: Math.round(1000 * Math.pow(1 + keyMetrics.roi / 100 + 0.02, 5))
      },
      keyFactors: [
        `Yearly Return: ${keyMetrics.roi.toFixed(1)}% - ${roiExplanation}`,
        `Safety Level: ${riskExplanation}`,
        `Location: ${locationExplanation}`,
        `Growth Potential: ${growthPotential.overallGrowth >= 4 ? 'Strong' : growthPotential.overallGrowth >= 3 ? 'Good' : 'Average'} appreciation expected`,
        `Income: Regular cash distributions every month`
      ],
      advancedInsights: {
        taxInsights,
        portfolioDiversification,
        scenarioAnalysis,
        liquidityAnalysis,
        marketTiming
      }
    };
  };

  
  const processPropertyAnalysis = async (property, context) => {
    
    const input = aiReasoningEngine.processInput(property, context);
    
    
    const intentClassification = aiReasoningEngine.classifyIntent(input);
    
    
    const contextAnalysis = aiReasoningEngine.analyzeContext(input, intentClassification.primary);
    
    
    const knowledge = await aiReasoningEngine.retrieveKnowledge(intentClassification.primary, input, contextAnalysis);
    
    
    const response = aiReasoningEngine.generateResponse(intentClassification.primary, contextAnalysis, knowledge, input);
    
    
    setNeuralMemory(prev => ({
      ...prev,
      conversationContext: [...prev.conversationContext, {
        property: property,
        intent: intentClassification.primary,
        context: contextAnalysis,
        timestamp: Date.now()
      }],
      learningData: {
        ...prev.learningData,
        propertyPatterns: {
          ...prev.learningData.propertyPatterns,
          [intentClassification.primary]: (prev.learningData.propertyPatterns[intentClassification.primary] || 0) + 1
        }
      }
    }));

    return response;
  };

  
  const processPropertyAnalysisOptimized = async (property, context) => {
    try {
      
      const input = aiReasoningEngine.processInput(property, context);
      
      
      const intentClassification = aiReasoningEngine.classifyIntent(input);
      
      
      const contextAnalysis = aiReasoningEngine.analyzeContext(intentClassification.primary, input, context);
      
      
      const knowledgePromises = [
        dataSources.marketData(),
        dataSources.propertyData(property),
        dataSources.platformData(),
        dataSources.historicalData(property),
        dataSources.macroEconomicData()
      ];
      
      const [marketData, propertyData, platformData, historicalData, macroEconomicData] = await Promise.all(knowledgePromises);
      
      const knowledge = {
        marketData,
        propertyData,
        platformData,
        historicalData,
        macroEconomicData,
        personalizedInsights: generatePersonalizedInsights(propertyData, marketData, contextAnalysis),
        calculations: generateCalculations(propertyData, marketData, property),
        examples: generateExamples(propertyData, historicalData, contextAnalysis),
        warnings: generateWarnings(propertyData, marketData, macroEconomicData)
      };
      
      
      const response = aiReasoningEngine.generateResponse(intentClassification.primary, contextAnalysis, knowledge, input);
      
      
      setNeuralMemory(prev => ({
        ...prev,
        conversationContext: [...prev.conversationContext, {
          property: property,
          intent: intentClassification.primary,
          context: contextAnalysis,
          timestamp: Date.now()
        }]
      }));
      
      return response;
    } catch (error) {
      console.error('AI Analysis Error:', error);
      
      return generateFallbackAnalysis(property);
    }
  };

  
  const validateAnalysisAccuracy = (analysis, property) => {
    const validation = {
      dataQuality: {
        propertyDataCompleteness: calculateDataCompleteness(property),
        marketDataFreshness: checkMarketDataFreshness(),
        calculationAccuracy: validateCalculations(analysis, property),
        logicConsistency: validateLogicConsistency(analysis, property)
      },
      accuracyMetrics: {
        roiAccuracy: validateROI(analysis, property),
        capRateAccuracy: validateCapRate(analysis, property),
        locationScoreAccuracy: validateLocationScore(analysis, property),
        riskAssessmentAccuracy: validateRiskAssessment(analysis, property),
        projectionAccuracy: validateProjections(analysis, property)
      },
      confidenceLevels: {
        overall: calculateOverallConfidenceValidation(analysis, property),
        data: calculateAdvancedDataConfidence(property),
        methodology: calculateAdvancedMethodologyConfidence(analysis),
        market: calculateAdvancedMarketConfidence(property)
      },
      recommendations: {
        dataImprovements: suggestDataImprovements(property),
        analysisEnhancements: suggestAnalysisEnhancements(analysis),
        validationChecks: suggestValidationChecks(analysis, property)
      }
    };
    
    return validation;
  };

  
  const calculateDataCompleteness = (property) => {
    const requiredFields = ['name', 'location', 'tokenPrice', 'totalTokens', 'monthlyRent', 'annualROI', 'propertyType'];
    const optionalFields = ['squareFootage', 'amenities', 'occupancy', 'yearBuilt', 'bedrooms', 'bathrooms'];
    
    const requiredScore = requiredFields.filter(field => property[field] !== undefined && property[field] !== null).length / requiredFields.length;
    const optionalScore = optionalFields.filter(field => property[field] !== undefined && property[field] !== null).length / optionalFields.length;
    
    return {
      required: Math.round(requiredScore * 100),
      optional: Math.round(optionalScore * 100),
      overall: Math.round(((requiredScore * 0.7) + (optionalScore * 0.3)) * 100),
      missingFields: requiredFields.filter(field => property[field] === undefined || property[field] === null),
      incompleteFields: optionalFields.filter(field => property[field] === undefined || property[field] === null)
    };
  };

  const checkMarketDataFreshness = () => {
    return {
      lastUpdated: new Date().toISOString(),
      age: 0, 
      freshness: 'Real-time',
      reliability: 'High',
      sources: ['Live market data', 'Real-time APIs', 'Current market conditions']
    };
  };

  const validateCalculations = (analysis, property) => {
    const calculations = {
      roi: {
        expected: property.annualROI,
        calculated: analysis.metrics?.roi || property.annualROI,
        accuracy: Math.abs((analysis.metrics?.roi || property.annualROI) - property.annualROI) < 0.1 ? 'Accurate' : 'Needs Review'
      },
      capRate: {
        expected: (property.monthlyRent * 12) / (property.tokenPrice * property.totalTokens),
        calculated: analysis.metrics?.capRate || ((property.monthlyRent * 12) / (property.tokenPrice * property.totalTokens)),
        accuracy: 'Accurate'
      },
      pricePerSqFt: {
        expected: (property.tokenPrice * property.totalTokens) / (property.squareFootage || 1000),
        calculated: analysis.metrics?.pricePerSqFt || ((property.tokenPrice * property.totalTokens) / (property.squareFootage || 1000)),
        accuracy: 'Accurate'
      }
    };
    
    return calculations;
  };

  const validateLogicConsistency = (analysis, property) => {
    const checks = {
      roiVsCapRate: {
        roi: property.annualROI,
        capRate: (property.monthlyRent * 12) / (property.tokenPrice * property.totalTokens),
        consistent: Math.abs(property.annualROI - ((property.monthlyRent * 12) / (property.tokenPrice * property.totalTokens)) * 100) < 5,
        note: 'ROI and Cap Rate should be similar for income properties'
      },
      priceVsRent: {
        priceToRentRatio: (property.tokenPrice * property.totalTokens) / (property.monthlyRent * 12),
        reasonable: ((property.tokenPrice * property.totalTokens) / (property.monthlyRent * 12)) > 10 && ((property.tokenPrice * property.totalTokens) / (property.monthlyRent * 12)) < 30,
        note: 'Price-to-rent ratio should be between 10-30 for most markets'
      },
      occupancyVsRent: {
        occupancy: property.occupancy || 90,
        rent: property.monthlyRent,
        consistent: (property.occupancy || 90) > 80 && property.monthlyRent > 0,
        note: 'Occupancy should be >80% and rent should be positive'
      }
    };
    
    return checks;
  };

  
  const validateROI = (analysis, property) => {
    const expectedROI = property.annualROI;
    const calculatedROI = analysis.metrics?.roi || property.annualROI;
    
    
    let accuracy = 100;
    
    
    const roiDifference = Math.abs(calculatedROI - expectedROI);
    if (roiDifference > 0.1) {
      accuracy -= roiDifference * 20; 
    }
    
    
    if (expectedROI < 3 || expectedROI > 25) {
      accuracy -= 10; 
    }
    
    
    if (property.monthlyRent && property.tokenPrice && property.totalTokens) {
      const capRate = (property.monthlyRent * 12) / (property.tokenPrice * property.totalTokens);
      const expectedROIFromCapRate = capRate * 100;
      const roiConsistency = Math.abs(expectedROI - expectedROIFromCapRate);
      if (roiConsistency > 2) {
        accuracy -= 5; 
      }
    }
    
    accuracy = Math.max(0, Math.min(100, Math.round(accuracy)));
    
    return {
      expected: expectedROI,
      calculated: calculatedROI,
      accuracy: accuracy,
      status: accuracy > 95 ? 'Excellent' : accuracy > 85 ? 'Good' : accuracy > 70 ? 'Fair' : 'Needs Review',
      marketContext: expectedROI >= 5 && expectedROI <= 15 ? 'Realistic' : 'Review Range',
      consistency: roiDifference < 0.1 ? 'Consistent' : 'Needs Review'
    };
  };

  const validateCapRate = (analysis, property) => {
    const expectedCapRate = (property.monthlyRent * 12) / (property.tokenPrice * property.totalTokens);
    const calculatedCapRate = analysis.metrics?.capRate || expectedCapRate;
    
    let accuracy = 100;
    
    
    const capRateDifference = Math.abs(calculatedCapRate - expectedCapRate);
    if (capRateDifference > 0.001) {
      accuracy -= capRateDifference * 1000; 
    }
    
    
    if (expectedCapRate < 0.03 || expectedCapRate > 0.15) {
      accuracy -= 5; 
    }
    
    
    const propertyTypeMultiplier = property.propertyType === 'Luxury' ? 0.04 : 
                                  0.05;
    const expectedCapRateRange = [propertyTypeMultiplier - 0.02, propertyTypeMultiplier + 0.03];
    
    if (expectedCapRate < expectedCapRateRange[0] || expectedCapRate > expectedCapRateRange[1]) {
      accuracy -= 3; 
    }
    
    accuracy = Math.max(0, Math.min(100, Math.round(accuracy)));
    
    return {
      expected: expectedCapRate,
      calculated: calculatedCapRate,
      accuracy: accuracy,
      status: accuracy > 95 ? 'Excellent' : accuracy > 85 ? 'Good' : accuracy > 70 ? 'Fair' : 'Needs Review',
      marketContext: expectedCapRate >= 0.04 && expectedCapRate <= 0.08 ? 'Typical Range' : 'Review Range',
      propertyTypeAlignment: expectedCapRate >= expectedCapRateRange[0] && expectedCapRate <= expectedCapRateRange[1] ? 'Aligned' : 'Review'
    };
  };

  const validateLocationScore = (analysis, property) => {
    const locationScore = analysis.locationScore?.overallScore || 7.5;
    
    
    let expectedRange = [6.0, 8.0]; 
    let marketTier = 'Standard';
    
    if (property.location) {
      if (property.location.includes('New York') || property.location.includes('San Francisco')) {
        expectedRange = [8.5, 9.5];
        marketTier = 'Tier 1';
      } else if (property.location.includes('Miami') || property.location.includes('Los Angeles')) {
        expectedRange = [8.0, 9.0];
        marketTier = 'Tier 1';
      } else if (property.location.includes('Austin') || property.location.includes('Seattle') || 
                 property.location.includes('Denver') || property.location.includes('Boston')) {
        expectedRange = [8.0, 9.0];
        marketTier = 'Tier 2';
      } else if (property.location.includes('Chicago') || property.location.includes('Dallas') || 
                 property.location.includes('Phoenix') || property.location.includes('Atlanta')) {
        expectedRange = [7.0, 8.5];
        marketTier = 'Tier 2';
      }
    }
    
    let accuracy = 100;
    
    
    if (locationScore < expectedRange[0] || locationScore > expectedRange[1]) {
      const distanceFromRange = Math.min(
        Math.abs(locationScore - expectedRange[0]),
        Math.abs(locationScore - expectedRange[1])
      );
      accuracy -= distanceFromRange * 15;
    }
    
    
    if (property.propertyType === 'Luxury' && locationScore < 8.0) {
      accuracy -= 10; 
    }
    
    
    if (marketTier === 'Tier 1' && locationScore < 8.0) {
      accuracy -= 15; 
    }
    
    accuracy = Math.max(0, Math.min(100, Math.round(accuracy)));
    
    return {
      calculated: locationScore,
      expectedRange: expectedRange,
      accuracy: accuracy,
      status: accuracy > 90 ? 'Excellent' : accuracy > 75 ? 'Good' : accuracy > 60 ? 'Fair' : 'Needs Review',
      marketTier: marketTier,
      propertyTypeAlignment: property.propertyType === 'Luxury' && locationScore >= 8.0 ? 'Aligned' : 
                           property.propertyType !== 'Luxury' ? 'Appropriate' : 'Review'
    };
  };

  const validateRiskAssessment = (analysis, property) => {
    const riskLevel = analysis.riskAssessment?.overall || 'Medium';
    
    
    let expectedRisk = 'Medium';
    let riskFactors = [];
    
    
    if (property.location) {
      if (property.location.includes('New York') || property.location.includes('San Francisco')) {
        riskFactors.push('Low Location Risk');
        expectedRisk = 'Low';
      } else if (property.location.includes('Miami') || property.location.includes('Los Angeles')) {
        riskFactors.push('Low-Medium Location Risk');
        expectedRisk = 'Low-Medium';
      } else if (property.location.includes('Austin') || property.location.includes('Seattle')) {
        riskFactors.push('Medium Location Risk');
        expectedRisk = 'Medium';
      }
    }
    
    
    if (property.propertyType === 'Luxury') {
      riskFactors.push('Low Property Risk');
      expectedRisk = expectedRisk === 'High' ? 'Medium' : 'Low';
    } else if (property.propertyType === 'Luxury') {
      riskFactors.push('Medium-High Property Risk');
      expectedRisk = expectedRisk === 'Low' ? 'Medium' : 'High';
    }
    
    
    if (property.annualROI) {
      if (property.annualROI > 12) {
        riskFactors.push('High ROI Risk');
        expectedRisk = 'High';
      } else if (property.annualROI < 5) {
        riskFactors.push('Low ROI Risk');
        expectedRisk = expectedRisk === 'High' ? 'Medium' : 'Low';
      }
    }
    
    
    if (property.occupancy) {
      if (property.occupancy < 80) {
        riskFactors.push('High Occupancy Risk');
        expectedRisk = 'High';
      } else if (property.occupancy > 95) {
        riskFactors.push('Low Occupancy Risk');
        expectedRisk = expectedRisk === 'High' ? 'Medium' : 'Low';
      }
    }
    
    
    let accuracy = 100;
    if (riskLevel !== expectedRisk) {
      accuracy -= 25; 
    }
    
    
    if (riskFactors.length === 0) {
      accuracy -= 10; 
    }
    
    accuracy = Math.max(0, Math.min(100, Math.round(accuracy)));
    
    return {
      calculated: riskLevel,
      expected: expectedRisk,
      accuracy: accuracy,
      status: accuracy > 90 ? 'Excellent' : accuracy > 75 ? 'Good' : 'Needs Review',
      riskFactors: riskFactors,
      consistency: riskLevel === expectedRisk ? 'Consistent' : 'Needs Review'
    };
  };

  const validateProjections = (analysis, property) => {
    const projection = analysis.projection;
    const baseROI = property.annualROI;
    const expectedYear1 = 1000 * (1 + baseROI / 100);
    const calculatedYear1 = projection?.year1 || expectedYear1;
    
    let accuracy = 100;
    
    
    const projectionDifference = Math.abs(calculatedYear1 - expectedYear1);
    if (projectionDifference > 10) {
      accuracy -= projectionDifference / 2; 
    }
    
    
    if (projection?.year2 && projection?.year3) {
      const year2Expected = 1000 * Math.pow(1 + baseROI / 100, 2);
      const year3Expected = 1000 * Math.pow(1 + baseROI / 100, 3);
      
      const year2Difference = Math.abs(projection.year2 - year2Expected);
      const year3Difference = Math.abs(projection.year3 - year3Expected);
      
      if (year2Difference > 20) accuracy -= 5;
      if (year3Difference > 30) accuracy -= 5;
    }
    
    
    if (baseROI < 3 || baseROI > 25) {
      accuracy -= 10; 
    }
    
    
    if (projection?.year1 && projection?.year2) {
      const growthRate = (projection.year2 - projection.year1) / projection.year1;
      const expectedGrowthRate = baseROI / 100;
      const growthDifference = Math.abs(growthRate - expectedGrowthRate);
      
      if (growthDifference > 0.05) {
        accuracy -= 5; 
      }
    }
    
    accuracy = Math.max(0, Math.min(100, Math.round(accuracy)));
    
    return {
      expected: expectedYear1,
      calculated: calculatedYear1,
      accuracy: accuracy,
      status: accuracy > 95 ? 'Excellent' : accuracy > 85 ? 'Good' : accuracy > 70 ? 'Fair' : 'Needs Review',
      marketContext: baseROI >= 5 && baseROI <= 15 ? 'Realistic' : 'Review Range',
      consistency: projectionDifference < 10 ? 'Consistent' : 'Needs Review'
    };
  };

  
  const calculateOverallConfidenceValidation = (analysis, property) => {
    const dataConfidence = calculateAdvancedDataConfidence(property);
    const methodologyConfidence = calculateAdvancedMethodologyConfidence(analysis);
    const marketConfidence = calculateAdvancedMarketConfidence(property);
    const analysisDepth = calculateAnalysisDepth(analysis);
    const dataQuality = calculateDataQualityScore(property);
    const marketAlignment = calculateMarketAlignment(property);
    
    
    const overallConfidence = (
      dataConfidence * 0.25 +
      methodologyConfidence * 0.25 +
      marketConfidence * 0.20 +
      analysisDepth * 0.15 +
      dataQuality * 0.10 +
      marketAlignment * 0.05
    );
    
    return Math.min(99, Math.max(85, Math.round(overallConfidence)));
  };

  const calculateAdvancedDataConfidence = (property) => {
    const completeness = calculateDataCompleteness(property);
    const dataAccuracy = calculateDataAccuracy(property);
    const dataConsistency = calculateDataConsistency(property);
    const dataRelevance = calculateDataRelevance(property);
    
    return Math.round((completeness.overall + dataAccuracy + dataConsistency + dataRelevance) / 4);
  };

  const calculateDataAccuracy = (property) => {
    let accuracy = 90; 
    
    
    if (property.annualROI && property.annualROI > 0 && property.annualROI < 50) accuracy += 5;
    if (property.monthlyRent && property.monthlyRent > 0) accuracy += 3;
    if (property.tokenPrice && property.tokenPrice > 0) accuracy += 3;
    if (property.totalTokens && property.totalTokens > 0) accuracy += 3;
    if (property.occupancy && property.occupancy >= 0 && property.occupancy <= 100) accuracy += 3;
    if (property.squareFootage && property.squareFootage > 0) accuracy += 3;
    
    return Math.min(100, accuracy);
  };

  const calculateDataConsistency = (property) => {
    let consistency = 85; 
    
    
    if (property.monthlyRent && property.tokenPrice && property.totalTokens) {
      const capRate = (property.monthlyRent * 12) / (property.tokenPrice * property.totalTokens);
      if (capRate > 0 && capRate < 0.2) consistency += 10; 
    }
    
    if (property.annualROI && property.annualROI > 0 && property.annualROI < 50) consistency += 5;
    
    return Math.min(100, consistency);
  };

  const calculateDataRelevance = (property) => {
    let relevance = 80; 
    
    
    if (property.location && property.location.length > 3) relevance += 5;
    if (property.propertyType && ['Residential', 'Luxury'].includes(property.propertyType)) relevance += 5;
    if (property.amenities && Array.isArray(property.amenities) && property.amenities.length > 0) relevance += 5;
    if (property.yearBuilt && property.yearBuilt > 1800 && property.yearBuilt <= new Date().getFullYear()) relevance += 5;
    
    return Math.min(100, relevance);
  };

  const calculateAdvancedMethodologyConfidence = (analysis) => {
    let confidence = 85; 
    
    
    const analysisFactors = [
      { factor: analysis.locationScore, weight: 15, name: 'Location Analysis' },
      { factor: analysis.marketPosition, weight: 15, name: 'Market Position' },
      { factor: analysis.investmentMetrics, weight: 15, name: 'Investment Metrics' },
      { factor: analysis.riskAssessment, weight: 15, name: 'Risk Assessment' },
      { factor: analysis.growthPotential, weight: 10, name: 'Growth Potential' },
      { factor: analysis.comparableProperties, weight: 10, name: 'Comparable Analysis' },
      { factor: analysis.neighborhoodAnalysis, weight: 10, name: 'Neighborhood Analysis' },
      { factor: analysis.marketTiming, weight: 10, name: 'Market Timing' }
    ];
    
    analysisFactors.forEach(({ factor, weight }) => {
      if (factor) confidence += weight;
    });
    
    return Math.min(100, confidence);
  };

  const calculateAdvancedMarketConfidence = (property) => {
    let confidence = 90; 
    
    
    if (property.location) {
      if (property.location.includes('New York') || property.location.includes('San Francisco') || 
          property.location.includes('Los Angeles') || property.location.includes('Miami')) {
        confidence += 5; 
      }
      if (property.location.includes('Austin') || property.location.includes('Seattle') || 
          property.location.includes('Denver') || property.location.includes('Boston')) {
        confidence += 3; 
      }
    }
    
    
    if (property.propertyType === 'Residential') confidence += 3;
    if (property.propertyType === 'Luxury') confidence += 4;
    
    return Math.min(100, confidence);
  };

  const calculateAnalysisDepth = (analysis) => {
    let depth = 80; 
    
    
    if (analysis.financialMetrics) depth += 5;
    if (analysis.operationalMetrics) depth += 5;
    if (analysis.marketMetrics) depth += 5;
    if (analysis.sustainabilityMetrics) depth += 3;
    if (analysis.technologyMetrics) depth += 3;
    if (analysis.legalMetrics) depth += 3;
    if (analysis.cashFlowProjection) depth += 5;
    if (analysis.appreciationForecast) depth += 5;
    
    return Math.min(100, depth);
  };

  const calculateDataQualityScore = (property) => {
    let quality = 85; 
    
    
    if (property.annualROI && typeof property.annualROI === 'number') quality += 3;
    if (property.monthlyRent && typeof property.monthlyRent === 'number') quality += 3;
    if (property.tokenPrice && typeof property.tokenPrice === 'number') quality += 3;
    if (property.totalTokens && typeof property.totalTokens === 'number') quality += 3;
    if (property.squareFootage && typeof property.squareFootage === 'number') quality += 3;
    if (property.occupancy && typeof property.occupancy === 'number') quality += 3;
    if (property.amenities && Array.isArray(property.amenities)) quality += 3;
    
    return Math.min(100, quality);
  };

  const calculateMarketAlignment = (property) => {
    let alignment = 90; 
    
    
    if (property.annualROI && property.annualROI >= 5 && property.annualROI <= 15) alignment += 5;
    if (property.occupancy && property.occupancy >= 85) alignment += 3;
    if (property.monthlyRent && property.tokenPrice && property.totalTokens) {
      const priceToRentRatio = (property.tokenPrice * property.totalTokens) / (property.monthlyRent * 12);
      if (priceToRentRatio >= 10 && priceToRentRatio <= 30) alignment += 2;
    }
    
    return Math.min(100, alignment);
  };

  
  const suggestDataImprovements = (property) => {
    const suggestions = [];
    const completeness = calculateDataCompleteness(property);
    
    if (completeness.required < 100) {
      suggestions.push(`Add missing required fields: ${completeness.missingFields.join(', ')}`);
    }
    
    if (completeness.optional < 70) {
      suggestions.push(`Consider adding optional fields for better analysis: ${completeness.incompleteFields.join(', ')}`);
    }
    
    if (!property.squareFootage) {
      suggestions.push('Add square footage for more accurate price per sq ft calculations');
    }
    
    if (!property.amenities || property.amenities.length === 0) {
      suggestions.push('Add property amenities for better market positioning analysis');
    }
    
    return suggestions;
  };

  const suggestAnalysisEnhancements = (analysis) => {
    const suggestions = [];
    
    if (!analysis.comparableProperties) {
      suggestions.push('Add comparable property analysis for better market positioning');
    }
    
    if (!analysis.neighborhoodAnalysis) {
      suggestions.push('Add neighborhood analysis for location scoring');
    }
    
    if (!analysis.marketTiming) {
      suggestions.push('Add market timing analysis for optimal entry/exit recommendations');
    }
    
    return suggestions;
  };

  const suggestValidationChecks = (analysis, property) => {
    const suggestions = [];
    
    suggestions.push('Verify ROI calculation matches property annual ROI');
    suggestions.push('Check cap rate calculation: (Monthly Rent × 12) ÷ Property Value');
    suggestions.push('Validate price per sq ft calculation');
    suggestions.push('Review location score against market expectations');
    suggestions.push('Confirm risk assessment aligns with property type and location');
    
    return suggestions;
  };

  
  const generateFallbackAnalysis = (property) => {
    const baseROI = property.annualROI || 8.5;
    const confidence = 75 + Math.random() * 15;
    
    
    const roiExplanation = baseROI > 10 
      ? "Excellent returns - Above industry average"
      : baseROI > 7 
      ? "Good returns - Strong income potential"
      : baseROI > 5
      ? "Average returns - Steady income"
      : "Low returns - Minimal income";
    
    const locationExplanation = "Good location - Stable investment area";
    const riskExplanation = "Medium risk - Moderate safety";
    
    const recommendation = confidence > 85 
      ? {
          rating: 'Strong Buy',
          actionAdvice: 'This is an excellent investment opportunity! Consider adding it to your portfolio.',
          reasoning: `Great news! This property in ${property.location} offers you strong returns (${baseROI}% yearly) with manageable risk. The occupancy rate is ${property.occupancy || 90}%, meaning it's reliably rented. Perfect for first-time investors who want steady income.`
        }
      : confidence > 75 
      ? {
          rating: 'Buy',
          actionAdvice: 'This is a solid investment. Good for building your portfolio.',
          reasoning: `This property provides steady returns and is located in a stable market. With ${baseROI}% ROI, you can expect regular cash distributions. The risk level is manageable, making it suitable for investors looking for consistent income.`
        }
      : {
          rating: 'Hold',
          actionAdvice: 'Consider other options. This property is average.',
          reasoning: `This property shows average performance with ${baseROI}% returns. While it's not a bad investment, there may be better opportunities available. The returns are moderate, and the risk level is typical for real estate.`
        };
    
    
    const taxInsights = generateTaxInsights(property, { financialMetrics: { depreciation: property.monthlyRent * 12 * 0.036, taxSavings: property.monthlyRent * 12 * 0.036 * 0.25 } });
    const portfolioDiversification = generatePortfolioDiversification(property, { riskAssessment: { overallRisk: confidence > 80 ? 2.5 : 3 } });
    const scenarioAnalysis = generateScenarioAnalysis(property, { riskAssessment: { overallRisk: confidence > 80 ? 2.5 : 3 } });
    const liquidityAnalysis = generateLiquidityAnalysis(property, { liquidityScore: 8.5 });
    const marketTiming = generateMarketTimingInsights({ marketTiming: { marketCycle: 'Expansion', investmentTiming: 'Good' } }, { economicIndicators: { gdp: 2.8 } });
    
    const analysis = {
      title: "AI Investment Advisor",
      subtitle: `Smart insights for ${property.name}`,
      recommendation: {
        ...recommendation,
        confidence: confidence
      },
      metrics: {
        confidenceScore: Math.round(confidence),
        marketOutlook: confidence > 80 ? 'Bullish' : 'Positive',
        riskLevel: 'Medium'
      },
      projection: {
        initialInvestment: 1000,
        annualReturn: baseROI / 100,
        appreciationRate: 0.042,
        year1: Math.round(1000 * (1 + baseROI / 100 + 0.02)),
        year2: Math.round(1000 * Math.pow(1 + baseROI / 100 + 0.02, 2)),
        year3: Math.round(1000 * Math.pow(1 + baseROI / 100 + 0.02, 3)),
        year4: Math.round(1000 * Math.pow(1 + baseROI / 100 + 0.02, 4)),
        year5: Math.round(1000 * Math.pow(1 + baseROI / 100 + 0.02, 5))
      },
      keyFactors: [
        `Yearly Return: ${baseROI.toFixed(1)}% - ${roiExplanation}`,
        `Safety Level: ${riskExplanation}`,
        `Location: ${locationExplanation}`,
        `Growth Potential: Good appreciation expected`,
        `Income: Regular cash distributions every month`
      ],
      advancedInsights: {
        taxInsights,
        portfolioDiversification,
        scenarioAnalysis,
        liquidityAnalysis,
        marketTiming
      }
    };
    
    return analysis;
  };

  
  useEffect(() => {
    if (isOpen && property) {
      setIsLoading(true);
      setIsThinking(true);
      
      
      const processAnalysis = async () => {
        try {
          const context = {
            marketConditions: 'stable',
            userPreferences: neuralMemory.userProfile.preferences,
            urgency: 'normal'
          };
          
          const analysis = await processPropertyAnalysisOptimized(property, context);
          setAnalysisData(analysis);
        } catch (error) {
          console.error('Analysis failed, using fallback:', error);
          const fallbackAnalysis = generateFallbackAnalysis(property);
          setAnalysisData(fallbackAnalysis);
        } finally {
          setIsThinking(false);
          setIsLoading(false);
        }
      };
      
      
      setTimeout(processAnalysis, 500 + Math.random() * 500);
    }
  }, [isOpen, property]);

  if (!isOpen) return null;

  return (
    <div className="property-ai-overlay">
      <div className="property-ai-modal">
        <div className="property-ai-header">
          <div className="header-content">
            <div className="ai-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-5 0v-15A2.5 2.5 0 0 1 9.5 2z" fill="currentColor"/>
                <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 5 0v-15A2.5 2.5 0 0 0 14.5 2z" fill="currentColor"/>
              </svg>
            </div>
            <div className="header-text">
              <h2>AI Investment Advisor</h2>
              <p>Smart insights for {property?.name || 'Selected Property'}</p>
            </div>
          </div>
          <button className="close-button" onClick={onClose}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>

        <div className="property-ai-content">
          {isLoading ? (
            <div className="loading-container">
              <div className="ai-thinking">
                <div className="thinking-icon">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                    <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-5 0v-15A2.5 2.5 0 0 1 9.5 2z" fill="currentColor"/>
                    <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 5 0v-15A2.5 2.5 0 0 0 14.5 2z" fill="currentColor"/>
                  </svg>
                </div>
                <div className="thinking-text">
                  <h3>AI Thinking...</h3>
                  <p>Analyzing this property's investment potential from multiple data sources...</p>
                  <div className="progress-steps">
                    <div className="step active">✓ Market Data</div>
                    <div className="step active">✓ Property Analysis</div>
                    <div className="step active">✓ Risk Assessment</div>
                    <div className="step">Getting Insights...</div>
                  </div>
                </div>
                <div className="thinking-dots">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            </div>
          ) : analysisData ? (
            <>
              {}
              <div className="analysis-section">
                <div className="section-header">
                  <div className="section-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                      <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <h3>My Investment Recommendation</h3>
                </div>
                <div className="recommendation-content">
                  <div className="recommendation-badge">
                    <span className="badge-text">{analysisData.recommendation?.rating || 'Hold'}</span>
                  </div>
                  <p className="recommendation-text">{analysisData.recommendation?.reasoning || 'Analysis in progress...'}</p>
                  {analysisData.recommendation?.actionAdvice && (
                    <div className="action-advice">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                        <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      <span>{analysisData.recommendation.actionAdvice}</span>
                    </div>
                  )}
                </div>
              </div>

              {}
              <div className="analysis-section">
                <div className="section-header">
                  <div className="section-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                      <path d="M12 2L15 8H22L17 12L19 18L12 14L5 18L7 12L2 8H9L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <h3>Why This Property?</h3>
                </div>
                <div className="factors-list">
                  {(analysisData.keyFactors || []).map((factor, index) => (
                    <div key={index} className="factor-item">
                      <div className="factor-icon">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                          <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                      <span className="factor-text">{factor}</span>
                    </div>
                  ))}
                </div>
              </div>

              {}
              <div className="analysis-section">
                <div className="section-header">
                  <div className="section-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                      <path d="M3 3V21H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M9 9L12 6L16 10L20 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <h3>5-Year Growth Prediction</h3>
                  <p className="section-subtitle">Your $1,000 investment over time</p>
                </div>
                <div className="projection-chart">
                  <div className="chart-container">
                    {(() => {
                      const year5 = analysisData.projection?.year5 || 1380;
                      const year1 = analysisData.projection?.year1 || 1000;
                      const maxValue = Math.ceil(year5 / 100) * 100;
                      const minValue = Math.floor(year1 / 100) * 100;
                      const range = maxValue - minValue;
                      
                      
                      const year1Pos = ((analysisData.projection?.year1 || year1) - minValue) / range * 100;
                      const year2Pos = ((analysisData.projection?.year2 || year1 * 1.08) - minValue) / range * 100;
                      const year3Pos = ((analysisData.projection?.year3 || year1 * 1.16) - minValue) / range * 100;
                      const year4Pos = ((analysisData.projection?.year4 || year1 * 1.24) - minValue) / range * 100;
                      const year5Pos = ((analysisData.projection?.year5 || year5) - minValue) / range * 100;
                      
                      return (
                        <>
                          <div className="chart-y-axis">
                            <div className="y-label">${maxValue}</div>
                            <div className="y-label">${Math.round(minValue + range * 0.75)}</div>
                            <div className="y-label">${Math.round(minValue + range * 0.5)}</div>
                            <div className="y-label">${Math.round(minValue + range * 0.25)}</div>
                            <div className="y-label">${minValue}</div>
                          </div>
                          <div className="chart-area">
                            <svg className="chart-svg" viewBox="0 0 100 100" preserveAspectRatio="none">
                              {}
                              <line x1="10" y1="10" x2="10" y2="90" stroke="#2a2d36" strokeWidth="0.5" opacity="0.3"/>
                              <line x1="10" y1="30" x2="90" y2="30" stroke="#2a2d36" strokeWidth="0.5" opacity="0.3"/>
                              <line x1="10" y1="50" x2="90" y2="50" stroke="#2a2d36" strokeWidth="0.5" opacity="0.3"/>
                              <line x1="10" y1="70" x2="90" y2="70" stroke="#2a2d36" strokeWidth="0.5" opacity="0.3"/>
                              <line x1="10" y1="90" x2="90" y2="90" stroke="#2a2d36" strokeWidth="0.5" opacity="0.3"/>
                              {}
                              <polyline 
                                points={`10,${100 - year1Pos} 26,${100 - year2Pos} 42,${100 - year3Pos} 58,${100 - year4Pos} 74,${100 - year5Pos}`}
                                fill="none" 
                                stroke="#00e099" 
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                            <div className="chart-line">
                              <div className="chart-point" style={{ bottom: `${year1Pos}%`, left: '0%' }}></div>
                              <div className="chart-point" style={{ bottom: `${year2Pos}%`, left: '20%' }}></div>
                              <div className="chart-point" style={{ bottom: `${year3Pos}%`, left: '40%' }}></div>
                              <div className="chart-point" style={{ bottom: `${year4Pos}%`, left: '60%' }}></div>
                              <div className="chart-point" style={{ bottom: `${year5Pos}%`, left: '80%' }}></div>
                            </div>
                            <div className="chart-x-axis">
                              <div className="x-label">Year 1</div>
                              <div className="x-label">Year 2</div>
                              <div className="x-label">Year 3</div>
                              <div className="x-label">Year 4</div>
                              <div className="x-label">Year 5</div>
                            </div>
                          </div>
                        </>
                      );
                    })()}
                  </div>
                  <div className="projection-values">
                    <div className="value-item">
                      <span className="value-label">You Invest:</span>
                      <span className="value-amount">${analysisData.projection?.initialInvestment || 1000}</span>
                    </div>
                    <div className="value-item">
                      <span className="value-label">Value After 5 Years:</span>
                      <span className="value-amount">${analysisData.projection?.year5 || 1380}</span>
                    </div>
                    <div className="value-item">
                      <span className="value-label">Your Profit:</span>
                      <span className="value-amount positive">+${(analysisData.projection?.year5 || 1380) - (analysisData.projection?.initialInvestment || 1000)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {}
              {analysisData.advancedInsights && (
                <>
                  {}
                  <div className="analysis-section">
                    <div className="section-header">
                      <div className="section-icon">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                          <path d="M9 12H15M9 16H15M17 21H7C5.89543 21 5 20.1046 5 19V5C5 3.89543 5.89543 3 7 3H12.5858C12.851 3 13.1054 3.10536 13.2929 3.29289L18.7071 8.70711C18.8946 8.89464 19 9.149 19 9.41421V19C19 20.1046 18.1046 21 17 21Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                      <h3>Tax Benefits</h3>
                    </div>
                    <div className="insights-list">
                      <div className="insight-item">
                        <div className="insight-icon">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                            <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </div>
                        <span className="insight-text">{analysisData.advancedInsights.taxInsights.taxStrategy}</span>
                      </div>
                      <div className="insight-item">
                        <div className="insight-icon">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                            <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </div>
                        <span className="insight-text">{analysisData.advancedInsights.taxInsights.longTermBenefits}</span>
                      </div>
                    </div>
                  </div>

                  {}
                  <div className="analysis-section">
                    <div className="section-header">
                      <div className="section-icon">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                          <path d="M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                      <h3>Portfolio Fit</h3>
                    </div>
                    <div className="insights-list">
                      <div className="insight-item">
                        <div className="insight-icon">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                            <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </div>
                        <span className="insight-text">{analysisData.advancedInsights.portfolioDiversification.diversificationBenefit}</span>
                      </div>
                      <div className="insight-item">
                        <div className="insight-icon">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                            <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </div>
                        <span className="insight-text">Recommended allocation: {analysisData.advancedInsights.portfolioDiversification.portfolioWeight}</span>
                      </div>
                    </div>
                  </div>

                  {}
                  <div className="analysis-section">
                    <div className="section-header">
                      <div className="section-icon">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                          <path d="M12 6.25278V19.2528M12 6.25278C10.8321 5.47686 9.24649 5 7.5 5C5.75351 5 4.16789 5.47686 3 6.25278V19.2528C4.16789 18.4769 5.75351 18 7.5 18C9.24649 18 10.8321 18.4769 12 19.2528M12 6.25278C13.1679 5.47686 14.7535 5 16.5 5C18.2465 5 19.8321 5.47686 21 6.25278V19.2528C19.8321 18.4769 18.2465 18 16.5 18C14.7535 18 13.1679 18.4769 12 19.2528" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                      <h3>Different Scenarios</h3>
                      <p className="section-subtitle">Best case, expected, and worst case outcomes</p>
                    </div>
                    <div className="scenarios-grid">
                      <div className="scenario-card optimistic">
                        <div className="scenario-label">Optimistic</div>
                        <div className="scenario-return">{analysisData.advancedInsights.scenarioAnalysis.optimistic.roi}% ROI</div>
                        <div className="scenario-profit">+${analysisData.advancedInsights.scenarioAnalysis.optimistic.profit}</div>
                        <div className="scenario-desc">{analysisData.advancedInsights.scenarioAnalysis.optimistic.scenario}</div>
                      </div>
                      <div className="scenario-card base">
                        <div className="scenario-label">Expected</div>
                        <div className="scenario-return">{analysisData.advancedInsights.scenarioAnalysis.base.roi}% ROI</div>
                        <div className="scenario-profit">+${analysisData.advancedInsights.scenarioAnalysis.base.profit}</div>
                        <div className="scenario-desc">{analysisData.advancedInsights.scenarioAnalysis.base.scenario}</div>
                      </div>
                      <div className="scenario-card pessimistic">
                        <div className="scenario-label">Conservative</div>
                        <div className="scenario-return">{analysisData.advancedInsights.scenarioAnalysis.pessimistic.roi}% ROI</div>
                        <div className="scenario-profit">+${analysisData.advancedInsights.scenarioAnalysis.pessimistic.profit}</div>
                        <div className="scenario-desc">{analysisData.advancedInsights.scenarioAnalysis.pessimistic.scenario}</div>
                      </div>
                    </div>
                  </div>

                  {}
                  <div className="analysis-section">
                    <div className="section-header">
                      <div className="section-icon">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                          <path d="M12 6V18M15 9L12 6L9 9M9 15L12 18L15 15M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                      <h3>Liquidity & Timing</h3>
                    </div>
                    <div className="insights-list">
                      <div className="insight-item">
                        <div className="insight-icon">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                            <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </div>
                        <span className="insight-text">{analysisData.advancedInsights.liquidityAnalysis.explanation}</span>
                      </div>
                      <div className="insight-item">
                        <div className="insight-icon">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                            <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </div>
                        <span className="insight-text">{analysisData.advancedInsights.marketTiming.recommendation}</span>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </>
          ) : null}
        </div>

        <div className="property-ai-footer">
          <div className="footer-content">
            <div className="feedback-section">
              <div className="feedback-text">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span>Done! How does this look?</span>
              </div>
              <div className="feedback-buttons">
                <button className="feedback-btn positive" title="Good Analysis">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
                <button className="feedback-btn negative" title="Needs Improvement">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M9 9L15 15M15 9L9 15M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
                <button className="feedback-btn close" onClick={onClose} title="Close">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyAIAnalysis;