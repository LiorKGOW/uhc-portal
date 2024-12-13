/*
Copyright (c) 2018 Red Hat, Inc.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

  http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/
import axios from 'axios';
import { produce } from 'immer';
import merge from 'lodash/merge';

import { getErrorState } from '../../common/errors';
import { versionComparator } from '../../common/versionComparator';
import type {
  Cluster,
  ClusterStatus,
  InflightCheck,
  ProductTechnologyPreview,
  Version,
  VersionGate,
} from '../../types/clusters_mgmt.v1';
import type { AugmentedCluster, ClusterWithPermissions, ErrorState } from '../../types/types';
import type { ClusterAction } from '../actions/clustersActions';
import type { TechPreviewActions } from '../actions/techPreviewActions';
import type { UpgradeGateAction } from '../actions/upgradeGateActions';
import { clustersConstants } from '../constants';
import {
  baseRequestState,
  FULFILLED_ACTION,
  INVALIDATE_ACTION,
  PENDING_ACTION,
  REJECTED_ACTION,
} from '../reduxHelpers';
import type { PromiseActionType, PromiseReducerState } from '../types';

type State = {
  /* START ARCHIVED CODE - DO NOT USE */
  clusters: PromiseReducerState & {
    valid: boolean;
    meta: {
      clustersServiceError?: ErrorState;
    };
    clusters: ClusterWithPermissions[];
    queryParams?: {
      page: number;
      ['page_size']: number;
      filter?: string | undefined;
      fields?: string | undefined;
      order?: string | undefined;
    };
  };
  /* END ARCHIVED CODE - DO NOT USE */
  clusterStatus: PromiseReducerState & {
    status: ClusterStatus;
  };
  inflightChecks: PromiseReducerState & {
    checks: InflightCheck[];
  };
  clusterVersions: PromiseReducerState & {
    versions: Version[];
    params?: { [key: string]: string } | undefined;
    meta?: { [key: string]: boolean };
  };
  details: PromiseReducerState & {
    cluster: AugmentedCluster;
  };
  createdCluster: PromiseReducerState & {
    cluster: Cluster;
  };
  editedCluster: PromiseReducerState;
  archivedCluster: PromiseReducerState;
  unarchivedCluster: PromiseReducerState;
  hibernatingCluster: PromiseReducerState;
  rerunInflightCheckReq: PromiseReducerState;
  rerunInflightCheckRes: PromiseReducerState & {
    checks: any[];
  };
  resumeHibernatingCluster: PromiseReducerState;
  upgradeGates: PromiseReducerState & {
    gates: VersionGate[];
  };
  upgradedCluster: PromiseReducerState & {
    cluster: Cluster;
  };

  techPreview: {
    [product: string]: { [type: string]: PromiseReducerState & ProductTechnologyPreview };
  };
};

const baseState = {
  ...baseRequestState,
  valid: true,
};

// Fields here, that are *also* known to be always present from backend -> normalize.js results,
// can be assumed always present.
const emptyCluster = {
  managed: false,
  ccs: {
    enabled: false,
  },
};

const initialState: State = {
  /* START ARCHIVED CODE - DO NOT USE */
  clusters: {
    ...baseState,
    valid: false,
    meta: {},
    clusters: [],
    queryParams: {
      page: 0,
      page_size: 0,
    },
  },
  /* END ARCHIVED CODE - DO NOT USE */
  clusterStatus: {
    ...baseState,
    status: {},
  },
  inflightChecks: {
    ...baseState,
    checks: [],
  },
  clusterVersions: {
    ...baseState,
    versions: [],
    params: {},
  },
  details: {
    ...baseState,
    // TODO cast required due to missing metrics
    cluster: emptyCluster as AugmentedCluster,
  },
  createdCluster: {
    ...baseState,
    cluster: emptyCluster,
  },
  editedCluster: {
    ...baseState,
  },
  archivedCluster: {
    ...baseState,
  },
  unarchivedCluster: {
    ...baseState,
  },
  hibernatingCluster: {
    ...baseState,
  },
  resumeHibernatingCluster: {
    ...baseState,
  },
  rerunInflightCheckReq: {
    ...baseState,
  },
  rerunInflightCheckRes: {
    ...baseState,
    checks: [],
  },
  upgradeGates: {
    ...baseState,
    gates: [],
  },
  upgradedCluster: {
    ...baseState,
    cluster: emptyCluster,
  },
  techPreview: {},
};

