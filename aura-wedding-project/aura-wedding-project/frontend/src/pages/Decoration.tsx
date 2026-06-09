import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, IndianRupee, MapPin, Search } from 'lucide-react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { buildVendorCityFilters, extractVendorCity, normalizeSearchText } from '../utils/normalization';
import { pageImages } from '../data/siteContent';
import LuxuryPageHeader from '../components/LuxuryPageHeader';

interface Decorator {
  _id: string;
  businessName: string;
  description: string;
  address?: {
    city?: string;
  };
  location?: string;
  pricing: { startingPrice: number };
  services: string[];
  images: string[];
}

export default function Decoration() {
  const [decorators, setDecorators] = useState<Decorator[]>([]);
  const [showQuoteForm, setShowQuoteForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCity, setSelectedCity] = useState('All');
  const [quoteData, setQuoteData] = useState({ fullName: '', email: '', phone: '', message: '' });
  const [quoteSuccess, setQuoteSuccess] = useState(false);

  useEffect(() => {
    axios.get('/api/decoration')
      .then(res => setDecorators(res.data))
      .catch(console.error);
  }, []);

  const handleQuoteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post('/api/quotes', {
        ...quoteData,
        serviceType: 'decoration'
      });
      setQuoteSuccess(true);
      setQuoteData({ fullName: '', email: '', phone: '', message: '' });
      setTimeout(() => { setShowQuoteForm(false); setQuoteSuccess(false); }, 3000);
    } catch (err) {
      console.error(err);
    }
  };

  const cities = buildVendorCityFilters(decorators);

  const filteredDecorators = decorators
    .filter((d) =>
      selectedCity === 'All'
        ? true
        : extractVendorCity(d) === selectedCity
    )
    .filter((d) => {
      const query = normalizeSearchText(searchTerm);
      if (!query) return true;

      const searchableText = normalizeSearchText([
        d.businessName,
        d.description,
        d.location,
        d.address?.city,
        ...(d.services || [])
      ].join(' '));

      return searchableText.includes(query);
    });

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-pink/20 to-white py-20 px-4">
      <div className="max-w-7xl mx-auto">
        <LuxuryPageHeader
          kicker="Royal Decor"
          title="Atmospheres With Ceremony"
          subtitle="Browse decorators who can turn mandaps, entrances, tables, and stages into one complete visual language."
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
            placeholder="Search decorations by theme or description..."
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredDecorators.map((theme, index) => (
            <motion.div
              key={theme._id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              whileHover={{ scale: 1.05 }}
              className="group relative rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all"
            >
              <Link to={`/portfolio/${theme._id}`} className="block relative h-96 overflow-hidden cursor-pointer">
                <img
                  src={theme.images?.[0] || pageImages.decorationHero}
                  alt={theme.businessName}
                  onError={(e) => {
                    e.currentTarget.src = pageImages.decorationHero;
                  }}
                  className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-transparent" />

                <div className="absolute inset-0 flex flex-col justify-end p-6 text-white">
                  <div className="flex items-center mb-2">
                    <Sparkles className="w-5 h-5 text-gold mr-2" />
                    <span className="text-sm font-semibold text-gold">Premium Theme</span>
                  </div>

                  <h3 className="font-playfair text-3xl font-bold mb-2">{theme.businessName}</h3>

                  <p className="text-sm mb-4 opacity-90">{theme.description}</p>

                  <div className="flex items-baseline mb-4">
                    <IndianRupee className="w-5 h-5" />
                    <span className="text-2xl font-bold">
                      {theme.pricing?.startingPrice?.toLocaleString() || 100000}
                    </span>
                  </div>

                  <div className="text-sm mb-4 opacity-90 flex items-center">
                    <MapPin className="w-4 h-4 mr-2" />
                    {theme.location || 'Multiple Locations'}
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    {theme.services?.slice(0, 4).map((feature, i) => (
                      <div
                        key={i}
                        className="text-xs bg-white/20 backdrop-blur-sm rounded-full px-3 py-1 text-center"
                      >
                        {feature}
                      </div>
                    ))}
                  </div>
                </div>
              </Link>

              <div className="absolute inset-0 bg-gold/0 group-hover:bg-gold/10 transition-colors pointer-events-none" />
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mt-16 bg-white rounded-3xl p-8 shadow-lg text-center"
        >
          <h2 className="font-playfair text-3xl font-bold text-gray-900 mb-4">
            Need a Custom Theme?
          </h2>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            Our expert decorators can bring your unique vision to life. Share your ideas and
            we'll create something extraordinary just for you.
          </p>

          {!showQuoteForm ? (
            <button onClick={() => setShowQuoteForm(true)} className="px-8 py-3 bg-gold text-white rounded-full font-semibold hover:bg-gold/90 transition-colors shadow-lg">
              Discuss Custom Design
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

