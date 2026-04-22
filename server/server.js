const express = require('express');
// Updated Razorpay Integration Diagnostic
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const connectDB = require('./config/db');

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Middleware
app.use(express.json());
// CORS Configuration
const corsOptions = {
    origin: process.env.FRONTEND_URL || '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
};
app.use(cors(corsOptions));
app.use(helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
}));
app.use(morgan('dev'));

// Route files
const auth = require('./routes/auth');
const contracts = require('./routes/contracts');
const demands = require('./routes/demands');
const profiles = require('./routes/profiles');
const disputes = require('./routes/disputes');
const crops = require('./routes/crops');
const features = require('./routes/features');
const schemes = require('./routes/schemes');
const admin = require('./routes/admin');
const news = require('./routes/news');
const { seedSchemes } = require('./controllers/schemes');

// Mount routers
app.use('/api/auth', auth);
app.use('/api/contracts', contracts);
app.use('/api/demands', demands);
app.use('/api/profiles', profiles);
app.use('/api/disputes', disputes);
app.use('/api/crops', crops);
app.use('/api/features', features);
app.use('/api/schemes', schemes);
app.use('/api/admin', admin);
app.use('/api/news', news);
app.use('/api/market', require('./routes/marketRoutes'));
app.use('/api/upload', require('./routes/upload'));
app.use('/api/weather', require('./routes/weather'));
app.use('/api/blockchain', require('./routes/blockchain'));
app.use('/api/reviews', require('./routes/reviews'));
app.use('/api/chat', require('./routes/chat'));
app.use('/api/escrow', require('./routes/escrow'));

// Serve static files
const path = require('path');
app.use('/uploads', express.static(path.join(__dirname, '/uploads')));

// Serve Frontend in Production
if (process.env.NODE_ENV === 'production') {
    const buildPath = path.resolve(__dirname, '../client/dist');
    app.use(express.static(buildPath));

    app.get('*', (req, res) => {
        // Only serve index.html if it's not an API call and doesn't look like a file request (has no dot)
        if (!req.path.startsWith('/api') && !req.path.includes('.')) {
            res.sendFile(path.join(buildPath, 'index.html'));
        }
    });
} else {
    app.get('/', (req, res) => {
        res.send('API is running...');
    });
}

// Seed Schemes
seedSchemes();

// Error handling middleware
app.use((err, req, res, next) => {
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    res.status(statusCode);
    res.json({
        message: err.message,
        stack: process.env.NODE_ENV === 'production' ? null : err.stack,
    });
});

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});

// Init Socket.io
const io = require('socket.io')(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

io.on('connection', (socket) => {
    console.log('New client connected: ' + socket.id);

    // Join user to their own room for private notifications
    socket.on('join', (userId) => {
        if (userId) {
            socket.join(userId);
            console.log(`User ${userId} joined room ${userId}`);
        }
    });

    socket.on('disconnect', () => {
        console.log('Client disconnected');
    });
});

app.set('io', io);

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
    console.log(`Error: ${err.message}`);
    // Close server & exit process
    server.close(() => process.exit(1));
});
