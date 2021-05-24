import React from 'react';
import PropTypes from 'prop-types';
import {
  Title,
  GridItem,
} from '@patternfly/react-core';
import { Field } from 'redux-form';
import ReduxCheckbox from '../../../../../common/ReduxFormComponents/ReduxCheckbox';
import SubnetFields from './SubnetFields';
import PopoverHint from '../../../../../common/PopoverHint';
import ExternalLink from '../../../../../common/ExternalLink';
import GCPNetworkConfigSection from './GCPNetworkConfigSection';

function InstallToVPC({
  selectedRegion, isMultiAz, selected, cloudProviderID,
}) {
  return (
    <>
      <GridItem span={4}>
        <Field
          component={ReduxCheckbox}
          name="install_to_vpc"
          label="Install into an existing VPC"
        />
      </GridItem>

      <GridItem span={8} />
      {
          selected && cloudProviderID === 'aws' && (
            <>
              <GridItem span={12}>
                <Title headingLevel="h4" size="md">
                  Existing VPC
                  <PopoverHint
                    iconClassName="pf-u-ml-sm"
                    hint={(
                      <>
                        Your VPC must have public and private subnets.
                        Public subnets are associated with appropriate Ingress rules.
                        Private subnets need appropriate routes and tables.
                        {' '}
                        <ExternalLink href="https://docs.openshift.com/container-platform/latest/installing/installing_aws/installing-aws-vpc.html">Learn more about installing into an existing VPC</ExternalLink>
                      </>
                  )}
                  />
                </Title>
                To install into an existing VPC you need to ensure that your VPC is configured
                with a public and a private subnet for each availability zone that you want
                the cluster installed into.
              </GridItem>
              <SubnetFields
                isMultiAz={isMultiAz}
                selectedRegion={selectedRegion}
              />
            </>
          )
        }
      {
          selected && cloudProviderID === 'gcp' && (
            <>
              <GridItem span={12}>
                <Title headingLevel="h4" size="md">
                  Existing VPC
                  <PopoverHint
                    iconClassName="pf-u-ml-sm"
                    hint={(
                      <>
                        {'Your VPC must have control plane and compute subnets. The control plane subnet is where you deploy your control plane machines to. The compute subnet is where you deploy your compute machines to. '}
                        {' '}
                        <ExternalLink href="https://docs.openshift.com/container-platform/4.6/installing/installing_gcp/installing-gcp-vpc.html">Learn more about installing into an existing VPC</ExternalLink>
                      </>
                  )}
                  />
                </Title>
                To install into an existing VPC you need to ensure that your VPC is configured
                with a control plane subnet and compute subnet.
              </GridItem>

              <GCPNetworkConfigSection />

            </>
          )
      }
    </>
  );
}

InstallToVPC.propTypes = {
  selectedRegion: PropTypes.string,
  isMultiAz: PropTypes.bool,
  selected: PropTypes.bool,
  cloudProviderID: PropTypes.string,
};

export default InstallToVPC;
