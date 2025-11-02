
import "dotenv/config.js";

import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import authRoute from "./routes/authRoute.js";

const MONGODB_URI = process.env.MONGODB_URI;

mongoose
  .connect(MONGODB_URI)
  .then(() => console.log(`MongoDB connected to ${MONGODB_URI}`))
  .catch((err) => {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  });

process.on("SIGINT", async () => {
  await mongoose.connection.close();
  console.log("MongoDB connection closed due to app termination");
  process.exit(0);
});

const SERVER_PORT = process.env.SERVER_PORT;
const SERVER_IP_ADDRESS = process.env.SERVER_IP_ADDRESS;

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/auth", authRoute);



app.listen(SERVER_PORT, () => {
  console.log(
    `Server is running on port http://${SERVER_IP_ADDRESS}:${SERVER_PORT}`
  );
});
