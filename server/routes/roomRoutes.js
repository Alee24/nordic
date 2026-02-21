const express = require('express');
const router = express.Router();
const { getRooms, createRoom, updateRoom, deleteRoom } = require('../controllers/roomsController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/rooms', getRooms);                          // Public – rooms visible on booking page
router.post('/rooms', authMiddleware, createRoom);       // Admin only
router.put('/rooms/:id', authMiddleware, updateRoom);    // Admin only
router.delete('/rooms/:id', authMiddleware, deleteRoom); // Admin only

module.exports = router;
