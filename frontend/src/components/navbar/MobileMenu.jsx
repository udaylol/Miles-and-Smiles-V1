import { useNavigate } from "react-router-dom";
import SearchBar from "./SearchBar.jsx";
import Friends from "./Friends.jsx";
import Profile from "./Profile.jsx";
import Favourites from "./Favourites.jsx";
import AuthButtons from "./AuthButtons.jsx";

export default function MobileMenu({
  isAuthenticated,
  onLogout,
  onLogin,
  menuOpen,
  user,
}) {
  if (!menuOpen) return null;

  const navigate = useNavigate();
  const handleProfileClick = () => navigate("/profile");

  return (
    <div className="absolute top-full left-0 w-full flex justify-center z-50 md:hidden">
      {/* compact centered panel */}
      <div className="w-[calc(100%-2rem)] max-w-sm bg-(--surface) border border-(--muted) rounded-lg shadow-lg p-3 flex flex-col items-center space-y-3">
        {/* 🔍 Search bar at the top */}
        <SearchBar mobileVisible />

        {/* 🔘 Action row: profile, friends, favourites, login/logout */}
        <div className="flex w-full justify-between items-center">
          {/* 👤 Profile */}
          {isAuthenticated && user && <Profile user={user} mobileVisible />}

          {/* 👥 Friends */}
          <Friends mobileVisible />

          {/* ❤️ Favourites */}
          <Favourites mobileVisible />

          {/* 🔐 Auth Buttons */}
          <AuthButtons
            isLoggedIn={isAuthenticated}
            onLogout={onLogout}
            onLogin={onLogin}
            mobileVisible
          />
        </div>
      </div>
    </div>
  );
}
