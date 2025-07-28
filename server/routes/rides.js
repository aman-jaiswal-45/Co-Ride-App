const express = require('express');
const { 
    createRide, getRides, bookRide, getMyOfferedRides, getMyBookedRides,
    startRide, manageBookingRequest, getChatHistory, endRide, createOrder
} = require('../controllers/rideController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();
router.use(protect);

router.route('/').post(createRide).get(getRides);
router.post('/:id/book', bookRide);
router.post('/:id/start', startRide);
router.post('/:id/end', endRide); // <-- ADD THIS LINE
router.put('/:rideId/requests/:passengerId', manageBookingRequest);
router.get('/my-offered-rides', getMyOfferedRides);
router.get('/my-booked-rides', getMyBookedRides);
router.get('/:id/chat', getChatHistory);
router.post('/payments/create-order/:rideId', createOrder);

module.exports = router;