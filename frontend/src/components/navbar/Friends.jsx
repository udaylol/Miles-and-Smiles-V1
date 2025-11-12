import { useState, useEffect, useRef } from "react";
import { Users, X } from "lucide-react";
import axiosClient from "../../axiosClient.js";

export default function Friends({ mobileVisible = false }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [userData, setUserData] = useState(null);
  const ref = useRef(null);

  const visibility = mobileVisible ? "flex md:hidden" : "hidden md:flex";
  const iconSize = mobileVisible ? 18 : 20;

  // Fetch user info when panel opens
  useEffect(() => {
    if (open) fetchUserData();
  }, [open]);

  const fetchUserData = async () => {
    try {
      const res = await axiosClient.get("/api/user/me");
      setUserData(res.data);
      // intentionally avoid writing user to localStorage; keep in-memory only
    } catch (err) {
      console.error("❌ Error fetching user data:", err);
    }
  };

  // Close popup when clicking outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
        setMessage("");
      }
    }
    if (open) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  // --- Send Friend Request ---
  const handleSendRequest = async () => {
    if (!search.trim()) {
      setMessage("Please enter a username");
      return;
    }

    try {
      setLoading(true);
      setMessage("");

      const res = await axiosClient.post("/api/user/friends", {
        username: search.trim(),
      });

      setMessage(res.data.message || "Friend request sent!");
      setSearch("");

      // Refresh user info after sending
      await fetchUserData();
    } catch (err) {
      console.error("❌ Error sending friend request:", err);
      const errMsg =
        err.response?.data?.message || "Player not found or request failed";
      setMessage(errMsg);
    } finally {
      setLoading(false);
      setTimeout(() => setMessage(""), 3000);
    }
  };

  // --- Accept Friend Request ---
  const handleAcceptRequest = async (requesterId) => {
    try {
      setLoading(true);
      const res = await axiosClient.post("/api/user/friends/accept", {
        userId: requesterId,
      });
      setMessage(res.data.message || "Friend request accepted!");
      await fetchUserData();
    } catch (err) {
      console.error("❌ Error accepting friend request:", err);
      const errMsg =
        err.response?.data?.message || "Failed to accept friend request";
      setMessage(errMsg);
    } finally {
      setLoading(false);
      setTimeout(() => setMessage(""), 3000);
    }
  };

  // --- Reject Friend Request ---
  const handleRejectRequest = async (requesterId) => {
    try {
      setLoading(true);
      const res = await axiosClient.post("/api/user/friends/reject", {
        userId: requesterId,
      });
      setMessage(res.data.message || "Friend request rejected");
      await fetchUserData();
    } catch (err) {
      console.error("❌ Error rejecting friend request:", err);
      const errMsg =
        err.response?.data?.message || "Failed to reject friend request";
      setMessage(errMsg);
    } finally {
      setLoading(false);
      setTimeout(() => setMessage(""), 3000);
    }
  };

  // --- Cancel Friend Request ---
  const handleCancelRequest = async (targetId) => {
    try {
      setLoading(true);
      const res = await axiosClient.post("/api/user/friends/cancel", {
        userId: targetId,
      });
      setMessage(res.data.message || "Friend request cancelled");
      await fetchUserData();
    } catch (err) {
      console.error("❌ Error cancelling friend request:", err);
      const errMsg =
        err.response?.data?.message || "Failed to cancel friend request";
      setMessage(errMsg);
    } finally {
      setLoading(false);
      setTimeout(() => setMessage(""), 3000);
    }
  };

  // --- Remove Friend ---
  const handleRemoveFriend = async (friendId) => {
    try {
      setLoading(true);
      const res = await axiosClient.post("/api/user/friends/remove", {
        userId: friendId,
      });
      setMessage(res.data.message || "Friend removed");
      await fetchUserData();
    } catch (err) {
      console.error("❌ Error removing friend:", err);
      const errMsg =
        err.response?.data?.message || "Failed to remove friend";
      setMessage(errMsg);
    } finally {
      setLoading(false);
      setTimeout(() => setMessage(""), 3000);
    }
  };

  // Render friends list with Remove button
  const renderFriends = (users, emptyText) => {
    if (!users || users.length === 0) {
      return (
        <p className="text-sm text-[--muted-foreground]">{emptyText}</p>
      );
    }

    return (
      <ul className="space-y-2">
        {users.map((u) => {
          const userId = u._id || u.userId || u;
          return (
            <li
              key={userId}
              className="flex items-center justify-between gap-3 p-2 rounded-md bg-[--surface]"
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                {u.pfp_url && (
                  <img
                    src={u.pfp_url}
                    alt={u.username}
                    className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                  />
                )}
                <span className="text-[--foreground] truncate">
                  {u.username || u}
                </span>
              </div>
              <button
                onClick={() => handleRemoveFriend(userId)}
                disabled={loading}
                className="px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600 transition disabled:opacity-50 flex-shrink-0"
              >
                Remove
              </button>
            </li>
          );
        })}
      </ul>
    );
  };

  // Render incoming requests with Accept/Reject buttons
  const renderIncomingRequests = (users, emptyText) => {
    if (!users || users.length === 0) {
      return (
        <p className="text-sm text-[--muted-foreground]">{emptyText}</p>
      );
    }

    return (
      <ul className="space-y-2">
        {users.map((u) => {
          const userId = u._id || u.userId || u;
          return (
            <li
              key={userId}
              className="flex items-center justify-between gap-3 p-2 rounded-md bg-[--surface]"
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                {u.pfp_url && (
                  <img
                    src={u.pfp_url}
                    alt={u.username}
                    className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                  />
                )}
                <span className="text-[--foreground] truncate">
                  {u.username || u}
                </span>
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <button
                  onClick={() => handleAcceptRequest(userId)}
                  disabled={loading}
                  className="px-2 py-1 text-xs bg-green-500 text-white rounded hover:bg-green-600 transition disabled:opacity-50"
                >
                  Accept
                </button>
                <button
                  onClick={() => handleRejectRequest(userId)}
                  disabled={loading}
                  className="px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600 transition disabled:opacity-50"
                >
                  Reject
                </button>
              </div>
            </li>
          );
        })}
      </ul>
    );
  };

  // Render outgoing requests with Cancel button
  const renderOutgoingRequests = (users, emptyText) => {
    if (!users || users.length === 0) {
      return (
        <p className="text-sm text-[--muted-foreground]">{emptyText}</p>
      );
    }

    return (
      <ul className="space-y-2">
        {users.map((u) => {
          const userId = u._id || u.userId || u;
          return (
            <li
              key={userId}
              className="flex items-center justify-between gap-3 p-2 rounded-md bg-[--surface]"
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                {u.pfp_url && (
                  <img
                    src={u.pfp_url}
                    alt={u.username}
                    className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                  />
                )}
                <span className="text-[--foreground] truncate">
                  {u.username || u}
                </span>
              </div>
              <button
                onClick={() => handleCancelRequest(userId)}
                disabled={loading}
                className="px-2 py-1 text-xs bg-gray-500 text-white rounded hover:bg-gray-600 transition disabled:opacity-50 flex-shrink-0"
              >
                Cancel
              </button>
            </li>
          );
        })}
      </ul>
    );
  };

  return (
    <div className={`${visibility} items-center space-x-4 relative`}>
      <button
        className="p-2 hover:bg-[--card] rounded-full cursor-pointer"
        onClick={() => setOpen((prev) => !prev)}
      >
        <Users className="text-[--muted]" size={iconSize} />
      </button>

      {open && (
        <div
          ref={ref}
          className="
            absolute md:right-0 md:top-10 
            top-12 left-1/2 md:left-auto md:translate-x-0
            -translate-x-1/2 
            w-[18rem] sm:w-[22rem] md:w-[26rem]
            bg-[--card] border border-[--border] shadow-lg rounded-2xl z-50 p-4
            animate-pop-in"
          style={{ backgroundColor: "var(--card, #fff6ea)", opacity: 1 }}
        >
          {/* Header */}
          <div className="flex justify-between items-center mb-3">
            <h2 className="font-semibold text-lg">Friends</h2>
            <button onClick={() => setOpen(false)}>
              <X size={18} className="text-[--muted]" />
            </button>
          </div>

          {/* Search + Send Button */}
          <div className="mb-4 flex gap-2">
            <input
              type="text"
              placeholder="Search username..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 px-3 py-2 rounded-md border border-[--border] bg-[--input] text-[--foreground] focus:outline-none focus:ring-2 focus:ring-[--primary]"
            />
            <button
              onClick={handleSendRequest}
              disabled={loading}
              className="px-3 py-2 bg-[--primary] text-white rounded-md hover:opacity-90 transition disabled:opacity-50"
            >
              {loading ? "..." : "Send"}
            </button>
          </div>

          {/* Message Popup */}
          {message && (
            <div className="mb-3 text-sm text-center p-2 rounded-md bg-[--surface] border border-[--border] text-[--foreground] animate-fade-in">
              {message}
            </div>
          )}

          {/* Sections */}
          {userData ? (
            <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
              <section>
                <h3 className="font-medium text-sm mb-1 text-[--muted]">
                  Incoming Requests
                </h3>
                {renderIncomingRequests(
                  userData.incomingRequests,
                  "No incoming requests"
                )}
              </section>

              <section>
                <h3 className="font-medium text-sm mb-1 text-[--muted]">
                  Outgoing Requests
                </h3>
                {renderOutgoingRequests(
                  userData.outgoingRequests,
                  "No outgoing requests"
                )}
              </section>

              <section>
                <h3 className="font-medium text-sm mb-1 text-[--muted]">
                  Your Friends
                </h3>
                {renderFriends(userData.friends, "You have no friends yet")}
              </section>
            </div>
          ) : (
            <p className="text-sm text-center text-[--muted-foreground]">
              Loading...
            </p>
          )}
        </div>
      )}
    </div>
  );
}
