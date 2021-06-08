import React from 'react';
import PropTypes from 'prop-types';
import {
  Button,
} from '@patternfly/react-core';

import { trackPendo } from '../../../../../common/helpers';
import { tools } from '../../../../../common/installLinks';

const texts = {
  [tools.CRC]: 'Download CodeReady Containers',
  [tools.CLI_TOOLS]: 'Download command-line tools',
  [tools.INSTALLER]: 'Download installer',
};

const pendoEvents = {
  [tools.CRC]: 'OCP-Download-CRC',
  [tools.CLI_TOOLS]: 'OCP-Download-CLITools',
  [tools.INSTALLER]: 'OCP-Download-Installer',
};

const DownloadButton = ({
  token,
  url,
  disabled = false,
  tool = tools.INSTALLER,
  pendoID,
  text = '',
  name = '',
}) => {
  const buttonText = text || texts[tool];
  const event = name || pendoEvents[tool];

  return (
    <Button
      component="a"
      href={url}
      variant="secondary"
      className="install--download-installer"
      onClick={() => {
        trackPendo(event, pendoID);
      }}
      disabled={!!token.error || disabled}
      download
    >
      {buttonText}
    </Button>
  );
};
DownloadButton.propTypes = {
  token: PropTypes.object.isRequired,
  pendoID: PropTypes.string,
  url: PropTypes.string,
  disabled: PropTypes.bool,
  tool: PropTypes.oneOf(Object.keys(tools)),
  text: PropTypes.string,
  name: PropTypes.string,
};

export default DownloadButton;
