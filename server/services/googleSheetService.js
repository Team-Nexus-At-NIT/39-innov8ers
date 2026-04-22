const { google } = require('googleapis');
const path = require('path');
const fs = require('fs');

/**
 * Service to append new demand/contract listing to a Google Sheet.
 * @param {Object} data - The demand data to append.
 */
exports.addDemandToSheet = async (data) => {
    try {
        // 1. Check for Credentials & Config
        const spreadsheetId = process.env.GOOGLE_SHEET_ID;
        let keyFilePath = process.env.GOOGLE_APPLICATION_CREDENTIALS;

        if (!keyFilePath) {
            const possiblePaths = [
                path.join(__dirname, '../config/service_account.json'),
                path.join(__dirname, '../service_account.json'),
                path.join(__dirname, '../credentials.json')
            ];
            for (const p of possiblePaths) {
                if (fs.existsSync(p)) {
                    keyFilePath = p;
                    break;
                }
            }
        }

        if (!spreadsheetId || !keyFilePath || !fs.existsSync(keyFilePath)) {
            console.warn('⚠️ Google Sheets: Missing ID or Credentials. Skipping.');
            return;
        }

        // 2. Authentication
        const auth = new google.auth.GoogleAuth({
            keyFile: keyFilePath,
            scopes: ['https://www.googleapis.com/auth/spreadsheets'],
        });

        const client = await auth.getClient();
        const sheets = google.sheets({ version: 'v4', auth: client });

        // 3. Prepare Row Data
        // Columns: [ID, Date Listed, Company Name, Crop, Qty (Tons), Price/Ton, Type, Delivery By, Status]
        const values = [
            [
                data._id.toString(),
                new Date(data.createdAt).toISOString().split('T')[0],
                data.companyName || 'N/A',
                data.cropName || 'N/A',
                data.quantityRequired || 0,
                data.pricePerTon || 0,
                data.contractType || 'Market Specification',
                data.deliveryBy ? new Date(data.deliveryBy).toISOString().split('T')[0] : 'N/A',
                data.status || 'Open'
            ]
        ];

        // 4. Append
        await sheets.spreadsheets.values.append({
            spreadsheetId,
            range: 'Sheet1!A:I',
            valueInputOption: 'USER_ENTERED',
            resource: { values },
        });

        console.log(`✅ Demand Listing ${data._id} added to Google Sheet.`);

    } catch (error) {
        console.error('❌ Google Sheets Error:', error.message);
    }
};
