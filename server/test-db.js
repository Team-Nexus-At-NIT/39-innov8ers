const mongoose = require('mongoose');
require('dotenv').config();

const testConnection = async () => {
    try {
        console.log('Testing connection to:', process.env.MONGO_URI);
        await mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 5000 });
        console.log('✅ Connection Successful!');
        console.log('Database Name:', mongoose.connection.name);
        console.log('Host:', mongoose.connection.host);
        process.exit(0);
    } catch (error) {
        console.error('❌ Connection Failed:', error.message);
        process.exit(1);
    }
};

testConnection();
