const mongoose = require('mongoose');

const TransactionSchema = new mongoose.Schema({
    contract: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Contract',
        required: true
    },
    milestone: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Milestone'
    },
    type: {
        type: String,
        enum: ['DEPOSIT_ESCROW', 'RELEASE_PAYMENT', 'REFUND'],
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ['Pending', 'Completed', 'Failed'],
        default: 'Pending'
    },
    fromUser: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User' // Company or Platform
    },
    toUser: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User' // Escrow or Farmer
    },
    paymentMethod: {
        type: String,
        default: 'Bank Transfer' // or Razorpay/Stripe details in a real system
    },
    gatewayTransactionId: String
}, { timestamps: true });

module.exports = mongoose.model('Transaction', TransactionSchema);
