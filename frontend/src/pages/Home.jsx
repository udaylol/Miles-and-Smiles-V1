import React from "react";
import { useNavigate } from "react-router-dom";

function Home() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  return (
    <div>
      Home Page
      <button onClick={handleLogout}>Logout</button>
    </div>
  );
}

export default Home;
