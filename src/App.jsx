import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import ProductList from './components/Products/Products';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import OrderPage from './components/Order';
import CategoryList from './components/Categories';
import BrandList from './components/Brands';
import BannerList from "./components/Banners/BannerList"
import VideoList from './components/Youtubevideo';
import WalletList from './components/Wallets';
import ReferralList from './components/Referal';
import RechargeRequest from './components/RechargeRequest/RechargeRequest';
import RechargeProviders from './components/RechargeProvider';
import RechargePlans from './components/RechargePlan';
import PartnerManagement from './components/PartnerManagement';
import CustomerDetails from './components/Customer/Customer';
import StockNotifier from './components/StockNotifier.jsx';
// --- NEW IMPORTS ---
import LoginPage from './components/Auth/LoginPage';
import LogoutConfirmation from './components/Auth/LogoutConfirmation.jsx'; // <-- NEW IMPORT
// ⚠️ Adjust path to your Firebase config file
import { auth, onAuthStateChanged, signOut } from "./firebase"; 
// -------------------

function App() {
  const [currentView, setCurrentView] = useState('Dashboard');

  
  // --- AUTH STATE ---
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  // --- NEW STATE: Control Logout Confirmation Modal ---
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  // ----------------------------------------------------

  // 1. Listen for Authentication State Changes
  useEffect(() => {
    // This listener runs immediately and whenever the user signs in or out.
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    // Clean up the subscription on unmount
    return () => unsubscribe();
  }, []);
  
  // 2. Logout Handlers
  const confirmLogout = async () => {
    try {
      await signOut(auth);
      // The onAuthStateChanged listener handles setting user to null and showing the login page
    } catch (error) {
      console.error("Error signing out:", error);
    } finally {
        // Always close the confirmation screen after the attempt
        setShowLogoutConfirm(false); 
    }
  };
  
  const handleShowLogout = () => setShowLogoutConfirm(true);
  const handleCancelLogout = () => setShowLogoutConfirm(false);

  const renderContent = () => {
    if (currentView === 'Products') return <ProductList />;
    if (currentView === 'Dashboard') return <Dashboard />;
    if (currentView === 'Orders') return <OrderPage />;
    if (currentView === 'Category') return <CategoryList />;
    if (currentView === 'Brands') return <BrandList />;
    if (currentView === 'Banners') return <BannerList />;
    if (currentView === 'Youtube Videos') return <VideoList/>;
    if (currentView === 'Stock Notifier') return <StockNotifier/>
    if (currentView === 'Wallet') return <WalletList />;
    if (currentView === 'Referral') return <ReferralList />;
    if (currentView === 'Recharge Request') return <RechargeRequest />;
    if (currentView === 'Recharge Provider') return <RechargeProviders />;
    if (currentView === 'Recharge Plan') return <RechargePlans />;
    if (currentView === 'Partner Management') return <PartnerManagement />;
    if (currentView === 'Customer Details') return <CustomerDetails />;
  };

  // --- CONDITIONAL RENDERING ---

  // Show a simple loading screen while checking Firebase status
  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh', backgroundColor: '#f1f3f6' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="ms-2">Checking session...</p>
      </div>
    );
  }
  
  // Show the login page if no user is authenticated
  if (!user) {
    return <LoginPage />;
  }
  
  // Show the logout confirmation screen if triggered
  if (showLogoutConfirm) {
      return (
          <LogoutConfirmation
              onConfirmLogout={confirmLogout}
              onCancel={handleCancelLogout}
          />
      );
  }
  
  // If authenticated and not confirming logout, show the main application
  return (
    <div className="app-container">
      {/* Pass the function to show the confirmation dialog */}
      <Header onLogout={handleShowLogout} /> 
      <div className="d-flex flex-grow-1" >
        {/* Pass the function to show the confirmation dialog */}
        <Sidebar activeItem={currentView} onSelect={setCurrentView} onLogout={handleShowLogout} />
        <div className="main-content-wrapper w-100">
          {renderContent()}
        </div>
      </div>
    </div>
  );
}

export default App;
