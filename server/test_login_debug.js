const axios = require('axios');
const mongoose = require('mongoose');
const User = require('./models/User');
const connectDB = require('./config/db');
require('dotenv').config();

const runLoginTest = async () => {
    try {
        await connectDB();

        const testEmail = 'test_login_user@example.com';
        const testPass = 'password123';

        // 1. Cleanup existing test user
        await User.deleteOne({ email: testEmail });
        console.log('[SETUP] Old test user deleted.');

        // 2. Create new User directly via Model (bypassing registration API to test Model logic first)
        const newUser = await User.create({
            name: 'Test Login User',
            email: testEmail,
            password: testPass,
            role: 'farmer',
            phone: '9999999999',
            location: { type: 'Point', coordinates: [0, 0], address: 'Test View' }
        });
        console.log('[SETUP] New test user created directly in DB.');

        // 3. Test Password Match Method
        const isMatch = await newUser.matchPassword(testPass);
        console.log(`[MODEL TEST] matchPassword('${testPass}') returns: ${isMatch}`);

        if (!isMatch) {
            console.error('[CRITICAL] Password hashing/matching is BROKEN in Model!');
            process.exit(1);
        }

        // 4. Test API Login
        console.log(`[API TEST] Attempting login for ${testEmail}...`);
        try {
            const res = await axios.post('http://localhost:5000/api/auth/login', {
                email: testEmail,
                password: testPass
            });
            console.log('[API TEST] Login SUCCESS! Status:', res.status);
            console.log('Token received:', !!res.data.token);
        } catch (err) {
            console.error('[API TEST] Login FAILED!');
            if (err.response) {
                console.error(`Status: ${err.response.status}`);
                console.error('Error Msg:', err.response.data);
            } else {
                console.error('Network/Server Error:', err.message);
            }
        }

    } catch (err) {
        console.error('Script Error:', err);
    }
    process.exit();
};

runLoginTest();
