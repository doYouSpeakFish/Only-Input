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

function getTotalCardsShown() {
  return parseInt(localStorage.getItem(TOTAL_CARDS_SHOWN_KEY) || '0')
}

function getNextCard() {
  const progress = getCardProgress()
  
  // Find the most overdue card
  let mostOverdueCard = null
  let maxOverdue = -Infinity
  
  for (const card of cards) {
    const cardProgress = progress[card.word] || {
      lastShownAt: 0,
      cardsUntilNextReview: 10
    }
    
    const overdue = (getTotalCardsShown() - cardProgress.lastShownAt) - cardProgress.cardsUntilNextReview
    if (overdue > maxOverdue) {
      maxOverdue = overdue
      mostOverdueCard = card
    }
  }
  
  return mostOverdueCard || cards[0]
}

function updateCardProgress(card, isCorrect) {
  const progress = getCardProgress()
  const cardProgress = progress[card.word] || {
    lastShownAt: 0,
    cardsUntilNextReview: 10
  }
  
  const totalShown = incrementTotalCardsShown()
  cardProgress.lastShownAt = totalShown - 1
  
  if (isCorrect) {
    cardProgress.cardsUntilNextReview *= 2
  } else {
    cardProgress.cardsUntilNextReview = Math.max(10, Math.floor(cardProgress.cardsUntilNextReview / 2))
  }
  
  progress[card.word] = cardProgress
  saveCardProgress(progress)
}

function showNextCard() {
  if (cards.length === 0) {
    showEmptyState()
    return
  }
  
  currentCard = getNextCard()
  
  germanWord.textContent = currentCard.word
  exampleSentence.textContent = currentCard.examples[0].sentence
  translation.textContent = ''
  translation.style.display = 'none'
  revealButton.style.display = 'block'
  correctButton.style.display = 'none'
  wrongButton.style.display = 'none'
}

correctButton.addEventListener('click', () => {
  updateCardProgress(currentCard, true)
  showNextCard()
})

wrongButton.addEventListener('click', () => {
  updateCardProgress(currentCard, false)
  showNextCard()
}) 