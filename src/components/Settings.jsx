
import React, { useState } from "react";
import { useOutletContext } from "react-router-dom";
import { useAuth } from "../lib/auth/localAuthService";
import { useTour } from "../contexts/TourContext";

const Settings = () => {
  const { user, userProfile, onUpdateProfile } = useOutletContext();
  const { profile } = useAuth();
  const { restartTour } = useTour();
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const [saveMessageType, setSaveMessageType] = useState('');
  const [activeTab, setActiveTab] = useState('profile');

  
  const currentUser = user || {};
  const currentProfile = profile || userProfile || {};

  
  const [profileData, setProfileData] = useState({
    firstName: currentProfile?.firstName || '',
    lastName: currentProfile?.lastName || '',
    email: currentUser?.email || '',
    phone: currentProfile?.phone || '',
    address: currentProfile?.address?.street || '',
    city: currentProfile?.address?.city || '',
    state: currentProfile?.address?.state || '',
    zip: currentProfile?.address?.zipCode || '',
    country: currentProfile?.country || 'US'
  });

  
  const [investorData, setInvestorData] = useState({
    accreditation_status: currentProfile?.accreditation_status || 'non_accredited',
    annual_income: currentProfile?.annual_income || '',
    net_worth: currentProfile?.net_worth || '',
    investment_experience: currentProfile?.investment_experience || 'beginner',
    risk_tolerance: currentProfile?.risk_tolerance || 'moderate',
    investment_goals: currentProfile?.investment_goals || [],
    preferred_property_types: currentProfile?.preferred_property_types || [],
    minimum_investment: currentProfile?.minimum_investment || '1000',
    maximum_investment: currentProfile?.maximum_investment || '100000'
  });

  
  const [notificationPrefs, setNotificationPrefs] = useState({
    property_updates: userProfile?.property_updates || true,
    dividend_notifications: userProfile?.dividend_notifications || true,
    market_alerts: userProfile?.market_alerts || true,
    new_offerings: userProfile?.new_offerings || true,
    regulatory_updates: userProfile?.regulatory_updates || true,
    email_frequency: userProfile?.email_frequency || 'weekly',
    push_notifications: userProfile?.push_notifications || true
  });

  const handleInputChange = (e, dataType) => {
    const { name, value, type, checked } = e.target;
    const setter = dataType === 'profile' ? setProfileData : 
                   dataType === 'investor' ? setInvestorData :
                   dataType === 'notifications' ? setNotificationPrefs : null;
    
    if (setter) {
      setter(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  const handleArrayChange = (name, value, dataType) => {
    const setter = dataType === 'investor' ? setInvestorData : null;
    if (setter) {
      setter(prev => ({
        ...prev,
        [name]: prev[name].includes(value) 
          ? prev[name].filter(item => item !== value)
          : [...prev[name], value]
      }));
    }
  };

  const handleSave = async (e, dataType) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveMessage('');
    setSaveMessageType(dataType);

    try {
      let dataToSave = {};
      if (dataType === 'profile') dataToSave = profileData;
      else if (dataType === 'investor') dataToSave = investorData;
      else if (dataType === 'notifications') dataToSave = notificationPrefs;

      const success = await onUpdateProfile(dataToSave);

      if (success) {
        setSaveMessage('Settings updated successfully!');
        setTimeout(() => {
          setSaveMessage('');
          setSaveMessageType('');
        }, 3000);
      } else {
        setSaveMessage('Failed to update settings. Please try again.');
      }
    } catch (error) {
      setSaveMessage('Error updating settings. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  
  const renderMessage = (type) => {
    if (saveMessage && saveMessageType === type) {
      return (
        <div style={{
          padding: '14px 18px',
          marginBottom: '24px',
          borderRadius: '12px',
          fontSize: '14px',
          fontWeight: '600',
          background: saveMessage.includes('successfully') 
            ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(16, 185, 129, 0.05))' 
            : 'linear-gradient(135deg, rgba(239, 68, 68, 0.15), rgba(239, 68, 68, 0.05))',
          border: `1.5px solid ${saveMessage.includes('successfully') ? 'rgba(16, 185, 129, 0.4)' : 'rgba(239, 68, 68, 0.4)'}`,
          color: saveMessage.includes('successfully') ? '#10b981' : '#ef4444',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          boxShadow: saveMessage.includes('successfully') 
            ? '0 4px 12px rgba(16, 185, 129, 0.2)' 
            : '0 4px 12px rgba(239, 68, 68, 0.2)'
        }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            {saveMessage.includes('successfully') ? (
              <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round"/>
            ) : (
              <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round"/>
            )}
          </svg>
          {saveMessage}
        </div>
      );
    }
    return null;
  };

  const tabs = [
    { 
      id: 'profile', 
      label: 'Profile', 
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
          <circle cx="12" cy="7" r="4"/>
        </svg>
      )
    },
    { 
      id: 'investor', 
      label: 'Investor', 
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
          <circle cx="9" cy="7" r="4"/>
          <path d="M22 21v-2a4 4 0 0 0-3-3.87"/>
          <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
        </svg>
      )
    },
    { 
      id: 'notifications', 
      label: 'Notifications', 
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
          <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
        </svg>
      )
    },
    { 
      id: 'compliance', 
      label: 'Compliance', 
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
          <polyline points="14 2 14 8 20 8"/>
          <line x1="16" y1="13" x2="8" y2="13"/>
          <line x1="16" y1="17" x2="8" y2="17"/>
          <polyline points="10 9 9 9 8 9"/>
        </svg>
      )
    },
    { 
      id: 'support', 
      label: 'Support', 
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"/>
          <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
          <line x1="12" y1="17" x2="12.01" y2="17"/>
        </svg>
      )
    }
  ];

  return (
    <div id="settings" className="page-section active">
      <div style={{ 
        width: '100%', 
        padding: '20px'
      }}>
        {}
        <div style={{
          display: 'flex',
          gap: '8px',
          marginBottom: '24px',
          overflowX: 'auto',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none'
        }}>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: '10px 20px',
                background: activeTab === tab.id 
                  ? 'var(--bg-secondary)' 
                  : 'transparent',
                border: `1px solid ${activeTab === tab.id ? 'var(--border-primary)' : 'var(--border-primary)'}`,
                borderRadius: '10px',
                color: '#ffffff',
                fontSize: '14px',
                fontWeight: activeTab === tab.id ? '700' : '600',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                whiteSpace: 'nowrap',
                opacity: activeTab === tab.id ? 1 : 0.7
              }}
              onMouseEnter={(e) => {
                if (activeTab !== tab.id) {
                  e.currentTarget.style.background = 'var(--bg-tertiary)';
                  e.currentTarget.style.opacity = '1';
                }
              }}
              onMouseLeave={(e) => {
                if (activeTab !== tab.id) {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.opacity = '0.7';
                }
              }}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {}
        <div style={{
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border-primary)',
          borderRadius: '14px',
          padding: '20px'
        }}>
          {}
          {activeTab === 'profile' && (
            <div>
              <div style={{ marginBottom: '24px' }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                  marginBottom: '24px',
                  padding: '20px',
                  background: 'var(--bg-tertiary)',
                  border: '1px solid var(--border-primary)',
                  borderRadius: '14px'
                }}>
                  <div style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '14px',
                    background: 'rgba(59, 130, 246, 0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '24px',
                    fontWeight: '700',
                    color: '#ffffff',
                    flexShrink: 0
                  }}>
                    {userProfile ? 
                      `${userProfile.firstName?.[0] || ''}${userProfile.lastName?.[0] || ''}` :
                      user?.email?.[0]?.toUpperCase() || 'U'
                    }
                  </div>
                  <div style={{ flex: 1 }}>
                    <h2 style={{
                      fontSize: '18px',
                      fontWeight: '700',
                      color: '#ffffff',
                      marginBottom: '4px',
                      letterSpacing: '-0.01em'
                    }}>
                      {userProfile ? 
                        `${userProfile.firstName || ''} ${userProfile.lastName || ''}`.trim() || 'User' :
                        'Welcome'
                      }
                    </h2>
                    <p style={{
                      fontSize: '13px',
                      color: '#ffffff',
                      opacity: 0.7,
                      margin: 0
                    }}>
                      {user?.email || 'user@example.com'}
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <div>
                    <h2 style={{
                      fontSize: '18px',
                      fontWeight: '700',
                      color: '#ffffff',
                      marginBottom: '4px',
                      letterSpacing: '-0.01em'
                    }}>
                      Personal Information
                    </h2>
                    <p style={{
                      fontSize: '13px',
                      color: '#ffffff',
                      opacity: 0.7,
                      margin: 0
                    }}>
                      Update your personal details and contact information
                    </p>
                  </div>
                </div>
              </div>

              {renderMessage('profile')}

              <form onSubmit={(e) => handleSave(e, 'profile')}>
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
                  gap: '24px',
                  marginBottom: '24px'
                }}>
                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '13px',
                      fontWeight: '600',
                      color: '#ffffff',
                      marginBottom: '10px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                      opacity: 0.8
                    }}>
                      First Name
                    </label>
                    <input 
                      type="text" 
                      name="firstName"
                      value={profileData.firstName}
                      onChange={(e) => handleInputChange(e, 'profile')}
                      placeholder="Enter your first name"
                      style={{
                        width: '100%',
                        padding: '14px 18px',
                        background: 'var(--bg-tertiary)',
                        border: '1.5px solid var(--border-primary)',
                        borderRadius: '12px',
                        color: '#ffffff',
                        fontSize: '15px',
                        outline: 'none',
                        transition: 'all 0.3s ease',
                        fontFamily: 'inherit'
                      }}
                      onFocus={(e) => {
                        e.currentTarget.style.borderColor = 'var(--accent-blue)';
                        e.currentTarget.style.background = 'var(--bg-secondary)';
                        e.currentTarget.style.boxShadow = '0 0 0 4px rgba(59, 130, 246, 0.1)';
                      }}
                      onBlur={(e) => {
                        e.currentTarget.style.borderColor = 'var(--border-primary)';
                        e.currentTarget.style.background = 'var(--bg-tertiary)';
                        e.currentTarget.style.boxShadow = 'none';
                      }}
                    />
                  </div>
                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '13px',
                      fontWeight: '600',
                      color: '#ffffff',
                      marginBottom: '10px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                      opacity: 0.8
                    }}>
                      Last Name
                    </label>
                    <input 
                      type="text" 
                      name="lastName"
                      value={profileData.lastName}
                      onChange={(e) => handleInputChange(e, 'profile')}
                      placeholder="Enter your last name"
                      style={{
                        width: '100%',
                        padding: '14px 18px',
                        background: 'var(--bg-tertiary)',
                        border: '1.5px solid var(--border-primary)',
                        borderRadius: '12px',
                        color: '#ffffff',
                        fontSize: '15px',
                        outline: 'none',
                        transition: 'all 0.3s ease',
                        fontFamily: 'inherit'
                      }}
                      onFocus={(e) => {
                        e.currentTarget.style.borderColor = 'var(--accent-blue)';
                        e.currentTarget.style.background = 'var(--bg-secondary)';
                        e.currentTarget.style.boxShadow = '0 0 0 4px rgba(59, 130, 246, 0.1)';
                      }}
                      onBlur={(e) => {
                        e.currentTarget.style.borderColor = 'var(--border-primary)';
                        e.currentTarget.style.background = 'var(--bg-tertiary)';
                        e.currentTarget.style.boxShadow = 'none';
                      }}
                    />
                  </div>
                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '13px',
                      fontWeight: '600',
                      color: '#ffffff',
                      marginBottom: '10px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                      opacity: 0.8
                    }}>
                      Email Address
                    </label>
                    <input 
                      type="email" 
                      name="email"
                      value={profileData.email}
                      disabled
                      style={{
                        width: '100%',
                        padding: '14px 18px',
                        background: 'var(--bg-tertiary)',
                        border: '1.5px solid var(--border-primary)',
                        borderRadius: '12px',
                        color: 'rgba(255, 255, 255, 0.5)',
                        fontSize: '15px',
                        outline: 'none',
                        cursor: 'not-allowed',
                        fontFamily: 'inherit'
                      }}
                    />
                  </div>
                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '13px',
                      fontWeight: '600',
                      color: '#ffffff',
                      marginBottom: '10px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                      opacity: 0.8
                    }}>
                      Phone Number
                    </label>
                    <input 
                      type="tel" 
                      name="phone"
                      value={profileData.phone}
                      onChange={(e) => handleInputChange(e, 'profile')}
                      placeholder="+1 (555) 123-4567"
                      style={{
                        width: '100%',
                        padding: '14px 18px',
                        background: 'var(--bg-tertiary)',
                        border: '1.5px solid var(--border-primary)',
                        borderRadius: '12px',
                        color: '#ffffff',
                        fontSize: '15px',
                        outline: 'none',
                        transition: 'all 0.3s ease',
                        fontFamily: 'inherit'
                      }}
                      onFocus={(e) => {
                        e.currentTarget.style.borderColor = 'var(--accent-blue)';
                        e.currentTarget.style.background = 'var(--bg-secondary)';
                        e.currentTarget.style.boxShadow = '0 0 0 4px rgba(59, 130, 246, 0.1)';
                      }}
                      onBlur={(e) => {
                        e.currentTarget.style.borderColor = 'var(--border-primary)';
                        e.currentTarget.style.background = 'var(--bg-tertiary)';
                        e.currentTarget.style.boxShadow = 'none';
                      }}
                    />
                  </div>
                </div>

                <div style={{ marginBottom: '32px' }}>
                  <h3 style={{
                    fontSize: '18px',
                    fontWeight: '700',
                    color: '#ffffff',
                    marginBottom: '20px',
                    letterSpacing: '-0.01em'
                  }}>
                    Address Information
                  </h3>
                  <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
                    gap: '24px'
                  }}>
                    <div style={{ gridColumn: '1 / -1' }}>
                      <label style={{
                        display: 'block',
                        fontSize: '13px',
                        fontWeight: '600',
                        color: '#ffffff',
                        marginBottom: '10px',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                        opacity: 0.8
                      }}>
                        Street Address
                      </label>
                      <input 
                        type="text" 
                        name="address"
                        value={profileData.address}
                        onChange={(e) => handleInputChange(e, 'profile')}
                        placeholder="123 Main Street"
                        style={{
                          width: '100%',
                          padding: '14px 18px',
                          background: 'var(--bg-tertiary)',
                          border: '1.5px solid var(--border-primary)',
                          borderRadius: '12px',
                          color: '#ffffff',
                          fontSize: '15px',
                          outline: 'none',
                          transition: 'all 0.3s ease',
                          fontFamily: 'inherit'
                        }}
                        onFocus={(e) => {
                          e.currentTarget.style.borderColor = 'var(--accent-blue)';
                          e.currentTarget.style.background = 'var(--bg-secondary)';
                          e.currentTarget.style.boxShadow = '0 0 0 4px rgba(59, 130, 246, 0.1)';
                        }}
                        onBlur={(e) => {
                          e.currentTarget.style.borderColor = 'var(--border-primary)';
                          e.currentTarget.style.background = 'var(--bg-tertiary)';
                          e.currentTarget.style.boxShadow = 'none';
                        }}
                      />
                    </div>
                    <div>
                      <label style={{
                        display: 'block',
                        fontSize: '13px',
                        fontWeight: '600',
                        color: '#ffffff',
                        marginBottom: '10px',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                        opacity: 0.8
                      }}>
                        City
                      </label>
                      <input 
                        type="text" 
                        name="city"
                        value={profileData.city}
                        onChange={(e) => handleInputChange(e, 'profile')}
                        placeholder="City"
                        style={{
                          width: '100%',
                          padding: '14px 18px',
                          background: 'var(--bg-tertiary)',
                          border: '1.5px solid var(--border-primary)',
                          borderRadius: '12px',
                          color: '#ffffff',
                          fontSize: '15px',
                          outline: 'none',
                          transition: 'all 0.3s ease',
                          fontFamily: 'inherit'
                        }}
                        onFocus={(e) => {
                          e.currentTarget.style.borderColor = 'var(--accent-blue)';
                          e.currentTarget.style.background = 'var(--bg-secondary)';
                          e.currentTarget.style.boxShadow = '0 0 0 4px rgba(59, 130, 246, 0.1)';
                        }}
                        onBlur={(e) => {
                          e.currentTarget.style.borderColor = 'var(--border-primary)';
                          e.currentTarget.style.background = 'var(--bg-tertiary)';
                          e.currentTarget.style.boxShadow = 'none';
                        }}
                      />
                    </div>
                    <div>
                      <label style={{
                        display: 'block',
                        fontSize: '13px',
                        fontWeight: '600',
                        color: '#ffffff',
                        marginBottom: '10px',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                        opacity: 0.8
                      }}>
                        State
                      </label>
                      <input 
                        type="text" 
                        name="state"
                        value={profileData.state}
                        onChange={(e) => handleInputChange(e, 'profile')}
                        placeholder="State"
                        style={{
                          width: '100%',
                          padding: '14px 18px',
                          background: 'var(--bg-tertiary)',
                          border: '1.5px solid var(--border-primary)',
                          borderRadius: '12px',
                          color: '#ffffff',
                          fontSize: '15px',
                          outline: 'none',
                          transition: 'all 0.3s ease',
                          fontFamily: 'inherit'
                        }}
                        onFocus={(e) => {
                          e.currentTarget.style.borderColor = 'var(--accent-blue)';
                          e.currentTarget.style.background = 'var(--bg-secondary)';
                          e.currentTarget.style.boxShadow = '0 0 0 4px rgba(59, 130, 246, 0.1)';
                        }}
                        onBlur={(e) => {
                          e.currentTarget.style.borderColor = 'var(--border-primary)';
                          e.currentTarget.style.background = 'var(--bg-tertiary)';
                          e.currentTarget.style.boxShadow = 'none';
                        }}
                      />
                    </div>
                    <div>
                      <label style={{
                        display: 'block',
                        fontSize: '13px',
                        fontWeight: '600',
                        color: '#ffffff',
                        marginBottom: '10px',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                        opacity: 0.8
                      }}>
                        ZIP Code
                      </label>
                      <input 
                        type="text" 
                        name="zip"
                        value={profileData.zip}
                        onChange={(e) => handleInputChange(e, 'profile')}
                        placeholder="12345"
                        style={{
                          width: '100%',
                          padding: '14px 18px',
                          background: 'var(--bg-tertiary)',
                          border: '1.5px solid var(--border-primary)',
                          borderRadius: '12px',
                          color: '#ffffff',
                          fontSize: '15px',
                          outline: 'none',
                          transition: 'all 0.3s ease',
                          fontFamily: 'inherit'
                        }}
                        onFocus={(e) => {
                          e.currentTarget.style.borderColor = 'var(--accent-blue)';
                          e.currentTarget.style.background = 'var(--bg-secondary)';
                          e.currentTarget.style.boxShadow = '0 0 0 4px rgba(59, 130, 246, 0.1)';
                        }}
                        onBlur={(e) => {
                          e.currentTarget.style.borderColor = 'var(--border-primary)';
                          e.currentTarget.style.background = 'var(--bg-tertiary)';
                          e.currentTarget.style.boxShadow = 'none';
                        }}
                      />
                    </div>
                    <div>
                      <label style={{
                        display: 'block',
                        fontSize: '13px',
                        fontWeight: '600',
                        color: '#ffffff',
                        marginBottom: '10px',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                        opacity: 0.8
                      }}>
                        Country
                      </label>
                      <select 
                        name="country"
                        value={profileData.country}
                        onChange={(e) => handleInputChange(e, 'profile')}
                        style={{
                          width: '100%',
                          padding: '14px 18px',
                          background: 'var(--bg-tertiary)',
                          border: '1.5px solid var(--border-primary)',
                          borderRadius: '12px',
                          color: '#ffffff',
                          fontSize: '15px',
                          outline: 'none',
                          cursor: 'pointer',
                          transition: 'all 0.3s ease',
                          fontFamily: 'inherit'
                        }}
                        onFocus={(e) => {
                          e.currentTarget.style.borderColor = 'var(--accent-blue)';
                          e.currentTarget.style.background = 'var(--bg-secondary)';
                          e.currentTarget.style.boxShadow = '0 0 0 4px rgba(59, 130, 246, 0.1)';
                        }}
                        onBlur={(e) => {
                          e.currentTarget.style.borderColor = 'var(--border-primary)';
                          e.currentTarget.style.background = 'var(--bg-tertiary)';
                          e.currentTarget.style.boxShadow = 'none';
                        }}
                      >
                        <option value="US">United States</option>
                        <option value="CA">Canada</option>
                        <option value="UK">United Kingdom</option>
                        <option value="AU">Australia</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div style={{ 
                  display: 'flex', 
                  gap: '12px', 
                  paddingTop: '20px', 
                  borderTop: '1px solid var(--border-primary)'
                }}>
                  <button 
                    type="submit" 
                    disabled={isSaving && saveMessageType === 'profile'}
                    style={{
                      padding: '12px 24px',
                      background: 'var(--accent-blue)',
                      border: 'none',
                      borderRadius: '10px',
                      color: '#ffffff',
                      fontSize: '14px',
                      fontWeight: '600',
                      cursor: (isSaving && saveMessageType === 'profile') ? 'not-allowed' : 'pointer',
                      transition: 'all 0.2s ease',
                      opacity: (isSaving && saveMessageType === 'profile') ? 0.7 : 1,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                    onMouseEnter={(e) => {
                      if (!(isSaving && saveMessageType === 'profile')) {
                        e.currentTarget.style.background = '#2563eb';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!(isSaving && saveMessageType === 'profile')) {
                        e.currentTarget.style.background = 'var(--accent-blue)';
                      }
                    }}
                  >
                    {(isSaving && saveMessageType === 'profile') ? (
                      <>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" strokeLinecap="round"/>
                        </svg>
                        Saving...
                      </>
                    ) : (
                      <>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        Save Changes
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}

          {}
          {activeTab === 'investor' && (
            <div>
              <div style={{ marginBottom: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <div>
                    <h2 style={{
                      fontSize: '18px',
                      fontWeight: '700',
                      color: '#ffffff',
                      marginBottom: '4px',
                      letterSpacing: '-0.01em'
                    }}>
                      Investor Profile
                    </h2>
                    <p style={{
                      fontSize: '13px',
                      color: '#ffffff',
                      opacity: 0.7,
                      margin: 0
                    }}>
                      Configure your investment preferences and accreditation status
                    </p>
                  </div>
                </div>
              </div>

              {renderMessage('investor')}

              <form onSubmit={(e) => handleSave(e, 'investor')}>
                <div style={{ 
                  marginBottom: '24px', 
                  padding: '20px',
                  background: 'var(--bg-tertiary)',
                  border: '1px solid var(--border-primary)',
                  borderRadius: '14px'
                }}>
                  <h3 style={{
                    fontSize: '16px',
                    fontWeight: '700',
                    color: '#ffffff',
                    marginBottom: '16px',
                    letterSpacing: '-0.01em'
                  }}>
                    Accreditation Status
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {[
                      { value: 'accredited', label: 'Accredited Investor', description: 'I meet the SEC requirements for accredited investor status' },
                      { value: 'non_accredited', label: 'Non-Accredited Investor', description: 'I do not meet accredited investor requirements' }
                    ].map(({ value, label, description }) => (
                      <label key={value} style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '16px',
                        padding: '20px',
                        background: investorData.accreditation_status === value 
                          ? 'linear-gradient(135deg, rgba(59, 130, 246, 0.15), rgba(59, 130, 246, 0.05))' 
                          : 'var(--bg-secondary)',
                        border: `2px solid ${investorData.accreditation_status === value ? 'var(--accent-blue)' : 'var(--border-primary)'}`,
                        borderRadius: '14px',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease'
                      }}>
                        <input 
                          type="radio" 
                          name="accreditation_status" 
                          value={value}
                          checked={investorData.accreditation_status === value}
                          onChange={(e) => handleInputChange(e, 'investor')}
                          style={{ marginTop: '4px', cursor: 'pointer', width: '20px', height: '20px' }}
                        />
                        <div style={{ flex: 1 }}>
                          <div style={{
                            fontSize: '16px',
                            fontWeight: '700',
                            color: '#ffffff',
                            marginBottom: '6px'
                          }}>
                            {label}
                          </div>
                          <div style={{
                            fontSize: '14px',
                            color: 'rgba(255, 255, 255, 0.7)',
                            lineHeight: '1.5'
                          }}>
                            {description}
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                <div style={{ 
                  marginBottom: '24px',
                  padding: '20px',
                  background: 'var(--bg-tertiary)',
                  border: '1px solid var(--border-primary)',
                  borderRadius: '14px'
                }}>
                  <h3 style={{
                    fontSize: '16px',
                    fontWeight: '700',
                    color: '#ffffff',
                    marginBottom: '16px',
                    letterSpacing: '-0.01em'
                  }}>
                    Financial Information
                  </h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '24px' }}>
                    <div>
                      <label style={{
                        display: 'block',
                        fontSize: '13px',
                        fontWeight: '600',
                        color: '#ffffff',
                        marginBottom: '10px',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                        opacity: 0.8
                      }}>
                        Annual Income
                      </label>
                      <select 
                        name="annual_income"
                        value={investorData.annual_income}
                        onChange={(e) => handleInputChange(e, 'investor')}
                        style={{
                          width: '100%',
                          padding: '14px 18px',
                          background: 'var(--bg-secondary)',
                          border: '1.5px solid var(--border-primary)',
                          borderRadius: '12px',
                          color: '#ffffff',
                          fontSize: '15px',
                          outline: 'none',
                          cursor: 'pointer',
                          transition: 'all 0.3s ease',
                          fontFamily: 'inherit'
                        }}
                        onFocus={(e) => {
                          e.currentTarget.style.borderColor = 'var(--accent-blue)';
                          e.currentTarget.style.boxShadow = '0 0 0 4px rgba(59, 130, 246, 0.1)';
                        }}
                        onBlur={(e) => {
                          e.currentTarget.style.borderColor = 'var(--border-primary)';
                          e.currentTarget.style.boxShadow = 'none';
                        }}
                      >
                        <option value="">Select income range</option>
                        <option value="0-50000">$0 - $50,000</option>
                        <option value="50000-100000">$50,000 - $100,000</option>
                        <option value="100000-200000">$100,000 - $200,000</option>
                        <option value="200000-500000">$200,000 - $500,000</option>
                        <option value="500000+">$500,000+</option>
                      </select>
                    </div>
                    <div>
                      <label style={{
                        display: 'block',
                        fontSize: '13px',
                        fontWeight: '600',
                        color: '#ffffff',
                        marginBottom: '10px',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                        opacity: 0.8
                      }}>
                        Net Worth
                      </label>
                      <select 
                        name="net_worth"
                        value={investorData.net_worth}
                        onChange={(e) => handleInputChange(e, 'investor')}
                        style={{
                          width: '100%',
                          padding: '14px 18px',
                          background: 'var(--bg-secondary)',
                          border: '1.5px solid var(--border-primary)',
                          borderRadius: '12px',
                          color: '#ffffff',
                          fontSize: '15px',
                          outline: 'none',
                          cursor: 'pointer',
                          transition: 'all 0.3s ease',
                          fontFamily: 'inherit'
                        }}
                        onFocus={(e) => {
                          e.currentTarget.style.borderColor = 'var(--accent-blue)';
                          e.currentTarget.style.boxShadow = '0 0 0 4px rgba(59, 130, 246, 0.1)';
                        }}
                        onBlur={(e) => {
                          e.currentTarget.style.borderColor = 'var(--border-primary)';
                          e.currentTarget.style.boxShadow = 'none';
                        }}
                      >
                        <option value="">Select net worth range</option>
                        <option value="0-100000">$0 - $100,000</option>
                        <option value="100000-500000">$100,000 - $500,000</option>
                        <option value="500000-1000000">$500,000 - $1,000,000</option>
                        <option value="1000000+">$1,000,000+</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div style={{ 
                  marginBottom: '24px',
                  padding: '20px',
                  background: 'var(--bg-tertiary)',
                  border: '1px solid var(--border-primary)',
                  borderRadius: '14px'
                }}>
                  <h3 style={{
                    fontSize: '16px',
                    fontWeight: '700',
                    color: '#ffffff',
                    marginBottom: '16px',
                    letterSpacing: '-0.01em'
                  }}>
                    Investment Preferences
                  </h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '24px' }}>
                    <div>
                      <label style={{
                        display: 'block',
                        fontSize: '13px',
                        fontWeight: '600',
                        color: '#ffffff',
                        marginBottom: '10px',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                        opacity: 0.8
                      }}>
                        Investment Experience
                      </label>
                      <select 
                        name="investment_experience"
                        value={investorData.investment_experience}
                        onChange={(e) => handleInputChange(e, 'investor')}
                        style={{
                          width: '100%',
                          padding: '14px 18px',
                          background: 'var(--bg-secondary)',
                          border: '1.5px solid var(--border-primary)',
                          borderRadius: '12px',
                          color: '#ffffff',
                          fontSize: '15px',
                          outline: 'none',
                          cursor: 'pointer',
                          transition: 'all 0.3s ease',
                          fontFamily: 'inherit'
                        }}
                        onFocus={(e) => {
                          e.currentTarget.style.borderColor = 'var(--accent-blue)';
                          e.currentTarget.style.boxShadow = '0 0 0 4px rgba(59, 130, 246, 0.1)';
                        }}
                        onBlur={(e) => {
                          e.currentTarget.style.borderColor = 'var(--border-primary)';
                          e.currentTarget.style.boxShadow = 'none';
                        }}
                      >
                        <option value="beginner">Beginner</option>
                        <option value="intermediate">Intermediate</option>
                        <option value="advanced">Advanced</option>
                        <option value="expert">Expert</option>
                      </select>
                    </div>
                    <div>
                      <label style={{
                        display: 'block',
                        fontSize: '13px',
                        fontWeight: '600',
                        color: '#ffffff',
                        marginBottom: '10px',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                        opacity: 0.8
                      }}>
                        Risk Tolerance
                      </label>
                      <select 
                        name="risk_tolerance"
                        value={investorData.risk_tolerance}
                        onChange={(e) => handleInputChange(e, 'investor')}
                        style={{
                          width: '100%',
                          padding: '14px 18px',
                          background: 'var(--bg-secondary)',
                          border: '1.5px solid var(--border-primary)',
                          borderRadius: '12px',
                          color: '#ffffff',
                          fontSize: '15px',
                          outline: 'none',
                          cursor: 'pointer',
                          transition: 'all 0.3s ease',
                          fontFamily: 'inherit'
                        }}
                        onFocus={(e) => {
                          e.currentTarget.style.borderColor = 'var(--accent-blue)';
                          e.currentTarget.style.boxShadow = '0 0 0 4px rgba(59, 130, 246, 0.1)';
                        }}
                        onBlur={(e) => {
                          e.currentTarget.style.borderColor = 'var(--border-primary)';
                          e.currentTarget.style.boxShadow = 'none';
                        }}
                      >
                        <option value="conservative">Conservative</option>
                        <option value="moderate">Moderate</option>
                        <option value="aggressive">Aggressive</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div style={{ 
                  display: 'flex', 
                  gap: '12px', 
                  paddingTop: '20px', 
                  borderTop: '1px solid var(--border-primary)'
                }}>
                  <button 
                    type="submit" 
                    disabled={isSaving && saveMessageType === 'investor'}
                    style={{
                      padding: '12px 24px',
                      background: 'var(--accent-blue)',
                      border: 'none',
                      borderRadius: '10px',
                      color: '#ffffff',
                      fontSize: '14px',
                      fontWeight: '600',
                      cursor: (isSaving && saveMessageType === 'investor') ? 'not-allowed' : 'pointer',
                      transition: 'all 0.2s ease',
                      opacity: (isSaving && saveMessageType === 'investor') ? 0.7 : 1,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                    onMouseEnter={(e) => {
                      if (!(isSaving && saveMessageType === 'investor')) {
                        e.currentTarget.style.background = '#2563eb';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!(isSaving && saveMessageType === 'investor')) {
                        e.currentTarget.style.background = 'var(--accent-blue)';
                      }
                    }}
                  >
                    {(isSaving && saveMessageType === 'investor') ? (
                      <>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" strokeLinecap="round"/>
                        </svg>
                        Saving...
                      </>
                    ) : (
                      <>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        Save Changes
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}

          {}
          {activeTab === 'notifications' && (
            <div>
              <div style={{ marginBottom: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <div>
                    <h2 style={{
                      fontSize: '18px',
                      fontWeight: '700',
                      color: '#ffffff',
                      marginBottom: '4px',
                      letterSpacing: '-0.01em'
                    }}>
                      Notification Preferences
                    </h2>
                    <p style={{
                      fontSize: '13px',
                      color: '#ffffff',
                      opacity: 0.7,
                      margin: 0
                    }}>
                      Choose when and how you want to receive updates about your investments
                    </p>
                  </div>
                </div>
              </div>

              {renderMessage('notifications')}

              <form onSubmit={(e) => handleSave(e, 'notifications')}>
                <div style={{ 
                  marginBottom: '24px',
                  padding: '20px',
                  background: 'var(--bg-tertiary)',
                  border: '1px solid var(--border-primary)',
                  borderRadius: '14px'
                }}>
                  <h3 style={{
                    fontSize: '16px',
                    fontWeight: '700',
                    color: '#ffffff',
                    marginBottom: '16px',
                    letterSpacing: '-0.01em'
                  }}>
                    Property Updates
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {[
                      { name: 'property_updates', label: 'Property Performance Updates', description: 'Receive updates about property performance, maintenance, and improvements' },
                      { name: 'dividend_notifications', label: 'Dividend Notifications', description: 'Get notified when dividend payments are processed' },
                      { name: 'market_alerts', label: 'Market Alerts', description: 'Receive alerts about market conditions and opportunities' },
                      { name: 'new_offerings', label: 'New Investment Opportunities', description: 'Be notified about new tokenized properties available for investment' },
                      { name: 'regulatory_updates', label: 'Regulatory Updates', description: 'Stay informed about regulatory changes affecting your investments' }
                    ].map(({ name, label, description }) => (
                      <div key={name} style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '20px',
                        background: 'var(--bg-secondary)',
                        border: '1.5px solid var(--border-primary)',
                        borderRadius: '14px',
                        transition: 'all 0.3s ease'
                      }}>
                        <div style={{ flex: 1 }}>
                          <div style={{
                            fontSize: '16px',
                            fontWeight: '700',
                            color: '#ffffff',
                            marginBottom: '6px'
                          }}>
                            {label}
                          </div>
                          <div style={{
                            fontSize: '14px',
                            color: 'rgba(255, 255, 255, 0.7)',
                            lineHeight: '1.5'
                          }}>
                            {description}
                          </div>
                        </div>
                        <label style={{
                          position: 'relative',
                          display: 'inline-block',
                          width: '56px',
                          height: '32px',
                          cursor: 'pointer',
                          marginLeft: '24px',
                          flexShrink: 0
                        }}>
                          <input 
                            type="checkbox" 
                            name={name}
                            checked={notificationPrefs[name]}
                            onChange={(e) => handleInputChange(e, 'notifications')}
                            style={{ opacity: 0, width: 0, height: 0 }}
                          />
                          <span style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            background: notificationPrefs[name] 
                              ? 'linear-gradient(135deg, var(--accent-blue), #6366f1)' 
                              : 'var(--bg-tertiary)',
                            border: `2px solid ${notificationPrefs[name] ? 'var(--accent-blue)' : 'var(--border-primary)'}`,
                            borderRadius: '32px',
                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                            boxShadow: notificationPrefs[name] 
                              ? '0 4px 12px rgba(59, 130, 246, 0.4)' 
                              : 'none'
                          }}>
                            <span style={{
                              position: 'absolute',
                              height: '24px',
                              width: '24px',
                              left: notificationPrefs[name] ? '28px' : '4px',
                              top: '2px',
                              background: '#ffffff',
                              borderRadius: '50%',
                              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)'
                            }}></span>
                          </span>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                <div style={{ 
                  marginBottom: '24px',
                  padding: '20px',
                  background: 'var(--bg-tertiary)',
                  border: '1px solid var(--border-primary)',
                  borderRadius: '14px'
                }}>
                  <h3 style={{
                    fontSize: '16px',
                    fontWeight: '700',
                    color: '#ffffff',
                    marginBottom: '16px',
                    letterSpacing: '-0.01em'
                  }}>
                    Delivery Preferences
                  </h3>
                  <div style={{ marginBottom: '24px' }}>
                    <label style={{
                      display: 'block',
                      fontSize: '13px',
                      fontWeight: '600',
                      color: '#ffffff',
                      marginBottom: '10px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                      opacity: 0.8
                    }}>
                      Email Frequency
                    </label>
                    <select 
                      name="email_frequency"
                      value={notificationPrefs.email_frequency}
                      onChange={(e) => handleInputChange(e, 'notifications')}
                      style={{
                        width: '100%',
                        padding: '14px 18px',
                        background: 'var(--bg-secondary)',
                        border: '1.5px solid var(--border-primary)',
                        borderRadius: '12px',
                        color: '#ffffff',
                        fontSize: '15px',
                        outline: 'none',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        fontFamily: 'inherit'
                      }}
                      onFocus={(e) => {
                        e.currentTarget.style.borderColor = 'var(--accent-blue)';
                        e.currentTarget.style.boxShadow = '0 0 0 4px rgba(59, 130, 246, 0.1)';
                      }}
                      onBlur={(e) => {
                        e.currentTarget.style.borderColor = 'var(--border-primary)';
                        e.currentTarget.style.boxShadow = 'none';
                      }}
                    >
                      <option value="immediate">Immediate</option>
                      <option value="daily">Daily Digest</option>
                      <option value="weekly">Weekly Summary</option>
                      <option value="monthly">Monthly Report</option>
                    </select>
                  </div>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '20px',
                    background: 'var(--bg-secondary)',
                    border: '1.5px solid var(--border-primary)',
                    borderRadius: '14px'
                  }}>
                    <div style={{ flex: 1 }}>
                      <div style={{
                        fontSize: '16px',
                        fontWeight: '700',
                        color: '#ffffff',
                        marginBottom: '6px'
                      }}>
                        Push Notifications
                      </div>
                      <div style={{
                        fontSize: '14px',
                        color: 'rgba(255, 255, 255, 0.7)',
                        lineHeight: '1.5'
                      }}>
                        Receive instant notifications on your device
                      </div>
                    </div>
                    <label style={{
                      position: 'relative',
                      display: 'inline-block',
                      width: '56px',
                      height: '32px',
                      cursor: 'pointer',
                      marginLeft: '24px',
                      flexShrink: 0
                    }}>
                      <input 
                        type="checkbox" 
                        name="push_notifications"
                        checked={notificationPrefs.push_notifications}
                        onChange={(e) => handleInputChange(e, 'notifications')}
                        style={{ opacity: 0, width: 0, height: 0 }}
                      />
                      <span style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: notificationPrefs.push_notifications 
                          ? 'linear-gradient(135deg, var(--accent-blue), #6366f1)' 
                          : 'var(--bg-tertiary)',
                        border: `2px solid ${notificationPrefs.push_notifications ? 'var(--accent-blue)' : 'var(--border-primary)'}`,
                        borderRadius: '32px',
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        boxShadow: notificationPrefs.push_notifications 
                          ? '0 4px 12px rgba(59, 130, 246, 0.4)' 
                          : 'none'
                      }}>
                        <span style={{
                          position: 'absolute',
                          height: '24px',
                          width: '24px',
                          left: notificationPrefs.push_notifications ? '28px' : '4px',
                          top: '2px',
                          background: '#ffffff',
                          borderRadius: '50%',
                          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)'
                        }}></span>
                      </span>
                    </label>
                  </div>
                </div>

                <div style={{ 
                  display: 'flex', 
                  gap: '12px', 
                  paddingTop: '20px', 
                  borderTop: '1px solid var(--border-primary)'
                }}>
                  <button 
                    type="submit" 
                    disabled={isSaving && saveMessageType === 'notifications'}
                    style={{
                      padding: '12px 24px',
                      background: 'var(--accent-blue)',
                      border: 'none',
                      borderRadius: '10px',
                      color: '#ffffff',
                      fontSize: '14px',
                      fontWeight: '600',
                      cursor: (isSaving && saveMessageType === 'notifications') ? 'not-allowed' : 'pointer',
                      transition: 'all 0.2s ease',
                      opacity: (isSaving && saveMessageType === 'notifications') ? 0.7 : 1,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                    onMouseEnter={(e) => {
                      if (!(isSaving && saveMessageType === 'notifications')) {
                        e.currentTarget.style.background = '#2563eb';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!(isSaving && saveMessageType === 'notifications')) {
                        e.currentTarget.style.background = 'var(--accent-blue)';
                      }
                    }}
                  >
                    {(isSaving && saveMessageType === 'notifications') ? (
                      <>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" strokeLinecap="round"/>
                        </svg>
                        Saving...
                      </>
                    ) : (
                      <>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        Save Changes
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}

          {}
          {activeTab === 'compliance' && (
            <div>
              <div style={{ marginBottom: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <div>
                    <h2 style={{
                      fontSize: '18px',
                      fontWeight: '700',
                      color: '#ffffff',
                      marginBottom: '4px',
                      letterSpacing: '-0.01em'
                    }}>
                      Tax & Compliance
                    </h2>
                    <p style={{
                      fontSize: '13px',
                      color: '#ffffff',
                      opacity: 0.7,
                      margin: 0
                    }}>
                      Manage your tax documents and compliance requirements
                    </p>
                  </div>
                </div>
              </div>

              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', 
                gap: '16px' 
              }}>
                <div style={{
                  padding: '20px',
                  background: 'var(--bg-tertiary)',
                  border: '1px solid var(--border-primary)',
                  borderRadius: '14px',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'var(--bg-secondary)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'var(--bg-tertiary)';
                }}
                >
                  <div style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '12px',
                    background: 'rgba(16, 185, 129, 0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '16px'
                  }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2">
                      <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <h3 style={{
                    fontSize: '16px',
                    fontWeight: '700',
                    color: '#ffffff',
                    marginBottom: '8px',
                    letterSpacing: '-0.01em'
                  }}>
                    KYC Verification
                  </h3>
                  <p style={{
                    fontSize: '13px',
                    color: '#ffffff',
                    opacity: 0.7,
                    marginBottom: '12px',
                    lineHeight: '1.5'
                  }}>
                    Identity verification status
                  </p>
                  <div style={{
                    display: 'inline-block',
                    padding: '4px 12px',
                    background: 'rgba(16, 185, 129, 0.15)',
                    border: '1px solid rgba(16, 185, 129, 0.3)',
                    borderRadius: '6px',
                    fontSize: '12px',
                    fontWeight: '600',
                    color: '#10b981'
                  }}>
                    ✓ Verified
                  </div>
                </div>

                <div style={{
                  padding: '20px',
                  background: 'var(--bg-tertiary)',
                  border: '1px solid var(--border-primary)',
                  borderRadius: '14px',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'var(--bg-secondary)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'var(--bg-tertiary)';
                }}
                >
                  <div style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '12px',
                    background: 'rgba(59, 130, 246, 0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '16px'
                  }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2">
                      <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M14 2V8H20" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <h3 style={{
                    fontSize: '16px',
                    fontWeight: '700',
                    color: '#ffffff',
                    marginBottom: '8px',
                    letterSpacing: '-0.01em'
                  }}>
                    Tax Documents
                  </h3>
                  <p style={{
                    fontSize: '13px',
                    color: '#ffffff',
                    opacity: 0.7,
                    marginBottom: '12px',
                    lineHeight: '1.5'
                  }}>
                    1099 forms and tax reports
                  </p>
                  <button style={{
                    padding: '8px 16px',
                    background: 'transparent',
                    border: '1px solid var(--border-primary)',
                    borderRadius: '8px',
                    color: '#ffffff',
                    fontSize: '13px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'var(--bg-secondary)';
                    e.currentTarget.style.borderColor = 'var(--border-secondary)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.borderColor = 'var(--border-primary)';
                  }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15M17 10L12 15M12 15L7 10M12 15V3" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    Download
                  </button>
                </div>
              </div>
            </div>
          )}

          {}
          {activeTab === 'support' && (
            <div>
              <div style={{ marginBottom: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <div>
                    <h2 style={{
                      fontSize: '18px',
                      fontWeight: '700',
                      color: '#ffffff',
                      marginBottom: '4px',
                      letterSpacing: '-0.01em'
                    }}>
                      Help & Support
                    </h2>
                    <p style={{
                      fontSize: '13px',
                      color: '#ffffff',
                      opacity: 0.7,
                      margin: 0
                    }}>
                      Get help with using the platform and learn about our features
                    </p>
                  </div>
                </div>
              </div>

              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', 
                gap: '16px' 
              }}>
                <div style={{
                  padding: '20px',
                  background: 'var(--bg-tertiary)',
                  border: '1px solid var(--border-primary)',
                  borderRadius: '14px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '16px',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'var(--bg-secondary)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'var(--bg-tertiary)';
                }}
                >
                  <div style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '12px',
                    background: 'rgba(59, 130, 246, 0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2">
                      <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"/>
                      <path d="M12 16V12"/>
                      <path d="M12 8H12.01"/>
                    </svg>
                  </div>
                  <h3 style={{
                    fontSize: '16px',
                    fontWeight: '700',
                    color: '#ffffff',
                    marginBottom: '8px',
                    letterSpacing: '-0.01em'
                  }}>
                    Platform Tour
                  </h3>
                  <p style={{
                    fontSize: '13px',
                    color: '#ffffff',
                    opacity: 0.7,
                    margin: 0,
                    lineHeight: '1.5',
                    marginBottom: '8px'
                  }}>
                    New to Domufi? Take a guided tour to learn how to navigate the platform, make investments, and manage your portfolio.
                  </p>
                  <button 
                    onClick={() => restartTour()}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '10px 20px',
                      background: 'var(--accent-blue)',
                      border: 'none',
                      borderRadius: '10px',
                      color: '#ffffff',
                      fontSize: '14px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      alignSelf: 'flex-start'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = '#2563eb';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'var(--accent-blue)';
                    }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21.5 12C21.5 17.2467 17.2467 21.5 12 21.5C6.75329 21.5 2.5 17.2467 2.5 12C2.5 6.75329 6.75329 2.5 12 2.5"/>
                      <path d="M12 2.5C14 4.5 17.5 6 21.5 6V12"/>
                    </svg>
                    Start Platform Tour
                  </button>
                </div>

                <div style={{
                  padding: '20px',
                  background: 'var(--bg-tertiary)',
                  border: '1px solid var(--border-primary)',
                  borderRadius: '14px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '16px',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'var(--bg-secondary)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'var(--bg-tertiary)';
                }}
                >
                  <div style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '12px',
                    background: 'rgba(59, 130, 246, 0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2">
                      <path d="M21 15C21 15.5304 20.7893 16.0391 20.4142 16.4142C20.0391 16.7893 19.5304 17 19 17H7L3 21V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V15Z"/>
                    </svg>
                  </div>
                  <h3 style={{
                    fontSize: '16px',
                    fontWeight: '700',
                    color: '#ffffff',
                    marginBottom: '8px',
                    letterSpacing: '-0.01em'
                  }}>
                    Contact Support
                  </h3>
                  <p style={{
                    fontSize: '13px',
                    color: '#ffffff',
                    opacity: 0.7,
                    margin: 0,
                    lineHeight: '1.5',
                    marginBottom: '8px'
                  }}>
                    Have questions? Our support team is here to help you with any issues or concerns.
                  </p>
                  <button
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '10px 20px',
                      background: 'var(--accent-blue)',
                      border: 'none',
                      borderRadius: '10px',
                      color: '#ffffff',
                      fontSize: '14px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      alignSelf: 'flex-start'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = '#2563eb';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'var(--accent-blue)';
                    }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M3 8L10.89 13.26C11.2187 13.4793 11.6049 13.5963 12 13.5963C12.3951 13.5963 12.7813 13.4793 13.11 13.26L21 8M5 19H19C19.5304 19 20.0391 18.7893 20.4142 18.4142C20.7893 18.0391 21 17.5304 21 17V7C21 6.46957 20.7893 5.96086 20.4142 5.58579C20.0391 5.21071 19.5304 5 19 5H5C4.46957 5 3.96086 5.21071 3.58579 5.58579C3.21071 5.96086 3 6.46957 3 7V17C3 17.5304 3.21071 18.0391 3.58579 18.4142C3.96086 18.7893 4.46957 19 5 19Z"/>
                    </svg>
                    Email Support
                  </button>
                </div>

                <div style={{
                  padding: '20px',
                  background: 'var(--bg-tertiary)',
                  border: '1px solid var(--border-primary)',
                  borderRadius: '14px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '16px',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'var(--bg-secondary)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'var(--bg-tertiary)';
                }}
                >
                  <div style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '12px',
                    background: 'rgba(59, 130, 246, 0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2">
                      <path d="M12 20H21M3.00003 20H5.00003M5.00003 20V15M5.00003 20V4M5.00003 4H3.00003M5.00003 4H12M12 4V7M12 4H21M12 7H9.00003M12 7V10M12 10H21M12 10H9.00003M9.00003 7V10M9.00003 10V15M9.00003 15H5.00003M9.00003 15H12M12 15V20M12 15H21"/>
                    </svg>
                  </div>
                  <h3 style={{
                    fontSize: '16px',
                    fontWeight: '700',
                    color: '#ffffff',
                    marginBottom: '8px',
                    letterSpacing: '-0.01em'
                  }}>
                    Documentation
                  </h3>
                  <p style={{
                    fontSize: '13px',
                    color: '#ffffff',
                    opacity: 0.7,
                    margin: 0,
                    lineHeight: '1.5',
                    marginBottom: '8px'
                  }}>
                    Explore our comprehensive documentation to learn about all platform features and best practices.
                  </p>
                  <button
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '10px 20px',
                      background: 'var(--accent-blue)',
                      border: 'none',
                      borderRadius: '10px',
                      color: '#ffffff',
                      fontSize: '14px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      alignSelf: 'flex-start'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = '#2563eb';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'var(--accent-blue)';
                    }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M18 13V19C18 19.5304 17.7893 20.0391 17.4142 20.4142C17.0391 20.7893 16.5304 21 16 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V8C3 7.46957 3.21071 6.96086 3.58579 6.58579C3.96086 6.21071 4.46957 6 5 6H11"/>
                      <path d="M15 3H21V9"/>
                      <path d="M10 14L21 3"/>
                    </svg>
                    View Docs
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;
