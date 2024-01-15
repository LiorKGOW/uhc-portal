import Login from '../../pageobjects/login.page';
import ClusterListPage from '../../pageobjects/ClusterList.page';

describe('OCM Cluster archives page', () => {
  before(() => {
    cy.visit('/', { retryOnNetworkFailure: true });
    Login.isLoginPageUrl();
    Login.login();

    ClusterListPage.isClusterListUrl();
    ClusterListPage.waitForDataReady();
    cy.getByTestId('create_cluster_btn').should('be.visible');
  });
  describe(
    'Check all cluster archives page items presence and its actions (OCP-25329)',
    { tags: ['smoke'] },
    () => {
      it('Cluster archives page : ui options & its actions', () => {
        ClusterListPage.isClusterListScreen();
        ClusterListPage.viewClusterArchives().click();
        ClusterListPage.isClusterArchivesUrl();
        ClusterListPage.isClusterArchivesScreen();
        ClusterListPage.clickClusterListTableHeader('Name');
        ClusterListPage.clickClusterListTableHeader('Type');
        ClusterListPage.clickClusterListTableHeader('Status');
        ClusterListPage.clickClusterListTableHeader('Provider (Location)');
        ClusterListPage.scrollClusterListPageTo('bottom');
        ClusterListPage.itemPerPage().click();
        ClusterListPage.clickPerPageItem('20');
        ClusterListPage.itemPerPage().click();
        ClusterListPage.clickPerPageItem('50');
        ClusterListPage.itemPerPage().click();
        ClusterListPage.clickPerPageItem('100');
        ClusterListPage.itemPerPage().click();
        ClusterListPage.clickPerPageItem('10');
      });
      it('Cluster archives page : navigations', () => {
        ClusterListPage.showActiveClusters().click();
        ClusterListPage.isClusterListScreen();
        ClusterListPage.viewClusterArchives().click();
      });
      it('Cluster archives page : filter options', () => {
        ClusterListPage.filterTxtField().should('be.visible').click();
        ClusterListPage.clickClusterTypeFilters();
        ClusterListPage.clickClusterTypes('OCP');
        ClusterListPage.filterTxtField().click();
        ClusterListPage.clusterListRefresh();
        ClusterListPage.waitForArchiveDataReady();
        // Only OCP cluster should be in filter rule display
        ClusterListPage.checkFilteredClusterTypes('OCP', true);
        ClusterListPage.checkFilteredClusterTypes('OSD', false);
        ClusterListPage.checkFilteredClusterTypes('ROSA', false);
        // Only OCP clusters should be in cluster list - first page
        ClusterListPage.checkFilteredClustersFromClusterList('OCP', true);
        ClusterListPage.scrollClusterListPageTo('bottom');
        ClusterListPage.goToLastPage();
        // Only OCP clusters should be in cluster list - last page
        ClusterListPage.checkFilteredClustersFromClusterList('OCP', true);
        ClusterListPage.scrollClusterListPageTo('top');
        ClusterListPage.waitForArchiveDataReady();
        ClusterListPage.clickClusterTypeFilters();
        ClusterListPage.clickClusterTypes('OSD');
        ClusterListPage.clickClusterTypes('ROSA');
        ClusterListPage.clickClusterTypes('ARO');
        ClusterListPage.clickClusterTypes('OCP');
        ClusterListPage.clearFilters();
        ClusterListPage.filterTxtField().should('be.visible').click({ force: true });
        ClusterListPage.filterTxtField().clear().type('smoke cluster');
        ClusterListPage.filterTxtField().clear();
        ClusterListPage.waitForArchiveDataReady();
      });

      it('Cluster archives page : view only cluster options & its actions', () => {
        ClusterListPage.viewOnlyMyCluster().click({ force: true });
        ClusterListPage.viewOnlyMyClusterHelp().click();
        cy.get('div')
          .contains(
            'Show only the clusters you previously archived, or all archived clusters in your organization',
          )
          .should('be.visible');
        ClusterListPage.clusterListRefresh();
      });
    },
  );
});
