const mongoose = require('mongoose');

const DemandSchema = new mongoose.Schema({
    buyer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    cropName: {
        type: String,
        required: true
    },
    quantityRequired: {
        type: Number, // in tons
        required: true
    },
    pricePerTon: {
        type: Number,
        required: true
    },
    // NEW: Contract Type & Cluster Tracking
    contractType: {
        type: String,
        enum: ['Market Specification', 'Production', 'Buy-Back', 'Price Guarantee', 'Cluster'],
        default: 'Market Specification'
    },
    fulfilledQuantity: {
        type: Number,
        default: 0
    },
    // 1. Crop Contract Details (Non-Duplicate)
    cropDetails: {
        variety: String,
        qualityStandards: String, // "Grade A, Moisture < 12%"
        procurementSeason: { type: String, enum: ['Kharif', 'Rabi', 'Zaid', 'All Season'] },
        procurementFrequency: { type: String, enum: ['One-time', 'Seasonal', 'Monthly'] },
        packaging: String, // "50kg Jute Bags"
        specialSpecifications: String // "Grain size > 5mm"
    },

    // 2. Contract-Specific Pricing Terms
    pricing: {
        priceType: { type: String, enum: ['Fixed', 'MSP + Bonus', 'Market-linked'], default: 'Fixed' },
        advancePaymentPercentage: Number, // %
        milestonePlan: String, // "30% sowing, 40% harvest, 30% delivery"
        latePaymentPenalty: String, // "1% per week delay"
        bonusCriteria: String // "Rs 50/quintal for Grade A++"
    },

    // 3. Logistics
    logistics: {
        deliveryType: { type: String, enum: ['Company Pickup', 'Farmer Delivery'], default: 'Farmer Delivery' },
        gpsRequired: { type: Boolean, default: false },
        freightCoverage: String // "Company pays if > 10 tons"
    },

    // 4. Quality Inspection
    qualityInspection: {
        method: { type: String, enum: ['Manual', 'Lab Test', 'AI Inspection'] },
        location: { type: String, enum: ['On-farm', 'Warehouse', 'Collection Center'] },
        rejectionCriteria: String
    },

    // 5. Validity & Commitment
    contractValidity: {
        startDate: Date,
        endDate: Date,
        minQuantity: Number,
        maxQuantity: Number,
        gracePeriodDays: Number
    },

    // 6. Legal & Compliance
    legal: {
        cancellationTerms: String,
        forceMajeure: String, // "Flood, Drought, Strike"
        jurisdiction: String, // "New Delhi Courts"
        penaltyClauses: String,
        contractUrl: String, // URL to PDF
        contractFileName: String // Original Filename
    },

    // 7. Signature & Authorization
    signer: {
        authorizedName: String,
        digitalSignatureTimestamp: Date
    },

    // 8. Notifications
    notifications: {
        paymentAlerts: { type: Boolean, default: true },
        logisticsAlerts: { type: Boolean, default: true }
    },

    // 9. Additional Instructions
    additionalInstructions: String,

    // Existing fields maintained for compatibility
    deliveryBy: {
        type: Date,
        required: true
    },
    status: {
        type: String,
        enum: ['Open', 'Fulfilled', 'Expired'],
        default: 'Open'
    },
    applications: [{
        farmer: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        bidPrice: { // Price farmer expects
            type: Number,
            required: true
        },
        offeredQuantity: { // Quantity farmer commits
            type: Number,
            default: 0
        },
        canDeliver: {
            type: Boolean,
            default: false
        },
        deliveryDate: {
            startDate: Date,
            endDate: Date
        },
        message: String, // Remarks
        proofs: {
            landDocument: String, // URL
            cropPhotos: [String] // URLs
        },
        status: {
            type: String,
            enum: ['Pending', 'Accepted', 'Rejected'],
            default: 'Pending'
        },
        appliedAt: {
            type: Date,
            default: Date.now
        }
    }],
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Demand', DemandSchema);
