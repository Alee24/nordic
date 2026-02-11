import React from 'react';
// import StaffDashboard from './pages/admin/StaffDashboard'; // Removed
import Dashboard from './pages/admin/Dashboard'; // New Dashboard Import
import useManagementStore from './store/useManagementStore';
import { Box } from '@mantine/core';

import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import SuitesPage from './pages/SuitesPage';
import RoomsPage from './pages/RoomsPage';
import ApartmentsPage from './pages/ApartmentsPage';
import DiningPage from './pages/DiningPage';
import WellnessPage from './pages/WellnessPage';
import ContactPage from './pages/ContactPage';
import ExperiencesPage from './pages/ExperiencesPage';
import ConciergePage from './pages/ConciergePage';
import BookingLookupPage from './pages/BookingLookupPage';
import SuiteDetailsPage from './pages/SuiteDetailsPage';

function App() {
  const { isAdmin, currentView, setView } = useManagementStore();

  if (currentView === 'staff') {
    return <Dashboard onExit={() => setView('guest')} />;
  }

  return (
    <Box className="relative">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/suites" element={<SuitesPage />} />
        <Route path="/suites/:id" element={<SuiteDetailsPage />} />
        <Route path="/rooms" element={<RoomsPage />} />
        <Route path="/dorms" element={<RoomsPage />} /> {/* Redirect old route or keep for compatibility temporarily */}
        <Route path="/apartments" element={<ApartmentsPage />} />
        <Route path="/dining" element={<DiningPage />} />
        <Route path="/wellness" element={<WellnessPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/experiences" element={<ExperiencesPage />} />
        <Route path="/concierge" element={<ConciergePage />} />
        <Route path="/my-booking" element={<BookingLookupPage />} />
      </Routes>

      {/* Staff Dashboard Access Button */}
      {isAdmin && (
        <Box className="fixed bottom-10 right-10 z-[100]">
          <button
            onClick={() => setView('staff')}
            className="bg-nordic-gold text-nordic-dark px-6 py-3 rounded-full font-bold shadow-2xl hover:scale-105 transition-all active:scale-95"
          >
            DASHBOARD
          </button>
        </Box>
      )}
    </Box>
  );
}

export default App;
