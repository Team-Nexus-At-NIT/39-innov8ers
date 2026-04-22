const mongoose = require('mongoose');

const SchemeSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    provider: {
        type: String, // e.g., "Central Govt", "State Govt"
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true
    },
    benefits: [{
        type: String
    }],
    eligibility: [{
        type: String
    }],
    applicationLink: {
        type: String,
        required: true
    },
    category: {
        type: String,
        enum: ['Subsidy', 'Insurance', 'Credit', 'Training', 'Infrastructure', 'Others', 'Loan'],
        default: 'Others'
    },
    isActive: {
        type: Boolean,
        default: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Scheme', SchemeSchema);
