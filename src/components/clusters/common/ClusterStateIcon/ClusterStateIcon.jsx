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
  AsleepIcon,
  NotStartedIcon,
} from '@patternfly/react-icons';

// eslint-disable-next-line camelcase
import { global_danger_color_100, global_success_color_100 } from '@patternfly/react-tokens';
import { Spinner, spinnerSize } from '@patternfly/react-core';
import clusterStates from '../clusterStates';

function ClusterStateIcon(props) {
  const { clusterState, animated, limitedSupport } = props;

  const iconProps = {
    className: 'clusterstate',
    size: 'sm',
  };

  if (limitedSupport && clusterState !== clusterStates.ERROR) {
    return <ExclamationCircleIcon color={global_danger_color_100.value} {...iconProps} />;
  }

  switch (clusterState) {
    case clusterStates.WAITING:
    case clusterStates.PENDING:
    case clusterStates.INSTALLING:
    case clusterStates.VALIDATING:
    case clusterStates.UPDATING:
    case clusterStates.POWERING_DOWN:
    case clusterStates.RESUMING:
      if (animated) {
        return <Spinner {...iconProps} size={spinnerSize.md} />;
      }
      return <InProgressIcon {...iconProps} data-icon-type="inprogress" />;
    case clusterStates.DISCONNECTED:
      return <DisconnectedIcon {...iconProps} />;
    case clusterStates.READY:
      return (
        <CheckCircleIcon
          color={global_success_color_100.value}
          {...iconProps}
          data-icon-type="check"
        />
      );
    case clusterStates.UNINSTALLING:
      if (animated) {
        return <Spinner {...iconProps} size={spinnerSize.md} />;
      }
      return <InProgressIcon {...iconProps} data-icon-type="inprogress" />;
    case clusterStates.ERROR:
      return (
        <ExclamationCircleIcon
          color={global_danger_color_100.value}
          {...iconProps}
          data-icon-type="exclamation"
        />
      );
    case clusterStates.DEPROVISIONED:
      return <BanIcon {...iconProps} />;
    case clusterStates.ARCHIVED:
      return <FolderOpenIcon {...iconProps} />;
    case clusterStates.HIBERNATING:
      return <AsleepIcon {...iconProps} />;
    case clusterStates.STALE:
      return <NotStartedIcon {...iconProps} />;
    default:
      return <UnknownIcon {...iconProps} data-icon-type="unknown" />;
  }
}

ClusterStateIcon.propTypes = {
  clusterState: PropTypes.string,
  limitedSupport: PropTypes.bool,
  animated: PropTypes.bool,
};
ClusterStateIcon.defaultProps = {
  animated: false,
};
export default ClusterStateIcon;
