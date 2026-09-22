import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ActivationPage from './pages/ActivationPage/ActivationPage';
import Edit from './pages/Edit';
import EditCardPage from './pages/EditCardPage/EditCardPage';
import NotActive from './pages/NotActive';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<h2>Home Page</h2>} />
        <Route path="/activation/:card_id" element={<ActivationPage />} />
        <Route path="/activation" element={<ActivationPage />} />
        <Route path="/edit" element={<Edit />} />
        <Route path="/edit/:card_id" element={<EditCardPage />} />
        <Route path="/not-active" element={<NotActive />} />
      </Routes>
    </Router>
  );
}

export default App;
