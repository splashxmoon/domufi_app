import { useState, useCallback, useRef } from 'react';

const API_BASE_URL = process.env.REACT_APP_AI_API_URL || 'http:

export const useDomuFiAI = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [conversation, setConversation] = useState([]);
  const [aiHealth, setAiHealth] = useState(false);
  const [modelInfo, setModelInfo] = useState(null);
  const conversationRef = useRef([]);

  
  const checkHealth = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/health`);
      const health = await response.json();
      setAiHealth(health.status === 'healthy');
      setModelInfo(health);
      return health.status === 'healthy';
    } catch (err) {
      console.error('Health check failed:', err);
      setAiHealth(false);
      return false;
    }
  }, []);

  
  const sendMessage = useCallback(async (message, context = {}) => {
    if (!message.trim()) return null;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: message.trim(),
          context: context,
          session_id: 'domufi_session',
          user_id: context.user_id || 'anonymous'
        })
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      const aiResponse = await response.json();
      
      
      const userMessage = {
        id: Date.now(),
        type: 'user',
        content: message,
        timestamp: new Date().toISOString()
      };

      const aiMessage = {
        id: Date.now() + 1,
        type: 'ai',
        content: aiResponse.answer,
        suggestions: aiResponse.suggestions || [],
        actions: aiResponse.actions || [],
        confidence: aiResponse.confidence,
        category: aiResponse.category,
        timestamp: aiResponse.timestamp,
        modelInfo: aiResponse.model_info
      };

      const newConversation = [...conversationRef.current, userMessage, aiMessage];
      setConversation(newConversation);
      conversationRef.current = newConversation;

      return aiResponse;

    } catch (err) {
      console.error('Error sending message:', err);
      setError(err.message);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  
  const getSuggestions = useCallback(async (context = {}) => {
    try {
      const response = await fetch(`${API_BASE_URL}/suggestions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(context)
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      const data = await response.json();
      return data.suggestions || [];

    } catch (err) {
      console.error('Error getting suggestions:', err);
      return [];
    }
  }, []);

  
  const updateUserContext = useCallback(async (userContext) => {
    try {
      const response = await fetch(`${API_BASE_URL}/user-context`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: userContext.user_id || 'anonymous',
          portfolio_data: userContext.portfolio_data,
          preferences: userContext.preferences,
          current_page: userContext.current_page
        })
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      return await response.json();

    } catch (err) {
      console.error('Error updating user context:', err);
      return null;
    }
  }, []);

  
  const getCapabilities = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/capabilities`);
      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }
      return await response.json();
    } catch (err) {
      console.error('Error getting capabilities:', err);
      return null;
    }
  }, []);

  
  const clearConversation = useCallback(() => {
    setConversation([]);
    conversationRef.current = [];
    setError(null);
  }, []);

  
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    
    isLoading,
    error,
    conversation,
    aiHealth,
    modelInfo,
    
    
    checkHealth,
    sendMessage,
    getSuggestions,
    updateUserContext,
    getCapabilities,
    clearConversation,
    clearError
  };
};

export default useDomuFiAI;
