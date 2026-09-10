
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const path = require('path');

const connectDB = require('./config/database');
const config = require('./config/environment');
const routes = require('./index');
const errorHandler = require('./middleware/errorHandler.middleware');
const {rateLimiter} = require('./middleware/rateLimiter.middleware');
const loggerMiddleware = require('./middleware/logger.middleware');
const {swaggerUi, swaggerDocs} = require('./swagger');


const app = express();
connectDB();   //  CONNECT DATABASE

//  SECURITY MIDDLEWARE
app.use(helmet());
app.use(cors({
    origin: config.CLIENT_URL,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
}));

// RATE LIMITING 
app.use(rateLimiter);

//  COMPRESSION 
app.use(compression());

// LOGGING
if (config.NODE_ENV !== 'production') {
    app.use(morgan('dev'));
}
app.use(loggerMiddleware);

// BODY PARSING 
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// STATIC FILES 
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// SWAGGER UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));
app.get('/api-docs.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(specs);
});

// HEALTH CHECK 
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        environment: config.NODE_ENV,
        uptime: process.uptime(),
    });
});

// ALL API ROUTES 
app.use('/api', routes);

// 404 HANDLER 
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found',
        path: req.originalUrl,
    });
});

// ERROR HANDLER 
app.use(errorHandler);

module.exports = app;