const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const {
    registerIpn,
    processPesapal,
    pesapalIpn,
    getTransactionStatus,
    testPesapal,
    savePesapalSettings,
    getPesapalSettings,
} = require('../controllers/pesapalController');

// ── Settings (admin only) ────────────────────────────────────────────────────
router.get('/settings/pesapal', authMiddleware, getPesapalSettings);
router.post('/settings/pesapal', authMiddleware, savePesapalSettings);

// ── Test credentials ─────────────────────────────────────────────────────────
router.post('/payment/pesapal/test', authMiddleware, testPesapal);

// ── IPN registration (admin action) ─────────────────────────────────────────
router.post('/payment/pesapal/register-ipn', authMiddleware, registerIpn);

// ── Submit payment order (called from checkout) ──────────────────────────────
router.post('/payment/pesapal', processPesapal);

// ── IPN callback — PesaPal calls this (no auth, must be public) ─────────────
router.get('/payment/pesapal/ipn', pesapalIpn);

// ── Query transaction status ─────────────────────────────────────────────────
router.get('/payment/pesapal/status', getTransactionStatus);

module.exports = router;
