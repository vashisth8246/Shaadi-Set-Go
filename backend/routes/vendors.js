const express = require('express');
const Vendor = require('../models/Vendor');
const User = require('../models/User');
const Location = require('../models/Location');
const { auth, vendorAuth, adminAuth } = require('../middleware/auth');
const { normalizeCityName } = require('../utils/normalization');

const router = express.Router();

const upsertLocationFromVendor = async (vendor) => {
    if (!vendor?.address?.city) return;

    const formattedCity = normalizeCityName(vendor.address.city);
    if (!formattedCity) return;

    await Location.findOneAndUpdate(
        { name: formattedCity },
        { name: formattedCity },
        { upsert: true, new: true }
    );
};

// Create new vendor (vendor registration)
router.post('/register', auth, async (req, res) => {
    try {
        const vendorData = {
            ...req.body,
            userId: req.user._id,
            approval: {
                status: 'pending',
                message: 'Vendor profile submitted. Waiting for admin approval.',
                reviewedAt: null
            }
        };

        if (vendorData.address?.city) {
            vendorData.address.city = normalizeCityName(vendorData.address.city);
        }

        const vendor = new Vendor(vendorData);
        await vendor.save();

        await upsertLocationFromVendor(vendor);

        // Update user role to vendor
        await User.findByIdAndUpdate(req.user._id, { role: 'vendor' });

        res.status(201).json({
            message: 'Vendor registration successful. Awaiting admin approval.',
            vendor
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Get all vendors (public)
router.get('/', async (req, res) => {
    try {
        const { businessType, city } = req.query;
        const filter = {
            'availability.available': true,
            'approval.status': 'approved'
        };

        if (businessType) {
            filter.businessType = businessType;
        }

        if (city) {
            const normalizedCity = normalizeCityName(city);
            filter['address.city'] = normalizedCity;
        }

        const vendors = await Vendor.find(filter)
            .populate('userId', 'fullName email')
            .sort({ 'rating.average': -1, businessName: 1 });

        res.json(vendors);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Get all vendors (admin only)
router.get('/admin/all', adminAuth, async (req, res) => {
    try {
        const vendors = await Vendor.find()
            .populate('userId', 'fullName email')
            .sort({ createdAt: -1 });

        res.json(vendors);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Approve/reject vendor (admin only)
router.patch('/admin/:id/approval', adminAuth, async (req, res) => {
    try {
        const { status, message, rejectionReason } = req.body;

        if (!['approved', 'rejected'].includes(status)) {
            return res.status(400).json({ message: 'Invalid approval status' });
        }

        const vendor = await Vendor.findById(req.params.id).populate('userId', '_id fullName email role');
        if (!vendor) {
            return res.status(404).json({ message: 'Vendor not found' });
        }

        // Auto-delete vendor if rejection, but restore the associated user role first.
        if (status === 'rejected') {
            if (vendor.userId?._id) {
                await User.findByIdAndUpdate(vendor.userId._id, { role: 'user' });
            }
            await Vendor.findByIdAndDelete(req.params.id);
            return res.json({
                message: 'Vendor rejected and automatically removed from system',
                vendor: { _id: req.params.id, status: 'deleted' }
            });
        }

        const approvalMessage =
            message ||
            (status === 'approved'
                ? 'Congratulations! Your vendor profile has been approved and is now visible to customers.'
                : 'Your vendor profile was rejected. Please update details and resubmit.');

        const updatedVendor = await Vendor.findByIdAndUpdate(
            req.params.id,
            {
                approval: {
                    status,
                    message: approvalMessage,
                    rejectionReason: rejectionReason || null,
                    reviewedAt: new Date()
                }
            },
            { new: true }
        ).populate('userId', 'fullName email');

        res.json({
            message: `Vendor ${status} successfully`,
            vendor: updatedVendor
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Get vendor's own listings
router.get('/my', vendorAuth, async (req, res) => {
    try {
        const vendors = await Vendor.find({ userId: req.user._id }).sort({ createdAt: -1 });
        res.json(vendors);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Get single vendor (public - approved only)
router.get('/:id', async (req, res) => {
    try {
        const vendor = await Vendor.findOne({
            _id: req.params.id,
            'approval.status': 'approved'
        }).populate('userId', 'fullName email');

        if (!vendor) {
            return res.status(404).json({ message: 'Vendor not found' });
        }

        res.json(vendor);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Update vendor listing
router.put('/:id', vendorAuth, async (req, res) => {
    try {
        const updateData = { ...req.body };

        if (updateData.address?.city) {
            updateData.address.city = normalizeCityName(updateData.address.city);
        }

        const vendor = await Vendor.findOneAndUpdate(
            { _id: req.params.id, userId: req.user._id },
            updateData,
            { new: true }
        );

        if (!vendor) {
            return res.status(404).json({ message: 'Vendor listing not found' });
        }

        await upsertLocationFromVendor(vendor);

        res.json({
            message: 'Vendor listing updated',
            vendor
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Delete vendor listing
router.delete('/:id', vendorAuth, async (req, res) => {
    try {
        const vendor = await Vendor.findOneAndDelete({
            _id: req.params.id,
            userId: req.user._id
        });

        if (!vendor) {
            return res.status(404).json({ message: 'Vendor listing not found' });
        }

        res.json({ message: 'Vendor listing deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

module.exports = router;
