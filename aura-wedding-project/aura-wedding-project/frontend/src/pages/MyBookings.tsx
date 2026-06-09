import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Users, DollarSign, Edit2, Trash2, X, Check } from 'lucide-react';
import axios from 'axios';
import LoadingSpinner from '../components/LoadingSpinner';
// pageImages unused

interface Booking {
  _id: string;
  serviceType: string;
  weddingDate: string;
  guests: number;
  budget: number;
  totalAmount: number;
  status: string;
  location?: string;
  vendorId?: {
    businessName: string;
    businessType: string;
    contact?: {
      email?: string;
      phone?: string;
    };
  };
  categoryDetails: any;
}

export default function MyBookings() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<Partial<Booking>>({});

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/bookings/my', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBookings(response.data);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (booking: Booking) => {
    setSelectedBooking(booking);
    setFormData(booking);
    setShowForm(true);
  };

  const handleDelete = async (bookingId: string) => {
    if (!window.confirm('Are you sure you want to delete this booking request?')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`/api/bookings/${bookingId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchBookings();
    } catch (error) {
      console.error('Error deleting booking:', error);
    }
  };

  const handleSave = async () => {
    if (!selectedBooking) return;
    try {
      const token = localStorage.getItem('token');
      await axios.put(`/api/bookings/${selectedBooking._id}`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setShowForm(false);
      setSelectedBooking(null);
      fetchBookings();
    } catch (error) {
      console.error('Error updating booking:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'bg-yellow-100 text-yellow-800';
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return <LoadingSpinner label="Loading your bookings..." subtitle="Pulling your latest requests" />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 to-white py-12">
      <div className="max-w-6xl mx-auto px-4">
        
        {bookings.length === 0 ? (
          <div className="text-center py-12 mt-8">
            <p className="text-gray-500 text-lg mb-4">No booking requests yet</p>
            <a href="/booking" className="text-gold font-semibold hover:underline">
              Create your first booking →
            </a>
          </div>
        ) : (
          <div className="grid gap-6">
            {bookings.map((booking) => (
              <motion.div
                key={booking._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6"
              >
                <div className="flex flex-col md:flex-row md:items-start md:justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-semibold text-gray-900 capitalize">
                        {booking.serviceType}
                      </h3>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(booking.status)}`}>
                        {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                      </span>
                    </div>
                    {booking.vendorId ? (
                      <p className="text-gray-600 text-sm">
                        <span className="font-medium">Vendor:</span> {booking.vendorId.businessName}
                      </p>
                    ) : (
                      <p className="text-gray-600 text-sm">
                        <span className="font-medium">Vendor:</span> Awaiting confirmation
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div className="flex items-center space-x-2 text-gray-700">
                    <Calendar className="w-5 h-5 text-gold" />
                    <div>
                      <p className="text-xs text-gray-500">Wedding Date</p>
                      <p className="font-medium">{new Date(booking.weddingDate).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 text-gray-700">
                    <Users className="w-5 h-5 text-gold" />
                    <div>
                      <p className="text-xs text-gray-500">Guests</p>
                      <p className="font-medium">{booking.guests}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 text-gray-700">
                    <DollarSign className="w-5 h-5 text-gold" />
                    <div>
                      <p className="text-xs text-gray-500">Budget</p>
                      <p className="font-medium">₹{booking.budget?.toLocaleString() || 'N/A'}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 text-gray-700">
                    <DollarSign className="w-5 h-5 text-gold" />
                    <div>
                      <p className="text-xs text-gray-500">Quote</p>
                      <p className="font-medium">₹{booking.totalAmount?.toLocaleString() || 'N/A'}</p>
                    </div>
                  </div>
                </div>

                {booking.status === 'confirmed' && booking.vendorId?.contact && (
                  <div className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
                    Vendor contact: {booking.vendorId.contact.email || 'N/A'}{booking.vendorId.contact.phone ? ` | ${booking.vendorId.contact.phone}` : ''}
                  </div>
                )}

                <div className="flex gap-3">
                  {booking.status === 'open' && (
                    <>
                      <button
                        onClick={() => handleEdit(booking)}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(booking._id)}
                        className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete
                      </button>
                    </>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}

        <AnimatePresence>
          {showForm && selectedBooking && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
            >
              <motion.div
                initial={{ scale: 0.95 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.95 }}
                className="bg-white rounded-lg max-w-md w-full p-6"
              >
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold text-gray-900">Edit Booking</h2>
                  <button onClick={() => setShowForm(false)} className="text-gray-500">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Service Type</label>
                    <input
                      type="text"
                      value={formData.serviceType || ''}
                      disabled
                      className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Wedding Date</label>
                    <input
                      type="date"
                      value={formData.weddingDate ? new Date(formData.weddingDate).toISOString().split('T')[0] : ''}
                      onChange={(e) => setFormData({ ...formData, weddingDate: e.target.value })}
                      className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Number of Guests</label>
                    <input
                      type="number"
                      value={formData.guests || ''}
                      onChange={(e) => setFormData({ ...formData, guests: parseInt(e.target.value) })}
                      className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Budget (₹)</label>
                    <input
                      type="number"
                      value={formData.budget || ''}
                      onChange={(e) => setFormData({ ...formData, budget: parseInt(e.target.value) })}
                      className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setShowForm(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    className="flex-1 px-4 py-2 bg-gold text-white rounded-lg hover:bg-gold/90 flex items-center justify-center gap-2"
                  >
                    <Check className="w-4 h-4" />
                    Save Changes
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

