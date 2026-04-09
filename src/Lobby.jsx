/*Lobby è la sala d'attesa prima della partita. Gestisce la connessione peer-to-peer
tra i due giocatori tramite PeerJS. Chi sarà l'host della partita condividerà il proprio PIN a 6 cifre, generato casualmente
con lo sfidante, il quale lo inserirà nell apposito spazio e avvierà la connessione.
Una volta stabilita la connessione entrambi vengono mandati alla pagina di gioco.
*/

import { useState, useEffect, useRef } from 'react';
import Peer from 'peerjs';
import './Home.css';

export default function Lobby({ changePage, setConnection, setRole }) {
  const [peerId, setPeerId]             = useState('');    //PIN della lobby generato da PeerJS
  const [remoteId, setRemoteId]         = useState('');    //PIN inserito dall'utente per connettersi
  const [isConnecting, setIsConnecting] = useState(false); //True mentre la connessione è in corso
  const [debugLog, setDebugLog]         = useState('Inizializzazione...'); //Usato solo internamente, non mostrato
  const peerInstance = useRef(null); //Riferimento all'istanza Peer, persistente tra i render

  useEffect(() => {
    setDebugLog('Avvio connessione...');

    /*Genera un PIN casuale a 6 cifre da usare come ID della lobby.
    Math.random()*900000 garantisce un numero tra 100000 e 999999*/
    const randomCode = Math.floor(100000 + Math.random() * 900000).toString();

    /*Crea l'istanza PeerJS con il PIN come ID.
    Gli iceServers gestiscono la negoziazione della connessione WebRTC:
    - STUN: aiuta i due peer a scoprire il proprio IP pubblico
    - TURN: fa da relay se la connessione diretta è bloccata da firewall o NAT*/
    const peer = new Peer(randomCode, {
      secure: true,
      debug: 2,
      config: {
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:global.stun.twilio.com:3478' },
          { urls: 'stun:stun.relay.metered.ca:80' },
          /*Server TURN di metered.ca come fallback: instrada il traffico
          se la connessione diretta peer-to-peer non è possibile*/
          { urls: 'turn:global.relay.metered.ca:80',                username: '1e45b8e6c819f00ef87e876d', credential: 'hNwApG5Ffu0fSi1v' },
          { urls: 'turn:global.relay.metered.ca:443',               username: '1e45b8e6c819f00ef87e876d', credential: 'hNwApG5Ffu0fSi1v' },
          { urls: 'turn:global.relay.metered.ca:443?transport=tcp', username: '1e45b8e6c819f00ef87e876d', credential: 'hNwApG5Ffu0fSi1v' },
        ]
      }
    });

    //Quando PeerJS è pronto salva il PIN e aggiorna lo stato interno
    peer.on('open', (id) => { setPeerId(id); setDebugLog('Pronto! In attesa di sfidanti...'); });

    /*Quando uno sfidante si connette al nostro PIN:
    aspetta che il canale sia aperto, poi assegna il ruolo 1 (host) e va al gioco*/
    peer.on('connection', (conn) => {
      setDebugLog('Sfidante trovato! Sincronizzazione...');
      conn.on('open', () => {
        setDebugLog('Connesso! Vado al tavolo...');
        setRole(1); setConnection(conn); //Ruolo 1 = host, chi ha creato la lobby
        changePage('game');
      });
      conn.on('error', (err) => setDebugLog('Errore in ingresso: ' + err));
    });

    peer.on('error', (err) => {
      console.error(err);
      setDebugLog('Errore di rete: ' + err.type);
      setIsConnecting(false);
    });

    //Salva l'istanza nel ref per usarla in connectToPeer senza dipendenze nell'useEffect
    peerInstance.current = peer;
  }, []); //[] = eseguito solo al primo render, crea la lobby una volta sola

  //Funzione chiamata quando l'utente vuole connettersi al PIN di un'altra lobby
  const connectToPeer = () => {
    if (!remoteId) { alert('Inserisci un PIN prima di connetterti!'); return; }
    if (!peerInstance.current) return;
    setIsConnecting(true);
    const cleanId = remoteId.trim(); //Rimuove eventuali spazi accidentali
    setDebugLog(`Connessione al PIN ${cleanId}...`);

    //Apre la connessione verso il PIN remoto. reliable=true garantisce l'ordine dei messaggi
    const conn = peerInstance.current.connect(cleanId, { reliable: true, serialization: 'json' });

    /*Quando il canale è aperto assegna il ruolo 2 (guest) e va al gioco*/
    conn.on('open', () => {
      setDebugLog('Entrato! Vado al tavolo...');
      setIsConnecting(false); setRole(2); setConnection(conn); //Ruolo 2 = guest, chi si è connesso
      changePage('game');
    });
    conn.on('error', (err) => { setDebugLog('Errore: ' + err); setIsConnecting(false); });

    /*Timeout di 10 secondi: se dopo 10s isConnecting è ancora true
    la connessione è fallita e mostra un messaggio di errore interno*/
    setTimeout(() => {
      setIsConnecting(prev => {
        if (prev) { setDebugLog('Timeout! Controlla il PIN o la rete.'); return false; }
        return prev;
      });
    }, 10000);
  };

  return (
    //Riusa lo sfondo feltro della Home tramite home-root
    <div className="home-root">
      <div className="content visible" style={{ backgroundColor: 'rgba(13, 59, 26, 0.9)', padding: '40px', borderRadius: '24px', border: '2px solid var(--gold)', color: 'var(--cream)', textAlign: 'center', boxShadow: '0 10px 30px rgba(0,0,0,0.8)' }}>

        <h2 style={{ fontFamily: 'Cinzel Decorative', color: 'var(--gold)', marginBottom: '30px', fontSize: '2.5rem' }}>Sala d'Attesa</h2>

        {/*Sezione host: mostra il PIN generato da condividere con lo sfidante.
        userSelect: all permette di selezionare il PIN con un singolo click*/}
        <div style={{ marginBottom: '40px' }}>
          <p style={{ letterSpacing: '2px', fontSize: '0.9rem', opacity: '0.8' }}>IL TUO PIN PARTITA:</p>
          <h3 style={{ userSelect: 'all', background: 'rgba(0,0,0,0.5)', padding: '15px', borderRadius: '8px', letterSpacing: '5px', marginTop: '10px', border: '1px dashed var(--gold-light)', fontSize: '2rem' }}>
            {peerId || '...'} {/*Mostra ... finché PeerJS non è pronto*/}
          </h3>
          <p style={{ fontSize: '12px', marginTop: '8px', color: 'var(--gold-light)' }}>Dai questo PIN al tuo sfidante!</p>
        </div>

        <hr style={{ borderColor: 'var(--gold)', opacity: '0.3', marginBottom: '30px' }} />

        {/*Sezione guest: input per inserire il PIN della lobby altrui*/}
        <div>
          <p style={{ letterSpacing: '2px', fontSize: '0.9rem', opacity: '0.8' }}>OPPURE INSERISCI IL PIN:</p>
          <input
            type="number" value={remoteId}
            onChange={(e) => setRemoteId(e.target.value)}
            
            placeholder="Es. 123456" disabled={isConnecting} 
            style={{ padding: '12px', fontSize: '20px', borderRadius: '8px', border: 'none', marginTop: '15px', width: '80%', textAlign: 'center', fontFamily: 'monospace', color: 'black', letterSpacing: '3px' }}
          />
          <br />
          {/*Disabilitato durante la connessione, opacità ridotta per feedback visivo*/}
          <button className="btn btn-play" onClick={connectToPeer} disabled={isConnecting}
            style={{ marginTop: '20px', width: '100%', justifyContent: 'center', opacity: isConnecting ? 0.7 : 1 }}>
            {isConnecting ? 'Connessione...' : 'Connettiti'}
          </button>
        </div>

        <button onClick={() => changePage('home')} style={{ marginTop: '30px', background: 'none', border: 'none', color: 'var(--gold-light)', cursor: 'pointer', fontFamily: 'Cinzel', textDecoration: 'underline' }}>
          ← Torna alla Home
        </button>

      </div>
    </div>
  );
}