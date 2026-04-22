const mongoose = require('mongoose');

const MilestoneSchema = new mongoose.Schema({
    contract: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Contract',
        required: true
    },
    stageName: {
        type: String,
        required: true // e.g. "Sowing", "Crop Growth", "Harvest", "Delivery"
    },
    percentage: {
        type: Number,
        required: true // e.g. 40 for 40%
    },
    requiredAmount: {
        type: Number,
        required: true // Absolute value
    },
    fundingStatus: {
        type: String,
        enum: ['Pending', 'Funded'],
        default: 'Pending'
    },
    isActivated: {
        type: Boolean,
        default: false // Activated when previous stage completes OR contract starts
    },
    verificationStatus: {
        type: String,
        enum: ['Pending', 'Submitted', 'Verified', 'Rejected'],
        default: 'Pending'
    },
    evidenceUrls: [String],
    verificationNotes: String,
    verifiedAt: Date,
    verifiedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, { timestamps: true });

module.exports = mongoose.model('Milestone', MilestoneSchema);
