/**
 * Socket.IO Main Entry Point
 * Sets up Socket.IO server and registers all event handlers
 */

import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import { setupChatHandler } from "./handlers/chatHandler.js";
import { setupRoomHandler, handleRoomDisconnect } from "./handlers/roomHandler.js";
import {
  setupTicTacToeHandler,
  startTicTacToeGame,
  handleTicTacToePlayerLeave,
} from "./handlers/ticTacToeHandler.js";

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  console.error("❌ JWT_SECRET environment variable is not set");
  process.exit(1);
}

// Store rooms in memory (could be moved to database later)
// roomId -> { gameName, players: [], maxPlayers: 2 }
const rooms = new Map();

// Store active games in memory
// roomId -> TicTacToeGame instance
const games = new Map();

// Socket authentication middleware
function authenticateSocket(socket, next) {
  const token = socket.handshake.auth?.token;

  if (!token) {
    console.error("❌ Socket auth failed: No token provided");
    return next(new Error("Authentication error: No token provided"));
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    socket.userId = decoded.id;
    socket.username = decoded.username;
    console.log(`✅ Socket authenticated: ${decoded.username} (${decoded.id})`);
    next();
  } catch (err) {
    console.error("❌ Socket auth failed: Invalid token", err.message);
    return next(new Error("Authentication error: Invalid token"));
  }
}

export default function setupSocket(server) {
  const io = new Server(server, {
    cors: {
      origin: "*", // In production, specify your frontend URL
      methods: ["GET", "POST"],
    },
  });

  // Use authentication middleware
  io.use(authenticateSocket);

  io.on("connection", (socket) => {
    console.log(`User connected: ${socket.username} (${socket.userId})`);

    // Set up room handlers with callbacks
    setupRoomHandler(
      socket,
      io,
      rooms,
      (roomId, room) => {
        // Callback when game should start
        startTicTacToeGame(io, roomId, room, games);
      },
      (socket, roomId) => {
        // Callback when player leaves room
        handleTicTacToePlayerLeave(socket, roomId, games);
      }
    );

    // Set up chat handlers
    setupChatHandler(socket, io);

    // Set up TicTacToe game handlers
    setupTicTacToeHandler(socket, io, games, rooms);

    // Handle disconnection
    socket.on("disconnect", () => {
      console.log(`User disconnected: ${socket.username} (${socket.userId})`);
      handleRoomDisconnect(socket, rooms, games, handleTicTacToePlayerLeave);
    });
  });

  return io;
}

