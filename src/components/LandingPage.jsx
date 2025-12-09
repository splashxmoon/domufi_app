



import React from 'react';
import { Link } from 'react-router-dom';
import './Auth/AuthStyles.css';

export default function LandingPage() {
  return (
    <div className="landing-container">
      <div className="landing-content">
        {}
        <div className="hero-section">
          <div className="hero-content">
            <h1 className="hero-title">Welcome to Domufi</h1>
            <p className="hero-subtitle">
              The future of real estate investment is here. 
              Tokenize properties, diversify your portfolio, and build wealth through fractional ownership.
            </p>
            
            <div className="hero-features">
              <div className="feature-item">
                <div className="feature-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path d="M3 7V17C3 18.1046 3.89543 19 5 19H19C20.1046 19 21 18.1046 21 17V7M3 7H21M3 7L12 3L21 7M12 3V19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <div className="feature-text">
                  <h3>Fractional Ownership</h3>
                  <p>Own a piece of premium real estate with as little as $1,000</p>
                </div>
              </div>
              
              <div className="feature-item">
                <div className="feature-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path d="M22 12H18L15 21L9 3L6 12H2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <div className="feature-text">
                  <h3>AI-Powered Insights</h3>
                  <p>Get intelligent investment recommendations and market analysis</p>
                </div>
              </div>
              
              <div className="feature-item">
                <div className="feature-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 17c-3.86 0-7-3.14-7-7s3.14-7 7-7 7 3.14 7 7-3.14 7-7 7z" stroke="currentColor" strokeWidth="2"/>
                    <path d="M12 6v6l4 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <div className="feature-text">
                  <h3>Real-Time Performance</h3>
                  <p>Track your investments with live updates and performance metrics</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {}
        <div className="cta-section">
          <div className="cta-content">
            <h2 className="cta-title">Ready to Start Investing?</h2>
            <p className="cta-subtitle">
              Join thousands of investors who are already building wealth through tokenized real estate.
            </p>
            
            <div className="cta-buttons">
              <Link to="/signup" className="btn btn-primary btn-large">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M16 21V19C16 17.9391 15.5786 16.9217 14.8284 16.1716C14.0783 15.4214 13.0609 15 12 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M8.5 11C10.7091 11 12.5 9.20914 12.5 7C12.5 4.79086 10.7091 3 8.5 3C6.29086 3 4.5 4.79086 4.5 7C4.5 9.20914 6.29086 11 8.5 11Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M20 8V14M23 11H17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Create Account
              </Link>
              
              <Link to="/signin" className="btn btn-secondary btn-large">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M15 3H19C20.1046 3 21 3.89543 21 5V19C21 20.1046 20.1046 21 19 21H15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M10 17L15 12L10 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M15 12H3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Sign In
              </Link>
            </div>
            
            <div className="cta-stats">
              <div className="stat-item">
                <div className="stat-number">$50M+</div>
                <div className="stat-label">Assets Under Management</div>
              </div>
              <div className="stat-item">
                <div className="stat-number">10K+</div>
                <div className="stat-label">Active Investors</div>
              </div>
              <div className="stat-item">
                <div className="stat-number">500+</div>
                <div className="stat-label">Tokenized Properties</div>
              </div>
            </div>
          </div>
        </div>

        {}
        <div className="demo-section">
          <div className="demo-content">
            <h3 className="demo-title">See Domufi in Action</h3>
            <p className="demo-subtitle">
              Experience our platform with a guided demo. No signup required.
            </p>
            <Link to="/dashboard" className="btn btn-outline btn-large">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M8 5V13L12 9L16 13V5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M4 19H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Try Demo
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

