import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Activation from './pages/Activation';
import Edit from './pages/Edit';
import NotActive from './pages/NotActive';

function App() {
  return (
    <Router>
      <nav style={{ padding: '10px', background: '#eee', marginBottom: '20px' }}>
        <ul style={{ display: 'flex', listStyle: 'none', gap: '20px', margin: 0, padding: 0 }}>
          <li><Link to="/activation">Activation</Link></li>
          <li><Link to="/edit">Edit</Link></li>
          <li><Link to="/not-active">Not Active</Link></li>
        </ul>
      </nav>
      
      <div style={{ padding: '20px' }}>
        <Routes>
          <Route path="/" element={<h2>Home Page</h2>} />
          <Route path="/activation" element={<Activation />} />
          <Route path="/edit" element={<Edit />} />
          <Route path="/not-active" element={<NotActive />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
