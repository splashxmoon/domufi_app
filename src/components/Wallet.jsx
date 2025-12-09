import React, { useState, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import { useOutletContext, useSearchParams } from "react-router-dom";
import { useWallet } from "../contexts/WalletContext";
import Toast from "./Toast";

const Wallet = () => {
  const { user } = useOutletContext();
  const [searchParams, setSearchParams] = useSearchParams();
  const { 
    walletData, 
    connectedAccounts, 
    walletTransactions,
    addPaymentMethod,
    setPrimaryPaymentMethod,
    removePaymentMethod,
    addFunds,
    withdrawFunds,
  } = useWallet();
  
  const [mounted, setMounted] = useState(false);
  const [showPlaidLink, setShowPlaidLink] = useState(false);
  const [showStripeForm, setShowStripeForm] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [showRemoveConfirm, setShowRemoveConfirm] = useState(false);
  const [accountToRemove, setAccountToRemove] = useState(null);
  const [toast, setToast] = useState(null);
  const [withdrawForm, setWithdrawForm] = useState({
    amount: '',
    accountId: '',
    description: ''
  });
  const [bankForm, setBankForm] = useState({
    bankName: '',
    accountHolderName: '',
    accountNumber: '',
    routingNumber: '',
    accountType: 'checking'
  });
  const [cardForm, setCardForm] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    nameOnCard: '',
    zipCode: ''
  });
  const [transactionFilter, setTransactionFilter] = useState('all');
  const [transactionSearch, setTransactionSearch] = useState('');

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleBankSubmit = (e) => {
    e.preventDefault();
    if (!bankForm.bankName || !bankForm.accountHolderName || !bankForm.accountNumber || !bankForm.routingNumber) {
      setToast({ message: 'Please fill in all required fields', type: 'error' });
      return;
    }
    if (bankForm.routingNumber.length !== 9) {
      setToast({ message: 'Routing number must be 9 digits', type: 'error' });
      return;
    }
    if (bankForm.accountNumber.length < 4) {
      setToast({ message: 'Account number must be at least 4 digits', type: 'error' });
      return;
    }
    
    const accountData = {
      type: 'bank',
      bankName: bankForm.bankName,
      accountHolderName: bankForm.accountHolderName,
      accountNumber: bankForm.accountNumber.slice(-4), 
      routingNumber: bankForm.routingNumber,
      accountType: bankForm.accountType,
      primary: connectedAccounts.length === 0,
      maskedAccount: `****${bankForm.accountNumber.slice(-4)}`
    };
    
    addPaymentMethod(accountData);
    setShowPlaidLink(false);
    setBankForm({ bankName: '', accountHolderName: '', accountNumber: '', routingNumber: '', accountType: 'checking' });
    setToast({ message: 'Bank account added successfully', type: 'success' });
  };

  const handleCardSubmit = (e) => {
    e.preventDefault();
    if (!cardForm.cardNumber || !cardForm.expiryDate || !cardForm.cvv || !cardForm.nameOnCard || !cardForm.zipCode) {
      setToast({ message: 'Please fill in all required fields', type: 'error' });
      return;
    }
    const cardNumber = cardForm.cardNumber.replace(/\s/g, '');
    if (cardNumber.length < 13 || cardNumber.length > 19) {
      setToast({ message: 'Please enter a valid card number', type: 'error' });
      return;
    }
    if (cardForm.cvv.length < 3 || cardForm.cvv.length > 4) {
      setToast({ message: 'CVV must be 3 or 4 digits', type: 'error' });
      return;
    }
    if (!/^\d{2}\/\d{2}$/.test(cardForm.expiryDate)) {
      setToast({ message: 'Please enter expiry date in MM/YY format', type: 'error' });
      return;
    }
    
    const accountData = {
      type: 'card',
      cardBrand: getCardBrand(cardNumber),
      nameOnCard: cardForm.nameOnCard,
      last4: cardNumber.slice(-4),
      expiryDate: cardForm.expiryDate,
      zipCode: cardForm.zipCode,
      primary: connectedAccounts.length === 0,
      maskedCard: `**** **** **** ${cardNumber.slice(-4)}`
    };
    
    addPaymentMethod(accountData);
    setShowStripeForm(false);
    setCardForm({ cardNumber: '', expiryDate: '', cvv: '', nameOnCard: '', zipCode: '' });
    setToast({ message: 'Credit card added successfully', type: 'success' });
  };

  const getCardBrand = (cardNumber) => {
    const num = cardNumber.replace(/\s/g, '');
    if (/^4/.test(num)) return 'Visa';
    if (/^5[1-5]/.test(num)) return 'Mastercard';
    if (/^3[47]/.test(num)) return 'American Express';
    if (/^6/.test(num)) return 'Discover';
    return 'Card';
  };

  const formatCardNumber = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(' ');
    } else {
      return v;
    }
  };

  const formatExpiryDate = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      return v.substring(0, 2) + '/' + v.substring(2, 4);
    }
    return v;
  };

  const handleWithdrawalSubmit = (e) => {
    e.preventDefault();
    if (!withdrawForm.accountId) {
      setToast({ message: 'Please select an account', type: 'error' });
        return;
      }
    if (parseFloat(withdrawForm.amount) <= 0) {
      setToast({ message: 'Please enter a valid amount', type: 'error' });
      return;
    }
    if (parseFloat(withdrawForm.amount) > walletData.availableBalance) {
      setToast({ message: 'Insufficient balance', type: 'error' });
      return;
    }
    withdrawFunds(
      parseFloat(withdrawForm.amount),
      'bank',
      withdrawForm.description || 'Withdrawal'
    );
    setShowWithdrawModal(false);
    setWithdrawForm({ amount: '', accountId: '', description: '' });
    setToast({ message: 'Withdrawal request submitted', type: 'success' });
  };


  const filteredTransactions = useMemo(() => {
    let filtered = walletTransactions;
    if (transactionFilter !== 'all' && transactionFilter !== 'card') {
      filtered = filtered.filter(txn => txn.type === transactionFilter);
    }
    if (transactionSearch) {
      filtered = filtered.filter(txn =>
        txn.description.toLowerCase().includes(transactionSearch.toLowerCase())
      );
    }
    return filtered;
  }, [walletTransactions, transactionFilter, transactionSearch]);

  
  const walletStats = useMemo(() => {
    const now = new Date();
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const thisMonthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    
    const thisMonthTransactions = walletTransactions.filter(txn => {
      const txnDate = new Date(txn.date);
      return txnDate >= thisMonth && txnDate <= thisMonthEnd;
    });
    
    const lastMonthTransactions = walletTransactions.filter(txn => {
      const txnDate = new Date(txn.date);
      return txnDate >= lastMonth && txnDate < thisMonth;
    });

    const thisMonthDividends = thisMonthTransactions
      .filter(txn => txn.type === 'dividend')
      .reduce((sum, txn) => sum + (txn.amount || 0), 0);
    
    const thisMonthWithdrawals = thisMonthTransactions
      .filter(txn => txn.type === 'withdrawal')
      .reduce((sum, txn) => sum + Math.abs(txn.amount || 0), 0);
    
    const thisMonthInvestments = thisMonthTransactions
      .filter(txn => txn.type === 'investment')
      .reduce((sum, txn) => sum + Math.abs(txn.amount || 0), 0);

    const lastMonthDividends = lastMonthTransactions
      .filter(txn => txn.type === 'dividend')
      .reduce((sum, txn) => sum + (txn.amount || 0), 0);

    const netFlow = thisMonthDividends - thisMonthWithdrawals - thisMonthInvestments;
    const dividendChange = lastMonthDividends > 0 
      ? ((thisMonthDividends - lastMonthDividends) / lastMonthDividends) * 100 
      : 0;

    return {
      thisMonthDividends,
      thisMonthWithdrawals,
      thisMonthInvestments,
      netFlow,
      dividendChange,
      transactionCount: thisMonthTransactions.length
    };
  }, [walletTransactions]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  
  const spendingBreakdown = useMemo(() => {
    const breakdown = {
      investments: 0,
      withdrawals: 0,
      dividends: 0
    };

    walletTransactions.forEach(txn => {
      const amount = Math.abs(txn.amount || 0);
      if (txn.type === 'investment') breakdown.investments += amount;
      else if (txn.type === 'withdrawal') breakdown.withdrawals += amount;
      else if (txn.type === 'dividend') breakdown.dividends += amount;
    });

    const total = breakdown.investments + breakdown.withdrawals + breakdown.dividends;
    
    return {
      ...breakdown,
      total,
      investmentPercentage: total > 0 ? (breakdown.investments / total) * 100 : 0,
      withdrawalPercentage: total > 0 ? (breakdown.withdrawals / total) * 100 : 0
    };
  }, [walletTransactions]);

  
  const walletInsights = useMemo(() => {
    const insights = [];
    const now = new Date();
    const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    
    
    const recentTransactions = walletTransactions.filter(txn => 
      new Date(txn.date) >= last7Days
    );
    
    
    const recentDividends = walletTransactions.filter(txn => 
      txn.type === 'dividend' && new Date(txn.date) >= last30Days
    ).reduce((sum, t) => sum + (t.amount || 0), 0);
    
    
    const totalDividends = walletTransactions
      .filter(t => t.type === 'dividend')
      .reduce((sum, t) => sum + (t.amount || 0), 0);
    
    
    const last3Months = new Date(now.getFullYear(), now.getMonth() - 3, 1);
    const last3MonthsDividends = walletTransactions
      .filter(t => t.type === 'dividend' && new Date(t.date) >= last3Months)
      .reduce((sum, t) => sum + (t.amount || 0), 0);
    const avgMonthlyDividends = last3MonthsDividends / 3;
    
    
    const totalInvested = walletTransactions
      .filter(t => t.type === 'investment')
      .reduce((sum, t) => sum + Math.abs(t.amount || 0), 0);
    const dividendYield = totalInvested > 0 ? (totalDividends / totalInvested) * 100 : 0;
    
    
    const totalWithdrawals = walletTransactions
      .filter(t => t.type === 'withdrawal')
      .reduce((sum, t) => sum + Math.abs(t.amount || 0), 0);
    const withdrawalRate = totalDividends > 0 ? (totalWithdrawals / totalDividends) * 100 : 0;
    
    
    const balanceHealth = walletData.availableBalance < 100 
      ? 'low' 
      : walletData.availableBalance < 1000 
      ? 'moderate' 
      : 'healthy';
    
    
    const activityLevel = recentTransactions.length === 0 
      ? 'inactive' 
      : recentTransactions.length < 3 
      ? 'low' 
      : recentTransactions.length < 7 
      ? 'moderate' 
      : 'high';
    
    
    if (walletData.availableBalance > 0) {
      insights.push({
        type: 'opportunity',
        icon: 'investment',
        color: '#3b82f6',
        title: 'Investment Ready',
        message: `${formatCurrency(walletData.availableBalance)} available to invest`,
        subMessage: totalInvested > 0 
          ? `Your portfolio yields ${dividendYield.toFixed(1)}% annually`
          : 'Start building your portfolio today',
        priority: walletData.availableBalance >= 1000 ? 'high' : 'medium'
      });
    } else {
      insights.push({
        type: 'info',
        icon: 'investment',
        color: '#6b7280',
        title: 'No Funds Available',
        message: 'Your wallet balance is empty',
        subMessage: 'Funds will appear here from dividend payments',
        priority: 'low'
      });
    }
    
    
    if (totalDividends > 0) {
      const growthRate = avgMonthlyDividends > 0 
        ? ((recentDividends / 30) / avgMonthlyDividends - 1) * 100 
        : 0;
      
      if (growthRate > 10) {
        insights.push({
          type: 'success',
          icon: 'growth',
          color: '#10b981',
          title: 'Strong Earnings Growth',
          message: `Dividends up ${growthRate.toFixed(0)}% this month`,
          subMessage: `Earning ${formatCurrency(recentDividends)} in the last 30 days`,
          priority: 'high'
        });
      } else if (recentDividends > 0) {
        insights.push({
          type: 'info',
          icon: 'dividend',
          color: '#10b981',
          title: 'Active Earnings',
          message: `${formatCurrency(recentDividends)} earned this month`,
          subMessage: `Total lifetime dividends: ${formatCurrency(totalDividends)}`,
          priority: 'medium'
        });
      }
    }
    
    
    if (balanceHealth === 'low' && walletData.availableBalance > 0) {
      insights.push({
        type: 'warning',
        icon: 'balance',
        color: '#f59e0b',
        title: 'Low Balance',
        message: `Only ${formatCurrency(walletData.availableBalance)} remaining`,
        subMessage: 'Consider keeping a reserve for opportunities',
        priority: 'medium'
      });
    }
    
    
    if (walletData.pendingBalance > 0) {
      insights.push({
        type: 'pending',
        icon: 'pending',
        color: '#f59e0b',
        title: 'Pending Transfer',
        message: `${formatCurrency(walletData.pendingBalance)} processing`,
        subMessage: 'Will be available soon',
        priority: 'medium'
      });
    }
    
    
    if (withdrawalRate > 80 && totalDividends > 1000) {
      insights.push({
        type: 'warning',
        icon: 'withdrawal',
        color: '#ef4444',
        title: 'High Withdrawal Rate',
        message: `Withdrawn ${withdrawalRate.toFixed(0)}% of earnings`,
        subMessage: 'Consider reinvesting more to grow your portfolio',
        priority: 'high'
      });
    }
    
    
    if (dividendYield > 5 && totalInvested > 0) {
      insights.push({
        type: 'success',
        icon: 'efficiency',
        color: '#10b981',
        title: 'Strong Portfolio Performance',
        message: `${dividendYield.toFixed(1)}% annual yield`,
        subMessage: `Earning ${formatCurrency(totalDividends)} from ${formatCurrency(totalInvested)} invested`,
        priority: 'high'
      });
    }
    
    
    if (activityLevel === 'inactive' && walletData.availableBalance > 0) {
      insights.push({
        type: 'info',
        icon: 'activity',
        color: '#6b7280',
        title: 'Low Activity',
        message: 'No recent transactions',
        subMessage: 'Consider investing your available balance',
        priority: 'low'
      });
    }
    
    
    if (balanceHealth === 'healthy' && walletData.availableBalance > 5000 && totalInvested > 0) {
      insights.push({
        type: 'opportunity',
        icon: 'optimize',
        color: '#8b5cf6',
        title: 'Optimize Balance',
        message: `Consider investing ${formatCurrency(walletData.availableBalance - 1000)}`,
        subMessage: 'Keep $1,000 reserve for opportunities',
        priority: 'medium'
      });
    }
    
    
    const priorityOrder = { high: 3, medium: 2, low: 1 };
    insights.sort((a, b) => priorityOrder[b.priority] - priorityOrder[a.priority]);
    
    
    return insights.slice(0, 4);
  }, [walletData, walletTransactions]);

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTransactionIcon = (type) => {
    switch (type) {
      case 'withdrawal':
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12H19M12 5V19"/>
            <circle cx="12" cy="12" r="10"/>
          </svg>
        );
      case 'investment':
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2L2 7L12 12L22 7L12 2Z"/>
            <path d="M2 17L12 22L22 17"/>
            <path d="M2 12L12 17L22 12"/>
          </svg>
        );
      case 'dividend':
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2V22M17 5H9.5C8.57174 5 7.6815 5.36875 7.02513 6.02513C6.36875 6.6815 6 7.57174 6 8.5C6 9.42826 6.36875 10.3185 7.02513 10.9749C7.6815 11.6313 8.57174 12 9.5 12H14.5C15.4283 12 16.3185 12.3687 16.9749 13.0251C17.6313 13.6815 18 14.5717 18 15.5C18 16.4283 17.6313 17.3185 16.9749 17.9749C16.3185 18.6313 15.4283 19 14.5 19H6"/>
          </svg>
        );
      default:
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/>
          </svg>
        );
    }
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'completed':
      case 'success':
        return '#10b981';
      case 'pending':
        return '#f59e0b';
      case 'failed':
      case 'error':
        return '#ef4444';
      default:
        return '#6b7280';
    }
  };

  return (
    <div id="wallet" className="page-section active">
      {}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', 
        gap: '16px', 
        marginBottom: '24px' 
      }}>
          {}
          <div style={{
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-primary)',
            borderRadius: '14px',
            padding: '20px',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
              <div>
                <div style={{ fontSize: '12px', color: '#ffffff', opacity: 0.7, marginBottom: '6px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Total Wallet Balance
                </div>
                <div style={{ fontSize: '28px', fontWeight: '700', color: '#ffffff', letterSpacing: '-0.02em', fontVariantNumeric: 'tabular-nums' }}>
                  {formatCurrency(walletData.balance)}
                </div>
              </div>
              <div style={{
                width: '48px',
                height: '48px',
                background: 'rgba(59, 130, 246, 0.15)',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2">
                  <path d="M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"/>
                  <path d="M12 7V12L15 15"/>
                </svg>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingTop: '12px', borderTop: '1px solid var(--border-primary)' }}>
              <div style={{ 
                fontSize: '13px', 
                fontWeight: '600', 
                color: '#10b981',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 12L11 14L15 10"/>
                  <path d="M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"/>
                </svg>
                {formatCurrency(walletData.availableBalance)} available
              </div>
            </div>
          </div>

          {}
          <div style={{
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-primary)',
            borderRadius: '14px',
            padding: '20px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
              <div>
                <div style={{ fontSize: '12px', color: '#ffffff', opacity: 0.7, marginBottom: '6px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Available Now
                </div>
                <div style={{ fontSize: '28px', fontWeight: '700', color: '#ffffff', letterSpacing: '-0.02em', fontVariantNumeric: 'tabular-nums' }}>
                  {formatCurrency(walletData.availableBalance)}
                </div>
              </div>
              <div style={{
                width: '48px',
                height: '48px',
                background: 'rgba(16, 185, 129, 0.15)',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2">
                  <path d="M9 12L11 14L15 10"/>
                  <path d="M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"/>
                </svg>
              </div>
            </div>
            <div style={{ fontSize: '12px', color: '#ffffff', opacity: 0.6, paddingTop: '12px', borderTop: '1px solid var(--border-primary)' }}>
              Ready for transactions
            </div>
          </div>

          {}
          <div style={{
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-primary)',
            borderRadius: '14px',
            padding: '20px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
              <div>
                <div style={{ fontSize: '12px', color: '#ffffff', opacity: 0.7, marginBottom: '6px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Pending
                </div>
                <div style={{ fontSize: '28px', fontWeight: '700', color: '#ffffff', letterSpacing: '-0.02em', fontVariantNumeric: 'tabular-nums' }}>
                  {formatCurrency(walletData.pendingBalance)}
                </div>
              </div>
              <div style={{
                width: '48px',
                height: '48px',
                background: 'rgba(245, 158, 11, 0.15)',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/>
                  <path d="M12 6V12L16 14"/>
                </svg>
              </div>
            </div>
            <div style={{ fontSize: '12px', color: '#ffffff', opacity: 0.6, paddingTop: '12px', borderTop: '1px solid var(--border-primary)' }}>
              Processing transfers
            </div>
          </div>

          {}
          <div style={{
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-primary)',
            borderRadius: '14px',
            padding: '20px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
              <div>
                <div style={{ fontSize: '12px', color: '#ffffff', opacity: 0.7, marginBottom: '6px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Total Dividends
                </div>
                <div style={{ fontSize: '28px', fontWeight: '700', color: '#ffffff', letterSpacing: '-0.02em', fontVariantNumeric: 'tabular-nums' }}>
                  {formatCurrency(walletTransactions.filter(t => t.type === 'dividend').reduce((sum, t) => sum + (t.amount || 0), 0))}
                </div>
              </div>
              <div style={{
                width: '48px',
                height: '48px',
                background: 'rgba(139, 92, 246, 0.15)',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" strokeWidth="2">
                  <path d="M12 2V22M17 5H9.5C8.57174 5 7.6815 5.36875 7.02513 6.02513C6.36875 6.6815 6 7.57174 6 8.5C6 9.42826 6.36875 10.3185 7.02513 10.9749C7.6815 11.6313 8.57174 12 9.5 12H14.5C15.4283 12 16.3185 12.3687 16.9749 13.0251C17.6313 13.6815 18 14.5717 18 15.5C18 16.4283 17.6313 17.3185 16.9749 17.9749C16.3185 18.6313 15.4283 19 14.5 19H6"/>
                </svg>
              </div>
            </div>
            <div style={{ fontSize: '12px', color: '#ffffff', opacity: 0.6, paddingTop: '12px', borderTop: '1px solid var(--border-primary)' }}>
              All-time earnings
            </div>
          </div>
      </div>

      {}
      <div className="overview-grid">
        {}
        <div className="overview-left">
          {}
          <div style={{
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-primary)',
            borderRadius: '14px',
            padding: '16px',
            marginBottom: '12px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
              <div>
                <h2 style={{ fontSize: '16px', fontWeight: '700', color: '#ffffff', marginBottom: '2px', letterSpacing: '-0.01em' }}>
                  Payment Methods
                </h2>
                <p style={{ fontSize: '12px', color: '#ffffff', opacity: 0.7, margin: 0 }}>
                  {connectedAccounts.length} {connectedAccounts.length === 1 ? 'method' : 'methods'} connected
                </p>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
          <button 
                    onClick={() => setShowPlaidLink(true)}
                    className="btn btn-secondary"
                    style={{
                      padding: '10px 16px',
                      fontSize: '13px',
                      fontWeight: '600',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="2" y="4" width="20" height="16" rx="2"/>
                      <path d="M2 10H22"/>
 </svg>
                    Add Bank
          </button>
          <button 
                    onClick={() => setShowStripeForm(true)}
                    className="btn btn-secondary"
                    style={{
                      padding: '10px 16px',
                      fontSize: '13px',
                      fontWeight: '600',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
                      <line x1="1" y1="10" x2="23" y2="10"/>
 </svg>
                    Add Card
          </button>
        </div>
                </div>

                {connectedAccounts.length === 0 ? (
                <div style={{
                  textAlign: 'center',
                  padding: '48px 24px',
                  background: 'var(--bg-tertiary)',
                  borderRadius: '12px',
                  border: '1px solid var(--border-primary)'
                }}>
                  <div style={{
                    width: '64px',
                    height: '64px',
                    margin: '0 auto 20px',
                    borderRadius: '50%',
                    background: 'var(--bg-secondary)',
                    border: '1px solid var(--border-primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#ffffff',
                    opacity: 0.5
                  }}>
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="2" y="4" width="20" height="16" rx="2"/>
                      <path d="M2 10H22"/>
                      </svg>
                    </div>
                  <h4 style={{
                    fontSize: '16px',
                    fontWeight: '700',
                    color: '#ffffff',
                    marginBottom: '8px'
                  }}>
                    No Payment Methods
                  </h4>
                  <p style={{
                    fontSize: '13px',
                    color: '#ffffff',
                    opacity: 0.7,
                    marginBottom: '20px',
                    lineHeight: '1.5'
                  }}>
                    Connect a bank account or add a card to start making investments and withdrawals
                    </p>
                  </div>
                ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '400px', overflowY: 'auto', paddingRight: '4px' }}>
                    {connectedAccounts.map(account => (
                    <div
                      key={account.id}
                      style={{
                        padding: '14px',
                        background: account.primary ? 'var(--bg-secondary)' : 'var(--bg-tertiary)',
                        border: account.primary ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid var(--border-primary)',
                        borderRadius: '12px',
                        transition: 'all 0.2s ease',
                        position: 'relative'
                      }}
                      onMouseEnter={(e) => {
                        if (!account.primary) {
                          e.currentTarget.style.background = 'var(--bg-secondary)';
                          e.currentTarget.style.borderColor = 'var(--border-secondary)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!account.primary) {
                          e.currentTarget.style.background = 'var(--bg-tertiary)';
                          e.currentTarget.style.borderColor = 'var(--border-primary)';
                        }
                      }}
                    >
                      {}
                      {account.primary && (
                        <div style={{
                          position: 'absolute',
                          top: '12px',
                          right: '12px',
                          padding: '3px 8px',
                          background: 'rgba(16, 185, 129, 0.15)',
                          border: '1px solid rgba(16, 185, 129, 0.3)',
                          borderRadius: '6px',
                          fontSize: '10px',
                          fontWeight: '700',
                          color: '#10b981',
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em'
                        }}>
                          Primary
                        </div>
                      )}

                      <div style={{ display: 'flex', gap: '12px', marginBottom: '12px' }}>
                        {}
                        <div style={{
                          width: '44px',
                          height: '44px',
                          borderRadius: '12px',
                          background: account.type === 'bank' ? 'rgba(59, 130, 246, 0.15)' : 'rgba(139, 92, 246, 0.15)',
                          border: `1px solid ${account.type === 'bank' ? 'rgba(59, 130, 246, 0.3)' : 'rgba(139, 92, 246, 0.3)'}`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: account.type === 'bank' ? '#3b82f6' : '#8b5cf6',
                          flexShrink: 0
                        }}>
                          {account.type === 'bank' ? (
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <rect x="2" y="4" width="20" height="16" rx="2"/>
                              <path d="M2 10H22"/>
                            </svg>
                          ) : (
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
                              <line x1="1" y1="10" x2="23" y2="10"/>
                            </svg>
                          )}
                        </div>

                        {}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ marginBottom: '6px' }}>
                            <h4 style={{ 
                              fontSize: '14px', 
                              fontWeight: '700', 
                              color: '#ffffff', 
                              margin: 0,
                              marginBottom: '2px'
                            }}>
                              {account.type === 'bank' 
                                ? (account.bankName || 'Bank Account')
                                : (account.cardBrand || 'Credit Card')
                              }
                            </h4>
                            {(account.type === 'bank' && account.accountHolderName) || (account.type === 'card' && account.nameOnCard) && (
                              <p style={{
                                fontSize: '11px',
                                color: '#ffffff',
                                opacity: 0.6,
                                margin: 0
                              }}>
                                {account.type === 'bank' ? account.accountHolderName : account.nameOnCard}
                              </p>
                            )}
                          </div>
                          
                          <div style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '4px'
                          }}>
                            <div style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px',
                              fontSize: '12px',
                              color: '#ffffff',
                              opacity: 0.8
                            }}>
                              <span style={{ fontWeight: '600', fontSize: '11px' }}>
                                {account.type === 'bank' ? 'Account' : 'Card'}:
                              </span>
                              <span style={{ 
                                fontFamily: 'monospace',
                                letterSpacing: '0.05em',
                                fontSize: '12px'
                              }}>
                                {account.type === 'bank' 
                                  ? (account.maskedAccount || `••••${account.accountNumber || account.last4}`)
                                  : (account.maskedCard || `•••• •••• •••• ${account.last4}`)
                                }
                              </span>
                            </div>
                            
                            <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
                              {account.type === 'bank' && account.accountType && (
                                <div style={{
                                  fontSize: '11px',
                                  color: '#ffffff',
                                  opacity: 0.7
                                }}>
                                  {account.accountType.charAt(0).toUpperCase() + account.accountType.slice(1)}
                                </div>
                              )}
                              
                              {account.type === 'card' && account.expiryDate && (
                                <div style={{
                                  fontSize: '11px',
                                  color: '#ffffff',
                                  opacity: 0.7
                                }}>
                                  Exp: {account.expiryDate}
                                </div>
                              )}
                              
                              {account.connectedDate && (
                                <div style={{
                                  fontSize: '11px',
                                  color: '#ffffff',
                                  opacity: 0.5
                                }}>
                                  Added {new Date(account.connectedDate).toLocaleDateString('en-US', { 
                                    month: 'short', 
                                    day: 'numeric', 
                                    year: 'numeric' 
                                  })}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      {}
                      <div style={{ 
                        display: 'flex', 
                        gap: '8px',
                        paddingTop: '12px',
                        borderTop: '1px solid var(--border-primary)',
                        marginTop: '8px'
                      }}>
                        {!account.primary && (
                          <button 
                            onClick={() => setPrimaryPaymentMethod(account.id)}
                            className="btn btn-secondary"
                            style={{
                              flex: 1,
                              padding: '10px 16px',
                              fontSize: '13px',
                              fontWeight: '600',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '6px'
                            }}
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M9 12L11 14L15 10"/>
                              <path d="M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"/>
                            </svg>
                            Set as Primary
                          </button>
                        )}
                        <button 
                          onClick={() => {
                            setAccountToRemove(account);
                            setShowRemoveConfirm(true);
                          }}
                          data-remove-button="true"
                          type="button"
                          style={{
                            flex: account.primary ? 1 : 'none',
                            padding: '10px 16px',
                            fontSize: '13px',
                            fontWeight: '600',
                            color: '#ef4444',
                            border: '1px solid rgba(239, 68, 68, 0.3)',
                            background: 'rgba(239, 68, 68, 0.05)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '6px',
                            minWidth: account.primary ? 'auto' : '100px',
                            borderRadius: '10px',
                            cursor: 'pointer',
                            transition: 'background 0.2s ease, border-color 0.2s ease',
                            outline: 'none',
                            boxShadow: 'none',
                            fontFamily: 'inherit',
                            lineHeight: '1.5',
                            textTransform: 'none',
                            letterSpacing: 'normal'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.setProperty('background', 'rgba(239, 68, 68, 0.15)', 'important');
                            e.currentTarget.style.setProperty('border-color', 'rgba(239, 68, 68, 0.5)', 'important');
                            e.currentTarget.style.setProperty('color', '#ef4444', 'important');
                            e.currentTarget.style.setProperty('box-shadow', 'none', 'important');
                            e.currentTarget.style.setProperty('transform', 'none', 'important');
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.setProperty('background', 'rgba(239, 68, 68, 0.05)', 'important');
                            e.currentTarget.style.setProperty('border-color', 'rgba(239, 68, 68, 0.3)', 'important');
                            e.currentTarget.style.setProperty('color', '#ef4444', 'important');
                            e.currentTarget.style.setProperty('box-shadow', 'none', 'important');
                            e.currentTarget.style.setProperty('transform', 'none', 'important');
                          }}
                          onFocus={(e) => {
                            e.currentTarget.style.setProperty('background', 'rgba(239, 68, 68, 0.15)', 'important');
                            e.currentTarget.style.setProperty('border-color', 'rgba(239, 68, 68, 0.5)', 'important');
                            e.currentTarget.style.setProperty('color', '#ef4444', 'important');
                            e.currentTarget.style.setProperty('box-shadow', 'none', 'important');
                            e.currentTarget.style.setProperty('outline', 'none', 'important');
                          }}
                          onBlur={(e) => {
                            e.currentTarget.style.setProperty('background', 'rgba(239, 68, 68, 0.05)', 'important');
                            e.currentTarget.style.setProperty('border-color', 'rgba(239, 68, 68, 0.3)', 'important');
                            e.currentTarget.style.setProperty('color', '#ef4444', 'important');
                            e.currentTarget.style.setProperty('box-shadow', 'none', 'important');
                          }}
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                            <path d="M3 6H5H21M8 6V4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V6M19 6V20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 17.5304 22 17 22H7C6.46957 22 5.96086 21.7893 5.58579 21.4142C5.21071 21.0391 5 20.5304 5 20V6H19Z"/>
                            <path d="M10 11V17M14 11V17"/>
                          </svg>
                          <span style={{ whiteSpace: 'nowrap' }}>Remove</span>
                        </button>
                      </div>
                    </div>
                    ))}
                  </div>
                )}
          </div>

          {}
          <div style={{
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-primary)',
            borderRadius: '14px',
            padding: '16px',
            marginBottom: '12px',
            position: 'relative'
          }}>
            <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#ffffff', marginBottom: '2px', letterSpacing: '-0.01em' }}>Quick Actions</h3>
            <p style={{ fontSize: '11px', color: '#ffffff', marginBottom: '12px', opacity: 0.8 }}>Manage your wallet funds</p>
            <div className="metrics-premium-grid" style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '10px' }}>
              <button 
                onClick={() => setShowWithdrawModal(true)}
                className="metric-premium-card"
                style={{ 
                  cursor: 'pointer',
                  textAlign: 'left',
                  width: '100%',
                  borderTop: '3px solid #f59e0b',
                  position: 'relative',
                  overflow: 'hidden',
                  background: 'var(--bg-tertiary)',
                  border: '1px solid var(--border-primary)',
                  borderRadius: '11px',
                  padding: '12px',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'var(--bg-secondary)';
                  e.currentTarget.style.borderColor = 'var(--border-secondary)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 6px 16px rgba(0, 0, 0, 0.12)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'var(--bg-tertiary)';
                  e.currentTarget.style.borderColor = 'var(--border-primary)';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <div className="metric-premium-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '6px', marginBottom: '2px' }}>
                  <div className="metric-premium-label" style={{ fontSize: '10px', color: '#f59e0b', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    WITHDRAW
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10"/>
                      <path d="M12 16V12M12 8H12.01"/>
                    </svg>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                  <div style={{ 
                    width: '28px', 
                    height: '28px', 
                    borderRadius: '6px', 
                    background: 'rgba(245, 158, 11, 0.15)', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2.5">
                      <path d="M5 12H19M12 5V19" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <span style={{ fontSize: '14px', fontWeight: '600', color: '#ffffff' }}>Withdraw Funds</span>
                </div>
              </button>
            </div>
          </div>

          {}
          <div style={{
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-primary)',
            borderRadius: '14px',
            padding: '16px',
            marginTop: '12px'
          }}>
            <h2 style={{ fontSize: '16px', fontWeight: '700', color: '#ffffff', marginBottom: '14px', letterSpacing: '-0.01em' }}>
              Wallet Insights
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {walletInsights.length === 0 ? (
                <div style={{ padding: '12px', background: 'var(--bg-tertiary)', borderRadius: '10px', border: '1px solid var(--border-primary)', textAlign: 'center' }}>
                  <div style={{ fontSize: '11px', color: '#ffffff', opacity: 0.7 }}>
                    No insights available yet
                  </div>
                </div>
              ) : (
                walletInsights.map((insight, index) => {
                  const getIcon = () => {
                    switch (insight.icon) {
                      case 'investment':
                        return (
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <path d="M12 2L2 7L12 12L22 7L12 2Z" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M2 17L12 22L22 17" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M2 12L12 17L22 12" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        );
                      case 'growth':
                        return (
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <path d="M3 17L9 11L13 15L21 7" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M21 7H15V13" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        );
                      case 'dividend':
                        return (
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <path d="M12 2V22M17 5H9.5C8.57174 5 7.6815 5.36875 7.02513 6.02513C6.36875 6.6815 6 7.57174 6 8.5C6 9.42826 6.36875 10.3185 7.02513 10.9749C7.6815 11.6313 8.57174 12 9.5 12H14.5C15.4283 12 16.3185 12.3687 16.9749 13.0251C17.6313 13.6815 18 14.5717 18 15.5C18 16.4283 17.6313 17.3185 16.9749 17.9749C16.3185 18.6313 15.4283 19 14.5 19H6" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        );
                      case 'balance':
                        return (
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <path d="M12 2V22M17 5H9.5C8.57174 5 7.6815 5.36875 7.02513 6.02513C6.36875 6.6815 6 7.57174 6 8.5C6 9.42826 6.36875 10.3185 7.02513 10.9749C7.6815 11.6313 8.57174 12 9.5 12H14.5C15.4283 12 16.3185 12.3687 16.9749 13.0251C17.6313 13.6815 18 14.5717 18 15.5C18 16.4283 17.6313 17.3185 16.9749 17.9749C16.3185 18.6313 15.4283 19 14.5 19H6" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        );
                      case 'pending':
                        return (
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <circle cx="12" cy="12" r="10"/>
                            <path d="M12 6V12L16 14" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        );
                      case 'withdrawal':
                        return (
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <path d="M5 12H19M12 5V19" strokeLinecap="round" strokeLinejoin="round"/>
                            <circle cx="12" cy="12" r="10"/>
                          </svg>
                        );
                      case 'efficiency':
                        return (
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <path d="M13 2L3 14H12L11 22L21 10H12L13 2Z" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        );
                      case 'activity':
                        return (
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <path d="M22 12H18L15 21L9 3L6 12H2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        );
                      case 'optimize':
                        return (
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <path d="M12 2L2 7L12 12L22 7L12 2Z" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M2 17L12 22L22 17" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M2 12L12 17L22 12" strokeLinecap="round" strokeLinejoin="round"/>
                            <circle cx="12" cy="12" r="2"/>
                          </svg>
                        );
                      default:
                        return (
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <circle cx="12" cy="12" r="10"/>
                            <path d="M12 16V12M12 8H12.01" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        );
                    }
                  };
                  
                  const getBackgroundColor = () => {
                    if (insight.type === 'warning') return 'rgba(245, 158, 11, 0.1)';
                    if (insight.type === 'success') return 'rgba(16, 185, 129, 0.1)';
                    if (insight.type === 'pending') return 'rgba(245, 158, 11, 0.1)';
                    if (insight.type === 'opportunity') return 'rgba(139, 92, 246, 0.1)';
                    return 'var(--bg-tertiary)';
                  };
                  
                  const getBorderColor = () => {
                    if (insight.type === 'warning') return 'rgba(245, 158, 11, 0.3)';
                    if (insight.type === 'success') return 'rgba(16, 185, 129, 0.3)';
                    if (insight.type === 'pending') return 'rgba(245, 158, 11, 0.3)';
                    if (insight.type === 'opportunity') return 'rgba(139, 92, 246, 0.3)';
                    return 'var(--border-primary)';
                  };
                  
                  return (
                    <div 
                      key={index}
                      style={{ 
                        padding: '12px', 
                        background: getBackgroundColor(), 
                        borderRadius: '10px', 
                        border: `1px solid ${getBorderColor()}`,
                        transition: 'all 0.2s ease'
                      }}
                      onMouseEnter={(e) => {
                        if (insight.type === 'info') {
                          e.currentTarget.style.background = 'var(--bg-secondary)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (insight.type === 'info') {
                          e.currentTarget.style.background = 'var(--bg-tertiary)';
                        }
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                        <div style={{ 
                          width: '32px', 
                          height: '32px', 
                          borderRadius: '8px', 
                          background: `rgba(${insight.color === '#3b82f6' ? '59, 130, 246' : insight.color === '#10b981' ? '16, 185, 129' : insight.color === '#f59e0b' ? '245, 158, 11' : insight.color === '#ef4444' ? '239, 68, 68' : insight.color === '#8b5cf6' ? '139, 92, 246' : '107, 114, 128'}, 0.15)`, 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center',
                          flexShrink: 0,
                          color: insight.color
                        }}>
                          {getIcon()}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: '12px', fontWeight: '600', color: '#ffffff', marginBottom: '4px' }}>
                            {insight.title}
                          </div>
                          <div style={{ fontSize: '11px', color: '#ffffff', opacity: 0.9, marginBottom: '2px', fontWeight: '500' }}>
                            {insight.message}
                          </div>
                          {insight.subMessage && (
                            <div style={{ fontSize: '10px', color: '#ffffff', opacity: 0.7, lineHeight: '1.4', marginTop: '2px' }}>
                              {insight.subMessage}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {}
        <div className="overview-right">
          {}
          <div style={{
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-primary)',
            borderRadius: '14px',
            padding: '16px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
              <div>
                <h2 style={{ fontSize: '16px', fontWeight: '700', color: '#ffffff', marginBottom: '2px', letterSpacing: '-0.01em' }}>
                  Recent Transactions
                </h2>
                <p style={{ fontSize: '12px', color: '#ffffff', opacity: 0.7, margin: 0 }}>
                  {filteredTransactions.length} {filteredTransactions.length === 1 ? 'transaction' : 'transactions'}
                </p>
              </div>
                <select
                  value={transactionFilter}
                  onChange={(e) => setTransactionFilter(e.target.value)}
                  style={{
                    padding: '8px 12px',
                    background: 'var(--bg-tertiary)',
                    border: '1px solid var(--border-primary)',
                    borderRadius: '8px',
                    color: '#ffffff',
                    fontSize: '13px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    outline: 'none',
                    minWidth: '140px',
                    transition: 'all 0.2s ease'
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = 'var(--border-secondary)';
                    e.currentTarget.style.background = 'var(--bg-secondary)';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = 'var(--border-primary)';
                    e.currentTarget.style.background = 'var(--bg-tertiary)';
                  }}
                >
                  <option value="all">All Types</option>
                  <option value="withdrawal">Withdrawals</option>
                  <option value="investment">Investments</option>
                  <option value="dividend">Dividends</option>
                </select>
            </div>
            <div style={{ marginBottom: '12px' }}>
              <input
                type="text"
                placeholder="Search transactions..."
                value={transactionSearch}
                onChange={(e) => setTransactionSearch(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  background: 'var(--bg-tertiary)',
                  border: '1px solid var(--border-primary)',
                  borderRadius: '8px',
                  color: '#ffffff',
                  fontSize: '12px',
                  outline: 'none',
                  transition: 'all 0.2s ease'
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = 'var(--border-secondary)';
                  e.currentTarget.style.background = 'var(--bg-secondary)';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = 'var(--border-primary)';
                  e.currentTarget.style.background = 'var(--bg-tertiary)';
                }}
              />
            </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '380px', overflowY: 'auto', paddingRight: '4px' }}>
                {filteredTransactions.length === 0 ? (
                  <div style={{
                    textAlign: 'center',
                    padding: '48px 24px',
                    background: 'var(--bg-tertiary)',
                    borderRadius: '12px',
                    border: '1px solid var(--border-primary)'
                  }}>
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ margin: '0 auto 16px', opacity: 0.5, color: '#ffffff' }}>
                      <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                    <p style={{ fontSize: '14px', color: '#ffffff', opacity: 0.7, margin: 0 }}>No transactions found</p>
                      </div>
                ) : (
                  filteredTransactions.slice(0, 8).map(transaction => (
                    <div
                      key={transaction.id}
                      style={{
                        padding: '12px',
                        background: 'var(--bg-tertiary)',
                        border: '1px solid var(--border-primary)',
                        borderRadius: '10px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        transition: 'all 0.2s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'var(--bg-secondary)';
                        e.currentTarget.style.borderColor = 'var(--border-secondary)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'var(--bg-tertiary)';
                        e.currentTarget.style.borderColor = 'var(--border-primary)';
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1 }}>
                        <div style={{
                          width: '36px',
                          height: '36px',
                          borderRadius: '8px',
                          background: transaction.type === 'dividend' 
                            ? 'rgba(16, 185, 129, 0.1)' 
                            : transaction.type === 'withdrawal'
                            ? 'rgba(239, 68, 68, 0.1)'
                            : 'rgba(59, 130, 246, 0.1)',
                          border: `1px solid ${transaction.type === 'dividend' 
                            ? 'rgba(16, 185, 129, 0.2)' 
                            : transaction.type === 'withdrawal'
                            ? 'rgba(239, 68, 68, 0.2)'
                            : 'rgba(59, 130, 246, 0.2)'}`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: transaction.type === 'dividend' 
                            ? '#10b981' 
                            : transaction.type === 'withdrawal'
                            ? '#ef4444'
                            : '#3b82f6',
                          flexShrink: 0
                        }}>
                          {getTransactionIcon(transaction.type)}
                      </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: '13px', fontWeight: '600', color: '#ffffff', marginBottom: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {transaction.description}
                  </div>
                          <div style={{ fontSize: '11px', color: '#ffffff', opacity: 0.7 }}>
                            {new Date(transaction.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </div>
              </div>
            </div>
                      <div style={{ textAlign: 'right', flexShrink: 0 }}>
                        <div style={{
                          fontSize: '14px',
                          fontWeight: '700',
                          color: transaction.type === 'dividend' 
                            ? '#10b981' 
                            : '#ef4444',
                          marginBottom: '2px',
                          fontVariantNumeric: 'tabular-nums'
                        }}>
                          {transaction.type === 'dividend' ? '+' : '-'}
                          {formatCurrency(Math.abs(transaction.amount))}
                        </div>
                        <div style={{
                          fontSize: '10px',
                          color: getStatusColor(transaction.status),
                          textTransform: 'capitalize',
                          fontWeight: '600'
                        }}>
                          {transaction.status}
                        </div>
                      </div>
                    </div>
                  ))
                )}
            </div>
          </div>

          {}
          <div style={{
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-primary)',
            borderRadius: '14px',
            padding: '16px',
            marginTop: '12px'
          }}>
            <h2 style={{ fontSize: '16px', fontWeight: '700', color: '#ffffff', marginBottom: '14px', letterSpacing: '-0.01em' }}>
              This Month
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginBottom: '10px' }}>
              <div style={{ padding: '10px', background: 'var(--bg-tertiary)', borderRadius: '10px', border: '1px solid var(--border-primary)' }}>
                <div style={{ fontSize: '10px', color: '#ffffff', opacity: 0.7, marginBottom: '4px', fontWeight: '600' }}>Dividends</div>
                <div style={{ fontSize: '14px', fontWeight: '700', color: '#10b981', fontVariantNumeric: 'tabular-nums' }}>
                  {formatCurrency(walletStats.thisMonthDividends)}
                </div>
              </div>
              <div style={{ padding: '10px', background: 'var(--bg-tertiary)', borderRadius: '10px', border: '1px solid var(--border-primary)' }}>
                <div style={{ fontSize: '10px', color: '#ffffff', opacity: 0.7, marginBottom: '4px', fontWeight: '600' }}>Withdrawals</div>
                <div style={{ fontSize: '14px', fontWeight: '700', color: '#ef4444', fontVariantNumeric: 'tabular-nums' }}>
                  {formatCurrency(walletStats.thisMonthWithdrawals)}
                </div>
              </div>
              <div style={{ padding: '10px', background: 'var(--bg-tertiary)', borderRadius: '10px', border: '1px solid var(--border-primary)' }}>
                <div style={{ fontSize: '10px', color: '#ffffff', opacity: 0.7, marginBottom: '4px', fontWeight: '600' }}>Invested</div>
                <div style={{ fontSize: '14px', fontWeight: '700', color: '#3b82f6', fontVariantNumeric: 'tabular-nums' }}>
                  {formatCurrency(walletStats.thisMonthInvestments)}
                </div>
              </div>
            </div>
            <div style={{ 
              padding: '12px', 
              background: walletStats.netFlow >= 0 ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)', 
              borderRadius: '10px', 
              border: `1px solid ${walletStats.netFlow >= 0 ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: '10px', color: '#ffffff', opacity: 0.7, marginBottom: '4px', fontWeight: '600', textTransform: 'uppercase' }}>
                    Net Flow
                  </div>
                  <div style={{ 
                    fontSize: '18px', 
                    fontWeight: '700', 
                    color: walletStats.netFlow >= 0 ? '#10b981' : '#ef4444',
                    fontVariantNumeric: 'tabular-nums'
                  }}>
                    {walletStats.netFlow >= 0 ? '+' : ''}{formatCurrency(walletStats.netFlow)}
                  </div>
                </div>
                <div style={{ fontSize: '11px', color: '#ffffff', opacity: 0.6, textAlign: 'right' }}>
                  {walletStats.transactionCount} {walletStats.transactionCount === 1 ? 'txn' : 'txns'}
                </div>
              </div>
            </div>
          </div>

          {}
          {spendingBreakdown.total > 0 && (
            <div style={{
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-primary)',
              borderRadius: '14px',
              padding: '16px',
              marginTop: '12px'
            }}>
              <h2 style={{ fontSize: '16px', fontWeight: '700', color: '#ffffff', marginBottom: '14px', letterSpacing: '-0.01em' }}>
                Spending Breakdown
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <span style={{ fontSize: '11px', color: '#ffffff', opacity: 0.7 }}>Investments</span>
                    <span style={{ fontSize: '12px', fontWeight: '700', color: '#ffffff', fontVariantNumeric: 'tabular-nums' }}>
                      {formatCurrency(spendingBreakdown.investments)}
                    </span>
                  </div>
                  <div style={{ 
                    width: '100%', 
                    height: '5px', 
                    background: 'var(--bg-tertiary)', 
                    borderRadius: '3px', 
                    overflow: 'hidden'
                  }}>
                    <div style={{ 
                      width: `${spendingBreakdown.investmentPercentage}%`, 
                      height: '100%', 
                      background: 'linear-gradient(90deg, #3b82f6, #2563eb)',
                      transition: 'width 0.3s ease'
                    }}></div>
                  </div>
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <span style={{ fontSize: '11px', color: '#ffffff', opacity: 0.7 }}>Withdrawals</span>
                    <span style={{ fontSize: '12px', fontWeight: '700', color: '#ffffff', fontVariantNumeric: 'tabular-nums' }}>
                      {formatCurrency(spendingBreakdown.withdrawals)}
                    </span>
                  </div>
                  <div style={{ 
                    width: '100%', 
                    height: '5px', 
                    background: 'var(--bg-tertiary)', 
                    borderRadius: '3px', 
                    overflow: 'hidden'
                  }}>
                    <div style={{ 
                      width: `${spendingBreakdown.withdrawalPercentage}%`, 
                      height: '100%', 
                      background: 'linear-gradient(90deg, #ef4444, #dc2626)',
                      transition: 'width 0.3s ease'
                    }}></div>
                  </div>
                </div>

                <div style={{ 
                  padding: '10px', 
                  background: 'var(--bg-tertiary)', 
                  borderRadius: '8px', 
                  border: '1px solid var(--border-primary)',
                  marginTop: '2px'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '11px', color: '#ffffff', opacity: 0.7 }}>Total Activity</span>
                    <span style={{ fontSize: '14px', fontWeight: '700', color: '#ffffff', fontVariantNumeric: 'tabular-nums' }}>
                      {formatCurrency(spendingBreakdown.total)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>

        {}
        {mounted && showWithdrawModal && createPortal(
          <div 
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0, 0, 0, 0.8)',
              backdropFilter: 'blur(8px)',
              zIndex: 10000,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '20px',
              animation: 'fadeIn 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
            }}
            onClick={() => setShowWithdrawModal(false)}
          >
            <div 
              onClick={(e) => e.stopPropagation()} 
              style={{
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-primary)',
                borderRadius: '20px',
                padding: '48px',
                maxWidth: '700px',
                width: '100%',
                maxHeight: '90vh',
                overflowY: 'auto',
                display: 'flex',
                flexDirection: 'column',
                animation: 'modalSlideIn 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
              }}
            >
              {}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '36px' }}>
                <div style={{ flex: 1 }}>
                  <h2 style={{ 
                    fontSize: '28px', 
                    fontWeight: '700', 
                    color: '#ffffff', 
                    margin: 0,
                    marginBottom: '10px'
                  }}>
                    Withdraw Funds
                  </h2>
                  <p style={{
                    fontSize: '15px',
                    color: '#ffffff',
                    opacity: 0.7,
                    margin: 0,
                    lineHeight: '1.5'
                  }}>
                    Transfer funds from your wallet to your bank account
                  </p>
                </div>
                <button 
                  onClick={() => setShowWithdrawModal(false)}
                  style={{
                    background: 'var(--bg-tertiary)',
                    border: '1px solid var(--border-primary)',
                    color: '#ffffff',
                    fontSize: '24px',
                    cursor: 'pointer',
                    padding: '0',
                    width: '40px',
                    height: '40px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '12px',
                    transition: 'all 0.2s ease',
                    flexShrink: 0,
                    marginLeft: '20px'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'var(--bg-primary)';
                    e.currentTarget.style.borderColor = 'var(--border-secondary)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'var(--bg-tertiary)';
                    e.currentTarget.style.borderColor = 'var(--border-primary)';
                  }}
                >
                  ×
                </button>
              </div>

              {}
              <form onSubmit={handleWithdrawalSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{
                  background: 'var(--bg-tertiary)',
                  border: '1px solid var(--border-primary)',
                  borderRadius: '16px',
                  padding: '32px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '20px'
                }}>
                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '14px',
                      fontWeight: '600',
                      color: '#ffffff',
                      marginBottom: '8px'
                    }}>
                      Amount *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0.01"
                      max={walletData.availableBalance}
                      value={withdrawForm.amount}
                      onChange={(e) => setWithdrawForm({ ...withdrawForm, amount: e.target.value })}
                      placeholder="0.00"
                      required
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        background: 'var(--bg-secondary)',
                        border: '1px solid var(--border-primary)',
                        borderRadius: '10px',
                        color: '#ffffff',
                        fontSize: '15px',
                        outline: 'none',
                        transition: 'all 0.2s ease'
                      }}
                      onFocus={(e) => e.target.style.borderColor = 'var(--accent-green)'}
                      onBlur={(e) => e.target.style.borderColor = 'var(--border-primary)'}
                    />
                    <div style={{ fontSize: '12px', color: '#ffffff', opacity: 0.7, marginTop: '6px' }}>
                      Available: {formatCurrency(walletData.availableBalance)}
                    </div>
                  </div>

                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '14px',
                      fontWeight: '600',
                      color: '#ffffff',
                      marginBottom: '8px'
                    }}>
                      Withdraw To *
                    </label>
                    <select
                      value={withdrawForm.accountId}
                      onChange={(e) => setWithdrawForm({ ...withdrawForm, accountId: e.target.value })}
                      required
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        background: 'var(--bg-secondary)',
                        border: '1px solid var(--border-primary)',
                        borderRadius: '10px',
                        color: '#ffffff',
                        fontSize: '15px',
                        outline: 'none',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                      }}
                      onFocus={(e) => e.target.style.borderColor = 'var(--accent-green)'}
                      onBlur={(e) => e.target.style.borderColor = 'var(--border-primary)'}
                    >
                      <option value="">Select a bank account</option>
                      {connectedAccounts.filter(acc => acc.type === 'bank').map(acc => {
                        const bankName = acc.bankName || 'Bank Account';
                        const last4 = acc.accountNumber || acc.last4 || '';
                        return (
                          <option key={acc.id} value={acc.id}>
                            {bankName} •••• {last4}
                          </option>
                        );
                      })}
                    </select>
                  </div>

                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '14px',
                      fontWeight: '600',
                      color: '#ffffff',
                      marginBottom: '8px'
                    }}>
                      Description (Optional)
                    </label>
                    <input
                      type="text"
                      value={withdrawForm.description}
                      onChange={(e) => setWithdrawForm({ ...withdrawForm, description: e.target.value })}
                      placeholder="Add a note for your records..."
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        background: 'var(--bg-secondary)',
                        border: '1px solid var(--border-primary)',
                        borderRadius: '10px',
                        color: '#ffffff',
                        fontSize: '15px',
                        outline: 'none',
                        transition: 'all 0.2s ease'
                      }}
                      onFocus={(e) => e.target.style.borderColor = 'var(--accent-green)'}
                      onBlur={(e) => e.target.style.borderColor = 'var(--border-primary)'}
                    />
                  </div>
                </div>

                {}
                <div style={{
                  background: 'rgba(34, 197, 94, 0.1)',
                  border: '1px solid rgba(34, 197, 94, 0.2)',
                  borderRadius: '12px',
                  padding: '16px',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '12px'
                }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#22c55e', flexShrink: 0, marginTop: '2px' }}>
                    <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"/>
                    <path d="M12 8V12M12 16H12.01"/>
                  </svg>
                  <p style={{
                    fontSize: '13px',
                    color: '#ffffff',
                    opacity: 0.8,
                    margin: 0,
                    lineHeight: '1.5'
                  }}>
                    Withdrawals are processed securely within 1-3 business days. You'll receive a confirmation once the transfer is complete.
                  </p>
                </div>

                {}
                <div style={{ display: 'flex', gap: '14px', marginTop: '8px' }}>
                  <button
                    type="button"
                    onClick={() => {
                      setShowWithdrawModal(false);
                      setWithdrawForm({ amount: '', accountId: '', description: '' });
                    }}
                    className="btn btn-secondary"
                    style={{ flex: 1, padding: '16px', fontSize: '15px', fontWeight: '600' }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    style={{ flex: 1, padding: '16px', fontSize: '15px', fontWeight: '600' }}
                  >
                    Withdraw {withdrawForm.amount ? formatCurrency(parseFloat(withdrawForm.amount)) : 'Funds'}
                  </button>
                </div>
              </form>
            </div>
          </div>,
          document.body
        )}

        {}
        {mounted && showPlaidLink && createPortal(
          <div 
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0, 0, 0, 0.8)',
              backdropFilter: 'blur(8px)',
              zIndex: 10000,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '20px',
              animation: 'fadeIn 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
            }}
            onClick={() => setShowPlaidLink(false)}
          >
            <div 
              onClick={(e) => e.stopPropagation()} 
              style={{
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-primary)',
                borderRadius: '20px',
                padding: '48px',
                maxWidth: '700px',
                width: '100%',
                maxHeight: '90vh',
                overflowY: 'auto',
                display: 'flex',
                flexDirection: 'column',
                animation: 'modalSlideIn 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
              }}
            >
              {}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '36px' }}>
                <div style={{ flex: 1 }}>
                  <h2 style={{ 
                    fontSize: '28px', 
                    fontWeight: '700', 
                    color: '#ffffff', 
                    margin: 0,
                    marginBottom: '10px'
                  }}>
                    Add Bank Account
                  </h2>
                  <p style={{
                    fontSize: '15px',
                    color: '#ffffff',
                    opacity: 0.7,
                    margin: 0,
                    lineHeight: '1.5'
                  }}>
                    Securely add your bank account information
                  </p>
                </div>
                <button 
                  onClick={() => setShowPlaidLink(false)}
                  style={{
                    background: 'var(--bg-tertiary)',
                    border: '1px solid var(--border-primary)',
                    color: '#ffffff',
                    fontSize: '24px',
                    cursor: 'pointer',
                    padding: '0',
                    width: '40px',
                    height: '40px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '12px',
                    transition: 'all 0.2s ease',
                    flexShrink: 0,
                    marginLeft: '20px'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'var(--bg-primary)';
                    e.currentTarget.style.borderColor = 'var(--border-secondary)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'var(--bg-tertiary)';
                    e.currentTarget.style.borderColor = 'var(--border-primary)';
                  }}
                >
                  ×
                </button>
              </div>

              {}
              <form onSubmit={handleBankSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{
                  background: 'var(--bg-tertiary)',
                  border: '1px solid var(--border-primary)',
                  borderRadius: '16px',
                  padding: '32px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '20px'
                }}>
                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '14px',
                      fontWeight: '600',
                      color: '#ffffff',
                      marginBottom: '8px'
                    }}>
                      Bank Name *
                    </label>
                    <input
                      type="text"
                      value={bankForm.bankName}
                      onChange={(e) => setBankForm({ ...bankForm, bankName: e.target.value })}
                      placeholder="e.g., Chase, Bank of America"
                      required
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        background: 'var(--bg-secondary)',
                        border: '1px solid var(--border-primary)',
                        borderRadius: '10px',
                        color: '#ffffff',
                        fontSize: '15px',
                        outline: 'none',
                        transition: 'all 0.2s ease'
                      }}
                      onFocus={(e) => e.target.style.borderColor = 'var(--accent-blue)'}
                      onBlur={(e) => e.target.style.borderColor = 'var(--border-primary)'}
                    />
                  </div>

                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '14px',
                      fontWeight: '600',
                      color: '#ffffff',
                      marginBottom: '8px'
                    }}>
                      Account Holder Name *
                    </label>
                    <input
                      type="text"
                      value={bankForm.accountHolderName}
                      onChange={(e) => setBankForm({ ...bankForm, accountHolderName: e.target.value })}
                      placeholder="Full name as it appears on account"
                      required
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        background: 'var(--bg-secondary)',
                        border: '1px solid var(--border-primary)',
                        borderRadius: '10px',
                        color: '#ffffff',
                        fontSize: '15px',
                        outline: 'none',
                        transition: 'all 0.2s ease'
                      }}
                      onFocus={(e) => e.target.style.borderColor = 'var(--accent-blue)'}
                      onBlur={(e) => e.target.style.borderColor = 'var(--border-primary)'}
                    />
                  </div>

                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '14px',
                      fontWeight: '600',
                      color: '#ffffff',
                      marginBottom: '8px'
                    }}>
                      Account Type *
                    </label>
                    <select
                      value={bankForm.accountType}
                      onChange={(e) => setBankForm({ ...bankForm, accountType: e.target.value })}
                      required
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        background: 'var(--bg-secondary)',
                        border: '1px solid var(--border-primary)',
                        borderRadius: '10px',
                        color: '#ffffff',
                        fontSize: '15px',
                        outline: 'none',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                      }}
                      onFocus={(e) => e.target.style.borderColor = 'var(--accent-blue)'}
                      onBlur={(e) => e.target.style.borderColor = 'var(--border-primary)'}
                    >
                      <option value="checking">Checking</option>
                      <option value="savings">Savings</option>
                    </select>
                  </div>

                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '14px',
                      fontWeight: '600',
                      color: '#ffffff',
                      marginBottom: '8px'
                    }}>
                      Routing Number *
                    </label>
                    <input
                      type="text"
                      value={bankForm.routingNumber}
                      onChange={(e) => setBankForm({ ...bankForm, routingNumber: e.target.value.replace(/\D/g, '').slice(0, 9) })}
                      placeholder="9-digit routing number"
                      required
                      maxLength="9"
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        background: 'var(--bg-secondary)',
                        border: '1px solid var(--border-primary)',
                        borderRadius: '10px',
                        color: '#ffffff',
                        fontSize: '15px',
                        outline: 'none',
                        transition: 'all 0.2s ease'
                      }}
                      onFocus={(e) => e.target.style.borderColor = 'var(--accent-blue)'}
                      onBlur={(e) => e.target.style.borderColor = 'var(--border-primary)'}
                    />
                  </div>

                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '14px',
                      fontWeight: '600',
                      color: '#ffffff',
                      marginBottom: '8px'
                    }}>
                      Account Number *
                    </label>
                    <input
                      type="text"
                      value={bankForm.accountNumber}
                      onChange={(e) => setBankForm({ ...bankForm, accountNumber: e.target.value.replace(/\D/g, '') })}
                      placeholder="Account number"
                      required
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        background: 'var(--bg-secondary)',
                        border: '1px solid var(--border-primary)',
                        borderRadius: '10px',
                        color: '#ffffff',
                        fontSize: '15px',
                        outline: 'none',
                        transition: 'all 0.2s ease'
                      }}
                      onFocus={(e) => e.target.style.borderColor = 'var(--accent-blue)'}
                      onBlur={(e) => e.target.style.borderColor = 'var(--border-primary)'}
                    />
                  </div>
                </div>

                {}
                <div style={{
                  background: 'rgba(59, 130, 246, 0.1)',
                  border: '1px solid rgba(59, 130, 246, 0.2)',
                  borderRadius: '12px',
                  padding: '16px',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '12px'
                }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#3b82f6', flexShrink: 0, marginTop: '2px' }}>
                    <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"/>
                    <path d="M12 8V12M12 16H12.01"/>
                  </svg>
                  <p style={{
                    fontSize: '13px',
                    color: '#ffffff',
                    opacity: 0.8,
                    margin: 0,
                    lineHeight: '1.5'
                  }}>
                    Your bank information is encrypted and securely stored. We only store the last 4 digits of your account number for identification purposes.
                  </p>
                </div>

                {}
                <div style={{ display: 'flex', gap: '14px', marginTop: '8px' }}>
                  <button
                    type="button"
                    onClick={() => {
                      setShowPlaidLink(false);
                      setBankForm({ bankName: '', accountHolderName: '', accountNumber: '', routingNumber: '', accountType: 'checking' });
                    }}
                    className="btn btn-secondary"
                    style={{ flex: 1, padding: '16px', fontSize: '15px', fontWeight: '600' }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    style={{ flex: 1, padding: '16px', fontSize: '15px', fontWeight: '600' }}
                  >
                    Add Bank Account
                  </button>
                </div>
              </form>
            </div>
          </div>,
          document.body
        )}

        {}
        {mounted && showStripeForm && createPortal(
          <div 
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0, 0, 0, 0.8)',
              backdropFilter: 'blur(8px)',
              zIndex: 10000,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '20px',
              animation: 'fadeIn 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
            }}
            onClick={() => setShowStripeForm(false)}
          >
            <div 
              onClick={(e) => e.stopPropagation()} 
              style={{
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-primary)',
                borderRadius: '20px',
                padding: '48px',
                maxWidth: '700px',
                width: '100%',
                maxHeight: '90vh',
                overflowY: 'auto',
                display: 'flex',
                flexDirection: 'column',
                animation: 'modalSlideIn 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
              }}
            >
              {}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '36px' }}>
                <div style={{ flex: 1 }}>
                  <h2 style={{ 
                    fontSize: '28px', 
                    fontWeight: '700', 
                    color: '#ffffff', 
                    margin: 0,
                    marginBottom: '10px'
                  }}>
                    Add Credit Card
                  </h2>
                  <p style={{
                    fontSize: '15px',
                    color: '#ffffff',
                    opacity: 0.7,
                    margin: 0,
                    lineHeight: '1.5'
                  }}>
                    Securely add your credit card information
                  </p>
                </div>
                <button
                  onClick={() => {
                    setShowStripeForm(false);
                    setCardForm({ cardNumber: '', expiryDate: '', cvv: '', nameOnCard: '', zipCode: '' });
                  }}
                  style={{
                    background: 'var(--bg-tertiary)',
                    border: '1px solid var(--border-primary)',
                    color: '#ffffff',
                    fontSize: '24px',
                    cursor: 'pointer',
                    padding: '0',
                    width: '40px',
                    height: '40px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '12px',
                    transition: 'all 0.2s ease',
                    flexShrink: 0,
                    marginLeft: '20px'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'var(--bg-primary)';
                    e.currentTarget.style.borderColor = 'var(--border-secondary)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'var(--bg-tertiary)';
                    e.currentTarget.style.borderColor = 'var(--border-primary)';
                  }}
                >
                  ×
                </button>
              </div>

              {}
              <form onSubmit={handleCardSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{
                  background: 'var(--bg-tertiary)',
                  border: '1px solid var(--border-primary)',
                  borderRadius: '16px',
                  padding: '32px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '20px'
                }}>
                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '14px',
                      fontWeight: '600',
                      color: '#ffffff',
                      marginBottom: '8px'
                    }}>
                      Card Number *
                    </label>
                    <input
                      type="text"
                      value={cardForm.cardNumber}
                      onChange={(e) => setCardForm({ ...cardForm, cardNumber: formatCardNumber(e.target.value) })}
                      placeholder="1234 5678 9012 3456"
                      required
                      maxLength="19"
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        background: 'var(--bg-secondary)',
                        border: '1px solid var(--border-primary)',
                        borderRadius: '10px',
                        color: '#ffffff',
                        fontSize: '15px',
                        outline: 'none',
                        transition: 'all 0.2s ease'
                      }}
                      onFocus={(e) => e.target.style.borderColor = 'var(--accent-blue)'}
                      onBlur={(e) => e.target.style.borderColor = 'var(--border-primary)'}
                    />
                  </div>

                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '14px',
                      fontWeight: '600',
                      color: '#ffffff',
                      marginBottom: '8px'
                    }}>
                      Name on Card *
                    </label>
                    <input
                      type="text"
                      value={cardForm.nameOnCard}
                      onChange={(e) => setCardForm({ ...cardForm, nameOnCard: e.target.value })}
                      placeholder="John Doe"
                      required
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        background: 'var(--bg-secondary)',
                        border: '1px solid var(--border-primary)',
                        borderRadius: '10px',
                        color: '#ffffff',
                        fontSize: '15px',
                        outline: 'none',
                        transition: 'all 0.2s ease'
                      }}
                      onFocus={(e) => e.target.style.borderColor = 'var(--accent-blue)'}
                      onBlur={(e) => e.target.style.borderColor = 'var(--border-primary)'}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '16px' }}>
                    <div>
                      <label style={{
                        display: 'block',
                        fontSize: '14px',
                        fontWeight: '600',
                        color: '#ffffff',
                        marginBottom: '8px'
                      }}>
                        Expiry Date *
                      </label>
                      <input
                        type="text"
                        value={cardForm.expiryDate}
                        onChange={(e) => setCardForm({ ...cardForm, expiryDate: formatExpiryDate(e.target.value) })}
                        placeholder="MM/YY"
                        required
                        maxLength="5"
                        style={{
                          width: '100%',
                          padding: '12px 16px',
                          background: 'var(--bg-secondary)',
                          border: '1px solid var(--border-primary)',
                          borderRadius: '10px',
                          color: '#ffffff',
                          fontSize: '15px',
                          outline: 'none',
                          transition: 'all 0.2s ease'
                        }}
                        onFocus={(e) => e.target.style.borderColor = 'var(--accent-blue)'}
                        onBlur={(e) => e.target.style.borderColor = 'var(--border-primary)'}
                      />
                    </div>

                    <div>
                      <label style={{
                        display: 'block',
                        fontSize: '14px',
                        fontWeight: '600',
                        color: '#ffffff',
                        marginBottom: '8px'
                      }}>
                        CVV *
                      </label>
                      <input
                        type="text"
                        value={cardForm.cvv}
                        onChange={(e) => setCardForm({ ...cardForm, cvv: e.target.value.replace(/\D/g, '').slice(0, 4) })}
                        placeholder="123"
                        required
                        maxLength="4"
                        style={{
                          width: '100%',
                          padding: '12px 16px',
                          background: 'var(--bg-secondary)',
                          border: '1px solid var(--border-primary)',
                          borderRadius: '10px',
                          color: '#ffffff',
                          fontSize: '15px',
                          outline: 'none',
                          transition: 'all 0.2s ease'
                        }}
                        onFocus={(e) => e.target.style.borderColor = 'var(--accent-blue)'}
                        onBlur={(e) => e.target.style.borderColor = 'var(--border-primary)'}
                      />
                    </div>

                    <div>
                      <label style={{
                        display: 'block',
                        fontSize: '14px',
                        fontWeight: '600',
                        color: '#ffffff',
                        marginBottom: '8px'
                      }}>
                        ZIP Code *
                      </label>
                      <input
                        type="text"
                        value={cardForm.zipCode}
                        onChange={(e) => setCardForm({ ...cardForm, zipCode: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                        placeholder="12345"
                        required
                        maxLength="10"
                        style={{
                          width: '100%',
                          padding: '12px 16px',
                          background: 'var(--bg-secondary)',
                          border: '1px solid var(--border-primary)',
                          borderRadius: '10px',
                          color: '#ffffff',
                          fontSize: '15px',
                          outline: 'none',
                          transition: 'all 0.2s ease'
                        }}
                        onFocus={(e) => e.target.style.borderColor = 'var(--accent-blue)'}
                        onBlur={(e) => e.target.style.borderColor = 'var(--border-primary)'}
                      />
                    </div>
                  </div>
                </div>

                {}
                <div style={{
                  background: 'rgba(139, 92, 246, 0.1)',
                  border: '1px solid rgba(139, 92, 246, 0.2)',
                  borderRadius: '12px',
                  padding: '16px',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '12px'
                }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#8b5cf6', flexShrink: 0, marginTop: '2px' }}>
                    <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"/>
                    <path d="M12 8V12M12 16H12.01"/>
                  </svg>
                  <p style={{
                    fontSize: '13px',
                    color: '#ffffff',
                    opacity: 0.8,
                    margin: 0,
                    lineHeight: '1.5'
                  }}>
                    Your card information is encrypted and securely stored. We only store the last 4 digits and card brand for identification purposes.
                  </p>
                </div>

                {}
                <div style={{ display: 'flex', gap: '14px', marginTop: '8px' }}>
                  <button
                    type="button"
                    onClick={() => {
                      setShowStripeForm(false);
                      setCardForm({ cardNumber: '', expiryDate: '', cvv: '', nameOnCard: '', zipCode: '' });
                    }}
                    className="btn btn-secondary"
                    style={{ flex: 1, padding: '16px', fontSize: '15px', fontWeight: '600' }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    style={{ flex: 1, padding: '16px', fontSize: '15px', fontWeight: '600' }}
                  >
                    Add Credit Card
                  </button>
                </div>
              </form>
            </div>
          </div>,
          document.body
        )}

        {}
        {mounted && showRemoveConfirm && accountToRemove && createPortal(
          <div 
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0, 0, 0, 0.8)',
              backdropFilter: 'blur(8px)',
              zIndex: 10001,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '20px'
            }}
            onClick={() => {
              setShowRemoveConfirm(false);
              setAccountToRemove(null);
            }}
          >
            <div 
              onClick={(e) => e.stopPropagation()} 
              style={{
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-primary)',
                borderRadius: '20px',
                padding: '40px',
                maxWidth: '500px',
                width: '100%',
                display: 'flex',
                flexDirection: 'column'
              }}
            >
              {}
              <div style={{
                width: '80px',
                height: '80px',
                margin: '0 auto 24px',
                borderRadius: '50%',
                background: 'rgba(239, 68, 68, 0.15)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ef4444'
              }}>
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 9V13M12 17H12.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"/>
                </svg>
              </div>

              {}
              <h2 style={{
                fontSize: '24px',
                fontWeight: '700',
                color: '#ffffff',
                textAlign: 'center',
                margin: 0,
                marginBottom: '12px'
              }}>
                Remove Payment Method?
              </h2>

              {}
              <p style={{
                fontSize: '15px',
                color: '#ffffff',
                opacity: 0.7,
                textAlign: 'center',
                margin: 0,
                marginBottom: '32px',
                lineHeight: '1.6'
              }}>
                Are you sure you want to remove this {accountToRemove.type === 'bank' ? 'bank account' : 'credit card'}? This action cannot be undone.
              </p>

              {}
              <div style={{
                background: 'var(--bg-tertiary)',
                border: '1px solid var(--border-primary)',
                borderRadius: '14px',
                padding: '20px',
                marginBottom: '32px'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px'
                }}>
                  {}
                  <div style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '12px',
                    background: accountToRemove.type === 'bank' ? 'rgba(59, 130, 246, 0.15)' : 'rgba(139, 92, 246, 0.15)',
                    border: `1px solid ${accountToRemove.type === 'bank' ? 'rgba(59, 130, 246, 0.3)' : 'rgba(139, 92, 246, 0.3)'}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: accountToRemove.type === 'bank' ? '#3b82f6' : '#8b5cf6',
                    flexShrink: 0
                  }}>
                    {accountToRemove.type === 'bank' ? (
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="2" y="4" width="20" height="16" rx="2"/>
                        <path d="M2 10H22"/>
                      </svg>
                    ) : (
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
                        <line x1="1" y1="10" x2="23" y2="10"/>
                      </svg>
                    )}
                  </div>

                  {}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      fontSize: '16px',
                      fontWeight: '700',
                      color: '#ffffff',
                      marginBottom: '4px'
                    }}>
                      {accountToRemove.type === 'bank' 
                        ? (accountToRemove.bankName || 'Bank Account')
                        : (accountToRemove.cardBrand || 'Credit Card')
                      }
                    </div>
                    <div style={{
                      fontSize: '14px',
                      color: '#ffffff',
                      opacity: 0.7,
                      fontFamily: 'monospace',
                      letterSpacing: '0.05em'
                    }}>
                      {accountToRemove.type === 'bank' 
                        ? (accountToRemove.maskedAccount || `••••${accountToRemove.accountNumber || accountToRemove.last4 || ''}`)
                        : (accountToRemove.maskedCard || `•••• •••• •••• ${accountToRemove.last4 || ''}`)
                      }
                    </div>
                    {accountToRemove.primary && (
                      <div style={{
                        display: 'inline-block',
                        marginTop: '6px',
                        padding: '2px 8px',
                        background: 'rgba(16, 185, 129, 0.15)',
                        border: '1px solid rgba(16, 185, 129, 0.3)',
                        borderRadius: '4px',
                        fontSize: '11px',
                        fontWeight: '700',
                        color: '#10b981',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em'
                      }}>
                        Primary
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {}
              {accountToRemove.primary && (
                <div style={{
                  background: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid rgba(239, 68, 68, 0.2)',
                  borderRadius: '12px',
                  padding: '16px',
                  marginBottom: '24px',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '12px'
                }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#ef4444', flexShrink: 0, marginTop: '2px' }}>
                    <path d="M12 9V13M12 17H12.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"/>
                  </svg>
                  <p style={{
                    fontSize: '13px',
                    color: '#ffffff',
                    opacity: 0.8,
                    margin: 0,
                    lineHeight: '1.5'
                  }}>
                    This is your primary payment method. Removing it will set another payment method as primary, or you'll need to add a new one.
                  </p>
                </div>
              )}

              {}
              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  type="button"
                  onClick={() => {
                    setShowRemoveConfirm(false);
                    setAccountToRemove(null);
                  }}
                  className="btn btn-secondary"
                  style={{ flex: 1, padding: '14px', fontSize: '15px', fontWeight: '600' }}
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    removePaymentMethod(accountToRemove.id);
                    setShowRemoveConfirm(false);
                    setAccountToRemove(null);
                    setToast({ 
                      message: `${accountToRemove.type === 'bank' ? 'Bank account' : 'Credit card'} removed successfully`, 
                      type: 'success' 
                    });
                  }}
                  className="btn btn-primary"
                  style={{ 
                    flex: 1, 
                    padding: '14px', 
                    fontSize: '15px', 
                    fontWeight: '600',
                    background: '#ef4444',
                    borderColor: 'rgba(239, 68, 68, 0.5)',
                    color: '#ffffff'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#dc2626';
                    e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.7)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = '#ef4444';
                    e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.5)';
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '8px', display: 'inline-block', verticalAlign: 'middle' }}>
                    <path d="M3 6H5H21M8 6V4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V6M19 6V20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 17.5304 22 17 22H7C6.46957 22 5.96086 21.7893 5.58579 21.4142C5.21071 21.0391 5 20.5304 5 20V6H19Z"/>
                    <path d="M10 11V17M14 11V17"/>
                  </svg>
                  Remove Payment Method
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}

      {}
      {toast && (<Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />)}
    </div>
  );
};

export default Wallet;
