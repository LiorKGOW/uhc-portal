import React from 'react';
import PropTypes from 'prop-types';
import { Tooltip } from '@patternfly/react-core';

import get from 'lodash/get';

import { normalizedProducts } from '../../../common/subscriptionTypes';

function ClusterTypeLabel({ cluster }) {
  const clusterTypes = {
    [normalizedProducts.OCP]: {
      name: 'OCP',
      tooltip: 'Self-managed OpenShift Container Platform (OCP) cluster',
    },
    [normalizedProducts.OSD]: {
      name: 'OSD',
      tooltip: 'OpenShift Dedicated (OSD) cluster managed by Red Hat',
    },
    [normalizedProducts.RHMI]: {
      name: 'RHMI',
      tooltip: 'Red Hat Managed Integration',
    },
    [normalizedProducts.ROSA]: {
      name: 'ROSA',
      tooltip: 'Red Hat OpenShift Service on AWS',
    },
    [normalizedProducts.ARO]: {
      name: 'ARO',
      tooltip: 'Red Hat OpenShift Service on Azure',
    },
    [normalizedProducts.UNKNOWN]: {
      name: 'N/A',
      tooltip: 'Not Available',
    },
  };

  const typeId = get(cluster, 'product.id', normalizedProducts.UNKNOWN);
  const type = clusterTypes[typeId] || clusterTypes[normalizedProducts.UNKNOWN];
  return (
    <Tooltip
      content={type.tooltip}
    >
      <span>
        {type.name}
      </span>
    </Tooltip>
  );
}

ClusterTypeLabel.propTypes = {
  cluster: PropTypes.shape({
    product: PropTypes.shape({
      id: PropTypes.oneOf(Object.keys(normalizedProducts)).isRequired,
    }),
  }),
};

export default ClusterTypeLabel;
