const express = require('express');
const mongoose = require('mongoose');
const Quote = require('../models/Quote');
const nodemailer = require('nodemailer');
const router = express.Router();

router.post('/', async (req, res) => {
    try {
        const quote = new Quote(req.body);
        await quote.save();

        nodemailer.createTestAccount((err, account) => {
            if (!err) {
                let transporter = nodemailer.createTransport({
                    host: account.smtp.host,
                    port: account.smtp.port,
                    secure: account.smtp.secure,
                    auth: { user: account.user, pass: account.pass }
                });

                let message = {
                    from: 'Sender Name <sender@example.com>',
                    to: ['tempacccount2468@outlook.com', req.body.email],
                    subject: 'Quote Request - ShaddiSetGo',
                    text: `New Quote Request from ${req.body.fullName}\nService: ${req.body.serviceType}\nMessage: ${req.body.message}\nPhone: ${req.body.phone}`,
                    html: `<p><b>New Quote Request</b></p><p><b>Name:</b> ${req.body.fullName}<br/><b>Service:</b> ${req.body.serviceType}<br/><b>Message:</b> ${req.body.message}</p>`
                };

                transporter.sendMail(message, (err, info) => {
                    if (!err) {
                        console.log('Quote Message sent: %s', info.messageId);
                        console.log('Quote Preview URL: %s', nodemailer.getTestMessageUrl(info));
                    }
                });
            }
        });

        res.status(201).json({ message: 'Quote requested successfully', quote });
    } catch (error) {
        res.status(500).json({ message: 'Error submitting quote', error: error.message });
    }
});

router.get('/', async (req, res) => {
    try {
        const quotes = await Quote.find().sort({ createdAt: -1 });
        res.json(quotes);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching quotes', error: error.message });
    }
});

module.exports = router;
