import { useState } from 'react'

function Flashcard({ word, example, translation, onComplete }) {
  const [isRevealed, setIsRevealed] = useState(false)

  const handleFeedback = () => {
    setIsRevealed(false)
    onComplete()
  }

  return (
    <div className="flashcard" data-testid="flashcard">
      <h2 data-testid="german-word">{word}</h2>
      <p data-testid="example-sentence">{example}</p>
      
      {!isRevealed && (
        <button 
          data-testid="reveal-button"
          onClick={() => setIsRevealed(true)}
        >
          Reveal Translation
        </button>
      )}

      {isRevealed && (
        <>
          <p data-testid="translation">{translation}</p>
          <div className="feedback-buttons">
            <button 
              data-testid="wrong-button"
              onClick={handleFeedback}
            >
              Wrong
            </button>
            <button 
              data-testid="correct-button"
              onClick={handleFeedback}
            >
              Correct
            </button>
          </div>
        </>
      )}
    </div>
  )
}

export default Flashcard 