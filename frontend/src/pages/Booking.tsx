import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronLeft, Check } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import LuxuryPageHeader from '../components/LuxuryPageHeader';

interface FormData {
  serviceType: string;
  date: string;
  guests: string;
  budget: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  location: string;
}

interface SelectedVendor {
  _id: string;
  businessName: string;
  businessType: string;
  contact?: {
    email?: string;
    phone?: string;
  };
}

interface MyBooking {
  _id: string;
  serviceType: string;
  weddingDate: string;
  guests: number;
  status: 'open' | 'confirmed' | 'rejected' | 'cancelled' | 'completed';
  vendorId?: {
    businessName: string;
    businessType: string;
    contact?: {
      email?: string;
      phone?: string;
    };
  };
}

type BookingCategory = 'venue' | 'catering' | 'photography' | 'decoration' | 'music' | 'other';

interface DynamicQuestion {
  id: string;
  label: string;
  type: 'select' | 'number' | 'text';
  options?: string[];
  placeholder?: string;
}

const normalizeBookingCategory = (value?: string): BookingCategory => {
  const normalized = (value || '').toLowerCase();
  if (normalized.includes('venue')) return 'venue';
  if (normalized.includes('catering')) return 'catering';
  if (normalized.includes('photo')) return 'photography';
  if (normalized.includes('decor')) return 'decoration';
  if (normalized.includes('dj') || normalized.includes('music')) return 'music';
  return 'other';
};

const dynamicQuestionsByCategory: Record<BookingCategory, DynamicQuestion[]> = {
  venue: [
    { id: 'areaPreference', label: 'Area Preference', type: 'select', options: ['Indoor', 'Outdoor'] },
    { id: 'seatingType', label: 'Seating Type', type: 'select', options: ['Theatre', 'Banquet', 'Round Table', 'Mixed'] },
  ],
  catering: [
    { id: 'foodPreference', label: 'Food Preference', type: 'select', options: ['Veg', 'Non-Veg', 'Both'] },
    { id: 'servingFormat', label: 'Serving Format', type: 'select', options: ['Buffet', 'Plated'] },
  ],
  photography: [
    { id: 'coverage', label: 'Coverage', type: 'select', options: ['Pre-wedding', 'Ceremony only', 'Full Event'] },
  ],
  decoration: [
    { id: 'themeConcept', label: 'Theme Concept', type: 'select', options: ['Traditional', 'Floral', 'Modern', 'Royal'] },
  ],
  music: [
    { id: 'eventDurationHours', label: 'Event Duration (hours)', type: 'number', placeholder: 'e.g., 5' },
    { id: 'genrePreferences', label: 'Genre Preferences', type: 'text', placeholder: 'e.g., Bollywood, Sufi, EDM' },
  ],
  other: [],
};

