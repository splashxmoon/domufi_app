import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useInvestments } from './InvestmentContext';
import { useWallet } from './WalletContext';

const TradingContext = createContext();

export const useTrading = () => {
  const context = useContext(TradingContext);
  if (!context) {
    throw new Error('useTrading must be used within TradingProvider');
  }
  return context;
};

// Helper Functions
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

const generateOrderId = () => {
  return `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

const generateFillId = () => {
  return `fill_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// Constants
const TRADING_FEE_RATE = 0.025; // 2.5% total
const BUYER_FEE_RATE = 0.0125; // 1.25%
const SELLER_FEE_RATE = 0.0125; // 1.25%
const MIN_PRICE = 1.00;
const MAX_PRICE = 10000.00;
const MAX_PRICE_DEVIATION = 0.20; // ±20%
const MIN_TOKEN_AMOUNT = 1;
const MAX_TOKEN_AMOUNT = 10000;
const ORDER_EXPIRY_DAYS = 30;

// Demo Data Generation
const generateInitialPriceHistory = (propertyId, tokenPrice) => {
  const history = [];
  const now = Date.now();
  const thirtyDaysAgo = now - (30 * 24 * 60 * 60 * 1000);

  let currentPrice = tokenPrice;
  // Real estate volatility - low but visible
  const volatility = 0.008; // 0.8% hourly volatility (visible on charts, still realistic)
  const trend = 0.0003; // 0.03% upward trend per hour (about 2% monthly)

  // Use property ID as seed for consistent but varied history
  let seed = propertyId * 12345;
  const seededRandom = () => {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };

  for (let t = thirtyDaysAgo; t <= now; t += 60 * 60 * 1000) {
    // Real estate has gradual price movements with occasional flat periods
    const shouldChange = seededRandom() > 0.3; // 70% chance of price movement
    const randomChange = shouldChange ? (seededRandom() - 0.5) * 2 * volatility : 0;
    currentPrice = currentPrice * (1 + randomChange + trend);

    // Keep prices within realistic range (±8% over 30 days)
    const clampedPrice = Math.max(
      tokenPrice * 0.92,
      Math.min(tokenPrice * 1.08, currentPrice)
    );

    history.push({
      timestamp: t,
      price: parseFloat(clampedPrice.toFixed(2)),
      volume: Math.floor(seededRandom() * 30) + 5, // Lower volume for real estate
      high: parseFloat((clampedPrice * 1.002).toFixed(2)), // Smaller intraday range
      low: parseFloat((clampedPrice * 0.998).toFixed(2)),
      open: parseFloat((clampedPrice * 0.999).toFixed(2)),
      close: parseFloat(clampedPrice.toFixed(2))
    });
  }

  return history;
};

const generateInitialOrders = (propertyId, propertyName, currentPrice) => {
  const orders = [];
  const numOrders = Math.floor(Math.random() * 5) + 3; // 3-7 orders

  for (let i = 0; i < numOrders; i++) {
    const isBuyOrder = Math.random() > 0.5;
    const priceDeviation = (Math.random() * 0.1 - 0.05); // ±5%
    const price = parseFloat((currentPrice * (1 + priceDeviation)).toFixed(2));
    const tokenAmount = Math.floor(Math.random() * 100) + 10;

    orders.push({
      id: `demo_order_${propertyId}_${i}_${Date.now()}`,
      userId: `demo_user_${i}`,
      propertyId,
      propertyName,
      type: isBuyOrder ? 'buy' : 'sell',
      orderType: 'limit',
      tokenAmount,
      pricePerToken: price,
      totalValue: price * tokenAmount,
      status: 'pending',
      filledTokens: 0,
      remainingTokens: tokenAmount,
      createdAt: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + ORDER_EXPIRY_DAYS * 24 * 60 * 60 * 1000).toISOString(),
      fills: []
    });
  }

  return orders;
};

