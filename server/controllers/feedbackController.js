const Feedback = require('../models/Feedback');

// Submit feedback about the app
// POST /api/feedback
// Private
exports.submitFeedback = async (req, res) => {
    try {
        const { type, message } = req.body;
        const userId = req.user.id; // From protect middleware

        if (!type || !message) {
            return res.status(400).json({ success: false, error: 'Please provide a type and a message.' });
        }

        const feedback = await Feedback.create({
            user: userId,
            type,
            message
        });

        res.status(201).json({
            success: true,
            data: feedback
        });

    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};