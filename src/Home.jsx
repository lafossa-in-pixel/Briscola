/*Home è la pagina principale dell'applicazione. Tutte le altre pagine passano da qui. Viene mostrata come prima pagina
(tranne al primo accesso) e permette l'accesso a tutte le pagine secondarie. Presenta il titolo Briscola in grande, simbolo 
dell'applicazione, 4 carte con i 4 semi diversi stilizzati e un serie di bottoni. Inoltre riporta anche l'username dell utente 
loggato.
*/

import { useEffect, useState } from "react";
import './Home.css';

/*Componente che disegna l'icona SVG del seme della carta in versione grande.
Ogni seme ha la sua forma e il suo colore. Size controlla la dimensione in pixel.
Restituisce null se il seme non è riconosciuto*/
const SuitIcon = ({ suit, size = 48 }) => {
  /*Spade: triangolo verso l'alto(la punta), linea centrale come riflesso,
  rettangolo come base e gambo, ellisse come piedistallo*/
  if (suit === 'spade') return (
    <svg width={size} height={size} viewBox="0 0 40 50" fill="none">
      <polygon points="20,1 15,32 25,32" fill="#4a9edd"/>
      <line x1="20" y1="3" x2="20" y2="30" stroke="#a8d8f8" strokeWidth="1.2" strokeLinecap="round" opacity="0.6"/>
      <rect x="9" y="32" width="22" height="4" rx="2" fill="#4a9edd"/>
      <rect x="17.5" y="36" width="5" height="8" rx="2" fill="#4a9edd"/>
      <ellipse cx="20" cy="46" rx="4.5" ry="3.5" fill="#4a9edd"/>
    </svg>
  );
  /*Coppe: path a forma di calice con curva, gambo rettangolare e base*/
  if (suit === "coppe") return (
    <svg width={size} height={size} viewBox="0 0 40 44" fill="none">
      <path d="M10 7 Q10 26 20 30 Q30 26 30 7 Z" fill="#d93030"/>
      <path d="M13 9 Q13 24 20 27" stroke="#ff9090" strokeWidth="1.4" strokeLinecap="round" opacity="0.5" fill="none"/>
      <rect x="17.5" y="30" width="5" height="7" rx="1" fill="#d93030"/>
      <rect x="12" y="36" width="16" height="3.5" rx="1.75" fill="#d93030"/>
    </svg>
  );
  /*Denari: cerchio esterno pieno, cerchio intermedio come anello e cerchio interno come riflesso centrale*/
  if (suit === "denari") return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
      <circle cx="20" cy="20" r="15" fill="#e6b800"/>
      <circle cx="20" cy="20" r="9" fill="none" stroke="#fff8a0" strokeWidth="1.8" opacity="0.55"/>
      <circle cx="20" cy="20" r="3.5" fill="#fff176" opacity="0.6"/>
    </svg>
  );
  /*Bastoni: base rettangolare, corpo a trapezio, testa ellittica e riflesso in alto a sinistra*/
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

/*Versione ridotta di SuitIcon usata negli angoli della carta (in alto e in basso).
Stesse forme ma dimensioni molto più piccole, rimossi alcuni dettagli*/
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

//Definizione colore per ogni seme, usata per passare il colore come variabile CSS alla carta
const cardColors = { spade: "#4a9edd", coppe: "#d93030", denari: "#e6b800", bastoni: "#8B5E3C" };

/*Componente carta asso. Riceve il seme e un ritardo per l'animazione d'entrata sfalsata.
Il colore del seme viene passato come variabile CSS --card-color così il CSS
può usarla per bordi, ombre e glows*/
const AceCard = ({ suit, delay }) => {
  const color = cardColors[suit];
  return (
    <div className="ace-card" style={{ animationDelay: `${delay}s`, "--card-color": color }}>
      <div className="ace-inner">
        {/*Icona piccola in alto a sinistra*/}
        <div className="corner-top"><SuitIconSmall suit={suit} /></div>
        {/*Icona grande al centro della carta*/}
        <div className="ace-center"><SuitIcon suit={suit} size={52} /></div>
        {/*Icona piccola in basso a destra (capovolta via CSS)*/}
        <div className="corner-bottom"><SuitIconSmall suit={suit} /></div>
      </div>
      {/*Riflesso luminoso sopra la carta*/}
      <div className="ace-shine" />
    </div>
  );
};