export const TradingProvider = ({ children }) => {
  const { investments, addInvestment, transactions } = useInvestments();
  const { walletData, deductFromWallet } = useWallet();

  const [currentUserId, setCurrentUserId] = useState(getCurrentUserId());

  // Global trading state
  const [allOrders, setAllOrders] = useState(() => {
    const saved = localStorage.getItem('allOrders');
    return saved ? JSON.parse(saved) : [];
  });

  const [allTrades, setAllTrades] = useState(() => {
    const saved = localStorage.getItem('allTrades');
    return saved ? JSON.parse(saved) : [];
  });

  const [marketData, setMarketData] = useState(() => {
    const saved = localStorage.getItem('marketData');
    return saved ? JSON.parse(saved) : {};
  });

  const [priceHistory, setPriceHistory] = useState(() => {
    const saved = localStorage.getItem('priceHistory');
    return saved ? JSON.parse(saved) : {};
  });

  // User-specific state
  const [userOrders, setUserOrders] = useState([]);
  const [userTrades, setUserTrades] = useState([]);

  // Persist to localStorage
  useEffect(() => {
    localStorage.setItem('allOrders', JSON.stringify(allOrders));
  }, [allOrders]);

  useEffect(() => {
    localStorage.setItem('allTrades', JSON.stringify(allTrades));
  }, [allTrades]);

  useEffect(() => {
    localStorage.setItem('marketData', JSON.stringify(marketData));
  }, [marketData]);

  useEffect(() => {
    localStorage.setItem('priceHistory', JSON.stringify(priceHistory));
  }, [priceHistory]);

  // Update user-specific state when userId changes
  useEffect(() => {
    const userId = getCurrentUserId();
    if (userId !== currentUserId) {
      setCurrentUserId(userId);
    }

    if (userId) {
      setUserOrders(allOrders.filter(o => o.userId === userId));
      setUserTrades(allTrades.filter(t => t.buyerId === userId || t.sellerId === userId));
    } else {
      setUserOrders([]);
      setUserTrades([]);
    }
  }, [currentUserId, allOrders, allTrades]);

  // Initialize market data for properties
  const initializeMarketData = useCallback((propertyId, propertyName, tokenPrice) => {
    if (!marketData[propertyId]) {
      // Generate price history first
      const history = generateInitialPriceHistory(propertyId, tokenPrice);
      const now = Date.now();
      const oneDayAgo = now - (24 * 60 * 60 * 1000);
      const sevenDaysAgo = now - (7 * 24 * 60 * 60 * 1000);

      // Get current price (last in history)
      const currentPrice = history.length > 0 ? history[history.length - 1].price : tokenPrice;

      // Calculate 24h data
      const history24h = history.filter(p => p.timestamp >= oneDayAgo);
      const openPrice24h = history24h.length > 0 ? history24h[0].price : currentPrice;
      const priceChange24h = currentPrice - openPrice24h;
      const priceChangePercent24h = openPrice24h !== 0 ? (priceChange24h / openPrice24h) * 100 : 0;

      // Calculate 7d data
      const history7d = history.filter(p => p.timestamp >= sevenDaysAgo);
      const openPrice7d = history7d.length > 0 ? history7d[0].price : currentPrice;
      const priceChange7d = currentPrice - openPrice7d;
      const priceChangePercent7d = openPrice7d !== 0 ? (priceChange7d / openPrice7d) * 100 : 0;

      // Calculate high/low for periods
      const highPrice24h = history24h.length > 0
        ? Math.max(...history24h.map(p => p.high))
        : currentPrice;
      const lowPrice24h = history24h.length > 0
        ? Math.min(...history24h.map(p => p.low))
        : currentPrice;
      const highPrice7d = history7d.length > 0
        ? Math.max(...history7d.map(p => p.high))
        : currentPrice;
      const lowPrice7d = history7d.length > 0
        ? Math.min(...history7d.map(p => p.low))
        : currentPrice;

      const newMarketData = {
        propertyId,
        propertyName,
        currentPrice,
        // 24h data
        openPrice24h,
        highPrice24h,
        lowPrice24h,
        volume24h: 0,
        volumeUSD24h: 0,
        priceChange24h,
        priceChangePercent24h,
        trades24h: 0,
        // 7d data
        openPrice7d,
        highPrice7d,
        lowPrice7d,
        volume7d: 0,
        volumeUSD7d: 0,
        priceChange7d,
        priceChangePercent7d,
        trades7d: 0,
        // Order book data
        bestBid: null,
        bestAsk: null,
        spread: 0,
        spreadPercent: 0,
        lastUpdated: new Date().toISOString()
      };

      setMarketData(prev => ({ ...prev, [propertyId]: newMarketData }));
      setPriceHistory(prev => ({
        ...prev,
        [propertyId]: history
      }));

      // Add some demo orders
      const demoOrders = generateInitialOrders(propertyId, propertyName, currentPrice);
      setAllOrders(prev => [...prev, ...demoOrders]);
    }
  }, [marketData]);

  // Get order book for a property
  const getOrderBook = useCallback((propertyId) => {
    const propertyOrders = allOrders.filter(
      o => o.propertyId === propertyId && o.status === 'pending'
    );

    const bids = propertyOrders
      .filter(o => o.type === 'buy')
      .sort((a, b) => {
        // Sort by price desc, then time asc
        if (b.pricePerToken !== a.pricePerToken) {
          return b.pricePerToken - a.pricePerToken;
        }
        return new Date(a.createdAt) - new Date(b.createdAt);
      });

    const asks = propertyOrders
      .filter(o => o.type === 'sell')
      .sort((a, b) => {
        // Sort by price asc, then time asc
        if (a.pricePerToken !== b.pricePerToken) {
          return a.pricePerToken - b.pricePerToken;
        }
        return new Date(a.createdAt) - new Date(b.createdAt);
      });

    return { bids, asks };
  }, [allOrders]);

  // Get user's available tokens for a property
  const getUserTokenLots = useCallback((propertyId) => {
    const userId = getCurrentUserId();
    if (!userId) return [];

    const userInvestments = investments.filter(
      inv => inv.propertyId === propertyId && inv.status === 'active'
    );

    return userInvestments.map(inv => {
      const isUnlocked = new Date() >= new Date(inv.unlockDate);
      const lockedInOrders = userOrders
        .filter(o => o.propertyId === propertyId && o.type === 'sell' && o.status === 'pending')
        .reduce((sum, o) => sum + o.remainingTokens, 0);

      return {
        id: inv.id,
        userId,
        propertyId: inv.propertyId,
        propertyName: inv.propertyName,
        tokenAmount: inv.tokenAmount,
        availableTokens: isUnlocked ? Math.max(0, inv.tokenAmount - lockedInOrders) : 0,
        lockedTokens: isUnlocked ? lockedInOrders : inv.tokenAmount,
        purchaseDate: inv.purchaseDate,
        unlockDate: inv.unlockDate,
        isUnlocked,
        averageCostBasis: inv.tokenPrice,
        source: inv.source || 'primary'
      };
    });
  }, [investments, userOrders]);

  // Validate order
  const validateOrder = useCallback((orderData) => {
    const errors = [];

    // Price validation
    if (orderData.orderType === 'limit') {
      if (!orderData.pricePerToken || orderData.pricePerToken < MIN_PRICE) {
        errors.push(`Price must be at least $${MIN_PRICE}`);
      }
      if (orderData.pricePerToken > MAX_PRICE) {
        errors.push(`Price must not exceed $${MAX_PRICE}`);
      }

      // Check price deviation from market
      const market = marketData[orderData.propertyId];
      if (market && market.currentPrice) {
        const deviation = Math.abs(orderData.pricePerToken - market.currentPrice) / market.currentPrice;
        if (deviation > MAX_PRICE_DEVIATION) {
          errors.push(`Price too far from market (±${MAX_PRICE_DEVIATION * 100}% max)`);
        }
      }
    }

    // Amount validation
    if (orderData.tokenAmount < MIN_TOKEN_AMOUNT) {
      errors.push(`Minimum ${MIN_TOKEN_AMOUNT} token${MIN_TOKEN_AMOUNT > 1 ? 's' : ''}`);
    }
    if (orderData.tokenAmount > MAX_TOKEN_AMOUNT) {
      errors.push(`Maximum ${MAX_TOKEN_AMOUNT} tokens per order`);
    }

    // Buy order: check balance
    if (orderData.type === 'buy') {
      const totalCost = orderData.totalValue * (1 + BUYER_FEE_RATE);
      if (walletData.availableBalance < totalCost) {
        errors.push('Insufficient wallet balance');
      }
    }

    // Sell order: check available tokens
    if (orderData.type === 'sell') {
      const tokenLots = getUserTokenLots(orderData.propertyId);
      const totalAvailable = tokenLots.reduce((sum, lot) => sum + lot.availableTokens, 0);

      if (totalAvailable < orderData.tokenAmount) {
        errors.push('Not enough unlocked tokens available');
      }

      const anyLocked = tokenLots.some(lot => !lot.isUnlocked);
      if (anyLocked && totalAvailable === 0) {
        errors.push('Tokens still in 30-day lock period');
      }
    }

    return errors;
  }, [marketData, walletData, getUserTokenLots]);

  // Update market data after trade
  const updateMarketData = useCallback((propertyId, fill) => {
    setMarketData(prev => {
      const current = prev[propertyId] || {};
      const now = new Date().toISOString();
      const oneDayAgo = Date.now() - (24 * 60 * 60 * 1000);
      const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);

      // Calculate 24h stats from recent trades
      const recentTrades24h = allTrades.filter(
        t => t.propertyId === propertyId && new Date(t.executedAt) >= new Date(oneDayAgo)
      );
      recentTrades24h.push(fill); // Include current fill

      const volume24h = recentTrades24h.reduce((sum, t) => sum + t.tokenAmount, 0);
      const volumeUSD24h = recentTrades24h.reduce((sum, t) => sum + t.totalValue, 0);
      const trades24h = recentTrades24h.length;

      // Calculate 7d stats from recent trades
      const recentTrades7d = allTrades.filter(
        t => t.propertyId === propertyId && new Date(t.executedAt) >= new Date(sevenDaysAgo)
      );
      recentTrades7d.push(fill); // Include current fill

      const volume7d = recentTrades7d.reduce((sum, t) => sum + t.tokenAmount, 0);
      const volumeUSD7d = recentTrades7d.reduce((sum, t) => sum + t.totalValue, 0);
      const trades7d = recentTrades7d.length;

      // Get current order book
      const { bids, asks } = getOrderBook(propertyId);
      const bestBid = bids.length > 0 ? bids[0].pricePerToken : null;
      const bestAsk = asks.length > 0 ? asks[0].pricePerToken : null;
      const spread = bestBid && bestAsk ? bestAsk - bestBid : 0;
      const spreadPercent = bestAsk ? (spread / bestAsk) * 100 : 0;

      // Calculate price changes
      const openPrice24h = current.openPrice24h || fill.pricePerToken;
      const priceChange24h = fill.pricePerToken - openPrice24h;
      const priceChangePercent24h = openPrice24h ? (priceChange24h / openPrice24h) * 100 : 0;

      const openPrice7d = current.openPrice7d || fill.pricePerToken;
      const priceChange7d = fill.pricePerToken - openPrice7d;
      const priceChangePercent7d = openPrice7d ? (priceChange7d / openPrice7d) * 100 : 0;

      return {
        ...prev,
        [propertyId]: {
          ...current,
          propertyId,
          currentPrice: fill.pricePerToken,
          // 24h data
          highPrice24h: Math.max(current.highPrice24h || 0, fill.pricePerToken),
          lowPrice24h: Math.min(current.lowPrice24h || Infinity, fill.pricePerToken),
          volume24h,
          volumeUSD24h,
          priceChange24h,
          priceChangePercent24h,
          trades24h,
          // 7d data
          highPrice7d: Math.max(current.highPrice7d || 0, fill.pricePerToken),
          lowPrice7d: Math.min(current.lowPrice7d || Infinity, fill.pricePerToken),
          volume7d,
          volumeUSD7d,
          priceChange7d,
          priceChangePercent7d,
          trades7d,
          // Order book data
          bestBid,
          bestAsk,
          spread,
          spreadPercent,
          lastUpdated: now
        }
      };
    });

    // Add to price history
    setPriceHistory(prev => {
      const history = prev[propertyId] || [];
      history.push({
        timestamp: Date.now(),
        price: fill.pricePerToken,
        volume: fill.tokenAmount,
        high: fill.pricePerToken,
        low: fill.pricePerToken,
        open: fill.pricePerToken,
        close: fill.pricePerToken
      });

      // Keep last 30 days only
      const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
      const filtered = history.filter(p => p.timestamp >= thirtyDaysAgo);

      return {
        ...prev,
        [propertyId]: filtered
      };
    });
  }, [allTrades, getOrderBook]);

  // Settle trade (transfer tokens and funds)
  const settleTrade = useCallback((fill, incomingOrderType) => {
    try {
      // For sell orders: reduce tokens from seller's investments
      if (fill.sellerId === getCurrentUserId()) {
        const sellerInvestments = investments.filter(
          inv => inv.propertyId === fill.propertyId && inv.status === 'active'
        );

        let tokensToTransfer = fill.tokenAmount;
        for (const inv of sellerInvestments) {
          if (tokensToTransfer <= 0) break;

          const transferFromThis = Math.min(inv.tokenAmount, tokensToTransfer);
          // This would call a method to reduce tokens
          // For now, we'll note this needs implementation in InvestmentContext
          tokensToTransfer -= transferFromThis;
        }

        // Credit seller's wallet (minus fee)
        const netProceeds = fill.totalValue - fill.sellerFee;
        // This would call walletContext.creditTradeProceeds(netProceeds, ...)
      }

      // For buy orders: create new investment for buyer
      if (fill.buyerId === getCurrentUserId()) {
        // Add tokens to buyer's investments
        const newInvestment = {
          property: {
            id: fill.propertyId,
            name: fill.propertyName,
            tokenPrice: fill.pricePerToken,
            annualROI: 8.5, // Would need to fetch from property data
            monthlyRent: 0,
            city: 'Unknown'
          },
          tokenAmount: fill.tokenAmount,
          total: fill.totalValue + fill.buyerFee,
          paymentMethod: { name: 'Wallet' },
          source: 'secondary'
        };

        // This would call investmentContext.addSecondaryInvestment(...)
      }

      // Record trade
      setAllTrades(prev => [...prev, fill]);

      // Update market data
      updateMarketData(fill.propertyId, fill);

      return true;
    } catch (error) {
      console.error('Error settling trade:', error);
      return false;
    }
  }, [investments, updateMarketData]);

  // Match order (price-time priority)
  const matchOrder = useCallback((incomingOrder) => {
    const fills = [];
    let remainingTokens = incomingOrder.remainingTokens;

    // Get opposite side of order book
    const { bids, asks } = getOrderBook(incomingOrder.propertyId);
    const counterOrders = incomingOrder.type === 'buy' ? asks : bids;

    // Filter out own orders
    const matchableOrders = counterOrders.filter(
      o => o.userId !== incomingOrder.userId && o.status === 'pending'
    );

    for (const counterOrder of matchableOrders) {
      if (remainingTokens <= 0) break;

      // Check price compatibility for limit orders
      if (incomingOrder.orderType === 'limit') {
        if (incomingOrder.type === 'buy' && counterOrder.pricePerToken > incomingOrder.pricePerToken) {
          continue;
        }
        if (incomingOrder.type === 'sell' && counterOrder.pricePerToken < incomingOrder.pricePerToken) {
          continue;
        }
      }

      // Calculate match
      const matchQuantity = Math.min(remainingTokens, counterOrder.remainingTokens);
      const executionPrice = counterOrder.pricePerToken;
      const totalValue = matchQuantity * executionPrice;

      // Create fill
      const fill = {
        id: generateFillId(),
        buyOrderId: incomingOrder.type === 'buy' ? incomingOrder.id : counterOrder.id,
        sellOrderId: incomingOrder.type === 'sell' ? incomingOrder.id : counterOrder.id,
        buyerId: incomingOrder.type === 'buy' ? incomingOrder.userId : counterOrder.userId,
        sellerId: incomingOrder.type === 'sell' ? incomingOrder.userId : counterOrder.userId,
        propertyId: incomingOrder.propertyId,
        propertyName: incomingOrder.propertyName,
        tokenAmount: matchQuantity,
        pricePerToken: executionPrice,
        totalValue: totalValue,
        tradingFee: totalValue * TRADING_FEE_RATE,
        buyerFee: totalValue * BUYER_FEE_RATE,
        sellerFee: totalValue * SELLER_FEE_RATE,
        executedAt: new Date().toISOString(),
        status: 'completed'
      };

      fills.push(fill);

      // Settle trade
      settleTrade(fill, incomingOrder.orderType);

      // Update orders
      setAllOrders(prev => prev.map(o => {
        if (o.id === incomingOrder.id) {
          const newFilledTokens = o.filledTokens + matchQuantity;
          const newRemainingTokens = o.remainingTokens - matchQuantity;
          return {
            ...o,
            filledTokens: newFilledTokens,
            remainingTokens: newRemainingTokens,
            status: newRemainingTokens === 0 ? 'filled' : 'partial',
            fills: [...o.fills, fill],
            updatedAt: new Date().toISOString()
          };
        }
        if (o.id === counterOrder.id) {
          const newFilledTokens = o.filledTokens + matchQuantity;
          const newRemainingTokens = o.remainingTokens - matchQuantity;
          return {
            ...o,
            filledTokens: newFilledTokens,
            remainingTokens: newRemainingTokens,
            status: newRemainingTokens === 0 ? 'filled' : 'partial',
            fills: [...o.fills, fill],
            updatedAt: new Date().toISOString()
          };
        }
        return o;
      }));

      remainingTokens -= matchQuantity;
    }

    return fills;
  }, [getOrderBook, settleTrade]);

  // Place order
  const placeOrder = useCallback((orderData) => {
    const userId = getCurrentUserId();
    if (!userId) {
      throw new Error('User not authenticated');
    }

    // Validate
    const errors = validateOrder(orderData);
    if (errors.length > 0) {
      throw new Error(errors[0]);
    }

    // Calculate total value
    const pricePerToken = orderData.orderType === 'market'
      ? (orderData.type === 'buy'
          ? getOrderBook(orderData.propertyId).asks[0]?.pricePerToken
          : getOrderBook(orderData.propertyId).bids[0]?.pricePerToken)
      : orderData.pricePerToken;

    if (!pricePerToken && orderData.orderType === 'market') {
      throw new Error('Insufficient liquidity for market order');
    }

    const totalValue = orderData.tokenAmount * pricePerToken;

    // Create order
    const order = {
      id: generateOrderId(),
      userId,
      propertyId: orderData.propertyId,
      propertyName: orderData.propertyName,
      type: orderData.type,
      orderType: orderData.orderType,
      tokenAmount: orderData.tokenAmount,
      pricePerToken: orderData.orderType === 'limit' ? pricePerToken : null,
      totalValue,
      status: 'pending',
      filledTokens: 0,
      remainingTokens: orderData.tokenAmount,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + ORDER_EXPIRY_DAYS * 24 * 60 * 60 * 1000).toISOString(),
      fills: []
    };

    // Deduct from wallet for buy orders
    if (order.type === 'buy') {
      const totalCost = totalValue * (1 + BUYER_FEE_RATE);
      deductFromWallet(totalCost, `Buy order for ${orderData.tokenAmount} tokens of ${orderData.propertyName}`);
    }

    // Add to orders
    setAllOrders(prev => [...prev, order]);

    // Try to match
    const fills = matchOrder(order);

    return { order, fills };
  }, [validateOrder, getOrderBook, matchOrder, deductFromWallet]);

  // Cancel order
  const cancelOrder = useCallback((orderId) => {
    const order = allOrders.find(o => o.id === orderId);
    if (!order) {
      throw new Error('Order not found');
    }

    if (order.userId !== getCurrentUserId()) {
      throw new Error('Cannot cancel another user\'s order');
    }

    if (order.status !== 'pending' && order.status !== 'partial') {
      throw new Error('Order cannot be cancelled');
    }

    // Refund remaining tokens/balance
    if (order.type === 'buy' && order.remainingTokens > 0) {
      const refundAmount = (order.remainingTokens * (order.pricePerToken || 0)) * (1 + BUYER_FEE_RATE);
      // Would call walletContext method to refund
    }

    // Update order status
    setAllOrders(prev => prev.map(o =>
      o.id === orderId
        ? { ...o, status: 'cancelled', updatedAt: new Date().toISOString() }
        : o
    ));

    return true;
  }, [allOrders]);

  const value = {
    // State
    allOrders,
    userOrders,
    allTrades,
    userTrades,
    marketData,
    priceHistory,

    // Methods
    placeOrder,
    cancelOrder,
    getOrderBook,
    getUserTokenLots,
    initializeMarketData,

    // Constants
    TRADING_FEE_RATE,
    BUYER_FEE_RATE,
    SELLER_FEE_RATE
  };

  return (
    <TradingContext.Provider value={value}>
      {children}
    </TradingContext.Provider>
  );
};
