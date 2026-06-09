const express = require('express');
const mongoose = require('mongoose');
const Vendor = require('../models/Vendor');
const { normalizeCityName } = require('../utils/normalization');
const router = express.Router();

const extractCityFromDescription = (description = '') => {
    const match = description.match(/\bin\s+([A-Za-z\s]+?)(?:\.|,|$)/i);
    return match?.[1] ? normalizeCityName(match[1]) : '';
};

const getVendorCity = (vendor) => {
    return normalizeCityName(vendor.address?.city || '') || extractCityFromDescription(vendor.description || '');
};

// Get all DJs
router.get('/', async (req, res) => {
    try {
        const vendors = await Vendor.find({
            businessType: { $in: ['dj', 'music'] },
            'approval.status': 'approved'
        }).sort({ businessName: 1 });
        const mappedDJs = vendors.map(v => ({
            _id: v._id,
            name: v.businessName,
            location: getVendorCity(v)
                ? [getVendorCity(v), v.address?.state].filter(Boolean).join(', ')
                : 'Multiple Locations',
            pricePerEvent: v.pricing?.startingPrice || 50000,
            description: v.description || 'Professional DJ services for events.',
            musicGenres: v.services,
            equipment: ['DJ Console', 'Speakers'],
            images: Array.isArray(v.images) ? v.images.filter(Boolean) : []
        }));
        res.json(mappedDJs);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching DJs', error: error.message });
    }
});

// Get DJ by ID
router.get('/:id', async (req, res) => {
    try {
        const v = await Vendor.findById(req.params.id);
        if (!v || !['dj', 'music'].includes(v.businessType) || v.approval?.status !== 'approved') {
            return res.status(404).json({ message: 'DJ not found' });
        }
        res.json({
            _id: v._id,
            name: v.businessName,
            location: getVendorCity(v)
                ? [getVendorCity(v), v.address?.state].filter(Boolean).join(', ')
                : 'Multiple Locations',
            pricePerEvent: v.pricing?.startingPrice || 50000,
            description: v.description,
            musicGenres: v.services,
            equipment: ['DJ Console', 'Speakers'],
            images: Array.isArray(v.images) ? v.images.filter(Boolean) : []
        });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching DJ', error: error.message });
    }
});

module.exports = router;
