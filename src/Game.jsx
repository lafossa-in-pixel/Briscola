import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Game.css';

// ── Icone SVG dei semi ────────────────────────────────────────────────────────

const SuitIcon = ({ suit, size = 48 }) => {
  const s = suit.toLowerCase();
  if (s === 'spade') return (
    <svg width={size} height={size} viewBox="0 0 40 50" fill="none">
      <polygon points="20,1 15,32 25,32" fill="#4a9edd"/>
      <line x1="20" y1="3" x2="20" y2="30" stroke="#a8d8f8" strokeWidth="1.2" strokeLinecap="round" opacity="0.6"/>
      <rect x="9" y="32" width="22" height="4" rx="2" fill="#4a9edd"/>
      <rect x="17.5" y="36" width="5" height="8" rx="2" fill="#4a9edd"/>
      <ellipse cx="20" cy="46" rx="4.5" ry="3.5" fill="#4a9edd"/>
    </svg>
  );
  if (s === 'coppe') return (
    <svg width={size} height={size} viewBox="0 0 40 44" fill="none">
      <path d="M10 7 Q10 26 20 30 Q30 26 30 7 Z" fill="#d93030"/>
      <path d="M13 9 Q13 24 20 27" stroke="#ff9090" strokeWidth="1.4" strokeLinecap="round" opacity="0.5" fill="none"/>
      <rect x="17.5" y="30" width="5" height="7" rx="1" fill="#d93030"/>
      <rect x="12" y="36" width="16" height="3.5" rx="1.75" fill="#d93030"/>
    </svg>
  );
  if (s === 'denari') return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
      <circle cx="20" cy="20" r="15" fill="#e6b800"/>
      <circle cx="20" cy="20" r="15" fill="none" stroke="#fff176" strokeWidth="1.8" opacity="0.45"/>
      <circle cx="20" cy="20" r="9" fill="none" stroke="#fff8a0" strokeWidth="1.4" opacity="0.55"/>
      <circle cx="20" cy="20" r="3.5" fill="#fff176" opacity="0.6"/>
    </svg>
  );
  if (s === 'bastoni') return (
    <svg width={size * 0.8} height={size} viewBox="0 0 32 44" fill="none">
      <rect x="10" y="37" width="12" height="5" rx="2" fill="#6b3f1e"/>
      <polygon points="12,37 20,37 24,15 8,15" fill="#8B5E3C"/>
      <ellipse cx="16" cy="13" rx="8" ry="12" fill="#a0714f"/>
      <ellipse cx="13" cy="8" rx="3" ry="4" fill="#c49a6c" opacity="0.35"/>
    </svg>
  );
  return null;
};

const SuitIconSmall = ({ suit }) => {
  const s = suit.toLowerCase();
  if (s === 'spade') return (
    <svg width="11" height="13" viewBox="0 0 40 50" fill="none">
      <polygon points="20,1 15,32 25,32" fill="#4a9edd"/>
      <rect x="9" y="32" width="22" height="4" rx="2" fill="#4a9edd"/>
      <rect x="17.5" y="36" width="5" height="8" rx="2" fill="#4a9edd"/>
      <ellipse cx="20" cy="46" rx="4.5" ry="3.5" fill="#4a9edd"/>
    </svg>
  );
  if (s === 'coppe') return (
    <svg width="11" height="13" viewBox="0 0 40 44" fill="none">
      <path d="M10 7 Q10 26 20 30 Q30 26 30 7 Z" fill="#d93030"/>
      <rect x="17.5" y="30" width="5" height="7" rx="1" fill="#d93030"/>
      <rect x="12" y="36" width="16" height="3.5" rx="1.75" fill="#d93030"/>
    </svg>
  );
  if (s === 'denari') return (
    <svg width="13" height="13" viewBox="0 0 40 40" fill="none">
      <circle cx="20" cy="20" r="15" fill="#e6b800"/>
      <circle cx="20" cy="20" r="9" fill="none" stroke="#fff8a0" strokeWidth="2" opacity="0.55"/>
    </svg>
  );
  if (s === 'bastoni') return (
    <svg width="12" height="16" viewBox="0 0 32 44" fill="none">
      <rect x="10" y="37" width="12" height="5" rx="2" fill="#6b3f1e"/>
      <polygon points="12,37 20,37 24,15 8,15" fill="#8B5E3C"/>
      <ellipse cx="16" cy="13" rx="8" ry="12" fill="#a0714f"/>
      <ellipse cx="13" cy="8" rx="3" ry="4" fill="#c49a6c" opacity="0.35"/>
    </svg>
  );
  return null;
};

