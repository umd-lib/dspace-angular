beforeEach(() => {
  cy.visit('/communities/create');
  cy.loginViaForm(Cypress.env('DSPACE_TEST_ADMIN_USER'), Cypress.env('DSPACE_TEST_ADMIN_PASSWORD'));
});

// UMD Customization
// The dspace backend in docker-compose-ci.yml uses stock dspace image, so the
// communitygroups endpoint used by /community-list page is not available.
// The default database restore SQL used by docker-compose-ci.yml does not
// include the CommuityGroup info, therefore this test will fail, because
// the form cannot be submitted.
it.skip('should show loading component while saving', () => {
  const title = 'Test Community Title';
  cy.get('#title').type(title);

  cy.get('button[type="submit"]').click();

  cy.get('ds-loading').should('be.visible');
});
// End UMD Customization