import { clusterService } from '../../../../../services';

const GET_MACHINE_POOLS = 'GET_MACHINE_POOLS';
const ADD_MACHINE_POOL = 'ADD_MACHINE_POOL';
const SCALE_MACHINE_POOL = 'SCALE_MACHINE_POOL';
const DELETE_MACHINE_POOL = 'DELETE_MACHINE_POOL';
const CLEAR_GET_MACHINE_POOLS_RESPONSE = 'CLEAR_GET_MACHINE_POOLS_RESPONSE';
const CLEAR_ADD_MACHINE_POOL_RESPONSE = 'CLEAR_ADD_MACHINE_POOL_RESPONSE';
const CLEAR_SCALE_MACHINE_POOL_RESPONSE = 'CLEAR_SCALE_MACHINE_POOL_RESPONSE';


const getMachinePools = clusterID => dispatch => dispatch({
  type: GET_MACHINE_POOLS,
  payload: clusterService.getMachinePools(clusterID),
});

const addMachinePool = (clusterID, params) => dispatch => dispatch({
  type: ADD_MACHINE_POOL,
  payload: clusterService.addMachinePool(clusterID, params),
});

const scaleMachinePool = (clusterID, machinePoolID, params) => dispatch => dispatch({
  type: SCALE_MACHINE_POOL,
  payload: clusterService.scaleMachinePool(clusterID, machinePoolID, params),
});

const deleteMachinePool = (clusterID, machinePoolID) => dispatch => dispatch({
  type: DELETE_MACHINE_POOL,
  payload: clusterService.deleteMachinePool(clusterID, machinePoolID),
});

const clearAddMachinePoolResponse = () => dispatch => dispatch({
  type: CLEAR_ADD_MACHINE_POOL_RESPONSE,
});

const clearGetMachinePoolsResponse = () => dispatch => dispatch({
  type: CLEAR_GET_MACHINE_POOLS_RESPONSE,
});

const clearScaleMachinePoolResponse = () => dispatch => dispatch({
  type: CLEAR_SCALE_MACHINE_POOL_RESPONSE,
});


export {
  GET_MACHINE_POOLS,
  ADD_MACHINE_POOL,
  SCALE_MACHINE_POOL,
  DELETE_MACHINE_POOL,
  CLEAR_ADD_MACHINE_POOL_RESPONSE,
  CLEAR_SCALE_MACHINE_POOL_RESPONSE,
  CLEAR_GET_MACHINE_POOLS_RESPONSE,
  getMachinePools,
  addMachinePool,
  scaleMachinePool,
  deleteMachinePool,
  clearAddMachinePoolResponse,
  clearGetMachinePoolsResponse,
  clearScaleMachinePoolResponse,
};
