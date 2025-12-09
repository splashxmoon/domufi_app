import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;


const getSessionId = () => {
  let sessionId = sessionStorage.getItem('analytics_session_id');
  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    sessionStorage.setItem('analytics_session_id', sessionId);
  }
  return sessionId;
};


const getLocationInfo = async () => {
  try {
    const response = await fetch('https:
    const data = await response.json();
    return {
      ip: data.ip,
      city: data.city,
      region: data.region,
      country: data.country,
      timezone: data.timezone
    };
  } catch (error) {
    console.error('Failed to get location info:', error);
    return {};
  }
};


const trackEvent = async (eventType, eventCategory, eventData = {}, options = {}) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return; 

    const sessionId = getSessionId();
    const locationInfo = await getLocationInfo();
    
    const event = {
      user_id: user.id,
      event_type: eventType,
      event_category: eventCategory,
      event_data: {
        ...eventData,
        timestamp: new Date().toISOString(),
        url: window.location.href,
        referrer: document.referrer,
        ...options
      },
      session_id: sessionId,
      ip_address: locationInfo.ip,
      user_agent: navigator.userAgent,
      referrer: document.referrer
    };

    const { error } = await supabase
      .from('user_events')
      .insert([event]);

    if (error) {
      console.error('Failed to track event:', error);
    }
  } catch (error) {
    console.error('Event tracking error:', error);
  }
};





export const trackPropertyView = async (propertyId, propertyData = {}) => {
  await trackEvent('property_view', 'property_interaction', {
    property_id: propertyId,
    property_data: propertyData,
    view_timestamp: new Date().toISOString()
  });
  
  
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase
        .from('property_views')
        .insert([{
          user_id: user.id,
          property_id: propertyId,
          property_data: propertyData,
          timestamp: new Date().toISOString()
        }]);
    }
  } catch (error) {
    console.error('Property view tracking error:', error);
  }
};

export const trackPropertyInteraction = async (propertyId, interactionType, interactionData = {}) => {
  await trackEvent('property_interaction', 'property_interaction', {
    property_id: propertyId,
    interaction_type: interactionType,
    interaction_data: interactionData
  });
};

export const trackPropertySearch = async (searchQuery, filters = {}, resultsCount = 0) => {
  await trackEvent('property_search', 'marketplace_interaction', {
    search_query: searchQuery,
    filters: filters,
    results_count: resultsCount
  });
  
  
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase
        .from('marketplace_events')
        .insert([{
          user_id: user.id,
          event_type: 'search_properties',
          search_query: searchQuery,
          filter_criteria: filters,
          results_count: resultsCount,
          timestamp: new Date().toISOString()
        }]);
    }
  } catch (error) {
    console.error('Marketplace event tracking error:', error);
  }
};





export const trackInvestmentView = async (propertyId, investmentData = {}) => {
  await trackEvent('investment_view', 'investment_interaction', {
    property_id: propertyId,
    investment_data: investmentData
  });
  
  
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase
        .from('investment_events')
        .insert([{
          user_id: user.id,
          property_id: propertyId,
          event_type: 'view_investment',
          investment_data: investmentData,
          timestamp: new Date().toISOString()
        }]);
    }
  } catch (error) {
    console.error('Investment view tracking error:', error);
  }
};

export const trackInvestmentCalculation = async (propertyId, investmentAmount, tokenAmount, calculationData = {}) => {
  await trackEvent('investment_calculation', 'investment_interaction', {
    property_id: propertyId,
    investment_amount: investmentAmount,
    token_amount: tokenAmount,
    calculation_data: calculationData
  });
  
  
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase
        .from('investment_events')
        .insert([{
          user_id: user.id,
          property_id: propertyId,
          event_type: 'calculate_investment',
          investment_amount: investmentAmount,
          token_amount: tokenAmount,
          investment_data: calculationData,
          timestamp: new Date().toISOString()
        }]);
    }
  } catch (error) {
    console.error('Investment calculation tracking error:', error);
  }
};

export const trackInvestmentInitiation = async (propertyId, investmentAmount, tokenAmount, transactionData = {}) => {
  await trackEvent('investment_initiation', 'investment_interaction', {
    property_id: propertyId,
    investment_amount: investmentAmount,
    token_amount: tokenAmount,
    transaction_data: transactionData
  });
  
  
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase
        .from('investment_events')
        .insert([{
          user_id: user.id,
          property_id: propertyId,
          event_type: 'initiate_investment',
          investment_amount: investmentAmount,
          token_amount: tokenAmount,
          investment_data: transactionData,
          status: 'pending',
          timestamp: new Date().toISOString()
        }]);
    }
  } catch (error) {
    console.error('Investment initiation tracking error:', error);
  }
};

