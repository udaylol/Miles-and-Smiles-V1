/**
 * Memory Card Matching Game Main Component
 * Main game controller with modern UI matching other games
 */

import { useMemoryGame } from "../components/memory/useMemoryGame.js";
import Board from "../components/memory/Board.jsx";
import GameInfo from "../components/memory/GameInfo.jsx";
import FloatingChat from "../components/memory/FloatingChat.jsx";
import ExitButton from "../components/memory/ExitButton.jsx";

/**
 * @param {Object} props
 * @param {Object} props.roomData - Room data containing socket and roomId
 */
function Memory({ roomData }) {
  const { socket, roomId } = roomData || {};

  // Use custom hook for all game state and logic
  const {
    cards,
    gridSize,
    flippedCards,
    currentTurn,
    myPlayerNumber,
    winner,
    gameStarted,
    opponentLeft,
    error,
    isReconnecting,
    scores,
    isProcessing,
    lastFlip,
    showingMatch,
    playerInfo,
    isMyTurn,
    flipCard,
    handleReset,
    handleLeaveRoom,
  } = useMemoryGame(socket, roomId);

  // Get player names
  const player1Name = playerInfo[1]?.username || "Player 1";
  const player2Name = playerInfo[2]?.username || "Player 2";
  const opponentNumber = myPlayerNumber === 1 ? 2 : 1;
  const totalPairs = Math.floor(cards.length / 2);

  return (
    <div className="game-shell min-h-screen bg-bg font-body grain overflow-hidden">
      {/* Background elements */}
      <div className="fixed inset-0 geo-pattern pointer-events-none opacity-40" />
      <div className="fixed top-20 left-[10%] w-32 h-32 rounded-full bg-violet/10 blur-3xl animate-float" />
      <div className="fixed bottom-20 right-[10%] w-40 h-40 rounded-full bg-accent/10 blur-3xl animate-float" style={{ animationDelay: '-2s' }} />
      
      {/* Exit Button */}
      <ExitButton socket={socket} roomId={roomId} />

      {/* Main Game Container */}
      <div className="relative min-h-screen flex flex-col px-4 sm:px-6 py-4 sm:py-6 max-w-2xl mx-auto">
        
        {/* Header */}
        <header className="flex-shrink-0 text-center mb-4 sm:mb-6 animate-hero">
          <h1 className="font-display text-2xl sm:text-3xl font-semibold text-text">
            🎴 Memory Match 🧠
          </h1>
          <p className="text-xs text-text-muted font-mono tracking-wider mt-1">
            Room: {roomId}
          </p>
        </header>

        {/* Score Bar */}
        {gameStarted && winner === null && (
          <div className="flex items-center justify-center gap-4 sm:gap-6 mb-4 animate-fadeIn">
            {/* Player 1 Score */}
            <div className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-300 ${
              currentTurn === 1 && !isProcessing
                ? "bg-violet-soft border border-violet/30 shadow-md scale-105" 
                : "bg-surface border border-border"
            }`}>
              <div className={`relative ${currentTurn === 1 && !isProcessing ? "animate-bounce" : ""}`} style={{ animationDuration: "1.5s" }}>
                <div className="w-10 h-10 rounded-xl bg-violet flex items-center justify-center shadow-sm">
                  <span className="text-white font-display font-bold">
                    {player1Name.charAt(0).toUpperCase()}
                  </span>
                </div>
                {myPlayerNumber === 1 && (
                  <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald rounded-full border-2 border-surface" />
                )}
              </div>
              <div className="min-w-0">
                <div className="text-xs text-text-muted truncate max-w-[60px] font-medium">
                  {myPlayerNumber === 1 ? "You" : player1Name}
                </div>
                <div className="font-display text-xl font-bold text-violet">
                  {scores[1]} <span className="text-xs text-text-muted">pairs</span>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col items-center">
              <span className="text-text-muted text-xs font-display font-medium">VS</span>
              <span className="text-[10px] text-text-muted mt-0.5">{totalPairs} pairs</span>
            </div>
            
            {/* Player 2 Score */}
            <div className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-300 ${
              currentTurn === 2 && !isProcessing
                ? "bg-accent-soft border border-accent/30 shadow-md scale-105" 
                : "bg-surface border border-border"
            }`}>
              <div className="min-w-0 text-right">
                <div className="text-xs text-text-muted truncate max-w-[60px] font-medium">
                  {myPlayerNumber === 2 ? "You" : player2Name}
                </div>
                <div className="font-display text-xl font-bold text-accent">
                  {scores[2]} <span className="text-xs text-text-muted">pairs</span>
                </div>
              </div>
              <div className={`relative ${currentTurn === 2 && !isProcessing ? "animate-bounce" : ""}`} style={{ animationDuration: "1.5s" }}>
                <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center shadow-sm">
                  <span className="text-white font-display font-bold">
                    {player2Name.charAt(0).toUpperCase()}
                  </span>
                </div>
                {myPlayerNumber === 2 && (
                  <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald rounded-full border-2 border-surface" />
                )}
              </div>
            </div>
          </div>
        )}

        {/* Turn Indicator */}
        {gameStarted && winner === null && (
          <div className="text-center mb-4">
            <div className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl ${
              isMyTurn 
                ? "bg-violet-soft text-violet border border-violet/20" 
                : "bg-bg-deep text-text-secondary border border-border"
            }`}>
              {isMyTurn ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-violet animate-pulse" />
                  <span className="font-medium text-sm">Your turn - find a match!</span>
                </>
              ) : (
                <>
                  <span className="w-2 h-2 rounded-full bg-text-muted" />
                  <span className="font-medium text-sm">{playerInfo[opponentNumber]?.username || "Opponent"}'s turn</span>
                </>
              )}
            </div>
            
            {/* Match notification */}
            {lastFlip?.isMatch && showingMatch && (
              <div className="mt-2 text-emerald font-medium animate-bounce">
                ✨ Match found! +1 pair
              </div>
            )}
          </div>
        )}

        {/* Game Info - Shows waiting/reconnecting/gameover states */}
        {(!gameStarted || opponentLeft || winner) && (
          <GameInfo
            gameStarted={gameStarted}
            opponentLeft={opponentLeft}
            winner={winner}
            myPlayerNumber={myPlayerNumber}
            currentTurn={currentTurn}
            isMyTurn={isMyTurn}
            scores={scores}
            error={error}
            socketConnected={socket?.connected}
            isReconnecting={isReconnecting}
            onPlayAgain={handleReset}
            playerInfo={playerInfo}
            totalPairs={totalPairs}
          />
        )}

        {/* Game Board */}
        {gameStarted && winner === null && (
          <Board
            cards={cards}
            gridSize={gridSize}
            onCardClick={flipCard}
            disabled={!isMyTurn || isProcessing}
            showingMatch={showingMatch}
          />
        )}

        {/* Hint Section */}
        {gameStarted && winner === null && (
          <div className="mt-4 text-center text-xs text-text-muted">
            <p>Flip two cards to find matching pairs. Match to keep playing!</p>
          </div>
        )}
      </div>

      {/* Floating Chat */}
      {socket && roomId && <FloatingChat socket={socket} roomId={roomId} />}
    </div>
  );
}

export default Memory;
