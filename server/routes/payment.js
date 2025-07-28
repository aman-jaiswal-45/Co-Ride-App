const express = require('express');
const { createOrder } = require('../controllers/paymentController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/create-order/:rideId', protect, createOrder);

module.exports = router;