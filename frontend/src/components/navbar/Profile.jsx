import { useNavigate } from "react-router-dom";

export default function Profile({ user, mobileVisible = false }) {
  const navigate = useNavigate();
  if (!user) return null;

  const visibility = mobileVisible ? "flex md:hidden" : "hidden md:flex";
  const imageSize = mobileVisible ? "w-8 h-8" : "w-8 h-8";
  const textVisible = mobileVisible ? "flex" : "hidden lg:flex";

  return (
    <div
      onClick={() => navigate("/profile")}
      className={`${visibility} items-center space-x-2 cursor-pointer`}
      title={user.username || "Guest"}
    >
      <img
        src={user.pfp_url || "/guestpfp.png"}
        alt={user.username || "profile"}
        className={`${imageSize} rounded-full`}
      />
      <div className={`${textVisible} flex-col text-left`}>
        <span className="font-medium text-sm text-[--text]">
          {user.username}
        </span>
      </div>
    </div>
  );
}
