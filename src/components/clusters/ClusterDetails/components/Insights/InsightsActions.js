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
import get from 'lodash/get';
import {
  GET_CLUSTER_INSIGHTS,
  VOTE_ON_RULE_INSIGHTS,
  DISABLE_RULE_INSIGHTS,
  ENABLE_RULE_INSIGHTS,
  GET_GROUPS_INSIGHTS,
} from './InsightsConstants';
import { insightsService } from '../../../../../services';

const fetchSingleClusterInsights = async (clusterId, orgId) => {
  try {
    const insightsResponse = await insightsService.getClusterInsights(clusterId, orgId);
    return { insightsData: get(insightsResponse, 'data.report', {}), clusterId };
  } catch (e) {
    const error = Error('Insights for cluster not found');
    error.status = e.response.status;
    error.clusterId = clusterId;
    throw error;
  }
};

export const fetchClusterInsights = clusterID => dispatch => dispatch({
  type: GET_CLUSTER_INSIGHTS,
  payload: insights.chrome.auth.getUser().then(
    user => fetchSingleClusterInsights(clusterID, user.identity.internal.org_id),
  ),
});

// clusterId is id of the cluster
// ruleId is id of the rule
// vote is integer: -1(dislike), 0(reset_vote), 1(like)
const voteOnSingleRuleInsights = async (dispatch, clusterId, ruleId, vote) => {
  let response;
  switch (vote) {
    case -1:
      response = await insightsService.putDislikeOnRuleInsights(clusterId, ruleId);
      break;
    case 0:
      response = await insightsService.resetVoteOnRuleInsights(clusterId, ruleId);
      break;
    case 1:
      response = await insightsService.putLikeOnRuleInsights(clusterId, ruleId);
      break;
    default:
      throw Error('unsupported vote');
  }

  dispatch(fetchClusterInsights(clusterId));

  return {
    insightsData: response.data,
    clusterId,
    ruleId,
    vote,
  };
};

export const voteOnRuleInsights = (clusterId, ruleId, vote) => dispatch => dispatch({
  type: VOTE_ON_RULE_INSIGHTS,
  payload: voteOnSingleRuleInsights(dispatch, clusterId, ruleId, vote),
});

// clusterId is id of the cluster
// ruleId is id of the rule
const toggleSingleRuleInsights = async (dispatch, clusterId, ruleId, enable) => {
  const action = enable ? insightsService.enableRuleInsights : insightsService.disableRuleInsights;
  const response = action(clusterId, ruleId).then((resp) => {
    dispatch(fetchClusterInsights(clusterId));

    return resp;
  });

  return {
    insightsData: response.data,
    clusterId,
    ruleId,
  };
};

export const disableRuleInsights = (clusterId, ruleId) => (dispatch) => {
  dispatch({
    type: DISABLE_RULE_INSIGHTS,
    payload: toggleSingleRuleInsights(dispatch, clusterId, ruleId, false),
  });
};

export const enableRuleInsights = (clusterId, ruleId) => (dispatch) => {
  dispatch({
    type: ENABLE_RULE_INSIGHTS,
    payload: toggleSingleRuleInsights(dispatch, clusterId, ruleId, true),
  });
};

export const fetchGroups = () => dispatch => dispatch({
  type: GET_GROUPS_INSIGHTS,
  payload: insightsService.getGroupsInsights(),
});
