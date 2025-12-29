/**
 * Dice Component
 * Animated 3D dice with roll functionality and time delay
 */

import { memo, useState, useEffect } from "react";

// Dice face patterns (dot positions for each face)
const DICE_FACES = {
  1: [[1, 1]],
  2: [[0, 0], [2, 2]],
  3: [[0, 0], [1, 1], [2, 2]],
  4: [[0, 0], [0, 2], [2, 0], [2, 2]],
  5: [[0, 0], [0, 2], [1, 1], [2, 0], [2, 2]],
  6: [[0, 0], [0, 2], [1, 0], [1, 2], [2, 0], [2, 2]],
};

/**
 * Single dice face
 */
const DiceFace = memo(function DiceFace({ value }) {
  const dots = DICE_FACES[value] || [];
  
  return (
    <div className="w-full h-full grid grid-cols-3 grid-rows-3 gap-0.5 p-1.5 sm:p-2">
      {[0, 1, 2].map(row => 
        [0, 1, 2].map(col => {
          const hasDot = dots.some(([r, c]) => r === row && c === col);
          return (
            <div key={`${row}-${col}`} className="flex items-center justify-center">
              {hasDot && (
                <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-slate-800 dark:bg-slate-200 shadow-inner" />
              )}
            </div>
          );
        })
      )}
    </div>
  );
});

/**
 * Dice component with animation and delays
 */
function Dice({ value, isRolling, onRoll, disabled, extraTurn, moveInfo }) {
  const [displayValue, setDisplayValue] = useState(value || 1);
  const [animating, setAnimating] = useState(false);
  const [showResult, setShowResult] = useState(false);
  
  // Animate dice during roll with longer duration
  useEffect(() => {
    if (isRolling) {
      setAnimating(true);
      setShowResult(false);
      
      // Faster animation at start, slower at end
      let speed = 50;
      let count = 0;
      const maxCount = 20; // ~1.5 seconds of rolling
      
      const animate = () => {
        setDisplayValue(Math.floor(Math.random() * 6) + 1);
        count++;
        
        if (count < maxCount) {
          // Gradually slow down
          speed = 50 + (count * 10);
          setTimeout(animate, speed);
        }
      };
      
      animate();
      
      return () => {};
    } else {
      // Small delay before showing final result
      if (value && animating) {
        setTimeout(() => {
          setDisplayValue(value);
          setAnimating(false);
          setShowResult(true);
        }, 200);
      } else if (value) {
        setDisplayValue(value);
        setShowResult(true);
      }
    }
  }, [isRolling, value]);

  return (
    <div className="flex flex-col items-center gap-3">
      {/* Dice container with glow effect */}
      <div className={`relative ${extraTurn && !isRolling ? "animate-pulse" : ""}`}>
        {/* Glow ring for 6 */}
        {showResult && value === 6 && !isRolling && (
          <div className="absolute inset-0 -m-2 rounded-2xl bg-amber-400/30 blur-md animate-pulse" />
        )}
        
        {/* Dice */}
        <button
          onClick={onRoll}
          disabled={disabled || isRolling}
          className={`
            relative w-16 h-16 sm:w-20 sm:h-20
            bg-gradient-to-br from-white via-slate-50 to-slate-100
            dark:from-slate-600 dark:via-slate-700 dark:to-slate-800
            rounded-xl shadow-xl
            border-2 border-slate-200 dark:border-slate-500
            transition-all duration-200
            ${animating ? "animate-[spin_0.1s_linear_infinite] scale-110" : ""}
            ${disabled && !isRolling 
              ? "opacity-50 cursor-not-allowed grayscale" 
              : "hover:shadow-2xl hover:scale-110 active:scale-95 cursor-pointer"
            }
            ${showResult && value === 6 && !isRolling ? "ring-4 ring-amber-400 ring-opacity-70" : ""}
          `}
        >
          <DiceFace value={displayValue} />
        </button>
      </div>
      
      {/* Roll button */}
      <button
        onClick={onRoll}
        disabled={disabled || isRolling}
        className={`
          px-8 py-2.5 rounded-xl font-semibold text-sm
          transition-all duration-300
          ${isRolling
            ? "bg-gradient-to-r from-amber-400 to-amber-500 text-white animate-pulse"
            : disabled
            ? "bg-slate-200 dark:bg-slate-700 text-slate-400 cursor-not-allowed"
            : "bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-lg shadow-emerald-500/40 hover:shadow-xl hover:shadow-emerald-500/50 hover:scale-105 active:scale-95"
          }
        `}
      >
        {isRolling ? "🎲 Rolling..." : disabled ? "⏳ Waiting..." : "🎲 Roll Dice"}
      </button>
      
      {/* Extra turn indicator */}
      {extraTurn && !isRolling && (
        <div className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-100 to-amber-200 dark:from-amber-900/50 dark:to-amber-800/50 text-amber-700 dark:text-amber-300 text-sm font-semibold animate-bounce shadow-lg">
          🎉 Rolled 6! Roll again!
        </div>
      )}
      
      {/* Move info display */}
      {moveInfo && showResult && !isRolling && (
        <div className={`
          px-4 py-2 rounded-xl text-sm font-medium text-center
          ${moveInfo.snake 
            ? "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400" 
            : moveInfo.ladder 
            ? "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400"
            : moveInfo.bounce
            ? "bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400"
            : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
          }
        `}>
          {moveInfo.snake && (
            <span>🐍 Oops! Snake bit you! {moveInfo.from} → {moveInfo.finalPosition}</span>
          )}
          {moveInfo.ladder && (
            <span>🪜 Yay! Climbed ladder! {moveInfo.from} → {moveInfo.finalPosition}</span>
          )}
          {moveInfo.bounce && (
            <span>↩️ Bounced back! Need exact roll to finish.</span>
          )}
          {!moveInfo.snake && !moveInfo.ladder && !moveInfo.bounce && (
            <span>Moved: {moveInfo.from || "Start"} → {moveInfo.finalPosition || moveInfo.to}</span>
          )}
        </div>
      )}
    </div>
  );
}

export default memo(Dice);
