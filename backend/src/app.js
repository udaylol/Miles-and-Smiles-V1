import express from "express";
import cors from "cors";
import morgan from "morgan";
import authRoute from "./routes/authRoute.js";
import gameRoute from "./routes/gameRoute.js";
import userRoutes from "./routes/userRoutes.js";

const app = express();

// Custom morgan format for better logging
const logFormat = ':method :url :status :response-time ms - :res[content-length] bytes';

// middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging - shows all API hits in real-time
app.use(morgan(logFormat, {
  skip: (req, res) => req.url === '/health' // Skip health checks
}));

// Log request body for POST/PUT (for debugging)
app.use((req, res, next) => {
  if (['POST', 'PUT', 'PATCH'].includes(req.method) && req.body) {
    console.log(`📦 Request Body:`, JSON.stringify(req.body, null, 2));
  }
  next();
});

// routes
app.get("/", (req, res) => {
  res.send("Miles and Smiles backend is working");
});

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.use("/api/auth", authRoute);
app.use("/api/games", gameRoute);
app.use("/api/user", userRoutes);

export default app;

