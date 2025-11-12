import { Server } from "socket.io";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  console.error("❌ JWT_SECRET environment variable is not set");
  process.exit(1);
}

// Store rooms in memory (could be moved to database later)
const rooms = new Map(); // roomId -> { gameName, players: [], maxPlayers: 2 }

// Generate a random room code
function generateRoomCode() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

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

    // Handle room creation
    socket.on("create-room", ({ gameName }, callback) => {
      try {
        console.log(
          `Create room request from ${socket.username} for game: ${gameName}`
        );

        if (!gameName) {
          console.error("No gameName provided");
          const errorMsg = "Game name is required";
          if (callback) callback({ error: errorMsg });
          socket.emit("room-error", { message: errorMsg });
          return;
        }

        // Generate unique room code
        let roomId;
        let attempts = 0;
        do {
          roomId = generateRoomCode();
          attempts++;
          if (attempts > 100) {
            throw new Error("Failed to generate unique room code");
          }
        } while (rooms.has(roomId));

        // Create room
        const room = {
          roomId,
          gameName,
          players: [
            {
              id: socket.userId,
              username: socket.username,
              socketId: socket.id,
            },
          ],
          maxPlayers: 2, // Default max players (can be customized per game)
          createdAt: new Date(),
        };

        rooms.set(roomId, room);
        socket.join(roomId);
        socket.currentRoom = roomId;

        console.log(
          `✅ Room created: ${roomId} by ${socket.username} for game ${gameName}`
        );

        // Acknowledge receipt
        if (callback) callback({ success: true });

        // Emit room created event
        socket.emit("room-created", { roomId, gameName });
      } catch (error) {
        console.error("❌ Error creating room:", error);
        const errorMsg = error.message || "Failed to create room";
        if (callback) callback({ error: errorMsg });
        socket.emit("room-error", { message: errorMsg });
      }
    });

    // Handle room joining
    socket.on("join-room", ({ roomId, gameName }) => {
      try {
        const room = rooms.get(roomId);

        if (!room) {
          socket.emit("room-not-found");
          return;
        }

        if (room.gameName !== gameName) {
          socket.emit("room-error", {
            message: "Room is for a different game",
          });
          return;
        }

        // Check if room is full
        if (room.players.length >= room.maxPlayers) {
          socket.emit("room-full");
          return;
        }

        // Check if user is already in the room
        const alreadyInRoom = room.players.some((p) => p.id === socket.userId);
        if (alreadyInRoom) {
          socket.emit("room-error", {
            message: "You are already in this room",
          });
          return;
        }

        // Add player to room
        room.players.push({
          id: socket.userId,
          username: socket.username,
          socketId: socket.id,
        });

        socket.join(roomId);
        socket.currentRoom = roomId;

        console.log(`User ${socket.username} joined room ${roomId}`);

        // Notify the joining player
        socket.emit("room-joined", { roomId, gameName, players: room.players });

        // Notify other players in the room
        socket.to(roomId).emit("player-joined", {
          player: {
            id: socket.userId,
            username: socket.username,
          },
          players: room.players,
        });
      } catch (error) {
        console.error("Error joining room:", error);
        socket.emit("room-error", { message: "Failed to join room" });
      }
    });

    // Handle leaving room
    socket.on("leave-room", ({ roomId }) => {
      try {
        if (!roomId) {
          socket.emit("room-error", { message: "Room ID is required" });
          return;
        }
        
        const room = rooms.get(roomId);
        if (!room) {
          socket.emit("room-error", { message: "Room not found" });
          return;
        }
        
        // Verify user is actually in the room
        const playerInRoom = room.players.some((p) => p.socketId === socket.id);
        if (!playerInRoom) {
          socket.emit("room-error", { message: "You are not in this room" });
          return;
        }
        
        room.players = room.players.filter((p) => p.socketId !== socket.id);

        if (room.players.length === 0) {
          // Delete room if empty
          rooms.delete(roomId);
          console.log(`Room ${roomId} deleted (empty)`);
        } else {
          // Notify other players
          socket.to(roomId).emit("player-left", {
            player: {
              id: socket.userId,
              username: socket.username,
            },
            players: room.players,
          });
        }

        socket.leave(roomId);
        socket.currentRoom = null;
        console.log(`User ${socket.username} left room ${roomId}`);
      } catch (error) {
        console.error("Error leaving room:", error);
      }
    });

    // Handle chat messages
    socket.on("chat-message", ({ roomId, message }) => {
      try {
        // Verify user is in the room
        if (socket.currentRoom !== roomId) {
          socket.emit("chat-error", { message: "You are not in this room" });
          return;
        }

        // Validate message
        if (
          !message ||
          typeof message !== "string" ||
          message.trim().length === 0
        ) {
          socket.emit("chat-error", { message: "Message cannot be empty" });
          return;
        }

        // Limit message length
        if (message.length > 500) {
          socket.emit("chat-error", {
            message: "Message too long (max 500 characters)",
          });
          return;
        }

        const chatData = {
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
          roomId,
          userId: socket.userId,
          username: socket.username,
          message: message.trim(),
          timestamp: new Date().toISOString(),
        };

        console.log(
          `💬 Chat message in room ${roomId} from ${socket.username}: ${message}`
        );

        // Broadcast to all players in the room
        io.to(roomId).emit("chat-message", chatData);
      } catch (error) {
        console.error("Error handling chat message:", error);
        socket.emit("chat-error", { message: "Failed to send message" });
      }
    });

    // Handle disconnection
    socket.on("disconnect", () => {
      console.log(`User disconnected: ${socket.username} (${socket.userId})`);

      // Remove user from all rooms
      if (socket.currentRoom) {
        const room = rooms.get(socket.currentRoom);
        if (room) {
          room.players = room.players.filter((p) => p.socketId !== socket.id);

          if (room.players.length === 0) {
            rooms.delete(socket.currentRoom);
            console.log(
              `Room ${socket.currentRoom} deleted (empty after disconnect)`
            );
          } else {
            socket.to(socket.currentRoom).emit("player-left", {
              player: {
                id: socket.userId,
                username: socket.username,
              },
              players: room.players,
            });
          }
        }
      }
    });
  });

  return io;
}
