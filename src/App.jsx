import React from 'react';
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

// UI Components
import Navigation from './components/ui/Navigation';
import Footer from './components/layout/Footer';
import SocialProof from './components/ui/SocialProof';
import ScrollToTop from './utils/ScrollToTop';

// Store
import useManagementStore from './store/useManagementStore';

function App() {
  const { currentView, isAdmin, setView } = useManagementStore();
  const isStaff = currentView === 'staff';

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
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      <Footer />
      <SocialProof />

      {/* Admin Access Button */}
      <div className="fixed bottom-10 right-10 z-[100]">
        <button
          onClick={() => setView('staff')}
          className="bg-norden-gold-500 hover:bg-norden-gold-400 text-norden-dark-900 px-6 py-3 rounded-full font-bold shadow-2xl hover:scale-105 transition-all active:scale-95"
        >
          {isAdmin ? 'DASHBOARD' : 'ADMIN LOGIN'}
        </button>
      </div>
    </div>
  );
}

export default App;
