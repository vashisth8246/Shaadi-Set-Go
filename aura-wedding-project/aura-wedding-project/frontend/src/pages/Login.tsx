import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import axios from 'axios';
import { isValidEmail } from '../utils/normalization';
// pageImages unused

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const location = useLocation();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!isValidEmail(email)) {
      setError('Please enter a valid email address');
      setLoading(false);
      return;
    }

    if (!password.trim()) {
      setError('Password is required');
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post('/api/auth/login', {
        email,
        password
      });

      const { token, user } = response.data;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      sessionStorage.setItem('auth_session', 'active');

      const redirectFromState = location.state as {
        redirectTo?: string;
        redirectState?: Record<string, unknown>;
      } | null;
      const savedRedirectRaw = sessionStorage.getItem('post_login_redirect');
      const savedRedirect = savedRedirectRaw ? JSON.parse(savedRedirectRaw) : null;

      const redirectTo = redirectFromState?.redirectTo || (savedRedirect?.path ? `${savedRedirect.path}${savedRedirect.search || ''}` : null);
      const redirectState = redirectFromState?.redirectState || savedRedirect?.state;

      if (redirectTo && user.role === 'user') {
        sessionStorage.removeItem('post_login_redirect');
        navigate(redirectTo, { state: redirectState });
        return;
      }

      sessionStorage.removeItem('post_login_redirect');

      // Redirect based on user role
      switch (user.role) {
        case 'admin':
          navigate('/admin/dashboard');
          break;
        case 'vendor':
          navigate('/vendor-dashboard');
          break;
        default:
          navigate('/');
      }
    } catch (error: any) {
      setError(error.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-rose-pink via-white to-gold/20 py-12 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-md w-full"
      >
        
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gold/10 rounded-full mb-4">
            <Heart className="w-8 h-8 text-gold fill-gold" />
          </div>
          <h1 className="font-playfair text-4xl font-bold text-gray-900 mb-2">
            Welcome to ShaadiSetGo
          </h1>
          <p className="text-gray-600">Sign in to continue planning your perfect wedding</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-gold focus:border-transparent"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-gold focus:border-transparent"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="w-4 h-4 text-gold border-gray-300 rounded focus:ring-gold"
                />
                <span className="ml-2 text-gray-700">Remember me</span>
              </label>
              <Link to="/forgot-password" className="text-gold hover:text-gold/80 font-medium">
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-gold to-yellow-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50"
            >
              {loading ? 'Signing In...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Don't have an account?{' '}
              <Link to="/signup" className="text-gold hover:text-gold/80 font-semibold">
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

