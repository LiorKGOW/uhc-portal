// ***********************************************************
// This example support/e2e.js is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

// Import commands.js using ES2015 syntax:
import './commands';
import '@cypress/code-coverage/support';

// Alternatively you can use CommonJS syntax:
// require('./commands')

const registerCypressGrep = require('@cypress/grep');
registerCypressGrep();

before(() => {
  cy.log('Setting session cookies');
  // disabling CookieConsent dialog
  // copied from https://gitlab.cee.redhat.com/insights-qe/iqe-platform-ui-plugin/-/blob/master/iqe_platform_ui/__init__.py#L207
  cy.setCookie('notice_gdpr_prefs', '0,1,2:');
  cy.setCookie('notice_preferences', '2:');
  cy.reload();
  cy.log('Setting viewport to "macbook-13"');
  cy.viewport('macbook-13');
});

beforeEach(() => {
  cy.log(
    'Configuring Cypress to catch all uncaught exceptions & unhandled promise rejections thrown from OCM app.',
  );
  cy.on('uncaught:exception', (err, runnable, promise) => {
    // return false to prevent the error from failing this test
    console.error(`Cypress caught exception: ${err.message}`);
    return false;
  });
});
