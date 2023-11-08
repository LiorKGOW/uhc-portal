import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import get from 'lodash/get';
import { Tabs, Tab, TabTitleText, Card, CardBody } from '@patternfly/react-core';

import OCMRolesSection from './OCMRolesSection';
import UsersSection from './UsersSection';
import IDPSection from './IDPSection';
import NetworkSelfServiceSection from './NetworkSelfServiceSection';
import { isHibernating, isHypershiftCluster } from '../../../common/clusterStates';
import {
  isReadyForAwsAccessActions,
  isReadyForIdpActions,
  isReadyForRoleAccessActions,
} from '../../clusterDetailsHelper';

function AccessControl({ cluster, history, refreshEvent = null }) {
  const [activeKey, setActiveKey] = React.useState(0);

  // class for whether display vertical tabs (wider screen)
  const [isVerticalTab, setIsVerticalTab] = useState(true);
  const [tabClass, setTabClass] = useState('');

  // class for whether display tab titles (hide when there's single tab)
  const [bodyClass, setBodyClass] = useState('');
  const clusterUrls = {
    console: get(cluster, 'console.url'),
    api: get(cluster, 'api.url'),
  };
  // states based on the cluster
  const [isReadOnly, setIsReadOnly] = useState(false);
  const [clusterRolesAndAccessIsHidden, setClusterRolesAndAccessIsHidden] = useState(false);
  const [identityProvidersIsHidden, setIdentityProvidersIsHidden] = useState(false);
  const [AWSInfrastructureAccessIsHidden, setAWSInfrastructureAccessIsHidden] = useState(false);

  // dynamically adjust the tab to be vertical (wider screen) or on the top
  useEffect(() => {
    const minWidthQuery = window.matchMedia ? window.matchMedia('(min-width: 768px)') : null;
    const handler = (e) => {
      if (e.matches) {
        setIsVerticalTab(true);
        setTabClass('');
      } else {
        setIsVerticalTab(false);
        // add the class for displaying the arrow buttons at the end of tab bar
        setTabClass('pf-m-scrollable');
      }
    };
    if (window.matchMedia) {
      // use vertical tab if it's larger than the min-width
      handler(minWidthQuery);
      minWidthQuery.addEventListener('change', handler);
    }
    return () => {
      if (minWidthQuery) {
        minWidthQuery.removeEventListener('change', handler);
      }
    };
  }, []);

  useEffect(() => {
    const hideRolesActions = !isReadyForRoleAccessActions(cluster);
    const hideIdpActions = !isReadyForIdpActions(cluster);
    const hideAwsInfrastructureAccess = !isReadyForAwsAccessActions(cluster);

    setClusterRolesAndAccessIsHidden(hideRolesActions);
    setIdentityProvidersIsHidden(hideIdpActions);
    setAWSInfrastructureAccessIsHidden(hideAwsInfrastructureAccess);
    setIsReadOnly(cluster?.status?.configuration_mode === 'read_only');

    // hide the tab title if there is only one tab ("OCM Roles and Access").
    const isSingleTab = hideRolesActions && hideIdpActions && hideAwsInfrastructureAccess;
    setBodyClass(isSingleTab ? 'single-tab' : '');
  }, [cluster]);

  return (
    <Card>
      <CardBody id="cluster-details-access-control-tab-contents" className={bodyClass}>
        <Tabs
          activeKey={activeKey}
          onSelect={(event, key) => setActiveKey(key)}
          isVertical={isVerticalTab}
          className={tabClass}
          isBox
        >
          <Tab
            eventKey={0}
            id="identity-providers"
            title={<TabTitleText>Identity providers</TabTitleText>}
            isHidden={identityProvidersIsHidden}
          >
            <IDPSection
              clusterID={get(cluster, 'id')}
              isHypershift={isHypershiftCluster(cluster)}
              history={history}
              clusterUrls={clusterUrls}
              idpActions={cluster.idpActions}
              clusterHibernating={isHibernating(cluster)}
              isReadOnly={isReadOnly}
            />
          </Tab>
          <Tab
            eventKey={1}
            id="cluster-roles-access"
            title={<TabTitleText>Cluster Roles and Access</TabTitleText>}
            isHidden={clusterRolesAndAccessIsHidden}
          >
            <UsersSection
              cluster={cluster}
              clusterHibernating={isHibernating(cluster)}
              isReadOnly={isReadOnly}
            />
          </Tab>
          <Tab
            eventKey={2}
            id="ocm-roles-access"
            title={<TabTitleText>OCM Roles and Access</TabTitleText>}
          >
            <OCMRolesSection
              subscription={cluster.subscription}
              canEditOCMRoles={cluster.canEditOCMRoles}
              canViewOCMRoles={cluster.canViewOCMRoles}
              refreshEvent={refreshEvent}
            />
          </Tab>
          <Tab
            eventKey={3}
            id="aws-infra-access"
            isHidden={AWSInfrastructureAccessIsHidden}
            title={<TabTitleText>AWS infrastructure access</TabTitleText>}
          >
            <NetworkSelfServiceSection
              clusterID={get(cluster, 'id')}
              canEdit={cluster.canEdit}
              clusterHibernating={isHibernating(cluster)}
              isReadOnly={isReadOnly}
            />
          </Tab>
        </Tabs>
      </CardBody>
    </Card>
  );
}

AccessControl.propTypes = {
  cluster: PropTypes.object.isRequired,
  history: PropTypes.object,
  refreshEvent: PropTypes.object,
};

export default AccessControl;
