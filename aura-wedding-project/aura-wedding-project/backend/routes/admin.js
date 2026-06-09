const express = require('express');
const fs = require('fs');
const path = require('path');
const User = require('../models/User');
const Booking = require('../models/Booking');
const Vendor = require('../models/Vendor');
const { adminAuth } = require('../middleware/auth');

const router = express.Router();
const realVendorDataDir = path.join(__dirname, '..', '..', 'real vendor JSON data');

const toDate = (value) => {
    if (!value) return new Date();
    if (value instanceof Date) return value;
    if (typeof value === 'string') return new Date(value);
    if (typeof value === 'object' && value.$date) return new Date(value.$date);
    return new Date();
};

const toId = (value, fallback) => {
    if (typeof value === 'string') return value;
    if (value && typeof value === 'object' && value.$oid) return value.$oid;
    return fallback;
};

const normalizeVendorRecord = (vendor, source = 'database', fallbackId = '') => ({
    _id: toId(vendor._id, fallbackId),
    businessName: vendor.businessName,
    businessType: vendor.businessType,
    description: vendor.description || '',
    address: {
        street: vendor.address?.street || '',
        city: vendor.address?.city || '',
        state: vendor.address?.state || '',
        zipCode: vendor.address?.zipCode || '',
        country: vendor.address?.country || 'India'
    },
    contact: {
        phone: vendor.contact?.phone || '',
        email: vendor.contact?.email || '',
        website: vendor.contact?.website || ''
    },
    pricing: {
        startingPrice: vendor.pricing?.startingPrice || 0,
        pricingType: vendor.pricing?.pricingType || 'Per Event'
    },
    services: Array.isArray(vendor.services) ? vendor.services : [],
    images: Array.isArray(vendor.images) ? vendor.images.filter(Boolean) : [],
    approval: source === 'database'
        ? vendor.approval || { status: 'approved', message: 'Imported from dashboard' }
        : {
            status: 'approved',
            message: 'Imported from real vendor JSON data',
            reviewedAt: toDate(vendor.createdAt)
        },
    availability: {
        available: vendor.availability?.available !== false,
        bookedDates: Array.isArray(vendor.availability?.bookedDates) ? vendor.availability.bookedDates : []
    },
    rating: {
        average: vendor.rating?.average || 0,
        count: vendor.rating?.count || 0
    },
    createdAt: toDate(vendor.createdAt),
    source
});

const vendorKey = (vendor) => [
    (vendor.businessName || '').trim().toLowerCase(),
    (vendor.businessType || '').trim().toLowerCase(),
    (vendor.address?.city || '').trim().toLowerCase()
].join('|');

const loadRealVendorCatalog = () => {
    if (!fs.existsSync(realVendorDataDir)) {
        return [];
    }

    const files = fs.readdirSync(realVendorDataDir).filter((file) => file.endsWith('.json'));
    const vendors = [];

    files.forEach((fileName) => {
        const filePath = path.join(realVendorDataDir, fileName);
        const raw = fs.readFileSync(filePath, 'utf-8');
        const parsed = JSON.parse(raw);

        if (!Array.isArray(parsed)) return;

        parsed.forEach((vendor, index) => {
            vendors.push(normalizeVendorRecord(vendor, 'json', `json-${fileName}-${index}`));
        });
    });

    return vendors;
};

const loadMergedVendors = async () => {
    const databaseVendors = await Vendor.find()
        .populate('userId', 'fullName email')
        .sort({ createdAt: -1 });

    const normalizedDatabaseVendors = databaseVendors.map((vendor) =>
        normalizeVendorRecord(vendor.toObject ? vendor.toObject() : vendor, 'database')
    );

    const jsonVendors = loadRealVendorCatalog();
    const merged = new Map();

    [...normalizedDatabaseVendors, ...jsonVendors].forEach((vendor) => {
        const key = vendorKey(vendor);
        const existing = merged.get(key);

        if (!existing || existing.source === 'json') {
            merged.set(key, vendor);
        }
    });

    return Array.from(merged.values()).sort((left, right) => new Date(right.createdAt) - new Date(left.createdAt));
};

