const express = require('express');
const router = express.Router();
const { getBookings, createBooking } = require('../controllers/bookingsController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/bookings', authMiddleware, getBookings);
router.post('/bookings', createBooking);

module.exports = router;
