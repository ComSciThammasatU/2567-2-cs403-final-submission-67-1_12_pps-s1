const mongoose = require('mongoose');

const uri = "mongodb+srv://taipangamer45:ZCGqdqKQJ70lIeCV@online-exam-system.nwm8vaa.mongodb.net/?retryWrites=true&w=majority&appName=online-exam-system";

const connectMongoDB = async () => {
  try {
    await mongoose.connect(uri);
    console.log("MongoDB connected successfully!");
  } catch (err) {
    console.error("Error connecting to MongoDB:", err.message);
    process.exit(1);
  }
};

module.exports = connectMongoDB;