const filterAndSortClusterVersions = (versions: Version[]) => {
  const now = Date.now();
  const filteredVersions = versions.filter((version) => {
    if (!version.end_of_life_timestamp) {
      return true;
    }
    const eolTimestamp = new Date(version.end_of_life_timestamp).getTime();
    return eolTimestamp > now;
  });
  // descending version numbers
  return filteredVersions.sort((e1, e2) => versionComparator(e2.raw_id!, e1.raw_id!));
};

const clustersReducer = (
  state = initialState,
  action: PromiseActionType<ClusterAction | UpgradeGateAction | TechPreviewActions>,
): State =>
  // eslint-disable-next-line consistent-return
  produce(state, (draft) => {
    switch (action.type) {
      /* START ARCHIVED CODE - DO NOT USE */
      // GET_CLUSTERS
      case INVALIDATE_ACTION(clustersConstants.GET_CLUSTERS):
        draft.clusters = { ...initialState.clusters };
        break;
      case REJECTED_ACTION(clustersConstants.GET_CLUSTERS):
        draft.clusters = {
          ...initialState.clusters,
          ...getErrorState(action),
          valid: true,
          clusters: state.clusters.clusters,
        };
        break;
      case PENDING_ACTION(clustersConstants.GET_CLUSTERS):
        draft.clusters = {
          ...initialState.clusters,
          pending: true,
          valid: true,
          clusters: state.clusters.clusters,
        };
        break;
      case FULFILLED_ACTION(clustersConstants.GET_CLUSTERS): {
        const { data } = action.payload;
        const clustersServiceError =
          'meta' in data && !!data.meta?.clustersServiceError
            ? getErrorState({
                payload: axios.isAxiosError(data.meta.clustersServiceError)
                  ? data.meta.clustersServiceError
                  : undefined,
              })
            : undefined;
        draft.clusters = {
          ...baseState,
          clusters: data.items,
          queryParams: data.queryParams,
          meta: {
            clustersServiceError:
              clustersServiceError?.error === true ? clustersServiceError : undefined,
          },
          fulfilled: true,
        };
        break;
      }
      /* END ARCHIVED CODE - DO NOT USE */
      case clustersConstants.SET_CLUSTER_DETAILS: {
        const { cluster, mergeDetails } = action.payload;
        draft.details = {
          ...baseState,
          cluster: mergeDetails ? merge({}, state.details.cluster, cluster) : cluster,
          fulfilled: true,
        };
        break;
      }
      // GET_CLUSTER_DETAILS
      case REJECTED_ACTION(clustersConstants.GET_CLUSTER_DETAILS):
        draft.details = {
          ...initialState.details,
          ...getErrorState(action),
          cluster: state.details.cluster, // preserve previous cluster even on error
        };
        break;
      case PENDING_ACTION(clustersConstants.GET_CLUSTER_DETAILS):
        draft.details = {
          ...initialState.details,
          pending: true,
          cluster: state.details.cluster,
        };
        break;
      case FULFILLED_ACTION(clustersConstants.GET_CLUSTER_DETAILS):
        draft.details = {
          ...baseState,
          fulfilled: true,
          cluster: action.payload.data,
        };
        break;
      case clustersConstants.CLEAR_CLUSTER_DETAILS:
        draft.details = {
          ...initialState.details,
        };
        break;
      // CREATE_CLUSTER
      case REJECTED_ACTION(clustersConstants.CREATE_CLUSTER):
        draft.createdCluster = {
          ...initialState.createdCluster,
          ...getErrorState(action),
        };
        break;
      case PENDING_ACTION(clustersConstants.CREATE_CLUSTER):
        draft.createdCluster = {
          ...initialState.createdCluster,
          pending: true,
        };
        break;
      case FULFILLED_ACTION(clustersConstants.CREATE_CLUSTER):
        draft.createdCluster = {
          ...baseState,
          cluster: action.payload.data,
          fulfilled: true,
        };
        break;
      case clustersConstants.RESET_CREATED_CLUSTER_RESPONSE:
        draft.createdCluster = {
          ...initialState.createdCluster,
        };
        break;

      // EDIT_CLUSTER
      case REJECTED_ACTION(clustersConstants.EDIT_CLUSTER):
        draft.editedCluster = {
          ...initialState.editedCluster,
          ...getErrorState(action),
        };
        break;
      case PENDING_ACTION(clustersConstants.EDIT_CLUSTER):
        draft.editedCluster = {
          ...initialState.editedCluster,
          pending: true,
        };
        break;
      case FULFILLED_ACTION(clustersConstants.EDIT_CLUSTER):
        draft.editedCluster = {
          ...baseState,
          fulfilled: true,
        };
        break;
      case clustersConstants.CLEAR_DISPLAY_NAME_RESPONSE:
        draft.editedCluster = {
          ...initialState.editedCluster,
        };
        break;

      // Archive cluster
      case FULFILLED_ACTION(clustersConstants.ARCHIVE_CLUSTER):
        draft.archivedCluster = {
          ...baseState,
          fulfilled: true,
        };
        break;
      case REJECTED_ACTION(clustersConstants.ARCHIVE_CLUSTER):
        draft.archivedCluster = {
          ...initialState.archivedCluster,
          ...getErrorState(action),
        };
        break;
      case PENDING_ACTION(clustersConstants.ARCHIVE_CLUSTER):
        draft.archivedCluster = {
          ...initialState.archivedCluster,
          pending: true,
        };
        break;
      case clustersConstants.CLEAR_CLUSTER_ARCHIVE_RESPONSE:
        draft.archivedCluster = {
          ...initialState.archivedCluster,
        };
        break;

      // Hibernate cluster
      case FULFILLED_ACTION(clustersConstants.HIBERNATE_CLUSTER):
        draft.hibernatingCluster = {
          ...baseState,
          fulfilled: true,
        };
        break;
      case REJECTED_ACTION(clustersConstants.HIBERNATE_CLUSTER):
        draft.hibernatingCluster = {
          ...initialState.hibernatingCluster,
          ...getErrorState(action),
        };
        break;
      case PENDING_ACTION(clustersConstants.HIBERNATE_CLUSTER):
        draft.hibernatingCluster = {
          ...initialState.hibernatingCluster,
          pending: true,
        };
        break;
      case clustersConstants.CLEAR_CLUSTER_HIBERNATE_RESPONSE:
        draft.hibernatingCluster = {
          ...initialState.hibernatingCluster,
        };
        break;

      // Resume cluster
      case FULFILLED_ACTION(clustersConstants.RESUME_CLUSTER):
        draft.resumeHibernatingCluster = {
          ...baseState,
          fulfilled: true,
        };
        break;
      case REJECTED_ACTION(clustersConstants.RESUME_CLUSTER):
        draft.resumeHibernatingCluster = {
          ...initialState.resumeHibernatingCluster,
          ...getErrorState(action),
        };
        break;
      case PENDING_ACTION(clustersConstants.RESUME_CLUSTER):
        draft.resumeHibernatingCluster = {
          ...initialState.resumeHibernatingCluster,
          pending: true,
        };
        break;
      case clustersConstants.CLEAR_RESUME_CLUSTER_RESPONSE:
        draft.resumeHibernatingCluster = {
          ...initialState.resumeHibernatingCluster,
        };
        break;

      // UnArchive cluster
      case FULFILLED_ACTION(clustersConstants.UNARCHIVE_CLUSTER):
        draft.unarchivedCluster = {
          ...baseState,
          fulfilled: true,
        };
        break;
      case REJECTED_ACTION(clustersConstants.UNARCHIVE_CLUSTER):
        draft.unarchivedCluster = {
          ...initialState.unarchivedCluster,
          ...getErrorState(action),
        };
        break;
      case PENDING_ACTION(clustersConstants.UNARCHIVE_CLUSTER):
        draft.unarchivedCluster = {
          ...initialState.unarchivedCluster,
          pending: true,
        };
        break;
      case clustersConstants.CLEAR_CLUSTER_UNARCHIVE_RESPONSE:
        draft.unarchivedCluster = {
          ...initialState.unarchivedCluster,
        };
        break;

      // Upgrade trial cluster
      case FULFILLED_ACTION(clustersConstants.UPGRADE_TRIAL_CLUSTER):
        draft.upgradedCluster = {
          ...baseState,
          cluster: action.payload.data,
          fulfilled: true,
        };
        break;
      case REJECTED_ACTION(clustersConstants.UPGRADE_TRIAL_CLUSTER):
        draft.upgradedCluster = {
          ...initialState.upgradedCluster,
          ...getErrorState(action),
        };
        break;
      case PENDING_ACTION(clustersConstants.UPGRADE_TRIAL_CLUSTER):
        draft.upgradedCluster = {
          ...initialState.upgradedCluster,
          pending: true,
        };
        break;
      case clustersConstants.CLEAR_UPGRADE_TRIAL_CLUSTER_RESPONSE:
        draft.upgradedCluster = {
          ...initialState.upgradedCluster,
        };
        break;

      // GET_CLUSTER_STATUS
      case REJECTED_ACTION(clustersConstants.GET_CLUSTER_STATUS):
        draft.clusterStatus = {
          ...initialState.clusterStatus,
          ...getErrorState(action),
        };
        break;
      case PENDING_ACTION(clustersConstants.GET_CLUSTER_STATUS):
        draft.clusterStatus = {
          ...initialState.clusterStatus,
          pending: true,
          status: state.clusterStatus.status,
        };
        break;
      case FULFILLED_ACTION(clustersConstants.GET_CLUSTER_STATUS):
        draft.clusterStatus = {
          ...baseState,
          fulfilled: true,
          status: action.payload.data,
        };
        break;

      // GET_INFLIGHT_CHECKS
      case REJECTED_ACTION(clustersConstants.GET_INFLIGHT_CHECKS):
        draft.inflightChecks = {
          ...initialState.inflightChecks,
          ...getErrorState(action),
        };
        break;
      case PENDING_ACTION(clustersConstants.GET_INFLIGHT_CHECKS):
        draft.inflightChecks = {
          ...initialState.inflightChecks,
          pending: true,
          checks: state.inflightChecks.checks, // preserve previous checks to avoid blips
        };
        break;
      case FULFILLED_ACTION(clustersConstants.GET_INFLIGHT_CHECKS):
        draft.inflightChecks = {
          ...baseState,
          fulfilled: true,
          checks: action.payload.data.items || [],
        };
        break;

      // RERUN INFLIGHT_CHECKS
      case FULFILLED_ACTION(clustersConstants.RERUN_INFLIGHT_CHECKS):
        draft.rerunInflightCheckReq = {
          ...baseState,
          fulfilled: true,
        };
        break;
      case REJECTED_ACTION(clustersConstants.RERUN_INFLIGHT_CHECKS):
        draft.rerunInflightCheckReq = {
          ...initialState.rerunInflightCheckReq,
          ...getErrorState(action),
        };
        break;
      case PENDING_ACTION(clustersConstants.RERUN_INFLIGHT_CHECKS):
        draft.rerunInflightCheckRes = {
          ...initialState.rerunInflightCheckRes,
        };
        draft.rerunInflightCheckReq = {
          ...initialState.rerunInflightCheckReq,
          pending: true,
        };
        break;

      // GET STATES OF SUBNETS WHICH THE VALIDATOR IS BEING RERUN ON
      case FULFILLED_ACTION(clustersConstants.GET_RERUN_INFLIGHT_CHECKS):
        draft.rerunInflightCheckRes = {
          ...baseState,
          checks: action.payload.data.items || [],
          fulfilled: true,
        };
        break;
      case REJECTED_ACTION(clustersConstants.GET_RERUN_INFLIGHT_CHECKS):
        draft.rerunInflightCheckRes = {
          ...initialState.rerunInflightCheckRes,
          ...getErrorState(action),
        };
        break;
      case PENDING_ACTION(clustersConstants.GET_RERUN_INFLIGHT_CHECKS):
        draft.rerunInflightCheckRes = {
          ...initialState.rerunInflightCheckRes,
          pending: true,
          checks: state.rerunInflightCheckRes.checks, // preserve previous checks to avoid blips
        };
        break;

      case clustersConstants.CLEAR_INFLIGHT_CHECKS:
        draft.inflightChecks = {
          ...initialState.inflightChecks,
        };
        draft.rerunInflightCheckReq = {
          ...initialState.rerunInflightCheckReq,
        };
        draft.rerunInflightCheckRes = {
          ...initialState.rerunInflightCheckRes,
        };
        break;

      // GET_CLUSTER_VERSIONS
      case REJECTED_ACTION(clustersConstants.GET_CLUSTER_VERSIONS):
        draft.clusterVersions = {
          ...initialState.clusterVersions,
          ...getErrorState(action),
        };
        break;
      case PENDING_ACTION(clustersConstants.GET_CLUSTER_VERSIONS):
        draft.clusterVersions = {
          ...initialState.clusterVersions,
          pending: true,
        };
        break;
      case FULFILLED_ACTION(clustersConstants.GET_CLUSTER_VERSIONS):
        draft.clusterVersions = {
          ...baseState,
          fulfilled: true,
          params: action.payload.config.params,
          versions: action.payload.data.items
            ? filterAndSortClusterVersions(action.payload.data.items)
            : [],
          meta: action.meta,
        };
        break;

      // GET_TECH_VERSIONS
      case REJECTED_ACTION(clustersConstants.GET_TECH_PREVIEW): {
        if (!draft.techPreview[action.payload.product]) {
          draft.techPreview[action.payload.product] = {};
        }

        draft.techPreview[action.payload.product][action.payload.type] = {
          ...baseState,
          error: true,
        };
        break;
      }

      case PENDING_ACTION(clustersConstants.GET_TECH_PREVIEW):
        if (!draft.techPreview[action.payload.product]) {
          draft.techPreview[action.payload.product] = {};
        }
        draft.techPreview[action.payload.product][action.payload.type] = {
          ...baseState,
          pending: true,
        };
        break;

      case FULFILLED_ACTION(clustersConstants.GET_TECH_PREVIEW):
        if (!draft.techPreview[action.payload.product]) {
          draft.techPreview[action.payload.product] = {};
        }
        draft.techPreview[action.payload.product][action.payload.type] = {
          ...baseState,
          fulfilled: true,
          ...action.payload.data,
        };
        break;

      case clustersConstants.CLEAR_CLUSTER_VERSIONS_RESPONSE:
        draft.clusterVersions = {
          ...initialState.clusterVersions,
        };
        break;

      case REJECTED_ACTION(clustersConstants.GET_UPGRADE_GATES):
        draft.upgradeGates = {
          ...initialState.upgradeGates,
          ...getErrorState(action),
        };
        break;
      case PENDING_ACTION(clustersConstants.GET_UPGRADE_GATES):
        draft.upgradeGates.pending = true;
        break;

      case FULFILLED_ACTION(clustersConstants.GET_UPGRADE_GATES):
        draft.upgradeGates = {
          ...baseState,
          gates: action.payload ?? [],
          fulfilled: true,
        };
        break;

      case clustersConstants.SET_CLUSTER_UPGRADE_GATE:
        draft.details.cluster.upgradeGates = [
          ...(state.details.cluster.upgradeGates ?? []),
          { version_gate: { id: action.payload } },
        ];
        break;

      default:
        return state;
    }
  });

clustersReducer.initialState = initialState;

export { initialState, clustersReducer };

export default clustersReducer;
