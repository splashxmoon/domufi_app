import React, { useState, useMemo } from 'react';
import { useInvestments } from '../contexts/InvestmentContext';
import { useNavigate } from 'react-router-dom';


const platformProperties = [
  {
    id: 1,
    name: "Luxury SoHo Loft Complex",
    location: "SoHo, New York",
    propertyType: "Residential",
    tokenPrice: 50,
    totalTokens: 10000,
    annualROI: 11.2,
    monthlyRent: 8450,
    occupancy: 95,
    availableTokens: 74,
    description: "Premium luxury residential complex in the heart of SoHo with high-end amenities and excellent rental potential.",
    yearBuilt: 2018,
    squareFootage: "45,000 sq ft",
    units: 24
  },
  {
    id: 2,
    name: "Miami Beach Luxury Condos",
    location: "Miami Beach, Florida",
    propertyType: "Residential",
    tokenPrice: 50,
    totalTokens: 15000,
    annualROI: 8.5,
    monthlyRent: 12500,
    occupancy: 88,
    availableTokens: 45,
    description: "Premium oceanfront residential condominiums in Miami Beach with stunning views and resort amenities.",
    yearBuilt: 2020,
    squareFootage: "75,000 sq ft",
    units: 48
  },
  {
    id: 3,
    name: "Beverly Hills Luxury Villa",
    location: "Beverly Hills, California",
    propertyType: "Residential",
    tokenPrice: 75,
    totalTokens: 8000,
    annualROI: 9.8,
    monthlyRent: 12000,
    occupancy: 100,
    availableTokens: 0,
    description: "Exclusive luxury villa in Beverly Hills with premium finishes and celebrity appeal.",
    yearBuilt: 2019,
    squareFootage: "8,500 sq ft",
    units: 1
  },
  {
    id: 4,
    name: "Chicago Lakefront Apartments",
    location: "Chicago, Illinois",
    propertyType: "Residential",
    tokenPrice: 40,
    totalTokens: 12000,
    annualROI: 7.2,
    monthlyRent: 9800,
    occupancy: 92,
    availableTokens: 120,
    description: "Premium lakefront residential apartments in Chicago with stunning Lake Michigan views.",
    yearBuilt: 2017,
    squareFootage: "60,000 sq ft",
    units: 36
  },
  {
    id: 5,
    name: "Seattle Urban Lofts",
    location: "Seattle, Washington",
    propertyType: "Residential",
    tokenPrice: 60,
    totalTokens: 20000,
    annualROI: 12.5,
    monthlyRent: 18000,
    occupancy: 98,
    availableTokens: 200,
    description: "Modern urban residential lofts in Seattle's tech district with contemporary design and smart home features.",
    yearBuilt: 2021,
    squareFootage: "100,000 sq ft",
    units: 52
  },
  {
    id: 6,
    name: "Austin Residential Complex",
    location: "Austin, Texas",
    propertyType: "Residential",
    tokenPrice: 35,
    totalTokens: 15000,
    annualROI: 8.1,
    monthlyRent: 7200,
    occupancy: 89,
    availableTokens: 180,
    description: "Modern residential complex in Austin's growing tech district.",
    yearBuilt: 2020,
    squareFootage: "55,000 sq ft",
    units: 45
  }
];

