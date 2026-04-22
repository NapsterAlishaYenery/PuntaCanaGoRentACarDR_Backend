// Main dependencies and security
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
require('dotenv').config();
const path = require('path');

// Import Utils
const setupAutoPing = require('./utils/auto-ping.util');

// Import global rate limiter middleware
const globalLimiter = require('./middleware/globalLimiter.middleware');

// Import database connection
const conectarMongoDBAltas = require('./config/db');

// Import routes
const carsRoutes = require('./routes/car.routes');
const userRoutes = require('./routes/user.routes');
const googleRoutes = require('./routes/review-google.routes');
const addonsRoutes = require('./routes/addon.routes');
const orderRoutes = require('./routes/order.routes');


// Create server
const app = express();

// Set global limiter
app.use(globalLimiter);

// Configure proxy
app.set('trust proxy', 1);


// Configure CORS
const allowedOrigins = [
    "http://localhost:4200",
    process.env.FRONTEND_URL,
    process.env.FRONTEND_URL_2,
]

app.use(cors({
    origin: (origin, callback) => {
        // Allow Postman and tools without origin
        if (!origin || allowedOrigins.includes(origin)) {
            return callback(null, true);
        }
        callback(new Error("CORS not allowed"));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Configure global middlewares
app.use(helmet());
app.use(compression());
app.use(express.json());

// Connect to MongoDB
conectarMongoDBAltas();

// Use routes
app.use('/api/cars', carsRoutes);
app.use('/api/users', userRoutes);
app.use('/api/google', googleRoutes);
app.use('/api/addons', addonsRoutes);
app.use('/api/orders', orderRoutes);

// Simple Routes for keep alive server
app.get('/keep-alive', (req, res) => {
  res.status(200).send('Servidor activo');
});

// Global error handling middleware
app.use((err, req, res, next) => {
    console.error("Global Server Error:", err.message);
    res.status(500).json({ error: "Internal server error captured in the global error middleware" });
})

// Configure CORS for images or static files
const corsStaticOptions = {
    origin: allowedOrigins,
    credentials: true
};

app.use('/uploads', (req, res, next) => {
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    next();
},
    express.static(path.join(__dirname, '../uploads'))
);

// Configure server port
const port = process.env.PORT || 4000;

// Usigng Utils methode setupAutoPing(); for auto get
setupAutoPing();

// Start server
app.listen(port, ()=>{
    console.log(`Server running on port ${port} Punta Cana Rental Car DR Ready`);
});

