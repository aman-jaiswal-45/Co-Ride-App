import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { Toaster } from "@/components/ui/sonner";
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import RegisterPage from './pages/RegisterPage';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import OfferRidePage from './pages/OfferRidePage';
import FindRidePage from './pages/FindRidePage';
import MyRidesPage from './pages/MyRidesPage';
import ProfilePage from './pages/ProfilePage';
import ActiveRidePage from './pages/ActiveRidePage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import PrivateRoute from './components/PrivateRoute';
import AdminRoute from './components/AdminRoute';

function App() {
  return (
    <Router>
      <div className="flex flex-col min-h-screen bg-slate-50">
        <Navbar />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            
            {/* Protected User Routes */}
            <Route path="/dashboard" element={<PrivateRoute><DashboardPage /></PrivateRoute>} />
            <Route path="/offer-ride" element={<PrivateRoute><OfferRidePage /></PrivateRoute>} />
            <Route path="/find-ride" element={<PrivateRoute><FindRidePage /></PrivateRoute>} />
            <Route path="/my-rides" element={<PrivateRoute><MyRidesPage /></PrivateRoute>} />
            <Route path="/profile" element={<PrivateRoute><ProfilePage /></PrivateRoute>} />
            <Route path="/ride/:rideId" element={<PrivateRoute><ActiveRidePage /></PrivateRoute>} />

            {/* Protected Admin Route */}
            <Route path="/admin" element={<AdminRoute><AdminDashboardPage /></AdminRoute>} />
          </Routes>
        </main>
        <Toaster richColors />
      </div>
    </Router>
  );
}

export default App;