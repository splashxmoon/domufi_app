import React from 'react';

const RecentTrades = ({ trades = [], maxTrades = 20 }) => {
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;

    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatNumber = (value) => {
    return new Intl.NumberFormat('en-US').format(value);
  };

  // Sort trades by most recent first
  const sortedTrades = [...trades]
    .sort((a, b) => new Date(b.executedAt) - new Date(a.executedAt))
    .slice(0, maxTrades);

  // Empty state
  if (trades.length === 0) {
    return (
      <div style={{
        textAlign: 'center',
        padding: '40px 20px',
        color: 'var(--text-secondary, #9ca3af)'
      }}>
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" style={{ margin: '0 auto 12px' }}>
          <path d="M17 8L21 12M21 12L17 16M21 12H9M7 16L3 12M3 12L7 8M3 12H15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        <div style={{ fontSize: '14px' }}>No recent trades</div>
        <div style={{ fontSize: '12px', marginTop: '4px' }}>
          Trade history will appear here
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '80px 1fr 1fr 100px',
        gap: '12px',
        padding: '8px 12px',
        borderBottom: '1px solid var(--border-primary, #2a2d36)',
        fontSize: '11px',
        fontWeight: '600',
        color: 'var(--text-secondary, #9ca3af)',
        textTransform: 'uppercase',
        letterSpacing: '0.5px'
      }}>
        <div>Time</div>
        <div style={{ textAlign: 'right' }}>Price</div>
        <div style={{ textAlign: 'right' }}>Tokens</div>
        <div style={{ textAlign: 'right' }}>Total</div>
      </div>

      {/* Trades List */}
      <div style={{
        maxHeight: '300px',
        overflowY: 'auto'
      }}>
        {sortedTrades.map((trade, index) => {
          // Determine if this was a buy or sell based on price movement
          // (In a real app, this would be explicitly marked)
          const isBuy = index < sortedTrades.length - 1
            ? trade.pricePerToken >= sortedTrades[index + 1].pricePerToken
            : true;

          return (
            <div
              key={trade.id}
              style={{
                display: 'grid',
                gridTemplateColumns: '80px 1fr 1fr 100px',
                gap: '12px',
                padding: '8px 12px',
                fontSize: '13px',
                fontFamily: 'monospace',
                borderBottom: index < sortedTrades.length - 1
                  ? '1px solid rgba(42, 45, 54, 0.3)'
                  : 'none',
                transition: 'background 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(59, 130, 246, 0.05)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
              }}
            >
              {/* Time */}
              <div style={{
                fontSize: '11px',
                color: 'var(--text-secondary, #9ca3af)'
              }}>
                {formatTime(trade.executedAt)}
              </div>

              {/* Price */}
              <div style={{
                textAlign: 'right',
                fontWeight: '600',
                color: isBuy
                  ? 'var(--accent-green, #10b981)'
                  : 'var(--accent-red, #ef4444)'
              }}>
                {formatCurrency(trade.pricePerToken)}
              </div>

              {/* Tokens */}
              <div style={{
                textAlign: 'right',
                color: 'var(--text-primary, #f8f9fa)'
              }}>
                {formatNumber(trade.tokenAmount)}
              </div>

              {/* Total Value */}
              <div style={{
                textAlign: 'right',
                color: 'var(--text-secondary, #9ca3af)',
                fontSize: '12px'
              }}>
                {formatCurrency(trade.totalValue)}
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary */}
      {sortedTrades.length > 0 && (
        <div style={{
          padding: '12px',
          borderTop: '1px solid var(--border-primary, #2a2d36)',
          fontSize: '11px',
          color: 'var(--text-secondary, #9ca3af)',
          textAlign: 'center'
        }}>
          Showing {sortedTrades.length} of {trades.length} recent trades
        </div>
      )}
    </div>
  );
};

export default RecentTrades;
