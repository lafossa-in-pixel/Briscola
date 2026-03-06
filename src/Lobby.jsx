import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Peer from 'peerjs';
import './Home.css';

export default function Lobby({ setConnection, setRole }) {
  const navigate = useNavigate();
  const [peerId, setPeerId]       = useState('');
  const [remoteId, setRemoteId]   = useState('');
  const [isConnecting, setIsConnecting] = useState(false);
  const [debugLog, setDebugLog]   = useState('Inizializzazione...');
  const peerInstance = useRef(null);

  useEffect(() => {
    setDebugLog('Avvio connessione...');

    // PIN numerico a 6 cifre — più comodo da condividere
    const randomCode = Math.floor(100000 + Math.random() * 900000).toString();

    const peer = new Peer(randomCode, {
      secure: true,
      debug: 2,
      config: {
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:global.stun.twilio.com:3478' },
          { urls: 'stun:stun.relay.metered.ca:80' },
          { urls: 'turn:global.relay.metered.ca:80',             username: '1e45b8e6c819f00ef87e876d', credential: 'hNwApG5Ffu0fSi1v' },
          { urls: 'turn:global.relay.metered.ca:443',            username: '1e45b8e6c819f00ef87e876d', credential: 'hNwApG5Ffu0fSi1v' },
          { urls: 'turn:global.relay.metered.ca:443?transport=tcp', username: '1e45b8e6c819f00ef87e876d', credential: 'hNwApG5Ffu0fSi1v' },
        ]
      }
    });

    peer.on('open', (id) => { setPeerId(id); setDebugLog('Pronto! In attesa di sfidanti...'); });

    // HOST — qualcuno si è connesso a noi
    peer.on('connection', (conn) => {
      setDebugLog('Sfidante trovato! Sincronizzazione...');
      conn.on('open', () => {
        setDebugLog('Connesso! Vado al tavolo...');
        setRole(1); setConnection(conn);
        navigate('/game');
      });
      conn.on('error', (err) => setDebugLog('Errore in ingresso: ' + err));
    });

    peer.on('error', (err) => {
      console.error(err);
      setDebugLog('Errore di rete: ' + err.type);
      setIsConnecting(false);
    });

    peerInstance.current = peer;
    // Nessun destroy() — la connessione deve sopravvivere al cambio pagina
  }, []);

  // GUEST — ci connettiamo all'Host
  const connectToPeer = () => {
    if (!remoteId) { alert('Inserisci un PIN prima di connetterti!'); return; }
    if (!peerInstance.current) return;
    setIsConnecting(true);
    const cleanId = remoteId.trim();
    setDebugLog(`Connessione al PIN ${cleanId}...`);
    const conn = peerInstance.current.connect(cleanId, { reliable: true, serialization: 'json' });
    conn.on('open', () => {
      setDebugLog('Entrato! Vado al tavolo...');
      setIsConnecting(false); setRole(2); setConnection(conn);
      navigate('/game');
    });
    conn.on('error', (err) => { setDebugLog('Errore: ' + err); setIsConnecting(false); });
    setTimeout(() => {
      setIsConnecting(prev => { if (prev) { setDebugLog('Timeout! Controlla il PIN o la rete.'); return false; } return prev; });
    }, 10000);
  };

  return (
    <div className="home-root">
      <div className="content visible" style={{ backgroundColor: 'rgba(13, 59, 26, 0.9)', padding: '40px', borderRadius: '24px', border: '2px solid var(--gold)', color: 'var(--cream)', textAlign: 'center', boxShadow: '0 10px 30px rgba(0,0,0,0.8)' }}>

        <h2 style={{ fontFamily: 'Cinzel Decorative', color: 'var(--gold)', marginBottom: '30px', fontSize: '2.5rem' }}>Sala d'Attesa</h2>

        <div style={{ marginBottom: '40px' }}>
          <p style={{ letterSpacing: '2px', fontSize: '0.9rem', opacity: '0.8' }}>IL TUO PIN PARTITA:</p>
          <h3 style={{ userSelect: 'all', background: 'rgba(0,0,0,0.5)', padding: '15px', borderRadius: '8px', letterSpacing: '5px', marginTop: '10px', border: '1px dashed var(--gold-light)', fontSize: '2rem' }}>
            {peerId || '...'}
          </h3>
          <p style={{ fontSize: '12px', marginTop: '8px', color: 'var(--gold-light)' }}>Dai questo PIN al tuo sfidante!</p>
        </div>

        <hr style={{ borderColor: 'var(--gold)', opacity: '0.3', marginBottom: '30px' }} />

        <div>
          <p style={{ letterSpacing: '2px', fontSize: '0.9rem', opacity: '0.8' }}>OPPURE INSERISCI IL PIN:</p>
          <input
            type="number" value={remoteId}
            onChange={(e) => setRemoteId(e.target.value)}
            placeholder="Es. 123456" disabled={isConnecting}
            style={{ padding: '12px', fontSize: '20px', borderRadius: '8px', border: 'none', marginTop: '15px', width: '80%', textAlign: 'center', fontFamily: 'monospace', color: 'black', letterSpacing: '3px' }}
          />
          <br />
          <button className="btn btn-play" onClick={connectToPeer} disabled={isConnecting}
            style={{ marginTop: '20px', width: '100%', justifyContent: 'center', opacity: isConnecting ? 0.7 : 1 }}>
            {isConnecting ? 'Connessione...' : 'Connettiti'}
          </button>
        </div>

        <button onClick={() => navigate('/')} style={{ marginTop: '30px', background: 'none', border: 'none', color: 'var(--gold-light)', cursor: 'pointer', fontFamily: 'Cinzel', textDecoration: 'underline' }}>
          ← Torna al Menu
        </button>

        <div style={{ marginTop: '30px', padding: '10px', backgroundColor: 'rgba(0,0,0,0.6)', borderRadius: '8px', fontSize: '12px', color: '#4ade80', fontFamily: 'monospace' }}>
          Status: {debugLog}
        </div>

      </div>
    </div>
  );
}