/**
 * Game Info Component
 * Displays game status, turn indicator, winner/draw messages, and errors
 */

import PlayAgainButton from "./PlayAgainButton.jsx";

/**
 * @param {Object} props
 * @param {boolean} props.gameStarted - Whether the game has started
 * @param {boolean} props.opponentLeft - Whether opponent has left
 * @param {string|null} props.winner - Winner ("X", "O", "draw", or null)
 * @param {string|null} props.mySymbol - Current player's symbol ("X" or "O")
 * @param {string} props.turn - Current turn ("X" or "O")
 * @param {boolean} props.isMyTurn - Whether it's the current player's turn
 * @param {string} props.error - Error message
 * @param {boolean} props.socketConnected - Whether socket is connected
 * @param {Function} props.onPlayAgain - Play again button handler
 */
function GameInfo({
  gameStarted,
  opponentLeft,
  winner,
  mySymbol,
  turn,
  isMyTurn,
  error,
  socketConnected,
  isReconnecting,
  onPlayAgain,
}) {
  return (
    <div className="text-center mb-6">
      {/* Waiting for opponent */}
      {!gameStarted && !opponentLeft && (
        <p className="text-lg text-gray-600 dark:text-gray-400">
          {socketConnected
            ? "Waiting for opponent to join..."
            : "Connecting..."}
        </p>
      )}

      {/* Opponent left notification */}
      {opponentLeft && (
        <div className="bg-yellow-100 dark:bg-yellow-900/30 border border-yellow-400 dark:border-yellow-600 rounded-lg p-4 mb-4">
          <p className="text-lg font-semibold text-yellow-800 dark:text-yellow-200">
            ⚠️ {error || "Your opponent has left the game"}
          </p>
        </div>
      )}

      {/* Reconnecting banner */}
      {isReconnecting && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-300 dark:border-yellow-700 rounded-lg p-3 mb-4">
          <p className="text-yellow-700 dark:text-yellow-200">
            ⏳ Reconnecting…
          </p>
        </div>
      )}

      {/* Active game status */}
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

      {/* Winner message */}
      {winner && winner !== "draw" && (
        <div className="bg-blue-100 dark:bg-blue-900/30 border border-blue-400 dark:border-blue-600 rounded-lg p-6 mb-4">
          <p className="text-3xl font-bold text-blue-800 dark:text-blue-200 mb-2">
            🏆 {winner === mySymbol ? "You Win!" : "You Lost!"}
          </p>
          <p className="text-lg text-blue-700 dark:text-blue-300 mb-4">
            {winner} wins the game!
          </p>
          <PlayAgainButton onClick={onPlayAgain} variant="win" />
        </div>
      )}

      {/* Draw message */}
      {winner === "draw" && (
        <div className="bg-gray-100 dark:bg-gray-800 border border-gray-400 dark:border-gray-600 rounded-lg p-6 mb-4">
          <p className="text-3xl font-bold text-gray-800 dark:text-gray-200 mb-2">
            🤝 It's a Draw!
          </p>
          <p className="text-lg text-gray-700 dark:text-gray-300 mb-4">
            No winner this time. Good game!
          </p>
          <PlayAgainButton onClick={onPlayAgain} variant="draw" />
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-600 rounded-lg p-3 mb-4">
          <p className="text-red-800 dark:text-red-200">{error}</p>
        </div>
      )}
    </div>
  );
}

export default GameInfo;
