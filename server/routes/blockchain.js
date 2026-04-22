const express = require('express');
const { getContractCertificate } = require('../controllers/blockchainController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.get('/:contractId', getContractCertificate);

module.exports = router;
