/*Settings è la pagina che permette all'utente di modificare il proprio "profilo".
Offre due funzionalità: rinominare il proprio username e eliminare l'account.
La rinomina aggiorna il db e il localStorage. L'eliminazione è protetta da una
doppia conferma: il primo click avvisa, il secondo esegue (entro 3 secondi).
*/

import { useState, useEffect } from 'react';
import './Settings.css';

export default function Settings({ changePage, username, setUsername }) {
  const [loaded, setLoaded] = useState(false);
  const [newName, setNewName] = useState(username); //Valore corrente del campo username
  const [confirmDelete, setConfirmDelete] = useState(false); //Controlla lo stato del doppio click su elimina
  const [error, setError] = useState(''); //Messaggio di errore da mostrare sotto l'input

  useEffect(() => {
    //Attiva l'animazione d'entrata dopo 80ms
    const t = setTimeout(() => setLoaded(true), 80);
    return () => clearTimeout(t);
  }, []);

  //Funzione chiamata quando l'utente clicca Salva
  function handleRename() {
    const trimmed = newName.trim().toLowerCase();
    //Se il campo è vuoto o uguale all'username attuale non fa nulla
    if (!trimmed || trimmed === username) return;

 /*Rinomina l'utente nel backend(se effettivamente l'username è cambiato). Manda una richiesta PUT al backend
  per modificare l'username. Col comando JSON.stringify convere l'oggetto JS(trimmed) in una stringa JSON da inviare.*/    
    fetch(`http://localhost:3001/api/utenti/${username}/rename`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ newUsername: trimmed }),
    })
      .then((res) => res.json()) //Converte la risposta HTTP in oggetto JS
      /*Se il server risponde con un errore (es. username già in uso) lo mostra
      altrimenti aggiorna localStorage, lo stato e torna alla home*/
      .then((data) => {
        if (data.error) { setError(data.error); return; }
        localStorage.setItem('briscolaUsername', trimmed);
        setUsername(trimmed);
        changePage('home');
      })
      .catch(() => setError('Errore di connessione al server.'));
  }

  //Funzione chiamata quando l'utente clicca Elimina account
  function handleDelete() {
    /*Primo click: attiva la modalità conferma e la disattiva automaticamente dopo 3 secondi
    Secondo click (entro 3s): esegue l'eliminazione*/
    if (!confirmDelete) {
      setConfirmDelete(true);
      setTimeout(() => setConfirmDelete(false), 3000);
      return;
    }
     /*Elimina l'utente sul backend. Manda una richiesta DELETE al backend per eliminare l'utente.
    Col comando JSON.stringify convere l'oggetto JS(trimmed) in una stringa JSON da inviare.*/
    
    fetch(`http://localhost:3001/api/utenti/${username}`, { method: 'DELETE' })
      //Rimuove l'username dal localStorage e resetta lo stato (torna a Welcome)
      .then(() => {
        localStorage.removeItem('briscolaUsername');
        setUsername(null);
      })
      .catch(() => setError('Errore di connessione al server.'));
  }

  //Il bottone Salva è disabilitato se il nome non è cambiato o è vuoto
  const unchanged = newName.trim() === username || !newName.trim();

  return (
    //Contenitore pagina
    <div className="settings-root">

      <button className="btn-back" onClick={() => changePage('home')}>
        ← Home
      </button>

      {/*Se loaded è true rende il contenuto visibile*/}
      <div className={`settings-content ${loaded ? 'visible' : ''}`}>
        <div className="settings-title-wrap">
          <h1 className="settings-title">Impostazioni</h1>
          <div className="settings-underline" />
        </div>

        <div className="form-wrap">
          <div className="section-block">
            <label className="form-label" htmlFor="newUsername">Cambia username</label>
            {/*onChange resetta anche l'errore ad ogni modifica*/}
            <input
              className="form-input"
              id="newUsername"
              type="text"
              maxLength={8}
              autoComplete="off"
              value={newName}
              onChange={(e) => { setNewName(e.target.value); setError(''); }}
              onKeyDown={(e) => e.key === 'Enter' && !unchanged && handleRename()}
            />
            {/*Mostra il messaggio di errore solo se presente*/}
            {error && <span className="form-error">{error}</span>}
            <button className="btn-save" disabled={unchanged} onClick={handleRename}>
              ✓ &nbsp; Salva
            </button>
          </div>
        </div>
      </div>

      {/*Al primo click cambia lo stato CSS al secondo elimina l'account*/}
      <button
        className={`btn-delete ${confirmDelete ? 'btn-delete--confirm' : ''}`}
        onClick={handleDelete}
      >
        {confirmDelete ? 'Sicuro? Clicca ancora' : '✕  Elimina account'}
      </button>

    </div>
  );
}