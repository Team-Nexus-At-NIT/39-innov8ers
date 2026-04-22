const express = require('express');
const {
    createContract,
    getContracts,
    getContract,
    updateContract,
    updateContractFulfillment
} = require('../controllers/contracts');

const router = express.Router();

const { protect } = require('../middleware/auth');

router.use(protect);

router
    .route('/')
    .get(getContracts)
    .post(createContract);

router
    .route('/:id')
    .get(getContract)
    .put(updateContract);

router.route('/:id/fulfillment').put(updateContractFulfillment);

module.exports = router;
