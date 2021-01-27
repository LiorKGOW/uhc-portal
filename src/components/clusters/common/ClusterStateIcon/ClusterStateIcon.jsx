// ClusterStateIcon matches a cluster state from the API to the matching icon

import React from 'react';
import PropTypes from 'prop-types';
import {
  CheckCircleIcon,
  DisconnectedIcon,
  UnknownIcon,
  ExclamationCircleIcon,
  InProgressIcon,
  BanIcon,
  FolderOpenIcon,
} from '@patternfly/react-icons';
// need to disable eslint for the react tokens because it's silly - it warns about these names
// eslint-disable-next-line camelcase
import { global_danger_color_100, global_success_color_100 } from '@patternfly/react-tokens';
import { Spinner } from '@patternfly/react-core';
import clusterStates from '../clusterStates';

function ClusterStateIcon(props) {
  const { clusterState, animated } = props;

  const iconProps = {
    className: 'clusterstate',
    size: 'sm',
  };

  // Icons from http://openshift.github.io/openshift-origin-design/web-console/4.0-designs/status/status
  switch (clusterState) {
    case clusterStates.PENDING:
    case clusterStates.INSTALLING:
    case clusterStates.UPDATING:
      if (animated) {
        return <Spinner {...iconProps} />;
      }
      return <InProgressIcon {...iconProps} />;
    case clusterStates.DISCONNECTED:
      return <DisconnectedIcon {...iconProps} />;
    case clusterStates.READY:
      return <CheckCircleIcon color={global_success_color_100.value} {...iconProps} />;
    case clusterStates.UNINSTALLING:
      if (animated) {
        return <Spinner {...iconProps} />;
      }
      return <InProgressIcon {...iconProps} />;
    case clusterStates.ERROR:
      return <ExclamationCircleIcon color={global_danger_color_100.value} {...iconProps} />;
    case clusterStates.DEPROVISIONED:
      return <BanIcon {...iconProps} />;
    case clusterStates.ARCHIVED:
      return <FolderOpenIcon {...iconProps} />;
    default:
      return <UnknownIcon {...iconProps} />;
  }
}

ClusterStateIcon.propTypes = {
  clusterState: PropTypes.string.isRequired,
  animated: PropTypes.bool,
};
ClusterStateIcon.defaultProps = {
  animated: false,
};
export default ClusterStateIcon;
