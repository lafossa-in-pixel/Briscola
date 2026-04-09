/*Scheletro dell'applicazioni. Gestisce le pagine e 
le interazioni con l'utente. Detta la logica del flusso.*/

//Tramite import carico tutte le pagine dell'App
import { useState } from 'react';//implementa useState, utilizzato dopo
import Home from './Home';
import Game from './Game';
import Stats from './Stats';
import Lobby from './Lobby';
import Welcome from './Welcome';
import Settings from './Settings';
import Leaderboard from './Leaderboard';
import Info from './Info';


function App() {
  //Salva il nome utente e controlla se non è già salvato,tramite localStorage
  const [username, setUsername] = useState(
    () => localStorage.getItem('briscolaUsername') || null
  );
  //Tiene traccia della pagina attualmente visualizzata
  const [page, setPage] = useState('home');
  //Salva la connessione P2P con l'avversario
  const [connection, setConnection] = useState(null);
  //Utilizzato nel matchmaking, salva il ruolo del giocatore( guest o host)
  const [role, setRole] = useState(null);

  //Funziona da cambio pagina, la passo a tutte le altre componenti pagina cosi possono navigare
  const changePage = (p) => setPage(p);


  /*Se l'utente che sta accedendo è al suo primo accesso (non ha username)
  mostra la pagina Welcome ignorando il resto*/
  if (!username) {
    return <Welcome changePage={changePage} setUsername={setUsername} />;
  }

  //In base al valore di page mostra la pagina corretta attraverso && 
  return (
    <>
      {page === 'home'     && <Home     changePage={changePage} username={username} />}
      {page === 'lobby'    && <Lobby    changePage={changePage} setConnection={setConnection} setRole={setRole} />}
      {page === 'game'     && <Game     changePage={changePage} connection={connection} role={role} username={username} />}
      {page === 'stats'    && <Stats    changePage={changePage} username={username} />}
      {page === 'settings' && <Settings changePage={changePage} username={username} setUsername={setUsername} />}
      {page === 'leaderboard' && <Leaderboard changePage={changePage} username={username} />}
      {page === 'info'        && <Info changePage={changePage} />}
    </>
  );
}

//Rende App importabile in altri file
export default App;