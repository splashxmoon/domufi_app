
import React, { useState } from "react";
import { useOutletContext, useNavigate } from "react-router-dom";
import { useAuth } from "../lib/auth/localAuthService";
import { useInvestments } from "../contexts/InvestmentContext";
import PerformanceChart from "../components/PerformanceChart";
import AllocationChart from "../components/AllocationChart";
import RentalIncomeChart from "../components/RentalIncomeChart";
import DomufiAutoAI from "./DomufiAutoAI";
import PropertyMap from "./PropertyMap";




const PieChart = ({ value, color, size = 60 }) => {
  const percentage = Math.min(100, Math.max(0, value));
  const radius = size / 2 - 4;
  const circumference = 2 * Math.PI * radius;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;
  
  return (
    <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', width: `${size}px`, height: `${size}px`, flexShrink: 0 }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        {}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(148, 163, 184, 0.15)"
          strokeWidth={size > 90 ? "8" : "6"}
        />
        {}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={size > 90 ? "8" : "6"}
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          style={{
            transition: 'stroke-dashoffset 0.5s ease',
            filter: `drop-shadow(0 0 4px ${color}60)`
          }}
        />
      </svg>
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        fontSize: size > 90 ? '18px' : '13px',
        fontWeight: 700,
        color: color,
        pointerEvents: 'none'
      }}>
        {percentage}%
      </div>
    </div>
  );
};




const InfoTooltip = ({ text, position = 'bottom' }) => {
  const [showTooltip, setShowTooltip] = useState(false);
  
  return (
    <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}>
      <div
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        style={{
          width: '20px',
          height: '20px',
          borderRadius: '50%',
          background: 'rgba(148, 163, 184, 0.2)',
          border: '1px solid rgba(148, 163, 184, 0.4)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'help',
          transition: 'all 0.2s ease',
          color: '#94a3b8'
        }}
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"/>
          <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
          <line x1="12" y1="17" x2="12.01" y2="17"/>
        </svg>
      </div>
      {showTooltip && (
        <div style={{
          position: 'absolute',
          bottom: position === 'bottom' ? '100%' : 'auto',
          top: (position === 'top' || position === 'top-right') ? '100%' : 'auto',
          right: position === 'top-right' ? '0' : 'auto',
          left: position === 'top-right' ? 'auto' : '50%',
          transform: position === 'top-right' ? 'none' : 'translateX(-50%)',
          marginBottom: position === 'bottom' ? '8px' : '0',
          marginTop: (position === 'top' || position === 'top-right') ? '8px' : '0',
          padding: '14px 16px',
          background: 'var(--bg-tertiary)',
          border: '1px solid var(--border-primary)',
          borderRadius: '10px',
          fontSize: '14px',
          color: '#ffffff',
          lineHeight: 1.6,
          maxWidth: '320px',
          minWidth: '200px',
          zIndex: 10000,
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.8)',
          whiteSpace: 'normal',
          wordWrap: 'break-word',
          pointerEvents: 'none',
          textAlign: 'left'
        }}>
          {text}
          <div style={{
            position: 'absolute',
            bottom: position === 'bottom' ? '-6px' : 'auto',
            top: (position === 'top' || position === 'top-right') ? '-6px' : 'auto',
            left: position === 'top-right' ? 'auto' : '50%',
            right: position === 'top-right' ? '12px' : 'auto',
            transform: position === 'top-right' ? 'none' : 'translateX(-50%)',
            width: 0,
            height: 0,
            borderLeft: '6px solid transparent',
            borderRight: '6px solid transparent',
            borderBottom: position === 'bottom' ? '6px solid var(--bg-tertiary)' : 'none',
            borderTop: (position === 'top' || position === 'top-right') ? '6px solid var(--bg-tertiary)' : 'none'
          }} />
        </div>
      )}
    </div>
  );
};

const ANALYTICS_TAB_META = {
  health: {
    title: 'Portfolio Health',
    subtitle: 'Risk-adjusted stability overview'
  },
  calendar: {
    title: 'Income Timeline',
    subtitle: 'Forward-looking cash flow visibility'
  },
  performance: {
    title: 'Performance Intelligence',
    subtitle: 'Risk-adjusted returns and volatility'
  },
  geography: {
    title: 'Geographic Distribution',
    subtitle: 'Capital deployment across regions'
  }
};

