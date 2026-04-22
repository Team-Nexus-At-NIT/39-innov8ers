const express = require('express');
const { addReview, getReviews } = require('../controllers/reviews');

const router = express.Router();

const { protect } = require('../middleware/auth');

router.post('/', protect, addReview);
router.get('/user/:userId', getReviews);

module.exports = router;
