const mongoose = require('mongoose');
const dns = require('dns');

try {
  dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);
} catch (e) {}

if (dns.setDefaultResultOrder) {
  dns.setDefaultResultOrder('ipv4first');
}

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI;
    if (!mongoURI) {
      console.error('CRITICAL ERROR: MONGODB_URI is not defined in environment variables.');
      process.exit(1);
    }
    const conn = await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 10000
    });
    console.log(`[MongoDB Atlas Connected]: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`[MongoDB Connection Error]: ${error.message}`);
    throw error;
  }
};

module.exports = connectDB;
