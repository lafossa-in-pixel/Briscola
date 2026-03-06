import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Stats.css';

// ── Legge le stats dal localStorage ──────────────────────────────────────────
function loadStats() {
  const defaults = {
    giocate: 0,
    vittorie: 0,
    sconfitte: 0,
    abbandonate: 0,
    streak: 0,        // serie attuale (positivo = vittorie, negativo = sconfitte)
    bestStreak: 0,    // migliore serie di vittorie di sempre
  };
  try {
    const saved = localStorage.getItem('briscolaStats');
    return saved ? { ...defaults, ...JSON.parse(saved) } : defaults;
  } catch {
    return defaults;
  }
}

// ── Singolo box statistica ────────────────────────────────────────────────────
const StatBox = ({ label, value, highlight }) => (
  <div className={`stat-box ${highlight ? 'stat-box--highlight' : ''}`}>
    <span className="stat-value">{value}</span>
    <span className="stat-label">{label}</span>
  </div>
);

// ── Componente principale ─────────────────────────────────────────────────────
export default function Stats() {
  const navigate = useNavigate();
  const [loaded, setLoaded] = useState(false);
  const [stats, setStats] = useState(loadStats);
  const [confirmReset, setConfirmReset] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setLoaded(true), 80);
    return () => clearTimeout(t);
  }, []);

  // Percentuale vittorie
  const winRate = stats.giocate > 0
    ? Math.round((stats.vittorie / stats.giocate) * 100)
    : 0;

  // Etichetta streak
  const streakLabel = stats.streak > 0
    ? `🔥 ${stats.streak} vittorie di fila`
    : stats.streak < 0
    ? `❄️ ${Math.abs(stats.streak)} sconfitte di fila`
    : '—';

  // Reset stats
  function handleReset() {
    if (!confirmReset) {
      setConfirmReset(true);
      setTimeout(() => setConfirmReset(false), 3000); // annulla dopo 3s
      return;
    }
    const fresh = { giocate: 0, vittorie: 0, sconfitte: 0, abbandonate: 0, streak: 0, bestStreak: 0 };
    localStorage.setItem('briscolaStats', JSON.stringify(fresh));
    setStats(fresh);
    setConfirmReset(false);
  }

  return (
    <div className="stats-root">

      {/* Bottone ← Home in alto a sinistra */}
      <button className="btn-back" onClick={() => navigate('/')}>
        ← Home
      </button>

      <div className={`stats-content ${loaded ? 'visible' : ''}`}>

        {/* Titolo */}
        <div className="stats-title-wrap">
          <h1 className="stats-title">Statistiche</h1>
          <div className="stats-underline" />
        </div>

        {/* Griglia: riga da 3 + riga da 2 */}
        <div className="stats-grid">
          <StatBox label="Partite giocate" value={stats.giocate} />
          <StatBox label="Vittorie"         value={stats.vittorie}   highlight />
          <StatBox label="Sconfitte"        value={stats.sconfitte} />
          <StatBox label="Abbandonate"      value={stats.abbandonate} />
          <StatBox label={`Serie attuale`}  value={streakLabel} />
        </div>

        {/* Win rate in evidenza */}
        <div className="winrate-wrap">
          <span className="winrate-number">{winRate}%</span>
          <span className="winrate-label">Win Rate</span>
          {stats.bestStreak > 0 && (
            <span className="best-streak">Miglior serie: {stats.bestStreak} vittorie</span>
          )}
        </div>

      </div>

      {/* Bottone reset in basso a destra */}
      <button
        className={`btn-reset ${confirmReset ? 'btn-reset--confirm' : ''}`}
        onClick={handleReset}
      >
        {confirmReset ? 'Sicuro? Clicca ancora' : '↺ Reset stats'}
      </button>

    </div>
  );
}