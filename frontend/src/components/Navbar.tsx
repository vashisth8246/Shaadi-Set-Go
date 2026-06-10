import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
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
];

const customerLinks = [{ name: 'My Requests', path: '/customer-requests' }];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();
  const rawToken = localStorage.getItem('token');
  const token = rawToken && !['null', 'undefined', ''].includes(rawToken) ? rawToken : null;

  let user: any | null = null;
  const rawUser = localStorage.getItem('user');
  if (rawUser && !['null', 'undefined', ''].includes(rawUser)) {
    try {
      user = JSON.parse(rawUser);
    } catch {
      user = null;
    }
  }

  const isAuthenticated = Boolean(token && user?.email);

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    sessionStorage.removeItem('auth_session');
    window.location.href = '/login';
  };

  return (
    <nav className={`luxury-navbar ${isScrolled ? 'is-scrolled' : ''}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="luxury-nav-inner">
          <Link to="/" className="luxury-logo" aria-label="Shaadi SetGo home">
            <span className="luxury-logo-text">
              <span>Shaadi</span>
              <em>SetGo</em>
            </span>
          </Link>

          <div className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`luxury-nav-link ${
                  location.pathname === link.path
                    ? 'is-active'
                    : ''
                }`}
              >
                {link.name}
              </Link>
            ))}

            {isAuthenticated && user?.role === 'user' && customerLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`luxury-nav-link ${
                  location.pathname === link.path
                    ? 'is-active'
                    : ''
                }`}
              >
                {link.name}
              </Link>
            ))}
            
            {!isAuthenticated ? (
              <Link to="/login" className="luxury-login-btn">
                Login / Sign Up
              </Link>
            ) : (
              <button onClick={handleLogout} className="luxury-login-btn">
                Logout
              </button>
            )}

            <Link
              to="/booking"
              className="luxury-book-btn"
            >
              Book Now
            </Link>
          </div>

          <button
            onClick={() => setIsOpen(!isOpen)}
            className={`luxury-menu-toggle ${isOpen ? 'is-open' : ''}`}
            aria-label="Toggle menu"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="luxury-mobile-menu"
          >
            <motion.div
              className="luxury-mobile-links"
              initial="hidden"
              animate="show"
              variants={{ hidden: {}, show: { transition: { staggerChildren: 0.08, delayChildren: 0.12 } } }}
            >
              {navLinks.map((link) => (
                <motion.div
                  key={link.path}
                  variants={{ hidden: { opacity: 0, y: 24 }, show: { opacity: 1, y: 0 } }}
                >
                  <Link
                    to={link.path}
                    onClick={() => setIsOpen(false)}
                    className={`luxury-mobile-link ${location.pathname === link.path ? 'is-active' : ''}`}
                  >
                    {link.name}
                  </Link>
                </motion.div>
              ))}

              {isAuthenticated && user?.role === 'user' && customerLinks.map((link) => (
                <motion.div
                  key={link.path}
                  variants={{ hidden: { opacity: 0, y: 24 }, show: { opacity: 1, y: 0 } }}
                >
                  <Link
                    to={link.path}
                    onClick={() => setIsOpen(false)}
                    className={`luxury-mobile-link ${location.pathname === link.path ? 'is-active' : ''}`}
                  >
                    {link.name}
                  </Link>
                </motion.div>
              ))}
              
              {!isAuthenticated ? (
                <Link to="/login" onClick={() => setIsOpen(false)} className="luxury-mobile-link">
                  Login / Sign Up
                </Link>
              ) : (
                <button onClick={handleLogout} className="luxury-mobile-link text-left">
                  Logout
                </button>
              )}

              <Link
                to="/booking"
                onClick={() => setIsOpen(false)}
                className="luxury-mobile-cta"
              >
                Book Now
              </Link>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}

