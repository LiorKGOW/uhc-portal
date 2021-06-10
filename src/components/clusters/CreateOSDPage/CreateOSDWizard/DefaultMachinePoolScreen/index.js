import { connect } from 'react-redux';
import { formValueSelector } from 'redux-form';

import { canAutoScaleSelector } from '../../../ClusterDetails/components/MachinePools/MachinePoolsSelectors';

import wizardConnector from '../WizardConnector';
import DefaultMachinePoolScreen from './DefaultMachinePoolScreen';

const mapStateToProps = (state) => {
  const valueSelector = formValueSelector('CreateCluster');

  const cloudProviderID = valueSelector(state, 'cloud_provider');
  const isMultiAz = valueSelector(state, 'multi_az') === 'true';
  const isByoc = valueSelector(state, 'byoc') === 'true';
  const product = valueSelector(state, 'product');
  const billingModel = valueSelector(state, 'billing_model');
  const machineType = valueSelector(state, 'machine_type');

  return {
    cloudProviderID,
    isMultiAz,
    product,
    billingModel,
    isByoc,
    machineType,
    canAutoScale: canAutoScaleSelector(state, product),
    autoscalingEnabled: !!valueSelector(state, 'autoscalingEnabled'),
    autoScaleMinNodesValue: valueSelector(state, 'min_replicas'),
    autoScaleMaxNodesValue: valueSelector(state, 'max_replicas'),
    initialValues: {
      node_labels: [{}],
    },
  };
};

export default connect(mapStateToProps)(wizardConnector(DefaultMachinePoolScreen));
