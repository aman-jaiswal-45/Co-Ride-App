const User = require('../models/User');
const jwt = require('jsonwebtoken');

// @desc    Register user
exports.register = async (req, res, next) => {
    try {
        const { name, email, password } = req.body; // Role is no longer accepted from user
        const user = await User.create({ name, email, password });
        sendTokenResponse(user, 200, res);
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ success: false, error: 'This email is already registered.' });
        }
        res.status(400).json({ success: false, error: error.message });
    }
};

// @desc    Login user
exports.login = async (req, res, next) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ success: false, error: 'Please provide an email and password' });
    }
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
        return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
        return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }
    sendTokenResponse(user, 200, res);
};

// @desc    Get current logged in user
exports.getMe = async (req, res, next) => {
    const user = await User.findById(req.user.id);
    res.status(200).json({ success: true, data: user });
};

const sendTokenResponse = (user, statusCode, res) => {
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '30d' });
    res.status(statusCode).json({ success: true, token });
};