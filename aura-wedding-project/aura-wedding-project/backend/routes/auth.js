const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { auth } = require('../middleware/auth');
const { normalizeEmail } = require('../utils/normalization');
const nodemailer = require('nodemailer');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'shaddisetgo-secret-key';
const FRONTEND_URL = (process.env.FRONTEND_URL || 'http://localhost:5173').replace(/\/$/, '');

const isValidEmail = (email = '') => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
const isStrongPassword = (password = '') =>
    /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{8,}$/.test(password);

// Generate JWT Token
const generateToken = (userId, role) => {
    return jwt.sign({ userId, role }, JWT_SECRET, { expiresIn: '7d' });
};

// User Registration
router.post('/register', async (req, res) => {
    try {
        const {
            fullName,
            email,
            password,
            confirmPassword,
            phone,
            role = 'user'
        } = req.body;

        const normalizedEmail = normalizeEmail(email);
        const normalizedRole = role === 'vendor' ? 'vendor' : 'user';

        if (!fullName?.trim()) {
            return res.status(400).json({ message: 'Full name is required' });
        }

        if (!isValidEmail(normalizedEmail)) {
            return res.status(400).json({ message: 'Invalid email format' });
        }

        if (!isStrongPassword(password)) {
            return res.status(400).json({
                message: 'Password must be at least 8 characters and include letters and numbers'
            });
        }

        if (confirmPassword !== undefined && password !== confirmPassword) {
            return res.status(400).json({ message: 'Passwords do not match' });
        }

        if (role === 'admin') {
            return res.status(403).json({ message: 'Admin signup is not allowed' });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email: normalizedEmail });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists with this email' });
        }

        // Create new user
        const user = new User({
            fullName,
            email: normalizedEmail,
            password,
            phone,
            role: normalizedRole
        });

        await user.save();

        // Generate token
        const token = generateToken(user._id, user.role);

        res.status(201).json({
            message: 'Registration successful',
            token,
            user: {
                id: user._id,
                fullName: user.fullName,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// User Login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const normalizedEmail = normalizeEmail(email);

        if (!isValidEmail(normalizedEmail)) {
            return res.status(400).json({ message: 'Invalid email format' });
        }

        if (!password) {
            return res.status(400).json({ message: 'Password is required' });
        }

        // Find user by email
        const user = await User.findOne({ email: normalizedEmail });
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Check password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Generate token
        const token = generateToken(user._id, user.role);

        res.json({
            message: 'Login successful',
            token,
            user: {
                id: user._id,
                fullName: user.fullName,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Get current user
router.get('/me', auth, async (req, res) => {
    res.json({
        user: {
            id: req.user._id,
            fullName: req.user.fullName,
            email: req.user.email,
            role: req.user.role
        }
    });
});

// Forgot Password
router.post('/forgot-password', async (req, res) => {
    try {
        const { email } = req.body;
        const normalizedEmail = normalizeEmail(email);

        if (!isValidEmail(normalizedEmail)) {
            return res.status(400).json({ message: 'Invalid email format' });
        }

        const user = await User.findOne({ email: normalizedEmail });
        if (!user) {
            // Return success anyway for security
            return res.json({ message: 'If an account exists, a password reset link has been sent to your email.' });
        }

        // Generate a simple reset token
        const resetToken = jwt.sign({ userId: user._id, type: 'reset' }, JWT_SECRET, { expiresIn: '1h' });

        // Generate Ethereal test account on the fly
        let testAccount = await nodemailer.createTestAccount();

        let transporter = nodemailer.createTransport({
            host: "smtp.ethereal.email",
            port: 587,
            secure: false, // true for 465, false for other ports
            auth: {
                user: testAccount.user, // generated ethereal user
                pass: testAccount.pass, // generated ethereal password
            },
        });

        const resetLink = `${FRONTEND_URL}/reset-password?token=${resetToken}`;

        let info = await transporter.sendMail({
            from: '"ShaddiSetGO Support" <support@shaddisetgo.com>',
            to: user.email,
            subject: "Password Reset Request",
            text: `You requested a password reset. Click the link to reset your password: ${resetLink}`,
            html: `<p>You requested a password reset.</p><p><a href="${resetLink}">Click here to reset your password</a></p><p>This link will expire in 1 hour.</p>`,
        });

        console.log("Password reset email sent: %s", info.messageId);
        console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));

        res.json({ message: 'If an account exists, a password reset link has been sent to your email. (Check backend terminal for preview URL!)' });
    } catch (error) {
        console.error('Error in forgot-password:', error);
        res.status(500).json({ message: 'Failed to process request', error: error.message });
    }
});

router.post('/reset-password', async (req, res) => {
    try {
        const { token, password, confirmPassword } = req.body;

        if (!token) {
            return res.status(400).json({ message: 'Reset token is required' });
        }

        if (!isStrongPassword(password)) {
            return res.status(400).json({
                message: 'Password must be at least 8 characters and include letters and numbers'
            });
        }

        if (password !== confirmPassword) {
            return res.status(400).json({ message: 'Passwords do not match' });
        }

        const decoded = jwt.verify(token, JWT_SECRET);
        if (decoded.type !== 'reset' || !decoded.userId) {
            return res.status(400).json({ message: 'Invalid reset token' });
        }

        const user = await User.findById(decoded.userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        user.password = password;
        await user.save();

        res.json({ message: 'Password updated successfully. Please log in again.' });
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(400).json({ message: 'Reset link has expired. Please request a new one.' });
        }

        if (error.name === 'JsonWebTokenError') {
            return res.status(400).json({ message: 'Invalid reset token' });
        }

        res.status(500).json({ message: 'Failed to reset password', error: error.message });
    }
});

module.exports = router;