// Get dashboard statistics
router.get('/dashboard', adminAuth, async (req, res) => {
    try {
        const totalUsers = await User.countDocuments({ role: 'user' });
        const vendorUsers = await User.countDocuments({ role: 'vendor' });
        const mergedVendors = await loadMergedVendors();
        const totalVendors = mergedVendors.length;
        const totalBookings = await Booking.countDocuments();

        const pendingBookings = await Booking.countDocuments({ status: 'open' });
        const confirmedBookings = await Booking.countDocuments({ status: 'confirmed' });
        const completedBookings = await Booking.countDocuments({ status: 'completed' });

        // Calculate total revenue (simplified)
        const revenueData = await Booking.aggregate([
            { $match: { status: 'confirmed' } },
            { $group: { _id: null, total: { $sum: '$totalAmount' } } }
        ]);

        const totalRevenue = revenueData[0]?.total || 0;

        // Get recent bookings
        const recentBookings = await Booking.find()
            .populate('userId', 'fullName email')
            .populate('vendorId', 'businessName businessType')
            .sort({ createdAt: -1 })
            .limit(10);

        // Get recent users
        const recentUsers = await User.find({ role: 'user' })
            .select('fullName email createdAt')
            .sort({ createdAt: -1 })
            .limit(10);

        // Get recent vendors
        const recentVendors = mergedVendors.slice(0, 10);

        res.json({
            stats: {
                totalUsers,
                vendorUsers,
                totalVendors,
                totalBookings,
                pendingBookings,
                confirmedBookings,
                completedBookings,
                totalRevenue
            },
            recentBookings,
            recentUsers,
            recentVendors
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Get all users
router.get('/users', adminAuth, async (req, res) => {
    try {
        const users = await User.find()
            .select('-password')
            .sort({ createdAt: -1 });

        res.json(users);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Update user role (admin only)
router.patch('/users/:id/role', adminAuth, async (req, res) => {
    try {
        const { role } = req.body;

        if (role === 'admin') {
            const existingAdmin = await User.findOne({ role: 'admin' });
            if (existingAdmin && String(existingAdmin._id) !== req.params.id) {
                return res.status(400).json({ message: 'Only one admin is allowed in the system' });
            }
        }
        
        const user = await User.findByIdAndUpdate(
            req.params.id,
            { role },
            { new: true, select: '-password' }
        );

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json({
            message: 'User role updated',
            user
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Delete user (admin only)
router.delete('/users/:id', adminAuth, async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Also delete related vendor listings if any
        if (user.role === 'vendor') {
            await Vendor.deleteMany({ userId: req.params.id });
        }

        // Also delete related bookings if any
        await Booking.deleteMany({ userId: req.params.id });

        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Get all vendors (admin only)
router.get('/vendors', adminAuth, async (req, res) => {
    try {
        const vendors = await loadMergedVendors();
        res.json(vendors);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Add vendor directly (admin only) — immediately approved and visible to users
router.post('/vendors', adminAuth, async (req, res) => {
    try {
        const vendorData = {
            ...req.body,
            approval: {
                status: 'approved',
                message: 'Added directly by admin.',
                reviewedAt: new Date()
            },
            availability: { available: true, bookedDates: [] }
        };

        // Require a userId — use the admin's own ID as owner
        if (!vendorData.userId) {
            vendorData.userId = req.user._id;
        }

        const vendor = new Vendor(vendorData);
        await vendor.save();

        res.status(201).json({ message: 'Vendor added and approved successfully.', vendor });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Delete vendor (admin only)
router.delete('/vendors/:id', adminAuth, async (req, res) => {
    try {
        const vendor = await Vendor.findByIdAndDelete(req.params.id);
        if (!vendor) {
            return res.status(404).json({ message: 'Vendor not found' });
        }
        res.json({ message: 'Vendor deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

module.exports = router;
