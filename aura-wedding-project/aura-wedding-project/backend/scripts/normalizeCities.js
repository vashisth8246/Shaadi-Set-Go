const mongoose = require('mongoose');
const Vendor = require('../models/Vendor');
const { normalizeCityName } = require('../utils/normalization');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/wedding_vendors_SSG_loc';

async function normalizeCities() {
    await mongoose.connect(MONGO_URI);

    const vendors = await Vendor.find({ 'address.city': { $exists: true, $ne: null } });
    let updated = 0;

    for (const vendor of vendors) {
        const normalized = normalizeCityName(vendor.address.city || '');
        if (normalized && normalized !== vendor.address.city) {
            vendor.address.city = normalized;
            await vendor.save();
            updated++;
        }
    }

    console.log('Normalized cities:', updated);
    await mongoose.disconnect();
}

normalizeCities().catch(async (error) => {
    console.error('City normalization failed:', error.message);
    await mongoose.disconnect();
    process.exit(1);
});
