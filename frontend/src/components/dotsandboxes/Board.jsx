import { memo, useMemo } from "react";

const PLAYER_COLORS = {
  1: {
    line: "bg-indigo-500",
    lineHighlight: "bg-indigo-400 shadow-[0_0_12px_rgba(99,102,241,0.6)]",
    box: "bg-indigo-500/20 dark:bg-indigo-500/30",
    boxNew: "bg-indigo-500/40 dark:bg-indigo-500/50 animate-box-capture",
    text: "text-indigo-600 dark:text-indigo-300",
  },
  2: {
    line: "bg-amber-500",
    lineHighlight: "bg-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.6)]",
    box: "bg-amber-500/20 dark:bg-amber-500/30",
    boxNew: "bg-amber-500/40 dark:bg-amber-500/50 animate-box-capture",
    text: "text-amber-600 dark:text-amber-300",
  },
};

const Dot = memo(function Dot() {
  return (
    <div className="w-full h-full rounded-full bg-slate-700 dark:bg-slate-200 shadow-sm" />
  );
});

const HorizontalLine = memo(function HorizontalLine({ drawn, player, isClickable, onClick, isLastMove }) {
  if (drawn) {
    const colors = PLAYER_COLORS[player];
    const lineClass = isLastMove ? colors?.lineHighlight : colors?.line;
    return (
      <div className="w-full h-full flex items-center px-0.5">
        <div className={`w-full h-1.5 sm:h-2 rounded-full transition-all duration-200 ${lineClass || "bg-slate-400"}`} />
      </div>
    );
  }

  if (isClickable) {
    return (
      <button
        onClick={onClick}
        className="w-full h-full flex items-center px-0.5 group cursor-pointer touch-manipulation"
        aria-label="Draw line"
      >
        <div className="w-full h-1.5 sm:h-2 rounded-full bg-slate-200/60 dark:bg-slate-600/40 
          group-hover:bg-slate-300 dark:group-hover:bg-slate-500 
          group-hover:shadow-[0_0_8px_rgba(148,163,184,0.5)]
          group-active:bg-slate-400 transition-all duration-150" />
      </button>
    );
  }

  return (
    <div className="w-full h-full flex items-center px-0.5">
      <div className="w-full h-1.5 sm:h-2 rounded-full bg-slate-100/40 dark:bg-slate-700/30" />
    </div>
  );
});

const VerticalLine = memo(function VerticalLine({ drawn, player, isClickable, onClick, isLastMove }) {
  if (drawn) {
    const colors = PLAYER_COLORS[player];
    const lineClass = isLastMove ? colors?.lineHighlight : colors?.line;
    return (
      <div className="w-full h-full flex justify-center py-0.5">
        <div className={`w-1.5 sm:w-2 h-full rounded-full transition-all duration-200 ${lineClass || "bg-slate-400"}`} />
      </div>
    );
  }

  if (isClickable) {
    return (
      <button
        onClick={onClick}
        className="w-full h-full flex justify-center py-0.5 group cursor-pointer touch-manipulation"
        aria-label="Draw line"
      >
        <div className="w-1.5 sm:w-2 h-full rounded-full bg-slate-200/60 dark:bg-slate-600/40 
          group-hover:bg-slate-300 dark:group-hover:bg-slate-500 
          group-hover:shadow-[0_0_8px_rgba(148,163,184,0.5)]
          group-active:bg-slate-400 transition-all duration-150" />
      </button>
    );
  }

  return (
    <div className="w-full h-full flex justify-center py-0.5">
      <div className="w-1.5 sm:w-2 h-full rounded-full bg-slate-100/40 dark:bg-slate-700/30" />
    </div>
  );
});

const Box = memo(function Box({ owner, isNewCapture }) {
  if (!owner) return <div className="w-full h-full rounded-lg" />;

  const colors = PLAYER_COLORS[owner];
  const boxClass = isNewCapture ? colors.boxNew : colors.box;
  
  return (
    <div className={`w-full h-full ${boxClass} rounded-lg flex items-center justify-center transition-all duration-300`}>
      <span className={`text-xs sm:text-sm font-bold ${colors.text} select-none opacity-80`}>
        {owner === 1 ? "●" : "●"}
      </span>
    </div>
  );
});

