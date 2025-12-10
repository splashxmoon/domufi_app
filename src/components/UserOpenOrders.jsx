import React, { useState } from 'react';
import { useTrading } from '../contexts/TradingContext';

const UserOpenOrders = ({ selectedProperty }) => {
  const { userOrders, cancelOrder } = useTrading();
  const [cancellingOrderId, setCancellingOrderId] = useState(null);

  // Filter orders for selected property and active status
  const activeOrders = selectedProperty
    ? userOrders.filter(
        order =>
          order.propertyId === selectedProperty.id &&
          (order.status === 'pending' || order.status === 'partial')
      )
    : [];

  const handleCancelOrder = async (orderId) => {
    setCancellingOrderId(orderId);
    try {
      await cancelOrder(orderId);
    } catch (error) {
      console.error('Failed to cancel order:', error);
      alert('Failed to cancel order: ' + error.message);
    } finally {
      setCancellingOrderId(null);
    }
  };

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

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;

    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Empty state
  if (!selectedProperty) {
    return (
      <div style={{
        textAlign: 'center',
        padding: '40px 20px',
        color: 'var(--text-secondary, #9ca3af)',
        fontSize: '14px'
      }}>
        Select a property to view your orders
      </div>
    );
  }

  if (activeOrders.length === 0) {
    return (
      <div style={{
        textAlign: 'center',
        padding: '40px 20px',
        color: 'var(--text-secondary, #9ca3af)'
      }}>
        <svg
          width="40"
          height="40"
          viewBox="0 0 24 24"
          fill="none"
          style={{ margin: '0 auto 12px' }}
        >
          <path
            d="M9 5H7C5.89543 5 5 5.89543 5 7V19C5 20.1046 5.89543 21 7 21H17C18.1046 21 19 20.1046 19 19V7C19 5.89543 18.1046 5 17 5H15M9 5C9 6.10457 9.89543 7 11 7H13C14.1046 7 15 6.10457 15 5M9 5C9 3.89543 9.89543 3 11 3H13C14.1046 3 15 3.89543 15 5"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <div style={{ fontSize: '14px' }}>No open orders</div>
        <div style={{ fontSize: '12px', marginTop: '4px' }}>
          Your active orders will appear here
        </div>
      </div>
    );
  }

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '12px'
    }}>
      {activeOrders.map((order) => {
        const isBuy = order.type === 'buy';
        const fillPercentage = ((order.tokenAmount - order.remainingTokens) / order.tokenAmount) * 100;
        const isPartiallyFilled = order.status === 'partial';

        return (
          <div
            key={order.id}
            style={{
              background: 'var(--bg-tertiary, #1c1f26)',
              border: '1px solid var(--border-primary, #2a2d36)',
              borderRadius: '8px',
              padding: '12px',
              position: 'relative',
              transition: 'border-color 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = isBuy
                ? 'var(--accent-green, #10b981)'
                : 'var(--accent-red, #ef4444)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--border-primary, #2a2d36)';
            }}
          >
            {/* Order Header */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '8px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span
                  style={{
                    display: 'inline-block',
                    padding: '2px 8px',
                    background: isBuy
                      ? 'rgba(16, 185, 129, 0.1)'
                      : 'rgba(239, 68, 68, 0.1)',
                    border: `1px solid ${
                      isBuy ? 'var(--accent-green, #10b981)' : 'var(--accent-red, #ef4444)'
                    }`,
                    borderRadius: '4px',
                    color: isBuy
                      ? 'var(--accent-green, #10b981)'
                      : 'var(--accent-red, #ef4444)',
                    fontSize: '11px',
                    fontWeight: '600',
                    textTransform: 'uppercase'
                  }}
                >
                  {order.type}
                </span>
                <span
                  style={{
                    display: 'inline-block',
                    padding: '2px 8px',
                    background: 'rgba(59, 130, 246, 0.1)',
                    border: '1px solid var(--accent-blue, #3b82f6)',
                    borderRadius: '4px',
                    color: 'var(--accent-blue, #3b82f6)',
                    fontSize: '11px',
                    fontWeight: '600',
                    textTransform: 'uppercase'
                  }}
                >
                  {order.orderType}
                </span>
                {isPartiallyFilled && (
                  <span
                    style={{
                      display: 'inline-block',
                      padding: '2px 8px',
                      background: 'rgba(251, 146, 60, 0.1)',
                      border: '1px solid #fb923c',
                      borderRadius: '4px',
                      color: '#fb923c',
                      fontSize: '11px',
                      fontWeight: '600',
                      textTransform: 'uppercase'
                    }}
                  >
                    Partial
                  </span>
                )}
              </div>
              <button
                onClick={() => handleCancelOrder(order.id)}
                disabled={cancellingOrderId === order.id}
                style={{
                  padding: '4px 8px',
                  background: 'transparent',
                  border: '1px solid var(--border-primary, #2a2d36)',
                  borderRadius: '4px',
                  color: 'var(--accent-red, #ef4444)',
                  fontSize: '11px',
                  fontWeight: '600',
                  cursor: cancellingOrderId === order.id ? 'not-allowed' : 'pointer',
                  opacity: cancellingOrderId === order.id ? 0.5 : 1,
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  if (cancellingOrderId !== order.id) {
                    e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)';
                    e.currentTarget.style.borderColor = 'var(--accent-red, #ef4444)';
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.borderColor = 'var(--border-primary, #2a2d36)';
                }}
              >
                {cancellingOrderId === order.id ? 'Cancelling...' : 'Cancel'}
              </button>
            </div>

            {/* Order Details */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '8px',
              marginBottom: '8px',
              fontSize: '13px'
            }}>
              <div>
                <div style={{
                  color: 'var(--text-secondary, #9ca3af)',
                  fontSize: '11px',
                  marginBottom: '2px'
                }}>
                  Price
                </div>
                <div style={{
                  color: 'var(--text-primary, #f8f9fa)',
                  fontWeight: '600',
                  fontFamily: 'monospace'
                }}>
                  {formatCurrency(order.pricePerToken)}
                </div>
              </div>
              <div>
                <div style={{
                  color: 'var(--text-secondary, #9ca3af)',
                  fontSize: '11px',
                  marginBottom: '2px'
                }}>
                  {isPartiallyFilled ? 'Remaining' : 'Amount'}
                </div>
                <div style={{
                  color: 'var(--text-primary, #f8f9fa)',
                  fontWeight: '600',
                  fontFamily: 'monospace'
                }}>
                  {formatNumber(order.remainingTokens)} tokens
                </div>
              </div>
            </div>

            {/* Partially Filled Progress Bar */}
            {isPartiallyFilled && (
              <div style={{ marginBottom: '8px' }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: '11px',
                  color: 'var(--text-secondary, #9ca3af)',
                  marginBottom: '4px'
                }}>
                  <span>Filled: {fillPercentage.toFixed(0)}%</span>
                  <span>
                    {formatNumber(order.tokenAmount - order.remainingTokens)} / {formatNumber(order.tokenAmount)}
                  </span>
                </div>
                <div style={{
                  width: '100%',
                  height: '4px',
                  background: 'var(--bg-primary, #0d0e11)',
                  borderRadius: '2px',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    width: `${fillPercentage}%`,
                    height: '100%',
                    background: isBuy
                      ? 'var(--accent-green, #10b981)'
                      : 'var(--accent-red, #ef4444)',
                    transition: 'width 0.3s ease'
                  }} />
                </div>
              </div>
            )}

            {/* Total Value */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              paddingTop: '8px',
              borderTop: '1px solid var(--border-primary, #2a2d36)',
              fontSize: '12px'
            }}>
              <span style={{ color: 'var(--text-secondary, #9ca3af)' }}>
                Total Value:
              </span>
              <span style={{
                color: 'var(--text-primary, #f8f9fa)',
                fontWeight: '600',
                fontFamily: 'monospace'
              }}>
                {formatCurrency(order.remainingTokens * order.pricePerToken)}
              </span>
            </div>

            {/* Created Date */}
            <div style={{
              marginTop: '8px',
              fontSize: '11px',
              color: 'var(--text-secondary, #9ca3af)',
              textAlign: 'right'
            }}>
              Created {formatDate(order.createdAt)}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default UserOpenOrders;
