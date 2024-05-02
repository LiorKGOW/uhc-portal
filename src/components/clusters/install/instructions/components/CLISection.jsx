import React from 'react';
import PropTypes from 'prop-types';

import { Text } from '@patternfly/react-core';

import { channels, tools } from '../../../../../common/installLinks.mjs';

import DownloadAndOSSelection from './DownloadAndOSSelection';

const CLISection = ({ pendoID, channel, isBMIPI = false }) => (
  <>
    <Text component="p">
      Download the OpenShift command-line tools and add them to your <code>PATH</code>.
    </Text>
    <div>
      <DownloadAndOSSelection pendoID={pendoID} tool={tools.OC} channel={channel} />
    </div>
    <Text component="p" />
    {!isBMIPI && (
      <Text component="p">
        When the installer is complete you will see the console URL and credentials for accessing
        your new cluster. A <code>kubeconfig</code> file will also be generated for you to use with
        the <code>oc</code> CLI tools you downloaded.
      </Text>
    )}
  </>
);
CLISection.propTypes = {
  pendoID: PropTypes.string,
  channel: PropTypes.oneOf(Object.values(channels)).isRequired,
  isBMIPI: PropTypes.bool,
};

export default CLISection;
