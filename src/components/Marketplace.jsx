import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import InvestmentModal from './InvestmentModal';
import PropertyAIAnalysis from './PropertyAIAnalysis';
import Toast from './Toast';

export default function Marketplace() {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [location, setLocation] = useState('All Locations');
  const [favoriteProperties, setFavoriteProperties] = useState(new Set());
  const [showInvestmentModal, setShowInvestmentModal] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [showAIAnalysis, setShowAIAnalysis] = useState(false);
  const [aiAnalysisProperty, setAiAnalysisProperty] = useState(null);
  const [toast, setToast] = useState(null);

  
  const properties = [
    {
      id: 1,
      name: "Luxury SoHo Loft Complex",
      location: "SoHo, New York",
      image: "https://via.placeholder.com/400x300?text=Luxury+SoHo+Loft",
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
      units: 24
    },
    {
      id: 2,
      name: "Beverly Hills Luxury Estate",
      location: "Beverly Hills, California",
      image: "https://via.placeholder.com/400x300?text=Beverly+Hills+Estate",
      tokenPrice: 50,
      totalTokens: 20000,
      annualROI: 12.5,
      monthlyRent: 15000,
      occupancy: 98,
      availableTokens: 25,
      description: "Exclusive luxury estate in Beverly Hills with premium amenities and stunning views.",
      propertyType: "Residential",
      yearBuilt: 2019,
      squareFootage: "65,000 sq ft",
      units: 16
    },
    {
      id: 3,
      name: "Miami Beach Condo Tower",
      location: "Miami Beach, Florida",
      image: "https://via.placeholder.com/400x300?text=Miami+Beach+Condo",
      tokenPrice: 50,
      totalTokens: 15000,
      annualROI: 9.8,
      monthlyRent: 12500,
      occupancy: 92,
      availableTokens: 60,
      description: "Luxury oceanfront condominium tower with stunning beach views and resort-style amenities.",
      propertyType: "Residential",
      yearBuilt: 2020,
      squareFootage: "55,000 sq ft",
      units: 32
    },
    {
      id: 4,
      name: "Austin Hillside Villas",
      location: "Austin, Texas",
      image: "https://via.placeholder.com/400x300?text=Austin+Villas",
      tokenPrice: 50,
      totalTokens: 18000,
      annualROI: 10.5,
      monthlyRent: 9800,
      occupancy: 94,
      availableTokens: 45,
      description: "Modern hillside residential development with panoramic city views and contemporary design.",
      propertyType: "Residential",
      yearBuilt: 2021,
      squareFootage: "48,000 sq ft",
      units: 18
    },
    {
      id: 5,
      name: "Chicago Lakefront Apartments",
      location: "Chicago, Illinois",
      image: "https://via.placeholder.com/400x300?text=Chicago+Lakefront",
      tokenPrice: 50,
      totalTokens: 22000,
      annualROI: 9.2,
      monthlyRent: 11200,
      occupancy: 91,
      availableTokens: 35,
      description: "Premium lakefront residential complex with stunning Lake Michigan views and luxury amenities.",
      propertyType: "Residential",
      yearBuilt: 2020,
      squareFootage: "62,000 sq ft",
      units: 28
    },
    {
      id: 6,
      name: "Seattle Urban Lofts",
      location: "Seattle, Washington",
      image: "https://via.placeholder.com/400x300?text=Seattle+Lofts",
      tokenPrice: 50,
      totalTokens: 25000,
      annualROI: 10.8,
      monthlyRent: 9800,
      occupancy: 94,
      availableTokens: 50,
      description: "Modern urban loft complex in Seattle's tech district with contemporary design and smart home features.",
      propertyType: "Residential",
      yearBuilt: 2021,
      squareFootage: "58,000 sq ft",
      units: 22
    },
    {
      id: 7,
      name: "Manhattan Penthouse Collection",
      location: "Manhattan, New York",
      image: "https://via.placeholder.com/400x300?text=Manhattan+Penthouse",
      tokenPrice: 50,
      totalTokens: 30000,
      annualROI: 13.2,
      monthlyRent: 18500,
      occupancy: 96,
      availableTokens: 15,
      description: "Ultra-luxury penthouse collection in Manhattan with panoramic city views and world-class amenities.",
      propertyType: "Residential",
      yearBuilt: 2022,
      squareFootage: "75,000 sq ft",
      units: 12
    },
    {
      id: 8,
      name: "Los Angeles Hillside Estates",
      location: "Los Angeles, California",
      image: "https://via.placeholder.com/400x300?text=LA+Hillside",
      tokenPrice: 50,
      totalTokens: 28000,
      annualROI: 11.8,
      monthlyRent: 16800,
      occupancy: 97,
      availableTokens: 20,
      description: "Exclusive hillside residential estates in Los Angeles with stunning city and ocean views.",
      propertyType: "Residential",
      yearBuilt: 2021,
      squareFootage: "68,000 sq ft",
      units: 14
    }
  ];

  const filters = ["All", "Favorites"];
  const locations = ["All Locations", "New York", "California", "Florida", "Texas", "Illinois", "Washington"];

  
  const metrics = useMemo(() => {
    const activeListings = properties.length;
    const avgTokenPrice = Math.round(properties.reduce((sum, prop) => sum + prop.tokenPrice, 0) / properties.length);
    const marketCap = properties.reduce((sum, prop) => sum + (prop.tokenPrice * prop.totalTokens), 0);
    
    return {
      activeListings,
      avgTokenPrice,
      marketCap
    };
  }, [properties]);

  
  const toggleFavorite = (propertyId) => {
    setFavoriteProperties(prev => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(propertyId)) {
        newFavorites.delete(propertyId);
      } else {
        newFavorites.add(propertyId);
      }
      return newFavorites;
    });
  };

  
  const filteredProperties = useMemo(() => {
    let filtered = properties;

    
    if (activeFilter === "Favorites") {
      filtered = filtered.filter(property =>
        favoriteProperties.has(property.id)
      );
    }

    
    if (location !== "All Locations") {
      filtered = filtered.filter(property => {
        const stateMap = {
          "New York": ["New York", "Manhattan"],
          "California": ["California", "Beverly Hills", "Los Angeles"],
          "Florida": ["Florida", "Miami"],
          "Texas": ["Texas", "Austin"],
          "Illinois": ["Illinois", "Chicago"],
          "Washington": ["Washington", "Seattle"]
        };
        const locations = stateMap[location] || [location];
        return locations.some(loc => property.location.includes(loc));
      });
    }

    
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(property =>
        property.name.toLowerCase().includes(searchLower) ||
        property.location.toLowerCase().includes(searchLower) ||
        property.description.toLowerCase().includes(searchLower)
      );
    }

    return filtered;
  }, [activeFilter, searchTerm, location, favoriteProperties]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const handleInvestClick = (property) => {
    setSelectedProperty(property);
    setShowInvestmentModal(true);
  };

  const handleInvestmentConfirm = (investmentData) => {
    console.log('Investment confirmed:', investmentData);
    setShowInvestmentModal(false);
    setToast({ message: 'Purchase Successful', type: 'success' });
  };

  const handleAIAnalysisClick = (property) => {
    setAiAnalysisProperty(property);
    setShowAIAnalysis(true);
  };

  return (
    <div id="marketplace" className="page-section active">
      <div className="marketplace-container">
        {}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', 
          gap: '16px', 
          marginBottom: '24px' 
        }}>
          {}
          <div style={{
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-primary)',
            borderRadius: '14px',
            padding: '20px',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
              <div>
                <div style={{ fontSize: '12px', color: '#ffffff', opacity: 0.7, marginBottom: '6px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Active Listings
                </div>
                <div style={{ fontSize: '28px', fontWeight: '700', color: '#ffffff', letterSpacing: '-0.02em', fontVariantNumeric: 'tabular-nums' }}>
                  {metrics.activeListings}
                </div>
              </div>
              <div style={{
                width: '48px',
                height: '48px',
                background: 'rgba(59, 130, 246, 0.15)',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2">
                  <path d="M3 7V17C3 18.1046 3.89543 19 5 19H19C20.1046 19 21 18.1046 21 17V7M3 7H21M3 7L12 3L21 7M12 3V19" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </div>
            <div style={{ fontSize: '13px', color: '#ffffff', opacity: 0.7, paddingTop: '12px', borderTop: '1px solid var(--border-primary)' }}>
              Properties available for investment
            </div>
          </div>

          {}
          <div style={{
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-primary)',
            borderRadius: '14px',
            padding: '20px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
              <div>
                <div style={{ fontSize: '12px', color: '#ffffff', opacity: 0.7, marginBottom: '6px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Average Token Price
                </div>
                <div style={{ fontSize: '28px', fontWeight: '700', color: '#ffffff', letterSpacing: '-0.02em', fontVariantNumeric: 'tabular-nums' }}>
                  {formatCurrency(metrics.avgTokenPrice)}
                </div>
              </div>
              <div style={{
                width: '48px',
                height: '48px',
                background: 'rgba(139, 92, 246, 0.15)',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" strokeWidth="2">
                  <path d="M12 2V22M17 5H9.5C8.11929 5 7 6.11929 7 7.5S8.11929 10 9.5 10H14.5C15.8807 10 17 11.1193 17 12.5S15.8807 15 14.5 15H7" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </div>
            <div style={{ fontSize: '13px', color: '#ffffff', opacity: 0.7, paddingTop: '12px', borderTop: '1px solid var(--border-primary)' }}>
              Per token across all properties
            </div>
          </div>

          {}
          <div style={{
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-primary)',
            borderRadius: '14px',
            padding: '20px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
              <div>
                <div style={{ fontSize: '12px', color: '#ffffff', opacity: 0.7, marginBottom: '6px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Total Market Cap
                </div>
                <div style={{ fontSize: '28px', fontWeight: '700', color: '#10b981', letterSpacing: '-0.02em', fontVariantNumeric: 'tabular-nums' }}>
                  {formatCurrency(metrics.marketCap)}
                </div>
              </div>
              <div style={{
                width: '48px',
                height: '48px',
                background: 'rgba(16, 185, 129, 0.15)',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2">
                  <path d="M12 2L2 7L12 12L22 7L12 2Z" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M2 17L12 22L22 17" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M2 12L12 17L22 12" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingTop: '12px', borderTop: '1px solid var(--border-primary)' }}>
              <div style={{ 
                fontSize: '13px', 
                fontWeight: '600', 
                color: '#10b981',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M7 17L17 7M17 7H7M17 7V17" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Growing
              </div>
              <span style={{ fontSize: '12px', color: '#ffffff', opacity: 0.6 }}>Tokenized real estate value</span>
            </div>
          </div>
        </div>

        {}
        <div style={{
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border-primary)',
          borderRadius: '12px',
          padding: '16px',
          marginBottom: '24px'
        }}>
          <div style={{ 
            display: 'flex', 
            flexWrap: 'wrap', 
            gap: '10px', 
            alignItems: 'center',
            width: '100%'
          }}>
            {}
            <div style={{ 
              position: 'relative', 
              flex: '0 1 auto',
              minWidth: '280px',
              maxWidth: '400px',
              width: '100%'
            }}>
              <svg 
                width="18" 
                height="18" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2"
                style={{
                  position: 'absolute',
                  left: '16px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#ffffff',
                  opacity: 0.6,
                  pointerEvents: 'none',
                  zIndex: 1
                }}
              >
                <path d="M21 21L16.65 16.65M19 11C19 15.4183 15.4183 19 11 19C6.58172 19 3 15.4183 3 11C3 6.58172 6.58172 3 11 3C15.4183 3 19 6.58172 19 11Z" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <input
                type="text"
                placeholder="Search properties, locations, or keywords..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 16px 12px 44px',
                  background: 'var(--bg-tertiary)',
                  border: '1px solid var(--border-primary)',
                  borderRadius: '10px',
                  color: '#ffffff',
                  fontSize: '14px',
                  fontWeight: '400',
                  outline: 'none',
                  transition: 'all 0.2s ease',
                  fontFamily: 'inherit'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = 'var(--accent-blue)';
                  e.target.style.background = 'var(--bg-secondary)';
                  e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'var(--border-primary)';
                  e.target.style.background = 'var(--bg-tertiary)';
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>

            {}
            <div style={{ position: 'relative' }}>
              <select 
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                style={{
                  padding: '12px 40px 12px 16px',
                  background: 'var(--bg-tertiary)',
                  border: '1px solid var(--border-primary)',
                  borderRadius: '10px',
                  color: '#ffffff',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  outline: 'none',
                  appearance: 'none',
                  transition: 'all 0.2s ease',
                  minWidth: '160px',
                  fontFamily: 'inherit'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = 'var(--accent-blue)';
                  e.target.style.background = 'var(--bg-secondary)';
                  e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'var(--border-primary)';
                  e.target.style.background = 'var(--bg-tertiary)';
                  e.target.style.boxShadow = 'none';
                }}
              >
                {locations.map(loc => (
                  <option key={loc} value={loc} style={{ background: 'var(--bg-secondary)', color: '#ffffff' }}>{loc}</option>
                ))}
              </select>
              <svg 
                width="16" 
                height="16" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2"
                style={{
                  position: 'absolute',
                  right: '14px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#ffffff',
                  opacity: 0.6,
                  pointerEvents: 'none'
                }}
              >
                <path d="M6 9L12 15L18 9" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>

            {}
            <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
              {filters.map((filter) => (
                <button
                  key={filter}
                  onClick={() => setActiveFilter(filter)}
                  style={{
                    padding: '12px 20px',
                    background: activeFilter === filter ? 'var(--accent-blue)' : 'var(--bg-tertiary)',
                    border: `1px solid ${activeFilter === filter ? 'var(--accent-blue)' : 'var(--border-primary)'}`,
                    borderRadius: '10px',
                    color: '#ffffff',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    boxShadow: activeFilter === filter ? '0 2px 8px rgba(59, 130, 246, 0.25)' : 'none',
                    whiteSpace: 'nowrap',
                    fontFamily: 'inherit'
                  }}
                  onMouseEnter={(e) => {
                    if (activeFilter !== filter) {
                      e.currentTarget.style.background = 'var(--bg-secondary)';
                      e.currentTarget.style.borderColor = 'var(--border-secondary)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (activeFilter !== filter) {
                      e.currentTarget.style.background = 'var(--bg-tertiary)';
                      e.currentTarget.style.borderColor = 'var(--border-primary)';
                    }
                  }}
                >
                  {filter}
                  {activeFilter === filter && activeFilter !== "All" && (
                    <span style={{
                      padding: '2px 8px',
                      background: 'rgba(255, 255, 255, 0.2)',
                      borderRadius: '10px',
                      fontSize: '12px',
                      fontWeight: '600',
                      minWidth: '20px',
                      textAlign: 'center'
                    }}>
                      {filteredProperties.length}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {}
            {(activeFilter !== "All" || searchTerm || location !== "All Locations") && (
              <button
                onClick={() => {
                  setActiveFilter("All");
                  setSearchTerm("");
                  setLocation("All Locations");
                }}
                title="Clear all filters"
                style={{
                  padding: '12px 18px',
                  background: 'transparent',
                  border: '1px solid var(--border-primary)',
                  borderRadius: '10px',
                  color: '#ffffff',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  opacity: 0.8,
                  whiteSpace: 'nowrap',
                  fontFamily: 'inherit'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'var(--bg-tertiary)';
                  e.currentTarget.style.borderColor = 'var(--border-secondary)';
                  e.currentTarget.style.opacity = '1';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.borderColor = 'var(--border-primary)';
                  e.currentTarget.style.opacity = '0.8';
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M18 6L6 18M6 6L18 18" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Clear Filters
              </button>
            )}
          </div>
        </div>

        {}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))',
          gap: '20px',
          marginBottom: '24px'
        }}>
          {filteredProperties.map((property) => (
            <div 
              key={property.id} 
              onClick={() => navigate(`/dashboard/marketplace/property/${property.id}`)}
              style={{
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-primary)',
                borderRadius: '16px',
                overflow: 'hidden',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                display: 'flex',
                flexDirection: 'column'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--border-secondary)';
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 12px 32px rgba(0, 0, 0, 0.3)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--border-primary)';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              {}
              <div style={{ position: 'relative', width: '100%', height: '220px', overflow: 'hidden' }}>
                <img 
                  src={property.image} 
                  alt={property.name}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    transition: 'transform 0.3s ease'
                  }}
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.transform = 'scale(1.05)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = 'scale(1)';
                  }}
                />
                {}
                <div style={{
                  position: 'absolute',
                  top: '16px',
                  left: '16px',
                  padding: '6px 12px',
                  background: property.availableTokens > 50 ? 'rgba(16, 185, 129, 0.9)' : property.availableTokens > 25 ? 'rgba(245, 158, 11, 0.9)' : 'rgba(239, 68, 68, 0.9)',
                  borderRadius: '8px',
                  fontSize: '12px',
                  fontWeight: '600',
                  color: '#ffffff',
                  backdropFilter: 'blur(8px)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}>
                  <div style={{
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    background: '#ffffff',
                    animation: 'pulse 2s infinite'
                  }}></div>
                  {property.availableTokens}% Available
                </div>
                {}
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFavorite(property.id);
                  }}
                  style={{
                    position: 'absolute',
                    top: '16px',
                    right: '16px',
                    width: '40px',
                    height: '40px',
                    background: 'rgba(0, 0, 0, 0.5)',
                    backdropFilter: 'blur(8px)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    color: favoriteProperties.has(property.id) ? '#ef4444' : '#ffffff'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(0, 0, 0, 0.7)';
                    e.currentTarget.style.transform = 'scale(1.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(0, 0, 0, 0.5)';
                    e.currentTarget.style.transform = 'scale(1)';
                  }}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill={favoriteProperties.has(property.id) ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
                    <path d="M20.84 4.61C20.3292 4.099 19.7228 3.69364 19.0554 3.41708C18.3879 3.14052 17.6725 2.99817 16.95 2.99817C16.2275 2.99817 15.5121 3.14052 14.8446 3.41708C14.1772 3.69364 13.5708 4.099 13.06 4.61L12 5.67L10.94 4.61C9.9083 3.5783 8.50903 2.9987 7.05 2.9987C5.59096 2.9987 4.19169 3.5783 3.16 4.61C2.1283 5.6417 1.5487 7.04097 1.5487 8.5C1.5487 9.95903 2.1283 11.3583 3.16 12.39L12 21.23L20.84 12.39C21.351 11.8792 21.7563 11.2728 22.0329 10.6053C22.3095 9.93789 22.4518 9.22248 22.4518 8.5C22.4518 7.77752 22.3095 7.06211 22.0329 6.39467C21.7563 5.72723 21.351 5.1208 20.84 4.61Z" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              </div>

              {}
              <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px', flex: 1 }}>
                {}
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px', fontSize: '13px', color: '#ffffff', opacity: 0.75 }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 10C21 17 12 23 12 23S3 17 3 10C3 7.61305 3.94821 5.32387 5.63604 3.63604C7.32387 1.94821 9.61305 1 12 1C14.3869 1 16.6761 1.94821 18.364 3.63604C20.0518 5.32387 21 7.61305 21 10Z" strokeLinecap="round" strokeLinejoin="round"/>
                      <circle cx="12" cy="10" r="3" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    {property.location}
                  </div>
                  <h3 style={{ fontSize: '20px', fontWeight: '700', color: '#ffffff', margin: 0, letterSpacing: '-0.01em', lineHeight: '1.3' }}>
                    {property.name}
                  </h3>
                </div>

                {}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: '12px',
                  padding: '16px',
                  background: 'var(--bg-tertiary)',
                  borderRadius: '12px',
                  border: '1px solid var(--border-primary)'
                }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '11px', color: '#ffffff', opacity: 0.6, marginBottom: '6px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Token Price
                    </div>
                    <div style={{ fontSize: '18px', fontWeight: '700', color: '#ffffff', fontVariantNumeric: 'tabular-nums' }}>
                      {formatCurrency(property.tokenPrice)}
                    </div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '11px', color: '#ffffff', opacity: 0.6, marginBottom: '6px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Annual ROI
                    </div>
                    <div style={{ fontSize: '18px', fontWeight: '700', color: '#10b981', fontVariantNumeric: 'tabular-nums' }}>
                      {property.annualROI}%
                    </div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '11px', color: '#ffffff', opacity: 0.6, marginBottom: '6px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Total Tokens
                    </div>
                    <div style={{ fontSize: '18px', fontWeight: '700', color: '#ffffff', fontVariantNumeric: 'tabular-nums' }}>
                      {property.totalTokens.toLocaleString()}
                    </div>
                  </div>
                </div>

                {}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, 1fr)',
                  gap: '12px'
                }}>
                  <div style={{
                    padding: '12px',
                    background: 'var(--bg-tertiary)',
                    borderRadius: '10px',
                    border: '1px solid var(--border-primary)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px'
                  }}>
                    <div style={{
                      width: '36px',
                      height: '36px',
                      background: 'rgba(16, 185, 129, 0.15)',
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2">
                        <path d="M12 2L15.09 8.26L22 9L17 14L18.18 21L12 17.77L5.82 21L7 14L2 9L8.91 8.26L12 2Z" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '11px', color: '#ffffff', opacity: 0.6, marginBottom: '2px', fontWeight: '600', textTransform: 'uppercase' }}>
                        Occupancy
                      </div>
                      <div style={{ fontSize: '16px', fontWeight: '700', color: '#ffffff', fontVariantNumeric: 'tabular-nums' }}>
                        {property.occupancy}%
                      </div>
                    </div>
                  </div>
                  <div style={{
                    padding: '12px',
                    background: 'var(--bg-tertiary)',
                    borderRadius: '10px',
                    border: '1px solid var(--border-primary)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px'
                  }}>
                    <div style={{
                      width: '36px',
                      height: '36px',
                      background: 'rgba(59, 130, 246, 0.15)',
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2">
                        <path d="M12 2V22M17 5H9.5C8.11929 5 7 6.11929 7 7.5S8.11929 10 9.5 10H14.5C15.8807 10 17 11.1193 17 12.5S15.8807 15 14.5 15H7" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '11px', color: '#ffffff', opacity: 0.6, marginBottom: '2px', fontWeight: '600', textTransform: 'uppercase' }}>
                        Monthly Rent
                      </div>
                      <div style={{ fontSize: '16px', fontWeight: '700', color: '#ffffff', fontVariantNumeric: 'tabular-nums' }}>
                        {formatCurrency(property.monthlyRent)}
                      </div>
                    </div>
                  </div>
                </div>

                {}
                <div style={{ display: 'flex', gap: '10px', marginTop: 'auto' }} onClick={(e) => e.stopPropagation()}>
                  <button 
                    onClick={() => handleInvestClick(property)}
                    style={{
                      flex: 1,
                      padding: '12px 18px',
                      background: 'var(--accent-blue)',
                      border: 'none',
                      borderRadius: '10px',
                      color: '#ffffff',
                      fontSize: '14px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      boxShadow: '0 2px 8px rgba(59, 130, 246, 0.2)'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = '#2563eb';
                      e.currentTarget.style.transform = 'translateY(-1px)';
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.3)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'var(--accent-blue)';
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 2px 8px rgba(59, 130, 246, 0.2)';
                    }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M12 2L2 7L12 12L22 7L12 2Z" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M2 17L12 22L22 17" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M2 12L12 17L22 12" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    Invest Now
                  </button>
                  <button 
                    onClick={() => handleAIAnalysisClick(property)}
                    title="AI-Powered Property Analysis"
                    style={{
                      padding: '12px 18px',
                      background: 'var(--bg-tertiary)',
                      border: '1px solid var(--border-primary)',
                      borderRadius: '10px',
                      color: '#ffffff',
                      fontSize: '14px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'var(--bg-secondary)';
                      e.currentTarget.style.borderColor = 'var(--border-secondary)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'var(--bg-tertiary)';
                      e.currentTarget.style.borderColor = 'var(--border-primary)';
                    }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-5 0v-15A2.5 2.5 0 0 1 9.5 2z" fill="currentColor"/>
                      <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 5 0v-15A2.5 2.5 0 0 0 14.5 2z" fill="currentColor"/>
                    </svg>
                    AI Insights
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {}
        {filteredProperties.length === 0 && (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '80px 20px',
            textAlign: 'center',
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-primary)',
            borderRadius: '16px'
          }}>
            <div style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              background: 'var(--bg-tertiary)',
              border: '1.5px solid var(--border-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '24px',
              opacity: 0.7
            }}>
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--text-secondary)" strokeWidth="2">
                <path d="M21 21L16.65 16.65M19 11C19 15.4183 15.4183 19 11 19C6.58172 19 3 15.4183 3 11C3 6.58172 6.58172 3 11 3C15.4183 3 19 6.58172 19 11Z" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <h3 style={{
              fontSize: '24px',
              fontWeight: '700',
              color: '#ffffff',
              marginBottom: '12px',
              letterSpacing: '-0.01em'
            }}>
              No Properties Found
            </h3>
            <p style={{
              fontSize: '15px',
              color: '#ffffff',
              opacity: 0.7,
              marginBottom: '32px',
              maxWidth: '400px',
              lineHeight: '1.6'
            }}>
              Try adjusting your filters or search terms to find more properties.
            </p>
            <button 
              onClick={() => {
                setActiveFilter('All');
                setSearchTerm('');
                setLocation('All Locations');
              }}
              style={{
                padding: '12px 24px',
                background: 'var(--accent-blue)',
                border: 'none',
                borderRadius: '10px',
                color: '#ffffff',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 2px 8px rgba(59, 130, 246, 0.2)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#2563eb';
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.3)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'var(--accent-blue)';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(59, 130, 246, 0.2)';
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M18 6L6 18M6 6L18 18" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Clear Filters
            </button>
          </div>
        )}

        {}
        {showInvestmentModal && selectedProperty && (
          <InvestmentModal
            property={selectedProperty}
            tokenAmount={1}
            onClose={() => setShowInvestmentModal(false)}
            onConfirm={handleInvestmentConfirm}
          />
        )}

        {}
        {showAIAnalysis && aiAnalysisProperty && (
          <PropertyAIAnalysis
            isOpen={showAIAnalysis}
            onClose={() => setShowAIAnalysis(false)}
            property={aiAnalysisProperty}
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
