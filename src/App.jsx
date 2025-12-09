import React, { useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./lib/auth/localAuthService";
import { InvestmentProvider } from "./contexts/InvestmentContext";
import { WalletProvider } from "./contexts/WalletContext";
import { TourProvider } from "./contexts/TourContext";
import LandingPage from "./components/LandingPage";
import IndustrySignup from "./components/Auth/IndustrySignup";
import IndustrySignIn from "./components/Auth/IndustrySignIn";
import DashboardLayout from "./components/DashboardLayout";
import Overview from "./components/Overview";
import Settings from "./components/Settings";
import Transactions from "./components/Transactions";
import Wallet from "./components/Wallet";
import Marketplace from "./components/Marketplace";
import ApplyToTokenize from "./components/ApplyToTokenize";
import Portfolio from "./components/Portfolio";
import PropertyDetails from "./components/PropertyDetails";

function App() {
  
  useEffect(() => {
    if (window.navigator.userAgent.includes('Electron')) {
      document.body.classList.add('electron');
    }
  }, []);

  return (
    <AuthProvider>
      <WalletProvider>
        <InvestmentProvider>
          <TourProvider>
            {}
            <div className="electron-drag-region" />
            <Routes>
          {}
          <Route path="/" element={<LandingPage />} />

          {}
          <Route path="/dashboard" element={<DashboardLayout />}>
            <Route index element={<Overview />} /> {}
            <Route path="overview" element={<Overview />} />
            <Route path="portfolio" element={<Portfolio />} />
            <Route path="transactions" element={<Transactions />} />
            <Route path="wallet" element={<Wallet />} />
              <Route path="marketplace" element={<Marketplace />} />
              <Route path="marketplace/property/:id" element={<PropertyDetails />} />
              <Route path="apply-tokenize" element={<ApplyToTokenize />} />
              <Route path="settings" element={<Settings />} />
          </Route>

          {}
          <Route path="/signup" element={<IndustrySignup />} />
          <Route path="/signin" element={<IndustrySignIn />} />
            </Routes>
          </TourProvider>
        </InvestmentProvider>
      </WalletProvider>
    </AuthProvider>
  );
}

export default App;
