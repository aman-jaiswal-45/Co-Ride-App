const express = require('express');
const { getUserReviews, addReview } = require('../controllers/reviewController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// All routes are protected
router.use(protect);

router.route('/')
    .post(addReview);

router.route('/user/:userId')
    .get(getUserReviews);

module.exports = router;