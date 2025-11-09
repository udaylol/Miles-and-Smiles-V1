import { Search, Users, Heart } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function MobileMenu({
  isAuthenticated,
  onLogout,
  onLogin,
  menuOpen,
  showFavoritesOnly,
  setShowFavoritesOnly,
  user,
}) {
  if (!menuOpen) return null;
  const handleFavoritesToggle = () => {
    if (!isAuthenticated) {
      onLogin && onLogin();
      return;
    }
    const newState = !showFavoritesOnly;
    setShowFavoritesOnly && setShowFavoritesOnly(newState);
    try {
      localStorage.setItem("showFavoritesOnly", String(newState));
    } catch {}
    window.dispatchEvent(
      new CustomEvent("favoritesFilterChange", { detail: newState })
    );
  };
  const navigate = useNavigate();
  const handleProfileClick = () => {
    // navigate to profile page if exists; fallback to home
    navigate("/profile");
  };
  return (
    <div className="absolute top-full left-0 w-full flex justify-center z-50 md:hidden">
      {/* compact centered panel */}
      <div className="w-[calc(100%-2rem)] max-w-sm bg-(--surface) border border-(--muted) rounded-lg shadow-lg p-3 flex flex-col items-center space-y-3">
        {/* Profile row for mobile */}
        <div className="flex items-center bg-(--card) rounded-full px-3 py-1 w-full">
          <input
            type="text"
            placeholder="Search"
            className="bg-transparent outline-none text-(--text) placeholder-(--muted) w-full text-sm"
          />
          <Search className="text-(--muted) cursor-pointer" size={18} />
        </div>
        <div className="flex w-full justify-between">
        {isAuthenticated && user && (
          <div
            className="flex items-center w-32 px-2 py-1 cursor-pointer"
            onClick={handleProfileClick}
          >
            <img
              src={user.pfp_url || "/guestpfp.png"}
              alt={user.username || "profile"}
              className="w-8 h-8 rounded-full mr-3"
            />
            <div className="flex-1 text-left">
              <div className="font-semibold text-sm text-(--text)">
                {user.username}
              </div>
            </div>
          </div>
        )}
          <button className="p-2 hover:bg-(--card) rounded-full cursor-pointer">
            <Users className="text-(--muted) cursor-pointer" size={18} />
          </button>
          <button
            onClick={handleFavoritesToggle}
            className="p-2 hover:bg-(--card) rounded-full cursor-pointer"
            title={
              showFavoritesOnly ? "Show all games" : "Show favorite games only"
            }
          >
            <Heart
              className={`${
                showFavoritesOnly
                  ? "fill-red-500 text-red-500"
                  : "text-(--muted)"
              } cursor-pointer transition-colors duration-200`}
              size={18}
            />
          </button>
          {isAuthenticated ? (
            <button
              onClick={onLogout}
              className="bg-red-500 hover:bg-red-600 text-white font-semibold px-3 py-1 rounded-md text-sm"
            >
              Logout
            </button>
          ) : (
            <button
              onClick={onLogin}
              className="bg-blue-500 hover:bg-blue-600 text-white font-semibold px-3 py-1 rounded-md text-sm"
            >
              Login
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
