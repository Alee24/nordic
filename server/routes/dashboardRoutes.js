const express = require('express');
const router = express.Router();
const { getStatistics, getRecentBookings, getGuests } = require('../controllers/dashboardController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/statistics', authMiddleware, getStatistics);
router.get('/recent-bookings', authMiddleware, getRecentBookings);
router.get('/guests', authMiddleware, getGuests);

module.exports = router;
