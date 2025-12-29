/**
 * Cell Component
 * Individual square in the TicTacToe board with modern styling
 */

import { memo } from "react";

/**
 * @param {Object} props
 * @param {string|null} props.value - Cell value ("X", "O", or null)
 * @param {number} props.index - Cell index (0-8)
 * @param {boolean} props.isClickable - Whether the cell can be clicked
 * @param {Function} props.onClick - Click handler function
 * @param {boolean} props.isWinningCell - Whether this cell is part of winning line
 */
function Cell({ value, index, isClickable, onClick, isWinningCell }) {
  return (
    <button
      onClick={() => onClick(index)}
      disabled={!isClickable}
      className={`
        w-20 h-20 sm:w-24 sm:h-24
        rounded-xl
        text-4xl sm:text-5xl font-bold
        transition-all duration-200
        flex items-center justify-center
        touch-manipulation
        ${isClickable
          ? "bg-slate-100/80 dark:bg-slate-700/50 hover:bg-slate-200 dark:hover:bg-slate-600 cursor-pointer active:scale-95 hover:shadow-lg"
          : "cursor-not-allowed"
        }
        ${!value && !isClickable ? "bg-slate-100/40 dark:bg-slate-800/30" : ""}
        ${!value && isClickable ? "bg-slate-100/80 dark:bg-slate-700/50" : ""}
        ${value === "X"
          ? `bg-blue-500/20 dark:bg-blue-500/30 ${isWinningCell ? "ring-2 ring-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.5)]" : ""}`
          : ""
        }
        ${value === "O"
          ? `bg-rose-500/20 dark:bg-rose-500/30 ${isWinningCell ? "ring-2 ring-rose-500 shadow-[0_0_20px_rgba(244,63,94,0.5)]" : ""}`
          : ""
        }
      `}
    >
      {value === "X" && (
        <span className="text-blue-500 drop-shadow-sm">✕</span>
      )}
      {value === "O" && (
        <span className="text-rose-500 drop-shadow-sm">○</span>
      )}
    </button>
  );
}

export default memo(Cell);
