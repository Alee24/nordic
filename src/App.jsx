import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Admin imports
import Dashboard from './pages/admin/Dashboard';
import LoginPage from './pages/admin/LoginPage';

// Guest page imports
import Home from './pages/Home';
import SuitesPage from './pages/SuitesPage';
import RoomsPage from './pages/RoomsPage';
import ContactPage from './pages/ContactPage';
import SuiteDetailsPage from './pages/SuiteDetailsPage';
import CheckoutPage from './pages/CheckoutPage';
import ExperiencesPage from './pages/ExperiencesPage';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfService from './pages/TermsOfService';

// UI Components
import Navigation from './components/ui/Navigation';
import Footer from './components/layout/Footer';
import SocialProof from './components/ui/SocialProof';
import ScrollToTop from './utils/ScrollToTop';

// Global booking modal
import BookingFlowModal from './components/booking/BookingFlowModal';
import useBookingModalStore from './store/useBookingModalStore';

// Store
import useManagementStore from './store/useManagementStore';

function App() {
  const { currentView, isAdmin, setView, checkAuth } = useManagementStore();
  const { isOpen, closeBooking } = useBookingModalStore();
  const isStaff = currentView === 'staff';

  useEffect(() => {
    checkAuth();
  }, []);

  console.log('🎯 App rendering - View:', currentView, 'IsAdmin:', isAdmin);

  // STAFF VIEW (Dashboard)
  if (isStaff) {
    if (!isAdmin) {
      return <LoginPage onExit={() => setView('guest')} />;
    }
    return <Dashboard onExit={() => setView('guest')} />;
  }

  // GUEST VIEW (Main Website)
  return (
    <div className="min-h-screen bg-theme-bg text-theme-text font-sans flex flex-col transition-colors duration-300">
      <ScrollToTop />
      <Navigation />

      <main className="flex-1 relative z-0">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/suites" element={<SuitesPage />} />
          <Route path="/rooms" element={<RoomsPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/suite/:id" element={<SuiteDetailsPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/experiences" element={<ExperiencesPage />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/terms" element={<TermsOfService />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      <Footer />
      <SocialProof />

      {/* Global Booking Modal — driven by useBookingModalStore */}
      <BookingFlowModal opened={isOpen} onClose={closeBooking} />

    </div>
  );
}

export default App;
