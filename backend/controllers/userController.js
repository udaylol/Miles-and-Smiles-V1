import User from "../models/User.js";

export async function getFavorites(req, res) {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    return res.status(200).json({ favouriteGames: user.favouriteGames || [] });
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

    if (gameIndex > -1) {
      favouriteGames.splice(gameIndex, 1);
    } else {
      favouriteGames.push(gameTitle);
    }

    user.favouriteGames = favouriteGames;
    await user.save();

    return res.status(200).json({
      message:
        gameIndex > -1
          ? "Game removed from favorites"
          : "Game added to favorites",
      favouriteGames: user.favouriteGames,
    });
  } catch (err) {
    console.error("toggleFavorite error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
}

export async function uploadProfilePicture(req, res) {
  try {
    const userId = req.user.id;
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

export const sendFriendRequest = async (req, res) => {
  try {
    const { username } = req.body; // the target username
    const senderId = req.user.id;  // extracted from JWT middleware

    // find sender and receiver
    const sender = await User.findById(senderId);
    const receiver = await User.findOne({ username });

    // 1️⃣ check if receiver exists
    if (!receiver) {
      return res.status(404).json({ message: "User not found" });
    }

    // 2️⃣ prevent self requests
    if (receiver._id.equals(sender._id)) {
      return res.status(400).json({ message: "You cannot send a request to yourself" });
    }

    // 3️⃣ check if already friends
    if (sender.friends.includes(receiver._id)) {
      return res.status(400).json({ message: "You are already friends" });
    }

    // 4️⃣ check if request already sent
    if (sender.outgoingRequests.includes(receiver._id)) {
      return res.status(400).json({ message: "Friend request already sent" });
    }

    // 5️⃣ check if receiver already sent you one (then they should be friends instead)
    if (sender.incomingRequests.includes(receiver._id)) {
      // auto-accept the friend request
      sender.friends.push(receiver._id);
      receiver.friends.push(sender._id);

      // remove old requests
      sender.incomingRequests = sender.incomingRequests.filter(
        (id) => !id.equals(receiver._id)
      );
      receiver.outgoingRequests = receiver.outgoingRequests.filter(
        (id) => !id.equals(sender._id)
      );

      await sender.save();
      await receiver.save();

      return res.json({ message: "Friend request accepted! You are now friends." });
    }

    // 6️⃣ otherwise, create new friend request
    sender.outgoingRequests.push(receiver._id);
    receiver.incomingRequests.push(sender._id);

    await sender.save();
    await receiver.save();

    res.json({ message: "Friend request sent!" });
  } catch (err) {
    console.error("Error sending friend request:", err);
    res.status(500).json({ message: "Server error while sending request" });
  }
};


export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .populate("friends", "username pfp_url") // ✅ friends with name & pic
      .populate("incomingRequests", "username pfp_url") // ✅ incoming
      .populate("outgoingRequests", "username pfp_url") // ✅ outgoing
      .lean(); // makes it easier to strip password, etc.

    if (!user) return res.status(404).json({ message: "User not found" });

    const { password, ...safeUser } = user; // remove password if present
    res.json(safeUser);
  } catch (err) {
    console.error("get /me error:", err);
    res.status(500).json({ message: "Server error" });
  }
}