export default function Booking() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    serviceType: '',
    date: '',
    guests: '',
    budget: '',
    name: '',
    email: '',
    phone: '',
    message: '',
    location: '',
  });

  const routerLocation = useLocation();
  const navigate = useNavigate();
  const vendorId: string | null = routerLocation.state?.selectedVendorId || routerLocation.state?.selectedVenueId || null;
  const [selectedVendor, setSelectedVendor] = useState<SelectedVendor | null>(null);
  const [myBookings, setMyBookings] = useState<MyBooking[]>([]);
  const [categoryDetails, setCategoryDetails] = useState<Record<string, string>>({});
  const isDirectVendorBooking = Boolean(vendorId);
  const activeCategory = normalizeBookingCategory(selectedVendor?.businessType || formData.serviceType);
  const activeCategoryQuestions = dynamicQuestionsByCategory[activeCategory] || [];

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      const redirectData = {
        path: routerLocation.pathname,
        search: routerLocation.search,
        state: {
          selectedVendorId: routerLocation.state?.selectedVendorId,
          selectedVenueId: routerLocation.state?.selectedVenueId,
        },
      };

      sessionStorage.setItem('post_login_redirect', JSON.stringify(redirectData));
      navigate('/login', {
        state: {
          redirectTo: `${routerLocation.pathname}${routerLocation.search || ''}`,
          redirectState: redirectData.state,
        },
      });
      return;
    }
    
    if (vendorId) {
      setStep(2);
      axios
        .get(`/api/vendors/${vendorId}`)
        .then((res) => {
          setSelectedVendor(res.data);
          setFormData((prev) => ({ ...prev, serviceType: res.data.businessType }));
        })
        .catch(() => {
          setSelectedVendor(null);
        });
    }

    const tokenForBookings = localStorage.getItem('token');
    if (tokenForBookings) {
      axios
        .get('/api/bookings/my', {
          headers: { Authorization: `Bearer ${tokenForBookings}` },
        })
        .then((res) => setMyBookings(res.data || []))
        .catch(() => setMyBookings([]));
    }
  }, [vendorId, navigate]);

  useEffect(() => {
    setCategoryDetails({});
  }, [activeCategory]);

  const services = [
    'Venue',
    'Catering',
    'Photography',
    'Music & DJ',
    'Decoration',
    'Makeup & Hair',
  ];

  const handleServiceToggle = (service: string) => {
    setFormData({ ...formData, serviceType: service });
  };

  const handleNext = () => {
    if (step < 3) setStep(step + 1);
  };

  const handlePrev = () => {
    const minStep = isDirectVendorBooking ? 2 : 1;
    if (step > minStep) setStep(step - 1);
  };

  const updateCategoryDetail = (id: string, value: string) => {
    setCategoryDetails((prev) => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const budgetValue = formData.budget.trim() ? Number(formData.budget) : undefined;
      const preparedCategoryDetails = activeCategoryQuestions.reduce<Record<string, string>>((acc, q) => {
        const value = (categoryDetails[q.id] || '').trim();
        if (value) {
          acc[q.label] = value;
        }
        return acc;
      }, {});

      const payload: Record<string, unknown> = {
        fullName: formData.name,
        email: formData.email,
        phone: formData.phone,
        weddingDate: formData.date,
        serviceType: formData.serviceType || selectedVendor?.businessType || 'venue',
        guests: Number(formData.guests),
        budget: budgetValue,
        location: isDirectVendorBooking ? '' : formData.location,
        specialRequests: formData.message,
        totalAmount: budgetValue ?? 0,
        categoryDetails: preparedCategoryDetails,
        vendorId: vendorId || null
      };

      const response = await axios.post('/api/bookings', payload, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });

      if (response.data) {
        setSuccess(true);
        setMyBookings((prev) => [response.data.booking, ...prev]);
        // Reset form
        setStep(isDirectVendorBooking ? 2 : 1);
        setFormData({
          serviceType: selectedVendor?.businessType || '', date: '', guests: '', budget: '',
          name: '', email: '', phone: '', message: '', location: ''
        });
        setCategoryDetails({});

        setTimeout(() => {
          navigate('/');
        }, 1200);
      }
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to submit booking. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  const isStepValid = () => {
    if (step === 1) return Boolean(formData.serviceType || selectedVendor?.businessType);
    if (step === 2) {
      const hasRequiredBasics = Boolean(formData.date && formData.guests);
      if (!hasRequiredBasics) return false;
      return activeCategoryQuestions.every((q) => Boolean((categoryDetails[q.id] || '').trim()));
    }
    if (step === 3) return formData.name && formData.email && formData.phone;
    return false;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-pink/20 to-white py-20 px-4">
      <div className="max-w-4xl mx-auto">
        <LuxuryPageHeader
          kicker="Private Concierge"
          title="Begin Your Wedding Request"
          subtitle="Share the essentials. Shaadi SetGo will shape the next step with the right vendor and timing."
        />

        {success && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg text-center"
          >
            🎉 Booking submitted successfully! We'll contact you soon.
          </motion.div>
        )}

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg text-center"
          >
            ❌ {error}
          </motion.div>
        )}

        <div className="mb-12 mt-12">
          <div className="flex items-center justify-center">
            {[1, 2, 3].map((s, index) => (
              <div key={s} className="flex items-center">
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center font-semibold transition-all ${
                    step >= s
                      ? 'bg-gold text-white'
                      : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  {step > s ? <Check className="w-6 h-6" /> : s}
                </div>
                {index < 2 && (
                  <div
                    className={`w-24 h-1 mx-2 transition-all ${
                      step > s ? 'bg-gold' : 'bg-gray-200'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-center mt-4 space-x-32">
            <span className="text-sm font-medium text-gray-700">Services</span>
            <span className="text-sm font-medium text-gray-700">Details</span>
            <span className="text-sm font-medium text-gray-700">Contact</span>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-white rounded-3xl p-8 md:p-12 shadow-lg"
        >
          <form onSubmit={handleSubmit}>
            <AnimatePresence mode="wait">
              {step === 1 && (
                !isDirectVendorBooking && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <h2 className="font-playfair text-3xl font-bold text-gray-900 mb-6">
                    Select Service
                  </h2>
                  {isDirectVendorBooking && selectedVendor ? (
                    <p className="text-gray-600 mb-8">
                      Booking directly with <span className="font-semibold">{selectedVendor.businessName}</span>.
                    </p>
                  ) : (
                    <p className="text-gray-600 mb-8">
                      Choose the service you need for your wedding
                    </p>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {services.map((service) => (
                      <button
                        key={service}
                        type="button"
                        disabled={isDirectVendorBooking}
                        onClick={() => handleServiceToggle(service)}
                        className={`p-4 rounded-2xl border-2 transition-all text-left ${
                          (formData.serviceType || selectedVendor?.businessType || '')
                            .toLowerCase()
                            .includes(service.toLowerCase().split(' ')[0])
                            ? 'border-gold bg-gold/5'
                            : 'border-gray-200 hover:border-gray-300'
                        } ${isDirectVendorBooking ? 'opacity-80 cursor-not-allowed' : ''}`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-gray-900">{service}</span>
                          {(formData.serviceType || selectedVendor?.businessType || '')
                            .toLowerCase()
                            .includes(service.toLowerCase().split(' ')[0]) && (
                            <Check className="w-5 h-5 text-gold" />
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                </motion.div>
                )
              )}

              {step === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <h2 className="font-playfair text-3xl font-bold text-gray-900 mb-6">
                    Event Details
                  </h2>
                  <p className="text-gray-600 mb-8">
                    Tell us more about your wedding day
                  </p>

                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Wedding Date
                      </label>
                      <input
                        type="date"
                        value={formData.date}
                        onChange={(e) =>
                          setFormData({ ...formData, date: e.target.value })
                        }
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-gold focus:border-transparent"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Number of Guests
                      </label>
                      <input
                        type="number"
                        value={formData.guests}
                        onChange={(e) =>
                          setFormData({ ...formData, guests: e.target.value })
                        }
                        placeholder="e.g., 200"
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-gold focus:border-transparent"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Budget Range (Optional)
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-semibold">₹</span>
                        <input
                          type="number"
                          value={formData.budget}
                          onChange={(e) =>
                            setFormData({ ...formData, budget: e.target.value })
                          }
                          placeholder="e.g., 500000"
                          className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-gold focus:border-transparent"
                        />
                      </div>
                    </div>

                    {!isDirectVendorBooking && (
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Preferred Location/City
                      </label>
                      <input
                        type="text"
                        value={formData.location}
                        onChange={(e) =>
                          setFormData({ ...formData, location: e.target.value })
                        }
                        placeholder="e.g., Mumbai, Delhi, Bangalore"
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-gold focus:border-transparent"
                      />
                    </div>
                    )}

                    {activeCategoryQuestions.length > 0 && (
                      <div className="border border-rose-100 rounded-2xl p-4 bg-rose-50/40">
                        <h3 className="font-semibold text-gray-900 mb-3">Category Specific Preferences</h3>
                        <div className="space-y-4">
                          {activeCategoryQuestions.map((question) => (
                            <div key={question.id}>
                              <label className="block text-sm font-semibold text-gray-700 mb-2">
                                {question.label}
                              </label>
                              {question.type === 'select' ? (
                                <select
                                  value={categoryDetails[question.id] || ''}
                                  onChange={(e) => updateCategoryDetail(question.id, e.target.value)}
                                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-gold focus:border-transparent"
                                  required
                                >
                                  <option value="">Select an option</option>
                                  {question.options?.map((option) => (
                                    <option key={option} value={option}>
                                      {option}
                                    </option>
                                  ))}
                                </select>
                              ) : (
                                <input
                                  type={question.type}
                                  value={categoryDetails[question.id] || ''}
                                  onChange={(e) => updateCategoryDetail(question.id, e.target.value)}
                                  placeholder={question.placeholder}
                                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-gold focus:border-transparent"
                                  required
                                />
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {step === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <h2 className="font-playfair text-3xl font-bold text-gray-900 mb-6">
                    Contact Information
                  </h2>
                  <p className="text-gray-600 mb-8">
                    How can we reach you?
                  </p>

                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Full Name
                      </label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) =>
                          setFormData({ ...formData, name: e.target.value })
                        }
                        placeholder="Enter your name"
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-gold focus:border-transparent"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Email
                      </label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) =>
                          setFormData({ ...formData, email: e.target.value })
                        }
                        placeholder="your@email.com"
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-gold focus:border-transparent"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) =>
                          setFormData({ ...formData, phone: e.target.value })
                        }
                        placeholder="+91 98765 43210"
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-gold focus:border-transparent"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Additional Message (Optional)
                      </label>
                      <textarea
                        value={formData.message}
                        onChange={(e) =>
                          setFormData({ ...formData, message: e.target.value })
                        }
                        placeholder="Tell us more about your vision..."
                        rows={4}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-gold focus:border-transparent resize-none"
                      />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex justify-between mt-8">
              {step > (isDirectVendorBooking ? 2 : 1) ? (
                <button
                  type="button"
                  onClick={handlePrev}
                  className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-full font-semibold hover:bg-gray-50 transition-colors flex items-center"
                >
                  <ChevronLeft className="w-5 h-5 mr-1" />
                  Previous
                </button>
              ) : (
                <div />
              )}

              {step < 3 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  disabled={!isStepValid()}
                  className="px-6 py-3 bg-gold text-white rounded-full font-semibold hover:bg-gold/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center ml-auto"
                >
                  Next
                  <ChevronRight className="w-5 h-5 ml-1" />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={loading}
                  className="px-8 py-3 bg-gold text-white rounded-full font-semibold hover:bg-gold/90 transition-colors disabled:opacity-50 ml-auto"
                >
                  {loading ? 'Submitting...' : 'Submit Booking'}
                </button>
              )}
            </div>
          </form>
        </motion.div>

        {myBookings.length > 0 && (
          <div className="mt-8 bg-white rounded-3xl p-8 shadow-lg">
            <h3 className="font-playfair text-2xl font-bold text-gray-900 mb-4">Your Booking Requests</h3>
            <div className="space-y-3">
              {myBookings.slice(0, 6).map((booking) => (
                <div key={booking._id} className="border border-gray-200 rounded-xl p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                  <div>
                    <p className="font-semibold text-gray-900">{booking.vendorId?.businessName || `${booking.serviceType} request`}</p>
                    <p className="text-sm text-gray-600">
                      {new Date(booking.weddingDate).toLocaleDateString()} | {booking.guests} guests
                    </p>
                    {booking.status === 'confirmed' && booking.vendorId?.contact && (
                      <p className="text-sm text-emerald-700">
                        Contact: {booking.vendorId.contact.email || booking.vendorId.contact.phone || 'Available'}
                      </p>
                    )}
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${
                    booking.status === 'confirmed'
                      ? 'bg-green-100 text-green-700'
                      : booking.status === 'rejected' || booking.status === 'cancelled'
                      ? 'bg-red-100 text-red-700'
                      : booking.status === 'completed'
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {booking.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

