/**
 * Memory Card Component
 * Individual card with flip animation
 */

import { memo } from "react";

/**
 * Card component with 3D flip animation
 * @param {Object} props - Component props
 * @param {Object} props.card - Card data {index, symbol, isFlipped, isMatched}
 * @param {Function} props.onClick - Click handler
 * @param {boolean} props.disabled - Whether card is clickable
 * @param {boolean} props.showingMatch - Whether showing match celebration
 */
function Card({ card, onClick, disabled, showingMatch }) {
  const { index, symbol, isFlipped, isMatched } = card;
  
  const handleClick = () => {
    if (!disabled && !isFlipped && !isMatched) {
      onClick(index);
    }
  };
  
  // Determine card state
  const isRevealed = isFlipped || isMatched;
  const isClickable = !disabled && !isFlipped && !isMatched;
  
  return (
    <div
      className={`
        relative aspect-square cursor-pointer perspective-1000
        transform-style-preserve-3d transition-all duration-500
        ${isClickable ? "hover:scale-105" : ""}
        ${isMatched && showingMatch ? "animate-bounce" : ""}
      `}
      onClick={handleClick}
    >
      {/* Card inner (handles 3D flip) */}
      <div
        className={`
          relative w-full h-full transition-transform duration-500
          transform-style-preserve-3d
          ${isRevealed ? "rotate-y-180" : ""}
        `}
        style={{
          transformStyle: "preserve-3d",
          transform: isRevealed ? "rotateY(180deg)" : "rotateY(0deg)",
        }}
      >
        {/* Card Back (face down) */}
        <div
          className={`
            absolute inset-0 w-full h-full rounded-xl
            flex items-center justify-center
            backface-hidden
            ${isClickable 
              ? "bg-gradient-to-br from-violet-600 to-purple-700 hover:from-violet-500 hover:to-purple-600 shadow-lg hover:shadow-xl hover:shadow-purple-500/30" 
              : "bg-gradient-to-br from-violet-700 to-purple-800"
            }
            border-2 border-white/20
            transition-all duration-300
          `}
          style={{ backfaceVisibility: "hidden" }}
        >
          {/* Decorative pattern on card back */}
          <div className="absolute inset-2 rounded-lg border border-white/10" />
          <div className="text-4xl opacity-50">🎴</div>
        </div>
        
        {/* Card Front (face up) */}
        <div
          className={`
            absolute inset-0 w-full h-full rounded-xl
            flex items-center justify-center
            backface-hidden
            ${isMatched 
              ? "bg-gradient-to-br from-emerald-500 to-green-600 shadow-lg shadow-emerald-500/40" 
              : "bg-gradient-to-br from-slate-100 to-white shadow-lg"
            }
            border-2 ${isMatched ? "border-emerald-300" : "border-purple-200"}
            transition-all duration-300
          `}
          style={{ 
            backfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
          }}
        >
          {/* Card symbol */}
          <span 
            className={`
              text-5xl md:text-6xl select-none
              transition-transform duration-300
              ${isMatched ? "scale-110" : ""}
            `}
          >
            {symbol || "?"}
          </span>
          
          {/* Match indicator glow */}
          {isMatched && (
            <div className="absolute inset-0 rounded-xl bg-emerald-400/20 animate-pulse" />
          )}
        </div>
      </div>
    </div>
  );
}

export default memo(Card);
