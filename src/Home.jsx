import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import './Home.css';

// ── Icone SVG dei semi italiani 

const SuitIcon = ({ suit, size = 48 }) => {
if (suit === 'spade') return (
  <svg width={size} height={size} viewBox="0 0 40 50" fill="none">
    <polygon points="20,1 15,32 25,32" fill="#4a9edd"/>
    <line x1="20" y1="3" x2="20" y2="30" stroke="#a8d8f8" strokeWidth="1.2" strokeLinecap="round" opacity="0.6"/>
    <rect x="9" y="32" width="22" height="4" rx="2" fill="#4a9edd"/>
    <rect x="17.5" y="36" width="5" height="8" rx="2" fill="#4a9edd"/>
    <ellipse cx="20" cy="46" rx="4.5" ry="3.5" fill="#4a9edd"/>
  </svg>
);
  if (suit === "coppe") return (
    <svg width={size} height={size} viewBox="0 0 40 44" fill="none">
      <path d="M10 7 Q10 26 20 30 Q30 26 30 7 Z" fill="#d93030"/>
      <path d="M13 9 Q13 24 20 27" stroke="#ff9090" strokeWidth="1.4" strokeLinecap="round" opacity="0.5" fill="none"/>
      <rect x="17.5" y="30" width="5" height="7" rx="1" fill="#d93030"/>
      <rect x="12" y="36" width="16" height="3.5" rx="1.75" fill="#d93030"/>
    </svg>
  );
  if (suit === "denari") return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
      <circle cx="20" cy="20" r="15" fill="#e6b800"/>
      <circle cx="20" cy="20" r="9" fill="none" stroke="#fff8a0" strokeWidth="1.8" opacity="0.55"/>
      <circle cx="20" cy="20" r="3.5" fill="#fff176" opacity="0.6"/>
    </svg>
  );
  if (suit === 'bastoni') return (
  <svg width={size * 0.8} height={size} viewBox="0 0 32 44" fill="none">
    <rect x="10" y="37" width="12" height="5" rx="2" fill="#6b3f1e"/>
    <polygon points="12,37 20,37 24,15 8,15" fill="#8B5E3C"/>
    <ellipse cx="16" cy="13" rx="8" ry="12" fill="#a0714f"/>
    <ellipse cx="13" cy="8" rx="3" ry="4" fill="#c49a6c" opacity="0.35"/>
  </svg>
  );
  
  return null;
};

// Versione piccola per gli angoli della carta
const SuitIconSmall = ({ suit }) => {
if (suit === 'spade') return (
  <svg width="11" height="13" viewBox="0 0 40 50" fill="none">
    <polygon points="20,1 15,32 25,32" fill="#4a9edd"/>
    <line x1="20" y1="3" x2="20" y2="30" stroke="#a8d8f8" strokeWidth="1.2" strokeLinecap="round" opacity="0.6"/>
    <rect x="9" y="32" width="22" height="4" rx="2" fill="#4a9edd"/>
    <rect x="17.5" y="36" width="5" height="8" rx="2" fill="#4a9edd"/>
    <ellipse cx="20" cy="46" rx="4.5" ry="3.5" fill="#4a9edd"/>
  </svg>
);
  if (suit === "coppe") return (
    <svg width="14" height="16" viewBox="0 0 40 44" fill="none">
      <path d="M10 7 Q10 26 20 30 Q30 26 30 7 Z" fill="#d93030"/>
      <rect x="17.5" y="30" width="5" height="7" rx="1" fill="#d93030"/>
      <rect x="12" y="36" width="16" height="3.5" rx="1.75" fill="#d93030"/>
    </svg>
  );
  if (suit === "denari") return (
    <svg width="15" height="15" viewBox="0 0 40 40" fill="none">
      <circle cx="20" cy="20" r="15" fill="#e6b800"/>
      <circle cx="20" cy="20" r="9" fill="none" stroke="#fff8a0" strokeWidth="2" opacity="0.55"/>
    </svg>
  );
if (suit === "bastoni") return (
  <svg width="12" height="16" viewBox="0 0 32 44" fill="none">
    <rect x="10" y="37" width="12" height="5" rx="2" fill="#6b3f1e"/>
    <polygon points="12,37 20,37 24,15 8,15" fill="#8B5E3C"/>
    <ellipse cx="16" cy="13" rx="8" ry="12" fill="#a0714f"/>
    <ellipse cx="13" cy="8" rx="3" ry="4" fill="#c49a6c" opacity="0.35"/>
  </svg>
);
  return null;
};

