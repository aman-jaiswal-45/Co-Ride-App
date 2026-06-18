const User = require('../models/User');
const Ride = require('../models/Ride');
const Feedback = require('../models/Feedback');

// Get all users
// GET /api/admin/users
// Private/Admin
exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.find({});
        res.status(200).json({ success: true, count: users.length, data: users });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

// Get all rides
// GET /api/admin/rides
// Private/Admin
exports.getAllRides = async (req, res) => {
    try {
        const rides = await Ride.find({}).populate('driver', 'name').populate('passengers', 'name');
        res.status(200).json({ success: true, count: rides.length, data: rides });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

// Get basic stats
// GET /api/admin/stats
// Private/Admin
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

// Get all feedback submissions
// GET /api/admin/feedback
// Private/Admin
exports.getAllFeedback = async (req, res) => {
    try {
        const feedback = await Feedback.find({}).populate('user', 'name email').sort({ createdAt: -1 });
        res.status(200).json({ success: true, count: feedback.length, data: feedback });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};