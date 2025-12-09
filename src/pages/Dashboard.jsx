import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createClient } from '@supabase/supabase-js';
import DashboardLayout from '../components/DashboardLayout';
import Overview from '../components/Overview';
import Settings from '../components/Settings';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

export default function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    const checkAuth = async () => {
      if (!supabase) {
        navigate('/');
        return;
      }

      try {
        
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('Session error:', sessionError);
          navigate('/');
          return;
        }

        if (!session?.user) {
          navigate('/');
          return;
        }

        setUser(session.user);

        
        const { data: profile, error: profileError } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (profileError) {
          console.error('Profile error:', profileError);
          
        } else {
          setUserProfile(profile);
        }

      } catch (error) {
        console.error('Auth check error:', error);
        navigate('/');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [navigate]);

  const handleSignOut = async () => {
    if (supabase) {
      await supabase.auth.signOut();
      navigate('/');
    }
  };

  const updateUserProfile = async (updates) => {
    if (!user || !supabase) return;

    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .update(updates)
        .eq('id', user.id)
        .select()
        .single();

      if (error) {
        console.error('Profile update error:', error);
        return false;
      }

      setUserProfile(data);
      return true;
    } catch (error) {
      console.error('Profile update error:', error);
      return false;
    }
  };

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        fontSize: '18px'
      }}>
        Loading dashboard...
      </div>
    );
  }

  if (!user) {
    return null; 
  }

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'overview':
        return <Overview user={user} userProfile={userProfile} />;
      case 'settings':
        return <Settings user={user} userProfile={userProfile} onUpdateProfile={updateUserProfile} />;
      default:
        return <Overview user={user} userProfile={userProfile} />;
    }
  };

  return (
    <DashboardLayout 
      user={user} 
      userProfile={userProfile}
      activeTab={activeTab}
      onTabChange={setActiveTab}
      onSignOut={handleSignOut}
    >
      {renderActiveTab()}
    </DashboardLayout>
  );
}
