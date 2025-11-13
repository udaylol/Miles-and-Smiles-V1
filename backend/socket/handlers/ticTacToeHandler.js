/**
 * TicTacToe Game Handler
 * Handles all TicTacToe game-related Socket.IO events
 */

import { TicTacToeGame } from "../game/ticTacToeGame.js";

/**
 * Set up TicTacToe game event handlers
 * @param {Socket} socket - Socket.IO socket instance
 * @param {Server} io - Socket.IO server instance
 * @param {Map} games - Games map (roomId -> TicTacToeGame instance)
 * @param {Map} rooms - Rooms map (roomId -> room data)
 */
export function setupTicTacToeHandler(socket, io, games, rooms, connectedUsers) {
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
      const playerSymbol = game.getPlayerSymbol(socket.id);
      if (!playerSymbol) {
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
      game.reset();

      console.log(`🔄 Game reset in room ${roomId}`);

      // Emit game start event to all players in the room
      const gameState = game.getState();
      io.to(roomId).emit("game:start", {
        players: gameState.players,
        board: gameState.board,
        turn: gameState.turn,
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

      // Determine which player (X or O) is making the move
      const playerSymbol = game.getPlayerSymbol(socket.id);
      if (!playerSymbol) {
        socket.emit("game:error", {
          message: "You are not a player in this game",
        });
        return;
      }

      // Make the move
      const result = game.makeMove(playerSymbol, moveRow, moveCol);

      if (!result.success) {
        socket.emit("game:error", { message: result.error });
        return;
      }

      console.log(
        `🎮 Move in room ${roomId}: Player ${playerSymbol} placed at [${moveRow}, ${moveCol}]`
      );

      // Handle game over (winner)
      if (result.winner && result.winner !== "draw") {
        console.log(`🏆 Game over in room ${roomId}: ${result.winner} wins!`);

        // Emit game over event
        const gameState = game.getState();
        io.to(roomId).emit("game:over", {
          winner: result.winner,
          board: gameState.board,
        });
        return;
      }

      // Handle draw
      if (result.isDraw) {
        console.log(`🤝 Game draw in room ${roomId}`);

        // Emit game draw event
        const gameState = game.getState();
        io.to(roomId).emit("game:draw", {
          board: gameState.board,
        });
        return;
      }

      // Emit game update to all players
      const gameState = game.getState();
      io.to(roomId).emit("game:update", {
        board: gameState.board,
        turn: gameState.turn,
      });
    } catch (error) {
      console.error("Error handling game move:", error);
      socket.emit("game:error", { message: "Failed to process move" });
    }
  });
}

/**
 * Start a new Tic Tac Toe game for a room
 * @param {Server} io - Socket.IO server instance
 * @param {string} roomId - Room ID
 * @param {Object} room - Room data
 * @param {Map} games - Games map
 */
export function startTicTacToeGame(io, roomId, room, games) {
  // Only start game if we have exactly 2 players
  if (room.players.length !== 2) {
    return;
  }

  // Create game instance
  const game = new TicTacToeGame(room.players);
  games.set(roomId, game);

  console.log(`🎮 Game started in room ${roomId}`);

  // Emit game start event to all players in the room
  const gameState = game.getState();
  io.to(roomId).emit("game:start", {
    players: gameState.players,
    board: gameState.board,
    turn: gameState.turn,
  });
}

/**
 * Handle player leaving during an active game
 * @param {Socket} socket - Socket.IO socket instance
 * @param {string} roomId - Room ID
 * @param {Map} games - Games map
 */
export function handleTicTacToePlayerLeave(socket, roomId, games) {
  const game = games.get(roomId);
  if (game && game.winner === null) {
    // Player left during an active game
    const playerSymbol = game.getPlayerSymbol(socket.id);

    if (playerSymbol) {
      console.log(`⚠️ Player left during active game in room ${roomId}`);

      // Emit opponent left event to remaining players
      socket.to(roomId).emit("game:opponent_left", {
        message: "Your opponent has left the game",
      });

      // Clean up the game
      games.delete(roomId);
    }
  }
}

