import { Users } from "lucide-react";

export default function Friends({ mobileVisible = false }) {
  const visibility = mobileVisible ? "flex md:hidden" : "hidden md:flex";
  const iconSize = mobileVisible ? 18 : 20;

  return (
    <div className={`${visibility} items-center space-x-4`}>
      <button className="p-2 hover:bg-(--card) rounded-full cursor-pointer">
        <Users className="text-(--muted) cursor-pointer" size={iconSize} />
      </button>
    </div>
  );
}
