import { useState } from "react";
import Login from "../components/Login.jsx";
import SignUp from "../components/SignUp.jsx";

export default function Auth() {
  const [activeTab, setActiveTab] = useState("login");
  const [message, setMessage] = useState(null);

  return (
    <div className="min-h-screen bg-bg font-body grain flex items-center justify-center p-6">
      {/* Geometric background */}
      <div className="fixed inset-0 geo-pattern pointer-events-none opacity-60" />
      
      {/* Floating shapes */}
      <div className="fixed top-20 left-[20%] w-32 h-32 rounded-full bg-accent/10 blur-3xl animate-float" />
      <div className="fixed bottom-20 right-[20%] w-40 h-40 rounded-full bg-violet/10 blur-3xl animate-float" style={{ animationDelay: '-2s' }} />
      
      <div className="relative w-full max-w-md animate-hero">
        {/* Logo/Brand */}
        <div className="text-center mb-8">
          <h1 className="font-display text-4xl font-semibold text-text mb-2">
            Miles <span className="text-accent">&</span> Smiles
          </h1>
          <p className="text-text-secondary">
            {activeTab === "login" ? "Welcome back, player!" : "Join the arena"}
          </p>
        </div>

        {/* Card */}
        <div className="card p-8">
          {/* Message toast */}
          {message && (
            <div
              className={`mb-6 px-4 py-3 rounded-xl text-sm font-medium border animate-fadeIn
              ${message.type === "success" ? "bg-emerald-soft text-emerald border-emerald/20" : ""}
              ${message.type === "error" ? "bg-accent-soft text-accent border-accent/20" : ""}
              ${message.type === "info" ? "bg-violet-soft text-violet border-violet/20" : ""}
            `}
            >
              {message.text}
            </div>
          )}

          {/* Tab switcher */}
          <div className="flex bg-bg-deep rounded-xl p-1.5 mb-8">
            <button
              onClick={() => setActiveTab("login")}
              className={`flex-1 py-3 px-4 rounded-lg font-display font-medium text-sm transition-all ${
                activeTab === "login"
                  ? "bg-accent text-white shadow-md shadow-accent/20"
                  : "text-text-muted hover:text-text"
              }`}
            >
              Sign In
            </button>

            <button
              onClick={() => setActiveTab("signup")}
              className={`flex-1 py-3 px-4 rounded-lg font-display font-medium text-sm transition-all ${
                activeTab === "signup"
                  ? "bg-accent text-white shadow-md shadow-accent/20"
                  : "text-text-muted hover:text-text"
              }`}
            >
              Create Account
            </button>
          </div>

          {/* Form */}
          <div className="transition-all duration-300">
            {activeTab === "login" ? (
              <Login onMessage={setMessage} />
            ) : (
              <SignUp onMessage={setMessage} />
            )}
          </div>
        </div>

        {/* Footer link */}
        <p className="text-center mt-6 text-text-muted text-sm">
          {activeTab === "login" ? (
            <>
              New here?{" "}
              <button 
                onClick={() => setActiveTab("signup")}
                className="text-accent hover:underline font-medium"
              >
                Create an account
              </button>
            </>
          ) : (
            <>
              Already have an account?{" "}
              <button 
                onClick={() => setActiveTab("login")}
                className="text-accent hover:underline font-medium"
              >
                Sign in
              </button>
            </>
          )}
        </p>
      </div>
    </div>
  );
}
