const Crop = require('../models/Crop');
const asyncHandler = require('../middleware/async');

// @desc    Create Crop Tracking Record (Start a crop cycle for a contract)
// @route   POST /api/crops
// @access  Private (Farmer)
exports.createCrop = asyncHandler(async (req, res, next) => {
    req.body.farmer = req.user.id;
    // req.body.contract is required

    const crop = await Crop.create(req.body);

    res.status(201).json({
        success: true,
        data: crop
    });
});

// @desc    Add Update (Log stage, image, location)
// @route   PUT /api/crops/:id/update
// @access  Private (Farmer)
exports.addCropUpdate = asyncHandler(async (req, res, next) => {
    const crop = await Crop.findById(req.params.id);

    if (!crop) {
        return res.status(404).json({ success: false, error: 'Crop record not found' });
    }

    if (crop.farmer.toString() !== req.user.id) {
        return res.status(401).json({ success: false, error: 'Not authorized' });
    }

    const update = {
        stage: req.body.stage || crop.currentStage,
        description: req.body.description,
        imageUrl: req.body.imageUrl,
        location: req.body.location
    };

    crop.updates.push(update);
    crop.currentStage = req.body.stage || crop.currentStage;

    await crop.save();

    res.status(200).json({
        success: true,
        data: crop
    });
});

// @desc    Get Crop Details
// @route   GET /api/crops/:id
// @access  Private
exports.getCrop = asyncHandler(async (req, res, next) => {
    const crop = await Crop.findById(req.params.id).populate('contract');

    if (!crop) {
        return res.status(404).json({ success: false, error: 'Crop not found' });
    }

    res.status(200).json({
        success: true,
        data: crop
    });
});
