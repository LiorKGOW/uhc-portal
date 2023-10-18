import React from 'react';
import PropTypes from 'prop-types';
import {
  EmptyState,
  EmptyStateIcon,
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
import isEqual from 'lodash/isEqual';
import SearchIcon from '@patternfly/react-icons/dist/esm/icons/search-icon';
import ClusterLogsToolbar from './toolbar';
import LogTable from './LogTable';
import { eventTypes } from '../../clusterDetailsHelper';
import { viewPropsChanged, getQueryParam } from '../../../../../common/queryHelpers';
import { viewConstants } from '../../../../../redux/constants';
import ErrorBox from '../../../../common/ErrorBox';
import ViewPaginationRow from '../../../common/ViewPaginationRow/viewPaginationRow';
import helpers from '../../../../../common/helpers';
import { SEVERITY_TYPES, LOG_TYPES } from './clusterLogConstants';
import LiveDateFormat from '../../../../common/LiveDateFormat/LiveDateFormat';
import {
  dateParse,
  dateFormat,
  getTimestampFrom,
  onDateChangeFromFilter,
} from './toolbar/ClusterLogsDatePicker';

class ClusterLogs extends React.Component {
  componentDidMount() {
    const { setListFlag, setFilter, viewOptions, createdAt } = this.props;

    // Apply a timestamp filter by default
    const minDate = dateParse(createdAt);
    const { symbol, date } = onDateChangeFromFilter(dateFormat(getTimestampFrom(minDate)));
    const filterObject = {
      ...viewOptions.filter,
      timestampFrom: `${symbol} '${date}'`,
    };

    let hasChanged = false;
    if (!isEqual(filterObject, viewOptions.filter)) {
      hasChanged = true;
      setFilter(filterObject);
    }

    const severityTypes = getQueryParam('severityTypes') || '';
    const logTypes = getQueryParam('logTypes') || '';
    if (!isEmpty(severityTypes) || !isEmpty(logTypes)) {
      hasChanged = true;
      setListFlag('conditionalFilterFlags', {
        severityTypes: !isEmpty(severityTypes)
          ? severityTypes.split(',').filter((type) => SEVERITY_TYPES.includes(type))
          : viewOptions.flags.severityTypes,
        logTypes: !isEmpty(logTypes)
          ? logTypes.split(',').filter((type) => LOG_TYPES.includes(type))
          : viewOptions.flags.logTypes,
      });
    }

    if (!hasChanged) {
      // only call refresh if we're not setting the filter/list flag. When the flag is set, refresh
      // will be called via componentDidUpdate() after the redux state transition
      this.refresh();
    }
  }

  componentDidUpdate(prevProps) {
    // Check for changes resulting in a fetch
    const {
      viewOptions,
      clusterLogs: { pending },
    } = this.props;
    if (!pending && viewPropsChanged(viewOptions, prevProps.viewOptions)) {
      this.refresh();
    }
  }

  refresh() {
    const { externalClusterID, clusterID, getClusterHistory, viewOptions } = this.props;
    if (externalClusterID || clusterID) {
      getClusterHistory(externalClusterID, clusterID, viewOptions);
    }
  }

  render() {
    const {
      clusterLogs: {
        requestState: { error, errorCode, pending, errorMessage, operationID },
        logs,
        fetchedClusterLogsAt,
      },
      viewOptions,
      history,
      setSorting,
      externalClusterID,
      clusterID,
      refreshEvent,
    } = this.props;

    // These errors are present during cluster install
    // Instead of showing an error, display "No cluster log entries found"
    const ignoreErrors = errorCode === 403 || errorCode === 404;

    const hasNoFilters =
      isEmpty(viewOptions.filter) &&
      helpers.nestedIsEmpty(viewOptions.flags.severityTypes) &&
      helpers.nestedIsEmpty(viewOptions.flags.logTypes);
    const isPendingNoData = !size(logs) && pending && hasNoFilters;

    return (
      <>
        <Card className="ocm-c-overview-cluster-history__card">
          <CardHeader className="ocm-c-overview-cluster-history__card--header">
            <CardTitle className="ocm-c-overview-cluster-history__card--header">
              <Title headingLevel="h2" className="card-title">
                Cluster history
              </Title>
            </CardTitle>
            <CardActions>
              Updated &nbsp;
              {fetchedClusterLogsAt && (
                <LiveDateFormat timestamp={fetchedClusterLogsAt.getTime()} />
              )}
            </CardActions>
          </CardHeader>
          <CardBody className="ocm-c-overview-cluster-history__card--body">
            {error && !ignoreErrors && (
              <ErrorBox
                message="Error retrieving cluster logs"
                response={{
                  errorMessage,
                  operationID,
                }}
              />
            )}
            <ClusterLogsToolbar
              view={viewConstants.CLUSTER_LOGS_VIEW}
              history={history}
              externalClusterID={externalClusterID}
              isPendingNoData={isPendingNoData}
              clusterID={clusterID}
            />
            {error && !size(logs) && ignoreErrors ? (
              <>
                <PageSection>
                  <EmptyState>
                    <EmptyStateIcon icon={SearchIcon} />
                    <Title size="lg" headingLevel="h4">
                      No cluster log entries found
                    </Title>
                  </EmptyState>
                </PageSection>
              </>
            ) : (
              <>
                <LogTable
                  pending={pending}
                  logs={logs}
                  setSorting={setSorting}
                  refreshEvent={refreshEvent}
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
              </>
            )}
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
      logTypes: PropTypes.object,
    }),
    filter: PropTypes.object,
  }).isRequired,
  clusterLogs: PropTypes.object.isRequired,
  refreshEvent: PropTypes.shape({
    type: PropTypes.oneOf(Object.values(eventTypes)),
    reset: PropTypes.func.isRequired,
  }).isRequired,
  getClusterHistory: PropTypes.func.isRequired,
  setListFlag: PropTypes.func.isRequired,
  setFilter: PropTypes.func.isRequired,
  setSorting: PropTypes.func.isRequired,
  pending: PropTypes.bool,
  history: PropTypes.shape({
    push: PropTypes.func.isRequired,
  }).isRequired,
  createdAt: PropTypes.string.isRequired,
  clusterID: PropTypes.string.isRequired,
};

export default ClusterLogs;
