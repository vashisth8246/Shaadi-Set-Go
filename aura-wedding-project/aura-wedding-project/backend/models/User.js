const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { normalizeEmail } = require('../utils/normalization');

const UserSchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    phone: String,
    role: {
        type: String,
        enum: ['user', 'vendor', 'admin'],
        default: 'user'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Hash password before saving (but skip for already hashed passwords)
UserSchema.pre('save', async function() {
    if (this.isModified('email')) {
        this.email = normalizeEmail(this.email);
    }

    if (!this.isModified('password')) return;
    
    // Check if password is already hashed (bcrypt hashes start with $2b$ or $2a$)
    if (this.password.startsWith('$2')) return;
    
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

module.exports = mongoose.model('User', UserSchema);