// ── Label carta ───────────────────────────────────────────────────────────────
const getCardLabel = (val) => {
  if (val === 1)  return 'A';
  if (val === 8)  return 'F';
  if (val === 9)  return 'C';
  if (val === 10) return 'R';
  return String(val);
};

// ── Carta scoperta ─────────────────────────────────────────────────────────────
// Numero in alto-sx e basso-dx | Simbolo piccolo in alto-dx e basso-sx
const CardFace = ({ card, onClick, className = '' }) => {
  if (!card) return null;
  const label = getCardLabel(card.value);
  const s = card.suit.toLowerCase();
  const colors = { spade: '#4a9edd', coppe: '#d93030', denari: '#e6b800', bastoni: '#8B5E3C' };
  const color = colors[s] || '#333';
  return (
    <div className={`Card ${className}`} onClick={onClick}>
      {/* Alto sx — numero */}
      <div style={{ position: 'absolute', top: '5px', left: '6px', fontFamily: 'Cinzel, serif', fontWeight: 700, fontSize: '0.78rem', color, lineHeight: 1, zIndex: 2 }}>
        {label}
      </div>
      {/* Alto dx — simbolo piccolo capovolto */}
      <div style={{ position: 'absolute', top: '5px', right: '4px', transform: 'rotate(180deg)', zIndex: 2 }}>
        <SuitIconSmall suit={card.suit} />
      </div>
      {/* Centro — simbolo grande */}
      <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', display: 'flex', alignItems: 'center', justifyContent: 'center', filter: 'drop-shadow(0 1px 3px rgba(0,0,0,0.12))' }}>
        <SuitIcon suit={card.suit} size={42} />
      </div>
      {/* Basso sx — simbolo piccolo dritto */}
      <div style={{ position: 'absolute', bottom: '5px', left: '4px', zIndex: 2 }}>
        <SuitIconSmall suit={card.suit} />
      </div>
      {/* Basso dx — numero capovolto */}
      <div style={{ position: 'absolute', bottom: '5px', right: '6px', transform: 'rotate(180deg)', fontFamily: 'Cinzel, serif', fontWeight: 700, fontSize: '0.78rem', color, lineHeight: 1, zIndex: 2 }}>
        {label}
      </div>
    </div>
  );
};

// ── Dorso carta con logo UniPR ─────────────────────────────────────────────────
const CardBack = ({ onClick, style, className = '' }) => (
  <div className={`Card back ${className}`} onClick={onClick} style={style}>
    <img src="/logo-unipr.png" className="back-logo" alt="" />
  </div>
);

// ── Aggiorna stats nel localStorage ───────────────────────────────────────────
function updateStats(result) {
  try {
    const defaults = { giocate: 0, vittorie: 0, sconfitte: 0, abbandonate: 0, streak: 0, bestStreak: 0 };
    const saved = localStorage.getItem('briscolaStats');
    const stats = saved ? { ...defaults, ...JSON.parse(saved) } : defaults;
    stats.giocate += 1;
    if (result === 'win') {
      stats.vittorie += 1;
      stats.streak = stats.streak > 0 ? stats.streak + 1 : 1;
      if (stats.streak > stats.bestStreak) stats.bestStreak = stats.streak;
    } else if (result === 'loss') {
      stats.sconfitte += 1;
      stats.streak = stats.streak < 0 ? stats.streak - 1 : -1;
    } else if (result === 'abandon') {
      stats.abbandonate += 1;
      stats.streak = 0;
    }
    localStorage.setItem('briscolaStats', JSON.stringify(stats));
  } catch (e) {
    console.error('Errore salvataggio stats:', e);
  }
}

