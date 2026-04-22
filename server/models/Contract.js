const mongoose = require('mongoose');

const ContractSchema = new mongoose.Schema({
    // 0. Base References
    farmer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    buyer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    demand: { // Linked to original demand if applicable
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Demand'
    },

    // 1. Crop Contract Details
    cropDetails: {
        cropName: { type: String, required: true },
        variety: String,
        quantity: { type: Number, required: true }, // in Quintals/MT
        qualitySpecifications: String, // "Grade A", "Moisture < 10%"
        procurementSeason: { type: String, enum: ['Kharif', 'Rabi', 'Zaid', 'All Season'] },
        frequency: { type: String, enum: ['One-time', 'Seasonal', 'Monthly'] },
        deliveryWindow: {
            start: Date,
            end: Date
        },
        packaging: {
            type: String,
            enum: ['Bags', 'Bulk', 'Cartons', 'Crates', 'Other'],
            default: 'Bags'
        },
        specialSpecs: String // e.g. "Grain size > 5mm"
    },

    // 2. Contract-Specific Pricing Terms
    pricingTerms: {
        pricePerUnit: { type: Number, required: true },
        unit: { type: String, default: 'Quintal' }, // Quintal / MT
        priceType: { type: String, enum: ['Fixed', 'MSP + Bonus', 'Market-linked'] },
        advancePaymentPercentage: { type: Number, default: 0 },
        paymentMilestones: [{
            stage: String, // e.g. "Sowing", "Harvest", "Delivery"
            percentage: Number
        }],
        latePaymentPenalty: String, // Clause text
        bonusCriteria: String
    },

    // 3. Logistics for This Contract
    logistics: {
        deliveryType: { type: String, enum: ['Company Pickup', 'Farmer Delivery'] },
        pickupLocation: {
            address: String,
            coordinates: [Number]
        },
        preferredDate: Date,
        timeSlots: String,
        gpsTrackingRequired: { type: Boolean, default: false },
        freightCharges: {
            paidBy: { type: String, enum: ['Buyer', 'Farmer'] },
            amount: Number
        }
    },

    // 4. Quality Inspection Details
    inspection: {
        method: { type: String, enum: ['Manual', 'Lab Test', 'AI Inspection'] },
        location: { type: String, enum: ['On-farm', 'Warehouse', 'Collection Center'] },
        samplingRules: String,
        rejectionCriteria: String
    },

    // 5. Validity & Commitment
    validity: {
        contractDate: { type: Date, default: Date.now },
        startDate: Date,
        endDate: Date,
        minQuantityCommitment: Number,
        maxQuantityCommitment: Number,
        gracePeriodDays: Number
    },

    // 6. Legal & Compliance
    legal: {
        cancellationTerms: String,
        penaltyClauses: String,
        forceMajure: String,
        confidentiality: String,
        jurisdiction: String,
        contractUrl: String, // PDF URL
        contractFileName: String // Original Filename
    },

    // 7. E-Sign Section
    signatures: {
        buyer: {
            signed: { type: Boolean, default: false },
            signedAt: Date,
            signatureUrl: String, // Uploaded image/draw
            ipAddress: String
        },
        farmer: {
            signed: { type: Boolean, default: false },
            signedAt: Date,
            otpVerified: { type: Boolean, default: false },
            aadhaarRef: String // Masked UID
        }
    },

    // 8. Additional Instructions
    additionalNotes: {
        deliveryInstructions: String,
        packagingRequirements: String,
        harvestingMethod: String,
        supportProvided: [String] // "Seeds", "Fertilizer"
    },

    // 9. Notification Preferences (Contract Specific)
    notifications: {
        paymentAlerts: { type: Boolean, default: true },
        logisticsAlerts: { type: Boolean, default: true },
        inspectionAlerts: { type: Boolean, default: true }
    },

    // 10. Fulfillment Tracking (The Core Engine)
    fulfillment: {
        currentStage: {
            type: String,
            enum: ['Draft', 'Pending Approval', 'Sowing', 'Mid-Season', 'Harvest', 'Inspection', 'Ready for Pickup', 'In Transit', 'Delivered', 'Completed', 'Cancelled', 'Terminated'],
            default: 'Draft'
        },
        percentage: { type: Number, default: 0 },

        // A. Timeline / History
        timeline: [{
            stage: String,
            status: { type: String, enum: ['Pending', 'In Progress', 'Completed', 'Failed', 'Pending Verification'] },
            date: { type: Date, default: Date.now },
            completedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
            remarks: String,
            evidenceUrl: [String], // Array of image URLs
            coordinates: {
                lat: Number,
                lng: Number
            },
            verification: {
                status: { type: String, enum: ['Pending', 'Verified', 'Rejected'], default: 'Pending' },
                verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
                verifiedAt: Date,
                notes: String
            }
        }],

        // B. Proof Uploads
        updates: [{
            type: { type: String, enum: ['Sowing Proof', 'Crop Growth', 'Harvest', 'Inspection', 'Delivery Receipt', 'Other'] },
            description: String,
            files: [String],
            uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
            timestamp: { type: Date, default: Date.now },
            comments: [{
                user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
                text: String,
                createdAt: { type: Date, default: Date.now }
            }]
        }],

        // C. Logistics Tracking Details
        logistics: {
            status: { type: String, enum: ['Scheduled', 'Picked Up', 'In Transit', 'Delivered'] },
            partnerName: String,
            vehicleNumber: String,
            driverName: String,
            driverPhone: String,
            trackingUrl: String,
            currentCoordinates: {
                lat: Number,
                lng: Number,
                lastUpdated: Date
            },
            estimatedArrival: Date,
            actualArrival: Date
        },

        // D. Payment Progress (Linked to Pricing Terms)
        payments: {
            totalAmount: Number,
            totalPaid: { type: Number, default: 0 },
            pendingAmount: Number,
            status: { type: String, enum: ['Unpaid', 'Partially Paid', 'Paid'] },
            history: [{
                stage: String, // "Advance", "Milestone 1"
                amount: Number,
                transactionId: String,
                date: { type: Date, default: Date.now },
                status: { type: String, enum: ['Pending', 'Completed', 'Failed'] }
            }]
        }
    },

    // E. Escrow System
    escrow: {
        totalFunded: { type: Number, default: 0 },
        totalReleased: { type: Number, default: 0 },
        lockedBalance: { type: Number, default: 0 },
        status: { type: String, enum: ['Pending Funding', 'Partially Funded', 'Funded', 'At Risk'], default: 'Pending Funding' }
    },

    status: {
        type: String,
        enum: ['Draft', 'Pending Approval', 'Active', 'In Production', 'Ready for Pickup', 'In Transit', 'Delivered', 'Completed', 'Cancelled', 'Terminated'],
        default: 'Draft'
    }
}, { timestamps: true });

module.exports = mongoose.model('Contract', ContractSchema);
