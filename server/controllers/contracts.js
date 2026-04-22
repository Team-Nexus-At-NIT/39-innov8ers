const Contract = require('../models/Contract');
const Transaction = require('../models/Transaction');
const Milestone = require('../models/Milestone');
const asyncHandler = require('../middleware/async');

// @desc    Create new contract
// @route   POST /api/contracts
// @access  Private (Farmer/Buyer)
exports.createContract = asyncHandler(async (req, res, next) => {
    // Case 1: Farmer applying to a specific Demand (e.g. from Marketplace)
    if (req.body.demandId) {
        const Demand = require('../models/Demand');
        const demand = await Demand.findById(req.body.demandId);

        if (!demand) {
            return res.status(404).json({ success: false, error: 'Demand not found' });
        }

        // Auto-fill contract details from demand
        req.body.buyer = demand.buyer;
        req.body.farmer = req.user.id;
        req.body.demand = demand._id;

        // Correctly map to Schema Structure
        req.body.cropDetails = {
            cropName: demand.cropName,
            quantity: req.body.quantity || demand.quantityRequired,
            variety: demand.cropDetails?.variety,
            qualitySpecifications: demand.qualitySpecifications
        };

        req.body.pricingTerms = {
            pricePerUnit: demand.pricePerTon,
            unit: 'Quintal', // Default
            priceType: 'Fixed'
        };

        req.body.status = 'Proposed'; // Farmer proposes fulfillment
    }
    // Case 2: Standard creation (Mock/Direct)
    else {
        if (req.user.role === 'farmer') {
            req.body.farmer = req.user.id;
        } else if (req.user.role === 'buyer') {
            req.body.buyer = req.user.id;
        }
    }

    const contract = await Contract.create(req.body);

    const populatedContract = await Contract.findById(contract._id).populate('farmer', 'name').populate('buyer', 'name');

    // Notify Buyer via Socket
    const io = req.app.get('io');
    if (io && req.body.buyer) {
        io.to(req.body.buyer.toString()).emit('contract_proposed', populatedContract);
    }

    res.status(201).json({
        success: true,
        data: contract
    });
});

// @desc    Get all contracts (for user)
// @route   GET /api/contracts
// @access  Private
exports.getContracts = asyncHandler(async (req, res, next) => {
    let query;

    if (req.user.role === 'admin') {
        query = Contract.find();
    } else if (req.user.role === 'farmer') {
        query = Contract.find({ farmer: req.user.id });
    } else {
        console.log('Fetching contracts for Buyer:', req.user.id);
        query = Contract.find({ buyer: req.user.id });
    }

    const contracts = await query.populate('farmer', 'name').populate('buyer', 'name').populate('demand', 'cropName');
    console.log(`Found ${contracts.length} contracts for user ${req.user.id}`);

    res.status(200).json({
        success: true,
        count: contracts.length,
        data: contracts
    });
});

// @desc    Get single contract
// @route   GET /api/contracts/:id
// @access  Private
exports.getContract = asyncHandler(async (req, res, next) => {
    const contract = await Contract.findById(req.params.id)
        .populate('farmer', 'name email phone')
        .populate('buyer', 'name email phone')
        .populate('demand');

    if (!contract) {
        return res.status(404).json({ success: false, error: 'Contract not found' });
    }

    res.status(200).json({
        success: true,
        data: contract
    });
});

// @desc    Update contract (Sign/Status)
// @route   PUT /api/contracts/:id
// @access  Private
exports.updateContract = asyncHandler(async (req, res, next) => {
    let contract = await Contract.findById(req.params.id);

    if (!contract) {
        return res.status(404).json({ success: false, error: 'Contract not found' });
    }

    // Logic for signing
    if (req.body.signature) {
        if (req.user.role === 'farmer' && contract.farmer.toString() === req.user.id) {
            req.body.farmerSigned = true;
            req.body.status = contract.buyerSigned ? 'Active' : 'Proposed';
        } else if (req.user.role === 'buyer' && contract.buyer.toString() === req.user.id) {
            req.body.buyerSigned = true;
            req.body.status = contract.farmerSigned ? 'Active' : 'Proposed';
        }
    }

    contract = await Contract.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    }).populate('farmer').populate('buyer');

    // === BLOCKCHAIN INTEGRATION ===
    // If contract is now ACTIVE (Both signed), write to ledger
    if (contract.status === 'Active' && contract.farmerSigned && contract.buyerSigned) {
        try {
            const fabricService = require('../services/fabricService');

            // Prepare data strictly for the 6 allowed fields
            // Contract ID, Expiry Date, Crop Type, Price Guarantee, Company Details, and Payment Schedule
            const blockchainData = {
                contractId: contract._id.toString(),
                expiryDate: contract.expiryDate || new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(), // Default 90 days if null
                cropType: contract.cropName,
                priceGuarantee: contract.pricePerTon,
                companyDetails: {
                    name: contract.buyer?.name || 'Unknown Company',
                    id: contract.buyer?._id
                },
                paymentSchedule: 'Milestone Based', // Simplification for demo
                integrityHash: 'hash_' + Math.random().toString(36).substring(7) // Mock Hash
            };

            await fabricService.submitTransaction('createContract', contract._id.toString(), JSON.stringify(blockchainData));
            console.log(`Contract ${contract._id} written to Blockchain Ledger.`);

        } catch (err) {
            console.error("Blockchain Write Failed:", err.message);
            // Don't fail the HTTP request, just log it. In production, we might queue this.
        }
    }

    res.status(200).json({
        success: true,
        data: contract
    });
});

