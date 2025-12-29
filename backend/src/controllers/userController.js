import User from "../models/User.js";
import redisClient from "../config/redis.js";
import { friendRequestQueue } from "../config/queue.js"; // NEW IMPORT

// Cache TTL (Time To Live) - 1 hour
const CACHE_TTL = 5;

export async function getKing(req, res) {

  const data = await redisClient.get("king-data")
  if (data) {
    return res.status(200).json({ data: JSON.parse(data), cached: true });
  }
  else {
    await User.findOne({ role: "king" }).then(async (king) => {
      await redisClient.setEx("king-data", 3600, JSON.stringify(king));
      return res.status(200).json({ data: king, cached: false });
    });
  }
}

export async function getFavorites(req, res) {
  try {
    const userId = req.user.id;
    const cacheKey = `user:${userId}:favorites`;

    // Try to get from Redis cache first
    const cachedFavorites = await redisClient.get(cacheKey);
    
    if (cachedFavorites) {
      console.log('fetched favorites from Redis cache');
      return res.status(200).json({ 
        favouriteGames: JSON.parse(cachedFavorites),
        cached: true 
      });
    }

    // If not in cache, get from MongoDB
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    const favouriteGames = user.favouriteGames || [];

    // Store in Redis cache for next time

    await redisClient.setEx(
      cacheKey,
      CACHE_TTL,
      JSON.stringify(favouriteGames)
    );
    console.log('fetched favorites from MongoDB and stored in Redis cache');

    return res.status(200).json({ favouriteGames });
  } catch (err) {
    console.error("getFavorites error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
}

export async function toggleFavorite(req, res) {
  try {
    const userId = req.user.id;
    const { gameTitle } = req.body;

    if (!gameTitle) {
      return res.status(400).json({ message: "Game title is required." });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    const favouriteGames = user.favouriteGames || [];
    const gameIndex = favouriteGames.indexOf(gameTitle);

    let action;
    if (gameIndex > -1) {
      favouriteGames.splice(gameIndex, 1);
      action = "removed";
    } else {
      favouriteGames.push(gameTitle);
      action = "added";
    }

    user.favouriteGames = favouriteGames;
    await user.save();

    // Update Redis cache
    const cacheKey = `user:${userId}:favorites`;
    await redisClient.setEx(
      cacheKey,
      CACHE_TTL,
      JSON.stringify(favouriteGames)
    );

    // Also increment/decrement game favorite count in Redis
    const gameCountKey = `game:${gameTitle}:favorite_count`;
    if (action === "added") {
      await redisClient.incr(gameCountKey);
    } else {
      await redisClient.decr(gameCountKey);
    }

    return res.status(200).json({
      message: action === "removed" 
        ? "Game removed from favorites"
        : "Game added to favorites",
      favouriteGames: user.favouriteGames,
    });
  } catch (err) {
    console.error("toggleFavorite error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
}

export async function updateProfilePicture(req, res) {
  try {
    const userId = req.user.id;

    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded." });
    }

    const imageUrl = req.file.path;

    const user = await User.findByIdAndUpdate(
      userId,
      { pfp_url: imageUrl },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    res.status(200).json({
      message: "Profile picture updated successfully",
      pfp_url: user.pfp_url,
    });
  } catch (err) {
    console.error("uploadProfilePicture error:", err);
    res.status(500).json({ message: "Image upload failed" });
  }
}

export async function updateField(req, res) {
  try {
    const userId = req.user.id;
    const updates = req.body;

    if (!updates || Object.keys(updates).length === 0) {
      return res.status(400).json({ message: "No fields provided." });
    }

    // Prevent updating restricted fields
    const disallowed = ["_id", "password", "emailVerified"];
    for (let key of Object.keys(updates)) {
      if (disallowed.includes(key)) {
        return res.status(400).json({ message: `Cannot update ${key}.` });
      }
    }

    // Special case: check if username already exists
    if (updates.username) {
      if (updates.username === req.user.username) {
        return res.status(200).json({ message: "", user: req.user });
      }

      const existingUser = await User.findOne({ username: updates.username });
      if (existingUser && existingUser._id.toString() !== userId) {
        return res.status(400).json({ message: "Username already taken." });
      }
    }

    // Perform update
    const user = await User.findByIdAndUpdate(userId, updates, { new: true });

    return res.status(200).json({
      message: "Updated successfully",
      user,
    });
  } catch (err) {
    console.error("updateField error:", err);
    return res.status(500).json({ message: "Failed to update user" });
  }
}

// 🔥 NEW: Async sendFriendRequest using Bull Queue
export const sendFriendRequest = async (req, res) => {
  try {
    const { username } = req.body;
    const senderId = req.user.id;
    const senderUsername = req.user.username;

    // Basic validation
    if (!username) {
      return res.status(400).json({ message: "Username is required" });
    }

    if (username === senderUsername) {
      return res.status(400).json({ 
        message: "You cannot send a request to yourself" 
      });
    }

    // 🚀 Add job to queue (FAST - returns immediately!)
    await friendRequestQueue.add({
      type: 'friend_request_sent',
      senderId: senderId,
      senderUsername: senderUsername,
      receiverUsername: username,
      timestamp: new Date().toISOString(),
    });

    // ✅ Return success immediately (don't wait for DB operations)
    return res.status(200).json({ 
      message: "Friend request sent!" 
    });

  } catch (err) {
    console.error("Error queueing friend request:", err);
    return res.status(500).json({ 
      message: "Server error while sending request" 
    });
  }
};

// Keep all other functions unchanged
export const acceptFriendRequest = async (req, res) => {
  try {
    const userId = req.user.id;
    const { userId: requesterId } = req.body;

    if (!requesterId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    const user = await User.findById(userId);
    const requester = await User.findById(requesterId);

    if (!user || !requester) {
      return res.status(404).json({ message: "User not found" });
    }

    const hasIncomingRequest = user.incomingRequests.some(
      (id) => id.toString() === requesterId.toString()
    );
    if (!hasIncomingRequest) {
      return res.status(400).json({ message: "Friend request not found" });
    }

    const alreadyFriends = user.friends.some(
      (id) => id.toString() === requesterId.toString()
    );
    if (alreadyFriends) {
      return res.status(400).json({ message: "You are already friends" });
    }

    user.friends.push(requesterId);
    requester.friends.push(userId);

    user.incomingRequests = user.incomingRequests.filter(
      (id) => id.toString() !== requesterId.toString()
    );
    requester.outgoingRequests = requester.outgoingRequests.filter(
      (id) => id.toString() !== userId.toString()
    );

    await user.save();
    await requester.save();

    res.json({ message: "Friend request accepted!" });
  } catch (err) {
    console.error("Error accepting friend request:", err);
    res.status(500).json({ message: "Server error while accepting request" });
  }
};

export const rejectFriendRequest = async (req, res) => {
  try {
    const userId = req.user.id;
    const { userId: requesterId } = req.body;
    if (!requesterId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    const user = await User.findById(userId);
    const requester = await User.findById(requesterId);

    if (!user || !requester) {
      return res.status(404).json({ message: "User not found" });
    }

    const hasIncomingRequest = user.incomingRequests.some(
      (id) => id.toString() === requesterId.toString()
    );
    if (!hasIncomingRequest) {
      return res.status(400).json({ message: "Friend request not found" });
    }

    user.incomingRequests = user.incomingRequests.filter(
      (id) => id.toString() !== requesterId.toString()
    );
    requester.outgoingRequests = requester.outgoingRequests.filter(
      (id) => id.toString() !== userId.toString()
    );

    await user.save();
    await requester.save();

    res.json({ message: "Friend request rejected" });
  } catch (err) {
    console.error("Error rejecting friend request:", err);
    res.status(500).json({ message: "Server error while rejecting request" });
  }
};

export const cancelFriendRequest = async (req, res) => {
  try {
    const userId = req.user.id;
    const { userId: targetId } = req.body;

    if (!targetId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    const user = await User.findById(userId);
    const target = await User.findById(targetId);

    if (!user || !target) {
      return res.status(404).json({ message: "User not found" });
    }

    const hasOutgoingRequest = user.outgoingRequests.some(
      (id) => id.toString() === targetId.toString()
    );
    if (!hasOutgoingRequest) {
      return res.status(400).json({ message: "Friend request not found" });
    }

    user.outgoingRequests = user.outgoingRequests.filter(
      (id) => id.toString() !== targetId.toString()
    );
    target.incomingRequests = target.incomingRequests.filter(
      (id) => id.toString() !== userId.toString()
    );

    await user.save();
    await target.save();

    res.json({ message: "Friend request cancelled" });
  } catch (err) {
    console.error("Error cancelling friend request:", err);
    res.status(500).json({ message: "Server error while cancelling request" });
  }
};

export const removeFriend = async (req, res) => {
  try {
    const userId = req.user.id;
    const { userId: friendId } = req.body;

    if (!friendId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    const user = await User.findById(userId);
    const friend = await User.findById(friendId);

    if (!user || !friend) {
      return res.status(404).json({ message: "User not found" });
    }

    const isFriend = user.friends.some(
      (id) => id.toString() === friendId.toString()
    );
    if (!isFriend) {
      return res.status(400).json({ message: "User is not your friend" });
    }

    user.friends = user.friends.filter(
      (id) => id.toString() !== friendId.toString()
    );
    friend.friends = friend.friends.filter(
      (id) => id.toString() !== userId.toString()
    );

    await user.save();
    await friend.save();

    res.json({ message: "Friend removed" });
  } catch (err) {
    console.error("Error removing friend:", err);
    res.status(500).json({ message: "Server error while removing friend" });
  }
};

export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .populate("friends", "username pfp_url")
      .populate("incomingRequests", "username pfp_url")
      .populate("outgoingRequests", "username pfp_url")
      .lean();

    if (!user) return res.status(404).json({ message: "User not found" });

    const { password, ...safeUser } = user;
    res.json(safeUser);
  } catch (err) {
    console.error("get /me error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * Get user game statistics
 */
export const getGameStats = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).lean();
    if (!user) return res.status(404).json({ message: "User not found" });

    // Calculate win percentage
    const winPercentage = user.totalGamesPlayed > 0 
      ? Math.round((user.totalWins / user.totalGamesPlayed) * 100) 
      : 0;

    res.json({
      totalGamesPlayed: user.totalGamesPlayed || 0,
      totalWins: user.totalWins || 0,
      totalLosses: user.totalLosses || 0,
      totalDraws: user.totalDraws || 0,
      winPercentage,
      currentStreak: user.currentStreak || 0,
      longestStreak: user.longestStreak || 0,
      lastGamePlayed: user.lastGamePlayed,
      gameStats: user.gameStats || [],
      matchHistory: (user.matchHistory || []).slice(0, 20), // Return last 20 matches
    });
  } catch (err) {
    console.error("getGameStats error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * Get match history for a specific game
 */
export const getGameHistory = async (req, res) => {
  try {
    const { gameName } = req.params;
    const user = await User.findById(req.user.id).lean();
    if (!user) return res.status(404).json({ message: "User not found" });

    // Filter match history by game name
    const gameHistory = (user.matchHistory || [])
      .filter(match => match.gameName === gameName)
      .slice(0, 20);

    // Get game-specific stats
    const gameStats = (user.gameStats || []).find(g => g.gameName === gameName) || {
      gameName,
      gamesPlayed: 0,
      wins: 0,
      losses: 0,
      draws: 0,
      highestScore: 0,
      totalScore: 0,
    };

    // Calculate win percentage for this game
    const winPercentage = gameStats.gamesPlayed > 0 
      ? Math.round((gameStats.wins / gameStats.gamesPlayed) * 100) 
      : 0;

    res.json({
      gameName,
      stats: {
        ...gameStats,
        winPercentage,
      },
      history: gameHistory,
    });
  } catch (err) {
    console.error("getGameHistory error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * Record a game result
 * Called internally by game handlers when a game ends
 */
export const recordGameResult = async (userId, gameData) => {
  try {
    const user = await User.findById(userId);
    if (!user) return null;

    const { gameName, result, myScore, opponentScore, opponent, opponentId } = gameData;

    // Update overall stats
    user.totalGamesPlayed = (user.totalGamesPlayed || 0) + 1;
    user.lastGamePlayed = new Date();

    if (result === "win") {
      user.totalWins = (user.totalWins || 0) + 1;
      user.currentStreak = (user.currentStreak || 0) + 1;
      if (user.currentStreak > (user.longestStreak || 0)) {
        user.longestStreak = user.currentStreak;
      }
    } else if (result === "loss") {
      user.totalLosses = (user.totalLosses || 0) + 1;
      user.currentStreak = 0;
    } else {
      user.totalDraws = (user.totalDraws || 0) + 1;
    }

    // Update per-game stats
    let gameStatsIndex = user.gameStats.findIndex(g => g.gameName === gameName);
    if (gameStatsIndex === -1) {
      user.gameStats.push({
        gameName,
        gamesPlayed: 0,
        wins: 0,
        losses: 0,
        draws: 0,
        highestScore: 0,
        totalScore: 0,
        lastPlayed: null,
      });
      gameStatsIndex = user.gameStats.length - 1;
    }

    const gameStats = user.gameStats[gameStatsIndex];
    gameStats.gamesPlayed += 1;
    gameStats.lastPlayed = new Date();
    
    if (result === "win") gameStats.wins += 1;
    else if (result === "loss") gameStats.losses += 1;
    else gameStats.draws += 1;

    if (myScore > gameStats.highestScore) {
      gameStats.highestScore = myScore;
    }
    gameStats.totalScore += myScore;

    // Add to match history (keep only last 50)
    user.matchHistory.unshift({
      gameName,
      opponent: opponent || "Unknown",
      opponentId: opponentId || null,
      result,
      myScore,
      opponentScore,
      playedAt: new Date(),
    });

    if (user.matchHistory.length > 50) {
      user.matchHistory = user.matchHistory.slice(0, 50);
    }

    await user.save();
    return user;
  } catch (err) {
    console.error("recordGameResult error:", err);
    return null;
  }
};

