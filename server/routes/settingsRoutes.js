const express = require('express');
const router = express.Router();
const { getSmtpSettings, saveSmtpSettings, testSmtpSettings } = require('../controllers/settingsController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/settings/smtp', authMiddleware, getSmtpSettings);
router.put('/settings/smtp', authMiddleware, saveSmtpSettings);
router.post('/settings/smtp/test', authMiddleware, testSmtpSettings);

module.exports = router;