export default function Game({ connection, role }) {
  const navigate = useNavigate();
  const suits = ['Coppe', 'Spade', 'Denari', 'Bastoni'];
  const values = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  const strengthOrder = [2, 4, 5, 6, 7, 8, 9, 10, 3, 1];

  const [hand1, setHand1] = useState([]);
  const [hand2, setHand2] = useState([]);
  const [pointsDeck1, setPointsDeck1] = useState([]);
  const [pointsDeck2, setPointsDeck2] = useState([]);
  const [table, setTable] = useState([]);
  const [briscola, setBriscola] = useState(null);
  const [deck, setDeck] = useState([]);
  const [turn, setTurn] = useState(1);
  const [gameOverMessage, setGameOverMessage] = useState('');
  const suitBriscola = briscola ? briscola.suit : '';

  // ── Ricezione messaggi PeerJS ──────────────────────────────────────────────
  useEffect(() => {
    if (!connection) return;
    const handleData = (data) => {
      if (data.type === 'GUEST_READY') {
        if (role === 1 && deck.length === 0 && hand1.length === 0) gameStart();
      } else if (data.type === 'START') {
        setDeck(data.deck); setHand1(data.hand1); setHand2(data.hand2);
        setBriscola(data.briscola); setTurn(1);
      } else if (data.type === 'PLAY') {
        const playedCard = data.card;
        setTurn(data.player === 1 ? 2 : 1);
        if (data.player === 1) {
          setHand1(prev => prev.filter(c => c.suit !== playedCard.suit || c.value !== playedCard.value));
        } else {
          setHand2(prev => prev.filter(c => c.suit !== playedCard.suit || c.value !== playedCard.value));
        }
        setTable(prev => [...prev, { ...playedCard, player: data.player }]);
      }
    };
    const handleClose = () => {
      setGameOverMessage(prev => prev || "L'avversario ha abbandonato la partita.");
      updateStats('abandon');
    };
    connection.on('data', handleData);
    connection.on('close', handleClose);
    return () => { connection.off('data', handleData); connection.off('close', handleClose); };
  }, [connection, role, deck.length, hand1.length]);

  // ── Handshake Guest → Host (con intervallo, versione robusta) ─────────────
  useEffect(() => {
    if (!connection) return;
    let interval;
    if (role === 2 && deck.length === 0) {
      interval = setInterval(() => {
        connection.send({ type: 'GUEST_READY' });
      }, 1000);
    }
    return () => { if (interval) clearInterval(interval); };
  }, [connection, role, deck.length]);

  // ── Generazione mazzo ──────────────────────────────────────────────────────
  function generateDeck() {
    let tempDeck = [];
    for (let suit of suits) {
      for (let value of values) {
        let points = 0;
        switch (value) {
          case 1: points = 11; break; case 3: points = 10; break;
          case 10: points = 4; break; case 9: points = 3; break;
          case 8: points = 2; break; default: points = 0; break;
        }
        tempDeck.push({ value, suit, points });
      }
    }
    for (let i = tempDeck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [tempDeck[i], tempDeck[j]] = [tempDeck[j], tempDeck[i]];
    }
    return tempDeck;
  }

  // ── Avvio partita (Host) ───────────────────────────────────────────────────
  function gameStart() {
    if (role !== 1) return;
    const tmpDeck = generateDeck();
    const newHand1 = [tmpDeck.pop(), tmpDeck.pop(), tmpDeck.pop()];
    const newHand2 = [tmpDeck.pop(), tmpDeck.pop(), tmpDeck.pop()];
    const briscolaCard = tmpDeck.pop();
    tmpDeck.unshift(briscolaCard);
    setHand1(newHand1); setHand2(newHand2);
    setBriscola(briscolaCard); setDeck(tmpDeck); setTurn(1);
    connection.send({ type: 'START', hand1: newHand1, hand2: newHand2, briscola: briscolaCard, deck: tmpDeck });
  }

  // ── Giocata del giocatore locale ───────────────────────────────────────────
  function handleMyPlay(cardSelected) {
    if (table.length >= 2 || role !== turn) return;
    connection.send({ type: 'PLAY', player: role, card: cardSelected });
    setTurn(role === 1 ? 2 : 1);
    if (role === 1) {
      setHand1(hand1.filter(c => c.suit !== cardSelected.suit || c.value !== cardSelected.value));
      setTable([...table, { ...cardSelected, player: 1 }]);
    } else {
      setHand2(hand2.filter(c => c.suit !== cardSelected.suit || c.value !== cardSelected.value));
      setTable([...table, { ...cardSelected, player: 2 }]);
    }
  }

  // ── Risoluzione mano (con delay 2s del tuo amico) ──────────────────────────
  useEffect(() => {
    if (table.length !== 2) return;
    const timer = setTimeout(() => {
      const card1 = table[0]; const card2 = table[1];
      let cardW;
      if (card1.suit === suitBriscola) {
        cardW = (card2.suit === suitBriscola && strengthOrder.indexOf(card2.value) > strengthOrder.indexOf(card1.value)) ? card2 : card1;
      } else {
        if (card2.suit === suitBriscola) cardW = card2;
        else if (card1.suit !== card2.suit) cardW = card1;
        else cardW = strengthOrder.indexOf(card1.value) > strengthOrder.indexOf(card2.value) ? card1 : card2;
      }
      let winner;
      if (cardW.player === 1) { setPointsDeck1(prev => [...prev, card1, card2]); winner = 1; }
      else                    { setPointsDeck2(prev => [...prev, card1, card2]); winner = 2; }
      setTurn(winner);
      const deckCopy = [...deck];
      if (deckCopy.length > 0) {
        let d1, d2;
        if (winner === 1) { d1 = deckCopy.pop(); d2 = deckCopy.pop(); setHand1(prev => [...prev, d1]); setHand2(prev => [...prev, d2]); }
        else              { d2 = deckCopy.pop(); d1 = deckCopy.pop(); setHand1(prev => [...prev, d1]); setHand2(prev => [...prev, d2]); }
        setDeck(deckCopy);
      }
      setTable([]);
      if (deckCopy.length === 0 && hand1.length === 0 && hand2.length === 0) {
        const p1 = pointsDeck1.reduce((a, c) => a + c.points, 0) + (winner === 1 ? card1.points + card2.points : 0);
        const p2 = pointsDeck2.reduce((a, c) => a + c.points, 0) + (winner === 2 ? card1.points + card2.points : 0);
        let msg;
        if (p1 > p2)      { msg = `Ha vinto il Giocatore 1 con ${p1} punti!`; updateStats(role === 1 ? 'win' : 'loss'); }
        else if (p2 > p1) { msg = `Ha vinto il Giocatore 2 con ${p2} punti!`; updateStats(role === 2 ? 'win' : 'loss'); }
        else              { msg = 'Pareggio! 60 a 60!'; updateStats('loss'); }
        setGameOverMessage(msg);
      }
    }, 2000);
    return () => clearTimeout(timer);
  }, [table, suitBriscola, deck, hand1, hand2, pointsDeck1, pointsDeck2]);

  // ── Viste dal punto di vista del giocatore locale ──────────────────────────
  const myHand    = role === 1 ? hand1 : hand2;
  const oppHand   = role === 1 ? hand2 : hand1;
  const myPoints  = role === 1 ? pointsDeck1 : pointsDeck2;
  const oppPoints = role === 1 ? pointsDeck2 : pointsDeck1;

  function handleExit() {
    if (connection) connection.close();
    navigate('/');
  }

  return (
    <div className="game_table">

      {/* Schermata fine partita */}
      {gameOverMessage && (
        <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.85)', zIndex: 1000, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <h1 style={{ fontSize: 'clamp(2rem, 5vw, 4rem)', color: 'var(--gold-light)', textShadow: '0 4px 10px rgba(0,0,0,0.5)', textAlign: 'center', fontFamily: 'Cinzel Decorative', padding: '0 20px' }}>
            {gameOverMessage}
          </h1>
          <button onClick={handleExit} style={{ marginTop: '40px', padding: '15px 40px', fontSize: '20px', background: 'linear-gradient(135deg, #c9a84c 0%, #f0d080 45%, #c9a84c 100%)', color: '#1a0e00', border: 'none', borderRadius: '50px', cursor: 'pointer', fontFamily: 'Cinzel', fontWeight: 'bold', letterSpacing: '0.1em' }}>
            Torna al Menu
          </button>
        </div>
      )}

      {/* Indicatore turno */}
      {briscola && !gameOverMessage && (
        <div style={{ position: 'absolute', top: '20px', right: '20px', padding: '10px 20px', borderRadius: '12px', backgroundColor: 'rgba(0,0,0,0.6)', border: role === turn ? '2px solid #4ade80' : '2px solid #f87171', color: 'white', fontWeight: 'bold', zIndex: 50, fontFamily: 'Cinzel', transition: 'all 0.3s' }}>
          {role === turn ? '🟢 TOCCA A TE' : '🔴 TURNO AVVERSARIO'}
        </div>
      )}

      {/* Mano avversario */}
      <div className="hand opponent_hand">
        {oppHand.map((_, i) => <CardBack key={i} />)}
      </div>

      {/* Centro tavolo */}
      <div className="center_table">
        <div className="deck">
          {briscola && deck.length > 0 && <CardFace card={briscola} className="briscola_card" />}
          {deck.length > 0 && (
            <CardBack className="deck_card" style={{ zIndex: 2 }}>
              <span className="deck-count">{deck.length}</span>
            </CardBack>
          )}
        </div>
        {!briscola && !gameOverMessage && (
          <h2 style={{ color: 'var(--gold-light)', textShadow: '2px 2px 4px black', fontFamily: 'Cinzel' }}>
            {role === 1 ? 'Mescolando le carte...' : "In attesa dell'Host..."}
          </h2>
        )}
        <div className="play_area">
          {table.map((card, i) => <CardFace key={i} card={card} />)}
        </div>
        <div className="points_area">
          <div className="point_pile opponent_points">
            {oppPoints.length > 0 && (<>
              <CardBack style={{ transform: 'rotate(5deg)' }} />
              <CardBack style={{ transform: 'rotate(-12deg)', top: '2px', left: '5px' }} />
              <CardBack style={{ transform: 'rotate(8deg)', top: '-3px', left: '-4px' }} />
              <span style={{ position: 'absolute', top: '40%', left: '25px', color: 'white', zIndex: 10, fontWeight: 'bold', fontSize: '20px', textShadow: '1px 1px 2px black' }}>{oppPoints.length}</span>
            </>)}
          </div>
          <div className="point_pile player_points">
            {myPoints.length > 0 && (<>
              <CardBack style={{ transform: 'rotate(-6deg)' }} />
              <CardBack style={{ transform: 'rotate(15deg)', top: '4px', left: '-2px' }} />
              <CardBack style={{ transform: 'rotate(-4deg)', top: '-2px', left: '6px' }} />
              <span style={{ position: 'absolute', top: '40%', left: '25px', color: 'white', zIndex: 10, fontWeight: 'bold', fontSize: '20px', textShadow: '1px 1px 2px black' }}>{myPoints.length}</span>
            </>)}
          </div>
        </div>
      </div>

      {/* Mano giocatore locale */}
      <div className="hand player_hand">
        {myHand.map((card, i) => <CardFace key={i} card={card} onClick={() => handleMyPlay(card)} />)}
      </div>

      {/* Bottone esci */}
      <button className="btn-back" onClick={handleExit}>← Home</button>

    </div>
  );
}