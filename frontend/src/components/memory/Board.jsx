/**
 * Memory Game Board Component
 * Displays the card grid layout
 */

import Card from "./Card";

/**
 * Board component with card grid
 * @param {Object} props - Component props
 * @param {Array} props.cards - Array of card objects
 * @param {number} props.gridSize - Grid dimension (4 = 4x4)
 * @param {Function} props.onCardClick - Card click handler
 * @param {boolean} props.disabled - Whether all cards are disabled
 * @param {boolean} props.showingMatch - Whether showing match celebration
 */
function Board({ cards, gridSize = 4, onCardClick, disabled, showingMatch }) {
  return (
    <div className="w-full max-w-lg mx-auto">
      {/* Board container with glassmorphism */}
      <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-4 md:p-6 border border-white/10 shadow-2xl">
        {/* Card grid */}
        <div 
          className="grid gap-3 md:gap-4"
          style={{
            gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))`,
          }}
        >
          {cards.map((card) => (
            <Card
              key={card.index}
              card={card}
              onClick={onCardClick}
              disabled={disabled}
              showingMatch={showingMatch && card.isMatched}
            />
          ))}
        </div>
        
        {/* Empty state */}
        {cards.length === 0 && (
          <div className="flex items-center justify-center h-64 text-white/50">
            <div className="text-center">
              <div className="text-5xl mb-4">🎴</div>
              <p>Waiting for game to start...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Board;
