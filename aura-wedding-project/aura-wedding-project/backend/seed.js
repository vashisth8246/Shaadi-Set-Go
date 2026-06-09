const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/wedding_vendors_SSG_loc')
    .then(() => console.log("✅ Connected to wedding_vendors_SSG_loc database"))
    .catch(err => console.log("❌ DB Connection Error:", err));

// Define Schemas (simplified versions for seeding)
const UserSchema = new mongoose.Schema({
    fullName: String,
    email: String,
    password: String,
    phone: String,
    role: String
});

const VenueSchema = new mongoose.Schema({
    name: String,
    type: String,
    location: String,
    capacity: Number,
    pricePerDay: Number,
    description: String,
    amenities: [String],
    images: [String]
});

const DJSchema = new mongoose.Schema({
    name: String,
    location: String,
    pricePerEvent: Number,
    description: String,
    musicGenres: [String],
    equipment: [String],
    images: [String]
});

const User = mongoose.model('User', UserSchema);
const Venue = mongoose.model('Venue', VenueSchema);
const DJ = mongoose.model('DJ', DJSchema);

// Seed Data
const seedData = async () => {
    try {
        // Clear existing data
        await User.deleteMany({});
        await Venue.deleteMany({});
        await DJ.deleteMany({});
        
        console.log('🗑️ Cleared existing data');

        // Create Admin User
        const hashedPassword = await bcrypt.hash('admin123', 10);
        const admin = new User({
            fullName: 'Admin User',
            email: 'admin@shaddisetgo.com',
            password: hashedPassword,
            phone: '+91 98765 43211',
            role: 'admin'
        });
        await admin.save();
        console.log('✅ Created admin user');

        // Create 10 Dummy Venues
        const venues = [
            {
                name: 'Royal Palace Wedding Hall',
                type: 'Banquet Hall',
                location: 'Mumbai, Maharashtra',
                capacity: 500,
                pricePerDay: 150000,
                description: 'Luxurious banquet hall with modern amenities',
                amenities: ['Air Conditioning', 'Parking', 'Catering Service', 'Decoration'],
                images: ['venue1.jpg', 'venue2.jpg']
            },
            {
                name: 'Garden Paradise Resort',
                type: 'Outdoor Venue',
                location: 'Delhi, NCR',
                capacity: 800,
                pricePerDay: 200000,
                description: 'Beautiful outdoor garden perfect for weddings',
                amenities: ['Garden', 'Swimming Pool', 'Parking', 'Catering'],
                images: ['garden1.jpg', 'garden2.jpg']
            },
            {
                name: 'Heritage Palace',
                type: 'Palace',
                location: 'Jaipur, Rajasthan',
                capacity: 1000,
                pricePerDay: 500000,
                description: 'Traditional royal palace with historical architecture',
                amenities: ['Royal Decor', 'Parking', 'Catering', 'Accommodation'],
                images: ['palace1.jpg', 'palace2.jpg']
            },
            {
                name: 'Beach Side Resort',
                type: 'Beach Venue',
                location: 'Goa',
                capacity: 300,
                pricePerDay: 120000,
                description: 'Scenic beach venue with sunset views',
                amenities: ['Beach Access', 'Parking', 'Catering', 'Rooms'],
                images: ['beach1.jpg', 'beach2.jpg']
            },
            {
                name: 'Mountain View Retreat',
                type: 'Hill Station Venue',
                location: 'Mussoorie, Uttarakhand',
                capacity: 200,
                pricePerDay: 80000,
                description: 'Peaceful mountain venue with natural beauty',
                amenities: ['Mountain View', 'Parking', 'Catering', 'Accommodation'],
                images: ['mountain1.jpg', 'mountain2.jpg']
            },
            {
                name: 'Grand Ballroom Hotel',
                type: 'Hotel Ballroom',
                location: 'Bangalore, Karnataka',
                capacity: 600,
                pricePerDay: 180000,
                description: 'Modern hotel ballroom with luxury facilities',
                amenities: ['Air Conditioning', 'Parking', 'Catering', 'Rooms'],
                images: ['ballroom1.jpg', 'ballroom2.jpg']
            },
            {
                name: 'Traditional Mandap Center',
                type: 'Traditional Venue',
                location: 'Kolkata, West Bengal',
                capacity: 400,
                pricePerDay: 100000,
                description: 'Authentic Bengali traditional wedding venue',
                amenities: ['Traditional Decor', 'Parking', 'Catering'],
                images: ['traditional1.jpg', 'traditional2.jpg']
            },
            {
                name: 'Lakeside Pavilion',
                type: 'Waterfront Venue',
                location: 'Udaipur, Rajasthan',
                capacity: 350,
                pricePerDay: 160000,
                description: 'Beautiful lakeside venue with romantic ambiance',
                amenities: ['Lake View', 'Parking', 'Catering', 'Boating'],
                images: ['lake1.jpg', 'lake2.jpg']
            },
            {
                name: 'City Convention Center',
                type: 'Convention Center',
                location: 'Chennai, Tamil Nadu',
                capacity: 1000,
                pricePerDay: 250000,
                description: 'Modern convention center with advanced facilities',
                amenities: ['AC', 'Parking', 'Catering', 'Audio Visual'],
                images: ['convention1.jpg', 'convention2.jpg']
            },
            {
                name: 'Farmhouse Estate',
                type: 'Farmhouse',
                location: 'Ludhiana, Punjab',
                capacity: 450,
                pricePerDay: 90000,
                description: 'Spacious farmhouse with rural charm',
                amenities: ['Garden', 'Parking', 'Catering', 'Farm Stay'],
                images: ['farm1.jpg', 'farm2.jpg']
            }
        ];

        await Venue.insertMany(venues);
        console.log('✅ Created 10 venues');

        // Create 5 Dummy DJs
        const djs = [
            {
                name: 'DJ Rockstar Entertainment',
                location: 'Mumbai, Maharashtra',
                pricePerEvent: 50000,
                description: 'Professional DJ service with latest equipment',
                musicGenres: ['Bollywood', 'EDM', 'Hip Hop', 'Classical'],
                equipment: ['DJ Console', 'Speakers', 'Lights', 'Smoke Machine'],
                images: ['dj1.jpg', 'dj2.jpg']
            },
            {
                name: 'Beat Masters DJ',
                location: 'Delhi, NCR',
                pricePerEvent: 45000,
                description: 'Experienced DJs for all types of events',
                musicGenres: ['Bollywood', 'Punjabi', 'Sufi', 'International'],
                equipment: ['DJ Console', 'Speakers', 'LED Lights', 'Fog Machine'],
                images: ['dj3.jpg', 'dj4.jpg']
            },
            {
                name: 'Royal Beats DJ Service',
                location: 'Jaipur, Rajasthan',
                pricePerEvent: 35000,
                description: 'Traditional and modern music fusion',
                musicGenres: ['Rajasthani Folk', 'Bollywood', 'Classical', 'Western'],
                equipment: ['DJ Console', 'Speakers', 'Traditional Instruments'],
                images: ['dj5.jpg', 'dj6.jpg']
            },
            {
                name: 'Coastal Vibes DJ',
                location: 'Goa',
                pricePerEvent: 40000,
                description: 'Beach party specialists with tropical vibes',
                musicGenres: ['Goan', 'Trance', 'House', 'Bollywood'],
                equipment: ['DJ Console', 'Beach Speakers', 'Lights', 'Coconut Bar'],
                images: ['dj7.jpg', 'dj8.jpg']
            },
            {
                name: 'Tech House DJ',
                location: 'Bangalore, Karnataka',
                pricePerEvent: 55000,
                description: 'Modern electronic music specialists',
                musicGenres: ['Techno', 'House', 'EDM', 'Bollywood Remix'],
                equipment: ['Advanced DJ Console', 'Professional Speakers', 'Laser Lights'],
                images: ['dj9.jpg', 'dj10.jpg']
            }
        ];

        await DJ.insertMany(djs);
        console.log('✅ Created 5 DJs');

        console.log('🎉 Database seeded successfully!');
        console.log('📊 Summary:');
        console.log('   - 1 Admin user');
        console.log('   - 10 Venues');
        console.log('   - 5 DJs');
        
        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding database:', error);
        process.exit(1);
    }
};

// Run the seed
seedData();
