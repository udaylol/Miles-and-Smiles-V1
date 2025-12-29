import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Star } from "lucide-react";
import axiosClient from "../axiosClient.js";
import { useAuth } from "../context/AuthContext.jsx";
import GameHistoryModal from "./GameHistoryModal.jsx";

const GameCard = ({ image, title }) => {
  const navigate = useNavigate();
  const [isFavorited, setIsFavorited] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const { isAuthenticated, token, user, updateUser } = useAuth();

  // Fetch user's favorite games if logged in
  const fetchFavorites = async () => {
    try {
      if (!token) return;
      const response = await axiosClient.get("/api/user/favorites", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const favoriteGames = response.data.favouriteGames || [];
      setIsFavorited(favoriteGames.includes(title));
    } catch (error) {
      console.error("Error fetching favorites:", error);
    }
  };

  // Check if user is logged in and fetch favorites
  useEffect(() => {
    if (isAuthenticated) {
      fetchFavorites();
    } else {
      setIsFavorited(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [title, isAuthenticated, token]);

  const handleClick = () => {
    // If authenticated, show history modal first
    if (isAuthenticated) {
      setShowHistoryModal(true);
    } else {
      // If not authenticated, go directly to game
      navigateToGame();
    }
  };

  const navigateToGame = () => {
    const path = "/games/" + title.toLowerCase().replace(/\s+/g, "-");
    navigate(path);
  };

  const handlePlayFromModal = () => {
    setShowHistoryModal(false);
    navigateToGame();
  };

  const handleStarClick = async (e) => {
    e.stopPropagation(); // Prevent card click navigation

    if (!isAuthenticated) {
      navigate("/auth");
      return;
    }

    try {
      const response = await axiosClient.post(
        "/api/user/favorites",
        { gameTitle: title },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const favs = response.data.favouriteGames || [];
      setIsFavorited(favs.includes(title));
      // Update user in context if available
      if (user) {
        updateUser({ favouriteGames: favs });
      }

      // Dispatch event to notify GameList that favorites were updated
      window.dispatchEvent(new Event("favoritesUpdated"));
    } catch (error) {
      console.error("Error toggling favorite:", error);
      // If error is due to authentication, navigate to auth page
      if (error.response?.status === 401 || error.response?.status === 403) {
        navigate("/auth");
      }
    }
  };

  return (
    <div
      onClick={handleClick}
      className="group card cursor-pointer animate-stagger overflow-hidden"
    >
      {/* Image Container */}
      <div className="relative w-full aspect-[4/3] overflow-hidden bg-bg-deep">
        <img
          src={image}
          alt={title}
          className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
        />
        {/* Gradient Overlay - accent tinted */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#1A1714]/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        
        {/* Play Button Overlay - bigger, bolder */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500">
          <div className="w-16 h-16 rounded-full bg-accent flex items-center justify-center shadow-lg shadow-accent/30 transform scale-75 group-hover:scale-100 transition-all duration-500 animate-glow">
            <svg className="w-7 h-7 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        </div>
        
        {/* Favorite Badge (if favorited) */}
        {isFavorited && (
          <div className="absolute top-3 left-3 tag tag-amber shadow-lg">
            <Star size={12} className="fill-current" />
            Favorite
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5">
        <div className="flex items-center justify-between gap-3">
          <h2 className="font-display text-xl font-semibold text-text truncate">
            {title}
          </h2>
          <button
            onClick={handleStarClick}
            className={`p-2.5 rounded-xl transition-all duration-200 flex-shrink-0 cursor-pointer ${
              isFavorited 
                ? "bg-amber-soft hover:bg-amber/20" 
                : "bg-bg-deep hover:bg-accent-soft"
            }`}
            title={isFavorited ? "Remove from favorites" : "Add to favorites"}
          >
            <Star
              className={`${
                isFavorited
                  ? "fill-amber text-amber"
                  : "text-text-muted group-hover:text-accent"
              } transition-colors duration-200`}
              size={18}
            />
          </button>
        </div>
        
        {/* Play text */}
        <p className="mt-3 text-sm text-text-secondary flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald animate-pulse" />
          Ready to play
        </p>
      </div>

      {/* Game History Modal */}
      <GameHistoryModal
        isOpen={showHistoryModal}
        onClose={() => setShowHistoryModal(false)}
        gameName={title}
        onPlay={handlePlayFromModal}
      />
    </div>
  );
};

export default GameCard;
