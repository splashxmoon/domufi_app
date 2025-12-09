import React, { useState, useEffect } from "react";
import { Link, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../lib/auth/localAuthService";
import Sidebar from "./Sidebar"; 
import Header from "./Header"; 
import KYCModal from "./Auth/KYCModal";
import DemoMode from "./DemoMode";
import GuidedTour from "./GuidedTour";
import "../App.css";

function DashboardLayout() {
  const navigate = useNavigate();
  const { user, profile, signOut, updateProfile, needsKYC } = useAuth();
  const [showKYCModal, setShowKYCModal] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  
  useEffect(() => {
    if (needsKYC && user) {
      setShowKYCModal(true);
    }
  }, [needsKYC, user]);

  
  useEffect(() => {
    if (!user) {
      navigate('/');
    }
  }, [user, navigate]);

  const handleUpdateProfile = async (profileData) => {
    try {
      await updateProfile(profileData);
      return true;
    } catch (error) {
      console.error("Error updating profile:", error);
      return false;
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const handleKYCComplete = () => {
    setShowKYCModal(false);
    
    window.location.reload();
  };

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  
  if (!user) {
    return null;
  }

  return (
    <div className="app">
      {}
      <DemoMode />

      {}
      <Sidebar isCollapsed={sidebarCollapsed} onToggle={toggleSidebar} />

      {}
      <div className={`main ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
        <Header user={user} userProfile={profile} onSignOut={handleSignOut} />

        {}
        <div className="content">
          <Outlet context={{ user, userProfile: profile, onUpdateProfile: handleUpdateProfile }} />
        </div>
      </div>

      {}
      <KYCModal 
        isOpen={showKYCModal}
        onClose={() => setShowKYCModal(false)}
        onComplete={handleKYCComplete}
      />

      {}
      <GuidedTour />
    </div>
  );
}

export default DashboardLayout;
