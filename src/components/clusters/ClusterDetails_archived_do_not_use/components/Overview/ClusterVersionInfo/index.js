import { connect } from 'react-redux';

import { openModal } from '../../../../../common/Modal/ModalActions';
import {
  clearSchedulesResponse,
  getSchedules,
} from '../../../../common/archived_do_not_use/Upgrades/clusterUpgradeActions';

import ClusterVersionInfo from './ClusterVersionInfo';

const mapStateToProps = (state) => ({
  versionInfo: state.clusterUpgrades.versionInfo,
  schedules: state.clusterUpgrades.schedules,
});

const mapDispatchToProps = (dispatch) => ({
  getSchedules: (clusterID, isHypershift) => dispatch(getSchedules(clusterID, isHypershift)),
  clearSchedulesResponse: () => dispatch(clearSchedulesResponse()),
  // explicit dispatching is annoying, but is a must when using openModal
  // TODO fix openModal so explicit dispatching won't be necessary, like all other actions
  openModal: (name, data) => dispatch(openModal(name, data)),
});

export default connect(mapStateToProps, mapDispatchToProps)(ClusterVersionInfo);
