/**
 * Custom Hook for TicTacToe Game State and Socket Logic
 * Manages all game state and socket event handling
 */

import { useState, useEffect } from "react";
import { setupSocketHandlers } from "./socketHandlers.js";

/**
 * Custom hook for TicTacToe game
 * @param {Socket} socket - Socket.IO socket instance
 * @param {string} roomId - Room ID
 * @returns {Object} Game state and handlers
 */
export function useTicTacToeGame(socket, roomId) {
  // Game state
  const [board, setBoard] = useState([
    [null, null, null],
    [null, null, null],
    [null, null, null],
  ]);
  const [turn, setTurn] = useState("X");
  const [mySymbol, setMySymbol] = useState(null); // "X" or "O" - which symbol this player is
  const [winner, setWinner] = useState(null); // "X", "O", "draw", or null
  const [gameStarted, setGameStarted] = useState(false);
  const [opponentLeft, setOpponentLeft] = useState(false);
  const [error, setError] = useState("");

  // Determine if it's the current player's turn
  const isMyTurn = gameStarted && turn === mySymbol && winner === null;

  // Set up Socket.IO event listeners
  useEffect(() => {
    if (!socket) return;

    // Handle room joined - check if game should start
    const handleRoomJoined = (data) => {
      console.log("✅ Room joined:", data);
      // If there are already 2 players when we join, game should start soon
      if (data.players && data.players.length === 2) {
        // Game will start via game:start event
        console.log("Two players in room, waiting for game:start...");
      }
    };

    // Handle player joined - check if game should start
    const handlePlayerJoined = (data) => {
      console.log("👤 Player joined:", data);
      // If there are now 2 players, game should start soon
      if (data.players && data.players.length === 2) {
        // Game will start via game:start event
        console.log("Two players in room, waiting for game:start...");
      }
    };

    // Handle game start
    const handleGameStart = (data) => {
      console.log("🎮 Game started:", data);
      setBoard(data.board);
      setTurn(data.turn);
      setGameStarted(true);
      setWinner(null);
      setOpponentLeft(false);
      setError("");

      // Determine which symbol this player is
      if (data.players.X === socket.id) {
        setMySymbol("X");
      } else if (data.players.O === socket.id) {
        setMySymbol("O");
      }
    };

    // Handle game update (after a move)
    const handleGameUpdate = (data) => {
      console.log("🔄 Game update:", data);
      setBoard(data.board);
      setTurn(data.turn);
      setError("");
    };

    // Handle game over (winner)
    const handleGameOver = (data) => {
      console.log("🏆 Game over:", data);
      setBoard(data.board);
      setWinner(data.winner);
      setTurn(null);
    };

    // Handle game draw
    const handleGameDraw = (data) => {
      console.log("🤝 Game draw:", data);
      setBoard(data.board);
      setWinner("draw");
      setTurn(null);
    };

    // Handle opponent leaving
    const handleOpponentLeft = (data) => {
      console.log("⚠️ Opponent left:", data);
      setOpponentLeft(true);
      setGameStarted(false);
      setError(data.message || "Your opponent has left the game");
    };

    // Handle game errors
    const handleGameError = (data) => {
      console.error("❌ Game error:", data);
      setError(data.message || "An error occurred");
    };

    // Set up all socket handlers
    const cleanup = setupSocketHandlers(socket, {
      onRoomJoined: handleRoomJoined,
      onPlayerJoined: handlePlayerJoined,
      onGameStart: handleGameStart,
      onGameUpdate: handleGameUpdate,
      onGameOver: handleGameOver,
      onGameDraw: handleGameDraw,
      onOpponentLeft: handleOpponentLeft,
      onGameError: handleGameError,
    });

    return cleanup;
  }, [socket]);

  /**
   * Handle cell click - emit move to server
   * @param {number} index - Cell index (0-8)
   */
  const handleCellClick = (index) => {
    // Validate move
    if (!socket || !roomId) {
      setError("Not connected to game");
      return;
    }

    if (!gameStarted) {
      setError("Game has not started yet");
      return;
    }

    if (winner !== null) {
      setError("Game is already over");
      return;
    }

    if (!isMyTurn) {
      setError("It's not your turn");
      return;
    }

    // Convert index to row/col to check if cell is empty
    const row = Math.floor(index / 3);
    const col = index % 3;

    if (board[row][col] !== null) {
      setError("Cell is already occupied");
      return;
    }

    // Clear any previous errors
    setError("");

    // Emit move to server
    socket.emit("game:move", { roomId, index });
  };

  /**
   * Handle Play Again button click - emit reset to server
   */
  const handlePlayAgain = () => {
    if (!socket || !roomId) {
      setError("Not connected to game");
      return;
    }

    if (!gameStarted) {
      setError("Game has not started yet");
      return;
    }

    // Clear any errors
    setError("");

    // Emit reset event to server
    socket.emit("game:reset", { roomId });
  };

  return {
    // State
    board,
    turn,
    mySymbol,
    winner,
    gameStarted,
    opponentLeft,
    error,
    isMyTurn,
    // Handlers
    handleCellClick,
    handlePlayAgain,
  };
}

