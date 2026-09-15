// Server startup file
// Connects to database, starts Express server on configured port
// Handles graceful shutdown and uncaught exceptions

const app = require('./app');
const config = require('./config/environment');

const PORT = config.PORT || 5000;

const server = app.listen(PORT, () => {

    console.log(`\n🔗 API URL (SERVER) : http://localhost:${PORT}/api`);

    // console.log('\n🚀 SUCCESSFULLY RUN E-COMMERCE MARKETPLACE SERVER');
    // console.log(`\n📡 Port: ${PORT}`);
    // console.log(`\n🌍 Environment: ${config.NODE_ENV}`);
    // console.log(`\n🕐 Started: ${new Date().toISOString()}`);
    
});

// GRACEFUL SHUTDOWN 
process.on('SIGTERM', () => {
    console.log('SIGTERM signal received: closing HTTP server');
    server.close(() => {
        console.log('HTTP server closed');
        process.exit(0);
    });
});

process.on('SIGINT', () => {
    console.log('SIGINT signal received: closing HTTP server');
    server.close(() => {
        console.log('HTTP server closed');
        process.exit(0);
    });
});

process.on('unhandledRejection', (err) => {
    console.error('Unhandled Rejection:', err);
    server.close(() => process.exit(1));
});

process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);
    server.close(() => process.exit(1));
});

module.exports = server;