import { Heart } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

export default function Favourites({ mobileVisible = false }) {
  const navigate = useNavigate();

  const [showFavoritesOnly, setShowFavoritesOnly] = useState(
    () => localStorage.getItem("showFavoritesOnly") === "true"
  );

  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem("token"));

  useEffect(() => {
    const handleStorageChange = () => {
      setIsLoggedIn(!!localStorage.getItem("token"));
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const handleFavoritesToggle = () => {
    if (!isLoggedIn) {
      navigate("/auth");
      return;
    }
    const newState = !showFavoritesOnly;
    setShowFavoritesOnly(newState);
    localStorage.setItem("showFavoritesOnly", newState.toString());
    window.dispatchEvent(
      new CustomEvent("favoritesFilterChange", { detail: newState })
    );
  };

  const visibility = mobileVisible ? "flex md:hidden" : "hidden md:flex";

  return (
    <div className={`${visibility} items-center space-x-4`}>
      <button
        onClick={handleFavoritesToggle}
        className="p-2 hover:bg-(--card) rounded-full cursor-pointer"
        title={
          showFavoritesOnly ? "Show all games" : "Show favorite games only"
        }
      >
        <Heart
          className={`${
            showFavoritesOnly ? "fill-red-500 text-red-500" : "text-(--muted)"
          } transition-colors duration-200`}
          size={mobileVisible ? 18 : 20}
        />
      </button>
    </div>
  );
}
