import React from 'react';
import {
  Text,
} from '@patternfly/react-core';

import PropTypes from 'prop-types';
import DownloadAndOSSelection from './DownloadAndOSSelection';
import { downloadButtonModes } from './DownloadButton';

const CLISection = ({
  token, pendoID, channel, isBMIPI,
}) => (
  <>
    <Text component="p">
      Download the OpenShift command-line tools and add them to your
      {' '}
      <code>PATH</code>
      .
    </Text>
    <div>
      <DownloadAndOSSelection
        token={token}
        pendoID={pendoID}
        channel={channel}
        mode={downloadButtonModes.CLI_TOOLS}
      />
    </div>
    <Text component="p" />
    {!isBMIPI && (
    <Text component="p">
      When the installer is complete you will see the console URL and credentials for
      accessing your new cluster. A
      {' '}
      <code>kubeconfig</code>
      {' '}
      file will also be generated for you to use with the
      {' '}
      <code>oc</code>
      {' '}
      CLI tools you downloaded.
    </Text>
    )}
  </>
);
CLISection.propTypes = {
  pendoID: PropTypes.string,
  token: PropTypes.object.isRequired,
  channel: PropTypes.string.isRequired,
  isBMIPI: PropTypes.bool,
};

CLISection.propTypes = {
  isBMIPI: false,
};

export default CLISection;
