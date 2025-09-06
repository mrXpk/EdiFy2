import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { motion } from 'framer-motion';
import Home from './pages/Home';
import Setup from './pages/Setup';
import Workspace from './pages/Workspace';
import { APIKeyProvider } from './contexts/APIKeyContext';

function App() {
  return (
    <APIKeyProvider>
      <Router>
        <div className="min-h-screen bg-white text-gray-900">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
          >
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/setup" element={<Setup />} />
              <Route path="/workspace" element={<Workspace />} />
            </Routes>
          </motion.div>
        </div>
      </Router>
    </APIKeyProvider>
  );
}

export default App;
