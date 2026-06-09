const express = require('express');
const Booking = require('../models/Booking');
const Vendor = require('../models/Vendor');
const nodemailer = require('nodemailer');
const { auth, adminAuth, vendorAuth } = require('../middleware/auth');

const router = express.Router();

const normalizeServiceType = (value = '') => {
    const normalized = String(value).trim().toLowerCase();

    if (normalized.includes('venue')) return 'venue';
    if (normalized.includes('catering')) return 'catering';
    if (normalized.includes('photo')) return 'photography';
    if (normalized.includes('decor')) return 'decoration';
    if (normalized.includes('dj')) return 'dj';
    if (normalized.includes('music')) return 'music';
    if (normalized.includes('makeup') || normalized.includes('hair')) return 'hair_makeup';

    return normalized || 'venue';
};

const bookingCanBeModifiedByCustomer = (status) => !['confirmed', 'completed'].includes(status);

const buildVendorMatchFilter = (vendorIds, vendorTypes) => ({
    $or: [
        {
            vendorId: { $in: vendorIds }
        },
        {
            status: 'open',
            vendorId: null,
            serviceType: { $in: vendorTypes },
            declinedVendorIds: { $nin: vendorIds }
        }
    ]
});

const getOwnedApprovedVendors = async (userId) => Vendor.find({
    userId,
    'approval.status': 'approved'
});

const sendBookingEmail = async (booking, customer, vendorName) => {
    if (process.env.NODE_ENV === 'test') {
        return;
    }

    let transporter;
    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
        transporter = nodemailer.createTransport({
            service: 'outlook',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });
    } else {
        const account = await nodemailer.createTestAccount();
        transporter = nodemailer.createTransport({
            host: account.smtp.host,
            port: account.smtp.port,
            secure: account.smtp.secure,
            auth: {
                user: account.user,
                pass: account.pass
            }
        });
    }

    await transporter.sendMail({
        from: process.env.EMAIL_USER || 'no-reply@shaddisetgo.com',
        to: ['tempacccount2468@outlook.com', customer.email],
        subject: 'Booking Request Submitted - ShaddiSetGo',
        text: `Hello ${customer.fullName},\n\nYour booking request has been submitted successfully.\n\nService: ${booking.serviceType}\nVendor: ${vendorName}\nStatus: ${booking.status}\n\nWe will keep you posted as vendors respond.`,
        html: `<p>Hello <b>${customer.fullName}</b>,</p><p>Your booking request has been submitted successfully.</p><p><b>Service:</b> ${booking.serviceType}<br/><b>Vendor:</b> ${vendorName}<br/><b>Status:</b> ${booking.status}</p><p>We will keep you posted as vendors respond.</p>`
    });
};

