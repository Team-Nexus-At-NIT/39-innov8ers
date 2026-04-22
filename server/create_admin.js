const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');

// Load env vars
dotenv.config({ path: './.env' });

const createAdmin = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log(`MongoDB Connected: ${conn.connection.host}`);

        const adminEmail = 'admin@contractfarming.com';
        const adminPassword = 'adminpassword123';

        // Check if admin exists
        const userExists = await User.findOne({ email: adminEmail });

        if (userExists) {
            console.log('Admin user already exists.');
            process.exit();
        }

        // Create Admin
        const user = await User.create({
            name: 'System Administrator',
            email: adminEmail,
            password: adminPassword,
            role: 'admin',
            phone: '9999999999',
            isVerified: true, // Admins are auto-verified
            location: {
                type: 'Point',
                coordinates: [0, 0],
                address: 'Headquarters'
            }
        });

        console.log('Admin User Created Successfully!');
        console.log(`Email: ${adminEmail}`);
        console.log(`Password: ${adminPassword}`);

        process.exit();
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

createAdmin();
