const express = require('express');
const {
    createDemand,
    getDemands,
    getMyDemands,
    getRecommendedDemands,
    applyForDemand,
    acceptBid
} = require('../controllers/demands');

const router = express.Router();
const { protect, authorize } = require('../middleware/auth');

router.route('/my').get(protect, getMyDemands);
router.route('/recommend').get(protect, authorize('farmer'), getRecommendedDemands);

router.route('/:id/apply').post(protect, authorize('farmer'), applyForDemand);

router.route('/:id/accept/:bidId').put(protect, authorize('buyer'), acceptBid);

router
    .route('/')
    .get(getDemands)
    .post(protect, authorize('buyer', 'admin'), createDemand);

module.exports = router;
