import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import AccountPage from './pages/Account';
import './styles/globals.css';

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/account" element={<AccountPage />} />
        {/* Add more routes here as you build out the application */}
      </Routes>
    </Router>
  );
};

export default App;