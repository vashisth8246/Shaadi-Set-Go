const express = require('express');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const { auth } = require('../middleware/auth');

const router = express.Router();
const uploadDir = path.join(__dirname, '..', 'uploads');

if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, uploadDir),
    filename: (_req, file, cb) => {
        const ext = path.extname(file.originalname);
        const safeBase = path
            .basename(file.originalname, ext)
            .replace(/[^a-zA-Z0-9_-]/g, '_')
            .slice(0, 40);
        cb(null, `${Date.now()}_${safeBase}${ext}`);
    }
});

const fileFilter = (_req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) {
        return cb(new Error('Only image files are allowed'));
    }
    cb(null, true);
};

const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024,
        files: 10
    }
});

router.post('/images', auth, (req, res) => {
    upload.array('images', 10)(req, res, (err) => {
        if (err) {
            return res.status(400).json({ message: err.message || 'Image upload failed' });
        }

        const files = req.files || [];
        if (!files.length) {
            return res.status(400).json({ message: 'No images uploaded' });
        }

        const baseUrl = `${req.protocol}://${req.get('host')}`;
        const images = files.map((file) => `${baseUrl}/uploads/${file.filename}`);

        return res.status(201).json({ message: 'Images uploaded successfully', images });
    });
});

module.exports = router;
