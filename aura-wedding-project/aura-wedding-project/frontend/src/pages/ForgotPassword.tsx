import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, Mail, ArrowLeft, CheckCircle } from 'lucide-react';
import axios from 'axios';
import { isValidEmail } from '../utils/normalization';
// pageImages unused

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    if (!isValidEmail(email)) {
      setError('Please enter a valid email address');
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post('/auth/forgot-password', { email });
      setSuccess(response.data.message || 'If an account exists, a password reset link has been sent to your email.');
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to send reset link. Please try again.');
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
            Reset Password
          </h1>
          <p className="text-gray-600">Enter your email to receive a password reset link</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {success ? (
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl p-8 text-center border-t-4 border-green-500">
            <div className="flex justify-center mb-4">
               <CheckCircle className="w-12 h-12 text-green-500" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Check your email</h2>
            <p className="text-gray-600 mb-8">{success}</p>
            <Link to="/login" className="inline-block w-full py-3 bg-gray-100 text-gray-900 rounded-xl font-semibold hover:bg-gray-200 transition-colors">
              Return to Login
            </Link>
          </div>
        ) : (
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

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-gold to-yellow-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50"
              >
                {loading ? 'Sending...' : 'Send Reset Link'}
              </button>
            </form>

            <div className="mt-6 text-center">
              <Link to="/login" className="inline-flex items-center text-gray-600 hover:text-gold font-medium">
                <ArrowLeft className="w-4 h-4 mr-2" /> Back to login
              </Link>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}

