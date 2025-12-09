



import { useState, useEffect, useCallback } from 'react';
import { userAPI, portfolioAPI, marketplaceAPI, walletAPI } from '../api/localDynamicAPI';
import { paymentAPI } from '../api/localPayments';





export const usePortfolioOverview = (userId) => {
  const [portfolioData, setPortfolioData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchPortfolioData = useCallback(async () => {
    try {
      setLoading(true);
      const data = await portfolioAPI.getPortfolio(userId);
      setPortfolioData(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (userId) {
      fetchPortfolioData();
    }
  }, [userId, fetchPortfolioData]);

  
  useEffect(() => {
    if (!userId) return;

    const subscription = dynamicAPI.realtimeAPI.subscribeToPortfolio(userId, (payload) => {
      
      fetchPortfolioData();
    });

    return () => subscription.unsubscribe();
  }, [userId, fetchPortfolioData]);

  return {
    portfolioData,
    loading,
    error,
    refetch: fetchPortfolioData
  };
};





export const useUserInvestments = (userId) => {
  const [investments, setInvestments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchInvestments = useCallback(async () => {
    try {
      setLoading(true);
      const data = await dynamicAPI.investmentAPI.getUserInvestments(userId);
      setInvestments(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (userId) {
      fetchInvestments();
    }
  }, [userId, fetchInvestments]);

  
  useEffect(() => {
    if (!userId) return;

    const subscription = dynamicAPI.realtimeAPI.subscribeToPortfolio(userId, (payload) => {
      fetchInvestments();
    });

    return () => subscription.unsubscribe();
  }, [userId, fetchInvestments]);

  return {
    investments,
    loading,
    error,
    refetch: fetchInvestments
  };
};





export const usePropertyInvestment = (propertyId, userId) => {
  const [property, setProperty] = useState(null);
  const [investment, setInvestment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchPropertyData = useCallback(async () => {
    try {
      setLoading(true);
      const [propertyData, userInvestments] = await Promise.all([
        dynamicAPI.propertyAPI.getProperty(propertyId),
        dynamicAPI.investmentAPI.getUserInvestments(userId)
      ]);
      
      setProperty(propertyData);
      
      
      const userInvestment = userInvestments.find(inv => inv.property_id === propertyId);
      setInvestment(userInvestment);
      
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [propertyId, userId]);

  useEffect(() => {
    if (propertyId && userId) {
      fetchPropertyData();
    }
  }, [propertyId, userId, fetchPropertyData]);

  
  useEffect(() => {
    if (!propertyId) return;

    const subscription = dynamicAPI.realtimeAPI.subscribeToProperty(propertyId, (payload) => {
      fetchPropertyData();
    });

    return () => subscription.unsubscribe();
  }, [propertyId, fetchPropertyData]);

  return {
    property,
    investment,
    loading,
    error,
    refetch: fetchPropertyData
  };
};





export const useInvestmentCalculation = (propertyId, investmentAmount) => {
  const [calculation, setCalculation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const calculateInvestment = useCallback(async () => {
    if (!propertyId || !investmentAmount) return;

    try {
      setLoading(true);
      const data = await dynamicAPI.calculationAPI.calculateROI(propertyId, investmentAmount);
      setCalculation(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [propertyId, investmentAmount]);

  useEffect(() => {
    calculateInvestment();
  }, [calculateInvestment]);

  return {
    calculation,
    loading,
    error,
    recalculate: calculateInvestment
  };
};





export const useInvestmentTransaction = (userId) => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchTransactions = useCallback(async (filters = {}) => {
    try {
      setLoading(true);
      const data = await dynamicAPI.investmentAPI.getInvestmentTransactions(userId, filters);
      setTransactions(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (userId) {
      fetchTransactions();
    }
  }, [userId, fetchTransactions]);

  return {
    transactions,
    loading,
    error,
    refetch: fetchTransactions
  };
};





export const useWallet = (userId) => {
  const [wallet, setWallet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchWallet = useCallback(async () => {
    try {
      setLoading(true);
      const data = await dynamicAPI.userAPI.getWallet(userId);
      setWallet(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (userId) {
      fetchWallet();
    }
  }, [userId, fetchWallet]);

  
  useEffect(() => {
    if (!userId) return;

    const subscription = dynamicAPI.realtimeAPI.subscribeToWallet(userId, (payload) => {
      fetchWallet();
    });

    return () => subscription.unsubscribe();
  }, [userId, fetchWallet]);

  return {
    wallet,
    loading,
    error,
    refetch: fetchWallet
  };
};





export const usePropertyFavorites = (userId) => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchFavorites = useCallback(async () => {
    try {
      setLoading(true);
      const data = await dynamicAPI.propertyAPI.getFavoriteProperties(userId);
      setFavorites(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (userId) {
      fetchFavorites();
    }
  }, [userId, fetchFavorites]);

  const addToFavorites = useCallback(async (propertyId) => {
    try {
      await dynamicAPI.propertyAPI.addToFavorites(userId, propertyId);
      fetchFavorites();
    } catch (err) {
      setError(err.message);
    }
  }, [userId, fetchFavorites]);

  const removeFromFavorites = useCallback(async (propertyId) => {
    try {
      await dynamicAPI.propertyAPI.removeFromFavorites(userId, propertyId);
      fetchFavorites();
    } catch (err) {
      setError(err.message);
    }
  }, [userId, fetchFavorites]);

  return {
    favorites,
    loading,
    error,
    addToFavorites,
    removeFromFavorites,
    refetch: fetchFavorites
  };
};





export const useMarketData = (city, state) => {
  const [marketData, setMarketData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchMarketData = useCallback(async () => {
    try {
      setLoading(true);
      const data = await dynamicAPI.marketAPI.getMarketTrends(city, state);
      setMarketData(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [city, state]);

  useEffect(() => {
    if (city && state) {
      fetchMarketData();
    }
  }, [city, state, fetchMarketData]);

  return {
    marketData,
    loading,
    error,
    refetch: fetchMarketData
  };
};





export const usePortfolioAnalytics = (userId) => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAnalytics = useCallback(async () => {
    try {
      setLoading(true);
      const data = await dynamicAPI.portfolioAPI.getPortfolioAnalytics(userId);
      setAnalytics(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (userId) {
      fetchAnalytics();
    }
  }, [userId, fetchAnalytics]);

  return {
    analytics,
    loading,
    error,
    refetch: fetchAnalytics
  };
};





export const useInvestmentProcessing = () => {
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);

  const processInvestment = useCallback(async (userId, propertyId, investmentAmount, paymentMethodId) => {
    try {
      setProcessing(true);
      setError(null);

      
      const investmentData = await investmentTransactionAPI.processInvestment(
        userId,
        propertyId,
        investmentAmount,
        paymentMethodId
      );

      return investmentData;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setProcessing(false);
    }
  }, []);

  const completeInvestment = useCallback(async (userId, investmentData, paymentIntentId) => {
    try {
      setProcessing(true);
      setError(null);

      const result = await investmentTransactionAPI.completeInvestment(
        userId,
        investmentData,
        paymentIntentId
      );

      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setProcessing(false);
    }
  }, []);

  return {
    processing,
    error,
    processInvestment,
    completeInvestment
  };
};





export default {
  usePortfolioOverview,
  useUserInvestments,
  usePropertyInvestment,
  useInvestmentCalculation,
  useInvestmentTransaction,
  useWallet,
  usePropertyFavorites,
  useMarketData,
  usePortfolioAnalytics,
  useInvestmentProcessing
};

