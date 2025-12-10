import React, { useState, useMemo, useEffect } from 'react';
import { useTrading } from '../contexts/TradingContext';
import { useWallet } from '../contexts/WalletContext';
import { useInvestments } from '../contexts/InvestmentContext';

const OrderEntryForm = ({
  selectedProperty,
  currentMarketData,
  onOrderPlaced
}) => {
  const { placeOrder, getUserTokenLots } = useTrading();
  const { walletData } = useWallet();
  const { investments } = useInvestments();

  const [activeTab, setActiveTab] = useState('buy');
  const [orderType, setOrderType] = useState('market');
  const [priceInput, setPriceInput] = useState('');
  const [tokenAmount, setTokenAmount] = useState('');
  const [error, setError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // Constants
  const TRADING_FEE_RATE = 0.025; // 2.5% total
  const MIN_PRICE = 1.00;
  const MAX_PRICE = 10000.00;
  const MAX_PRICE_DEVIATION = 0.20; // ±20% from market price
  const MIN_TOKEN_AMOUNT = 1;

  // Reset form when property changes
  useEffect(() => {
    setPriceInput('');
    setTokenAmount('');
    setError('');
  }, [selectedProperty?.id]);

  // Get user's available tokens for selling
  const availableTokens = useMemo(() => {
    if (!selectedProperty) return 0;

    const userTokens = getUserTokenLots(selectedProperty.id);
    return userTokens.reduce((sum, lot) => sum + lot.availableTokens, 0);
  }, [selectedProperty, getUserTokenLots, investments]);

  // Calculate execution price
  const executionPrice = useMemo(() => {
    if (orderType === 'market') {
      // For market orders, use best available price
      if (activeTab === 'buy') {
        return currentMarketData?.bestAsk || currentMarketData?.currentPrice || selectedProperty?.tokenPrice || 0;
      } else {
        return currentMarketData?.bestBid || currentMarketData?.currentPrice || selectedProperty?.tokenPrice || 0;
      }
    } else {
      // For limit orders, use user-specified price
      return parseFloat(priceInput) || 0;
    }
  }, [orderType, activeTab, priceInput, currentMarketData, selectedProperty]);

  // Calculate total cost/proceeds
  const orderCalculation = useMemo(() => {
    const tokens = parseFloat(tokenAmount) || 0;
    if (tokens === 0 || executionPrice === 0) {
      return { subtotal: 0, fee: 0, total: 0 };
    }

    const subtotal = tokens * executionPrice;
    const fee = subtotal * (TRADING_FEE_RATE / 2); // 1.25% per side

    if (activeTab === 'buy') {
      // Buyer pays subtotal + fee
      return {
        subtotal,
        fee,
        total: subtotal + fee
      };
    } else {
      // Seller receives subtotal - fee
      return {
        subtotal,
        fee,
        total: subtotal - fee
      };
    }
  }, [tokenAmount, executionPrice, activeTab]);

  // Validation
  const validationError = useMemo(() => {
    if (!selectedProperty) return 'Please select a property';
    if (!tokenAmount || parseFloat(tokenAmount) < MIN_TOKEN_AMOUNT) {
      return `Minimum token amount is ${MIN_TOKEN_AMOUNT}`;
    }

    const tokens = parseFloat(tokenAmount);

    // Check for sell orders: sufficient tokens
    if (activeTab === 'sell' && tokens > availableTokens) {
      return `Insufficient tokens. Available: ${availableTokens}`;
    }

    // Check for buy orders: sufficient balance
    if (activeTab === 'buy' && orderCalculation.total > walletData.availableBalance) {
      return `Insufficient balance. Available: $${walletData.availableBalance.toFixed(2)}`;
    }

    // Price validation for limit orders
    if (orderType === 'limit') {
      const price = parseFloat(priceInput);

      if (!price || price < MIN_PRICE) {
        return `Minimum price is $${MIN_PRICE.toFixed(2)}`;
      }

      if (price > MAX_PRICE) {
        return `Maximum price is $${MAX_PRICE.toFixed(2)}`;
      }

      // Check price deviation from market price
      const marketPrice = currentMarketData?.currentPrice || selectedProperty?.tokenPrice || 0;
      if (marketPrice > 0) {
        const deviation = Math.abs(price - marketPrice) / marketPrice;
        if (deviation > MAX_PRICE_DEVIATION) {
          return `Price too far from market (±${(MAX_PRICE_DEVIATION * 100).toFixed(0)}% max)`;
        }
      }
    }

    // Check for market orders: sufficient liquidity
    if (orderType === 'market') {
      // This would check order book depth in a real implementation
      // For now, we'll allow it and let the matching engine handle it
    }

    return null;
  }, [
    selectedProperty,
    tokenAmount,
    activeTab,
    availableTokens,
    orderCalculation,
    walletData,
    orderType,
    priceInput,
    currentMarketData
  ]);

  const handlePlaceOrder = async () => {
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsProcessing(true);
    setError('');

    try {
      const orderData = {
        propertyId: selectedProperty.id,
        propertyName: selectedProperty.name,
        type: activeTab, // 'buy' or 'sell'
        orderType: orderType, // 'market' or 'limit'
        tokenAmount: parseFloat(tokenAmount),
        pricePerToken: orderType === 'limit' ? parseFloat(priceInput) : executionPrice
      };

      await placeOrder(orderData);

      // Reset form on success
      setTokenAmount('');
      setPriceInput('');
      setError('');

      // Notify parent component
      if (onOrderPlaced) {
        onOrderPlaced();
      }

    } catch (err) {
      setError(err.message || 'Failed to place order');
    } finally {
      setIsProcessing(false);
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

  if (!selectedProperty) {
    return (
      <div style={{
        textAlign: 'center',
        padding: '40px 20px',
        color: 'var(--text-secondary, #9ca3af)',
        fontSize: '14px'
      }}>
        Select a property to start trading
      </div>
    );
  }

  return (
    <div>
      {/* Buy/Sell Tabs */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '8px',
        marginBottom: '20px'
      }}>
        <button
          onClick={() => setActiveTab('buy')}
          style={{
            padding: '12px',
            background: activeTab === 'buy'
              ? 'var(--accent-green, #10b981)'
              : 'var(--bg-tertiary, #1c1f26)',
            border: 'none',
            borderRadius: '8px',
            color: 'white',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
        >
          Buy
        </button>
        <button
          onClick={() => setActiveTab('sell')}
          style={{
            padding: '12px',
            background: activeTab === 'sell'
              ? 'var(--accent-red, #ef4444)'
              : 'var(--bg-tertiary, #1c1f26)',
            border: 'none',
            borderRadius: '8px',
            color: 'white',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
        >
          Sell
        </button>
      </div>

      {/* Market/Limit Toggle */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '8px',
        marginBottom: '20px',
        background: 'var(--bg-tertiary, #1c1f26)',
        padding: '4px',
        borderRadius: '6px'
      }}>
        <button
          onClick={() => setOrderType('market')}
          style={{
            padding: '8px',
            background: orderType === 'market'
              ? 'var(--accent-blue, #3b82f6)'
              : 'transparent',
            border: 'none',
            borderRadius: '4px',
            color: 'var(--text-primary, #f8f9fa)',
            fontSize: '13px',
            fontWeight: '500',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
        >
          Market
        </button>
        <button
          onClick={() => setOrderType('limit')}
          style={{
            padding: '8px',
            background: orderType === 'limit'
              ? 'var(--accent-blue, #3b82f6)'
              : 'transparent',
            border: 'none',
            borderRadius: '4px',
            color: 'var(--text-primary, #f8f9fa)',
            fontSize: '13px',
            fontWeight: '500',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
        >
          Limit
        </button>
      </div>

      {/* Price Input (Limit Orders Only) */}
      {orderType === 'limit' && (
        <div style={{ marginBottom: '20px' }}>
          <label style={{
            display: 'block',
            fontSize: '12px',
            fontWeight: '500',
            color: 'var(--text-secondary, #9ca3af)',
            marginBottom: '8px'
          }}>
            Price per Token
          </label>
          <div style={{ position: 'relative' }}>
            <span style={{
              position: 'absolute',
              left: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--text-secondary, #9ca3af)',
              fontSize: '14px'
            }}>
              $
            </span>
            <input
              type="number"
              value={priceInput}
              onChange={(e) => setPriceInput(e.target.value)}
              placeholder={`Market: ${formatCurrency(currentMarketData?.currentPrice || selectedProperty.tokenPrice)}`}
              min={MIN_PRICE}
              max={MAX_PRICE}
              step="0.01"
              style={{
                width: '100%',
                padding: '10px 12px 10px 24px',
                background: 'var(--bg-tertiary, #1c1f26)',
                border: '1px solid var(--border-primary, #2a2d36)',
                borderRadius: '6px',
                color: 'var(--text-primary, #f8f9fa)',
                fontSize: '14px',
                outline: 'none'
              }}
            />
          </div>
          {currentMarketData?.currentPrice && (
            <div style={{
              fontSize: '11px',
              color: 'var(--text-secondary, #9ca3af)',
              marginTop: '4px'
            }}>
              Market price: {formatCurrency(currentMarketData.currentPrice)}
            </div>
          )}
        </div>
      )}

      {/* Token Amount Input */}
      <div style={{ marginBottom: '20px' }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '8px'
        }}>
          <label style={{
            fontSize: '12px',
            fontWeight: '500',
            color: 'var(--text-secondary, #9ca3af)'
          }}>
            Token Amount
          </label>
          {activeTab === 'sell' && (
            <span style={{
              fontSize: '11px',
              color: 'var(--text-secondary, #9ca3af)'
            }}>
              Available: {availableTokens}
            </span>
          )}
        </div>
        <div style={{
          display: 'flex',
          gap: '8px'
        }}>
          <button
            onClick={() => setTokenAmount(prev => Math.max(0, (parseFloat(prev) || 0) - 10).toString())}
            disabled={!tokenAmount || parseFloat(tokenAmount) <= 0}
            style={{
              padding: '10px 16px',
              background: 'var(--bg-tertiary, #1c1f26)',
              border: '1px solid var(--border-primary, #2a2d36)',
              borderRadius: '6px',
              color: 'var(--text-primary, #f8f9fa)',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer',
              opacity: (!tokenAmount || parseFloat(tokenAmount) <= 0) ? 0.5 : 1
            }}
          >
            −
          </button>
          <input
            type="number"
            value={tokenAmount}
            onChange={(e) => setTokenAmount(e.target.value)}
            placeholder="0"
            min={MIN_TOKEN_AMOUNT}
            step="1"
            style={{
              flex: 1,
              padding: '10px 12px',
              background: 'var(--bg-tertiary, #1c1f26)',
              border: '1px solid var(--border-primary, #2a2d36)',
              borderRadius: '6px',
              color: 'var(--text-primary, #f8f9fa)',
              fontSize: '14px',
              textAlign: 'center',
              outline: 'none'
            }}
          />
          <button
            onClick={() => setTokenAmount(prev => ((parseFloat(prev) || 0) + 10).toString())}
            style={{
              padding: '10px 16px',
              background: 'var(--bg-tertiary, #1c1f26)',
              border: '1px solid var(--border-primary, #2a2d36)',
              borderRadius: '6px',
              color: 'var(--text-primary, #f8f9fa)',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            +
          </button>
        </div>
        {activeTab === 'sell' && (
          <button
            onClick={() => setTokenAmount(availableTokens.toString())}
            style={{
              width: '100%',
              marginTop: '8px',
              padding: '6px',
              background: 'transparent',
              border: '1px solid var(--border-primary, #2a2d36)',
              borderRadius: '4px',
              color: 'var(--accent-blue, #3b82f6)',
              fontSize: '12px',
              fontWeight: '500',
              cursor: 'pointer'
            }}
          >
            Use Max ({availableTokens})
          </button>
        )}
      </div>

      {/* Order Summary */}
      {tokenAmount && parseFloat(tokenAmount) > 0 && (
        <div style={{
          background: 'var(--bg-tertiary, #1c1f26)',
          padding: '16px',
          borderRadius: '8px',
          marginBottom: '20px'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginBottom: '8px',
            fontSize: '13px'
          }}>
            <span style={{ color: 'var(--text-secondary, #9ca3af)' }}>
              {orderType === 'market' ? 'Est. Price' : 'Limit Price'}:
            </span>
            <span style={{
              color: 'var(--text-primary, #f8f9fa)',
              fontWeight: '500'
            }}>
              {formatCurrency(executionPrice)}
            </span>
          </div>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginBottom: '8px',
            fontSize: '13px'
          }}>
            <span style={{ color: 'var(--text-secondary, #9ca3af)' }}>Subtotal:</span>
            <span style={{ color: 'var(--text-primary, #f8f9fa)' }}>
              {formatCurrency(orderCalculation.subtotal)}
            </span>
          </div>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginBottom: '8px',
            fontSize: '13px'
          }}>
            <span style={{ color: 'var(--text-secondary, #9ca3af)' }}>
              Trading Fee (1.25%):
            </span>
            <span style={{ color: 'var(--text-primary, #f8f9fa)' }}>
              {formatCurrency(orderCalculation.fee)}
            </span>
          </div>
          <div style={{
            borderTop: '1px solid var(--border-primary, #2a2d36)',
            paddingTop: '8px',
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: '14px',
            fontWeight: '600'
          }}>
            <span style={{ color: 'var(--text-primary, #f8f9fa)' }}>
              {activeTab === 'buy' ? 'Total Cost:' : 'You Receive:'}
            </span>
            <span style={{
              color: activeTab === 'buy'
                ? 'var(--accent-green, #10b981)'
                : 'var(--accent-red, #ef4444)'
            }}>
              {formatCurrency(orderCalculation.total)}
            </span>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div style={{
          padding: '12px',
          background: 'rgba(239, 68, 68, 0.1)',
          border: '1px solid var(--accent-red, #ef4444)',
          borderRadius: '6px',
          color: 'var(--accent-red, #ef4444)',
          fontSize: '13px',
          marginBottom: '16px'
        }}>
          {error}
        </div>
      )}

      {/* Place Order Button */}
      <button
        onClick={handlePlaceOrder}
        disabled={isProcessing || !!validationError}
        style={{
          width: '100%',
          padding: '14px',
          background: validationError || isProcessing
            ? 'var(--bg-tertiary, #1c1f26)'
            : activeTab === 'buy'
              ? 'var(--accent-green, #10b981)'
              : 'var(--accent-red, #ef4444)',
          border: 'none',
          borderRadius: '8px',
          color: 'white',
          fontSize: '15px',
          fontWeight: '600',
          cursor: validationError || isProcessing ? 'not-allowed' : 'pointer',
          opacity: validationError || isProcessing ? 0.5 : 1,
          transition: 'all 0.2s ease'
        }}
      >
        {isProcessing
          ? 'Processing...'
          : `${activeTab === 'buy' ? 'Place Buy' : 'Place Sell'} ${orderType === 'market' ? 'Market' : 'Limit'} Order`
        }
      </button>

      {/* Additional Info */}
      <div style={{
        marginTop: '16px',
        padding: '12px',
        background: 'rgba(59, 130, 246, 0.1)',
        border: '1px solid rgba(59, 130, 246, 0.3)',
        borderRadius: '6px',
        fontSize: '11px',
        color: 'var(--text-secondary, #9ca3af)'
      }}>
        {orderType === 'market' ? (
          <>
            <strong style={{ color: 'var(--accent-blue, #3b82f6)' }}>Market Order:</strong> Executes immediately at the best available price. Price may vary slightly from estimate.
          </>
        ) : (
          <>
            <strong style={{ color: 'var(--accent-blue, #3b82f6)' }}>Limit Order:</strong> Only executes at your specified price or better. May not fill immediately.
          </>
        )}
      </div>
    </div>
  );
};

export default OrderEntryForm;
