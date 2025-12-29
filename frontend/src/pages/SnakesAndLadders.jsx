/**
 * Snakes and Ladders Main Component
 * Main game controller with modern UI matching TicTacToe and DotsAndBoxes
 */

import { useSnakesAndLaddersGame } from "../components/snakesladders/useSnakesAndLaddersGame.js";
import Board from "../components/snakesladders/Board.jsx";
import Dice from "../components/snakesladders/Dice.jsx";
import GameInfo from "../components/snakesladders/GameInfo.jsx";
import FloatingChat from "../components/snakesladders/FloatingChat.jsx";
import ExitButton from "../components/snakesladders/ExitButton.jsx";

/**
 * @param {Object} props
 * @param {Object} props.roomData - Room data containing socket and roomId
 */
function SnakesAndLadders({ roomData }) {
  const { socket, roomId } = roomData || {};

  // Use custom hook for all game state and logic
  const {
    positions,
    currentTurn,
    myPlayerNumber,
    winner,
    gameStarted,
    opponentLeft,
    error,
    isReconnecting,
    lastDiceRoll,
    isRolling,
    extraTurn,
    lastMove,
    animatingPlayer,
    isAnimating,
    playerInfo,
    isMyTurn,
    snakes,
    ladders,
    handleRollDice,
    handlePlayAgain,
  } = useSnakesAndLaddersGame(socket, roomId);

  // Get player names
  const player1Name = playerInfo[1]?.username || "Player 1";
  const player2Name = playerInfo[2]?.username || "Player 2";

  return (
    <div className="game-shell min-h-screen bg-bg font-body grain overflow-hidden">
      {/* Background elements */}
      <div className="fixed inset-0 geo-pattern pointer-events-none opacity-40" />
      <div className="fixed top-20 left-[10%] w-32 h-32 rounded-full bg-emerald/10 blur-3xl animate-float" />
      <div className="fixed bottom-20 right-[10%] w-40 h-40 rounded-full bg-amber/10 blur-3xl animate-float" style={{ animationDelay: '-2s' }} />
      
      {/* Exit Button */}
      <ExitButton socket={socket} roomId={roomId} />

      {/* Main Game Container */}
      <div className="relative min-h-screen flex flex-col px-4 sm:px-6 py-4 sm:py-6 max-w-lg mx-auto">
        
        {/* Header */}
        <header className="flex-shrink-0 text-center mb-3 sm:mb-4 animate-hero">
          <h1 className="font-display text-xl sm:text-2xl font-semibold text-text">
            🐍 Snakes & Ladders 🪜
          </h1>
          <p className="text-xs text-text-muted font-mono tracking-wider mt-1">
            Room: {roomId}
          </p>
        </header>

        {/* Player Info Bar */}
        {gameStarted && winner === null && (
          <div className="flex items-center justify-center gap-4 sm:gap-6 mb-4 animate-fadeIn">
            {/* Player 1 */}
            <div className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-300 ${
              currentTurn === 1 && !isAnimating
                ? "bg-emerald-soft border border-emerald/30 shadow-md scale-105" 
                : "bg-surface border border-border"
            } ${animatingPlayer === 1 ? "ring-2 ring-emerald/50 animate-pulse" : ""}`}>
              <div className={`relative ${currentTurn === 1 && !isAnimating ? "animate-bounce" : ""}`} style={{ animationDuration: "1.5s" }}>
                <div className="w-10 h-10 rounded-xl bg-emerald flex items-center justify-center shadow-sm">
                  <span className="text-white font-display font-bold">
                    {player1Name.charAt(0).toUpperCase()}
                  </span>
                </div>
                {myPlayerNumber === 1 && (
                  <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-violet rounded-full border-2 border-surface" />
                )}
              </div>
              <div className="min-w-0">
                <div className="text-xs text-text-muted truncate max-w-[60px] font-medium">
                  {myPlayerNumber === 1 ? "You" : player1Name}
                </div>
                <div className="font-display text-lg font-bold text-emerald">
                  {positions[1] === 0 ? "🏁" : positions[1]}
                </div>
              </div>
            </div>
            
            <div className="flex flex-col items-center">
              <span className="text-text-muted text-xs font-display font-medium">VS</span>
              {isAnimating && (
                <span className="text-[10px] text-amber animate-pulse mt-0.5">Moving...</span>
              )}
            </div>
            
            {/* Player 2 */}
            <div className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-300 ${
              currentTurn === 2 && !isAnimating
                ? "bg-amber-soft border border-amber/30 shadow-md scale-105" 
                : "bg-surface border border-border"
            } ${animatingPlayer === 2 ? "ring-2 ring-amber/50 animate-pulse" : ""}`}>
              <div className="min-w-0 text-right">
                <div className="text-xs text-text-muted truncate max-w-[60px] font-medium">
                  {myPlayerNumber === 2 ? "You" : player2Name}
                </div>
                <div className="font-display text-lg font-bold text-amber">
                  {positions[2] === 0 ? "🏁" : positions[2]}
                </div>
              </div>
              <div className={`relative ${currentTurn === 2 && !isAnimating ? "animate-bounce" : ""}`} style={{ animationDuration: "1.5s" }}>
                <div className="w-10 h-10 rounded-xl bg-amber flex items-center justify-center shadow-sm">
                  <span className="text-white font-display font-bold">
                    {player2Name.charAt(0).toUpperCase()}
                  </span>
                </div>
                {myPlayerNumber === 2 && (
                  <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-violet rounded-full border-2 border-surface" />
                )}
              </div>
            </div>
          </div>
        )}

        {/* Game Info - Shows waiting/reconnecting/gameover states */}
        <GameInfo
          gameStarted={gameStarted}
          opponentLeft={opponentLeft}
          winner={winner}
          myPlayerNumber={myPlayerNumber}
          currentTurn={currentTurn}
          isMyTurn={isMyTurn}
          error={error}
          socketConnected={socket?.connected}
          isReconnecting={isReconnecting}
          onPlayAgain={handlePlayAgain}
          playerInfo={playerInfo}
          lastMove={lastMove}
        />

        {/* Game Board */}
        {gameStarted && winner === null && (
          <Board
            positions={positions}
            snakes={snakes}
            ladders={ladders}
            animatingPlayer={animatingPlayer}
          />
        )}

        {/* Dice Section */}
        {gameStarted && winner === null && (
          <div className="mt-4 flex justify-center">
            <Dice
              value={lastDiceRoll}
              isRolling={isRolling}
              onRoll={handleRollDice}
              disabled={!isMyTurn || isAnimating}
              extraTurn={extraTurn && isMyTurn && !isAnimating}
              moveInfo={lastMove}
            />
          </div>
        )}
      </div>

      {/* Floating Chat */}
      {socket && roomId && <FloatingChat socket={socket} roomId={roomId} />}
    </div>
  );
}

export default SnakesAndLadders;
