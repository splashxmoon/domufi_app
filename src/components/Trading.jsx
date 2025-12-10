import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTrading } from '../contexts/TradingContext';
import PriceChart from './PriceChart';
import OrderBook from './OrderBook';
import RecentTrades from './RecentTrades';
import OrderEntryForm from './OrderEntryForm';
import UserOpenOrders from './UserOpenOrders';

// Platform properties (same as in Marketplace)
const PLATFORM_PROPERTIES = [
  {
    id: 1,
    name: 'Luxury SoHo Loft Complex',
    city: 'New York',
    state: 'NY',
    tokenPrice: 50,
    totalTokens: 10000,
    annualROI: 11.2,
    propertyType: 'Residential'
  },
  {
    id: 2,
    name: 'Miami Beach Luxury Condos',
    city: 'Miami',
    state: 'FL',
    tokenPrice: 50,
    totalTokens: 8000,
    annualROI: 8.5,
    propertyType: 'Residential'
  },
  {
    id: 3,
    name: 'Beverly Hills Luxury Villa',
    city: 'Beverly Hills',
    state: 'CA',
    tokenPrice: 75,
    totalTokens: 6000,
    annualROI: 9.8,
    propertyType: 'Residential'
  },
  {
    id: 4,
    name: 'Chicago Lakefront Apartments',
    city: 'Chicago',
    state: 'IL',
    tokenPrice: 40,
    totalTokens: 12000,
    annualROI: 7.2,
    propertyType: 'Residential'
  },
  {
    id: 5,
    name: 'Seattle Urban Lofts',
    city: 'Seattle',
    state: 'WA',
    tokenPrice: 60,
    totalTokens: 9000,
    annualROI: 12.5,
    propertyType: 'Residential'
  },
  {
    id: 6,
    name: 'Austin Residential Complex',
    city: 'Austin',
    state: 'TX',
    tokenPrice: 35,
    totalTokens: 15000,
    annualROI: 8.1,
    propertyType: 'Residential'
  }
];

