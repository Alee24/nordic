const express = require('express');
const router = express.Router();
const { subscribe, getAllSubscribers, unsubscribe } = require('../controllers/subscriberController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/', subscribe);
router.get('/', authMiddleware, getAllSubscribers);
router.patch('/unsubscribe', unsubscribe);

module.exports = router;
