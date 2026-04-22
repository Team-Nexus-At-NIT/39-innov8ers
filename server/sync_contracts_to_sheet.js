const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Contract = require('./models/Contract');
const { updateContractInSheet } = require('./services/googleSheetService');

// Load env vars
dotenv.config({ path: './.env' });

const syncAllContracts = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected...');

        const contracts = await Contract.find()
            .populate('farmer', 'name')
            .populate('buyer', 'name');

        console.log(`Found ${contracts.length} contracts for sync.`);

        for (const contract of contracts) {
            const sheetData = {
                _id: contract._id,
                createdAt: contract.createdAt,
                farmerName: contract.farmer ? contract.farmer.name : 'Unknown Farmer',
                buyerName: contract.buyer ? contract.buyer.name : 'Unknown Buyer',
                cropName: contract.cropName,
                quantity: contract.quantity,
                pricePerTon: contract.pricePerTon,
                status: contract.status
            };

            await updateContractInSheet(sheetData);
            // Small delay to avoid rate limiting
            await new Promise(resolve => setTimeout(resolve, 500));
        }

        console.log('✅ Sync Complete!');
        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

syncAllContracts();
