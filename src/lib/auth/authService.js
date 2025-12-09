import { supabase } from '../../supabaseClient';
import React, { createContext, useContext, useState, useEffect } from 'react';


class AuthService {
  constructor() {
    this.isInitialized = false;
    this.sessionCheckInterval = null;
    this.maxRetries = 3;
    this.retryDelay = 1000;
  }

  
  async initialize() {
    if (this.isInitialized) return;
    
    try {
      
      supabase.auth.onAuthStateChange((event, session) => {
        console.log('🔐 Auth state changed:', event, session?.user?.email);
        this.handleAuthStateChange(event, session);
      });

      this.isInitialized = true;
      console.log('✅ Auth service initialized');
    } catch (error) {
      console.error('❌ Auth service initialization failed:', error);
      throw error;
    }
  }

  
  handleAuthStateChange(event, session) {
    switch (event) {
      case 'SIGNED_IN':
        console.log('✅ User signed in:', session?.user?.email);
        break;
      case 'SIGNED_OUT':
        console.log('👋 User signed out');
        break;
      case 'TOKEN_REFRESHED':
        console.log('🔄 Token refreshed');
        break;
      default:
        console.log('🔄 Auth event:', event);
    }
  }

  
  async signUp(userData) {
    try {
      console.log('🚀 Starting user signup process...');
      
      
      this.validateSignupData(userData);
      
      
      this.storePendingUserData(userData);
      
      
      const signupRecord = await this.createSignupRecord(userData);
      
      
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
          },
          emailRedirectTo: `${window.location.origin}/auth/callback?token=${signupRecord.confirmation_token}`
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
      return {
        success: true,
        user: data.user,
        needsEmailConfirmation: !data.session,
        confirmationToken: signupRecord.confirmation_token
      };

    } catch (error) {
      console.error('❌ Signup failed:', error);
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

  
  async handleEmailConfirmation(confirmationToken) {
    try {
      console.log('📧 Handling email confirmation...');
      
      
      const tokenVerification = await this.verifyConfirmationToken(confirmationToken);
      if (!tokenVerification.is_valid) {
        throw new Error('Invalid or expired confirmation token');
      }
      
      
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error('❌ Session error:', sessionError);
        throw new Error('Failed to get user session');
      }

      if (!session) {
        throw new Error('No active session found');
      }

      console.log('✅ Session confirmed:', session.user.email);
      
      
      const userData = this.getPendingUserData();
      if (!userData) {
        throw new Error('User data not found. Please try signing up again.');
      }

      
      const profile = await this.createUserProfile(session.user, userData);
      
      
      const wallet = await this.createUserWallet(session.user.id);
      
      
      this.clearPendingUserData();
      
      console.log('🎉 Email confirmation completed successfully');

      return {
        success: true,
        user: session.user,
        profile,
        wallet
      };

    } catch (error) {
      console.error('❌ Email confirmation failed:', error);
      throw error;
    }
  }

  
  async createUserProfile(user, userData) {
    console.log('👤 Creating user profile...');
    
    try {
      const profilePromise = supabase
        .from('user_profiles')
        .insert({
          user_id: user.id,
          first_name: userData.first_name || 'User',
          last_name: userData.last_name || '',
          email: user.email,
          phone: userData.phone || '',
          date_of_birth: userData.date_of_birth || null,
          ssn_last_four: userData.ssn_last_four || null,
          address_street: userData.address?.street || '',
          address_city: userData.address?.city || '',
          address_state: userData.address?.state || '',
          address_zip: userData.address?.zipCode || '',
          kyc_status: 'submitted',
          identity_verified: false
        })
        .select()
        .single();

      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Profile creation timeout')), 5000)
      );

      const { data, error } = await Promise.race([
        profilePromise,
        timeoutPromise
      ]);

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
      const walletPromise = supabase
        .from('user_wallets')
        .insert({
          user_id: userId,
          available_balance: 0,
          invested_balance: 0,
          total_earnings: 0
        })
        .select()
        .single();

      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Wallet creation timeout')), 5000)
      );

