/**
 * Snakes and Ladders Board Component
 * 10x10 board with snakes and ladders visualization showing destinations
 */

import { memo, useMemo } from "react";

/**
 * Get the position number for a cell (zigzag numbering from bottom-left)
 */
function getCellPosition(row, col) {
  const rowFromBottom = 9 - row;
  const isRightToLeft = rowFromBottom % 2 === 1;
  const colFromLeft = isRightToLeft ? 9 - col : col;
  return rowFromBottom * 10 + colFromLeft + 1;
}

/**
 * Cell component with enhanced visuals
 */
const Cell = memo(function Cell({ 
  position, 
  player1Here, 
  player2Here,
  player1Animating,
  player2Animating,
  snakeData,
  ladderData,
  isFinish,
}) {
  const hasSnake = snakeData !== null;
  const hasLadder = ladderData !== null;
  
  // Determine cell background based on position and special tiles
  const getCellBg = () => {
    if (isFinish) return "bg-gradient-to-br from-amber-200 to-amber-300 dark:from-amber-700 dark:to-amber-800";
    if (position === 1) return "bg-gradient-to-br from-emerald-200 to-emerald-300 dark:from-emerald-700 dark:to-emerald-800";
    if (hasSnake) return "bg-gradient-to-br from-red-100 to-red-200 dark:from-red-900/50 dark:to-red-800/50";
    if (hasLadder) return "bg-gradient-to-br from-green-100 to-green-200 dark:from-green-900/50 dark:to-green-800/50";
    return position % 2 === 0 
      ? "bg-slate-100 dark:bg-slate-800" 
      : "bg-white dark:bg-slate-900";
  };
  
  return (
    <div
      className={`
        relative aspect-square flex items-center justify-center
        border border-slate-300/50 dark:border-slate-600/50
        transition-all duration-300
        ${getCellBg()}
        ${hasSnake ? "shadow-inner shadow-red-500/20" : ""}
        ${hasLadder ? "shadow-inner shadow-green-500/20" : ""}
      `}
    >
      {/* Position number - top left */}
      <span className={`
        absolute top-0 left-0.5 text-[7px] sm:text-[9px] font-bold
        ${isFinish ? "text-amber-700 dark:text-amber-300" : ""}
        ${position === 1 ? "text-emerald-700 dark:text-emerald-300" : ""}
        ${hasSnake ? "text-red-600 dark:text-red-400" : ""}
        ${hasLadder ? "text-green-600 dark:text-green-400" : ""}
        ${!isFinish && position !== 1 && !hasSnake && !hasLadder ? "text-slate-500 dark:text-slate-500" : ""}
      `}>
        {position}
      </span>
      
      {/* Snake indicator with destination */}
      {hasSnake && (
        <div className="flex flex-col items-center justify-center">
          <span className="text-sm sm:text-base leading-none">🐍</span>
          <span className="text-[6px] sm:text-[8px] font-bold text-red-600 dark:text-red-400 leading-none mt-0.5">
            →{snakeData.tail}
          </span>
        </div>
      )}
      
      {/* Ladder indicator with destination */}
      {hasLadder && (
        <div className="flex flex-col items-center justify-center">
          <span className="text-sm sm:text-base leading-none">🪜</span>
          <span className="text-[6px] sm:text-[8px] font-bold text-green-600 dark:text-green-400 leading-none mt-0.5">
            →{ladderData.top}
          </span>
        </div>
      )}
      
      {/* Finish indicator */}
      {isFinish && !hasSnake && !hasLadder && (
        <span className="text-sm sm:text-lg">🏆</span>
      )}
      
      {/* Start indicator */}
      {position === 1 && !hasLadder && (
        <span className="text-[8px] sm:text-xs font-bold text-emerald-600 dark:text-emerald-400">START</span>
      )}
      
      {/* Players tokens */}
      <div className="absolute bottom-0.5 right-0.5 flex gap-0.5">
        {player1Here && (
          <div 
            className={`
              w-3.5 h-3.5 sm:w-5 sm:h-5 rounded-full 
              bg-gradient-to-br from-emerald-400 to-emerald-600 
              shadow-md shadow-emerald-500/50
              border-2 border-white dark:border-slate-800
              flex items-center justify-center
              ${player1Animating ? "animate-bounce scale-125" : "transition-all duration-500"}
            `}
          >
            <span className="text-[6px] sm:text-[8px] font-bold text-white">1</span>
          </div>
        )}
        {player2Here && (
          <div 
            className={`
              w-3.5 h-3.5 sm:w-5 sm:h-5 rounded-full 
              bg-gradient-to-br from-amber-400 to-amber-600 
              shadow-md shadow-amber-500/50
              border-2 border-white dark:border-slate-800
              flex items-center justify-center
              ${player2Animating ? "animate-bounce scale-125" : "transition-all duration-500"}
            `}
          >
            <span className="text-[6px] sm:text-[8px] font-bold text-white">2</span>
          </div>
        )}
      </div>
    </div>
  );
});

