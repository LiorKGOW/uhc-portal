import React from 'react';
import PropTypes from 'prop-types';

import {
  Button,
  EmptyState,
  EmptyStateActions,
  EmptyStateBody,
  EmptyStateFooter,
  EmptyStateHeader,
  EmptyStateIcon,
} from '@patternfly/react-core';
import { CubesIcon } from '@patternfly/react-icons/dist/esm/icons/cubes-icon';
import { PlusCircleIcon } from '@patternfly/react-icons/dist/esm/icons/plus-circle-icon';
import { Spinner } from '@redhat-cloud-services/frontend-components/Spinner';

import ErrorBox from '../../../../common/ErrorBox';

import AddOnsDrawer from './AddOnsDrawer';
import { availableAddOns } from './AddOnsHelper';

class AddOns extends React.Component {
  componentDidMount() {
    const { clusterID, getAddOns, getClusterAddOns, clusterAddOns } = this.props;
    if (!clusterAddOns.pending) {
      getAddOns(clusterID);
      getClusterAddOns(clusterID);
    }
  }

  componentDidUpdate(prevProps) {
    const {
      clusterID,
      getClusterAddOns,
      clusterAddOns,
      addClusterAddOnResponse,
      updateClusterAddOnResponse,
      getOrganizationAndQuota,
      deleteClusterAddOnResponse,
    } = this.props;
    if (
      (addClusterAddOnResponse.fulfilled && prevProps.addClusterAddOnResponse.pending) ||
      (updateClusterAddOnResponse.fulfilled && prevProps.updateClusterAddOnResponse.pending) ||
      (deleteClusterAddOnResponse.fulfilled && prevProps.deleteClusterAddOnResponse.pending)
    ) {
      // Fetch cluster add-ons again if we just added, updated or deleted a cluster add-on
      if (!clusterAddOns.pending) {
        getClusterAddOns(clusterID);
      }
      // Refresh quota after installing, updating or deleting add-ons
      getOrganizationAndQuota();
    }
  }

  componentWillUnmount() {
    const { clearClusterAddOnsResponses } = this.props;
    clearClusterAddOnsResponses();
  }

  render() {
    const {
      addOns,
      cluster,
      clusterAddOns,
      clusterMachinePools,
      addClusterAddOnResponse,
      organization,
      quota,
      isHypershift,
    } = this.props;

    if (isHypershift) {
      return (
        <EmptyState>
          <EmptyStateHeader
            titleText="Coming soon"
            icon={<EmptyStateIcon icon={CubesIcon} />}
            headingLevel="h5"
          />
          <EmptyStateBody>
            Add-ons will be available soon for hosted control plane clusters.
          </EmptyStateBody>
          <EmptyStateFooter>
            <EmptyStateActions>
              <Button
                variant="link"
                onClick={() => {
                  document.location.hash = 'overview';
                }}
              >
                Go back to overview
              </Button>
            </EmptyStateActions>
          </EmptyStateFooter>
        </EmptyState>
      );
    }

    if (clusterAddOns.pending && clusterAddOns.items.length === 0) {
      return (
        <EmptyState>
          <EmptyStateBody>
            <Spinner centered />
          </EmptyStateBody>
        </EmptyState>
      );
    }

    const addOnsList = availableAddOns(addOns, cluster, clusterAddOns, organization, quota);
    const hasAddOns = addOnsList.length > 0;

    if (!hasAddOns) {
      return (
        <EmptyState>
          <EmptyStateHeader
            titleText="No add-ons available for this cluster"
            icon={<EmptyStateIcon icon={PlusCircleIcon} />}
            headingLevel="h5"
          />
          {addOns.error && <ErrorBox message="Error getting add-ons" response={addOns} />}

          <EmptyStateBody>There are no add-ons available for this cluster.</EmptyStateBody>
        </EmptyState>
      );
    }

    if (clusterAddOns.error) {
      return (
        <EmptyState>
          <ErrorBox message="Error getting cluster add-ons" response={clusterAddOns} />
        </EmptyState>
      );
    }

    return (
      <>
        {addClusterAddOnResponse.error && (
          <ErrorBox message="Error adding add-ons" response={addClusterAddOnResponse} />
        )}
        <AddOnsDrawer
          addOnsList={addOnsList}
          clusterAddOns={clusterAddOns}
          cluster={cluster}
          clusterMachinePools={clusterMachinePools}
          organization={organization}
          quota={quota}
        />
      </>
    );
  }
}

AddOns.propTypes = {
  clusterID: PropTypes.string.isRequired,
  cluster: PropTypes.object.isRequired,
  addOns: PropTypes.object.isRequired,
  clusterAddOns: PropTypes.object.isRequired,
  clusterMachinePools: PropTypes.object.isRequired,
  organization: PropTypes.object.isRequired,
  quota: PropTypes.object.isRequired,
  getOrganizationAndQuota: PropTypes.func.isRequired,
  getClusterAddOns: PropTypes.func.isRequired,
  addClusterAddOnResponse: PropTypes.object.isRequired,
  updateClusterAddOnResponse: PropTypes.object.isRequired,
  deleteClusterAddOnResponse: PropTypes.object.isRequired,
  clearClusterAddOnsResponses: PropTypes.func.isRequired,
  getAddOns: PropTypes.func.isRequired,
  isHypershift: PropTypes.bool.isRequired,
};

export default AddOns;
