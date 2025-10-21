import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import ProductList from './components/Products';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import OrderPage from './components/Order';
import CategoryList from './components/Categories';
import BrandList from './components/Brands';
import BannerList from './components/Banners';
import VideoList from './components/Youtubevideo';
import WalletList from './components/Wallets';
import ReferralList from './components/Referal';
import RechargeProviders from './components/RechargeProvider';
import RechargeRequests from './components/RechargeRequest';
import PartnerManagement from './components/PartnerManagement';
import CustomerDetails from './components/Customer';


function App() {
  const [currentView, setCurrentView] = useState('Dashboard');
  const HEADER_HEIGHT_PX = 56;

  const renderContent = () => {
    if (currentView === 'Products') return <ProductList />;
    if (currentView === 'Dashboard') return <Dashboard />;
     if (currentView === 'Orders') return <OrderPage />;
      if (currentView === 'Category') return <CategoryList />;
      if (currentView === 'Brands') return <BrandList />;
      if (currentView === 'Banners') return <BannerList />;
       if (currentView === 'Youtube Videos') return < VideoList/>;
      if (currentView === 'Wallet') return <WalletList />;
       if (currentView === 'Referral') return <ReferralList />;
        if (currentView === 'Recharge Provider') return <RechargeProviders />;
         if (currentView === 'Recharge Request') return <RechargeRequests />;
         if (currentView === 'Partner Management') return <PartnerManagement />;
         if (currentView === 'Customer Details') return <CustomerDetails />;
   
  };

  return (
    <div className="app-container">
      <Header />
      <div className="d-flex flex-grow-1" style={{ paddingTop: `${HEADER_HEIGHT_PX}px` }}>
        <Sidebar activeItem={currentView} onSelect={setCurrentView} />
        <div className="main-content-wrapper w-100">
          {renderContent()}
        </div>
      </div>
    </div>
  );
}

export default App;
