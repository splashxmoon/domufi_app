import React, { createContext, useContext, useState, useEffect } from 'react';

const TourContext = createContext();

export const useTour = () => {
  const context = useContext(TourContext);
  if (!context) {
    throw new Error('useTour must be used within TourProvider');
  }
  return context;
};

export const TourProvider = ({ children }) => {
  const [isTourActive, setIsTourActive] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [hasCompletedTour, setHasCompletedTour] = useState(() => {
    return localStorage.getItem('hasCompletedTour') === 'true';
  });

  
  useEffect(() => {
    const checkNewUser = () => {
      const isNewUser = localStorage.getItem('isNewUser') === 'true';
      const hasSeenTour = localStorage.getItem('hasCompletedTour') === 'true';
      
      if (isNewUser && !hasSeenTour) {
        
        setTimeout(() => {
          startTour();
        }, 1000);
        
        
        localStorage.removeItem('isNewUser');
      }
    };

    checkNewUser();
  }, []);

  const startTour = () => {
    setIsTourActive(true);
    setCurrentStep(0);
  };

  const nextStep = () => {
    setCurrentStep(prev => prev + 1);
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(0, prev - 1));
  };

  const skipTour = () => {
    setIsTourActive(false);
    setHasCompletedTour(true);
    localStorage.setItem('hasCompletedTour', 'true');
  };

  const completeTour = () => {
    setIsTourActive(false);
    setHasCompletedTour(true);
    localStorage.setItem('hasCompletedTour', 'true');
  };

  const restartTour = () => {
    setHasCompletedTour(false);
    localStorage.removeItem('hasCompletedTour');
    startTour();
  };

  const value = {
    isTourActive,
    currentStep,
    hasCompletedTour,
    startTour,
    nextStep,
    prevStep,
    skipTour,
    completeTour,
    restartTour,
  };

  return <TourContext.Provider value={value}>{children}</TourContext.Provider>;
};

