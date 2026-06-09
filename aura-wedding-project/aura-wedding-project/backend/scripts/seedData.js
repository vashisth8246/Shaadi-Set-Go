const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Vendor = require('../models/Vendor');
const User = require('../models/User');

mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/wedding_vendors_SSG_loc')
    .then(() => console.log("✅ Connected to wedding_vendors_SSG_loc database"))
    .catch(err => console.log("❌ DB Connection Error:", err));

const seedData = async () => {
    try {
        await Vendor.deleteMany({});
        await User.deleteMany({ email: 'seedadmin@shaddisetgo.com' });
        
        console.log('🗑️ Cleared existing vendors from seeding target');

        // Create Seed User
        const hashedPassword = await bcrypt.hash('admin123', 10);
        const admin = new User({
            fullName: 'Seed Admin',
            email: 'seedadmin@shaddisetgo.com',
            password: hashedPassword,
            phone: '+91 98765 43211',
            role: 'vendor'
        });
        await admin.save();
        const userId = admin._id;

        const venues = [
            { userId, businessType: 'venue', businessName: 'Royal Palace Banquet', address: { city: 'Mumbai', state: 'Maharashtra' }, pricing: { startingPrice: 150000 }, description: 'Premium hall', services: ['Air Conditioning', 'Parking'], approval: { status: 'approved', message: 'Seed data approved.', reviewedAt: new Date() } },
            { userId, businessType: 'venue', businessName: 'Garden Paradise', address: { city: 'Delhi', state: 'NCR' }, pricing: { startingPrice: 200000 }, description: 'Outdoor garden', services: ['Garden', 'Parking'], approval: { status: 'approved', message: 'Seed data approved.', reviewedAt: new Date() } },
            { userId, businessType: 'venue', businessName: 'Heritage Palace', address: { city: 'Jaipur', state: 'Rajasthan' }, pricing: { startingPrice: 500000 }, description: 'Traditional royal palace', services: ['Royal Decor', 'Parking'], approval: { status: 'approved', message: 'Seed data approved.', reviewedAt: new Date() } },
            { userId, businessType: 'venue', businessName: 'Beach Side Resort', address: { city: 'Goa' }, pricing: { startingPrice: 120000 }, description: 'Scenic beach venue', services: ['Beach Access'], approval: { status: 'approved', message: 'Seed data approved.', reviewedAt: new Date() } },
            { userId, businessType: 'venue', businessName: 'Mountain View Retreat', address: { city: 'Mussoorie', state: 'Uttarakhand' }, pricing: { startingPrice: 80000 }, description: 'Peaceful mountain area', services: ['Mountain View'], approval: { status: 'approved', message: 'Seed data approved.', reviewedAt: new Date() } },
            { userId, businessType: 'venue', businessName: 'Grand Ballroom Hotel', address: { city: 'Bangalore', state: 'Karnataka' }, pricing: { startingPrice: 180000 }, description: 'Modern hotel ballroom', services: ['Air Conditioning', 'Parking'], approval: { status: 'approved', message: 'Seed data approved.', reviewedAt: new Date() } },
            { userId, businessType: 'venue', businessName: 'Traditional Mandap', address: { city: 'Kolkata', state: 'West Bengal' }, pricing: { startingPrice: 100000 }, description: 'Authentic Bengali style', services: ['Traditional Decor'], approval: { status: 'approved', message: 'Seed data approved.', reviewedAt: new Date() } },
            { userId, businessType: 'venue', businessName: 'Lakeside Pavilion', address: { city: 'Udaipur', state: 'Rajasthan' }, pricing: { startingPrice: 160000 }, description: 'Beautiful lakeside', services: ['Lake View', 'Boating'], approval: { status: 'approved', message: 'Seed data approved.', reviewedAt: new Date() } },
            { userId, businessType: 'venue', businessName: 'City Convention Center', address: { city: 'Chennai', state: 'Tamil Nadu' }, pricing: { startingPrice: 250000 }, description: 'Modern center', services: ['AC', 'Audio Visual'], approval: { status: 'approved', message: 'Seed data approved.', reviewedAt: new Date() } },
            { userId, businessType: 'venue', businessName: 'Gujarat Vihar Estate', address: { city: 'Ahmedabad', state: 'Gujarat' }, pricing: { startingPrice: 300000 }, description: 'Large estate located in Gujarat', services: ['Catering', 'Parking'], approval: { status: 'approved', message: 'Seed data approved.', reviewedAt: new Date() } }
        ];
        
        const djs = [
            { userId, businessType: 'dj', businessName: 'DJ Rockstar', address: { city: 'Mumbai', state: 'Maharashtra' }, pricing: { startingPrice: 50000 }, description: 'Pro DJ', services: ['Bollywood', 'EDM'] },
            { userId, businessType: 'dj', businessName: 'Beat Masters DJ', address: { city: 'Delhi', state: 'NCR' }, pricing: { startingPrice: 45000 }, description: 'Experienced DJs', services: ['Bollywood', 'International'] },
            { userId, businessType: 'dj', businessName: 'Royal Beats', address: { city: 'Jaipur', state: 'Rajasthan' }, pricing: { startingPrice: 35000 }, description: 'Fusion music', services: ['Folk', 'Bollywood'] },
            { userId, businessType: 'dj', businessName: 'Coastal Vibes', address: { city: 'Goa' }, pricing: { startingPrice: 40000 }, description: 'Beach parties', services: ['Trance', 'House'] },
            { userId, businessType: 'dj', businessName: 'Tech House', address: { city: 'Bangalore', state: 'Karnataka' }, pricing: { startingPrice: 55000 }, description: 'Electronic music', services: ['Techno', 'House'] }
        ];
        
        const caterers = [
            { userId, businessType: 'catering', businessName: 'Spice Route Catering', address: { city: 'Mumbai' }, pricing: { startingPrice: 800 }, description: 'Authentic Indian', services: ['Indian', 'Chinese', 'Live Counters'] },
            { userId, businessType: 'catering', businessName: 'Royal Feast', address: { city: 'Delhi' }, pricing: { startingPrice: 1200 }, description: 'Premium catering', services: ['Mughlai', 'Continental', 'Desserts'] },
            { userId, businessType: 'catering', businessName: 'Gujarati Zaika', address: { city: 'Ahmedabad' }, pricing: { startingPrice: 600 }, description: 'Authentic veg', services: ['Gujarati Thali', 'Sweets'] },
            { userId, businessType: 'catering', businessName: 'Coastal Flavors', address: { city: 'Goa' }, pricing: { startingPrice: 1000 }, description: 'Seafood and more', services: ['Goan', 'Continental', 'Seafood'] },
            { userId, businessType: 'catering', businessName: 'South Spice', address: { city: 'Bangalore' }, pricing: { startingPrice: 700 }, description: 'South Indian feasts', services: ['South Indian', 'Banana Leaf'] }
        ];

        const photographers = [
            { userId, businessType: 'photography', businessName: 'Lens Magic', address: { city: 'Mumbai' }, pricing: { startingPrice: 40000 }, description: 'Candid photography experts', services: ['Candid', 'Traditional', 'Drone'] },
            { userId, businessType: 'photography', businessName: 'Pixel Perfect Studios', address: { city: 'Delhi' }, pricing: { startingPrice: 50000 }, description: 'Pre-wedding and wedding coverage', services: ['Pre-wedding', 'Cinematography'] },
            { userId, businessType: 'photography', businessName: 'Golden Hours Photography', address: { city: 'Goa' }, pricing: { startingPrice: 35000 }, description: 'Specialized in beach weddings', services: ['Candid', 'Cinematography'] }
        ];

        const decorators = [
            { userId, businessType: 'decoration', businessName: 'Floral Fantasies', address: { city: 'Jaipur' }, pricing: { startingPrice: 100000 }, description: 'Luxury floral decor matching palaces', services: ['Floral', 'Lighting', 'Stage'] },
            { userId, businessType: 'decoration', businessName: 'Elegance Events Decor', address: { city: 'Mumbai' }, pricing: { startingPrice: 80000 }, description: 'Modern and aesthetic designs', services: ['Minimalist', 'Lighting'] },
            { userId, businessType: 'decoration', businessName: 'Traditions Decor Co.', address: { city: 'Chennai' }, pricing: { startingPrice: 120000 }, description: 'South Indian traditional decorators', services: ['Traditional', 'Mandap'] }
        ];

        const allVendors = [...venues, ...djs, ...caterers, ...photographers, ...decorators].map((vendor) => ({
            ...vendor,
            approval: {
                status: 'approved',
                message: 'Seed data approved.',
                reviewedAt: new Date()
            }
        }));

        await Vendor.insertMany(allVendors);
        console.log('✅ Created 10 venues, 5 djs, 5 caterers, 3 photographers, 3 decorators mapped to Vendor Schema!');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding database:', error);
        process.exit(1);
    }
};

seedData();