//Icone SVG per i bottoni di navigazione

//Utilizzano stroke(linee) per uno stile più minimal

const GamepadIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
       strokeLinecap="round" strokeLinejoin="round" width="21" height="21">
    <rect x="2" y="6" width="20" height="12" rx="4"/>
    <path d="M6 10h4M8 8v4"/>
    <circle cx="15" cy="10" r="1" fill="currentColor" stroke="none"/>
    <circle cx="18" cy="12" r="1" fill="currentColor" stroke="none"/>
  </svg>
);

const StatsIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"
       strokeLinecap="round" strokeLinejoin="round" width="21" height="21">
    <line x1="18" y1="20" x2="18" y2="10"/>
    <line x1="12" y1="20" x2="12" y2="4"/>
    <line x1="6" y1="20" x2="6" y2="14"/>
  </svg>
);

const UserIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
    strokeLinecap="round" strokeLinejoin="round" width="20" height="20">
    <circle cx="12" cy="8" r="4" />
    <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
  </svg>
);

const TrophyIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
       strokeLinecap="round" strokeLinejoin="round" width="20" height="20">
    <path d="M6 9H4a2 2 0 0 1-2-2V5h4"/>
    <path d="M18 9h2a2 2 0 0 0 2-2V5h-4"/>
    <path d="M12 17v4"/>
    <path d="M8 21h8"/>
    <path d="M6 5h12v6a6 6 0 0 1-12 0V5z"/>
  </svg>
);

const InfoIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
       strokeLinecap="round" strokeLinejoin="round" width="20" height="20">
    <circle cx="12" cy="12" r="10"/>
    <line x1="12" y1="16" x2="12" y2="12"/>
    <line x1="12" y1="8" x2="12.01" y2="8"/>
  </svg>
);

export default function Home({ changePage, username }) {
  const [loaded, setLoaded] = useState(false); //Controlla se la pagina ha finito di caricarsi

  useEffect(() => {
    //Attiva l'animazione d'entrata dopo 80ms
    const t = setTimeout(() => setLoaded(true), 80);
    return () => clearTimeout(t);
  }, []);

  return (
    <>
      {/*Contenitore pagina*/}
      <div className="home-root">
        {/*Username in alto a sinistra. Mostra 'Ospite'(non dovrebbe succedere, inserito per non rompere) se non definito*/}
        <div className="home-username">👤 {username || 'Ospite'}</div>

        {/*Bottoni di navigazione agli angoli della pagina*/}
        <button className="home-settings-btn" onClick={() => changePage('settings')}>
          <UserIcon />
          <span className="home-settings-label">Utente</span>
        </button>
        <button className="home-corner-btn home-leaderboard-btn" onClick={() => changePage('leaderboard')}>
          <TrophyIcon /><span>Classifica</span>
        </button>
        <button className="home-corner-btn home-info-btn" onClick={() => changePage('info')}>
          <InfoIcon /><span>Info</span>
        </button>

        {/*Se loaded è true rende il contenuto visibile*/}
        <div className={`content ${loaded ? "visible" : ""}`}>
          <div className="title-wrap">
            <span className="title-subtitle">Gioco di carte italiano</span>
            <h1 className="title">Briscola</h1>
          </div>

          {/*Riga dei quattro assi animati. Il delay sfalsato crea un effetto entrata a cascata*/}
          <div className="aces-row">
            <AceCard suit="spade"   delay={0.05} />
            <AceCard suit="coppe"   delay={0.15} />
            <AceCard suit="denari"  delay={0.25} />
            <AceCard suit="bastoni" delay={0.35} />
          </div>

          {/*Bottoni principali: Play porta alla lobby, Stats alle statistiche*/}
          <div className="buttons-row">
            <button className="btn btn-play" onClick={() => changePage("lobby")}>
              <span className="btn-icon"><GamepadIcon /></span>Play
            </button>
            <button className="btn btn-stats" onClick={() => changePage("stats")}>
              <span className="btn-icon"><StatsIcon /></span>Stats
            </button>
          </div>

          <p className="tagline">Multiplayer Online</p>
        </div>
      </div>
    </>
  );
}