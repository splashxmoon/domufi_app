import React, { useState, useEffect } from 'react';

const LazyAIInvestmentAssistant = (props) => {
  const [AIComponent, setAIComponent] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    
    const loadAIComponent = async () => {
      try {
        const { default: AIInvestmentAssistantV2 } = await import('./AIInvestmentAssistantV2.jsx');
        setAIComponent(() => AIInvestmentAssistantV2);
      } catch (error) {
        console.error('Failed to load AI component:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadAIComponent();
  }, []);

  if (isLoading) {
    return (
      <div className="ai-assistant-overlay">
        <div className="ai-assistant-container">
          <div className="ai-assistant-header">
            <div className="ai-assistant-title">
              <div className="ai-assistant-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div>
                <h3>AI Investment Assistant</h3>
                <p className="ai-assistant-status">🟡 Loading AI...</p>
              </div>
            </div>
            <button className="ai-assistant-close" onClick={props.onClose}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
          <div className="ai-assistant-messages">
            <div className="message ai">
              <div className="ai-avatar">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div className="message-content">
                <div className="typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!AIComponent) {
    return (
      <div className="ai-assistant-overlay">
        <div className="ai-assistant-container">
          <div className="ai-assistant-header">
            <div className="ai-assistant-title">
              <div className="ai-assistant-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div>
                <h3>AI Investment Assistant</h3>
                <p className="ai-assistant-status">🔴 Failed to Load</p>
              </div>
            </div>
            <button className="ai-assistant-close" onClick={props.onClose}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
          <div className="ai-assistant-messages">
            <div className="message ai">
              <div className="ai-avatar">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div className="message-content">
                <div className="message-text">
                  I apologize, but I encountered an error loading. Please try refreshing the page.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return <AIComponent {...props} />;
};

export default LazyAIInvestmentAssistant;

