import { useState, useEffect, useRef } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { useNavigate } from "react-router-dom";
import { io } from "socket.io-client";

const VITE_BACKEND_SERVER = import.meta.env.VITE_BACKEND_SERVER;

const RoomSelection = ({ gameName, onRoomJoined }) => {
  const [mode, setMode] = useState(null); // 'create' or 'join'
  const [roomCode, setRoomCode] = useState("");
  const [createdRoomCode, setCreatedRoomCode] = useState(null);
  const [socket, setSocket] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const roomJoinedRef = useRef(false);
  const timeoutRef = useRef(null);
  const navigate = useNavigate();
  const { token } = useAuth();

  useEffect(() => {
    const serverUrl = VITE_BACKEND_SERVER?.replace(/\/$/, "");
    console.log("Connecting to socket server:", serverUrl);

    const newSocket = io(serverUrl, {
      auth: {
        token: (() => {
          try {
            return token;
          } catch {
            return null;
          }
        })(),
      },
      transports: ["websocket", "polling"],
    });

    newSocket.on("connect", () => {
      console.log("✅ Connected to server");
      setSocket(newSocket);
    });

    newSocket.on("connect_error", (error) => {
      console.error("❌ Connection error:", error);
      setError("Failed to connect to server. Please check your connection.");
      setLoading(false);
      if (error.message?.includes("Authentication error")) {
        setError("Authentication failed. Please log in again.");
      }
    });

    newSocket.on("disconnect", (reason) => {
      console.log("⚠️ Disconnected:", reason);
      if (reason === "io server disconnect") {
        setError("Disconnected from server");
      }
    });

    newSocket.on("room-created", (data) => {
      // Clear timeout since we got a response
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      setLoading(false);
      console.log("✅ Room created:", data);
      setCreatedRoomCode(data.roomId);
      roomJoinedRef.current = true;
      setTimeout(() => {
        onRoomJoined({ roomId: data.roomId, gameName, socket: newSocket });
      }, 3000);
    });

    newSocket.on("room-joined", (data) => {
      setLoading(false);
      console.log("✅ Room joined:", data);
      roomJoinedRef.current = true;
      onRoomJoined({ roomId: data.roomId, gameName, socket: newSocket });
    });

    newSocket.on("room-error", (data) => {
      setLoading(false);
      console.error("❌ Room error:", data);
      setError(data.message || "An error occurred");
    });

    newSocket.on("room-not-found", () => {
      setLoading(false);
      setError("Room not found. Please check the room code.");
    });

    newSocket.on("room-full", () => {
      setLoading(false);
      setError("Room is full. Please try another room.");
    });

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      // Remove all event listeners to prevent memory leaks
      newSocket.off("connect");
      newSocket.off("connect_error");
      newSocket.off("disconnect");
      newSocket.off("room-created");
      newSocket.off("room-joined");
      newSocket.off("room-error");
      newSocket.off("room-not-found");
      newSocket.off("room-full");
      
      if (!roomJoinedRef.current) {
        console.log("Disconnecting socket");
        newSocket.disconnect();
      }
    };
  }, [gameName, onRoomJoined, token]);

  const handleCreateRoom = () => {
    if (!socket || !socket.connected) {
      setError("Not connected to server. Please wait...");
      return;
    }

    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    setError("");
    setLoading(true);
    console.log("Emitting create-room event with gameName:", gameName);

    // Emit with acknowledgment to verify server received it
    socket.emit("create-room", { gameName }, (response) => {
      if (response?.error) {
        console.error("Server error:", response.error);
        setError(response.error);
        setLoading(false);
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
          timeoutRef.current = null;
        }
      } else {
        console.log("Server acknowledged create-room request");
      }
    });

    // Add timeout in case server doesn't respond
    timeoutRef.current = setTimeout(() => {
      setLoading((prevLoading) => {
        if (prevLoading) {
          setError("Request timed out. Please try again.");
          console.error("Create room request timed out");
          return false;
        }
        return prevLoading;
      });
    }, 10000); // 10 second timeout
  };

  const handleJoinRoom = () => {
    if (!socket || !socket.connected) {
      setError("Not connected to server. Please wait...");
      return;
    }

    if (!roomCode.trim()) {
      setError("Please enter a room code");
      return;
    }

    setError("");
    setLoading(true);
    socket.emit("join-room", { roomId: roomCode.trim(), gameName });
  };

  const handleBack = () => {
    navigate("/");
  };

  if (mode === null) {
    return (
      <>
        {/* <Navbar /> */}
        <div className="min-h-screen bg-[--bg] text-[--text] flex items-center justify-center p-4">
          <div className="bg-[--card] rounded-xl shadow-lg p-8 max-w-md w-full border border-gray-200">
            <h1 className="text-3xl font-bold text-center mb-2">{gameName}</h1>
            <p className="text-center text-gray-600 mb-8">
              Choose an option to start playing
            </p>

            <div className="space-y-4">
              <button
                onClick={() => setMode("create")}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
              >
                Create Room
              </button>

              <button
                onClick={() => setMode("join")}
                className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
              >
                Join Room
              </button>

              <button
                onClick={handleBack}
                className="w-full bg-gray-500 hover:bg-gray-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
              >
                Back to Home
              </button>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <div className="min-h-screen bg-[--bg] text-[--text] flex items-center justify-center p-4">
      <div className="bg-[--card] rounded-xl shadow-lg p-8 max-w-md w-full border border-gray-200">
        <h1 className="text-3xl font-bold text-center mb-2">{gameName}</h1>
        <p className="text-center text-gray-600 mb-8">
          {mode === "create" ? "Create a new room" : "Join an existing room"}
        </p>

        {mode === "create" ? (
          <div className="space-y-4">
            {createdRoomCode ? (
              <>
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-center">
                  <p className="text-sm text-gray-600 mb-2">Room created!</p>
                  <p className="text-2xl font-bold text-green-700 font-mono">
                    {createdRoomCode}
                  </p>
                  <p className="text-xs text-gray-500 mt-2">
                    Share this code with your friend
                  </p>
                </div>
                <p className="text-sm text-center text-gray-600">
                  Loading game...
                </p>
              </>
            ) : (
              <>
                <button
                  onClick={handleCreateRoom}
                  disabled={loading || !socket?.connected}
                  className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
                >
                  {loading
                    ? "Creating Room..."
                    : socket?.connected
                    ? "Create Room"
                    : "Connecting..."}
                </button>

                <button
                  onClick={() => {
                    setMode(null);
                    setError("");
                    setCreatedRoomCode(null);
                  }}
                  className="w-full bg-gray-500 hover:bg-gray-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
                >
                  Back
                </button>
              </>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <input
              type="text"
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
              placeholder="Enter room code"
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-center text-lg font-mono"
              maxLength={6}
              disabled={loading}
            />

            <button
              onClick={handleJoinRoom}
              disabled={loading || !socket?.connected || !roomCode.trim()}
              className="w-full bg-green-500 hover:bg-green-600 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
            >
              {loading
                ? "Joining Room..."
                : socket?.connected
                ? "Join Room"
                : "Connecting..."}
            </button>

            <button
              onClick={() => {
                setMode(null);
                setRoomCode("");
                setError("");
              }}
              className="w-full bg-gray-500 hover:bg-gray-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
            >
              Back
            </button>
          </div>
        )}

        {error && (
          <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-center">
            {error}
          </div>
        )}
      </div>
    </div>
  );
};

export default RoomSelection;
