import React, { useState, useMemo, useEffect, useRef } from "react";
import { useInvestments } from '../contexts/InvestmentContext';

const Transactions = () => {
  const { transactions: allTransactions, getPortfolioSummary } = useInvestments();
  const portfolioSummary = getPortfolioSummary();
  const [activeFilter, setActiveFilter] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  
  
  const getDefaultDateRange = () => {
    const today = new Date();
    const lastWeek = new Date(today);
    lastWeek.setDate(today.getDate() - 7);
    <div style="background: var(--bg-secondary); border: 1px solid var(--border-primary); border-radius: 14px; padding: 20px; min-height: 450px; display: flex; flex-direction: column;"><div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;"><div><h2 style="font-size: 18px; font-weight: 700; color: rgb(255, 255, 255); margin-bottom: 4px; letter-spacing: -0.01em;">Transaction History</h2><p style="font-size: 13px; color: rgb(255, 255, 255); opacity: 0.7; margin: 0px;">0 transactions found</p></div><button style="padding: 8px 14px; background: var(--bg-tertiary); border: 1px solid var(--border-primary); border-radius: 8px; color: rgb(255, 255, 255); font-size: 13px; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 6px; transition: 0.2s;"><svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M15.0002 15.0001V9.00005M15.0002 9.00005H9.00019M15.0002 9.00005L9.00019 14.9999M7.8 21H16.2C17.8802 21 18.7202 21 19.362 20.673C19.9265 20.3854 20.3854 19.9265 20.673 19.362C21 18.7202 21 17.8802 21 16.2V7.8C21 6.11984 21 5.27976 20.673 4.63803C20.3854 4.07354 19.9265 3.6146 19.362 3.32698C18.7202 3 17.8802 3 16.2 3H7.8C6.11984 3 5.27976 3 4.63803 3.32698C4.07354 3.6146 3.6146 4.07354 3.32698 4.63803C3 5.27976 3 6.11984 3 7.8V16.2C3 17.8802 3 18.7202 3.32698 19.362C3.6146 19.9265 4.07354 20.3854 4.63803 20.673C5.27976 21 6.11984 21 7.8 21Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg>Export</button></div><div style="flex: 1 1 0%; display: flex; flex-direction: column;"><div style="display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 60px 20px; text-align: center; flex: 1 1 0%;"><div style="width: 64px; height: 64px; border-radius: 50%; background: var(--bg-tertiary); border: 1.5px solid var(--border-primary); display: flex; align-items: center; justify-content: center; margin-bottom: 16px; opacity: 0.7;"><svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--text-secondary)" stroke-width="2"><path d="M21 21l-4.35-4.35M19 11a8 8 0 11-16 0 8 8 0 0116 0z" stroke-linecap="round" stroke-linejoin="round"></path></svg></div><h3 style="font-size: 18px; font-weight: 700; color: rgb(255, 255, 255); margin-bottom: 8px; letter-spacing: -0.01em;">No transactions found</h3><p style="font-size: 14px; color: rgb(255, 255, 255); opacity: 0.7; margin-bottom: 20px; max-width: 400px;">Start investing in properties to see your transaction history here.</p></div></div></div>
    const formatDate = (date) => {
      return date.toISOString().split('T')[0];
    };
    
    const formatDateForDisplay = (date) => {
      return date.toLocaleDateString('en-US', { 
        month: '2-digit', 
        day: '2-digit', 
        year: 'numeric' 
      });
    };
    
    const start = formatDate(lastWeek);
    const end = formatDate(today);
    const display = `${formatDateForDisplay(lastWeek)} to ${formatDateForDisplay(today)}`;
    
    return { start, end, display };
  };
  
  const defaultDates = getDefaultDateRange();
  const [dateRange, setDateRange] = useState(defaultDates.display);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [startDate, setStartDate] = useState(defaultDates.start);
  const [endDate, setEndDate] = useState(defaultDates.end);
  const [currentPage, setCurrentPage] = useState(1);
  const datePickerRef = useRef(null);
  
  const TRANSACTIONS_PER_PAGE = 6;

  
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (datePickerRef.current && !datePickerRef.current.contains(event.target)) {
        setShowDatePicker(false);
      }
    };

    if (showDatePicker) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showDatePicker]);

  
  const transactions = allTransactions.map(txn => {
    const type = txn.type === 'purchase' ? 'Purchase' : txn.type === 'dividend' ? 'Dividend' : 'Sale';
    const isPositive = txn.type === 'dividend' || txn.type === 'sale';
    
    
    let icon, iconColor;
    if (txn.type === 'purchase') {
      icon = (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      );
      iconColor = '#3b82f6';
    } else if (txn.type === 'dividend') {
      icon = (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      );
      iconColor = '#10b981';
    } else {
      icon = (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path d="M19 12H5M12 5L5 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      );
      iconColor = '#f59e0b';
    }

    return {
      id: txn.id,
      date: new Date(txn.date).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
      type,
      property: txn.propertyName,
      location: txn.propertyCity,
      amount: `${isPositive ? '+' : '-'}$${Math.abs(txn.amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      tokens: txn.tokens || 0,
      status: txn.status.charAt(0).toUpperCase() + txn.status.slice(1),
      paymentMethod: txn.paymentMethod || 'N/A',
      description: txn.description,
      icon,
      iconColor
    };
  });

  const filters = ["All", "Purchases", "Sales", "Dividends", "Deposits"];

  
  const formatDateForDisplay = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: '2-digit', 
      day: '2-digit', 
      year: 'numeric' 
    });
  };

  
  const updateDateRangeDisplay = () => {
    const formattedStart = formatDateForDisplay(startDate);
    const formattedEnd = formatDateForDisplay(endDate);
    setDateRange(`${formattedStart} to ${formattedEnd}`);
  };

  
  const handleStartDateChange = (e) => {
    const newStartDate = e.target.value;
    setStartDate(newStartDate);
    if (newStartDate > endDate) {
      setEndDate(newStartDate);
    }
  };

  const handleEndDateChange = (e) => {
    const newEndDate = e.target.value;
    setEndDate(newEndDate);
    if (newEndDate < startDate) {
      setStartDate(newEndDate);
    }
  };

  
  const applyDateRange = () => {
    updateDateRangeDisplay();
    setShowDatePicker(false);
  };

  
  const resetDateRange = () => {
    const defaultDates = getDefaultDateRange();
    setStartDate(defaultDates.start);
    setEndDate(defaultDates.end);
    setDateRange(defaultDates.display);
    setShowDatePicker(false);
  };

  
  const filteredTransactions = useMemo(() => {
    let filtered = transactions;

    
    if (activeFilter !== "All") {
      const filterMap = {
        "Purchases": ["Purchase"],
        "Sales": ["Sale"],
        "Dividends": ["Dividend"],
        "Deposits": ["Deposit"]
      };
      
      if (filterMap[activeFilter]) {
        filtered = filtered.filter(transaction => 
          filterMap[activeFilter].includes(transaction.type)
        );
      }
    }

    
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(transaction =>
        transaction.type.toLowerCase().includes(searchLower) ||
        (transaction.description && transaction.description.toLowerCase().includes(searchLower)) ||
        (transaction.location && transaction.location.toLowerCase().includes(searchLower)) ||
        transaction.id.toLowerCase().includes(searchLower)
      );
    }

    return filtered;
  }, [activeFilter, searchTerm, transactions]);

  
  const totalPages = Math.ceil(filteredTransactions.length / TRANSACTIONS_PER_PAGE);
  const startIndex = (currentPage - 1) * TRANSACTIONS_PER_PAGE;
  const endIndex = startIndex + TRANSACTIONS_PER_PAGE;
  const paginatedTransactions = filteredTransactions.slice(startIndex, endIndex);

  
  useEffect(() => {
    setCurrentPage(1);
  }, [activeFilter, searchTerm]);

  
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

  
  const thisMonthCount = useMemo(() => {
    const now = new Date();
    const thisMonth = now.getMonth();
    const thisYear = now.getFullYear();
    
    return transactions.filter(txn => {
      const txnDate = new Date(txn.date);
      return txnDate.getMonth() === thisMonth && txnDate.getFullYear() === thisYear;
    }).length;
  }, [transactions]);

  const metrics = [
    {
      label: "Total Invested",
      value: `$${portfolioSummary.totalInvested.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`,
      change: portfolioSummary.totalInvested > 0 ? `${portfolioSummary.totalProperties} ${portfolioSummary.totalProperties === 1 ? 'property' : 'properties'}` : "Start investing to see returns",
      changeType: "neutral"
    },
    {
      label: "Total Returns",
      value: `$${portfolioSummary.totalReturn.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`,
      change: portfolioSummary.totalReturn > 0 ? 
        `↗ ${portfolioSummary.totalReturnPercentage.toFixed(2)}%` : 
        "No investments yet",
      changeType: portfolioSummary.totalReturn > 0 ? "positive" : "neutral"
    },
    {
      label: "This Month",
      value: thisMonthCount.toString(),
      change: thisMonthCount > 0 ? `${transactions.length} total transactions` : "No transactions yet",
      changeType: "neutral"
    },
    {
      label: "Avg. Processing",
      value: "2.4s",
      change: "= Instant settlement",
      changeType: "neutral"
    }
  ];

  return (
    <div id="transactions" className="page-section active">
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
          overflow: 'hidden'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
            <div>
              <div style={{ fontSize: '12px', color: '#ffffff', opacity: 0.7, marginBottom: '6px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Total Invested
              </div>
              <div style={{ fontSize: '28px', fontWeight: '700', color: '#ffffff', letterSpacing: '-0.02em', fontVariantNumeric: 'tabular-nums' }}>
                {metrics[0].value}
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
            {portfolioSummary.totalProperties} {portfolioSummary.totalProperties === 1 ? 'property' : 'properties'}
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
                Total Returns
              </div>
              <div style={{ fontSize: '28px', fontWeight: '700', color: '#ffffff', letterSpacing: '-0.02em', fontVariantNumeric: 'tabular-nums' }}>
                {metrics[1].value}
              </div>
            </div>
            <div style={{
              width: '48px',
              height: '48px',
              background: portfolioSummary.totalReturn >= 0 ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={portfolioSummary.totalReturn >= 0 ? '#10b981' : '#ef4444'} strokeWidth="2">
                <path d="M22 12H18L15 21L9 3L6 12H2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingTop: '12px', borderTop: '1px solid var(--border-primary)' }}>
            <div style={{ 
              fontSize: '13px', 
              fontWeight: '600', 
              color: portfolioSummary.totalReturnPercentage >= 0 ? '#10b981' : '#ef4444',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M7 17L17 7M17 7H7M17 7V17" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              {metrics[1].change}
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
                This Month
              </div>
              <div style={{ fontSize: '28px', fontWeight: '700', color: '#ffffff', letterSpacing: '-0.02em', fontVariantNumeric: 'tabular-nums' }}>
                {metrics[2].value}
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
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 17c-3.86 0-7-3.14-7-7s3.14-7 7-7 7 3.14 7 7-3.14 7-7 7z" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M12 6v6l4 2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </div>
          <div style={{ fontSize: '13px', color: '#ffffff', opacity: 0.7, paddingTop: '12px', borderTop: '1px solid var(--border-primary)' }}>
            {transactions.length} total transactions
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
                Avg. Processing
              </div>
              <div style={{ fontSize: '28px', fontWeight: '700', color: '#10b981', letterSpacing: '-0.02em', fontVariantNumeric: 'tabular-nums' }}>
                {metrics[3].value}
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
                <path d="M13 2L3 14H12L11 22L21 10H12L13 2Z" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </div>
          <div style={{ fontSize: '13px', color: '#ffffff', opacity: 0.7, paddingTop: '12px', borderTop: '1px solid var(--border-primary)' }}>
            Instant settlement
          </div>
        </div>
      </div>

      {}
      <div style={{
        background: 'var(--bg-secondary)',
        border: '1px solid var(--border-primary)',
        borderRadius: '14px',
        padding: '20px',
        marginBottom: '24px'
      }}>
        {}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px', marginBottom: '16px', flexWrap: 'wrap' }}>
          {}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center', flex: 1 }}>
            {filters.map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                style={{
                  padding: '8px 16px',
                  background: activeFilter === filter ? 'var(--accent-blue)' : 'var(--bg-tertiary)',
                  border: `1px solid ${activeFilter === filter ? 'var(--accent-blue)' : 'var(--border-primary)'}`,
                  borderRadius: '8px',
                  color: '#ffffff',
                  fontSize: '13px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  outline: 'none',
                  whiteSpace: 'nowrap'
                }}
                onMouseEnter={(e) => {
                  if (activeFilter !== filter) {
                    e.currentTarget.style.background = 'var(--bg-secondary)';
                    e.currentTarget.style.borderColor = 'var(--border-secondary)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (activeFilter !== filter) {
                    e.currentTarget.style.background = 'var(--bg-tertiary)';
                    e.currentTarget.style.borderColor = 'var(--border-primary)';
                  }
                }}
              >
                {filter}
                {activeFilter === filter && activeFilter !== "All" && (
                  <span style={{
                    padding: '2px 6px',
                    background: 'rgba(255, 255, 255, 0.2)',
                    borderRadius: '4px',
                    fontSize: '11px',
                    fontWeight: '700'
                  }}>
                    {filteredTransactions.length}
                  </span>
                )}
              </button>
            ))}
            {(activeFilter !== "All" || searchTerm) && (
              <button
                onClick={() => {
                  setActiveFilter("All");
                  setSearchTerm("");
                }}
                title="Clear all filters"
                style={{
                  padding: '8px 12px',
                  background: 'transparent',
                  border: '1px solid var(--border-primary)',
                  borderRadius: '8px',
                  color: '#ffffff',
                  fontSize: '13px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  transition: 'all 0.2s ease',
                  opacity: 0.7,
                  whiteSpace: 'nowrap'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'var(--bg-tertiary)';
                  e.currentTarget.style.opacity = '1';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.opacity = '0.7';
                }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Clear
              </button>
            )}
          </div>
        </div>

        {}
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
          {}
          <div style={{ position: 'relative', width: '300px', maxWidth: '100%' }}>
            <svg 
              style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#ffffff',
                opacity: 0.5,
                width: '16px',
                height: '16px'
              }}
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2"
            >
              <path d="M21 21l-4.35-4.35" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="11" cy="11" r="6" />
            </svg>
            <input
              type="text"
              placeholder="Search transactions, properties..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 12px 10px 36px',
                background: 'var(--bg-tertiary)',
                border: '1px solid var(--border-primary)',
                borderRadius: '8px',
                color: '#ffffff',
                fontSize: '13px',
                outline: 'none',
                transition: 'all 0.2s ease'
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = 'var(--accent-blue)';
                e.currentTarget.style.background = 'var(--bg-secondary)';
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = 'var(--border-primary)';
                e.currentTarget.style.background = 'var(--bg-tertiary)';
              }}
            />
          </div>

          {}
          <div style={{ position: 'relative' }} ref={datePickerRef}>
            <div 
              onClick={() => setShowDatePicker(!showDatePicker)}
              style={{
                padding: '10px 14px',
                background: 'var(--bg-tertiary)',
                border: '1px solid var(--border-primary)',
                borderRadius: '8px',
                color: '#ffffff',
                fontSize: '13px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.2s ease',
                whiteSpace: 'nowrap'
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
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M8 2V5M16 2V5M3.5 9.09H20.5M21 8.5V17.5C21 18.8807 19.8807 20 18.5 20H5.5C4.11929 20 3 18.8807 3 17.5V8.5C3 7.11929 4.11929 6 5.5 6H18.5C19.8807 6 21 7.11929 21 8.5Z" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span>{dateRange}</span>
              <svg 
                width="12" 
                height="12" 
                viewBox="0 0 24 24" 
                fill="none"
                style={{
                  transform: showDatePicker ? 'rotate(180deg)' : 'rotate(0deg)',
                  transition: 'transform 0.2s ease'
                }}
              >
                <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            
            {showDatePicker && (
              <div style={{
                position: 'absolute',
                top: 'calc(100% + 8px)',
                right: 0,
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-primary)',
                borderRadius: '12px',
                padding: '16px',
                minWidth: '320px',
                zIndex: 1000,
                boxShadow: '0 8px 24px rgba(0, 0, 0, 0.3)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <h4 style={{ fontSize: '16px', fontWeight: '700', color: '#ffffff', margin: 0 }}>Select Date Range</h4>
                  <button 
                    onClick={() => setShowDatePicker(false)}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: '#ffffff',
                      cursor: 'pointer',
                      padding: '4px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderRadius: '6px',
                      transition: 'all 0.2s ease',
                      opacity: 0.7
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'var(--bg-tertiary)';
                      e.currentTarget.style.opacity = '1';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'transparent';
                      e.currentTarget.style.opacity = '0.7';
                    }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                </div>
                
                <div style={{ marginBottom: '16px' }}>
                  <div style={{ fontSize: '12px', color: '#ffffff', opacity: 0.7, marginBottom: '8px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Quick Select
                  </div>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    <button 
                      onClick={() => {
                        const today = new Date();
                        const lastWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
                        setStartDate(lastWeek.toISOString().split('T')[0]);
                        setEndDate(today.toISOString().split('T')[0]);
                      }}
                      style={{
                        padding: '8px 12px',
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
                      Last 7 days
                    </button>
                    <button 
                      onClick={() => {
                        const today = new Date();
                        const lastMonth = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
                        setStartDate(lastMonth.toISOString().split('T')[0]);
                        setEndDate(today.toISOString().split('T')[0]);
                      }}
                      style={{
                        padding: '8px 12px',
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
                      Last 30 days
                    </button>
                    <button 
                      onClick={() => {
                        const today = new Date();
                        const last3Months = new Date(today.getTime() - 90 * 24 * 60 * 60 * 1000);
                        setStartDate(last3Months.toISOString().split('T')[0]);
                        setEndDate(today.toISOString().split('T')[0]);
                      }}
                      style={{
                        padding: '8px 12px',
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
                      Last 3 months
                    </button>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', fontSize: '12px', color: '#ffffff', opacity: 0.7, marginBottom: '6px', fontWeight: '600' }}>
                      From
                    </label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={handleStartDateChange}
                      max={endDate}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        background: 'var(--bg-tertiary)',
                        border: '1px solid var(--border-primary)',
                        borderRadius: '8px',
                        color: '#ffffff',
                        fontSize: '13px',
                        outline: 'none',
                        transition: 'all 0.2s ease'
                      }}
                      onFocus={(e) => {
                        e.currentTarget.style.borderColor = 'var(--accent-blue)';
                        e.currentTarget.style.background = 'var(--bg-secondary)';
                      }}
                      onBlur={(e) => {
                        e.currentTarget.style.borderColor = 'var(--border-primary)';
                        e.currentTarget.style.background = 'var(--bg-tertiary)';
                      }}
                    />
                  </div>
                  
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', fontSize: '12px', color: '#ffffff', opacity: 0.7, marginBottom: '6px', fontWeight: '600' }}>
                      To
                    </label>
                    <input
                      type="date"
                      value={endDate}
                      onChange={handleEndDateChange}
                      min={startDate}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        background: 'var(--bg-tertiary)',
                        border: '1px solid var(--border-primary)',
                        borderRadius: '8px',
                        color: '#ffffff',
                        fontSize: '13px',
                        outline: 'none',
                        transition: 'all 0.2s ease'
                      }}
                      onFocus={(e) => {
                        e.currentTarget.style.borderColor = 'var(--accent-blue)';
                        e.currentTarget.style.background = 'var(--bg-secondary)';
                      }}
                      onBlur={(e) => {
                        e.currentTarget.style.borderColor = 'var(--border-primary)';
                        e.currentTarget.style.background = 'var(--bg-tertiary)';
                      }}
                    />
                  </div>
                </div>
                
                <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                  <button 
                    onClick={resetDateRange}
                    style={{
                      padding: '8px 16px',
                      background: 'transparent',
                      border: '1px solid var(--border-primary)',
                      borderRadius: '8px',
                      color: '#ffffff',
                      fontSize: '13px',
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
                    Reset
                  </button>
                  <button 
                    onClick={applyDateRange}
                    style={{
                      padding: '8px 16px',
                      background: 'var(--accent-blue)',
                      border: 'none',
                      borderRadius: '8px',
                      color: '#ffffff',
                      fontSize: '13px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      boxShadow: '0 2px 8px rgba(59, 130, 246, 0.3)'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = '#2563eb';
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.4)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'var(--accent-blue)';
                      e.currentTarget.style.boxShadow = '0 2px 8px rgba(59, 130, 246, 0.3)';
                    }}
                  >
                    Apply
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {}
      <div style={{
        background: 'var(--bg-secondary)',
        border: '1px solid var(--border-primary)',
        borderRadius: '14px',
        padding: '20px',
        minHeight: '450px',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#ffffff', marginBottom: '4px', letterSpacing: '-0.01em' }}>
              Transaction History
            </h2>
            <p style={{ fontSize: '13px', color: '#ffffff', opacity: 0.7, margin: 0 }}>
              {filteredTransactions.length} {filteredTransactions.length === 1 ? 'transaction' : 'transactions'} found
            </p>
          </div>
          <button 
            style={{
              padding: '8px 14px',
              background: 'var(--bg-tertiary)',
              border: '1px solid var(--border-primary)',
              borderRadius: '8px',
              color: '#ffffff',
              fontSize: '13px',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
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
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M15.0002 15.0001V9.00005M15.0002 9.00005H9.00019M15.0002 9.00005L9.00019 14.9999M7.8 21H16.2C17.8802 21 18.7202 21 19.362 20.673C19.9265 20.3854 20.3854 19.9265 20.673 19.362C21 18.7202 21 17.8802 21 16.2V7.8C21 6.11984 21 5.27976 20.673 4.63803C20.3854 4.07354 19.9265 3.6146 19.362 3.32698C18.7202 3 17.8802 3 16.2 3H7.8C6.11984 3 5.27976 3 4.63803 3.32698C4.07354 3.6146 3.6146 4.07354 3.32698 4.63803C3 5.27976 3 6.11984 3 7.8V16.2C3 17.8802 3 18.7202 3.32698 19.362C3.6146 19.9265 4.07354 20.3854 4.63803 20.673C5.27976 21 6.11984 21 7.8 21Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Export
          </button>
        </div>

        {}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {filteredTransactions.length === 0 ? (
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            justifyContent: 'center', 
            padding: '60px 20px', 
            textAlign: 'center',
            flex: 1
          }}>
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
                <path d="M21 21l-4.35-4.35M19 11a8 8 0 11-16 0 8 8 0 0116 0z" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#ffffff', marginBottom: '8px', letterSpacing: '-0.01em' }}>
              No transactions found
            </h3>
            <p style={{ fontSize: '14px', color: '#ffffff', opacity: 0.7, marginBottom: '20px', maxWidth: '400px' }}>
              {activeFilter !== "All" 
                ? `No ${activeFilter.toLowerCase()} found. Try adjusting your filters.`
                : searchTerm 
                  ? `No transactions match "${searchTerm}". Try a different search term.`
                  : "Start investing in properties to see your transaction history here."
              }
            </p>
            {(activeFilter !== "All" || searchTerm) && (
              <button
                onClick={() => {
                  setActiveFilter("All");
                  setSearchTerm("");
                }}
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
                  gap: '6px',
                  transition: 'all 0.2s ease',
                  boxShadow: '0 2px 8px rgba(59, 130, 246, 0.3)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#2563eb';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'var(--accent-blue)';
                  e.currentTarget.style.boxShadow = '0 2px 8px rgba(59, 130, 246, 0.3)';
                }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {paginatedTransactions.map((transaction, index) => {
              const isPositive = transaction.amount.startsWith('+');
              
              return (
                <div
                  key={index}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px',
                    padding: '16px',
                    background: 'var(--bg-tertiary)',
                    border: '1px solid var(--border-primary)',
                    borderRadius: '12px',
                    transition: 'all 0.2s ease',
                    cursor: 'pointer'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'var(--bg-secondary)';
                    e.currentTarget.style.borderColor = 'var(--border-secondary)';
                    e.currentTarget.style.transform = 'translateY(-1px)';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.2)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'var(--bg-tertiary)';
                    e.currentTarget.style.borderColor = 'var(--border-primary)';
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  {}
                  <div style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '12px',
                    background: `${transaction.iconColor}20`,
                    border: `1.5px solid ${transaction.iconColor}40`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    <div style={{ color: transaction.iconColor }}>
                      {transaction.icon}
                    </div>
                  </div>

                  {}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px', marginBottom: '6px' }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', flexWrap: 'wrap' }}>
                          <span style={{ fontSize: '15px', fontWeight: '700', color: '#ffffff' }}>
                            {transaction.type}
                          </span>
                          <span style={{
                            padding: '3px 8px',
                            background: transaction.status.toLowerCase() === 'completed' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                            border: `1px solid ${transaction.status.toLowerCase() === 'completed' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(245, 158, 11, 0.3)'}`,
                            borderRadius: '6px',
                            fontSize: '11px',
                            fontWeight: '600',
                            color: transaction.status.toLowerCase() === 'completed' ? '#10b981' : '#f59e0b',
                            whiteSpace: 'nowrap'
                          }}>
                            {transaction.status}
                          </span>
                        </div>
                        <div style={{ fontSize: '12px', color: '#ffffff', opacity: 0.6, marginBottom: '2px', fontFamily: 'monospace' }}>
                          {transaction.id}
                        </div>
                        <div style={{ fontSize: '13px', color: '#ffffff', opacity: 0.8, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {transaction.description}
                          {transaction.location && (
                            <span style={{ opacity: 0.6 }}> • {transaction.location}</span>
                          )}
                        </div>
                      </div>
                      
                      {}
                      <div style={{ textAlign: 'right', flexShrink: 0 }}>
                        <div style={{ 
                          fontSize: '16px', 
                          fontWeight: '700', 
                          color: isPositive ? '#10b981' : '#ffffff',
                          fontVariantNumeric: 'tabular-nums',
                          marginBottom: '4px'
                        }}>
                          {transaction.amount}
                        </div>
                        <div style={{ fontSize: '12px', color: '#ffffff', opacity: 0.6 }}>
                          {transaction.date}
                        </div>
                        {transaction.tokens > 0 && (
                          <div style={{ fontSize: '11px', color: '#ffffff', opacity: 0.5, marginTop: '4px' }}>
                            {transaction.tokens} tokens
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
        </div>

        {}
        {filteredTransactions.length > 0 && (
          <div style={{ 
            marginTop: '24px', 
            paddingTop: '24px', 
            borderTop: '1px solid var(--border-primary)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '16px'
          }}>
            <div style={{ fontSize: '13px', color: '#ffffff', opacity: 0.7 }}>
              Showing {startIndex + 1}-{Math.min(endIndex, filteredTransactions.length)} of {filteredTransactions.length} {filteredTransactions.length === 1 ? 'transaction' : 'transactions'}
              {activeFilter !== "All" && ` (filtered by ${activeFilter})`}
              {searchTerm && ` (search: "${searchTerm}")`}
            </div>
            {totalPages > 1 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button 
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
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
                      onClick={() => setCurrentPage(page)}
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
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
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
      </div>
      </div>
    </div>
  );
};

export default Transactions;
