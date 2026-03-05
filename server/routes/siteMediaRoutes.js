const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
// const authMiddleware = require('../middleware/authMiddleware');

const getDirectories = () => {
    return {
        public: path.join(__dirname, '../../public/images'),
        dist: path.join(__dirname, '../../dist/images')
    };
};

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dirs = getDirectories();
        // Use public dir if available, else dist
        const dest = fs.existsSync(dirs.public) ? dirs.public : dirs.dist;
        if (!fs.existsSync(dest)) {
            fs.mkdirSync(dest, { recursive: true });
        }
        cb(null, dest);
    },
    filename: (req, file, cb) => {
        // If replacing an existing file, req.body.target_filename will be set 
        // stringify target_filename slightly sanitized
        let target = req.body.target_filename;
        if (target) {
            cb(null, path.basename(target));
        } else {
            const ext = path.extname(file.originalname);
            const name = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9.\-_]/g, '_') + ext;
            cb(null, name);
        }
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
    fileFilter: (req, file, cb) => {
        const allowed = /jpeg|jpg|png|gif|webp/i;
        const ext = path.extname(file.originalname).toLowerCase().replace('.', '');
        const mime = file.mimetype;
        if (allowed.test(ext) || allowed.test(mime)) {
            cb(null, true);
        } else {
            cb(new Error(`Only image files (jpg, png, webp, gif) are allowed. Got: ${ext}`));
        }
    }
}).single('image');

// GET all images
router.get('/site-media', async (req, res) => {
    try {
        const dirs = getDirectories();
        const scanDir = fs.existsSync(dirs.public) ? dirs.public : dirs.dist;

        if (!fs.existsSync(scanDir)) {
            return res.json({ success: true, data: { images: [] } });
        }

        const files = fs.readdirSync(scanDir);
        const allowed = /jpeg|jpg|png|gif|webp/i;

        const images = [];
        for (const f of files) {
            if (allowed.test(path.extname(f))) {
                const fullPath = path.join(scanDir, f);
                const stat = fs.statSync(fullPath);
                images.push({
                    filename: f,
                    url: `/images/${f}`,
                    size: stat.size,
                    modified: Math.floor(stat.mtimeMs / 1000)
                });
            }
        }

        // Sort by modified desc
        images.sort((a, b) => b.modified - a.modified);

        res.json({ success: true, data: { images } });
    } catch (error) {
        console.error('get site-media error:', error);
        res.status(500).json({ success: false, error: 'Failed to retrieve images', details: error.message });
    }
});

// POST to upload or replace image
router.post('/site-media', (req, res) => {
    upload(req, res, function (err) {
        if (err) {
            console.error('Upload Error:', err);
            return res.status(400).json({ success: false, error: err.message });
        }

        if (!req.file) {
            return res.status(400).json({ success: false, error: 'No file uploaded' });
        }

        const dirs = getDirectories();
        const primaryDest = req.file.path;

        // If a dist directory also exists (for production dual-writes), copy it there
        if (fs.existsSync(dirs.dist) && primaryDest.includes('public')) {
            const distDest = path.join(dirs.dist, req.file.filename);
            try {
                fs.copyFileSync(primaryDest, distDest);
            } catch (copyErr) {
                console.warn('Could not copy to dist:', copyErr.message);
            }
        }

        res.json({
            success: true,
            data: {
                filename: req.file.filename,
                url: `/images/${req.file.filename}`,
                is_replacement: !!req.body.target_filename
            }
        });
    });
});

// DELETE an image
router.delete('/site-media', (req, res) => {
    try {
        const { filename } = req.body;
        if (!filename) {
            return res.status(400).json({ success: false, error: 'Filename is required' });
        }

        const exactName = path.basename(filename);
        let deleted = false;
        const dirs = getDirectories();

        if (fs.existsSync(dirs.public)) {
            const p = path.join(dirs.public, exactName);
            if (fs.existsSync(p)) {
                fs.unlinkSync(p);
                deleted = true;
            }
        }

        if (fs.existsSync(dirs.dist)) {
            const p = path.join(dirs.dist, exactName);
            if (fs.existsSync(p)) {
                fs.unlinkSync(p);
                deleted = true;
            }
        }

        if (deleted) {
            res.json({ success: true, data: { filename: exactName } });
        } else {
            res.status(404).json({ success: false, error: 'File not found' });
        }
    } catch (error) {
        console.error('delete site-media error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = router;
