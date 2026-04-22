const Demand = require('../models/Demand');
const FarmerProfile = require('../models/FarmerProfile');
const asyncHandler = require('../middleware/async');

// @desc    Create demand
// @route   POST /api/demands
// @access  Private (Buyer)
exports.createDemand = asyncHandler(async (req, res, next) => {
    try {
        req.body.buyer = req.user.id;
        console.log("Create Demand Payload:", JSON.stringify(req.body, null, 2)); // Debug Log

        const demand = await Demand.create(req.body);

        // Send WhatsApp Broadcast to Farmers
        try {
            const whatsappService = require('../services/whatsappService');
            const buyerUser = await require('../models/User').findById(req.user.id);
            // Don't await this, let it run in background
            whatsappService.broadcastToFarmers(demand, buyerUser);
        } catch (err) {
            console.error("Notification Trigger Failed (Non-blocking):", err);
        }

        // === GOOGLE SHEETS INTEGRATION (MARKETPLACE LISTING) ===
        try {
            const { addDemandToSheet } = require('../services/googleSheetService');
            addDemandToSheet({
                ...demand.toObject(),
                companyName: req.user.name || 'Unknown Company'
            });
        } catch (sheetErr) {
            console.error("Sheet Log Failed:", sheetErr.message);
        }

        res.status(201).json({
            success: true,
            data: demand
        });
    } catch (error) {
        console.error("Create Demand Error:", error);
        res.status(500).json({
            success: false,
            error: error.message || 'Server Error'
        });
    }
});

// @desc    Get all demands
// @route   GET /api/demands
// @access  Public (or Private)
exports.getDemands = asyncHandler(async (req, res, next) => {
    let query = Demand.find({ status: 'Open' });

    // Filter by crop name if provided
    if (req.query.crop) {
        query = query.where('cropName').equals(req.query.crop);
    }

    const demands = await query.populate('buyer', 'name email phone rating').sort('-createdAt'); // Creating 'rating' projection early if needed

    res.status(200).json({
        success: true,
        count: demands.length,
        data: demands
    });
});

// @desc    Get buyer's demands
// @route   GET /api/demands/my
// @access  Private (Buyer)
exports.getMyDemands = asyncHandler(async (req, res, next) => {
    const demands = await Demand.find({ buyer: req.user.id })
        .populate({
            path: 'applications.farmer',
            select: 'name email phone profileId roleProfileModel',
            populate: {
                path: 'profileId',
                select: 'location landDetails cropDetails' // Fetch useful info for the list
            }
        })
        .sort('-createdAt');

    res.status(200).json({
        success: true,
        count: demands.length,
        data: demands
    });
});

// @desc    Apply for demand (Bid)
// @route   POST /api/demands/:id/apply
// @access  Private (Farmer)
exports.applyForDemand = asyncHandler(async (req, res, next) => {
    const demand = await Demand.findById(req.params.id);

    if (!demand) {
        return res.status(404).json({ success: false, error: 'Demand not found' });
    }

    if (demand.status !== 'Open') {
        return res.status(400).json({ success: false, error: 'Demand is no longer open' });
    }

    // Check if already applied
    const alreadyApplied = demand.applications.find(
        app => app.farmer.toString() === req.user.id
    );

    if (alreadyApplied) {
        return res.status(400).json({ success: false, error: 'You have already applied/bid for this demand' });
    }

    const application = {
        farmer: req.user.id,
        bidPrice: req.body.bidPrice,
        offeredQuantity: req.body.offeredQuantity,
        canDeliver: req.body.canDeliver,
        deliveryDate: req.body.deliveryDate, // { startDate, endDate }
        message: req.body.message,
        proofs: {
            landDocument: req.body.landDocument, // URL from frontend
            cropPhotos: req.body.cropPhotos || [] // Array of URLs
        }
    };

    demand.applications.push(application);
    await demand.save();

    res.status(200).json({
        success: true,
        data: demand
    });
});

