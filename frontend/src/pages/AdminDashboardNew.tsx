import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, Calendar, DollarSign, CheckCircle, XCircle, Clock } from 'lucide-react';
import axios from 'axios';
import LoadingSpinner from '../components/LoadingSpinner';

interface DashboardStats {
  totalUsers: number;
  totalVendors: number;
  totalBookings: number;
  pendingBookings: number;
  confirmedBookings: number;
  completedBookings: number;
  totalRevenue: number;
}

interface Booking {
  _id: string;
  fullName: string;
  email: string;
  serviceType: string;
  weddingDate: string;
  guests: number;
  totalAmount: number;
  status: string;
  userId: {
    fullName: string;
    email: string;
  };
  vendorId: {
    businessName: string;
    businessType: string;
  };
}

// User interface removed (not used in this file)

interface Vendor {
  _id: string;
  businessName: string;
  businessType: string;
  description?: string;
  address?: {
    city?: string;
    state?: string;
  };
  contact?: {
    phone?: string;
    email?: string;
  };
  services?: string[];
  images?: string[];
  approval?: {
    status: 'pending' | 'approved' | 'rejected';
    message?: string;
  };
  pricing: { startingPrice: number; pricingType: string };
  createdAt: string;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);
  const [showRejectionModal, setShowRejectionModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [rejectionVendorId, setRejectionVendorId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      const [statsRes, bookingsRes, vendorsRes] = await Promise.all([
        axios.get('/api/admin/dashboard', { headers }),
        axios.get('/api/bookings', { headers }),
        axios.get('/api/admin/vendors', { headers })
      ]);

      setStats(statsRes.data.stats);
      setBookings(bookingsRes.data);
      setVendors(vendorsRes.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRejectClick = (vendorId: string) => {
    setRejectionVendorId(vendorId);
    setRejectionReason('');
    setShowRejectionModal(true);
  };

  const submitRejection = async () => {
    if (!rejectionVendorId) return;
    try {
      const token = localStorage.getItem('token');
      await axios.patch(
        `/api/vendors/admin/${rejectionVendorId}/approval`,
        {
          status: 'rejected',
          rejectionReason
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setShowRejectionModal(false);
      setRejectionReason('');
      setRejectionVendorId(null);
      fetchDashboardData();
    } catch (error) {
      console.error('Error rejecting vendor:', error);
    }
  };

  const updateVendorApproval = async (vendorId: string, status: 'approved' | 'rejected') => {
    if (status === 'rejected') {
      handleRejectClick(vendorId);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.patch(
        `/api/vendors/admin/${vendorId}/approval`,
        {
          status,
          message:
            status === 'approved'
              ? 'Your profile has been approved and is now visible to customers.'
              : 'Your profile was rejected.'
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchDashboardData();
    } catch (error) {
      console.error('Error updating vendor approval:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'confirmed': return 'text-green-600 bg-green-100';
      case 'cancelled': return 'text-red-600 bg-red-100';
      case 'completed': return 'text-blue-600 bg-blue-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'confirmed': return <CheckCircle className="w-4 h-4" />;
      case 'cancelled': return <XCircle className="w-4 h-4" />;
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      default: return null;
    }
  };

  const approvedVendors = vendors.filter((v) => !v.approval?.status || v.approval.status === 'approved');
  const approvalQueueVendors = vendors.filter(
    (v) => v.approval?.status === 'pending' || v.approval?.status === 'rejected'
  );

  if (loading) {
    return <LoadingSpinner label="Loading dashboard..." subtitle="Fetching admin metrics" />;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="font-playfair text-4xl font-bold text-gray-900 mb-2">
            Admin Dashboard
          </h1>
          <p className="text-gray-600">Welcome to ShaadiSetGo Admin Panel</p>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats && [
            { label: 'Total Users', value: stats.totalUsers, icon: Users, color: 'bg-blue-500' },
            { label: 'Total Vendors', value: stats.totalVendors, icon: Users, color: 'bg-purple-500' },
            { label: 'Total Bookings', value: stats.totalBookings, icon: Calendar, color: 'bg-green-500' },
            { label: 'Total Revenue', value: `₹${stats.totalRevenue.toLocaleString()}`, icon: DollarSign, color: 'bg-yellow-500' }
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-xl shadow-lg p-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
                <div className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Booking Status Overview */}
        {stats && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-xl shadow-lg p-6 mb-8"
          >
            <h2 className="font-playfair text-2xl font-bold text-gray-900 mb-4">Booking Overview</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-yellow-50 rounded-lg">
                <p className="text-2xl font-bold text-yellow-600">{stats.pendingBookings}</p>
                <p className="text-sm text-gray-600">Pending</p>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <p className="text-2xl font-bold text-green-600">{stats.confirmedBookings}</p>
                <p className="text-sm text-gray-600">Confirmed</p>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <p className="text-2xl font-bold text-blue-600">{stats.completedBookings}</p>
                <p className="text-sm text-gray-600">Completed</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Vendor Approval Queue */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white rounded-xl shadow-lg overflow-hidden mb-8"
        >
          <div className="p-6 border-b border-gray-200">
            <h2 className="font-playfair text-2xl font-bold text-gray-900">Vendor Approval Queue</h2>
          </div>
          <div className="grid gap-4 p-6">
            {approvalQueueVendors.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No pending vendors</p>
            ) : (
              approvalQueueVendors.map((vendor) => (
                <div key={vendor._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg text-gray-900">{vendor.businessName}</h3>
                      <p className="text-sm text-gray-600 capitalize">{vendor.businessType}</p>
                      <p className="text-sm text-gray-600">📍 {vendor.address?.city || 'N/A'}</p>
                      <p className="text-sm text-gray-600">💵 ₹{vendor.pricing?.startingPrice?.toLocaleString() || 'N/A'}</p>
                    </div>
                    <div className="flex gap-2 flex-wrap md:flex-nowrap">
                      <button
                        onClick={() => setSelectedVendor(vendor)}
                        className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 text-sm font-medium"
                      >
                        View
                      </button>
                      {vendor.approval?.status !== 'approved' && (
                        <button
                          onClick={() => updateVendorApproval(vendor._id, 'approved')}
                          className="px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 text-sm font-medium"
                        >
                          ✓ Approve
                        </button>
                      )}
                      {vendor.approval?.status !== 'rejected' && (
                        <button
                          onClick={() => handleRejectClick(vendor._id)}
                          className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 text-sm font-medium"
                        >
                          ✕ Reject
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </motion.div>

        {/* Recent Bookings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-white rounded-xl shadow-lg overflow-hidden mb-8"
        >
          <div className="p-6 border-b border-gray-200">
            <h2 className="font-playfair text-2xl font-bold text-gray-900">Recent Bookings</h2>
          </div>
          <div className="grid gap-4 p-6">
            {bookings.slice(0, 5).map((booking) => (
              <div key={booking._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">{booking.fullName}</p>
                    <p className="text-sm text-gray-600">{booking.email}</p>
                    <p className="text-sm text-gray-600">📅 {new Date(booking.weddingDate).toLocaleDateString()}</p>
                    <p className="text-sm text-gray-600">💰 ₹{booking.totalAmount?.toLocaleString() || 'N/A'}</p>
                  </div>
                  <div className="flex items-end gap-2">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                      {getStatusIcon(booking.status)}
                      <span className="ml-1 capitalize">{booking.status}</span>
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Confirmed Vendors */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="bg-white rounded-xl shadow-lg overflow-hidden"
        >
          <div className="p-6 border-b border-gray-200">
            <h2 className="font-playfair text-2xl font-bold text-gray-900">Confirmed Vendors ({approvedVendors.length})</h2>
          </div>
          <div className="grid gap-4 p-6 max-h-[500px] overflow-y-auto">
            {approvedVendors.map((vendor) => (
              <div key={vendor._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-gray-900">{vendor.businessName}</h3>
                    <p className="text-sm text-gray-600">📁 {vendor.businessType}</p>
                    <p className="text-sm text-gray-600">💵 ₹{vendor.pricing?.startingPrice?.toLocaleString() || 'N/A'}</p>
                  </div>
                  <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">✓ Approved</span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Vendor Details Modal */}
        {selectedVendor && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[85vh] overflow-y-auto p-6">
              <div className="flex items-start justify-between mb-4">
                <h3 className="font-playfair text-2xl font-bold text-gray-900">Vendor Details</h3>
                <button
                  onClick={() => setSelectedVendor(null)}
                  className="px-3 py-1 rounded-md bg-gray-100 hover:bg-gray-200"
                >
                  ✕
                </button>
              </div>
              <div className="space-y-2 text-sm text-gray-700">
                <p><span className="font-semibold">Business:</span> {selectedVendor.businessName}</p>
                <p><span className="font-semibold">Category:</span> <span className="capitalize">{selectedVendor.businessType}</span></p>
                <p><span className="font-semibold">Price:</span> ₹{selectedVendor.pricing?.startingPrice?.toLocaleString() || 'N/A'}</p>
                <p><span className="font-semibold">City:</span> {selectedVendor.address?.city || 'N/A'}</p>
                <p><span className="font-semibold">State:</span> {selectedVendor.address?.state || 'N/A'}</p>
                <p><span className="font-semibold">Contact Email:</span> {selectedVendor.contact?.email || 'N/A'}</p>
                <p><span className="font-semibold">Contact Phone:</span> {selectedVendor.contact?.phone || 'N/A'}</p>
                <p><span className="font-semibold">Description:</span> {selectedVendor.description || 'N/A'}</p>
                <p><span className="font-semibold">Services:</span> {(selectedVendor.services || []).join(', ') || 'N/A'}</p>
              </div>
            </div>
          </div>
        )}

        {/* Rejection Reason Modal */}
        {showRejectionModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
              <h3 className="font-playfair text-xl font-bold text-gray-900 mb-4">Reject Vendor</h3>
              <p className="text-gray-600 text-sm mb-4">Please provide a reason for rejection:</p>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Enter rejection reason..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-gold"
                rows={4}
              />
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowRejectionModal(false);
                    setRejectionReason('');
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={submitRejection}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  Reject
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

