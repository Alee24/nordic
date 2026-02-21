const express = require('express');
const router = express.Router();
const { getStatistics, getRecentBookings, getGuests, getMonthlyRevenue } = require('../controllers/dashboardController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/statistics', authMiddleware, getStatistics);
router.get('/recent-bookings', authMiddleware, getRecentBookings);
router.get('/monthly-revenue', authMiddleware, getMonthlyRevenue);
router.get('/guests', authMiddleware, getGuests);

module.exports = router;
