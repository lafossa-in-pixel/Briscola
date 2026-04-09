/*Info è una pagina informativa che descrive il contenuto dell'applicazione, il suo funzionamento
e le tecnologie uilizzate. In basso sono presenti i nomi degli autori.*/

import { useEffect, useState } from 'react';
import './Info.css';

export default function Info({ changePage }) {
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    //Solita animazione d'entrata, 80ms d'attesa
    const t = setTimeout(() => setLoaded(true), 80);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="info-root">
        {/*Bottone in alto a sinistra per tornare a home. Chiama la funzione changePage
        passando 'home.'*/}
      <button className="btn-back" onClick={() => changePage('home')}>← Home</button>
      <div className={`info-content ${loaded ? 'visible' : ''}`}>
        <div className="info-title-wrap">
            {/*Titolo Info in alto con sottolineatura*/}
          <h1 className="info-title">Info</h1>
          <div className="info-underline" />
        </div>
        <div className="info-section">
            {/*Seconda sezione con titolo: il gioco e paragrafo testuale sottostante*/}
          <h2 className="info-section-title">Il Gioco</h2>
          <p className="info-text">
            Briscola è uno dei più celebri giochi di carte italiani.
            Questa versione è multiplayer online in tempo reale,
            giocabile da qualsiasi dispositivo con un browser.
          </p>
        </div>
        <div className="info-section">
            {/*Terza sezione con titolo: crediti e autori e ruolo legati assieme verticalmente e legati assieme orizzontalmente*/}
          <h2 className="info-section-title">Crediti</h2>
          <div className="info-credits">
            <div className="info-credit-row">
              <div className="info-credit-item">
                <span className="info-credit-name">Pietro Marossa</span>
                <span className="info-credit-role">Sviluppatore</span>
              </div>
              <div className="info-credit-item">
                <span className="info-credit-name">Nicola Ferraroni</span>
                <span className="info-credit-role">Sviluppatore</span>
              </div>
              <div className="info-credit-item">
                <span className="info-credit-name">Matteo Ibridi</span>
                <span className="info-credit-role">Sviluppatore</span>
              </div>
            </div>
          </div>
        </div>
        <div className="info-section">
            {/*Quarta sezione con titolo: tecnologie e 4 badge sottostanti coi nomi delle tecnologie*/}
          <h2 className="info-section-title">Tecnologie</h2>
          <div className="info-tags">
            <span className="info-tag">React</span>
            <span className="info-tag">PeerJS</span>
            <span className="info-tag">Node.js</span>
            <span className="info-tag">Express</span>
          </div>
        </div>
        {/*Footer della pagina*/}
        <div className="info-version">Università di Parma</div>
      </div>
    </div>
  );
}