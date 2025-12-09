



import { supabase } from '../supabaseClient';





export const paymentAPI = {
  
  createPaymentIntent: async (amount, currency = 'usd', metadata = {}) => {
    try {
      const response = await fetch('/api/payments/stripe/create-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: Math.round(amount * 100), 
          currency,
          metadata
        })
      });

      if (!response.ok) {
        throw new Error('Failed to create payment intent');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error creating payment intent:', error);
      throw error;
    }
  },

  
  confirmPayment: async (paymentIntentId, investmentData) => {
    try {
      const response = await fetch('/api/payments/stripe/confirm', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          paymentIntentId,
          investmentData
        })
      });

      if (!response.ok) {
        throw new Error('Failed to confirm payment');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error confirming payment:', error);
      throw error;
    }
  },

  
  getPaymentMethods: async (userId) => {
    try {
      const { data, error } = await supabase
        .from('user_wallets')
        .select('stripe_customer_id')
        .eq('user_id', userId)
        .single();

      if (error) throw error;

      if (!data.stripe_customer_id) {
        return [];
      }

      const response = await fetch('/api/payments/stripe/methods', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customerId: data.stripe_customer_id
        })
      });

      if (!response.ok) {
        throw new Error('Failed to get payment methods');
      }

      const methods = await response.json();
      return methods;
    } catch (error) {
      console.error('Error getting payment methods:', error);
      throw error;
    }
  },

  
  addPaymentMethod: async (userId, paymentMethodId) => {
    try {
      const response = await fetch('/api/payments/stripe/add-method', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          paymentMethodId
        })
      });

      if (!response.ok) {
        throw new Error('Failed to add payment method');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error adding payment method:', error);
      throw error;
    }
  }
};





export const investmentTransactionAPI = {
  
  processInvestment: async (userId, propertyId, investmentAmount, paymentMethodId) => {
    try {
      
      const { data: property, error: propertyError } = await supabase
        .from('demo_properties')
        .select('*')
        .eq('id', propertyId)
        .single();

      if (propertyError) throw propertyError;

      
      const tokensPurchased = Math.floor(investmentAmount / property.token_price);
      const ownershipPercentage = (tokensPurchased / property.total_tokens) * 100;

      
      const paymentIntent = await paymentAPI.createPaymentIntent(
        investmentAmount,
        'usd',
        {
          userId,
          propertyId,
          tokensPurchased: tokensPurchased.toString(),
          ownershipPercentage: ownershipPercentage.toString()
        }
      );

      return {
        paymentIntent,
        investmentDetails: {
          propertyId,
          investmentAmount,
          tokensPurchased,
          ownershipPercentage,
          property
        }
      };
    } catch (error) {
      console.error('Error processing investment:', error);
      throw error;
    }
  },

  
  completeInvestment: async (userId, investmentData, paymentIntentId) => {
    try {
      const { propertyId, investmentAmount, tokensPurchased, ownershipPercentage } = investmentData;

      
      const { data: investment, error: investmentError } = await supabase
        .from('user_investments')
        .insert({
          user_id: userId,
          property_id: propertyId,
          investment_amount: investmentAmount,
          tokens_purchased: tokensPurchased,
          token_price: investmentData.property.token_price,
          status: 'active'
        })
        .select()
        .single();

      if (investmentError) throw investmentError;

      
      const { error: transactionError } = await supabase
        .from('investment_transactions')
        .insert({
          user_id: userId,
          property_id: propertyId,
          investment_id: investment.id,
          transaction_type: 'purchase',
          amount: investmentAmount,
          tokens: tokensPurchased,
          token_price: investmentData.property.token_price,
          payment_method: 'stripe',
          payment_status: 'completed',
          stripe_payment_intent_id: paymentIntentId,
          net_amount: investmentAmount,
          description: `Investment in ${investmentData.property.property_name}`,
          transaction_date: new Date().toISOString()
        });

      if (transactionError) throw transactionError;

      
      const { error: walletError } = await supabase
        .from('user_wallets')
        .update({
          available_balance: supabase.raw('available_balance - ?', [investmentAmount]),
          invested_balance: supabase.raw('invested_balance + ?', [investmentAmount])
        })
        .eq('user_id', userId);

      if (walletError) throw walletError;

      
      const newFundingProgress = (tokensPurchased / investmentData.property.total_tokens) * 100;
      const { error: propertyError } = await supabase
        .from('demo_properties')
        .update({
          funding_progress: supabase.raw('funding_progress + ?', [newFundingProgress])
        })
        .eq('id', propertyId);

      if (propertyError) throw propertyError;

      return investment;
    } catch (error) {
      console.error('Error completing investment:', error);
      throw error;
    }
  },

  
  processSale: async (userId, investmentId, saleAmount) => {
    try {
      
      const { data: investment, error: investmentError } = await supabase
        .from('user_investments')
        .select('*')
        .eq('id', investmentId)
        .eq('user_id', userId)
        .single();

      if (investmentError) throw investmentError;

      
      const { error: updateError } = await supabase
        .from('user_investments')
        .update({
          status: 'sold',
          updated_at: new Date().toISOString()
        })
        .eq('id', investmentId);

      if (updateError) throw updateError;

      
      const { error: transactionError } = await supabase
        .from('investment_transactions')
        .insert({
          user_id: userId,
          property_id: investment.property_id,
          investment_id: investmentId,
          transaction_type: 'sale',
          amount: saleAmount,
          tokens: -investment.tokens_purchased,
          token_price: saleAmount / investment.tokens_purchased,
          payment_method: 'stripe',
          payment_status: 'completed',
          net_amount: saleAmount,
          description: `Sale of investment in property ${investment.property_id}`,
          transaction_date: new Date().toISOString()
        });

      if (transactionError) throw transactionError;

      
      const { error: walletError } = await supabase
        .from('user_wallets')
        .update({
          available_balance: supabase.raw('available_balance + ?', [saleAmount]),
          invested_balance: supabase.raw('invested_balance - ?', [investment.investment_amount]),
          total_earnings: supabase.raw('total_earnings + ?', [saleAmount - investment.investment_amount])
        })
        .eq('user_id', userId);

      if (walletError) throw walletError;

      return { success: true, saleAmount };
    } catch (error) {
      console.error('Error processing sale:', error);
      throw error;
    }
  }
};





