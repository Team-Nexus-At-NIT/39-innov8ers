const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Contract = require('./models/Contract'); // Adjust path as needed

dotenv.config({ path: './.env' }); // Adjust if .env is elsewhere

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

const testCreateContract = async () => {
    await connectDB();

    try {
        // Dummy ObjectIDs
        const buyerId = new mongoose.Types.ObjectId();
        const farmerId = new mongoose.Types.ObjectId();
        const demandId = new mongoose.Types.ObjectId();

        console.log("Attempting to create contract...");

        const contract = await Contract.create({
            buyer: buyerId,
            farmer: farmerId,
            demand: demandId,

            // EXACT STRUCTURE FROM CONTROLLER
            cropDetails: {
                cropName: 'Tomato',
                variety: 'Hybrid',
                quantity: 100,
                qualitySpecifications: 'Standard',
                procurementSeason: 'All Season',
                frequency: 'One-time',
                packaging: 'Bags', // Testing the fixed string
                specialSpecs: ''
            },

            pricingTerms: {
                pricePerUnit: 2500,
                unit: 'Quintal',
                priceType: 'Fixed',
                advancePaymentPercentage: 0,
                latePaymentPenalty: '',
                bonusCriteria: '',
                paymentMilestones: []
            },

            logistics: {
                deliveryType: 'Farmer Delivery',
                gpsTrackingRequired: false
            },

            inspection: {
                method: 'Manual',
                location: 'Collection Center',
                rejectionCriteria: ''
            },

            validity: {
                startDate: new Date(),
                endDate: new Date(),
                minQuantityCommitment: 0,
                maxQuantityCommitment: 0,
                gracePeriodDays: 0
            },

            legal: {
                jurisdiction: '',
                cancellationTerms: '',
                forceMajure: '',
                penaltyClauses: ''
            },

            status: 'Active'
        });

        console.log("SUCCESS! Contract created:", contract._id);
        process.exit(0);

    } catch (error) {
        console.error("FAILURE! Validation Error:");
        if (error.errors) {
            Object.keys(error.errors).forEach(key => {
                console.error(`Field: ${key}, Error: ${error.errors[key].message}, Value: ${error.errors[key].value}`);
            });
        } else {
            console.error(error);
        }
        process.exit(1);
    }
};

testCreateContract();
