import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {
  BadgeCheck,
  // BarChart3 removed (unused)
  CalendarDays,
  CheckCircle2,
  Clock3,
  DollarSign,
  Edit,
  MapPin,
  Mail,
  Phone,
  Plus,
  Sparkles,
  Star,
  Trash2,
  TrendingUp,
  Users,
  XCircle,
} from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';
// pageImages unused
import { normalizeCityName } from '../utils/normalization';

interface Vendor {
  _id: string;
  businessName: string;
  business_name?: string;
  name?: string;
  businessType: string;
  description: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
  };
  contact: {
    phone: string;
    email: string;
    website: string;
  };
  pricing: {
    startingPrice: number;
    pricingType: string;
  };
  services: string[];
  images: string[];
  rating: {
    average: number;
    count: number;
  };
  availability: {
    available: boolean;
    bookedDates: Date[];
  };
  approval?: {
    status: 'pending' | 'approved' | 'rejected';
    message?: string;
  };
}

interface VendorBooking {
  _id: string;
  fullName: string;
  email: string;
  phone: string;
  serviceType: string;
  location?: string;
  weddingDate: string;
  guests: number;
  budget?: number;
  specialRequests?: string;
  categoryDetails?: Record<string, string | number | boolean | null>;
  status: 'open' | 'confirmed' | 'cancelled' | 'rejected' | 'completed';
  totalAmount?: number;
  createdAt?: string;
  userId?: {
    fullName: string;
    email: string;
  };
  vendorId?: {
    businessName: string;
    businessType: string;
    contact?: {
      email?: string;
      phone?: string;
      website?: string;
    };
  };
}

const COLORS = ['#C8A96A', '#7C3AED', '#0EA5E9', '#10B981', '#F59E0B', '#EF4444'];

type VendorSection = 'overview' | 'bookings' | 'analytics' | 'services';

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(value || 0);

const formatDate = (value?: string) => (value ? new Date(value).toLocaleDateString() : 'N/A');

const getBookingDate = (booking: VendorBooking) => new Date(booking.createdAt || booking.weddingDate || Date.now());
const isOpenBooking = (booking: VendorBooking) => booking.status === 'open';

const monthLabel = (date: Date) => date.toLocaleString('en-US', { month: 'short' });

const sectionFromPath = (pathname: string): VendorSection => {
  if (pathname.includes('/bookings')) return 'bookings';
  if (pathname.includes('/analytics')) return 'analytics';
  if (pathname.includes('/services')) return 'services';
  return 'overview';
};

const getVendorDisplayName = (vendor: Vendor) => {
  const displayName = vendor.businessName || vendor.business_name || vendor.name || '';
  return displayName.trim() || `${vendor.businessType.charAt(0).toUpperCase()}${vendor.businessType.slice(1)} Service`;
};

const StatCard = ({ label, value, icon: Icon, hint }: { label: string; value: string; icon: React.ComponentType<{ className?: string }>; hint: string }) => (
  <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm transition-transform duration-300 hover:-translate-y-1 hover:shadow-xl">
    <div className="flex items-start justify-between gap-4">
      <div>
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-gray-500">{label}</p>
        <p className="mt-3 text-3xl font-bold text-gray-900">{value}</p>
        <p className="mt-2 text-sm text-gray-500">{hint}</p>
      </div>
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gold/10 text-gold">
        <Icon className="h-6 w-6" />
      </div>
    </div>
  </div>
);

