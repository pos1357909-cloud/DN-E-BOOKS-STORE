const mongoose = require('mongoose');
const dns = require('dns');

// Windows / ISP DNS හරහා MongoDB Atlas SRV record resolve වීමේදී
// ඇතිවන querySrv ECONNREFUSED දෝෂය වැළැක්වීම සඳහා Google DNS set කිරීම
try {
    dns.setServers(['8.8.8.8', '8.8.4.4']);
} catch (e) {
    // Fallback if environment doesn't allow setting DNS
}

/**
 * Connect to MongoDB Atlas using Mongoose
 */
const connectDB = async () => {
    try {
        const uri = process.env.MONGODB_URI;
        if (!uri) {
            console.error('❌ MongoDB Connection Error: MONGODB_URI is not defined in environment variables.');
            return;
        }

        const conn = await mongoose.connect(uri);
        console.log(`✅ MongoDB Connected Successfully: ${conn.connection.host}`);
        return conn;
    } catch (err) {
        console.error('❌ MongoDB Connection Error:', err.message || err);
    }
};

module.exports = connectDB;
