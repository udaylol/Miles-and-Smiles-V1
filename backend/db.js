import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

export const connectDB = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log(`✅ MongoDB connected to ${MONGODB_URI}`);
  } catch (err) {
    console.error("❌ MongoDB connection error:", err);
    process.exit(1);
  }
};

export const disconnectDB = async () => {
  await mongoose.connection.close();
  console.log("🛑 MongoDB connection closed");
};