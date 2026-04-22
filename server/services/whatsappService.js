const twilio = require('twilio');
const FarmerProfile = require('../models/FarmerProfile');

// Twilio Credentials from Environment Variables
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const fromNumber = process.env.TWILIO_WHATSAPP_NUMBER || 'whatsapp:+14155238886'; // Default sandbox number

// Initialize Twilio Client
let client;
if (accountSid && authToken) {
    client = twilio(accountSid, authToken);
} else {
    console.warn("Twilio Credentials missing. WhatsApp notifications will be simulated.");
}

/**
 * Send WhatsApp message to a single number
 * @param {string} to - Recipient number (e.g., '+919876543210')
 * @param {string} body - Message content
 */
const sendWhatsAppMessage = async (to, body) => {
    if (!client) {
        console.log(`[SIMULATION] Sending WhatsApp to ${to}: ${body}`);
        return;
    }

    try {
        // Ensure the number has the 'whatsapp:' prefix
        const formattedTo = to.startsWith('whatsapp:') ? to : `whatsapp:${to}`;
        console.log(`Attempting to send WhatsApp | From: ${fromNumber} | To: ${formattedTo}`);

        await client.messages.create({
            body: body,
            from: fromNumber,
            to: formattedTo
        });
        console.log(`WhatsApp sent to ${to}`);
    } catch (error) {
        console.error(`❌ Failed to send WhatsApp to ${to}`);
        console.error(`   Error: ${error.message}`);
        if (error.code) console.error(`   Code: ${error.code} (See: https://www.twilio.com/docs/api/errors/${error.code})`);

        // Fallback: Log the message so user knows what WOULD have been sent
        console.log(`[FALLBACK LOG] Message intended for ${to}:\n${body}`);
    }
};

/**
 * Broadcast new contract opportunity to relevant farmers
 * @param {Object} demand - The created demand object
 * @param {Object} buyer - The buyer user object
 */
exports.broadcastToFarmers = async (demand, buyer) => {
    try {
        // 1. Find ALL farmers with a WhatsApp number (Broadcasting to everyone as per request)
        const farmers = await FarmerProfile.find({
            'communication.whatsappNumber': { $exists: true, $ne: '' }
        }).select('communication.whatsappNumber personalDetails.languagePref');

        console.log(`Found ${farmers.length} potential farmers for WhatsApp notification for crop: ${demand.cropName}`);

        if (farmers.length === 0) return;

        // 2. Construct Message (Localization could be added here later)
        // Standard Template
        const messageBody = `🌱 *New Contract Opportunity!* \n\n` +
            `Crop: *${demand.cropName}*\n` +
            `Quantity: *${demand.quantityRequired} Tons*\n` +
            `Buyer: *${buyer.name}*\n` +
            `Price: *₹${demand.pricing?.maxBudget || 'Negotiable'}* \n\n` +
            `Apply now on *Kisan Bandhu* portal! 🚜`;

        // 3. Send Messages (in parallel but rate limited if needed)
        // For now, simple loop
        for (const farmer of farmers) {
            const number = farmer.communication.whatsappNumber;
            // Basic format validation
            if (number && number.length >= 10) {
                // Ensure country code if missing (Basic assumption +91 for India)
                let finalNumber = number;
                if (!number.startsWith('+')) {
                    finalNumber = '+91' + number;
                }

                await sendWhatsAppMessage(finalNumber, messageBody);
            }
        }

    } catch (error) {
        console.error("WhatsApp Broadcast Error:", error);
    }
};