      const { data, error } = await Promise.race([
        walletPromise,
        timeoutPromise
      ]);

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

  
  validateSignupData(data) {
    const required = ['email', 'password', 'firstName', 'lastName'];
    const missing = required.filter(field => !data[field]);
    
    if (missing.length > 0) {
      throw new Error(`Missing required fields: ${missing.join(', ')}`);
    }

    if (!this.isValidEmail(data.email)) {
      throw new Error('Invalid email address');
    }

    if (data.password.length < 8) {
      throw new Error('Password must be at least 8 characters long');
    }
  }

  
  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  
  storePendingUserData(userData) {
    const dataToStore = {
      first_name: userData.firstName,
      last_name: userData.lastName,
      phone: userData.phone,
      date_of_birth: userData.dateOfBirth,
      ssn_last_four: userData.ssnLastFour,
      address: userData.address
    };
    
    localStorage.setItem('pendingUserData', JSON.stringify(dataToStore));
    console.log('💾 User data stored temporarily');
  }

  
  getPendingUserData() {
    try {
      const data = localStorage.getItem('pendingUserData');
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('❌ Failed to get pending user data:', error);
      return null;
    }
  }

  
  clearPendingUserData() {
    localStorage.removeItem('pendingUserData');
    console.log('🧹 Pending user data cleared');
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

  
  async createSignupRecord(userData) {
    try {
      console.log('📝 Creating signup record...');
      
      const { data, error } = await supabase.rpc('create_user_signup', {
        p_email: userData.email,
        p_signup_source: 'web',
        p_ip_address: null, 
        p_user_agent: navigator.userAgent
      });

      if (error) {
        console.error('❌ Signup record creation failed:', error);
        throw error;
      }

      console.log('✅ Signup record created');
      return data;
    } catch (error) {
      console.error('❌ Failed to create signup record:', error);
      throw error;
    }
  }

  
  async verifyConfirmationToken(token) {
    try {
      console.log('🔍 Verifying confirmation token...');
      
      const { data, error } = await supabase.rpc('verify_confirmation_token', {
        p_token: token
      });

      if (error) {
        console.error('❌ Token verification failed:', error);
        throw error;
      }

      return data[0] || { is_valid: false };
    } catch (error) {
      console.error('❌ Failed to verify token:', error);
      return { is_valid: false };
    }
  }

  
  async confirmUserEmail(token) {
    try {
      console.log('📧 Confirming user email...');
      
      const { data, error } = await supabase.rpc('confirm_user_email', {
        p_confirmation_token: token
      });

      if (error) {
        console.error('❌ Email confirmation failed:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('❌ Failed to confirm email:', error);
      throw error;
    }
  }

  
  async resendConfirmationEmail(email) {
    try {
      console.log('📧 Resending confirmation email...');
      
      const { data, error } = await supabase.auth.resend({
        type: 'signup',
        email: email
      });

      if (error) {
        console.error('❌ Resend confirmation failed:', error);
        throw error;
      }

      console.log('✅ Confirmation email resent');
      return { success: true };
    } catch (error) {
      console.error('❌ Failed to resend confirmation:', error);
      throw error;
    }
  }

  
  async isEmailConfirmed(userId) {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('email_verified')
        .eq('user_id', userId)
        .single();

      if (error) {
        console.error('❌ Failed to check email status:', error);
        return false;
      }

      return data?.email_verified || false;
    } catch (error) {
      console.error('❌ Failed to check email confirmation:', error);
      return false;
    }
  }

  
  async updateEmailVerificationStatus(userId, isVerified) {
    try {
      console.log('📧 Updating email verification status...');
      
      const { data, error } = await supabase
        .from('user_profiles')
        .update({ email_verified: isVerified })
        .eq('user_id', userId)
        .select()
        .single();

      if (error) {
        console.error('❌ Failed to update email status:', error);
        throw error;
      }

      console.log('✅ Email verification status updated');
      return data;
    } catch (error) {
      console.error('❌ Failed to update email verification:', error);
      throw error;
    }
  }

  
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}


const authService = new AuthService();


authService.initialize();



const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    
    const getInitialSession = async () => {
      try {
        const session = await authService.getCurrentSession();
        if (session) {
          setUser(session.user);
          const userProfile = await authService.getUserProfile(session.user.id);
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
        const userProfile = await authService.getUserProfile(session.user.id);
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
      const result = await authService.signIn(email, password);
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
      const result = await authService.signUp(userData);
      return result;
    } catch (error) {
      throw error;
    }
  };

  const signOut = async () => {
    try {
      const result = await authService.signOut();
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
    authService
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

export default authService;