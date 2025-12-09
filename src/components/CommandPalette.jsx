import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useInvestments } from '../contexts/InvestmentContext';
import { useWallet } from '../contexts/WalletContext';

const CommandPalette = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const { investments } = useInvestments();
  const { walletData, connectedAccounts } = useWallet();
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [filteredCommands, setFilteredCommands] = useState([]);
  const inputRef = useRef(null);
  const listRef = useRef(null);

  
  const platformProperties = useMemo(() => [
    {
      id: 1,
      name: "Luxury SoHo Loft Complex",
      location: "SoHo, New York",
      propertyType: "Residential",
      tokenPrice: 50,
      totalTokens: 10000,
      annualROI: 11.2,
      monthlyRent: 8450,
      occupancy: 95,
      availableTokens: 74,
      description: "Premium luxury residential complex in the heart of SoHo with high-end amenities and excellent rental potential.",
      yearBuilt: 2018,
      squareFootage: "45,000 sq ft",
      units: 24
    },
    {
      id: 2,
      name: "Miami Beach Luxury Condos",
      location: "Miami Beach, Florida",
      propertyType: "Residential",
      tokenPrice: 50,
      totalTokens: 15000,
      annualROI: 8.5,
      monthlyRent: 12500,
      occupancy: 88,
      availableTokens: 45,
      description: "Premium oceanfront residential condominiums in Miami Beach with stunning views and resort amenities.",
      yearBuilt: 2020,
      squareFootage: "75,000 sq ft",
      units: 48
    },
    {
      id: 3,
      name: "Beverly Hills Luxury Villa",
      location: "Beverly Hills, California",
      propertyType: "Residential",
      tokenPrice: 75,
      totalTokens: 8000,
      annualROI: 9.8,
      monthlyRent: 12000,
      occupancy: 100,
      availableTokens: 0,
      description: "Exclusive luxury villa in Beverly Hills with premium finishes and celebrity appeal.",
      yearBuilt: 2019,
      squareFootage: "8,500 sq ft",
      units: 1
    },
    {
      id: 4,
      name: "Chicago Lakefront Apartments",
      location: "Chicago, Illinois",
      propertyType: "Residential",
      tokenPrice: 40,
      totalTokens: 12000,
      annualROI: 7.2,
      monthlyRent: 9800,
      occupancy: 92,
      availableTokens: 120,
      description: "Premium lakefront residential apartments in Chicago with stunning Lake Michigan views.",
      yearBuilt: 2017,
      squareFootage: "60,000 sq ft",
      units: 36
    },
    {
      id: 5,
      name: "Seattle Urban Lofts",
      location: "Seattle, Washington",
      propertyType: "Residential",
      tokenPrice: 60,
      totalTokens: 20000,
      annualROI: 12.5,
      monthlyRent: 18000,
      occupancy: 98,
      availableTokens: 200,
      description: "Modern urban residential lofts in Seattle's tech district with contemporary design and smart home features.",
      yearBuilt: 2021,
      squareFootage: "100,000 sq ft",
      units: 52
    },
    {
      id: 6,
      name: "Austin Residential Complex",
      location: "Austin, Texas",
      propertyType: "Residential",
      tokenPrice: 35,
      totalTokens: 15000,
      annualROI: 8.1,
      monthlyRent: 7200,
      occupancy: 89,
      availableTokens: 180,
      description: "Modern residential complex in Austin's growing tech district.",
      yearBuilt: 2020,
      squareFootage: "55,000 sq ft",
      units: 45
    }
  ], []);

  
  const commandCategories = [
    {
      id: 'navigation',
      title: 'NAVIGATION',
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
      commands: [
        {
          id: 'overview',
          title: 'Go to Overview',
          description: 'View your portfolio summary and performance',
          action: () => navigate('/dashboard/overview'),
          keywords: ['overview', 'dashboard', 'home', 'summary']
        },
        {
          id: 'portfolio',
          title: 'Go to Portfolio',
          description: 'Manage your property investments',
          action: () => navigate('/dashboard/portfolio'),
          keywords: ['portfolio', 'investments', 'properties', 'holdings']
        },
        {
          id: 'marketplace',
          title: 'Go to Marketplace',
          description: 'Browse and invest in new properties',
          action: () => navigate('/dashboard/marketplace'),
          keywords: ['marketplace', 'browse', 'invest', 'properties', 'buy']
        },
        {
          id: 'transactions',
          title: 'Go to Transactions',
          description: 'View your transaction history',
          action: () => navigate('/dashboard/transactions'),
          keywords: ['transactions', 'history', 'activity', 'payments']
        },
        {
          id: 'wallet',
          title: 'Go to Wallet',
          description: 'Manage your funds and payment methods',
          action: () => navigate('/dashboard/wallet'),
          keywords: ['wallet', 'funds', 'money', 'balance', 'payment']
        },
        {
          id: 'settings',
          title: 'Go to Settings',
          description: 'Account and application settings',
          action: () => navigate('/dashboard/settings'),
          keywords: ['settings', 'preferences', 'account', 'profile']
        }
      ]
    },
    {
      id: 'investments',
      title: 'INVESTMENTS',
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <path d="M8.12602 14C8.57006 15.7252 10.1362 17 12 17C13.8638 17 15.4299 15.7252 15.874 14M11.0177 2.764L4.23539 8.03912C3.78202 8.39175 3.55534 8.56806 3.39203 8.78886C3.24737 8.98444 3.1396 9.20478 3.07403 9.43905C3 9.70352 3 9.9907 3 10.5651V17.8C3 18.9201 3 19.4801 3.21799 19.908C3.40973 20.2843 3.71569 20.5903 4.09202 20.782C4.51984 21 5.07989 21 6.2 21H17.8C18.9201 21 19.4802 21 19.908 20.782C20.2843 20.5903 20.5903 20.2843 20.782 19.908C21 19.4801 21 18.9201 21 17.8V10.5651C21 9.9907 21 9.70352 20.926 9.43905C20.8604 9.20478 20.7526 8.98444 20.608 8.78886C20.4447 8.56806 20.218 8.39175 19.7646 8.03913L12.9823 2.764C12.631 2.49075 12.4553 2.35412 12.2613 2.3016C12.0902 2.25526 11.9098 2.25526 11.7387 2.3016C11.5447 2.35412 11.369 2.49075 11.0177 2.764Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
      commands: [
        {
          id: 'add-funds',
          title: 'Add Funds to Wallet',
          description: 'Deposit money into your account',
          action: () => navigate('/dashboard/wallet'),
          keywords: ['add funds', 'deposit', 'fund', 'money', 'wallet']
        },
        {
          id: 'withdraw-funds',
          title: 'Withdraw Funds',
          description: 'Withdraw money from your account',
          action: () => navigate('/dashboard/wallet'),
          keywords: ['withdraw', 'withdrawal', 'cash out', 'funds']
        },
        {
          id: 'view-performance',
          title: 'View Portfolio Performance',
          description: 'Check your investment returns',
          action: () => navigate('/dashboard/overview'),
          keywords: ['performance', 'returns', 'profit', 'gains', 'charts']
        },
        {
          id: 'investment-history',
          title: 'View Investment History',
          description: 'See all your past investments',
          action: () => navigate('/dashboard/transactions'),
          keywords: ['history', 'investments', 'past', 'previous']
        }
      ]
    },
    {
      id: 'my-properties',
      title: 'MY PROPERTIES',
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <path d="M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M9 22V12H15V22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
      commands: investments.map(investment => ({
        id: `my-property-${investment.id}`,
        title: investment.propertyName,
        description: `My investment in ${investment.location}`,
        action: () => navigate(`/dashboard/marketplace/property/${investment.propertyId}`),
        keywords: [
          investment.propertyName?.toLowerCase() || '', 
          investment.location?.toLowerCase() || '', 
          'my', 'investment', 'portfolio'
        ],
        type: 'my-property'
      }))
    },
    {
      id: 'available-properties',
      title: 'AVAILABLE PROPERTIES',
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <path d="M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M9 22V12H15V22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
      commands: platformProperties.map(property => ({
        id: `available-property-${property.id}`,
        title: property.name,
        description: `${property.location} • ${property.propertyType} • $${property.tokenPrice}/token • ${property.annualROI}% ROI • ${property.availableTokens} tokens available`,
        action: () => navigate(`/dashboard/marketplace/property/${property.id}`),
        keywords: [
          property.name?.toLowerCase() || '', 
          property.location?.toLowerCase() || '', 
          property.propertyType?.toLowerCase() || '',
          property.description?.toLowerCase() || '',
          'property', 'invest', 'available', 'tokens',
          property.yearBuilt?.toString() || '',
          property.squareFootage?.toLowerCase() || '',
          property.units > 0 ? 'units' : 'office'
        ],
        type: 'available-property',
        data: property
      }))
    },
    {
      id: 'locations',
      title: 'LOCATIONS',
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <path d="M21 10C21 17 12 23 12 23S3 17 3 10C3 7.61305 3.94821 5.32387 5.63604 3.63604C7.32387 1.94821 9.61305 1 12 1C14.3869 1 16.6761 1.94821 18.3639 3.63604C20.0518 5.32387 21 7.61305 21 10Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <circle cx="12" cy="10" r="3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
      commands: [
        {
          id: 'search-soho-ny',
          title: 'Properties in SoHo, New York',
          description: 'View all properties in SoHo, New York',
          action: () => navigate('/dashboard/marketplace?location=SoHo'),
          keywords: ['soho', 'new york', 'ny', 'manhattan', 'location'],
          type: 'location-search'
        },
        {
          id: 'search-miami-fl',
          title: 'Properties in Miami, Florida',
          description: 'View all properties in Miami, Florida',
          action: () => navigate('/dashboard/marketplace?location=Miami'),
          keywords: ['miami', 'florida', 'fl', 'location'],
          type: 'location-search'
        },
        {
          id: 'search-beverly-hills-ca',
          title: 'Properties in Beverly Hills, California',
          description: 'View all properties in Beverly Hills, California',
          action: () => navigate('/dashboard/marketplace?location=Beverly Hills'),
          keywords: ['beverly hills', 'california', 'ca', 'los angeles', 'la', 'location'],
          type: 'location-search'
        },
        {
          id: 'search-chicago-il',
          title: 'Properties in Chicago, Illinois',
          description: 'View all properties in Chicago, Illinois',
          action: () => navigate('/dashboard/marketplace?location=Chicago'),
          keywords: ['chicago', 'illinois', 'il', 'location'],
          type: 'location-search'
        },
        {
          id: 'search-seattle-wa',
          title: 'Properties in Seattle, Washington',
          description: 'View all properties in Seattle, Washington',
          action: () => navigate('/dashboard/marketplace?location=Seattle'),
          keywords: ['seattle', 'washington', 'wa', 'location'],
          type: 'location-search'
        },
        {
          id: 'search-austin-tx',
          title: 'Properties in Austin, Texas',
          description: 'View all properties in Austin, Texas',
          action: () => navigate('/dashboard/marketplace?location=Austin'),
          keywords: ['austin', 'texas', 'tx', 'location'],
          type: 'location-search'
        }
      ]
    },
    {
      id: 'property-types',
      title: 'PROPERTY TYPES',
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <path d="M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M9 22V12H15V22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
      commands: [
        {
          id: 'search-residential',
          title: 'Residential Properties',
          description: 'View all residential properties',
          action: () => navigate('/dashboard/marketplace?type=Residential'),
          keywords: ['residential', 'home', 'house', 'apartment', 'condo', 'villa', 'penthouse', 'loft', 'complex'],
          type: 'property-type-search'
        }
      ]
    },
    {
      id: 'investment-amounts',
      title: 'INVESTMENT RANGES',
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <path d="M12 1V23M17 5H9.5C8.57174 5 7.6815 5.36875 7.02513 6.02513C6.36875 6.6815 6 7.57174 6 8.5C6 9.42826 6.36875 10.3185 7.02513 10.9749C7.6815 11.6312 8.57174 12 9.5 12H14.5C15.4283 12 16.3185 12.3687 16.9749 13.0251C17.6312 13.6815 18 14.5717 18 15.5C18 16.4283 17.6312 17.3185 16.9749 17.9749C16.3185 18.6312 15.4283 19 14.5 19H6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
      commands: [
        {
          id: 'search-under-50-token',
          title: 'Under $50/Token Properties',
          description: 'View properties under $50 per token',
          action: () => navigate('/dashboard/marketplace?maxTokenPrice=50'),
          keywords: ['under 50', 'affordable', 'budget', 'cheap', 'tokens'],
          type: 'price-range-search'
        },
        {
          id: 'search-50-60-token',
          title: '$50-$60/Token Properties',
          description: 'View properties between $50-$60 per token',
          action: () => navigate('/dashboard/marketplace?minTokenPrice=50&maxTokenPrice=60'),
          keywords: ['50 to 60', 'mid range', 'medium', 'tokens'],
          type: 'price-range-search'
        },
        {
          id: 'search-over-60-token',
          title: 'Over $60/Token Properties',
          description: 'View luxury properties over $60 per token',
          action: () => navigate('/dashboard/marketplace?minTokenPrice=60'),
          keywords: ['over 60', 'luxury', 'high end', 'expensive', 'tokens'],
          type: 'price-range-search'
        }
      ]
    },
    {
      id: 'payment-methods',
      title: 'PAYMENT METHODS',
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <path d="M3 10H21M7 15H11M17 15H17.01M3 6H21C21.5304 6 22.0391 6.21071 22.4142 6.58579C22.7893 6.96086 23 7.46957 23 8V18C23 18.5304 22.7893 19.0391 22.4142 19.4142C22.0391 19.7893 21.5304 20 21 20H3C2.46957 20 1.96086 19.7893 1.58579 19.4142C1.21071 19.0391 1 18.5304 1 18V8C1 7.46957 1.21071 6.96086 1.58579 6.58579C1.96086 6.21071 2.46957 6 3 6Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
      commands: connectedAccounts.map(account => {
        const displayName = account.type === 'bank' 
          ? `${account.bankName || 'Bank Account'} ••••${account.accountNumber || account.last4 || ''}`
          : `${account.cardBrand || 'Credit Card'} ••••${account.last4 || ''}`;
        const searchName = account.type === 'bank' 
          ? (account.bankName || '').toLowerCase()
          : (account.cardBrand || '').toLowerCase();
        
        return {
          id: `payment-${account.id}`,
          title: displayName,
          description: `${account.type === 'bank' ? 'Bank Account' : 'Credit Card'} • ${account.primary ? 'Primary' : 'Secondary'}`,
          action: () => navigate('/dashboard/wallet'),
          keywords: [searchName, account.type?.toLowerCase() || '', 'payment', 'card', 'bank', 'account'],
          type: 'payment',
          data: account
        };
      })
    },
    {
      id: 'analytics',
      title: 'ANALYTICS',
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <path d="M18 20V10M12 20V4M6 20V14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
      commands: [
        {
          id: 'allocation-chart',
          title: 'View Allocation Chart',
          description: 'See your portfolio distribution',
          action: () => navigate('/dashboard/overview'),
          keywords: ['allocation', 'distribution', 'chart', 'breakdown']
        }
      ]
    },
    {
      id: 'account',
      title: 'ACCOUNT',
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
      commands: [
        {
          id: 'profile',
          title: 'Edit Profile',
          description: 'Update your personal information',
          action: () => navigate('/dashboard/settings'),
          keywords: ['profile', 'edit', 'personal', 'information', 'details']
        },
        {
          id: 'kyc',
          title: 'Complete KYC',
          description: 'Verify your identity for compliance',
          action: () => navigate('/dashboard/settings'),
          keywords: ['kyc', 'verification', 'identity', 'compliance', 'verify']
        },
        {
          id: 'notifications',
          title: 'Notification Settings',
          description: 'Manage your notification preferences',
          action: () => navigate('/dashboard/settings'),
          keywords: ['notifications', 'alerts', 'settings', 'preferences']
        },
        {
          id: 'security',
          title: 'Security Settings',
          description: 'Manage your account security',
          action: () => navigate('/dashboard/settings'),
          keywords: ['security', 'password', '2fa', 'authentication', 'privacy']
        }
      ]
    },
    {
      id: 'help',
      title: 'HELP & SUPPORT',
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M9.09 9C9.3251 8.33167 9.78915 7.76811 10.4 7.40913C11.0108 7.05016 11.7289 6.91894 12.4272 7.03871C13.1255 7.15849 13.7588 7.52152 14.2151 8.06353C14.6713 8.60553 14.9211 9.29152 14.929 9.996C14.929 12 11.929 13 11.929 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M12 17H12.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
      commands: [
        {
          id: 'help-center',
          title: 'Help Center',
          description: 'Get help and documentation',
          action: () => navigate('/help'),
          keywords: ['help', 'support', 'documentation', 'guide', 'faq']
        },
        {
          id: 'contact-support',
          title: 'Contact Support',
          description: 'Get in touch with our support team',
          action: () => navigate('/support'),
          keywords: ['contact', 'support', 'help', 'assistance', 'ticket']
        },
        {
          id: 'tutorial',
          title: 'View Tutorial',
          description: 'Learn how to use the platform',
          action: () => navigate('/tutorial'),
          keywords: ['tutorial', 'learn', 'guide', 'how to', 'training']
        }
      ]
    }
  ];

  
  const allCommands = useMemo(() => 
    commandCategories.flatMap(category => 
      category.commands.map(command => ({
        ...command,
        category: category.title,
        categoryIcon: category.icon
      }))
    ), [investments, connectedAccounts]);

  
  const searchCommands = (searchQuery) => {
    if (!searchQuery.trim()) {
      return allCommands;
    }

    const query = searchQuery.toLowerCase();
    const results = [];

    
    allCommands.forEach(command => {
      const searchText = `${command.title || ''} ${command.description || ''} ${(command.keywords || []).join(' ')}`.toLowerCase();
      
      
      if ((command.title || '').toLowerCase().includes(query) || 
          (command.description || '').toLowerCase().includes(query)) {
        results.push({ ...command, score: 100 });
      }
      
      else if ((command.keywords || []).some(keyword => keyword && keyword.includes(query))) {
        results.push({ ...command, score: 80 });
      }
      
      else if (searchText.includes(query)) {
        results.push({ ...command, score: 60 });
      }
    });

    
    return results
      .sort((a, b) => {
        if (a.score !== b.score) return b.score - a.score;
        return a.title.localeCompare(b.title);
      })
      .map(({ score, ...command }) => command);
  };

  
  useEffect(() => {
    const filtered = searchCommands(query);
    setFilteredCommands(filtered);
    setSelectedIndex(0);
  }, [query, allCommands]);

  
  const handleKeyDown = (e) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < filteredCommands.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev > 0 ? prev - 1 : filteredCommands.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (filteredCommands[selectedIndex]) {
          filteredCommands[selectedIndex].action();
          onClose();
        }
        break;
      case 'Escape':
        e.preventDefault();
        onClose();
        break;
      case 'Tab':
        e.preventDefault();
        
        const currentCategory = filteredCommands[selectedIndex]?.category;
        const nextCategoryIndex = commandCategories.findIndex(cat => cat.title === currentCategory) + 1;
        if (nextCategoryIndex < commandCategories.length) {
          const nextCategory = commandCategories[nextCategoryIndex];
          const firstCommandInCategory = allCommands.findIndex(cmd => cmd.category === nextCategory.title);
          if (firstCommandInCategory !== -1) {
            setSelectedIndex(firstCommandInCategory);
          }
        }
        break;
    }
  };

  
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
      setQuery('');
      setSelectedIndex(0);
    }
  }, [isOpen]);

  
  useEffect(() => {
    if (listRef.current && selectedIndex >= 0) {
      const selectedItem = listRef.current.children[selectedIndex];
      if (selectedItem) {
        selectedItem.scrollIntoView({
          block: 'nearest',
          behavior: 'smooth'
        });
      }
    }
  }, [selectedIndex]);

  if (!isOpen) return null;

  return (
    <div className="command-palette-overlay" onClick={onClose}>
      <div className="command-palette" onClick={e => e.stopPropagation()}>
        {}
        <div className="command-palette-search">
          <div className="search-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M21 21L16.514 16.506M19 10.5C19 15.194 15.194 19 10.5 19S2 15.194 2 10.5 5.806 2 10.5 2 19 5.806 19 10.5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <input
            ref={inputRef}
            type="text"
            
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            className="command-palette-input"
          />
        </div>

        {}
        <div className="command-palette-results" ref={listRef}>
          {filteredCommands.length === 0 ? (
            <div className="no-results">
              <div className="no-results-icon">🔍</div>
              <div className="no-results-text">No commands found</div>
              <div className="no-results-subtext">Try a different search term</div>
            </div>
          ) : (
            filteredCommands.map((command, index) => (
              <div
                key={command.id}
                className={`command-item ${index === selectedIndex ? 'selected' : ''}`}
                onClick={() => {
                  command.action();
                  onClose();
                }}
              >
                <div className="command-icon">
                  {command.categoryIcon}
                </div>
                <div className="command-content">
                  <div className="command-title">
                    {command.title}
                    {command.type === 'my-property' && <span className="command-badge my-property">My Investment</span>}
                    {command.type === 'available-property' && <span className="command-badge available">Available</span>}
                    {command.type === 'location-search' && <span className="command-badge location">Location</span>}
                    {command.type === 'property-type-search' && <span className="command-badge type">Type</span>}
                    {command.type === 'price-range-search' && <span className="command-badge price">Price Range</span>}
                    <span className="command-arrow">↗</span>
                  </div>
                  <div className="command-description">
                    {command.description}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {}
        <div className="command-palette-footer">
          <div className="shortcut-group">
            <div className="shortcut-item">
              <kbd>↩</kbd>
              <span>to select</span>
            </div>
            <div className="shortcut-item">
              <kbd>↑</kbd>
              <kbd>↓</kbd>
              <span>to navigate</span>
            </div>
            <div className="shortcut-item">
              <kbd>Tab</kbd>
              <span>to jump sections</span>
            </div>
            <div className="shortcut-item">
              <kbd>⌘</kbd>
              <kbd>K</kbd>
              <span>to toggle</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommandPalette;
