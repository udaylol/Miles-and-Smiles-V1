import { Server } from "socket.io";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  console.error("❌ JWT_SECRET environment variable is not set");
  process.exit(1);
}

// Store rooms in memory (could be moved to database later)
const rooms = new Map(); // roomId -> { gameName, players: [], maxPlayers: 2 }

// Store active games in memory
// games[roomId] = { board: [3x3], players: { X: socketId, O: socketId }, turn: "X" | "O", winner: null | "X" | "O" | "draw" }
const games = new Map();

// Generate a random room code
function generateRoomCode() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

// Initialize an empty 3x3 Tic Tac Toe board
function createEmptyBoard() {
  return [
    [null, null, null],
    [null, null, null],
    [null, null, null],
  ];
}

// Check if a player has won the game
// Returns "X", "O", or null
function checkWinner(board) {
  // Check rows
  for (let row = 0; row < 3; row++) {
    if (
      board[row][0] &&
      board[row][0] === board[row][1] &&
      board[row][1] === board[row][2]
    ) {
      return board[row][0];
    }
  }

  // Check columns
  for (let col = 0; col < 3; col++) {
    if (
      board[0][col] &&
      board[0][col] === board[1][col] &&
      board[1][col] === board[2][col]
    ) {
      return board[0][col];
    }
  }

  // Check diagonals
  if (
    board[0][0] &&
    board[0][0] === board[1][1] &&
    board[1][1] === board[2][2]
  ) {
    return board[0][0];
  }

  if (
    board[0][2] &&
    board[0][2] === board[1][1] &&
    board[1][1] === board[2][0]
  ) {
    return board[0][2];
  }

  return null;
}

// Check if the board is full (draw condition)
function isBoardFull(board) {
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 3; col++) {
      if (board[row][col] === null) {
        return false;
      }
    }
  }
  return true;
}

