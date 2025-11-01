import { useState } from "react";
import Login from "../components/Login.jsx";
import SignUp from "../components/SignUp.jsx";

export default function Auth() {
  const [activeTab, setActiveTab] = useState("login");

  return (
    <div className="flex justify-center items-center h-screen bg-gray-100">
      <div className="bg-white rounded-2xl shadow-lg w-96 p-6">
        <div className="flex bg-gray-200 rounded-md p-1 mb-6">
          <button
            onClick={() => setActiveTab("login")}
            className={`flex-1 py-2 rounded-md transition-all ${
              activeTab === "login"
                ? "bg-blue-500 text-white shadow"
                : "text-gray-600 hover:text-gray-800"
            }`}
          >
            Login
          </button>

          <button
            onClick={() => setActiveTab("signup")}
            className={`flex-1 py-2 rounded-md transition-all ${
              activeTab === "signup"
                ? "bg-blue-500 text-white shadow"
                : "text-gray-600 hover:text-gray-800"
            }`}
          >
            Sign Up
          </button>
        </div>

        {/* Content Area */}
        <div className="transition-all duration-500 ease-in-out">
          {activeTab === "login" ? <Login /> : <SignUp />}
        </div>
      </div>
    </div>
  );
}
