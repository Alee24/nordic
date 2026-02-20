const express = require('express');
const router = express.Router();
const { login, checkAuth } = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/login', login);
router.get('/check', authMiddleware, checkAuth);
router.post('/logout', (req, res) => res.json({ success: true, message: 'Logged out' }));

module.exports = router;
