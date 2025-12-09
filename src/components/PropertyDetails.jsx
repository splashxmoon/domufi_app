import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import InvestmentModal from './InvestmentModal';
import Toast from './Toast';

export default function PropertyDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [investmentAmount, setInvestmentAmount] = useState(1);
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [showInvestmentModal, setShowInvestmentModal] = useState(false);
  const [toast, setToast] = useState(null);

  
  const properties = [
    {
      id: 1,
      name: "Luxury SoHo Loft Complex",
      city: "SoHo, New York",
      image: "/api/placeholder/400/300",
      tokenPrice: 50,
      totalTokens: 10000,
      annualROI: 11.2,
      monthlyRent: 8450,
      occupancy: 95,
      availableTokens: 74,
      description: "Premium luxury residential complex in the heart of SoHo with high-end amenities and excellent rental potential.",
      propertyType: "Residential",
      yearBuilt: 2018,
      squareFootage: "45,000 sq ft",
      units: 24,
      longDescription: "This stunning luxury residential complex represents the pinnacle of SoHo living. With 24 thoughtfully designed units spanning 45,000 square feet, the property offers residents an unparalleled urban lifestyle. Each unit features high-end finishes, floor-to-ceiling windows, and modern smart home technology. The building includes premium amenities such as a state-of-the-art fitness center, rooftop terrace with city views, and 24/7 concierge service.",
      highlights: [
        "Prime SoHo location with excellent walkability",
        "High-end finishes and modern amenities",
        "Strong rental demand and low vacancy rates",
        "Professional property management in place",
        "Recently renovated common areas"
      ],
      financials: {
        propertyValue: 12500000,
        annualRevenue: 2436000,
        annualExpenses: 1036000,
        netOperatingIncome: 1400000,
        capRate: 11.2
      },
      documents: [
        { id: 1, name: "Property Deed", type: "PDF", size: "2.4 MB", date: "2024-01-15", category: "Legal" },
        { id: 2, name: "Inspection Report", type: "PDF", size: "5.1 MB", date: "2024-01-10", category: "Technical" },
        { id: 3, name: "Financial Statement 2023", type: "PDF", size: "1.8 MB", date: "2024-01-05", category: "Financial" },
        { id: 4, name: "Appraisal Report", type: "PDF", size: "3.2 MB", date: "2023-12-20", category: "Financial" },
        { id: 5, name: "Insurance Policy", type: "PDF", size: "890 KB", date: "2023-12-15", category: "Legal" },
        { id: 6, name: "Tenant Lease Agreements", type: "PDF", size: "4.5 MB", date: "2023-12-01", category: "Legal" }
      ],
      location: {
        address: "123 Grand Street, SoHo, New York, NY 10013",
        coordinates: { lat: 40.7235, lng: -74.0027 },
        nearby: [
          { name: "Subway Station", distance: "0.2 miles", type: "transit" },
          { name: "Central Park", distance: "2.1 miles", type: "park" },
          { name: "Shopping District", distance: "0.3 miles", type: "shopping" },
          { name: "Top Restaurants", distance: "0.1 miles", type: "dining" }
        ]
      },
      performanceHistory: [
        { month: "Jan", value: 105000, roi: 10.8 },
        { month: "Feb", value: 108000, roi: 11.0 },
        { month: "Mar", value: 110000, roi: 11.1 },
        { month: "Apr", value: 112000, roi: 11.2 },
        { month: "May", value: 111000, roi: 11.1 },
        { month: "Jun", value: 113000, roi: 11.3 }
      ],
      riskAssessment: {
        overall: "Low",
        marketRisk: "Low",
        liquidityRisk: "Medium",
        propertyRisk: "Low"
      },
      propertyManager: {
        name: "Premium Property Management LLC",
        experience: "15 years",
        properties: "250+",
        rating: 4.8
      },
      recentActivity: [
        { date: "2024-10-26", action: "Token Purchase", amount: "$2,500", user: "Investor #3421" },
        { date: "2024-10-25", action: "Token Purchase", amount: "$5,000", user: "Investor #2891" },
        { date: "2024-10-24", action: "Rental Income", amount: "$8,450", user: "Property" },
        { date: "2024-10-23", action: "Token Purchase", amount: "$1,500", user: "Investor #4123" }
      ]
    },
    {
      id: 2,
      name: "Downtown Miami Office Tower",
      city: "Miami, Florida",
      image: "/api/placeholder/400/300",
      tokenPrice: 50,
      totalTokens: 15000,
      annualROI: 8.5,
      monthlyRent: 12500,
      occupancy: 88,
      availableTokens: 45,
      description: "Modern office building in Miami's financial district with long-term corporate tenants.",
      propertyType: "Commercial",
      yearBuilt: 2020,
      squareFootage: "75,000 sq ft",
      units: 12,
      longDescription: "A prestigious commercial property in the heart of Miami's financial district. This 12-story office tower offers 75,000 square feet of Class A office space with stunning views of Biscayne Bay. The property features modern infrastructure, high-speed elevators, and advanced HVAC systems. Current tenants include established financial services firms and technology companies with long-term lease agreements.",
      highlights: [
        "Prime financial district location",
        "Class A office space with modern amenities",
        "Long-term corporate tenants with strong credit",
        "Energy-efficient building systems",
        "Adjacent to major transportation hubs"
      ],
      financials: {
        propertyValue: 18750000,
        annualRevenue: 3600000,
        annualExpenses: 2006250,
        netOperatingIncome: 1593750,
        capRate: 8.5
      },
      documents: [
        { id: 1, name: "Property Deed", type: "PDF", size: "2.1 MB", date: "2024-01-20", category: "Legal" },
        { id: 2, name: "Building Inspection", type: "PDF", size: "6.3 MB", date: "2024-01-15", category: "Technical" },
        { id: 3, name: "Financial Statement 2023", type: "PDF", size: "2.2 MB", date: "2024-01-08", category: "Financial" },
        { id: 4, name: "Tenant Contracts", type: "PDF", size: "5.7 MB", date: "2023-12-28", category: "Legal" }
      ],
      location: {
        address: "777 Brickell Avenue, Miami, FL 33131",
        coordinates: { lat: 25.7617, lng: -80.1918 },
        nearby: [
          { name: "Metromover Station", distance: "0.1 miles", type: "transit" },
          { name: "Bayfront Park", distance: "0.8 miles", type: "park" },
          { name: "Brickell City Centre", distance: "0.3 miles", type: "shopping" },
          { name: "Financial District", distance: "0.2 miles", type: "business" }
        ]
      },
      performanceHistory: [
        { month: "Jan", value: 95000, roi: 8.2 },
        { month: "Feb", value: 97000, roi: 8.3 },
        { month: "Mar", value: 99000, roi: 8.4 },
        { month: "Apr", value: 101000, roi: 8.5 },
        { month: "May", value: 100500, roi: 8.5 },
        { month: "Jun", value: 102000, roi: 8.6 }
      ],
      riskAssessment: {
        overall: "Low",
        marketRisk: "Low",
        liquidityRisk: "Low",
        propertyRisk: "Low"
      },
      propertyManager: {
        name: "Miami Commercial Properties Inc",
        experience: "20 years",
        properties: "180+",
        rating: 4.9
      },
      recentActivity: [
        { date: "2024-10-26", action: "Token Purchase", amount: "$7,500", user: "Investor #1892" },
        { date: "2024-10-25", action: "Rental Income", amount: "$12,500", user: "Property" },
        { date: "2024-10-24", action: "Token Purchase", amount: "$3,200", user: "Investor #3451" }
      ]
    },
    {
      id: 3,
      name: "Austin Tech Campus",
      city: "Austin, Texas",
      image: "/api/placeholder/400/300",
      tokenPrice: 50,
      totalTokens: 25000,
      annualROI: 9.8,
      monthlyRent: 6800,
      occupancy: 92,
      availableTokens: 60,
      description: "State-of-the-art tech campus with flexible office spaces and modern amenities.",
      propertyType: "Commercial",
      yearBuilt: 2021,
      squareFootage: "60,000 sq ft",
      units: 8,
      longDescription: "A cutting-edge tech campus designed for the modern workforce. This property features 60,000 square feet of flexible workspace across 8 customizable suites. The campus includes collaborative work areas, private offices, and conference facilities. Tenants benefit from high-speed fiber internet, advanced security systems, and ample parking. The property is strategically located in Austin's thriving tech corridor.",
      highlights: [
        "Located in Austin's booming tech corridor",
        "Flexible workspace design for tech companies",
        "State-of-the-art infrastructure and connectivity",
        "Abundant parking and easy highway access",
        "Surrounded by dining and entertainment options"
      ],
      financials: {
        propertyValue: 25000000,
        annualRevenue: 4896000,
        annualExpenses: 2446000,
        netOperatingIncome: 2450000,
        capRate: 9.8
      },
      documents: [
        { id: 1, name: "Property Deed", type: "PDF", size: "1.9 MB", date: "2024-01-18", category: "Legal" },
        { id: 2, name: "Tech Infrastructure Report", type: "PDF", size: "7.2 MB", date: "2024-01-12", category: "Technical" },
        { id: 3, name: "Financial Statement 2023", type: "PDF", size: "2.0 MB", date: "2024-01-06", category: "Financial" },
        { id: 4, name: "Environmental Assessment", type: "PDF", size: "3.8 MB", date: "2023-12-22", category: "Technical" },
        { id: 5, name: "Lease Agreements", type: "PDF", size: "6.1 MB", date: "2023-12-10", category: "Legal" }
      ],
      location: {
        address: "4501 North Lamar Boulevard, Austin, TX 78756",
        coordinates: { lat: 30.2672, lng: -97.7431 },
        nearby: [
          { name: "Tech District", distance: "0.5 miles", type: "business" },
          { name: "Downtown Austin", distance: "3.2 miles", type: "city" },
          { name: "Food Trucks", distance: "0.2 miles", type: "dining" },
          { name: "Zilker Park", distance: "4.1 miles", type: "park" }
        ]
      },
      performanceHistory: [
        { month: "Jan", value: 118000, roi: 9.5 },
        { month: "Feb", value: 120000, roi: 9.6 },
        { month: "Mar", value: 122000, roi: 9.7 },
        { month: "Apr", value: 124000, roi: 9.8 },
        { month: "May", value: 123500, roi: 9.8 },
        { month: "Jun", value: 125000, roi: 9.9 }
      ],
      riskAssessment: {
        overall: "Medium",
        marketRisk: "Medium",
        liquidityRisk: "Low",
        propertyRisk: "Low"
      },
      propertyManager: {
        name: "Austin Commercial Real Estate Group",
        experience: "12 years",
        properties: "120+",
        rating: 4.7
      },
      recentActivity: [
        { date: "2024-10-26", action: "Token Purchase", amount: "$10,000", user: "Investor #5623" },
        { date: "2024-10-26", action: "Token Purchase", amount: "$4,500", user: "Investor #2341" },
        { date: "2024-10-25", action: "Rental Income", amount: "$6,800", user: "Property" },
        { date: "2024-10-24", action: "Token Purchase", amount: "$8,200", user: "Investor #7891" }
      ]
    }
  ];

  
  const property = properties.find(p => p.id === parseInt(id));

  
  if (!property) {
    return (
      <div className="page-section active">
        <div className="property-details-container">
          <div className="not-found">
            <h2>Property Not Found</h2>
            <p>The property you're looking for doesn't exist.</p>
            <button className="btn btn-primary" onClick={() => navigate('/dashboard/marketplace')}>
              Back to Marketplace
            </button>
          </div>
        </div>
      </div>
    );
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const calculateInvestmentReturns = () => {
    const totalInvestment = investmentAmount * property.tokenPrice;
    const annualReturn = totalInvestment * (property.annualROI / 100);
    const monthlyReturn = annualReturn / 12;
    return { totalInvestment, annualReturn, monthlyReturn };
  };

  const returns = calculateInvestmentReturns();

  const handleInvestmentConfirm = (investmentData) => {
    console.log('Investment confirmed:', investmentData);
    setShowInvestmentModal(false);
    setToast({ message: 'Purchase Successful', type: 'success' });
  };

  return (
    <div className="page-section active">
      <div className="property-details-container">
        {}
        <div className="breadcrumb">
          <button className="breadcrumb-link" onClick={() => navigate('/dashboard/marketplace')}>
            Marketplace
          </button>
          <span className="breadcrumb-separator">/</span>
          <span className="breadcrumb-current">{property.name}</span>
        </div>

        {}
        <div className="property-details-header">
          <div className="property-title-section">
            <h1 className="property-details-title">{property.name}</h1>
            <div className="property-location-large">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M21 10C21 17 12 23 12 23S3 17 3 10C3 7.61305 3.94821 5.32387 5.63604 3.63604C7.32387 1.94821 9.61305 1 12 1C14.3869 1 16.6761 1.94821 18.364 3.63604C20.0518 5.32387 21 7.61305 21 10Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <circle cx="12" cy="10" r="3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              {property.city}
            </div>
          </div>
          <div className="property-type-badge">{property.propertyType}</div>
        </div>

        {}
        <div className="property-details-grid">
          {}
          <div className="property-details-left">
            {}
            <div className="property-details-image-container">
              <div className="property-details-image">
                <div className="image-placeholder-large">
                  <svg width="80" height="80" viewBox="0 0 24 24" fill="none">
                    <path d="M3 7V17C3 18.1046 3.89543 19 5 19H19C20.1046 19 21 18.1046 21 17V7M3 7H21M3 7L12 3L21 7M12 3V19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </div>
            </div>

            {}
            <div className="property-tabs">
              <button 
                className={`property-tab ${activeTab === 'overview' ? 'active' : ''}`}
                onClick={() => setActiveTab('overview')}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M3 12L5 10M5 10L12 3L19 10M5 10V20C5 20.5523 5.44772 21 6 21H9M19 10L21 12M19 10V20C19 20.5523 18.5523 21 18 21H15M9 21C9.55228 21 10 20.5523 10 20V16C10 15.4477 10.4477 15 11 15H13C13.5523 15 14 15.4477 14 16V20C14 20.5523 14.4477 21 15 21M9 21H15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Overview
              </button>
              <button 
                className={`property-tab ${activeTab === 'documents' ? 'active' : ''}`}
                onClick={() => setActiveTab('documents')}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M9 12H15M9 16H15M17 21H7C5.89543 21 5 20.1046 5 19V5C5 3.89543 5.89543 3 7 3H12.5858C12.851 3 13.1054 3.10536 13.2929 3.29289L18.7071 8.70711C18.8946 8.89464 19 9.149 19 9.41421V19C19 20.1046 18.1046 21 17 21Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Documents
              </button>
              <button 
                className={`property-tab ${activeTab === 'location' ? 'active' : ''}`}
                onClick={() => setActiveTab('location')}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M21 10C21 17 12 23 12 23S3 17 3 10C3 7.61305 3.94821 5.32387 5.63604 3.63604C7.32387 1.94821 9.61305 1 12 1C14.3869 1 16.6761 1.94821 18.364 3.63604C20.0518 5.32387 21 7.61305 21 10Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <circle cx="12" cy="10" r="3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Location
              </button>
              <button 
                className={`property-tab ${activeTab === 'performance' ? 'active' : ''}`}
                onClick={() => setActiveTab('performance')}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M13 7H21M21 7V15M21 7L13 15L9 11L3 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Performance
              </button>
            </div>

            {}
            {activeTab === 'overview' && (
              <>
                {}
                <div className="details-card">
                  <h2 className="details-card-title">Key Metrics</h2>
                  <div className="key-metrics-grid">
                <div className="key-metric-item">
                  <span className="metric-label">Token Price</span>
                  <span className="metric-value-large">{formatCurrency(property.tokenPrice)}</span>
                </div>
                <div className="key-metric-item">
                  <span className="metric-label">Total Tokens</span>
                  <span className="metric-value-large">{property.totalTokens.toLocaleString()}</span>
                </div>
                <div className="key-metric-item">
                  <span className="metric-label">Annual ROI</span>
                  <span className="metric-value-large positive">{property.annualROI}%</span>
                </div>
                <div className="key-metric-item">
                  <span className="metric-label">Available Tokens</span>
                  <span className="metric-value-large">{property.availableTokens}%</span>
                </div>
                <div className="key-metric-item">
                  <span className="metric-label">Occupancy Rate</span>
                  <span className="metric-value-large">{property.occupancy}%</span>
                </div>
                <div className="key-metric-item">
                  <span className="metric-label">Monthly Rent</span>
                  <span className="metric-value-large">{formatCurrency(property.monthlyRent)}</span>
                </div>
              </div>
            </div>

            {}
            <div className="details-card">
              <h2 className="details-card-title">Property Details</h2>
              <div className="property-info-grid">
                <div className="property-info-item">
                  <span className="info-label">Property Type</span>
                  <span className="info-value">{property.propertyType}</span>
                </div>
                <div className="property-info-item">
                  <span className="info-label">Year Built</span>
                  <span className="info-value">{property.yearBuilt}</span>
                </div>
                <div className="property-info-item">
                  <span className="info-label">Square Footage</span>
                  <span className="info-value">{property.squareFootage}</span>
                </div>
                <div className="property-info-item">
                  <span className="info-label">Units</span>
                  <span className="info-value">{property.units}</span>
                </div>
              </div>
            </div>

            {}
            <div className="details-card">
              <h2 className="details-card-title">About This Property</h2>
              <p className="property-long-description">{property.longDescription}</p>
            </div>

            {}
            <div className="details-card">
              <h2 className="details-card-title">Key Highlights</h2>
              <ul className="highlights-list">
                {property.highlights.map((highlight, index) => (
                  <li key={index} className="highlight-item">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    {highlight}
                  </li>
                ))}
              </ul>
            </div>

            {}
            <div className="details-card">
              <h2 className="details-card-title">Financial Overview</h2>
              <div className="financial-grid">
                <div className="financial-item">
                  <span className="financial-label">Property Value</span>
                  <span className="financial-value">{formatCurrency(property.financials.propertyValue)}</span>
                </div>
                <div className="financial-item">
                  <span className="financial-label">Annual Revenue</span>
                  <span className="financial-value">{formatCurrency(property.financials.annualRevenue)}</span>
                </div>
                <div className="financial-item">
                  <span className="financial-label">Annual Expenses</span>
                  <span className="financial-value">{formatCurrency(property.financials.annualExpenses)}</span>
                </div>
                <div className="financial-item">
                  <span className="financial-label">Net Operating Income</span>
                  <span className="financial-value positive">{formatCurrency(property.financials.netOperatingIncome)}</span>
                </div>
                <div className="financial-item">
                  <span className="financial-label">Cap Rate</span>
                  <span className="financial-value positive">{property.financials.capRate}%</span>
                </div>
              </div>
            </div>
              </>
            )}

            {}
            {activeTab === 'documents' && (
              <div className="details-card">
                <h2 className="details-card-title">Property Documents</h2>
                <p className="card-description">Access all legal, financial, and technical documents related to this property.</p>
                <div className="documents-list">
                  {property.documents.map((doc) => (
                    <div key={doc.id} className="document-item">
                      <div className="document-icon">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                          <path d="M9 12H15M9 16H15M17 21H7C5.89543 21 5 20.1046 5 19V5C5 3.89543 5.89543 3 7 3H12.5858C12.851 3 13.1054 3.10536 13.2929 3.29289L18.7071 8.70711C18.8946 8.89464 19 9.149 19 9.41421V19C19 20.1046 18.1046 21 17 21Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                      <div className="document-info">
                        <h4 className="document-name">{doc.name}</h4>
                        <div className="document-meta">
                          <span className="document-category">{doc.category}</span>
                          <span className="document-size">{doc.size}</span>
                          <span className="document-date">{doc.date}</span>
                        </div>
                      </div>
                      <button className="document-download-btn">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                          <path d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15M7 10L12 15M12 15L17 10M12 15V3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        Download
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {}
            {activeTab === 'location' && (
              <>
                <div className="details-card">
                  <h2 className="details-card-title">Property Location</h2>
                  <div className="location-address">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                      <path d="M21 10C21 17 12 23 12 23S3 17 3 10C3 7.61305 3.94821 5.32387 5.63604 3.63604C7.32387 1.94821 9.61305 1 12 1C14.3869 1 16.6761 1.94821 18.364 3.63604C20.0518 5.32387 21 7.61305 21 10Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <circle cx="12" cy="10" r="3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <span>{property.location.address}</span>
                  </div>
                  
                  {}
                  <div className="property-map">
                    <div className="map-placeholder">
                      <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
                        <path d="M21 10C21 17 12 23 12 23S3 17 3 10C3 7.61305 3.94821 5.32387 5.63604 3.63604C7.32387 1.94821 9.61305 1 12 1C14.3869 1 16.6761 1.94821 18.364 3.63604C20.0518 5.32387 21 7.61305 21 10Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <circle cx="12" cy="10" r="3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      <p>Interactive Map</p>
                      <span>Lat: {property.location.coordinates.lat}, Lng: {property.location.coordinates.lng}</span>
                    </div>
                  </div>
                </div>

                <div className="details-card">
                  <h2 className="details-card-title">Nearby Amenities</h2>
                  <div className="nearby-list">
                    {property.location.nearby.map((item, index) => (
                      <div key={index} className="nearby-item">
                        <div className="nearby-icon">
                          {item.type === 'transit' && (
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                              <path d="M13 6H16L19 3H21V5L19 7V16C19 16.5304 18.7893 17.0391 18.4142 17.4142C18.0391 17.7893 17.5304 18 17 18H15.5L17 19.5V20.5H7V19.5L8.5 18H7C6.46957 18 5.96086 17.7893 5.58579 17.4142C5.21071 17.0391 5 16.5304 5 16V7L3 5V3H5L8 6H13Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          )}
                          {item.type === 'park' && (
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                              <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          )}
                          {item.type === 'shopping' && (
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                              <path d="M6 2L3 6V20C3 20.5304 3.21071 21.0391 3.58579 21.4142C3.96086 21.7893 4.46957 22 5 22H19C19.5304 22 20.0391 21.7893 20.4142 21.4142C20.7893 21.0391 21 20.5304 21 20V6L18 2H6Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          )}
                          {item.type === 'dining' && (
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                              <path d="M3 2V7C3 8.65685 4.34315 10 6 10C7.65685 10 9 8.65685 9 7V2M6 10V22M15 2V22M15 11C17.5 11 21 9 21 5V2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          )}
                          {item.type === 'business' && (
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                              <path d="M3 7V17C3 18.1046 3.89543 19 5 19H19C20.1046 19 21 18.1046 21 17V7M3 7H21M3 7L12 3L21 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          )}
                          {item.type === 'city' && (
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                              <path d="M3 21H21M3 10H21M9 21V10M15 21V10M5 10V6C5 5.44772 5.44772 5 6 5H10M19 10V6C19 5.44772 18.5523 5 18 5H14M10 5V3C10 2.44772 10.4477 2 11 2H13C13.5523 2 14 2.44772 14 3V5M10 5H14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          )}
                        </div>
                        <div className="nearby-details">
                          <span className="nearby-name">{item.name}</span>
                          <span className="nearby-distance">{item.distance}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {}
            {activeTab === 'performance' && (
              <>
                <div className="details-card">
                  <h2 className="details-card-title">Performance History</h2>
                  <p className="card-description">Track the property's monthly performance and ROI trends over the past 6 months.</p>
                  
                  {}
                  <div className="performance-chart">
                    <div className="chart-grid">
                      {property.performanceHistory.map((data, index) => {
                        const maxValue = Math.max(...property.performanceHistory.map(d => d.value));
                        const height = (data.value / maxValue) * 100;
                        return (
                          <div key={index} className="chart-bar-container">
                            <div className="chart-bar-wrapper">
                              <div 
                                className="chart-bar" 
                                style={{ height: `${height}%` }}
                                title={`${data.month}: ${formatCurrency(data.value)}`}
                              >
                                <span className="chart-value">{formatCurrency(data.value)}</span>
                              </div>
                            </div>
                            <span className="chart-label">{data.month}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div className="details-card">
                  <h2 className="details-card-title">Risk Assessment</h2>
                  <div className="risk-grid">
                    <div className={`risk-item risk-${property.riskAssessment.overall.toLowerCase()}`}>
                      <span className="risk-label">Overall Risk</span>
                      <span className="risk-value">{property.riskAssessment.overall}</span>
                    </div>
                    <div className={`risk-item risk-${property.riskAssessment.marketRisk.toLowerCase()}`}>
                      <span className="risk-label">Market Risk</span>
                      <span className="risk-value">{property.riskAssessment.marketRisk}</span>
                    </div>
                    <div className={`risk-item risk-${property.riskAssessment.liquidityRisk.toLowerCase()}`}>
                      <span className="risk-label">Liquidity Risk</span>
                      <span className="risk-value">{property.riskAssessment.liquidityRisk}</span>
                    </div>
                    <div className={`risk-item risk-${property.riskAssessment.propertyRisk.toLowerCase()}`}>
                      <span className="risk-label">Property Risk</span>
                      <span className="risk-value">{property.riskAssessment.propertyRisk}</span>
                    </div>
                  </div>
                </div>

                <div className="details-card">
                  <h2 className="details-card-title">Property Management</h2>
                  <div className="manager-info">
                    <div className="manager-header">
                      <div className="manager-avatar">
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                          <path d="M3 7V17C3 18.1046 3.89543 19 5 19H19C20.1046 19 21 18.1046 21 17V7M3 7H21M3 7L12 3L21 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                      <div className="manager-details">
                        <h4 className="manager-name">{property.propertyManager.name}</h4>
                        <div className="manager-rating">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/>
                          </svg>
                          <span>{property.propertyManager.rating}</span>
                        </div>
                      </div>
                    </div>
                    <div className="manager-stats">
                      <div className="manager-stat">
                        <span className="stat-label">Experience</span>
                        <span className="stat-value">{property.propertyManager.experience}</span>
                      </div>
                      <div className="manager-stat">
                        <span className="stat-label">Properties Managed</span>
                        <span className="stat-value">{property.propertyManager.properties}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="details-card">
                  <h2 className="details-card-title">Recent Activity</h2>
                  <div className="activity-list">
                    {property.recentActivity.map((activity, index) => (
                      <div key={index} className="activity-item">
                        <div className="activity-icon">
                          {activity.action === 'Token Purchase' ? (
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                              <path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          ) : (
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                              <path d="M12 2V22M17 5H9.5C8.11929 5 7 6.11929 7 7.5S8.11929 10 9.5 10H14.5C15.8807 10 17 11.1193 17 12.5S15.8807 15 14.5 15H7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          )}
                        </div>
                        <div className="activity-details">
                          <div className="activity-info">
                            <span className="activity-action">{activity.action}</span>
                            <span className="activity-user">{activity.user}</span>
                          </div>
                          <span className="activity-date">{activity.date}</span>
                        </div>
                        <span className="activity-amount">{activity.amount}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>

          {}
          <div className="property-details-right">
            <div className="investment-panel sticky">
              <h2 className="investment-panel-title">Invest in This Property</h2>
              
              {}
              <div className="investment-calculator">
                <div className="calculator-input-group">
                  <label className="calculator-label">Number of Tokens</label>
                  <div className="calculator-input-wrapper">
                    <button 
                      className="calculator-btn"
                      onClick={() => setInvestmentAmount(Math.max(1, investmentAmount - 1))}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path d="M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </button>
                    <input
                      type="number"
                      className="calculator-input"
                      value={investmentAmount}
                      onChange={(e) => setInvestmentAmount(Math.max(1, parseInt(e.target.value) || 1))}
                      min="1"
                    />
                    <button 
                      className="calculator-btn"
                      onClick={() => setInvestmentAmount(investmentAmount + 1)}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </button>
                  </div>
                </div>

                <div className="investment-summary">
                  <div className="summary-item">
                    <span className="summary-label">Total Investment</span>
                    <span className="summary-value">{formatCurrency(returns.totalInvestment)}</span>
                  </div>
                  <div className="summary-item">
                    <span className="summary-label">Est. Annual Return</span>
                    <span className="summary-value positive">{formatCurrency(returns.annualReturn)}</span>
                  </div>
                  <div className="summary-item">
                    <span className="summary-label">Est. Monthly Return</span>
                    <span className="summary-value positive">{formatCurrency(returns.monthlyReturn)}</span>
                  </div>
                </div>
              </div>

              <button 
                className="btn btn-primary btn-large"
                onClick={() => setShowInvestmentModal(true)}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Invest Now
              </button>

              <div className="investment-info">
                <div className="info-item">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                    <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M12 16V12M12 8H12.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <span>Minimum investment: {formatCurrency(property.tokenPrice)}</span>
                </div>
                <div className="info-item">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                    <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M12 16V12M12 8H12.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <span>Tokens are tradable after 30 days</span>
                </div>
                <div className="info-item">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                    <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M12 16V12M12 8H12.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <span>Returns distributed monthly</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {}
        {showInvestmentModal && (
          <InvestmentModal
            property={property}
            tokenAmount={investmentAmount}
            onClose={() => setShowInvestmentModal(false)}
            onConfirm={handleInvestmentConfirm}
          />
        )}

        {}
        {toast && (
          <Toast 
            message={toast.message} 
            type={toast.type} 
            onClose={() => setToast(null)} 
          />
        )}
      </div>
    </div>
  );
}

