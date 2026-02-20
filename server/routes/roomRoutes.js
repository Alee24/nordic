const express = require('express');
const router = express.Router();
const { getRooms, createRoom } = require('../controllers/roomsController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/rooms', getRooms); // Public or Protected? Let's make public for now
router.post('/rooms', authMiddleware, createRoom);

module.exports = router;
