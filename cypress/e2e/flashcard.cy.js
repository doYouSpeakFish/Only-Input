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
      
      // Complete one card
      cy.get('[data-testid="reveal-button"]').click()
      cy.get('[data-testid="correct-button"]').click()
      
      // Verify progress bar shows correct width
      cy.get('.progress-section.red').invoke('width').should('be.closeTo', 5, 1) // Approximately 0.47619% of container width
    })
  })

  describe('Rainbow Progress Bar', () => {
    beforeEach(() => {
      cy.clearLocalStorage()
    })

    it('shows only red section after 30 cards', () => {
      // Set progress directly in localStorage
      const today = new Date().toISOString().split('T')[0].replace(/-/g, '')
      cy.window().then((win) => {
        win.localStorage.setItem('dailyProgress', JSON.stringify({
          [today]: 30
        }))
      })
      
      cy.visit('/')
      
      // Verify only red section is present and has correct width
      cy.get('.progress-section.red').should('exist')
      cy.get('.progress-section.orange').should('not.exist')
      cy.get('.progress-section.red').invoke('width').should('be.closeTo', 143, 1) // Approximately 14.2857% of container width
    })

    it('shows red and orange sections after 31 cards', () => {
      // Set progress directly in localStorage
      const today = new Date().toISOString().split('T')[0].replace(/-/g, '')
      cy.window().then((win) => {
        win.localStorage.setItem('dailyProgress', JSON.stringify({
          [today]: 31
        }))
      })
      
      cy.visit('/')
      
      // Verify both sections are present with correct widths
      cy.get('.progress-section.red').should('exist')
      cy.get('.progress-section.orange').should('exist')
      cy.get('.progress-section.red').invoke('width').should('be.closeTo', 143, 1) // Approximately 14.2857% of container width
      cy.get('.progress-section.orange').invoke('width').should('be.closeTo', 5, 1) // Approximately 0.47619% of container width
    })

    it('shows all sections with correct widths after 210 cards', () => {
      // Set progress directly in localStorage
      const today = new Date().toISOString().split('T')[0].replace(/-/g, '')
      cy.window().then((win) => {
        win.localStorage.setItem('dailyProgress', JSON.stringify({
          [today]: 210
        }))
      })
      
      cy.visit('/')
      
      // Verify all sections are present with correct widths
      const colors = ['red', 'orange', 'yellow', 'green', 'blue', 'indigo', 'violet']
      colors.forEach(color => {
        cy.get(`.progress-section.${color}`).should('exist')
        cy.get(`.progress-section.${color}`).invoke('width').should('be.closeTo', 143, 1) // Approximately 14.2857% of container width
      })
    })
  })

  describe('Progress Counter', () => {
    beforeEach(() => {
      cy.clearLocalStorage()
    })

    it('shows initial progress of 0/210', () => {
      cy.visit('/')
      cy.get('[data-testid="progress-counter"]').should('have.text', 'Daily progress: 0/210')
    })

    it('updates progress counter after completing a card', () => {
      cy.visit('/')
      cy.get('[data-testid="reveal-button"]').click()
      cy.get('[data-testid="correct-button"]').click()
      cy.get('[data-testid="progress-counter"]').should('have.text', 'Daily progress: 1/210')
    })

    it('updates progress counter when localStorage is modified', () => {
      // Set progress directly in localStorage
      const today = new Date().toISOString().split('T')[0].replace(/-/g, '')
      cy.window().then((win) => {
        win.localStorage.setItem('dailyProgress', JSON.stringify({
          [today]: 30
        }))
      })
      
      cy.visit('/')
      cy.get('[data-testid="progress-counter"]').should('have.text', 'Daily progress: 30/210')
    })
  })
}) 