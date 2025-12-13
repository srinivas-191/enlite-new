import React, { Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import "./app.css";
import ScrollToTop from "./components/ScrollToTop";
import PrivateRoute from "./components/PrivateRoute";
import PricingPage from "./pages/PricingPage";
import InvoicePage from "./pages/InvoicePage";
import AdminManualRequests from "./pages/AdminManualRequests";
// Lazy imports

const HomePage = React.lazy(() => import("./pages/HomePage"));
const AboutPage = React.lazy(() => import("./pages/AboutPage"));
const ContactPage = React.lazy(() => import("./pages/ContactUs"));
const PredictPage = React.lazy(() => import("./pages/PredictPage"));
const Solutions = React.lazy(() => import("./pages/Solutions"));
const LoginPage = React.lazy(() => import("./pages/LoginPage"));
const RegisterPage = React.lazy(() => import("./pages/RegisterPage"));
const HistoryPage = React.lazy(() => import("./pages/HistoryPage"));
const ProfilePage = React.lazy(() => import("./pages/ProfilePage"));
const AdminDashboard = React.lazy(() => import("./pages/AdminDashboard"));
const AdminUserHistory = React.lazy(() => import("./pages/AdminUserHistory"));

const App = () => {
  return (
    <div className="min-h-screen bg-[#FCF5EE]  text-gray-900">
      {/* Navbar */}
      <Navbar />
      <ScrollToTop />

      {/* Routes */}
      <Suspense
        fallback={
          <h1 className="text-center text-emerald-600 py-10">Loading...</h1>
        }
      >
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/home" element={<HomePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/solutions" element={<Solutions />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/pricing" element={<PricingPage />} />
          <Route path="/invoice" element={<InvoicePage />} />
          {/* Auth Pages */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/predict" element={<PrivateRoute><PredictPage /></PrivateRoute>} />
          <Route path="/profile" element={<PrivateRoute><ProfilePage /></PrivateRoute>} />
          <Route path="/history" element={<PrivateRoute><HistoryPage /></PrivateRoute>} />

          <Route path="/admin-dashboard" element={<PrivateRoute><AdminDashboard /></PrivateRoute>} />
          <Route path="/admin/user/:username" element={<PrivateRoute><AdminUserHistory /></PrivateRoute>} />
          <Route path="/admin/manual-requests" element={<AdminManualRequests />} />


          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default App;
