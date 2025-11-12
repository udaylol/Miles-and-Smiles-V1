import { useState, useEffect, useRef } from "react";
import { Users, X } from "lucide-react";
import axiosClient from "../../axiosClient.js";

export default function Friends({ mobileVisible = false }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const ref = useRef(null);

  const visibility = mobileVisible ? "flex md:hidden" : "hidden md:flex";
  const iconSize = mobileVisible ? 18 : 20;

  // close popup when clicking outside
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

      // ✅ Only send target username
      const res = await axiosClient.post("/api/user/friends", {
        username: search.trim(),
      });

      setMessage(res.data.message || "Friend request sent!");
      setSearch("");
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

          {/* Placeholder sections */}
          <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
            <section>
              <h3 className="font-medium text-sm mb-1 text-[--muted]">
                Incoming Requests
              </h3>
              <p className="text-sm text-[--muted-foreground]">
                No incoming requests
              </p>
            </section>

            <section>
              <h3 className="font-medium text-sm mb-1 text-[--muted]">
                Outgoing Requests
              </h3>
              <p className="text-sm text-[--muted-foreground]">
                No outgoing requests
              </p>
            </section>

            <section>
              <h3 className="font-medium text-sm mb-1 text-[--muted]">
                Your Friends
              </h3>
              <p className="text-sm text-[--muted-foreground]">
                You have no friends yet
              </p>
            </section>
          </div>
        </div>
      )}
    </div>
  );
}
