import { useEffect, useState, useCallback, useMemo } from "react";
import GameCard from "./GameCard";
import axiosClient from "../axiosClient.js";
import { useAuth } from "../context/AuthContext.jsx";
import { useSearch } from "../context/SearchContext.jsx";

const GameList = () => {
  const [allGames, setAllGames] = useState([]);
  const [favoriteGames, setFavoriteGames] = useState([]);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(
    () => localStorage.getItem("showFavoritesOnly") === "true"
  );
  const { isAuthenticated, token } = useAuth();
  const { query } = useSearch(); // ✅ live search term from context

  // ✅ Fetch all games (from MongoDB)
  useEffect(() => {
    async function fetchGames() {
      try {
        const res = await axiosClient.get(`/api/games`);
        setAllGames(res.data);
      } catch (error) {
        console.error("❌ Error fetching games:", error);
      }
    }

    fetchGames();
  }, []);

  // ✅ Fetch user favorites if logged in
  const fetchFavorites = useCallback(async () => {
    if (!isAuthenticated || !token) {
      setFavoriteGames([]);
      return;
    }

    try {
      const response = await axiosClient.get("/api/user/favorites", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const favoriteGameTitles = response.data.favouriteGames || [];
      setFavoriteGames(favoriteGameTitles);
    } catch (error) {
      console.error("Error fetching favorites:", error);
      setFavoriteGames([]);
    }
  }, [isAuthenticated, token]);

  useEffect(() => {
    fetchFavorites();
  }, [fetchFavorites]);

  // ✅ Handle favorites toggling and sync across app
  useEffect(() => {
    const handleFavoritesFilterChange = async (e) => {
      setShowFavoritesOnly(e.detail);
      if (e.detail && isAuthenticated) {
        fetchFavorites();
      }
    };

    const handleFavoritesUpdate = async () => {
      if (isAuthenticated) {
        fetchFavorites();
      }
    };

    window.addEventListener("favoritesFilterChange", handleFavoritesFilterChange);
    window.addEventListener("favoritesUpdated", handleFavoritesUpdate);

    return () => {
      window.removeEventListener("favoritesFilterChange", handleFavoritesFilterChange);
      window.removeEventListener("favoritesUpdated", handleFavoritesUpdate);
    };
  }, [isAuthenticated, fetchFavorites]);

  // ✅ Compute final displayed games (favorites + search filtering)
  const displayedGames = useMemo(() => {
    let gamesToShow = allGames;

    // Filter by favorites if enabled
    if (showFavoritesOnly && isAuthenticated) {
      gamesToShow = gamesToShow.filter((game) =>
        favoriteGames.includes(game.title)
      );
    }

    // 🔥 Real-time search filter (case-insensitive, startsWith)
    if (query.trim()) {
      const lower = query.toLowerCase();
      gamesToShow = gamesToShow.filter((game) =>
        game.title && game.title.toLowerCase().startsWith(lower)
      );
    }

    return gamesToShow;
  }, [allGames, favoriteGames, showFavoritesOnly, isAuthenticated, query]);
  // ✅ Render
  return (
    <div className="w-full px-4 py-8 flex gap-6 flex-wrap justify-center">
      {displayedGames.length > 0 ? (
        displayedGames.map((game, i) => (
          <GameCard
            key={game._id || i}
            image={game.image}
            title={game.title}
          />
        ))
      ) : showFavoritesOnly && query.trim() && isAuthenticated ? (
        <div className="w-full text-center py-12">
          <p className="text-[--muted] text-lg">
            No favorite games match your search.
          </p>
        </div>
      ) : showFavoritesOnly && isAuthenticated ? (
        <div className="w-full text-center py-12">
          <p className="text-[--muted] text-lg">
            No favorite games yet. Start adding some!
          </p>
        </div>
      ) : query.trim() ? (
        <div className="w-full text-center py-12">
          <p className="text-[--muted] text-lg">
            No games found starting with “{query}”.
          </p>
        </div>
      ) : null}
    </div>
  );
};

export default GameList;
