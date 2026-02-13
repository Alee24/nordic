import React, { useEffect } from 'react';
import Dashboard from './pages/admin/Dashboard';
import LoginPage from './pages/admin/LoginPage';
import useManagementStore from './store/useManagementStore';
import { Box, LoadingOverlay } from '@mantine/core';

import { Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import SuitesPage from './pages/SuitesPage';
import RoomsPage from './pages/RoomsPage';
import ApartmentsPage from './pages/ApartmentsPage';
import DiningPage from './pages/DiningPage';
import WellnessPage from './pages/WellnessPage';
import LaundryPage from './pages/LaundryPage';
import ContactPage from './pages/ContactPage';
import ExperiencesPage from './pages/ExperiencesPage';
import ConciergePage from './pages/ConciergePage';
import BookingLookupPage from './pages/BookingLookupPage';
import SuiteDetailsPage from './pages/SuiteDetailsPage';
import BookingSearchPage from './pages/BookingSearchPage';
import PropertyDetailsPage from './pages/PropertyDetailsPage';
import CheckoutPage from './pages/CheckoutPage';
import PaymentSettingsPage from './pages/admin/PaymentSettingsPage';

function App() {
  const { isAdmin, currentView, setView, checkAuth, loading } = useManagementStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  /* 
  if (loading) {
    return <LoadingOverlay visible loaderProps={{ color: 'gold', size: 'xl' }} overlayBlur={2} />;
  }
  */

  if (currentView === 'staff') {
    if (!isAdmin) {
      return <LoginPage />;
    }
    return <Dashboard onExit={() => setView('guest')} />;
  }

  return (
    <Box className="relative">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/suites" element={<SuitesPage />} />
        <Route path="/suites/:id" element={<SuiteDetailsPage />} />
        <Route path="/rooms" element={<RoomsPage />} />
        <Route path="/dorms" element={<RoomsPage />} />
        <Route path="/apartments" element={<ApartmentsPage />} />
        <Route path="/laundry" element={<LaundryPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/experiences" element={<ExperiencesPage />} />
        <Route path="/concierge" element={<ConciergePage />} />
        <Route path="/booking-search" element={<BookingSearchPage />} />
        <Route path="/property/:id" element={<PropertyDetailsPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/admin/login" element={isAdmin ? <Navigate to="/" /> : <LoginPage />} />
        <Route path="/admin/payment-settings" element={isAdmin ? <PaymentSettingsPage /> : <LoginPage />} />
        <Route path="/my-booking" element={<BookingLookupPage />} />
      </Routes>

      {/* Staff Dashboard Access Button - only toggle view, logic inside handles auth */}
      <Box className="fixed bottom-10 right-10 z-[100]">
        <button
          onClick={() => setView('staff')}
          className="bg-norden-gold text-norden-dark px-6 py-3 rounded-full font-bold shadow-2xl hover:scale-105 transition-all active:scale-95"
        >
          {isAdmin ? 'DASHBOARD' : 'ADMIN LOGIN'}
        </button>
      </Box>
    </Box>
  );
}

export default App;
