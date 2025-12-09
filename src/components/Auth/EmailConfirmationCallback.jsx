import React, { useEffect, useState } from 'react';
import { useAuth } from '../../lib/auth/localAuthService';
import { useNavigate, useSearchParams } from 'react-router-dom';
import './AuthStyles.css';


const EmailConfirmationCallback = () => {
  const { authService } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState('processing'); 
  const [message, setMessage] = useState('Processing email confirmation...');
  const [error, setError] = useState(null);

  useEffect(() => {
    const handleEmailConfirmation = async () => {
      try {
        setStatus('processing');
        setMessage('Verifying your email confirmation...');

        
        const confirmationToken = searchParams.get('token');
        const accessToken = searchParams.get('access_token');
        const refreshToken = searchParams.get('refresh_token');

        if (!confirmationToken && !accessToken) {
          throw new Error('No confirmation token found in URL');
        }

        
        if (accessToken && refreshToken) {
          
          const { error: sessionError } = await authService.supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken
          });

          if (sessionError) {
            throw sessionError;
          }

          
          const result = await authService.handleEmailConfirmation(confirmationToken);
          
          if (result.success) {
            setStatus('success');
            setMessage('Email confirmed successfully! Welcome to Domufi!');
            
            
            setTimeout(() => {
              navigate('/dashboard');
            }, 3000);
          } else {
            throw new Error('Email confirmation failed');
          }
        } else {
          
          const tokenVerification = await authService.verifyConfirmationToken(confirmationToken);
          
          if (!tokenVerification.is_valid) {
            throw new Error('Invalid or expired confirmation token');
          }

          
          const confirmed = await authService.confirmUserEmail(confirmationToken);
          
          if (confirmed) {
            setStatus('success');
            setMessage('Email confirmed successfully! You can now sign in.');
            
            
            setTimeout(() => {
              navigate('/auth/signin');
            }, 3000);
          } else {
            throw new Error('Email confirmation failed');
          }
        }

      } catch (error) {
        console.error('Email confirmation error:', error);
        setStatus('error');
        setError(error.message);
        setMessage('Email confirmation failed. Please try again.');
      }
    };

    handleEmailConfirmation();
  }, [searchParams, authService, navigate]);

  const handleRetry = () => {
    setStatus('processing');
    setError(null);
    setMessage('Processing email confirmation...');
    
  };

  const handleGoToSignIn = () => {
    navigate('/auth/signin');
  };

  const handleGoToSignUp = () => {
    navigate('/auth/signup');
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1 className="auth-title">Email Confirmation</h1>
          <p className="auth-subtitle">
            {status === 'processing' && 'Please wait while we verify your email...'}
            {status === 'success' && 'Your email has been successfully confirmed!'}
            {status === 'error' && 'There was an issue confirming your email.'}
          </p>
        </div>

        <div className="auth-content">
          {status === 'processing' && (
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <p className="loading-text">{message}</p>
            </div>
          )}

          {status === 'success' && (
            <div className="success-container">
              <div className="success-icon">✅</div>
              <h3 className="success-title">Email Confirmed!</h3>
              <p className="success-message">{message}</p>
              <div className="success-actions">
                <button 
                  className="btn btn-primary"
                  onClick={handleGoToSignIn}
                >
                  Go to Sign In
                </button>
              </div>
            </div>
          )}

          {status === 'error' && (
            <div className="error-container">
              <div className="error-icon">❌</div>
              <h3 className="error-title">Confirmation Failed</h3>
              <p className="error-message">{message}</p>
              {error && (
                <div className="error-details">
                  <p className="error-detail-text">{error}</p>
                </div>
              )}
              <div className="error-actions">
                <button 
                  className="btn btn-primary"
                  onClick={handleRetry}
                >
                  Try Again
                </button>
                <button 
                  className="btn btn-secondary"
                  onClick={handleGoToSignUp}
                >
                  Sign Up Again
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="auth-footer">
          <p className="auth-footer-text">
            Need help? Contact our support team.
          </p>
        </div>
      </div>
    </div>
  );
};

export default EmailConfirmationCallback;
