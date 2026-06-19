const Review = require('../models/Review');
const Ride = require('../models/Ride');
const User = require('../models/User');

// Get reviews for a user
// GET /api/reviews/user/:userId
// Private
exports.getUserReviews = async (req, res) => {
    try {
        const reviews = await Review.find({ reviewee: req.params.userId }).populate('reviewer', 'name');
        res.status(200).json({ success: true, count: reviews.length, data: reviews });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

// Add a review
// POST /api/reviews
// Private
exports.addReview = async (req, res) => {
    try {
        req.body.reviewer = req.user.id; // Logged in user is the reviewer
        const { ride, reviewee } = req.body;

        const rideDetails = await Ride.findById(ride);
        if (!rideDetails) {
            return res.status(404).json({ success: false, error: 'Ride not found' });
        }

        // Check if ride is completed
        if (rideDetails.status !== 'Completed') {
            return res.status(400).json({ success: false, error: 'You can only review completed rides.' });
        }

        // Check if reviewer was part of the ride
        const isDriver = rideDetails.driver.toString() === req.user.id;
        const isApprovedPassenger = rideDetails.passengers.some(p => p.user.toString() === req.user.id && p.status === 'approved');
        if (!isDriver && !isApprovedPassenger) {
            return res.status(403).json({ success: false, error: 'You were not part of this ride.' });
        }

        // Prevent self-reviewing
        if (req.user.id.toString() === reviewee.toString()) {
            return res.status(400).json({ success: false, error: 'You cannot review yourself.' });
        }

        // Check if reviewee was part of the ride
        const isRevieweeDriver = rideDetails.driver.toString() === reviewee;
        const isRevieweePassenger = rideDetails.passengers.some(p => p.user.toString() === reviewee && p.status === 'approved');
        if (!isRevieweeDriver && !isRevieweePassenger) {
            return res.status(400).json({ success: false, error: 'The user being reviewed was not part of this ride.' });
        }

        const review = await Review.create(req.body);
        res.status(201).json({ success: true, data: review });

    } catch (error) {
        // Handle duplicate key error for unique index
        if (error.code === 11000) {
            return res.status(400).json({ success: false, error: 'You have already submitted a review for this user on this ride.' });
        }
        res.status(400).json({ success: false, error: error.message });
    }
};