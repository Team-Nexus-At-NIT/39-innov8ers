const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Contract = require('./models/Contract');
const Demand = require('./models/Demand');

dotenv.config({ path: './.env' });

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log("DB Connected");
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

const debug = async () => {
    await connectDB();

    const demandId = '6975e6bc3eb19b9ee65c06f0';
    const bidId = '6975e6d43eb19b9ee65c0707';

    try {
        const demand = await Demand.findById(demandId);
        if (!demand) {
            console.log("Demand not found");
            return;
        }

        const application = demand.applications.id(bidId);
        if (!application) {
            console.log("Bid not found");
            return;
        }

        console.log("DATA LOADED. Bidding Price:", application.bidPrice);

        const contractData = {
            buyer: demand.buyer,
            farmer: application.farmer,
            demand: demand._id,

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

            pricingTerms: {
                pricePerUnit: application.bidPrice,
                unit: 'Quintal',
                priceType: demand.pricing?.priceType || 'Fixed',
                advancePaymentPercentage: demand.pricing?.advancePaymentPercentage || 0,
                latePaymentPenalty: demand.pricing?.latePaymentPenalty || '',
                bonusCriteria: demand.pricing?.bonusCriteria || '',
                paymentMilestones: []
            },
            logistics: {
                deliveryType: application.canDeliver ? 'Farmer Delivery' : (demand.logistics?.deliveryType || 'Farmer Delivery'),
                gpsTrackingRequired: demand.logistics?.gpsRequired || false
            },
            inspection: {
                method: demand.qualityInspection?.method || 'Manual',
                location: demand.qualityInspection?.location || 'Collection Center',
                rejectionCriteria: demand.qualityInspection?.rejectionCriteria || ''
            },
            validity: {
                startDate: demand.contractValidity?.startDate || Date.now(),
                endDate: demand.contractValidity?.endDate || demand.deliveryBy,
                minQuantityCommitment: demand.contractValidity?.minQuantity || 0,
                maxQuantityCommitment: demand.contractValidity?.maxQuantity || 0,
                gracePeriodDays: demand.contractValidity?.gracePeriodDays || 0
            },
            legal: {
                jurisdiction: demand.legal?.jurisdiction || '',
                cancellationTerms: demand.legal?.cancellationTerms || '',
                forceMajure: demand.legal?.forceMajeure || '',
                penaltyClauses: demand.legal?.penaltyClauses || ''
            },
            status: 'Active'
        };

        console.log("Calling Contract.create...");
        const contract = await Contract.create(contractData);
        console.log("SUCCESS! Created:", contract._id);

        // Don't exit, just let it finish. Mongoose might keep connection open though.
        setTimeout(() => process.exit(0), 1000);

    } catch (error) {
        console.error("FAILURE MSG IN CATCH BLOCK: " + error.message);
        if (error.errors) {
            Object.keys(error.errors).forEach(key => {
                console.error(`FIELD ERROR: ${key} -> ${error.errors[key].message}`);
            });
        }
        setTimeout(() => process.exit(1), 1000);
    }
};

debug();