const Overview = () => {
  
  
  
  const getFriendlyMessage = (type, data) => {
    switch (type) {
      case 'monthlyIncome':
        return `You earned $${(data || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} last month`;
      case 'marketGrowth':
        const growth = (data || 8).toFixed(1);
        return `Market has grown ${growth}% YoY`;
      case 'outperforming':
        const outperformance = (data || 12).toFixed(1);
        return `You're outperforming the average investor by ${outperformance}%`;
      case 'riskScore':
        if (data <= 2) return "This property's risk score is low";
        if (data <= 3) return "This property's risk score is moderate";
        return "This property's risk score is high";
      case 'propertyPayout':
        return `This property paid out $${(data || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} last month`;
      case 'portfolioGrowth':
        const growthPct = (data || 0).toFixed(1);
        if (growthPct > 0) return `Your portfolio grew ${growthPct}% this month`;
        return `Your portfolio is stable`;
      default:
        return '';
    }
  };

  
  
  
  const icons = {
    dollar: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
        <line x1="12" y1="1" x2="12" y2="23"/>
        <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
      </svg>
    ),
    portfolio: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
        <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
        <line x1="12" y1="22.08" x2="12" y2="12"/>
      </svg>
    ),
    trendUp: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
        <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/>
        <polyline points="17 6 23 6 23 12"/>
      </svg>
    ),
    search: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
        <circle cx="11" cy="11" r="8"/>
        <path d="M21 21l-4.35-4.35"/>
      </svg>
    ),
    sparkles: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
        <path d="M12 2v4m0 12v4M4.93 4.93l2.83 2.83m8.48 8.48l2.83 2.83M2 12h4m12 0h4M4.93 19.07l2.83-2.83m8.48-8.48l2.83-2.83"/>
      </svg>
    ),
    plus: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
        <line x1="12" y1="5" x2="12" y2="19"/>
        <line x1="5" y1="12" x2="19" y2="12"/>
      </svg>
    ),
    building: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="4" y="2" width="16" height="20" rx="2" ry="2"/>
        <path d="M9 22v-4h6v4M8 6h.01M16 6h.01M12 6h.01M12 10h.01M12 14h.01M16 10h.01M16 14h.01M8 10h.01M8 14h.01"/>
      </svg>
    ),
    coins: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="8" cy="8" r="6"/>
        <path d="M18.09 10.37A6 6 0 1 1 10.34 18"/>
        <circle cx="16" cy="16" r="6"/>
      </svg>
    ),
    calendar: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
        <line x1="16" y1="2" x2="16" y2="6"/>
        <line x1="8" y1="2" x2="8" y2="6"/>
        <line x1="3" y1="10" x2="21" y2="10"/>
      </svg>
    ),
    overview: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="3" width="7" height="7" rx="1"/>
        <rect x="14" y="3" width="7" height="7" rx="1"/>
        <rect x="3" y="14" width="7" height="7" rx="1"/>
        <rect x="14" y="14" width="7" height="7" rx="1"/>
      </svg>
    ),
    analytics: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M3 3v18h18" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M18 9l-5 5-4-4-5 5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    goals: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10"/>
        <circle cx="12" cy="12" r="6"/>
        <circle cx="12" cy="12" r="2"/>
      </svg>
    ),
    health: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
      </svg>
    ),
    map: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/>
        <line x1="8" y1="2" x2="8" y2="18"/>
        <line x1="16" y1="6" x2="16" y2="22"/>
      </svg>
    ),
    performance: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M22 12h-4l-3 9L9 3l-3 9H2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    percent: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <line x1="19" y1="5" x2="5" y2="19"/>
        <circle cx="6.5" cy="6.5" r="2.5"/>
        <circle cx="17.5" cy="17.5" r="2.5"/>
      </svg>
    ),
    flag: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/>
        <line x1="4" y1="22" x2="4" y2="15"/>
      </svg>
    ),
    trendDown: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
        <polyline points="23 18 13.5 8.5 8.5 13.5 1 6"/>
        <polyline points="17 18 23 18 23 12"/>
      </svg>
    ),
    pieChart: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M21.21 15.89A10 10 0 1 1 8 2.83"/>
        <path d="M22 12A10 10 0 0 0 12 2v10z"/>
      </svg>
    ),
    arrowLeft: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="15 18 9 12 15 6"/>
      </svg>
    ),
    arrowRight: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="9 18 15 12 9 6"/>
      </svg>
    ),
    edit: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
      </svg>
    )
  };

  
  
  
  const { user, userProfile } = useOutletContext();
  const { profile } = useAuth();
  const { getPortfolioSummary, getInvestmentsByProperty, investments, transactions, updateTimestamp } = useInvestments();
  const navigate = useNavigate();
  
  const [range, setRange] = useState("1M");
  const [showAutoAI, setShowAutoAI] = useState(false);
  const [activeChartTab, setActiveChartTab] = useState('income'); 
  const [activeMainTab, setActiveMainTab] = useState('overview'); 
  const [activeAnalyticsTab, setActiveAnalyticsTab] = useState('health'); 
  const analyticsTabMeta = ANALYTICS_TAB_META[activeAnalyticsTab] || ANALYTICS_TAB_META.health;
  
  
  const [activeGoalIndex, setActiveGoalIndex] = useState(0);
  const [editingGoal, setEditingGoal] = useState(null);
  const [editingValue, setEditingValue] = useState('');
  
  
  const [userGoals, setUserGoals] = useState(() => {
    try {
      const saved = localStorage.getItem('domufi_user_goals');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Error loading goals:', e);
    }
    return null;
  });

  
  const currentUser = user || {};
  const currentProfile = profile || userProfile || {};
  
  
  
  
  
  
  const portfolioSummary = React.useMemo(() => getPortfolioSummary(), [investments, updateTimestamp]);
  const investmentsByProperty = React.useMemo(() => getInvestmentsByProperty(), [investments]);
  const hasInvestments = investments && investments.length > 0;
  const MS_IN_DAY = 1000 * 60 * 60 * 24;
  

  
  const incomeMetrics = React.useMemo(() => {
    let totalMonthlyIncome = 0;
    let totalLifetimeIncome = 0;
    let weightedYield = 0;
    
    investments.forEach(inv => {
      const annualROI = inv.annualROI || 10; 
      const monthly = (inv.totalInvested * annualROI / 100 / 12);
      totalMonthlyIncome += monthly;
      
      
      const propertyTransactions = transactions.filter(t => 
        t.propertyId === inv.propertyId && t.type === 'dividend'
      );
      const lifetimeFromTransactions = propertyTransactions.reduce((sum, t) => sum + (t.amount || 0), 0);
      totalLifetimeIncome += lifetimeFromTransactions;
      
      
      weightedYield += (annualROI * inv.totalInvested);
    });
    
    const totalAnnualIncome = totalMonthlyIncome * 12;
    const dailyIncome = totalMonthlyIncome / 30; 
    const averageYield = portfolioSummary.totalInvested > 0 
      ? (weightedYield / portfolioSummary.totalInvested) 
      : 0;
    
    
    const now = new Date();
    const nextPayout = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    const daysUntilPayout = Math.ceil((nextPayout - now) / (1000 * 60 * 60 * 24));
    
    
    const incomeToDate = transactions
      .filter(t => t.type === 'dividend')
      .reduce((sum, t) => sum + (t.amount || 0), 0);
    
    return {
      monthlyIncome: totalMonthlyIncome,
      annualIncome: totalAnnualIncome,
      dailyIncome: dailyIncome,
      averageYield: averageYield,
      totalProperties: portfolioSummary.totalProperties,
      lifetimeIncome: incomeToDate || totalLifetimeIncome,
      nextPayout: nextPayout,
      daysUntilPayout: daysUntilPayout,
      nextPayoutAmount: totalMonthlyIncome
    };
  }, [investments, transactions, portfolioSummary.totalInvested, portfolioSummary.totalProperties]);
  
  
  const allocationData = React.useMemo(() => {
    if (investmentsByProperty.length === 0) {
      return { labels: [], data: [], colors: [] };
    }

    const colors = [
      '#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#ef4444',
      '#06b6d4', '#84cc16', '#f97316', '#ec4899', '#6366f1'
    ];

    const labels = investmentsByProperty.map(inv => inv.propertyName);
    const data = investmentsByProperty.map(inv => inv.totalInvested);
    const assignedColors = investmentsByProperty.map((_, index) => colors[index % colors.length]);

    return { labels, data, colors: assignedColors };
  }, [investmentsByProperty]);

  
  const propertyData = React.useMemo(() => [
    { id: 1, name: "Luxury SoHo Loft Complex", image: "https://via.placeholder.com/400x300?text=Luxury+SoHo+Loft" },
    { id: 2, name: "Beverly Hills Luxury Estate", image: "https://via.placeholder.com/400x300?text=Beverly+Hills+Estate" },
    { id: 3, name: "Miami Beach Condo Tower", image: "https://via.placeholder.com/400x300?text=Miami+Beach+Condo" },
    { id: 4, name: "Austin Hillside Villas", image: "https://via.placeholder.com/400x300?text=Austin+Villas" },
    { id: 5, name: "Chicago Lakefront Apartments", image: "https://via.placeholder.com/400x300?text=Chicago+Lakefront" },
    { id: 6, name: "Seattle Urban Lofts", image: "https://via.placeholder.com/400x300?text=Seattle+Lofts" }
  ], []);

  
  const getPropertyDetails = React.useCallback((propertyId) => {
    return propertyData.find(p => p.id === propertyId) || null;
  }, [propertyData]);

  
  const performanceMetrics = React.useMemo(() => {
    if (!investments || investments.length === 0) {
      return null;
    }

    const returns = investments.map(inv => {
      const returnPct = ((inv.currentValue - inv.totalInvested) / inv.totalInvested) * 100;
      return returnPct || 0;
    });
    
    const avgReturn = returns.length > 0 ? returns.reduce((a, b) => a + b, 0) / returns.length : 0;
    const volatility = returns.length > 1 
      ? Math.sqrt(returns.reduce((sum, r) => sum + Math.pow(r - avgReturn, 2), 0) / (returns.length - 1))
      : 0;
    
    
    const riskFreeRate = 2;
    const sharpeRatio = volatility > 0 ? (avgReturn - riskFreeRate) / volatility : 0;
    
    
    const avgHoldingPeriod = investments.reduce((sum, inv) => {
      const days = Math.max(1, (new Date() - new Date(inv.purchaseDate)) / (1000 * 60 * 60 * 24));
      return sum + days;
    }, 0) / Math.max(1, investments.length);
    
    const annualizedReturn = portfolioSummary.totalInvested > 0
      ? ((portfolioSummary.currentValue / portfolioSummary.totalInvested) ** (365 / avgHoldingPeriod) - 1) * 100
      : 0;
    
    const maxDrawdown = portfolioSummary.totalReturn < 0 ? Math.abs(portfolioSummary.totalReturnPct) : 0;
    
    return {
      sharpeRatio: Math.max(0, sharpeRatio),
      volatility: Math.max(0, volatility),
      maxDrawdown: maxDrawdown,
      annualizedReturn: annualizedReturn,
      yieldOnCost: incomeMetrics.averageYield,
      cashOnCashReturn: portfolioSummary.totalInvested > 0 
        ? (incomeMetrics.annualIncome / portfolioSummary.totalInvested) * 100 
        : 0,
      capRate: incomeMetrics.averageYield,
      irr: annualizedReturn
    };
  }, [investments, portfolioSummary, incomeMetrics]);

  
  const portfolioHealth = React.useMemo(() => {
    const propertyCount = portfolioSummary.totalProperties;
    const diversificationScore = Math.min(100, (propertyCount / 10) * 100);
    
    const targetReturn = 10;
    const performanceScore = performanceMetrics 
      ? Math.min(100, (performanceMetrics.annualizedReturn / targetReturn) * 100)
      : 0;
    
    const incomeStabilityScore = incomeMetrics.averageYield > 0 
      ? Math.min(100, (incomeMetrics.averageYield / 12) * 100) 
      : 0;
    
    const riskScore = performanceMetrics
      ? Math.max(0, 100 - (performanceMetrics.volatility * 2) - performanceMetrics.maxDrawdown)
      : 50;
    
    const overallScore = (diversificationScore + performanceScore + incomeStabilityScore + riskScore) / 4;
    
    const recommendations = [];
    if (diversificationScore < 70) recommendations.push('Consider diversifying into more properties');
    if (performanceScore < 70) recommendations.push('Review underperforming properties');
    if (incomeStabilityScore < 70) recommendations.push('Focus on stable rental yields');
    if (riskScore < 70) recommendations.push('Consider lower volatility properties');
    if (recommendations.length === 0) recommendations.push('Portfolio is well-balanced!');
    
    return {
      overall: Math.round(overallScore),
      diversification: Math.round(diversificationScore),
      performance: Math.round(performanceScore),
      incomeStability: Math.round(incomeStabilityScore),
      riskManagement: Math.round(riskScore),
      recommendations: recommendations
    };
  }, [portfolioSummary, performanceMetrics, incomeMetrics]);

  
  const incomeCalendar = React.useMemo(() => {
    if (!incomeMetrics || incomeMetrics.monthlyIncome === undefined) {
      return [];
    }
    
    const now = new Date();
    const currentMonthIndex = now.getMonth();
    const currentYear = now.getFullYear();
    const todaysDate = now.getDate();
    
    const months = [];
    
    for (let i = 0; i < 12; i++) {
      const monthDate = new Date(currentYear, currentMonthIndex + i, 1);
      const monthName = monthDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      const startDay = monthDate.getDay();
      const payoutDate = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0);
      const daysInMonth = payoutDate.getDate();
      const payoutDay = payoutDate.getDate();
      const isCurrentMonth = monthDate.getMonth() === currentMonthIndex && monthDate.getFullYear() === currentYear;
      const totalCells = Math.ceil((startDay + daysInMonth) / 7) * 7;
      const calendarCells = Array.from({ length: totalCells }, (_, cellIdx) => {
        const dateNumber = cellIdx - startDay + 1;
        if (dateNumber < 1 || dateNumber > daysInMonth) {
          return { type: 'empty' };
        }
        return {
          type: 'day',
          day: dateNumber,
          isPayoutDay: dateNumber === payoutDay,
          isToday: isCurrentMonth && dateNumber === todaysDate
        };
      });
      
      months.push({
        month: monthName,
        projectedIncome: incomeMetrics.monthlyIncome,
        paymentCount: investments.length,
        isPast: isCurrentMonth,
        isCurrent: isCurrentMonth,
        year: monthDate.getFullYear(),
        calendarCells,
        payoutDay
      });
    }
    
    return months;
  }, [incomeMetrics, investments]);

  const incomeChartSeries = React.useMemo(() => {
    if (!hasInvestments) {
      return null;
    }

    const rangeToDays = {
      '1M': 30,
      '3M': 90,
      '6M': 180,
      '1Y': 365
    };

    const windowDays = rangeToDays[range] || 30;
    const now = new Date();
    const labels = [];
    const data = [];

    const dividendTransactions = transactions
      .filter(txn => txn.type === 'dividend')
      .map(txn => ({ ...txn, dateObj: new Date(txn.date) }));

    const isSameDay = (a, b) =>
      a.getFullYear() === b.getFullYear() &&
      a.getMonth() === b.getMonth() &&
      a.getDate() === b.getDate();

    for (let i = windowDays - 1; i >= 0; i--) {
      const day = new Date(now.getTime() - i * MS_IN_DAY);
      const label = windowDays > 120
        ? day.toLocaleDateString('en-US', { month: 'short', year: '2-digit' })
        : day.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      labels.push(label);

      const totalForDay = dividendTransactions.reduce((sum, txn) => {
        return isSameDay(txn.dateObj, day) ? sum + (txn.amount || 0) : sum;
      }, 0);

      data.push(Number(totalForDay.toFixed(2)));
    }

    const hasActualData = data.some(value => value > 0);
    if (hasActualData) {
      return { labels, data };
    }

    const baseline = incomeMetrics.dailyIncome || 0;
    if (!baseline) {
      return { labels, data };
    }

    const syntheticData = labels.map((_, idx) => {
      const variation = 0.85 + (0.15 * Math.sin(idx / 4));
      return Number(Math.max(0, baseline * variation).toFixed(2));
    });

    return { labels, data: syntheticData };
  }, [hasInvestments, transactions, incomeMetrics.dailyIncome, range]);

  const performanceChartSeries = React.useMemo(() => {
    if (!hasInvestments) {
      return null;
    }

    const rangeToDays = {
      '1M': 30,
      '3M': 90,
      '6M': 180,
      '1Y': 365
    };

    const totalDays = rangeToDays[range] || 30;
    const now = new Date();
    const labels = [];
    const data = [];

    const preparedInvestments = investments.map(inv => ({
      ...inv,
      parsedPurchaseDate: inv.purchaseDate ? new Date(inv.purchaseDate) : new Date(),
      annualROI: inv.annualROI || 0
    }));

    for (let i = totalDays - 1; i >= 0; i--) {
      const day = new Date(now.getTime() - i * MS_IN_DAY);
      const label = totalDays > 120
        ? day.toLocaleDateString('en-US', { month: 'short', year: '2-digit' })
        : day.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      labels.push(label);

      const valueForDay = preparedInvestments.reduce((sum, inv) => {
        if (day < inv.parsedPurchaseDate) {
          return sum;
        }

        const daysHeld = Math.max(0, (day - inv.parsedPurchaseDate) / MS_IN_DAY);
        const growth = 1 + (inv.annualROI / 100) * (daysHeld / 365);
        return sum + (inv.totalInvested * growth);
      }, 0);

      data.push(Number(valueForDay.toFixed(2)));
    }

    const lastValue = data[data.length - 1] || 0;
    const targetEnd = portfolioSummary.currentValue || lastValue;
    const scale = lastValue > 0 && targetEnd > 0 ? targetEnd / lastValue : 1;
    const scaledData = data.map(point => Number((point * scale).toFixed(2)));

    return {
      labels,
      data: scaledData
    };
  }, [hasInvestments, investments, range, portfolioSummary.currentValue]);

  const renderChartPlaceholder = (icon, title, description) => (
    <div style={{
      width: '100%',
      minHeight: '260px',
      borderRadius: '12px',
      border: '1px dashed rgba(148, 163, 184, 0.3)',
      background: 'var(--bg-tertiary)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      textAlign: 'center',
      color: '#a0a0a0'
    }}>
      <div style={{
        width: '48px',
        height: '48px',
        borderRadius: '12px',
        background: 'rgba(59, 130, 246, 0.08)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: '12px',
        color: '#3b82f6'
      }}>
        {icon}
      </div>
      <div style={{ fontSize: '15px', fontWeight: 600, color: '#ffffff', marginBottom: '6px' }}>
        {title}
      </div>
      <div style={{ fontSize: '13px', color: '#a0a0a0', maxWidth: '260px' }}>
        {description}
      </div>
    </div>
  );

  
  const geographicData = React.useMemo(() => {
    const locationMap = {};
    
    investments.forEach(inv => {
      const propertyDetails = getPropertyDetails(inv.propertyId);
      const location = propertyDetails?.location || 'Unknown';
      const state = location.split(',')[1]?.trim() || location;
      
      if (!locationMap[state]) {
        locationMap[state] = {
          state: state,
          properties: 0,
          totalInvested: 0,
          totalValue: 0,
          avgROI: 0
        };
      }
      
      locationMap[state].properties += 1;
      locationMap[state].totalInvested += inv.totalInvested;
      locationMap[state].totalValue += inv.currentValue || inv.totalInvested;
      locationMap[state].avgROI += inv.annualROI || 10;
    });
    
    Object.keys(locationMap).forEach(state => {
      locationMap[state].avgROI = locationMap[state].avgROI / locationMap[state].properties;
    });
    
    return Object.values(locationMap).sort((a, b) => b.totalValue - a.totalValue);
  }, [investments, getPropertyDetails]);

  
  const displayGoals = React.useMemo(() => {
    const defaultGoals = [
      {
        id: 'properties-owned',
        label: 'Properties Owned',
        target: Math.max(portfolioSummary.totalProperties + 5, 10),
        current: portfolioSummary.totalProperties,
        unit: '',
        icon: icons.building
      },
      {
        id: 'portfolio-value',
        label: 'Portfolio Value',
        target: Math.max(portfolioSummary.totalInvested * 2, 50000),
        current: portfolioSummary.currentValue,
        unit: '$',
        icon: icons.portfolio
      },
      {
        id: 'monthly-income',
        label: 'Monthly Income',
        target: Math.max(incomeMetrics.monthlyIncome * 2, 1000),
        current: incomeMetrics.monthlyIncome,
        unit: '$',
        icon: icons.dollar
      }
    ];
    
    
    if (userGoals) {
      return defaultGoals.map(defaultGoal => {
        const userGoal = userGoals.find(g => g.id === defaultGoal.id);
        if (userGoal) {
          return {
            ...defaultGoal,
            target: userGoal.target,
            current: defaultGoal.current 
          };
        }
        return defaultGoal;
      });
    }
    
    return defaultGoals;
  }, [portfolioSummary, incomeMetrics, userGoals]);
  
  
  const saveGoal = (goalId, target) => {
    const updatedGoals = displayGoals.map(goal => 
      goal.id === goalId ? { ...goal, target: parseFloat(target) || goal.target } : goal
    );
    const goalsToSave = updatedGoals.map(({ id, target }) => ({ id, target }));
    setUserGoals(goalsToSave);
    try {
      localStorage.setItem('domufi_user_goals', JSON.stringify(goalsToSave));
    } catch (e) {
      console.error('Error saving goals:', e);
    }
  };

  
  const performanceSummary = React.useMemo(() => {
    const fallbackStart = portfolioSummary.totalInvested || 0;
    const fallbackEnd = portfolioSummary.currentValue || 0;

    const buildSummary = (start, end) => {
      const safeStart = start || 0;
      const safeEnd = end || 0;
      const periodChange = safeEnd - safeStart;
      const periodChangePercent = safeStart > 0 ? ((periodChange / safeStart) * 100) : 0;

      return {
        startValue: safeStart,
        endValue: safeEnd,
        periodChange,
        periodChangePercent
      };
    };

    if (!performanceChartSeries || !performanceChartSeries.data || performanceChartSeries.data.length === 0) {
      return buildSummary(fallbackStart, fallbackEnd);
    }

    const data = performanceChartSeries.data;
    const startValue = data[0] ?? fallbackStart;
    const endValue = data[data.length - 1] ?? fallbackEnd;

    return buildSummary(startValue, endValue);
  }, [performanceChartSeries, portfolioSummary.totalInvested, portfolioSummary.currentValue]);

  
  
  
  

  
  const handleMarketSearch = () => {
    navigate('/dashboard/marketplace');
  };

  const handleAIAnalysis = () => {
    setShowAutoAI(true);
  };

  const handleAddFunding = () => {
    navigate('/dashboard/wallet?tab=fund');
  };

  
  
  

  const formattedNextPayoutDate = incomeMetrics.nextPayout
    ? incomeMetrics.nextPayout.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    : '--';
  const daysUntilPayout = typeof incomeMetrics.daysUntilPayout === 'number'
    ? Math.max(incomeMetrics.daysUntilPayout, 0)
    : null;

  const analyticsTabButtons = [
    {
      id: 'health',
      label: 'Portfolio Health',
      icon: icons.health,
      badge: `${portfolioHealth.overall}%`
    },
    {
      id: 'calendar',
      label: 'Income Timeline',
      icon: icons.calendar,
      badge: daysUntilPayout !== null ? `${daysUntilPayout}d` : 'Timeline'
    },
    {
      id: 'geography',
      label: 'Geography',
      icon: icons.map,
      badge: `${geographicData.length || 0} regions`
    }
  ];

  const liveKPIs = performanceMetrics ? [
    {
      label: 'Sharpe Ratio',
      value: performanceMetrics.sharpeRatio.toFixed(2),
      icon: icons.trendUp,
      color: '#3b82f6'
    },
    {
      label: 'IRR (Annualized)',
      value: `${performanceMetrics.irr.toFixed(2)}%`,
      icon: icons.percent,
      color: '#10b981'
    },
    {
      label: 'Volatility',
      value: `${performanceMetrics.volatility.toFixed(2)}%`,
      icon: icons.analytics,
      color: '#f97316'
    },
    {
      label: 'Cash-on-Cash',
      value: `${performanceMetrics.cashOnCashReturn.toFixed(2)}%`,
      icon: icons.dollar,
      color: '#8b5cf6'
    },
    {
      label: 'Cap Rate',
      value: `${performanceMetrics.capRate.toFixed(2)}%`,
      icon: icons.pieChart,
      color: '#14b8a6'
    },
    {
      label: 'Max Drawdown',
      value: `${performanceMetrics.maxDrawdown.toFixed(2)}%`,
      icon: icons.trendDown,
      color: '#ef4444'
    }
  ] : [];

  const miniCalendar = incomeCalendar.slice(0, 3);
  const miniCalendarTotal = miniCalendar.reduce((sum, month) => sum + (month.projectedIncome || 0), 0);

  const periodChangeValue = performanceSummary.periodChange >= 0
    ? `+$${Math.abs(performanceSummary.periodChange).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    : `-$${Math.abs(performanceSummary.periodChange).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const signalHighlights = [
    {
      key: 'risk',
      label: 'Risk Management',
      value: `${portfolioHealth.riskManagement}%`,
      helper: 'Volatility adjusted',
      icon: icons.health,
      color: '#6366f1',
      background: 'rgba(99, 102, 241, 0.12)'
    },
    {
      key: 'change',
      label: `${range} Net Change`,
      value: periodChangeValue,
      helper: 'Portfolio movement',
      icon: performanceSummary.periodChange >= 0 ? icons.trendUp : icons.trendDown,
      color: performanceSummary.periodChange >= 0 ? '#10b981' : '#ef4444',
      background: performanceSummary.periodChange >= 0 ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)'
    },
    {
      key: 'income',
      label: 'Lifetime Income',
      value: `$${(incomeMetrics.lifetimeIncome || 0).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`,
      helper: 'Since inception',
      icon: icons.dollar,
      color: '#f59e0b',
      background: 'rgba(245, 158, 11, 0.15)'
    }
  ];

  const calendarDayLabels = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
  const healthQuickStats = [
    {
      key: 'income',
      label: 'Monthly Income',
      value: `$${(incomeMetrics.monthlyIncome || 0).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`,
      helper: 'Recurring cash flow',
      icon: icons.dollar,
      accentColor: '#10b981',
      accentBg: 'rgba(16, 185, 129, 0.25)'
    },
    {
      key: 'yield',
      label: 'Avg Yield',
      value: `${(incomeMetrics.averageYield || 0).toFixed(2)}%`,
      helper: 'Yield on cost',
      icon: icons.percent,
      accentColor: '#fbbf24',
      accentBg: 'rgba(251, 191, 36, 0.2)'
    },
    {
      key: 'properties',
      label: 'Properties',
      value: portfolioSummary.totalProperties || 0,
      helper: 'Assets in portfolio',
      icon: icons.building,
      accentColor: '#6366f1',
      accentBg: 'rgba(99, 102, 241, 0.25)'
    },
    {
      key: 'regions',
      label: 'Regions',
      value: geographicData.length || 0,
      helper: 'Active markets',
      icon: icons.map,
      accentColor: '#0ea5e9',
      accentBg: 'rgba(14, 165, 233, 0.25)'
    }
  ];

  const averageGeographicROI = geographicData.length > 0
    ? (geographicData.reduce((sum, loc) => sum + (loc.avgROI || 0), 0) / geographicData.length).toFixed(1)
    : 0;
  const topMarket = geographicData[0]?.state || '—';
  const totalGeoProperties = geographicData.reduce((sum, loc) => sum + (loc.properties || 0), 0);
  const stateColorStops = [
    { threshold: 0, color: 'rgba(148, 163, 184, 0.25)' },
    { threshold: 5, color: 'rgba(59, 130, 246, 0.35)' },
    { threshold: 10, color: 'rgba(16, 185, 129, 0.45)' },
    { threshold: 20, color: 'rgba(245, 158, 11, 0.55)' },
    { threshold: 30, color: 'rgba(239, 68, 68, 0.6)' }
  ];

  
  const cityCoordinates = {
    'New York': { lat: 40.7128, lng: -74.0060 },
    'California': { lat: 34.0522, lng: -118.2437 }, 
    'Florida': { lat: 25.7617, lng: -80.1918 }, 
    'Texas': { lat: 30.2672, lng: -97.7431 }, 
    'Illinois': { lat: 41.8781, lng: -87.6298 }, 
    'Washington': { lat: 47.6062, lng: -122.3321 }, 
    'Beverly Hills': { lat: 34.0736, lng: -118.4004 },
    'Miami Beach': { lat: 25.7907, lng: -80.1300 },
    'Austin': { lat: 30.2672, lng: -97.7431 },
    'Chicago': { lat: 41.8781, lng: -87.6298 },
    'Seattle': { lat: 47.6062, lng: -122.3321 },
    'SoHo': { lat: 40.7231, lng: -74.0026 }
  };

  
  const investmentLocations = React.useMemo(() => {
    const locationMap = {};
    
    investments.forEach(inv => {
      const propertyDetails = getPropertyDetails(inv.propertyId);
      const location = propertyDetails?.location || 'Unknown';
      const city = location.split(',')[0]?.trim() || '';
      const state = location.split(',')[1]?.trim() || location;
      
      
      let coords = cityCoordinates[city] || cityCoordinates[state] || null;
      if (!coords) {
        
        const stateCenters = {
          'New York': { lat: 40.7128, lng: -74.0060 },
          'California': { lat: 34.0522, lng: -118.2437 },
          'Florida': { lat: 27.7663, lng: -82.6404 },
          'Texas': { lat: 30.2672, lng: -97.7431 },
          'Illinois': { lat: 41.8781, lng: -87.6298 },
          'Washington': { lat: 47.6062, lng: -122.3321 }
        };
        coords = stateCenters[state] || { lat: 39.8283, lng: -98.5795 }; 
      }
      
      const key = `${city}-${state}`;
      if (!locationMap[key]) {
        locationMap[key] = {
          city,
          state,
          coordinates: coords,
          properties: 0,
          totalInvested: 0,
          totalValue: 0,
          avgROI: 0
        };
      }
      
      locationMap[key].properties += 1;
      locationMap[key].totalInvested += inv.totalInvested || 0;
      locationMap[key].totalValue += inv.currentValue || inv.totalInvested || 0;
      locationMap[key].avgROI += inv.annualROI || 10;
    });
    
    Object.keys(locationMap).forEach(key => {
      locationMap[key].avgROI = locationMap[key].avgROI / locationMap[key].properties;
    });
    
    return Object.values(locationMap);
  }, [investments, getPropertyDetails]);

  const geographyHeatMap = React.useMemo(() => {
    if (!geographicData.length) return [];

    const maxValue = Math.max(...geographicData.map((loc) => loc.totalValue || 0));
    const getColor = (value) => {
      if (maxValue === 0) return stateColorStops[0].color;
      const intensity = (value / maxValue) * 100;
      const stop = [...stateColorStops].reverse().find((s) => intensity >= s.threshold) || stateColorStops[0];
      return stop.color;
    };

    return geographicData.map((loc) => ({
      state: loc.state,
      properties: loc.properties,
      totalValue: loc.totalValue || 0,
      invested: loc.totalInvested || 0,
      avgROI: loc.avgROI || 0,
      color: getColor(loc.totalValue || 0),
      intensity: maxValue ? Math.round(((loc.totalValue || 0) / maxValue) * 100) : 0
    }));
  }, [geographicData]);

  const healthStatusLabel = portfolioHealth.overall >= 80
    ? 'Excellent'
    : portfolioHealth.overall >= 60
      ? 'Good'
      : 'Needs Improvement';
  const healthMetricCards = [
    {
      key: 'diversification',
      label: 'Diversification',
      helper: 'Exposure spread',
      value: portfolioHealth.diversification,
      icon: icons.pieChart,
      accentColor: '#38bdf8'
    },
    {
      key: 'performance',
      label: 'Performance',
      helper: 'Return momentum',
      value: portfolioHealth.performance,
      icon: icons.trendUp,
      accentColor: '#10b981'
    },
    {
      key: 'income',
      label: 'Income Stability',
      helper: 'Distribution consistency',
      value: portfolioHealth.incomeStability,
      icon: icons.calendar,
      accentColor: '#fbbf24'
    },
    {
      key: 'risk',
      label: 'Risk Management',
      helper: 'Volatility buffer',
      value: portfolioHealth.riskManagement,
      icon: icons.health,
      accentColor: '#8b5cf6'
    }
  ];
  const performanceMetricCards = performanceMetrics ? [
    {
      key: 'sharpe',
      label: 'Sharpe Ratio',
      value: performanceMetrics.sharpeRatio.toFixed(2),
      helper: 'Return per unit of risk',
      color: '#3b82f6'
    },
    {
      key: 'volatility',
      label: 'Volatility',
      value: `${performanceMetrics.volatility.toFixed(2)}%`,
      helper: 'Standard deviation of returns',
      color: '#f97316'
    },
    {
      key: 'irr',
      label: 'IRR (Annualized)',
      value: `${performanceMetrics.irr.toFixed(2)}%`,
      helper: 'Compound annual growth',
      color: '#10b981'
    },
    {
      key: 'coc',
      label: 'Cash-on-Cash',
      value: `${performanceMetrics.cashOnCashReturn.toFixed(2)}%`,
      helper: 'Income vs invested capital',
      color: '#8b5cf6'
    },
    {
      key: 'caprate',
      label: 'Cap Rate',
      value: `${performanceMetrics.capRate.toFixed(2)}%`,
      helper: 'Income / property value',
      color: '#14b8a6'
    },
    {
      key: 'drawdown',
      label: 'Max Drawdown',
      value: performanceMetrics.maxDrawdown > 0
        ? `-${performanceMetrics.maxDrawdown.toFixed(2)}%`
        : '0%',
      helper: 'Peak-to-trough decline',
      color: '#ef4444'
    }
  ] : [];

  const calendarSummaryMetrics = [
    {
      key: 'nextPayout',
      label: 'Next Payout',
      value: formattedNextPayoutDate,
      detail: daysUntilPayout !== null ? `In ${daysUntilPayout} days` : 'Schedule pending',
      accent: '#10b981'
    },
    {
      key: 'next90',
      label: 'Next 90 Days',
      value: `$${miniCalendarTotal.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`,
      detail: 'Projected distributions',
      accent: '#e2e8f0'
    },
    {
      key: 'sources',
      label: 'Payment Sources',
      value: incomeCalendar[0]?.paymentCount || investments.length || 0,
      detail: 'Active assets',
      accent: '#cbd5f5'
    }
  ];
    
    return (
    <>
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 0.6; transform: scale(1.2); }
        }
      `}</style>
      {}
      {showAutoAI && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10000,
            padding: '20px'
          }}
          onClick={() => setShowAutoAI(false)}
        >
          <div 
            style={{
              width: '100%',
              maxWidth: '900px',
              height: '80vh',
              background: 'var(--bg-secondary)',
              borderRadius: '16px',
              overflow: 'hidden',
              border: '1px solid var(--border-primary)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <DomufiAutoAI onClose={() => setShowAutoAI(false)} />
      </div>
        </div>
      )}

      {}
      <div id="overview" style={{ height: '100%', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        
        {}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '8px',
          padding: '16px 0',
          borderBottom: '1px solid var(--border-primary)',
          marginBottom: '20px'
        }}>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => setActiveMainTab('overview')}
              style={{
                padding: '12px 24px',
                background: activeMainTab === 'overview' ? 'var(--accent-blue)' : 'var(--bg-tertiary)',
                color: activeMainTab === 'overview' ? '#ffffff' : '#a0a0a0',
                border: activeMainTab === 'overview' ? '1px solid var(--accent-blue)' : '1px solid var(--border-primary)',
                borderRadius: '10px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              {icons.overview}
              Overview
            </button>
            
            <button
              onClick={() => setActiveMainTab('analytics')}
              style={{
                padding: '12px 24px',
                background: activeMainTab === 'analytics' ? 'var(--accent-blue)' : 'var(--bg-tertiary)',
                color: activeMainTab === 'analytics' ? '#ffffff' : '#a0a0a0',
                border: activeMainTab === 'analytics' ? '1px solid var(--accent-blue)' : '1px solid var(--border-primary)',
                borderRadius: '10px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              {icons.analytics}
              Analytics
            </button>
          </div>

          {}
          <div style={{ display: 'flex', gap: '10px' }}>
            {}
            <button 
              onClick={handleMarketSearch}
              style={{ 
                padding: '12px 16px',
                background: 'var(--bg-tertiary)',
                border: '1px solid var(--border-primary)',
                borderRadius: '10px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.5)';
                e.currentTarget.style.background = 'rgba(59, 130, 246, 0.08)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--border-primary)';
                e.currentTarget.style.background = 'var(--bg-tertiary)';
              }}
            >
              <div style={{ 
                width: '20px',
                height: '20px',
                borderRadius: '6px',
                background: 'rgba(59, 130, 246, 0.15)', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                color: '#3b82f6'
              }}>
                {icons.search}
              </div>
              <span style={{ fontSize: '13px', fontWeight: '600', color: '#ffffff' }}>
                Browse
              </span>
            </button>

            {}
            <button 
              onClick={handleAIAnalysis}
              style={{ 
                padding: '12px 16px',
                background: 'var(--bg-tertiary)',
                border: '1px solid var(--border-primary)',
                borderRadius: '10px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'rgba(16, 185, 129, 0.5)';
                e.currentTarget.style.background = 'rgba(16, 185, 129, 0.08)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--border-primary)';
                e.currentTarget.style.background = 'var(--bg-tertiary)';
              }}
            >
              <div style={{ 
                width: '20px',
                height: '20px',
                borderRadius: '6px',
                background: 'rgba(16, 185, 129, 0.15)', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                color: '#10b981'
              }}>
                {icons.sparkles}
              </div>
              <span style={{ fontSize: '13px', fontWeight: '600', color: '#ffffff' }}>
                AI Insights
              </span>
            </button>

            {}
            <button 
              onClick={handleAddFunding}
              style={{
                padding: '12px 16px',
                background: 'var(--bg-tertiary)',
                border: '1px solid var(--border-primary)',
                borderRadius: '10px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'rgba(139, 92, 246, 0.5)';
                e.currentTarget.style.background = 'rgba(139, 92, 246, 0.08)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--border-primary)';
                e.currentTarget.style.background = 'var(--bg-tertiary)';
              }}
            >
              <div style={{ 
                width: '20px',
                height: '20px',
                borderRadius: '6px',
                background: 'rgba(139, 92, 246, 0.15)', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                color: '#8b5cf6'
              }}>
                {icons.plus}
              </div>
              <span style={{ fontSize: '13px', fontWeight: '600', color: '#ffffff' }}>
                Deposit
              </span>
            </button>
          </div>
        </div>

        {}
        <div style={{ flex: 1, overflow: 'hidden' }}>
          
          {}
          {activeMainTab === 'overview' && (
            <div className="overview-grid" style={{
              display: 'grid',
              gridTemplateColumns: '1.3fr 1fr',
              gap: '24px',
              height: '100%',
              minHeight: 0,
              alignItems: 'stretch',
              overflow: 'hidden'
              }}>
          
          {}
          {}
          {}
          <div className="overview-left" style={{
            display: 'grid',
            gridTemplateRows: 'auto auto 1fr',
            gap: '20px',
            height: '100%',
            minHeight: 0,
            overflow: 'auto',
            paddingRight: '8px'
          }}>
            
            {}
            <div 
              className="overview-card"
              style={{
                background: 'var(--bg-secondary)',
                padding: '24px',
                borderRadius: '16px',
                border: '1px solid var(--border-primary)',
                animation: 'breathe 4s ease-in-out infinite'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '10px',
                    background: 'rgba(16, 185, 129, 0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#10b981'
                  }}>
                    {icons.dollar}
                  </div>
                  <h3 style={{ 
                    fontSize: '18px', 
                    fontWeight: '700', 
                    color: '#ffffff', 
                    margin: 0
                  }}>
                    Passive Income
                  </h3>
                </div>
                
                {}
                    <div style={{
                  padding: '4px 10px',
                  background: 'rgba(16, 185, 129, 0.1)',
                  borderRadius: '6px',
                  border: '1px solid rgba(16, 185, 129, 0.2)',
                        display: 'flex',
                        alignItems: 'center',
                  gap: '6px'
                }}>
                  <div style={{
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    background: '#10b981',
                    animation: 'pulse 2s ease-in-out infinite'
                  }} />
                  <span style={{ fontSize: '10px', fontWeight: '600', color: '#10b981' }}>LIVE</span>
                      </div>
                  </div>
                  
                      <div style={{
                fontSize: '36px', 
                        fontWeight: '800',
                        color: '#ffffff',
                letterSpacing: '-1px',
                marginBottom: '8px'
              }}>
                ${(incomeMetrics.lifetimeIncome || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </div>
                      <div style={{
                        fontSize: '13px',
                        color: '#94a3b8',
                        marginBottom: '16px',
                        fontStyle: 'italic',
                        animation: 'gentlePulse 3s ease-in-out infinite'
                      }}>
                        {getFriendlyMessage('monthlyIncome', incomeMetrics.monthlyIncome)}
                      </div>
              
                      <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '12px'
              }}>
                      <div style={{
                  padding: '12px',
                  background: 'var(--bg-tertiary)',
                  borderRadius: '10px',
                  border: '1px solid var(--border-primary)'
                }}>
                  <div style={{ fontSize: '10px', color: '#64748b', marginBottom: '4px', fontWeight: '600', letterSpacing: '0.5px' }}>
                    DAILY
                      </div>
                  <div style={{ fontSize: '16px', fontWeight: '700', color: '#ffffff' }}>
                    ${(incomeMetrics.dailyIncome || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </div>
                    </div>
                    <div style={{
                  padding: '12px',
                  background: 'var(--bg-tertiary)',
                  borderRadius: '10px',
                  border: '1px solid var(--border-primary)'
                }}>
                  <div style={{ fontSize: '10px', color: '#64748b', marginBottom: '4px', fontWeight: '600', letterSpacing: '0.5px' }}>
                    MONTHLY
                      </div>
                  <div style={{ fontSize: '16px', fontWeight: '700', color: '#ffffff' }}>
                    ${(incomeMetrics.monthlyIncome || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </div>
                    </div>
                      <div style={{
                  padding: '12px',
                  background: 'var(--bg-tertiary)',
                  borderRadius: '10px',
                  border: '1px solid var(--border-primary)'
                }}>
                  <div style={{ fontSize: '10px', color: '#64748b', marginBottom: '4px', fontWeight: '600', letterSpacing: '0.5px' }}>
                    ANNUAL
                      </div>
                  <div style={{ fontSize: '16px', fontWeight: '700', color: '#ffffff' }}>
                    ${(incomeMetrics.annualIncome || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
              </div>
                    </div>
                  </div>
                  
            {}
            <div 
              className="overview-card"
                      style={{
                background: 'var(--bg-secondary)',
                padding: '24px',
                borderRadius: '16px',
                border: '1px solid var(--border-primary)',
                animation: 'breathe 4s ease-in-out infinite 0.5s'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '10px',
                    background: 'rgba(59, 130, 246, 0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#3b82f6'
                  }}>
                    {icons.portfolio}
                  </div>
                  <h3 style={{ 
                    fontSize: '18px', 
                    fontWeight: '700', 
                    color: '#ffffff', 
                    margin: 0
                  }}>
                    Portfolio Value
                  </h3>
                </div>
                
                {}
                      <div style={{
                  padding: '6px 12px',
                  background: portfolioSummary.totalReturnPct > 0 
                    ? 'rgba(16, 185, 129, 0.1)' 
                    : portfolioSummary.totalReturnPct < 0
                      ? 'rgba(239, 68, 68, 0.1)'
                      : 'rgba(148, 163, 184, 0.1)',
                  borderRadius: '8px',
                  border: portfolioSummary.totalReturnPct > 0 
                    ? '1px solid rgba(16, 185, 129, 0.2)' 
                    : portfolioSummary.totalReturnPct < 0
                      ? '1px solid rgba(239, 68, 68, 0.2)'
                      : '1px solid rgba(148, 163, 184, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}>
                  <span style={{ 
                    fontSize: '12px', 
                        fontWeight: '700',
                    color: portfolioSummary.totalReturnPct > 0 
                      ? '#10b981' 
                      : portfolioSummary.totalReturnPct < 0 
                        ? '#ef4444' 
                        : '#94a3b8'
                      }}>
                    {portfolioSummary.totalReturnPct > 0 ? '+' : ''}{(portfolioSummary.totalReturnPct || 0).toFixed(2)}%
                </span>
                      </div>
                    </div>
              
                      <div style={{
                fontSize: '36px', 
                fontWeight: '800', 
                        color: '#ffffff',
                letterSpacing: '-1px',
                marginBottom: '8px'
              }}>
                ${(portfolioSummary.currentValue || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </div>
                      <div style={{
                        fontSize: '13px',
                        color: '#94a3b8',
                        marginBottom: '16px',
                        fontStyle: 'italic',
                        animation: 'gentlePulse 3s ease-in-out infinite 0.5s'
                      }}>
                        {getFriendlyMessage('portfolioGrowth', portfolioSummary.totalReturnPct)}
                      </div>

                      <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '12px'
              }}>
                <div style={{
                  padding: '12px',
                  background: 'var(--bg-tertiary)',
                  borderRadius: '10px',
                  border: '1px solid var(--border-primary)'
                }}>
                  <div style={{ fontSize: '10px', color: '#64748b', marginBottom: '4px', fontWeight: '600', letterSpacing: '0.5px' }}>
                    INVESTED
                      </div>
                  <div style={{ fontSize: '16px', fontWeight: '700', color: '#ffffff' }}>
                    ${(portfolioSummary.totalInvested || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                    </div>
                      <div style={{
                  padding: '12px',
                  background: 'var(--bg-tertiary)',
                  borderRadius: '10px',
                  border: '1px solid var(--border-primary)'
                }}>
                  <div style={{ fontSize: '10px', color: '#64748b', marginBottom: '4px', fontWeight: '600', letterSpacing: '0.5px' }}>
                    GAINS
                      </div>
                      <div style={{
                        fontSize: '16px',
                        fontWeight: '700',
                    color: portfolioSummary.totalReturn >= 0 ? '#10b981' : '#ef4444'
                      }}>
                    {portfolioSummary.totalReturn >= 0 ? '+' : ''}${(portfolioSummary.totalReturn || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </div>
                    </div>
                      <div style={{
                  padding: '12px',
                  background: 'var(--bg-tertiary)',
                  borderRadius: '10px',
                  border: '1px solid var(--border-primary)'
                }}>
                  <div style={{ fontSize: '10px', color: '#64748b', marginBottom: '4px', fontWeight: '600', letterSpacing: '0.5px' }}>
                    RETURN
                      </div>
                      <div style={{
                        fontSize: '16px',
                        fontWeight: '700',
                    color: portfolioSummary.totalReturnPct > 0 
                      ? '#10b981' 
                      : portfolioSummary.totalReturnPct < 0 
                        ? '#ef4444' 
                        : '#94a3b8'
                      }}>
                    {portfolioSummary.totalReturnPct > 0 ? '+' : ''}{(portfolioSummary.totalReturnPct || 0).toFixed(2)}%
                </div>
              </div>
            </div>
          </div>

            {}
            <div 
              className="overview-card"
                  style={{ 
                background: 'var(--bg-secondary)',
                padding: '24px',
                borderRadius: '16px',
                border: '1px solid var(--border-primary)',
                display: 'flex',
                flexDirection: 'column',
                height: '100%',
                minHeight: 0,
                animation: 'breathe 4s ease-in-out infinite 1s'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '10px',
                    background: 'rgba(139, 92, 246, 0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#8b5cf6'
                  }}>
                    {icons.pieChart}
                  </div>
                  <h3 style={{ 
                    fontSize: '18px', 
                    fontWeight: '700', 
                    color: '#ffffff', 
                    margin: 0
                  }}>
                    Portfolio Metrics
                  </h3>
                </div>
                <div style={{
                  padding: '4px 10px',
                        background: 'var(--bg-tertiary)',
                  borderRadius: '6px',
                  border: '1px solid var(--border-primary)'
                }}>
                  <span style={{ fontSize: '10px', fontWeight: '600', color: '#94a3b8', letterSpacing: '0.5px' }}>
                    {portfolioSummary.totalProperties} ASSETS
                  </span>
                </div>
              </div>
                      
                      <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '12px',
                flex: 1
              }}>
                {}
                              <div style={{
                  padding: '18px',
                        background: 'var(--bg-tertiary)',
                        border: '1px solid var(--border-primary)',
                  borderRadius: '12px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                            <div style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '8px',
                      background: 'rgba(59, 130, 246, 0.15)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                      color: '#3b82f6'
                    }}>
                      {icons.dollar}
                        </div>
                    <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: '600', letterSpacing: '0.3px' }}>
                      CAPITAL
                    </span>
                        </div>
                  <div style={{ fontSize: '28px', fontWeight: '800', color: '#ffffff', letterSpacing: '-0.5px' }}>
                    ${(portfolioSummary.totalInvested || 0).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                        </div>
                  <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px', fontWeight: '500' }}>
                    Total Invested
                            </div>
                            </div>

                {}
                        <div style={{
                  padding: '18px',
                  background: 'var(--bg-tertiary)',
                  border: '1px solid var(--border-primary)',
                  borderRadius: '12px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                              <div style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '8px',
                      background: 'rgba(16, 185, 129, 0.15)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#10b981'
                    }}>
                      {icons.building}
                          </div>
                    <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: '600', letterSpacing: '0.3px' }}>
                      PROPERTIES
                    </span>
                            </div>
                  <div style={{ fontSize: '28px', fontWeight: '800', color: '#ffffff', letterSpacing: '-0.5px' }}>
                    {portfolioSummary.totalProperties || 0}
                            </div>
                  <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px', fontWeight: '500' }}>
                    Assets Owned
                          </div>
                            </div>

                {}
                        <div style={{
                  padding: '18px',
                background: 'var(--bg-tertiary)',
                  border: '1px solid var(--border-primary)',
                  borderRadius: '12px'
              }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                <div style={{ 
                      width: '32px',
                      height: '32px',
                      borderRadius: '8px',
                      background: 'rgba(139, 92, 246, 0.15)',
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                      color: '#8b5cf6'
                }}>
                      {icons.coins}
                            </div>
                    <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: '600', letterSpacing: '0.3px' }}>
                      TOKENS
                    </span>
                          </div>
                  <div style={{ fontSize: '28px', fontWeight: '800', color: '#ffffff', letterSpacing: '-0.5px' }}>
                    {portfolioSummary.totalTokens || 0}
                        </div>
                  <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px', fontWeight: '500' }}>
                    Token Holdings
                      </div>
                    </div>

                {}
                <div style={{
                  padding: '18px',
                background: 'var(--bg-tertiary)',
                  border: '1px solid var(--border-primary)',
                  borderRadius: '12px'
              }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                <div style={{ 
                      width: '32px',
                      height: '32px',
                    borderRadius: '8px', 
                      background: 'rgba(245, 158, 11, 0.15)',
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                      color: '#f59e0b'
                }}>
                      {icons.calendar}
              </div>
                    <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: '600', letterSpacing: '0.3px' }}>
                      MONTHLY
                </span>
                </div>
                  <div style={{ fontSize: '28px', fontWeight: '800', color: '#ffffff', letterSpacing: '-0.5px' }}>
                    ${(incomeMetrics.monthlyIncome || 0).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
              </div>
                  <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px', fontWeight: '500' }}>
                    Recurring Income
            </div>
                </div>
                  </div>
                </div>

          </div>

          {}
          {}
          {}
          <div className="overview-right" style={{
            display: 'grid',
            gridTemplateRows: 'auto 1fr',
            gap: '20px',
            height: '100%',
            minHeight: 0,
            alignItems: 'stretch',
            paddingRight: '8px'
          }}>
            
            {}
            <div 
              className="overview-card"
              style={{
                background: 'var(--bg-secondary)',
                padding: '16px',
                borderRadius: '16px',
                border: '1px solid var(--border-primary)',
                flexShrink: 0,
                position: 'relative',
                height: 'fit-content'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '10px',
                    background: 'rgba(245, 158, 11, 0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#f59e0b'
                  }}>
                    {icons.goals}
                  </div>
                  <h3 style={{ 
                    fontSize: '18px', 
                    fontWeight: '700', 
                    color: '#ffffff', 
                    margin: 0
                  }}>
                    Goals
                  </h3>
                </div>
                
                {}
                {displayGoals.length > 0 && (() => {
                  const currentGoal = displayGoals[activeGoalIndex];
                  const isEditing = editingGoal === currentGoal.id;
                  
                  return (
                    <button
                      onClick={() => {
                        if (isEditing) {
                          if (editingValue !== '') {
                            saveGoal(currentGoal.id, editingValue);
                          }
                          setEditingGoal(null);
                          setEditingValue('');
                        } else {
                          setEditingGoal(currentGoal.id);
                          setEditingValue(currentGoal.target.toString());
                        }
                      }}
                      style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '8px',
                        background: isEditing ? 'rgba(16, 185, 129, 0.15)' : 'transparent',
                        border: '1px solid ' + (isEditing ? 'rgba(16, 185, 129, 0.3)' : 'var(--border-primary)'),
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        color: isEditing ? '#10b981' : '#94a3b8',
                        transition: 'all 0.2s ease',
                        flexShrink: 0
                      }}
                      onMouseEnter={(e) => {
                        if (!isEditing) {
                          e.currentTarget.style.background = 'rgba(16, 185, 129, 0.1)';
                          e.currentTarget.style.borderColor = 'rgba(16, 185, 129, 0.3)';
                          e.currentTarget.style.color = '#10b981';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isEditing) {
                          e.currentTarget.style.background = 'transparent';
                          e.currentTarget.style.borderColor = 'var(--border-primary)';
                          e.currentTarget.style.color = '#94a3b8';
                        }
                      }}
                    >
                      {isEditing ? (
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12"/>
                        </svg>
                      ) : (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                        </svg>
                      )}
                    </button>
                  );
                })()}
              </div>
              
              {displayGoals.length > 0 && (
                <div style={{ position: 'relative' }}>
                  {}
                  {displayGoals.length > 1 && (
                    <button
                      onClick={() => setActiveGoalIndex((prev) => (prev - 1 + displayGoals.length) % displayGoals.length)}
                      style={{
                        position: 'absolute',
                        left: '-14px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        width: '24px',
                        height: '24px',
                        borderRadius: '6px',
                        background: 'var(--bg-tertiary)',
                        border: '1px solid var(--border-primary)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        color: '#94a3b8',
                        transition: 'all 0.2s ease',
                        zIndex: 10
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'rgba(16, 185, 129, 0.1)';
                        e.currentTarget.style.borderColor = 'rgba(16, 185, 129, 0.3)';
                        e.currentTarget.style.color = '#10b981';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'var(--bg-tertiary)';
                        e.currentTarget.style.borderColor = 'var(--border-primary)';
                        e.currentTarget.style.color = '#94a3b8';
                      }}
                    >
                      {icons.arrowLeft}
                    </button>
                  )}
                  
                  {}
                  {(() => {
                    const currentGoal = displayGoals[activeGoalIndex];
                    const progress = currentGoal.target > 0 
                      ? Math.min(100, (currentGoal.current / currentGoal.target) * 100) 
                      : 0;
                    const isEditing = editingGoal === currentGoal.id;
                    
                    return (
                      <div style={{
                        paddingLeft: displayGoals.length > 1 ? '28px' : '0',
                        paddingRight: displayGoals.length > 1 ? '28px' : '0',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '10px'
                      }}>
                        {}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '8px',
                            background: 'rgba(16, 185, 129, 0.15)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#10b981',
                            flexShrink: 0
                          }}>
                            {currentGoal.icon}
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{
                              fontSize: '15px',
                              fontWeight: '600',
                              color: '#ffffff',
                              marginBottom: '3px',
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis'
                            }}>
                              {currentGoal.label}
                            </div>
                            <div style={{
                              fontSize: '12px',
                              color: '#94a3b8',
                              fontWeight: '500'
                            }}>
                              {progress.toFixed(1)}% Complete
                            </div>
                          </div>
                        </div>
                        
                        {}
                        <div>
                          {isEditing ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <input
                                type="number"
                                value={editingValue}
                                onChange={(e) => setEditingValue(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    saveGoal(currentGoal.id, editingValue);
                                    setEditingGoal(null);
                                    setEditingValue('');
                                  } else if (e.key === 'Escape') {
                                    setEditingGoal(null);
                                    setEditingValue('');
                                  }
                                }}
                                style={{
                                  flex: 1,
                                  padding: '6px 10px',
                                  background: 'var(--bg-tertiary)',
                                  border: '1px solid rgba(16, 185, 129, 0.3)',
                                  borderRadius: '6px',
                                  color: '#ffffff',
                                  fontSize: '14px',
                                  fontWeight: '700',
                                  outline: 'none'
                                }}
                                autoFocus
                              />
                              <span style={{ fontSize: '14px', fontWeight: '700', color: '#94a3b8' }}>
                                {currentGoal.unit}
                              </span>
                            </div>
                          ) : (
                            <>
                              <div style={{
                                fontSize: '24px',
                                fontWeight: '800',
                                color: '#ffffff',
                                letterSpacing: '-0.3px',
                                marginBottom: '4px',
                                lineHeight: '1.2'
                              }}>
                                {currentGoal.unit}{currentGoal.current.toLocaleString('en-US', { 
                                  minimumFractionDigits: currentGoal.unit === '$' ? 2 : 0,
                                  maximumFractionDigits: currentGoal.unit === '$' ? 2 : 0
                                })}
                              </div>
                              <div style={{
                                fontSize: '13px',
                                color: '#64748b',
                                fontWeight: '500'
                              }}>
                                Target: <span style={{ color: '#94a3b8', fontWeight: '600' }}>
                                  {currentGoal.unit}{currentGoal.target.toLocaleString('en-US', { 
                                    minimumFractionDigits: currentGoal.unit === '$' ? 2 : 0,
                                    maximumFractionDigits: currentGoal.unit === '$' ? 2 : 0
                                  })}
                                </span>
                              </div>
                            </>
                          )}
                        </div>
                        
                        {}
                        <div style={{
                          width: '100%',
                          height: '5px',
                          background: 'rgba(148, 163, 184, 0.1)',
                          borderRadius: '3px',
                          overflow: 'hidden',
                          position: 'relative'
                        }}>
                          <div style={{
                            width: `${progress}%`,
                            height: '100%',
                            background: '#10b981',
                            borderRadius: '3px',
                            transition: 'width 0.5s ease',
                            boxShadow: '0 0 6px rgba(16, 185, 129, 0.4)'
                          }} />
                        </div>
                      </div>
                    );
                  })()}
                  
                  {}
                  {displayGoals.length > 1 && (
                    <button
                      onClick={() => setActiveGoalIndex((prev) => (prev + 1) % displayGoals.length)}
                      style={{
                        position: 'absolute',
                        right: '-14px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        width: '24px',
                        height: '24px',
                        borderRadius: '6px',
                        background: 'var(--bg-tertiary)',
                        border: '1px solid var(--border-primary)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        color: '#94a3b8',
                        transition: 'all 0.2s ease',
                        zIndex: 10
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'rgba(16, 185, 129, 0.1)';
                        e.currentTarget.style.borderColor = 'rgba(16, 185, 129, 0.3)';
                        e.currentTarget.style.color = '#10b981';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'var(--bg-tertiary)';
                        e.currentTarget.style.borderColor = 'var(--border-primary)';
                        e.currentTarget.style.color = '#94a3b8';
                      }}
                    >
                      {icons.arrowRight}
                    </button>
                  )}
                  
                  {}
                  {displayGoals.length > 1 && (
                    <div style={{
                      display: 'flex',
                      justifyContent: 'center',
                      gap: '4px',
                      marginTop: '10px',
                      paddingTop: '10px',
                      borderTop: '1px solid var(--border-primary)'
                    }}>
                      {displayGoals.map((_, index) => (
                        <button
                          key={index}
                          onClick={() => setActiveGoalIndex(index)}
                          style={{
                            width: '4px',
                            height: '4px',
                            borderRadius: '50%',
                            background: index === activeGoalIndex ? '#10b981' : 'rgba(148, 163, 184, 0.3)',
                            border: 'none',
                            cursor: 'pointer',
                            padding: 0,
                            transition: 'all 0.2s ease'
                          }}
                          onMouseEnter={(e) => {
                            if (index !== activeGoalIndex) {
                              e.currentTarget.style.background = 'rgba(16, 185, 129, 0.5)';
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (index !== activeGoalIndex) {
                              e.currentTarget.style.background = 'rgba(148, 163, 184, 0.3)';
                            }
                          }}
                        />
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {}
            <div 
              className="overview-card"
                          style={{
                background: 'var(--bg-secondary)',
                padding: '24px',
                borderRadius: '16px',
                border: '1px solid var(--border-primary)',
                flex: 1,
                minHeight: 0,
                display: 'flex',
                flexDirection: 'column'
              }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '4px' }}>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '10px',
                    background: 'rgba(59, 130, 246, 0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#3b82f6'
                  }}>
                    {icons.analytics}
                  </div>
                  <h3 style={{ 
                    fontSize: '18px', 
                    fontWeight: '700',
                    color: '#ffffff',
                    margin: 0
                  }}>
                    Performance & Analytics
                    <span style={{ fontSize: '12px', fontWeight: '400', color: '#94a3b8', marginLeft: '12px', fontStyle: 'italic', animation: 'gentlePulse 3s ease-in-out infinite' }}>
                      {getFriendlyMessage('marketGrowth', 8)}
                    </span>
                  </h3>
                </div>
              
                {}
              <div style={{ 
                display: 'flex', 
                  gap: '8px',
                padding: '4px',
                background: 'var(--bg-tertiary)',
                            borderRadius: '10px',
                border: '1px solid var(--border-primary)'
              }}>
                <button
                  onClick={() => setActiveChartTab('income')}
                  style={{
                      flex: 1,
                      padding: '10px 16px',
                      background: activeChartTab === 'income' ? '#3b82f6' : 'transparent',
                      color: activeChartTab === 'income' ? '#ffffff' : '#a0a0a0',
                    border: 'none',
                    borderRadius: '8px', 
                    fontSize: '13px',
                    fontWeight: '600',
                    cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    Income
                </button>
                <button
                  onClick={() => setActiveChartTab('performance')}
                            style={{
                      flex: 1,
                      padding: '10px 16px',
                      background: activeChartTab === 'performance' ? '#3b82f6' : 'transparent',
                      color: activeChartTab === 'performance' ? '#ffffff' : '#a0a0a0',
                    border: 'none',
                      borderRadius: '8px',
                    fontSize: '13px',
                    fontWeight: '600',
                    cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    Performance
                </button>
                <button
                  onClick={() => setActiveChartTab('allocation')}
                          style={{
                      flex: 1,
                      padding: '10px 16px',
                      background: activeChartTab === 'allocation' ? '#3b82f6' : 'transparent',
                      color: activeChartTab === 'allocation' ? '#ffffff' : '#a0a0a0',
                    border: 'none',
                      borderRadius: '8px',
                    fontSize: '13px',
                    fontWeight: '600',
                    cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    Allocation
                </button>
                        </div>

                {activeChartTab !== 'allocation' && (
                  <div style={{ display: 'flex', gap: '8px' }}>
                    {['1M', '3M', '6M', '1Y'].map((r) => (
                      <button 
                        key={r}
                        onClick={() => setRange(r)}
                        style={{ 
                          padding: '8px 16px',
                          background: range === r ? 'rgba(59, 130, 246, 0.2)' : 'var(--bg-tertiary)',
                          color: range === r ? '#3b82f6' : '#a0a0a0',
                          border: range === r ? '1px solid #3b82f6' : '1px solid var(--border-primary)',
                          borderRadius: '8px', 
                          fontSize: '12px',
                          fontWeight: '600', 
                          cursor: 'pointer',
                          transition: 'all 0.2s ease'
                        }}
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                )}
            </div>

            {}
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
                {}
                {activeChartTab === 'income' && (
                  <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
                    <div style={{ flex: 1, minHeight: '260px', marginBottom: '48px', paddingBottom: '24px', height: '100%', overflow: 'visible' }}>
                      {hasInvestments && incomeChartSeries
                        ? (
                          <RentalIncomeChart 
                            series={incomeChartSeries}
                            range={range}
                          />
                        ) : (
                          renderChartPlaceholder(
                            icons.dollar,
                            'No income data yet',
                            'Start investing to unlock live income analytics'
                          )
                        )}
                    </div>

                    {}
                        <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(2, 1fr)',
                      gap: '10px',
                      width: '100%'
                    }}>
                      {}
                              <div style={{
                        padding: '12px',
                        background: 'var(--bg-tertiary)',
                        border: '1px solid var(--border-primary)',
                        borderRadius: '12px'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                            <div style={{
                            width: '28px',
                            height: '28px',
                            borderRadius: '8px',
                            background: 'rgba(16, 185, 129, 0.15)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#10b981'
                          }}>
                            {icons.dollar}
                            </div>
                          <span style={{ fontSize: '10px', color: '#94a3b8', fontWeight: '600', letterSpacing: '0.3px' }}>
                            TOTAL EARNED
                          </span>
                          </div>
                        <div style={{ fontSize: '18px', fontWeight: '800', color: '#10b981', letterSpacing: '-0.5px' }}>
                          ${(incomeMetrics.lifetimeIncome || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </div>
                        <div style={{ fontSize: '10px', color: '#64748b', marginTop: '3px', fontWeight: '500' }}>
                          Lifetime Income
                        </div>
                      </div>

                      {}
                        <div style={{
                        padding: '12px',
                        background: 'var(--bg-tertiary)',
                        border: '1px solid var(--border-primary)',
                        borderRadius: '12px'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                          <div style={{
                            width: '28px',
                            height: '28px',
                            borderRadius: '8px',
                            background: 'rgba(59, 130, 246, 0.15)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#3b82f6'
                          }}>
                            {icons.calendar}
                        </div>
                          <span style={{ fontSize: '10px', color: '#94a3b8', fontWeight: '600', letterSpacing: '0.3px' }}>
                            AVG DAILY
                          </span>
                      </div>
                        <div style={{ fontSize: '18px', fontWeight: '800', color: '#ffffff', letterSpacing: '-0.5px' }}>
                          ${(incomeMetrics.dailyIncome || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                        <div style={{ fontSize: '10px', color: '#64748b', marginTop: '3px', fontWeight: '500' }}>
                          Daily Average
              </div>
                      </div>

                      {}
                      <div style={{
                        padding: '12px',
                        background: 'var(--bg-tertiary)',
                        border: '1px solid var(--border-primary)',
                        borderRadius: '12px'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                          <div style={{
                            width: '28px',
                            height: '28px',
                            borderRadius: '8px',
                            background: 'rgba(139, 92, 246, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                            color: '#8b5cf6'
                          }}>
                            {icons.trendUp}
                          </div>
                          <span style={{ fontSize: '10px', color: '#94a3b8', fontWeight: '600', letterSpacing: '0.3px' }}>
                            MONTHLY
                          </span>
                        </div>
                        <div style={{ fontSize: '18px', fontWeight: '800', color: '#ffffff', letterSpacing: '-0.5px' }}>
                          ${(incomeMetrics.monthlyIncome || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </div>
                        <div style={{ fontSize: '10px', color: '#64748b', marginTop: '3px', fontWeight: '500' }}>
                          Monthly Income
                        </div>
                      </div>

                      {}
                <div style={{ 
                        padding: '12px',
                  background: 'var(--bg-tertiary)', 
                        border: '1px solid var(--border-primary)',
                        borderRadius: '12px'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                          <div style={{
                            width: '28px',
                            height: '28px',
                            borderRadius: '8px',
                            background: 'rgba(245, 158, 11, 0.15)',
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                            color: '#f59e0b'
                }}>
                            {icons.percent}
                </div>
                          <span style={{ fontSize: '10px', color: '#94a3b8', fontWeight: '600', letterSpacing: '0.3px' }}>
                            AVG YIELD
                          </span>
                        </div>
                        <div style={{ fontSize: '18px', fontWeight: '800', color: '#f59e0b', letterSpacing: '-0.5px' }}>
                          {(incomeMetrics.averageYield || 0).toFixed(2)}%
                        </div>
                        <div style={{ fontSize: '10px', color: '#64748b', marginTop: '3px', fontWeight: '500' }}>
                          Average Yield
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {}
                {activeChartTab === 'performance' && (
                  <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
                    <div style={{ flex: 1, minHeight: '260px', marginBottom: '48px', paddingBottom: '24px', height: '100%', overflow: 'visible' }}>
                      {hasInvestments && performanceChartSeries
                        ? (
                          <PerformanceChart 
                            series={performanceChartSeries}
                            range={range}
                          />
                        ) : (
                          renderChartPlaceholder(
                            icons.analytics,
                            'No performance data yet',
                            'Add your first investment to visualize portfolio growth'
                          )
                        )}
                    </div>

                    {}
                    {performanceSummary && (
                      <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(2, 1fr)',
                        gap: '10px',
                        width: '100%'
                      }}>
                        {}
                        <div style={{
                          padding: '12px',
                          background: 'var(--bg-tertiary)',
                          border: '1px solid var(--border-primary)',
                          borderRadius: '12px'
                        }}>
                          <div style={{ marginBottom: '6px' }}>
                            <span style={{ fontSize: '10px', color: '#94a3b8', fontWeight: '600', letterSpacing: '0.3px' }}>
                              PERIOD CHANGE
                            </span>
                          </div>
                          <div style={{ 
                            fontSize: '18px', 
                            fontWeight: '800', 
                            color: performanceSummary.periodChangePercent > 0 
                              ? '#10b981' 
                              : performanceSummary.periodChangePercent < 0 
                                ? '#ef4444' 
                                : '#94a3b8',
                            letterSpacing: '-0.5px'
                          }}>
                            {performanceSummary.periodChangePercent > 0 ? '+' : ''}{performanceSummary.periodChangePercent.toFixed(2)}%
                          </div>
                          <div style={{ fontSize: '10px', color: '#64748b', marginTop: '3px', fontWeight: '500' }}>
                            {range} Performance
                          </div>
                        </div>

                        {}
                        <div style={{
                          padding: '12px',
                          background: 'var(--bg-tertiary)',
                          border: '1px solid var(--border-primary)',
                          borderRadius: '12px'
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <div style={{ 
                    width: '28px', 
                    height: '28px', 
                              borderRadius: '8px',
                    background: 'rgba(59, 130, 246, 0.15)', 
                    display: 'flex', 
                    alignItems: 'center', 
                              justifyContent: 'center',
                              color: '#3b82f6'
                  }}>
                              {icons.flag}
                      </div>
                            <span style={{ fontSize: '10px', color: '#94a3b8', fontWeight: '600', letterSpacing: '0.3px' }}>
                              START VALUE
                            </span>
                    </div>
                          <div style={{ fontSize: '18px', fontWeight: '800', color: '#ffffff', letterSpacing: '-0.5px' }}>
                            ${performanceSummary.startValue.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                      </div>
                          <div style={{ fontSize: '10px', color: '#64748b', marginTop: '3px', fontWeight: '500' }}>
                            Initial Value
                    </div>
                        </div>

                        {}
                        <div style={{
                          padding: '12px',
                          background: 'var(--bg-tertiary)',
                          border: '1px solid var(--border-primary)',
                          borderRadius: '12px'
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <div style={{ 
                    width: '28px', 
                    height: '28px', 
                              borderRadius: '8px',
                              background: 'rgba(139, 92, 246, 0.15)',
                    display: 'flex', 
                    alignItems: 'center', 
                              justifyContent: 'center',
                              color: '#8b5cf6'
                  }}>
                              {icons.pieChart}
                  </div>
                            <span style={{ fontSize: '10px', color: '#94a3b8', fontWeight: '600', letterSpacing: '0.3px' }}>
                              CURRENT VALUE
                            </span>
                    </div>
                          <div style={{ fontSize: '18px', fontWeight: '800', color: '#ffffff', letterSpacing: '-0.5px' }}>
                            ${performanceSummary.endValue.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                </div>
                          <div style={{ fontSize: '10px', color: '#64748b', marginTop: '3px', fontWeight: '500' }}>
                            Portfolio Value
                </div>
                        </div>

                        {}
                        <div style={{
                          padding: '12px',
                          background: 'var(--bg-tertiary)',
                          border: '1px solid var(--border-primary)',
                          borderRadius: '12px'
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <div style={{ 
                    width: '28px', 
                    height: '28px', 
                              borderRadius: '8px',
                              background: performanceSummary.periodChange >= 0 ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                    display: 'flex', 
                    alignItems: 'center', 
                              justifyContent: 'center',
                              color: performanceSummary.periodChange >= 0 ? '#10b981' : '#ef4444'
                            }}>
                              {icons.dollar}
                </div>
                            <span style={{ fontSize: '10px', color: '#94a3b8', fontWeight: '600', letterSpacing: '0.3px' }}>
                              TOTAL CHANGE
                            </span>
                </div>
                          <div style={{ 
                            fontSize: '18px', 
                            fontWeight: '800',
                            color: performanceSummary.periodChange >= 0 ? '#10b981' : '#ef4444',
                            letterSpacing: '-0.5px'
                          }}>
                            {performanceSummary.periodChange >= 0 ? '+' : ''}${Math.abs(performanceSummary.periodChange).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
                          <div style={{ fontSize: '10px', color: '#64748b', marginTop: '3px', fontWeight: '500' }}>
                            Net Change
          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {}
                {activeChartTab === 'allocation' && (
                  <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
                    {hasInvestments && allocationData.data.length > 0 ? (
                      <AllocationChart allocationData={allocationData} />
                    ) : (
                      <div style={{ flex: 1, minHeight: '260px', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {renderChartPlaceholder(
                          icons.pieChart,
                          'No allocation data yet',
                          'Start investing to see how your capital is distributed'
                        )}
                      </div>
                    )}
                  </div>
                )}
            </div>
              </div>
              
              </div>
            </div>
          )}
              
          {}
          {activeMainTab === 'analytics' && (
            <div style={{ 
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 1.6fr) minmax(220px, 0.4fr)',
            gap: '24px',
            height: '100%',
            minHeight: 0,
            overflow: 'hidden'
          }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', minHeight: 0, overflow: 'auto', paddingRight: '8px' }}>
              <div className="overview-card" style={{
                background: 'var(--bg-secondary)',
                padding: '24px',
                borderRadius: '16px',
                border: '1px solid var(--border-primary)',
                flex: 1,
                minHeight: 0,
              display: 'flex', 
                flexDirection: 'column'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px', flexWrap: 'wrap', marginBottom: '20px' }}>
                  <div>
                    <div style={{ fontSize: '12px', color: '#94a3b8', letterSpacing: '0.3em', fontWeight: 600 }}>
                      DEEP DIVE
                    </div>
                    <h3 style={{ fontSize: '20px', fontWeight: 700, color: '#ffffff', margin: '6px 0 4px' }}>
                      {analyticsTabMeta.title}
                    </h3>
                    <p style={{ fontSize: '13px', color: '#94a3b8', margin: 0 }}>
                      {analyticsTabMeta.subtitle}
                    </p>
                  </div>
                  <div style={{
                    padding: '6px 12px',
                    borderRadius: '999px',
              background: 'var(--bg-tertiary)',
                    border: '1px solid var(--border-primary)',
                    color: '#94a3b8',
                    fontSize: '12px',
                    fontWeight: 600
                  }}>
                    {activeAnalyticsTab.toUpperCase()}
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '10px', marginBottom: '20px' }}>
                  {analyticsTabButtons.map((tab) => {
                    const isActive = activeAnalyticsTab === tab.id;
                    return (
              <button
                        key={tab.id}
                        onClick={() => setActiveAnalyticsTab(tab.id)}
                style={{
                          padding: '16px 20px',
                          background: isActive
                            ? 'var(--accent-blue)'
                            : 'var(--bg-tertiary)',
                          color: isActive ? '#ffffff' : '#cbd5f5',
                          border: isActive
                            ? '1px solid var(--accent-blue)'
                            : '1px solid var(--border-primary)',
                          borderRadius: '16px',
                  cursor: 'pointer',
                          transition: 'all 0.25s ease',
                  display: 'flex',
                  alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: '12px',
                          boxShadow: isActive ? '0 12px 30px rgba(59, 130, 246, 0.25)' : 'none',
                          transform: isActive ? 'translateY(-2px)' : 'translateY(0)'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{
                            width: '36px',
                            height: '36px',
                            borderRadius: '12px',
                            background: isActive ? 'rgba(255, 255, 255, 0.2)' : 'rgba(148, 163, 184, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                            color: isActive ? '#ffffff' : '#94a3b8'
                          }}>
                            {tab.icon}
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', lineHeight: 1.2 }}>
                            <span style={{ fontSize: '13px', fontWeight: 600 }}>{tab.label}</span>
                          </div>
                        </div>
                        <span style={{
                          fontSize: '11px',
                          fontWeight: 700,
                          letterSpacing: '0.2em',
                          padding: '4px 10px',
                          borderRadius: '999px',
                          background: isActive ? 'rgba(255, 255, 255, 0.2)' : 'rgba(148, 163, 184, 0.1)',
                          color: isActive ? '#ffffff' : '#94a3b8'
                        }}>
                          {tab.badge}
                        </span>
              </button>
                    );
                  })}
              </div>

                <div style={{ flex: 1, minHeight: 0, overflow: 'auto' }}>
            {activeAnalyticsTab === 'health' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', height: '100%', minHeight: 0, overflow: 'hidden' }}>
                      {}
                      <div style={{
                        padding: '18px',
                        borderRadius: '14px',
                        background: 'linear-gradient(135deg, var(--bg-tertiary) 0%, rgba(52, 211, 153, 0.05) 100%)',
                        border: '1px solid var(--border-primary)',
                        boxShadow: '0 10px 24px rgba(2, 6, 23, 0.35)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '14px',
                        flexShrink: 0,
                        position: 'relative'
                      }}>
                        {}
                        <div style={{ position: 'absolute', top: '14px', right: '14px', zIndex: 10 }}>
                          <InfoTooltip position="top-right" text="Combines diversification, yield, and risk management. Higher score = more balanced portfolio." />
                        </div>
                        {}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
                            <div>
                              <div style={{ fontSize: '12px', color: 'rgba(226, 232, 240, 0.8)', letterSpacing: '0.2em', fontWeight: 600, marginBottom: '8px' }}>
                                OVERALL HEALTH
                              </div>
                              <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px' }}>
                                <span style={{ fontSize: '56px', fontWeight: 900, color: '#34d399', lineHeight: 1, letterSpacing: '-2px' }}>
                                  {portfolioHealth.overall}
                                </span>
                                <div>
                                  <div style={{ fontSize: '18px', fontWeight: 700, color: 'rgba(226, 232, 240, 0.95)', marginBottom: '2px' }}>{healthStatusLabel}</div>
                                  <div style={{ fontSize: '12px', color: 'rgba(226, 232, 240, 0.7)', lineHeight: 1.3 }}>Composite diversification, yield & risk</div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {}
                        <div style={{
                          display: 'grid',
                          gridTemplateColumns: 'repeat(4, 1fr)',
                          gap: '10px',
                          paddingTop: '14px',
                          borderTop: '1px solid var(--border-primary)'
                        }}>
                          {healthQuickStats.map((stat) => (
                            <div key={stat.key} style={{
                              padding: '12px',
                              borderRadius: '10px',
                              background: 'var(--bg-secondary)',
                              border: '1px solid var(--border-primary)',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '10px',
                              transition: 'all 0.2s ease',
                              position: 'relative'
                            }}>
                              {}
                              <div style={{ position: 'absolute', top: '8px', right: '8px', zIndex: 10 }}>
                                <InfoTooltip position="top-right" text={
                                  stat.key === 'income' ? "Total monthly rental income from all properties." :
                                  stat.key === 'yield' ? "Average return on invested capital. Higher = better returns." :
                                  stat.key === 'properties' ? "Total properties in portfolio. More = better diversification." :
                                  "Number of geographic regions with investments. More regions = less location risk."
                                } />
                              </div>
                              <div style={{
                                width: '36px',
                                height: '36px',
                                borderRadius: '8px',
                                background: stat.accentBg,
                                color: stat.accentColor,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '16px',
                                flexShrink: 0
                              }}>
                                {stat.icon}
                              </div>
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ fontSize: '18px', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.5px', lineHeight: 1.2, marginBottom: '2px' }}>
                                  {stat.value}
                                </div>
                                <div>
                                  <span style={{ fontSize: '10px', color: 'rgba(226, 232, 240, 0.7)', letterSpacing: '0.05em', textTransform: 'uppercase', fontWeight: 500 }}>
                                    {stat.label}
                                  </span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {}
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 0.4fr', gap: '12px', flex: 1, minHeight: 0, overflow: 'hidden' }}>
                        {}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gridTemplateRows: 'repeat(2, 1fr)', gap: '12px', minHeight: 0 }}>
                          {healthMetricCards.map((metric) => (
                            <div key={metric.key} style={{
                              padding: '16px',
                              borderRadius: '14px',
                              background: 'var(--bg-tertiary)',
                              border: '1px solid var(--border-primary)',
                              boxShadow: '0 10px 24px rgba(2, 6, 23, 0.35)',
                              display: 'flex',
                              flexDirection: 'column',
                              justifyContent: 'space-between',
                              transition: 'all 0.2s ease',
                              minHeight: 0,
                              position: 'relative'
                            }}>
                              {}
                              <div style={{ position: 'absolute', top: '12px', right: '12px', zIndex: 10 }}>
                                <InfoTooltip position="top-right" text={
                                  metric.key === 'diversification' ? "How spread out your investments are. Higher = less risk from single property issues." :
                                  metric.key === 'performance' ? "How well your portfolio is growing. Positive momentum = increasing value and returns." :
                                  metric.key === 'incomeStability' ? "Consistency of rental income. Higher = more predictable cash flow." :
                                  "How well your portfolio handles market changes. Higher = better loss protection."
                                } />
                              </div>
                              <div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                                  <div style={{
                                    width: '42px',
                                    height: '42px',
                                    borderRadius: '10px',
                                    background: `${metric.accentColor}20`,
                                    border: `1px solid ${metric.accentColor}40`,
                                    color: metric.accentColor,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '20px',
                                    flexShrink: 0
                                  }}>
                                    {metric.icon}
                                  </div>
                                  <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ fontSize: '17px', fontWeight: 700, color: '#ffffff', marginBottom: '3px', lineHeight: 1.2 }}>
                                      {metric.label}
                                    </div>
                                    <div style={{ fontSize: '13px', color: '#94a3b8', lineHeight: 1.4 }}>
                                      {metric.helper}
                                    </div>
                                  </div>
                                </div>
                              </div>
                              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1, margin: '6px 0', minHeight: 0 }}>
                                <PieChart value={metric.value} color={metric.accentColor} size={110} />
                              </div>
                              <div style={{ 
                                width: '100%', 
                                height: '5px', 
                                borderRadius: '999px', 
                                background: 'rgba(148, 163, 184, 0.15)', 
                                overflow: 'hidden'
                              }}>
                                <div style={{
                                  width: `${Math.min(100, Math.max(0, metric.value))}%`,
                                  height: '100%',
                                  background: `linear-gradient(90deg, ${metric.accentColor} 0%, ${metric.accentColor}cc 100%)`,
                                  borderRadius: '999px',
                                  boxShadow: `0 0 12px ${metric.accentColor}60`,
                                  transition: 'width 0.3s ease'
                                }} />
                              </div>
                            </div>
                          ))}
                        </div>

                        {}
                        <div style={{
                          padding: '16px',
                          borderRadius: '14px',
                          background: 'var(--bg-tertiary)',
                          border: '1px solid var(--border-primary)',
                          boxShadow: '0 10px 24px rgba(2, 6, 23, 0.35)',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '12px',
                          height: '100%',
                          minHeight: 0,
                          overflow: 'hidden',
                          position: 'relative'
                        }}>
                          {}
                          <div style={{ position: 'absolute', top: '12px', right: '12px', zIndex: 10 }}>
                            <InfoTooltip position="top-right" text="Personalized suggestions to improve portfolio health based on your current metrics." />
                          </div>
                          <div style={{ 
                            fontSize: '13px', 
                            fontWeight: 600, 
                            color: '#94a3b8', 
                            letterSpacing: '0.1em',
                            textTransform: 'uppercase',
                            marginBottom: '4px',
                            flexShrink: 0
                          }}>
                            Recommendations
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', flex: 1, overflowY: 'auto', minHeight: 0 }}>
                            {portfolioHealth.recommendations.map((rec, idx) => (
                              <div key={idx} style={{
                                display: 'flex',
                                alignItems: 'flex-start',
                                gap: '12px',
                                padding: '12px',
                                borderRadius: '10px',
                                background: 'var(--bg-secondary)',
                                border: '1px solid var(--border-primary)',
                                transition: 'all 0.2s ease',
                                flexShrink: 0
                              }}>
                                <div style={{
                                  width: '28px',
                                  height: '28px',
                                  borderRadius: '8px',
                                  background: 'rgba(59, 130, 246, 0.15)',
                                  border: '1px solid rgba(59, 130, 246, 0.3)',
                                  color: '#3b82f6',
                                  fontWeight: 700,
                                  fontSize: '13px',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  flexShrink: 0
                                }}>
                                  {idx + 1}
                                </div>
                                <span style={{ 
                                  flex: 1, 
                                  fontSize: '15px', 
                                  color: '#e2e8f0', 
                                  lineHeight: 1.6,
                                  fontWeight: 400
                                }}>
                                  {rec}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
            )}

            {activeAnalyticsTab === 'calendar' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                      {incomeCalendar.length > 0 && (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '8px' }}>
                          {calendarSummaryMetrics.map((metric) => (
                            <div key={metric.key} style={{
                              padding: '18px',
                              borderRadius: '18px',
                background: 'var(--bg-secondary)',
                              border: '1px solid var(--border-primary)',
                              boxShadow: '0 14px 28px rgba(2, 6, 23, 0.35)'
                            }}>
                              <div style={{ fontSize: '12px', color: '#94a3b8', letterSpacing: '0.2em', fontWeight: 600 }}>
                                {metric.label.toUpperCase()}
                    </div>
                              <div style={{ fontSize: '26px', fontWeight: 700, color: metric.accent, marginTop: '6px' }}>
                                {metric.value}
                      </div>
                              <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '4px' }}>
                                {metric.detail}
                      </div>
                    </div>
                  ))}
              </div>
            )}
                      {incomeCalendar.length > 0 ? (
                        <>
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }}>
                            {incomeCalendar.map((month) => {
                              const statusLabel = month.isCurrent ? 'Current' : 'Projected';
                              const statusColor = month.isCurrent ? '#10b981' : '#cbd5f5';
                              const statusBg = month.isCurrent ? 'rgba(16, 185, 129, 0.18)' : 'rgba(148, 163, 184, 0.15)';
                              const statusBorder = month.isCurrent ? 'rgba(16, 185, 129, 0.45)' : 'rgba(148, 163, 184, 0.3)';
                              return (
                                <div key={month.month} style={{
                                  padding: '24px',
                                  borderRadius: '24px',
                                  background: 'var(--bg-tertiary)',
                                  border: '1px solid var(--border-primary)',
                                  boxShadow: '0 24px 40px rgba(2, 6, 23, 0.45)',
                                  display: 'flex',
                                  flexDirection: 'column',
                                  gap: '18px',
                                  minHeight: '420px'
                                }}>
                                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div>
                                      <div style={{ fontSize: '12px', color: '#94a3b8', letterSpacing: '0.2em', fontWeight: 600 }}>MONTH</div>
                                      <div style={{ fontSize: '18px', fontWeight: 700, color: '#ffffff' }}>{month.month}</div>
                                    </div>
                                    <div style={{
                                      padding: '6px 14px',
                                      borderRadius: '999px',
                                      fontSize: '12px',
                                      fontWeight: 600,
                                      background: statusBg,
                                      color: statusColor,
                                      border: `1px solid ${statusBorder}`
                                    }}>
                                      {statusLabel}
                                    </div>
                                  </div>
                                  
                                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '14px' }}>
                                    <div style={{
                                      padding: '12px',
                borderRadius: '16px',
                background: 'var(--bg-secondary)',
                                      border: '1px solid var(--border-primary)'
                                    }}>
                                      <div style={{ fontSize: '11px', color: '#94a3b8', letterSpacing: '0.1em', fontWeight: 600 }}>PROJECTED INCOME</div>
                                      <div style={{ fontSize: '22px', fontWeight: 700, color: '#10b981', marginTop: '4px' }}>
                                        ${(month.projectedIncome || 0).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                                      </div>
                                    </div>
                                    <div style={{
                                      padding: '12px',
                borderRadius: '16px',
                                      background: 'var(--bg-secondary)',
                border: '1px solid var(--border-primary)'
              }}>
                                      <div style={{ fontSize: '11px', color: '#94a3b8', letterSpacing: '0.1em', fontWeight: 600 }}>PAYMENT SOURCES</div>
                                      <div style={{ fontSize: '22px', fontWeight: 700, color: '#ffffff', marginTop: '4px' }}>
                                        {month.paymentCount}
                    </div>
                    </div>
                  </div>
                                  
                                  <div style={{
                      padding: '18px',
                                    borderRadius: '20px',
                                    background: 'var(--bg-secondary)',
                                    border: '1px solid var(--border-primary)',
                                    flex: 1,
                                    display: 'flex',
                                    flexDirection: 'column'
                                  }}>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, minmax(0, 1fr))', gap: '6px', marginBottom: '8px' }}>
                                      {calendarDayLabels.map((label) => (
                                        <div key={`${month.month}-label-${label}`} style={{ fontSize: '11px', color: '#64748b', textAlign: 'center', fontWeight: 600, letterSpacing: '0.15em' }}>
                                          {label}
                  </div>
                                      ))}
                    </div>
                                    <div style={{
                                      display: 'grid',
                                      gridTemplateColumns: 'repeat(7, minmax(0, 1fr))',
                                      gap: '6px',
                                      flex: 1
                                    }}>
                                      {month.calendarCells.map((cell, cellIdx) => {
                                        if (cell.type === 'empty') {
                                          return <div key={`${month.month}-empty-${cellIdx}`} />;
                                        }
                                        const isPayout = cell.isPayoutDay;
                                        const isToday = cell.isToday;
                                        return (
                                          <div
                                            key={`${month.month}-day-${cell.day}`}
                                            style={{
                                              height: '36px',
                                              borderRadius: '50%',
                                              display: 'flex',
                                              alignItems: 'center',
                                              justifyContent: 'center',
                                              fontSize: '13px',
                                              fontWeight: 600,
                                              color: isPayout ? '#10b981' : isToday ? '#e2e8f0' : '#cbd5f5',
                                              background: isPayout
                                                ? 'rgba(16, 185, 129, 0.15)'
                                                : isToday
                                                  ? 'rgba(148, 163, 184, 0.2)'
                                                  : 'var(--bg-tertiary)',
                                              border: isPayout
                                                ? '1px solid rgba(16, 185, 129, 0.5)'
                                                : isToday
                                                  ? '1px solid rgba(148, 163, 184, 0.45)'
                                                  : '1px solid rgba(148, 163, 184, 0.15)',
                                              boxShadow: isPayout ? '0 0 15px rgba(16, 185, 129, 0.35)' : undefined
                                            }}
                                          >
                                            {cell.day}
                  </div>
                                        );
                                      })}
                    </div>
                                    <div style={{ marginTop: '14px', display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#94a3b8' }}>
                                      <span>Payout on day {month.payoutDay}</span>
                                      <span>{statusLabel}</span>
                  </div>
                    </div>
                  </div>
                              );
                            })}
                    </div>
                          <div style={{ display: 'flex', gap: '16px', fontSize: '12px', color: '#94a3b8', marginTop: '8px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <span style={{
                                width: '14px',
                                height: '14px',
                                borderRadius: '4px',
                                background: 'rgba(16, 185, 129, 0.4)',
                                border: '1px solid rgba(16, 185, 129, 0.5)'
                              }} />
                              Payout day
                  </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <span style={{
                                width: '14px',
                                height: '14px',
                                borderRadius: '4px',
                                background: 'rgba(148, 163, 184, 0.35)',
                                border: '1px solid rgba(148, 163, 184, 0.45)'
                              }} />
                              Today
                </div>
                          </div>
                        </>
                      ) : (
                        <div style={{
                          padding: '40px',
                          borderRadius: '14px',
                          border: '1px dashed rgba(148, 163, 184, 0.4)',
                          textAlign: 'center',
                          color: '#94a3b8'
                        }}>
                          Add income-producing assets to build a timeline.
                        </div>
                      )}
                    </div>
            )}
              </div>

            {}
            <div style={{ 
              display: 'flex',
              flexDirection: 'column',
              gap: '24px',
              visibility: activeAnalyticsTab === 'geography' ? 'visible' : 'hidden',
              position: activeAnalyticsTab === 'geography' ? 'relative' : 'absolute',
              width: activeAnalyticsTab === 'geography' ? 'auto' : '0',
              height: activeAnalyticsTab === 'geography' ? 'auto' : '0',
              overflow: 'hidden'
            }}>
              {geographicData.length > 0 ? (
                        <div>
                        {}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
                          <div style={{
                            background: 'var(--bg-tertiary)',
                            border: '1px solid var(--border-primary)',
                            borderRadius: '16px',
                            padding: '20px',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '8px'
                          }}>
                            <div style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 500 }}>Total Regions</div>
                            <div style={{ fontSize: '32px', fontWeight: 700, color: '#ffffff', lineHeight: 1 }}>{geographicData.length}</div>
                          </div>
                          <div style={{
                            background: 'var(--bg-tertiary)',
                            border: '1px solid var(--border-primary)',
                            borderRadius: '16px',
                            padding: '20px',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '8px'
                          }}>
                            <div style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 500 }}>Total Properties</div>
                            <div style={{ fontSize: '32px', fontWeight: 700, color: '#ffffff', lineHeight: 1 }}>{totalGeoProperties}</div>
                          </div>
                          <div style={{
                            background: 'var(--bg-tertiary)',
                            border: '1px solid var(--border-primary)',
                            borderRadius: '16px',
                            padding: '20px',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '8px'
                          }}>
                            <div style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 500 }}>Top Market</div>
                            <div style={{ fontSize: '24px', fontWeight: 700, color: '#3b82f6', lineHeight: 1 }}>{topMarket}</div>
                          </div>
                          <div style={{
                            background: 'var(--bg-tertiary)',
                            border: '1px solid var(--border-primary)',
                            borderRadius: '16px',
                            padding: '20px',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '8px'
                          }}>
                            <div style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 500 }}>Average ROI</div>
                            <div style={{ fontSize: '32px', fontWeight: 700, color: '#10b981', lineHeight: 1 }}>{averageGeographicROI}%</div>
                          </div>
                        </div>

                        {}
                        <div style={{
                          background: 'var(--bg-tertiary)',
                          border: '1px solid var(--border-primary)',
                          borderRadius: '20px',
                          padding: '28px',
                          boxShadow: '0 20px 40px rgba(2, 6, 23, 0.45)',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '20px'
                        }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div>
                              <div style={{ fontSize: '11px', color: '#64748b', letterSpacing: '0.15em', fontWeight: 600, marginBottom: '6px' }}>GEOGRAPHIC DISTRIBUTION</div>
                              <div style={{ fontSize: '22px', color: '#ffffff', fontWeight: 700, lineHeight: 1.2 }}>Property Locations</div>
                            </div>
                            {investmentLocations.length > 0 && (
                              <div style={{
                                display: 'flex',
                                flexWrap: 'wrap',
                                gap: '10px',
                                maxWidth: '400px'
                              }}>
                                {investmentLocations.map((location, idx) => {
                                  
                                  const colorPalette = [
                                    '#3b82f6', 
                                    '#10b981', 
                                    '#f59e0b', 
                                    '#ef4444', 
                                    '#8b5cf6', 
                                    '#06b6d4', 
                                    '#f97316', 
                                    '#ec4899', 
                                    '#14b8a6', 
                                    '#6366f1'  
                                  ];
                                  const markerColor = colorPalette[idx % colorPalette.length];
                                  
                                  return (
                                    <div
                                      key={`${location.city}-${location.state}`}
                                      style={{
                                        padding: '8px 14px',
                                        borderRadius: '10px',
                                        background: 'rgba(15, 23, 42, 0.6)',
                                        border: '1px solid rgba(148, 163, 184, 0.15)',
                                        fontSize: '12px',
                                        color: '#e2e8f0',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px',
                                        fontWeight: 500
                                      }}
                                    >
                                      <div style={{ 
                                        width: '6px', 
                                        height: '6px', 
                                        borderRadius: '50%', 
                                        background: markerColor,
                                        boxShadow: `0 0 8px ${markerColor}80`
                                      }} />
                                      <span>{location.city ? `${location.city}, ${location.state}` : location.state}</span>
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                          <div style={{
                            width: '100%',
                            height: '500px',
                            borderRadius: '16px',
                            overflow: 'hidden',
                            border: '1px solid var(--border-primary)',
                            background: 'var(--bg-secondary)'
                          }}>
                            <PropertyMap 
                              locations={investmentLocations}
                              height="500px"
                            />
                          </div>
                        </div>
                        {}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
                          {geographicData.map((location, idx) => {
                            const totalValue = portfolioSummary.currentValue || 0;
                            const share = totalValue > 0 ? Math.min(100, Math.max(0, (location.totalValue / totalValue) * 100)) : 0;
                            
                            
                            const colorPalette = [
                              '#3b82f6', 
                              '#10b981', 
                              '#f59e0b', 
                              '#ef4444', 
                              '#8b5cf6', 
                              '#06b6d4', 
                              '#f97316', 
                              '#ec4899', 
                              '#14b8a6', 
                              '#6366f1'  
                            ];
                            
                            
                            const investmentLocationIdx = investmentLocations.findIndex(
                              invLoc => invLoc.state === location.state
                            );
                            const colorIdx = investmentLocationIdx >= 0 ? investmentLocationIdx : idx;
                            const locationColor = colorPalette[colorIdx % colorPalette.length];
                            
                            return (
                              <div key={location.state} style={{
                                padding: '20px',
                                borderRadius: '16px',
                                background: 'var(--bg-tertiary)',
                                border: '1px solid var(--border-primary)',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '16px',
                                transition: 'all 0.2s ease'
                              }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <div style={{
                                      width: '40px',
                                      height: '40px',
                                      borderRadius: '12px',
                                      background: locationColor,
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      border: '1px solid rgba(255, 255, 255, 0.1)',
                                      boxShadow: `0 4px 12px ${locationColor}40`
                                    }} />
                                    <div>
                                      <div style={{ fontSize: '16px', fontWeight: 700, color: '#ffffff', marginBottom: '4px' }}>{location.state}</div>
                                      <div style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 500 }}>
                                        {location.properties} {location.properties === 1 ? 'property' : 'properties'}
                                      </div>
                                    </div>
                                  </div>
                                  <div style={{
                                    padding: '6px 12px',
                                    borderRadius: '8px',
                                    background: 'rgba(148, 163, 184, 0.1)',
                                    fontSize: '11px',
                                    color: '#cbd5f5',
                                    fontWeight: 600
                                  }}>
                                    {share.toFixed(1)}% of portfolio
                                  </div>
                                </div>
                                <div style={{ 
                                  display: 'grid', 
                                  gridTemplateColumns: 'repeat(3, 1fr)', 
                                  gap: '16px',
                                  paddingTop: '12px',
                                  borderTop: '1px solid var(--border-primary)'
                                }}>
                                  <div>
                                    <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '6px', fontWeight: 500 }}>Total Invested</div>
                                    <div style={{ fontSize: '18px', fontWeight: 700, color: locationColor, lineHeight: 1.2 }}>
                                      ${(location.totalInvested || 0).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                                    </div>
                                  </div>
                                  <div>
                                    <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '6px', fontWeight: 500 }}>Current Value</div>
                                    <div style={{ fontSize: '18px', fontWeight: 700, color: locationColor, lineHeight: 1.2 }}>
                                      ${(location.totalValue || 0).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                                    </div>
                                  </div>
                                  <div>
                                    <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '6px', fontWeight: 500 }}>Average ROI</div>
                                    <div style={{ fontSize: '18px', fontWeight: 700, color: locationColor, lineHeight: 1.2 }}>
                                      {location.avgROI.toFixed(1)}%
                                    </div>
                                  </div>
                                </div>
                                <div style={{ width: '100%', height: '4px', borderRadius: '999px', background: 'rgba(148, 163, 184, 0.15)', overflow: 'hidden' }}>
                                  <div style={{ width: `${share}%`, height: '100%', background: '#10b981', borderRadius: '999px' }} />
                                </div>
                              </div>
                            );
                          })}
                        </div>
                        </div>
                ) : (
                      <div style={{
                        padding: '40px',
                        borderRadius: '14px',
                        border: '1px dashed rgba(148, 163, 184, 0.4)',
                        background: 'var(--bg-tertiary)',
                        textAlign: 'center',
                        color: '#94a3b8'
                      }}>
                        Start investing to unlock geographic intelligence.
                      </div>
                    )}
            </div>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', minHeight: 0, overflow: 'auto', paddingRight: '8px' }}>
              <div className="overview-card" style={{
                background: 'var(--bg-secondary)',
                padding: '22px',
                borderRadius: '16px',
                border: '1px solid var(--border-primary)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <h4 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: '#ffffff' }}>Upcoming Cash Flow</h4>
                  <span style={{ fontSize: '12px', color: '#94a3b8' }}>{formattedNextPayoutDate}</span>
                </div>
                <div style={{
                  padding: '18px',
                  borderRadius: '14px',
                  background: 'rgba(16, 185, 129, 0.08)',
                  border: '1px solid rgba(16, 185, 129, 0.2)',
                  marginBottom: '16px'
                }}>
                  <div style={{ fontSize: '12px', color: '#10b981', fontWeight: 600, letterSpacing: '0.2em', marginBottom: '6px' }}>
                    NEXT PAYOUT
                  </div>
                  <div style={{ fontSize: '28px', fontWeight: 700, color: '#10b981' }}>
                    ${(incomeMetrics.nextPayoutAmount || 0).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                  </div>
                  <div style={{ fontSize: '12px', color: '#94a3b8' }}>
                    {daysUntilPayout !== null ? `Arrives in ${daysUntilPayout} days` : 'Schedule pending'}
                  </div>
                </div>
                {miniCalendar.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {miniCalendar.map((month, idx) => (
                      <div key={month.month} style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '12px 14px',
                        borderRadius: '12px',
                        background: 'var(--bg-tertiary)',
                        border: '1px solid var(--border-primary)'
                      }}>
                        <div>
                          <div style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 600 }}>{month.month}</div>
                          <div style={{ fontSize: '16px', fontWeight: 700, color: '#ffffff' }}>
                            ${(month.projectedIncome || 0).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                          </div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: '12px', color: '#94a3b8' }}>
                            {month.paymentCount} {month.paymentCount === 1 ? 'payment' : 'payments'}
                          </div>
                          {idx === 0 && (
                            <span style={{ fontSize: '11px', color: '#10b981', fontWeight: 600 }}>Current</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{
                    padding: '24px',
                    borderRadius: '12px',
                    border: '1px dashed rgba(148, 163, 184, 0.4)',
                    textAlign: 'center',
                    color: '#94a3b8'
                  }}>
                    No scheduled payouts yet.
              </div>
                )}
              </div>

              <div className="overview-card" style={{
                background: 'var(--bg-secondary)',
                padding: '22px',
                borderRadius: '16px',
                border: '1px solid var(--border-primary)'
              }}>
                <h4 style={{ margin: '0 0 16px', fontSize: '16px', fontWeight: 700, color: '#ffffff' }}>Signal Monitor</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {signalHighlights.map((signal) => (
                    <div key={signal.key} style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '12px 14px',
                      borderRadius: '12px',
                      background: 'var(--bg-tertiary)',
                      border: '1px solid var(--border-primary)'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{
                          width: '34px',
                          height: '34px',
                          borderRadius: '10px',
                          background: signal.background,
                          color: signal.color,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          {signal.icon}
                        </div>
                        <div>
                          <div style={{ fontSize: '13px', color: '#ffffff', fontWeight: 600 }}>{signal.label}</div>
                          <div style={{ fontSize: '12px', color: '#94a3b8' }}>{signal.helper}</div>
                        </div>
                      </div>
                      <div style={{ fontSize: '16px', fontWeight: 700, color: signal.color }}>
                        {signal.value}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}


        </div>
      </div>
    </>
  );
};

export default Overview;