export default function Portfolio() {
  const { getPortfolioSummary, getInvestmentsByProperty, getAllInvestmentReturns, investments, transactions, updateTimestamp } = useInvestments();
  const navigate = useNavigate();
  const [filterType, setFilterType] = useState('all');
  const [sortBy, setSortBy] = useState('value');
  const [viewMode, setViewMode] = useState('grid'); 
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedPropertyForModal, setSelectedPropertyForModal] = useState(null); 
  const [activeDetailTab, setActiveDetailTab] = useState('financial'); 
  
  const PROPERTIES_PER_PAGE = 5;

  
  const getFriendlyMessage = (type, data) => {
    switch (type) {
      case 'propertyPayout':
        return `This property paid out $${(data || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} last month`;
      case 'marketGrowth':
        const growth = (data || 8).toFixed(1);
        return `Market has grown ${growth}% YoY`;
      case 'outperforming':
        const outperformance = (data || 12).toFixed(1);
        return `You are outperforming the average investor in this zip code by ${outperformance}%`;
      case 'riskScore':
        if (data <= 2) return "This property's risk score is low";
        if (data <= 3) return "This property's risk score is moderate";
        return "This property's risk score is high";
      case 'portfolioGrowth':
        const growthPct = (data || 0).toFixed(1);
        if (growthPct > 0) return `Your portfolio grew ${growthPct}% this month`;
        return `Your portfolio is stable`;
      default:
        return '';
    }
  };

  
  const portfolioSummary = React.useMemo(() => getPortfolioSummary(), [investments, updateTimestamp]);
  const investmentsByProperty = React.useMemo(() => getInvestmentsByProperty(), [investments]);

  
  const getPropertyDetails = (propertyId) => {
    return platformProperties.find(prop => prop.id === propertyId);
  };

  
  
  const calculateAppreciation = (purchaseDate, annualROI, totalInvested) => {
    const now = new Date();
    const purchase = new Date(purchaseDate);
    const daysHeld = Math.floor((now - purchase) / (1000 * 60 * 60 * 24));
    const yearsHeld = daysHeld / 365;
    
    
    const baseAppreciation = 1 + (annualROI / 100) * yearsHeld;
    
    
    const volatility = 1 + ((Math.random() - 0.4) * 0.05);
    
    
    const propertyFactor = 0.98 + (Math.random() * 0.04);
    
    const currentValue = totalInvested * baseAppreciation * volatility * propertyFactor;
    const appreciation = ((currentValue / totalInvested) - 1) * 100;
    
    return Math.max(0, appreciation);
  };

  
  const calculateOwnershipPercentage = (tokensOwned, totalTokens) => {
    return totalTokens > 0 ? (tokensOwned / totalTokens) * 100 : 0;
  };

  
  const calculatePropertyMetrics = (property) => {
    const annualIncome = property.monthlyIncome * 12;
    const propertyDetails = getPropertyDetails(property.id);
    
    
    const maintenanceExpense = annualIncome * 0.08; 
    const managementExpense = annualIncome * 0.10; 
    const insuranceExpense = property.currentValue * 0.003; 
    const taxExpense = property.currentValue * 0.012; 
    const totalExpenses = maintenanceExpense + managementExpense + insuranceExpense + taxExpense;
    
    
    const noi = annualIncome - totalExpenses;
    
    
    const capRate = property.currentValue > 0 ? (noi / property.currentValue) * 100 : 0;
    
    
    const cashOnCashROI = property.totalInvested > 0 ? (noi / property.totalInvested) * 100 : 0;
    
    
    const rentalIncome = annualIncome * 0.85; 
    const appreciationIncome = annualIncome * 0.15; 
    
    
    const expenseBreakdown = {
      maintenance: maintenanceExpense,
      management: managementExpense,
      insurance: insuranceExpense,
      taxes: taxExpense,
      total: totalExpenses
    };
    
    
    const revenueStreams = {
      rental: rentalIncome,
      appreciation: appreciationIncome,
      total: annualIncome
    };
    
    
    const distributionHistory = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 15);
      const projected = property.monthlyIncome;
      const actual = projected * (0.95 + Math.random() * 0.1); 
      distributionHistory.push({
        date: date.toISOString(),
        projected,
        actual,
        variance: actual - projected,
        variancePercent: ((actual - projected) / projected) * 100
      });
    }
    
    return {
      noi,
      capRate,
      cashOnCashROI,
      expenseBreakdown,
      revenueStreams,
      distributionHistory,
      annualIncome,
      totalExpenses
    };
  };

  
  const getOperationalData = (property) => {
    const propertyDetails = getPropertyDetails(property.id);
    const occupancy = propertyDetails?.occupancy || 95;
    const vacancyRate = 100 - occupancy;
    
    
    const tenantInfo = {
      currentTenants: propertyDetails?.units ? Math.floor(propertyDetails.units * (occupancy / 100)) : 0,
      totalUnits: propertyDetails?.units || 0,
      occupancyRate: occupancy,
      vacancyRate: vacancyRate,
      leaseExpirations: [
        { unit: 'A-101', expirationDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(), tenant: 'John Smith' },
        { unit: 'B-205', expirationDate: new Date(Date.now() + 120 * 24 * 60 * 60 * 1000).toISOString(), tenant: 'Sarah Johnson' },
        { unit: 'C-310', expirationDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString(), tenant: 'Michael Chen' }
      ].slice(0, Math.min(3, propertyDetails?.units || 0))
    };
    
    
    const maintenanceSchedule = [
      { type: 'HVAC Inspection', date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), priority: 'Routine', estimatedCost: 500 },
      { type: 'Roof Inspection', date: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(), priority: 'Routine', estimatedCost: 800 },
      { type: 'Plumbing Maintenance', date: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString(), priority: 'Routine', estimatedCost: 300 }
    ];
    
    
    const financingEvents = [
      { type: 'Loan Maturity', date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), description: 'Primary mortgage maturity' },
      { type: 'Refinancing Opportunity', date: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString(), description: 'Potential rate reduction available' }
    ];
    
    return {
      tenantInfo,
      maintenanceSchedule,
      financingEvents
    };
  };

  
  const getRiskAndCapitalData = (property) => {
    
    const capitalStack = {
      equity: property.totalInvested,
      debt: property.currentValue * 0.65, 
      total: property.currentValue
    };
    
    
    const debtToEquity = capitalStack.equity > 0 ? (capitalStack.debt / capitalStack.equity) : 0;
    const loanToValue = property.currentValue > 0 ? (capitalStack.debt / property.currentValue) * 100 : 0;
    
    
    const riskSources = {
      location: { score: 2, label: 'Low', description: 'Prime location with stable market' },
      market: { score: 3, label: 'Moderate', description: 'Market conditions are stable' },
      tenant: { score: 2, label: 'Low', description: 'High-quality tenant base' }
    };
    
    
    const overallRiskScore = (riskSources.location.score + riskSources.market.score + riskSources.tenant.score) / 3;
    
    return {
      capitalStack,
      debtToEquity,
      loanToValue,
      riskSources,
      overallRiskScore
    };
  };
  
  
  const investmentReturns = React.useMemo(() => getAllInvestmentReturns(), [investments, updateTimestamp]);
  const returnsMap = React.useMemo(() => 
    new Map(investmentReturns.map(item => [item.investment.propertyId, item.returns])),
    [investmentReturns]
  );

  const portfolioData = {
    totalValue: portfolioSummary.currentValue,
    totalInvested: portfolioSummary.totalInvested,
    totalReturn: portfolioSummary.totalReturn,
    totalReturnPercentage: portfolioSummary.totalReturnPercentage,
    totalDividends: portfolioSummary.totalDividends || 0,
    totalAppreciation: portfolioSummary.totalAppreciation || 0,
    monthlyIncome: portfolioSummary.monthlyIncome,
    properties: investmentsByProperty
      .map(inv => {
        const propertyDetails = getPropertyDetails(inv.propertyId);
        const purchaseDate = inv.investments[0]?.purchaseDate || new Date().toISOString();
        
        
        const returns = returnsMap.get(inv.propertyId);
        const currentValue = returns?.currentValue || inv.totalInvested * (1 + (inv.annualROI / 100) * ((new Date() - new Date(purchaseDate)) / (1000 * 60 * 60 * 24 * 365)));
        const returnAmount = returns?.totalReturn || (currentValue - inv.totalInvested);
        const returnPercentage = returns?.totalReturnPercentage || ((returnAmount / inv.totalInvested) * 100);
        const dividends = returns?.dividends || 0;
        const appreciation = returns?.appreciation || (currentValue - inv.totalInvested - dividends);
        
        const ownershipPercentage = calculateOwnershipPercentage(inv.totalTokens, propertyDetails?.totalTokens || 1);
        
        return {
          id: inv.propertyId,
          name: inv.propertyName,
          location: inv.propertyCity,
          type: propertyDetails?.propertyType || 'Real Estate',
          tokens: inv.totalTokens,
          tokensOwned: inv.totalTokens,
          tokenPrice: inv.tokenPrice,
          currentValue,
          totalInvested: inv.totalInvested,
          returnAmount,
          returnPercentage,
          dividends,
          appreciation,
          monthlyIncome: returns?.monthlyDividend || (() => {
            
            let enhancedROI = inv.annualROI * 1.12;
            enhancedROI = Math.min(12, Math.max(8, enhancedROI));
            const calculated = (inv.totalInvested * (enhancedROI / 100)) / 12;
            return Math.max(inv.totalInvested * 0.004, calculated); 
          })(),
          annualROI: inv.annualROI,
          ownershipPercentage,
          purchaseDate,
          status: 'Active',
          monthsHeld: returns?.monthsHeld || 0,
          propertyDetails
        };
      })
      .filter(prop => prop.type === 'Residential') 
  };

  
  const incomeMetrics = React.useMemo(() => {
    
    const totalMonthlyIncome = portfolioSummary.monthlyIncome || 0;
    const totalAnnualIncome = portfolioSummary.annualIncome || (totalMonthlyIncome * 12);
    const averageYield = investments.length > 0 && portfolioSummary.totalInvested > 0
      ? (totalAnnualIncome / portfolioSummary.totalInvested) * 100
      : 0;
    
    return {
      monthlyIncome: totalMonthlyIncome,
      annualIncome: totalAnnualIncome,
      averageYield: averageYield,
      totalProperties: portfolioSummary.totalProperties,
      dailyIncome: portfolioSummary.dailyIncome || 0,
      hourlyIncome: portfolioSummary.hourlyIncome || 0
    };
  }, [investments, portfolioSummary]);

  
  const geographicDistribution = useMemo(() => {
    const geoMap = {};
    portfolioData.properties.forEach(prop => {
      const state = prop.location.split(', ')[1] || prop.location;
      if (!geoMap[state]) {
        geoMap[state] = { count: 0, value: 0 };
      }
      geoMap[state].count++;
      geoMap[state].value += prop.currentValue;
    });
    
    const totalValue = portfolioData.totalValue;
    return Object.entries(geoMap).map(([location, data]) => ({
      location,
      count: data.count,
      value: data.value,
      percentage: totalValue > 0 ? (data.value / totalValue) * 100 : 0
    })).sort((a, b) => b.value - a.value);
  }, [portfolioData.properties, portfolioData.totalValue]);

  
  const diversificationScore = useMemo(() => {
    const propertyCount = portfolioData.properties.length;
    const uniqueLocations = new Set(portfolioData.properties.map(prop => prop.location)).size;
    
    
    
    
    
    
    let score = 0;
    let scoreLabel = 'Poor';
    
    
    if (propertyCount >= 5) score += 40;
    else if (propertyCount >= 3) score += 30;
    else if (propertyCount >= 2) score += 20;
    else if (propertyCount >= 1) score += 10;
    
    
    if (uniqueLocations >= 4) score += 30;
    else if (uniqueLocations >= 3) score += 20;
    else if (uniqueLocations >= 2) score += 15;
    else if (uniqueLocations >= 1) score += 10;
    
    
    if (propertyCount > 1) {
      const values = portfolioData.properties.map(p => p.currentValue);
      const maxValue = Math.max(...values);
      const minValue = Math.min(...values);
      const ratio = minValue / maxValue;
      
      if (ratio >= 0.5) score += 30; 
      else if (ratio >= 0.3) score += 20; 
      else if (ratio >= 0.1) score += 10; 
    }
    
    
    if (score >= 80) scoreLabel = 'Excellent';
    else if (score >= 60) scoreLabel = 'Good';
    else if (score >= 40) scoreLabel = 'Fair';
    else scoreLabel = 'Poor';
    
    return { score, label: scoreLabel, propertyCount, uniqueLocations };
  }, [portfolioData.properties]);

  
  const liquidityScore = useMemo(() => {
    
    
    const totalTokens = portfolioData.properties.reduce((sum, prop) => sum + prop.tokensOwned, 0);
    const avgTokensPerProperty = portfolioData.properties.length > 0 
      ? totalTokens / portfolioData.properties.length 
      : 0;
    
    let score = 'High';
    if (avgTokensPerProperty < 100) score = 'Medium';
    if (portfolioData.properties.length === 0) score = 'N/A';
    
    return score;
  }, [portfolioData.properties]);

  const filteredProperties = useMemo(() => {
    let filtered = portfolioData.properties;
    
    if (filterType !== 'all') {
      filtered = filtered.filter(prop => prop.type.toLowerCase() === filterType.toLowerCase());
    }
    
    if (searchQuery) {
      filtered = filtered.filter(prop => 
        prop.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        prop.location.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    return filtered.sort((a, b) => {
      switch (sortBy) {
        case 'value':
          return b.currentValue - a.currentValue;
        case 'return':
          return b.returnPercentage - a.returnPercentage;
        case 'date':
          return new Date(b.purchaseDate) - new Date(a.purchaseDate);
        case 'name':
          return a.name.localeCompare(b.name);
        default:
          return 0;
      }
    });
  }, [filterType, sortBy, portfolioData.properties, searchQuery]);

  
  const totalPages = Math.ceil(filteredProperties.length / PROPERTIES_PER_PAGE);
  const startIndex = (currentPage - 1) * PROPERTIES_PER_PAGE;
  const endIndex = startIndex + PROPERTIES_PER_PAGE;
  const paginatedProperties = filteredProperties.slice(startIndex, endIndex);

  
  React.useEffect(() => {
    setCurrentPage(1);
  }, [filterType, sortBy, searchQuery]);

  
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          pages.push(i);
        }
        pages.push('ellipsis');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push('ellipsis');
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        pages.push('ellipsis');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push('ellipsis');
        pages.push(totalPages);
      }
    }
    return pages;
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatPercentage = (percentage) => {
    return `${percentage >= 0 ? '+' : ''}${percentage.toFixed(1)}%`;
  };

  
  const recentTransactions = useMemo(() => {
    if (!transactions || transactions.length === 0) return [];
    return transactions.slice(0, 5).sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [transactions]);

  
  const openPropertyModal = (property, e) => {
    e.stopPropagation();
    setSelectedPropertyForModal(property);
    setActiveDetailTab('financial');
  };

  
  const closePropertyModal = () => {
    setSelectedPropertyForModal(null);
  };

  return (
    <div id="portfolio" className="page-section active">
      <div className="portfolio-container">
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
            overflow: 'hidden',
            animation: 'breathe 4s ease-in-out infinite'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
              <div>
                <div style={{ fontSize: '12px', color: '#ffffff', opacity: 0.7, marginBottom: '6px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Total Portfolio Value
        </div>
                <div style={{ fontSize: '28px', fontWeight: '700', color: '#ffffff', letterSpacing: '-0.02em', fontVariantNumeric: 'tabular-nums', marginBottom: '6px' }}>
                  {formatCurrency(portfolioData.totalValue)}
                     </div>
                <div style={{ fontSize: '12px', color: '#94a3b8', fontStyle: 'italic', animation: 'gentlePulse 3s ease-in-out infinite' }}>
                  {getFriendlyMessage('portfolioGrowth', portfolioData.totalReturnPercentage)}
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
                  <path d="M12 2L2 7L12 12L22 7L12 2Z" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M2 17L12 22L22 17" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M2 12L12 17L22 12" strokeLinecap="round" strokeLinejoin="round"/>
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
                  <path d="M7 17L17 7M17 7H7M17 7V17" strokeLinecap="round" strokeLinejoin="round"/>
                       </svg>
                {formatPercentage(portfolioData.totalReturnPercentage)}
                     </div>
              <span style={{ fontSize: '12px', color: '#ffffff', opacity: 0.6 }}>All-time</span>
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
                  Total Invested
                     </div>
                <div style={{ fontSize: '28px', fontWeight: '700', color: '#ffffff', letterSpacing: '-0.02em', fontVariantNumeric: 'tabular-nums' }}>
                  {formatCurrency(portfolioData.totalInvested)}
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
                  <path d="M12 2V22M17 5H9.5C8.11929 5 7 6.11929 7 7.5S8.11929 10 9.5 10H14.5C15.8807 10 17 11.1193 17 12.5S15.8807 15 14.5 15H7" strokeLinecap="round" strokeLinejoin="round"/>
                       </svg>
                     </div>
                     </div>
            <div style={{ fontSize: '13px', color: '#ffffff', opacity: 0.7, paddingTop: '12px', borderTop: '1px solid var(--border-primary)' }}>
              {portfolioData.properties.length} {portfolioData.properties.length === 1 ? 'property' : 'properties'}
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
                  Monthly Income
                       </div>
                <div style={{ fontSize: '28px', fontWeight: '700', color: '#10b981', letterSpacing: '-0.02em', fontVariantNumeric: 'tabular-nums' }}>
                  {formatCurrency(incomeMetrics.monthlyIncome)}
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
                  <path d="M22 12H18L15 21L9 3L6 12H2" strokeLinecap="round" strokeLinejoin="round"/>
                           </svg>
                         </div>
                       </div>
            <div style={{ fontSize: '13px', color: '#ffffff', opacity: 0.7, paddingTop: '12px', borderTop: '1px solid var(--border-primary)' }}>
              {formatCurrency(incomeMetrics.annualIncome)} annually
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
                  Average Yield
                         </div>
                <div style={{ fontSize: '28px', fontWeight: '700', color: '#ffffff', letterSpacing: '-0.02em', fontVariantNumeric: 'tabular-nums' }}>
                  {incomeMetrics.averageYield.toFixed(2)}%
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
                  <path d="M3 3H21V21H3V3Z" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M9 9H15V15H9V9Z" strokeLinecap="round" strokeLinejoin="round"/>
                       </svg>
                     </div>
                       </div>
            <div style={{ fontSize: '13px', color: '#ffffff', opacity: 0.7, paddingTop: '12px', borderTop: '1px solid var(--border-primary)' }}>
              Portfolio average ROI
                     </div>
                   </div>
                 </div>

        {}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '16px', marginBottom: '24px' }}>
          {}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {}
            <div style={{
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-primary)',
              borderRadius: '14px',
              padding: '20px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <div>
                  <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#ffffff', marginBottom: '4px', letterSpacing: '-0.01em' }}>
                    Your Properties
                  </h2>
                  <p style={{ fontSize: '13px', color: '#ffffff', opacity: 0.7, margin: 0 }}>
                    {filteredProperties.length} {filteredProperties.length === 1 ? 'property' : 'properties'} in your portfolio
                  </p>
                 </div>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="text"
                      placeholder="Search properties..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      style={{
                        padding: '8px 12px 8px 36px',
                        background: 'var(--bg-tertiary)',
                        border: '1px solid var(--border-primary)',
                        borderRadius: '8px',
                        color: '#ffffff',
                        fontSize: '13px',
                        width: '200px',
                        outline: 'none'
                      }}
                    />
                    <svg 
                      width="16" 
                      height="16" 
                      viewBox="0 0 24 24" 
                      fill="none" 
                      stroke="currentColor" 
                      strokeWidth="2"
                      style={{
                        position: 'absolute',
                        left: '12px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        color: '#ffffff',
                        opacity: 0.5
                      }}
                    >
                      <path d="M21 21L15.0001 15M17 10C17 13.866 13.866 17 10 17C6.13401 17 3 13.866 3 10C3 6.13401 6.13401 3 10 3C13.866 3 17 6.13401 17 10Z" strokeLinecap="round" strokeLinejoin="round"/>
                         </svg>
                       </div>
                  <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    style={{
                      padding: '8px 12px',
                      background: 'var(--bg-tertiary)',
                      border: '1px solid var(--border-primary)',
                      borderRadius: '8px',
                      color: '#ffffff',
                      fontSize: '13px',
                      cursor: 'pointer',
                      outline: 'none',
                      display: 'none' 
                    }}
                  >
                    <option value="all">All Properties</option>
                  </select>
                   <select
                     value={sortBy}
                     onChange={(e) => setSortBy(e.target.value)}
                    style={{
                      padding: '8px 12px',
                      background: 'var(--bg-tertiary)',
                      border: '1px solid var(--border-primary)',
                      borderRadius: '8px',
                      color: '#ffffff',
                      fontSize: '13px',
                      cursor: 'pointer',
                      outline: 'none'
                    }}
                   >
                     <option value="value">Sort by Value</option>
                     <option value="return">Sort by Return</option>
                     <option value="date">Sort by Date</option>
                     <option value="name">Sort by Name</option>
                   </select>
                 </div>
               </div>

                 {filteredProperties.length === 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 20px', textAlign: 'center' }}>
                  <div style={{ 
                    width: '64px', 
                    height: '64px', 
                    borderRadius: '50%', 
                    background: 'var(--bg-tertiary)', 
                    border: '1.5px solid var(--border-primary)',
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    marginBottom: '16px',
                    opacity: 0.7
                  }}>
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--text-secondary)" strokeWidth="2">
                      <path d="M3 3H21V21H3V3Z" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M9 9H15V15H9V9Z" strokeLinecap="round" strokeLinejoin="round"/>
                       </svg>
                       </div>
                  <p style={{ fontSize: '16px', fontWeight: '600', color: '#ffffff', marginBottom: '8px' }}>No Properties Found</p>
                  <p style={{ fontSize: '14px', color: '#ffffff', opacity: 0.7, marginBottom: '20px', maxWidth: '400px' }}>
                    {searchQuery ? 'Try adjusting your search or filters' : 'Start building your portfolio by investing in tokenized properties'}
                  </p>
                  {!searchQuery && (
                     <button 
                      onClick={() => navigate('/dashboard/marketplace')}
                      style={{ 
                        padding: '10px 18px', 
                        background: 'var(--accent-blue)', 
                        border: 'none', 
                        borderRadius: '8px', 
                        color: '#ffffff', 
                        fontSize: '13px', 
                        fontWeight: '600', 
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                    >
                       Browse Properties
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M5 12H19M19 12L12 5M19 12L12 19" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                     </button>
                  )}
                       </div>
                 ) : (
                <>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {paginatedProperties.map((property, index) => (
                    <div
                      key={property.id}
                      style={{
                        padding: '20px',
                        background: 'var(--bg-tertiary)',
                        border: '1px solid var(--border-primary)',
                        borderRadius: '14px',
                        transition: 'all 0.2s ease',
                        cursor: 'pointer',
                        position: 'relative',
                        overflow: 'hidden',
                        animation: `breathe 4s ease-in-out infinite ${index * 0.2}s`
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'var(--bg-secondary)';
                        e.currentTarget.style.borderColor = 'var(--border-secondary)';
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.3)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'var(--bg-tertiary)';
                        e.currentTarget.style.borderColor = 'var(--border-primary)';
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = 'none';
                      }}
                      onClick={() => navigate(`/dashboard/property/${property.id}`)}
                    >
                      {}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                        <div style={{ flex: 1 }}>
                          <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#ffffff', marginBottom: '8px', letterSpacing: '-0.01em', lineHeight: '1.3' }}>
                            {property.name}
                          </h3>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#ffffff', opacity: 0.75 }}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M21 10C21 17 12 23 12 23S3 17 3 10C3 7.61305 3.94821 5.32387 5.63604 3.63604C7.32387 1.94821 9.61305 1 12 1C14.3869 1 16.6761 1.94821 18.3639 3.63604C20.0518 5.32387 21 7.61305 21 10Z" strokeLinecap="round" strokeLinejoin="round"/>
                              <circle cx="12" cy="10" r="3" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                            <span>{property.location}</span>
                            <span style={{ opacity: 0.4 }}>•</span>
                            <span style={{ opacity: 0.8 }}>{property.type}</span>
                          </div>
                        </div>
                        <div style={{ 
                          padding: '6px 14px', 
                          background: property.status === 'Active' ? 'rgba(16, 185, 129, 0.15)' : 'var(--bg-secondary)', 
                          borderRadius: '8px', 
                          fontSize: '12px', 
                          fontWeight: '600', 
                          color: property.status === 'Active' ? '#10b981' : '#ffffff',
                          border: `1px solid ${property.status === 'Active' ? 'rgba(16, 185, 129, 0.3)' : 'var(--border-primary)'}`,
                          whiteSpace: 'nowrap'
                        }}>
                          {property.status}
                        </div>
                      </div>

                      {}
                      <div style={{ 
                        display: 'grid', 
                        gridTemplateColumns: '1fr 1fr', 
                        gap: '16px', 
                        marginBottom: '20px',
                        padding: '16px',
                        background: 'var(--bg-secondary)',
                        borderRadius: '12px',
                        border: '1px solid var(--border-primary)'
                      }}>
                        {}
                        <div>
                          <div style={{ fontSize: '11px', color: '#ffffff', opacity: 0.6, marginBottom: '6px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            Current Value
                          </div>
                          <div style={{ fontSize: '22px', fontWeight: '700', color: '#ffffff', fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.02em', marginBottom: '4px' }}>
                            {formatCurrency(property.currentValue)}
                          </div>
                          <div style={{ fontSize: '11px', color: '#ffffff', opacity: 0.5 }}>
                            Invested: {formatCurrency(property.totalInvested)}
                          </div>
                        </div>

                        {}
                        <div>
                          <div style={{ fontSize: '11px', color: '#ffffff', opacity: 0.6, marginBottom: '6px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            Total Return
                          </div>
                          <div style={{ 
                            fontSize: '22px', 
                            fontWeight: '700', 
                            color: '#10b981', 
                            fontVariantNumeric: 'tabular-nums',
                            letterSpacing: '-0.02em',
                            marginBottom: '4px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px'
                          }}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                              <path d="M7 17L17 7M17 7H7M17 7V17" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                            {formatPercentage(property.returnPercentage)}
                          </div>
                          <div style={{ fontSize: '11px', color: '#10b981', opacity: 0.8 }}>
                            {formatCurrency(property.returnAmount)}
                          </div>
                        </div>
                      </div>

                      {}
                      <div style={{ 
                        display: 'grid', 
                        gridTemplateColumns: 'repeat(2, 1fr)', 
                        gap: '12px', 
                        marginBottom: '20px' 
                      }}>
                        <div style={{ padding: '12px', background: 'var(--bg-secondary)', borderRadius: '10px', border: '1px solid var(--border-primary)' }}>
                          <div style={{ fontSize: '10px', color: '#ffffff', opacity: 0.6, marginBottom: '6px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            Monthly Income
                          </div>
                          <div style={{ fontSize: '16px', fontWeight: '700', color: '#10b981', fontVariantNumeric: 'tabular-nums' }}>
                            {formatCurrency(property.monthlyIncome)}
                          </div>
                          <div style={{ fontSize: '10px', color: '#94a3b8', marginTop: '4px', fontStyle: 'italic', animation: 'gentlePulse 3s ease-in-out infinite' }}>
                            {getFriendlyMessage('propertyPayout', property.monthlyIncome)}
                          </div>
                        </div>

                        <div style={{ padding: '12px', background: 'var(--bg-secondary)', borderRadius: '10px', border: '1px solid var(--border-primary)' }}>
                          <div style={{ fontSize: '10px', color: '#ffffff', opacity: 0.6, marginBottom: '6px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            Annual ROI
                          </div>
                          <div style={{ fontSize: '16px', fontWeight: '700', color: '#ffffff', fontVariantNumeric: 'tabular-nums' }}>
                            {property.annualROI.toFixed(1)}%
                          </div>
                          <div style={{ fontSize: '10px', color: '#ffffff', opacity: 0.5, marginTop: '2px' }}>
                            Expected return
                          </div>
                        </div>
                      </div>

                      {}
                      <div style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center', 
                        paddingTop: '16px', 
                        borderTop: '1px solid var(--border-primary)' 
                      }}>
                        <div style={{ display: 'flex', gap: '20px', fontSize: '12px', color: '#ffffff', opacity: 0.7 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" opacity="0.6">
                              <path d="M12 2L2 7L12 12L22 7L12 2Z" strokeLinecap="round" strokeLinejoin="round"/>
                              <path d="M2 17L12 22L22 17" strokeLinecap="round" strokeLinejoin="round"/>
                              <path d="M2 12L12 17L22 12" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                            <span>{property.tokensOwned.toLocaleString()} tokens</span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" opacity="0.6">
                              <path d="M12 2V22M17 5H9.5C8.11929 5 7 6.11929 7 7.5S8.11929 10 9.5 10H14.5C15.8807 10 17 11.1193 17 12.5S15.8807 15 14.5 15H7" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                            <span>{formatCurrency(property.totalInvested)} invested</span>
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/dashboard/trading?property=${property.id}`);
                            }}
                            style={{
                              padding: '10px 18px',
                              background: 'var(--accent-blue)',
                              border: '1px solid var(--accent-blue)',
                              borderRadius: '8px',
                              color: '#ffffff',
                              fontSize: '13px',
                              fontWeight: '600',
                              cursor: 'pointer',
                              transition: 'all 0.2s ease',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '8px'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = 'rgba(59, 130, 246, 0.8)';
                              e.currentTarget.style.transform = 'translateY(-1px)';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = 'var(--accent-blue)';
                              e.currentTarget.style.transform = 'translateY(0)';
                            }}
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M7 8L3 12L7 16M17 8L21 12L17 16M14 4L10 20" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                            Trade Tokens
                          </button>
                          <button
                            onClick={(e) => openPropertyModal(property, e)}
                            style={{
                              padding: '10px 18px',
                              background: 'var(--bg-secondary)',
                              border: '1px solid var(--border-primary)',
                              borderRadius: '8px',
                              color: '#ffffff',
                              fontSize: '13px',
                              fontWeight: '600',
                              cursor: 'pointer',
                              transition: 'all 0.2s ease',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '8px'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.borderColor = 'var(--border-secondary)';
                              e.currentTarget.style.background = 'var(--bg-tertiary)';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.borderColor = 'var(--border-primary)';
                              e.currentTarget.style.background = 'var(--bg-secondary)';
                            }}
                          >
                            View Details
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                              <path d="M5 12H19M19 12L12 5M19 12L12 19" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {}
                {filteredProperties.length > 0 && (
                  <div style={{ 
                    marginTop: '20px', 
                    paddingTop: '20px', 
                    borderTop: '1px solid var(--border-primary)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '12px'
                  }}>
                    <div style={{ fontSize: '13px', color: '#ffffff', opacity: 0.7 }}>
                      Showing {startIndex + 1}-{Math.min(endIndex, filteredProperties.length)} of {filteredProperties.length} {filteredProperties.length === 1 ? 'property' : 'properties'}
                      {searchQuery && ` (search: "${searchQuery}")`}
                    </div>
                    {totalPages > 1 && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <button 
                          style={{
                            padding: '8px 12px',
                            background: currentPage === 1 ? 'var(--bg-tertiary)' : 'var(--bg-secondary)',
                            border: '1px solid var(--border-primary)',
                            borderRadius: '8px',
                            color: '#ffffff',
                            fontSize: '13px',
                            fontWeight: '600',
                            cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                            opacity: currentPage === 1 ? 0.5 : 1,
                            transition: 'all 0.2s ease',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            minWidth: '36px',
                            height: '36px'
                          }}
                          onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                          disabled={currentPage === 1}
                          onMouseEnter={(e) => {
                            if (currentPage !== 1) {
                              e.currentTarget.style.background = 'var(--bg-tertiary)';
                              e.currentTarget.style.borderColor = 'var(--border-secondary)';
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (currentPage !== 1) {
                              e.currentTarget.style.background = 'var(--bg-secondary)';
                              e.currentTarget.style.borderColor = 'var(--border-primary)';
                            }
                          }}
                        >
                          ‹
                        </button>
                        {getPageNumbers().map((page, index) => {
                          if (page === 'ellipsis') {
                            return (
                              <span 
                                key={`ellipsis-${index}`} 
                                style={{ 
                                  padding: '0 8px',
                                  color: '#ffffff',
                                  opacity: 0.5,
                                  fontSize: '13px'
                                }}
                              >
                                ...
                              </span>
                            );
                          }
                          return (
                            <button
                              key={page}
                              style={{
                                padding: '8px 12px',
                                background: currentPage === page ? 'var(--accent-blue)' : 'var(--bg-secondary)',
                                border: '1px solid var(--border-primary)',
                                borderRadius: '8px',
                                color: '#ffffff',
                                fontSize: '13px',
                                fontWeight: '600',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease',
                                minWidth: '36px',
                                height: '36px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                              }}
                              onClick={() => setCurrentPage(page)}
                              onMouseEnter={(e) => {
                                if (currentPage !== page) {
                                  e.currentTarget.style.background = 'var(--bg-tertiary)';
                                  e.currentTarget.style.borderColor = 'var(--border-secondary)';
                                }
                              }}
                              onMouseLeave={(e) => {
                                if (currentPage !== page) {
                                  e.currentTarget.style.background = 'var(--bg-secondary)';
                                  e.currentTarget.style.borderColor = 'var(--border-primary)';
                                }
                              }}
                            >
                              {page}
                            </button>
                          );
                        })}
                        <button 
                          style={{
                            padding: '8px 12px',
                            background: currentPage === totalPages ? 'var(--bg-tertiary)' : 'var(--bg-secondary)',
                            border: '1px solid var(--border-primary)',
                            borderRadius: '8px',
                            color: '#ffffff',
                            fontSize: '13px',
                            fontWeight: '600',
                            cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                            opacity: currentPage === totalPages ? 0.5 : 1,
                            transition: 'all 0.2s ease',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            minWidth: '36px',
                            height: '36px'
                          }}
                          onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                          disabled={currentPage === totalPages}
                          onMouseEnter={(e) => {
                            if (currentPage !== totalPages) {
                              e.currentTarget.style.background = 'var(--bg-tertiary)';
                              e.currentTarget.style.borderColor = 'var(--border-secondary)';
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (currentPage !== totalPages) {
                              e.currentTarget.style.background = 'var(--bg-secondary)';
                              e.currentTarget.style.borderColor = 'var(--border-primary)';
                            }
                          }}
                        >
                          ›
                        </button>
                      </div>
                    )}
                  </div>
                )}
                </>
              )}
            </div>
          </div>

          {}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {}
            <div style={{
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-primary)',
              borderRadius: '14px',
              padding: '20px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <div>
                  <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#ffffff', marginBottom: '4px', letterSpacing: '-0.01em' }}>
                    Recent Activity
                  </h2>
                  <p style={{ fontSize: '13px', color: '#ffffff', opacity: 0.7, margin: 0 }}>
                    Latest transactions
                  </p>
                  </div>
                {recentTransactions.length > 0 && (
                  <button
                    onClick={() => navigate('/dashboard/transactions')}
                    style={{
                      padding: '6px 12px',
                      background: 'transparent',
                      border: '1px solid var(--border-primary)',
                      borderRadius: '6px',
                      color: '#ffffff',
                      fontSize: '12px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'var(--bg-tertiary)';
                      e.currentTarget.style.borderColor = 'var(--border-secondary)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'transparent';
                      e.currentTarget.style.borderColor = 'var(--border-primary)';
                    }}
                  >
                    View All
                  </button>
                )}
                </div>

              {recentTransactions.length === 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '40px 20px', textAlign: 'center' }}>
                  <div style={{ 
                    width: '48px', 
                    height: '48px', 
                    borderRadius: '50%', 
                    background: 'var(--bg-tertiary)', 
                    border: '1.5px solid var(--border-primary)',
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    marginBottom: '12px',
                    opacity: 0.7
                  }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--text-secondary)" strokeWidth="2">
                      <path d="M12 9V12M12 15H12.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <p style={{ fontSize: '14px', color: '#ffffff', opacity: 0.7 }}>No recent transactions</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {recentTransactions.map((txn) => {
                    const isPositive = txn.type === 'dividend';
                    const iconColor = txn.type === 'purchase' ? '#3b82f6' : txn.type === 'dividend' ? '#10b981' : '#f59e0b';
                    const formattedDate = new Date(txn.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                    
                    return (
                      <div
                        key={txn.id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px',
                          padding: '12px',
                          background: 'var(--bg-tertiary)',
                          border: '1px solid var(--border-primary)',
                          borderRadius: '10px',
                          transition: 'all 0.2s ease',
                          cursor: 'pointer'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = 'var(--bg-secondary)';
                          e.currentTarget.style.borderColor = 'var(--border-secondary)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = 'var(--bg-tertiary)';
                          e.currentTarget.style.borderColor = 'var(--border-primary)';
                        }}
                        onClick={() => navigate('/dashboard/transactions')}
                      >
                        <div style={{
                          width: '40px',
                          height: '40px',
                          borderRadius: '10px',
                          background: `${iconColor}20`,
                          border: `1.5px solid ${iconColor}40`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0
                        }}>
                          {txn.type === 'purchase' ? (
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={iconColor} strokeWidth="2">
                              <path d="M12 5V19M5 12H19" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          ) : txn.type === 'dividend' ? (
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={iconColor} strokeWidth="2">
                              <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          ) : (
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={iconColor} strokeWidth="2">
                              <path d="M19 12H5M12 5L5 12L12 19" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          )}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: '13px', fontWeight: '600', color: '#ffffff', marginBottom: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {txn.type === 'purchase' ? 'Purchase' : txn.type === 'dividend' ? 'Dividend' : 'Sale'} • {txn.propertyName || 'Property'}
                          </div>
                          <div style={{ fontSize: '11px', color: '#ffffff', opacity: 0.7 }}>
                            {formattedDate}
                          </div>
                        </div>
                        <div style={{ fontSize: '13px', fontWeight: '700', color: isPositive ? '#10b981' : '#ffffff', fontVariantNumeric: 'tabular-nums', flexShrink: 0 }}>
                          {isPositive ? '+' : ''}{formatCurrency(Math.abs(txn.amount || 0))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {}
            <div style={{
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-primary)',
              borderRadius: '14px',
              padding: '20px'
            }}>
              <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#ffffff', marginBottom: '16px', letterSpacing: '-0.01em' }}>
                Performance Insights
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {portfolioData.properties.length > 0 && (
                  <>
                    <div style={{ padding: '14px', background: 'var(--bg-tertiary)', borderRadius: '10px', border: '1px solid var(--border-primary)' }}>
                      <div style={{ fontSize: '11px', color: '#ffffff', opacity: 0.7, marginBottom: '8px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        Best Performer
                      </div>
                      <div style={{ fontSize: '16px', fontWeight: '700', color: '#ffffff', marginBottom: '4px' }}>
                        {portfolioData.properties.reduce((best, current) => 
                          current.returnPercentage > best.returnPercentage ? current : best
                        ).name}
                  </div>
                      <div style={{ fontSize: '13px', color: '#10b981', fontWeight: '600' }}>
                        {formatPercentage(portfolioData.properties.reduce((best, current) => 
                          current.returnPercentage > best.returnPercentage ? current : best
                        ).returnPercentage)} return
                  </div>
                </div>

                    <div style={{ padding: '14px', background: 'var(--bg-tertiary)', borderRadius: '10px', border: '1px solid var(--border-primary)' }}>
                      <div style={{ fontSize: '11px', color: '#ffffff', opacity: 0.7, marginBottom: '8px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        Average ROI
                </div>
                      <div style={{ fontSize: '16px', fontWeight: '700', color: '#ffffff', marginBottom: '4px' }}>
                        {formatPercentage(portfolioData.properties.reduce((sum, prop) => sum + prop.annualROI, 0) / portfolioData.properties.length)}
                </div>
                      <div style={{ fontSize: '13px', color: '#ffffff', opacity: 0.7 }}>
                        Annual return across portfolio
              </div>
            </div>
                  </>
                )}

                <div style={{ padding: '14px', background: 'var(--bg-tertiary)', borderRadius: '10px', border: '1px solid var(--border-primary)' }}>
                  <div style={{ fontSize: '11px', color: '#ffffff', opacity: 0.7, marginBottom: '8px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Portfolio Composition
                  </div>
                  <div style={{ fontSize: '16px', fontWeight: '700', color: '#ffffff', marginBottom: '4px' }}>
                    {portfolioData.properties.length} {portfolioData.properties.length === 1 ? 'Property' : 'Properties'}
                  </div>
                  <div style={{ fontSize: '13px', color: '#ffffff', opacity: 0.7 }}>
                    {portfolioData.properties.length > 0 
                      ? `All residential properties across ${geographicDistribution.length} ${geographicDistribution.length === 1 ? 'location' : 'locations'}`
                      : 'No properties in portfolio'}
                  </div>
                </div>
              </div>
              </div>

            {}
            {geographicDistribution.length > 0 && (
              <div style={{
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-primary)',
                borderRadius: '14px',
                padding: '20px'
              }}>
                <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#ffffff', marginBottom: '16px', letterSpacing: '-0.01em' }}>
                  Geographic Distribution
                </h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {geographicDistribution.map((geo, index) => (
                    <div key={geo.location} style={{ padding: '12px', background: 'var(--bg-tertiary)', borderRadius: '10px', border: '1px solid var(--border-primary)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                        <div style={{ fontSize: '13px', fontWeight: '600', color: '#ffffff' }}>
                          {geo.location}
                      </div>
                        <div style={{ fontSize: '13px', fontWeight: '700', color: '#ffffff', fontVariantNumeric: 'tabular-nums' }}>
                          {geo.percentage.toFixed(1)}%
                      </div>
                    </div>
                      <div style={{ 
                        width: '100%', 
                        height: '6px', 
                        background: 'var(--bg-secondary)', 
                        borderRadius: '3px', 
                        overflow: 'hidden',
                        marginBottom: '4px'
                      }}>
                        <div style={{ 
                          width: `${geo.percentage}%`, 
                          height: '100%', 
                          background: `linear-gradient(90deg, #3b82f6, #8b5cf6)`,
                          transition: 'width 0.3s ease'
                        }}></div>
                      </div>
                      <div style={{ fontSize: '11px', color: '#ffffff', opacity: 0.7 }}>
                        {geo.count} {geo.count === 1 ? 'property' : 'properties'} • {formatCurrency(geo.value)}
                      </div>
                    </div>
                  ))}
                  </div>
                </div>
            )}

            {}
            <div style={{
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-primary)',
              borderRadius: '14px',
              padding: '20px'
            }}>
              <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#ffffff', marginBottom: '16px', letterSpacing: '-0.01em' }}>
                Portfolio Analysis
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ padding: '14px', background: 'var(--bg-tertiary)', borderRadius: '10px', border: '1px solid var(--border-primary)' }}>
                  <div style={{ fontSize: '11px', color: '#ffffff', opacity: 0.7, marginBottom: '8px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Diversification Score
                  </div>
                  <div style={{ 
                    fontSize: '16px', 
                    fontWeight: '700', 
                    color: diversificationScore.label === 'Excellent' ? '#10b981' : 
                            diversificationScore.label === 'Good' ? '#10b981' : 
                            diversificationScore.label === 'Fair' ? '#f59e0b' : '#ef4444',
                    marginBottom: '4px' 
                  }}>
                    {diversificationScore.label}
                  </div>
                  <div style={{ fontSize: '13px', color: '#ffffff', opacity: 0.7 }}>
                    {diversificationScore.propertyCount} {diversificationScore.propertyCount === 1 ? 'property' : 'properties'} across {diversificationScore.uniqueLocations} {diversificationScore.uniqueLocations === 1 ? 'location' : 'locations'}
                  </div>
                </div>

                <div style={{ padding: '14px', background: 'var(--bg-tertiary)', borderRadius: '10px', border: '1px solid var(--border-primary)' }}>
                  <div style={{ fontSize: '11px', color: '#ffffff', opacity: 0.7, marginBottom: '8px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Liquidity
                  </div>
                  <div style={{ 
                    fontSize: '16px', 
                    fontWeight: '700', 
                    color: liquidityScore === 'High' ? '#10b981' : 
                            liquidityScore === 'Medium' ? '#f59e0b' : '#6b7280',
                    marginBottom: '4px' 
                  }}>
                    {liquidityScore}
                  </div>
                  <div style={{ fontSize: '13px', color: '#ffffff', opacity: 0.7 }}>
                    {liquidityScore === 'N/A' 
                      ? 'No properties in portfolio'
                      : liquidityScore === 'High'
                      ? 'Tokenized assets provide high liquidity'
                      : 'Moderate liquidity from tokenized assets'}
                  </div>
                </div>
              </div>
            </div>
            </div>
        </div>
      </div>

      {}
      {selectedPropertyForModal && (() => {
        const property = selectedPropertyForModal;
        const metrics = calculatePropertyMetrics(property);
        const operationalData = getOperationalData(property);
        const riskData = getRiskAndCapitalData(property);
        
        
        const tabIcons = {
          financial: (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="12" y1="1" x2="12" y2="23"/>
              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
            </svg>
          ),
          operational: (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M9 22V12H15V22" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          ),
          historical: (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M3 3V21H21" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M7 16L12 11L16 15L21 10" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          ),
          risk: (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M12 8V12" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M12 16H12.01" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          ),
          documents: (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M14 2V8H20" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          )
        };

        return (
          <div
            onClick={closePropertyModal}
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
          >
            <div
              onClick={(e) => e.stopPropagation()}
              style={{
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-primary)',
                borderRadius: '16px',
                width: '90%',
                maxWidth: '1200px',
                maxHeight: '90vh',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)'
              }}
            >
              {}
              <div style={{
                padding: '24px',
                borderBottom: '1px solid var(--border-primary)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexShrink: 0
              }}>
                <div>
                  <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#ffffff', marginBottom: '4px', letterSpacing: '-0.01em' }}>
                    {property.name}
                  </h2>
                  <p style={{ fontSize: '14px', color: '#ffffff', opacity: 0.7, margin: 0 }}>
                    {property.location} • {property.type}
                  </p>
                </div>
                <button
                  onClick={closePropertyModal}
                  style={{
                    padding: '10px',
                    background: 'var(--bg-tertiary)',
                    border: '1px solid var(--border-primary)',
                    borderRadius: '8px',
                    color: '#ffffff',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
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
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M18 6L6 18M6 6L18 18" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              </div>

              {}
              <div style={{
                flex: 1,
                overflowY: 'auto',
                padding: '24px'
              }}>
                {}
                <div style={{
                  display: 'flex',
                  gap: '6px',
                  marginBottom: '24px',
                  background: 'var(--bg-tertiary)',
                  padding: '4px',
                  borderRadius: '8px',
                  border: '1px solid var(--border-primary)',
                  flexWrap: 'wrap'
                }}>
                  {[
                    { id: 'financial', label: 'Financial' },
                    { id: 'operational', label: 'Operations' },
                    { id: 'historical', label: 'Analytics' },
                    { id: 'risk', label: 'Risk & Capital' },
                    { id: 'documents', label: 'Documents' }
                  ].map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveDetailTab(tab.id)}
                      style={{
                        padding: '10px 16px',
                        background: activeDetailTab === tab.id ? 'var(--bg-secondary)' : 'transparent',
                        border: 'none',
                        borderRadius: '6px',
                        color: '#ffffff',
                        fontSize: '13px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}
                    >
                      {tabIcons[tab.id]}
                      {tab.label}
                    </button>
                  ))}
                </div>

                {}
                {activeDetailTab === 'financial' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {}
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(3, 1fr)',
                      gap: '16px',
                      marginBottom: '16px'
                    }}>
                      <div style={{ padding: '16px', background: 'var(--bg-tertiary)', borderRadius: '12px', border: '1px solid var(--border-primary)' }}>
                        <div style={{ fontSize: '11px', color: '#ffffff', opacity: 0.7, marginBottom: '8px', fontWeight: '600', textTransform: 'uppercase' }}>
                          NOI
                        </div>
                        <div style={{ fontSize: '20px', fontWeight: '700', color: '#10b981', fontVariantNumeric: 'tabular-nums' }}>
                          {formatCurrency(metrics.noi)}
                        </div>
                        <div style={{ fontSize: '12px', color: '#ffffff', opacity: 0.6, marginTop: '4px' }}>
                          Net Operating Income
                        </div>
                      </div>
                      <div style={{ padding: '16px', background: 'var(--bg-tertiary)', borderRadius: '12px', border: '1px solid var(--border-primary)' }}>
                        <div style={{ fontSize: '11px', color: '#ffffff', opacity: 0.7, marginBottom: '8px', fontWeight: '600', textTransform: 'uppercase' }}>
                          Cap Rate
                        </div>
                        <div style={{ fontSize: '20px', fontWeight: '700', color: '#ffffff', fontVariantNumeric: 'tabular-nums' }}>
                          {metrics.capRate.toFixed(2)}%
                        </div>
                        <div style={{ fontSize: '12px', color: '#ffffff', opacity: 0.6, marginTop: '4px' }}>
                          Annual return on value
                        </div>
                      </div>
                      <div style={{ padding: '16px', background: 'var(--bg-tertiary)', borderRadius: '12px', border: '1px solid var(--border-primary)' }}>
                        <div style={{ fontSize: '11px', color: '#ffffff', opacity: 0.7, marginBottom: '8px', fontWeight: '600', textTransform: 'uppercase' }}>
                          Cash-on-Cash ROI
                        </div>
                        <div style={{ fontSize: '20px', fontWeight: '700', color: '#10b981', fontVariantNumeric: 'tabular-nums' }}>
                          {metrics.cashOnCashROI.toFixed(2)}%
                        </div>
                        <div style={{ fontSize: '12px', color: '#ffffff', opacity: 0.6, marginTop: '4px' }}>
                          Return on invested capital
                        </div>
                      </div>
                    </div>

                    {}
                    <div style={{ padding: '20px', background: 'var(--bg-tertiary)', borderRadius: '14px', border: '1px solid var(--border-primary)' }}>
                      <h4 style={{ fontSize: '16px', fontWeight: '700', color: '#ffffff', marginBottom: '16px' }}>
                        Expense Breakdown
                      </h4>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {[
                          { label: 'Maintenance', value: metrics.expenseBreakdown.maintenance, color: '#ef4444' },
                          { label: 'Management', value: metrics.expenseBreakdown.management, color: '#f59e0b' },
                          { label: 'Insurance', value: metrics.expenseBreakdown.insurance, color: '#3b82f6' },
                          { label: 'Taxes', value: metrics.expenseBreakdown.taxes, color: '#8b5cf6' }
                        ].map(expense => {
                          const percentage = metrics.annualIncome > 0 ? (expense.value / metrics.annualIncome) * 100 : 0;
                          return (
                            <div key={expense.label}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                <span style={{ fontSize: '13px', color: '#ffffff', opacity: 0.8 }}>{expense.label}</span>
                                <span style={{ fontSize: '13px', fontWeight: '600', color: '#ffffff', fontVariantNumeric: 'tabular-nums' }}>
                                  {formatCurrency(expense.value)} ({percentage.toFixed(1)}%)
                                </span>
                              </div>
                              <div style={{ width: '100%', height: '8px', background: 'var(--bg-secondary)', borderRadius: '4px', overflow: 'hidden' }}>
                                <div style={{ width: `${percentage}%`, height: '100%', background: expense.color, transition: 'width 0.3s ease' }}></div>
                              </div>
                            </div>
                          );
                        })}
                        <div style={{ marginTop: '12px', paddingTop: '16px', borderTop: '1px solid var(--border-primary)', display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ fontSize: '14px', fontWeight: '700', color: '#ffffff' }}>Total Expenses</span>
                          <span style={{ fontSize: '14px', fontWeight: '700', color: '#ffffff', fontVariantNumeric: 'tabular-nums' }}>
                            {formatCurrency(metrics.expenseBreakdown.total)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {}
                    <div style={{ padding: '20px', background: 'var(--bg-tertiary)', borderRadius: '14px', border: '1px solid var(--border-primary)' }}>
                      <h4 style={{ fontSize: '16px', fontWeight: '700', color: '#ffffff', marginBottom: '16px' }}>
                        Revenue Streams
                      </h4>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {[
                          { label: 'Rental Income', value: metrics.revenueStreams.rental, color: '#10b981' },
                          { label: 'Appreciation', value: metrics.revenueStreams.appreciation, color: '#3b82f6' }
                        ].map(stream => {
                          const percentage = metrics.revenueStreams.total > 0 ? (stream.value / metrics.revenueStreams.total) * 100 : 0;
                          return (
                            <div key={stream.label}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                <span style={{ fontSize: '13px', color: '#ffffff', opacity: 0.8 }}>{stream.label}</span>
                                <span style={{ fontSize: '13px', fontWeight: '600', color: '#ffffff', fontVariantNumeric: 'tabular-nums' }}>
                                  {formatCurrency(stream.value)} ({percentage.toFixed(1)}%)
                                </span>
                              </div>
                              <div style={{ width: '100%', height: '8px', background: 'var(--bg-secondary)', borderRadius: '4px', overflow: 'hidden' }}>
                                <div style={{ width: `${percentage}%`, height: '100%', background: stream.color, transition: 'width 0.3s ease' }}></div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {}
                    <div style={{ padding: '20px', background: 'var(--bg-tertiary)', borderRadius: '14px', border: '1px solid var(--border-primary)' }}>
                      <h4 style={{ fontSize: '16px', fontWeight: '700', color: '#ffffff', marginBottom: '16px' }}>
                        Distribution History (Last 6 Months)
                      </h4>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {metrics.distributionHistory.map((dist, idx) => {
                          const date = new Date(dist.date);
                          const formattedDate = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
                          const varianceColor = dist.variancePercent >= 0 ? '#10b981' : '#ef4444';
                          return (
                            <div key={idx} style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              padding: '14px',
                              background: 'var(--bg-secondary)',
                              borderRadius: '10px',
                              border: '1px solid var(--border-primary)'
                            }}>
                              <div>
                                <div style={{ fontSize: '13px', fontWeight: '600', color: '#ffffff' }}>{formattedDate}</div>
                                <div style={{ fontSize: '12px', color: '#ffffff', opacity: 0.6 }}>
                                  Projected: {formatCurrency(dist.projected)}
                                </div>
                              </div>
                              <div style={{ textAlign: 'right' }}>
                                <div style={{ fontSize: '15px', fontWeight: '700', color: '#ffffff', fontVariantNumeric: 'tabular-nums' }}>
                                  {formatCurrency(dist.actual)}
                                </div>
                                <div style={{ fontSize: '12px', color: varianceColor, fontWeight: '600' }}>
                                  {dist.variancePercent >= 0 ? '+' : ''}{dist.variancePercent.toFixed(1)}%
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}

                {}
                {activeDetailTab === 'operational' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {}
                    <div style={{ padding: '20px', background: 'var(--bg-tertiary)', borderRadius: '14px', border: '1px solid var(--border-primary)' }}>
                      <h4 style={{ fontSize: '16px', fontWeight: '700', color: '#ffffff', marginBottom: '16px' }}>
                        Occupancy Status
                      </h4>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                        <div>
                          <div style={{ fontSize: '12px', color: '#ffffff', opacity: 0.7, marginBottom: '6px' }}>Occupancy Rate</div>
                          <div style={{ fontSize: '24px', fontWeight: '700', color: '#10b981', fontVariantNumeric: 'tabular-nums' }}>
                            {operationalData.tenantInfo.occupancyRate}%
                          </div>
                        </div>
                        <div>
                          <div style={{ fontSize: '12px', color: '#ffffff', opacity: 0.7, marginBottom: '6px' }}>Vacancy Rate</div>
                          <div style={{ fontSize: '24px', fontWeight: '700', color: '#ef4444', fontVariantNumeric: 'tabular-nums' }}>
                            {operationalData.tenantInfo.vacancyRate}%
                          </div>
                        </div>
                      </div>
                      <div style={{ fontSize: '13px', color: '#ffffff', opacity: 0.7 }}>
                        {operationalData.tenantInfo.currentTenants} of {operationalData.tenantInfo.totalUnits} units occupied
                      </div>
                    </div>

                    {}
                    {operationalData.tenantInfo.leaseExpirations.length > 0 && (
                      <div style={{ padding: '20px', background: 'var(--bg-tertiary)', borderRadius: '14px', border: '1px solid var(--border-primary)' }}>
                        <h4 style={{ fontSize: '16px', fontWeight: '700', color: '#ffffff', marginBottom: '16px' }}>
                          Upcoming Lease Expirations
                        </h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                          {operationalData.tenantInfo.leaseExpirations.map((lease, idx) => {
                            const expirationDate = new Date(lease.expirationDate);
                            const daysUntil = Math.ceil((expirationDate - new Date()) / (1000 * 60 * 60 * 24));
                            const formattedDate = expirationDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
                            return (
                              <div key={idx} style={{
                                padding: '14px',
                                background: 'var(--bg-secondary)',
                                borderRadius: '10px',
                                border: '1px solid var(--border-primary)'
                              }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                                  <div style={{ fontSize: '14px', fontWeight: '600', color: '#ffffff' }}>{lease.unit}</div>
                                  <div style={{ fontSize: '13px', color: daysUntil < 90 ? '#ef4444' : daysUntil < 180 ? '#f59e0b' : '#10b981', fontWeight: '600' }}>
                                    {daysUntil} days
                                  </div>
                                </div>
                                <div style={{ fontSize: '12px', color: '#ffffff', opacity: 0.7 }}>{lease.tenant}</div>
                                <div style={{ fontSize: '12px', color: '#ffffff', opacity: 0.6, marginTop: '4px' }}>Expires: {formattedDate}</div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {}
                    <div style={{ padding: '20px', background: 'var(--bg-tertiary)', borderRadius: '14px', border: '1px solid var(--border-primary)' }}>
                      <h4 style={{ fontSize: '16px', fontWeight: '700', color: '#ffffff', marginBottom: '16px' }}>
                        Maintenance Schedule
                      </h4>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {operationalData.maintenanceSchedule.map((maintenance, idx) => {
                          const maintenanceDate = new Date(maintenance.date);
                          const daysUntil = Math.ceil((maintenanceDate - new Date()) / (1000 * 60 * 60 * 24));
                          const formattedDate = maintenanceDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
                          return (
                            <div key={idx} style={{
                              padding: '14px',
                              background: 'var(--bg-secondary)',
                              borderRadius: '10px',
                              border: '1px solid var(--border-primary)'
                            }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                                <div style={{ fontSize: '14px', fontWeight: '600', color: '#ffffff' }}>{maintenance.type}</div>
                                <div style={{
                                  padding: '4px 10px',
                                  background: maintenance.priority === 'Urgent' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                                  borderRadius: '6px',
                                  fontSize: '11px',
                                  fontWeight: '600',
                                  color: maintenance.priority === 'Urgent' ? '#ef4444' : '#f59e0b',
                                  border: `1px solid ${maintenance.priority === 'Urgent' ? 'rgba(239, 68, 68, 0.3)' : 'rgba(245, 158, 11, 0.3)'}`
                                }}>
                                  {maintenance.priority}
                                </div>
                              </div>
                              <div style={{ fontSize: '12px', color: '#ffffff', opacity: 0.7, marginTop: '4px' }}>
                                {formattedDate} • {daysUntil} days • Est. {formatCurrency(maintenance.estimatedCost)}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {}
                    {operationalData.financingEvents.length > 0 && (
                      <div style={{ padding: '20px', background: 'var(--bg-tertiary)', borderRadius: '14px', border: '1px solid var(--border-primary)' }}>
                        <h4 style={{ fontSize: '16px', fontWeight: '700', color: '#ffffff', marginBottom: '16px' }}>
                          Financing Events
                        </h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                          {operationalData.financingEvents.map((event, idx) => {
                            const eventDate = new Date(event.date);
                            const daysUntil = Math.ceil((eventDate - new Date()) / (1000 * 60 * 60 * 24));
                            const formattedDate = eventDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
                            return (
                              <div key={idx} style={{
                                padding: '14px',
                                background: 'var(--bg-secondary)',
                                borderRadius: '10px',
                                border: '1px solid var(--border-primary)'
                              }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                                  <div style={{ fontSize: '14px', fontWeight: '600', color: '#ffffff' }}>{event.type}</div>
                                  <div style={{ fontSize: '13px', color: '#ffffff', opacity: 0.7 }}>{daysUntil} days</div>
                                </div>
                                <div style={{ fontSize: '12px', color: '#ffffff', opacity: 0.7, marginTop: '4px' }}>
                                  {event.description} • {formattedDate}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {}
                {activeDetailTab === 'historical' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {}
                    <div style={{ padding: '20px', background: 'var(--bg-tertiary)', borderRadius: '14px', border: '1px solid var(--border-primary)' }}>
                      <h4 style={{ fontSize: '16px', fontWeight: '700', color: '#ffffff', marginBottom: '16px' }}>
                        Projected vs Actual Distributions
                      </h4>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {metrics.distributionHistory.map((dist, idx) => {
                          const date = new Date(dist.date);
                          const formattedDate = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
                          const varianceColor = dist.variancePercent >= 0 ? '#10b981' : '#ef4444';
                          const projectedPercent = 100;
                          const actualPercent = (dist.actual / dist.projected) * 100;
                          return (
                            <div key={idx} style={{ marginBottom: '16px' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                <span style={{ fontSize: '13px', color: '#ffffff', opacity: 0.8 }}>{formattedDate}</span>
                                <span style={{ fontSize: '13px', fontWeight: '600', color: varianceColor }}>
                                  {dist.variancePercent >= 0 ? '+' : ''}{dist.variancePercent.toFixed(1)}% variance
                                </span>
                              </div>
                              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                                <div style={{ flex: 1 }}>
                                  <div style={{ fontSize: '11px', color: '#ffffff', opacity: 0.6, marginBottom: '6px' }}>Projected</div>
                                  <div style={{ width: '100%', height: '10px', background: 'var(--bg-secondary)', borderRadius: '5px', overflow: 'hidden' }}>
                                    <div style={{ width: `${projectedPercent}%`, height: '100%', background: '#6b7280', transition: 'width 0.3s ease' }}></div>
                                  </div>
                                </div>
                                <div style={{ flex: 1 }}>
                                  <div style={{ fontSize: '11px', color: '#ffffff', opacity: 0.6, marginBottom: '6px' }}>Actual</div>
                                  <div style={{ width: '100%', height: '10px', background: 'var(--bg-secondary)', borderRadius: '5px', overflow: 'hidden' }}>
                                    <div style={{ width: `${actualPercent}%`, height: '100%', background: varianceColor, transition: 'width 0.3s ease' }}></div>
                                  </div>
                                </div>
                              </div>
                              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px', fontSize: '12px', color: '#ffffff', opacity: 0.7 }}>
                                <span>Projected: {formatCurrency(dist.projected)}</span>
                                <span>Actual: {formatCurrency(dist.actual)}</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {}
                    <div style={{ padding: '20px', background: 'var(--bg-tertiary)', borderRadius: '14px', border: '1px solid var(--border-primary)' }}>
                      <h4 style={{ fontSize: '16px', fontWeight: '700', color: '#ffffff', marginBottom: '16px' }}>
                        Historical Yield Trends
                      </h4>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {metrics.distributionHistory.map((dist, idx) => {
                          if (idx === 0) return null;
                          const prevDist = metrics.distributionHistory[idx - 1];
                          const yieldDelta = ((dist.actual - prevDist.actual) / prevDist.actual) * 100;
                          const date = new Date(dist.date);
                          const formattedDate = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
                          const deltaColor = yieldDelta >= 0 ? '#10b981' : '#ef4444';
                          return (
                            <div key={idx} style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              padding: '14px',
                              background: 'var(--bg-secondary)',
                              borderRadius: '10px',
                              border: '1px solid var(--border-primary)'
                            }}>
                              <div>
                                <div style={{ fontSize: '13px', fontWeight: '600', color: '#ffffff' }}>{formattedDate}</div>
                                <div style={{ fontSize: '12px', color: '#ffffff', opacity: 0.7 }}>vs previous month</div>
                              </div>
                              <div style={{ fontSize: '16px', fontWeight: '700', color: deltaColor, fontVariantNumeric: 'tabular-nums' }}>
                                {yieldDelta >= 0 ? '+' : ''}{yieldDelta.toFixed(2)}%
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {}
                    <div style={{ padding: '20px', background: 'var(--bg-tertiary)', borderRadius: '14px', border: '1px solid var(--border-primary)' }}>
                      <h4 style={{ fontSize: '16px', fontWeight: '700', color: '#ffffff', marginBottom: '16px' }}>
                        Market Cap Rate Comparison
                      </h4>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                        <div>
                          <div style={{ fontSize: '12px', color: '#ffffff', opacity: 0.7, marginBottom: '6px' }}>Your Property</div>
                          <div style={{ fontSize: '22px', fontWeight: '700', color: '#10b981', fontVariantNumeric: 'tabular-nums' }}>
                            {metrics.capRate.toFixed(2)}%
                          </div>
                        </div>
                        <div>
                          <div style={{ fontSize: '12px', color: '#ffffff', opacity: 0.7, marginBottom: '6px' }}>Market Average</div>
                          <div style={{ fontSize: '22px', fontWeight: '700', color: '#ffffff', fontVariantNumeric: 'tabular-nums' }}>
                            {(metrics.capRate * 0.92).toFixed(2)}%
                          </div>
                        </div>
                      </div>
                      <div style={{ marginTop: '16px', padding: '12px', background: 'var(--bg-secondary)', borderRadius: '10px', border: '1px solid var(--border-primary)' }}>
                        <div style={{ fontSize: '12px', color: '#ffffff', opacity: 0.7 }}>
                          Your property is performing {((metrics.capRate / (metrics.capRate * 0.92) - 1) * 100).toFixed(1)}% above market average
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {}
                {activeDetailTab === 'risk' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {}
                    <div style={{ padding: '20px', background: 'var(--bg-tertiary)', borderRadius: '14px', border: '1px solid var(--border-primary)' }}>
                      <h4 style={{ fontSize: '16px', fontWeight: '700', color: '#ffffff', marginBottom: '16px' }}>
                        Capital Stack
                      </h4>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {[
                          { label: 'Equity', value: riskData.capitalStack.equity, color: '#10b981' },
                          { label: 'Debt', value: riskData.capitalStack.debt, color: '#ef4444' }
                        ].map(stack => {
                          const percentage = riskData.capitalStack.total > 0 ? (stack.value / riskData.capitalStack.total) * 100 : 0;
                          return (
                            <div key={stack.label}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                <span style={{ fontSize: '13px', color: '#ffffff', opacity: 0.8 }}>{stack.label}</span>
                                <span style={{ fontSize: '13px', fontWeight: '600', color: '#ffffff', fontVariantNumeric: 'tabular-nums' }}>
                                  {formatCurrency(stack.value)} ({percentage.toFixed(1)}%)
                                </span>
                              </div>
                              <div style={{ width: '100%', height: '10px', background: 'var(--bg-secondary)', borderRadius: '5px', overflow: 'hidden' }}>
                                <div style={{ width: `${percentage}%`, height: '100%', background: stack.color, transition: 'width 0.3s ease' }}></div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {}
                    <div style={{ padding: '20px', background: 'var(--bg-tertiary)', borderRadius: '14px', border: '1px solid var(--border-primary)' }}>
                      <h4 style={{ fontSize: '16px', fontWeight: '700', color: '#ffffff', marginBottom: '16px' }}>
                        Leverage Metrics
                      </h4>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                        <div>
                          <div style={{ fontSize: '12px', color: '#ffffff', opacity: 0.7, marginBottom: '6px' }}>Debt-to-Equity</div>
                          <div style={{ fontSize: '22px', fontWeight: '700', color: '#ffffff', fontVariantNumeric: 'tabular-nums' }}>
                            {riskData.debtToEquity.toFixed(2)}:1
                          </div>
                        </div>
                        <div>
                          <div style={{ fontSize: '12px', color: '#ffffff', opacity: 0.7, marginBottom: '6px' }}>Loan-to-Value</div>
                          <div style={{ fontSize: '22px', fontWeight: '700', color: '#ffffff', fontVariantNumeric: 'tabular-nums' }}>
                            {riskData.loanToValue.toFixed(1)}%
                          </div>
                        </div>
                      </div>
                    </div>

                    {}
                    <div style={{ padding: '20px', background: 'var(--bg-tertiary)', borderRadius: '14px', border: '1px solid var(--border-primary)' }}>
                      <h4 style={{ fontSize: '16px', fontWeight: '700', color: '#ffffff', marginBottom: '16px' }}>
                        Risk Assessment
                      </h4>
                      <div style={{ marginBottom: '16px', padding: '16px', background: 'var(--bg-secondary)', borderRadius: '10px', border: '1px solid var(--border-primary)' }}>
                        <div style={{ fontSize: '12px', color: '#ffffff', opacity: 0.7, marginBottom: '6px' }}>Overall Risk Score</div>
                        <div style={{ fontSize: '24px', fontWeight: '700', color: riskData.overallRiskScore <= 2 ? '#10b981' : riskData.overallRiskScore <= 3 ? '#f59e0b' : '#ef4444', fontVariantNumeric: 'tabular-nums' }}>
                          {riskData.overallRiskScore.toFixed(1)}/5.0
                        </div>
                        <div style={{ fontSize: '12px', color: '#ffffff', opacity: 0.6, marginTop: '6px', marginBottom: '8px' }}>
                          {riskData.overallRiskScore <= 2 ? 'Low Risk' : riskData.overallRiskScore <= 3 ? 'Moderate Risk' : 'High Risk'}
                        </div>
                        <div style={{ fontSize: '12px', color: '#94a3b8', fontStyle: 'italic', animation: 'gentlePulse 3s ease-in-out infinite' }}>
                          {getFriendlyMessage('riskScore', riskData.overallRiskScore)}
                        </div>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {Object.entries(riskData.riskSources).map(([key, risk]) => {
                          const riskColor = risk.score <= 2 ? '#10b981' : risk.score <= 3 ? '#f59e0b' : '#ef4444';
                          return (
                            <div key={key} style={{
                              padding: '14px',
                              background: 'var(--bg-secondary)',
                              borderRadius: '10px',
                              border: '1px solid var(--border-primary)'
                            }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                                <div style={{ fontSize: '14px', fontWeight: '600', color: '#ffffff', textTransform: 'capitalize' }}>{key} Risk</div>
                                <div style={{
                                  padding: '4px 10px',
                                  background: `${riskColor}20`,
                                  borderRadius: '6px',
                                  fontSize: '12px',
                                  fontWeight: '600',
                                  color: riskColor,
                                  border: `1px solid ${riskColor}40`
                                }}>
                                  {risk.label}
                                </div>
                              </div>
                              <div style={{ fontSize: '12px', color: '#ffffff', opacity: 0.7 }}>{risk.description}</div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {}
                    <div style={{ padding: '20px', background: 'var(--bg-tertiary)', borderRadius: '14px', border: '1px solid var(--border-primary)' }}>
                      <h4 style={{ fontSize: '16px', fontWeight: '700', color: '#ffffff', marginBottom: '16px' }}>
                        Liquidity & Exit Options
                      </h4>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <div style={{ padding: '14px', background: 'var(--bg-secondary)', borderRadius: '10px', border: '1px solid var(--border-primary)' }}>
                          <div style={{ fontSize: '13px', fontWeight: '600', color: '#ffffff', marginBottom: '6px' }}>Secondary Market</div>
                          <div style={{ fontSize: '12px', color: '#ffffff', opacity: 0.7 }}>
                            Tokenized assets provide high liquidity through secondary market trading
                          </div>
                        </div>
                        <div style={{ padding: '14px', background: 'var(--bg-secondary)', borderRadius: '10px', border: '1px solid var(--border-primary)' }}>
                          <div style={{ fontSize: '13px', fontWeight: '600', color: '#ffffff', marginBottom: '6px' }}>Exit Options</div>
                          <div style={{ fontSize: '12px', color: '#ffffff', opacity: 0.7 }}>
                            Sell tokens on secondary market or hold until property sale/distribution
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {}
                {activeDetailTab === 'documents' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {}
                    <div style={{ padding: '20px', background: 'var(--bg-tertiary)', borderRadius: '14px', border: '1px solid var(--border-primary)' }}>
                      <h4 style={{ fontSize: '16px', fontWeight: '700', color: '#ffffff', marginBottom: '16px' }}>
                        Tax Documents
                      </h4>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {[
                          { type: 'K-1 Form', year: '2024', status: 'Available', date: '2024-01-15' },
                          { type: '1099 Form', year: '2024', status: 'Available', date: '2024-01-15' },
                          { type: 'K-1 Form', year: '2023', status: 'Available', date: '2023-01-15' },
                          { type: '1099 Form', year: '2023', status: 'Available', date: '2023-01-15' }
                        ].map((doc, idx) => (
                          <div key={idx} style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            padding: '14px',
                            background: 'var(--bg-secondary)',
                            borderRadius: '10px',
                            border: '1px solid var(--border-primary)'
                          }}>
                            <div>
                              <div style={{ fontSize: '14px', fontWeight: '600', color: '#ffffff' }}>{doc.type} - {doc.year}</div>
                              <div style={{ fontSize: '12px', color: '#ffffff', opacity: 0.7 }}>Issued: {new Date(doc.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</div>
                            </div>
                            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                              <div style={{
                                padding: '4px 10px',
                                background: 'rgba(16, 185, 129, 0.15)',
                                borderRadius: '6px',
                                fontSize: '11px',
                                fontWeight: '600',
                                color: '#10b981',
                                border: '1px solid rgba(16, 185, 129, 0.3)'
                              }}>
                                {doc.status}
                              </div>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  alert(`Downloading ${doc.type} - ${doc.year}`);
                                }}
                                style={{
                                  padding: '8px 14px',
                                  background: 'var(--accent-blue)',
                                  border: 'none',
                                  borderRadius: '6px',
                                  color: '#ffffff',
                                  fontSize: '12px',
                                  fontWeight: '600',
                                  cursor: 'pointer',
                                  transition: 'all 0.2s ease'
                                }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.background = '#2563eb';
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.background = 'var(--accent-blue)';
                                }}
                              >
                                Download
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {}
                    <div style={{ padding: '20px', background: 'var(--bg-tertiary)', borderRadius: '14px', border: '1px solid var(--border-primary)' }}>
                      <h4 style={{ fontSize: '16px', fontWeight: '700', color: '#ffffff', marginBottom: '16px' }}>
                        Property Documents
                      </h4>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {[
                          { type: 'Property Deed', date: '2023-06-15' },
                          { type: 'Lease Agreement', date: '2023-08-20' },
                          { type: 'Financial Statement', date: '2024-01-01' }
                        ].map((doc, idx) => (
                          <div key={idx} style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            padding: '14px',
                            background: 'var(--bg-secondary)',
                            borderRadius: '10px',
                            border: '1px solid var(--border-primary)'
                          }}>
                            <div>
                              <div style={{ fontSize: '14px', fontWeight: '600', color: '#ffffff' }}>{doc.type}</div>
                              <div style={{ fontSize: '12px', color: '#ffffff', opacity: 0.7 }}>{new Date(doc.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</div>
                            </div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                alert(`Downloading ${doc.type}`);
                              }}
                              style={{
                                padding: '8px 14px',
                                background: 'var(--bg-tertiary)',
                                border: '1px solid var(--border-primary)',
                                borderRadius: '6px',
                                color: '#ffffff',
                                fontSize: '12px',
                                fontWeight: '600',
                                cursor: 'pointer',
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
                              View
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>

                    {}
                    <div style={{ padding: '20px', background: 'var(--bg-tertiary)', borderRadius: '14px', border: '1px solid var(--border-primary)' }}>
                      <h4 style={{ fontSize: '16px', fontWeight: '700', color: '#ffffff', marginBottom: '16px' }}>
                        Tax Summary
                      </h4>
                      <div style={{ padding: '16px', background: 'var(--bg-secondary)', borderRadius: '10px', border: '1px solid var(--border-primary)' }}>
                        <div style={{ fontSize: '13px', color: '#ffffff', opacity: 0.7, marginBottom: '12px' }}>2024 Tax Year</div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ fontSize: '13px', color: '#ffffff', opacity: 0.8 }}>Total Income</span>
                            <span style={{ fontSize: '13px', fontWeight: '600', color: '#ffffff', fontVariantNumeric: 'tabular-nums' }}>
                              {formatCurrency(metrics.annualIncome)}
                            </span>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ fontSize: '13px', color: '#ffffff', opacity: 0.8 }}>Total Expenses</span>
                            <span style={{ fontSize: '13px', fontWeight: '600', color: '#ffffff', fontVariantNumeric: 'tabular-nums' }}>
                              {formatCurrency(metrics.expenseBreakdown.total)}
                            </span>
                          </div>
                          <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid var(--border-primary)', display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ fontSize: '14px', fontWeight: '700', color: '#ffffff' }}>Net Income</span>
                            <span style={{ fontSize: '14px', fontWeight: '700', color: '#10b981', fontVariantNumeric: 'tabular-nums' }}>
                              {formatCurrency(metrics.noi)}
                            </span>
                          </div>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            alert('Exporting tax summary to CSV/PDF');
                          }}
                          style={{
                            marginTop: '16px',
                            padding: '10px 18px',
                            background: 'var(--accent-blue)',
                            border: 'none',
                            borderRadius: '6px',
                            color: '#ffffff',
                            fontSize: '13px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            width: '100%'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = '#2563eb';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'var(--accent-blue)';
                          }}
                        >
                          Export Tax Summary
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
