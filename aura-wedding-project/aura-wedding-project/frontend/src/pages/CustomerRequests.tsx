import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Calendar, Trash2, Users, IndianRupee } from 'lucide-react';
import axios from 'axios';
import LoadingSpinner from '../components/LoadingSpinner';
// pageImages unused

interface BookingRequest {
  _id: string;
  serviceType: string;
  weddingDate: string;
  guests: number;
  budget: number;
  totalAmount: number;
  status: string;
  vendorId?: {
    businessName: string;
    businessType: string;
    contact?: {
      email?: string;
      phone?: string;
    };
  };
}

const getStatusStyles = (status: string) => {
  switch (status) {
    case 'open':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'confirmed':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'rejected':
      return 'bg-red-100 text-red-800 border-red-200';
    case 'completed':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

export default function CustomerRequests() {
  const [requests, setRequests] = useState<BookingRequest[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRequests = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/bookings/my', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRequests(response.data || []);
    } catch (error) {
      console.error('Error fetching customer booking requests:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleDelete = async (requestId: string) => {
    if (!window.confirm('Delete this booking request?')) return;

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`/api/bookings/${requestId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchRequests();
    } catch (error) {
      console.error('Error deleting booking request:', error);
    }
  };

  if (loading) {
    return <LoadingSpinner label="Loading booking requests..." subtitle="Fetching customer requests" />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-pink/20 to-white py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {requests.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-md p-10 text-center mt-8">
            <p className="text-lg text-gray-600 mb-4">You have not created any booking requests yet.</p>
            <Link
              to="/booking"
              className="inline-block px-6 py-3 bg-gold text-white rounded-full font-semibold hover:bg-gold/90"
            >
              Create New Request
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {requests.map((request, index) => (
              <motion.div
                key={request._id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white rounded-2xl border border-gray-100 shadow-md hover:shadow-lg transition-shadow p-6"
              >
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 capitalize">{request.serviceType}</h2>
                    {request.vendorId?.businessName && (
                      <p className="text-sm text-gray-600 mt-1">
                        Vendor: {request.vendorId.businessName}
                      </p>
                    )}
                    {!request.vendorId?.businessName && (
                      <p className="text-sm text-gray-600 mt-1">
                        Open request for matching vendors
                      </p>
                    )}
                  </div>
                  <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${getStatusStyles(request.status)}`}>
                    {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="flex items-center gap-2 text-gray-700">
                    <Calendar className="w-4 h-4 text-gold" />
                    <div>
                      <p className="text-xs text-gray-500">Wedding Date</p>
                      <p className="font-medium text-sm">{new Date(request.weddingDate).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-gray-700">
                    <Users className="w-4 h-4 text-gold" />
                    <div>
                      <p className="text-xs text-gray-500">Guests</p>
                      <p className="font-medium text-sm">{request.guests || 0}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-gray-700">
                    <IndianRupee className="w-4 h-4 text-gold" />
                    <div>
                      <p className="text-xs text-gray-500">Budget</p>
                      <p className="font-medium text-sm">{request.budget ? request.budget.toLocaleString() : 'N/A'}</p>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-100">
                  <p className="text-sm text-gray-600">
                    Quote: <span className="font-semibold text-gray-900">{request.totalAmount ? `Rs ${request.totalAmount.toLocaleString()}` : 'Pending'}</span>
                  </p>
                  {request.status === 'confirmed' && request.vendorId?.contact && (
                    <p className="mt-2 text-sm text-emerald-700">
                      Contact: {request.vendorId.contact.email || 'N/A'}{request.vendorId.contact.phone ? ` | ${request.vendorId.contact.phone}` : ''}
                    </p>
                  )}
                </div>

                {request.status === 'open' && (
                  <div className="mt-4 flex justify-end">
                    <button
                      onClick={() => handleDelete(request._id)}
                      className="inline-flex items-center gap-2 rounded-full bg-red-50 px-4 py-2 text-sm font-semibold text-red-700 transition-colors hover:bg-red-100"
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete request
                    </button>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

