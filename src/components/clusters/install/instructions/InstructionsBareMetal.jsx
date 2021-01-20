import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardBody, Title } from '@patternfly/react-core';
import { UserIcon, ConnectedIcon, SyncAltIcon } from '@patternfly/react-icons';
import CardBadge from '../../common/CardBadge';

export const InstructionsBareMetal = () => (
  <Card>
    <div className="pf-c-content ocm-page">
      <Title headingLevel="h3" size="2xl">
        Bare Metal: Select an installation type
      </Title>
      <div className="flex-container">
        <Link to="/assisted-installer/clusters/~new" className="ocm-c-ipi-upi-infra-card infra-card pf-c-card">
          <CardBadge isDevPreview />
          <CardBody className="ocm-c-ipi-upi-infra-card--body">
            <ConnectedIcon
              alt="Installer-Provisioned Infrastructure"
            />
            <Title headingLevel="h3" size="lg">Assisted Bare Metal Installer</Title>
            {' '}
            Deploy an OpenShift 4.6 cluster on your own infrastructure using a Discovery ISO
            that makes it easy to connect discovered hardware.
          </CardBody>
        </Link>
        <Link to="/create/metal/installer-provisioned" className="ocm-c-ipi-upi-infra-card infra-card pf-c-card">
          <CardBadge isRecommened />
          <CardBody className="ocm-c-ipi-upi-infra-card--body">
            <SyncAltIcon
              alt="Installer-Provisioned Infrastructure"
            />
            <Title headingLevel="h3" size="lg">Installer-provisioned infrastructure</Title>
            {' '}
            Deploy an OpenShift cluster on infrastructure that the installation program
            provisions and the cluster maintains.
          </CardBody>
        </Link>
        <Link to="/create/metal/user-provisioned" className="ocm-c-ipi-upi-infra-card infra-card pf-c-card">
          <CardBadge isHidden />
          <CardBody className="ocm-c-ipi-upi-infra-card--body">
            <UserIcon
              alt="User-Provisioned Infrastructure"
            />
            <Title headingLevel="h3" size="lg">User-provisioned infrastructure</Title>
            Deploy an OpenShift cluster on infrastructure that you prepare and maintain.
          </CardBody>
        </Link>
      </div>
    </div>
  </Card>
);

export default InstructionsBareMetal;
