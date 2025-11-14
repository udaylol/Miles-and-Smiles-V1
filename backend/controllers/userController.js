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

export const sendFriendRequest = async (req, res) => {
  try {
    const { username } = req.body; // the target username
    const senderId = req.user.id; // extracted from JWT middleware

    // find sender and receiver
    const sender = await User.findById(senderId);
    const receiver = await User.findOne({ username });

    // 1️⃣ check if receiver exists
    if (!receiver) {
      return res.status(404).json({ message: "User not found" });
    }

    // 2️⃣ prevent self requests
    if (receiver._id.equals(sender._id)) {
      return res
        .status(400)
        .json({ message: "You cannot send a request to yourself" });
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

      return res.json({
        message: "Friend request accepted! You are now friends.",
      });
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

// Accept an incoming friend request
export const acceptFriendRequest = async (req, res) => {
  try {
    const userId = req.user.id;
    const { userId: requesterId } = req.body; // The user who sent the request

    if (!requesterId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    const user = await User.findById(userId);
    const requester = await User.findById(requesterId);

    if (!user || !requester) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if request exists
    const hasIncomingRequest = user.incomingRequests.some(
      (id) => id.toString() === requesterId.toString()
    );
    if (!hasIncomingRequest) {
      return res.status(400).json({ message: "Friend request not found" });
    }

    // Check if already friends
    const alreadyFriends = user.friends.some(
      (id) => id.toString() === requesterId.toString()
    );
    if (alreadyFriends) {
      return res.status(400).json({ message: "You are already friends" });
    }

    // Add to friends list
    user.friends.push(requesterId);
    requester.friends.push(userId);

    // Remove from requests
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

// Reject an incoming friend request
export const rejectFriendRequest = async (req, res) => {
  try {
    const userId = req.user.id;
    const { userId: requesterId } = req.body; // The user who sent the request

    if (!requesterId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    const user = await User.findById(userId);
    const requester = await User.findById(requesterId);

    if (!user || !requester) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if request exists
    const hasIncomingRequest = user.incomingRequests.some(
      (id) => id.toString() === requesterId.toString()
    );
    if (!hasIncomingRequest) {
      return res.status(400).json({ message: "Friend request not found" });
    }

    // Remove from requests
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

// Cancel an outgoing friend request
export const cancelFriendRequest = async (req, res) => {
  try {
    const userId = req.user.id;
    const { userId: targetId } = req.body; // The user who received the request

    if (!targetId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    const user = await User.findById(userId);
    const target = await User.findById(targetId);

    if (!user || !target) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if request exists
    const hasOutgoingRequest = user.outgoingRequests.some(
      (id) => id.toString() === targetId.toString()
    );
    if (!hasOutgoingRequest) {
      return res.status(400).json({ message: "Friend request not found" });
    }

    // Remove from requests
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

// Remove a friend
export const removeFriend = async (req, res) => {
  try {
    const userId = req.user.id;
    const { userId: friendId } = req.body; // The friend to remove

    if (!friendId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    const user = await User.findById(userId);
    const friend = await User.findById(friendId);

    if (!user || !friend) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if they are friends
    const isFriend = user.friends.some(
      (id) => id.toString() === friendId.toString()
    );
    if (!isFriend) {
      return res.status(400).json({ message: "User is not your friend" });
    }

    // Remove from both friends lists
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
};
