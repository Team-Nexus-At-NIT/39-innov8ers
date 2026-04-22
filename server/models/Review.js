const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema({
    reviewer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    reviewee: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    contract: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Contract',
        required: true
    },
    rating: {
        type: Number,
        min: 1,
        max: 5,
        required: [true, 'Please add a rating between 1 and 5']
    },
    comment: {
        type: String,
        required: [true, 'Please add a comment'],
        maxlength: 500
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Prevent user from submitting more than one review per contract
ReviewSchema.index({ contract: 1, reviewer: 1 }, { unique: true });

// Static method to get avg rating and save
ReviewSchema.statics.getAverageRating = async function (userId) {
    const obj = await this.aggregate([
        {
            $match: { reviewee: userId }
        },
        {
            $group: {
                _id: '$reviewee',
                averageRating: { $avg: '$rating' },
                count: { $sum: 1 }
            }
        }
    ]);

    try {
        await this.model('User').findByIdAndUpdate(userId, {
            rating: {
                average: obj[0] ? Math.round(obj[0].averageRating * 10) / 10 : 0, // Round to 1 decimal
                count: obj[0] ? obj[0].count : 0
            }
        });
    } catch (err) {
        console.error(err);
    }
};

// Call getAverageRating after save
ReviewSchema.post('save', function () {
    this.constructor.getAverageRating(this.reviewee);
});

// Call getAverageRating before remove
ReviewSchema.pre('remove', function () {
    this.constructor.getAverageRating(this.reviewee);
});

module.exports = mongoose.model('Review', ReviewSchema);
