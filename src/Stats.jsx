/*Stats è la pagina che mostra le statistiche di gioco del giocatore loggato.
Al caricamento recupera i dati dal backend e li mostra in una serie di box.
Offre anche la possibilità di azzerare le statistiche tramite apposito bottone,
protetta da doppia conferma*/

import { useEffect, useState } from 'react';
import './Stats.css';

//Valori di default usati se il server non risponde o come stato iniziale
const DEFAULT_STATS = {
  giocate: 0,
  vittorie: 0,
  sconfitte: 0,
  abbandonate: 0,
  streak: 0,
  bestStreak: 0,
};

/*Componente riutilizzabile volendo per ogni box della pagina statistiche.
Se highlight è true viene aggiunta la classe stat-box--highlight per evidenziarlo(utilizzato nel box vittorie)*/
const StatBox = ({ label, value, highlight }) => (
  <div className={`stat-box ${highlight ? 'stat-box--highlight' : ''}`}>
    <span className="stat-value">{value}</span>
    <span className="stat-label">{label}</span>
  </div>
);

export default function Stats({ changePage, username }) {
  const [loaded, setLoaded]           = useState(false);        //Controlla se la pagina ha finito di caricarsi
  const [stats, setStats]             = useState(DEFAULT_STATS);//Statistiche del giocatore
  const [confirmReset, setConfirmReset] = useState(false);      //Controlla lo stato del doppio click su reset

  useEffect(() => {
    //GET /api/stats/:username — recupera le statistiche del giocatore dal backend
    fetch(`https://briscola-production.up.railway.app/api/stats/${username}`)
      .then((res) => res.json()) //Converte la risposta HTTP in oggetto JS
      .then((data) => {
        /*Unisce i dati ricevuti con i DEFAULT_STATS: se manca qualche campo
        nel db viene rimpiazzato dal valore di default invece di essere lasciato undefined*/
        setStats({ ...DEFAULT_STATS, ...data });
        //Attiva l'animazione d'entrata solo dopo aver ricevuto i dati
        const t = setTimeout(() => setLoaded(true), 80);
        return () => clearTimeout(t);
      })
      .catch(() => {
        //In caso di errore di rete mostra i valori di default ed entra comunque
        setLoaded(true);
      });
  }, [username]);

  /*Calcola il win rate in percentuale. Se non ci sono partite giocate restituisce 0
  per evitare errori matematici*/
  const winRate = stats.giocate > 0
    ? Math.round((stats.vittorie / stats.giocate) * 100)
    : 0;

  /*Gestisce il valore della serie attuale:
  se è positivo mostra il numero di  vittorie di fila con 🔥
  se è negativo mostra il numero di sconfitte di fila con ❄️
  se è zero mostra il -, nessuna serie attiva
  emoji prese da emojiterra.com*/
  const streakValue = stats.streak > 0
    ? `🔥 ${stats.streak}`
    : stats.streak < 0
    ? `❄️ ${Math.abs(stats.streak)}`
    : '—';

  //Etichetta della serie che cambia in base al segno dello streak
  const streakLabel = stats.streak > 0
    ? 'Vittorie di fila'
    : stats.streak < 0
    ? 'Sconfitte di fila'
    : 'Serie attuale';

  //Funzione chiamata quando l'utente clicca Reset stats
  function handleReset() {
    /*Primo click: attiva la modalità conferma e la disattiva automaticamente dopo 3 secondi
    Secondo click (entro 3s): azzera le statistiche*/
    if (!confirmReset) {
      setConfirmReset(true);
      setTimeout(() => setConfirmReset(false), 3000);
      return;
    }
    /*Aggiorna le statistiche del giocatore a quelle di default. Manda una richiesta POST al backend per aggiornare le statistiche utente.
    Col comando JSON.stringify convere l'oggetto JS in una stringa JSON da inviare.*/    
    fetch(`https://briscola-production.up.railway.app/api/stats/${username}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(DEFAULT_STATS),
    });
    //Aggiorna lo stato locale senza aspettare la risposta del server
    setStats(DEFAULT_STATS);
    setConfirmReset(false);
  }

  return (
    //Contenitore pagina
    <div className="stats-root">
      <button className="btn-back" onClick={() => changePage('home')}>
        ← Home
      </button>

      {/*Se loaded è true rende il contenuto visibile*/}
      <div className={`stats-content ${loaded ? 'visible' : ''}`}>
        <div className="stats-title-wrap">
          <h1 className="stats-title">Statistiche di {username}</h1>
          <div className="stats-underline" />
        </div>

        {/*Griglia con i box delle statistiche. Vittorie è evidenziata con highlight*/}
        <div className="stats-grid">
          <StatBox label="Partite giocate" value={stats.giocate} />
          <StatBox label="Vittorie"         value={stats.vittorie} highlight />
          <StatBox label="Sconfitte"        value={stats.sconfitte} />
          <StatBox label="Abbandonate"      value={stats.abbandonate} />
          <StatBox label={streakLabel}      value={streakValue} />
        </div>

        <div className="winrate-wrap">
          <span className="winrate-number">{winRate}%</span>
          <span className="winrate-label">Win Rate</span>
          {/*Mostra la miglior serie solo se è maggiore di zero*/}
          {stats.bestStreak > 0 && (
            <span className="best-streak">Miglior serie: {stats.bestStreak} vittorie</span>
          )}
        </div>
      </div>

      {/*Al primo click cambia testo e avanza lo stato CSS, al secondo azzera le stats*/}
      <button
        className={`btn-reset ${confirmReset ? 'btn-reset--confirm' : ''}`}
        onClick={handleReset}
      >
        {confirmReset ? 'Sicuro? Clicca ancora' : '↺ Reset stats'}
      </button>
    </div>
  );
}