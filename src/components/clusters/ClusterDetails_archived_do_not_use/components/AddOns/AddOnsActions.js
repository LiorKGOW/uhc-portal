import get from 'lodash/get';

import { clusterService } from '../../../../../services';

import AddOnsConstants from './AddOnsConstants';

const getAddOns = (clusterID) => (dispatch) =>
  dispatch({
    type: AddOnsConstants.GET_ADDONS,
    payload: clusterService.getEnabledAddOns(clusterID).then((response) => {
      const items = get(response, 'data.items', []);
      return {
        items,
        resourceNames: items.map((addOn) => addOn.resource_name),
      };
    }),
  });

const getClusterAddOns = (clusterID) => (dispatch) =>
  dispatch({
    type: AddOnsConstants.GET_CLUSTER_ADDONS,
    payload: clusterService.getClusterAddOns(clusterID).then((response) => {
      const items = get(response, 'data.items', []);
      return {
        clusterID,
        items,
      };
    }),
  });

const addClusterAddOn = (clusterID, addOnData) => (dispatch) =>
  dispatch({
    type: AddOnsConstants.ADD_CLUSTER_ADDON,
    payload: clusterService.addClusterAddOn(clusterID, addOnData),
  });

const updateClusterAddOn = (clusterID, addOnID, addOnData) => (dispatch) =>
  dispatch({
    type: AddOnsConstants.UPDATE_CLUSTER_ADDON,
    payload: clusterService.updateClusterAddOn(clusterID, addOnID, addOnData).then((response) => {
      dispatch(getClusterAddOns(clusterID));
      return response;
    }),
  });

const deleteClusterAddOn = (clusterID, addOnData) => (dispatch) =>
  dispatch({
    type: AddOnsConstants.DELETE_CLUSTER_ADDON,
    payload: clusterService.deleteClusterAddOn(clusterID, addOnData),
  });

const clearClusterAddOnsResponses = () => ({
  type: AddOnsConstants.CLEAR_CLUSTER_ADDON_RESPONSES,
});

const setAddonsDrawer = (drawerData) => (dispatch) =>
  dispatch({
    type: AddOnsConstants.SET_ADDONS_DRAWER,
    payload: drawerData,
  });

const addOnsActions = {
  getAddOns,
  getClusterAddOns,
  addClusterAddOn,
  updateClusterAddOn,
  deleteClusterAddOn,
  clearClusterAddOnsResponses,
};

export {
  addOnsActions,
  getAddOns,
  getClusterAddOns,
  addClusterAddOn,
  updateClusterAddOn,
  deleteClusterAddOn,
  clearClusterAddOnsResponses,
  setAddonsDrawer,
};
