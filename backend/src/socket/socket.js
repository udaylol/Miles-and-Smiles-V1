/**
 * Socket.IO Main Entry Point
 * Sets up Socket.IO server and registers all event handlers
 */

import { Server } from "socket.io";
import { setupChatHandler } from "./handlers/chatHandler.js";
import {
  setupRoomHandler,
  handleRoomDisconnect,
} from "./handlers/roomHandler.js";
import {
  setupTicTacToeHandler,
  startTicTacToeGame,
  handleTicTacToePlayerLeave,
} from "./handlers/ticTacToeHandler.js";
import {
  setupDotsAndBoxesHandler,
  startDotsAndBoxesGame,
  handleDotsAndBoxesPlayerLeave,
} from "./handlers/dotsAndBoxesHandler.js";
import {
  setupSnakesAndLaddersHandler,
  startSnakesAndLaddersGame,
  handleSnakesAndLaddersPlayerLeave,
} from "./handlers/snakesAndLaddersHandler.js";
import {
  setupMemoryHandler,
  startMemoryGame,
  handleMemoryPlayerLeave,
} from "./handlers/memoryHandler.js";
import { setupNotificationHandler } from "./handlers/notificationHandler.js"; // NEW
import authenticateSocket from "../middlewares/socketMiddleware.js";

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

// Track connected users to support reconnects
// userId -> { socketId, roomId, role, online, lastSeen }
const connectedUsers = new Map();

// Store io instance globally so workers can access it
let ioInstance = null;