// Start a new Tic Tac Toe game for a room
function startGame(io, roomId, room) {
  // Only start game if we have exactly 2 players
  if (room.players.length !== 2) {
    return;
  }

  // Create game state
  const game = {
    board: createEmptyBoard(),
    players: {
      X: room.players[0].socketId,
      O: room.players[1].socketId,
    },
    turn: "X", // First player (X) goes first
    winner: null,
  };

  games.set(roomId, game);

  console.log(`🎮 Game started in room ${roomId}`);

  // Emit game start event to all players in the room
  io.to(roomId).emit("game:start", {
    players: {
      X: room.players[0].socketId,
      O: room.players[1].socketId,
    },
    board: game.board,
    turn: game.turn,
  });
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

        // If this is the second player joining and it's Tic Tac Toe, start the game
        // Use a small delay to ensure all event listeners are set up on the client
        if (room.players.length === 2 && gameName === "Tic Tac Toe") {
          setTimeout(() => {
            startGame(io, roomId, room);
          }, 100); // Small delay to ensure client listeners are ready
        }
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

        // Check if there's an active game and the leaving player is part of it
        const game = games.get(roomId);
        if (game && game.winner === null) {
          // Player left during an active game
          const isPlayerX = game.players.X === socket.id;
          const isPlayerO = game.players.O === socket.id;

          if (isPlayerX || isPlayerO) {
            console.log(
              `⚠️ Player left during active game in room ${roomId}`
            );

            // Emit opponent left event to remaining players
            socket.to(roomId).emit("game:opponent_left", {
              message: "Your opponent has left the game",
            });

            // Clean up the game
            games.delete(roomId);
          }
        }
        
        room.players = room.players.filter((p) => p.socketId !== socket.id);

        if (room.players.length === 0) {
          // Delete room and any associated game if empty
          rooms.delete(roomId);
          games.delete(roomId);
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

    // Handle game reset (Play Again)
    socket.on("game:reset", ({ roomId }) => {
      try {
        // Verify user is in the room
        if (socket.currentRoom !== roomId) {
          socket.emit("game:error", { message: "You are not in this room" });
          return;
        }

        // Check if game exists
        const game = games.get(roomId);
        if (!game) {
          socket.emit("game:error", { message: "No active game in this room" });
          return;
        }

        // Verify user is a player in the game
        const isPlayerX = game.players.X === socket.id;
        const isPlayerO = game.players.O === socket.id;
        if (!isPlayerX && !isPlayerO) {
          socket.emit("game:error", {
            message: "You are not a player in this game",
          });
          return;
        }

        // Get the room to access players
        const room = rooms.get(roomId);
        if (!room || room.players.length !== 2) {
          socket.emit("game:error", {
            message: "Cannot reset game: not enough players",
          });
          return;
        }

        // Reset game state
        game.board = createEmptyBoard();
        game.turn = "X"; // X always goes first
        game.winner = null;

        // Alternate who goes first (swap X and O)
        // This gives both players a chance to go first
        const temp = game.players.X;
        game.players.X = game.players.O;
        game.players.O = temp;

        console.log(`🔄 Game reset in room ${roomId}`);

        // Emit game start event to all players in the room
        io.to(roomId).emit("game:start", {
          players: {
            X: game.players.X,
            O: game.players.O,
          },
          board: game.board,
          turn: game.turn,
        });
      } catch (error) {
        console.error("Error handling game reset:", error);
        socket.emit("game:error", { message: "Failed to reset game" });
      }
    });

    // Handle game moves (Tic Tac Toe)
    socket.on("game:move", ({ roomId, index, row, col }) => {
      try {
        // Verify user is in the room
        if (socket.currentRoom !== roomId) {
          socket.emit("game:error", { message: "You are not in this room" });
          return;
        }

        // Check if game exists
        const game = games.get(roomId);
        if (!game) {
          socket.emit("game:error", { message: "No active game in this room" });
          return;
        }

        // Convert index (0-8) to row/col if index is provided, otherwise use row/col directly
        let moveRow, moveCol;
        if (typeof index === "number") {
          // Convert index (0-8) to row/col
          if (index < 0 || index > 8) {
            socket.emit("game:error", {
              message: "Invalid move index (must be 0-8)",
            });
            return;
          }
          moveRow = Math.floor(index / 3);
          moveCol = index % 3;
        } else if (typeof row === "number" && typeof col === "number") {
          // Use row/col directly (backward compatibility)
          moveRow = row;
          moveCol = col;
        } else {
          socket.emit("game:error", {
            message: "Invalid move coordinates (provide index or row/col)",
          });
          return;
        }

        // Validate move coordinates
        if (moveRow < 0 || moveRow > 2 || moveCol < 0 || moveCol > 2) {
          socket.emit("game:error", {
            message: "Invalid move coordinates",
          });
          return;
        }

        // Check if game is already over
        if (game.winner !== null) {
          socket.emit("game:error", { message: "Game is already over" });
          return;
        }

        // Determine which player (X or O) is making the move
        let playerSymbol = null;
        if (game.players.X === socket.id) {
          playerSymbol = "X";
        } else if (game.players.O === socket.id) {
          playerSymbol = "O";
        } else {
          socket.emit("game:error", {
            message: "You are not a player in this game",
          });
          return;
        }

        // Check if it's this player's turn
        if (game.turn !== playerSymbol) {
          socket.emit("game:error", { message: "It's not your turn" });
          return;
        }

        // Check if cell is empty
        if (game.board[moveRow][moveCol] !== null) {
          socket.emit("game:error", { message: "Cell is already occupied" });
          return;
        }

        // Make the move
        game.board[moveRow][moveCol] = playerSymbol;

        console.log(
          `🎮 Move in room ${roomId}: Player ${playerSymbol} placed at [${moveRow}, ${moveCol}]`
        );

        // Check for winner
        const winner = checkWinner(game.board);
        if (winner) {
          game.winner = winner;
          game.turn = null; // Game is over, no more turns

          console.log(`🏆 Game over in room ${roomId}: ${winner} wins!`);

          // Emit game over event
          io.to(roomId).emit("game:over", {
            winner,
            board: game.board,
          });

          // Clean up game after a delay (optional - you might want to keep it for replay)
          // games.delete(roomId);
          return;
        }

        // Check for draw
        if (isBoardFull(game.board)) {
          game.winner = "draw";
          game.turn = null; // Game is over, no more turns

          console.log(`🤝 Game draw in room ${roomId}`);

          // Emit game draw event
          io.to(roomId).emit("game:draw", {
            board: game.board,
          });

          // Clean up game after a delay (optional)
          // games.delete(roomId);
          return;
        }

        // Switch turn
        game.turn = game.turn === "X" ? "O" : "X";

        // Emit game update to all players
        io.to(roomId).emit("game:update", {
          board: game.board,
          turn: game.turn,
        });
      } catch (error) {
        console.error("Error handling game move:", error);
        socket.emit("game:error", { message: "Failed to process move" });
      }
    });

    // Handle disconnection
    socket.on("disconnect", () => {
      console.log(`User disconnected: ${socket.username} (${socket.userId})`);

      // Remove user from all rooms
      if (socket.currentRoom) {
        const room = rooms.get(socket.currentRoom);
        if (room) {
          // Check if there's an active game and the disconnecting player is part of it
          const game = games.get(socket.currentRoom);
          if (game && game.winner === null) {
            // Player disconnected during an active game
            const isPlayerX = game.players.X === socket.id;
            const isPlayerO = game.players.O === socket.id;

            if (isPlayerX || isPlayerO) {
              console.log(
                `⚠️ Player disconnected during active game in room ${socket.currentRoom}`
              );

              // Emit opponent left event to remaining players
              socket.to(socket.currentRoom).emit("game:opponent_left", {
                message: "Your opponent has left the game",
              });

              // Clean up the game
              games.delete(socket.currentRoom);
            }
          }

          room.players = room.players.filter((p) => p.socketId !== socket.id);

          if (room.players.length === 0) {
            // Delete room and any associated game if empty
            rooms.delete(socket.currentRoom);
            games.delete(socket.currentRoom);
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
