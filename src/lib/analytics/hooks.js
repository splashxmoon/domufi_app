import { useEffect, useRef } from 'react';
import { 
  trackPropertyView, 
  trackPropertyInteraction, 
  trackInvestmentView,
  trackInvestmentCalculation,
  trackInvestmentInitiation,
  trackPortfolioView,
  trackPageView,
  trackUserAction,
  trackFeatureUsage
} from './tracking.js';


export const usePropertyTracking = (propertyId, propertyData = {}) => {
  const hasTracked = useRef(false);
  
  useEffect(() => {
    if (propertyId && !hasTracked.current) {
      trackPropertyView(propertyId, propertyData);
      hasTracked.current = true;
    }
  }, [propertyId, propertyData]);
  
  return {
    trackPropertyInteraction: (interactionType, interactionData) => 
      trackPropertyInteraction(propertyId, interactionType, interactionData)
  };
};


export const useInvestmentTracking = (propertyId) => {
  return {
    trackInvestmentView: (investmentData) => 
      trackInvestmentView(propertyId, investmentData),
    
    trackInvestmentCalculation: (investmentAmount, tokenAmount, calculationData) =>
      trackInvestmentCalculation(propertyId, investmentAmount, tokenAmount, calculationData),
    
    trackInvestmentInitiation: (investmentAmount, tokenAmount, transactionData) =>
      trackInvestmentInitiation(propertyId, investmentAmount, tokenAmount, transactionData)
  };
};


export const usePortfolioTracking = () => {
  const hasTrackedView = useRef(false);
  
  useEffect(() => {
    if (!hasTrackedView.current) {
      trackPortfolioView();
      hasTrackedView.current = true;
    }
  }, []);
  
  return {
    trackPortfolioFilter: (filterCriteria) => 
      trackPortfolioFilter(filterCriteria)
  };
};


export const usePageTracking = (pageData = {}) => {
  useEffect(() => {
    trackPageView(pageData);
  }, [pageData]);
};


export const useFeatureTracking = (featureName) => {
  return {
    trackFeatureUsage: (usageData = {}) => 
      trackFeatureUsage(featureName, usageData)
  };
};


export const useActionTracking = () => {
  return {
    trackAction: (actionType, actionData = {}) => 
      trackUserAction(actionType, actionData)
  };
};


export const useInteractionTracking = (componentName) => {
  return {
    trackClick: (elementName, clickData = {}) => 
      trackUserAction(`${componentName}_click`, { element: elementName, ...clickData }),
    
    trackHover: (elementName, hoverData = {}) => 
      trackUserAction(`${componentName}_hover`, { element: elementName, ...hoverData }),
    
    trackFocus: (elementName, focusData = {}) => 
      trackUserAction(`${componentName}_focus`, { element: elementName, ...focusData }),
    
    trackInput: (fieldName, inputData = {}) => 
      trackUserAction(`${componentName}_input`, { field: fieldName, ...inputData })
  };
};
