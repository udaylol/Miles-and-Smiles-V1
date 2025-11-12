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
      localStorage.setItem("user", JSON.stringify(res.data)); // optional sync
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

  // Render a list of users
  const renderUserList = (users, emptyText) => {
    if (!users || users.length === 0) {
      return (
        <p className="text-sm text-[--muted-foreground]">{emptyText}</p>
      );
    }

    return (
      <ul className="space-y-2">
        {users.map((u) => (
          <li
            key={u._id || u.userId || u}
            className="flex items-center gap-3 p-2 rounded-md bg-[--surface]"
          >
            {u.pfp_url && (
              <img
                src={u.pfp_url}
                alt={u.username}
                className="w-8 h-8 rounded-full object-cover"
              />
            )}
            <span className="text-[--foreground]">
              {u.username || u}
            </span>
          </li>
        ))}
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
                {renderUserList(
                  userData.incomingRequests,
                  "No incoming requests"
                )}
              </section>

              <section>
                <h3 className="font-medium text-sm mb-1 text-[--muted]">
                  Outgoing Requests
                </h3>
                {renderUserList(
                  userData.outgoingRequests,
                  "No outgoing requests"
                )}
              </section>

              <section>
                <h3 className="font-medium text-sm mb-1 text-[--muted]">
                  Your Friends
                </h3>
                {renderUserList(userData.friends, "You have no friends yet")}
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
