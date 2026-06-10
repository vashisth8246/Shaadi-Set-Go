import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Music as MusicIcon, Star, IndianRupee, Clock, Search } from 'lucide-react';
import axios from 'axios';
import { buildVendorCityFilters, extractVendorCity, normalizeSearchText } from '../utils/normalization';
import { pageImages } from '../data/siteContent';
import LoadingSpinner from '../components/LoadingSpinner';
import LuxuryPageHeader from '../components/LuxuryPageHeader';

interface DJ {
  _id: string;
  name: string;
  location: string;
  pricePerEvent: number;
  description: string;
  musicGenres: string[];
  equipment: string[];
  images: string[];
}

const musicFallbackImages = [
  'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1200&q=80',
];

const getMusicImage = (dj: DJ, index: number) => {
  const image = dj.images?.[0] || '';
  if (!image || image.includes('source.unsplash.com')) {
    return musicFallbackImages[index % musicFallbackImages.length];
  }
  return image;
};

export default function Music() {
  const [djs, setDjs] = useState<DJ[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCity, setSelectedCity] = useState('All');
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    fetchDJs();
  }, []);

  const fetchDJs = async () => {
    try {
      const response = await axios.get('/api/djs');
      setDjs(response.data);
    } catch (error) {
      console.error('Error fetching DJs:', error);
    } finally {
      setLoading(false);
    }
  };

  const cities = buildVendorCityFilters(djs);

  const filteredDjs = djs
    .filter((d) =>
      selectedCity === 'All'
        ? true
        : extractVendorCity(d) === selectedCity
    )
    .filter((d) => {
      const query = normalizeSearchText(searchTerm);
      if (!query) return true;

      const searchableText = normalizeSearchText([
        d.name,
        d.location,
        d.description,
        ...(d.musicGenres || []),
        ...(d.equipment || [])
      ].join(' '));

      return searchableText.includes(query);
    });

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-pink/20 to-white py-20 px-4">
      <div className="max-w-7xl mx-auto">
        <LuxuryPageHeader
          kicker="Celebration Sound"
          title="Music That Moves the Evening"
          subtitle="From soulful entries to late-night dance floors, find artists who understand the rhythm of the room."
        />
        
        {loading ? (
          <LoadingSpinner compact label="Loading Music Services..." subtitle="Fetching DJ listings" />
        ) : (
          <>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.6 }}
              className="max-w-2xl mx-auto mb-8 relative"
            >
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search DJs by name or genre..."
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
              {filteredDjs.map((dj, index) => (
              <motion.div
                key={dj._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.15, duration: 0.5 }}
                whileHover={{ y: -10 }}
                className="bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all"
              >
                <div className="relative h-64 overflow-hidden">
                  <img
                    src={getMusicImage(dj, index)}
                    alt={dj.name}
                    onError={(e) => {
                      e.currentTarget.src = pageImages.musicHero;
                    }}
                    className="w-full h-full object-cover transform hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-transparent" />
                  <div className="absolute bottom-4 left-4 text-white">
                    <h3 className="font-playfair text-2xl font-bold mb-1">{dj.name}</h3>
                    <p className="text-sm">{dj.musicGenres?.join(', ')}</p>
                  </div>
                </div>

                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      <Star className="w-5 h-5 text-gold fill-gold mr-1" />
                      <span className="font-semibold text-gray-900">4.9</span>
                    </div>
                    <div className="text-sm text-gray-600">
                      <Clock className="w-4 h-4 inline mr-1" />
                      {dj.location}
                    </div>
                  </div>

                  <div className="flex items-baseline mb-4">
                    <IndianRupee className="w-5 h-5 text-gold" />
                    <span className="text-3xl font-bold text-gray-900">
                      {dj.pricePerEvent?.toLocaleString() || 50000}
                    </span>
                  </div>

                  <ul className="space-y-2 mb-6">
                    {dj.equipment?.map((feature, i) => (
                      <li key={i} className="text-sm text-gray-600 flex items-start">
                        <MusicIcon className="w-4 h-4 text-gold mr-2 flex-shrink-0 mt-0.5" />
                        {feature}
                      </li>
                    ))}
                  </ul>

                  <Link to={`/portfolio/${dj._id}`} className="block w-full py-3 bg-gold text-white text-center rounded-full font-semibold hover:bg-gold/90 transition-colors">
                    View Portfolio
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
          </>
        )}
      </div>
    </div>
  );
}
