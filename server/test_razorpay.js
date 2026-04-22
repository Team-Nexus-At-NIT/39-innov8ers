const Razorpay = require('razorpay');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const instance = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_SECRET
});

async function test() {
    try {
        const order = await instance.orders.create({
            amount: 100,
            currency: 'INR',
            receipt: 'test_receipt'
        });
        console.log('Order created successfully:', order);
    } catch (error) {
        console.error('Failed to create order:', error);
    }
}

test();
