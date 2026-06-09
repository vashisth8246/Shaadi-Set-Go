import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { MapPin, Users, IndianRupee, ArrowLeft } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';

interface Venue {
  _id: string;
  name: string;
  type: string;
  location: string;
  capacity: number;
  pricePerDay: number;
  description: string;
  amenities: string[];
  images: string[];
}

export default function VenueDetails() {
  const { id } = useParams();
  const [venue, setVenue] = useState<Venue | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchVenueDetails();
  }, [id]);

  const fetchVenueDetails = async () => {
    try {
      const response = await axios.get(`/api/venues/${id}`);
      setVenue(response.data);
    } catch (error) {
      console.error('Error fetching venue details:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner compact label="Loading venue details..." />;
  if (!venue) return <div className="min-h-screen pt-24 text-center">Venue not found</div>;

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow p-8">
        <Link to="/venues" className="inline-flex items-center text-gold hover:text-gold/80 mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Venues
        </Link>
        <h1 className="text-4xl font-playfair font-bold text-gray-900 mb-4">{venue.name}</h1>
        <p className="text-gray-500 mb-8">{venue.type}</p>
        
        <img
          src={venue.images?.[0] || 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=1200&q=80'}
          alt={venue.name}
          onError={(e) => {
            e.currentTarget.src = 'https://picsum.photos/seed/venue-details/1200/800';
          }}
          className="w-full h-96 object-cover rounded-2xl mb-8"
        />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div>
            <h2 className="text-2xl font-semibold mb-4">About the Venue</h2>
            <p className="text-gray-700 leading-relaxed">{venue.description}</p>
          </div>
          <div>
            <div className="bg-rose-pink/10 rounded-2xl p-6">
              <h3 className="text-lg font-semibold mb-4">Quick Details</h3>
              <ul className="space-y-4">
                <li className="flex items-center text-gray-700">
                  <MapPin className="w-5 h-5 text-gold mr-3" />
                  {venue.location}
                </li>
                <li className="flex items-center text-gray-700">
                  <Users className="w-5 h-5 text-gold mr-3" />
                  Up to {venue.capacity} Guests
                </li>
                <li className="flex items-center text-gray-700">
                  <IndianRupee className="w-5 h-5 text-gold mr-3" />
                  Starts at ₹{venue.pricePerDay.toLocaleString()}
                </li>
              </ul>
              
              <Link to="/booking" state={{ selectedVendorId: venue._id }} className="mt-8 block w-full py-3 bg-gold text-white text-center rounded-full font-semibold hover:bg-gold/90 transition-colors">
                Book Now
              </Link>
            </div>
          </div>
        </div>

        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Amenities</h2>
          <div className="flex flex-wrap gap-2">
            {venue.amenities.map((item, idx) => (
              <span key={idx} className="venue-amenity-chip bg-gray-100 px-4 py-2 rounded-full text-gray-700">{item}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
