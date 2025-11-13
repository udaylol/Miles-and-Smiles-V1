import { useState, useEffect } from "react";
import Chat from "../components/Chat";

function TicTacToe({ roomData }) {
  const { socket, roomId } = roomData || {};

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

    // Register event listeners
    socket.on("room-joined", handleRoomJoined);
    socket.on("player-joined", handlePlayerJoined);
    socket.on("game:start", handleGameStart);
    socket.on("game:update", handleGameUpdate);
    socket.on("game:over", handleGameOver);
    socket.on("game:draw", handleGameDraw);
    socket.on("game:opponent_left", handleOpponentLeft);
    socket.on("game:error", handleGameError);

    // Cleanup
    return () => {
      socket.off("room-joined", handleRoomJoined);
      socket.off("player-joined", handlePlayerJoined);
      socket.off("game:start", handleGameStart);
      socket.off("game:update", handleGameUpdate);
      socket.off("game:over", handleGameOver);
      socket.off("game:draw", handleGameDraw);
      socket.off("game:opponent_left", handleOpponentLeft);
      socket.off("game:error", handleGameError);
    };
  }, [socket]);

  // Handle Play Again button click
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

  // Handle cell click
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

  // Render a single cell
  const renderCell = (index) => {
    const row = Math.floor(index / 3);
    const col = index % 3;
    const value = board[row][col];
    const isEmpty = value === null;
    const isClickable = isMyTurn && isEmpty && winner === null;

    return (
      <button
        key={index}
        onClick={() => handleCellClick(index)}
        disabled={!isClickable}
        className={`
          w-24 h-24 sm:w-32 sm:h-32
          border-2 border-gray-300 dark:border-gray-600
          text-4xl sm:text-5xl font-bold
          transition-all duration-200
          ${
            isClickable
              ? "hover:bg-blue-100 dark:hover:bg-blue-900 cursor-pointer active:scale-95"
              : "cursor-not-allowed opacity-60"
          }
          ${
            value === "X"
              ? "text-blue-600 dark:text-blue-400"
              : value === "O"
              ? "text-red-600 dark:text-red-400"
              : "text-gray-400"
          }
          ${isEmpty && isMyTurn ? "bg-green-50 dark:bg-green-900/20" : ""}
        `}
      >
        {value || ""}
      </button>
    );
  };

  return (
    <div className="min-h-screen bg-[--bg] text-[--text] p-4 relative">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-2">Tic Tac Toe</h1>
        <p className="text-center text-gray-600 dark:text-gray-400 mb-6">
          Room: {roomId} | Game: {roomData?.gameName}
        </p>

        {/* Game Status */}
        <div className="text-center mb-6">
          {!gameStarted && !opponentLeft && (
            <p className="text-lg text-gray-600 dark:text-gray-400">
              {socket?.connected 
                ? "Waiting for opponent to join..." 
                : "Connecting..."}
            </p>
          )}

          {opponentLeft && (
            <div className="bg-yellow-100 dark:bg-yellow-900/30 border border-yellow-400 dark:border-yellow-600 rounded-lg p-4 mb-4">
              <p className="text-lg font-semibold text-yellow-800 dark:text-yellow-200">
                ⚠️ {error || "Your opponent has left the game"}
              </p>
            </div>
          )}

          {gameStarted && winner === null && (
            <div className="mb-4">
              <p className="text-xl font-semibold mb-2">
                {isMyTurn ? (
                  <span className="text-green-600 dark:text-green-400">
                    🎯 Your turn ({mySymbol})
                  </span>
                ) : (
                  <span className="text-gray-600 dark:text-gray-400">
                    ⏳ Waiting for opponent ({turn})...
                  </span>
                )}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                You are playing as: <span className="font-bold">{mySymbol}</span>
              </p>
            </div>
          )}

          {winner && winner !== "draw" && (
            <div className="bg-blue-100 dark:bg-blue-900/30 border border-blue-400 dark:border-blue-600 rounded-lg p-6 mb-4">
              <p className="text-3xl font-bold text-blue-800 dark:text-blue-200 mb-2">
                🏆 {winner === mySymbol ? "You Win!" : "You Lost!"}
              </p>
              <p className="text-lg text-blue-700 dark:text-blue-300 mb-4">
                {winner} wins the game!
              </p>
              <button
                onClick={() => handlePlayAgain()}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg"
              >
                Play Again
              </button>
            </div>
          )}

          {winner === "draw" && (
            <div className="bg-gray-100 dark:bg-gray-800 border border-gray-400 dark:border-gray-600 rounded-lg p-6 mb-4">
              <p className="text-3xl font-bold text-gray-800 dark:text-gray-200 mb-2">
                🤝 It's a Draw!
              </p>
              <p className="text-lg text-gray-700 dark:text-gray-300 mb-4">
                No winner this time. Good game!
              </p>
              <button
                onClick={() => handlePlayAgain()}
                className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white font-semibold rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg"
              >
                Play Again
              </button>
            </div>
          )}

          {error && (
            <div className="bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-600 rounded-lg p-3 mb-4">
              <p className="text-red-800 dark:text-red-200">{error}</p>
            </div>
          )}
        </div>

        {/* Game Board */}
        <div className="flex justify-center mb-6">
          <div className="grid grid-cols-3 gap-2 bg-gray-200 dark:bg-gray-700 p-2 rounded-lg">
            {Array.from({ length: 9 }, (_, i) => renderCell(i))}
          </div>
        </div>

        {/* Game Instructions */}
        {gameStarted && winner === null && (
          <div className="text-center text-sm text-gray-500 dark:text-gray-400">
            {isMyTurn
              ? "Click on an empty cell to make your move"
              : "Wait for your opponent to make their move"}
          </div>
        )}
      </div>

      {/* Chat Component */}
      {socket && roomId && (
        <Chat socket={socket} roomId={roomId} />
      )}
    </div>
  );
}

export default TicTacToe;
