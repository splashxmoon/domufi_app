import React, { useEffect, useState, useRef } from 'react';
import { useTour } from '../contexts/TourContext';
import { useNavigate, useLocation } from 'react-router-dom';

export default function GuidedTour() {
  const { isTourActive, currentStep, nextStep, prevStep, skipTour, completeTour } = useTour();
  const navigate = useNavigate();
  const location = useLocation();
  const [targetElement, setTargetElement] = useState(null);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
  const tooltipRef = useRef(null);

  const tourSteps = [
    {
      target: '.profile-section',
      title: 'Welcome to Domufi! 👋',
      description: 'This is your profile section. Here you can see your account information and verification status.',
      page: '/dashboard/overview',
      position: 'bottom',
    },
    {
      target: '.quick-actions',
      title: 'Quick Actions',
      description: 'Use these shortcuts to quickly search for properties, analyze investments with AI, or add funding to your account.',
      page: '/dashboard/overview',
      position: 'bottom',
    },
    {
      target: '.metrics-grid',
      title: 'Your Portfolio at a Glance',
      description: 'Track your total portfolio value, invested amount, number of tokens, and monthly income all in one place.',
      page: '/dashboard/overview',
      position: 'bottom',
    },
    {
      target: '.chart-card',
      title: 'Performance Tracking',
      description: 'Monitor your portfolio performance over time and see how your investments are allocated across different properties.',
      page: '/dashboard/overview',
      position: 'right',
    },
    {
      target: '[href="/dashboard/marketplace"]',
      title: 'Explore the Marketplace',
      description: 'Click here anytime to browse available properties to invest in. Each property is tokenized, allowing you to own fractional shares.',
      page: '/dashboard/overview',
      position: 'right',
      highlight: 'sidebar',
    },
    {
      target: '[href="/dashboard/portfolio"]',
      title: 'Your Portfolio',
      description: 'Track all your investments, view performance metrics, and manage your property holdings here.',
      page: '/dashboard/overview',
      position: 'right',
      highlight: 'sidebar',
    },
    {
      target: '[href="/dashboard/transactions"]',
      title: 'Transaction History',
      description: 'View your complete transaction history including purchases, sales, and dividend payments.',
      page: '/dashboard/overview',
      position: 'right',
      highlight: 'sidebar',
    },
    {
      target: '[href="/dashboard/wallet"]',
      title: 'Wallet & Payments',
      description: 'Manage your funds, add payment methods, and view your available balance for investments.',
      page: '/dashboard/overview',
      position: 'right',
      highlight: 'sidebar',
    },
    {
      target: '.ai-assistant-header-btn',
      title: 'AI Investment Assistant',
      description: 'Click here to chat with our AI assistant for personalized investment advice, property recommendations, and portfolio analysis.',
      page: '/dashboard/overview',
      position: 'bottom',
      highlight: 'header',
    },
    {
      target: '[href="/dashboard/settings"]',
      title: 'Settings',
      description: 'Manage your account preferences, security settings, and restart this tour anytime from Help & Support.',
      page: '/dashboard/overview',
      position: 'right',
      highlight: 'sidebar',
    },
  ];

  const currentTourStep = tourSteps[currentStep];

  
  useEffect(() => {
    if (isTourActive && location.pathname !== '/dashboard/overview') {
      navigate('/dashboard/overview');
    }
  }, [isTourActive, navigate, location.pathname]);

  
  useEffect(() => {
    if (!isTourActive || !currentTourStep) {
      setTargetElement(null);
      return;
    }

    
    const findElement = () => {
      const element = document.querySelector(currentTourStep.target);
      if (element) {
        setTargetElement(element);
        calculateTooltipPosition(element);
      } else {
        
        setTimeout(findElement, 100);
      }
    };

    setTimeout(findElement, 300);
  }, [currentStep, isTourActive, currentTourStep]);

  const calculateTooltipPosition = (element) => {
    if (!element || !tooltipRef.current) return;

    const rect = element.getBoundingClientRect();
    const tooltipRect = tooltipRef.current.getBoundingClientRect();
    const position = currentTourStep.position || 'bottom';

    let top = 0;
    let left = 0;

    switch (position) {
      case 'bottom':
        top = rect.bottom + 20;
        left = rect.left + rect.width / 2 - tooltipRect.width / 2;
        break;
      case 'top':
        top = rect.top - tooltipRect.height - 20;
        left = rect.left + rect.width / 2 - tooltipRect.width / 2;
        break;
      case 'left':
        top = rect.top + rect.height / 2 - tooltipRect.height / 2;
        left = rect.left - tooltipRect.width - 20;
        break;
      case 'right':
        top = rect.top + rect.height / 2 - tooltipRect.height / 2;
        left = rect.right + 20;
        break;
      default:
        top = rect.bottom + 20;
        left = rect.left + rect.width / 2 - tooltipRect.width / 2;
    }

    
    const padding = 20;
    top = Math.max(padding, Math.min(top, window.innerHeight - tooltipRect.height - padding));
    left = Math.max(padding, Math.min(left, window.innerWidth - tooltipRect.width - padding));

    setTooltipPosition({ top, left });
  };

  useEffect(() => {
    if (targetElement) {
      calculateTooltipPosition(targetElement);
    }
  }, [targetElement]);

  
  useEffect(() => {
    const handleResize = () => {
      if (targetElement) {
        calculateTooltipPosition(targetElement);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [targetElement]);

  if (!isTourActive || !currentTourStep) {
    return null;
  }

  const handleNext = () => {
    if (currentStep === tourSteps.length - 1) {
      completeTour();
      
      navigate('/dashboard/overview');
    } else {
      nextStep();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      prevStep();
    }
  };

  const handleSkip = () => {
    skipTour();
    
    navigate('/dashboard/overview');
  };

  const spotlightStyle = targetElement ? {
    position: 'fixed',
    top: targetElement.getBoundingClientRect().top - 8,
    left: targetElement.getBoundingClientRect().left - 8,
    width: targetElement.getBoundingClientRect().width + 16,
    height: targetElement.getBoundingClientRect().height + 16,
    borderRadius: currentTourStep.highlight === 'sidebar' ? '12px' : '16px',
    pointerEvents: 'none',
    zIndex: 10000,
  } : {};

  return (
    <>
      {}
      <div className="tour-overlay" onClick={handleSkip} />

      {}
      {targetElement && (
        <div className="tour-spotlight" style={spotlightStyle} />
      )}

      {}
      <div
        ref={tooltipRef}
        className="tour-tooltip"
        style={{
          position: 'fixed',
          top: `${tooltipPosition.top}px`,
          left: `${tooltipPosition.left}px`,
          zIndex: 10001,
        }}
      >
        <div className="tour-tooltip-header">
          <div className="tour-step-indicator">
            Step {currentStep + 1} of {tourSteps.length}
          </div>
          <button className="tour-close-btn" onClick={handleSkip}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>

        <div className="tour-tooltip-body">
          <h3 className="tour-tooltip-title">{currentTourStep.title}</h3>
          <p className="tour-tooltip-description">{currentTourStep.description}</p>
        </div>

        <div className="tour-tooltip-footer">
          <div className="tour-progress-dots">
            {tourSteps.map((_, index) => (
              <div
                key={index}
                className={`tour-progress-dot ${index === currentStep ? 'active' : ''} ${index < currentStep ? 'completed' : ''}`}
              />
            ))}
          </div>

          <div className="tour-tooltip-actions">
            {currentStep > 0 && (
              <button className="tour-btn tour-btn-secondary" onClick={handlePrev}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M19 12H5M12 19L5 12L12 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Back
              </button>
            )}
            
            <button className="tour-btn tour-btn-skip" onClick={handleSkip}>
              Skip Tour
            </button>

            <button className="tour-btn tour-btn-primary" onClick={handleNext}>
              {currentStep === tourSteps.length - 1 ? (
                <>
                  Finish
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </>
              ) : (
                <>
                  Next
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M5 12H19M12 5L19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

