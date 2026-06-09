import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Heart } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const navLinks = [
  { name: 'Home', path: '/' },
  { name: 'Venues', path: '/venues' },
  { name: 'Catering', path: '/catering' },
  { name: 'Photography', path: '/photography' },
  { name: 'Music & DJ', path: '/music' },
  { name: 'Decoration', path: '/decoration' },
  { name: 'Budget', path: '/budget' },
  { name: 'Checklist', path: '/checklist' },
  { name: 'My Bookings', path: '/my-bookings' },
];

export default function CustomerNavbar() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    sessionStorage.removeItem('auth_session');
    window.location.href = '/login';
  };

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <Link to="/" className="flex items-center space-x-2">
            <Heart className="w-8 h-8 text-gold fill-gold" />
            <span className="font-playfair text-2xl font-bold text-gray-900">
              ShaadiSetGo
            </span>
          </Link>

          <div className="hidden lg:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`text-sm font-medium transition-colors ${
                  location.pathname === link.path
                    ? 'text-gold'
                    : 'text-gray-700 hover:text-gold'
                }`}
              >
                {link.name}
              </Link>
            ))}

            <button onClick={handleLogout} className="text-sm font-medium text-red-600 hover:text-red-800">
              Logout
            </button>

            <Link
              to="/booking"
              className="px-6 py-2 bg-gold text-white rounded-full font-medium hover:bg-gold/90 transition-all"
            >
              Book Now
            </Link>
          </div>

          <button
            onClick={() => setIsOpen(!isOpen)}
            className="lg:hidden p-2 text-gray-700"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-white border-t"
          >
            <div className="px-4 py-4 space-y-3">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsOpen(false)}
                  className={`block py-2 text-base font-medium transition-colors ${
                    location.pathname === link.path
                      ? 'text-gold'
                      : 'text-gray-700'
                  }`}
                >
                  {link.name}
                </Link>
              ))}
              
              <button onClick={handleLogout} className="block w-full text-left py-2 text-base font-medium text-red-600">
                Logout
              </button>

              <Link
                to="/booking"
                onClick={() => setIsOpen(false)}
                className="block w-full text-center py-2 bg-gold text-white rounded-lg font-medium hover:bg-gold/90"
              >
                Book Now
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}

