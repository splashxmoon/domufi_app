import React, { useMemo } from 'react';

const OrderBook = ({ bids = [], asks = [], onPriceClick }) => {
  // Group orders by price level
  const groupedBids = useMemo(() => {
    const grouped = {};
    bids.forEach(order => {
      const price = order.pricePerToken;
      if (!grouped[price]) {
        grouped[price] = {
          price,
          totalTokens: 0,
          totalValue: 0,
          orders: []
        };
      }
      grouped[price].totalTokens += order.remainingTokens;
      grouped[price].totalValue += order.remainingTokens * price;
      grouped[price].orders.push(order);
    });

    return Object.values(grouped).sort((a, b) => b.price - a.price);
  }, [bids]);

  const groupedAsks = useMemo(() => {
    const grouped = {};
    asks.forEach(order => {
      const price = order.pricePerToken;
      if (!grouped[price]) {
        grouped[price] = {
          price,
          totalTokens: 0,
          totalValue: 0,
          orders: []
        };
      }
      grouped[price].totalTokens += order.remainingTokens;
      grouped[price].totalValue += order.remainingTokens * price;
      grouped[price].orders.push(order);
    });

    return Object.values(grouped).sort((a, b) => a.price - b.price);
  }, [asks]);

  // Calculate spread
  const spread = useMemo(() => {
    if (groupedBids.length === 0 || groupedAsks.length === 0) return null;

    const bestBid = groupedBids[0].price;
    const bestAsk = groupedAsks[0].price;
    const spreadValue = bestAsk - bestBid;
    const spreadPercent = (spreadValue / bestAsk) * 100;

    return {
      value: spreadValue,
      percent: spreadPercent,
      bestBid,
      bestAsk
    };
  }, [groupedBids, groupedAsks]);

  // Calculate max volume for visualization
  const maxVolume = useMemo(() => {
    const allLevels = [...groupedBids, ...groupedAsks];
    if (allLevels.length === 0) return 1;
    return Math.max(...allLevels.map(level => level.totalValue));
  }, [groupedBids, groupedAsks]);

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  };

  const formatNumber = (value) => {
    return new Intl.NumberFormat('en-US').format(value);
  };

  const PriceLevel = ({ level, side, onClick }) => {
    const barWidth = (level.totalValue / maxVolume) * 100;

    return (
      <div
        onClick={() => onClick && onClick(level.price)}
        style={{
          position: 'relative',
          padding: '6px 12px',
          cursor: onClick ? 'pointer' : 'default',
          transition: 'background 0.2s ease',
          fontSize: '13px',
          fontFamily: 'monospace'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = side === 'buy'
            ? 'rgba(16, 185, 129, 0.05)'
            : 'rgba(239, 68, 68, 0.05)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'transparent';
        }}
      >
        {/* Background bar */}
        <div style={{
          position: 'absolute',
          top: 0,
          right: 0,
          bottom: 0,
          width: `${barWidth}%`,
          background: side === 'buy'
            ? 'rgba(16, 185, 129, 0.08)'
            : 'rgba(239, 68, 68, 0.08)',
          transition: 'width 0.3s ease'
        }} />

        {/* Content */}
        <div style={{
          position: 'relative',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr 1fr',
          gap: '12px'
        }}>
          <div style={{
            fontWeight: '600',
            color: side === 'buy'
              ? 'var(--accent-green, #10b981)'
              : 'var(--accent-red, #ef4444)'
          }}>
            {formatCurrency(level.price)}
          </div>
          <div style={{
            textAlign: 'right',
            color: 'var(--text-primary, #f8f9fa)'
          }}>
            {formatNumber(level.totalTokens)}
          </div>
          <div style={{
            textAlign: 'right',
            color: 'var(--text-secondary, #9ca3af)'
          }}>
            {formatCurrency(level.totalValue)}
          </div>
        </div>
      </div>
    );
  };

  // Empty state
  if (bids.length === 0 && asks.length === 0) {
    return (
      <div style={{
        textAlign: 'center',
        padding: '60px 20px',
        color: 'var(--text-secondary, #9ca3af)'
      }}>
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" style={{ margin: '0 auto 12px' }}>
          <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        <div style={{ fontSize: '14px' }}>No orders in the book</div>
        <div style={{ fontSize: '12px', marginTop: '4px' }}>
          Place an order to get started
        </div>
      </div>
    );
  }

  return (
    <div style={{ fontSize: '13px' }}>
      {/* Header */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr 1fr',
        gap: '12px',
        padding: '8px 12px',
        borderBottom: '1px solid var(--border-primary, #2a2d36)',
        fontSize: '11px',
        fontWeight: '600',
        color: 'var(--text-secondary, #9ca3af)',
        textTransform: 'uppercase',
        letterSpacing: '0.5px'
      }}>
        <div>Price</div>
        <div style={{ textAlign: 'right' }}>Tokens</div>
        <div style={{ textAlign: 'right' }}>Total</div>
      </div>

      {/* Asks (Sell orders - shown in reverse order, lowest at bottom) */}
      <div style={{
        maxHeight: '200px',
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column-reverse'
      }}>
        {groupedAsks.slice(0, 10).reverse().map((level, index) => (
          <PriceLevel
            key={`ask-${level.price}-${index}`}
            level={level}
            side="sell"
            onClick={onPriceClick}
          />
        ))}
      </div>

      {/* Spread Indicator */}
      {spread && (
        <div style={{
          padding: '12px',
          background: 'var(--bg-tertiary, #1c1f26)',
          borderTop: '1px solid var(--border-primary, #2a2d36)',
          borderBottom: '1px solid var(--border-primary, #2a2d36)',
          textAlign: 'center'
        }}>
          <div style={{
            fontSize: '11px',
            color: 'var(--text-secondary, #9ca3af)',
            marginBottom: '4px'
          }}>
            Spread
          </div>
          <div style={{
            fontSize: '14px',
            fontWeight: '600',
            color: 'var(--text-primary, #f8f9fa)'
          }}>
            {formatCurrency(spread.value)} ({spread.percent.toFixed(2)}%)
          </div>
          <div style={{
            fontSize: '11px',
            color: 'var(--text-secondary, #9ca3af)',
            marginTop: '4px',
            display: 'flex',
            justifyContent: 'space-between'
          }}>
            <span style={{ color: 'var(--accent-green, #10b981)' }}>
              Bid: {formatCurrency(spread.bestBid)}
            </span>
            <span style={{ color: 'var(--accent-red, #ef4444)' }}>
              Ask: {formatCurrency(spread.bestAsk)}
            </span>
          </div>
        </div>
      )}

      {/* Bids (Buy orders) */}
      <div style={{
        maxHeight: '200px',
        overflowY: 'auto'
      }}>
        {groupedBids.slice(0, 10).map((level, index) => (
          <PriceLevel
            key={`bid-${level.price}-${index}`}
            level={level}
            side="buy"
            onClick={onPriceClick}
          />
        ))}
      </div>

      {/* Summary */}
      <div style={{
        padding: '12px',
        borderTop: '1px solid var(--border-primary, #2a2d36)',
        fontSize: '11px',
        color: 'var(--text-secondary, #9ca3af)',
        display: 'flex',
        justifyContent: 'space-between'
      }}>
        <span>
          <span style={{ color: 'var(--accent-green, #10b981)' }}>{bids.length}</span> Bids
        </span>
        <span>
          <span style={{ color: 'var(--accent-red, #ef4444)' }}>{asks.length}</span> Asks
        </span>
      </div>
    </div>
  );
};

export default OrderBook;
