import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

export default function Login() {
  const [formData, setFormData] = useState({ username: "", password: "" });
  const navigate = useNavigate();


  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleLogin = async (e) => {
    e.preventDefault(); // stop page reload

    try {
      const response = await axios.post(
        "http://localhost:3000/auth/login",
        formData
      );

      console.log("Login Successful:", response.data);

      // ✅ 1. Save token to localStorage
      localStorage.setItem("token", response.data.token);

      // ✅ 2. Optionally save user info (like username)
      localStorage.setItem("user", JSON.stringify(response.data.user));

      // ✅ 3. Redirect to home page
      navigate("/home");
    } catch (error) {
      console.error("Login Error:", error);
      alert(error.response?.data?.message || "Login failed");
    }

    console.log("Login Data:", formData);
  };

  return (
    <form onSubmit={handleLogin} className="flex flex-col">
      <input
        type="text"
        name="username"
        placeholder="Username"
        value={formData.username}
        onChange={handleChange}
        className="w-full mb-3 p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
      />
      <input
        type="password"
        name="password"
        placeholder="Password"
        value={formData.password}
        onChange={handleChange}
        className="w-full mb-4 p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
      />
      <button
        type="submit"
        className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 transition"
      >
        Login
      </button>
    </form>
  );
}
