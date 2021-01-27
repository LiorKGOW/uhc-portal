import React from 'react';
import PropTypes from 'prop-types';
import {
  EmptyState,
  PageSection,
  Card,
  CardBody,
  Title,
  CardTitle,
  CardActions,
  CardHeader,
} from '@patternfly/react-core';
import size from 'lodash/size';
import isEmpty from 'lodash/isEmpty';

import { viewPropsChanged, getQueryParam } from '../../../../../common/queryHelpers';
import ClusterLogsToolbar from './toolbar';
import LogTable from './LogTable';
import { viewConstants } from '../../../../../redux/constants';
import ErrorBox from '../../../../common/ErrorBox';
import ViewPaginationRow from '../../../common/ViewPaginationRow/viewPaginationRow';
import helpers from '../../../../../common/helpers';
import { SEVERITY_TYPES } from './clusterLogConstants';
import LiveDateFormat from '../../../../common/LiveDateFormat/LiveDateFormat';

class ClusterLogs extends React.Component {
  componentDidMount() {
    const { setListFlag } = this.props;

    const severityTypes = getQueryParam('severityTypes') || '';
    if (!isEmpty(severityTypes)) {
      setListFlag('conditionalFilterFlags', {
        severityTypes: severityTypes.split(',').filter(type => SEVERITY_TYPES.includes(type)),
      });
    } else {
      // only call refresh if we're not setting the filter flag. When the flag is set, refresh
      // will be called via componentDidUpdate() after the redux state transition
      this.refresh();
    }
  }

  componentDidUpdate(prevProps) {
    // Check for changes resulting in a fetch
    const {
      viewOptions, clusterLogs: { pending },
    } = this.props;
    if (!pending && viewPropsChanged(viewOptions, prevProps.viewOptions)) {
      this.refresh();
    }
  }

  refresh() {
    const { externalClusterID, getClusterHistory, viewOptions } = this.props;
    getClusterHistory(externalClusterID, viewOptions);
  }

  render() {
    const {
      clusterLogs: {
        requestState: {
          error,
          pending,
          errorMessage,
          operationID,
        },
        logs,
        fetchedClusterLogsAt,
      },
      viewOptions,
      history,
      setSorting,
      externalClusterID,
    } = this.props;
    if (error && !size(logs)) {
      return (
        <>
          <PageSection>
            <EmptyState>
              <ErrorBox
                message="Error retrieving cluster logs"
                response={{
                  errorMessage,
                  operationID,
                }}
              />
            </EmptyState>
          </PageSection>
        </>
      );
    }

    const hasNoFilters = isEmpty(viewOptions.filter)
      && helpers.nestedIsEmpty(viewOptions.flags.severityTypes);
    const isPendingNoData = (!size(logs) && pending && hasNoFilters);
    return (
      <>
        <Card className="ocm-c-overview-cluster-history__card">
          <CardHeader className="ocm-c-overview-cluster-history__card--header">
            <CardTitle className="ocm-c-overview-cluster-history__card--header">
              <Title headingLevel="h2" className="card-title">Cluster history</Title>
            </CardTitle>
            <CardActions>
              Updated &nbsp;
              {fetchedClusterLogsAt
              && <LiveDateFormat timestamp={fetchedClusterLogsAt.getTime()} />}
            </CardActions>
          </CardHeader>
          <CardBody className="ocm-c-overview-cluster-history__card--body">
            <ClusterLogsToolbar
              view={viewConstants.CLUSTER_LOGS_VIEW}
              history={history}
              externalClusterID={externalClusterID}
              isPendingNoData={isPendingNoData}
            />
            <LogTable
              logs={logs}
              setSorting={setSorting}
            />

            <ViewPaginationRow
              viewType={viewConstants.CLUSTER_LOGS_VIEW}
              currentPage={viewOptions.currentPage}
              pageSize={viewOptions.pageSize}
              totalCount={viewOptions.totalCount}
              totalPages={viewOptions.totalPages}
              variant="bottom"
              isDisabled={isPendingNoData}
            />
          </CardBody>
        </Card>
      </>
    );
  }
}

ClusterLogs.propTypes = {
  externalClusterID: PropTypes.string.isRequired,
  viewOptions: PropTypes.shape({
    currentPage: PropTypes.number,
    pageSize: PropTypes.number,
    totalCount: PropTypes.number,
    totalPages: PropTypes.number,
    flags: PropTypes.shape({
      severityTypes: PropTypes.object,
    }),
    filter: PropTypes.object,
  }).isRequired,
  clusterLogs: PropTypes.object.isRequired,
  getClusterHistory: PropTypes.func.isRequired,
  setListFlag: PropTypes.func.isRequired,
  setSorting: PropTypes.func.isRequired,
  pending: PropTypes.bool,
  history: PropTypes.shape({
    push: PropTypes.func.isRequired,
  }).isRequired,
};

export default ClusterLogs;
