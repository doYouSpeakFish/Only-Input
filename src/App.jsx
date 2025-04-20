import { useState, useEffect } from 'react'
import Flashcard from './components/Flashcard'
import vocab from '../vocab.json'
import { testVocab } from './testData'
import './App.css'

// Use test data in development or when running in Cypress, unless USE_REAL_DATA is set
const useTestData = (process.env.NODE_ENV === 'development' || window.Cypress) && !import.meta.env.VITE_USE_REAL_DATA
const wordList = useTestData ? testVocab : vocab

// Card progress tracking
const CARD_PROGRESS_KEY = 'cardProgress'
const TOTAL_CARDS_SHOWN_KEY = 'totalCardsShown'
const DAILY_PROGRESS_KEY = 'dailyProgress'

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

function getDailyProgress() {
  const progress = localStorage.getItem(DAILY_PROGRESS_KEY)
  return progress ? JSON.parse(progress) : {}
}

function updateDailyProgress(isCorrect) {
  if (!isCorrect) return

  const today = new Date().toISOString().split('T')[0].replace(/-/g, '')
  const progress = getDailyProgress()
  progress[today] = (progress[today] || 0) + 1
  localStorage.setItem(DAILY_PROGRESS_KEY, JSON.stringify(progress))
}

function getDailyProgressPercentage() {
  const today = new Date().toISOString().split('T')[0].replace(/-/g, '')
  const progress = getDailyProgress()
  const correctToday = progress[today] || 0
  return (correctToday / 210) * 100 // Updated to 210 cards
}

function getProgressColors(correctToday) {
  const sections = 7
  const cardsPerSection = 30
  const totalSections = Math.ceil(correctToday / cardsPerSection)
  
  const colors = ['red', 'orange', 'yellow', 'green', 'blue', 'indigo', 'violet']
  const activeColors = colors.slice(0, totalSections)
  
  return activeColors.map((color, index) => {
    const isLastSection = index === totalSections - 1
    const isFullSection = correctToday >= (index + 1) * cardsPerSection
    const sectionWidth = 100 / sections
    
    let width
    if (isFullSection) {
      width = sectionWidth
    } else if (isLastSection) {
      const remainingCards = correctToday % cardsPerSection
      width = (remainingCards / cardsPerSection) * sectionWidth
    } else {
      width = 0
    }
    
    return {
      color,
      width: `${width.toFixed(4)}%`,
      left: `${(index * sectionWidth).toFixed(4)}%`
    }
  })
}

function getTotalCardsShown() {
  return parseInt(localStorage.getItem(TOTAL_CARDS_SHOWN_KEY) || '0')
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
      cardProgress.cardsUntilNextReview = 5
    }
  }
  
  progress[word] = cardProgress
  saveCardProgress(progress)
}

function getRandomExample(card) {
  const randomIndex = Math.floor(Math.random() * card.examples.length)
  return card.examples[randomIndex]
}

function App() {
  const [currentWord, setCurrentWord] = useState(null)
  const [currentExample, setCurrentExample] = useState(null)
  const [progressPercentage, setProgressPercentage] = useState(0)
  const [progressColors, setProgressColors] = useState(['red'])
  const [correctToday, setCorrectToday] = useState(0)
  const [showCompletion, setShowCompletion] = useState(false)

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0].replace(/-/g, '')
    const progress = getDailyProgress()
    const todayProgress = progress[today] || 0
    setCorrectToday(todayProgress)
    setProgressPercentage(getDailyProgressPercentage())
    setProgressColors(getProgressColors(todayProgress))

    // Only show completion message if we load the page exactly at 210 cards
    setShowCompletion(todayProgress === 210)

    if (todayProgress >= 210) {
      const nextWord = getNextCard()
      if (nextWord) {
        setCurrentWord(nextWord)
        setCurrentExample(getRandomExample(nextWord))
      }
    } else if (wordList.length > 0) {
      const firstWord = getNextCard()
      setCurrentWord(firstWord)
      setCurrentExample(getRandomExample(firstWord))
    }
  }, [])

  const handleCardComplete = (isCorrect) => {
    updateCardProgress(currentWord.word, isCorrect)
    updateDailyProgress(isCorrect)
    const today = new Date().toISOString().split('T')[0].replace(/-/g, '')
    const progress = getDailyProgress()
    const todayProgress = progress[today] || 0
    setCorrectToday(todayProgress)
    setProgressPercentage(getDailyProgressPercentage())
    setProgressColors(getProgressColors(todayProgress))

    // Show completion message only when we've just reached 210
    if (todayProgress === 210) {
      setShowCompletion(true)
      setCurrentWord(null)
      setCurrentExample(null)
    } else {
      const nextWord = getNextCard()
      setCurrentWord(nextWord)
      if (nextWord) {
        setCurrentExample(getRandomExample(nextWord))
      }
    }
  }

  const handleContinue = () => {
    setShowCompletion(false)
    const nextWord = getNextCard()
    if (nextWord) {
      setCurrentWord(nextWord)
      setCurrentExample(getRandomExample(nextWord))
    }
  }

  return (
    <div className="container">
      <div className="progress-container">
        <div className="progress-bar" data-testid="progress-bar">
          {progressColors.map(({ color, width, left }) => (
            <div
              key={color}
              className={`progress-section ${color}`}
              style={{
                width,
                left,
                position: 'absolute',
                height: '100%',
                transition: 'width 0.3s ease'
              }}
            />
          ))}
        </div>
        <div className="progress-counter" data-testid="progress-counter">
          Daily progress: {correctToday}/210
        </div>
      </div>
      
      {showCompletion ? (
        <div className="card-container">
          <div className="completion-message">
            <h2>Congratulations!</h2>
            <p>You have completed all 210 cards for today!</p>
            <button className="continue-button" onClick={handleContinue}>
              Continue Practicing
            </button>
          </div>
        </div>
      ) : currentWord ? (
        <div className="card-container">
            <Flashcard 
              word={currentWord.word}
              example={currentExample.sentence}
              translation={currentExample.sentence_translation}
              onComplete={handleCardComplete}
            />
        </div>
      ) : (
        <div data-testid="empty-state" className="empty-state">
          <h2>No more cards!</h2>
          <p>You've completed all the available flashcards.</p>
        </div>
      )}
    </div>
  )
}

export default App 