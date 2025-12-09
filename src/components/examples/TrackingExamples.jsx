import React, { useState } from 'react';
import { 
  usePropertyTracking, 
  useInvestmentTracking, 
  usePortfolioTracking,
  useFeatureTracking,
  useActionTracking,
  useInteractionTracking 
} from '../../lib/analytics/hooks';
import { 
  trackPropertySearch, 
  trackInvestmentCompletion,
  trackFeatureUsage 
} from '../../lib/analytics/tracking';


export const PropertyCard = ({ property }) => {
  const { trackPropertyInteraction } = usePropertyTracking(property.id, {
    title: property.title,
    price: property.price,
    location: property.location,
    type: property.type
  });

  const { trackClick } = useInteractionTracking('PropertyCard');

  const handleViewDetails = () => {
    trackPropertyInteraction('view_details', {
      property_title: property.title,
      property_price: property.price
    });
    trackClick('view_details_button');
    
  };

  const handleAddToFavorites = () => {
    trackPropertyInteraction('add_to_favorites', {
      property_id: property.id
    });
    trackClick('favorite_button');
    
  };

  return (
    <div className="property-card">
      <h3>{property.title}</h3>
      <p>${property.price}</p>
      <p>{property.location}</p>
      <button onClick={handleViewDetails}>View Details</button>
      <button onClick={handleAddToFavorites}>Add to Favorites</button>
    </div>
  );
};


export const InvestmentCalculator = ({ property }) => {
  const [investmentAmount, setInvestmentAmount] = useState(0);
  const [tokenAmount, setTokenAmount] = useState(0);
  
  const { 
    trackInvestmentView, 
    trackInvestmentCalculation, 
    trackInvestmentInitiation 
  } = useInvestmentTracking(property.id);

  const { trackInput } = useInteractionTracking('InvestmentCalculator');

  
  React.useEffect(() => {
    trackInvestmentView({
      property_id: property.id,
      property_title: property.title,
      property_price: property.price
    });
  }, [property.id]);

  const handleAmountChange = (amount) => {
    setInvestmentAmount(amount);
    const tokens = amount / 100; 
    setTokenAmount(tokens);
    
    
    trackInvestmentCalculation(property.id, amount, tokens, {
      calculation_method: 'simple_ratio',
      ratio: '100:1'
    });
    
    trackInput('investment_amount', { amount, tokens });
  };

  const handleInvest = () => {
    trackInvestmentInitiation(property.id, investmentAmount, tokenAmount, {
      payment_method: 'credit_card',
      investment_type: 'direct'
    });
    
    
    console.log('Processing investment...');
  };

  return (
    <div className="investment-calculator">
      <h3>Invest in {property.title}</h3>
      <div>
        <label>Investment Amount: $</label>
        <input 
          type="number" 
          value={investmentAmount}
          onChange={(e) => handleAmountChange(parseFloat(e.target.value))}
        />
      </div>
      <div>
        <label>Tokens You'll Receive: </label>
        <span>{tokenAmount}</span>
      </div>
      <button onClick={handleInvest}>Invest Now</button>
    </div>
  );
};


export const PortfolioDashboard = () => {
  const { trackPortfolioFilter } = usePortfolioTracking();
  const { trackAction } = useActionTracking();
  const { trackFeatureUsage } = useFeatureTracking('PortfolioDashboard');

  const handleFilterChange = (filterType, filterValue) => {
    trackPortfolioFilter({
      filter_type: filterType,
      filter_value: filterValue,
      timestamp: new Date().toISOString()
    });
  };

  const handleExportPortfolio = (format) => {
    trackAction('export_portfolio', {
      format: format,
      timestamp: new Date().toISOString()
    });
    trackFeatureUsage('export_portfolio', { format });
    
  };

  const handleSharePortfolio = () => {
    trackAction('share_portfolio', {
      timestamp: new Date().toISOString()
    });
    trackFeatureUsage('share_portfolio');
    
  };

  return (
    <div className="portfolio-dashboard">
      <h2>My Portfolio</h2>
      
      <div className="filters">
        <select onChange={(e) => handleFilterChange('property_type', e.target.value)}>
          <option value="">All Types</option>
          <option value="residential">Residential</option>
          <option value="commercial">Commercial</option>
        </select>
        
        <select onChange={(e) => handleFilterChange('status', e.target.value)}>
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="pending">Pending</option>
        </select>
      </div>

      <div className="actions">
        <button onClick={() => handleExportPortfolio('pdf')}>Export PDF</button>
        <button onClick={() => handleExportPortfolio('csv')}>Export CSV</button>
        <button onClick={handleSharePortfolio}>Share Portfolio</button>
      </div>
    </div>
  );
};


export const PropertySearch = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({});
  const { trackClick, trackInput } = useInteractionTracking('PropertySearch');

  const handleSearch = () => {
    trackPropertySearch(searchQuery, filters, 0); 
    trackClick('search_button', { query: searchQuery, filters });
    
  };

  const handleFilterChange = (filterType, value) => {
    const newFilters = { ...filters, [filterType]: value };
    setFilters(newFilters);
    trackInput('filter_input', { filter_type: filterType, value });
  };

  return (
    <div className="property-search">
      <input 
        type="text" 
        placeholder="Search properties..."
        value={searchQuery}
        onChange={(e) => {
          setSearchQuery(e.target.value);
          trackInput('search_input', { query: e.target.value });
        }}
      />
      
      <div className="filters">
        <select onChange={(e) => handleFilterChange('price_range', e.target.value)}>
          <option value="">Price Range</option>
          <option value="0-100k">$0 - $100k</option>
          <option value="100k-500k">$100k - $500k</option>
        </select>
        
        <select onChange={(e) => handleFilterChange('location', e.target.value)}>
          <option value="">Location</option>
          <option value="new_york">New York</option>
          <option value="california">California</option>
        </select>
      </div>
      
      <button onClick={handleSearch}>Search</button>
    </div>
  );
};


export const Navigation = () => {
  const { trackClick } = useInteractionTracking('Navigation');

  const handleNavigation = (page, method = 'click') => {
    trackClick(`${page}_link`, { 
      navigation_method: method,
      timestamp: new Date().toISOString()
    });
    
  };

  return (
    <nav className="main-navigation">
      <button onClick={() => handleNavigation('dashboard')}>Dashboard</button>
      <button onClick={() => handleNavigation('properties')}>Properties</button>
      <button onClick={() => handleNavigation('portfolio')}>Portfolio</button>
      <button onClick={() => handleNavigation('analytics')}>Analytics</button>
    </nav>
  );
};
