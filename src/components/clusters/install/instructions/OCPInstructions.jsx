import React from 'react';
import PropTypes from 'prop-types';

import { Card, CardBody, Text } from '@patternfly/react-core';

import { channels, tools } from '../../../../common/installLinks.mjs';
import Instruction from '../../../common/Instruction';
import Instructions from '../../../common/Instructions';

import DownloadsAndPullSecretSection from './components/DownloadsAndPullSecretSection';
import GetStarted from './components/GetStarted';
import SubscriptionAndSupport from './components/SubscriptionAndSupport';
import TokenErrorAlert from './components/TokenErrorAlert';
import instructionsMapping from './instructionsMapping';

const OCPInstructions = (props) => {
  const {
    token,
    cloudProviderID,
    installationTypeId,
    rhcos,
    installer = tools.X86INSTALLER,
    channel,
    docURL,
    customizations = '',
    showPreReleaseDocs,
    preReleasePageLink,
    isBMIPI,
    isUPI,
    showPreReleasePageLink,
    prerequisites,
  } = props;
  const pendoID = window.location.pathname;
  const getStartedTitleText = instructionsMapping[cloudProviderID]?.publicCloud
    ? `Follow the documentation to configure your ${instructionsMapping[cloudProviderID].cloudProvider} account and run the installer`
    : 'Follow the instructions to configure your environment and install your cluster';
  return (
    <Card ouiaId={`${cloudProviderID}${installationTypeId ? '-'.concat(installationTypeId) : ''}`}>
      <CardBody>
        {token.error && (
          <>
            <TokenErrorAlert token={token} />
            <div className="pf-v5-u-mb-lg" />
          </>
        )}
        <Instructions>
          <Instruction>
            <DownloadsAndPullSecretSection
              showPreReleaseDocs={showPreReleaseDocs}
              preReleasePageLink={preReleasePageLink}
              token={token}
              pendoID={pendoID}
              cloudProviderID={cloudProviderID}
              rhcos={rhcos}
              tool={installer}
              channel={channel}
              isBMIPI={isBMIPI}
              showPreReleasePageLink={showPreReleasePageLink}
            />
          </Instruction>
          <Instruction>
            <Text component="h2">{getStartedTitleText}</Text>
            <GetStarted
              docURL={docURL}
              pendoID={pendoID}
              cloudProviderID={cloudProviderID}
              customizations={customizations}
              prerequisites={prerequisites}
              isBMIPI={isBMIPI}
              isUPI={isUPI}
            />
          </Instruction>
          <Instruction>
            <SubscriptionAndSupport />
          </Instruction>
        </Instructions>
      </CardBody>
    </Card>
  );
};

OCPInstructions.propTypes = {
  token: PropTypes.object.isRequired,
  cloudProviderID: PropTypes.string.isRequired,
  installationTypeId: PropTypes.string,
  rhcos: PropTypes.object,
  installer: PropTypes.oneOf(Object.values(tools)),
  channel: PropTypes.oneOf(Object.values(channels)).isRequired,
  docURL: PropTypes.string.isRequired,
  showPreReleaseDocs: PropTypes.bool,
  preReleasePageLink: PropTypes.string,
  customizations: PropTypes.string,
  prerequisites: PropTypes.string,
  isBMIPI: PropTypes.bool,
  isUPI: PropTypes.bool,
  showPreReleasePageLink: PropTypes.bool,
};

OCPInstructions.defaultProps = {
  isBMIPI: false,
  isUPI: false,
};

export default OCPInstructions;
