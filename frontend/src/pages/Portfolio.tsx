import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { MapPin, IndianRupee, ArrowLeft, Star } from 'lucide-react';
import { pageImages } from '../data/siteContent';
import LoadingSpinner from '../components/LoadingSpinner';

interface Vendor {
  _id: string;
  businessName: string;
  businessType: string;
  description: string;
  address: { city: string; state: string };
  pricing: { startingPrice: number };
  services: string[];
  images: string[];
}

export default function Portfolio() {
  const { id } = useParams();
  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchVendorDetails();
  }, [id]);

  const fetchVendorDetails = async () => {
    try {
      const response = await axios.get(`/api/vendors/${id}`);
      setVendor(response.data);
    } catch (error) {
      console.error('Error fetching vendor portfolio:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner compact label="Loading portfolio..." />;
  if (!vendor) return <div className="min-h-screen pt-24 text-center">Portfolio not found</div>;

  const derivedCityFromDescription = (() => {
    const match = vendor.description?.match(/\bin\s+([A-Za-z\s]+?)(?:\.|,|$)/i);
    return match?.[1]?.trim() || '';
  })();

  const cleanLocation = [vendor.address?.city || derivedCityFromDescription, vendor.address?.state]
    .filter(Boolean)
    .join(', ');

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow p-8">
        <button onClick={() => window.history.back()} className="inline-flex items-center text-gold hover:text-gold/80 mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" /> Go Back
        </button>
        
        <div className="flex items-center justify-between mb-4">
            <h1 className="text-4xl font-playfair font-bold text-gray-900">{vendor.businessName}</h1>
            <div className="flex items-center bg-gold/10 px-3 py-1 rounded-full text-gold">
                <Star className="w-5 h-5 mr-1 fill-gold" /> 4.9
            </div>
        </div>
        <p className="text-gray-500 mb-8 uppercase tracking-widest text-sm font-semibold">{vendor.businessType}</p>
        
        <img
          src={vendor.images?.[0] || pageImages.portfolioHero}
          alt={vendor.businessName}
          onError={(e) => {
            e.currentTarget.src = pageImages.portfolioHero;
          }}
          className="w-full h-96 object-cover rounded-2xl mb-8"
        />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div>
            <h2 className="text-2xl font-semibold mb-4">About</h2>
            <p className="text-gray-700 leading-relaxed">{vendor.description || 'Welcome to our professional portfolio.'}</p>
          </div>
          <div>
            <div className="bg-rose-pink/10 rounded-2xl p-6">
              <h3 className="text-lg font-semibold mb-4">Quick Details</h3>
              <ul className="space-y-4">
                <li className="flex items-center text-gray-700">
                  <MapPin className="w-5 h-5 text-gold mr-3" />
                  {cleanLocation || 'Multiple Locations'}
                </li>
                <li className="flex items-center text-gray-700">
                  <IndianRupee className="w-5 h-5 text-gold mr-3" />
                  Starts at ₹{vendor.pricing?.startingPrice?.toLocaleString() || 10000}
                </li>
              </ul>
              
              <Link to="/booking" state={{ selectedVendorId: vendor._id }} className="mt-8 block w-full py-3 bg-gold text-white text-center rounded-full font-semibold hover:bg-gold/90 transition-colors">
                Book Now
              </Link>
            </div>
          </div>
        </div>

        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Services Offered</h2>
          <div className="flex flex-wrap gap-2">
            {vendor.services?.map((item, idx) => (
              <span key={idx} className="bg-gray-100 px-4 py-2 rounded-full text-gray-700">{item}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

