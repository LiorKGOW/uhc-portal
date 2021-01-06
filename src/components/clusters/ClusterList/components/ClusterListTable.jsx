import get from 'lodash/get';
import PropTypes from 'prop-types';
import React from 'react';
import {
  Popover,
  PopoverPosition,
  Button,
} from '@patternfly/react-core';
import {
  Table,
  TableHeader,
  TableBody,
  sortable,
  classNames,
  Visibility,
  SortByDirection,
  cellWidth,
} from '@patternfly/react-table';

import { Link } from 'react-router-dom';
import ClusterStateIcon from '../../common/ClusterStateIcon/ClusterStateIcon';
import ClusterLocationLabel from '../../common/ClusterLocationLabel/ClusterLocationLabel';
import clusterStates, { getClusterStateAndDescription } from '../../common/clusterStates';
import ClusterUpdateLink from '../../common/ClusterUpdateLink';
import ClusterCreatedIndicator from './ClusterCreatedIndicator';
import getClusterName from '../../../../common/getClusterName';
import { actionResolver } from '../../common/ClusterActionsDropdown/ClusterActionsDropdownItems';
import skeletonRows from '../../../common/SkeletonRows';
import ClusterTypeLabel from '../../common/ClusterTypeLabel';
import ProgressList from '../../common/InstallProgress/ProgressList';


function ClusterListTable(props) {
  const {
    viewOptions, setSorting, clusters, openModal, isPending, setClusterDetails,
    canSubscribeOCPList = {}, canTransferClusterOwnershipList = {}, toggleSubscriptionReleased,
  } = props;
  if (!isPending && (!clusters || clusters.length === 0)) {
    return <p className="notfound">No results match the filter criteria.</p>;
  }

  const sortBy = {
    index: 0, // TODO support more fields
    direction: viewOptions.sorting.isAscending ? SortByDirection.asc : SortByDirection.desc,
  };

  const onSortToggle = (_event, _index, direction) => {
    const sorting = { ...viewOptions.sorting };
    sorting.isAscending = direction === SortByDirection.asc;
    sorting.sortField = 'name'; // TODO support more fields
    setSorting(sorting);
  };

  const clusterRow = (cluster) => {
    const provider = get(cluster, 'cloud_provider.id', 'N/A');

    const clusterName = (
      <Link to={`/details/${cluster.id}`} onClick={() => setClusterDetails(cluster)}>
        {getClusterName(cluster)}
      </Link>
    );

    const clusterState = getClusterStateAndDescription(cluster);
    const icon = <ClusterStateIcon clusterState={clusterState.state || ''} animated={false} />;
    const clusterStatus = (state) => {
      if (state === clusterStates.ERROR) {
        return (
          <span>
            <Popover
              position={PopoverPosition.top}
              bodyContent={(
                <>
                  Your cluster is in error state.
                  {' '}
                  <a
                    href="https://access.redhat.com/support/cases/#/case/new"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Contact Red Hat Support
                  </a>
                  {' '}
                  for further assistance.
                </>
              )}
              aria-label="Status: Error"
            >
              <Button
                className="cluster-status-string"
                variant="link"
                isInline
                icon={icon}
              >
                {state}
              </Button>
            </Popover>
          </span>
        );
      }
      if (state === clusterStates.PENDING || state === clusterStates.INSTALLING) {
        return (
          <Popover
            headerContent={<div>Installation status</div>}
            position={PopoverPosition.top}
            bodyContent={<ProgressList cluster={cluster} />}
            aria-label="Status: installing"
          >
            <Button
              className="cluster-status-string status-installing"
              variant="link"
              isInline
              icon={icon}
            >
              {state}
            </Button>
          </Popover>
        );
      }
      return (
        <span className="cluster-status-string">
          {icon}
          {state}
        </span>
      );
    };

    const clusterVersion = (
      <span>
        {cluster.openshift_version || 'N/A'}
        <ClusterUpdateLink cluster={cluster} openModal={openModal} />
      </span>
    );

    return {
      cells: [
        { title: clusterName },
        { title: clusterStatus(clusterState.state) },
        { title: <ClusterTypeLabel cluster={cluster} /> },
        { title: <ClusterCreatedIndicator cluster={cluster} /> },
        { title: clusterVersion },
        {
          title: <ClusterLocationLabel
            regionID={get(cluster, 'region.id', 'N/A')}
            cloudProviderID={provider}
          />,
        },
      ],
      cluster,
    };
  };

  const hiddenOnMdOrSmaller = classNames(Visibility.visibleOnLg, Visibility.hiddenOnMd,
    Visibility.hiddenOnSm);

  const columns = [
    { title: 'Name', transforms: [sortable, cellWidth(30)] },
    { title: 'Status', transforms: [cellWidth(15)] },
    { title: 'Type', transforms: [cellWidth(10)] },
    { title: 'Created', columnTransforms: [hiddenOnMdOrSmaller] },
    { title: 'Version', columnTransforms: [hiddenOnMdOrSmaller] },
    { title: 'Provider (Location)', columnTransforms: [hiddenOnMdOrSmaller] },
    '',
  ];

  const rows = isPending ? skeletonRows() : clusters.map(cluster => clusterRow(cluster));
  const resolver = isPending ? undefined
    : rowData => actionResolver(rowData.cluster, true, openModal,
      false,
      canSubscribeOCPList[get(rowData, 'cluster.id')] || false,
      canTransferClusterOwnershipList[get(rowData, 'cluster.id')] || false,
      toggleSubscriptionReleased);


  return (
    <Table
      aria-label="Cluster List"
      cells={columns}
      rows={rows}
      actionResolver={resolver}
      onSort={onSortToggle}
      sortBy={sortBy}
    >
      <TableHeader />
      <TableBody />
    </Table>
  );
}

ClusterListTable.propTypes = {
  openModal: PropTypes.func.isRequired,
  clusters: PropTypes.array.isRequired,
  viewOptions: PropTypes.object.isRequired,
  setSorting: PropTypes.func.isRequired,
  isPending: PropTypes.bool,
  setClusterDetails: PropTypes.func.isRequired,
  canSubscribeOCPList: PropTypes.objectOf(PropTypes.bool),
  canTransferClusterOwnershipList: PropTypes.objectOf(PropTypes.bool),
  toggleSubscriptionReleased: PropTypes.func.isRequired,
};

export default ClusterListTable;
