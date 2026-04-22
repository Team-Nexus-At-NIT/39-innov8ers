const {
    updateFarmerProfile,
    updateBuyerProfile,
    getMyProfile,
    getUserProfile
} = require('../controllers/profiles');

const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.get('/me', getMyProfile);
router.get('/user/:userId', getUserProfile); // New route
router.post('/farmer', authorize('farmer'), updateFarmerProfile);
router.post('/buyer', authorize('buyer'), updateBuyerProfile);

module.exports = router;
