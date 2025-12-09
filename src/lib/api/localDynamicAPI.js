







export const userAPI = {
  
  getProfile: async (userId) => {
    try {
      console.log('👤 Getting demo user profile:', userId);
      
      
      const profile = JSON.parse(localStorage.getItem(`profile_${userId}`) || 'null');
      
      if (!profile) {
        throw new Error('Profile not found');
      }
      
      return {
        success: true,
        profile: profile
      };
    } catch (error) {
      console.error('❌ Demo profile fetch failed:', error);
      throw error;
    }
  },

  
  updateProfile: async (userId, profileData) => {
    try {
      console.log('✏️ Updating demo user profile:', { userId, profileData });
      
      
      const existingProfile = JSON.parse(localStorage.getItem(`profile_${userId}`) || '{}');
      
      
      const updatedProfile = {
        ...existingProfile,
        ...profileData,
        updatedAt: new Date().toISOString()
      };
      
      
      localStorage.setItem(`profile_${userId}`, JSON.stringify(updatedProfile));
      
      return {
        success: true,
        profile: updatedProfile
      };
    } catch (error) {
      console.error('❌ Demo profile update failed:', error);
      throw error;
    }
  }
};





export const portfolioAPI = {
  
  getPortfolio: async (userId) => {
    try {
      console.log('📊 Getting demo portfolio for user:', userId);
      
      
      await new Promise(resolve => setTimeout(resolve, 500));
      
      
      return {
        success: true,
        portfolio: {
          totalValue: 0,
          totalInvested: 0,
          totalEarnings: 0,
          properties: []
        }
      };
    } catch (error) {
      console.error('❌ Demo portfolio fetch failed:', error);
      throw error;
    }
  },

  
  getPerformance: async (userId, range = '1M') => {
    try {
      console.log('📈 Getting demo portfolio performance:', { userId, range });
      
      
      await new Promise(resolve => setTimeout(resolve, 800));
      
      
      const now = new Date();
      const ranges = {
        '1M': 30,
        '6M': 180,
        '1Y': 365
      };
      
      const days = ranges[range] || 30;
      const performance = [];
      
      for (let i = days; i >= 0; i--) {
        const date = new Date(now.getTime() - (i * 24 * 60 * 60 * 1000));
        
        const value = 0;
        
        performance.push({
          date: date.toISOString().split('T')[0],
          value: value
        });
      }
      
      return {
        success: true,
        performance: performance
      };
    } catch (error) {
      console.error('❌ Demo performance fetch failed:', error);
      throw error;
    }
  }
};





export const marketplaceAPI = {
  
  getProperties: async (filters = {}) => {
    try {
      console.log('🏠 Getting demo properties:', filters);
      
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      
      return {
        success: true,
        properties: [
          {
            id: 'prop_1',
            name: 'Luxury Apartment Complex',
            location: 'Manhattan, NY',
            price: 5000000,
            minInvestment: 10000,
            expectedReturn: 8.5,
            image: '/api/placeholder/400/300',
            description: 'Prime location luxury apartment complex with high rental yields.',
            features: ['Prime Location', 'High ROI', 'Stable Tenants'],
            status: 'available'
          },
          {
            id: 'prop_2',
            name: 'Commercial Office Building',
            location: 'Downtown LA, CA',
            price: 3500000,
            minInvestment: 5000,
            expectedReturn: 7.2,
            image: '/api/placeholder/400/300',
            description: 'Modern commercial office building in downtown Los Angeles.',
            features: ['Commercial Lease', 'Long-term Tenants', 'Prime Location'],
            status: 'available'
          },
          {
            id: 'prop_3',
            name: 'Residential Complex',
            location: 'Miami, FL',
            price: 2800000,
            minInvestment: 2500,
            expectedReturn: 9.1,
            image: '/api/placeholder/400/300',
            description: 'Beachfront residential complex with vacation rental potential.',
            features: ['Beachfront', 'Vacation Rental', 'High Demand'],
            status: 'available'
          }
        ]
      };
    } catch (error) {
      console.error('❌ Demo properties fetch failed:', error);
      throw error;
    }
  },

  
  getPropertyDetails: async (propertyId) => {
    try {
      console.log('🏠 Getting demo property details:', propertyId);
      
      
      await new Promise(resolve => setTimeout(resolve, 600));
      
      
      return {
        success: true,
        property: {
          id: propertyId,
          name: 'Demo Property',
          location: 'Demo City, Demo State',
          price: 1000000,
          minInvestment: 1000,
          expectedReturn: 8.0,
          description: 'This is a demo property for testing purposes.',
          features: ['Demo Feature 1', 'Demo Feature 2'],
          images: ['/api/placeholder/600/400', '/api/placeholder/600/400'],
          status: 'available'
        }
      };
    } catch (error) {
      console.error('❌ Demo property details fetch failed:', error);
      throw error;
    }
  }
};





export const walletAPI = {
  
  getBalance: async (userId) => {
    try {
      console.log('💰 Getting demo wallet balance for user:', userId);
      
      
      const wallet = JSON.parse(localStorage.getItem(`wallet_${userId}`) || 'null');
      
      if (!wallet) {
        
        const defaultWallet = {
          id: Date.now().toString(),
          userId: userId,
          availableBalance: 0,
          investedBalance: 0,
          totalEarnings: 0,
          createdAt: new Date().toISOString()
        };
        
        localStorage.setItem(`wallet_${userId}`, JSON.stringify(defaultWallet));
        return {
          success: true,
          wallet: defaultWallet
        };
      }
      
      return {
        success: true,
        wallet: wallet
      };
    } catch (error) {
      console.error('❌ Demo wallet balance fetch failed:', error);
      throw error;
    }
  },

  
  addFunds: async (userId, amount) => {
    try {
      console.log('💰 Adding demo funds to wallet:', { userId, amount });
      
      
      const wallet = JSON.parse(localStorage.getItem(`wallet_${userId}`) || '{}');
      
      
      const updatedWallet = {
        ...wallet,
        availableBalance: (wallet.availableBalance || 0) + amount,
        updatedAt: new Date().toISOString()
      };
      
      
      localStorage.setItem(`wallet_${userId}`, JSON.stringify(updatedWallet));
      
      return {
        success: true,
        wallet: updatedWallet
      };
    } catch (error) {
      console.error('❌ Demo add funds failed:', error);
      throw error;
    }
  }
};

export default {
  userAPI,
  portfolioAPI,
  marketplaceAPI,
  walletAPI
};
