import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Navbar from './components/Navbar';
import VendorNavbar from './components/VendorNavbar';
import AdminNavbar from './components/AdminNavbar';
import Footer from './components/Footer';
import CustomCursor from './components/CustomCursor';
import PageTransition from './components/PageTransition';
import ScrollProgress from './components/ScrollProgress';
import Home from './pages/Home';
import Venues from './pages/Venues';
import Catering from './pages/Catering';
import Photography from './pages/Photography';
import Music from './pages/Music';
import Decoration from './pages/Decoration';
import BudgetCalculator from './pages/BudgetCalculator';
import Checklist from './pages/Checklist';
import Booking from './pages/Booking';
import Login from './pages/Login';
import Signup from './pages/Signup';
import AdminDashboard from './pages/AdminDashboard';
import VendorDashboard from './pages/VendorDashboard';
import RoleGate from './components/RoleGate';
import VenueDetails from './pages/VenueDetails';
import Portfolio from './pages/Portfolio';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import MyBookings from './pages/MyBookings';
import CustomerRequests from './pages/CustomerRequests';

function NavbarWrapper() {
  const location = useLocation();

  if (location.pathname.startsWith('/admin')) return <AdminNavbar />;
  if (location.pathname.startsWith('/vendor')) return <VendorNavbar />;

  return <Navbar />;
}

function AppLayout() {
  const location = useLocation();

  useEffect(() => {
    const hasActiveSession = sessionStorage.getItem('auth_session') === 'active';
    if (!hasActiveSession) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <ScrollProgress />
      <CustomCursor />
      <motion.div
        key={location.pathname}
        className="luxury-route-loader"
        initial={{ scaleX: 0, opacity: 1 }}
        animate={{ scaleX: [0, 0.65, 1], opacity: [1, 1, 0] }}
        transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
      />
      <NavbarWrapper />
      <main className="flex-grow">
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<PageTransition><Home /></PageTransition>} />
            <Route path="/venues" element={<PageTransition><Venues /></PageTransition>} />
            <Route path="/catering" element={<PageTransition><Catering /></PageTransition>} />
            <Route path="/photography" element={<PageTransition><Photography /></PageTransition>} />
            <Route path="/music" element={<PageTransition><Music /></PageTransition>} />
            <Route path="/decoration" element={<PageTransition><Decoration /></PageTransition>} />
            <Route path="/budget" element={<PageTransition><BudgetCalculator /></PageTransition>} />
            <Route path="/checklist" element={<PageTransition><Checklist /></PageTransition>} />
            <Route path="/booking" element={<PageTransition><Booking /></PageTransition>} />
            <Route path="/my-bookings" element={<PageTransition><MyBookings /></PageTransition>} />
            <Route path="/customer-requests" element={<PageTransition><CustomerRequests /></PageTransition>} />
            <Route path="/login" element={<PageTransition><Login /></PageTransition>} />
            <Route path="/signup" element={<PageTransition><Signup /></PageTransition>} />
            <Route path="/forgot-password" element={<PageTransition><ForgotPassword /></PageTransition>} />
            <Route path="/reset-password" element={<PageTransition><ResetPassword /></PageTransition>} />
            <Route path="/admin" element={<PageTransition><RoleGate allowedRoles={['admin']}><AdminDashboard /></RoleGate></PageTransition>} />
            <Route path="/admin/dashboard" element={<PageTransition><RoleGate allowedRoles={['admin']}><AdminDashboard /></RoleGate></PageTransition>} />
            <Route path="/admin/users" element={<PageTransition><RoleGate allowedRoles={['admin']}><AdminDashboard /></RoleGate></PageTransition>} />
            <Route path="/admin/vendors" element={<PageTransition><RoleGate allowedRoles={['admin']}><AdminDashboard /></RoleGate></PageTransition>} />
            <Route path="/admin/bookings" element={<PageTransition><RoleGate allowedRoles={['admin']}><AdminDashboard /></RoleGate></PageTransition>} />
            <Route path="/admin/approvals" element={<PageTransition><RoleGate allowedRoles={['admin']}><AdminDashboard /></RoleGate></PageTransition>} />
            <Route path="/admin/reports" element={<PageTransition><RoleGate allowedRoles={['admin']}><AdminDashboard /></RoleGate></PageTransition>} />
            <Route path="/vendor-dashboard" element={<PageTransition><RoleGate allowedRoles={['vendor']}><VendorDashboard /></RoleGate></PageTransition>} />
            <Route path="/vendor" element={<PageTransition><RoleGate allowedRoles={['vendor']}><VendorDashboard /></RoleGate></PageTransition>} />
            <Route path="/vendor/bookings" element={<PageTransition><RoleGate allowedRoles={['vendor']}><VendorDashboard /></RoleGate></PageTransition>} />
            <Route path="/vendor/analytics" element={<PageTransition><RoleGate allowedRoles={['vendor']}><VendorDashboard /></RoleGate></PageTransition>} />
            <Route path="/vendor/services" element={<PageTransition><RoleGate allowedRoles={['vendor']}><VendorDashboard /></RoleGate></PageTransition>} />
            <Route path="/venue/:id" element={<PageTransition><VenueDetails /></PageTransition>} />
            <Route path="/portfolio/:id" element={<PageTransition><Portfolio /></PageTransition>} />
          </Routes>
        </AnimatePresence>
      </main>
      <Footer />
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppLayout />
    </Router>
  );
}

export default App;

