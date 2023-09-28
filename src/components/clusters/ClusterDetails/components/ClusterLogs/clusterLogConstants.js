const GET_CLUSTER_LOGS = 'GET_CLUSTER_LOGS';
const RESET_CLUSTER_HISTORY = 'RESET_CLUSTER_HISTORY';

const SEVERITY_TYPES = ['Debug', 'Info', 'Warning', 'Error', 'Fatal', 'Major', 'Critical'];

const clusterLogConstants = {
  GET_CLUSTER_LOGS,
  SEVERITY_TYPES,
  RESET_CLUSTER_HISTORY,
};

export { GET_CLUSTER_LOGS, SEVERITY_TYPES, RESET_CLUSTER_HISTORY };
export default clusterLogConstants;
