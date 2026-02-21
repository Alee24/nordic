const express = require('express');
const router = express.Router();
const { createMessage, getMessages, updateMessage, deleteMessage } = require('../controllers/messageController');
const { getSettings, updateSetting } = require('../controllers/settingsController');
const {
    processMPesa, testMPesa, mpesaCallback,
    processPaypal, testPaypal,
    processStripe
} = require('../controllers/paymentController');
const authMiddleware = require('../middleware/authMiddleware');

// ── Messages ──────────────────────────────────────────────────────────────
router.post('/messages', createMessage);                              // Public — contact form
router.get('/messages', authMiddleware, getMessages);                 // Admin
router.put('/messages/:id', authMiddleware, updateMessage);           // Admin — mark read/replied/archived
router.delete('/messages/:id', authMiddleware, deleteMessage);        // Admin — delete

// ── Settings ──────────────────────────────────────────────────────────────
router.get('/settings', authMiddleware, getSettings);
router.post('/settings', authMiddleware, updateSetting);

// ── M-Pesa Payments ───────────────────────────────────────────────────────
router.post('/payment/mpesa', authMiddleware, processMPesa);          // Initiate STK Push
router.post('/payment/mpesa/test', authMiddleware, testMPesa);        // Test credentials
router.post('/payment/mpesa/callback', mpesaCallback);                // Safaricom callback (public)

// ── PayPal Payments ───────────────────────────────────────────────────────
router.post('/payment/paypal', authMiddleware, processPaypal);        // Create order
router.post('/payment/paypal/test', authMiddleware, testPaypal);      // Test credentials

// ── Stripe ────────────────────────────────────────────────────────────────
router.post('/payment/stripe', authMiddleware, processStripe);

module.exports = router;
