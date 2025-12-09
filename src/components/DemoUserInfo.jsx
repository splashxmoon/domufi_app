import React from 'react';
import { useAuth } from '../lib/auth/localAuthService';


const DemoUserInfo = () => {
  const { user, profile } = useAuth();

  if (!user || !profile) {
    return (
      <div className="demo-user-info" style={{
        padding: '20px',
        backgroundColor: '#f8fafc',
        borderRadius: '8px',
        border: '1px solid #e2e8f0',
        margin: '20px 0'
      }}>
        <h3 style={{ marginBottom: '16px', color: '#1e293b' }}>User Information (Demo Mode)</h3>
        <p>Please sign up to see your information here.</p>
      </div>
    );
  }

  return (
    <div className="demo-user-info" style={{
      padding: '20px',
      backgroundColor: '#f8fafc',
      borderRadius: '8px',
      border: '1px solid #e2e8f0',
      margin: '20px 0'
    }}>
      <h3 style={{ marginBottom: '16px', color: '#1e293b' }}>User Information (Demo Mode)</h3>
      <div className="user-details" style={{ display: 'grid', gap: '8px' }}>
        <div className="detail-row" style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}>
          <strong>Name:</strong> <span>{profile.firstName} {profile.lastName}</span>
        </div>
        <div className="detail-row" style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}>
          <strong>Email:</strong> <span>{profile.email}</span>
        </div>
        <div className="detail-row" style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}>
          <strong>Phone:</strong> <span>{profile.phone || 'Not provided'}</span>
        </div>
        <div className="detail-row" style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}>
          <strong>Date of Birth:</strong> <span>{profile.dateOfBirth || 'Not provided'}</span>
        </div>
        <div className="detail-row" style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}>
          <strong>SSN Last 4:</strong> <span>{profile.ssnLastFour || 'Not provided'}</span>
        </div>
        <div className="detail-row" style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}>
          <strong>Address:</strong> <span>{profile.address ? 
            `${profile.address.street}, ${profile.address.city}, ${profile.address.state} ${profile.address.zipCode}` : 
            'Not provided'
          }</span>
        </div>
        <div className="detail-row" style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}>
          <strong>KYC Status:</strong> <span style={{
            padding: '2px 8px',
            borderRadius: '4px',
            fontSize: '12px',
            backgroundColor: profile.kycStatus === 'submitted' ? '#fef3c7' : '#d1fae5',
            color: profile.kycStatus === 'submitted' ? '#92400e' : '#065f46'
          }}>{profile.kycStatus}</span>
        </div>
        <div className="detail-row" style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}>
          <strong>Email Verified:</strong> <span style={{
            padding: '2px 8px',
            borderRadius: '4px',
            fontSize: '12px',
            backgroundColor: profile.emailVerified ? '#d1fae5' : '#fee2e2',
            color: profile.emailVerified ? '#065f46' : '#991b1b'
          }}>
            {profile.emailVerified ? 'Yes' : 'No'}
          </span>
        </div>
        <div className="detail-row" style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}>
          <strong>Identity Verified:</strong> <span style={{
            padding: '2px 8px',
            borderRadius: '4px',
            fontSize: '12px',
            backgroundColor: profile.identityVerified ? '#d1fae5' : '#fee2e2',
            color: profile.identityVerified ? '#065f46' : '#991b1b'
          }}>
            {profile.identityVerified ? 'Yes' : 'No'}
          </span>
        </div>
      </div>
      
      <div className="demo-note" style={{
        marginTop: '16px',
        padding: '12px',
        backgroundColor: '#eff6ff',
        borderRadius: '6px',
        border: '1px solid #bfdbfe'
      }}>
        <p style={{ margin: 0, fontSize: '14px', color: '#1e40af' }}>
          <strong>Demo Note:</strong> This data is stored locally in your browser. 
          In a real application, this would be stored securely in a database.
        </p>
      </div>
    </div>
  );
};

export default DemoUserInfo;