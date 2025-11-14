import { useState } from "react";
import { Search } from "lucide-react";

export default function SearchBar({
  onChange,
  className = "",
  mobileVisible = false,
}) {
  const [query, setQuery] = useState("");

  const handleInput = (e) => {
    const value = e.target.value;
    setQuery(value);
    onChange?.(value);
  };

  return (
    <div
      className={`${mobileVisible ? "flex md:hidden" : "hidden md:flex"} 
                  items-center bg-(--card) rounded-full 
                  ${mobileVisible ? "px-3 py-1" : "px-4 py-2"} 
                  ${mobileVisible ? "w-full" : "w-[40%]"} 
                  transition-colors duration-200 ${className}`}
    >
      <input
        type="text"
        placeholder="Search"
        value={query}
        onChange={handleInput}
        className="bg-transparent outline-none text-(--text) placeholder-(--muted) w-full text-sm md:text-base"
      />
      {/* <Search className="text-(--muted)" size={mobileVisible ? 16 : 18} /> */}
      <Search
        className="text-(--muted) cursor-pointer"
        size={mobileVisible ? 16 : 18}
      />
    </div>
  );
}
