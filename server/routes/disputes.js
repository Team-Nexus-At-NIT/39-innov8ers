const express = require('express');
const {
    createDispute,
    getDisputes,
    updateDispute
} = require('../controllers/disputes');

const router = express.Router();
const { protect } = require('../middleware/auth');

router.use(protect);

router
    .route('/')
    .get(getDisputes)
    .post(createDispute);

router
    .route('/:id')
    .put(updateDispute);

module.exports = router;
