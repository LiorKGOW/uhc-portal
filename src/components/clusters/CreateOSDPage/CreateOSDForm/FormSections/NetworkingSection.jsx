import PropTypes from 'prop-types';
import React from 'react';
import { Field } from 'redux-form';
import {
  GridItem, FormGroup, Title, Alert,
} from '@patternfly/react-core';

import { constants } from '../CreateOSDFormConstants';
import RadioButtons from '../../../../common/ReduxFormComponents/RadioButtons';
import validators from '../../../../../common/validators';
import ReduxVerticalFormGroup from '../../../../common/ReduxFormComponents/ReduxVerticalFormGroup';
import './NetworkingSection.scss';

const machineDisjointSubnets = validators.disjointSubnets('network_machine_cidr');
const serviceDisjointSubnets = validators.disjointSubnets('network_service_cidr');
const podDisjointSubnets = validators.disjointSubnets('network_pod_cidr');
const awsMachineSingleAZSubnetMask = validators.awsSubnetMask('network_machine_cidr_single_az');
const awsMachineMultiAZSubnetMask = validators.awsSubnetMask('network_machine_cidr_multi_az');
const awsServiceSubnetMask = validators.awsSubnetMask('network_service_cidr');

function NetworkingSection({
  pending,
  toggleNetwork,
  mode,
  showClusterPrivacy,
  privateClusterSelected,
  cloudProviderID,
  isMultiAz,
}) {
  const formatHostPrefix = (value) => {
    if (value && value.charAt(0) !== '/') {
      return `/${value}`;
    }
    return value;
  };

  const normalizeHostPrefix = (value) => {
    if (value && value.charAt(0) === '/') {
      return value.substring(1);
    }
    return value;
  };

  const machineCidrValidators = [
    validators.cidr,
    cloudProviderID === 'aws' && validators.awsMachineCidr,
    cloudProviderID === 'gcp' && validators.gcpMachineCidr,
    validators.validateRange,
    machineDisjointSubnets,
    validators.disjointFromDockerRange,
    cloudProviderID === 'aws' && !isMultiAz && awsMachineSingleAZSubnetMask,
    cloudProviderID === 'aws' && isMultiAz && awsMachineMultiAZSubnetMask,
    cloudProviderID === 'gcp' && validators.privateAddress,
  ].filter(Boolean);

  const serviceCidrValidators = [
    validators.cidr,
    validators.serviceCidr,
    validators.validateRange,
    serviceDisjointSubnets,
    validators.disjointFromDockerRange,
    cloudProviderID === 'aws' && awsServiceSubnetMask,
    cloudProviderID === 'gcp' && validators.privateAddress,
  ].filter(Boolean);

  const podCidrValidators = [
    validators.cidr,
    validators.podCidr,
    validators.validateRange,
    podDisjointSubnets,
    validators.disjointFromDockerRange,
    cloudProviderID === 'gcp' && validators.privateAddress,
  ].filter(Boolean);

  const awsMachineCIDRMax = isMultiAz
    ? validators.AWS_MACHINE_CIDR_MAX_MULTI_AZ
    : validators.AWS_MACHINE_CIDR_MAX_SINGLE_AZ;

  return (
    <>
      <GridItem span={4}>
        <Title headingLevel="h4" size="xl">Networking</Title>
      </GridItem>
      <FormGroup
        label="Network configuration"
        isRequired
        fieldId="network_configuration_toggle"
      >
        <Field
          component={RadioButtons}
          className="radio-button"
          name="network_configuration_toggle"
          disabled={pending}
          onChange={toggleNetwork}
          options={[{
            value: 'basic',
            ariaLabel: 'Advanced',
            label: (
              <>
                Basic
                <div className="radio-helptext">Creates a new VPC for your cluster using default values.</div>
              </>),
          },
          {
            value: 'advanced',
            ariaLabel: 'Advanced',
            label: (
              <>
                Advanced
                <div className="radio-helptext">
                Choose this option if you will ever need direct,
                private network connectivity to your cluster, e.g. VPN or VPC peering.
                </div>
              </>
            ),
          }]}
          defaultValue="basic"
        />
      </FormGroup>
      { mode === 'advanced'
        && (
          <>
            <GridItem span={5}>
              <Alert
                id="advanced-networking-alert"
                isInline
                variant="info"
                title="CIDR ranges may not be changed once the cluster has been created."
              >
                 The machine, service and pod ranges may not overlap. The addresses must specify a
                 range, and correspond to the first IP address in their subnet.
                { cloudProviderID === 'gcp'
                 && (
                   <>
                     <br />
                     <span>
                      All addresses must be private IPv4 addresses, and belong to one of the
                      following ranges:
                       <ul>
                         <li>10.0.0.0 – 10.255.255.255</li>
                         <li>172.16.0.0 – 172.31.255.255</li>
                         <li>192.168.0.0 – 192.168.255.255</li>
                       </ul>
                     </span>
                   </>
                 )}
              </Alert>
            </GridItem>
            <GridItem span={5} />
            <GridItem span={4}>
              <Field
                component={ReduxVerticalFormGroup}
                name="network_machine_cidr"
                label="Machine CIDR"
                placeholder="10.0.0.0/16"
                type="text"
                validate={machineCidrValidators}
                disabled={pending}
                helpText={cloudProviderID === 'aws' ? `Subnet mask must be between /${validators.AWS_MACHINE_CIDR_MIN} and /${awsMachineCIDRMax}.` : `Range must be private. Subnet mask must be at most /${validators.GCP_MACHINE_CIDR_MAX}.`}
                extendedHelpText={constants.machineCIDRHint}
                showHelpTextOnError={false}
              />
            </GridItem>
            <GridItem span={8} />
            <GridItem span={4}>
              <Field
                component={ReduxVerticalFormGroup}
                name="network_service_cidr"
                label="Service CIDR"
                placeholder="172.30.0.0/16"
                type="text"
                validate={serviceCidrValidators}
                disabled={pending}
                helpText={cloudProviderID === 'aws' ? `Subnet mask must be at most /${validators.SERVICE_CIDR_MAX}.` : `Range must be private. Subnet mask must be at most /${validators.SERVICE_CIDR_MAX}.`}
                extendedHelpText={constants.serviceCIDRHint}
                showHelpTextOnError={false}
              />
            </GridItem>
            <GridItem span={8} />
            <GridItem span={4}>
              <Field
                component={ReduxVerticalFormGroup}
                name="network_pod_cidr"
                label="Pod CIDR"
                placeholder={`10.128.0.0/${cloudProviderID === 'aws' ? '16' : '14'}`}
                type="text"
                validate={podCidrValidators}
                disabled={pending}
                helpText={cloudProviderID === 'aws' ? `Subnet mask must allow for at least ${validators.POD_NODES_MIN} nodes.` : `Range must be private. Subnet mask must allow for at least ${validators.POD_NODES_MIN} nodes.`}
                extendedHelpText={constants.podCIDRHint}
                showHelpTextOnError={false}
              />
            </GridItem>
            <GridItem span={8} />
            <GridItem span={4}>
              <Field
                component={ReduxVerticalFormGroup}
                name="network_host_prefix"
                label="Host prefix"
                placeholder="/23"
                type="text"
                format={formatHostPrefix}
                normalize={normalizeHostPrefix}
                validate={validators.hostPrefix}
                disabled={pending}
                helpText={`Must be between /${validators.HOST_PREFIX_MIN} and /${validators.HOST_PREFIX_MAX}.`}
                extendedHelpText={constants.hostPrefixHint}
                showHelpTextOnError={false}
              />
            </GridItem>
            { showClusterPrivacy && (
              <>
                <Title headingLevel="h4" size="xl" className="privacy-heading">Cluster privacy</Title>
                <GridItem span={8}>
                  <p>
                  Clusters may be created initially with master API endpoint
                  and application routes being all public or all private.
                  More options are available after the initial installation.
                  </p>
                </GridItem>
                <Field
                  component={RadioButtons}
                  name="cluster_privacy"
                  ariaLabel="Cluster privacy"
                  disabled={pending}
                  options={[{
                    value: 'external',
                    ariaLabel: 'Public',
                    label: (
                      <>
                  Public (recommended)
                        <div className="radio-helptext">Master API endpoint and application routes are accessible from the internet.</div>
                      </>),
                  },
                  {
                    value: 'internal',
                    ariaLabel: 'Private',
                    label: (
                      <>
                      Private
                        <div className="radio-helptext">
                        Master API endpoint and application routes are restricted to direct,
                        private connectivity.
                        </div>
                      </>
                    ),
                  }]}
                  defaultValue="external"
                />
                {privateClusterSelected && (
                <Alert className="bottom-alert" variant="warning" isInline title="You will not be able to access your cluster until you edit network settings in your cloud provider.">
                  Follow the
                  {' '}
                  <a rel="noreferrer noopener" target="_blank" href="https://docs.openshift.com/dedicated/4/cloud_infrastructure_access/dedicated-understanding-aws.html">documentation</a>
                  {' '}
                  for how to do that.
                </Alert>
                )}
              </>
            )}
          </>
        )}
    </>
  );
}

NetworkingSection.propTypes = {
  pending: PropTypes.bool,
  mode: PropTypes.string,
  toggleNetwork: PropTypes.func,
  showClusterPrivacy: PropTypes.bool,
  privateClusterSelected: PropTypes.bool,
  cloudProviderID: PropTypes.string,
  isMultiAz: PropTypes.bool,
};

export default NetworkingSection;
