const mongoose = require('mongoose');

const FeedbackSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    type: {
        type: String,
        enum: ['Bug Report', 'Feature Request', 'General Comment'],
        required: [true, 'Please select a feedback type']
    },
    message: {
        type: String,
        required: [true, 'Please add a message'],
        maxlength: [1000, 'Feedback message cannot be more than 1000 characters']
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Feedback', FeedbackSchema);