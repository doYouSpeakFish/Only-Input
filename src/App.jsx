import { useState, useEffect } from 'react'
import Flashcard from './components/Flashcard'
import vocab from '../vocab.json'
import { testVocab } from './testData'

// Use test data in development or when running in Cypress, unless USE_REAL_DATA is set
const useTestData = (process.env.NODE_ENV === 'development' || window.Cypress) && !import.meta.env.VITE_USE_REAL_DATA
const wordList = useTestData ? testVocab : vocab

function getCardProgress() {
  const progress = localStorage.getItem('cardProgress')
  return progress ? JSON.parse(progress) : {}
}

function getTotalCardsShown() {
  return parseInt(localStorage.getItem('totalCardsShown') || '0')
}

function getNextCard() {
  const progress = getCardProgress()
  const totalShown = getTotalCardsShown()

  // If no progress, return first card
  if (Object.keys(progress).length === 0) {
    return wordList[0]
  }
  
  // Find next due card
  let nextDueCard = null
  let nextDueCardDueDate = null
  for (const card of wordList) {
    const cardDueDate = progress[card.word]?.lastShownAt + progress[card.word]?.cardsUntilNextReview
    if (nextDueCardDueDate === null || cardDueDate < nextDueCardDueDate) {
      nextDueCardDueDate = cardDueDate
      nextDueCard = card
    }
  }

  // If there is a next due card is due, return it
  if (nextDueCardDueDate && nextDueCardDueDate < totalShown) {
    return nextDueCard
  }

  // If there is no next due card, find the first card that has not been shown yet
  let firstUnshownCard = null
  for (const card of wordList) {
    if (!progress[card.word]) {
      firstUnshownCard = card
      break
    }
  }
  
  // If there are no unshown cards, show the next due card anyway, else return the first unshown card
  if (firstUnshownCard) {
    return firstUnshownCard
  }

  return nextDueCard
}

function App() {
  const [currentWord, setCurrentWord] = useState(null)
  const [currentExample, setCurrentExample] = useState(null)

  const handleCardComplete = () => {
    const nextWord = getNextCard()
    if (!nextWord) {
      setCurrentWord(null)
      setCurrentExample(null)
      return
    }
    
    const randomIndex = Math.floor(Math.random() * nextWord.examples.length)
    const nextExample = nextWord.examples[randomIndex]
    
    setCurrentWord(nextWord)
    setCurrentExample(nextExample)
  }

  useEffect(() => {
    if (wordList.length > 0) {
      const firstWord = wordList[0] // Always start with the first word
      setCurrentWord(firstWord)
      const randomIndex = Math.floor(Math.random() * firstWord.examples.length)
      setCurrentExample(firstWord.examples[randomIndex])
    }
  }, [])

  if (!currentWord || !currentExample) {
    return (
      <div className="app">
        <div data-testid="empty-state" className="empty-state">
          <h2>No more cards!</h2>
          <p>You've completed all the available flashcards.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="app">
      <Flashcard 
        word={currentWord.word}
        example={currentExample.sentence}
        translation={currentExample.sentence_translation}
        onComplete={handleCardComplete}
      />
    </div>
  )
}

export default App 