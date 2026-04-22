require('dotenv').config();
const { addContractToSheet } = require('./services/googleSheetService');

const testContract = {
    _id: 'TEST-' + Date.now(),
    createdAt: new Date(),
    farmerName: 'Test Farmer',
    buyerName: 'Test Buyer',
    cropName: 'Test Crop',
    quantity: 100,
    pricePerTon: 500,
    status: 'Test'
};

console.log('Testing Google Sheets Integration...');

const sheetId = process.env.GOOGLE_SHEET_ID;
const keyPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;

console.log('Sheet ID:', sheetId);
console.log('Credentials Path:', keyPath);

if (!sheetId || !keyPath) {
    console.error('MISSING CONFIGURATION');
} else {
    addContractToSheet(testContract)
        .then(() => console.log('Test function promise resolved.'))
        .catch(err => console.error('Test function promise rejected:', err));
}

// Keep alive for a moment to ensure async logs appear
setTimeout(() => console.log('Test script finishing...'), 5000);