const Trading = () => {
  const [searchParams] = useSearchParams();
  const propertyIdFromUrl = searchParams.get('property');

  const { marketData, priceHistory, initializeMarketData, getOrderBook, allTrades } = useTrading();

  const [selectedProperty, setSelectedProperty] = useState(null);
  const [timeframe, setTimeframe] = useState('24h');
  const [isPropertyDropdownOpen, setIsPropertyDropdownOpen] = useState(false);

  // Responsive grid styles
  const responsiveStyles = `
    .trading-grid-row-1 {
      display: grid;
      grid-template-columns: 2fr 1fr;
      gap: 24px;
      align-items: stretch;
      min-width: 0;
    }

    .trading-grid-row-2 {
      display: grid;
      grid-template-columns: 1fr;
      gap: 24px;
      min-width: 0;
    }

    .trading-card {
      min-width: 0;
      overflow: hidden;
    }

    .trading-chart-container,
    .trading-order-book,
    .trading-open-orders {
      width: 100%;
      max-width: 100%;
      box-sizing: border-box;
    }

    /* Medium screens and half-screen */
    @media (max-width: 1400px) {
      .trading-grid-row-1 {
        grid-template-columns: 1.5fr 1fr;
      }
    }

    @media (max-width: 1100px) {
      .trading-grid-row-1 {
        grid-template-columns: 1fr;
      }
    }

    /* Tablet */
    @media (max-width: 768px) {
      .trading-grid-row-1,
      .trading-grid-row-2 {
        grid-template-columns: 1fr;
        gap: 16px;
      }

      .trading-card {
        padding: 16px !important;
      }

      .trading-chart-container {
        min-height: 300px !important;
      }

      .trading-order-book,
      .trading-open-orders {
        max-height: none !important;
      }

      .trading-page-container {
        padding: 16px !important;
      }

      .trading-header-stats {
        flex-direction: column !important;
        align-items: flex-start !important;
        gap: 16px !important;
      }

      .trading-market-stats {
        flex-direction: column !important;
        align-items: flex-start !important;
        gap: 12px !important;
        width: 100%;
      }
    }

    /* Small mobile */
    @media (max-width: 480px) {
      .trading-grid-row-1,
      .trading-grid-row-2 {
        gap: 12px;
      }

      .trading-page-container {
        padding: 12px !important;
      }

      .trading-card {
        padding: 12px !important;
      }
    }
  `;

  // Initialize with URL property or first property
  useEffect(() => {
    const propertyId = propertyIdFromUrl ? parseInt(propertyIdFromUrl) : 1;
    const property = PLATFORM_PROPERTIES.find(p => p.id === propertyId);

    if (property) {
      setSelectedProperty(property);
      initializeMarketData(property.id, property.name, property.tokenPrice);
    }
  }, [propertyIdFromUrl, initializeMarketData]);

  const currentMarketData = selectedProperty ? marketData[selectedProperty.id] : null;
  const currentPriceHistory = selectedProperty ? priceHistory[selectedProperty.id] : null;
  const orderBook = selectedProperty ? getOrderBook(selectedProperty.id) : { bids: [], asks: [] };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  };

  const formatPercent = (value) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
  };

  return (
    <div className="trading-page-container" style={{
      padding: '24px',
      minHeight: 'calc(100vh - 80px)',
      background: 'var(--bg-primary, #0d0e11)',
      maxWidth: '100%',
      overflowX: 'hidden',
      boxSizing: 'border-box'
    }}>
      {/* Responsive Styles */}
      <style>{responsiveStyles}</style>

      {/* Page Header */}
      <div style={{
        marginBottom: '24px'
      }}>
        <h1 style={{
          fontSize: '28px',
          fontWeight: '600',
          color: 'var(--text-primary, #f8f9fa)',
          marginBottom: '8px'
        }}>
          Secondary Market Trading
        </h1>
        <p style={{
          fontSize: '14px',
          color: 'var(--text-secondary, #9ca3af)'
        }}>
          Trade tokenized real estate on the secondary market with real-time pricing
        </p>
      </div>

      {/* Trading Header: Property Selector + Market Stats */}
      <div style={{
        background: 'var(--bg-card, #16181d)',
        border: '1px solid var(--border-primary, #2a2d36)',
        borderRadius: '12px',
        padding: '20px',
        marginBottom: '24px'
      }}>
        <div className="trading-header-stats" style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '20px'
        }}>
          {/* Property Selector */}
          <div style={{ position: 'relative', minWidth: '300px' }}>
            <label style={{
              display: 'block',
              fontSize: '12px',
              fontWeight: '500',
              color: 'var(--text-secondary, #9ca3af)',
              marginBottom: '8px',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              Select Property
            </label>
            <button
              onClick={() => setIsPropertyDropdownOpen(!isPropertyDropdownOpen)}
              style={{
                width: '100%',
                padding: '12px 16px',
                background: 'var(--bg-tertiary, #1c1f26)',
                border: '1px solid var(--border-primary, #2a2d36)',
                borderRadius: '8px',
                color: 'var(--text-primary, #f8f9fa)',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--accent-blue, #3b82f6)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--border-primary, #2a2d36)';
              }}
            >
              <span>
                {selectedProperty ? `${selectedProperty.name} (${selectedProperty.city})` : 'Select a property...'}
              </span>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{
                transform: isPropertyDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                transition: 'transform 0.2s ease'
              }}>
                <path d="M4 6L8 10L12 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>

            {/* Dropdown Menu */}
            {isPropertyDropdownOpen && (
              <div style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                right: 0,
                marginTop: '4px',
                background: 'var(--bg-tertiary, #1c1f26)',
                border: '1px solid var(--border-primary, #2a2d36)',
                borderRadius: '8px',
                boxShadow: '0 8px 16px rgba(0, 0, 0, 0.4)',
                zIndex: 100,
                maxHeight: '300px',
                overflowY: 'auto'
              }}>
                {PLATFORM_PROPERTIES.map((property) => (
                  <button
                    key={property.id}
                    onClick={() => {
                      setSelectedProperty(property);
                      initializeMarketData(property.id, property.name, property.tokenPrice);
                      setIsPropertyDropdownOpen(false);
                    }}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      background: selectedProperty?.id === property.id
                        ? 'var(--accent-blue, #3b82f6)'
                        : 'transparent',
                      border: 'none',
                      borderBottom: '1px solid var(--border-primary, #2a2d36)',
                      color: 'var(--text-primary, #f8f9fa)',
                      fontSize: '14px',
                      textAlign: 'left',
                      cursor: 'pointer',
                      transition: 'background 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      if (selectedProperty?.id !== property.id) {
                        e.currentTarget.style.background = 'rgba(59, 130, 246, 0.1)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (selectedProperty?.id !== property.id) {
                        e.currentTarget.style.background = 'transparent';
                      }
                    }}
                  >
                    <div style={{ fontWeight: '500' }}>{property.name}</div>
                    <div style={{
                      fontSize: '12px',
                      color: 'var(--text-secondary, #9ca3af)',
                      marginTop: '2px'
                    }}>
                      {property.city}, {property.state} • {formatCurrency(property.tokenPrice)}/token
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Market Stats */}
          {currentMarketData && (
            <div className="trading-market-stats" style={{
              display: 'flex',
              gap: '32px',
              flexWrap: 'wrap'
            }}>
              {/* Current Price */}
              <div>
                <div style={{
                  fontSize: '12px',
                  color: 'var(--text-secondary, #9ca3af)',
                  marginBottom: '4px'
                }}>
                  Current Price
                </div>
                <div style={{
                  fontSize: '24px',
                  fontWeight: '600',
                  color: 'var(--text-primary, #f8f9fa)'
                }}>
                  {formatCurrency(currentMarketData.currentPrice)}
                </div>
              </div>

              {/* 24h Change */}
              <div>
                <div style={{
                  fontSize: '12px',
                  color: 'var(--text-secondary, #9ca3af)',
                  marginBottom: '4px'
                }}>
                  24h Change
                </div>
                <div style={{
                  fontSize: '18px',
                  fontWeight: '600',
                  color: currentMarketData.priceChangePercent24h >= 0
                    ? 'var(--accent-green, #10b981)'
                    : 'var(--accent-red, #ef4444)'
                }}>
                  {formatPercent(currentMarketData.priceChangePercent24h)}
                </div>
              </div>

              {/* 7d Change */}
              {currentMarketData.priceChangePercent7d !== undefined && (
                <div>
                  <div style={{
                    fontSize: '12px',
                    color: 'var(--text-secondary, #9ca3af)',
                    marginBottom: '4px'
                  }}>
                    7d Change
                  </div>
                  <div style={{
                    fontSize: '18px',
                    fontWeight: '600',
                    color: currentMarketData.priceChangePercent7d >= 0
                      ? 'var(--accent-green, #10b981)'
                      : 'var(--accent-red, #ef4444)'
                  }}>
                    {formatPercent(currentMarketData.priceChangePercent7d)}
                  </div>
                </div>
              )}

              {/* 24h Volume */}
              <div>
                <div style={{
                  fontSize: '12px',
                  color: 'var(--text-secondary, #9ca3af)',
                  marginBottom: '4px'
                }}>
                  24h Volume
                </div>
                <div style={{
                  fontSize: '18px',
                  fontWeight: '600',
                  color: 'var(--text-primary, #f8f9fa)'
                }}>
                  {currentMarketData.volume24h.toLocaleString()} tokens
                </div>
              </div>

              {/* Spread */}
              {currentMarketData.bestBid && currentMarketData.bestAsk && (
                <div>
                  <div style={{
                    fontSize: '12px',
                    color: 'var(--text-secondary, #9ca3af)',
                    marginBottom: '4px'
                  }}>
                    Spread
                  </div>
                  <div style={{
                    fontSize: '18px',
                    fontWeight: '600',
                    color: 'var(--text-primary, #f8f9fa)'
                  }}>
                    {formatCurrency(currentMarketData.spread)} ({currentMarketData.spreadPercent.toFixed(2)}%)
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* New Trading Layout */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {/* Row 1: Price Chart (Left, Bigger) + Place Order (Right) - Aligned Heights */}
        <div className="trading-grid-row-1">
          {/* Price Chart - Central Focus */}
          <div className="trading-card trading-chart-container" style={{
            background: 'var(--bg-card, #16181d)',
            border: '1px solid var(--border-primary, #2a2d36)',
            borderRadius: '12px',
            padding: '20px',
            display: 'flex',
            flexDirection: 'column'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '20px'
            }}>
              {/* Property Name and Current Price */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <h3 style={{
                  fontSize: '18px',
                  fontWeight: '600',
                  color: 'var(--text-primary, #f8f9fa)',
                  margin: 0
                }}>
                  {selectedProperty?.name || 'Select Property'}
                </h3>
                {currentMarketData?.currentPrice && (
                  <div style={{
                    background: 'rgba(59, 130, 246, 0.15)',
                    padding: '6px 12px',
                    borderRadius: '6px',
                    border: '1px solid rgba(59, 130, 246, 0.3)',
                    fontSize: '16px',
                    fontWeight: '600',
                    color: 'var(--accent-blue, #3b82f6)'
                  }}>
                    {formatCurrency(currentMarketData.currentPrice)}
                  </div>
                )}
              </div>

              {/* Timeframe Toggle */}
              <div style={{
                display: 'flex',
                gap: '8px',
                background: 'var(--bg-tertiary, #1c1f26)',
                padding: '4px',
                borderRadius: '6px'
              }}>
                {['24h', '7d', '30d'].map((tf) => (
                  <button
                    key={tf}
                    onClick={() => setTimeframe(tf)}
                    style={{
                      padding: '6px 16px',
                      background: timeframe === tf ? 'var(--accent-blue, #3b82f6)' : 'transparent',
                      border: 'none',
                      borderRadius: '4px',
                      color: 'var(--text-primary, #f8f9fa)',
                      fontSize: '12px',
                      fontWeight: '500',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    {tf}
                  </button>
                ))}
              </div>
            </div>

            {/* Price Chart - Flex grow to fill */}
            <div style={{ flex: 1, minHeight: '450px' }}>
              <PriceChart
                priceHistory={currentPriceHistory}
                timeframe={timeframe}
                currentPrice={currentMarketData?.currentPrice || selectedProperty?.tokenPrice || 0}
              />
            </div>
          </div>

          {/* Place Order - Right Side - Same Height */}
          <div className="trading-card" style={{
            background: 'var(--bg-card, #16181d)',
            border: '1px solid var(--border-primary, #2a2d36)',
            borderRadius: '12px',
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'auto'
          }}>
            <h3 style={{
              fontSize: '16px',
              fontWeight: '600',
              color: 'var(--text-primary, #f8f9fa)',
              marginBottom: '16px'
            }}>
              Place Order
            </h3>
            <OrderEntryForm
              selectedProperty={selectedProperty}
              currentMarketData={currentMarketData}
              onOrderPlaced={() => {
                // Refresh order book and market data after order is placed
                console.log('Order placed successfully');
              }}
            />
          </div>
        </div>

        {/* Row 2: Order Book - Full Width, Shorter Height */}
        <div className="trading-card trading-order-book" style={{
          background: 'var(--bg-card, #16181d)',
          border: '1px solid var(--border-primary, #2a2d36)',
          borderRadius: '12px',
          padding: '20px',
          maxHeight: '450px',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}>
          <h3 style={{
            fontSize: '16px',
            fontWeight: '600',
            color: 'var(--text-primary, #f8f9fa)',
            marginBottom: '16px',
            flexShrink: 0
          }}>
            Order Book
          </h3>
          <div style={{ flex: 1, overflow: 'auto', minHeight: 0 }}>
            <OrderBook
              bids={orderBook.bids}
              asks={orderBook.asks}
              onPriceClick={(price) => {
                // Auto-fill order entry form with clicked price
                console.log('Price clicked:', price);
              }}
            />
          </div>
        </div>

        {/* Row 3: Your Open Orders - Full Width, Smaller Height */}
        <div className="trading-card trading-open-orders" style={{
          background: 'var(--bg-card, #16181d)',
          border: '1px solid var(--border-primary, #2a2d36)',
          borderRadius: '12px',
          padding: '20px',
          maxHeight: '300px',
          overflow: 'auto'
        }}>
          <h3 style={{
            fontSize: '16px',
            fontWeight: '600',
            color: 'var(--text-primary, #f8f9fa)',
            marginBottom: '16px'
          }}>
            Your Open Orders
          </h3>
          <UserOpenOrders selectedProperty={selectedProperty} />
        </div>
      </div>
    </div>
  );
};

export default Trading;
