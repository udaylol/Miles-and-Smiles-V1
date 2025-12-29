import Game from "../models/Game.js";
import redisClient from "../config/redis.js"; // Add this import

const GAMES_CACHE_KEY = "games:all";
const CACHE_TTL = 3600; // 1 hour

export const getAllGames = async (req, res) => {
  try {
    // Try Redis cache first
    const cachedGames = await redisClient.get(GAMES_CACHE_KEY);
    
    if (cachedGames) {
      console.log('✅ Games from Redis cache');
      return res.status(200).json(JSON.parse(cachedGames));
    }

    // If not in cache, get from MongoDB
    const games = await Game.find();

    if (!games || games.length === 0) {
      return res.status(404).json({ message: "No games found" });
    }

    // Store in Redis for next time
    await redisClient.setEx(
      GAMES_CACHE_KEY,
      CACHE_TTL,
      JSON.stringify(games)
    );

    res.status(200).json(games);
  } catch (error) {
    console.error("❌ Error fetching games:", error);
    res.status(500).json({ message: "Error while fetching games" });
  }
};

export const getMostFavoritedGames = async (req, res) => {
  try {
    // Get all game favorite counts from Redis
    const keys = await redisClient.keys('game:*:favorite_count');
    
    const gamesWithCounts = await Promise.all(
      keys.map(async (key) => {
        const count = await redisClient.get(key);
        const gameTitle = key.split(':')[1]; // Extract game title from key
        return { gameTitle, count: parseInt(count) || 0 };
      })
    );

    // Sort by count descending
    gamesWithCounts.sort((a, b) => b.count - a.count);

    res.status(200).json({
      mostFavorited: gamesWithCounts.slice(0, 10) // Top 10
    });
  } catch (error) {
    console.error("❌ Error fetching most favorited games:", error);
    res.status(500).json({ message: "Error fetching statistics" });
  }
};

