import express from "express";
import cors from "cors";
import authRoute from "./routes/authRoute.js";

const app = express();

app.use(cors()); 
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// routes
app.use("/auth", authRoute);

export default app;