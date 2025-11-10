import { Search } from "lucide-react";

export default function SearchBar({ className = "", mobileVisible = false }) {
  const visibility = mobileVisible ? "flex md:hidden" : "hidden md:flex";
  const padding = mobileVisible ? "px-3 py-1" : "px-4 py-2";
  const width = mobileVisible ? "w-full" : "w-[40%]";

  return (
    <div
      className={`${visibility} items-center bg-(--card) rounded-full ${padding} ${width} transition-colors duration-200 ${className}`}
    >
      <input
        type="text"
        placeholder="Search"
        className="bg-transparent outline-none text-(--text) placeholder-(--muted) w-full text-sm md:text-base"
      />
      <Search className="text-(--muted) cursor-pointer" size={mobileVisible ? 16 : 18} />
    </div>
  );
}