export const trackInvestmentCompletion = async (propertyId, investmentAmount, tokenAmount, transactionId, completionData = {}) => {
  await trackEvent('investment_completion', 'investment_interaction', {
    property_id: propertyId,
    investment_amount: investmentAmount,
    token_amount: tokenAmount,
    transaction_id: transactionId,
    completion_data: completionData
  });
  
  
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase
        .from('investment_events')
        .insert([{
          user_id: user.id,
          property_id: propertyId,
          event_type: 'complete_investment',
          investment_amount: investmentAmount,
          token_amount: tokenAmount,
          transaction_id: transactionId,
          investment_data: completionData,
          status: 'completed',
          timestamp: new Date().toISOString()
        }]);
    }
  } catch (error) {
    console.error('Investment completion tracking error:', error);
  }
};





export const trackPortfolioView = async (portfolioData = {}) => {
  await trackEvent('portfolio_view', 'portfolio_interaction', {
    portfolio_data: portfolioData
  });
  
  
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase
        .from('portfolio_events')
        .insert([{
          user_id: user.id,
          event_type: 'view_portfolio',
          timestamp: new Date().toISOString()
        }]);
    }
  } catch (error) {
    console.error('Portfolio view tracking error:', error);
  }
};

export const trackPortfolioFilter = async (filterCriteria = {}) => {
  await trackEvent('portfolio_filter', 'portfolio_interaction', {
    filter_criteria: filterCriteria
  });
  
  
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase
        .from('portfolio_events')
        .insert([{
          user_id: user.id,
          event_type: 'filter_portfolio',
          filter_criteria: filterCriteria,
          timestamp: new Date().toISOString()
        }]);
    }
  } catch (error) {
    console.error('Portfolio filter tracking error:', error);
  }
};





export const trackPageView = async (pageData = {}) => {
  const previousPage = sessionStorage.getItem('previous_page');
  const currentPage = window.location.href;
  
  await trackEvent('page_view', 'navigation', {
    page_url: currentPage,
    page_title: document.title,
    previous_page: previousPage,
    navigation_data: pageData
  });
  
  
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase
        .from('navigation_events')
        .insert([{
          user_id: user.id,
          page_url: currentPage,
          page_title: document.title,
          previous_page: previousPage,
          timestamp: new Date().toISOString()
        }]);
    }
  } catch (error) {
    console.error('Navigation tracking error:', error);
  }
  
  
  sessionStorage.setItem('previous_page', currentPage);
};





export const trackUserAction = async (actionType, actionData = {}) => {
  await trackEvent('user_action', 'user_behavior', {
    action_type: actionType,
    action_data: actionData
  });
};

export const trackFeatureUsage = async (featureName, usageData = {}) => {
  await trackEvent('feature_usage', 'user_behavior', {
    feature_name: featureName,
    usage_data: usageData
  });
};

export const trackError = async (errorType, errorMessage, errorContext = {}) => {
  await trackEvent('error_occurred', 'system_event', {
    error_type: errorType,
    error_message: errorMessage,
    error_context: errorContext
  });
};





export const trackSessionStart = async () => {
  const sessionId = getSessionId();
  const locationInfo = await getLocationInfo();
  
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase
        .from('user_sessions')
        .insert([{
          user_id: user.id,
          session_id: sessionId,
          ip_address: locationInfo.ip,
          user_agent: navigator.userAgent,
          device_info: {
            device_type: /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ? 'mobile' : 'desktop',
            browser: navigator.userAgent.includes('Chrome') ? 'Chrome' : 'Other',
            screen_resolution: `${window.screen.width}x${window.screen.height}`
          },
          location_info: locationInfo,
          started_at: new Date().toISOString()
        }]);
    }
  } catch (error) {
    console.error('Session start tracking error:', error);
  }
};

export const trackSessionEnd = async () => {
  const sessionId = getSessionId();
  
  try {
    await supabase
      .from('user_sessions')
      .update({
        ended_at: new Date().toISOString(),
        is_active: false
      })
      .eq('session_id', sessionId);
  } catch (error) {
    console.error('Session end tracking error:', error);
  }
};






export const initializeTracking = () => {
  
  trackSessionStart();
  
  
  trackPageView();
  
  
  window.addEventListener('beforeunload', trackSessionEnd);
  
  
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      trackEvent('page_hidden', 'user_behavior');
    } else {
      trackEvent('page_visible', 'user_behavior');
    }
  });
};
