import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Sparkles, Loader2, ArrowRight, RotateCcw } from "lucide-react";

const games = [
  { 
    name: "Tic Tac Toe", 
    slug: "tic-tac-toe",
    emoji: "⭕",
    tagline: "Classic strategy showdown",
    color: "violet"
  },
  { 
    name: "Memory", 
    slug: "memory",
    emoji: "🎴",
    tagline: "Test your memory skills",
    color: "emerald"
  },
  { 
    name: "Snakes and Ladders", 
    slug: "snakes-and-ladders",
    emoji: "🐍",
    tagline: "Climb to victory",
    color: "amber"
  },
  { 
    name: "Dots and Boxes", 
    slug: "dots-and-boxes",
    emoji: "⬜",
    tagline: "Claim your territory",
    color: "accent"
  },
];

const funMessages = [
  "Analyzing your gaming aura...",
  "Consulting the game gods...",
  "Shuffling the deck of destiny...",
  "Rolling the dice of fate...",
  "Calculating fun quotient...",
  "Scanning your vibe...",
];

export default function GameSuggester() {
  const [isRunning, setIsRunning] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [suggestedGame, setSuggestedGame] = useState(null);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    let interval;
    if (isRunning) {
      interval = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % games.length);
      }, 100);
    }
    return () => clearInterval(interval);
  }, [isRunning]);

  const runTest = () => {
    setIsRunning(true);
    setSuggestedGame(null);
    setMessage(funMessages[Math.floor(Math.random() * funMessages.length)]);

    // Slow down and stop after 2 seconds
    setTimeout(() => {
      setIsRunning(false);
      const randomGame = games[Math.floor(Math.random() * games.length)];
      setSuggestedGame(randomGame);
    }, 2000);
  };

  const playGame = () => {
    if (suggestedGame) {
      navigate(`/games/${suggestedGame.slug}`);
    }
  };

  const getColorClasses = (color) => {
    const colors = {
      violet: "bg-violet-soft text-violet border-violet/30",
      emerald: "bg-emerald-soft text-emerald border-emerald/30",
      amber: "bg-amber-soft text-amber border-amber/30",
      accent: "bg-accent-soft text-accent border-accent/30",
    };
    return colors[color] || colors.accent;
  };

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-surface via-surface to-bg-deep border border-border p-6 sm:p-8">
      {/* Decorative elements */}
      <div className="absolute -top-10 -right-10 w-32 h-32 bg-accent/10 rounded-full blur-3xl" />
      <div className="absolute -bottom-10 -left-10 w-24 h-24 bg-violet/10 rounded-full blur-3xl" />
      
      <div className="relative">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-accent-soft flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-accent" />
          </div>
          <div>
            <h3 className="font-display text-lg font-semibold text-text">Can't Decide?</h3>
            <p className="text-sm text-text-muted">Let us pick for you!</p>
          </div>
        </div>

        {/* Slot Machine Display */}
        <div className="relative h-24 mb-6 rounded-2xl bg-bg-deep border border-border overflow-hidden">
          {!isRunning && !suggestedGame ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <p className="text-text-muted text-sm">Click the button to find your game</p>
            </div>
          ) : isRunning ? (
            <>
              {/* Spinning animation */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="flex items-center gap-4 animate-pulse">
                  <span className="text-5xl animate-bounce" style={{ animationDuration: '0.3s' }}>
                    {games[currentIndex].emoji}
                  </span>
                  <div className="text-left">
                    <p className="font-display text-xl font-semibold text-text animate-pulse">
                      {games[currentIndex].name}
                    </p>
                    <p className="text-sm text-text-muted">{message}</p>
                  </div>
                </div>
              </div>
              {/* Scanning line effect */}
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-accent/10 to-transparent animate-scan" />
            </>
          ) : suggestedGame ? (
            <div className="absolute inset-0 flex items-center justify-center animate-scaleIn">
              <div className="flex items-center gap-4">
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center border ${getColorClasses(suggestedGame.color)}`}>
                  <span className="text-3xl">{suggestedGame.emoji}</span>
                </div>
                <div className="text-left">
                  <p className="font-display text-xl font-semibold text-text">
                    {suggestedGame.name}
                  </p>
                  <p className="text-sm text-text-secondary">{suggestedGame.tagline}</p>
                </div>
              </div>
            </div>
          ) : null}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          {!suggestedGame ? (
            <button
              onClick={runTest}
              disabled={isRunning}
              className="btn-primary flex-1 flex items-center justify-center gap-2 disabled:opacity-70"
            >
              {isRunning ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Finding...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  Suggest a Game
                </>
              )}
            </button>
          ) : (
            <>
              <button
                onClick={runTest}
                className="btn-secondary flex items-center justify-center gap-2 px-4"
              >
                <RotateCcw className="w-4 h-4" />
                <span className="hidden sm:inline">Try Again</span>
              </button>
              <button
                onClick={playGame}
                className="btn-primary flex-1 flex items-center justify-center gap-2"
              >
                Play {suggestedGame.name}
                <ArrowRight className="w-5 h-5" />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
