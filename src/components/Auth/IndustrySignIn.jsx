




import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../lib/auth/localAuthService';
import './AuthStyles.css';

export default function IndustrySignIn() {
  const navigate = useNavigate();
  const { signIn } = useAuth();
  
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [emailExists, setEmailExists] = useState(null);
  const [isCheckingEmail, setIsCheckingEmail] = useState(false);
  const [touched, setTouched] = useState({});

  
  useEffect(() => {
    const checkEmailExists = async () => {
      if (formData.email && formData.email.includes('@') && formData.email.length > 5) {
        setIsCheckingEmail(true);
        try {
          
          const demoUsers = JSON.parse(localStorage.getItem('demoUsers') || '[]');
          const existingUser = demoUsers.find(user => user.email === formData.email);
          
          if (existingUser) {
            setEmailExists(true);
          } else {
            setEmailExists(false);
          }
        } catch (err) {
          console.error('Error checking email:', err);
          setEmailExists(null);
        } finally {
          setIsCheckingEmail(false);
        }
      } else {
        setEmailExists(null);
      }
    };

    const timeoutId = setTimeout(checkEmailExists, 500);
    return () => clearTimeout(timeoutId);
  }, [formData.email]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    
    setTouched(prev => ({ ...prev, [name]: true }));
    
    
    if (error) {
      setError('');
    }
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }
    
    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }
    
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      
      const errors = validateForm();
      if (Object.keys(errors).length > 0) {
        setError('Please fill in all required fields correctly');
        setLoading(false);
        return;
      }

      
      if (emailExists === false) {
        setError('No account found with this email address. Please sign up first.');
        setLoading(false);
        return;
      }

      console.log('🔐 Attempting sign in...');
      console.log('📧 Email:', formData.email);
      console.log('🔍 Email exists check:', emailExists);
      
      
      const result = await signIn(formData.email, formData.password);
      
      console.log('✅ Sign in successful');
      console.log('👤 User:', result.user?.id);
      console.log('📊 Profile:', result.profile);
      console.log('🔍 Needs KYC:', result.needsKYC);
      
      
      navigate('/dashboard');
      
    } catch (err) {
      console.error('❌ Sign in error:', err);
      console.error('Error message:', err.message);
      console.error('Error code:', err.code);
      
      
      let errorMessage = 'Failed to sign in. Please try again.';
      
      if (err.message?.includes('Invalid login credentials') || err.message?.includes('invalid_credentials')) {
        errorMessage = 'Invalid email or password. Please check your credentials and try again.';
      } else if (err.message?.includes('Email not confirmed') || err.message?.includes('email_not_confirmed')) {
        errorMessage = 'Please check your email and click the confirmation link before signing in.';
      } else if (err.message?.includes('Too many requests') || err.message?.includes('too_many_requests')) {
        errorMessage = 'Too many sign-in attempts. Please wait a moment and try again.';
      } else if (err.message?.includes('User not found') || err.message?.includes('user_not_found')) {
        errorMessage = 'No account found with this email address. Please sign up first.';
      } else if (err.message?.includes('Invalid email') || err.message?.includes('invalid_email')) {
        errorMessage = 'Please enter a valid email address.';
      } else if (err.message?.includes('Password should be at least') || err.message?.includes('weak_password')) {
        errorMessage = 'Password must be at least 6 characters long.';
      } else if (err.message?.includes('rate limit') || err.message?.includes('rate_limit_exceeded')) {
        errorMessage = 'Too many attempts. Please wait a moment and try again.';
      } else if (err.message?.includes('signup_disabled')) {
        errorMessage = 'Account creation is currently disabled. Please contact support.';
      } else if (err.message?.includes('signup_disabled')) {
        errorMessage = 'Sign-in is currently disabled. Please contact support.';
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!formData.email || !formData.email.includes('@')) {
      setError('Please enter your email address first');
      return;
    }

    setLoading(true);
    setError('');

    try {
      
      alert('Password reset is not available in demo mode. Please create a new account.');
    } catch (err) {
      console.error('Password reset error:', err);
      setError('Password reset is not available in demo mode.');
    } finally {
      setLoading(false);
    }
  };

  
  useEffect(() => {
    console.log('✅ Local auth service ready');
  }, []);

  return (
    <div className="signin-page">
      <div className="signin-container">
        <div className="signin-card">
          
          {}
          <div className="signin-header">
            <div className="signin-logo">
              <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
                <rect width="40" height="40" rx="8" fill="url(#gradient)" />
                <path d="M20 10L28 16V24L20 30L12 24V16L20 10Z" fill="white" />
                <defs>
                  <linearGradient id="gradient" x1="0" y1="0" x2="40" y2="40">
                    <stop offset="0%" stopColor="#10b981" />
                    <stop offset="100%" stopColor="#3b82f6" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
            <h1 className="signin-title">Welcome Back</h1>
            <p className="signin-subtitle">
              Sign in to your Domufi account to continue your investment journey
            </p>
          </div>

          {}
          {error && (
            <div className="signin-alert signin-alert-error">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M10 18C14.4183 18 18 14.4183 18 10C18 5.58172 14.4183 2 10 2C5.58172 2 2 5.58172 2 10C2 14.4183 5.58172 18 10 18Z" stroke="currentColor" strokeWidth="2"/>
                <path d="M10 6V10M10 14H10.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              <span>{error}</span>
            </div>
          )}

          {}
          <form onSubmit={handleSubmit} className="signin-form">
            
            {}
            <div className="form-group">
              <label className="form-label" htmlFor="email">
                Email Address
                <span className="required">*</span>
              </label>
              <div className="input-wrapper">
                <input
                  id="email"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  onBlur={handleBlur}
                  className={`form-input ${touched.email && !formData.email ? 'error' : ''} ${emailExists === true ? 'success' : ''}`}
                  placeholder="you@example.com"
                  autoComplete="email"
                  required
                />
                {isCheckingEmail && (
                  <div className="input-icon input-icon-loading">
                    <svg className="spinner" width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeDasharray="37.699" strokeDashoffset="9.425" />
                    </svg>
                  </div>
                )}
                {emailExists === true && !isCheckingEmail && (
                  <div className="input-icon input-icon-success">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path d="M13.3333 4L6 11.3333L2.66667 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                )}
                {emailExists === false && !isCheckingEmail && touched.email && (
                  <div className="input-icon input-icon-warning">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path d="M8 12V8M8 4H8.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                  </div>
                )}
              </div>
              {emailExists === false && !isCheckingEmail && touched.email && (
                <p className="form-hint form-hint-warning">
                  No account found with this email. <Link to="/signup" className="link">Sign up here</Link>
                </p>
              )}
              {emailExists === true && !isCheckingEmail && (
                <p className="form-hint form-hint-success">
                  Account found! You can sign in with this email.
                </p>
              )}
            </div>

            {}
            <div className="form-group">
              <label className="form-label" htmlFor="password">
                Password
                <span className="required">*</span>
              </label>
              <div className="input-wrapper">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  onBlur={handleBlur}
                  className={`form-input ${touched.password && !formData.password ? 'error' : ''}`}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  className="input-icon input-icon-button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                      <path d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                  ) : (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                      <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" stroke="currentColor" strokeWidth="2"/>
                      <path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" stroke="currentColor" strokeWidth="2"/>
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {}
            <div className="form-options">
              <button
                type="button"
                className="forgot-password-link"
                onClick={handleForgotPassword}
                disabled={loading}
              >
                Forgot your password?
              </button>
            </div>

            {}
            <div className="form-actions">
              <button
                type="submit"
                className="btn btn-primary btn-large"
                disabled={loading || emailExists === false}
              >
                {loading ? (
                  <>
                    <svg className="spinner" width="20" height="20" viewBox="0 0 20 20" fill="none">
                      <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeDasharray="50.265" strokeDashoffset="12.566" />
                    </svg>
                    Signing In...
                  </>
                ) : (
                  <>
                   
                    Sign In
                  </>
                )}
              </button>
            </div>
          </form>

          {}
          <div className="signin-footer">
            <p>
              Don't have an account?{' '}
              <Link to="/signup" className="link-button">
                Create one here
              </Link>
            </p>
            <p className="signin-help">
              Having trouble signing in?{' '}
              <a href="mailto:support@domufi.com" className="link">
                Contact Support
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
