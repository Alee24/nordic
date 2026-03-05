const express = require('express');
const router = express.Router();
const {
    getSettings, updateSetting,
    getSmtpSettings, saveSmtpSettings, testSmtpSettings
} = require('../controllers/settingsController');
const authMiddleware = require('../middleware/authMiddleware');

// ── Generic settings (used by PaymentSettingsPage, etc.) ────────────────────
router.get('/settings', authMiddleware, getSettings);
router.post('/settings', authMiddleware, updateSetting);

// ── SMTP ────────────────────────────────────────────────────────────────────
router.get('/settings/smtp', authMiddleware, getSmtpSettings);
router.put('/settings/smtp', authMiddleware, saveSmtpSettings);
router.post('/settings/smtp/test', authMiddleware, testSmtpSettings);

module.exports = router;

