const User = require('../models/User');
const Ride = require('../models/Ride');
const Feedback = require('../models/Feedback');

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private/Admin
exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.find({});
        res.status(200).json({ success: true, count: users.length, data: users });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

// @desc    Get all rides
// @route   GET /api/admin/rides
// @access  Private/Admin
exports.getAllRides = async (req, res) => {
    try {
        const rides = await Ride.find({}).populate('driver', 'name').populate('passengers', 'name');
        res.status(200).json({ success: true, count: rides.length, data: rides });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

// @desc    Get basic stats
// @route   GET /api/admin/stats
// @access  Private/Admin
exports.getStats = async (req, res) => {
    try {
        const userCount = await User.countDocuments();
        const rideCount = await Ride.countDocuments();
        const completedRides = await Ride.countDocuments({ status: 'Completed' });

        res.status(200).json({
            success: true,
            data: {
                users: userCount,
                rides: rideCount,
                completedRides: completedRides
            }
        });
    } catch (error) {
         res.status(500).json({ success: false, error: 'Server Error' });
    }
};

// @desc    Get all feedback submissions
// @route   GET /api/admin/feedback
// @access  Private/Admin
exports.getAllFeedback = async (req, res) => {
    try {
        const feedback = await Feedback.find({}).populate('user', 'name email').sort({ createdAt: -1 });
        res.status(200).json({ success: true, count: feedback.length, data: feedback });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};