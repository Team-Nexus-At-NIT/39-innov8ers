const User = require('../models/User');

class SmsService {
    /**
     * Simulate sending an SMS to a single number
     * @param {string} phone - e.g., "+919876543210"
     * @param {string} message - Content
     */
    async send(phone, message) {
        // In a real app, this would be: await twilio.messages.create({ ... })
        console.log(`\n📱 [SMS GATEWAY] Sending to ${phone}: "${message}"`);
        return true;
    }

    /**
     * Broadcast a message to all registered farmers
     * @param {string} message - Content
     */
    async broadcastToFarmers(message) {
        try {
            console.log(`\n📢 [SMS BROADCAST] Initiating broadcast...`);

            // Find all farmers with a phone number
            const farmers = await User.find({ role: 'farmer', phone: { $exists: true } }).select('phone name');

            if (farmers.length === 0) {
                console.log(`[SMS BROADCAST] No farmers found to notify.`);
                return;
            }

            console.log(`[SMS BROADCAST] Found ${farmers.length} farmers.`);

            // Send in parallel (simulated)
            const promises = farmers.map(farmer => {
                return this.send(farmer.phone, `Hi ${farmer.name}, ${message}`);
            });

            await Promise.all(promises);
            console.log(`✅ [SMS BROADCAST] Completed successfully.\n`);

        } catch (error) {
            console.error(`❌ [SMS BROADCAST ERROR]`, error);
        }
    }
}

module.exports = new SmsService();
