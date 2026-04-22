const Dispute = require('../models/Dispute');
const asyncHandler = require('../middleware/async');

// @desc    Create Dispute
// @route   POST /api/disputes
// @access  Private (Farmer/Buyer)
exports.createDispute = asyncHandler(async (req, res, next) => {
    req.body.raisedBy = req.user.id;

    const dispute = await Dispute.create(req.body);

    res.status(201).json({
        success: true,
        data: dispute
    });
});

// @desc    Get Disputes
// @route   GET /api/disputes
// @access  Private (Admin see all, Users see theirs)
exports.getDisputes = asyncHandler(async (req, res, next) => {
    let query;

    if (req.user.role === 'admin') {
        query = Dispute.find().populate('raisedBy', 'name role').populate('contract');
    } else {
        query = Dispute.find({ raisedBy: req.user.id }).populate('contract');
    }

    const disputes = await query;

    res.status(200).json({
        success: true,
        count: disputes.length,
        data: disputes
    });
});
// @desc    Update Dispute (Resolve/Review)
// @route   PUT /api/disputes/:id
// @access  Private (Admin)
exports.updateDispute = asyncHandler(async (req, res, next) => {
    let dispute = await Dispute.findById(req.params.id);

    if (!dispute) {
        return res.status(404).json({ success: false, error: 'Dispute not found' });
    }

    // Only admin can update
    if (req.user.role !== 'admin') {
        return res.status(401).json({ success: false, error: 'Not authorized' });
    }

    dispute = await Dispute.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });

    res.status(200).json({
        success: true,
        data: dispute
    });
});
