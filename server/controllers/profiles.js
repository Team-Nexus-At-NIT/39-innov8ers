const BuyerProfile = require('../models/BuyerProfile');
const FarmerProfile = require('../models/FarmerProfile');
const asyncHandler = require('../middleware/async');

// @desc    Create or Update Farmer Profile
// @route   POST /api/profiles/farmer
// @access  Private (Farmer)
exports.updateFarmerProfile = asyncHandler(async (req, res, next) => {
    req.body.user = req.user.id;
    let profile = await FarmerProfile.findOne({ user: req.user.id });
    if (profile) {
        profile = await FarmerProfile.findOneAndUpdate({ user: req.user.id }, req.body, { new: true, runValidators: true });
    } else {
        profile = await FarmerProfile.create(req.body);
    }
    res.status(200).json({ success: true, data: profile });
});

// @desc    Create or Update Buyer Profile
// @route   POST /api/profiles/buyer
// @access  Private (Buyer)
exports.updateBuyerProfile = asyncHandler(async (req, res, next) => {
    req.body.user = req.user.id;
    let profile = await BuyerProfile.findOne({ user: req.user.id });
    if (profile) {
        profile = await BuyerProfile.findOneAndUpdate({ user: req.user.id }, req.body, { new: true, runValidators: true });
    } else {
        profile = await BuyerProfile.create(req.body);
    }
    res.status(200).json({ success: true, data: profile });
});

// @desc    Get Current User Profile
// @route   GET /api/profiles/me
// @access  Private
exports.getMyProfile = asyncHandler(async (req, res, next) => {
    let profile;
    if (req.user.role === 'farmer') {
        profile = await FarmerProfile.findOne({ user: req.user.id }).populate('user', 'name email phone role');
    } else if (req.user.role === 'buyer') {
        profile = await BuyerProfile.findOne({ user: req.user.id }).populate('user', 'name email phone role');
    }

    if (!profile) {
        return res.status(200).json({ success: true, data: null }); // Return null instead of 404 to handle "create profile" UI
    }

    res.status(200).json({
        success: true,
        data: profile
    });
});

// @desc    Get Profile by User ID
// @route   GET /api/profiles/user/:userId
// @access  Private
exports.getUserProfile = asyncHandler(async (req, res, next) => {
    const User = require('../models/User'); // Lazy load
    const mongoose = require('mongoose');

    if (!req.params.userId || !mongoose.Types.ObjectId.isValid(req.params.userId)) {
        return res.status(400).json({ success: false, error: 'Invalid user ID' });
    }

    const user = await User.findById(req.params.userId);

    if (!user) {
        return res.status(404).json({ success: false, error: 'User not found' });
    }

    let profile;
    if (user.role === 'farmer') {
        profile = await FarmerProfile.findOne({ user: user._id }).populate('user', 'name email phone location role');
    } else if (user.role === 'buyer') {
        profile = await BuyerProfile.findOne({ user: user._id }).populate('user', 'name email phone address role');
    }

    if (!profile) {
        // If no detailed profile exists, returns basic user info wrapped
        return res.status(200).json({
            success: true,
            data: {
                user: user,
                isBasic: true
            }
        });
    }

    // === TRUST METRICS CALCULATION ===
    const Contract = require('../models/Contract');

    // 1. Total Contracts
    const totalContracts = await Contract.countDocuments({
        $or: [{ farmer: user._id }, { buyer: user._id }],
        status: { $in: ['Completed', 'Fulfilled', 'Delivered'] }
    });

    // 2. Mock Dispute Ratio (Real implementation would query Dispute collection)
    const disputeRatio = totalContracts > 0 ? 0 : 0;

    // 3. Average Rating (Real-time calculation)
    const Review = require('../models/Review');
    const reviewStats = await Review.aggregate([
        { $match: { reviewee: user._id } },
        { $group: { _id: null, avgRating: { $avg: '$rating' }, count: { $sum: 1 } } }
    ]);
    const avgRating = reviewStats.length > 0 ? (Math.round(reviewStats[0].avgRating * 10) / 10) : 0;
    const reviewCount = reviewStats.length > 0 ? reviewStats[0].count : 0;

    // 3. Attach to response
    const responseData = profile.toObject ? profile.toObject() : profile;
    responseData.trustMetrics = {
        totalContracts,
        disputeRatio: disputeRatio + '%',
        memberSince: user.createdAt,
        avgRating,
        reviewCount
    };

    res.status(200).json({
        success: true,
        data: responseData
    });
});
