import { Menu, X } from "lucide-react";
import { useState } from "react";
import Logo from "./navbar/Logo.jsx";
import SearchBar from "./navbar/SearchBar.jsx";
import Friends from "./navbar/Friends.jsx";
import Favourites from "./navbar/Favourites.jsx";
import ThemeToggle from "./navbar/ThemeToggle.jsx";
import AuthButtons from "./navbar/AuthButtons.jsx";
import MobileMenu from "./navbar/MobileMenu.jsx";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

const Navbar = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user, logout, updateUser } = useAuth();

  const handleLogin = () => navigate("/auth");
  const handleLogout = () => {
    logout();
    localStorage.setItem("showFavoritesOnly", "false");
    setShowFavoritesOnly(false);
    window.dispatchEvent(new CustomEvent("favoritesFilterChange", { detail: false }));
    navigate("/");
  };

  // FAVOURITES SETTINGS
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(
    () => localStorage.getItem("showFavoritesOnly") === "true"
  );

  // Context already handles cross-tab sync.

  const [menuOpen, setMenuOpen] = useState(false);
  const toggleMenu = () => setMenuOpen((prev) => !prev);

  return (
    <nav className="bg-(--surface) text-(--text) flex items-center justify-between px-4 md:px-6 py-3 shadow-md transition-colors duration-200 relative">
  <Logo username={user?.username} isLoggedIn={isAuthenticated} />
      <SearchBar />
      <div className="flex items-center space-x-3 md:space-x-4">
        <Friends />
        <Favourites
          isLoggedIn={isAuthenticated}
          showFavoritesOnly={showFavoritesOnly}
          setShowFavoritesOnly={setShowFavoritesOnly}
        />
        <ThemeToggle />

        {isAuthenticated && (
          <div
            onClick={() => navigate("/profile")}
            className="hidden md:flex items-center space-x-2 cursor-pointer"
            title={user ? user.username : "Profile"}
          >
            <img
              src={user && user.pfp_url ? user.pfp_url : "/profile.png"}
              alt="profile"
              className="w-8 h-8 rounded-full"
            />
            <div className="hidden lg:flex flex-col text-left">
              <span className="font-medium text-sm text-[--text]">{user?.username}</span>
            </div>
          </div>
        )}

  <AuthButtons isLoggedIn={isAuthenticated} onLogout={handleLogout} />
        <button
          onClick={toggleMenu}
          className="md:hidden p-2 hover:bg-(--card) rounded-full cursor-pointer"
        >
          {menuOpen ? (
            <X className="cursor-pointer" size={22} />
          ) : (
            <Menu className="cursor-pointer" size={22} />
          )}
        </button>
      </div>
      <MobileMenu
        isAuthenticated={isAuthenticated}
        onLogout={handleLogout}
        onLogin={handleLogin}
        menuOpen={menuOpen}
        showFavoritesOnly={showFavoritesOnly}
        setShowFavoritesOnly={setShowFavoritesOnly}
        user={user}
      />
    </nav>
  );
};

export default Navbar;
