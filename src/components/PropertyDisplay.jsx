import React from 'react';

const PropertyDisplay = ({ properties }) => {
  if (!properties || properties.length === 0) {
    return null;
  }

  return (
    <div className="property-display">
      <h4>Available Properties</h4>
      <div className="properties-grid">
        {properties.map((property, index) => (
          <div key={property.id} className="property-card">
            <div className="property-header">
              <h5>{property.name}</h5>
              <span className="property-type">{property.type}</span>
            </div>
            
            <div className="property-location">
              📍 {property.location}
            </div>
            
            <div className="property-details">
              <div className="property-price">
                💰 ${property.price.toLocaleString()}
              </div>
              <div className="property-roi">
                📈 ROI: {property.roi}%
              </div>
              <div className="property-income">
                📊 Monthly Income: ${property.monthlyIncome.toLocaleString()}
              </div>
            </div>
            
            <div className="property-description">
              {property.description}
            </div>
            
            {property.features && property.features.length > 0 && (
              <div className="property-features">
                <strong>Features:</strong>
                <ul>
                  {property.features.map((feature, idx) => (
                    <li key={idx}>{feature}</li>
                  ))}
                </ul>
              </div>
            )}
            
            {property.investmentHighlights && property.investmentHighlights.length > 0 && (
              <div className="property-highlights">
                <strong>Investment Highlights:</strong>
                <ul>
                  {property.investmentHighlights.map((highlight, idx) => (
                    <li key={idx}>{highlight}</li>
                  ))}
                </ul>
              </div>
            )}
            
            <div className="property-actions">
              <button className="btn btn-primary btn-sm">
                View Details
              </button>
              <button className="btn btn-secondary btn-sm">
                Add to Watchlist
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PropertyDisplay;
