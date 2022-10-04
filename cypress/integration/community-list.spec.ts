import { Options } from 'cypress-axe';
import { testA11y } from 'cypress/support/utils';

describe('Community List Page', () => {

    // UMD Customization for LIBDRUM-664
    // The dspace backend in docker-compose-ci.yml uses stock dspace image, so the
    // communitygroups endpoint used by /community-list page is not available.
    // The default database restore SQL used by docker-compose-ci.yml does not include the
    // CommuityGroup info, therefore this test will fail
    it.skip('should pass accessibility tests', () => {
        cy.visit('/community-list');

        // <ds-community-list-page> tag must be loaded
        cy.get('ds-community-list-page').should('exist');

        // Open first Community (to show Collections)...that way we scan sub-elements as well
        cy.get('ds-cg-community-list :nth-child(1) > .btn-group > .btn').first().click();

        // Analyze <ds-community-list-page> for accessibility issues
        // Disable heading-order checks until it is fixed
        testA11y('ds-community-list-page',
            {
                rules: {
                    'heading-order': { enabled: false }
                }
            } as Options
        );
    });
    // End UMD Customization for LIBDRUM-664

});
