const express = require('express');
const {
    createCrop,
    addCropUpdate,
    getCrop
} = require('../controllers/crops');

const router = express.Router();
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.post('/', authorize('farmer'), createCrop);
router.get('/:id', getCrop);
router.put('/:id/update', authorize('farmer'), addCropUpdate);

module.exports = router;
