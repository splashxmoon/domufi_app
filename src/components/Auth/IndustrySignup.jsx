




import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../lib/auth/localAuthService';
import './AuthStyles.css';

export default function IndustrySignup() {
  const navigate = useNavigate();
  const { signUp } = useAuth();
  
  const [step, setStep] = useState(1); 
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState({ score: 0, label: '', color: '' });

  
  const [formData, setFormData] = useState({
    
    email: '',
    password: '',
    confirmPassword: '',
    
    
    firstName: '',
    lastName: '',
    phone: '',
    dateOfBirth: '',
    
    
    ssnLastFour: '',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: ''
    }
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  
  const calculatePasswordStrength = (password) => {
    if (!password) return { score: 0, label: '', color: '' };
    
    let score = 0;
    const checks = {
      length: password.length >= 8,
      lowercase: /[a-z]/.test(password),
      uppercase: /[A-Z]/.test(password),
      number: /\d/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    };

    score = Object.values(checks).filter(Boolean).length;

    if (score <= 2) return { score, label: 'Weak', color: '#ef4444' };
    if (score === 3) return { score, label: 'Fair', color: '#f59e0b' };
    if (score === 4) return { score, label: 'Good', color: '#10b981' };
    return { score, label: 'Strong', color: '#10b981' };
  };

  
  useEffect(() => {
    const strength = calculatePasswordStrength(formData.password);
    setPasswordStrength(strength);
  }, [formData.password]);

  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }

    
    setTouched(prev => ({ ...prev, [name]: true }));

    
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  
  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    validateField(name);
  };

  
  const validateField = (fieldName) => {
    const newErrors = { ...errors };

    switch (fieldName) {
      case 'email':
        if (!formData.email.trim()) {
          newErrors.email = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
          newErrors.email = 'Please enter a valid email address';
        } else {
          delete newErrors.email;
        }
        break;
      
      case 'password':
        if (!formData.password) {
          newErrors.password = 'Password is required';
        } else if (formData.password.length < 8) {
          newErrors.password = 'Password must be at least 8 characters';
        } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
          newErrors.password = 'Password must contain uppercase, lowercase, and number';
        } else {
          delete newErrors.password;
        }
        break;
      
      case 'confirmPassword':
        if (formData.password !== formData.confirmPassword) {
          newErrors.confirmPassword = 'Passwords do not match';
        } else {
          delete newErrors.confirmPassword;
        }
        break;
      
      case 'firstName':
        if (!formData.firstName.trim()) {
          newErrors.firstName = 'First name is required';
        } else if (formData.firstName.trim().length < 2) {
          newErrors.firstName = 'First name must be at least 2 characters';
        } else {
          delete newErrors.firstName;
        }
        break;
      
      case 'lastName':
        if (!formData.lastName.trim()) {
          newErrors.lastName = 'Last name is required';
        } else if (formData.lastName.trim().length < 2) {
          newErrors.lastName = 'Last name must be at least 2 characters';
        } else {
          delete newErrors.lastName;
        }
        break;
      
      case 'phone':
        if (!formData.phone.trim()) {
          newErrors.phone = 'Phone number is required';
        } else if (!/^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/.test(formData.phone.replace(/\s/g, ''))) {
          newErrors.phone = 'Please enter a valid phone number';
        } else {
          delete newErrors.phone;
        }
        break;
      
      case 'dateOfBirth':
        if (!formData.dateOfBirth) {
          newErrors.dateOfBirth = 'Date of birth is required';
        } else {
          const age = new Date().getFullYear() - new Date(formData.dateOfBirth).getFullYear();
          if (age < 18) {
            newErrors.dateOfBirth = 'You must be at least 18 years old';
          } else if (age > 120) {
            newErrors.dateOfBirth = 'Please enter a valid date of birth';
          } else {
            delete newErrors.dateOfBirth;
          }
        }
        break;

      default:
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  
  const validateStep = (stepNumber) => {
    const newErrors = {};

    if (stepNumber === 1) {
      
      if (!formData.email.trim()) {
        newErrors.email = 'Email is required';
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        newErrors.email = 'Please enter a valid email address';
      }

      if (!formData.password) {
        newErrors.password = 'Password is required';
      } else if (formData.password.length < 8) {
        newErrors.password = 'Password must be at least 8 characters';
      } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
        newErrors.password = 'Password must contain uppercase, lowercase, and number';
      }

      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    } else if (stepNumber === 2) {
      
      if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
      if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
      if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
      else if (!/^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/.test(formData.phone.replace(/\s/g, ''))) {
        newErrors.phone = 'Please enter a valid phone number';
      }
      if (!formData.dateOfBirth) {
        newErrors.dateOfBirth = 'Date of birth is required';
      } else {
        const age = new Date().getFullYear() - new Date(formData.dateOfBirth).getFullYear();
        if (age < 18) newErrors.dateOfBirth = 'You must be at least 18 years old';
      }
    } else if (stepNumber === 3) {
      
      if (!formData.ssnLastFour.trim()) {
        newErrors.ssnLastFour = 'SSN last 4 digits are required';
      } else if (!/^\d{4}$/.test(formData.ssnLastFour)) {
        newErrors.ssnLastFour = 'Please enter exactly 4 digits';
      }
      if (!formData.address.street.trim()) newErrors['address.street'] = 'Street address is required';
      if (!formData.address.city.trim()) newErrors['address.city'] = 'City is required';
      if (!formData.address.state.trim()) newErrors['address.state'] = 'State is required';
      if (!formData.address.zipCode.trim()) {
        newErrors['address.zipCode'] = 'ZIP code is required';
      } else if (!/^\d{5}(-\d{4})?$/.test(formData.address.zipCode)) {
        newErrors['address.zipCode'] = 'Please enter a valid ZIP code';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  
  const handleNext = () => {
    if (validateStep(step)) {
      setStep(step + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  
  const handleBack = () => {
    setStep(step - 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateStep(step)) {
      return;
    }

    if (step < 3) {
      handleNext();
      return;
    }

    
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      console.log('🚀 Starting DEMO signup process...');
      console.log('📋 Form data:', { 
        email: formData.email, 
        firstName: formData.firstName, 
        lastName: formData.lastName 
      });
      
      
      const result = await signUp({
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone,
        dateOfBirth: formData.dateOfBirth,
        ssnLastFour: formData.ssnLastFour,
        address: formData.address
      });

      if (result.success) {
        console.log('✅ User created successfully:', result.user?.id);
        
        
        localStorage.setItem('isNewUser', 'true');
        
        
        setSuccess('Account created successfully! Redirecting to dashboard...');
        setStep(5); 
        
        
        setTimeout(() => {
          navigate('/dashboard');
        }, 2000);
      }

    } catch (err) {
      console.error('❌ Signup error:', err);
      console.error('Error message:', err.message);
      
      
      let errorMessage = err.message || 'Failed to create account. Please try again.';
      
      if (err.message?.includes('User already registered')) {
        errorMessage = '⚠️ This email is already registered. Please use a different email or sign in instead.';
      } else if (err.message?.includes('Invalid email')) {
        errorMessage = '⚠️ Please enter a valid email address.';
      } else if (err.message?.includes('Password should be at least')) {
        errorMessage = '⚠️ Password must be at least 6 characters long.';
      } else if (err.message?.includes('rate limit')) {
        errorMessage = '⚠️ Too many attempts. Please wait a moment and try again.';
      }
      
      setError(errorMessage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setLoading(false);
    }
  };



  
  const usStates = [
    'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
    'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
    'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
    'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
    'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
  ];

  return (
    <div className="signup-page">
      <div className="signup-container">
        <div className="signup-card">
          
          {}
          <div className="signup-header">
            <div className="signup-logo">
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
            <h1 className="signup-title">Create your account</h1>
            <p className="signup-subtitle">
              {step === 1 && "Let's start with your account credentials"}
              {step === 2 && "Tell us a bit about yourself"}
              {step === 3 && "Verify your identity to get started"}
              {step === 5 && "You're all set!"}
            </p>
          </div>

          {}
          {step < 5 && (
            <div className="signup-progress">
              <div className="progress-bar">
                <div 
                  className="progress-fill" 
                  style={{ width: `${(step / 3) * 100}%` }}
                />
              </div>
              <div className="progress-steps">
                <div className={`progress-step ${step >= 1 ? 'active' : ''} ${step > 1 ? 'completed' : ''}`}>
                  <div className="step-indicator">
                    {step > 1 ? (
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path d="M13.3333 4L6 11.3333L2.66667 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    ) : '1'}
                  </div>
                  <span className="step-label">Account</span>
                </div>
                <div className={`progress-step ${step >= 2 ? 'active' : ''} ${step > 2 ? 'completed' : ''}`}>
                  <div className="step-indicator">
                    {step > 2 ? (
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path d="M13.3333 4L6 11.3333L2.66667 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    ) : '2'}
                  </div>
                  <span className="step-label">Personal</span>
                </div>
                <div className={`progress-step ${step >= 3 ? 'active' : ''} ${step > 3 ? 'completed' : ''}`}>
                  <div className="step-indicator">
                    {step > 3 ? (
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path d="M13.3333 4L6 11.3333L2.66667 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    ) : '3'}
                  </div>
                  <span className="step-label">Complete</span>
                </div>
              </div>
            </div>
          )}

          {}
          {success && (
            <div className="signup-alert signup-alert-success">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M10 18C14.4183 18 18 14.4183 18 10C18 5.58172 14.4183 2 10 2C5.58172 2 2 5.58172 2 10C2 14.4183 5.58172 18 10 18Z" stroke="currentColor" strokeWidth="2"/>
                <path d="M6 10L8.5 12.5L14 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span>{success}</span>
            </div>
          )}

          {}
          {error && (
            <div className="signup-alert signup-alert-error">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M10 18C14.4183 18 18 14.4183 18 10C18 5.58172 14.4183 2 10 2C5.58172 2 2 5.58172 2 10C2 14.4183 5.58172 18 10 18Z" stroke="currentColor" strokeWidth="2"/>
                <path d="M10 6V10M10 14H10.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              <span>{error}</span>
            </div>
          )}

          {}
          <form onSubmit={handleSubmit} className="signup-form">
            
            {}
            {step === 1 && (
              <div className="form-content">
                <div className="form-section">
                  <h3 className="section-title">Account Credentials</h3>

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
                        className={`form-input ${errors.email && touched.email ? 'error' : ''} ${formData.email && !errors.email ? 'success' : ''}`}
                        placeholder="you@example.com"
                        autoComplete="email"
                      />
                      {formData.email && !errors.email && (
                        <div className="input-icon input-icon-success">
                          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                            <path d="M13.3333 4L6 11.3333L2.66667 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </div>
                      )}
                    </div>
                    {errors.email && touched.email && (
                      <p className="form-error">{errors.email}</p>
                    )}
                    <p className="form-hint">We'll send a confirmation email to this address</p>
                  </div>

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
                        className={`form-input ${errors.password && touched.password ? 'error' : ''}`}
                        placeholder="Create a strong password"
                        autoComplete="new-password"
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
                    {errors.password && touched.password && (
                      <p className="form-error">{errors.password}</p>
                    )}
                    {formData.password && (
                      <div className="password-strength">
                        <div className="strength-bars">
                          {[1, 2, 3, 4, 5].map((level) => (
                            <div
                              key={level}
                              className={`strength-bar ${level <= passwordStrength.score ? 'active' : ''}`}
                              style={{
                                backgroundColor: level <= passwordStrength.score ? passwordStrength.color : undefined
                              }}
                            />
                          ))}
                        </div>
                        <span className="strength-label" style={{ color: passwordStrength.color }}>
                          {passwordStrength.label}
                        </span>
                      </div>
                    )}
                    <p className="form-hint">Must be at least 8 characters with uppercase, lowercase, and number</p>
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="confirmPassword">
                      Confirm Password
                      <span className="required">*</span>
                    </label>
                    <div className="input-wrapper">
                      <input
                        id="confirmPassword"
                        type={showConfirmPassword ? 'text' : 'password'}
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        onBlur={handleBlur}
                        className={`form-input ${errors.confirmPassword && touched.confirmPassword ? 'error' : ''} ${formData.confirmPassword && !errors.confirmPassword && formData.password === formData.confirmPassword ? 'success' : ''}`}
                        placeholder="Re-enter your password"
                        autoComplete="new-password"
                      />
                      <button
                        type="button"
                        className="input-icon input-icon-button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                      >
                        {showConfirmPassword ? (
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
                      {formData.confirmPassword && !errors.confirmPassword && formData.password === formData.confirmPassword && (
                        <div className="input-icon input-icon-success">
                          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                            <path d="M13.3333 4L6 11.3333L2.66667 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </div>
                      )}
                    </div>
                    {errors.confirmPassword && touched.confirmPassword && (
                      <p className="form-error">{errors.confirmPassword}</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {}
            {step === 2 && (
              <div className="form-content">
                <div className="form-section">
                  <h3 className="section-title">Personal Information</h3>
                  
                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label" htmlFor="firstName">
                        First Name
                        <span className="required">*</span>
                      </label>
                      <input
                        id="firstName"
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        onBlur={handleBlur}
                        className={`form-input ${errors.firstName && touched.firstName ? 'error' : ''}`}
                        placeholder="John"
                        autoComplete="given-name"
                      />
                      {errors.firstName && touched.firstName && (
                        <p className="form-error">{errors.firstName}</p>
                      )}
                    </div>

                    <div className="form-group">
                      <label className="form-label" htmlFor="lastName">
                        Last Name
                        <span className="required">*</span>
                      </label>
                      <input
                        id="lastName"
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        onBlur={handleBlur}
                        className={`form-input ${errors.lastName && touched.lastName ? 'error' : ''}`}
                        placeholder="Doe"
                        autoComplete="family-name"
                      />
                      {errors.lastName && touched.lastName && (
                        <p className="form-error">{errors.lastName}</p>
                      )}
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label" htmlFor="phone">
                        Phone Number
                        <span className="required">*</span>
                      </label>
                      <input
                        id="phone"
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        onBlur={handleBlur}
                        className={`form-input ${errors.phone && touched.phone ? 'error' : ''}`}
                        placeholder="(555) 123-4567"
                        autoComplete="tel"
                      />
                      {errors.phone && touched.phone && (
                        <p className="form-error">{errors.phone}</p>
                      )}
                      <p className="form-hint">We'll send you important updates via SMS</p>
                    </div>

                    <div className="form-group">
                      <label className="form-label" htmlFor="dateOfBirth">
                        Date of Birth
                        <span className="required">*</span>
                      </label>
                      <input
                        id="dateOfBirth"
                        type="date"
                        name="dateOfBirth"
                        value={formData.dateOfBirth}
                        onChange={handleInputChange}
                        onBlur={handleBlur}
                        className={`form-input ${errors.dateOfBirth && touched.dateOfBirth ? 'error' : ''}`}
                        autoComplete="bday"
                        max={new Date(new Date().setFullYear(new Date().getFullYear() - 18)).toISOString().split('T')[0]}
                      />
                      {errors.dateOfBirth && touched.dateOfBirth && (
                        <p className="form-error">{errors.dateOfBirth}</p>
                      )}
                      <p className="form-hint">You must be 18 or older to sign up</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {}
            {step === 3 && (
              <div className="form-content">
                <div className="info-banner">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="2"/>
                    <path d="M12 16V12M12 8H12.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                  <div>
                    <h4>Identity Verification Required</h4>
                    <p>Federal regulations require us to verify your identity. Your information is encrypted and secure.</p>
                  </div>
                </div>

                <div className="form-section">
                  <h3 className="section-title">Verification Details</h3>
                  
                  <div className="form-group">
                    <label className="form-label" htmlFor="ssnLastFour">
                      Last 4 Digits of SSN
                      <span className="required">*</span>
                    </label>
                    <input
                      id="ssnLastFour"
                      type="text"
                      name="ssnLastFour"
                      value={formData.ssnLastFour}
                      onChange={handleInputChange}
                      onBlur={handleBlur}
                      className={`form-input ${errors.ssnLastFour && touched.ssnLastFour ? 'error' : ''}`}
                      placeholder="1234"
                      maxLength="4"
                      pattern="[0-9]*"
                      inputMode="numeric"
                    />
                    {errors.ssnLastFour && touched.ssnLastFour && (
                      <p className="form-error">{errors.ssnLastFour}</p>
                    )}
                    <p className="form-hint">We use this to verify your identity securely</p>
                  </div>

                  <h3 className="section-title">Address Information</h3>

                  <div className="form-group">
                    <label className="form-label" htmlFor="street">
                      Street Address
                      <span className="required">*</span>
                    </label>
                    <input
                      id="street"
                      type="text"
                      name="address.street"
                      value={formData.address.street}
                      onChange={handleInputChange}
                      onBlur={handleBlur}
                      className={`form-input ${errors['address.street'] && touched['address.street'] ? 'error' : ''}`}
                      placeholder="123 Main Street"
                      autoComplete="street-address"
                    />
                    {errors['address.street'] && touched['address.street'] && (
                      <p className="form-error">{errors['address.street']}</p>
                    )}
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label" htmlFor="city">
                        City
                        <span className="required">*</span>
                      </label>
                      <input
                        id="city"
                        type="text"
                        name="address.city"
                        value={formData.address.city}
                        onChange={handleInputChange}
                        onBlur={handleBlur}
                        className={`form-input ${errors['address.city'] && touched['address.city'] ? 'error' : ''}`}
                        placeholder="New York"
                        autoComplete="address-level2"
                      />
                      {errors['address.city'] && touched['address.city'] && (
                        <p className="form-error">{errors['address.city']}</p>
                      )}
                    </div>

                    <div className="form-group">
                      <label className="form-label" htmlFor="state">
                        State
                        <span className="required">*</span>
                      </label>
                      <select
                        id="state"
                        name="address.state"
                        value={formData.address.state}
                        onChange={handleInputChange}
                        onBlur={handleBlur}
                        className={`form-input ${errors['address.state'] && touched['address.state'] ? 'error' : ''}`}
                        autoComplete="address-level1"
                      >
                        <option value="">Select State</option>
                        {usStates.map(state => (
                          <option key={state} value={state}>{state}</option>
                        ))}
                      </select>
                      {errors['address.state'] && touched['address.state'] && (
                        <p className="form-error">{errors['address.state']}</p>
                      )}
                    </div>

                    <div className="form-group">
                      <label className="form-label" htmlFor="zipCode">
                        ZIP Code
                        <span className="required">*</span>
                      </label>
                      <input
                        id="zipCode"
                        type="text"
                        name="address.zipCode"
                        value={formData.address.zipCode}
                        onChange={handleInputChange}
                        onBlur={handleBlur}
                        className={`form-input ${errors['address.zipCode'] && touched['address.zipCode'] ? 'error' : ''}`}
                        placeholder="10001"
                        maxLength="10"
                        autoComplete="postal-code"
                      />
                      {errors['address.zipCode'] && touched['address.zipCode'] && (
                        <p className="form-error">{errors['address.zipCode']}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}


            {}
            {step === 5 && (
              <div className="form-content">
                <div className="success-screen">
                  <div className="success-icon">
                    <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
                      <circle cx="32" cy="32" r="32" fill="#10b981" fillOpacity="0.1"/>
                      <circle cx="32" cy="32" r="24" fill="#10b981"/>
                      <path d="M24 32L29.3333 37.3333L40 26.6667" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <h2 className="success-title">Welcome to Domufi!</h2>
                  <p className="success-message">
                    Your account has been created successfully!
                    <br />
                    Redirecting to your dashboard...
                  </p>
                  <div className="success-actions">
                    <button
                      type="button"
                      className="btn btn-primary btn-large"
                      onClick={() => navigate('/dashboard')}
                    >
                      Go to Dashboard Now
                    </button>
                  </div>
                  <p className="redirect-note" style={{ fontSize: '13px', color: '#9ca3af', marginTop: '12px' }}>
                    You'll be automatically redirected in 2 seconds...
                  </p>
                </div>
              </div>
            )}

            {}
            {step < 5 && (
              <div className="form-actions">
                {step > 1 && (
                  <button 
                    type="button" 
                    className="btn btn-secondary"
                    onClick={handleBack}
                    disabled={loading}
                  >
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                      <path d="M12.5 15L7.5 10L12.5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    Back
                  </button>
                )}
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <svg className="spinner" width="20" height="20" viewBox="0 0 20 20" fill="none">
                        <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeDasharray="50.265" strokeDashoffset="12.566" />
                      </svg>
                      Creating Account...
                    </>
                  ) : (
                    <>
                      {step === 3 ? 'Create Account' : 'Continue'}
                      {step < 3 && (
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                          <path d="M7.5 15L12.5 10L7.5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      )}
                    </>
                  )}
                </button>
              </div>
            )}
          </form>

          {}
          {step < 5 && (
            <div className="signup-footer">
              <p>
                Already have an account?{' '}
                <button 
                  type="button"
                  className="link-button"
                  onClick={() => navigate('/signin')}
                >
                  Sign in
                </button>
              </p>
              <p className="terms-text">
                By creating an account, you agree to our{' '}
                <a href="/terms" className="link">Terms of Service</a>
                {' '}and{' '}
                <a href="/privacy" className="link">Privacy Policy</a>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
