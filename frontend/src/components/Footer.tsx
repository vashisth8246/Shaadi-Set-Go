import { Link } from 'react-router-dom';
import { Facebook, Instagram, Twitter, Mail, Phone } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="luxury-footer">
      <div className="luxury-footer-line" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div>
            <div className="luxury-footer-logo">
              <span>
                Shaadi <em>SetGo</em>
              </span>
            </div>
            <p className="text-sm mb-4">
              Creating unforgettable wedding experiences with elegance and precision. Your perfect wedding, just a click away.
            </p>
            <p className="luxury-footer-note">Crafted with reverence for tradition</p>
            <div className="luxury-socials">
              <a href="#" aria-label="Facebook">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" aria-label="Instagram">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" aria-label="Twitter">
                <Twitter className="w-5 h-5" />
              </a>
            </div>
          </div>

          <div>
            <h3>
              Services
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/venues">
                  Venues
                </Link>
              </li>
              <li>
                <Link to="/catering">
                  Food & Catering
                </Link>
              </li>
              <li>
                <Link to="/photography">
                  Photography
                </Link>
              </li>
              <li>
                <Link to="/music">
                  Music & DJ
                </Link>
              </li>
              <li>
                <Link to="/decoration">
                  Decoration
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3>
              Quick Links
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/budget">
                  Budget Calculator
                </Link>
              </li>
              <li>
                <Link to="/checklist">
                  Wedding Checklist
                </Link>
              </li>
              <li>
                <Link to="/booking">
                  Book Services
                </Link>
              </li>
              <li>
                <Link to="/login">
                  Login
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3>
              Contact
            </h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center space-x-2">
                <Phone className="w-4 h-4 text-gold" />
                <span>+91 98765 43210</span>
              </li>
              <li className="flex items-center space-x-2">
                <Mail className="w-4 h-4 text-gold" />
                <span>hello@shaddisetgo.com</span>
              </li>
            </ul>

          </div>
        </div>

        <div className="luxury-copyright">
          <p>&copy; 2026 Shaadi SetGo. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

