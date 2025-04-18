describe('Flashcard', () => {
  beforeEach(() => {
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

  it('shows empty state message when no more cards are available', () => {
    // Click through all cards
    cy.get('[data-testid="reveal-button"]').click()
    cy.get('[data-testid="correct-button"]').click()
    cy.get('[data-testid="reveal-button"]').click()
    cy.get('[data-testid="correct-button"]').click()
    cy.get('[data-testid="reveal-button"]').click()
    cy.get('[data-testid="correct-button"]').click()
    
    // Check for empty state message
    cy.get('[data-testid="empty-state"]').should('exist')
  })
}) 