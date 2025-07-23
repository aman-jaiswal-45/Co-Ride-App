const User = require('../models/User');

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
exports.getUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (user) {
            res.json({ success: true, data: user });
        } else {
            res.status(404).json({ success: false, error: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
exports.updateUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);

        if (user) {
            user.name = req.body.name || user.name;
            user.role = req.body.role || user.role;
            if(req.body.vehicleDetails) {
                user.vehicleDetails.type = req.body.vehicleDetails.type || user.vehicleDetails.type;
                user.vehicleDetails.name = req.body.vehicleDetails.name || user.vehicleDetails.name;
                user.vehicleDetails.regNumber = req.body.vehicleDetails.regNumber || user.vehicleDetails.regNumber;
            }

            const updatedUser = await user.save();
            res.json({ success: true, data: updatedUser });
        } else {
            res.status(404).json({ success: false, error: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};