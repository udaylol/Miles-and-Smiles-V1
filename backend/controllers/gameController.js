import Game from "../models/Game.js";

export const getAllGames = async (req, res) => {
  try {
    const games = await Game.find();

    if (!games || games.length === 0) {
      return res.status(404).json({ message: "No games found" });
    }

    res.status(200).json(games);
  } catch (error) {
    console.error("❌ Error fetching games:", error);
    res.status(500).json({ message: "Error while fetching games" });
  }
};
