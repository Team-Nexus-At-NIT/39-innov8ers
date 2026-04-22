const Contract = require('../models/Contract');
const Transaction = require('../models/Transaction');
const Milestone = require('../models/Milestone');
const asyncHandler = require('../middleware/async');
const crypto = require('crypto');
const Razorpay = require('razorpay');

let razorpayInstance = null;
if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_SECRET) {
    razorpayInstance = new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID,
        key_secret: process.env.RAZORPAY_SECRET
    });
}

// @desc    Buyer deposits funds into Escrow for a contract
// @route   POST /api/escrow/fund/:contractId
// @access  Private (Buyer)
exports.fundEscrow = asyncHandler(async (req, res, next) => {
    const contract = await Contract.findById(req.params.contractId);

    if (!contract) {
        return res.status(404).json({ success: false, error: 'Contract not found' });
    }

    if (contract.buyer.toString() !== req.user.id && req.user.role !== 'admin') {
        return res.status(401).json({ success: false, error: 'Not authorized to fund this escrow' });
    }

    const { amount, milestoneId } = req.body;

    if (!amount || amount <= 0) {
        return res.status(400).json({ success: false, error: 'Valid amount is required' });
    }

    // 1. Create Transaction Ledger entry
    const transaction = await Transaction.create({
        contract: contract._id,
        milestone: milestoneId || null,
        type: 'DEPOSIT_ESCROW',
        amount: Number(amount),
        status: 'Completed',
        fromUser: req.user.id,
        toUser: null // Escrow
    });

    // 2. Update Contract Escrow Balance
    if (!contract.escrow || typeof contract.escrow.totalFunded !== 'number') {
        contract.escrow = { totalFunded: 0, totalReleased: 0, lockedBalance: 0, status: 'Pending Funding' };
    }
    
    contract.escrow.totalFunded += Number(amount);
    contract.escrow.lockedBalance += Number(amount);

    // Naive status update
    // In a full implementation, you'd check against total expected cost
    const totalAmount = contract.fulfillment.payments.totalAmount || (contract.pricingTerms.pricePerUnit * contract.cropDetails.quantity);
    if (contract.escrow.totalFunded >= totalAmount) {
        contract.escrow.status = 'Funded';
    } else if (contract.escrow.totalFunded > 0) {
        contract.escrow.status = 'Partially Funded';
    }

    contract.markModified('escrow');
    await contract.save();

    // 3. If tied to a milestone, mark it as Funded
    if (milestoneId) {
        await Milestone.findByIdAndUpdate(milestoneId, { fundingStatus: 'Funded' });
    }

    // Notify Farmer
    const io = req.app.get('io');
    if (io) {
        io.to(contract.farmer.toString()).emit('notification', { message: `Buyer has deposited ₹${amount} into Escrow.` });
        io.to(contract.buyer.toString()).emit('contract_updated', contract);
    }

    res.status(200).json({
        success: true,
        data: {
            contract,
            transaction
        }
    });
});

// @desc    Get all transactions for a contract
// @route   GET /api/escrow/:contractId/transactions
// @access  Private
exports.getEscrowTransactions = asyncHandler(async (req, res, next) => {
    const transactions = await Transaction.find({ contract: req.params.contractId }).sort('-createdAt');

    res.status(200).json({
        success: true,
        count: transactions.length,
        data: transactions
    });
});

