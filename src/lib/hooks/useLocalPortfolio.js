



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

  return {
    portfolioData,
    loading,
    error,
    refetch: fetchPortfolioData
  };
};





export const usePortfolioPerformance = (userId, range = '1M') => {
  const [performanceData, setPerformanceData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchPerformanceData = useCallback(async () => {
    try {
      setLoading(true);
      const data = await portfolioAPI.getPerformance(userId, range);
      setPerformanceData(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [userId, range]);

  useEffect(() => {
    if (userId) {
      fetchPerformanceData();
    }
  }, [userId, range, fetchPerformanceData]);

  return {
    performanceData,
    loading,
    error,
    refetch: fetchPerformanceData
  };
};





export const useWallet = (userId) => {
  const [walletData, setWalletData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchWalletData = useCallback(async () => {
    try {
      setLoading(true);
      const data = await walletAPI.getBalance(userId);
      setWalletData(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const addFunds = useCallback(async (amount) => {
    try {
      const data = await walletAPI.addFunds(userId, amount);
      setWalletData(data);
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, [userId]);

  useEffect(() => {
    if (userId) {
      fetchWalletData();
    }
  }, [userId, fetchWalletData]);

  return {
    walletData,
    loading,
    error,
    addFunds,
    refetch: fetchWalletData
  };
};





export const useMarketplace = (filters = {}) => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchProperties = useCallback(async () => {
    try {
      setLoading(true);
      const data = await marketplaceAPI.getProperties(filters);
      setProperties(data.properties || []);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchProperties();
  }, [fetchProperties]);

  return {
    properties,
    loading,
    error,
    refetch: fetchProperties
  };
};





export const usePayment = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const createPaymentIntent = useCallback(async (amount, currency = 'usd', metadata = {}) => {
    try {
      setLoading(true);
      setError(null);
      const data = await paymentAPI.createPaymentIntent(amount, currency, metadata);
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const confirmPayment = useCallback(async (paymentIntentId, paymentMethodId) => {
    try {
      setLoading(true);
      setError(null);
      const data = await paymentAPI.confirmPayment(paymentIntentId, paymentMethodId);
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    createPaymentIntent,
    confirmPayment,
    loading,
    error
  };
};

export default {
  usePortfolioOverview,
  usePortfolioPerformance,
  useWallet,
  useMarketplace,
  usePayment
};
