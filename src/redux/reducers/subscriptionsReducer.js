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
import produce from 'immer';
import {
  REJECTED_ACTION, PENDING_ACTION, FULFILLED_ACTION, INVALIDATE_ACTION, baseRequestState,
} from '../reduxHelpers';
import { getErrorState } from '../../common/errors';

import { subscriptionsConstants } from '../constants';

const initialState = {
  account: {
    ...baseRequestState,
    valid: false,
    data: {},
  },
  subscriptions: {
    ...baseRequestState,
    valid: false,
    items: [],
  },
  quotaSummary: {
    ...baseRequestState,
    valid: false,
    items: [],
  },
  quotaCost: {
    ...baseRequestState,
    valid: false,
    items: [],
  },
};

function subscriptionsReducer(state = initialState, action) {
  // eslint-disable-next-line consistent-return
  return produce(state, (draft) => {
    // eslint-disable-next-line default-case
    switch (action.type) {
      // GET_ACCOUNT
      case INVALIDATE_ACTION(subscriptionsConstants.GET_ACCOUNT):
        draft.account = {
          ...initialState.account,
          valid: false,
        };
        break;
      case REJECTED_ACTION(subscriptionsConstants.GET_ACCOUNT):
        draft.account = {
          ...initialState.account,
          ...getErrorState(action),
          valid: true,
        };
        break;
      case PENDING_ACTION(subscriptionsConstants.GET_ACCOUNT):
        draft.account.pending = true;
        break;
      case FULFILLED_ACTION(subscriptionsConstants.GET_ACCOUNT):
        draft.account = {
          ...initialState.account,
          fulfilled: true,
          valid: true,
          data: action.payload.data,
        };
        break;
      // GET_SUBSCRIPTIONS
      case INVALIDATE_ACTION(subscriptionsConstants.GET_SUBSCRIPTIONS):
        draft.subscriptions = {
          ...initialState.subscriptions,
          valid: false,
        };
        break;
      case REJECTED_ACTION(subscriptionsConstants.GET_SUBSCRIPTIONS):
        draft.subscriptions = {
          ...initialState.subscriptions,
          ...getErrorState(action),
          valid: true,
          items: state.subscriptions.items,
        };
        break;
      case PENDING_ACTION(subscriptionsConstants.GET_SUBSCRIPTIONS):
        draft.subscriptions.pending = true;
        break;
      case FULFILLED_ACTION(subscriptionsConstants.GET_SUBSCRIPTIONS):
        draft.subscriptions = {
          ...initialState.subscriptions,
          fulfilled: true,
          valid: true,
          items: action.payload.data.items,
        };
        break;
      // GET_QUOTA_COST
      case INVALIDATE_ACTION(subscriptionsConstants.GET_QUOTA_COST):
        draft.quotaCost = {
          ...initialState.quotaCost,
          valid: false,
        };
        break;
      case REJECTED_ACTION(subscriptionsConstants.GET_QUOTA_COST):
        draft.quotaCost = {
          ...initialState.quotaCost,
          ...getErrorState(action),
          valid: true,
          items: state.quotaCost.items,
        };
        break;
      case PENDING_ACTION(subscriptionsConstants.GET_QUOTA_COST):
        draft.quotaCost.pending = true;
        break;
      case FULFILLED_ACTION(subscriptionsConstants.GET_QUOTA_COST):
        draft.quotaCost = {
          ...initialState.quotaCost,
          fulfilled: action.payload.data.items && action.payload.data.items.length > 0,
          valid: true,
          items: action.payload.data.items,
        };
    }
  });
}

subscriptionsReducer.initialState = initialState;

export { initialState, subscriptionsReducer };

export default subscriptionsReducer;
