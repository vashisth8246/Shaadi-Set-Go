import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Camera, Star, IndianRupee, Clock, Check, Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { buildVendorCityFilters, extractVendorCity, normalizeSearchText } from '../utils/normalization';
import { pageImages } from '../data/siteContent';
import LuxuryPageHeader from '../components/LuxuryPageHeader';

interface Photographer {
  _id: string;
  businessName: string;
  pricing: { startingPrice: number };
  services: string[];
  images: string[];
  description: string;
  address?: {
    city?: string;
  };
  location?: string;
  city?: string;
}

export default function Photography() {
  const [photographers, setPhotographers] = useState<Photographer[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCity, setSelectedCity] = useState('All');

  useEffect(() => {
    axios.get('/api/photography')
      .then(res => setPhotographers(res.data))
      .catch(console.error);
  }, []);

  const cities = buildVendorCityFilters(photographers);

  const filteredPhotographers = photographers
    .filter((p) =>
      selectedCity === 'All'
        ? true
        : extractVendorCity(p) === selectedCity
    )
    .filter((p) => {
      const query = normalizeSearchText(searchTerm);
      if (!query) return true;

      const searchableText = normalizeSearchText([
        p.businessName,
        p.description,
        p.location,
        p.city,
        p.address?.city,
        ...(p.services || [])
      ].join(' '));

      return searchableText.includes(query);
    });

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-pink/20 to-white py-20 px-4">
      <div className="max-w-7xl mx-auto">
        <LuxuryPageHeader
          kicker="Fine Art Memories"
          title="Photography With Heirloom Depth"
          subtitle="Choose visual storytellers who frame rituals, families, and fleeting details with care."
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
            placeholder="Search photographers by name or service..."
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {filteredPhotographers.map((photographer, index) => (
            <motion.div
              key={photographer._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.15, duration: 0.5 }}
              whileHover={{ y: -10 }}
              className="bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all"
            >
              <div className="relative h-80 overflow-hidden">
                <img
                  src={photographer.images?.[0] || pageImages.photographyHero}
                  alt={photographer.businessName}
                  onError={(e) => {
                    e.currentTarget.src = pageImages.photographyHero;
                  }}
                  className="w-full h-full object-cover transform hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-transparent" />
                <div className="absolute bottom-6 left-6 text-white">
                  <h3 className="font-playfair text-3xl font-bold mb-2">
                    {photographer.businessName}
                  </h3>
                  <p className="text-lg">{photographer.description}</p>
                </div>
              </div>

              <div className="p-8">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center">
                    <Star className="w-5 h-5 text-gold fill-gold mr-1" />
                    <span className="font-semibold text-gray-900 text-lg">
                      4.9
                    </span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Clock className="w-5 h-5 mr-1" />
                    <span>5+ Years Experience</span>
                  </div>
                </div>

                <div className="flex items-baseline mb-6">
                  <IndianRupee className="w-6 h-6 text-gold" />
                  <span className="text-4xl font-bold text-gray-900">
                    {photographer.pricing?.startingPrice?.toLocaleString() || 50000}
                  </span>
                </div>

                <ul className="space-y-3 mb-6">
                  {photographer.services?.map((feature, i) => (
                    <li key={i} className="flex items-start text-gray-700">
                      <Check className="w-5 h-5 text-gold mr-3 flex-shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <Link to={`/portfolio/${photographer._id}`} className="w-full py-3 bg-gold text-white rounded-full font-semibold hover:bg-gold/90 transition-colors flex items-center justify-center">
                  <Camera className="w-5 h-5 mr-2" />
                  View Portfolio
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

