



import { supabase } from '../../supabaseClient';





export const userAPI = {
  
  getProfile: async (userId) => {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (error) throw error;
    return data;
  },

  
  updateProfile: async (userId, profileData) => {
    const { data, error } = await supabase
      .from('user_profiles')
      .update({
        ...profileData,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  
  getWallet: async (userId) => {
    const { data, error } = await supabase
      .from('user_wallets')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (error && error.code !== 'PGRST116') {
      
      const { data: newWallet, error: createError } = await supabase
        .from('user_wallets')
        .insert({
          user_id: userId,
          available_balance: 0,
          invested_balance: 0,
          pending_balance: 0,
          total_earnings: 0
        })
        .select()
        .single();
      
      if (createError) throw createError;
      return newWallet;
    }
    
    return data;
  },

  
  updateWallet: async (userId, walletData) => {
    const { data, error } = await supabase
      .from('user_wallets')
      .update({
        ...walletData,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }
};





export const propertyAPI = {
  
  getProperties: async (filters = {}) => {
    let query = supabase
      .from('demo_properties')
      .select(`
        *,
        property_images(*),
        property_documents(*)
      `)
      .eq('is_active', true);

    
    if (filters.property_type) {
      query = query.eq('property_type', filters.property_type);
    }
    if (filters.city) {
      query = query.eq('city', filters.city);
    }
    if (filters.state) {
      query = query.eq('state', filters.state);
    }
    if (filters.min_price) {
      query = query.gte('current_value', filters.min_price);
    }
    if (filters.max_price) {
      query = query.lte('current_value', filters.max_price);
    }
    if (filters.risk_level) {
      query = query.eq('risk_level', filters.risk_level);
    }
    if (filters.status) {
      query = query.eq('status', filters.status);
    }

    
    if (filters.sort_by) {
      const sortOrder = filters.sort_order || 'asc';
      query = query.order(filters.sort_by, { ascending: sortOrder === 'asc' });
    } else {
      query = query.order('created_at', { ascending: false });
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  
  getProperty: async (propertyId) => {
    const { data, error } = await supabase
      .from('demo_properties')
      .select(`
        *,
        property_images(*),
        property_documents(*)
      `)
      .eq('id', propertyId)
      .single();
    
    if (error) throw error;
    return data;
  },

  
  searchProperties: async (searchCriteria) => {
    let query = supabase
      .from('demo_properties')
      .select(`
        *,
        property_images(*)
      `)
      .eq('is_active', true);

    
    if (searchCriteria.query) {
      query = query.or(`property_name.ilike.%${searchCriteria.query}%,address.ilike.%${searchCriteria.query}%,city.ilike.%${searchCriteria.query}%`);
    }

    
    Object.entries(searchCriteria.filters || {}).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        if (key === 'price_range') {
          if (value.min) query = query.gte('current_value', value.min);
          if (value.max) query = query.lte('current_value', value.max);
        } else if (key === 'property_types' && Array.isArray(value)) {
          query = query.in('property_type', value);
        } else if (key === 'cities' && Array.isArray(value)) {
          query = query.in('city', value);
        } else if (key === 'risk_levels' && Array.isArray(value)) {
          query = query.in('risk_level', value);
        } else {
          query = query.eq(key, value);
        }
      }
    });

    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  
  getFavoriteProperties: async (userId) => {
    const { data, error } = await supabase
      .from('user_favorites')
      .select(`
        *,
        demo_properties(
          *,
          property_images(*)
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data.map(fav => fav.demo_properties);
  },

  
  addToFavorites: async (userId, propertyId) => {
    const { data, error } = await supabase
      .from('user_favorites')
      .insert({
        user_id: userId,
        property_id: propertyId
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  
  removeFromFavorites: async (userId, propertyId) => {
    const { error } = await supabase
      .from('user_favorites')
      .delete()
      .eq('user_id', userId)
      .eq('property_id', propertyId);
    
    if (error) throw error;
    return true;
  }
};





export const investmentAPI = {
  
  getUserInvestments: async (userId) => {
    const { data, error } = await supabase
      .from('user_investments')
      .select(`
        *,
        demo_properties(
          *,
          property_images(*)
        )
      `)
      .eq('user_id', userId)
      .eq('status', 'active')
      .order('investment_date', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  
  createInvestment: async (investmentData) => {
    const { data, error } = await supabase
      .from('user_investments')
      .insert(investmentData)
      .select(`
        *,
        demo_properties(
          *,
          property_images(*)
        )
      `)
      .single();
    
    if (error) throw error;
    return data;
  },

  
  updateInvestment: async (investmentId, updateData) => {
    const { data, error } = await supabase
      .from('user_investments')
      .update({
        ...updateData,
        updated_at: new Date().toISOString()
      })
      .eq('id', investmentId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  
  getInvestmentTransactions: async (userId, filters = {}) => {
    let query = supabase
      .from('investment_transactions')
      .select(`
        *,
        demo_properties(
          property_name,
          property_images(*)
        )
      `)
      .eq('user_id', userId);

    if (filters.transaction_type) {
      query = query.eq('transaction_type', filters.transaction_type);
    }
    if (filters.date_from) {
      query = query.gte('transaction_date', filters.date_from);
    }
    if (filters.date_to) {
      query = query.lte('transaction_date', filters.date_to);
    }

    query = query.order('transaction_date', { ascending: false });

    const { data, error } = await query;
    if (error) throw error;
    return data;
  }
};





export const portfolioAPI = {
  
  getPortfolioOverview: async (userId) => {
    
    const investments = await investmentAPI.getUserInvestments(userId);
    
    
    const totalInvested = investments.reduce((sum, inv) => sum + parseFloat(inv.investment_amount), 0);
    const totalValue = investments.reduce((sum, inv) => {
      const property = inv.demo_properties;
      const currentValue = (inv.investment_amount / property.purchase_price) * property.current_value;
      return sum + currentValue;
    }, 0);
    const totalReturn = totalValue - totalInvested;
    const totalReturnPercentage = totalInvested > 0 ? (totalReturn / totalInvested) * 100 : 0;
    
    const monthlyIncome = investments.reduce((sum, inv) => {
      const property = inv.demo_properties;
      const incomeShare = (inv.investment_amount / property.purchase_price) * property.monthly_rent;
      return sum + incomeShare;
    }, 0);

    return {
      totalValue,
      totalInvested,
      totalReturn,
      totalReturnPercentage,
      monthlyIncome,
      propertyCount: investments.length,
      investments
    };
  },

  
  getPortfolioPerformance: async (userId, period = '1Y') => {
    const { data, error } = await supabase
      .from('portfolio_performance')
      .select('*')
      .eq('user_id', userId)
      .order('performance_date', { ascending: true });
    
    if (error) throw error;
    return data;
  },

  
  getPortfolioAnalytics: async (userId) => {
    const investments = await investmentAPI.getUserInvestments(userId);
    
    
    const propertyTypes = {};
    const locations = {};
    let totalValue = 0;

    investments.forEach(inv => {
      const property = inv.demo_properties;
      const value = (inv.investment_amount / property.purchase_price) * property.current_value;
      
      propertyTypes[property.property_type] = (propertyTypes[property.property_type] || 0) + value;
      locations[`${property.city}, ${property.state}`] = (locations[`${property.city}, ${property.state}`] || 0) + value;
      totalValue += value;
    });

    
    const typeDiversification = Object.keys(propertyTypes).length / 3; 
    const locationDiversification = Object.keys(locations).length / 5; 

    return {
      diversification: {
        propertyTypes: Object.entries(propertyTypes).map(([type, value]) => ({
          type,
          value,
          percentage: (value / totalValue) * 100
        })),
        locations: Object.entries(locations).map(([location, value]) => ({
          location,
          value,
          percentage: (value / totalValue) * 100
        }))
      },
      riskAssessment: {
        typeDiversification: Math.min(typeDiversification * 100, 100),
        locationDiversification: Math.min(locationDiversification * 100, 100),
        overallRisk: investments.reduce((sum, inv) => {
          const riskScore = inv.demo_properties.risk_level === 'low' ? 1 : 
                           inv.demo_properties.risk_level === 'medium' ? 2 : 3;
          return sum + riskScore;
        }, 0) / investments.length
      }
    };
  }
};





export const marketAPI = {
  
  getMarketTrends: async (city, state) => {
    const { data, error } = await supabase
      .from('market_data')
      .select('*')
      .eq('city', city)
      .eq('state', state)
      .order('data_date', { ascending: false })
      .limit(12); 
    
    if (error) throw error;
    return data;
  },

  
  getPropertyMarketData: async (propertyId) => {
    const property = await propertyAPI.getProperty(propertyId);
    const marketData = await marketAPI.getMarketTrends(property.city, property.state);
    
    return {
      property,
      marketTrends: marketData,
      comparableProperties: await propertyAPI.searchProperties({
        filters: {
          city: property.city,
          state: property.state,
          property_type: property.property_type,
          min_price: property.current_value * 0.8,
          max_price: property.current_value * 1.2
        }
      })
    };
  }
};





export const calculationAPI = {
  
  calculateROI: async (propertyId, investmentAmount) => {
    const property = await propertyAPI.getProperty(propertyId);
    
    const tokensPurchased = Math.floor(investmentAmount / property.token_price);
    const ownershipPercentage = (tokensPurchased / property.total_tokens) * 100;
    const monthlyIncome = (ownershipPercentage / 100) * property.monthly_rent;
    const annualIncome = monthlyIncome * 12;
    const capRate = (annualIncome / investmentAmount) * 100;
    
    return {
      tokensPurchased,
      ownershipPercentage,
      monthlyIncome,
      annualIncome,
      capRate,
      projectedReturn: {
        year1: annualIncome,
        year5: annualIncome * 5,
        year10: annualIncome * 10
      }
    };
  },

  
  calculatePortfolioRisk: async (userId) => {
    const investments = await investmentAPI.getUserInvestments(userId);
    
    if (investments.length === 0) return { riskScore: 0, riskLevel: 'low' };
    
    const riskScores = investments.map(inv => {
      const property = inv.demo_properties;
      let score = 0;
      
      
      if (property.property_type === 'commercial') score += 2;
      else if (property.property_type === 'residential') score += 1;
      
      
      if (property.market_trend === 'declining') score += 3;
      else if (property.market_trend === 'stable') score += 1;
      
      
      if (property.risk_level === 'high') score += 3;
      else if (property.risk_level === 'medium') score += 2;
      else score += 1;
      
      return score;
    });
    
    const averageRisk = riskScores.reduce((sum, score) => sum + score, 0) / riskScores.length;
    const riskLevel = averageRisk >= 3 ? 'high' : averageRisk >= 2 ? 'medium' : 'low';
    
    return {
      riskScore: averageRisk,
      riskLevel,
      diversificationScore: investments.length / 5 * 100 
    };
  }
};





export const realtimeAPI = {
  
  subscribeToPortfolio: (userId, callback) => {
    return supabase
      .channel('portfolio-updates')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'user_investments', 
          filter: `user_id=eq.${userId}` 
        },
        callback
      )
      .subscribe();
  },

  
  subscribeToProperty: (propertyId, callback) => {
    return supabase
      .channel('property-updates')
      .on('postgres_changes',
        { 
          event: '*', 
          schema: 'public', 
          table: 'demo_properties', 
          filter: `id=eq.${propertyId}` 
        },
        callback
      )
      .subscribe();
  },

  
  subscribeToWallet: (userId, callback) => {
    return supabase
      .channel('wallet-updates')
      .on('postgres_changes',
        { 
          event: '*', 
          schema: 'public', 
          table: 'user_wallets', 
          filter: `user_id=eq.${userId}` 
        },
        callback
      )
      .subscribe();
  }
};





export default {
  userAPI,
  propertyAPI,
  investmentAPI,
  portfolioAPI,
  marketAPI,
  calculationAPI,
  realtimeAPI
};
