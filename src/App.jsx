import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './Home';
import Game from './Game';
import Stats from './Stats';
import Lobby from './Lobby';

function App() {
  // Stato condiviso tra Lobby e Game
  const [connection, setConnection] = useState(null);
  const [role, setRole] = useState(null);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/lobby" element={
          <Lobby
            setConnection={setConnection}
            setRole={setRole}
          />}
        />
        <Route path="/game" element={
          <Game
            connection={connection}
            role={role}
          />}
        />
        <Route path="/stats" element={<Stats />} />
      </Routes>
    </Router>
  );
}

export default App;