// Create new booking request
router.post('/', auth, async (req, res) => {
    try {
        let selectedVendor = null;
        const normalizedServiceType = normalizeServiceType(req.body.serviceType);

        if (req.body.vendorId) {
            selectedVendor = await Vendor.findById(req.body.vendorId);
            if (!selectedVendor) {
                return res.status(404).json({ message: 'Vendor not found' });
            }

            if (selectedVendor.approval?.status !== 'approved') {
                return res.status(400).json({ message: 'This vendor is not approved for booking yet' });
            }
        }

        const bookingData = {
            ...req.body,
            vendorId: selectedVendor?._id || null,
            serviceType: selectedVendor ? normalizeServiceType(selectedVendor.businessType) : normalizedServiceType,
            userId: req.user._id,
            status: 'open',
            declinedVendorIds: []
        };

        const booking = new Booking(bookingData);
        await booking.save();
        await booking.populate('vendorId', 'businessName businessType contact');

        sendBookingEmail(booking, req.user, selectedVendor?.businessName || 'Open request')
            .catch((error) => console.error('Booking email failed:', error.message));

        res.status(201).json({
            message: 'Booking request created successfully',
            booking
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Get all bookings (admin only)
router.get('/', adminAuth, async (req, res) => {
    try {
        const bookings = await Booking.find()
            .populate('userId', 'fullName email')
            .populate('vendorId', 'businessName businessType contact')
            .sort({ createdAt: -1 });

        res.json(bookings);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Get user's bookings
router.get('/my', auth, async (req, res) => {
    try {
        const bookings = await Booking.find({ userId: req.user._id })
            .populate('vendorId', 'businessName businessType contact')
            .sort({ createdAt: -1 });

        res.json(bookings);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Get bookings relevant to the vendor owner
router.get('/vendor/my', vendorAuth, async (req, res) => {
    try {
        const ownedVendors = await getOwnedApprovedVendors(req.user._id);
        const vendorIds = ownedVendors.map((vendor) => vendor._id);
        const vendorTypes = [...new Set(ownedVendors.map((vendor) => normalizeServiceType(vendor.businessType)))];

        if (vendorIds.length === 0 || vendorTypes.length === 0) {
            return res.json([]);
        }

        const bookings = await Booking.find(buildVendorMatchFilter(vendorIds, vendorTypes))
            .populate('userId', 'fullName email phone')
            .populate('vendorId', 'businessName businessType contact')
            .sort({ createdAt: -1 });

        res.json(bookings);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Vendor updates booking request status
router.patch('/:id/vendor-status', vendorAuth, async (req, res) => {
    try {
        const { status, rejectionReason } = req.body;

        if (!['confirmed', 'rejected'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status update' });
        }

        const ownedVendors = await getOwnedApprovedVendors(req.user._id);
        const vendorIds = ownedVendors.map((vendor) => String(vendor._id));
        const vendorTypeMap = new Map(
            ownedVendors.map((vendor) => [String(vendor._id), normalizeServiceType(vendor.businessType)])
        );

        if (vendorIds.length === 0) {
            return res.status(403).json({ message: 'You need an approved vendor profile to manage booking requests' });
        }

        const booking = await Booking.findById(req.params.id).populate('vendorId userId');
        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        const bookingServiceType = normalizeServiceType(booking.serviceType);
        let matchedVendor = null;

        if (booking.vendorId) {
            if (!vendorIds.includes(String(booking.vendorId._id))) {
                return res.status(403).json({ message: 'You can only manage your own booking requests' });
            }
            matchedVendor = ownedVendors.find((vendor) => String(vendor._id) === String(booking.vendorId._id)) || null;
        } else {
            matchedVendor = ownedVendors.find((vendor) => vendorTypeMap.get(String(vendor._id)) === bookingServiceType) || null;
            if (!matchedVendor) {
                return res.status(403).json({ message: 'This booking request does not match your service category' });
            }
        }

        if (status === 'confirmed') {
            if (booking.status === 'confirmed' && String(booking.vendorId?._id || booking.vendorId) !== String(matchedVendor._id)) {
                return res.status(409).json({ message: 'This booking request has already been confirmed by another vendor' });
            }

            booking.vendorId = matchedVendor._id;
            booking.status = 'confirmed';
            booking.rejectionReason = undefined;
            booking.declinedVendorIds = (booking.declinedVendorIds || []).filter(
                (vendorId) => String(vendorId) !== String(matchedVendor._id)
            );
        } else if (booking.vendorId) {
            booking.status = 'rejected';
            booking.rejectionReason = rejectionReason || 'Vendor is unavailable for this request.';
        } else {
            const declinedIds = new Set((booking.declinedVendorIds || []).map((vendorId) => String(vendorId)));
            declinedIds.add(String(matchedVendor._id));
            booking.declinedVendorIds = [...declinedIds];
        }

        await booking.save();
        await booking.populate('vendorId', 'businessName businessType contact');

        res.json({
            message: status === 'confirmed' ? 'Booking confirmed successfully' : 'Booking response saved successfully',
            booking
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Update booking (customer only)
router.put('/:id', auth, async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id);
        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        if (String(booking.userId) !== String(req.user._id)) {
            return res.status(403).json({ message: 'You can only update your own bookings' });
        }

        if (!bookingCanBeModifiedByCustomer(booking.status)) {
            return res.status(400).json({ message: `Cannot update a ${booking.status} booking` });
        }

        const fieldsToUpdate = ['weddingDate', 'guests', 'budget', 'location', 'specialRequests', 'fullName', 'email', 'phone'];
        for (const field of fieldsToUpdate) {
            if (req.body[field] !== undefined) {
                booking[field] = req.body[field];
            }
        }

        if (req.body.serviceType) {
            booking.serviceType = normalizeServiceType(req.body.serviceType);
        }

        if (req.body.categoryDetails !== undefined) {
            booking.categoryDetails = req.body.categoryDetails;
        }

        await booking.save();
        await booking.populate('vendorId', 'businessName businessType contact');

        res.json({
            message: 'Booking updated successfully',
            booking
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Delete booking (customer only)
router.delete('/:id', auth, async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id);
        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        if (String(booking.userId) !== String(req.user._id)) {
            return res.status(403).json({ message: 'You can only delete your own bookings' });
        }

        if (!bookingCanBeModifiedByCustomer(booking.status)) {
            return res.status(400).json({ message: `Cannot delete a ${booking.status} booking` });
        }

        await Booking.findByIdAndDelete(req.params.id);
        res.json({ message: 'Booking deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Get booking statistics (admin only)
router.get('/stats', adminAuth, async (req, res) => {
    try {
        const totalBookings = await Booking.countDocuments();
        const openBookings = await Booking.countDocuments({ status: 'open' });
        const confirmedBookings = await Booking.countDocuments({ status: 'confirmed' });
        const completedBookings = await Booking.countDocuments({ status: 'completed' });
        const cancelledBookings = await Booking.countDocuments({ status: 'cancelled' });

        const totalRevenue = await Booking.aggregate([
            { $match: { status: 'confirmed' } },
            { $group: { _id: null, total: { $sum: '$totalAmount' } } }
        ]);

        res.json({
            totalBookings,
            openBookings,
            pendingBookings: openBookings,
            confirmedBookings,
            completedBookings,
            cancelledBookings,
            totalRevenue: totalRevenue[0]?.total || 0
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

module.exports = router;
