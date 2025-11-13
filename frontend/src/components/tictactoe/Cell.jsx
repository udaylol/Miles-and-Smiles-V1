/**
 * Cell Component
 * Individual square in the TicTacToe board
 */

/**
 * @param {Object} props
 * @param {string|null} props.value - Cell value ("X", "O", or null)
 * @param {number} props.index - Cell index (0-8)
 * @param {boolean} props.isClickable - Whether the cell can be clicked
 * @param {Function} props.onClick - Click handler function
 */
function Cell({ value, index, isClickable, onClick }) {
  return (
    <button
      onClick={() => onClick(index)}
      disabled={!isClickable}
      className={`
        w-24 h-24 sm:w-32 sm:h-32
        border-2 border-gray-300 dark:border-gray-600
        text-4xl sm:text-5xl font-bold
        transition-all duration-200
        ${
          isClickable
            ? "hover:bg-blue-100 dark:hover:bg-blue-900 cursor-pointer active:scale-95"
            : "cursor-not-allowed opacity-60"
        }
        ${
          value === "X"
            ? "text-blue-600 dark:text-blue-400"
            : value === "O"
            ? "text-red-600 dark:text-red-400"
            : "text-gray-400"
        }
        ${!value && isClickable ? "bg-green-50 dark:bg-green-900/20" : ""}
      `}
    >
      {value || ""}
    </button>
  );
}

export default Cell;

