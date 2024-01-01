import React from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';
import { Tabs, TabTitleText, TabTitleIcon, Tooltip, Tab } from '@patternfly/react-core';
import { ExclamationCircleIcon } from '@patternfly/react-icons';
import { ClusterTabsId } from './common/ClusterTabIds';

class TabsRow extends React.Component {
  unlisten = null;

  state = {
    activeTabKey: undefined,
    initialTabKey: this.getInitTab(),
  };

  componentDidMount() {
    const { history } = this.props;
    this.unlisten = history.listen((location, action) => {
      // listen to browser back/forward and manual URL changes
      if (['PUSH', 'POP'].includes(action)) {
        const targetTab = this.getTabs().find((t) => `#${t.id}` === location.hash);
        const targetTabKey = targetTab?.key;
        if (targetTab?.isDisabled || !targetTab?.show) {
          this.handleTabClick(undefined, 0, false);
        } else if (targetTabKey !== undefined) {
          this.handleTabClick(undefined, targetTabKey, false);
        }
      }
    });
    const { initialTabKey } = this.state;
    const initialTab = this.getTabs()[initialTabKey];
    if (initialTab?.isDisabled || !initialTab?.show) {
      this.setState({ initialTabKey: 0 });
      this.handleTabClick(undefined, 0);
    }
  }

  componentDidUpdate() {
    const { activeTabKey, initialTabKey } = this.state;

    if (activeTabKey) {
      const { overviewTabRef } = this.props;
      const activeTab = this.getTabs()[activeTabKey];
      if (!activeTab.show) {
        this.handleTabClick(undefined, 0);
        overviewTabRef.current.hidden = false;
      }
    }

    const initialTab = this.getTabs()[initialTabKey];
    if (initialTabKey !== null && initialTab.show && !initialTab.isDisabled) {
      this.handleTabClick(undefined, initialTabKey);
    }
  }

  componentWillUnmount() {
    this.unlisten();
  }

  getInitTab() {
    const { initTabOpen } = this.props;
    const tabIndex = this.getTabs().findIndex((tab) => tab.id === initTabOpen);
    return tabIndex === -1 ? 0 : tabIndex;
  }

  getTabs() {
    const {
      displayMonitoringTab,
      displayAccessControlTab,
      displayAddOnsTab,
      displayClusterHistoryTab,
      displayNetworkingTab,
      displaySupportTab,
      displayMachinePoolsTab,
      displayUpgradeSettingsTab,
      addHostTabDetails,
      overviewTabRef,
      monitoringTabRef,
      accessControlTabRef,
      addOnsTabRef,
      clusterHistoryTabRef,
      networkingTabRef,
      supportTabRef,
      machinePoolsTabRef,
      upgradeSettingsTabRef,
      addAssistedTabRef,
      hasIssues,
    } = this.props;
    return [
      {
        key: 0,
        title: 'Overview',
        contentId: 'overviewTabContent',
        id: ClusterTabsId.OVERVIEW,
        show: true,
        ref: overviewTabRef,
      },
      {
        key: 1,
        title: (
          <>
            <TabTitleText>Monitoring</TabTitleText>
            {hasIssues && (
              <TabTitleIcon id="monitoring-issues-icon">
                <ExclamationCircleIcon className="danger" />
              </TabTitleIcon>
            )}
          </>
        ),
        contentId: 'monitoringTabContent',
        id: ClusterTabsId.MONITORING,
        show: displayMonitoringTab,
        ref: monitoringTabRef,
      },
      {
        key: 2,
        title: 'Access control',
        id: ClusterTabsId.ACCESS_CONTROL,
        contentId: 'accessControlTabContent',
        show: displayAccessControlTab,
        ref: accessControlTabRef,
      },
      {
        key: 3,
        title: 'Add-ons',
        contentId: 'addOnsTabContent',
        id: ClusterTabsId.ADD_ONS,
        show: displayAddOnsTab,
        ref: addOnsTabRef,
      },
      {
        key: 4,
        title: 'Cluster history',
        contentId: 'clusterHistoryTabContent',
        id: ClusterTabsId.CLUSTER_HISTORY,
        show: displayClusterHistoryTab,
        ref: clusterHistoryTabRef,
      },
      {
        key: 5,
        title: 'Networking',
        contentId: 'networkingTabContent',
        id: ClusterTabsId.NETWORKING,
        show: displayNetworkingTab,
        ref: networkingTabRef,
      },
      {
        key: 6,
        title: 'Machine pools',
        contentId: 'machinePoolsTabContent',
        id: ClusterTabsId.MACHINE_POOLS,
        show: displayMachinePoolsTab,
        ref: machinePoolsTabRef,
      },
      {
        key: 7,
        title: 'Support',
        contentId: 'supportTabContent',
        id: ClusterTabsId.SUPPORT,
        show: displaySupportTab,
        ref: supportTabRef,
      },
      {
        key: 8,
        title: 'Settings',
        contentId: 'upgradeSettingsTabContent',
        id: ClusterTabsId.UPDATE_SETTINGS,
        show: displayUpgradeSettingsTab,
        ref: upgradeSettingsTabRef,
      },
      {
        key: 9,
        title: 'Add Hosts',
        contentId: 'addHostsContent',
        id: ClusterTabsId.ADD_ASSISTED_HOSTS,
        show: addHostTabDetails.showTab,
        ref: addAssistedTabRef,
        isDisabled: addHostTabDetails.isDisabled,
        tooltip: addHostTabDetails.tabTooltip ? (
          <Tooltip content={addHostTabDetails.tabTooltip} />
        ) : undefined,
      },
    ];
  }