// @desc    Update Contract Fulfillment (Tracking, Logistics, Payments)
// @route   PUT /api/contracts/:id/fulfillment
// @access  Private
exports.updateContractFulfillment = asyncHandler(async (req, res, next) => {
    let contract = await Contract.findById(req.params.id);

    if (!contract) {
        return res.status(404).json({ success: false, error: 'Contract not found' });
    }

    const { actionType, stage, remarks, evidenceUrl, logisticsData, paymentData, coordinates, timelineId, verificationStatus } = req.body;
    let notificationMsg = '';

    // === 1. PROGRESS UPDATES (Farmer) ===
    if (actionType === 'UPDATE_PROGRESS') {
        if (!contract.escrow || contract.escrow.lockedBalance <= 0) {
            return res.status(400).json({ success: false, error: 'Cannot start or update stage. Funding is pending from the Company.' });
        }

        const stageProgressMap = {
            'Sowing': 25,
            'Mid-Season': 50,
            'Harvest': 75,
            'Inspection': 85,
            'Ready for Pickup': 90,
            'Delivered': 95,
            'Completed': 100
        };

        // If it's a new update, push to PENDING VERIFICATION
        if (stage && stageProgressMap[stage]) {
            contract.fulfillment.timeline.push({
                stage: stage,
                status: 'Pending Verification',
                date: Date.now(),
                completedBy: req.user.id,
                remarks: remarks || `Marked ${stage} as completed`,
                evidenceUrl: evidenceUrl || [],
                coordinates: coordinates || null,
                verification: { status: 'Pending' }
            });
            notificationMsg = `New progress update submitted for: ${stage}. Verification required.`;
        }
    }

    // === 1.5 VERIFY STAGE (Buyer) ===
    if (actionType === 'VERIFY_STAGE' && timelineId) {
        const timelineItem = contract.fulfillment.timeline.id(timelineId);

        if (timelineItem) {
            timelineItem.verification.status = verificationStatus; // 'Verified' or 'Rejected'
            timelineItem.verification.verifiedBy = req.user.id;
            timelineItem.verification.verifiedAt = Date.now();

            if (verificationStatus === 'Verified') {
                timelineItem.status = 'Completed';

                // NOW we update the global contract progress
                const stageProgressMap = {
                    'Sowing': 25,
                    'Mid-Season': 50,
                    'Harvest': 75,
                    'Inspection': 85,
                    'Ready for Pickup': 90,
                    'Delivered': 95,
                    'Completed': 100
                };

                if (stageProgressMap[timelineItem.stage]) {
                    contract.fulfillment.currentStage = timelineItem.stage;
                    contract.fulfillment.percentage = stageProgressMap[timelineItem.stage];

                    // Auto Update Status based on Stage
                    if (timelineItem.stage === 'Sowing' || timelineItem.stage === 'Mid-Season') contract.status = 'In Production';
                    else if (timelineItem.stage === 'Harvest') contract.status = 'Ready for Inspection';
                    else if (timelineItem.stage === 'Inspection') contract.status = 'Ready for Pickup';
                    else if (timelineItem.stage === 'Completed') contract.status = 'Completed';
                }

                // === Auto-Release Payment from Escrow ===
                const totalContractValue = (contract.pricingTerms?.pricePerUnit || 0) * (contract.cropDetails?.quantity || 0);
                
                let releaseAmount = 0;
                if (timelineItem.stage === 'Sowing') releaseAmount = Math.round(totalContractValue * 0.40);
                else if (timelineItem.stage === 'Mid-Season') releaseAmount = Math.round(totalContractValue * 0.30);
                else if (timelineItem.stage === 'Harvest' || timelineItem.stage === 'Completed') releaseAmount = Math.round(totalContractValue * 0.30);
                
                // Fallback if rounding causes it to be slightly greater than locked
                if (contract.escrow && releaseAmount > 0 && contract.escrow.lockedBalance > 0) {
                    if (releaseAmount > contract.escrow.lockedBalance) releaseAmount = contract.escrow.lockedBalance;

                    contract.escrow.lockedBalance -= releaseAmount;
                    contract.escrow.totalReleased += releaseAmount;
                    
                    await Transaction.create({
                        contract: contract._id,
                        type: 'RELEASE_PAYMENT',
                        amount: releaseAmount,
                        status: 'Completed',
                        fromUser: contract.buyer,
                        toUser: contract.farmer
                    });
                    
                    contract.fulfillment.payments.totalPaid = (contract.fulfillment.payments.totalPaid || 0) + releaseAmount;
                    contract.fulfillment.payments.pendingAmount = (contract.fulfillment.payments.pendingAmount || 0) - releaseAmount;
                    if (contract.fulfillment.payments.pendingAmount <= 0) contract.fulfillment.payments.status = 'Paid';
                    else contract.fulfillment.payments.status = 'Partially Paid';
                    
                    contract.fulfillment.payments.history.push({
                        stage: timelineItem.stage + ' Auto-Release',
                        amount: releaseAmount,
                        transactionId: `TXN${Date.now()}`,
                        status: 'Completed'
                    });
                    
                    contract.markModified('escrow');
                }

                notificationMsg = `Stage ${timelineItem.stage} VERIFIED. ₹${releaseAmount} released from Escrow.`;
            } else {
                timelineItem.status = 'Failed'; // or Rejected
                notificationMsg = `Stage ${timelineItem.stage} REJECTED by Company.`;
            }
        }
    }

    // === 2. LOGISTICS UPDATES (Buyer) ===
    if (actionType === 'UPDATE_LOGISTICS' && logisticsData) {
        contract.fulfillment.logistics = {
            ...contract.fulfillment.logistics,
            ...logisticsData
        };

        // Auto Update Status
        if (logisticsData.status === 'Picked Up') contract.status = 'In Transit';
        if (logisticsData.status === 'Delivered') {
            contract.status = 'Delivered';
            contract.fulfillment.percentage = 95;
            contract.fulfillment.currentStage = 'Delivered';
        }

        contract.fulfillment.timeline.push({
            stage: 'Logistics Update',
            status: 'In Progress',
            date: Date.now(),
            completedBy: req.user.id,
            remarks: `Logistics status: ${logisticsData.status}`,
        });

        notificationMsg = `Logistics updated: ${logisticsData.status}`;
    }

    // === 3. PAYMENT UPDATES (Buyer) ===
    if (actionType === 'UPDATE_PAYMENT' && paymentData) {
        // Update Totals
        const currentPaid = contract.fulfillment.payments.totalPaid || 0;
        const newPaid = currentPaid + Number(paymentData.amount);
        const totalAmount = contract.fulfillment.payments.totalAmount || (contract.pricingTerms.pricePerUnit * contract.cropDetails.quantity);

        contract.fulfillment.payments.totalPaid = newPaid;
        contract.fulfillment.payments.pendingAmount = totalAmount - newPaid;
        contract.fulfillment.payments.status = newPaid >= totalAmount ? 'Paid' : 'Partially Paid';

        // Add Transaction Record
        contract.fulfillment.payments.history.push({
            stage: paymentData.stage || 'Milestone Payment',
            amount: Number(paymentData.amount),
            transactionId: paymentData.transactionId || `TXN${Date.now()}`,
            date: Date.now(),
            status: 'Completed'
        });

        // Check for Completion
        if (contract.status === 'Delivered' && newPaid >= totalAmount) {
            contract.status = 'Completed';
            contract.fulfillment.currentStage = 'Completed';
            contract.fulfillment.percentage = 100;
            notificationMsg = 'Contract Fully Completed & Settled!';
        } else {
            notificationMsg = `Payment of ₹${paymentData.amount} recorded`;
        }
    }

    await contract.save();

    // Real-time Notify
    const io = req.app.get('io');
    if (io) {
        io.to(contract.buyer.toString()).emit('contract_updated', contract);
        io.to(contract.farmer.toString()).emit('contract_updated', contract);
        // Send push notification event (Mock)
        io.to(contract.farmer.toString()).emit('notification', { message: notificationMsg });
        io.to(contract.buyer.toString()).emit('notification', { message: notificationMsg });
    }

    res.status(200).json({
        success: true,
        data: contract
    });
});