function Board({ rows, cols, horizontalLines, verticalLines, boxes, isMyTurn, gameOver, onLineClick, lastMove, lastCompletedBoxes }) {
  // Responsive cell size: larger on mobile (fills screen), smaller on desktop
  const cellSize = typeof window !== 'undefined' && window.innerWidth < 640 ? 56 : 64;
  const dotSize = typeof window !== 'undefined' && window.innerWidth < 640 ? 10 : 14;
  const touchPadding = 6;

  const isLastMoveCheck = (type, row, col) => {
    return lastMove && lastMove.type === type && lastMove.row === row && lastMove.col === col;
  };

  const isNewCapture = (row, col) => {
    return lastCompletedBoxes?.some(box => box.row === row && box.col === col);
  };

  const grid = useMemo(() => {
    const elements = [];

    for (let row = 0; row <= rows; row++) {
      for (let col = 0; col <= cols; col++) {
        // Dot
        elements.push(
          <div
            key={`dot-${row}-${col}`}
            className="absolute z-20"
            style={{
              left: col * cellSize,
              top: row * cellSize,
              width: dotSize,
              height: dotSize,
              transform: "translate(-50%, -50%)",
            }}
          >
            <Dot />
          </div>
        );

        // Horizontal line
        if (col < cols) {
          const hDrawn = horizontalLines[row]?.[col] !== 0;
          const hPlayer = horizontalLines[row]?.[col];
          const hClickable = isMyTurn && !gameOver && !hDrawn;
          const hIsLastMove = isLastMoveCheck("horizontal", row, col);

          elements.push(
            <div
              key={`hline-${row}-${col}`}
              className="absolute z-10"
              style={{
                left: col * cellSize + dotSize / 2,
                top: row * cellSize - dotSize / 2 - touchPadding,
                width: cellSize - dotSize,
                height: dotSize + touchPadding * 2,
              }}
            >
              <HorizontalLine
                drawn={hDrawn}
                player={hPlayer}
                isClickable={hClickable}
                onClick={() => onLineClick("horizontal", row, col)}
                isLastMove={hIsLastMove}
              />
            </div>
          );
        }

        // Vertical line
        if (row < rows) {
          const vDrawn = verticalLines[row]?.[col] !== 0;
          const vPlayer = verticalLines[row]?.[col];
          const vClickable = isMyTurn && !gameOver && !vDrawn;
          const vIsLastMove = isLastMoveCheck("vertical", row, col);

          elements.push(
            <div
              key={`vline-${row}-${col}`}
              className="absolute z-10"
              style={{
                left: col * cellSize - dotSize / 2 - touchPadding,
                top: row * cellSize + dotSize / 2,
                width: dotSize + touchPadding * 2,
                height: cellSize - dotSize,
              }}
            >
              <VerticalLine
                drawn={vDrawn}
                player={vPlayer}
                isClickable={vClickable}
                onClick={() => onLineClick("vertical", row, col)}
                isLastMove={vIsLastMove}
              />
            </div>
          );
        }

        // Box
        if (row < rows && col < cols) {
          const boxIsNewCapture = isNewCapture(row, col);
          elements.push(
            <div
              key={`box-${row}-${col}`}
              className="absolute"
              style={{
                left: col * cellSize + dotSize / 2 + 2,
                top: row * cellSize + dotSize / 2 + 2,
                width: cellSize - dotSize - 4,
                height: cellSize - dotSize - 4,
              }}
            >
              <Box owner={boxes[row]?.[col]} isNewCapture={boxIsNewCapture} />
            </div>
          );
        }
      }
    }
    return elements;
  }, [rows, cols, horizontalLines, verticalLines, boxes, isMyTurn, gameOver, onLineClick, lastMove, lastCompletedBoxes, cellSize, dotSize]);

  const boardWidth = cols * cellSize;
  const boardHeight = rows * cellSize;

  return (
    <div className="flex justify-center items-center flex-1 py-2 sm:py-4">
      <div className="relative p-4 sm:p-6 rounded-2xl
        bg-gradient-to-br from-slate-100 to-slate-50 
        dark:from-slate-800/80 dark:to-slate-900/80
        shadow-[0_8px_32px_rgba(0,0,0,0.12)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.4)]
        border border-slate-200/50 dark:border-slate-700/30
        backdrop-blur-sm">
        
        {/* Subtle glow effect */}
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-indigo-500/5 to-amber-500/5 pointer-events-none" />
        
        <div 
          className="relative" 
          style={{ 
            width: boardWidth, 
            height: boardHeight,
            marginLeft: dotSize / 2,
            marginTop: dotSize / 2,
            marginRight: dotSize / 2,
            marginBottom: dotSize / 2,
          }}
        >
          {grid}
        </div>
      </div>
    </div>
  );
}

export default memo(Board);
