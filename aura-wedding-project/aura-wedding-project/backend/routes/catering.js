const express = require('express');
const mongoose = require('mongoose');
const Vendor = require('../models/Vendor');
const router = express.Router();

router.get('/', async (req, res) => {
    try {
        const vendors = await Vendor.find({
            businessType: 'catering',
            'approval.status': 'approved'
        }).sort({ businessName: 1 });
        res.json(vendors);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching catering', error: error.message });
    }
});

module.exports = router;
