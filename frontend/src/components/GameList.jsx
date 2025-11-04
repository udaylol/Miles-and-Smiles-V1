import GameCard from "./GameCard";

const GameList = () => {
  const games = [
    { title: "TicTacToe", image: "/TicTacToe.jpg" },
    { title: "Memory", image: "/Memory.jpg" },
    { title: "Snakes and Ladders", image: "/SnakesLadders.jpg" },
    { title: "Dots and Boxes", image: "/DotsBoxes.jpg" },
  ];

  return (
    <div className="w-full px-4 py-8 flex gap-6 flex-wrap justify-center">
      {games.map((game, i) => (
        <GameCard key={i} image={game.image} title={game.title} />
      ))}
    </div>
  );
};

export default GameList;
