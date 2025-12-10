import React, { createContext, useContext, useState, useEffect } from 'react';

const WalletContext = createContext();

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet must be used within WalletProvider');
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

export const WalletProvider = ({ children }) => {
  const [currentUserId, setCurrentUserId] = useState(getCurrentUserId());
  
  const [walletData, setWalletData] = useState(() => {
    const userId = getCurrentUserId();
    if (!userId) return {
      balance: 0,
      availableBalance: 0,
      pendingBalance: 0,
      totalDeposited: 0,
      totalWithdrawn: 0,
      currency: 'USD',
      lastUpdated: new Date().toISOString()
    };
    
    const saved = localStorage.getItem(`walletData_${userId}`);
    return saved ? JSON.parse(saved) : {
      balance: 0,
      availableBalance: 0,
      pendingBalance: 0,
      totalDeposited: 0,
      totalWithdrawn: 0,
      currency: 'USD',
      lastUpdated: new Date().toISOString()
    };
  });

  const [connectedAccounts, setConnectedAccounts] = useState(() => {
    const userId = getCurrentUserId();
    if (!userId) return [];
    const saved = localStorage.getItem(`connectedAccounts_${userId}`);
    return saved ? JSON.parse(saved) : [];
  });

  const [walletTransactions, setWalletTransactions] = useState(() => {
    const userId = getCurrentUserId();
    if (!userId) return [];
    const saved = localStorage.getItem(`walletTransactions_${userId}`);
    return saved ? JSON.parse(saved) : [];
  });

  
  useEffect(() => {
    const checkUserChange = () => {
      const newUserId = getCurrentUserId();
      if (newUserId !== currentUserId) {
        setCurrentUserId(newUserId);
        
        
        if (newUserId) {
          const savedWallet = localStorage.getItem(`walletData_${newUserId}`);
          const savedAccounts = localStorage.getItem(`connectedAccounts_${newUserId}`);
          const savedTransactions = localStorage.getItem(`walletTransactions_${newUserId}`);
          
          setWalletData(savedWallet ? JSON.parse(savedWallet) : {
            balance: 0,
            availableBalance: 0,
            pendingBalance: 0,
            totalDeposited: 0,
            totalWithdrawn: 0,
            currency: 'USD',
            lastUpdated: new Date().toISOString()
          });
          setConnectedAccounts(savedAccounts ? JSON.parse(savedAccounts) : []);
          setWalletTransactions(savedTransactions ? JSON.parse(savedTransactions) : []);
        } else {
          
          setWalletData({
            balance: 0,
            availableBalance: 0,
            pendingBalance: 0,
            totalDeposited: 0,
            totalWithdrawn: 0,
            currency: 'USD',
            lastUpdated: new Date().toISOString()
          });
          setConnectedAccounts([]);
          setWalletTransactions([]);
        }
      }
    };

    const interval = setInterval(checkUserChange, 500);
    return () => clearInterval(interval);
  }, [currentUserId]);

  
  useEffect(() => {
    const userId = getCurrentUserId();
    if (userId) {
      localStorage.setItem(`walletData_${userId}`, JSON.stringify(walletData));
    }
  }, [walletData]);

  useEffect(() => {
    const userId = getCurrentUserId();
    if (userId) {
      localStorage.setItem(`connectedAccounts_${userId}`, JSON.stringify(connectedAccounts));
    }
  }, [connectedAccounts]);

  useEffect(() => {
    const userId = getCurrentUserId();
    if (userId) {
      localStorage.setItem(`walletTransactions_${userId}`, JSON.stringify(walletTransactions));
    }
  }, [walletTransactions]);

  
  const addFunds = (amount, method, description = '') => {
    const transaction = {
      id: `txn_${Date.now()}`,
      type: 'deposit',
      amount: parseFloat(amount),
      description: description || `Deposit via ${method}`,
      status: 'completed',
      date: new Date().toISOString(),
      method: method
    };

    setWalletTransactions(prev => [transaction, ...prev]);
    setWalletData(prev => ({
      ...prev,
      balance: prev.balance + parseFloat(amount),
      availableBalance: prev.availableBalance + parseFloat(amount),
      totalDeposited: prev.totalDeposited + parseFloat(amount),
      lastUpdated: new Date().toISOString()
    }));

    return transaction;
  };

  
  const withdrawFunds = (amount, method, description = '') => {
    const transaction = {
      id: `txn_${Date.now()}`,
      type: 'withdrawal',
      amount: parseFloat(amount),
      description: description || `Withdrawal to ${method}`,
      status: 'pending',
      date: new Date().toISOString(),
      method: method
    };

    setWalletTransactions(prev => [transaction, ...prev]);
    setWalletData(prev => ({
      ...prev,
      availableBalance: prev.availableBalance - parseFloat(amount),
      pendingBalance: prev.pendingBalance + parseFloat(amount),
      totalWithdrawn: prev.totalWithdrawn + parseFloat(amount),
      lastUpdated: new Date().toISOString()
    }));

    return transaction;
  };

  
  const deductFromWallet = (amount, description) => {
    const transaction = {
      id: `txn_${Date.now()}`,
      type: 'investment',
      amount: parseFloat(amount),
      description,
      status: 'completed',
      date: new Date().toISOString(),
      method: 'wallet'
    };

    setWalletTransactions(prev => [transaction, ...prev]);
    setWalletData(prev => ({
      ...prev,
      balance: prev.balance - parseFloat(amount),
      availableBalance: prev.availableBalance - parseFloat(amount),
      lastUpdated: new Date().toISOString()
    }));

    return transaction;
  };

  
  const addPaymentMethod = (accountData) => {
    const account = {
      id: `acc_${Date.now()}`,
      ...accountData,
      connectedDate: new Date().toISOString(),
      status: accountData.status || 'active'
    };

    setConnectedAccounts(prev => [...prev, account]);
    return account;
  };

  
  const removePaymentMethod = (accountId) => {
    setConnectedAccounts(prev => prev.filter(acc => acc.id !== accountId));
  };

  
  const setPrimaryPaymentMethod = (accountId) => {
    setConnectedAccounts(prev =>
      prev.map(acc => ({
        ...acc,
        primary: acc.id === accountId
      }))
    );
  };

  // Deduct trading fee
  const deductTradingFee = (amount, description) => {
    const transaction = {
      id: `txn_${Date.now()}`,
      type: 'trading_fee',
      amount: parseFloat(amount),
      description,
      status: 'completed',
      date: new Date().toISOString(),
      method: 'wallet'
    };

    setWalletTransactions(prev => [transaction, ...prev]);
    setWalletData(prev => ({
      ...prev,
      balance: prev.balance - parseFloat(amount),
      availableBalance: prev.availableBalance - parseFloat(amount),
      lastUpdated: new Date().toISOString()
    }));

    return transaction;
  };

  // Credit sale proceeds
  const creditTradeProceeds = (amount, description) => {
    const transaction = {
      id: `txn_${Date.now()}`,
      type: 'sale_proceeds',
      amount: parseFloat(amount),
      description,
      status: 'completed',
      date: new Date().toISOString(),
      method: 'wallet'
    };

    setWalletTransactions(prev => [transaction, ...prev]);
    setWalletData(prev => ({
      ...prev,
      balance: prev.balance + parseFloat(amount),
      availableBalance: prev.availableBalance + parseFloat(amount),
      lastUpdated: new Date().toISOString()
    }));

    return transaction;
  };

  const value = {
    walletData,
    connectedAccounts,
    walletTransactions,
    addFunds,
    withdrawFunds,
    deductFromWallet,
    addPaymentMethod,
    removePaymentMethod,
    setPrimaryPaymentMethod,
    setWalletData,
    deductTradingFee,
    creditTradeProceeds,
  };

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>;
};

