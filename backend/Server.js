/*File che costituisce il backend dell'intero programma. Gestisce la persistenza
dei dati degli utenti e delle statistiche di gioco. Utilizza un file JSON locale
come database. Definisce alcune API REST per il corretto salvataggio e gestione dei dati.*/

/*Carica alcune librerie: express per il server HTTPS, cors per le richieste
dal frontend React. fs per l gestione di file e path per la gestione dei percorsi con metodologie
riconosciutr da tutti i SO*/
const express = require('express');
const cors    = require('cors');
const fs      = require('fs');
const path    = require('path');
const { ExpressPeerServer } = require('peer');

/*Crea l'app express, definisce la porta su cui ascolterà il server
e il percorso verso il db vero e proprio(stats.json). __dirname è la cartella di server.js(che è la stessa di stats.json)*/
const app      = express();
const PORT     = process.env.PORT || 3001; 
const DB_PATH  = path.join(__dirname, 'stats.json');

/*cors() permette al frontend(porta 5173) di chiamare direttamente il backedn(porta 3001) senza blocchi intermedi*/
app.use(cors());
app.use(express.json());

/*Legge stats.json e lo converte in oggetto JS. Se il file non esiste estituisce un oggetto vuoto{}*/
function readDB() {
  try { return JSON.parse(fs.readFileSync(DB_PATH, 'utf-8')); }
  catch { return {}; }
}

/*Converte il JS in JSON e lo sovrascrive nel file*/
function writeDB(data) {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}

// POST /api/utenti — crea utente al primo accesso
app.post('/api/utenti', (req, res) => {
  /*Estrae l'usernme dal body, se manca errore 400*/
  const { username } = req.body;
  if (!username) return res.status(400).json({ error: 'Username mancante' });
  const db = readDB();
  /*Se l'utente non esiste già, lo crea con le statische a 0 e salva. Se esiste già non fa nulla*/
  if (!db[username]) {
    db[username] = { giocate: 0, vittorie: 0, sconfitte: 0, abbandonate: 0, streak: 0, bestStreak: 0 };
    writeDB(db);
  }
  res.json({ ok: true, username });
});

// GET /api/stats/:username — legge le stats
app.get('/api/stats/:username', (req, res) => {
  const db = readDB();
  /*Legge il :username, se l'utente non esiste errore 404 altrimente restituisce le stats*/
  const user = db[req.params.username];
  if (!user) return res.status(404).json({ error: 'Utente non trovato' });
  res.json(user);
});

// POST /api/stats/:username — aggiorna le stats
app.post('/api/stats/:username', (req, res) => {
  const db = readDB();
  if (!db[req.params.username]) return res.status(404).json({ error: 'Utente non trovato' });
  /*Unisce le stats vecchie con quelle nuove. Se vinci un partita aggiona le vittorie e lascia invariato il resto*/
  db[req.params.username] = { ...db[req.params.username], ...req.body };
  writeDB(db);
  res.json({ ok: true });
});

// PUT /api/utenti/:username/rename — rinomina utente mantenendo le stats
app.put('/api/utenti/:username/rename', (req, res) => {
  const { newUsername } = req.body;
  const oldUsername = req.params.username;
  if (!newUsername) return res.status(400).json({ error: 'Nuovo username mancante' });
  const db = readDB();
  /*Controlla che l'username vecchio esista e che quello nuovo non sia già preso*/
  if (!db[oldUsername]) return res.status(404).json({ error: 'Utente non trovato' });
  if (db[newUsername]) return res.status(409).json({ error: 'Username già in uso' });
  db[newUsername] = db[oldUsername];  // copia le stats
  delete db[oldUsername];             // rimuove il vecchio
  writeDB(db);
  res.json({ ok: true, newUsername });
});

// DELETE /api/utenti/:username — elimina utente e stats
app.delete('/api/utenti/:username', (req, res) => {
  const db = readDB();
  if (!db[req.params.username]) return res.status(404).json({ error: 'Utente non trovato' });
  delete db[req.params.username];
  writeDB(db);
  res.json({ ok: true });
});

// GET /api/classifica - top 5 giocatori
app.get('/api/classifica', (req, res) => {
  const db = readDB();
  const classifica = Object.entries(db) //Converte l'oggetto in array di coppie
    .map(([username, stats]) => ({ username, ...stats })) //Trasforma ogni coppia in un oggetto
    .sort((a, b) => b.vittorie - a.vittorie) //Ordina per vittorie decrescenti
    .slice(0, 5); //Prende solo i primi 5
  res.json(classifica);
});

//Avvia il serve sulla porta assegnata da Railway (o 3001 in locale)
const server = app.listen(PORT, () => console.log(`Server in ascolto sulla porta ${PORT}`));

/* Inizializzazione del centralino WebRTC (PeerServer) sulla rotta /peerjs */
const peerServer = ExpressPeerServer(server, {
  debug: true,
  path: '/'
});

app.use('/peerjs', peerServer);

// Log per monitorare entrate e uscite dalla lobby sulla console di Railway
peerServer.on('connection', (client) => {
  console.log(`[PeerJS] Giocatore connesso: ${client.getId()}`);
});
peerServer.on('disconnect', (client) => {
  console.log(`[PeerJS] Giocatore disconnesso: ${client.getId()}`);
});