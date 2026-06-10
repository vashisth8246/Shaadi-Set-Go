const mongoose = require('mongoose');

const ServiceSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    category: {
        type: String,
        enum: ['venue', 'catering', 'photography', 'music', 'decoration', 'dj'],
        required: true
    },
    description: String,
    price: {
        startingPrice: Number,
        maxPrice: Number,
        pricingType: String
    },
    location: {
        city: String,
        state: String,
        address: String
    },
    features: [String],
    images: [String],
    vendorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Vendor'
    },
    isActive: {
        type: Boolean,
        default: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Service', ServiceSchema);
