import Login from '../../pageobjects/login.page';
import ClusterListPage from '../../pageobjects/ClusterList.page';
import CreateRosaWizardPage from '../../pageobjects/CreateRosaWizard.page';

const associatedAccountsSelector = '**/api/accounts_mgmt/v1/organizations/*/labels';
const ARNsSelector = '**/api/clusters_mgmt/v1/aws_inquiries/sts_account_roles';
const userRoleSelector = '**/api/accounts_mgmt/v1/accounts/*/labels/sts_user_role';

const interceptAndReturnMockAssociatedAccounts = (mockFile) =>
  cy
    .intercept({ method: 'GET', url: associatedAccountsSelector }, { fixture: mockFile })
    .as('getMockAssociatedAccounts');
const interceptAndReturnMockARNs = (mockFile) =>
  cy.intercept({ method: 'POST', url: ARNsSelector }, { fixture: mockFile }).as('getMockARNs');

describe('Rosa cluster tests', () => {
  before(() => {
    cy.visit('/');
    Login.isLoginPageUrl();
    Login.login();

    ClusterListPage.isClusterListUrl();
    ClusterListPage.waitForDataReady();
    cy.getByTestId('create_cluster_btn').should('be.visible');
  });

  describe('Create Rosa cluster', () => {
    it('navigates to create Rosa cluster wizard', () => {
      cy.getByTestId('create_cluster_btn').click();
      // couldn't pass data-testids to composite PF Dropdown component :-(
      cy.get('#rosa-create-cluster-dropdown').scrollIntoView().should('be.visible');
      cy.get('#rosa-create-cluster-dropdown').click();
      cy.get('#with-web').should('be.visible');
      cy.get('#with-web').click();
      CreateRosaWizardPage.isCreateRosaPage();
      cy.get('.spinner-loading-text').should('not.exist');
      CreateRosaWizardPage.isControlPlaneTypeScreen();
    });

    it('selects standalone control plane mode', () => {
      CreateRosaWizardPage.selectStandaloneControlPlaneTypeOption();
    });

    it('moves next to the Accounts and Roles screen', () => {
      cy.get(CreateRosaWizardPage.primaryButton).click({ force: true });
      CreateRosaWizardPage.isAccountsAndRolesScreen();
    });

    describe('test the Accounts and roles step', () => {
      it('tests for no associated accounts', () => {
        interceptAndReturnMockAssociatedAccounts('rosa/rosa_no_associated_account.json');
        interceptAndReturnMockARNs('rosa/rosa_no_arns.json');

        CreateRosaWizardPage.isAccountsAndRolesScreen();
        cy.getByTestId('refresh-aws-accounts').click();
        cy.wait('@getMockAssociatedAccounts');
        cy.get(CreateRosaWizardPage.associatedAccountsDropdown).click();
        CreateRosaWizardPage.showsNoAssociatedAccounts();
      });

      it('test associate aws account drawer', () => {
        cy.getByTestId('launch-associate-account-btn').click();
        CreateRosaWizardPage.isAssociateAccountsDrawer();
        cy.getByTestId('close-associate-account-btn').click();
      });

      it('tests for a single associated account,  "no ARNs" alert, and 4 ARNs required messages', () => {
        interceptAndReturnMockAssociatedAccounts('rosa/rosa_one_associated_account.json');
        interceptAndReturnMockARNs('rosa/rosa_no_arns.json');

        CreateRosaWizardPage.isAccountsAndRolesScreen();
        cy.getByTestId('refresh-aws-accounts').click();
        cy.wait('@getMockAssociatedAccounts');
        cy.contains('Loading account roles ARNs').should('not.exist');
        cy.getByTestId('refresh_arns_btn').click();
        cy.wait('@getMockARNs');

        cy.get(CreateRosaWizardPage.associatedAccountsDropdown).click();
        cy.get(CreateRosaWizardPage.accountIdMenuItem).should('have.length', 1);
        CreateRosaWizardPage.showsNoARNsDetectedAlert();
        cy.get(CreateRosaWizardPage.ARNFieldRequiredMsg).should('have.length', 4); // all 4 ARN fields are empty
      });

      it('tests for all ARNs and no "ARN required" messages', () => {
        interceptAndReturnMockARNs('rosa/rosa_all_arns.json');
        cy.getByTestId('refresh_arns_btn').click();
        cy.contains('Loading account roles ARNs').should('not.exist');
        cy.wait('@getMockARNs');
        cy.get(CreateRosaWizardPage.ARNFieldRequiredMsg).should('have.length', 0); // no ARN validation alerts
      });

      it('tests preventing Next if no user role, shows alert', () => {
        cy.intercept(
          { method: 'GET', url: userRoleSelector },
          {
            statusCode: 404,
            body: '404 Not Found!',
            headers: {
              'x-not-found': 'true',
            },
          },
        ).as('noUserRole');

        cy.get(CreateRosaWizardPage.primaryButton).click({ force: true });
        cy.wait('@noUserRole');

        CreateRosaWizardPage.isAccountsAndRolesScreen();
        CreateRosaWizardPage.showsNoUserRoleAlert();
      });

      it('tests if no ocm role, shows alert', () => {
        interceptAndReturnMockAssociatedAccounts('rosa/rosa_one_associated_account.json');

        cy.intercept(
          { method: 'POST', url: ARNsSelector },
          {
            statusCode: 400,
            body: {
              kind: 'Error',
              id: '400',
              href: '/api/clusters_mgmt/v1/errors/400',
              code: 'CLUSTERS-MGMT-400',
              reason:
                "Add 'arn:aws:iam::8888:role/RH-Managed-OpenShift-Installer' to the trust policy on IAM role 'ManagedOpenShift-OCM-Role-151515'",
              details: [
                {
                  Error_Key: 'NoTrustedRelationshipOnClusterRole',
                },
              ],
              operation_id: 'f15efc24-e3c6-436f-be01-7e8be1009265',
            },
          },
        ).as('noOcmRole');

        cy.getByTestId('refresh-aws-accounts').click();

        cy.wait('@getMockAssociatedAccounts');
        cy.wait('@noOcmRole');

        CreateRosaWizardPage.isAccountsAndRolesScreen();
        CreateRosaWizardPage.showsNoOcmRoleAlert();
      });

      // TODO: resolve timing and mock data issues
      // Alert "user-role could not be detected" persists after successfully getting mock user-role
      // something to do with react's render() loop and asyc mock data calls
      it.skip('tests Next goes to next step if no validation errors', () => {
        interceptAndReturnMockAssociatedAccounts('rosa/rosa_one_associated_account.json');
        interceptAndReturnMockARNs('rosa/rosa_all_arns.json');

        cy.intercept(
          { method: 'GET', url: userRoleSelector },
          { fixture: 'rosa/rosa_user_role.json' },
        ).as('getMockUserRole');

        cy.intercept(
          { method: 'GET', url: '**/api.openshift.com/api/clusters_mgmt/v1/versions/**' },
          { fixture: 'rosa/rosa_installable_cluster_versions.json' },
        ).as('getMockVersions');

        cy.getByTestId('refresh-aws-accounts').click();
        cy.wait('@getMockAssociatedAccounts');
        cy.contains('Loading account roles ARNs').should('not.exist');
        cy.getByTestId('refresh_arns_btn').scrollIntoView().should('be.visible').click();
        cy.wait('@getMockARNs');

        cy.get(CreateRosaWizardPage.primaryButton).click({ force: true });
        cy.wait('@getMockUserRole');
        cy.wait('@getMockVersions');
        CreateRosaWizardPage.isClusterDetailsScreen();
      });
    });

    describe.skip('test the Cluster details step', () => {
      it('tests for default version based on previous step', () => {
        CreateRosaWizardPage.isClusterDetailsScreen();
        // cy.get(CreateRosaWizardPage.versionsDropdown).click();
        // CreateRosaWizardPage.isSelectedVersion('4.10.18');
      });
    });
  });
});
