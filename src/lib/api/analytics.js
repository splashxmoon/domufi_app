import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;
import { withTokenRefresh } from './tokenRefresh.js';






export const getUserActivity = async (userId, limit = 50) => {
  return withTokenRefresh(async () => {
    const { data, error } = await supabase
      .from('user_events')
      .select('*')
      .eq('user_id', userId)
      .order('timestamp', { ascending: false })
      .limit(limit);
    
    if (error) throw error;
    return data;
  });
};


export const getUserPropertyViews = async (userId, limit = 50) => {
  return withTokenRefresh(async () => {
    const { data, error } = await supabase
      .from('property_views')
      .select('*')
      .eq('user_id', userId)
      .order('timestamp', { ascending: false })
      .limit(limit);
    
    if (error) throw error;
    return data;
  });
};


export const getUserInvestments = async (userId, limit = 50) => {
  return withTokenRefresh(async () => {
    const { data, error } = await supabase
      .from('investment_events')
      .select('*')
      .eq('user_id', userId)
      .order('timestamp', { ascending: false })
      .limit(limit);
    
    if (error) throw error;
    return data;
  });
};


export const getUserPortfolioAnalytics = async (userId) => {
  return withTokenRefresh(async () => {
    
    const { data: investments, error: investmentError } = await supabase
      .from('investment_events')
      .select('investment_amount, token_amount')
      .eq('user_id', userId)
      .eq('event_type', 'complete_investment');
    
    if (investmentError) throw investmentError;
    
    
    const { data: portfolioEvents, error: portfolioError } = await supabase
      .from('portfolio_events')
      .select('*')
      .eq('user_id', userId)
      .order('timestamp', { ascending: false });
    
    if (portfolioError) throw portfolioError;
    
    
    const totalInvestmentAmount = investments?.reduce((sum, inv) => 
      sum + (parseFloat(inv.investment_amount) || 0), 0) || 0;
    
    const totalTokenAmount = investments?.reduce((sum, inv) => 
      sum + (parseFloat(inv.token_amount) || 0), 0) || 0;
    
    return {
      totalInvestmentAmount,
      totalTokenAmount,
      totalInvestments: investments?.length || 0,
      portfolioEvents,
      lastPortfolioView: portfolioEvents?.[0]?.timestamp || null
    };
  });
};


export const getUserBrowsingPatterns = async (userId) => {
  return withTokenRefresh(async () => {
    
    const { data: navigationEvents, error: navError } = await supabase
      .from('navigation_events')
      .select('*')
      .eq('user_id', userId)
      .order('timestamp', { ascending: false });
    
    if (navError) throw navError;
    
    
    const { data: propertyViews, error: propError } = await supabase
      .from('property_views')
      .select('*')
      .eq('user_id', userId)
      .order('timestamp', { ascending: false });
    
    if (propError) throw propError;
    
    
    const { data: marketplaceEvents, error: marketError } = await supabase
      .from('marketplace_events')
      .select('*')
      .eq('user_id', userId)
      .order('timestamp', { ascending: false });
    
    if (marketError) throw marketError;
    
    
    const pageViews = navigationEvents?.length || 0;
    const uniquePropertiesViewed = new Set(propertyViews?.map(p => p.property_id) || []).size;
    const searchesPerformed = marketplaceEvents?.filter(e => e.event_type === 'search_properties').length || 0;
    
    
    const propertyTypes = {};
    propertyViews?.forEach(view => {
      const propertyType = view.property_data?.type || 'unknown';
      propertyTypes[propertyType] = (propertyTypes[propertyType] || 0) + 1;
    });
    
    const favoritePropertyType = Object.keys(propertyTypes).reduce((a, b) => 
      propertyTypes[a] > propertyTypes[b] ? a : b, 'unknown');
    
    return {
      pageViews,
      uniquePropertiesViewed,
      searchesPerformed,
      favoritePropertyType,
      navigationEvents,
      propertyViews,
      marketplaceEvents
    };
  });
};


export const getUserSessions = async (userId, limit = 20) => {
  return withTokenRefresh(async () => {
    const { data, error } = await supabase
      .from('user_sessions')
      .select('*')
      .eq('user_id', userId)
      .order('started_at', { ascending: false })
      .limit(limit);
    
    if (error) throw error;
    return data;
  });
};


export const getUserAnalyticsSummary = async (userId) => {
  return withTokenRefresh(async () => {
    
    let { data: analytics, error: analyticsError } = await supabase
      .from('user_analytics')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (analyticsError && analyticsError.code !== 'PGRST116') {
      throw analyticsError;
    }
    
    
    if (!analytics) {
      const { data: newAnalytics, error: createError } = await supabase
        .from('user_analytics')
        .insert([{ user_id: userId }])
        .select()
        .single();
      
      if (createError) throw createError;
      analytics = newAnalytics;
    }
    
    
    const [activity, propertyViews, investments, portfolioAnalytics, browsingPatterns] = await Promise.all([
      getUserActivity(userId, 10),
      getUserPropertyViews(userId, 10),
      getUserInvestments(userId, 10),
      getUserPortfolioAnalytics(userId),
      getUserBrowsingPatterns(userId)
    ]);
    
    return {
      ...analytics,
      recentActivity: activity,
      recentPropertyViews: propertyViews,
      recentInvestments: investments,
      portfolioAnalytics,
      browsingPatterns,
      lastUpdated: new Date().toISOString()
    };
  });
};






export const getPlatformAnalytics = async () => {
  return withTokenRefresh(async () => {
    
    const { data: users, error: usersError } = await supabase
      .from('user_profiles')
      .select('id')
      .eq('created_at', 'gte', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()); 
    
    if (usersError) throw usersError;
    
    
    const { data: events, error: eventsError } = await supabase
      .from('user_events')
      .select('event_type, event_category')
      .eq('timestamp', 'gte', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());
    
    if (eventsError) throw eventsError;
    
    
    const { data: investments, error: investmentError } = await supabase
      .from('investment_events')
      .select('investment_amount')
      .eq('event_type', 'complete_investment')
      .eq('timestamp', 'gte', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());
    
    if (investmentError) throw investmentError;
    
    
    const totalInvestmentAmount = investments?.reduce((sum, inv) => 
      sum + (parseFloat(inv.investment_amount) || 0), 0) || 0;
    
    
    const eventTypeBreakdown = {};
    events?.forEach(event => {
      eventTypeBreakdown[event.event_type] = (eventTypeBreakdown[event.event_type] || 0) + 1;
    });
    
    return {
      totalUsers: users?.length || 0,
      totalEvents: events?.length || 0,
      totalInvestments: investments?.length || 0,
      totalInvestmentAmount,
      eventTypeBreakdown,
      period: 'last_30_days'
    };
  });
};





export const analyticsAPI = {
  
  getUserActivity,
  getUserPropertyViews,
  getUserInvestments,
  getUserPortfolioAnalytics,
  getUserBrowsingPatterns,
  getUserSessions,
  getUserAnalyticsSummary,
  
  
  getPlatformAnalytics
};