  handleTabClick = (event, tabIndex, historyPush = true) => {
    const { onTabSelected, history, location } = this.props;
    const tabs = this.getTabs();
    const { activeTabKey: previousTabKey } = this.state;
    this.setState(
      (state) => ({
        activeTabKey: tabIndex,
        initialTabKey: state.initialTabKey === tabIndex ? null : state.initialTabKey,
      }),
      () => {
        const { initialTabKey, activeTabKey } = this.state;
        if (initialTabKey === null && historyPush) {
          history.push({
            ...(previousTabKey && previousTabKey !== activeTabKey
              ? { pathname: location.pathname }
              : location),
            hash: `#${tabs[tabIndex].id}`,
          });
        }
      },
    );
    tabs.forEach((tab) => {
      if (tab.ref && tab.ref.current) {
        if (tab.key !== tabIndex) {
          // eslint-disable-next-line no-param-reassign
          tab.ref.current.hidden = true;
        } else {
          // eslint-disable-next-line no-param-reassign
          tab.ref.current.hidden = false;
          onTabSelected(tab.id);
        }
      }
    });
  };

  render() {
    const { activeTabKey } = this.state;

    const tabsToDisplay = this.getTabs().filter((tab) => tab.show);
    return (
      <Tabs activeKey={activeTabKey} onSelect={this.handleTabClick}>
        {tabsToDisplay.map((tab) => (
          <Tab
            key={tab.key}
            eventKey={tab.key}
            title={<TabTitleText>{tab.title}</TabTitleText>}
            tabContentId={tab.contentId}
            id={tab.title}
            ouiaId={tab.title}
            isAriaDisabled={tab.isDisabled || false}
            tooltip={tab.tooltip}
          />
        ))}
      </Tabs>
    );
  }
}

TabsRow.propTypes = {
  displayMonitoringTab: PropTypes.bool,
  displayAccessControlTab: PropTypes.bool,
  displayAddOnsTab: PropTypes.bool,
  displayClusterHistoryTab: PropTypes.bool,
  displayNetworkingTab: PropTypes.bool,
  displaySupportTab: PropTypes.bool,
  displayMachinePoolsTab: PropTypes.bool,
  displayUpgradeSettingsTab: PropTypes.bool,
  addHostTabDetails: PropTypes.shape({
    showTab: PropTypes.bool,
    isDisabled: PropTypes.bool,
    tabTooltip: PropTypes.string,
  }),
  overviewTabRef: PropTypes.object.isRequired,
  monitoringTabRef: PropTypes.object.isRequired,
  accessControlTabRef: PropTypes.object.isRequired,
  addOnsTabRef: PropTypes.object.isRequired,
  clusterHistoryTabRef: PropTypes.object.isRequired,
  machinePoolsTabRef: PropTypes.object.isRequired,
  networkingTabRef: PropTypes.object.isRequired,
  supportTabRef: PropTypes.object.isRequired,
  upgradeSettingsTabRef: PropTypes.object.isRequired,
  addAssistedTabRef: PropTypes.object.isRequired,
  hasIssues: PropTypes.bool.isRequired,
  initTabOpen: PropTypes.string,
  onTabSelected: PropTypes.func.isRequired,
  history: PropTypes.object.isRequired,
  location: PropTypes.shape({
    pathname: PropTypes.string.isRequired,
  }).isRequired,
};

TabsRow.defaultProps = {
  displayMonitoringTab: true,
  displayAccessControlTab: false,
  displayAddOnsTab: false,
  displayClusterHistoryTab: false,
  displayNetworkingTab: false,
  displayMachinePoolsTab: false,
  addHostTabDetails: {
    showTab: false,
    isDisabled: false,
    tabTooltip: '',
  },
  initTabOpen: '',
};

export default withRouter(TabsRow);
