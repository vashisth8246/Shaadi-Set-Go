import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Users, IndianRupee, Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { normalizeCityName, normalizeSearchText } from '../utils/normalization';
import { pageImages } from '../data/siteContent';
import LoadingSpinner from '../components/LoadingSpinner';
import LuxuryPageHeader from '../components/LuxuryPageHeader';

interface Venue {
  _id: string;
  name: string;
  type: string;
  city?: string;
  location: string;
  capacity: number;
  pricePerDay: number;
  description: string;
  amenities: string[];
  images: string[];
}

export default function Venues() {
  const [venues, setVenues] = useState<Venue[]>([]);
  const [selectedCity, setSelectedCity] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    fetchVenues();
  }, []);

  const fetchVenues = async () => {
    try {
      const response = await axios.get('/api/venues');
      setVenues(response.data);
    } catch (error) {
      console.error('Error fetching venues:', error);
    } finally {
      setLoading(false);
    }
  };

  // Extract cities from venue locations
  const cities = [
    'All',
    ...Array.from(
      new Set(
        venues
          .map((v) => normalizeCityName(v.city || v.location.split(',')[0] || ''))
          .filter(Boolean)
      )
    ),
  ];

  const filteredVenues = venues
    .filter((v) => selectedCity === 'All' ? true : normalizeCityName(v.city || v.location.split(',')[0] || '') === selectedCity)
    .filter((v) => {
      const query = normalizeSearchText(searchTerm);
      if (!query) return true;

      const searchableText = normalizeSearchText([
        v.name,
        v.type,
        v.location,
        v.description,
        ...(v.amenities || [])
      ].join(' '));

      return searchableText.includes(query);
    });

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-pink/20 to-white py-20 px-4">
      <div className="max-w-7xl mx-auto">
        <LuxuryPageHeader
          kicker="Vadodara Venues"
          title="Palatial Spaces for Sacred Promises"
          subtitle="Discover curated venues with the scale, grace, and service expected of a landmark wedding."
        />

        
        {loading ? (
          <LoadingSpinner compact label="Loading venues..." subtitle="Fetching venue listings" />
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
                placeholder="Search venues by name or description..."
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
              {filteredVenues.map((venue, index) => (
                <motion.div
                  key={venue._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1, duration: 0.5 }}
                  whileHover={{ y: -10 }}
                  className="bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all"
                >
                  <div className="relative h-64 overflow-hidden">
                    <img
                      src={venue.images?.[0] || pageImages.venueHero}
                      alt={venue.name}
                      onError={(e) => {
                        e.currentTarget.src = pageImages.venueHero;
                      }}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-transparent" />
                    <div className="absolute bottom-4 left-4 text-white">
                      <div className="text-sm font-medium opacity-90">{venue.type}</div>
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="font-playfair text-2xl font-bold text-gray-900 mb-2">
                      {venue.name}
                    </h3>
                    <p className="text-gray-600 mb-4 line-clamp-2">{venue.description}</p>
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center text-gray-700">
                        <MapPin className="w-5 h-5 text-gold mr-2" />
                        <span>{venue.location}</span>
                      </div>
                      <div className="flex items-center text-gray-700">
                        <Users className="w-5 h-5 text-gold mr-2" />
                        <span>Capacity: {venue.capacity} guests</span>
                      </div>
                      <div className="flex items-center text-gray-700">
                        <IndianRupee className="w-5 h-5 text-gold mr-2" />
                        <span>₹{venue.pricePerDay.toLocaleString()} per day</span>
                      </div>
                    </div>
                    <Link to={`/venue/${venue._id}`} className="block text-center w-full py-3 bg-gold text-white rounded-full font-semibold hover:bg-gold/90 transition-colors">
                      View Details
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
