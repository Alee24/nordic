const express = require('express');
const router = express.Router();
const { startAuth, handleCallback, getInventory } = require('../controllers/cloudbedsController');

router.get('/cloudbeds/auth', startAuth);
router.get('/cloudbeds/callback', handleCallback);
router.get('/cloudbeds/inventory', getInventory);

module.exports = router;
