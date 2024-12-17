import { testA11y } from 'cypress/support/utils';

describe('Community List Page', () => {

  // UMD Customization
  // The dspace backend in docker-compose-ci.yml uses stock dspace image, so the
  // communitygroups endpoint used by /community-list page is not available.
  // The default database restore SQL used by docker-compose-ci.yml does not include the
  // CommuityGroup info, therefore this test will fail
  it.skip('should pass accessibility tests', () => {
    cy.visit('/community-list');

    // <ds-community-list-page> tag must be loaded
    cy.get('ds-community-list-page').should('be.visible');

    // Open every expand button on page, so that we can scan sub-elements as well
    cy.get('[data-test="expand-button"]').click({ multiple: true });

    // Analyze <ds-community-list-page> for accessibility issues
    testA11y('ds-community-list-page');
  });
  // End UMD Customization
});
