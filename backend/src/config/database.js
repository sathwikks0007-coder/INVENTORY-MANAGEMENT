const mongoose = require('mongoose');
const dns = require('dns');

try {
  dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);
} catch (e) {}

if (dns.setDefaultResultOrder) {
  dns.setDefaultResultOrder('ipv4first');
}

const DEFAULT_ATLAS_URI = 'mongodb+srv://sathwikks0007_db_user:bsSBjVRL8hWIJs3D@cluster0.gdvm2yk.mongodb.net/inventory_db?appName=Cluster0';

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || DEFAULT_ATLAS_URI;
    console.log('[Connecting to MongoDB Atlas...]');
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
