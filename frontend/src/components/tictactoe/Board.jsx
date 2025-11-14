/**
 * Board Component
 * Renders the 3x3 TicTacToe grid
 */

import Cell from "./Cell.jsx";

/**
 * @param {Object} props
 * @param {Array<Array<string|null>>} props.board - 3x3 game board
 * @param {boolean} props.isMyTurn - Whether it's the current player's turn
 * @param {string|null} props.winner - Winner of the game (null if ongoing)
 * @param {Function} props.onCellClick - Cell click handler
 */
function Board({ board, isMyTurn, winner, onCellClick }) {
  return (
    <div className="flex justify-center mb-6">
      <div className="grid grid-cols-3 gap-2 bg-gray-200 dark:bg-gray-700 p-2 rounded-lg">
        {Array.from({ length: 9 }, (_, i) => {
          const row = Math.floor(i / 3);
          const col = i % 3;
          const value = board[row][col];
          const isEmpty = value === null;
          const isClickable = isMyTurn && isEmpty && winner === null;

          return (
            <Cell
              key={i}
              value={value}
              index={i}
              isClickable={isClickable}
              onClick={onCellClick}
            />
          );
        })}
      </div>
    </div>
  );
}

export default Board;
