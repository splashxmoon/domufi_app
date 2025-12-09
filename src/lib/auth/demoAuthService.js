import { supabase } from '../../supabaseClient';
import React, { createContext, useContext, useState, useEffect } from 'react';


class DemoAuthService {
  constructor() {
    this.isInitialized = false;
  }

  
  async initialize() {
    if (this.isInitialized) return;
    
    try {
      
      supabase.auth.onAuthStateChange((event, session) => {
        console.log('🔐 Demo Auth state changed:', event, session?.user?.email);
      });

      this.isInitialized = true;
      console.log('✅ Demo Auth service initialized');
    } catch (error) {
      console.error('❌ Demo Auth service initialization failed:', error);
      throw error;
    }
  }

  
  async signUp(userData) {
    try {
      console.log('🚀 Starting DEMO user signup process...');
      
      
      const { data, error } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          data: {
            first_name: userData.firstName,
            last_name: userData.lastName,
            phone: userData.phone,
            date_of_birth: userData.dateOfBirth,
            ssn_last_four: userData.ssnLastFour,
            address: userData.address
          }
        }
      });

      if (error) {
        console.error('❌ Signup error:', error);
        throw new Error(this.getSignupErrorMessage(error));
      }

      if (!data.user) {
        throw new Error('Failed to create user account');
      }

      console.log('✅ User account created:', data.user.email);
      
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      
      const profile = await this.createUserProfile(data.user, userData);
      const wallet = await this.createUserWallet(data.user.id);

      return {
        success: true,
        user: data.user,
        profile,
        wallet
      };

    } catch (error) {
      console.error('❌ Demo signup failed:', error);
      throw error;
    }
  }

  
  async signIn(email, password) {
    try {
      console.log('🔐 Starting user signin process...');
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        console.error('❌ Signin error:', error);
        throw new Error(this.getSigninErrorMessage(error));
      }

      if (!data.user) {
        throw new Error('Sign in failed - no user data returned');
      }

      console.log('✅ User signed in:', data.user.email);

      
      const profile = await this.getUserProfile(data.user.id);

      return {
        success: true,
        user: data.user,
        profile,
        needsKYC: profile?.kyc_status === 'pending' || !profile?.identity_verified
      };

    } catch (error) {
      console.error('❌ Signin failed:', error);
      throw error;
    }
  }

  
  async createUserProfile(user, userData) {
    console.log('👤 Creating user profile...');
    
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .insert({
          user_id: user.id,
          first_name: userData.firstName,
          last_name: userData.lastName,
          email: user.email,
          phone: userData.phone || '',
          date_of_birth: userData.dateOfBirth || null,
          ssn_last_four: userData.ssnLastFour || null,
          address_street: userData.address?.street || '',
          address_city: userData.address?.city || '',
          address_state: userData.address?.state || '',
          address_zip: userData.address?.zipCode || '',
          kyc_status: 'submitted',
          identity_verified: false,
          email_verified: true 
        })
        .select()
        .single();

      if (error) {
        if (error.code === '23505') {
          console.log('⚠️ User profile already exists, fetching existing...');
          return await this.getUserProfile(user.id);
        }
        throw error;
      }

      console.log('✅ User profile created:', data);
      return data;

    } catch (error) {
      console.error('❌ Profile creation failed:', error);
      throw error;
    }
  }

  
  async createUserWallet(userId) {
    console.log('💰 Creating user wallet...');
    
    try {
      const { data, error } = await supabase
        .from('user_wallets')
        .insert({
          user_id: userId,
          available_balance: 0,
          invested_balance: 0,
          total_earnings: 0
        })
        .select()
        .single();

      if (error) {
        if (error.code === '23505') {
          console.log('⚠️ User wallet already exists, fetching existing...');
          return await this.getUserWallet(userId);
        }
        throw error;
      }

      console.log('✅ User wallet created:', data);
      return data;

    } catch (error) {
      console.error('❌ Wallet creation failed:', error);
      throw error;
    }
  }

  
  async getUserProfile(userId) {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null; 
        }
        throw error;
      }

      return data;
    } catch (error) {
      console.error('❌ Failed to get user profile:', error);
      return null;
    }
  }

  
  async getUserWallet(userId) {
    try {
      const { data, error } = await supabase
        .from('user_wallets')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null; 
        }
        throw error;
      }

      return data;
    } catch (error) {
      console.error('❌ Failed to get user wallet:', error);
      return null;
    }
  }

  
  async signOut() {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      console.log('✅ User signed out');
      return { success: true };
    } catch (error) {
      console.error('❌ Sign out failed:', error);
      throw error;
    }
  }

  
  async getCurrentUser() {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) throw error;
      return user;
    } catch (error) {
      console.error('❌ Failed to get current user:', error);
      return null;
    }
  }

  
  async getCurrentSession() {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) throw error;
      return session;
    } catch (error) {
      console.error('❌ Failed to get current session:', error);
      return null;
    }
  }

  
  getSignupErrorMessage(error) {
    switch (error.message) {
      case 'User already registered':
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
      case 'Invalid login credentials':
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


const demoAuthService = new DemoAuthService();


demoAuthService.initialize();


const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    
    const getInitialSession = async () => {
      try {
        const session = await demoAuthService.getCurrentSession();
        if (session) {
          setUser(session.user);
          const userProfile = await demoAuthService.getUserProfile(session.user.id);
          setProfile(userProfile);
        }
      } catch (error) {
        console.error('Failed to get initial session:', error);
      } finally {
        setLoading(false);
      }
    };

    getInitialSession();

    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (session) {
        setUser(session.user);
        const userProfile = await demoAuthService.getUserProfile(session.user.id);
        setProfile(userProfile);
        } else {
          setUser(null);
          setProfile(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email, password) => {
    try {
      const result = await demoAuthService.signIn(email, password);
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
      const result = await demoAuthService.signUp(userData);
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
      const result = await demoAuthService.signOut();
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
    authService: demoAuthService
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

export default demoAuthService;
