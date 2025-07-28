const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema({
    rating: {
        type: Number,
        min: 1,
        max: 5,
        required: [true, 'Please add a rating between 1 and 5']
    },
    comment: {
        type: String,
        maxlength: [500, 'Comment cannot be more than 500 characters']
    },
    ride: {
        type: mongoose.Schema.ObjectId,
        ref: 'Ride',
        required: true
    },
    // The user who is being reviewed
    reviewee: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    // The user who is writing the review
    reviewer: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    }
}, {
    timestamps: true
});

// Prevent user from submitting more than one review per ride for another user
ReviewSchema.index({ ride: 1, reviewer: 1, reviewee: 1 }, { unique: true });

// Static method to get avg rating and save
ReviewSchema.statics.getAverageRating = async function(userId) {
    const obj = await this.aggregate([
        {
            $match: { reviewee: userId }
        },
        {
            $group: {
                _id: '$reviewee',
                averageRating: { $avg: '$rating' }
            }
        }
    ]);

    try {
        await this.model('User').findByIdAndUpdate(userId, {
            averageRating: obj[0] ? obj[0].averageRating.toFixed(1) : 0,
            totalRatings: obj[0] ? await this.countDocuments({ reviewee: userId }) : 0
        });
    } catch (err) {
        console.error(err);
    }
};

// Call getAverageRating after save
ReviewSchema.post('save', function() {
    this.constructor.getAverageRating(this.reviewee);
});

// Call getAverageRating before remove
ReviewSchema.pre('remove', function() {
    this.constructor.getAverageRating(this.reviewee);
});

module.exports = mongoose.model('Review', ReviewSchema);