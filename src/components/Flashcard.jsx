import { useState } from 'react'

// Card progress tracking
const CARD_PROGRESS_KEY = 'cardProgress'
const TOTAL_CARDS_SHOWN_KEY = 'totalCardsShown'

function getCardProgress() {
  const progress = localStorage.getItem(CARD_PROGRESS_KEY)
  return progress ? JSON.parse(progress) : {}
}

function saveCardProgress(progress) {
  localStorage.setItem(CARD_PROGRESS_KEY, JSON.stringify(progress))
}

function incrementTotalCardsShown() {
  const total = parseInt(localStorage.getItem(TOTAL_CARDS_SHOWN_KEY) || '0')
  localStorage.setItem(TOTAL_CARDS_SHOWN_KEY, (total + 1).toString())
  return total + 1
}

function updateCardProgress(word, isCorrect) {
  const progress = getCardProgress()
  const cardProgress = progress[word] || {
    lastShownAt: 0,
    cardsUntilNextReview: 10
  }
  
  const totalShown = incrementTotalCardsShown()
  cardProgress.lastShownAt = totalShown - 1
  
  // Only update the review interval after the first review
  if (progress[word]) {
    if (isCorrect) {
      cardProgress.cardsUntilNextReview *= 2
    } else {
      cardProgress.cardsUntilNextReview /= 2
    }
    console.log(cardProgress.cardsUntilNextReview)
    if (cardProgress.cardsUntilNextReview < 10) {
      cardProgress.cardsUntilNextReview = 10
    }
  }
  
  progress[word] = cardProgress
  saveCardProgress(progress)
}

function Flashcard({ word, example, translation, onComplete }) {
  const [isRevealed, setIsRevealed] = useState(false)

  const handleReveal = () => {
    setIsRevealed(true)
  }

  const handleCorrect = () => {
    updateCardProgress(word, true)
    setIsRevealed(false)
    onComplete()
  }

  const handleWrong = () => {
    updateCardProgress(word, false)
    setIsRevealed(false)
    onComplete()
  }

  return (
    <div className="flashcard">
      <h2 data-testid="german-word">{word}</h2>
      <p data-testid="example-sentence">{example}</p>
      {isRevealed ? (
        <>
          <p data-testid="translation">{translation}</p>
          <div className="button-group">
            <button data-testid="correct-button" onClick={handleCorrect}>Correct</button>
            <button data-testid="wrong-button" onClick={handleWrong}>Wrong</button>
          </div>
        </>
      ) : (
        <button data-testid="reveal-button" onClick={handleReveal}>Reveal</button>
      )}
    </div>
  )
}

export default Flashcard 