const express = require('express');
const { getAllUsers, getAllRides, getStats } = require('../controllers/adminController');
const { protect } = require('../middleware/authMiddleware');
const { protectAdmin } = require('../middleware/adminMiddleware');

const router = express.Router();

// All routes in this file are protected and for admins only
router.use(protect, protectAdmin);

router.get('/users', getAllUsers);
router.get('/rides', getAllRides);
router.get('/stats', getStats);

module.exports = router;