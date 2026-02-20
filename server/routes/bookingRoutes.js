const express = require('express');
const router = express.Router();
const { getBookings, createBooking, updateBookingStatus, finalizeCheckin } = require('../controllers/bookingsController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/bookings', authMiddleware, getBookings);
router.post('/bookings', createBooking);
router.put('/bookings/:id', authMiddleware, updateBookingStatus);
router.post('/bookings/:id/checkin', authMiddleware, finalizeCheckin);

module.exports = router;
