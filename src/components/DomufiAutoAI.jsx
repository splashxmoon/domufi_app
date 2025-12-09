import React, { useState, useEffect, useRef } from 'react';
import './DomufiAutoAI.css';
import { useInvestments } from '../contexts/InvestmentContext';
import { useWallet } from '../contexts/WalletContext';


const API_BASE_URL = process.env.REACT_APP_AI_API_URL || 'http://localhost:8000';

const DomufiAutoAI = ({ isOpen, onClose, navigate }) => {
  
  const { investments, transactions, getPortfolioSummary, getInvestmentsByProperty } = useInvestments();
  const { walletData, connectedAccounts, walletTransactions } = useWallet();
  
  
  const [aiConversation, setAiConversation] = useState([]);
  const [userInput, setUserInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('checking'); 
  const conversationRef = useRef(null);

  
  const [isActive, setIsActive] = useState(false);
  const [autoBalanceEnabled, setAutoBalanceEnabled] = useState(true);
  const [autoInvestEnabled, setAutoInvestEnabled] = useState(false);
  const [autoReinvestEnabled, setAutoReinvestEnabled] = useState(true);
  const [autoWithdrawEnabled, setAutoWithdrawEnabled] = useState(false);
  const [activeTab, setActiveTab] = useState('chat'); 

  
  const getCurrentUserId = () => {
    try {
      const userData = localStorage.getItem('user');
      if (userData) {
        const user = JSON.parse(userData);
        return user.id || user.userId || null;
      }
    } catch (e) {
      
    }
    return null;
  };

  
  const analyzeUserAccount = () => {
    const portfolioSummary = getPortfolioSummary();
    const investmentsByProperty = getInvestmentsByProperty();
    
    return {
      portfolio: {
        totalInvested: portfolioSummary.totalInvested || 0,
        currentValue: portfolioSummary.currentValue || 0,
        totalReturn: portfolioSummary.totalReturn || 0,
        totalReturnPercentage: portfolioSummary.totalReturnPercentage || 0
      },
      analysis: {
        hasInvestments: (investments?.length || 0) > 0,
        investmentCount: investments?.length || 0,
        diversification: {
          isDiversified: investmentsByProperty?.length >= 3,
          markets: investmentsByProperty?.length || 0
        }
      },
      investments: investments || [],
      wallet: {
        availableBalance: walletData?.balance || 0,
        totalDeposited: walletData?.totalDeposited || 0,
        totalWithdrawn: walletData?.totalWithdrawn || 0,
        balance: walletData?.balance || 0
      }
    };
  };
  
  
  const navigationEngine = {
    findRouteByQuery: (message) => {
      const msgLower = message.toLowerCase();
      const routes = [
        { key: 'Portfolio', path: '/portfolio', keywords: ['portfolio', 'investments', 'my investments'] },
        { key: 'Marketplace', path: '/marketplace', keywords: ['marketplace', 'properties', 'browse', 'invest'] },
        { key: 'Wallet', path: '/wallet', keywords: ['wallet', 'balance', 'funds', 'money'] },
        { key: 'Dashboard', path: '/', keywords: ['dashboard', 'home', 'overview'] }
      ];

      const matches = routes
        .map(route => ({
          route,
          score: route.keywords.filter(kw => msgLower.includes(kw)).length
        }))
        .filter(m => m.score > 0)
        .sort((a, b) => b.score - a.score);

      return matches;
    }
  };

  
  const testConnection = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/status`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (response.ok) {
        const data = await response.json();
        console.log('[AI Service] Status check:', data);
        const isReady = data.ready_to_chat === true;
        
        if (!isReady) {
          console.log(`[AI Service] Still initializing: ${data.ready_count}/${data.total_components} components ready`);
        }
        
        return isReady;
      }
      return false;
    } catch (error) {
      console.error('[AI Service] Connection test failed:', error);
      return false;
    }
  };

  
  const processUserMessage = async (message) => {
    if (!message.trim() || isProcessing) return;

    setIsProcessing(true);
    
    
    setAiConversation(prev => [...prev, { 
      role: 'user', 
      content: message, 
      timestamp: Date.now() 
    }]);
    
    
    const userAccountData = analyzeUserAccount();
    const userId = getCurrentUserId();
    const sessionId = userId || 'anonymous';
    
    
    const conversationHistory = aiConversation.slice(-10).map(msg => ({
      role: msg.role,
      content: typeof msg.content === 'string' ? msg.content.replace(/<[^>]*>/g, '') : msg.content
    }));
    
    try {
      console.log('[AI Service] Sending request to:', `${API_BASE_URL}/chat`);
      console.log('[AI Service] Request payload:', {
        message: message.trim(),
        user_id: userId || 'anonymous',
        session_id: sessionId
      });
      
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        if (!controller.signal.aborted) {
          controller.abort();
        }
      }, 60000); 
      
      let response;
      try {
        response = await fetch(`${API_BASE_URL}/chat`, {
          signal: controller.signal,
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message: message.trim(),
            user_id: userId || 'anonymous',
            session_id: sessionId,
            context: {
              wallet_balance: userAccountData.wallet?.balance || 0,
              portfolio_value: userAccountData.portfolio?.currentValue || 0,
              total_invested: userAccountData.portfolio?.totalInvested || 0,
              total_return: userAccountData.portfolio?.totalReturn || 0,
              has_investments: userAccountData.analysis?.hasInvestments || false,
              investment_count: userAccountData.analysis?.investmentCount || 0
            },
            conversation_history: conversationHistory
          })
        });
        
        clearTimeout(timeoutId);
      } catch (fetchError) {
        clearTimeout(timeoutId);
        if (fetchError.name === 'AbortError') {
          throw new Error('Request timed out after 60 seconds. The AI service may be processing a complex query. Please try again.');
        }
        throw fetchError;
      }

      console.log('[AI Service] Response status:', response.status, response.statusText);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('[AI Service] Error response:', errorText);
        throw new Error(`API Error: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const data = await response.json();
      console.log('[AI Service] Response received:', { 
        hasAnswer: !!data.answer, 
        answerLength: data.answer?.length,
        confidence: data.confidence 
      });
      
      
      let aiResponse = data.answer || "I apologize, but I couldn't generate a response.";
      
      
      if (data.actions && data.actions.length > 0) {
        const navAction = data.actions.find(action => action.type === 'navigate');
        if (navAction && navigate) {
          
          aiResponse += `\n\n💡 *Would you like me to navigate to ${navAction.label}?*`;
        }
      }
      
      
      const navMatches = navigationEngine.findRouteByQuery(message);
      if (navMatches.length > 0 && navMatches[0].score >= 2 && !data.actions?.some(a => a.type === 'navigate')) {
        const navRoute = navMatches[0].route;
        aiResponse += `\n\n💡 *Would you like me to navigate to ${navRoute.key}?*`;
        
        
        setTimeout(() => {
          if (navigate) {
            navigate(navRoute.path);
            onClose();
          }
        }, 2000);
      }
      
      
      aiResponse = aiResponse
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\n/g, '<br>');
      
      
      setAiConversation(prev => [...prev, { 
        role: 'assistant', 
        content: aiResponse, 
        timestamp: Date.now(),
        confidence: data.confidence || 0.85,
        reasoningSteps: data.reasoning_steps?.length || 0,
        suggestions: data.suggestions || [],
        intent: data.intent || 'general_inquiry'
      }]);
      
    } catch (error) {
      console.error('[AI Service] Error processing message:', error);
      console.error('[AI Service] Error details:', {
        message: error.message,
        name: error.name,
        stack: error.stack,
        apiUrl: API_BASE_URL
      });
      
      
      let errorMessage = 'I encountered an error processing your question.\n\n';
      
      if (error.name === 'AbortError' || error.message?.includes('aborted') || error.message?.includes('timed out')) {
        errorMessage += '⏱️ **Request Timed Out** - The AI service took longer than 60 seconds to respond.\n\n';
        errorMessage += '**Possible reasons:**\n';
        errorMessage += '- The service is processing a complex query\n';
        errorMessage += '- The service may still be initializing\n';
        errorMessage += '- Network connection issues\n\n';
        errorMessage += '**Please try:**\n';
        errorMessage += '- Wait a few seconds and try again\n';
        errorMessage += '- Try a simpler or shorter question\n';
        errorMessage += '- Check if the AI service is running properly\n';
      } else if (error.message?.includes('fetch') || error.message?.includes('Failed to fetch') || error.message?.includes('NetworkError')) {
        errorMessage += '🔌 **Connection Error** - Unable to connect to the AI service.\n\n';
        errorMessage += `**Service URL:** ${API_BASE_URL}\n\n`;
        errorMessage += '**Please check:**\n';
        errorMessage += '1. Is the AI service running? (python main.py in ai_service folder)\n';
        errorMessage += '2. Is it running on port 8000?\n';
        errorMessage += '3. Check the browser console for more details\n';
      } else if (error.message?.includes('API Error') || error.message?.includes('503')) {
        errorMessage += '⚠️ **Service Not Ready** - The AI service is still initializing.\n\n';
        errorMessage += 'Please wait a few moments and try again. The service may still be loading.';
      } else if (error.message?.includes('504') || error.message?.includes('timeout')) {
        errorMessage += '⏱️ **Request Timed Out** - The AI service took too long to respond.\n\n';
        errorMessage += 'Please try a simpler question or wait a moment.';
      } else {
        errorMessage += '❌ **Error Details:** ' + error.message + '\n\n';
        errorMessage += 'Please check the browser console for more information.';
      }
      
      setAiConversation(prev => [...prev, { 
        role: 'assistant', 
        content: errorMessage,
        timestamp: Date.now(),
        error: true
      }]);
    } finally {
      setIsProcessing(false);
    }
  };

  
  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!userInput.trim() || isProcessing) return;
    
    const message = userInput.trim();
    setUserInput('');
    processUserMessage(message);
  };

  
  const handleFeedback = async (message, feedbackType) => {
    if (!message || message.role !== 'assistant') return;

    try {
      
      const messageIndex = aiConversation.findIndex(m => m === message);
      const userQuery = messageIndex > 0 ? aiConversation[messageIndex - 1]?.content : '';

      
      let correctedResponse = '';
      if (feedbackType === 'correction') {
        correctedResponse = prompt('Please provide the corrected response:');
        if (!correctedResponse) return; 
      }

      
      const response = await fetch(`${API_BASE_URL}/feedback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: getCurrentUserId() || 'anonymous',
          query: userQuery,
          response: message.content.replace(/<[^>]*>/g, ''), 
          intent: message.intent || 'general_inquiry',
          entities: {},
          feedback_type: feedbackType,
          feedback_data: feedbackType === 'correction' ? { corrected_response: correctedResponse } : {},
          rating: feedbackType === 'positive' ? 5 : feedbackType === 'negative' ? 1 : 3
        })
      });

      if (response.ok) {
        
        const feedbackMsg = feedbackType === 'positive' 
          ? '✅ Thanks! Your feedback helps me learn.' 
          : feedbackType === 'negative'
          ? '👎 Thanks for the feedback. I\'ll improve!'
          : '✏️ Thanks for the correction! I\'ll learn from it.';
        
        
        setAiConversation(prev => [...prev, {
          role: 'assistant',
          content: feedbackMsg,
          timestamp: Date.now(),
          isFeedback: true
        }]);
      } else {
        console.error('Failed to submit feedback');
      }
    } catch (error) {
      console.error('Error submitting feedback:', error);
    }
  };

  
  const handleToggleAutomation = (type) => {
    switch (type) {
      case 'balance':
        setAutoBalanceEnabled(!autoBalanceEnabled);
        break;
      case 'invest':
        setAutoInvestEnabled(!autoInvestEnabled);
        break;
      case 'reinvest':
        setAutoReinvestEnabled(!autoReinvestEnabled);
        break;
      case 'withdraw':
        setAutoWithdrawEnabled(!autoWithdrawEnabled);
        break;
      default:
        break;
    }
  };

  
  useEffect(() => {
    if (isOpen) {
      const checkConnection = async () => {
        setConnectionStatus('checking');
        const isConnected = await testConnection();
        setConnectionStatus(isConnected ? 'connected' : 'disconnected');
        if (!isConnected) {
          console.warn('[AI Service] Connection test failed - AI service may not be running or still initializing');
          
          
          try {
            const statusResponse = await fetch(`${API_BASE_URL}/status`);
            if (statusResponse.ok) {
              const statusData = await statusResponse.json();
              const readyCount = statusData.ready_count || 0;
              const totalComponents = statusData.total_components || 0;
              
              setAiConversation(prev => {
                if (prev.length === 0) {
                  return [{
                    role: 'assistant',
                    content: `⏳ **AI Service Initializing**\n\n**Status:** ${statusData.message || 'Still loading'}\n**Progress:** ${readyCount}/${totalComponents} components ready\n\n**Please wait** - The AI service is still loading all components. This usually takes 30-60 seconds.\n\n**Check status:**\n- Visit: ${API_BASE_URL}/status\n- Or wait a moment and try again\n\nOnce all components are ready, you can start chatting!`,
                    timestamp: Date.now(),
                    error: true
                  }];
                }
                return prev;
              });
            } else {
              throw new Error('Status check failed');
            }
          } catch (error) {
            setAiConversation(prev => {
              if (prev.length === 0) {
                return [{
                  role: 'assistant',
                  content: `⚠️ **AI Service Connection Issue**\n\nUnable to connect to the AI service at ${API_BASE_URL}.\n\n**Please ensure:**\n1. The AI service is running (cd ai_service && python main.py)\n2. It's running on port 8000\n3. Check the browser console for details\n\nOnce connected, you can start chatting!`,
                  timestamp: Date.now(),
                  error: true
                }];
              }
              return prev;
            });
          }
        }
      };
      checkConnection();
      
      
      const interval = setInterval(async () => {
        if (connectionStatus !== 'connected') {
          const isConnected = await testConnection();
          if (isConnected) {
            setConnectionStatus('connected');
            clearInterval(interval);
          }
        } else {
          clearInterval(interval);
        }
      }, 5000);
      
      return () => clearInterval(interval);
    }
  }, [isOpen, connectionStatus]);

  
  
  
  
  
  

  if (!isOpen) return null;

  return (
    <div className="auto-ai-overlay">
      <div className="auto-ai-modal">
        <div className="auto-ai-header">
          <div className="header-content">
            <div className="ai-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div className="header-text">
              <h2>DomufiAI</h2>
              <p>Intelligent automation for your real estate portfolio</p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', width: '100%', justifyContent: 'space-between' }}>
            <div className="connection-status" style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '6px',
              fontSize: '11px',
              color: connectionStatus === 'connected' ? '#10b981' : connectionStatus === 'checking' ? '#f59e0b' : '#ef4444',
              fontWeight: 500
            }}>
              <div style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                backgroundColor: connectionStatus === 'connected' ? '#10b981' : connectionStatus === 'checking' ? '#f59e0b' : '#ef4444',
                animation: connectionStatus === 'checking' ? 'pulse 2s infinite' : 'none'
              }}></div>
              <span>
                {connectionStatus === 'connected' ? 'Connected' : connectionStatus === 'checking' ? 'Checking...' : 'Disconnected'}
              </span>
            </div>
            {aiConversation.length > 0 && (
              <button 
                className="clear-chat-button" 
                onClick={() => setAiConversation([])}
                title="Clear conversation"
                style={{ marginLeft: 'auto' }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M3 6H5H21M8 6V4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V6M19 6V20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 17.5304 22 17 22H7C6.46957 22 5.96086 21.7893 5.58579 21.4142C5.21071 21.0391 5 20.5304 5 20V6H19Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Clear Chat
              </button>
            )}
            <button className="close-button" onClick={onClose}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
        </div>

        <div className="auto-ai-content">
          {}
          <div className="nav-buttons" style={{ marginBottom: '16px' }}>
            <button 
              className={`nav-button ${activeTab === 'chat' ? 'active' : ''}`}
              onClick={() => setActiveTab('chat')}
              title="Chat"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M21 15C21 15.5304 20.7893 16.0391 20.4142 16.4142C20.0391 16.7893 19.5304 17 19 17H7L3 21V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V15Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            <button 
              className={`nav-button ${activeTab === 'automation' ? 'active' : ''}`}
              onClick={() => setActiveTab('automation')}
              title="Automation"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>

          {}
          {activeTab === 'chat' && (
            <div className="conversation-section">
              <div className="conversation-container">
                <div className="conversation-messages" ref={conversationRef}>
                  {aiConversation.length === 0 ? (
                    <div className="empty-conversation">
                      <div className="ai-avatar">
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                          <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                      <h4>Start a conversation with DomufiAI</h4>
                      <p>Ask me anything about your portfolio, investments, or get recommendations</p>
                      
                      <div className="quick-prompts">
                        <button className="quick-prompt" onClick={() => processUserMessage('Show me my portfolio')}>
                          Show me my portfolio
                        </button>
                        <button className="quick-prompt" onClick={() => processUserMessage('What should I invest in?')}>
                          What should I invest in?
                        </button>
                        <button className="quick-prompt" onClick={() => processUserMessage('How does fractional ownership work?')}>
                          How does fractional ownership work?
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      {aiConversation.map((msg, idx) => (
                        <div key={idx} className={`message ${msg.role === 'user' ? 'user' : ''}`}>
                          <div className="message-avatar">
                            {msg.role === 'assistant' ? (
                              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                                <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              </svg>
                            ) : (
                              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                                <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21M16 7C16 9.20914 14.2091 11 12 11C9.79086 11 8 9.20914 8 7C8 4.79086 9.79086 3 12 3C14.2091 3 16 4.79086 16 7Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              </svg>
                            )}
                          </div>
                          <div className="message-content">
                            <p dangerouslySetInnerHTML={{ __html: msg.content }}></p>
                            {msg.suggestions && msg.suggestions.length > 0 && (
                              <div className="message-suggestions">
                                {msg.suggestions.map((suggestion, sugIdx) => (
                                  <button
                                    key={sugIdx}
                                    className="suggestion-button"
                                    onClick={() => {
                                      setUserInput(suggestion);
                                      processUserMessage(suggestion);
                                    }}
                                    disabled={isProcessing}
                                  >
                                    {suggestion}
                                  </button>
                                ))}
                              </div>
                            )}
                            {msg.confidence && (
                              <div className="message-meta">
                                Confidence: {(msg.confidence * 100).toFixed(0)}%
                              </div>
                            )}
                            {}
                            {msg.role === 'assistant' && (
                              <div className="feedback-buttons">
                                <button
                                  className="feedback-button feedback-positive"
                                  onClick={() => handleFeedback(msg, 'positive')}
                                  title="This response was helpful"
                                >
                                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                    <path d="M14 9V5C14 3.89543 13.1046 3 12 3C10.8954 3 10 3.89543 10 5V9M14 9H18C18.5523 9 19 9.44772 19 10V19C19 19.5523 18.5523 20 18 20H14M14 9H10M10 9H6C5.44772 9 5 9.44772 5 10V19C5 19.5523 5.44772 20 6 20H10M10 9V20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                  </svg>
                                  Helpful
                                </button>
                                <button
                                  className="feedback-button feedback-negative"
                                  onClick={() => handleFeedback(msg, 'negative')}
                                  title="This response was not helpful"
                                >
                                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                    <path d="M10 15V19C10 20.1046 10.8954 21 12 21C13.1046 21 14 20.1046 14 19V15M10 15H6C5.44772 15 5 14.5523 5 14V5C5 4.44772 5.44772 4 6 4H10M10 15H14M14 15H18C18.5523 15 19 14.5523 19 14V5C19 4.44772 18.5523 4 18 4H14M14 15V4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                  </svg>
                                  Not Helpful
                                </button>
                                <button
                                  className="feedback-button feedback-correct"
                                  onClick={() => handleFeedback(msg, 'correction')}
                                  title="Provide a correction"
                                >
                                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                    <path d="M11 4H4C3.46957 4 2.96086 4.21071 2.58579 4.58579C2.21071 4.96086 2 5.46957 2 6V20C2 20.5304 2.21071 21.0391 2.58579 21.4142C2.96086 21.7893 3.46957 22 4 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V13M18.5 2.5C18.8978 2.10218 19.4374 1.87868 20 1.87868C20.5626 1.87868 21.1022 2.10218 21.5 2.5C21.8978 2.89782 22.1213 3.43739 22.1213 4C22.1213 4.56261 21.8978 5.10218 21.5 5.5L12 15L8 16L9 12L18.5 2.5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                  </svg>
                                  Correct
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </>
                  )}
                  {isProcessing && (
                    <div className="message">
                      <div className="message-avatar">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                          <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                      <div className="message-content">
                        <div className="thinking-dots">
                          <span></span>
                          <span></span>
                          <span></span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="conversation-input-wrapper">
                  <form className="conversation-input-form" onSubmit={handleSendMessage}>
                    <input
                      type="text"
                      className="conversation-input"
                      placeholder="Ask me anything..."
                      value={userInput}
                      onChange={(e) => setUserInput(e.target.value)}
                      disabled={isProcessing}
                    />
                    <button 
                      type="submit" 
                      className="send-button"
                      disabled={!userInput.trim() || isProcessing}
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                        <path d="M22 2L11 13M22 2L15 22L11 13M22 2L2 9L11 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </button>
                  </form>
                </div>
              </div>
            </div>
          )}

          {}
          {activeTab === 'automation' && (
            <div className="automation-section">
              <div className="section-header">
                <h3>Automation Controls</h3>
                <div className={`power-switch ${isActive ? 'active' : ''}`} onClick={() => setIsActive(!isActive)}>
                  <div className="switch-slider"></div>
                </div>
              </div>
              <p className="section-description">
                {isActive 
                  ? 'AutoAI is actively monitoring and managing your portfolio'
                  : 'Enable AutoAI to start intelligent automation'}
              </p>

              <div className="automation-options">
                <div className="automation-option">
                  <div className="option-header">
                    <div className="option-icon">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                        <path d="M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                    <div className="option-info">
                      <h4>Portfolio Auto-Balance</h4>
                      <p>Automatically rebalance your portfolio for optimal risk and returns</p>
                    </div>
                    <div className={`toggle-switch ${autoBalanceEnabled ? 'on' : ''}`} onClick={() => handleToggleAutomation('balance')}>
                      <div className="switch-handle"></div>
                    </div>
                  </div>
                </div>

                <div className="automation-option">
                  <div className="option-header">
                    <div className="option-icon">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                        <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                    <div className="option-info">
                      <h4>Auto-Invest</h4>
                      <p>Automatically invest in properties based on your preferences</p>
                    </div>
                    <div className={`toggle-switch ${autoInvestEnabled ? 'on' : ''}`} onClick={() => handleToggleAutomation('invest')}>
                      <div className="switch-handle"></div>
                    </div>
                  </div>
                </div>

                <div className="automation-option">
                  <div className="option-header">
                    <div className="option-icon">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                        <path d="M16 21V19C16 17.9391 15.5786 16.9217 14.8284 16.1716C14.0783 15.4214 13.0609 15 12 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M8.5 11C10.7091 11 12.5 9.20914 12.5 7C12.5 4.79086 10.7091 3 8.5 3C6.29086 3 4.5 4.79086 4.5 7C4.5 9.20914 6.29086 11 8.5 11Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                    <div className="option-info">
                      <h4>Auto-Reinvest</h4>
                      <p>Automatically reinvest dividends and returns</p>
                    </div>
                    <div className={`toggle-switch ${autoReinvestEnabled ? 'on' : ''}`} onClick={() => handleToggleAutomation('reinvest')}>
                      <div className="switch-handle"></div>
                    </div>
                  </div>
                </div>

                <div className="automation-option">
                  <div className="option-header">
                    <div className="option-icon">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                        <path d="M17 21V19C17 17.9391 16.5786 16.9217 15.8284 16.1716C15.0783 15.4214 14.0609 15 13 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M23 21V19C22.9993 18.1137 22.7044 17.2528 22.1614 16.5523C21.6184 15.8519 20.8581 15.3516 20 15.13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M16 3.13C16.8604 3.35031 17.623 3.85071 18.1676 4.55232C18.7122 5.25392 19.0078 6.11683 19.0078 7.005C19.0078 7.89318 18.7122 8.75608 18.1676 9.45769C17.623 10.1593 16.8604 10.6597 16 10.88" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                    <div className="option-info">
                      <h4>Auto-Withdraw</h4>
                      <p>Automatically withdraw profits based on your preferences</p>
                    </div>
                    <div className={`toggle-switch ${autoWithdrawEnabled ? 'on' : ''}`} onClick={() => handleToggleAutomation('withdraw')}>
                      <div className="switch-handle"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DomufiAutoAI;