// @desc    Accept Bid and Create Contract
// @route   PUT /api/demands/:id/accept/:bidId
// @access  Private (Buyer)
exports.acceptBid = asyncHandler(async (req, res, next) => {
    const Contract = require('../models/Contract'); // Lazy load to avoid circular issues
    const demand = await Demand.findById(req.params.id);
    const bidId = req.params.bidId;

    if (!demand) {
        return res.status(404).json({ success: false, error: 'Demand not found' });
    }

    if (demand.buyer.toString() !== req.user.id) {
        return res.status(401).json({ success: false, error: 'Not authorized' });
    }

    const application = demand.applications.id(bidId);
    if (!application) {
        return res.status(404).json({ success: false, error: 'Bid not found' });
    }

    // 1. Update Bid Status
    application.status = 'Accepted';

    // 2. Resolve Demand Status based on Contract Type
    if (demand.contractType === 'Cluster') {
        const quantityToBook = application.offeredQuantity || 0;
        demand.fulfilledQuantity = (demand.fulfilledQuantity || 0) + quantityToBook;

        // If Demand is fully met, close it. Otherwise keep Open.
        if (demand.fulfilledQuantity >= demand.quantityRequired) {
            demand.status = 'Fulfilled';
            // Optimization: Reject pending bids that now exceed capacity? 
            // For simplicity in MVP, we just close the demand.
        } else {
            demand.status = 'Open'; // Remains open for other farmers
        }
    } else {
        // Standard Contract: 1-to-1 Mapping
        demand.status = 'Fulfilled';

        // Reject others
        demand.applications.forEach(app => {
            if (app._id.toString() !== bidId) app.status = 'Rejected';
        });
    }

    await demand.save();

    // 4. Create Contract AUTOMATICALLY with detailed fields
    try {
        const contract = await Contract.create({
            buyer: req.user.id,
            farmer: application.farmer,
            demand: demand._id,

            // Map Crop Details with Fallbacks
            cropDetails: {
                cropName: demand.cropName || 'Unknown Crop',
                variety: demand.cropDetails?.variety || 'Not Specified',
                quantity: application.offeredQuantity || demand.quantityRequired || 0,
                qualitySpecifications: demand.cropDetails?.qualityStandards || demand.qualitySpecifications || 'Standard',
                procurementSeason: demand.cropDetails?.procurementSeason || 'All Season',
                frequency: demand.cropDetails?.procurementFrequency || 'One-time',
                packaging: ['Bags', 'Bulk', 'Cartons', 'Crates', 'Other'].includes(demand.cropDetails?.packaging)
                    ? demand.cropDetails.packaging
                    : 'Other',
                specialSpecs: demand.cropDetails?.specialSpecifications || ''
            },

            // Map Pricing
            pricingTerms: {
                pricePerUnit: application.bidPrice, // Use agreed bid price
                unit: 'Quintal', // Defaulting as per new schema context
                priceType: demand.pricing?.priceType || 'Fixed',
                advancePaymentPercentage: demand.pricing?.advancePaymentPercentage || 0,
                latePaymentPenalty: demand.pricing?.latePaymentPenalty || '',
                bonusCriteria: demand.pricing?.bonusCriteria || '',
                paymentMilestones: []
            },

            // Map Logistics
            logistics: {
                deliveryType: application.canDeliver ? 'Farmer Delivery' : (demand.logistics?.deliveryType || 'Farmer Delivery'),
                gpsTrackingRequired: demand.logistics?.gpsRequired || false
            },

            // Map Inspection
            inspection: {
                method: demand.qualityInspection?.method || 'Manual',
                location: demand.qualityInspection?.location || 'Collection Center',
                rejectionCriteria: demand.qualityInspection?.rejectionCriteria || ''
            },

            // Map Validity
            validity: {
                startDate: demand.contractValidity?.startDate || Date.now(),
                endDate: demand.contractValidity?.endDate || demand.deliveryBy,
                minQuantityCommitment: demand.contractValidity?.minQuantity || 0,
                maxQuantityCommitment: demand.contractValidity?.maxQuantity || 0,
                gracePeriodDays: demand.contractValidity?.gracePeriodDays || 0
            },

            // Map Legal
            legal: {
                jurisdiction: demand.legal?.jurisdiction || '',
                cancellationTerms: demand.legal?.cancellationTerms || '',
                forceMajure: demand.legal?.forceMajeure || '',
                penaltyClauses: demand.legal?.penaltyClauses || '',
                contractUrl: demand.legal?.contractUrl || '',
                contractFileName: demand.legal?.contractFileName || ''
            },

            contractType: demand.contractType, // Pass type to contract

            status: 'Active'
        });

        res.status(200).json({
            success: true,
            data: contract,
            message: 'Bid accepted and Contract created successfully!'
        });
    } catch (error) {
        console.error("CONTRACT CREATION ERROR:", JSON.stringify(error.errors || error, null, 2));
        const fs = require('fs');
        fs.writeFileSync('error_log_accept.txt', JSON.stringify(error.errors || error, null, 2));
        return res.status(500).json({ success: false, error: 'Contract creation failed: ' + error.message });
    }
});
// @desc    Get recommended demands for farmer
// @route   GET /api/demands/recommend
// @access  Private (Farmer)
exports.getRecommendedDemands = asyncHandler(async (req, res, next) => {
    // 1. Get Farmer Profile
    const profile = await FarmerProfile.findOne({ user: req.user.id });

    if (!profile) {
        return res.status(200).json({
            success: true,
            count: 0,
            data: [],
            message: 'Complete your profile to get personalized recommendations'
        });
    }

    const crops = profile.cropDetails?.primaryCrops || [];

    if (crops.length === 0) {
        return res.status(200).json({
            success: true,
            count: 0,
            data: [],
            message: 'Add primary crops to your profile for smart recommendations'
        });
    }

    // 2. Find Open Demands matching crops
    // Case-insensitive matching for better results
    const demands = await Demand.find({
        status: 'Open',
        cropName: { $in: crops.map(c => new RegExp(`^${c}$`, 'i')) }
    })
        .populate('buyer', 'name email phone rating')
        .sort('-createdAt')
        .limit(10);

    res.status(200).json({
        success: true,
        count: demands.length,
        data: demands,
        matchedCrops: crops
    });
});
