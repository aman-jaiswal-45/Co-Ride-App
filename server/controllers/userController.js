const User = require('../models/User');

// Get user profile
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

// Update user profile
exports.updateUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);

        if (user) {
            user.name = req.body.name || user.name;
            user.bio = req.body.bio; // Allow setting bio to empty string
            user.profilePictureUrl = req.body.profilePictureUrl || user.profilePictureUrl;

            // Users can now freely add or update their vehicle details.
            if (req.body.vehicleDetails) {
                user.vehicleDetails = {
                    type: req.body.vehicleDetails.type || (user.vehicleDetails && user.vehicleDetails.type) || 'Car',
                    name: req.body.vehicleDetails.name || (user.vehicleDetails && user.vehicleDetails.name),
                    regNumber: req.body.vehicleDetails.regNumber || (user.vehicleDetails && user.vehicleDetails.regNumber)
                };
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