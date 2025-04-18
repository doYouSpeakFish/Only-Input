describe('Flashcard', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    cy.window().then((win) => {
      win.localStorage.clear()
    })
    cy.visit('/')
  })

  it('displays the German word', () => {
    cy.get('[data-testid="german-word"]').should('not.be.empty')
  })

  it('displays an example sentence', () => {
    cy.get('[data-testid="example-sentence"]')
      .should('exist')
      .and('not.be.empty')
  })

  it('shows a reveal button', () => {
    cy.get('[data-testid="reveal-button"]').should('exist')
  })

  it('shows translation when reveal button is clicked', () => {
    cy.get('[data-testid="reveal-button"]').click()
    cy.get('[data-testid="translation"]')
      .should('exist')
      .and('not.be.empty')
  })

  it('hides reveal button after clicking it', () => {
    cy.get('[data-testid="reveal-button"]').click()
    cy.get('[data-testid="reveal-button"]').should('not.exist')
  })

  it('shows correct and wrong buttons after revealing', () => {
    cy.get('[data-testid="reveal-button"]').click()
    cy.get('[data-testid="correct-button"]').should('exist')
    cy.get('[data-testid="wrong-button"]').should('exist')
  })

  it('shows next card when correct button is clicked', () => {
    cy.get('[data-testid="reveal-button"]').click()
    cy.get('[data-testid="correct-button"]').click()
    cy.get('[data-testid="german-word"]').should('not.be.empty')
  })

  it('shows next card when wrong button is clicked', () => {
    cy.get('[data-testid="reveal-button"]').click()
    cy.get('[data-testid="wrong-button"]').click()
    cy.get('[data-testid="german-word"]').should('not.be.empty')
  })

  describe('Card Progress Tracking', () => {
    it('increments total cards shown in localStorage', () => {
      cy.window().then((win) => {
        expect(win.localStorage.getItem('totalCardsShown')).to.be.null
      })
      
      cy.get('[data-testid="reveal-button"]').click()
      cy.get('[data-testid="correct-button"]').click()
      
      cy.window().then((win) => {
        expect(win.localStorage.getItem('totalCardsShown')).to.equal('1')
      })
    })

    it('stores card progress in localStorage after review', () => {
      cy.get('[data-testid="german-word"]').then(($word) => {
        const currentWord = $word.text()
        
        cy.get('[data-testid="reveal-button"]').click()
        cy.get('[data-testid="correct-button"]').click()
        
        cy.window().then((win) => {
          const progress = JSON.parse(win.localStorage.getItem('cardProgress'))
          expect(progress[currentWord]).to.deep.equal({
            lastShownAt: 0,
            cardsUntilNextReview: 10
          })
        })
      })
    })

    it('doubles cardsUntilNextReview when correct is clicked', () => {
      cy.get('[data-testid="german-word"]').then(($word) => {
        const currentWord = $word.text()
        
        cy.get('[data-testid="reveal-button"]').click()
        cy.get('[data-testid="correct-button"]').click()
        
        // Review cards until the first card is shown again
        cy.get('[data-testid="reveal-button"]').click()
        cy.get('[data-testid="correct-button"]').click()
        cy.get('[data-testid="reveal-button"]').click()
        cy.get('[data-testid="correct-button"]').click()

        // Review the first card again
        cy.get('[data-testid="reveal-button"]').click()
        cy.get('[data-testid="correct-button"]').click()
        
        cy.window().then((win) => {
          const progress = JSON.parse(win.localStorage.getItem('cardProgress'))
          expect(progress[currentWord].cardsUntilNextReview).to.equal(20)
        })
      })
    })

    it('halves cardsUntilNextReview when wrong is clicked', () => {
      cy.get('[data-testid="german-word"]').then(($word) => {
        const currentWord = $word.text()
        
        cy.get('[data-testid="reveal-button"]').click()
        cy.get('[data-testid="wrong-button"]').click()
        
        cy.window().then((win) => {
          const progress = JSON.parse(win.localStorage.getItem('cardProgress'))
          expect(progress[currentWord].cardsUntilNextReview).to.equal(10)
        })
      })
    })

    it('shows most overdue card next', () => {
      // Review first card
      cy.get('[data-testid="german-word"]').then(($word) => {
        const firstWord = $word.text()
        
        cy.get('[data-testid="reveal-button"]').click()
        cy.get('[data-testid="correct-button"]').click()
        
        // Review second card
        cy.get('[data-testid="reveal-button"]').click()
        cy.get('[data-testid="wrong-button"]').click()

        // Review third card
        cy.get('[data-testid="reveal-button"]').click()
        cy.get('[data-testid="correct-button"]').click()
        
        // Show next card (should be the first one again since it's more overdue)
        cy.get('[data-testid="german-word"]').should('have.text', firstWord)
      })
    })
  })

  describe('Daily Progress Tracking', () => {
    beforeEach(() => {
      cy.clearLocalStorage()
    })

    it('tracks correct cards by date', () => {
      cy.visit('/')
      cy.get('[data-testid="reveal-button"]').click()
      cy.get('[data-testid="correct-button"]').click()
      
      const today = new Date().toISOString().split('T')[0].replace(/-/g, '')
      cy.window().then((win) => {
        const progress = JSON.parse(win.localStorage.getItem('dailyProgress') || '{}')
        expect(progress[today]).to.equal(1)
      })
    })

    it('increments correct count when correct is clicked', () => {
      cy.visit('/')
      cy.get('[data-testid="reveal-button"]').click()
      cy.get('[data-testid="correct-button"]').click()
      cy.get('[data-testid="reveal-button"]').click()
      cy.get('[data-testid="correct-button"]').click()
      
      const today = new Date().toISOString().split('T')[0].replace(/-/g, '')
      cy.window().then((win) => {
        const progress = JSON.parse(win.localStorage.getItem('dailyProgress') || '{}')
        expect(progress[today]).to.equal(2)
      })
    })

    it('does not increment correct count when wrong is clicked', () => {
      cy.visit('/')
      cy.get('[data-testid="reveal-button"]').click()
      cy.get('[data-testid="wrong-button"]').click()
      
      const today = new Date().toISOString().split('T')[0].replace(/-/g, '')
      cy.window().then((win) => {
        const progress = JSON.parse(win.localStorage.getItem('dailyProgress') || '{}')
        expect(progress[today]).to.be.undefined
      })
    })

    it('displays progress bar with correct percentage', () => {
      cy.visit('/')
      cy.get('[data-testid="progress-bar"]').should('exist')
      cy.get('[data-testid="progress-bar"]').should('have.attr', 'style', 'width: 0%;')
      
      cy.get('[data-testid="reveal-button"]').click()
      cy.get('[data-testid="correct-button"]').click()
      
      cy.get('[data-testid="progress-bar"]').should('have.attr', 'style', 'width: 0.5%;')
    })
  })
}) 