const User = require('../models/User');
const FarmerProfile = require('../models/FarmerProfile');
const BuyerProfile = require('../models/BuyerProfile');
const asyncHandler = require('../middleware/async');

// @desc    Get all data (Users, Farmers, Buyers)
// @route   GET /api/admin/data
// @access  Protected (Admin)
exports.getAllData = asyncHandler(async (req, res, next) => {
    // Fetch all users
    const users = await User.find().sort('-createdAt');

    // Fetch all profiles
    const farmers = await FarmerProfile.find().populate('user', 'name email phone isVerified');
    const buyers = await BuyerProfile.find().populate('user', 'name email phone isVerified');

    res.status(200).json({
        success: true,
        count: users.length,
        data: {
            users,
            farmers,
            buyers
        }
    });
});

// @desc    Verify User
// @route   PUT /api/admin/verify/:id
// @access  Protected (Admin)
exports.verifyUser = asyncHandler(async (req, res, next) => {
    const user = await User.findById(req.params.id);

    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }

    user.isVerified = true;
    await user.save();

    res.status(200).json({
        success: true,
        data: user,
        message: `User ${user.name} verified successfully`
    });
});

// @desc    Reject/Block User
// @route   PUT /api/admin/reject/:id
// @access  Protected (Admin)
exports.rejectUser = asyncHandler(async (req, res, next) => {
    const user = await User.findById(req.params.id);

    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }

    user.isVerified = false;
    await user.save();

    res.status(200).json({
        success: true,
        data: user,
        message: `User ${user.name} rejected/blocked`
    });
});
