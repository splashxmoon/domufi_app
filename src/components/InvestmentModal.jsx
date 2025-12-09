import React, { useState, useMemo } from 'react';
import { useInvestments } from '../contexts/InvestmentContext';
import { useWallet } from '../contexts/WalletContext';

export default function InvestmentModal({ property, tokenAmount: initialTokenAmount, onClose, onConfirm }) {
  const { addInvestment } = useInvestments();
  const { connectedAccounts } = useWallet();
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [tokenAmount, setTokenAmount] = useState(initialTokenAmount || 1);

  
  const paymentMethods = useMemo(() => {
    const methods = [];

    
    connectedAccounts.forEach(account => {
      let displayName = '';
      if (account.type === 'bank') {
        
        const bankName = account.bankName || 'Bank Account';
        const last4 = account.accountNumber || account.last4 || '';
        displayName = last4 ? `${bankName} ••••${last4}` : bankName;
      } else {
        
        const cardBrand = account.cardBrand || 'Credit Card';
        const last4 = account.last4 || '';
        displayName = last4 ? `${cardBrand} ••••${last4}` : cardBrand;
      }
      
      methods.push({
        id: account.id,
        type: account.type,
        name: displayName,
        icon: account.type,
        balance: null, 
        default: false,
        primary: account.primary
      });
    });

    return methods;
  }, [connectedAccounts]);

  
  const defaultPaymentMethod = useMemo(() => {
    const primary = paymentMethods.find(m => m.primary);
    if (primary) return primary.id;
    return paymentMethods.length > 0 ? paymentMethods[0].id : null;
  }, [paymentMethods]);

  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(defaultPaymentMethod || null);

  
  const tokenPrice = property.tokenPrice;
  const subtotal = tokenAmount * tokenPrice;
  const platformFee = subtotal * 0.025; 
  const total = subtotal + platformFee;

  const selectedMethod = selectedPaymentMethod ? paymentMethods.find(m => m.id === selectedPaymentMethod) : null;
  const hasInsufficientFunds = selectedMethod?.balance !== null && selectedMethod?.balance !== undefined && selectedMethod.balance < total;

  const handleInvest = async () => {
    if (hasInsufficientFunds || !agreedToTerms) return;
    
    setProcessing(true);
    
    setTimeout(() => {
      const investmentData = {
        property,
        tokenAmount,
        total,
        paymentMethod: selectedMethod
      };
      
      
      addInvestment(investmentData);
      
      setProcessing(false);
      onConfirm(investmentData);
    }, 2000);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  return (
    <div className="investment-modal-overlay" onClick={onClose}>
      <div className="investment-modal" onClick={(e) => e.stopPropagation()}>
        {}
        <div className="modal-header">
          <div className="modal-header-content">
            <h2 className="modal-title">Complete Your Investment</h2>
            <p className="modal-subtitle">Review your investment details and confirm your purchase</p>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>

        {}
        <div className="modal-body">
          {}
          <div className="investment-section">
            <h3 className="section-title">Investment Summary</h3>
            <div className="property-summary-card">
              <div className="property-summary-icon">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                  <path d="M3 7V17C3 18.1046 3.89543 19 5 19H19C20.1046 19 21 18.1046 21 17V7M3 7H21M3 7L12 3L21 7M12 3V19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div className="property-summary-info">
                <h4 className="property-summary-name">{property.name}</h4>
                <p className="property-summary-location">{property.city}</p>
              </div>
            </div>
          </div>

          {}
          <div className="investment-section">
            <h3 className="section-title">Number of Tokens</h3>
            <div className="modal-token-selector">
              <button 
                className="token-selector-btn"
                onClick={() => setTokenAmount(Math.max(1, tokenAmount - 1))}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path d="M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
              <div className="token-selector-display">
                <input
                  type="number"
                  className="token-selector-input"
                  value={tokenAmount}
                  onChange={(e) => setTokenAmount(Math.max(1, parseInt(e.target.value) || 1))}
                  min="1"
                />
                <span className="token-selector-label">tokens</span>
              </div>
              <button 
                className="token-selector-btn"
                onClick={() => setTokenAmount(tokenAmount + 1)}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>
            <div className="token-selector-info">
              <span className="token-price-label">Price per token:</span>
              <span className="token-price-value">{formatCurrency(property.tokenPrice)}</span>
            </div>
          </div>

          {}
          <div className="investment-section">
            <h3 className="section-title">Payment Method</h3>
            <div className="payment-methods-list">
              {paymentMethods.map((method) => (
                <div
                  key={method.id}
                  className={`payment-method-item ${selectedPaymentMethod === method.id ? 'selected' : ''}`}
                  onClick={() => setSelectedPaymentMethod(method.id)}
                >
                  <div className="payment-method-radio">
                    <div className="radio-outer">
                      <div className="radio-inner"></div>
                    </div>
                  </div>
                  <div className="payment-method-icon">
                    {method.type === 'card' && (
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                        <rect x="2" y="5" width="20" height="14" rx="2" stroke="currentColor" strokeWidth="2"/>
                        <path d="M2 10H22" stroke="currentColor" strokeWidth="2"/>
                      </svg>
                    )}
                    {method.type === 'bank' && (
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                        <path d="M3 7V17C3 18.1046 3.89543 19 5 19H19C20.1046 19 21 18.1046 21 17V7M3 7H21M3 7L12 3L21 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    )}
                    {method.type === 'wallet' && (
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                        <path d="M21 12V7C21 5.89543 20.1046 5 19 5H5C3.89543 5 3 5.89543 3 7V17C3 18.1046 3.89543 19 5 19H19C20.1046 19 21 18.1046 21 17V16M21 12H18C16.8954 12 16 12.8954 16 14C16 15.1046 16.8954 16 18 16H21M21 12V16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    )}
                  </div>
                  <div className="payment-method-info">
                    <span className="payment-method-name">{method.name}</span>
                    {method.balance !== null && (
                      <span className="payment-method-balance">
                        Available: {formatCurrency(method.balance)}
                      </span>
                    )}
                  </div>
                  {method.default && (
                    <span className="payment-default-badge">Wallet</span>
                  )}
                  {method.primary && (
                    <span className="payment-default-badge">Primary</span>
                  )}
                </div>
              ))}
            </div>
            {connectedAccounts.length === 0 && (
              <div className="insufficient-funds-warning">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M12 9V13M12 17H12.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span>Please add a payment method in your Wallet to make investments</span>
              </div>
            )}
            {hasInsufficientFunds && (
              <div className="insufficient-funds-warning">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M12 9V13M12 17H12.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span>Insufficient funds in this account. Please select another payment method.</span>
              </div>
            )}
          </div>

          {}
          <div className="investment-section">
            <h3 className="section-title">Cost Breakdown</h3>
            <div className="cost-breakdown-card">
              <div className="cost-item">
                <span className="cost-label">
                  {tokenAmount} tokens × {formatCurrency(tokenPrice)}
                </span>
                <span className="cost-value">{formatCurrency(subtotal)}</span>
              </div>
              <div className="cost-item">
                <span className="cost-label">
                  Platform Fee (2.5%)
                  <span className="info-tooltip">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                      <path d="M12 16V12M12 8H12.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                  </span>
                </span>
                <span className="cost-value">{formatCurrency(platformFee)}</span>
              </div>
              <div className="cost-divider"></div>
              <div className="cost-item cost-total">
                <span className="cost-label">Total Amount</span>
                <span className="cost-value">{formatCurrency(total)}</span>
              </div>
            </div>
          </div>

          {}
          <div className="investment-section">
            <h3 className="section-title">Investment Details</h3>
            <div className="investment-details-grid">
              <div className="detail-item">
                <span className="detail-label">Expected Annual Return</span>
                <span className="detail-value positive">{property.annualROI}%</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Est. Annual Income</span>
                <span className="detail-value positive">
                  {formatCurrency(subtotal * (property.annualROI / 100))}
                </span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Est. Monthly Income</span>
                <span className="detail-value positive">
                  {formatCurrency((subtotal * (property.annualROI / 100)) / 12)}
                </span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Token Lock Period</span>
                <span className="detail-value">30 days</span>
              </div>
            </div>
          </div>

          {}
          <div className="investment-section">
            <div className="terms-checkbox">
              <label className="checkbox-container">
                <input
                  type="checkbox"
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                />
                <span className="checkbox-custom"></span>
                <span className="checkbox-label">
                  I agree to the{' '}
                  <a href="#" className="terms-link" onClick={(e) => e.preventDefault()}>
                    Terms of Service
                  </a>
                  {' '}and{' '}
                  <a href="#" className="terms-link" onClick={(e) => e.preventDefault()}>
                    Investment Agreement
                  </a>
                </span>
              </label>
            </div>
          </div>
        </div>

        {}
        <div className="modal-footer">
          <button className="btn btn-secondary btn-modal" onClick={onClose}>
            Cancel
          </button>
          <button
            className="btn btn-primary btn-modal"
            onClick={handleInvest}
            disabled={!agreedToTerms || hasInsufficientFunds || processing}
          >
            {processing ? (
              <>
                <span className="btn-spinner"></span>
                Processing...
              </>
            ) : (
              <>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path d="M5 13L9 17L19 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Confirm Investment
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

