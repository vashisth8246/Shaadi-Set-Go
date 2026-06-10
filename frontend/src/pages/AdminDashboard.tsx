import { useEffect, useMemo, useState } from 'react';
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
  CalendarDays,
  CheckCircle2,
  Clock3,
  DollarSign,
  Sparkles,
  TrendingUp,
  Users,
} from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';
import { normalizeCityName } from '../utils/normalization';

interface DashboardStats {
  totalUsers: number;
  vendorUsers?: number;
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
  createdAt?: string;
  userId: {
    fullName: string;
    email: string;
  };
  vendorId: {
    businessName: string;
    businessType: string;
  };
}

interface User {
  _id: string;
  fullName: string;
  email: string;
  role: string;
  createdAt: string;
}

type UsersRow = {
  _id: string;
  fullName: string;
  email: string;
  roleLabel: 'customer' | 'vendor';
  createdAt: string;
  source: 'user' | 'vendor';
  vendorSource?: 'database' | 'json';
};

interface Vendor {
  _id: string;
  businessName: string;
  businessType: string;
  source?: 'database' | 'json';
  description?: string;
  address?: {
    city?: string;
    state?: string;
  };
  location?: string;
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

type AdminSection = 'overview' | 'users' | 'bookings' | 'approvals' | 'reports';

const COLORS = ['#C8A96A', '#7C3AED', '#0EA5E9', '#10B981', '#F59E0B', '#EF4444'];

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(value || 0);

const formatDate = (value?: string) => (value ? new Date(value).toLocaleDateString() : 'N/A');

const getBookingDate = (booking: Booking) => new Date(booking.createdAt || booking.weddingDate || Date.now());

const monthLabel = (date: Date) => date.toLocaleString('en-US', { month: 'short' });

const extractCityFromDescription = (description = '') => {
  const match = description.match(/\bin\s+([A-Za-z\s]+?)(?:\.|,|$)/i);
  return match?.[1] ? normalizeCityName(match[1]) : '';
};

const getVendorCityLabel = (vendor: Vendor) =>
  normalizeCityName(vendor.address?.city || '') ||
  normalizeCityName(vendor.location?.split(',')[0] || '') ||
  extractCityFromDescription(vendor.description || '') ||
  'N/A';

const sectionFromPath = (pathname: string): AdminSection => {
  if (pathname.includes('/users')) return 'users';
  if (pathname.includes('/vendors') && !pathname.includes('/approvals')) return 'approvals';
  if (pathname.includes('/bookings')) return 'bookings';
  if (pathname.includes('/approvals')) return 'approvals';
  if (pathname.includes('/reports')) return 'reports';
  return 'overview';
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

export default function AdminDashboard() {
  const location = useLocation();
  const section = sectionFromPath(location.pathname);

  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [vendorFilter, setVendorFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [userFilter, setUserFilter] = useState<'all' | 'customer' | 'vendor'>('all');
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [bookingNotes, setBookingNotes] = useState<Record<string, string>>({});
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAddVendor, setShowAddVendor] = useState(false);
  const [addVendorForm, setAddVendorForm] = useState({ businessName: '', businessType: 'catering', city: '', state: '', phone: '', email: '', startingPrice: '', pricingType: 'Per Event', services: '', description: '' });
  const [addVendorError, setAddVendorError] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      const [statsRes, bookingsRes, usersRes, vendorsRes] = await Promise.all([
        axios.get('/api/admin/dashboard', { headers }),
        axios.get('/api/bookings', { headers }),
        axios.get('/api/admin/users', { headers }),
        axios.get('/api/admin/vendors', { headers }),
      ]);

      setStats(statsRes.data.stats);
      setBookings(bookingsRes.data);
      setUsers(usersRes.data);
      setVendors(vendorsRes.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateVendorApproval = async (vendorId: string, status: 'approved' | 'rejected') => {
    if (status === 'rejected' && !window.confirm('Reject this vendor request? The request will be deleted.')) return;

    try {
      const token = localStorage.getItem('token');
      await axios.patch(
        `/api/vendors/admin/${vendorId}/approval`,
        {
          status,
          message:
            status === 'approved'
              ? 'Your profile has been approved and is now visible to customers.'
              : 'Your profile request was rejected and removed by admin.',
          rejectionReason: status === 'rejected' ? 'Rejected by admin.' : undefined,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchDashboardData();
    } catch (error) {
      console.error('Error updating vendor approval:', error);
    }
  };

  // updateUserRole removed: not used in current UI

  const deleteUser = async (userId: string) => {
    if (!window.confirm('Delete this user and their related bookings?')) return;

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`/api/admin/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchDashboardData();
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  };

  const deleteVendor = async (vendorId: string) => {
    if (!window.confirm('Delete this vendor listing?')) return;

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`/api/admin/vendors/${vendorId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchDashboardData();
    } catch (error) {
      console.error('Error deleting vendor:', error);
    }
  };

  const handleAddVendor = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddVendorError('');
    if (!addVendorForm.businessName || !addVendorForm.city || !addVendorForm.email) {
      setAddVendorError('Business name, city and email are required.');
      return;
    }
    try {
      const token = localStorage.getItem('token');
      await axios.post('/api/admin/vendors', {
        businessName: addVendorForm.businessName,
        businessType: addVendorForm.businessType,
        description: addVendorForm.description,
        address: { city: addVendorForm.city, state: addVendorForm.state, street: '', zipCode: '', country: 'India' },
        contact: { phone: addVendorForm.phone, email: addVendorForm.email, website: '' },
        pricing: { startingPrice: Number(addVendorForm.startingPrice) || 0, pricingType: addVendorForm.pricingType },
        services: addVendorForm.services.split(',').map((s) => s.trim()).filter(Boolean),
        images: [],
      }, { headers: { Authorization: `Bearer ${token}` } });
      setShowAddVendor(false);
      setAddVendorForm({ businessName: '', businessType: 'catering', city: '', state: '', phone: '', email: '', startingPrice: '', pricingType: 'Per Event', services: '', description: '' });
      fetchDashboardData();
    } catch (err: any) {
      setAddVendorError(err.response?.data?.message || 'Failed to add vendor.');
    }
  };

  const bookingTotals = useMemo(() => {
    const now = new Date();
    const currentMonth = bookings.filter((booking) => {
      const date = getBookingDate(booking);
      return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
    }).length;
    const previousMonth = bookings.filter((booking) => {
      const date = getBookingDate(booking);
      const previous = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      return date.getMonth() === previous.getMonth() && date.getFullYear() === previous.getFullYear();
    }).length;

    const growth = previousMonth === 0 ? currentMonth * 100 : ((currentMonth - previousMonth) / previousMonth) * 100;

    return { currentMonth, previousMonth, growth: Number.isFinite(growth) ? growth : 0 };
  }, [bookings]);

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

  const categorySeries = useMemo(() => {
    const totals = bookings.reduce<Record<string, number>>((acc, booking) => {
      const key = (booking.serviceType || 'other').toLowerCase();
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(totals).map(([name, value]) => ({ name, value }));
  }, [bookings]);

  const statusSeries = useMemo(() => {
    const statuses = bookings.reduce<Record<string, number>>((acc, booking) => {
      const key = booking.status || 'pending';
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(statuses).map(([name, value]) => ({ name, value }));
  }, [bookings]);

  const vendorPerformance = useMemo(() => {
    const counts = bookings.reduce<Record<string, { name: string; bookings: number; revenue: number }>>((acc, booking) => {
      const name = booking.vendorId?.businessName || 'Unknown vendor';
      acc[name] = acc[name] || { name, bookings: 0, revenue: 0 };
      acc[name].bookings += 1;
      acc[name].revenue += booking.status === 'confirmed' || booking.status === 'completed' ? booking.totalAmount || 0 : 0;
      return acc;
    }, {});

    return Object.values(counts)
      .sort((left, right) => right.bookings - left.bookings)
      .slice(0, 6);
  }, [bookings]);

  const userSplitSeries = useMemo(() => {
    const customers = users.filter((user) => user.role === 'user' || user.role === 'customer').length;
    const vendorUsers = stats?.vendorUsers ?? users.filter((user) => user.role === 'vendor').length;

    return [
      { name: 'Customers', value: customers },
      { name: 'Vendors', value: vendorUsers }
    ];
  }, [stats?.vendorUsers, users]);

  const userActivitySeries = useMemo(() => {
    const labels = Array.from({ length: 6 }, (_, index) => {
      const date = new Date();
      date.setMonth(date.getMonth() - (5 - index));
      return {
        key: `${date.getFullYear()}-${date.getMonth()}`,
        label: monthLabel(date),
        users: 0,
        bookings: 0,
      };
    });

    users.forEach((user) => {
      const date = new Date(user.createdAt || Date.now());
      const bucket = labels.find((entry) => entry.key === `${date.getFullYear()}-${date.getMonth()}`);
      if (bucket) {
        bucket.users += 1;
      }
    });

    bookings.forEach((booking) => {
      const date = getBookingDate(booking);
      const bucket = labels.find((entry) => entry.key === `${date.getFullYear()}-${date.getMonth()}`);
      if (bucket) {
        bucket.bookings += 1;
      }
    });

    return labels;
  }, [bookings, users]);

  const pendingApprovals = vendors.filter((vendor) => vendor.approval?.status === 'pending' || vendor.approval?.status === 'rejected');
  // const approvedVendors = vendors.filter((vendor) => !vendor.approval?.status || vendor.approval.status === 'approved');

  const combinedUsers = useMemo<UsersRow[]>(() => {
    const customerRows = users
      .filter((user) => user.role === 'user' || user.role === 'customer')
      .map((user) => ({
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        roleLabel: 'customer' as const,
        createdAt: user.createdAt,
        source: 'user' as const,
      }));

    const vendorRows = vendors
      .filter((vendor) => vendor.approval?.status === 'approved')
      .map((vendor) => ({
        _id: vendor._id,
        fullName: vendor.businessName,
        email: vendor.contact?.email || 'N/A',
        roleLabel: 'vendor' as const,
        createdAt: vendor.createdAt,
        source: 'vendor' as const,
        vendorSource: vendor.source,
      }));

    return [...customerRows, ...vendorRows];
  }, [users, vendors]);

  const filteredUsers = useMemo(() => {
    if (userFilter === 'customer') return combinedUsers.filter((row) => row.roleLabel === 'customer');
    if (userFilter === 'vendor') return combinedUsers.filter((row) => row.roleLabel === 'vendor');
    return combinedUsers;
  }, [combinedUsers, userFilter]);

  const totalRevenue = stats?.totalRevenue ?? bookings.reduce((sum, booking) => sum + (booking.status === 'confirmed' || booking.status === 'completed' ? booking.totalAmount || 0 : 0), 0);
  const totalUsers = stats?.totalUsers ?? combinedUsers.length;
  const totalVendors = stats?.totalVendors ?? vendors.length;
  const totalBookings = stats?.totalBookings ?? bookings.length;

  // heroActions removed: unused in current layout

  if (loading) {
    return <LoadingSpinner label="Loading dashboard..." subtitle="Preparing admin data" />;
  }

  const renderOverview = () => (
    <>
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-6">
        <div className="xl:col-span-1"><StatCard label="Total bookings" value={String(totalBookings)} icon={CalendarDays} hint="All confirmed and pending requests" /></div>
        <div className="xl:col-span-1"><StatCard label="Revenue" value={formatCurrency(totalRevenue)} icon={DollarSign} hint="Confirmed booking revenue" /></div>
        <div className="xl:col-span-1"><StatCard label="Vendors" value={String(totalVendors)} icon={BadgeCheck} hint="Total vendor listings" /></div>
        <div className="xl:col-span-1"><StatCard label="Users" value={String(totalUsers)} icon={Users} hint="Registered customers" /></div>
        <div className="xl:col-span-1"><StatCard label="Pending approvals" value={String(pendingApprovals.length)} icon={Clock3} hint="Waiting for admin action" /></div>
        <div className="xl:col-span-1"><StatCard label="Monthly growth" value={`${bookingTotals.growth > 0 ? '+' : ''}${bookingTotals.growth.toFixed(1)}%`} icon={TrendingUp} hint="Bookings vs previous month" /></div>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Monthly bookings</h2>
              <p className="text-sm text-gray-500">Six-month booking trend</p>
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
              <h2 className="text-xl font-bold text-gray-900">Revenue trends</h2>
              <p className="text-sm text-gray-500">Revenue from confirmed bookings</p>
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
              <p className="text-sm text-gray-500">Pending, confirmed, and completed mix</p>
            </div>
            <CheckCircle2 className="h-5 w-5 text-gold" />
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={statusSeries} dataKey="value" nameKey="name" innerRadius={70} outerRadius={110} paddingAngle={4}>
                  {statusSeries.map((entry) => (
                    <Cell key={entry.name} fill={COLORS[statusSeries.indexOf(entry) % COLORS.length]} />
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
              <h2 className="text-xl font-bold text-gray-900">Vendor performance</h2>
              <p className="text-sm text-gray-500">Top vendors by booking volume</p>
            </div>
            <Users className="h-5 w-5 text-gold" />
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={vendorPerformance} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis type="number" stroke="#6B7280" />
                <YAxis type="category" dataKey="name" width={130} stroke="#6B7280" />
                <Tooltip />
                <Bar dataKey="bookings" radius={[0, 12, 12, 0]} fill="#10B981" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900">User mix</h2>
              <p className="text-sm text-gray-500">Registered customers versus vendors</p>
            </div>
            <Users className="h-5 w-5 text-gold" />
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={userSplitSeries} dataKey="value" nameKey="name" innerRadius={70} outerRadius={110} paddingAngle={4}>
                  {userSplitSeries.map((entry, index) => (
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
              <h2 className="text-xl font-bold text-gray-900">User activity</h2>
              <p className="text-sm text-gray-500">New accounts and bookings over the last six months</p>
            </div>
            <TrendingUp className="h-5 w-5 text-gold" />
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={userActivitySeries}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="label" stroke="#6B7280" />
                <YAxis stroke="#6B7280" />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="users" stroke="#0EA5E9" strokeWidth={3} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="bookings" stroke="#C8A96A" strokeWidth={3} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold text-gray-900">Quarterly comparison</h2>
          <p className="mb-5 text-sm text-gray-500">Bookings and revenue by quarter</p>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={quarterlySeries}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="label" stroke="#6B7280" />
                <YAxis stroke="#6B7280" />
                <Tooltip />
                <Legend />
                <Bar dataKey="bookings" fill="#C8A96A" radius={[10, 10, 0, 0]} />
                <Bar dataKey="revenue" fill="#7C3AED" radius={[10, 10, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold text-gray-900">Category statistics</h2>
          <p className="mb-5 text-sm text-gray-500">Bookings by service type</p>
          <div className="space-y-4">
            {categorySeries.length === 0 ? (
              <p className="text-sm text-gray-500">No booking data available yet.</p>
            ) : (
              categorySeries.map((entry, index) => (
                <div key={entry.name}>
                  <div className="mb-2 flex items-center justify-between text-sm">
                    <span className="font-medium capitalize text-gray-700">{entry.name}</span>
                    <span className="text-gray-500">{entry.value} bookings</span>
                  </div>
                  <div className="h-2 rounded-full bg-gray-100">
                    <div
                      className="h-2 rounded-full"
                      style={{
                        width: `${Math.max((entry.value / Math.max(...categorySeries.map((item) => item.value))) * 100, 8)}%`,
                        backgroundColor: COLORS[index % COLORS.length],
                      }}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="rounded-3xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-200 px-6 py-5">
          <h2 className="text-xl font-bold text-gray-900">Recent bookings</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50 text-left text-xs uppercase tracking-[0.2em] text-gray-500">
              <tr>
                <th className="px-6 py-3">Customer</th>
                <th className="px-6 py-3">Service</th>
                <th className="px-6 py-3">Vendor</th>
                <th className="px-6 py-3">Date</th>
                <th className="px-6 py-3">Amount</th>
                <th className="px-6 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {bookings.slice(0, 10).map((booking) => (
                <tr key={booking._id} className="transition-colors hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900">{booking.fullName}</div>
                    <div className="text-sm text-gray-500">{booking.email}</div>
                  </td>
                  <td className="px-6 py-4 capitalize text-gray-700">{booking.serviceType}</td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900">{booking.vendorId?.businessName}</div>
                    <div className="text-sm text-gray-500 capitalize">{booking.vendorId?.businessType}</div>
                  </td>
                  <td className="px-6 py-4 text-gray-700">{formatDate(booking.weddingDate)}</td>
                  <td className="px-6 py-4 text-gray-700">{formatCurrency(booking.totalAmount || 0)}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold capitalize ${booking.status === 'confirmed' ? 'bg-green-100 text-green-700' : booking.status === 'rejected' || booking.status === 'cancelled' ? 'bg-red-100 text-red-700' : booking.status === 'completed' ? 'bg-blue-100 text-blue-700' : 'bg-yellow-100 text-yellow-700'}`}
                    >
                      {booking.status}
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

  const renderUsers = () => (
    <div className="rounded-3xl border border-gray-200 bg-white shadow-sm">
      <div className="flex flex-col gap-4 border-b border-gray-200 px-6 py-5 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">User management</h2>
          <p className="mt-1 text-sm text-gray-500">Browse all customers and approved vendors, then remove customer accounts without touching the API contract.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {(['all', 'customer', 'vendor'] as const).map((filter) => (
            <button
              key={filter}
              onClick={() => setUserFilter(filter)}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${userFilter === filter ? 'bg-gold text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            >
              {filter === 'all' ? 'All users' : filter === 'customer' ? 'Customers' : 'Approved vendors'}
            </button>
          ))}
        </div>
      </div>
      <div className="px-6 pt-4 text-sm text-gray-500">Showing {filteredUsers.length} {userFilter === 'all' ? 'records' : userFilter === 'customer' ? 'customers' : 'approved vendors'}</div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50 text-left text-xs uppercase tracking-[0.2em] text-gray-500">
            <tr>
              <th className="px-6 py-3">Name</th>
              <th className="px-6 py-3">Email</th>
              <th className="px-6 py-3">Role</th>
              <th className="px-6 py-3">Joined</th>
              <th className="px-6 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white">
            {filteredUsers.map((user) => (
              <tr key={user._id} className="hover:bg-gray-50">
                <td className="px-6 py-4 font-medium text-gray-900">{user.fullName}</td>
                <td className="px-6 py-4 text-gray-700">{user.email}</td>
                <td className="px-6 py-4">
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${user.roleLabel === 'vendor' ? 'bg-blue-100 text-blue-700' : 'bg-emerald-100 text-emerald-700'}`}>
                    {user.roleLabel}
                  </span>
                </td>
                <td className="px-6 py-4 text-gray-700">{formatDate(user.createdAt)}</td>
                <td className="px-6 py-4">
                  <div className="flex flex-wrap gap-2">
                        {/* Role changes removed per admin UX request; roles are displayed only */}
                    {user.source === 'user' ? (
                      <button onClick={() => deleteUser(user._id)} className="rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-red-700 transition-colors hover:bg-red-100">
                        Delete
                      </button>
                    ) : user.vendorSource === 'database' ? (
                      <button onClick={() => deleteVendor(user._id)} className="rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-red-700 transition-colors hover:bg-red-100">
                        Delete vendor
                      </button>
                    ) : (
                      <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-500">Imported</span>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderVendors = () => {
    const filtered = vendors.filter((v) => {
      const status = v.approval?.status || 'approved';
      if (vendorFilter === 'all') return true;
      return status === vendorFilter;
    });

    return (
      <div className="rounded-3xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-200 px-6 py-5 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Vendors & Approvals</h2>
            <p className="mt-1 text-sm text-gray-500">Combined view for pending, approved, and rejected vendor submissions.</p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <button onClick={() => setShowAddVendor(true)} className="px-4 py-2 rounded-full text-sm font-medium bg-gold text-white hover:bg-gold/90 transition">
              + Add Vendor
            </button>
            {(['all', 'pending', 'approved', 'rejected'] as const).map((f) => (
              <button key={f} onClick={() => setVendorFilter(f)} className={`px-4 py-2 rounded-full text-sm font-medium transition ${vendorFilter === f ? 'bg-gold text-white' : 'bg-gray-50 text-gray-700 hover:bg-gray-100'}`}>
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50 text-left text-xs uppercase tracking-[0.2em] text-gray-500">
              <tr>
                <th className="px-6 py-3">Business</th>
                <th className="px-6 py-3">Type</th>
                <th className="px-6 py-3">City</th>
                <th className="px-6 py-3">Starting Price</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {filtered.map((vendor) => (
                <tr key={vendor._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900">{vendor.businessName}</div>
                    <div className="text-xs text-gray-500">{vendor.source === 'json' ? 'Imported from real JSON data' : 'Added from dashboard'}</div>
                  </td>
                  <td className="px-6 py-4 text-gray-700 capitalize">{vendor.businessType}</td>
                  <td className="px-6 py-4 text-gray-700">{getVendorCityLabel(vendor)}</td>
                  <td className="px-6 py-4 text-gray-700">{formatCurrency(vendor.pricing?.startingPrice || 0)}</td>
                  <td className="px-6 py-4">
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${vendor.approval?.status === 'approved' ? 'bg-emerald-100 text-emerald-700' : vendor.approval?.status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>
                      {vendor.approval?.status || 'approved'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-2">
                      <button onClick={() => setSelectedVendor(vendor)} className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-200">View</button>
                      {vendor.source !== 'json' && vendor.approval?.status !== 'approved' && (
                        <button onClick={() => updateVendorApproval(vendor._id, 'approved')} className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 transition-colors hover:bg-emerald-100">Approve</button>
                      )}
                      {vendor.source !== 'json' && vendor.approval?.status !== 'approved' && vendor.approval?.status !== 'rejected' && (
                        <button onClick={() => updateVendorApproval(vendor._id, 'rejected')} className="rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-red-700 transition-colors hover:bg-red-100">Reject</button>
                      )}
                      {vendor.source !== 'json' && (
                        <button onClick={() => deleteVendor(vendor._id)} className="rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-red-700 transition-colors hover:bg-red-100">Delete</button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderBookings = () => (
    <div className="rounded-3xl border border-gray-200 bg-white shadow-sm">
      <div className="border-b border-gray-200 px-6 py-5">
        <h2 className="text-xl font-bold text-gray-900">Booking management</h2>
        <p className="mt-1 text-sm text-gray-500">Track every request from submission to completion.</p>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50 text-left text-xs uppercase tracking-[0.2em] text-gray-500">
            <tr>
              <th className="px-6 py-3">Customer</th>
              <th className="px-6 py-3">Service</th>
              <th className="px-6 py-3">Vendor</th>
              <th className="px-6 py-3">Wedding Date</th>
              <th className="px-6 py-3">Amount</th>
              <th className="px-6 py-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white">
            {bookings.map((booking) => (
              <tr key={booking._id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="font-medium text-gray-900">{booking.fullName}</div>
                  <div className="text-sm text-gray-500">{booking.email}</div>
                </td>
                <td className="px-6 py-4 capitalize text-gray-700">{booking.serviceType}</td>
                <td className="px-6 py-4 text-gray-700">{booking.vendorId?.businessName}</td>
                <td className="px-6 py-4 text-gray-700">{formatDate(booking.weddingDate)}</td>
                <td className="px-6 py-4 text-gray-700">{formatCurrency(booking.totalAmount || 0)}</td>
                <td className="px-6 py-4">
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${booking.status === 'confirmed' ? 'bg-emerald-100 text-emerald-700' : booking.status === 'completed' ? 'bg-blue-100 text-blue-700' : booking.status === 'rejected' || booking.status === 'cancelled' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>
                    {booking.status}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex gap-2">
                    <button onClick={() => setSelectedBooking(booking)} className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-200">View</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderReports = () => (
    <div className="grid gap-6 xl:grid-cols-2">
      <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-bold text-gray-900">Quarterly comparison</h2>
        <p className="mb-5 text-sm text-gray-500">Bookings and revenue by quarter.</p>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={quarterlySeries}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="label" stroke="#6B7280" />
              <YAxis stroke="#6B7280" />
              <Tooltip />
              <Legend />
              <Bar dataKey="bookings" fill="#C8A96A" radius={[10, 10, 0, 0]} />
              <Bar dataKey="revenue" fill="#7C3AED" radius={[10, 10, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-bold text-gray-900">Category breakdown</h2>
        <p className="mb-5 text-sm text-gray-500">Service distribution across the marketplace.</p>
        <div className="space-y-4">
          {categorySeries.length === 0 ? (
            <p className="text-sm text-gray-500">No category analytics available yet.</p>
          ) : (
            categorySeries.map((entry, index) => (
              <div key={entry.name}>
                <div className="mb-2 flex items-center justify-between text-sm">
                  <span className="font-medium capitalize text-gray-700">{entry.name}</span>
                  <span className="text-gray-500">{entry.value}</span>
                </div>
                <div className="h-2 rounded-full bg-gray-100">
                  <div
                    className="h-2 rounded-full"
                    style={{
                      width: `${Math.max((entry.value / Math.max(...categorySeries.map((item) => item.value))) * 100, 8)}%`,
                      backgroundColor: COLORS[index % COLORS.length],
                    }}
                  />
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );

  const selectedVendorStatus = selectedVendor?.approval?.status || 'pending';

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-8">
        
        {section === 'overview' && renderOverview()}
        {section === 'users' && renderUsers()}
        {section === 'bookings' && renderBookings()}
        {section === 'approvals' && renderVendors()}
        {section === 'reports' && renderReports()}
      </div>

      {showAddVendor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={() => setShowAddVendor(false)}>
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-900">Add New Vendor</h3>
              <button onClick={() => setShowAddVendor(false)} className="rounded-full bg-gray-100 px-3 py-1 text-sm font-medium text-gray-700 hover:bg-gray-200">Close</button>
            </div>
            {addVendorError && <p className="mb-3 rounded-xl bg-red-50 px-4 py-2 text-sm text-red-700">{addVendorError}</p>}
            <form onSubmit={handleAddVendor} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2"><label className="block text-xs font-medium text-gray-600 mb-1">Business Name *</label><input required className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-gold" value={addVendorForm.businessName} onChange={(e) => setAddVendorForm({...addVendorForm, businessName: e.target.value})} /></div>
                <div><label className="block text-xs font-medium text-gray-600 mb-1">Type</label><select className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-gold" value={addVendorForm.businessType} onChange={(e) => setAddVendorForm({...addVendorForm, businessType: e.target.value})}><option value="catering">Catering</option><option value="photography">Photography</option><option value="venue">Venue</option><option value="music">Music</option><option value="decoration">Decoration</option><option value="dj">DJ</option></select></div>
                <div><label className="block text-xs font-medium text-gray-600 mb-1">City *</label><input required className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-gold" value={addVendorForm.city} onChange={(e) => setAddVendorForm({...addVendorForm, city: e.target.value})} /></div>
                <div><label className="block text-xs font-medium text-gray-600 mb-1">State</label><input className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-gold" value={addVendorForm.state} onChange={(e) => setAddVendorForm({...addVendorForm, state: e.target.value})} /></div>
                <div><label className="block text-xs font-medium text-gray-600 mb-1">Email *</label><input required type="email" className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-gold" value={addVendorForm.email} onChange={(e) => setAddVendorForm({...addVendorForm, email: e.target.value})} /></div>
                <div><label className="block text-xs font-medium text-gray-600 mb-1">Phone</label><input className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-gold" value={addVendorForm.phone} onChange={(e) => setAddVendorForm({...addVendorForm, phone: e.target.value})} /></div>
                <div><label className="block text-xs font-medium text-gray-600 mb-1">Starting Price (₹)</label><input type="number" className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-gold" value={addVendorForm.startingPrice} onChange={(e) => setAddVendorForm({...addVendorForm, startingPrice: e.target.value})} /></div>
                <div><label className="block text-xs font-medium text-gray-600 mb-1">Pricing Type</label><select className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-gold" value={addVendorForm.pricingType} onChange={(e) => setAddVendorForm({...addVendorForm, pricingType: e.target.value})}><option>Per Event</option><option>Per Day</option><option>Per Plate</option><option>Package</option></select></div>
                <div className="col-span-2"><label className="block text-xs font-medium text-gray-600 mb-1">Services (comma-separated)</label><input className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-gold" value={addVendorForm.services} onChange={(e) => setAddVendorForm({...addVendorForm, services: e.target.value})} /></div>
                <div className="col-span-2"><label className="block text-xs font-medium text-gray-600 mb-1">Description</label><textarea rows={2} className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-gold" value={addVendorForm.description} onChange={(e) => setAddVendorForm({...addVendorForm, description: e.target.value})} /></div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowAddVendor(false)} className="flex-1 rounded-full border border-gray-300 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50">Cancel</button>
                <button type="submit" className="flex-1 rounded-full bg-gold py-2 text-sm font-semibold text-white hover:bg-gold/90">Add Vendor</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {selectedVendor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={() => setSelectedVendor(null)}>
          <div className="max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <h3 className="text-2xl font-bold text-gray-900">Vendor details</h3>
                <p className="text-sm text-gray-500 capitalize">{selectedVendor.businessType}</p>
              </div>
              <button onClick={() => setSelectedVendor(null)} className="rounded-full bg-gray-100 px-3 py-1 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200">
                Close
              </button>
            </div>
            <div className="grid gap-4 text-sm text-gray-700 sm:grid-cols-2">
              <p><span className="font-semibold">Business:</span> {selectedVendor.businessName}</p>
              <p><span className="font-semibold">Status:</span> {selectedVendorStatus}</p>
              <p><span className="font-semibold">City:</span> {getVendorCityLabel(selectedVendor)}</p>
              <p><span className="font-semibold">State:</span> {selectedVendor.address?.state || 'N/A'}</p>
              <p><span className="font-semibold">Email:</span> {selectedVendor.contact?.email || 'N/A'}</p>
              <p><span className="font-semibold">Phone:</span> {selectedVendor.contact?.phone || 'N/A'}</p>
              <p className="sm:col-span-2"><span className="font-semibold">Description:</span> {selectedVendor.description || 'N/A'}</p>
              <p className="sm:col-span-2"><span className="font-semibold">Services:</span> {(selectedVendor.services || []).join(', ') || 'N/A'}</p>
            </div>
          </div>
        </div>
      )}

      {selectedBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={() => setSelectedBooking(null)}>
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <h3 className="text-2xl font-bold text-gray-900">Booking details</h3>
                <p className="text-sm text-gray-500">Review request and leave internal notes.</p>
              </div>
              <button onClick={() => setSelectedBooking(null)} className="rounded-full bg-gray-100 px-3 py-1 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200">Close</button>
            </div>
            <div className="grid gap-4 text-sm text-gray-700 sm:grid-cols-2">
              <p><span className="font-semibold">Customer:</span> {selectedBooking.fullName} ({selectedBooking.email})</p>
              <p><span className="font-semibold">Vendor:</span> {selectedBooking.vendorId?.businessName || 'N/A'}</p>
              <p><span className="font-semibold">Service:</span> {selectedBooking.serviceType}</p>
              <p><span className="font-semibold">Wedding Date:</span> {formatDate(selectedBooking.weddingDate)}</p>
              <p className="sm:col-span-2"><span className="font-semibold">Amount:</span> {formatCurrency(selectedBooking.totalAmount || 0)}</p>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700">Internal notes</label>
                <textarea value={bookingNotes[selectedBooking._id] || ''} onChange={(e) => setBookingNotes(prev => ({ ...prev, [selectedBooking._id]: e.target.value }))} className="w-full mt-2 rounded-2xl border border-gray-300 px-4 py-3 outline-none focus:ring-2 focus:ring-gold" rows={4} />
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button onClick={() => setSelectedBooking(null)} className="rounded-full border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50">Close</button>
              <button onClick={() => alert('Notes saved locally in UI (no backend).')} className="rounded-full bg-gold px-4 py-2 text-sm font-semibold text-white">Save notes</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

