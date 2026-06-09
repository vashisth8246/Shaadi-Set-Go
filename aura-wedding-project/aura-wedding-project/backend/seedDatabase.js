const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Vendor = require('./models/Vendor');
const Booking = require('./models/Booking');

// Connect to database
mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/wedding_vendors_SSG_loc');

// Dummy data
const dummyUsers = [
    {
        fullName: 'Rahul Sharma',
        email: 'rahul@example.com',
        password: 'password123',
        phone: '+91 98765 43210',
        role: 'user'
    },
    {
        fullName: 'Priya Patel',
        email: 'priya@example.com',
        password: 'password123',
        phone: '+91 87654 32109',
        role: 'user'
    },
    {
        fullName: 'Amit Kumar',
        email: 'amit@example.com',
        password: 'password123',
        phone: '+91 76543 21098',
        role: 'user'
    },
    {
        fullName: 'Admin User',
        email: 'admin@shaddisetgo.com',
        password: 'admin123',
        phone: '+91 98765 43211',
        role: 'admin'
    }
];

const dummyVendors = [
    {
        businessName: 'Royal Palace Weddings',
        businessType: 'venue',
        description: 'Luxury wedding palace with modern amenities and traditional charm',
        address: {
            street: 'MG Road',
            city: 'Mumbai',
            state: 'Maharashtra',
            zipCode: '400001'
        },
        contact: {
            phone: '+91 22 2345 6789',
            email: 'info@royalpalace.com',
            website: 'www.royalpalace.com'
        },
        pricing: {
            startingPrice: 500000,
            pricingType: 'per day'
        },
        services: ['Large Banquet Hall', 'Valet Parking', 'Bridal Suites', 'Security'],
        images: ['https://images.unsplash.com/photo-1519225421980-715cb0215aed?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80', 'https://images.unsplash.com/photo-1544598918-05206263fc0e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80'],
        rating: {
            average: 4.8,
            count: 120
        }
    },
    {
        businessName: 'Lakeside Bliss Resort',
        businessType: 'venue',
        description: 'A beautiful waterfront venue providing breathtaking sunset wedding experiences.',
        address: {
            street: 'Marine Drive',
            city: 'Kochi',
            state: 'Kerala',
            zipCode: '682031'
        },
        contact: {
            phone: '+91 48 4345 6789',
            email: 'hello@lakesidebliss.com',
            website: 'www.lakesidebliss.com'
        },
        pricing: {
            startingPrice: 350000,
            pricingType: 'per day'
        },
        services: ['Lake View', 'Outdoor Seating', 'Catering Included', 'Fairy Lights Setup'],
        images: ['https://images.unsplash.com/photo-1511285560929-80b456fea0bc?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80', 'https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80'],
        rating: {
            average: 4.6,
            count: 85
        }
    },
    {
        businessName: 'Royal Feast Caterers',
        businessType: 'catering',
        description: 'Premium North Indian catering featuring authentic flavors and royal presentation',
        address: {
            street: 'Park Street',
            city: 'Kolkata',
            state: 'West Bengal',
            zipCode: '700016'
        },
        contact: {
            phone: '+91 33 2345 6789',
            email: 'orders@royalfeast.com'
        },
        pricing: {
            startingPrice: 1200,
            pricingType: 'per plate'
        },
        services: ['Welcome Drinks: Aam Panna, Blue Lagoon', 'Starters: Paneer Tikka, Hara Bhara Kebab', 'Main: Dal Makhani, Shahi Paneer, Garlic Naan', 'Desserts: Hot Jalebi with Rabri, Rasmalai'],
        images: ['https://images.unsplash.com/photo-1555244162-803834f70033?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80', 'https://images.unsplash.com/photo-1511690656952-34342bb7c2f2?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80'],
        rating: {
            average: 4.9,
            count: 89
        }
    },
    {
        businessName: 'Global Flavors Banquet',
        businessType: 'catering',
        description: 'Multi-cuisine experts bringing the world\'s best dishes to your wedding',
        address: {
            street: 'Banjara Hills',
            city: 'Hyderabad',
            state: 'Telangana',
            zipCode: '500034'
        },
        contact: {
            phone: '+91 40 1234 5678',
            email: 'info@globalflavors.in'
        },
        pricing: {
            startingPrice: 1500,
            pricingType: 'per plate'
        },
        services: ['Soups & Salads: Manchow Soup, Caesar Salad', 'Appetizers: Spring Rolls, Dim Sums', 'Main: Veg Hakka Noodles, Thai Green Curry, Jasmine Rice', 'Dessert Counter: Chocolate Fondue, Tiramisu'],
        images: ['https://images.unsplash.com/photo-1414235077428-338989a2e8c0?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80', 'https://images.unsplash.com/photo-1625631980753-48e025f187a5?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80'],
        rating: {
            average: 4.7,
            count: 110
        }
    },
    {
        businessName: 'Capture Moments Photography',
        businessType: 'photography',
        description: 'Professional wedding photography and cinematic videography services',
        address: {
            street: 'Brigade Road',
            city: 'Bangalore',
            state: 'Karnataka',
            zipCode: '560001'
        },
        contact: {
            phone: '+91 80 2345 6789',
            email: 'hello@capturemoments.com'
        },
        pricing: {
            startingPrice: 85000,
            pricingType: 'package'
        },
        services: ['Pre-wedding shoot', 'Candid Photography', 'Drone Coverage', 'Cinematic Wedding Film'],
        images: ['https://images.unsplash.com/photo-1537633552985-df8429e8048b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80', 'https://images.unsplash.com/photo-1520854221256-17451cc331bf?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80'],
        rating: {
            average: 4.7,
            count: 156
        }
    },
    {
        businessName: 'DJ Night Beats',
        businessType: 'dj',
        description: 'Electrifying DJ services for sangeet and reception parties',
        address: {
            street: 'Connaught Place',
            city: 'New Delhi',
            state: 'Delhi',
            zipCode: '110001'
        },
        contact: {
            phone: '+91 11 2345 6789',
            email: 'bookings@djnightbeats.com'
        },
        pricing: {
            startingPrice: 35000,
            pricingType: 'per event'
        },
        services: ['Bollywood Mix', 'EDM & House', 'Laser Show', 'Live Dhol Integration'],
        images: ['https://images.unsplash.com/photo-1505236858219-8359eb29e329?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80', 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80'],
        rating: {
            average: 4.5,
            count: 78
        }
    },
    {
        businessName: 'Elegant Decorators',
        businessType: 'decoration',
        description: 'Beautiful wedding decoration and exquisite floral arrangements',
        address: {
            street: 'Jubilee Hills',
            city: 'Hyderabad',
            state: 'Telangana',
            zipCode: '500033'
        },
        contact: {
            phone: '+91 40 2345 6789',
            email: 'decorate@elegantdecorators.com'
        },
        pricing: {
            startingPrice: 150000,
            pricingType: 'package'
        },
        services: ['Mandap Decoration', 'Orchid Arrangements', 'Fairy Lighting', 'Theme Decoration'],
        images: ['https://images.unsplash.com/photo-1469334031218-e382a71b716b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80', 'https://images.unsplash.com/photo-1520854221256-17451cc331bf?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80'],
        rating: {
            average: 4.6,
            count: 92
        }
    }
];

const dummyBookings = [
    {
        fullName: 'Rahul Sharma',
        email: 'rahul@example.com',
        phone: '+91 98765 43210',
        weddingDate: new Date('2024-12-15'),
        guests: 200,
        location: 'Mumbai',
        budget: 1000000,
        serviceType: 'venue',
        specialRequests: 'Vegetarian catering required',
        totalAmount: 500000,
        status: 'confirmed'
    },
    {
        fullName: 'Priya Patel',
        email: 'priya@example.com',
        phone: '+91 87654 32109',
        weddingDate: new Date('2024-11-20'),
        guests: 150,
        location: 'Kolkata',
        budget: 800000,
        serviceType: 'catering',
        specialRequests: 'Traditional Bengali menu',
        totalAmount: 120000,
        status: 'pending'
    }
];

// Seed function
async function seedDatabase() {
    try {
        // Clear existing data
        await User.deleteMany({});
        await Vendor.deleteMany({});
        await Booking.deleteMany({});
        
        console.log('Database cleared');

        // Hash passwords for users
        const usersWithHashedPasswords = await Promise.all(
            dummyUsers.map(async (user) => {
                const hashedPassword = await bcrypt.hash(user.password, 10);
                return { ...user, password: hashedPassword };
            })
        );

        // Create users
        const users = await User.create(usersWithHashedPasswords);
        console.log('Users created:', users.length);

        // Create vendors (assign to first user as vendor)
        const vendorUser = users[0];
        const vendorsWithUser = dummyVendors.map(vendor => ({
            ...vendor,
            userId: vendorUser._id,
            approval: {
                status: 'approved',
                message: 'Seed data approved.',
                reviewedAt: new Date()
            }
        }));
        
        const vendors = await Vendor.create(vendorsWithUser);
        console.log('Vendors created:', vendors.length);

        // Create bookings (assign to users and vendors)
        const bookingsWithIds = dummyBookings.map((booking, index) => ({
            ...booking,
            userId: users[index + 1]?._id,
            vendorId: vendors[index]?._id
        }));

        const bookings = await Booking.create(bookingsWithIds);
        console.log('Bookings created:', bookings.length);

        console.log('✅ Database seeded successfully!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding database:', error);
        process.exit(1);
    }
}

seedDatabase();
