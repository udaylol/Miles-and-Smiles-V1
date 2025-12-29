import { useDotsAndBoxesGame } from "../components/dotsandboxes/useDotsAndBoxesGame.js";
import Board from "../components/dotsandboxes/Board.jsx";
import ScoreBoard from "../components/dotsandboxes/ScoreBoard.jsx";
import GameInfo from "../components/dotsandboxes/GameInfo.jsx";
import FloatingChat from "../components/dotsandboxes/FloatingChat.jsx";
import ExitButton from "../components/dotsandboxes/ExitButton.jsx";

function DotsAndBoxes({ roomData }) {
  const { socket, roomId } = roomData || {};

  const {
    rows,
    cols,
    horizontalLines,
    verticalLines,
    boxes,
    scores,
    currentTurn,
    myPlayerNumber,
    gameOver,
    winner,
    gameStarted,
    opponentLeft,
    error,
    isMyTurn,
    isReconnecting,
    lastMove,
    lastCompletedBoxes,
    playerInfo,
    completedBoxes,
    totalBoxes,
    handleLineClick,
    handlePlayAgain,
  } = useDotsAndBoxesGame(socket, roomId);

  return (
    <div className="game-shell min-h-screen bg-bg font-body grain overflow-hidden">
      {/* Background elements */}
      <div className="fixed inset-0 geo-pattern pointer-events-none opacity-40" />
      <div className="fixed top-20 left-[10%] w-32 h-32 rounded-full bg-violet/10 blur-3xl animate-float" />
      <div className="fixed bottom-20 right-[10%] w-40 h-40 rounded-full bg-amber/10 blur-3xl animate-float" style={{ animationDelay: '-2s' }} />
      
      {/* Exit Button */}
      <ExitButton socket={socket} roomId={roomId} />

      {/* Main Game Container - Flexbox for vertical centering */}
      <div className="relative h-screen flex flex-col px-4 sm:px-6 py-4 sm:py-6 max-w-xl mx-auto">
        
        {/* Header */}
        <header className="flex-shrink-0 text-center mb-3 sm:mb-4 animate-hero">
          <h1 className="font-display text-xl sm:text-2xl font-semibold text-text">
            Dots & Boxes
          </h1>
          <p className="text-xs text-text-muted font-mono tracking-wider mt-1">
            {roomId}
          </p>
        </header>

        {/* Game Info - Shows waiting/reconnecting/gameover states */}
        {(!gameStarted || gameOver) && (
          <GameInfo
            gameStarted={gameStarted}
            opponentLeft={opponentLeft}
            gameOver={gameOver}
            winner={winner}
            myPlayerNumber={myPlayerNumber}
            currentTurn={currentTurn}
            isMyTurn={isMyTurn}
            error={error}
            socketConnected={socket?.connected}
            isReconnecting={isReconnecting}
            scores={scores}
            onPlayAgain={handlePlayAgain}
          />
        )}

        {/* Active Game Layout */}
        {gameStarted && !gameOver && (
          <>
            {/* Turn Indicator */}
            <GameInfo
              gameStarted={gameStarted}
              opponentLeft={opponentLeft}
              gameOver={gameOver}
              winner={winner}
              myPlayerNumber={myPlayerNumber}
              currentTurn={currentTurn}
              isMyTurn={isMyTurn}
              error={error}
              socketConnected={socket?.connected}
              isReconnecting={isReconnecting}
              scores={scores}
              onPlayAgain={handlePlayAgain}
            />

            {/* Score Board - Compact horizontal layout */}
            <div className="flex-shrink-0 mb-2 sm:mb-3">
              <ScoreBoard
                scores={scores}
                myPlayerNumber={myPlayerNumber}
                currentTurn={currentTurn}
                gameOver={gameOver}
                playerInfo={playerInfo}
                completedBoxes={completedBoxes}
                totalBoxes={totalBoxes}
              />
            </div>

            {/* Game Board - Takes remaining space, centered */}
            <Board
              rows={rows}
              cols={cols}
              horizontalLines={horizontalLines}
              verticalLines={verticalLines}
              boxes={boxes}
              isMyTurn={isMyTurn}
              gameOver={gameOver}
              onLineClick={handleLineClick}
              lastMove={lastMove}
              lastCompletedBoxes={lastCompletedBoxes}
            />
          </>
        )}

        {/* Score shown during game over for context */}
        {gameStarted && gameOver && (
          <div className="flex-shrink-0 mb-4 opacity-60">
            <ScoreBoard
              scores={scores}
              myPlayerNumber={myPlayerNumber}
              currentTurn={currentTurn}
              gameOver={gameOver}
              playerInfo={playerInfo}
              completedBoxes={completedBoxes}
              totalBoxes={totalBoxes}
            />
          </div>
        )}
      </div>

      {/* Floating Chat */}
      {socket && roomId && <FloatingChat socket={socket} roomId={roomId} />}
    </div>
  );
}

export default DotsAndBoxes;
