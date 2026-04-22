const mongoose = require('mongoose');

const CropSchema = new mongoose.Schema({
    contract: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Contract',
        required: true
    },
    farmer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    currentStage: {
        type: String,
        enum: ['Sowing', 'Germination', 'Vegetative', 'Flowering', 'Harvesting', 'Post-Harvest'],
        default: 'Sowing'
    },
    updates: [{
        stage: String,
        date: { type: Date, default: Date.now },
        description: String,
        imageUrl: String,
        location: {
            lat: Number,
            lng: Number
        }
    }],
    healthStatus: {
        type: String, // 'Healthy', 'Disease Risk', etc.
        default: 'Healthy'
    },
    predictedYield: Number
});

module.exports = mongoose.model('Crop', CropSchema);
