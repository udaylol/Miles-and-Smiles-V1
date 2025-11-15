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

export const sendFriendRequest = async (req, res) => {
  try {
    const { username } = req.body;
    const senderId = req.user.id;

    const sender = await User.findById(senderId);
    const receiver = await User.findOne({ username });

    if (!receiver) {
      return res.status(404).json({ message: "User not found" });
    }

    if (receiver._id.equals(sender._id)) {
      return res
        .status(400)
        .json({ message: "You cannot send a request to yourself" });
    }

    if (sender.friends.includes(receiver._id)) {
      return res.status(400).json({ message: "You are already friends" });
    }

    if (sender.outgoingRequests.includes(receiver._id)) {
      return res.status(400).json({ message: "Friend request already sent" });
    }

    if (sender.incomingRequests.includes(receiver._id)) {
      sender.friends.push(receiver._id);
      receiver.friends.push(sender._id);

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