/**
 * Board component
 */
function Board({ positions, snakes, ladders, animatingPlayer }) {
  // Build snake and ladder lookup maps with destination info
  const { snakeMap, ladderMap } = useMemo(() => {
    const snakeMap = new Map();
    const ladderMap = new Map();
    
    Object.entries(snakes).forEach(([head, tail]) => {
      snakeMap.set(parseInt(head), { head: parseInt(head), tail: parseInt(tail) });
    });
    
    Object.entries(ladders).forEach(([bottom, top]) => {
      ladderMap.set(parseInt(bottom), { bottom: parseInt(bottom), top: parseInt(top) });
    });
    
    return { snakeMap, ladderMap };
  }, [snakes, ladders]);

  // Generate board cells (10x10)
  const board = useMemo(() => {
    const cells = [];
    for (let row = 0; row < 10; row++) {
      for (let col = 0; col < 10; col++) {
        const position = getCellPosition(row, col);
        cells.push({
          row,
          col,
          position,
          player1Here: positions[1] === position,
          player2Here: positions[2] === position,
          player1Animating: animatingPlayer === 1 && positions[1] === position,
          player2Animating: animatingPlayer === 2 && positions[2] === position,
          snakeData: snakeMap.get(position) || null,
          ladderData: ladderMap.get(position) || null,
          isFinish: position === 100,
        });
      }
    }
    return cells;
  }, [positions, snakeMap, ladderMap, animatingPlayer]);

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Board container with glassmorphism */}
      <div className="relative bg-white/70 dark:bg-slate-800/70 backdrop-blur-md rounded-2xl p-2 sm:p-3 shadow-2xl border border-white/30 dark:border-slate-700/50">
        {/* Decorative corner icons */}
        <div className="absolute -top-2 -left-2 w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center shadow-lg text-white text-xs font-bold z-10">🎲</div>
        <div className="absolute -top-2 -right-2 w-8 h-8 bg-amber-500 rounded-full flex items-center justify-center shadow-lg text-white text-xs font-bold z-10">🏆</div>
        
        {/* Grid */}
        <div className="grid grid-cols-10 gap-0 rounded-xl overflow-hidden border-2 border-slate-300 dark:border-slate-600 shadow-inner">
          {board.map((cell) => (
            <Cell
              key={cell.position}
              position={cell.position}
              player1Here={cell.player1Here}
              player2Here={cell.player2Here}
              player1Animating={cell.player1Animating}
              player2Animating={cell.player2Animating}
              snakeData={cell.snakeData}
              ladderData={cell.ladderData}
              isFinish={cell.isFinish}
            />
          ))}
        </div>
        
        {/* Legend */}
        <div className="mt-3 flex items-center justify-center gap-4 text-[10px] sm:text-xs">
          <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-red-100 dark:bg-red-900/30">
            <span>🐍</span>
            <span className="text-red-600 dark:text-red-400 font-medium">Snake (↓)</span>
          </div>
          <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-green-100 dark:bg-green-900/30">
            <span>🪜</span>
            <span className="text-green-600 dark:text-green-400 font-medium">Ladder (↑)</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default memo(Board);
