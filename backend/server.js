import "dotenv/config.js";
import http from "http";
import express from "express";
import path from "path";
import { fileURLToPath } from "url";

import app from "./app.js";
import { connectDB, disconnectDB } from "./config/db.js";
import setupSocket from "./socket/socket.js";

// ES module __dirname fix
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.BACKEND_SERVER_PORT || 5000;
const IP_ADDRESS = process.env.BACKEND_SERVER_IP_ADDRESS || "localhost";

// ======================================================
// ⭐ DETECT IF RUNNING IN DOCKER
// ======================================================
const IS_DOCKER =
  process.env.DOCKER_ENV === "true" || process.env.NODE_ENV === "production";

// ======================================================
// ⭐ MODE 1 — LOCAL DEV (VITE + BACKEND)
// ======================================================
if (!IS_DOCKER) {
  console.log("🟡 Local Development Mode");
  console.log("Backend: http://localhost:" + PORT);
  console.log("Frontend: http://localhost:5174");
}

// ======================================================
// ⭐ MODE 2 & 3 — DOCKER or DOCKER + NGROK
// Serve React build in /public
// ======================================================
if (IS_DOCKER) {
  const publicPath = path.join(__dirname, "public");

  console.log("🟢 Docker/Production Mode: Serving React build from", publicPath);

  // Serve static React files
  app.use(express.static(publicPath));

  // SAFE catch-all for Express 5
  app.use((req, res) => {
    res.sendFile(path.join(publicPath, "index.html"));
  });
}

// ======================================================
// 🔻 Graceful Shutdown
// ======================================================
process.on("SIGINT", async () => {
  await disconnectDB();
  console.log("App termination successful.");
  process.exit(0);
});

// ======================================================
// 🔵 Start Server
// ======================================================
const startServer = async () => {
  try {
    await connectDB();

    const server = http.createServer(app);
    setupSocket(server);

    server.listen(PORT, () => {
      console.log(`🚀 Server running at http://${IP_ADDRESS}:${PORT}`);
    });
  } catch (err) {
    console.error("❌ Failed to start server:", err);
    process.exit(1);
  }
};

startServer();
