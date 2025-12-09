import React, { useState } from 'react';

export default function ApplyToTokenize() {
  const [formData, setFormData] = useState({
    
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    propertyAddress: '',
    
    
    propertyType: '',
    occupancyStatus: '',
    propertyCondition: '',
    propertySize: '',
    propertySizeUnit: 'sqft',
    sellTimeline: '',
    propertyIssues: [],
    otherIssue: '',
    
    
    generatingRentalIncome: '',
    monthlyRent: '',
    leaseAgreement: '',
    
    
    mortgagesLiens: '',
    titleDeed: '',
    ownershipPercentage: '',
    cityState: '',
    
    
    additionalComments: ''
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');
  const [currentStep, setCurrentStep] = useState(1);
  const [showForm, setShowForm] = useState(false);

  const totalSteps = 5;
  const steps = [
    { number: 1, title: 'Personal Info', section: 'personal', icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21M16 7C16 9.20914 14.2091 11 12 11C9.79086 11 8 9.20914 8 7C8 4.79086 9.79086 3 12 3C14.2091 3 16 4.79086 16 7Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    )},
    { number: 2, title: 'Property Details', section: 'property', icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path d="M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    )},
    { number: 3, title: 'Rental Info', section: 'rental', icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path d="M12 2V22M17 5H9.5C8.11929 5 7 6.11929 7 7.5S8.11929 10 9.5 10H14.5C15.8807 10 17 11.1193 17 12.5S15.8807 15 14.5 15H7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    )},
    { number: 4, title: 'Legal Info', section: 'legal', icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path d="M9 12H15M9 16H15M17 21H7C5.89543 21 5 20.1046 5 19V5C5 3.89543 5.89543 3 7 3H12.5858C12.851 3 13.1054 3.10536 13.2929 3.29289L18.7071 8.70711C18.8946 8.89464 19 9.149 19 9.41421V19C19 20.1046 18.1046 21 17 21Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    )},
    { number: 5, title: 'Review', section: 'review', icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    )}
  ];

  const propertyTypes = [
    'Single Family Home',
    'Multi-Family Home', 
    'Apartment Condo',
    'Other'
  ];

  const occupancyStatuses = [
    { value: 'tenant-occupied', label: 'Tenant-Occupied', points: 10 },
    { value: 'owner-occupied', label: 'Owner-Occupied', points: 8 },
    { value: 'vacant-short', label: 'Vacant (<6 mo)', points: 6 }
  ];

  const propertyConditions = [
    { value: 'nearly-new', label: 'Nearly New (Built within the last 5 years, minimal wear)', points: 10 },
    { value: 'excellent', label: 'Excellent (Recently renovated, no major repairs needed)', points: 9 },
    { value: 'well-maintained', label: 'Well Maintained (Normal wear, but everything works)', points: 8 },
    { value: 'worn-adequate', label: 'Worn but Adequate (Minor repairs needed, but everything works)', points: 6, flag: true }
  ];

  const sizeUnits = ['sqft', 'sqm'];

  const sellTimelines = [
    { value: 'asap', label: 'As soon as possible', points: 3 },
    { value: '2-4-weeks', label: '2-4 weeks', points: 3 },
    { value: '4-6-weeks', label: '4-6 weeks', points: 3 },
    { value: '6-plus-weeks', label: '6 or more weeks', points: 1 }
  ];

  const propertyIssues = [
    { value: 'none', label: 'None of the above', points: 8 },
    { value: 'foundation', label: 'Known foundation issues', points: 0, reject: true },
    { value: 'roof', label: 'Known roof issues', points: 0, reject: true },
    { value: 'hvac', label: 'Known HVAC', points: 0, reject: true },
    { value: 'fire-damage', label: 'Fire damage', points: 0, reject: true },
    { value: 'asbestos', label: 'Asbestos Siding', points: 0, reject: true },
    { value: 'mobile', label: 'Mobile or manufactured home', points: 0, reject: true },
    { value: 'lead-paint', label: 'Lead-based paint', points: 0, reject: true },
    { value: 'legal-dispute', label: 'Pending legal dispute (e.g., title issues, zoning problem)', points: 0, reject: true },
    { value: 'other', label: 'Other (Please specify)', points: 3, flag: true }
  ];

  const rentalIncomeOptions = [
    { value: 'yes', label: 'Yes', points: 5 },
    { value: 'no', label: 'No', points: 3 }
  ];

  const leaseAgreements = [
    { value: '6-plus-months', label: '>6 months', points: 3 },
    { value: 'month-to-month', label: 'Month-to-month', points: 2 },
    { value: 'short-term', label: 'Short-term/Airbnb', points: 1 }
  ];

  const mortgageOptions = [
    { value: 'paid-off', label: 'No, the property is fully paid off', points: 10 },
    { value: 'has-mortgage', label: 'Yes, I have a mortgage', points: 5, flag: true },
    { value: 'has-lien', label: 'Yes, there is a lien or legal claim on the property', points: 5 }
  ];

  const titleDeedOptions = [
    { value: 'clear-title', label: 'Yes, I have a clear title deed', points: 10 },
    { value: 'getting-title', label: 'No, but I am in the process of getting it.', points: 5, flag: true }
  ];

  const ownershipPercentages = [
    { value: '50-plus', label: '≥50%', points: 8 },
    { value: '20-49', label: '20–49%', points: 6 },
    { value: '10-19', label: '10–19%', points: 3 }
  ];

  const cities = [
    'Houston, TX',
    'Tampa, FL', 
    'Phoenix, AZ'
  ];

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (type === 'checkbox') {
      const newValue = checked 
        ? [...formData[name], value]
        : formData[name].filter(item => item !== value);
      setFormData(prev => ({ ...prev, [name]: newValue }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateStep = (step) => {
    const newErrors = {};
    
    switch(step) {
      case 1: 
        if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
        if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
        if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
        if (!formData.email.trim()) newErrors.email = 'Email is required';
        
        
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (formData.email && !emailRegex.test(formData.email)) {
          newErrors.email = 'Please enter a valid email address';
        }
        
        
        const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
        if (formData.phone && !phoneRegex.test(formData.phone.replace(/[\s\-\(\)]/g, ''))) {
          newErrors.phone = 'Please enter a valid phone number';
        }
        break;
        
      case 2: 
        if (!formData.propertyAddress.trim()) newErrors.propertyAddress = 'Property address is required';
        if (!formData.propertyType) newErrors.propertyType = 'Property type is required';
        if (!formData.occupancyStatus) newErrors.occupancyStatus = 'Occupancy status is required';
        if (!formData.propertyCondition) newErrors.propertyCondition = 'Property condition is required';
        if (!formData.propertySize) newErrors.propertySize = 'Property size is required';
        if (!formData.sellTimeline) newErrors.sellTimeline = 'Sell timeline is required';
        if (!formData.cityState) newErrors.cityState = 'City and state is required';
        
        
        if (formData.propertySize && (isNaN(formData.propertySize) || formData.propertySize < 300 || formData.propertySize > 5000)) {
          newErrors.propertySize = 'Property size must be between 300 and 5,000 square feet';
        }
        break;
        
      case 3: 
        if (!formData.generatingRentalIncome) newErrors.generatingRentalIncome = 'Please select an option';
        if (formData.generatingRentalIncome === 'yes') {
          if (!formData.monthlyRent) newErrors.monthlyRent = 'Monthly rent is required';
          if (formData.monthlyRent && (isNaN(formData.monthlyRent) || formData.monthlyRent < 0)) {
            newErrors.monthlyRent = 'Please enter a valid monthly rent amount';
          }
        }
        break;
        
      case 4: 
        if (!formData.mortgagesLiens) newErrors.mortgagesLiens = 'Mortgage/liens information is required';
        if (!formData.titleDeed) newErrors.titleDeed = 'Title deed information is required';
        if (!formData.ownershipPercentage) newErrors.ownershipPercentage = 'Ownership percentage is required';
        break;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      if (currentStep < totalSteps) {
        setCurrentStep(currentStep + 1);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    
    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    if (!formData.propertyAddress.trim()) newErrors.propertyAddress = 'Property address is required';
    if (!formData.propertyType) newErrors.propertyType = 'Property type is required';
    if (!formData.occupancyStatus) newErrors.occupancyStatus = 'Occupancy status is required';
    if (!formData.propertyCondition) newErrors.propertyCondition = 'Property condition is required';
    if (!formData.propertySize) newErrors.propertySize = 'Property size is required';
    if (!formData.sellTimeline) newErrors.sellTimeline = 'Sell timeline is required';
    if (!formData.mortgagesLiens) newErrors.mortgagesLiens = 'Mortgage/liens information is required';
    if (!formData.titleDeed) newErrors.titleDeed = 'Title deed information is required';
    if (!formData.ownershipPercentage) newErrors.ownershipPercentage = 'Ownership percentage is required';
    if (!formData.cityState) newErrors.cityState = 'City and state is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      setCurrentStep(1);
      setSubmitMessage({ type: 'error', text: 'Please fix the errors and try again.' });
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    
    setIsSubmitting(true);
    setSubmitMessage('');
    
    try {
      
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setSubmitMessage({ type: 'success', text: 'Application submitted successfully! We will review your property and get back to you within 2-3 business days.' });
      
      
      setFormData({
        firstName: '',
        lastName: '',
        phone: '',
        email: '',
        propertyAddress: '',
        propertyType: '',
        occupancyStatus: '',
        propertyCondition: '',
        propertySize: '',
        propertySizeUnit: 'sqft',
        sellTimeline: '',
        propertyIssues: [],
        otherIssue: '',
        generatingRentalIncome: '',
        monthlyRent: '',
        leaseAgreement: '',
        mortgagesLiens: '',
        titleDeed: '',
        ownershipPercentage: '',
        cityState: '',
        additionalComments: ''
      });
      
      setCurrentStep(1);
      
    } catch (error) {
      setSubmitMessage({ type: 'error', text: 'Failed to submit application. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const progressPercentage = ((currentStep - 1) / (totalSteps - 1)) * 100;

  return (
    <div id="apply-tokenize" className="page-section active">
      <div className="apply-tokenize-container">
        {!showForm ? (
          
          <div className="tokenize-landing-compact">
            {}
            <div className="landing-hero-compact">
              <div className="landing-icon-compact">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
                  <path d="M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <h1 className="landing-title-compact">Tokenize Your Property</h1>
              <p className="landing-subtitle-compact">
                Transform your real estate into digital tokens and unlock liquidity. Complete the application to get started.
              </p>
            </div>

            {}
            <div className="landing-content-grid">
              {}
              <div className="landing-card-compact">
                <div className="landing-card-header">
                  <h2 className="landing-card-title">What is Tokenization?</h2>
                </div>
                <p className="landing-card-description">
                  Convert your real estate into digital tokens on the blockchain. 
                  This enables fractional ownership and trading without selling your entire property.
                </p>
                
                <div className="benefits-compact">
                  <div className="benefit-item-compact">
                    <div className="benefit-icon-compact">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                        <path d="M12 2V22M17 5H9.5C8.11929 5 7 6.11929 7 7.5S8.11929 10 9.5 10H14.5C15.8807 10 17 11.1193 17 12.5S15.8807 15 14.5 15H7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                    <div className="benefit-text-compact">
                      <strong>Unlock Liquidity</strong>
                      <span>Access your property equity without selling</span>
                    </div>
                  </div>
                  <div className="benefit-item-compact">
                    <div className="benefit-icon-compact">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                        <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                    <div className="benefit-text-compact">
                      <strong>Fractional Ownership</strong>
                      <span>Divide property into affordable shares</span>
                    </div>
                  </div>
                  <div className="benefit-item-compact">
                    <div className="benefit-icon-compact">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                        <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                    <div className="benefit-text-compact">
                      <strong>Secure & Transparent</strong>
                      <span>Blockchain ensures safe ownership records</span>
                    </div>
                  </div>
                  <div className="benefit-item-compact">
                    <div className="benefit-icon-compact">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                        <path d="M13 7H21M21 7V15M21 7L13 15L9 11L3 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                    <div className="benefit-text-compact">
                      <strong>Passive Income</strong>
                      <span>Continue earning rental income</span>
                    </div>
                  </div>
                </div>
              </div>

              {}
              <div className="landing-card-compact">
                <div className="landing-card-header">
                  <h2 className="landing-card-title">How It Works</h2>
                </div>
                <p className="landing-card-description">
                  Our simple 5-step process to tokenize your property
                </p>
                <div className="process-compact">
                  <div className="process-item-compact">
                    <div className="process-number-compact">1</div>
                    <div className="process-text-compact">
                      <strong>Submit Property</strong>
                      <span>Fill out application with property details</span>
                    </div>
                  </div>
                  <div className="process-item-compact">
                    <div className="process-number-compact">2</div>
                    <div className="process-text-compact">
                      <strong>Property Evaluation</strong>
                      <span>Professional valuation & review</span>
                    </div>
                  </div>
                  <div className="process-item-compact">
                    <div className="process-number-compact">3</div>
                    <div className="process-text-compact">
                      <strong>Legal & Compliance</strong>
                      <span>Handle documentation & regulations</span>
                    </div>
                  </div>
                  <div className="process-item-compact">
                    <div className="process-number-compact">4</div>
                    <div className="process-text-compact">
                      <strong>Token Creation</strong>
                      <span>Create digital tokens on blockchain</span>
                    </div>
                  </div>
                  <div className="process-item-compact">
                    <div className="process-number-compact">5</div>
                    <div className="process-text-compact">
                      <strong>Launch & Trade</strong>
                      <span>List on marketplace for investors</span>
                    </div>
                  </div>
                </div>
              </div>

              {}
              <div className="landing-card-compact">
                <div className="landing-card-header">
                  <h2 className="landing-card-title">Property Requirements</h2>
                </div>
                <p className="landing-card-description">
                  Your property must meet these criteria to qualify
                </p>
                <div className="requirements-compact">
                  <div className="requirement-item-compact">
                    <div className="requirement-icon-compact">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                        <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                    <span>Clear title deed</span>
                  </div>
                  <div className="requirement-item-compact">
                    <div className="requirement-icon-compact">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                        <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                    <span>Property value $100K or more</span>
                  </div>
                  <div className="requirement-item-compact">
                    <div className="requirement-icon-compact">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                        <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                    <span>Located in supported cities</span>
                  </div>
                  <div className="requirement-item-compact">
                    <div className="requirement-icon-compact">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                        <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                    <span>Good condition, no major issues</span>
                  </div>
                  <div className="requirement-item-compact">
                    <div className="requirement-icon-compact">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                        <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                    <span>Minimum 10% ownership stake</span>
                  </div>
                  <div className="requirement-item-compact">
                    <div className="requirement-icon-compact">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                        <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                    <span>No pending legal disputes</span>
                  </div>
                </div>

                {}
                <div className="landing-cta-compact">
                  <button 
                    className="btn btn-primary btn-compact-landing"
                    onClick={() => {
                      setShowForm(true);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                      <path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    Start Application
                  </button>
                  <p className="cta-hint-compact">
                    Takes 10-15 minutes
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <>

        {}
        <div className="form-progress-container">
          <div className="form-progress-bar">
            <div 
              className="form-progress-fill" 
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
          <div className="form-progress-steps">
            {steps.map((step) => (
              <button
                key={step.number}
                type="button"
                onClick={() => {
                  if (validateStep(currentStep)) {
                    setCurrentStep(step.number);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }
                }}
                className={`progress-step ${currentStep >= step.number ? 'active' : ''} ${currentStep === step.number ? 'current' : ''}`}
                disabled={isSubmitting}
              >
                <div className="progress-step-number">
                  {currentStep > step.number ? (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path d="M5 13L9 17L19 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  ) : (
                    step.number
                  )}
                </div>
                <span className="progress-step-label">{step.title}</span>
              </button>
            ))}
          </div>
        </div>

        {}
        <form onSubmit={handleSubmit} className="apply-tokenize-form">

          {}
          {currentStep === 1 && (
            <div className="form-section active">
              <div className="section-header">
                <div className="section-header-content">
                  <h2 className="section-title">Personal Information</h2>
                  <p className="section-description">Tell us about yourself so we can get in touch</p>
                </div>
                <div className="section-icon">
                  {steps[0].icon}
                </div>
              </div>
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label required">First Name</label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    className={`form-input ${errors.firstName ? 'error' : ''}`}
                    placeholder="Enter your first name"
                  />
                  {errors.firstName && <span className="error-message">{errors.firstName}</span>}
                </div>

                <div className="form-group">
                  <label className="form-label required">Last Name</label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    className={`form-input ${errors.lastName ? 'error' : ''}`}
                    placeholder="Enter your last name"
                  />
                  {errors.lastName && <span className="error-message">{errors.lastName}</span>}
                </div>

                <div className="form-group">
                  <label className="form-label required">Phone Number</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className={`form-input ${errors.phone ? 'error' : ''}`}
                    placeholder="Enter your phone number"
                  />
                  {errors.phone && <span className="error-message">{errors.phone}</span>}
                </div>

                <div className="form-group">
                  <label className="form-label required">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={`form-input ${errors.email ? 'error' : ''}`}
                    placeholder="Enter your email address"
                  />
                  {errors.email && <span className="error-message">{errors.email}</span>}
                </div>
              </div>
            </div>
          )}

          {}
          {currentStep === 2 && (
            <div className="form-section active">
              <div className="section-header">
                <div className="section-header-content">
                  <h2 className="section-title">Property Information</h2>
                  <p className="section-description">Details about the property you want to tokenize</p>
                </div>
                <div className="section-icon">
                  {steps[1].icon}
                </div>
              </div>
              
              <div className="form-group">
                <label className="form-label required">Property Address</label>
                <input
                  type="text"
                  name="propertyAddress"
                  value={formData.propertyAddress}
                  onChange={handleInputChange}
                  className={`form-input ${errors.propertyAddress ? 'error' : ''}`}
                  placeholder="Enter the full address of your property"
                />
                {errors.propertyAddress && <span className="error-message">{errors.propertyAddress}</span>}
              </div>

              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label required">Property Type</label>
                  <select
                    name="propertyType"
                    value={formData.propertyType}
                    onChange={handleInputChange}
                    className={`form-select ${errors.propertyType ? 'error' : ''}`}
                  >
                    <option value="">Select property type</option>
                    {propertyTypes.map(type => (
                      <option key={type} value={type.toLowerCase().replace(/\s+/g, '-')}>
                        {type}
                      </option>
                    ))}
                  </select>
                  {errors.propertyType && <span className="error-message">{errors.propertyType}</span>}
                </div>

                <div className="form-group">
                  <label className="form-label required">City & State</label>
                  <select
                    name="cityState"
                    value={formData.cityState}
                    onChange={handleInputChange}
                    className={`form-select ${errors.cityState ? 'error' : ''}`}
                  >
                    <option value="">Select city and state</option>
                    {cities.map(city => (
                      <option key={city} value={city}>{city}</option>
                    ))}
                  </select>
                  {errors.cityState && <span className="error-message">{errors.cityState}</span>}
                </div>
              </div>

              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label required">Occupancy Status</label>
                  <select
                    name="occupancyStatus"
                    value={formData.occupancyStatus}
                    onChange={handleInputChange}
                    className={`form-select ${errors.occupancyStatus ? 'error' : ''}`}
                  >
                    <option value="">Select occupancy status</option>
                    {occupancyStatuses.map(status => (
                      <option key={status.value} value={status.value}>
                        {status.label}
                      </option>
                    ))}
                  </select>
                  {errors.occupancyStatus && <span className="error-message">{errors.occupancyStatus}</span>}
                </div>

                <div className="form-group">
                  <label className="form-label required">Property Condition</label>
                  <select
                    name="propertyCondition"
                    value={formData.propertyCondition}
                    onChange={handleInputChange}
                    className={`form-select ${errors.propertyCondition ? 'error' : ''}`}
                  >
                    <option value="">Select property condition</option>
                    {propertyConditions.map(condition => (
                      <option key={condition.value} value={condition.value}>
                        {condition.label}
                      </option>
                    ))}
                  </select>
                  {errors.propertyCondition && <span className="error-message">{errors.propertyCondition}</span>}
                </div>
              </div>

              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label required">Property Size</label>
                  <div className="size-input-group">
                    <input
                      type="number"
                      name="propertySize"
                      value={formData.propertySize}
                      onChange={handleInputChange}
                      className={`form-input ${errors.propertySize ? 'error' : ''}`}
                      placeholder="Enter size"
                      min="300"
                      max="5000"
                    />
                    <select
                      name="propertySizeUnit"
                      value={formData.propertySizeUnit}
                      onChange={handleInputChange}
                      className="form-select size-unit"
                    >
                      {sizeUnits.map(unit => (
                        <option key={unit} value={unit}>{unit}</option>
                      ))}
                    </select>
                  </div>
                  {errors.propertySize && <span className="error-message">{errors.propertySize}</span>}
                </div>

                <div className="form-group">
                  <label className="form-label required">Sell Timeline</label>
                  <select
                    name="sellTimeline"
                    value={formData.sellTimeline}
                    onChange={handleInputChange}
                    className={`form-select ${errors.sellTimeline ? 'error' : ''}`}
                  >
                    <option value="">Select timeline</option>
                    {sellTimelines.map(timeline => (
                      <option key={timeline.value} value={timeline.value}>
                        {timeline.label}
                      </option>
                    ))}
                  </select>
                  {errors.sellTimeline && <span className="error-message">{errors.sellTimeline}</span>}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Property Issues</label>
                <div className="checkbox-label">Do any of these apply to your property?</div>
                <div className="checkbox-grid">
                  {propertyIssues.map(issue => (
                    <label key={issue.value} className="checkbox-item">
                      <input
                        type="checkbox"
                        name="propertyIssues"
                        value={issue.value}
                        checked={formData.propertyIssues.includes(issue.value)}
                        onChange={handleInputChange}
                        className="checkbox-input"
                      />
                      <span className="checkbox-text">{issue.label}</span>
                    </label>
                  ))}
                </div>
                {formData.propertyIssues.includes('other') && (
                  <div className="form-group" style={{ marginTop: '16px' }}>
                    <label className="form-label">Please specify other issues</label>
                    <input
                      type="text"
                      name="otherIssue"
                      value={formData.otherIssue}
                      onChange={handleInputChange}
                      className="form-input"
                      placeholder="Describe the other issues"
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {}
          {currentStep === 3 && (
            <div className="form-section active">
              <div className="section-header">
                <div className="section-header-content">
                  <h2 className="section-title">Rental Information</h2>
                  <p className="section-description">Current rental income and lease details</p>
                </div>
                <div className="section-icon">
                  {steps[2].icon}
                </div>
              </div>
              
              <div className="form-group">
                <label className="form-label required">Is your property currently generating rental income?</label>
                <div className="radio-group">
                  {rentalIncomeOptions.map(option => (
                    <label key={option.value} className="radio-item">
                      <input
                        type="radio"
                        name="generatingRentalIncome"
                        value={option.value}
                        checked={formData.generatingRentalIncome === option.value}
                        onChange={handleInputChange}
                        className="radio-input"
                      />
                      <span className="radio-text">{option.label}</span>
                    </label>
                  ))}
                </div>
                {errors.generatingRentalIncome && <span className="error-message">{errors.generatingRentalIncome}</span>}
              </div>

              {formData.generatingRentalIncome === 'yes' && (
                <>
                  <div className="form-grid">
                    <div className="form-group">
                      <label className="form-label required">Current Monthly Rent</label>
                      <div className="currency-input-group">
                        <span className="currency-symbol">$</span>
                        <input
                          type="number"
                          name="monthlyRent"
                          value={formData.monthlyRent}
                          onChange={handleInputChange}
                          className={`form-input ${errors.monthlyRent ? 'error' : ''}`}
                          placeholder="Enter monthly rent"
                          min="0"
                          step="0.01"
                        />
                      </div>
                      {errors.monthlyRent && <span className="error-message">{errors.monthlyRent}</span>}
                    </div>

                    <div className="form-group">
                      <label className="form-label required">Lease Agreement Length</label>
                      <select
                        name="leaseAgreement"
                        value={formData.leaseAgreement}
                        onChange={handleInputChange}
                        className="form-select"
                      >
                        <option value="">Select lease agreement</option>
                        {leaseAgreements.map(agreement => (
                          <option key={agreement.value} value={agreement.value}>
                            {agreement.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {}
          {currentStep === 4 && (
            <div className="form-section active">
              <div className="section-header">
                <div className="section-header-content">
                  <h2 className="section-title">Legal Information</h2>
                  <p className="section-description">Ownership and legal status of the property</p>
                </div>
                <div className="section-icon">
                  {steps[3].icon}
                </div>
              </div>
              
              <div className="form-group">
                <label className="form-label required">Are there any mortgages or liens on the property?</label>
                <div className="radio-group">
                  {mortgageOptions.map(option => (
                    <label key={option.value} className="radio-item">
                      <input
                        type="radio"
                        name="mortgagesLiens"
                        value={option.value}
                        checked={formData.mortgagesLiens === option.value}
                        onChange={handleInputChange}
                        className="radio-input"
                      />
                      <span className="radio-text">{option.label}</span>
                    </label>
                  ))}
                </div>
                {errors.mortgagesLiens && <span className="error-message">{errors.mortgagesLiens}</span>}
              </div>

              <div className="form-group">
                <label className="form-label required">Do you have a title deed for the property?</label>
                <div className="radio-group">
                  {titleDeedOptions.map(option => (
                    <label key={option.value} className="radio-item">
                      <input
                        type="radio"
                        name="titleDeed"
                        value={option.value}
                        checked={formData.titleDeed === option.value}
                        onChange={handleInputChange}
                        className="radio-input"
                      />
                      <span className="radio-text">{option.label}</span>
                    </label>
                  ))}
                </div>
                {errors.titleDeed && <span className="error-message">{errors.titleDeed}</span>}
              </div>

              <div className="form-group">
                <label className="form-label required">What percentage of the property ownership are you looking to tokenize?</label>
                <div className="radio-group">
                  {ownershipPercentages.map(percentage => (
                    <label key={percentage.value} className="radio-item">
                      <input
                        type="radio"
                        name="ownershipPercentage"
                        value={percentage.value}
                        checked={formData.ownershipPercentage === percentage.value}
                        onChange={handleInputChange}
                        className="radio-input"
                      />
                      <span className="radio-text">{percentage.label}</span>
                    </label>
                  ))}
                </div>
                {errors.ownershipPercentage && <span className="error-message">{errors.ownershipPercentage}</span>}
              </div>

              <div className="form-group">
                <label className="form-label">Additional Comments / Special Features About Your Property</label>
                <textarea
                  name="additionalComments"
                  value={formData.additionalComments}
                  onChange={handleInputChange}
                  className="form-textarea"
                  placeholder="Tell us about any special features, recent renovations, or other details about your property"
                  rows="4"
                />
              </div>
            </div>
          )}

          {}
          {currentStep === 5 && (
            <div className="form-section active review-section">
              <div className="section-header">
                <div className="section-header-content">
                  <h2 className="section-title">Review Your Application</h2>
                  <p className="section-description">Please review all the information before submitting</p>
                </div>
                <div className="section-icon">
                  {steps[4].icon}
                </div>
              </div>
              
              <div className="review-content">
                <div className="review-section-item">
                  <h3 className="review-section-title">Personal Information</h3>
                  <div className="review-grid">
                    <div className="review-item">
                      <span className="review-label">Name</span>
                      <span className="review-value">{formData.firstName} {formData.lastName}</span>
                    </div>
                    <div className="review-item">
                      <span className="review-label">Email</span>
                      <span className="review-value">{formData.email}</span>
                    </div>
                    <div className="review-item">
                      <span className="review-label">Phone</span>
                      <span className="review-value">{formData.phone}</span>
                    </div>
                  </div>
                </div>

                <div className="review-section-item">
                  <h3 className="review-section-title">Property Information</h3>
                  <div className="review-grid">
                    <div className="review-item">
                      <span className="review-label">Address</span>
                      <span className="review-value">{formData.propertyAddress}</span>
                    </div>
                    <div className="review-item">
                      <span className="review-label">City & State</span>
                      <span className="review-value">{formData.cityState}</span>
                    </div>
                    <div className="review-item">
                      <span className="review-label">Property Type</span>
                      <span className="review-value">{formData.propertyType}</span>
                    </div>
                    <div className="review-item">
                      <span className="review-label">Size</span>
                      <span className="review-value">{formData.propertySize} {formData.propertySizeUnit}</span>
                    </div>
                    <div className="review-item">
                      <span className="review-label">Condition</span>
                      <span className="review-value">{propertyConditions.find(c => c.value === formData.propertyCondition)?.label || formData.propertyCondition}</span>
                    </div>
                    <div className="review-item">
                      <span className="review-label">Occupancy</span>
                      <span className="review-value">{occupancyStatuses.find(s => s.value === formData.occupancyStatus)?.label || formData.occupancyStatus}</span>
                    </div>
                  </div>
                </div>

                {formData.generatingRentalIncome && (
                  <div className="review-section-item">
                    <h3 className="review-section-title">Rental Information</h3>
                    <div className="review-grid">
                      <div className="review-item">
                        <span className="review-label">Generating Income</span>
                        <span className="review-value">{formData.generatingRentalIncome === 'yes' ? 'Yes' : 'No'}</span>
                      </div>
                      {formData.monthlyRent && (
                        <div className="review-item">
                          <span className="review-label">Monthly Rent</span>
                          <span className="review-value">${formData.monthlyRent}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <div className="review-section-item">
                  <h3 className="review-section-title">Legal Information</h3>
                  <div className="review-grid">
                    <div className="review-item">
                      <span className="review-label">Mortgages/Liens</span>
                      <span className="review-value">{mortgageOptions.find(o => o.value === formData.mortgagesLiens)?.label || formData.mortgagesLiens}</span>
                    </div>
                    <div className="review-item">
                      <span className="review-label">Title Deed</span>
                      <span className="review-value">{titleDeedOptions.find(o => o.value === formData.titleDeed)?.label || formData.titleDeed}</span>
                    </div>
                    <div className="review-item">
                      <span className="review-label">Ownership %</span>
                      <span className="review-value">{ownershipPercentages.find(p => p.value === formData.ownershipPercentage)?.label || formData.ownershipPercentage}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {}
          <div className="form-navigation">
            {submitMessage && (
              <div className={`submit-message ${submitMessage.type}`}>
                {submitMessage.text}
              </div>
            )}
            
            <div className="form-navigation-buttons">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={handlePrevious}
                disabled={currentStep === 1 || isSubmitting}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M19 12H5M5 12L12 19M5 12L12 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Previous
              </button>
              
              {currentStep < totalSteps ? (
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleNext}
                  disabled={isSubmitting}
                >
                  Next
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              ) : (
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <div className="loading-spinner"></div>
                      Submitting...
                    </>
                  ) : (
                    <>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path d="M5 13L9 17L19 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      Submit Application
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </form>
          </>
        )}
      </div>
    </div>
  );
}
