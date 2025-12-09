import React, { createContext, useContext, useState, useEffect } from 'react';


class LocalAuthService {
  constructor() {
    this.isInitialized = false;
    this.users = JSON.parse(localStorage.getItem('demoUsers') || '[]');
    this.currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');
  }

  
  async initialize() {
    if (this.isInitialized) return;
    
    try {
      console.log('✅ Local Demo Auth service initialized');
      this.isInitialized = true;
    } catch (error) {
      console.error('❌ Local Auth service initialization failed:', error);
      throw error;
    }
  }

  
  async signUp(userData) {
    try {
      console.log('🚀 Starting LOCAL DEMO signup process...');
      
      
      const existingUser = this.users.find(user => user.email === userData.email);
      if (existingUser) {
        throw new Error('An account with this email already exists. Please sign in instead.');
      }

      
      const newUser = {
        id: Date.now().toString(),
        email: userData.email,
        password: userData.password, 
        firstName: userData.firstName,
        lastName: userData.lastName,
        phone: userData.phone,
        dateOfBirth: userData.dateOfBirth,
        ssnLastFour: userData.ssnLastFour,
        address: userData.address,
        createdAt: new Date().toISOString(),
        emailVerified: true, 
        kycStatus: 'submitted',
        identityVerified: false
      };

      
      const profile = {
        id: Date.now().toString(),
        userId: newUser.id,
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: userData.email,
        phone: userData.phone,
        dateOfBirth: userData.dateOfBirth,
        ssnLastFour: userData.ssnLastFour,
        address: userData.address,
        kycStatus: 'submitted',
        identityVerified: false,
        emailVerified: true,
        createdAt: new Date().toISOString()
      };

      
      const wallet = {
        id: Date.now().toString(),
        userId: newUser.id,
        availableBalance: 0,
        investedBalance: 0,
        totalEarnings: 0,
        createdAt: new Date().toISOString()
      };

      
      this.users.push(newUser);
      localStorage.setItem('demoUsers', JSON.stringify(this.users));
      localStorage.setItem('currentUser', JSON.stringify(newUser));
      localStorage.setItem(`profile_${newUser.id}`, JSON.stringify(profile));
      localStorage.setItem(`wallet_${newUser.id}`, JSON.stringify(wallet));

      this.currentUser = newUser;

      console.log('✅ Local user created:', newUser.email);

      return {
        success: true,
        user: newUser,
        profile,
        wallet
      };

    } catch (error) {
      console.error('❌ Local signup failed:', error);
      throw error;
    }
  }

  
  async signIn(email, password) {
    try {
      console.log('🔐 Starting local signin process...');
      
      const user = this.users.find(u => u.email === email && u.password === password);
      
      if (!user) {
        throw new Error('Invalid email or password. Please check your credentials and try again.');
      }

      
      const profile = JSON.parse(localStorage.getItem(`profile_${user.id}`) || 'null');
      const wallet = JSON.parse(localStorage.getItem(`wallet_${user.id}`) || 'null');

      
      this.currentUser = user;
      localStorage.setItem('currentUser', JSON.stringify(user));

      console.log('✅ User signed in:', user.email);

      return {
        success: true,
        user,
        profile,
        needsKYC: profile?.kycStatus === 'pending' || !profile?.identityVerified
      };

    } catch (error) {
      console.error('❌ Signin failed:', error);
      throw error;
    }
  }

  
  async getUserProfile(userId) {
    try {
      const profile = JSON.parse(localStorage.getItem(`profile_${userId}`) || 'null');
      return profile;
    } catch (error) {
      console.error('❌ Failed to get user profile:', error);
      return null;
    }
  }

  
  async getUserWallet(userId) {
    try {
      const wallet = JSON.parse(localStorage.getItem(`wallet_${userId}`) || 'null');
      return wallet;
    } catch (error) {
      console.error('❌ Failed to get user wallet:', error);
      return null;
    }
  }

  
  async signOut() {
    try {
      this.currentUser = null;
      localStorage.removeItem('currentUser');
      console.log('✅ User signed out');
      return { success: true };
    } catch (error) {
      console.error('❌ Sign out failed:', error);
      throw error;
    }
  }

  
  async getCurrentUser() {
    return this.currentUser;
  }

  
  async getCurrentSession() {
    if (this.currentUser) {
      return {
        user: this.currentUser,
        access_token: 'demo_token_' + this.currentUser.id
      };
    }
    return null;
  }

  
  getSignupErrorMessage(error) {
    switch (error.message) {
      case 'An account with this email already exists. Please sign in instead.':
        return 'An account with this email already exists. Please sign in instead.';
      case 'Password should be at least 6 characters':
        return 'Password must be at least 6 characters long.';
      case 'Invalid email':
        return 'Please enter a valid email address.';
      default:
        return error.message || 'Sign up failed. Please try again.';
    }
  }

  
  getSigninErrorMessage(error) {
    switch (error.message) {
      case 'Invalid email or password. Please check your credentials and try again.':
        return 'Invalid email or password. Please check your credentials and try again.';
      case 'Email not confirmed':
        return 'Please check your email and click the confirmation link before signing in.';
      case 'Too many requests':
        return 'Too many sign in attempts. Please wait a moment and try again.';
      default:
        return error.message || 'Sign in failed. Please try again.';
    }
  }
}


const localAuthService = new LocalAuthService();


localAuthService.initialize();


const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    
    const getInitialSession = async () => {
      try {
        const session = await localAuthService.getCurrentSession();
        if (session) {
          setUser(session.user);
          const userProfile = await localAuthService.getUserProfile(session.user.id);
          setProfile(userProfile);
        }
      } catch (error) {
        console.error('Failed to get initial session:', error);
      } finally {
        setLoading(false);
      }
    };

    getInitialSession();
  }, []);

  const signIn = async (email, password) => {
    try {
      const result = await localAuthService.signIn(email, password);
      if (result.success) {
        setUser(result.user);
        setProfile(result.profile);
      }
      return result;
    } catch (error) {
      throw error;
    }
  };

  const signUp = async (userData) => {
    try {
      const result = await localAuthService.signUp(userData);
      if (result.success) {
        setUser(result.user);
        setProfile(result.profile);
      }
      return result;
    } catch (error) {
      throw error;
    }
  };

  const signOut = async () => {
    try {
      const result = await localAuthService.signOut();
      setUser(null);
      setProfile(null);
      return result;
    } catch (error) {
      throw error;
    }
  };

  const value = {
    user,
    profile,
    loading,
    signIn,
    signUp,
    signOut,
    authService: localAuthService
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default localAuthService;
