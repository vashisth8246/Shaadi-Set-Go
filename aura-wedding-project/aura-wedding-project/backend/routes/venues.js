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

// Get all venues
router.get('/', async (req, res) => {
    try {
        console.log('Fetching venues...');
        // Use lean() for better performance on read-only queries and limit results
        let vendors;
        try {
            vendors = await Vendor.find({
                businessType: 'venue',
                'approval.status': 'approved'
            }).lean().sort({ businessName: 1 }).limit(200);
            console.log(`Found ${vendors.length} approved venues`);
        } catch (findErr) {
            console.error('Primary query failed, attempting fast fallback:', findErr.message);
            // Fallback: use raw collection with a short maxTimeMS to return a small sample
            const raw = await Vendor.collection.find({ businessType: 'venue', 'approval.status': 'approved' }, {
                projection: { businessName: 1, pricing: 1, services: 1, address: 1, description: 1, images: 1 }
            }).maxTimeMS(5000).limit(50).toArray();
            vendors = raw;
            console.log(`Fallback returned ${vendors.length} venues`);
        }

        const mappedVenues = vendors.map(v => {
            try {
                return {
                    _id: v._id,
                    name: v.businessName || 'Unknown Venue',
                    type: 'Banquet Hall',
                    city: getVendorCity(v) || 'Multiple Locations',
                    location: getVendorCity(v)
                        ? [getVendorCity(v), v.address?.state].filter(Boolean).join(', ')
                        : 'Multiple Locations',
                    capacity: 500,
                    pricePerDay: v.pricing?.startingPrice || 150000,
                    description: v.description || 'Premium venue for your special day.',
                    amenities: Array.isArray(v.services) ? v.services : [],
                    images: Array.isArray(v.images) ? v.images : []
                };
            } catch (err) {
                console.error(`Error mapping vendor ${v._id}:`, err.message);
                return null;
            }
        }).filter(Boolean);
        
        console.log(`Mapped ${mappedVenues.length} venues successfully`);
        res.json(mappedVenues);
    } catch (error) {
        console.error('Error fetching venues:', error.message, error.stack);
        res.status(500).json({ message: 'Error fetching venues', error: error.message });
    }
});

// Get venue by ID
router.get('/:id', async (req, res) => {
    try {
        const v = await Vendor.findById(req.params.id);
        if (!v || v.businessType !== 'venue' || v.approval?.status !== 'approved') {
            return res.status(404).json({ message: 'Venue not found' });
        }
        res.json({
            _id: v._id,
            name: v.businessName,
            type: 'Banquet Hall',
            city: getVendorCity(v),
            location: getVendorCity(v)
                ? [getVendorCity(v), v.address?.state].filter(Boolean).join(', ')
                : 'Multiple Locations',
            capacity: 500,
            pricePerDay: v.pricing?.startingPrice || 150000,
            description: v.description,
            amenities: v.services,
            images: []
        });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching venue', error: error.message });
    }
});

module.exports = router;
