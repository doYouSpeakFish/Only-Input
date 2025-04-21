import React from 'react';
import { Routes, Route } from 'react-router-dom';
import HomePage from './components/HomePage';
import FlashcardPage from './pages/FlashcardPage';
import './App.css'; // Keep global styles

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/flashcards" element={<FlashcardPage />} />
    </Routes>
  );
}

export default App; 