export default function setupSocket(server) {
  const io = new Server(server, {
    cors: {
      origin: "*", // In production, specify your frontend URL
      methods: ["GET", "POST"],
    },
  });

  // Store io instance
  ioInstance = io;

  // Use authentication middleware
  io.use(authenticateSocket);

  io.on("connection", (socket) => {
    console.log(`User connected: ${socket.username} (${socket.userId})`);

    // Join user to their personal notification room
    socket.join(socket.userId);
    console.log(`👤 ${socket.username} joined notification room: ${socket.userId}`);

    // Update connected users map
    connectedUsers.set(socket.userId, {
      socketId: socket.id,
      roomId: socket.currentRoom || null,
      role: null,
      online: true,
      lastSeen: Date.now(),
    });

    // Set up room handlers with callbacks (pass connectedUsers map)
    setupRoomHandler(
      socket,
      io,
      rooms,
      (roomId, room) => {
        // Callback when game should start - detect game type
        if (room.gameName === "Dots and Boxes") {
          startDotsAndBoxesGame(io, roomId, room, games);
        } else if (room.gameName === "Snakes and Ladders") {
          startSnakesAndLaddersGame(io, roomId, room, games);
        } else if (room.gameName === "Memory") {
          startMemoryGame(io, roomId, room, games);
        } else {
          // Default to TicTacToe for backward compatibility
          startTicTacToeGame(io, roomId, room, games);
        }
      },
      (socket, roomId) => {
        // Callback when player leaves room (intentional leave)
        const room = rooms.get(roomId);
        if (room?.gameName === "Dots and Boxes") {
          handleDotsAndBoxesPlayerLeave(socket, roomId, games, rooms, io);
        } else if (room?.gameName === "Snakes and Ladders") {
          handleSnakesAndLaddersPlayerLeave(socket, roomId, games, rooms, io);
        } else if (room?.gameName === "Memory") {
          handleMemoryPlayerLeave(socket, roomId, games, rooms, io);
        } else {
          handleTicTacToePlayerLeave(socket, roomId, games, rooms, io);
        }
      },
      connectedUsers
    );

    // Set up chat handlers
    setupChatHandler(socket, io);

    // Set up TicTacToe game handlers
    setupTicTacToeHandler(socket, io, games, rooms, connectedUsers);

    // Set up Dots and Boxes game handlers
    setupDotsAndBoxesHandler(socket, io, games, rooms, connectedUsers);

    // Set up Snakes and Ladders game handlers
    setupSnakesAndLaddersHandler(socket, io, games, rooms, connectedUsers);

    // Set up Memory game handlers
    setupMemoryHandler(socket, io, games, rooms, connectedUsers);

    // Set up notification handlers (NEW)
    setupNotificationHandler(socket, io);

    // Handle client requesting to rejoin a room after reconnect
    socket.on("rejoin-room", ({ roomId }) => {
      try {
        // Derive userId from authenticated socket (safer and resilient when client
        // hasn't loaded user data yet). Do not rely on client-sent userId.
        const userId = socket.userId;
        if (!userId) {
          socket.emit("rejoin-failed", { message: "Unauthenticated socket" });
          return;
        }

        const room = rooms.get(roomId);
        if (!room) {
          socket.emit("room-not-found");
          return;
        }

        // Find the player entry in the room by userId
        const player = room.players.find((p) => p.id === userId);
        if (!player) {
          // If player is not in the room, return a non-fatal rejoin-failed event
          socket.emit("rejoin-failed", {
            message: "You are not a player in this room",
          });
          return;
        }

        // Restore player's socketId in room and mark online
        player.socketId = socket.id;
        if (player.offline) delete player.offline;

        // Update connectedUsers map
        connectedUsers.set(userId, {
          socketId: socket.id,
          roomId,
          role: null,
          online: true,
          lastSeen: Date.now(),
        });

        // Join the socket to the room
        socket.join(roomId);
        socket.currentRoom = roomId;

        // If there is an active game, update its socket mapping and send full sync
        const game = games.get(roomId);
        if (game) {
          // Update socketId in game instance if it tracks userId
          if (typeof game.updateSocketIdForUser === "function") {
            game.updateSocketIdForUser(userId, socket.id);
          }

          // Send a full game sync to the rejoined player
          const gameState = game.getState();
          socket.emit("game:sync", {
            board: gameState.board,
            turn: gameState.turn,
            players: gameState.players,
            winner: gameState.winner,
          });
        }

        // Notify other players that this player rejoined
        socket.to(roomId).emit("player-rejoined", {
          player: { id: userId, username: socket.username },
          players: room.players,
        });
      } catch (err) {
        console.error("Error during rejoin-room:", err);
        socket.emit("rejoin-failed", { message: "Failed to rejoin room" });
      }
    });

    // Handle disconnection
    socket.on("disconnect", (reason) => {
      try {
        console.log(
          `User disconnected: ${socket.username} (${socket.userId}) - ${reason}`
        );

        // Leave their notification room
        socket.leave(socket.userId);

        // Mark user as temporarily offline and keep room/game state
        const cu = connectedUsers.get(socket.userId) || {};
        connectedUsers.set(socket.userId, {
          socketId: null,
          roomId: cu.roomId || socket.currentRoom || null,
          role: cu.role || null,
          online: false,
          lastSeen: Date.now(),
        });

        // Update room player entry to mark offline but keep them listed
        if (socket.currentRoom) {
          const room = rooms.get(socket.currentRoom);
          if (room) {
            const player = room.players.find((p) => p.id === socket.userId);
            if (player) {
              player.offline = true;
              player.socketId = null;
              // Notify remaining players
              socket.to(socket.currentRoom).emit("player-offline", {
                player: { id: socket.userId, username: socket.username },
                players: room.players,
              });
            }

            // Do NOT delete the room or the game here — allow reconnection to restore state
            // Schedule cleanup if both players remain offline for a long time (e.g., 10 minutes)
            const allOffline = room.players.every((p) => p.offline);
            if (allOffline) {
              setTimeout(() => {
                const stillRoom = rooms.get(socket.currentRoom);
                if (stillRoom && stillRoom.players.every((p) => p.offline)) {
                  console.log(
                    `Cleaning up idle room ${socket.currentRoom} after extended disconnect`
                  );
                  rooms.delete(socket.currentRoom);
                  games.delete(socket.currentRoom);
                }
              }, 10 * 60 * 1000); // 10 minutes
            }
          }
        }
      } catch (err) {
        console.error("Error handling disconnect:", err);
      }
    });
  });

  return io;
}

// Export function to get io instance (for workers)
export function getIO() {
  if (!ioInstance) {
    throw new Error("Socket.IO not initialized. Call setupSocket() first.");
  }
  return ioInstance;
}

