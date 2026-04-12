/*
Game è la pagina in cui si svolge la vera e propria partita di briscola. Nel programmarla è stata quindi implementata sia la logica del gioco
che la parte grafica riguardante le carte e i loro movimenti.
*/
import { useState, useEffect } from 'react';
import './Game.css';
/*
Definizione del dorso delle carte, dove è presente il logo UNIPR
*/
const CardBack = ({ onClick, style, className = '', showLogo = true, children }) => (
  <div className={`Card back ${className}`} onClick={onClick} style={style}>
    {showLogo && (
      <img
        src="/logo-unipr.png"
        className="back-logo"
        alt=""
        onError={(e) => e.target.style.display = 'none'}
      />
    )}
    {children}
  </div>
);
/*
Definzione dell'aspetto delle carte, con l'aiuto delle immagini contenute in public.
*/
const CardFace = ({ card, onClick, className = '' }) => {
  if (!card) return null;
  const imgName = `${card.suit.toLowerCase()}_${card.value}.jpg`;
  return (
    <div className={`Card ${className}`} onClick={onClick} style={{ padding: 0, border: 'none', background: 'white' }}>
      <img
        src={`/carte/${imgName}`}
        alt={`${card.value} di ${card.suit}`}
        style={{ width: '100%', height: '100%', borderRadius: '8px', objectFit: 'fill' }}
      />
    </div>
  );
};
/*
Funzione che permette di aggiornare le statitiche del giocatore (vinte, perse, abbandonate, serie di fila).
*/
function updateStats(username, result) {
  if (!username) return;
  fetch(`https://briscola-production.up.railway.app/api/stats/${username}`)
    .then(res => res.json())
    .then(stats => {
      const updated = { ...stats };
      updated.giocate += 1;
      if (result === 'win') {
        updated.vittorie += 1;
        updated.streak = updated.streak > 0 ? updated.streak + 1 : 1;
        if (updated.streak > updated.bestStreak) updated.bestStreak = updated.streak;
      } else if (result === 'loss') {
        updated.sconfitte += 1;
        updated.streak = updated.streak < 0 ? updated.streak - 1 : -1;
      } else if (result === 'abandon') {
        updated.abbandonate += 1;
        updated.streak = 0;
      }
      // Manda una richiesta POST al backend per aggiornare le statistiche
      return fetch(`https://briscola-production.up.railway.app/api/stats/${username}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated),
      });
    })
    .catch(err => console.error('Errore aggiornamento stats:', err));
}
/*
Implementazione della logica della briscola.
*/
export default function Game({ changePage, connection, role, username }) {
  // Definizione dei semi, valori e del loro ordine crescente di valore, importante per il regolamento delle prese.
  const suits = ['Coppe', 'Spade', 'Denari', 'Bastoni'];
  const values = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  const strengthOrder = [2, 4, 5, 6, 7, 8, 9, 10, 3, 1];

  // Gestione dello stato della partita: delle carte in mano, gli elementi sul tavolo (ed il tavolo stesso) e lo svolgimento della partita
  const [hand1, setHand1] = useState([]);
  const [hand2, setHand2] = useState([]);
  const [pointsDeck1, setPointsDeck1] = useState([]);
  const [pointsDeck2, setPointsDeck2] = useState([]);
  const [table, setTable] = useState([]);
  const [briscola, setBriscola] = useState(null);
  const [deck, setDeck] = useState([]);
  const [turn, setTurn] = useState(1);
  const [gameOverMessage, setGameOverMessage] = useState('');
  const [oppUsername, setOppUsername] = useState('Avversario');

  // Definizione del seme della briscola, con controllo se essa esista o meno al momento
  const suitBriscola = briscola ? briscola.suit : '';

 
  // Gestione degli eventi di rete (avvio partita, ricezione della carta dell'avversario, sincronizzazione) tramite le connessioni di PeerJS.
  useEffect(() => {
    if (!connection) return;
    const handleData = (data) => {
      if (data.type === 'GUEST_READY') {
        if (role === 1 && !briscola) gameStart();
        if (data.username) setOppUsername(data.username);
      } else if (data.type === 'START') {
        setDeck(data.deck);
        setHand1(data.hand1);
        setHand2(data.hand2);
        setBriscola(data.briscola);
        setTurn(1);
        if (data.username) setOppUsername(data.username);
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
      setGameOverMessage(prev => {
        if(!prev){
          //La partita era ancora in corso, segno abbandono
          updateStats(username, 'abandon');
          return `${oppUsername} ha abbandonato la partita.`;
        }
      return prev;//Partita gia finita
      });
    
    }
    connection.on('data', handleData);
    connection.on('close', handleClose);
    return () => {
      connection.off('data', handleData);
      connection.off('close', handleClose);
    };
  }, [connection, role, briscola, oppUsername]);

  // Invio periodico del segnale "READY" da parte del guest(giocatore 2) all'host, interrotto con la definizione della briscola
  useEffect(() => {
    if (!connection) return;
    let interval;
    if (role === 2 && !briscola) {
      interval = setInterval(() => {
        // MODIFICA 3: invia username nel GUEST_READY
        connection.send({ type: 'GUEST_READY', username });
      }, 1000);
    }
    return () => { if (interval) clearInterval(interval); };
  }, [connection, role, briscola]);

  // Generazione del mazzo, assegnando anche il valore ordinato e mescolando
  function generateDeck() {
    let tempDeck = [];
    for (let suit of suits) {
      for (let value of values) {
        let points = 0;
        switch (value) {
          case 1: points = 11; break;
          case 3: points = 10; break;
          case 10: points = 4; break;
          case 9: points = 3; break;
          case 8: points = 2; break;
          default: points = 0; break;
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

  /*  
  Avvio della partita: distribuzione delle carte della prima mano, definizione della briscola (posizionata in fondo al mazzo)
  e comunicazione del tavolo al guest.
  */
  function gameStart() {
    if (role !== 1) return;
    const tmpDeck = generateDeck();
    const newHand1 = [tmpDeck.pop(), tmpDeck.pop(), tmpDeck.pop()];
    const newHand2 = [tmpDeck.pop(), tmpDeck.pop(), tmpDeck.pop()];
    const briscolaCard = tmpDeck.pop();
    tmpDeck.unshift(briscolaCard);

    setHand1(newHand1);
    setHand2(newHand2);
    setBriscola(briscolaCard);
    setDeck(tmpDeck);
    setTurn(1);

    connection.send({ type: 'START', hand1: newHand1, hand2: newHand2, briscola: briscolaCard, deck: tmpDeck, username });
  }
  // Gestione della giocata del client locale. Verifica del turno, aggiornamento dellae carte e della loro posizione, invio mossa all'avversario
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
  /*
   Confronto dei valori "ordinati" delle carte (e distribuzione di quelle da pescare) dopo ogni turno per gestire
   le prese e conteggio finale del punteggio per stabilire il vincitore della partita.
  */
  useEffect(() => {
    if (table.length !== 2) return;
    const timer = setTimeout(() => {
      const card1 = table[0];
      const card2 = table[1];
      let cardW;

      if (card1.suit === suitBriscola) {
        cardW = (card2.suit === suitBriscola && strengthOrder.indexOf(card2.value) > strengthOrder.indexOf(card1.value)) ? card2 : card1;
      } else {
        if (card2.suit === suitBriscola) cardW = card2;
        else if (card1.suit !== card2.suit) cardW = card1;
        else cardW = strengthOrder.indexOf(card1.value) > strengthOrder.indexOf(card2.value) ? card1 : card2;
      }

      let winner;
      if (cardW.player === 1) {
        setPointsDeck1(prev => [...prev, card1, card2]);
        winner = 1;
      } else {
        setPointsDeck2(prev => [...prev, card1, card2]);
        winner = 2;
      }

      setTurn(winner);

      const deckCopy = [...deck];
      if (deckCopy.length > 0) {
        let d1, d2;
        if (winner === 1) {
          d1 = deckCopy.pop(); d2 = deckCopy.pop();
          setHand1(prev => [...prev, d1]); setHand2(prev => [...prev, d2]);
        } else {
          d2 = deckCopy.pop(); d1 = deckCopy.pop();
          setHand1(prev => [...prev, d1]); setHand2(prev => [...prev, d2]);
        }
        setDeck(deckCopy);
      }

      setTable([]);

      if (deckCopy.length === 0 && hand1.length === 0 && hand2.length === 0) {
        const p1 = pointsDeck1.reduce((a, c) => a + c.points, 0) + (winner === 1 ? card1.points + card2.points : 0);
        const p2 = pointsDeck2.reduce((a, c) => a + c.points, 0) + (winner === 2 ? card1.points + card2.points : 0);
        const nameMe  = username    || 'Giocatore ' + role;
        const nameOpp = oppUsername || 'Giocatore ' + (role === 1 ? 2 : 1);
        const name1   = role === 1 ? nameMe : nameOpp;
        const name2   = role === 2 ? nameMe : nameOpp;

        let msg;
        if (p1 > p2) {
          msg = `Ha vinto ${name1} con ${p1} punti!`; updateStats(username, role === 1 ? 'win' : 'loss');
        } else if (p2 > p1) {
          msg = `Ha vinto ${name2} con ${p2} punti!`; updateStats(username, role === 2 ? 'win' : 'loss');
        } else {
          msg = 'Pareggio! 60 a 60!'; updateStats(username, 'loss');
        }
        setGameOverMessage(msg);
      }
    }, 1500);
    return () => clearTimeout(timer);
  }, [table, suitBriscola, deck, hand1, hand2, pointsDeck1, pointsDeck2]);

  const myHand    = role === 1 ? hand1 : hand2;
  const oppHand   = role === 1 ? hand2 : hand1;
  const myPoints  = role === 1 ? pointsDeck1 : pointsDeck2;
  const oppPoints = role === 1 ? pointsDeck2 : pointsDeck1;

  function handleExit() {
    if (connection){
      connection.close();
      connection.close();
    }
    changePage('home');
  }

  /*
  Interfaccia grafica finale del tavolo, comprensiva di overlay di fine partita, indicatore turni, posizionamento
  degli elementi e area interattiva della mano
  */
  return (
    <div className="game_table">
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
      {/* Emoji prese da emojiterra.com */}
      {briscola && !gameOverMessage && (
        <div
          className="turn-indicator"
          style={{ border: role === turn ? '2px solid #4ade80' : '2px solid #f87171' }}
        >
          {role === turn ? '🟢 TOCCA A TE' : '🔴 TURNO AVVERSARIO'}
        </div>
      )}
      <div className="hand opponent_hand" style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
        {oppHand.map((_, i) => <CardBack key={i} />)}
      </div>
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
              <CardBack className="pile_card" style={{ transform: 'rotate(5deg)' }} showLogo={false} />
              <CardBack className="pile_card" style={{ transform: 'rotate(-12deg)', top: '2px', left: '5px' }} showLogo={false} />
              <CardBack className="pile_card" style={{ transform: 'rotate(8deg)', top: '-3px', left: '-4px' }} showLogo={false} />
              <span style={{ position: 'absolute', top: '40%', left: '25px', color: 'white', zIndex: 10, fontWeight: 'bold', fontSize: '20px', textShadow: '1px 1px 2px black' }}>{oppPoints.length}</span>
            </>)}
          </div>
          <div className="point_pile player_points">
            {myPoints.length > 0 && (<>
              <CardBack className="pile_card" style={{ transform: 'rotate(-6deg)' }} showLogo={false} />
              <CardBack className="pile_card" style={{ transform: 'rotate(15deg)', top: '4px', left: '-2px' }} showLogo={false} />
              <CardBack className="pile_card" style={{ transform: 'rotate(-4deg)', top: '-2px', left: '6px' }} showLogo={false} />
              <span style={{ position: 'absolute', top: '40%', left: '25px', color: 'white', zIndex: 10, fontWeight: 'bold', fontSize: '20px', textShadow: '1px 1px 2px black' }}>{myPoints.length}</span>
            </>)}
          </div>
        </div>
      </div>
      <div className="hand player_hand" style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
        {myHand.map((card, i) => <CardFace key={i} card={card} onClick={() => handleMyPlay(card)} />)}
      </div>
      <button className="btn-back" onClick={handleExit} style={{ position: 'absolute', top: '20px', left: '20px', margin: 0 }}>← Home</button>
    </div>
  );
}