/**
 * TicTacToe Main Component
 * Main game controller with bold visual identity
 */

import { useTicTacToeGame } from "../components/tictactoe/useTicTacToeGame.js";
import Board from "../components/tictactoe/Board.jsx";
import GameInfo from "../components/tictactoe/GameInfo.jsx";
import FloatingChat from "../components/tictactoe/FloatingChat.jsx";
import ExitButton from "../components/tictactoe/ExitButton.jsx";

/**
 * @param {Object} props
 * @param {Object} props.roomData - Room data containing socket and roomId
 */
function TicTacToe({ roomData }) {
  const { socket, roomId } = roomData || {};

  // Use custom hook for all game state and logic
  const {
    board,
    turn,
    mySymbol,
    winner,
    gameStarted,
    opponentLeft,
    error,
    isMyTurn,
    isReconnecting,
    playerInfo,
    handleCellClick,
    handlePlayAgain,
  } = useTicTacToeGame(socket, roomId);

  // Get player names
  const playerXName = playerInfo?.X?.username || "Player X";
  const playerOName = playerInfo?.O?.username || "Player O";

  return (
    <div className="game-shell min-h-screen bg-bg font-body grain overflow-hidden">
      {/* Background elements */}
      <div className="fixed inset-0 geo-pattern pointer-events-none opacity-40" />
      <div className="fixed top-20 left-[10%] w-32 h-32 rounded-full bg-violet/10 blur-3xl animate-float" />
      <div className="fixed bottom-20 right-[10%] w-40 h-40 rounded-full bg-accent/10 blur-3xl animate-float" style={{ animationDelay: '-2s' }} />
      
      {/* Exit Button */}
      <ExitButton socket={socket} roomId={roomId} />

      {/* Main Game Container */}
      <div className="relative h-screen flex flex-col px-4 sm:px-6 py-4 sm:py-6 max-w-xl mx-auto">
        
        {/* Header - Compact */}
        <header className="flex-shrink-0 text-center mb-4 sm:mb-6 animate-hero">
          <h1 className="font-display text-2xl sm:text-3xl font-semibold text-text">
            Tic Tac Toe
          </h1>
          <p className="text-xs text-text-muted font-mono tracking-wider mt-1">
            {roomId}
          </p>
        </header>

        {/* Player Info Bar */}
        {gameStarted && winner === null && (
          <div className="flex items-center justify-center gap-4 sm:gap-6 mb-4 animate-fadeIn">
            {/* Player X */}
            <div className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-all ${
              turn === "X" 
                ? "bg-violet-soft border border-violet/30 shadow-md" 
                : "bg-surface border border-border"
            }`}>
              <div className={`relative ${turn === "X" ? "animate-pulse" : ""}`}>
                <div className="w-10 h-10 rounded-xl bg-violet flex items-center justify-center shadow-sm">
                  <span className="text-white font-display font-bold">
                    {playerXName.charAt(0).toUpperCase()}
                  </span>
                </div>
                {mySymbol === "X" && (
                  <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald rounded-full border-2 border-surface" />
                )}
              </div>
              <div className="min-w-0">
                <div className="text-xs text-text-muted truncate max-w-[70px]">
                  {mySymbol === "X" ? "You" : playerXName}
                </div>
                <div className="font-display text-xl font-bold text-violet">✕</div>
              </div>
            </div>
            
            <span className="text-text-muted text-sm font-display font-medium">vs</span>
            
            {/* Player O */}
            <div className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-all ${
              turn === "O" 
                ? "bg-accent-soft border border-accent/30 shadow-md" 
                : "bg-surface border border-border"
            }`}>
              <div className="min-w-0 text-right">
                <div className="text-xs text-text-muted truncate max-w-[70px]">
                  {mySymbol === "O" ? "You" : playerOName}
                </div>
                <div className="font-display text-xl font-bold text-accent">○</div>
              </div>
              <div className={`relative ${turn === "O" ? "animate-pulse" : ""}`}>
                <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center shadow-sm">
                  <span className="text-white font-display font-bold">
                    {playerOName.charAt(0).toUpperCase()}
                  </span>
                </div>
                {mySymbol === "O" && (
                  <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald rounded-full border-2 border-surface" />
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
          mySymbol={mySymbol}
          turn={turn}
          isMyTurn={isMyTurn}
          error={error}
          socketConnected={socket?.connected}
          isReconnecting={isReconnecting}
          onPlayAgain={handlePlayAgain}
          playerInfo={playerInfo}
        />

        {/* Game Board */}
        {gameStarted && (
          <Board
            board={board}
            isMyTurn={isMyTurn}
            winner={winner}
            onCellClick={handleCellClick}
          />
        )}
      </div>

      {/* Floating Chat */}
      {socket && roomId && <FloatingChat socket={socket} roomId={roomId} />}
    </div>
  );
}

export default TicTacToe;
