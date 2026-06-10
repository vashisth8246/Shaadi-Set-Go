import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Check, Crown, IndianRupee, Search } from 'lucide-react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { buildVendorCityFilters, extractVendorCity, normalizeSearchText } from '../utils/normalization';
import LuxuryPageHeader from '../components/LuxuryPageHeader';
// pageImages unused

interface Caterer {
  _id: string;
  businessName: string;
  description?: string;
  pricing: { startingPrice: number };
  services: string[];
  address?: {
    city?: string;
  };
  location?: string;
  city?: string;
}

export default function Catering() {
  const navigate = useNavigate();
  const [caterers, setCaterers] = useState<Caterer[]>([]);
  const [showQuoteForm, setShowQuoteForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCity, setSelectedCity] = useState('All');
  const [quoteData, setQuoteData] = useState({ fullName: '', email: '', phone: '', message: '' });
  const [quoteSuccess, setQuoteSuccess] = useState(false);

  useEffect(() => {
    axios.get('/api/catering')
      .then(res => setCaterers(res.data))
      .catch(console.error);
  }, []);

  const handleQuoteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post('/api/quotes', {
        ...quoteData,
        serviceType: 'catering'
      });
      setQuoteSuccess(true);
      setQuoteData({ fullName: '', email: '', phone: '', message: '' });
      setTimeout(() => { setShowQuoteForm(false); setQuoteSuccess(false); }, 3000);
    } catch (err) {
      console.error(err);
    }
  };

  const cities = buildVendorCityFilters(caterers);

  const filteredCaterers = caterers
    .filter((c) =>
      selectedCity === 'All'
        ? true
        : extractVendorCity(c) === selectedCity
    )
    .filter((c) => {
      const query = normalizeSearchText(searchTerm);
      if (!query) return true;

      const searchableText = normalizeSearchText([
        c.businessName,
        c.description,
        c.location,
        c.city,
        c.address?.city,
        ...(c.services || [])
      ].join(' '));

      return searchableText.includes(query);
    });

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-pink/20 to-white py-20 px-4">
      <div className="max-w-7xl mx-auto">
        <LuxuryPageHeader
          kicker="Royal Dining"
          title="Menus Worth Remembering"
          subtitle="Explore caterers who understand hospitality, plating, timing, and the emotion of a family feast."
        />

        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.6 }}
          className="max-w-2xl mx-auto mb-8 relative"
        >
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search catering by packages or services..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 rounded-full border border-gray-300 focus:ring-2 focus:ring-gold focus:border-transparent outline-none shadow-sm"
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="flex flex-wrap justify-center gap-3 mb-12"
        >
          {cities.map((city) => (
            <button
              key={city}
              onClick={() => setSelectedCity(city)}
              className={`px-6 py-2 rounded-full font-medium transition-all ${
                selectedCity === city
                  ? 'bg-gold text-white shadow-lg'
                  : 'bg-white text-gray-700 hover:bg-gray-50 shadow'
              }`}
            >
              {city}
            </button>
          ))}
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {filteredCaterers.map((caterer, index) => {
            const isPopular = index === 1;
            const tierName = index === 0 ? 'silver' : index === 1 ? 'gold' : 'platinum';
            return (
            <motion.div
              key={caterer._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.2, duration: 0.6 }}
              className={`relative rounded-3xl overflow-hidden shadow-xl ${
                isPopular
                  ? 'lg:scale-105 bg-gradient-to-br from-gold/10 to-white'
                  : 'bg-white'
              }`}
            >
              {isPopular && (
                <div className="absolute top-0 right-0 bg-gold text-white px-6 py-2 rounded-bl-3xl font-semibold flex items-center">
                  <Crown className="w-4 h-4 mr-2" />
                  Most Popular
                </div>
              )}

              <div className="p-8">
                <div
                  className={`inline-block px-4 py-2 rounded-full text-sm font-semibold mb-4 ${
                    tierName === 'silver'
                      ? 'bg-gray-200 text-gray-700'
                      : tierName === 'gold'
                      ? 'bg-gold text-white'
                      : 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                  }`}
                >
                  {caterer.businessName}
                </div>

                <div className="mb-6">
                  <div className="flex items-baseline">
                    <IndianRupee className="w-6 h-6 text-gold" />
                    <span className="text-5xl font-bold text-gray-900">
                      {caterer.pricing?.startingPrice || 1000}
                    </span>
                    <span className="text-gray-600 ml-2">/ plate</span>
                  </div>
                </div>

                <ul className="space-y-4 mb-8">
                  {caterer.services?.map((feature, i) => (
                    <li key={i} className="flex items-start">
                      <Check className="w-5 h-5 text-gold mr-3 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>

                <div className="space-y-3">
                  <Link
                    to={`/portfolio/${caterer._id}`}
                    className="block w-full py-3 rounded-full font-semibold transition-all border border-gold text-gold text-center hover:bg-gold/10"
                  >
                    View Profile
                  </Link>
                  <button
                    onClick={() => navigate('/booking', { state: { selectedVendorId: caterer._id } })}
                    className={`w-full py-3 rounded-full font-semibold transition-all bg-gradient-to-r from-gold to-yellow-600 text-white shadow-md hover:shadow-lg ${
                      isPopular ? 'scale-105' : ''
                    }`}
                  >
                    Select Package
                  </button>
                </div>
              </div>
            </motion.div>
          )})}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mt-16 text-center"
        >
          <h2 className="font-playfair text-3xl font-bold text-gray-900 mb-4">
            Custom Packages Available
          </h2>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            Need something specific? We can create a custom menu tailored to your preferences.
          </p>
          
          {!showQuoteForm ? (
            <button onClick={() => setShowQuoteForm(true)} className="px-8 py-3 bg-gray-900 text-white rounded-full font-semibold hover:bg-gray-800 transition-colors">
              Request Custom Quote
            </button>
          ) : (
            <form onSubmit={handleQuoteSubmit} className="max-w-lg mx-auto text-left bg-white p-6 rounded-2xl shadow-lg mt-4">
               {quoteSuccess && <div className="text-green-600 mb-4 text-center">Quote requested successfully!</div>}
               <input required type="text" placeholder="Full Name" className="w-full p-2 mb-3 border rounded" value={quoteData.fullName} onChange={e => setQuoteData({...quoteData, fullName: e.target.value})} />
               <input required type="email" placeholder="Email" className="w-full p-2 mb-3 border rounded" value={quoteData.email} onChange={e => setQuoteData({...quoteData, email: e.target.value})} />
               <input required type="text" placeholder="Phone" className="w-full p-2 mb-3 border rounded" value={quoteData.phone} onChange={e => setQuoteData({...quoteData, phone: e.target.value})} />
               <textarea required placeholder="Message/Requirements" className="w-full p-2 mb-3 border rounded" value={quoteData.message} onChange={e => setQuoteData({...quoteData, message: e.target.value})}></textarea>
               <button type="submit" className="w-full bg-gold text-white p-2 rounded hover:bg-gold/90 font-bold">Submit Request</button>
            </form>
          )}

        </motion.div>
      </div>
    </div>
  );
}

