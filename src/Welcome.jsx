/*Welcome è la pagina che viene mostrata al primo accesso. Permette all'utente di scegliere
il suo username. Esso verrà salvato sul db e sarà utilizzato per legare un giocatore
alle sue statistiche. Viene mostrata solo ed esclusivamente al primo accesso. Una volta che un dispositivo
e quindi un giocatore hanno registrato il proprio username la pagina Welcome viene saltata ad ogni accesso.
*/


import { useState, useEffect } from 'react';
import './Welcome.css';

export default function Welcome({ changePage, setUsername }) {
  const [loaded, setLoaded] = useState(false);//Controlla se la pagina ha finito di caricarsi
  const [name, setName] = useState('');//Salva quello che l'utente ha scritto nel campo username

  useEffect(() => {
    //Attiva l'animazione d'entrata do 80ms
    const t = setTimeout(() => setLoaded(true), 80);
    return () => clearTimeout(t);
  }, []);
//Funzione che viene chiamata quando l'utente clicca il bottone Entra
function handleEntra() {
  /*Prende il nome digitato e con .trim() rimuove spazi iniziali/finali
   e con .toLowerCase() mette tutto minuscolo(maggiore pulizia del db)*/
  const trimmed = name.trim().toLowerCase();
  if (!trimmed) return;//Se dopo trim la stringa è vuota esce

  /*Registra l'utente sul backend (solo se non esiste già). Manda una richiesta POST al backend per registrare l'utente.
  Col comando JSON.stringify convere l'oggetto JS(trimmed) in una stringa JSON da inviare.*/
  fetch('http://localhost:3001/api/utenti', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: trimmed }),
  })
    //Se il server risponde, salva l'username(trimmed) nel localStorage, aggiorna lo stato e va a home
    .then(() => {
      localStorage.setItem('briscolaUsername', trimmed);
      setUsername(trimmed);
      changePage('home');
    })
    //Stessa funzione di then, si attiva se il server non risponde. L'App funziona lo stesso
    .catch(() => {
      
      localStorage.setItem('briscolaUsername', trimmed);
      setUsername(trimmed);
      changePage('home');
    });
}

  return (
    //Contenitore pagina
    <div className="welcome-root">
      {/*Se loaded è true rende la classe visibile*/}
      <div className={`content ${loaded ? 'visible' : ''}`}>
        {/*Wrappa assieme il sottotitolo in alto, il titolo e la sottolineatura*/}
        <div className="title-wrap">
          <span className="title-subtitle">Benvenuto su</span>
          <h1 className="title">Briscola</h1>
          <div className="title-underline" />
        </div>

        <div className="form-wrap">
          {/*Etichetta dell input. Collega l'inserimento ad username. Cliccandoci su si attiva*/}
          <label className="form-label" htmlFor="username">Scegli il tuo username</label>
          {/*Definisce l'input:
          -8 caratteri 
          -disabilita i suggerimenti
          -onKeyDown: se viene premuto il tasto invio e il campo non è vuoto chiama handleEntra
          -onChange: aggiorna name ad ogni tasto premuto*/}
          <input
            className="form-input"
            id="username"
            type="text"
            maxLength={8}
            placeholder="max 8 caratteri"
            autoComplete="off"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && name.trim() && handleEntra()}
          />
          {/*Bottone disabilitato se il campo è vuoto altrimenti chiama handleEntra
          &nbsp = spazio*/}
          <button
            className="btn-entra"
            disabled={!name.trim()}
            onClick={handleEntra}
          >
            ▶ &nbsp; Entra
          </button>
        </div>
        {/*Riga finale con spazi attorno al pallino*/}
        <p className="tagline">Gioco di carte italiano &nbsp;•&nbsp; Multiplayer</p>

      </div>
    </div>
  );
}