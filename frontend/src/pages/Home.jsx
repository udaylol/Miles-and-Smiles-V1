import GameList from "../components/GameList";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useRef } from "react";

function Home() {
  const gamesRef = useRef(null);

  const scrollToGames = () => {
    gamesRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-bg font-body grain">
      {/* Geometric background pattern */}
      <div className="fixed inset-0 geo-pattern pointer-events-none opacity-60" />
      <div className="fixed inset-0 geo-dots pointer-events-none opacity-30" />
      
      <div className="relative z-10">
        <Navbar />
        
        {/* Hero Section - One orchestrated entrance */}
        <section className="relative py-16 sm:py-24 lg:py-32 overflow-hidden">
          {/* Floating accent shapes */}
          <div className="absolute top-20 left-[10%] w-24 h-24 rounded-full bg-accent/10 blur-2xl animate-float" />
          <div className="absolute bottom-20 right-[15%] w-32 h-32 rounded-full bg-violet/10 blur-2xl animate-float" style={{ animationDelay: '-2s' }} />
          <div className="absolute top-1/2 right-[10%] w-20 h-20 rounded-full bg-emerald/10 blur-2xl animate-float" style={{ animationDelay: '-1s' }} />
          
          <div className="relative max-w-5xl mx-auto px-6 text-center animate-hero">
            {/* Overline tag */}
            <div className="inline-flex items-center gap-2 mb-6">
              <span className="tag tag-accent">
                <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                Play Together
              </span>
            </div>
            
            {/* Main headline - Typography leads */}
            <h1 className="font-display text-5xl sm:text-6xl lg:text-8xl font-semibold tracking-tight text-text mb-6">
              Miles <span className="text-accent">&</span> Smiles
            </h1>
            
            {/* Subheadline */}
            <p className="text-lg sm:text-xl text-text-secondary max-w-2xl mx-auto mb-10 leading-relaxed">
              Real-time multiplayer classics. Challenge friends to strategic battles. 
              No downloads, no waiting—just play.
            </p>
            
            {/* CTA Group */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
              <button 
                onClick={scrollToGames}
                className="btn-primary text-lg px-8 py-4"
              >
                Start Playing
              </button>
              <button 
                onClick={scrollToGames}
                className="btn-secondary text-lg px-8 py-4"
              >
                View Games
              </button>
            </div>
            
            {/* Stats bar - horizontal, confident layout */}
            <div className="inline-flex items-center gap-6 sm:gap-10 p-4 rounded-full bg-surface border border-border shadow-sm">
              <div className="flex items-center gap-3">
                <span className="text-3xl">🎮</span>
                <div className="text-left">
                  <div className="font-display text-2xl font-semibold text-text">4</div>
                  <div className="text-xs text-text-muted uppercase tracking-wider">Games</div>
                </div>
              </div>
              <div className="w-px h-10 bg-border" />
              <div className="flex items-center gap-3">
                <span className="text-3xl">👥</span>
                <div className="text-left">
                  <div className="font-display text-2xl font-semibold text-text">2v2</div>
                  <div className="text-xs text-text-muted uppercase tracking-wider">Battles</div>
                </div>
              </div>
              <div className="w-px h-10 bg-border hidden sm:block" />
              <div className="hidden sm:flex items-center gap-3">
                <span className="text-3xl">⚡</span>
                <div className="text-left">
                  <div className="font-display text-2xl font-semibold text-text">Live</div>
                  <div className="text-xs text-text-muted uppercase tracking-wider">Realtime</div>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* Games Section */}
        <section ref={gamesRef} className="relative pb-20 scroll-mt-20">
          <div className="max-w-7xl mx-auto px-6">
            {/* Section header */}
            <div className="flex items-center gap-4 mb-10">
              <h2 className="font-display text-2xl sm:text-3xl font-semibold text-text">
                Choose Your Battle
              </h2>
              <div className="flex-1 h-px bg-gradient-to-r from-border to-transparent" />
            </div>
            
            <GameList />
          </div>
        </section>
        
        <Footer />
      </div>
    </div>
  );
}

export default Home;
