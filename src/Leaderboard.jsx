/*Leaderboard è la pagina che mostra la classifica dei migliori giocatori.
Al caricamento recupera i dati dal backend e mostra i top 5 giocatori ordinati per vittorie.
Il giocatore loggato viene evidenziato nella tabella con una riga speciale e la scritta (tu).
*/

import { useEffect, useState } from 'react';
import './Leaderboard.css';

//Medaglie per i primi tre posti, prese da emojiterra.com
const medals = ['🥇', '🥈', '🥉'];

export default function Leaderboard({ changePage, username }) {
  const [loaded, setLoaded]         = useState(false);//Verifica se la pagina ha finito di caricarsi
  const [classifica, setClassifica] = useState([]);//Dati della classifica ricevuti dal backend
  const [error, setError]           = useState(false);

  useEffect(() => {
    //GET /api/classifica — recupera i top 5 giocatori dal backend
    fetch('https://briscola-production.up.railway.app/api/classifica')
      .then(res => res.json())//Converte la risposta HTTP in oggetto JS
      .then(data => {
        setClassifica(data);
        //Attiva l'animazione d'entrata solo dopo aver ricevuto i dati
        setTimeout(() => setLoaded(true), 80);
      })
      .catch(() => { setError(true); setLoaded(true); });
  }, []);

  return (
    //Contenitore pagina
    <div className="lb-root">
      <button className="btn-back" onClick={() => changePage('home')}>← Home</button>
      {/*Se loaded è true rende il contenuto visibile*/}
      <div className={`lb-content ${loaded ? 'visible' : ''}`}>
        {/*Wrappa assieme il titolo e la sottolineatura*/}
        <div className="lb-title-wrap">
          <h1 className="lb-title">Classifica</h1>
          <div className="lb-underline" />
        </div>
        {/*Tre scenari possibili: errore server(la classifica non si carica), classifica vuota, classifica si carica coi dati*/}
        {error ? (
          <p className="lb-error">Impossibile caricare la classifica.</p>
        ) : classifica.length === 0 ? (
          <p className="lb-error">Nessun giocatore ancora.</p>
        ) : (
          <table className="lb-table">
            <thead>
              <tr>
                {/*Legenda della classifica come header*/}
                <th>#</th><th>Giocatore</th><th>Giocate</th><th>Vinte</th>
              </tr>
            </thead>
            <tbody>
              {/*Ciclo che itera sulla classifica e crea una riga per ogni giocatore*/}
              {classifica.map((player, i) => (
                <tr key={player.username} className={player.username === username ? 'lb-row--me' : ''}>{/*Se il giocatore è quello loggato chiama lb-row--me per evidenziarlo*/}
                  {/*Per le prime tre posizioni metta la medaglia a inizio riga, per gli altri 2 i numeri*/}
                  <td className="lb-rank">{i < 3 ? medals[i] : i + 1}</td>
                  <td className="lb-name">
                    {player.username}
                    {/*Mostra (tu) solo accanto al giocatore corrente*/}
                    {player.username === username && <span className="lb-you"> (tu)</span>}
                  </td>
                  <td>{player.giocate}</td>
                  <td className="lb-wins">{player.vittorie}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}