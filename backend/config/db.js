const mongoose = require('mongoose');

const connectDB = async () => {
  const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;

  if (!mongoUri) {
    throw new Error('MongoDB connection string is missing. Set MONGO_URI or MONGODB_URI in backend/.env.');
  }

  try {
    const conn = await mongoose.connect(
      mongoUri,
      {
        serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of hanging
        socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
        family: 4, // Use IPv4, skip trying IPv6
      }
    );
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    throw error;
  }
};

module.exports = connectDB;
