const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const authMiddleware = require('../middleware/authMiddleware');

// Upload directory - served statically by Apache
const UPLOAD_DIR = path.join(__dirname, '../../uploads');
if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, UPLOAD_DIR),
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname).toLowerCase();
        const name = `room_${Date.now()}_${Math.round(Math.random() * 1e6)}${ext}`;
        cb(null, name);
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // Increased to 10MB
    fileFilter: (req, file, cb) => {
        const allowed = /jpeg|jpg|png|gif|webp/;
        const ext = path.extname(file.originalname).toLowerCase();
        if (allowed.test(ext)) {
            cb(null, true);
        } else {
            cb(new Error('Only image files (jpg, png, webp, gif) are allowed'));
        }
    }
}).single('image');

// POST /api/upload - upload a room image
router.post('/upload', authMiddleware, (req, res) => {
    upload(req, res, function (err) {
        if (err instanceof multer.MulterError) {
            console.error('Multer Upload Error:', err);
            return res.status(400).json({ success: false, message: `Upload error: ${err.message}` });
        } else if (err) {
            console.error('General Upload Error:', err);
            return res.status(500).json({ success: false, message: err.message });
        }

        if (!req.file) {
            return res.status(400).json({ success: false, message: 'No file uploaded' });
        }

        console.log('Image uploaded successfully:', req.file.filename);

        // Return the public URL - Apache serves /uploads/ from the project root
        const baseUrl = process.env.SITE_URL || 'https://nordensuites.com';
        const url = `${baseUrl}/uploads/${req.file.filename}`;
        res.json({ success: true, data: { url, filename: req.file.filename } });
    });
});

module.exports = router;
