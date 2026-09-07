const mongoose = require('mongoose');
require('dotenv').config();

let db;

async function initializeDatabase() {
    try {
        const uri = process.env.MONGO_URI;
        if (!uri) {
            console.error("No MONGO_URI provided in .env");
            return;
        }
        
        await mongoose.connect(uri);
        
        db = mongoose.connection;
        console.log("MongoDB connected successfully");
        return db;
    } catch (error) {
        console.error("MongoDB connection error:", error);
        throw error;
    }
}

function getDatabase() {
    return db;
}

module.exports = {
    initializeDatabase,
    getDatabase
};