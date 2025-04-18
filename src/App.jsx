import { useState, useEffect } from 'react'
import Flashcard from './components/Flashcard'
import vocab from '../vocab.json'
import { testVocab } from './testData'

// Use test data in development or when running in Cypress, unless USE_REAL_DATA is set
const useTestData = (process.env.NODE_ENV === 'development' || window.Cypress) && !import.meta.env.VITE_USE_REAL_DATA
const wordList = useTestData ? testVocab : vocab

function App() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [currentWord, setCurrentWord] = useState(null)
  const [currentExample, setCurrentExample] = useState(null)

  const getNextCard = () => {
    if (currentIndex + 1 >= wordList.length) {
      setCurrentWord(null)
      setCurrentExample(null)
      return
    }
    const nextIndex = currentIndex + 1
    const nextWord = wordList[nextIndex]
    const randomIndex = Math.floor(Math.random() * nextWord.examples.length)
    const nextExample = nextWord.examples[randomIndex]
    
    setCurrentIndex(nextIndex)
    setCurrentWord(nextWord)
    setCurrentExample(nextExample)
  }

  const handleCardComplete = () => {
    getNextCard()
  }

  useEffect(() => {
    if (wordList.length > 0) {
      const firstWord = wordList[0]
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