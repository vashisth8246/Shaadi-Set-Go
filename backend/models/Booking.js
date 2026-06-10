const mongoose = require('mongoose');

const BookingSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    vendorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Vendor',
        default: null
    },
    serviceType: {
        type: String,
        required: true
    },
    fullName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    phone: String,
    weddingDate: {
        type: Date,
        required: true
    },
    guests: {
        type: Number,
        required: true
    },
    location: String,
    budget: Number,
    categoryDetails: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
    },
    specialRequests: String,
    status: {
        type: String,
        enum: ['open', 'confirmed', 'cancelled', 'rejected', 'completed'],
        default: 'open'
    },
    rejectionReason: String,
    declinedVendorIds: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Vendor'
    }],
    totalAmount: Number,
    paymentStatus: {
        type: String,
        enum: ['pending', 'partial', 'paid', 'refunded'],
        default: 'pending'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

BookingSchema.index({ serviceType: 1, status: 1, vendorId: 1 });
BookingSchema.index({ userId: 1, createdAt: -1 });
BookingSchema.index({ declinedVendorIds: 1 });

module.exports = mongoose.model('Booking', BookingSchema);
