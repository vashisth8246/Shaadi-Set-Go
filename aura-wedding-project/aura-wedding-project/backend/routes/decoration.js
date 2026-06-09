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

router.get('/', async (req, res) => {
    try {
        const vendors = await Vendor.find({
            businessType: 'decoration',
            'approval.status': 'approved'
        }).sort({ businessName: 1 });
        const mapped = vendors.map(v => ({
            _id: v._id,
            businessName: v.businessName,
            description: v.description,
            location: getVendorCity(v)
                ? [getVendorCity(v), v.address?.state].filter(Boolean).join(', ')
                : 'Multiple Locations',
            pricing: v.pricing,
            services: v.services,
            images: Array.isArray(v.images) ? v.images.filter(Boolean) : [],
            contact: v.contact,
            address: v.address
        }));
        res.json(mapped);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching decoration', error: error.message });
    }
});

module.exports = router;
