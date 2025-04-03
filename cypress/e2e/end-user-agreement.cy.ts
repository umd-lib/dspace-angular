import { testA11y } from 'cypress/support/utils';

// UMD Customization
// End User Agreement is suppressed in the UMD configuration
describe('End User Agreement', () => {
  it.skip('should pass accessibility tests', () => {
    cy.visit('/info/end-user-agreement');

    // Page must first be visible
    cy.get('ds-end-user-agreement').should('be.visible');

    // Analyze <ds-end-user-agreement> for accessibility
    testA11y('ds-end-user-agreement');
  });
});
// End UMD Customization
