import React from 'react';
import PropTypes from 'prop-types';
import {
  PageSection,
  Title,
  Button,
  Stack,
  StackItem,
  Popover,
  SplitItem,
  Split,
} from '@patternfly/react-core';
import {
  Table as TableDeprecated,
  TableHeader as TableHeaderDeprecated,
  TableBody as TableBodyDeprecated,
} from '@patternfly/react-table/deprecated';
import { Link } from 'react-router-dom-v5-compat';
import OutlinedQuestionCircleIcon from '@patternfly/react-icons/dist/esm/icons/outlined-question-circle-icon';

const ocpTableColumns = ['Infrastructure provider', 'Installation options'];
const ocpTableRows = [
  [
    <Link to="/install/metal">Bare Metal (x86_64)</Link>,
    'Full stack automation and pre-existing infrastructure',
  ],
  [
    <Link to="/install/arm">Bare Metal (ARM)</Link>,
    'Full stack automation and pre-existing infrastructure',
  ],
  [
    <Link to="/install/azure-stack-hub">Azure Stack Hub</Link>,
    'Full stack automation and pre-existing infrastructure',
  ],
  [
    <Link to="/install/ibmz">IBM Z (s390x)</Link>,
    'Full stack automation and pre-existing infrastructure',
  ],
  [
    <Link to="/install/power">IBM Power (ppc64le)</Link>,
    'Full stack automation and pre-existing infrastructure',
  ],
  [
    <Link to="/install/nutanix">Nutanix AOS</Link>,
    'Full stack automation and pre-existing infrastructure',
  ],
  [
    <Link to="/install/openstack">Red Hat OpenStack</Link>,
    'Full stack automation and pre-existing infrastructure',
  ],
  [
    <Link to="/install/vsphere">vSphere</Link>,
    'Full stack automation and pre-existing infrastructure',
  ],
  [
    <Link to="/install/platform-agnostic">Platform agnostic (x86_64)</Link>,
    'Pre-existing infrastructure',
  ],
];

const DatacenterTab = ({ assistedInstallerFeature }) => (
  <>
    {assistedInstallerFeature && (
      <PageSection variant="light" className="pf-v5-u-p-lg">
        <Stack hasGutter>
          <StackItem>
            <Title headingLevel="h2" className="ocm-ocp-datacenter-title">
              Assisted Installer
            </Title>
          </StackItem>
          <StackItem>
            The easiest way to install OpenShift on your own infrastructure with step-by-step
            guidance, preflight validations, and smart defaults. This method supports multiple
            architectures.
          </StackItem>
          <StackItem>
            <Split hasGutter>
              <SplitItem>
                <Button component={Link} to="/assisted-installer/clusters/~new">
                  Create cluster
                </Button>
              </SplitItem>
              <SplitItem className="pf-v5-u-align-self-center">
                <Link to="/install/metal/agent-based">Run Agent-based Installer locally</Link>
                <Popover bodyContent="Runs Assisted Installer securely and locally to create clusters in disconnected or air-gapped environments.">
                  <Button variant="plain" onClick={(e) => e.preventDefault()}>
                    <OutlinedQuestionCircleIcon />
                  </Button>
                </Popover>
              </SplitItem>
            </Split>
          </StackItem>
        </Stack>
      </PageSection>
    )}
    <PageSection>
      <Stack hasGutter>
        <StackItem>
          <Title headingLevel="h2">
            {assistedInstallerFeature ? 'Other datacenter options' : 'datacenter options'}
          </Title>
        </StackItem>
        <StackItem>
          Create clusters on supported infrastructure using our extensive documentation and
          installer program.
        </StackItem>
        <StackItem>
          <TableDeprecated
            className="install-options-table"
            aria-label="Installation options table"
            cells={ocpTableColumns}
            rows={ocpTableRows}
          >
            <TableHeaderDeprecated />
            <TableBodyDeprecated />
          </TableDeprecated>
        </StackItem>
      </Stack>
    </PageSection>
  </>
);

DatacenterTab.propTypes = {
  assistedInstallerFeature: PropTypes.bool,
};

export default DatacenterTab;
