import React from 'react';
import { Link } from 'react-router-dom';
import '../App.css'; // Make sure styles are defined here or in another imported CSS file

function HomePage() {
  return (
    <div className="container home-page">
      <h1>Only Input - German</h1>
      <Link to="/flashcards" className="button-link">
        <button>Go to Flashcards</button>
      </Link>
    </div>
  );
}

export default HomePage; 