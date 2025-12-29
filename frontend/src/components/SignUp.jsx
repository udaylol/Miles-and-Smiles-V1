import axiosClient from "../axiosClient.js";
import { useState } from "react";

export default function SignUp({ onMessage }) {
  const [userData, setUserData] = useState({ username: "", password: "" });

  const handleChange = (e) =>
    setUserData({ ...userData, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    onMessage && onMessage({ text: "Signing up...", type: "info" });
    axiosClient
      .post(`/api/auth/signup`, userData)
      .then((response) => {
        console.log("Sign Up Successful:", response.data);
        onMessage &&
          onMessage({
            text: "Sign up successful! You can now log in.",
            type: "success",
          });
      })
      .catch((error) => {
        console.error("Sign Up Error:", error);
        onMessage &&
          onMessage({
            text: error.response?.data?.message || "Sign up failed",
            type: "error",
          });
      });
    console.log("Sign Up Data:", userData);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <div className="group">
        <label className="block text-sm font-medium text-text-secondary mb-2 group-focus-within:text-accent transition-colors">
          Username
        </label>
        <input
          type="text"
          name="username"
          placeholder="Choose a username"
          value={userData.username}
          onChange={handleChange}
          className="input"
        />
      </div>
      <div className="group">
        <label className="block text-sm font-medium text-text-secondary mb-2 group-focus-within:text-accent transition-colors">
          Password
        </label>
        <input
          type="password"
          name="password"
          placeholder="Create a password"
          value={userData.password}
          onChange={handleChange}
          className="input"
        />
      </div>
      <button
        type="submit"
        className="btn-primary w-full mt-3"
      >
        Create Account
      </button>
    </form>
  );
}
