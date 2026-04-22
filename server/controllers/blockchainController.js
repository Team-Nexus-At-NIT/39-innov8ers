const asyncHandler = require('../middleware/async');
const fabricService = require('../services/fabricService');
const Contract = require('../models/Contract');

// @desc    Get Blockchain Certificate for a Contract
// @route   GET /api/blockchain/:contractId
// @access  Private
exports.getContractCertificate = asyncHandler(async (req, res, next) => {
    const { contractId } = req.params;

    // 1. Verify existence in local DB first
    // const localContract = await Contract.findById(contractId);
    // if (!localContract) {
    //     return res.status(404).json({ success: false, error: 'Contract not found' });
    // }

    try {
        // 2. Query Ledger
        const resultBuffer = await fabricService.evaluateTransaction('readContract', contractId);
        const certificateData = JSON.parse(resultBuffer);

        res.status(200).json({
            success: true,
            data: certificateData
        });
    } catch (error) {
        console.error("Blockchain Read Error:", error);
        res.status(404).json({
            success: false,
            error: 'Blockchain record not found. The contract may not be finalized on-chain yet.'
        });
    }
});
