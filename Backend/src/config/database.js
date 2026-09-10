// MongoDB connection setup using Mongoose
// Connects to database and handles connection events

const mongoose = require('mongoose');
const environment = require('./environment');

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(environment.MONGODB_URI);

        // console.log(`\n✅ MongoDB Connected: ${conn.connection.host}`);
        console.log(`\n📚 Database Connected : ${conn.connection.name}`);

        // Handle connection events
        mongoose.connection.on('error', (err) => {
            console.error('❌ MongoDB connection error:', err);
        });

        mongoose.connection.on('disconnected', () => {
            console.log('⚠️ MongoDB disconnected');
        });

        return conn;
    } catch (error) {
        console.error(`❌ MongoDB Connection Error: ${error.message}`);
        process.exit(1);
    }
};

module.exports = connectDB;