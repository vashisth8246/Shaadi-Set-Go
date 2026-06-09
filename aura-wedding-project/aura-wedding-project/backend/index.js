const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

// Import routes
const authRoutes = require('./routes/auth');
const bookingRoutes = require('./routes/bookings');
const vendorRoutes = require('./routes/vendors');
const adminRoutes = require('./routes/admin');
const venueRoutes = require('./routes/venues');
const djRoutes = require('./routes/djs');
const quoteRoutes = require('./routes/quotes');
const checklistRoutes = require('./routes/checklist');
const cateringRoutes = require('./routes/catering');
const photographyRoutes = require('./routes/photography');
const decorationRoutes = require('./routes/decoration');
const uploadRoutes = require('./routes/uploads');
const User = require('./models/User');
const app = express();
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/wedding_vendors_SSG_loc';

const ensureDefaultAdmin = async () => {
    const adminEmail = 'admin@gmail.com';
    const adminPassword = 'admin123';

    // Keep exactly one admin account as requested.
    await User.updateMany({ role: 'admin', email: { $ne: adminEmail } }, { role: 'user' });

    let adminUser = await User.findOne({ email: adminEmail });
    if (!adminUser) {
        adminUser = new User({
            fullName: 'System Admin',
            email: adminEmail,
            password: adminPassword,
            phone: '9999999999',
            role: 'admin'
        });
    } else {
        adminUser.fullName = adminUser.fullName || 'System Admin';
        adminUser.role = 'admin';
        adminUser.password = adminPassword;
    }

    await adminUser.save();
    console.log('✅ Admin credentials ready: admin@gmail.com / admin123');
};

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 1. Connect to MongoDB
// Improve connection resiliency and reduce buffering timeouts
mongoose.set('bufferTimeoutMS', 20000);
const startDatabase = async () => {
    try {
        await mongoose.connect(MONGO_URI, {
            // Wait longer for server selection on local/slow machines
            serverSelectionTimeoutMS: 30000,
            // Keep socket alive longer for large queries
            socketTimeoutMS: 45000
        });
        console.log('✅ MongoDB connected:', MONGO_URI);
        // Ensure indexes are built and default admin exists
        await ensureDefaultAdmin();
    } catch (err) {
        console.log("❌ DB Connection Error:", err);
    }
};

startDatabase();

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/vendors', vendorRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/venues', venueRoutes);
app.use('/api/djs', djRoutes);
app.use('/api/quotes', quoteRoutes);
app.use('/api/checklist', checklistRoutes);
app.use('/api/catering', cateringRoutes);
app.use('/api/photography', photographyRoutes);
app.use('/api/decoration', decorationRoutes);
app.use('/api/uploads', uploadRoutes);

// Legacy booking route (for compatibility)
app.post('/api/save-booking', async (req, res) => {
    try {
        const Booking = require('./models/Booking');
        const newBooking = new Booking(req.body);
        await newBooking.save();
        res.status(200).send({ message: "Success! Booking saved to MongoDB." });
    } catch (error) {
        res.status(500).send({ message: "Error saving data", error });
    }
});

// Start Server only when not running tests
if (process.env.NODE_ENV !== 'test') {
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
        console.log(`🚀 ShaddiSetGO Backend is running on port ${PORT}`);
    });
}

module.exports = app;