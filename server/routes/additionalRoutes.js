const express = require('express');
const router = express.Router();
const { createMessage, getMessages } = require('../controllers/messageController');
const { getSettings, updateSetting } = require('../controllers/settingsController');
const { processMPesa, processPaypal, processStripe } = require('../controllers/paymentController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/messages', createMessage);
router.get('/messages', authMiddleware, getMessages);

router.get('/settings', authMiddleware, getSettings);
router.post('/settings', authMiddleware, updateSetting);

router.post('/payment/mpesa', processMPesa);
router.post('/payment/paypal', processPaypal);
router.post('/payment/stripe', processStripe);

module.exports = router;