export const walletAPI = {
  
  fundWallet: async (userId, amount, paymentMethodId) => {
    try {
      
      const paymentIntent = await paymentAPI.createPaymentIntent(
        amount,
        'usd',
        {
          userId,
          type: 'wallet_funding'
        }
      );

      return paymentIntent;
    } catch (error) {
      console.error('Error funding wallet:', error);
      throw error;
    }
  },

  
  completeWalletFunding: async (userId, amount, paymentIntentId) => {
    try {
      
      const { error: walletError } = await supabase
        .from('user_wallets')
        .update({
          available_balance: supabase.raw('available_balance + ?', [amount])
        })
        .eq('user_id', userId);

      if (walletError) throw walletError;

      
      const { error: transactionError } = await supabase
        .from('investment_transactions')
        .insert({
          user_id: userId,
          transaction_type: 'wallet_funding',
          amount: amount,
          payment_method: 'stripe',
          payment_status: 'completed',
          stripe_payment_intent_id: paymentIntentId,
          net_amount: amount,
          description: 'Wallet funding',
          transaction_date: new Date().toISOString()
        });

      if (transactionError) throw transactionError;

      return { success: true, newBalance: amount };
    } catch (error) {
      console.error('Error completing wallet funding:', error);
      throw error;
    }
  },

  
  withdrawFromWallet: async (userId, amount, bankAccountId) => {
    try {
      
      const { data: wallet, error: walletError } = await supabase
        .from('user_wallets')
        .select('available_balance')
        .eq('user_id', userId)
        .single();

      if (walletError) throw walletError;

      if (wallet.available_balance < amount) {
        throw new Error('Insufficient balance');
      }

      
      const { error: transactionError } = await supabase
        .from('investment_transactions')
        .insert({
          user_id: userId,
          transaction_type: 'withdrawal',
          amount: -amount,
          payment_method: 'bank_transfer',
          payment_status: 'pending',
          net_amount: -amount,
          description: 'Wallet withdrawal',
          transaction_date: new Date().toISOString()
        });

      if (transactionError) throw transactionError;

      
      const { error: updateError } = await supabase
        .from('user_wallets')
        .update({
          available_balance: supabase.raw('available_balance - ?', [amount]),
          pending_balance: supabase.raw('pending_balance + ?', [amount])
        })
        .eq('user_id', userId);

      if (updateError) throw updateError;

      return { success: true, message: 'Withdrawal request submitted' };
    } catch (error) {
      console.error('Error withdrawing from wallet:', error);
      throw error;
    }
  }
};





export const plaidAPI = {
  
  createLinkToken: async (userId) => {
    try {
      const response = await fetch('/api/payments/plaid/create-link-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId })
      });

      if (!response.ok) {
        throw new Error('Failed to create link token');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error creating link token:', error);
      throw error;
    }
  },

  
  exchangePublicToken: async (publicToken, userId) => {
    try {
      const response = await fetch('/api/payments/plaid/exchange-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          publicToken,
          userId
        })
      });

      if (!response.ok) {
        throw new Error('Failed to exchange token');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error exchanging token:', error);
      throw error;
    }
  },

  
  getBankAccounts: async (userId) => {
    try {
      const response = await fetch('/api/payments/plaid/accounts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId })
      });

      if (!response.ok) {
        throw new Error('Failed to get bank accounts');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error getting bank accounts:', error);
      throw error;
    }
  }
};





export default {
  paymentAPI,
  investmentTransactionAPI,
  walletAPI,
  plaidAPI
};

