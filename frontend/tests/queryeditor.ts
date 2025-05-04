describe('Query Editor', () => {
    beforeEach(() => {
      cy.visit('/query-editor');
    });
  
    it('should run a query and display results', () => {
      cy.intercept('GET', 'http://localhost:5001/api/activities', {
        statusCode: 200,
        body: [{ _id: '1', name: 'Test Activity' }],
      }).as('getActivities');
  
      cy.get('button').contains('Abfrage ausführen').click();
      cy.wait('@getActivities');
      cy.contains('Test Activity').should('be.visible');
    });
  });