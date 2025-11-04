import { useEffect, useState } from "react";
import { Search, Users, Heart, Sun, Moon, Menu, X } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Navbar = () => {
  const navigate = useNavigate();
  const [isDark, setIsDark] = useState(
    () => localStorage.getItem("theme") === "dark"
  );
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      root.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [isDark]);

  const toggleTheme = () => setIsDark((prev) => !prev);
  const toggleMenu = () => setMenuOpen((prev) => !prev);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  return (
    <nav className="bg-(--surface) text-(--text) flex items-center justify-between px-4 md:px-6 py-3 shadow-md transition-colors duration-200 relative">
      <div className="flex items-center space-x-2 md:space-x-3">
        <img src="/logo.png" alt="logo" className="w-8 h-8 rounded" />
        <h1 className="font-semibold text-lg">Miles & Smiles</h1>
      </div>

      <div className="hidden md:flex items-center bg-(--card) rounded-full px-4 py-2 w-[40%] transition-colors duration-200">
        <input
          type="text"
          placeholder="Search"
          className="bg-transparent outline-none text-(--text) placeholder-(--muted) w-full"
        />
        <Search className="text-(--muted)" size={18} />
      </div>

      <div className="flex items-center space-x-3 md:space-x-4">
        <div className="hidden md:flex items-center space-x-4">
          <button className="p-2 hover:bg-(--card) rounded-full">
            <Users className="text-(--muted)" size={20} />
          </button>
          <button className="p-2 hover:bg-(--card) rounded-full">
            <Heart className="text-(--muted)" size={20} />
          </button>
        </div>

        <button
          onClick={toggleTheme}
          className="p-2 hover:bg-(--card) rounded-full"
        >
          {isDark ? (
            <Sun className="text-yellow-400" size={20} />
          ) : (
            <Moon className="text-(--muted)" size={20} />
          )}
        </button>

        <img
          src="/profile.png"
          alt="profile"
          className="w-8 h-8 rounded-full border-2 border-blue-400 hidden sm:block"
        />

        <button
          onClick={handleLogout}
          className="hidden md:block bg-red-500 hover:bg-red-600 text-white font-semibold px-4 py-2 rounded-md"
        >
          Logout
        </button>

        <button
          onClick={toggleMenu}
          className="md:hidden p-2 hover:bg-(--card) rounded-full"
        >
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {menuOpen && (
        <div className="absolute top-full left-0 w-full bg-(--surface) border-t border-(--muted) flex flex-col items-center space-y-3 py-4 md:hidden transition-all duration-300">
          <div className="flex items-center bg-(--card) rounded-full px-4 py-2 w-[90%]">
            <input
              type="text"
              placeholder="Search"
              className="bg-transparent outline-none text-(--text) placeholder-(--muted) w-full"
            />
            <Search className="text-(--muted)" size={18} />
          </div>

          <div className="flex space-x-4">
            <button className="p-2 hover:bg-(--card) rounded-full">
              <Users className="text-(--muted)" size={20} />
            </button>
            <button className="p-2 hover:bg-(--card) rounded-full">
              <Heart className="text-(--muted)" size={20} />
            </button>
          </div>

          <button
            onClick={handleLogout}
            className="bg-red-500 hover:bg-red-600 text-white font-semibold px-5 py-2 rounded-md"
          >
            Logout
          </button>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