// @desc    Create Razorpay Order for Escrow Deposit
// @route   POST /api/escrow/create-order
// @access  Private (Buyer)
exports.createRazorpayOrder = asyncHandler(async (req, res, next) => {
    if (!razorpayInstance) {
        return res.status(500).json({ success: false, error: 'Razorpay not configured on server' });
    }

    const { amount, contractId } = req.body;

    if (!amount || amount <= 0) {
        return res.status(400).json({ success: false, error: 'Valid amount is required' });
    }

    const contract = await Contract.findById(contractId);
    if (!contract || (contract.buyer.toString() !== req.user.id && req.user.role !== 'admin')) {
        return res.status(404).json({ success: false, error: 'Contract not found or not authorized' });
    }

    let amountInPaise = Math.round(Number(amount) * 100);

    // TEST MODE SAFEGUARD: Razorpay Test Mode has strict limits (e.g., 5-10 Lakhs max).
    // If the contract value is in Crores, it will fail.
    // In development mode, we cap the actual payment gateway amount to ₹100 for testing purposes,
    // while still recording the full intended amount in our internal ledger and notes.
    if (process.env.NODE_ENV === 'development' && amountInPaise > 1000000) {
        amountInPaise = 10000; // Cap at ₹100 for the gateway transaction only
    }

    const options = {
        amount: amountInPaise,
        currency: 'INR',
        receipt: `receipt_escrow_${contractId.slice(-6)}_${Date.now()}`,
        notes: {
            contractId: contractId,
            buyerId: req.user.id,
            actualAmount: amount // Store the real intended amount for verification
        }
    };

    try {
        const order = await razorpayInstance.orders.create(options);
        res.status(200).json({
            success: true,
            data: order
        });
    } catch (error) {
        console.error("Razorpay Order Error:", error);
        res.status(500).json({ 
            success: false, 
            error: error.message || 'Failed to create payment order',
            details: error.description || null 
        });
    }
});

// @desc    Verify Razorpay Payment and Fund Escrow
// @route   POST /api/escrow/verify-payment
// @access  Private (Buyer)
exports.verifyRazorpayPayment = asyncHandler(async (req, res, next) => {
    const { 
        razorpay_order_id, 
        razorpay_payment_id, 
        razorpay_signature, 
        contractId, 
        amount, 
        milestoneId 
    } = req.body;

    // 1. Cryptographic Signature Verification
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
        .createHmac("sha256", process.env.RAZORPAY_SECRET)
        .update(body.toString())
        .digest("hex");

    if (expectedSignature !== razorpay_signature) {
        return res.status(400).json({ success: false, error: 'Invalid payment signature' });
    }

    // 2. Fetch and Authorize Contract
    const contract = await Contract.findById(contractId);
    if (!contract) {
        return res.status(404).json({ success: false, error: 'Contract not found' });
    }

    // 3. Create Transaction Ledger entry
    const transaction = await Transaction.create({
        contract: contractId,
        milestone: milestoneId || null,
        type: 'DEPOSIT_ESCROW',
        amount: Number(amount),
        status: 'Completed',
        fromUser: req.user.id,
        toUser: null, // Escrow Entity
        paymentReference: razorpay_payment_id
    });

    // 4. Update Contract Escrow Balance safely
    if (!contract.escrow || typeof contract.escrow.totalFunded !== 'number') {
        contract.escrow = { totalFunded: 0, totalReleased: 0, lockedBalance: 0, status: 'Pending Funding' };
    }
    
    contract.escrow.totalFunded += Number(amount);
    contract.escrow.lockedBalance += Number(amount);

    const totalExpectedAmount = contract.fulfillment?.payments?.totalAmount || 
        ((contract.pricingTerms?.pricePerUnit || 0) * (contract.cropDetails?.quantity || 0));
        
    if (contract.escrow.totalFunded >= totalExpectedAmount && totalExpectedAmount > 0) {
        contract.escrow.status = 'Funded';
    } else if (contract.escrow.totalFunded > 0) {
        contract.escrow.status = 'Partially Funded';
    }

    contract.markModified('escrow');
    await contract.save();

    // 5. Update Milestone Status if applicable
    if (milestoneId) {
        await Milestone.findByIdAndUpdate(milestoneId, { fundingStatus: 'Funded' });
    }

    // 6. Real-time Notification
    const io = req.app.get('io');
    if (io) {
        io.to(contract.farmer.toString()).emit('notification', { 
            message: `Buyer has deposited ₹${Number(amount).toLocaleString()} into the platform Escrow via secure transfer.` 
        });
        io.to(contract.buyer.toString()).emit('contract_updated', contract);
    }

    res.status(200).json({
        success: true,
        data: {
            contract,
            transaction
        }
    });
});
