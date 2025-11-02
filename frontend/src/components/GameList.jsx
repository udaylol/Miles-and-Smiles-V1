import React from "react";
import GameCard from "./GameCard";

const GameList = () => {
  const games = [
    {
      title: "Valorant",
      image: "https://cdn.cloudflare.steamstatic.com/steam/apps/230410/header.jpg",
    },
    {
      title: "GTA V",
      image: "https://cdn.cloudflare.steamstatic.com/steam/apps/271590/header.jpg",
    },
  ];

  return (
    <div className="flex gap-6 flex-wrap justify-center mt-10">
      {games.map((game, index) => (
        <GameCard key={index} image={game.image} title={game.title} />
      ))}
    </div>
  );
};

export default GameList;