// ── Singola carta ─────────────────────────────────────────────────────────────

const cardColors = { spade: "#4a9edd", coppe: "#d93030", denari: "#e6b800", bastoni: "#8B5E3C" };

const AceCard = ({ suit, delay }) => {
  const color = cardColors[suit];
  return (
    <div className="ace-card" style={{ animationDelay: `${delay}s`, "--card-color": color }}>
      <div className="ace-inner">
        {/* Simbolo in alto a sinistra */}
        <div className="corner-top">
          <SuitIconSmall suit={suit} />
        </div>
        {/* Simbolo grande al centro */}
        <div className="ace-center">
          <SuitIcon suit={suit} size={52} />
        </div>
        {/* Simbolo in basso a destra (ruotato) */}
        <div className="corner-bottom">
          <SuitIconSmall suit={suit} />
        </div>
      </div>
      {/* Riflesso lucido sulla carta */}
      <div className="ace-shine" />
    </div>
  );
};

// ── Icona gamepad per il bottone Play ─────────────────────────────────────────

const GamepadIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
       strokeLinecap="round" strokeLinejoin="round" width="21" height="21">
    <rect x="2" y="6" width="20" height="12" rx="4"/>
    <path d="M6 10h4M8 8v4"/>
    <circle cx="15" cy="10" r="1" fill="currentColor" stroke="none"/>
    <circle cx="18" cy="12" r="1" fill="currentColor" stroke="none"/>
  </svg>
);

// ── Icona statistiche per il bottone Stats ────────────────────────────────────

const StatsIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"
       strokeLinecap="round" strokeLinejoin="round" width="21" height="21">
    <line x1="18" y1="20" x2="18" y2="10"/>
    <line x1="12" y1="20" x2="12" y2="4"/>
    <line x1="6" y1="20" x2="6" y2="14"/>
  </svg>
);

// ── Componente principale Home ────────────────────────────────────────────────

export default function Home() {
  const navigate = useNavigate();

  // Stato per attivare l'animazione di entrata dopo il montaggio del componente
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setLoaded(true), 80);
    return () => clearTimeout(t);
  }, []);

  return (
    <>
      <div className="home-root">
        <div className={`content ${loaded ? "visible" : ""}`}>

          {/* Titolo con sottotitolo e linea decorativa */}
          <div className="title-wrap">
            <span className="title-subtitle">Gioco di carte italiano</span>
            <h1 className="title">Briscola</h1>
            
          </div>

          {/* Le quattro carte a ventaglio */}
          <div className="aces-row">
            <AceCard suit="spade"   delay={0.05} />
            <AceCard suit="coppe"   delay={0.15} />
            <AceCard suit="denari"  delay={0.25} />
            <AceCard suit="bastoni" delay={0.35} />
          </div>

          {/* Bottoni di navigazione */}
          <div className="buttons-row">
            <button className="btn btn-play" onClick={() => navigate("/lobby")}>
              <span className="btn-icon"><GamepadIcon /></span>
              Play
            </button>
            <button className="btn btn-stats" onClick={() => navigate("/stats")}>
              <span className="btn-icon"><StatsIcon /></span>
              Stats
            </button>
          </div>

          {/* Tagline */}
          <p className="tagline">Multiplayer Online</p>
        </div>
      </div>
    </>
  );
}