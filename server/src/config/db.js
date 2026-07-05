const mongoose = require('mongoose');

async function connectDB(uri) {
  try {
    await mongoose.connect(uri);
    console.log(`MongoDB connected: ${mongoose.connection.host}/${mongoose.connection.name}`);
  } catch (err) {
    console.error(`MongoDB connection failed: ${err.message}`);
    console.error('API will run without a database until MongoDB is available.');
  }
}

module.exports = connectDB;