export default function VendorDashboard() {
  const location = useLocation();
  const section = sectionFromPath(location.pathname);

  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingVendor, setEditingVendor] = useState<Vendor | null>(null);
  const [bookings, setBookings] = useState<VendorBooking[]>([]);
  const [rejectingBooking, setRejectingBooking] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [loading, setLoading] = useState(true);
  const [actionError, setActionError] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');

  useEffect(() => {
    fetchVendors();

    const intervalId = window.setInterval(() => {
      fetchVendors();
    }, 10000);

    const handleFocusRefresh = () => {
      fetchVendors();
    };

    window.addEventListener('focus', handleFocusRefresh);

    return () => {
      window.clearInterval(intervalId);
      window.removeEventListener('focus', handleFocusRefresh);
    };
  }, []);

  const fetchVendors = async () => {
    try {
      setActionError('');
      const token = localStorage.getItem('token');
      if (!token) {
        setActionError('Please login first to manage your services.');
        setLoading(false);
        return;
      }

      const response = await axios.get('/api/vendors/my', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setVendors(response.data);

      const bookingRes = await axios.get('/api/bookings/vendor/my', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBookings(bookingRes.data);
    } catch (error) {
      setActionError('Unable to load vendor dashboard. Please login with your vendor account.');
      console.error('Error fetching vendor data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (formData: any) => {
    try {
      setActionError('');
      setActionSuccess('');
      const token = localStorage.getItem('token');
      if (!token) {
        setActionError('Please login first.');
        return;
      }

      let uploadedImageUrls: string[] = [];
      if (formData.imageFiles?.length) {
        const imageFormData = new FormData();
        formData.imageFiles.forEach((file: File) => imageFormData.append('images', file));
        const uploadRes = await axios.post('/api/uploads/images', imageFormData, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        });
        uploadedImageUrls = uploadRes.data?.images || [];
      }

      const normalizedPayload = {
        ...formData,
        address: {
          ...formData.address,
          city: normalizeCityName(formData.address.city || ''),
        },
        images: [...(formData.images || []), ...uploadedImageUrls],
      };

      delete normalizedPayload.imageFiles;

      if (editingVendor) {
        await axios.put(`/api/vendors/${editingVendor._id}`, normalizedPayload, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setActionSuccess('Service updated successfully.');
      } else {
        await axios.post('/api/vendors/register', normalizedPayload, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setActionSuccess('Service added successfully. It is now pending admin approval.');
      }
      fetchVendors();
      setShowAddForm(false);
      setEditingVendor(null);
    } catch (error: any) {
      setActionError(error.response?.data?.message || 'Unable to save service. Please verify all fields and try again.');
      console.error('Error saving vendor:', error);
    }
  };

  const handleDelete = async (vendorId: string) => {
    if (window.confirm('Are you sure you want to delete this vendor listing?')) {
      try {
        setActionError('');
        setActionSuccess('');
        const token = localStorage.getItem('token');
        await axios.delete(`/api/vendors/${vendorId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setActionSuccess('Service deleted successfully.');
        fetchVendors();
      } catch (error) {
        setActionError('Unable to delete service right now.');
        console.error('Error deleting vendor:', error);
      }
    }
  };

  const updateBookingStatus = async (bookingId: string, status: 'confirmed' | 'rejected', statusReason?: string) => {
    try {
      const token = localStorage.getItem('token');
      await axios.patch(
        `/api/bookings/${bookingId}/vendor-status`,
        { status, rejectionReason: statusReason },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setActionSuccess(`Booking ${status} successfully.`);
      fetchVendors();
    } catch (error) {
      console.error('Error updating booking status:', error);
      setActionError('Unable to update booking status.');
    }
  };

  const totalListings = vendors.length;
  const totalBookings = bookings.length;
  const revenueGenerated = bookings.reduce((sum, booking) => sum + ((booking.status === 'confirmed' || booking.status === 'completed') ? booking.totalAmount || 0 : 0), 0);
  const confirmedBookings = bookings.filter((booking) => booking.status === 'confirmed' || booking.status === 'completed').length;
  const openRequests = bookings.filter(isOpenBooking).length;
  const customerCount = new Set(bookings.map((booking) => booking.email)).size;
  // approvalPending unused
  const responseRate = totalBookings === 0 ? 0 : Math.round((confirmedBookings / totalBookings) * 100);

  const monthlySeries = useMemo(() => {
    const labels = Array.from({ length: 6 }, (_, index) => {
      const date = new Date();
      date.setMonth(date.getMonth() - (5 - index));
      return {
        key: `${date.getFullYear()}-${date.getMonth()}`,
        label: monthLabel(date),
        bookings: 0,
        revenue: 0,
      };
    });

    bookings.forEach((booking) => {
      const date = getBookingDate(booking);
      const bucket = labels.find((entry) => entry.key === `${date.getFullYear()}-${date.getMonth()}`);
      if (bucket) {
        bucket.bookings += 1;
        bucket.revenue += booking.status === 'confirmed' || booking.status === 'completed' ? booking.totalAmount || 0 : 0;
      }
    });

    return labels;
  }, [bookings]);

  const quarterlySeries = useMemo(() => {
    const quarters = [
      { label: 'Q1', bookings: 0, revenue: 0 },
      { label: 'Q2', bookings: 0, revenue: 0 },
      { label: 'Q3', bookings: 0, revenue: 0 },
      { label: 'Q4', bookings: 0, revenue: 0 },
    ];

    bookings.forEach((booking) => {
      const date = getBookingDate(booking);
      const quarter = Math.floor(date.getMonth() / 3);
      quarters[quarter].bookings += 1;
      quarters[quarter].revenue += booking.status === 'confirmed' || booking.status === 'completed' ? booking.totalAmount || 0 : 0;
    });

    return quarters;
  }, [bookings]);

  const statusSeries = useMemo(() => {
    const statuses = bookings.reduce<Record<string, number>>((acc, booking) => {
      const key = booking.status || 'open';
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(statuses).map(([name, value]) => ({ name, value }));
  }, [bookings]);

  // heroActions unused

  if (loading) {
    return <LoadingSpinner label="Loading vendor dashboard..." subtitle="Preparing booking requests" />;
  }

  const statusLabel = (status: string) =>
    status === 'open' ? 'Open'
    : status === 'confirmed' ? 'Confirmed'
    : status === 'completed' ? 'Completed'
    : status === 'rejected' ? 'Rejected'
    : status === 'cancelled' ? 'Cancelled'
    : 'Open';

  const renderOverview = () => (
    <>
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-6">
        <div className="xl:col-span-1"><StatCard label="Listings" value={String(totalListings)} icon={BadgeCheck} hint="Your current services" /></div>
        <div className="xl:col-span-1"><StatCard label="Bookings" value={String(totalBookings)} icon={CalendarDays} hint="All relevant requests" /></div>
        <div className="xl:col-span-1"><StatCard label="Revenue" value={formatCurrency(revenueGenerated)} icon={DollarSign} hint="Confirmed or completed bookings" /></div>
        <div className="xl:col-span-1"><StatCard label="Open requests" value={String(openRequests)} icon={Clock3} hint="Waiting for vendor action" /></div>
        <div className="xl:col-span-1"><StatCard label="Customers" value={String(customerCount)} icon={Users} hint="Unique customer activity" /></div>
        <div className="xl:col-span-1"><StatCard label="Response rate" value={`${responseRate}%`} icon={TrendingUp} hint="Confirmed bookings share" /></div>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Monthly bookings</h2>
              <p className="text-sm text-gray-500">Performance over the last six months</p>
            </div>
            <Sparkles className="h-5 w-5 text-gold" />
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlySeries}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="label" stroke="#6B7280" />
                <YAxis stroke="#6B7280" />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="bookings" stroke="#C8A96A" strokeWidth={3} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Revenue bar chart</h2>
              <p className="text-sm text-gray-500">Booking value by month</p>
            </div>
            <DollarSign className="h-5 w-5 text-gold" />
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlySeries}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="label" stroke="#6B7280" />
                <YAxis stroke="#6B7280" />
                <Tooltip />
                <Bar dataKey="revenue" radius={[12, 12, 0, 0]} fill="#7C3AED" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Booking status</h2>
              <p className="text-sm text-gray-500">Pending versus confirmed outcomes</p>
            </div>
            <CheckCircle2 className="h-5 w-5 text-gold" />
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={statusSeries} dataKey="value" nameKey="name" innerRadius={70} outerRadius={110} paddingAngle={4}>
                  {statusSeries.map((entry, index) => (
                    <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Quarterly comparison</h2>
              <p className="text-sm text-gray-500">Bookings and revenue by quarter</p>
            </div>
            <TrendingUp className="h-5 w-5 text-gold" />
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={quarterlySeries}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="label" stroke="#6B7280" />
                <YAxis stroke="#6B7280" />
                <Tooltip />
                <Legend />
                <Bar dataKey="bookings" fill="#C8A96A" radius={[10, 10, 0, 0]} />
                <Bar dataKey="revenue" fill="#10B981" radius={[10, 10, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="rounded-3xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-200 px-6 py-5">
          <h2 className="text-xl font-bold text-gray-900">Recent customer activity</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50 text-left text-xs uppercase tracking-[0.2em] text-gray-500">
              <tr>
                <th className="px-6 py-3">Customer</th>
                <th className="px-6 py-3">Wedding date</th>
                <th className="px-6 py-3">Guests</th>
                <th className="px-6 py-3">Amount</th>
                <th className="px-6 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {bookings.slice(0, 8).map((booking) => (
                <tr key={booking._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900">{booking.fullName}</div>
                    <div className="text-sm text-gray-500">{booking.email}</div>
                  </td>
                  <td className="px-6 py-4 text-gray-700">{formatDate(booking.weddingDate)}</td>
                  <td className="px-6 py-4 text-gray-700">{booking.guests}</td>
                  <td className="px-6 py-4 text-gray-700">{formatCurrency(booking.totalAmount || 0)}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold capitalize ${booking.status === 'confirmed' ? 'bg-emerald-100 text-emerald-700' : booking.status === 'completed' ? 'bg-blue-100 text-blue-700' : booking.status === 'rejected' || booking.status === 'cancelled' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>
                      {statusLabel(booking.status)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );

  const renderBookings = () => (
    <div className="rounded-3xl border border-gray-200 bg-white shadow-sm">
      <div className="border-b border-gray-200 px-6 py-5">
        <h2 className="text-xl font-bold text-gray-900">Open booking requests</h2>
        <p className="mt-1 text-sm text-gray-500">Review category-matched requests, accept the ones you can serve, or pass on them.</p>
      </div>
      <div className="grid gap-4 p-6">
        {bookings.length === 0 ? (
          <p className="py-10 text-center text-sm text-gray-500">No booking requests yet.</p>
        ) : (
          bookings.map((booking) => (
            <motion.div key={booking._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl border border-gray-200 bg-gradient-to-br from-white to-gray-50 p-5 shadow-sm transition-shadow hover:shadow-lg">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="flex-1">
                  <div className="mb-3 flex flex-wrap items-center gap-3">
                    <h3 className="text-lg font-semibold text-gray-900">{booking.fullName}</h3>
                    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold capitalize ${booking.status === 'confirmed' ? 'bg-emerald-100 text-emerald-700' : booking.status === 'completed' ? 'bg-blue-100 text-blue-700' : booking.status === 'rejected' || booking.status === 'cancelled' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>
                      {statusLabel(booking.status)}
                    </span>
                    <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold capitalize text-slate-700">
                      {booking.serviceType}
                    </span>
                  </div>
                  <div className="grid gap-3 text-sm sm:grid-cols-2 xl:grid-cols-4">
                    <div className="rounded-2xl border border-gray-100 bg-white p-3">
                      <p className="text-xs text-gray-500">Email</p>
                      <p className="font-semibold text-gray-900">{booking.email}</p>
                    </div>
                    <div className="rounded-2xl border border-gray-100 bg-white p-3">
                      <p className="text-xs text-gray-500">Date</p>
                      <p className="font-semibold text-gray-900">{formatDate(booking.weddingDate)}</p>
                    </div>
                    <div className="rounded-2xl border border-gray-100 bg-white p-3">
                      <p className="text-xs text-gray-500">Guests</p>
                      <p className="font-semibold text-gray-900">{booking.guests}</p>
                    </div>
                    <div className="rounded-2xl border border-gray-100 bg-white p-3">
                      <p className="text-xs text-gray-500">Budget</p>
                      <p className="font-semibold text-gray-900">{formatCurrency(booking.budget || 0)}</p>
                    </div>
                    <div className="rounded-2xl border border-gray-100 bg-white p-3">
                      <p className="text-xs text-gray-500">Location</p>
                      <p className="font-semibold text-gray-900">{booking.location || 'Flexible'}</p>
                    </div>
                  </div>
                  {booking.categoryDetails && Object.keys(booking.categoryDetails).length > 0 && (
                    <div className="mt-4 rounded-2xl border border-amber-100 bg-amber-50/50 p-4">
                      <p className="text-sm font-semibold text-gray-900">Preferences</p>
                      <div className="mt-2 grid gap-2 sm:grid-cols-2">
                        {Object.entries(booking.categoryDetails).map(([label, value]) => (
                          <div key={label} className="text-sm text-gray-700">
                            <span className="font-medium">{label}:</span> {String(value)}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {booking.specialRequests && (
                    <p className="mt-4 text-sm text-gray-600"><span className="font-semibold text-gray-900">Special requests:</span> {booking.specialRequests}</p>
                  )}
                </div>
                <div className="flex flex-wrap gap-2 lg:flex-col lg:min-w-fit">
                  {isOpenBooking(booking) ? (
                    <>
                      <button onClick={() => updateBookingStatus(booking._id, 'confirmed')} className="rounded-full bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700 transition-colors hover:bg-emerald-100">
                        <CheckCircle2 className="mr-2 inline h-4 w-4" />
                        Accept
                      </button>
                      <button onClick={() => { setRejectingBooking(booking._id); setRejectionReason(''); }} className="rounded-full bg-red-50 px-4 py-2 text-sm font-semibold text-red-700 transition-colors hover:bg-red-100">
                        <XCircle className="mr-2 inline h-4 w-4" />
                        Reject
                      </button>
                    </>
                  ) : (
                    <>
                      <div className="rounded-full bg-gray-100 px-4 py-2 text-sm font-semibold text-gray-600">
                        {booking.status === 'confirmed' ? 'Accepted' : booking.status === 'completed' ? 'Completed' : 'Closed'}
                      </div>
                      {booking.status === 'confirmed' && (
                        <>
                          <a
                            href={`https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(booking.email)}&su=${encodeURIComponent(`Regarding your ${booking.serviceType} wedding request`)}`}
                            target="_blank"
                            rel="noreferrer"
                            className="rounded-full bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-700 transition-colors hover:bg-rose-100"
                          >
                            <Mail className="mr-2 inline h-4 w-4" />
                            Open Gmail
                          </a>
                          {booking.phone && (
                            <div className="rounded-full bg-amber-50 px-4 py-2 text-sm font-semibold text-amber-700">
                              <Phone className="mr-2 inline h-4 w-4" />
                              {booking.phone}
                            </div>
                          )}
                        </>
                      )}
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );

  const renderAnalytics = () => (
    <div className="grid gap-6 xl:grid-cols-2">
      <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-bold text-gray-900">Monthly booking line graph</h2>
        <p className="mb-5 text-sm text-gray-500">Track demand and performance over time.</p>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={monthlySeries}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="label" stroke="#6B7280" />
              <YAxis stroke="#6B7280" />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="bookings" stroke="#C8A96A" strokeWidth={3} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-bold text-gray-900">Booking status pie chart</h2>
        <p className="mb-5 text-sm text-gray-500">See the mix of pending and confirmed work.</p>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={statusSeries} dataKey="value" nameKey="name" innerRadius={70} outerRadius={110} paddingAngle={4}>
                {statusSeries.map((entry, index) => (
                  <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-bold text-gray-900">Revenue bar chart</h2>
        <p className="mb-5 text-sm text-gray-500">Confirmed revenue by month.</p>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlySeries}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="label" stroke="#6B7280" />
              <YAxis stroke="#6B7280" />
              <Tooltip />
              <Bar dataKey="revenue" radius={[12, 12, 0, 0]} fill="#7C3AED" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-bold text-gray-900">Quarterly comparison analytics</h2>
        <p className="mb-5 text-sm text-gray-500">Bookings and revenue grouped by quarter.</p>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={quarterlySeries}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="label" stroke="#6B7280" />
              <YAxis stroke="#6B7280" />
              <Tooltip />
              <Legend />
              <Bar dataKey="bookings" fill="#C8A96A" radius={[10, 10, 0, 0]} />
              <Bar dataKey="revenue" fill="#10B981" radius={[10, 10, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );

  const renderServices = () => (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Service listings</h2>
          <p className="mt-1 text-sm text-gray-500">Manage your live service cards, images, and pricing.</p>
        </div>
        <button onClick={() => setShowAddForm(true)} className="inline-flex items-center rounded-full bg-gold px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-gold/90">
          <Plus className="mr-2 h-4 w-4" />
          Add new service
        </button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {vendors.map((vendor, index) => (
          <motion.div key={vendor._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }} className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-xl">
            <div className="relative h-56 overflow-hidden bg-gradient-to-br from-gold/20 to-rose-pink/20">
              {vendor.images?.[0] ? (
                <img
                  src={vendor.images[0]}
                  alt={getVendorDisplayName(vendor)}
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center">
                  <div className="text-center">
                    <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gold text-2xl font-bold text-white">
                      {vendor.businessType[0]}
                    </div>
                    <h3 className="font-playfair text-xl font-bold text-gray-900">{getVendorDisplayName(vendor)}</h3>
                    <p className="text-sm capitalize text-gray-600">{vendor.businessType}</p>
                  </div>
                </div>
              )}
            </div>
            <div className="space-y-4 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">{getVendorDisplayName(vendor)}</h3>
                  <p className="text-sm capitalize text-gray-500">{vendor.businessType}</p>
                </div>
                <div className="flex items-center rounded-full bg-gold/10 px-3 py-1 text-sm font-semibold text-gold">
                  <Star className="mr-1 h-4 w-4 fill-gold" />
                  {vendor.rating.average}
                </div>
              </div>
              <p className="line-clamp-3 text-sm text-gray-600">{vendor.description}</p>
              <div className="rounded-2xl bg-gray-50 p-4 text-sm text-gray-700">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-gold" />
                  {vendor.address.city}, {vendor.address.state}
                </div>
                <div className="mt-2 flex items-center gap-2">
                  <Phone className="h-4 w-4 text-gold" />
                  {vendor.contact.phone}
                </div>
                <div className="mt-2 flex items-center gap-2">
                  <Mail className="h-4 w-4 text-gold" />
                  {vendor.contact.email}
                </div>
              </div>
              <p className="text-lg font-bold text-gray-900">
                {formatCurrency(vendor.pricing.startingPrice)}
                <span className="ml-1 text-sm font-normal text-gray-500">/{vendor.pricing.pricingType}</span>
              </p>
              <div className="flex gap-2">
                <button onClick={() => setEditingVendor(vendor)} className="flex-1 rounded-full bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700 transition-colors hover:bg-blue-100">
                  <Edit className="mr-2 inline h-4 w-4" />
                  Edit
                </button>
                <button onClick={() => handleDelete(vendor._id)} className="flex-1 rounded-full bg-red-50 px-4 py-2 text-sm font-semibold text-red-700 transition-colors hover:bg-red-100">
                  <Trash2 className="mr-2 inline h-4 w-4" />
                  Delete
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {vendors.length === 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-3xl border border-gray-200 bg-white py-16 text-center shadow-sm">
          <div className="mx-auto mb-6 flex h-32 w-32 items-center justify-center rounded-full bg-gray-100">
            <Plus className="h-16 w-16 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900">No services listed yet</h3>
          <p className="mt-2 text-gray-600">Add your first service and start receiving bookings.</p>
        </motion.div>
      )}
    </div>
  );

  // approvedVendor unused

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-8">
        
        {actionError && <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{actionError}</div>}
        {actionSuccess && <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{actionSuccess}</div>}

        {section === 'overview' && renderOverview()}
        {section === 'bookings' && renderBookings()}
        {section === 'analytics' && renderAnalytics()}
        {section === 'services' && renderServices()}
      </div>

      {(showAddForm || editingVendor) && (
        <VendorForm
          vendor={editingVendor}
          onSubmit={handleSubmit}
          onCancel={() => {
            setShowAddForm(false);
            setEditingVendor(null);
          }}
        />
      )}

      {rejectingBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-transparent p-4">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
            <h3 className="text-xl font-bold text-gray-900">Reject booking request</h3>
            <p className="mt-2 text-sm text-gray-500">Optional reason shown to the customer.</p>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="e.g. Dates not available, capacity mismatch, etc."
              className="mt-4 w-full rounded-2xl border border-gray-300 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-gold"
              rows={4}
            />
            <div className="mt-5 flex gap-3">
              <button
                onClick={() => {
                  setRejectingBooking(null);
                  setRejectionReason('');
                }}
                className="flex-1 rounded-full border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (rejectingBooking) {
                    updateBookingStatus(rejectingBooking, 'rejected', rejectionReason);
                    setRejectingBooking(null);
                    setRejectionReason('');
                  }
                }}
                className="flex-1 rounded-full bg-red-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-red-700"
              >
                Confirm rejection
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}

interface VendorFormProps {
  vendor: Vendor | null;
  onSubmit: (data: any) => void;
  onCancel: () => void;
}

function VendorForm({ vendor, onSubmit, onCancel }: VendorFormProps) {
  const [formError, setFormError] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [formData, setFormData] = useState({
    businessName: vendor?.businessName || '',
    businessType: vendor?.businessType || 'venue',
    description: vendor?.description || '',
    address: {
      street: vendor?.address?.street || '',
      city: vendor?.address?.city || '',
      state: vendor?.address?.state || '',
      zipCode: vendor?.address?.zipCode || '',
    },
    contact: {
      phone: vendor?.contact?.phone || '',
      email: vendor?.contact?.email || '',
      website: vendor?.contact?.website || '',
    },
    pricing: {
      startingPrice: vendor?.pricing?.startingPrice || 0,
      pricingType: vendor?.pricing?.pricingType || 'per day',
    },
    services: vendor?.services?.join(', ') || '',
    images: vendor?.images?.join(', ') || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const startingPrice = Number(formData.pricing.startingPrice);
    if (!Number.isFinite(startingPrice) || startingPrice <= 0) {
      setFormError('Starting price must be a valid positive number.');
      return;
    }

    const imageEntries = formData.images
      .split(',')
      .map((value) => value.trim())
      .filter(Boolean);

    if (imageEntries.length === 0 && selectedFiles.length === 0) {
      setFormError('Please provide at least one image URL or upload image files.');
      return;
    }

    setFormError('');
    onSubmit({
      ...formData,
      pricing: {
        ...formData.pricing,
        startingPrice,
      },
      services: formData.services.split(',').map((value) => value.trim()).filter(Boolean),
      images: imageEntries,
      imageFiles: selectedFiles,
    });
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 p-4 md:p-6">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="vendor-service-modal mx-auto my-6 w-full max-w-2xl rounded-3xl bg-white shadow-2xl">
        <div className="sticky top-0 z-10 flex items-center justify-between gap-4 border-b border-gray-200 bg-white px-6 py-5">
          <h2 className="text-2xl font-bold text-gray-900">{vendor ? 'Edit service' : 'Add new service'}</h2>
          <button type="button" onClick={onCancel} className="rounded-full border border-gold px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-gold transition-colors hover:bg-gold hover:text-[#0d1a0e]">
            Close
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4 px-6 py-6">
          {formError && <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{formError}</div>}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">Business Name</label>
            <input type="text" required value={formData.businessName} onChange={(e) => setFormData({ ...formData, businessName: e.target.value })} className="w-full rounded-2xl border border-gray-300 px-4 py-3 outline-none focus:ring-2 focus:ring-gold" />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">Service Type</label>
            <select value={formData.businessType} onChange={(e) => setFormData({ ...formData, businessType: e.target.value })} className="w-full rounded-2xl border border-gray-300 px-4 py-3 outline-none focus:ring-2 focus:ring-gold">
              <option value="venue">Venue</option>
              <option value="catering">Catering</option>
              <option value="photography">Photography</option>
              <option value="music">Music & DJ</option>
              <option value="decoration">Decoration</option>
              <option value="dj">DJ</option>
            </select>
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">Description</label>
            <textarea required rows={3} value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="w-full rounded-2xl border border-gray-300 px-4 py-3 outline-none focus:ring-2 focus:ring-gold" />
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">City</label>
              <input type="text" required value={formData.address.city} onChange={(e) => setFormData({ ...formData, address: { ...formData.address, city: e.target.value } })} className="w-full rounded-2xl border border-gray-300 px-4 py-3 outline-none focus:ring-2 focus:ring-gold" />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">State</label>
              <input type="text" required value={formData.address.state} onChange={(e) => setFormData({ ...formData, address: { ...formData.address, state: e.target.value } })} className="w-full rounded-2xl border border-gray-300 px-4 py-3 outline-none focus:ring-2 focus:ring-gold" />
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">Phone</label>
              <input type="tel" required value={formData.contact.phone} onChange={(e) => setFormData({ ...formData, contact: { ...formData.contact, phone: e.target.value } })} className="w-full rounded-2xl border border-gray-300 px-4 py-3 outline-none focus:ring-2 focus:ring-gold" />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">Email</label>
              <input type="email" required value={formData.contact.email} onChange={(e) => setFormData({ ...formData, contact: { ...formData.contact, email: e.target.value } })} className="w-full rounded-2xl border border-gray-300 px-4 py-3 outline-none focus:ring-2 focus:ring-gold" />
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">Starting Price (₹)</label>
              <input type="number" required value={formData.pricing.startingPrice || ''} onChange={(e) => setFormData({ ...formData, pricing: { ...formData.pricing, startingPrice: parseInt(e.target.value, 10) || 0 } })} placeholder="0" className="w-full rounded-2xl border border-gray-300 px-4 py-3 outline-none focus:ring-2 focus:ring-gold" />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">Pricing Type</label>
              <select value={formData.pricing.pricingType} onChange={(e) => setFormData({ ...formData, pricing: { ...formData.pricing, pricingType: e.target.value } })} className="w-full rounded-2xl border border-gray-300 px-4 py-3 outline-none focus:ring-2 focus:ring-gold">
                <option value="per day">Per Day</option>
                <option value="per plate">Per Plate</option>
                <option value="package">Package</option>
                <option value="per event">Per Event</option>
              </select>
            </div>
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">Services (comma-separated)</label>
            <input type="text" value={formData.services} onChange={(e) => setFormData({ ...formData, services: e.target.value })} placeholder="Wedding Photography, Pre-wedding shoot, Video Editing" className="w-full rounded-2xl border border-gray-300 px-4 py-3 outline-none focus:ring-2 focus:ring-gold" />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">Images (comma-separated URLs)</label>
            <input type="text" value={formData.images} onChange={(e) => setFormData({ ...formData, images: e.target.value })} placeholder="https://example.com/image1.jpg, https://example.com/image2.jpg" className="w-full rounded-2xl border border-gray-300 px-4 py-3 outline-none focus:ring-2 focus:ring-gold" />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">Upload Images</label>
            <input type="file" multiple accept="image/*" onChange={(e) => setSelectedFiles(Array.from(e.target.files || []))} className="w-full rounded-2xl border border-gray-300 px-4 py-3 outline-none focus:ring-2 focus:ring-gold" />
            {selectedFiles.length > 0 && <p className="mt-2 text-xs text-gray-600">{selectedFiles.length} image file(s) selected.</p>}
          </div>
          <div className="flex gap-4 pt-2">
            <button type="submit" className="flex-1 rounded-full bg-gold px-6 py-3 font-medium text-white transition-colors hover:bg-gold/90">{vendor ? 'Update service' : 'Add service'}</button>
            <button type="button" onClick={onCancel} className="flex-1 rounded-full bg-gray-200 px-6 py-3 font-medium text-gray-800 transition-colors hover:bg-gray-300">Cancel</button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

