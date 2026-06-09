const mongoose = require('mongoose');
const { normalizeCityName } = require('../utils/normalization');

const VendorSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    businessName: {
        type: String,
        required: true
    },
    businessType: {
        type: String,
        enum: ['venue', 'catering', 'photography', 'music', 'decoration', 'dj', 'hair_makeup'],
        required: true
    },
    description: String,
    address: {
        street: String,
        city: String,
        state: String,
        zipCode: String,
        country: { type: String, default: 'India' }
    },
    contact: {
        phone: String,
        email: String,
        website: String
    },
    pricing: {
        startingPrice: Number,
        pricingType: String
    },
    services: [String],
    images: [String],
    approval: {
        status: {
            type: String,
            enum: ['pending', 'approved', 'rejected'],
            default: 'pending'
        },
        message: {
            type: String,
            default: 'Your profile is under review by admin.'
        },
        rejectionReason: String,
        reviewedAt: Date
    },
    availability: {
        available: { type: Boolean, default: true },
        bookedDates: [Date]
    },
    rating: {
        average: { type: Number, default: 0 },
        count: { type: Number, default: 0 }
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

VendorSchema.pre('save', function() {
    if (this.address?.city) {
        this.address.city = normalizeCityName(this.address.city);
    }
});

VendorSchema.pre(['findOneAndUpdate', 'updateOne', 'updateMany'], function() {
    const update = this.getUpdate() || {};

    if (update.address?.city) {
        update.address.city = normalizeCityName(update.address.city);
    }

    if (update.$set?.address?.city) {
        update.$set.address.city = normalizeCityName(update.$set.address.city);
    }

    this.setUpdate(update);
});

// Add indexes for better query performance
VendorSchema.index({ businessType: 1, 'approval.status': 1 });
VendorSchema.index({ businessType: 1 });
VendorSchema.index({ 'address.city': 1 });
VendorSchema.index({ businessName: 'text', description: 'text' });

module.exports = mongoose.model('Vendor', VendorSchema);
