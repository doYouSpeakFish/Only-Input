describe('Home Page', () => {
  beforeEach(() => {
    // Visit the home page before each test
    cy.visit('/');
  });

  it('should display the site name', () => {
    cy.contains('h1', 'Only Input - German').should('be.visible');
  });

  it('should have a link styled as a button to navigate to flashcards', () => {
    cy.contains('button', 'Go to Flashcards') // Find the button first for visibility
      .should('be.visible')
      .parent('a') // Go up to the parent Link (rendered as <a>)
      .should('have.attr', 'href', '/flashcards'); // Check href on the <a> tag
  });

  it('should navigate to the flashcards page when the button is clicked', () => {
    cy.contains('button', 'Go to Flashcards').click();
    cy.url().should('include', '/flashcards');
    // Wait specifically for the German word to appear, indicating flashcard loaded
    cy.get('[data-testid="german-word"]').should('be.visible'); 
  });
}); 