const mongoose = require('mongoose');
const Scheme = require('./models/Scheme');
const connectDB = require('./config/db');
require('dotenv').config();

const verifySchemes = async () => {
    await connectDB();
    const count = await Scheme.countDocuments();
    console.log(`Active Schemes in DB: ${count}`);
    const schemes = await Scheme.find({}, 'title provider');
    console.log(schemes);
    process.exit();
};

verifySchemes();
