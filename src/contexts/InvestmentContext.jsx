import React, { createContext, useContext, useState, useEffect } from 'react';

const InvestmentContext = createContext();

export const useInvestments = () => {
  const context = useContext(InvestmentContext);
  if (!context) {
    throw new Error('useInvestments must be used within InvestmentProvider');
  }
  return context;
};


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

export const InvestmentProvider = ({ children }) => {
  const [currentUserId, setCurrentUserId] = useState(getCurrentUserId());
  const [updateTimestamp, setUpdateTimestamp] = useState(Date.now());
  
  const [investments, setInvestments] = useState(() => {
    const userId = getCurrentUserId();
    if (!userId) return [];
    const saved = localStorage.getItem(`userInvestments_${userId}`);
    return saved ? JSON.parse(saved) : [];
  });

  const [transactions, setTransactions] = useState(() => {
    const userId = getCurrentUserId();
    if (!userId) return [];
    const saved = localStorage.getItem(`userTransactions_${userId}`);
    return saved ? JSON.parse(saved) : [];
  });

  
  useEffect(() => {
    if (investments.length > 0) {
      const interval = setInterval(() => {
        setUpdateTimestamp(Date.now());
        
      }, 10000); 

      return () => clearInterval(interval);
    }
  }, [investments.length]);

  
  useEffect(() => {
    const checkUserChange = () => {
      const newUserId = getCurrentUserId();
      if (newUserId !== currentUserId) {
        setCurrentUserId(newUserId);
        
        
        if (newUserId) {
          const savedInvestments = localStorage.getItem(`userInvestments_${newUserId}`);
          const savedTransactions = localStorage.getItem(`userTransactions_${newUserId}`);
          
          setInvestments(savedInvestments ? JSON.parse(savedInvestments) : []);
          setTransactions(savedTransactions ? JSON.parse(savedTransactions) : []);
        } else {
          
          setInvestments([]);
          setTransactions([]);
        }
      }
    };

    
    const interval = setInterval(checkUserChange, 500);
    
    return () => clearInterval(interval);
  }, [currentUserId]);

  
  useEffect(() => {
    const userId = getCurrentUserId();
    if (userId) {
      localStorage.setItem(`userInvestments_${userId}`, JSON.stringify(investments));
    }
  }, [investments]);

  useEffect(() => {
    const userId = getCurrentUserId();
    if (userId) {
      localStorage.setItem(`userTransactions_${userId}`, JSON.stringify(transactions));
    }
  }, [transactions]);

  const addInvestment = (investmentData) => {
    const propertyLocation = investmentData.property.city || investmentData.property.location || 'Unknown';
    
    const newInvestment = {
      id: Date.now().toString(),
      propertyId: investmentData.property.id,
      propertyName: investmentData.property.name,
      propertyCity: propertyLocation,
      tokenAmount: investmentData.tokenAmount,
      tokenPrice: investmentData.property.tokenPrice,
      totalInvested: investmentData.total,
      platformFee: investmentData.total - (investmentData.tokenAmount * investmentData.property.tokenPrice),
      annualROI: investmentData.property.annualROI,
      monthlyRent: investmentData.property.monthlyRent,
      purchaseDate: new Date().toISOString(),
      paymentMethod: investmentData.paymentMethod.name,
      status: 'active',
      lockPeriod: 30, 
      unlockDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    };

    setInvestments(prev => [...prev, newInvestment]);

    
    const transaction = {
      id: Date.now().toString(),
      type: 'purchase',
      propertyName: investmentData.property.name,
      propertyCity: propertyLocation,
      amount: investmentData.total,
      tokens: investmentData.tokenAmount,
      date: new Date().toISOString(),
      status: 'completed',
      paymentMethod: investmentData.paymentMethod.name,
      description: `Purchased ${investmentData.tokenAmount} tokens of ${investmentData.property.name}`,
    };

    setTransactions(prev => [transaction, ...prev]);

    return newInvestment;
  };

  
  
  const getPropertySeed = (propertyId, daysHeld) => {
    
    const seed = propertyId * 1000 + Math.floor(daysHeld / 7); 
    return seed;
  };

  
  const seededRandom = (seed) => {
    const x = Math.sin(seed) * 10000;
    return x - Math.floor(x);
  };

  
  const simulatePropertyValue = (investment, baseAppreciationRate = 0.05) => {
    const purchaseDate = new Date(investment.purchaseDate);
    const now = new Date();
    const daysHeld = Math.max(1, Math.floor((now - purchaseDate) / (1000 * 60 * 60 * 24)));
    const hoursHeld = Math.max(1, (now - purchaseDate) / (1000 * 60 * 60));
    const yearsHeld = daysHeld / 365;
    
    
    
    const demoBoost = 1.10; 
    const baseAppreciation = 1 + ((investment.annualROI / 100) * yearsHeld * demoBoost);
    
    
    const seed = getPropertySeed(investment.propertyId, daysHeld);
    const randomValue = seededRandom(seed + Math.floor(hoursHeld / 24)); 
    const volatility = 1 + (randomValue * 0.04); 
    
    
    const propertySeed = investment.propertyId * 100;
    const propertyRandom = seededRandom(propertySeed + Math.floor(daysHeld / 30)); 
    const propertyFactor = 1.01 + (propertyRandom * 0.02); 
    
    
    const hourlyFluctuation = 1 + (Math.abs(Math.sin(hoursHeld * 0.1)) * 0.001); 
    
    
    
    const minAppreciationBoost = daysHeld < 7 ? 1.02 : (daysHeld < 30 ? 1.015 : 1.01); 
    
    
    const calculatedValue = investment.totalInvested * baseAppreciation * volatility * propertyFactor * hourlyFluctuation * minAppreciationBoost;
    
    const currentValue = Math.max(
      investment.totalInvested * 1.01, 
      calculatedValue
    );
    
    return {
      currentValue,
      appreciation: ((currentValue / investment.totalInvested) - 1) * 100,
      volatility: (volatility - 1) * 100,
      daysHeld,
      hoursHeld
    };
  };

  
  const calculateAccumulatedReturns = (investment) => {
    const purchaseDate = new Date(investment.purchaseDate);
    const now = new Date();
    const daysHeld = Math.max(1, Math.floor((now - purchaseDate) / (1000 * 60 * 60 * 24))); 
    const hoursHeld = Math.max(1, (now - purchaseDate) / (1000 * 60 * 60)); 
    const monthsHeld = Math.max(0.1, daysHeld / 30); 
    
    
    
    const incomeBoost = 1.12; 
    const propertyValue = investment.tokenAmount * investment.tokenPrice;
    let enhancedROI = investment.annualROI * incomeBoost;
    
    enhancedROI = Math.min(12, Math.max(8, enhancedROI));
    const annualIncome = propertyValue * (enhancedROI / 100);
    const calculatedMonthly = annualIncome / 12;
    
    
    const minMonthlyProportional = investment.totalInvested * 0.004; 
    const monthlyDividend = Math.max(minMonthlyProportional, calculatedMonthly);
    const dailyDividend = (monthlyDividend * 12) / 365;
    
    
    const totalDividends = Math.max(0, dailyDividend * daysHeld);
    
    
    const valueSimulation = simulatePropertyValue(investment);
    const appreciationGain = Math.max(0, valueSimulation.currentValue - investment.totalInvested);
    
    
    const totalReturn = Math.max(0, totalDividends + appreciationGain);
    const totalReturnPercentage = investment.totalInvested > 0 
      ? Math.max(0, (totalReturn / investment.totalInvested) * 100)
      : 0;
    
    
    const nextDividendDate = new Date(purchaseDate);
    nextDividendDate.setMonth(nextDividendDate.getMonth() + Math.floor(monthsHeld) + 1);
    const daysUntilNextDividend = Math.max(0, Math.ceil((nextDividendDate - now) / (1000 * 60 * 60 * 24)));
    
    return {
      totalReturn: Math.max(0, totalReturn), 
      totalReturnPercentage: Math.max(0, totalReturnPercentage), 
      dividends: Math.max(0, totalDividends), 
      appreciation: Math.max(0, appreciationGain), 
      monthlyDividend: Math.max(0, monthlyDividend),
      dailyDividend: Math.max(0, dailyDividend),
      monthsHeld: Math.max(0.1, Math.floor(monthsHeld)),
      daysHeld: Math.max(1, daysHeld),
      hoursHeld: Math.max(1, hoursHeld),
      currentValue: Math.max(investment.totalInvested * 1.01, valueSimulation.currentValue), 
      nextDividendDate: nextDividendDate.toISOString(),
      daysUntilNextDividend,
      
      hourlyReturn: Math.max(0, dailyDividend / 24),
      minuteReturn: Math.max(0, dailyDividend / (24 * 60))
    };
  };

  const getPortfolioSummary = () => {
    
    const _ = updateTimestamp;
    
    const totalInvested = investments.reduce((sum, inv) => sum + inv.totalInvested, 0);
    const totalProperties = new Set(investments.map(inv => inv.propertyId)).size;
    const totalTokens = investments.reduce((sum, inv) => sum + inv.tokenAmount, 0);
    
    
    const investmentReturns = investments.map(inv => calculateAccumulatedReturns(inv));
    
    
    const totalCurrentValue = Math.max(totalInvested * 1.01, investmentReturns.reduce((sum, ret) => sum + ret.currentValue, 0));
    const totalDividends = Math.max(0, investmentReturns.reduce((sum, ret) => sum + ret.dividends, 0));
    const totalAppreciation = Math.max(0, investmentReturns.reduce((sum, ret) => sum + ret.appreciation, 0));
    const totalReturn = Math.max(0, totalDividends + totalAppreciation);
    const totalReturnPercentage = totalInvested > 0 
      ? Math.max(0, (totalReturn / totalInvested) * 100)
      : 0;

    
    
    const incomeBoost = 1.12; 
    const monthlyIncome = investments.reduce((sum, inv) => {
      const propertyValue = inv.tokenAmount * inv.tokenPrice;
      
      let enhancedROI = inv.annualROI * incomeBoost;
      enhancedROI = Math.min(12, Math.max(8, enhancedROI)); 
      const annualIncome = propertyValue * (enhancedROI / 100);
      const calculatedMonthly = annualIncome / 12;
      
      
      const minMonthlyProportional = inv.totalInvested * 0.004; 
      return sum + Math.max(minMonthlyProportional, calculatedMonthly);
    }, 0);

    
    const dailyIncome = investments.reduce((sum, inv) => {
      const propertyValue = inv.tokenAmount * inv.tokenPrice;
      let enhancedROI = inv.annualROI * incomeBoost;
      enhancedROI = Math.min(12, Math.max(8, enhancedROI)); 
      const annualIncome = propertyValue * (enhancedROI / 100);
      return sum + (annualIncome / 365);
    }, 0);

    const hourlyIncome = dailyIncome / 24;

    
    const hourlyReturnRate = totalInvested > 0 ? (hourlyIncome / totalInvested) * 100 : 0;

    return {
      totalInvested,
      currentValue: totalCurrentValue,
      totalReturn,
      totalReturnPercentage,
      totalDividends,
      totalAppreciation,
      totalProperties,
      totalTokens,
      monthlyIncome,
      dailyIncome,
      hourlyIncome,
      annualIncome: monthlyIncome * 12,
      hourlyReturnRate,
      lastUpdated: new Date().toISOString(),
      
      valueChange24h: totalReturn * 0.001, 
      returnChange24h: totalReturnPercentage * 0.001
    };
  };

  const getInvestmentsByProperty = () => {
    const grouped = {};
    
    investments.forEach(inv => {
      if (!grouped[inv.propertyId]) {
        grouped[inv.propertyId] = {
          propertyId: inv.propertyId,
          propertyName: inv.propertyName,
          propertyCity: inv.propertyCity,
          tokenPrice: inv.tokenPrice,
          annualROI: inv.annualROI,
          totalTokens: 0,
          totalInvested: 0,
          investments: [],
        };
      }
      
      grouped[inv.propertyId].totalTokens += inv.tokenAmount;
      grouped[inv.propertyId].totalInvested += inv.totalInvested;
      grouped[inv.propertyId].investments.push(inv);
    });

    return Object.values(grouped);
  };

  
  const generateMonthlyDividends = () => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    investments.forEach(inv => {
      const purchaseDate = new Date(inv.purchaseDate);
      const purchaseMonth = purchaseDate.getMonth();
      const purchaseYear = purchaseDate.getFullYear();
      
      
      const monthsSincePurchase = (currentYear - purchaseYear) * 12 + (currentMonth - purchaseMonth);
      
      
      for (let month = 1; month <= monthsSincePurchase; month++) {
        const dividendDate = new Date(purchaseYear, purchaseMonth + month, 1);
        const propertyValue = inv.tokenAmount * inv.tokenPrice;
        const monthlyDividend = (propertyValue * (inv.annualROI / 100)) / 12;
        
        
        const existingTxn = transactions.find(txn => 
          txn.type === 'dividend' &&
          txn.propertyName === inv.propertyName &&
          new Date(txn.date).getMonth() === dividendDate.getMonth() &&
          new Date(txn.date).getFullYear() === dividendDate.getFullYear()
        );
        
        if (!existingTxn && monthlyDividend > 0) {
          const transaction = {
            id: `dividend_${inv.id}_${month}_${dividendDate.getTime()}`,
            type: 'dividend',
            propertyName: inv.propertyName,
            propertyCity: inv.propertyCity,
            amount: monthlyDividend,
            date: dividendDate.toISOString(),
            status: 'completed',
            description: `Monthly dividend payment from ${inv.propertyName}`,
            tokens: inv.tokenAmount,
          };

          setTransactions(prev => {
            
            const exists = prev.some(txn => txn.id === transaction.id);
            if (!exists) {
              return [transaction, ...prev].sort((a, b) => 
                new Date(b.date) - new Date(a.date)
              );
            }
            return prev;
          });
        }
      }
    });
  };

  
  useEffect(() => {
    if (investments.length > 0) {
      generateMonthlyDividends();
    }
  }, [investments.length]); 

  const addDividendTransaction = (propertyName, amount) => {
    const transaction = {
      id: Date.now().toString(),
      type: 'dividend',
      propertyName,
      amount,
      date: new Date().toISOString(),
      status: 'completed',
      description: `Monthly dividend payment from ${propertyName}`,
    };

    setTransactions(prev => [transaction, ...prev]);
  };

  const clearAllData = () => {
    setInvestments([]);
    setTransactions([]);
    localStorage.removeItem('userInvestments');
    localStorage.removeItem('userTransactions');
  };

  
  const getInvestmentReturns = (investmentId) => {
    const investment = investments.find(inv => inv.id === investmentId);
    if (!investment) return null;
    
    return calculateAccumulatedReturns(investment);
  };

  
  const getAllInvestmentReturns = () => {
    return investments.map(inv => ({
      investment: inv,
      returns: calculateAccumulatedReturns(inv)
    }));
  };

  // Reduce tokens from an investment (for selling on secondary market)
  const reduceInvestmentTokens = (investmentId, tokensToRemove) => {
    setInvestments(prev => prev.map(inv => {
      if (inv.id === investmentId) {
        const newTokenAmount = inv.tokenAmount - tokensToRemove;

        // If all tokens sold, mark as sold
        if (newTokenAmount <= 0) {
          return {
            ...inv,
            tokenAmount: 0,
            status: 'sold',
            soldDate: new Date().toISOString()
          };
        }

        // Reduce tokens and recalculate proportionally
        const proportion = newTokenAmount / inv.tokenAmount;
        return {
          ...inv,
          tokenAmount: newTokenAmount,
          totalInvested: inv.totalInvested * proportion
        };
      }
      return inv;
    }));
  };

  // Add investment from secondary market
  const addSecondaryInvestment = (investmentData) => {
    const newInvestment = {
      id: Date.now().toString(),
      propertyId: investmentData.propertyId,
      propertyName: investmentData.propertyName,
      propertyCity: investmentData.propertyCity || 'Unknown',
      tokenAmount: investmentData.tokenAmount,
      tokenPrice: investmentData.pricePerToken,
      totalInvested: investmentData.totalValue,
      platformFee: 0, // No platform fee on secondary market
      annualROI: investmentData.annualROI || 8.5,
      monthlyRent: investmentData.monthlyRent || 0,
      purchaseDate: new Date().toISOString(),
      paymentMethod: 'Secondary Market',
      status: 'active',
      lockPeriod: 0, // No lock period on secondary purchases
      unlockDate: new Date().toISOString(), // Immediately unlocked
      source: 'secondary'
    };

    setInvestments(prev => [...prev, newInvestment]);

    // Add transaction
    const transaction = {
      id: Date.now().toString(),
      type: 'purchase',
      propertyName: investmentData.propertyName,
      propertyCity: investmentData.propertyCity || 'Unknown',
      amount: investmentData.totalValue,
      tokens: investmentData.tokenAmount,
      date: new Date().toISOString(),
      status: 'completed',
      paymentMethod: 'Secondary Market',
      description: `Purchased ${investmentData.tokenAmount} tokens of ${investmentData.propertyName} on secondary market`,
    };

    setTransactions(prev => [transaction, ...prev]);

    return newInvestment;
  };

  const value = {
    investments,
    transactions,
    addInvestment,
    getPortfolioSummary,
    getInvestmentsByProperty,
    addDividendTransaction,
    getInvestmentReturns,
    getAllInvestmentReturns,
    clearAllData,
    updateTimestamp,
    reduceInvestmentTokens,
    addSecondaryInvestment,
  };

  return (
    <InvestmentContext.Provider value={value}>
      {children}
    </InvestmentContext.Provider>
  );
};

