const express = require('express');
const { 
    createRide, getRides, bookRide, getMyOfferedRides, getMyBookedRides,
    startRide, manageBookingRequest, getChatHistory, endRide, getRide
} = require('../controllers/rideController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();
router.use(protect);

router.route('/').post(createRide).get(getRides);
router.get('/my-offered-rides', getMyOfferedRides);
router.get('/my-booked-rides', getMyBookedRides);
router.route('/:id').get(getRide);
router.post('/:id/book', bookRide);
router.post('/:id/start', startRide);
router.post('/:id/end', endRide); 
router.put('/:rideId/requests/:passengerId', manageBookingRequest);
router.get('/:id/chat', getChatHistory);

module.exports = router;