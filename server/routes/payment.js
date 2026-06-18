const express = require('express');
const { createPayPalOrder, capturePayPalOrder } = require('../controllers/paymentController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Retrieve PayPal Client ID configuration
router.get('/config', protect, (req, res) => {
    res.json({ clientId: process.env.PAYPAL_CLIENT_ID || 'sb' });
});

router.post('/create-paypal-order/:rideId', protect, createPayPalOrder);
router.post('/capture-paypal-order/:orderId', protect, capturePayPalOrder);

module.exports = router;