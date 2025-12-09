



import React, { useState } from 'react';
import { useAuth } from '../../lib/auth/localAuthService';
import './AuthStyles.css';

export default function KYCModal({ isOpen, onClose, onComplete }) {
  const { completeKYC, user, profile } = useAuth();
  
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  
  const [kycData, setKycData] = useState({
    firstName: profile?.firstName || '',
    lastName: profile?.lastName || '',
    phone: profile?.phone || '',
    dateOfBirth: profile?.dateOfBirth || '',
    ssnLastFour: '',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: ''
    }
  });

  const [errors, setErrors] = useState({});

  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setKycData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setKycData(prev => ({
        ...prev,
        [name]: value
      }));
    }

    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  
  const validateForm = () => {
    const newErrors = {};

    if (!kycData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!kycData.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!kycData.phone.trim()) newErrors.phone = 'Phone number is required';
    if (!kycData.dateOfBirth) newErrors.dateOfBirth = 'Date of birth is required';
    if (!kycData.ssnLastFour.trim()) newErrors.ssnLastFour = 'SSN last 4 digits are required';
    else if (!/^\d{4}$/.test(kycData.ssnLastFour)) newErrors.ssnLastFour = 'SSN must be 4 digits';
    if (!kycData.address.street.trim()) newErrors['address.street'] = 'Street address is required';
    if (!kycData.address.city.trim()) newErrors['address.city'] = 'City is required';
    if (!kycData.address.state.trim()) newErrors['address.state'] = 'State is required';
    if (!kycData.address.zipCode.trim()) newErrors['address.zipCode'] = 'ZIP code is required';
    else if (!/^\d{5}(-\d{4})?$/.test(kycData.address.zipCode)) newErrors['address.zipCode'] = 'ZIP code is invalid';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!validateForm()) return;

    setLoading(true);
    try {
      await completeKYC(kycData);
      setSuccess('KYC verification submitted successfully!');
      setTimeout(() => {
        onComplete();
        onClose();
      }, 2000);
    } catch (err) {
      setError(err.message || 'Failed to submit KYC verification');
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

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-container kyc-modal">
        <div className="modal-header">
          <h2 className="modal-title">Complete KYC Verification</h2>
          <p className="modal-subtitle">
            To start investing, we need to verify your identity for regulatory compliance.
          </p>
          <button className="modal-close" onClick={onClose}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <line x1="18" y1="6" x2="6" y2="18" stroke="currentColor" strokeWidth="2"/>
              <line x1="6" y1="6" x2="18" y2="18" stroke="currentColor" strokeWidth="2"/>
            </svg>
          </button>
        </div>

        <div className="modal-content">
          {error && (
            <div className="alert alert-error">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                <line x1="15" y1="9" x2="9" y2="15" stroke="currentColor" strokeWidth="2"/>
                <line x1="9" y1="9" x2="15" y2="15" stroke="currentColor" strokeWidth="2"/>
              </svg>
              {error}
            </div>
          )}

          {success && (
            <div className="alert alert-success">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" stroke="currentColor" strokeWidth="2"/>
                <polyline points="22,4 12,14.01 9,11.01" stroke="currentColor" strokeWidth="2"/>
              </svg>
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="kyc-form">
            <div className="form-section">
              <h3 className="section-title">Personal Information</h3>
              
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">First Name *</label>
                  <input
                    type="text"
                    name="firstName"
                    value={kycData.firstName}
                    onChange={handleInputChange}
                    className={`form-input ${errors.firstName ? 'error' : ''}`}
                    placeholder="Enter your first name"
                  />
                  {errors.firstName && <span className="form-error">{errors.firstName}</span>}
                </div>

                <div className="form-group">
                  <label className="form-label">Last Name *</label>
                  <input
                    type="text"
                    name="lastName"
                    value={kycData.lastName}
                    onChange={handleInputChange}
                    className={`form-input ${errors.lastName ? 'error' : ''}`}
                    placeholder="Enter your last name"
                  />
                  {errors.lastName && <span className="form-error">{errors.lastName}</span>}
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Phone Number *</label>
                  <input
                    type="tel"
                    name="phone"
                    value={kycData.phone}
                    onChange={handleInputChange}
                    className={`form-input ${errors.phone ? 'error' : ''}`}
                    placeholder="(555) 123-4567"
                  />
                  {errors.phone && <span className="form-error">{errors.phone}</span>}
                </div>

                <div className="form-group">
                  <label className="form-label">Date of Birth *</label>
                  <input
                    type="date"
                    name="dateOfBirth"
                    value={kycData.dateOfBirth}
                    onChange={handleInputChange}
                    className={`form-input ${errors.dateOfBirth ? 'error' : ''}`}
                  />
                  {errors.dateOfBirth && <span className="form-error">{errors.dateOfBirth}</span>}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">SSN Last 4 Digits *</label>
                <input
                  type="text"
                  name="ssnLastFour"
                  value={kycData.ssnLastFour}
                  onChange={handleInputChange}
                  className={`form-input ${errors.ssnLastFour ? 'error' : ''}`}
                  placeholder="1234"
                  maxLength="4"
                />
                {errors.ssnLastFour && <span className="form-error">{errors.ssnLastFour}</span>}
                <p className="form-help">We only need the last 4 digits for verification</p>
              </div>
            </div>

            <div className="form-section">
              <h3 className="section-title">Address Information</h3>
              
              <div className="form-group">
                <label className="form-label">Street Address *</label>
                <input
                  type="text"
                  name="address.street"
                  value={kycData.address.street}
                  onChange={handleInputChange}
                  className={`form-input ${errors['address.street'] ? 'error' : ''}`}
                  placeholder="123 Main Street"
                />
                {errors['address.street'] && <span className="form-error">{errors['address.street']}</span>}
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">City *</label>
                  <input
                    type="text"
                    name="address.city"
                    value={kycData.address.city}
                    onChange={handleInputChange}
                    className={`form-input ${errors['address.city'] ? 'error' : ''}`}
                    placeholder="New York"
                  />
                  {errors['address.city'] && <span className="form-error">{errors['address.city']}</span>}
                </div>

                <div className="form-group">
                  <label className="form-label">State *</label>
                  <select
                    name="address.state"
                    value={kycData.address.state}
                    onChange={handleInputChange}
                    className={`form-input ${errors['address.state'] ? 'error' : ''}`}
                  >
                    <option value="">Select State</option>
                    {usStates.map(state => (
                      <option key={state} value={state}>{state}</option>
                    ))}
                  </select>
                  {errors['address.state'] && <span className="form-error">{errors['address.state']}</span>}
                </div>

                <div className="form-group">
                  <label className="form-label">ZIP Code *</label>
                  <input
                    type="text"
                    name="address.zipCode"
                    value={kycData.address.zipCode}
                    onChange={handleInputChange}
                    className={`form-input ${errors['address.zipCode'] ? 'error' : ''}`}
                    placeholder="12345"
                  />
                  {errors['address.zipCode'] && <span className="form-error">{errors['address.zipCode']}</span>}
                </div>
              </div>
            </div>

            <div className="form-section">
              <div className="kyc-notice">
                <div className="notice-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="currentColor" strokeWidth="2"/>
                    <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="2"/>
                  </svg>
                </div>
                <div className="notice-content">
                  <h4>Your Information is Secure</h4>
                  <p>
                    We use bank-level encryption to protect your personal information. 
                    Your data is only used for identity verification and regulatory compliance.
                  </p>
                </div>
              </div>
            </div>

            <div className="form-actions">
              <button 
                type="button" 
                className="btn btn-secondary"
                onClick={onClose}
                disabled={loading}
              >
                Skip for Now
              </button>
              <button 
                type="submit" 
                className="btn btn-primary"
                disabled={loading}
              >
                {loading ? 'Submitting...' : 'Complete Verification'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
