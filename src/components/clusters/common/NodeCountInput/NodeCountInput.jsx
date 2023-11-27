import { FormGroup, FormSelect, FormSelectOption, Tooltip } from '@patternfly/react-core';
import PropTypes from 'prop-types';
import React from 'react';

import {
  getNodeIncrement,
  getNodeIncrementHypershift,
} from '~/components/clusters/ClusterDetails/components/MachinePools/machinePoolsHelper';
import { noQuotaTooltip } from '../../../../common/helpers';
import { billingModels, normalizedProducts } from '../../../../common/subscriptionTypes';
import PopoverHint from '../../../common/PopoverHint';
import {
  buildOptions,
  getAvailableQuota as getAvailableQuotaUtil,
  getIncludedNodes,
} from '../machinePools/utils';
import { MAX_NODES_HCP } from '../machinePools/constants';

const incrementValue = ({ isHypershiftWizard, poolNumber, isMultiAz }) =>
  isHypershiftWizard ? getNodeIncrementHypershift(poolNumber) : getNodeIncrement(isMultiAz);

class NodeCountInput extends React.Component {
  componentDidMount() {
    const {
      input,
      minNodes,
      isEditingCluster,
      currentNodeCount,
      increment,
      isHypershiftWizard,
      poolNumber,
      isMultiAz,
      isMachinePool,
    } = this.props;
    const included = getIncludedNodes({ isMultiAz, isHypershift: !isMachinePool });
    const available = this.getAvailableQuota();

    const optionValueIncrement =
      increment || incrementValue({ isHypershiftWizard, poolNumber, isMultiAz });

    const options = buildOptions({
      included,
      available,
      isEditingCluster,
      currentNodeCount,
      minNodes,
      optionValueIncrement,
      isHypershift: isHypershiftWizard,
    });

    if (!options.includes(Number(input.value))) {
      // if the value isn't an option, then just set to minNode (the value the user sees as the setting )
      input.onChange(minNodes);
    }
  }

  componentDidUpdate(prevProps) {
    const { input, isEditingCluster, minNodes, isHypershiftWizard, poolNumber } = this.props;

    const available = this.getAvailableQuota();
    if (isHypershiftWizard && poolNumber !== prevProps.poolNumber) {
      // Keep value the user sees (nodes per pool) unless the number of total nodes
      // is less than the minimum total nodes
      const prevSelected = prevProps.input?.value / prevProps.poolNumber || minNodes;
      const newValue = prevSelected * poolNumber;
      if (newValue > minNodes && newValue <= MAX_NODES_HCP) {
        input.onChange(newValue);
      } else {
        input.onChange(minNodes);
      }
    } else if (available === 0 && input.value !== minNodes && !isEditingCluster) {
      // set input value to minimum if we don't have quota for it (and will be disabled)
      // this can happen if the user set a value, then switched to a machine type
      // where they have less quota than that value.
      input.onChange(minNodes);
    }
  }

  getAvailableQuota() {
    const {
      quota,
      isByoc,
      isMultiAz,
      machineType,
      machineTypes,
      cloudProviderID,
      product,
      billingModel,
    } = this.props;

    return getAvailableQuotaUtil({
      quota,
      isByoc,
      billingModel,
      cloudProviderID,
      isMultiAz,
      machineTypes,
      machineTypeId: machineType,
      product,
    });
  }

  render() {
    const {
      input,
      isMultiAz,
      isEditingCluster,
      currentNodeCount,
      label,
      helpText,
      extendedHelpText,
      machineType,
      isByoc,
      isMachinePool,
      minNodes,
      increment,
      isHypershiftWizard,
      poolNumber = isMultiAz ? 3 : 1,
      buttonAriaLabel,
    } = this.props;

    const optionValueIncrement =
      increment || incrementValue({ isHypershiftWizard, poolNumber, isMultiAz });

    const included = getIncludedNodes({ isMultiAz, isHypershift: !isMachinePool });
    const available = this.getAvailableQuota();

    const options = buildOptions({
      included,
      available,
      isEditingCluster,
      currentNodeCount,
      minNodes,
      increment: optionValueIncrement,
      isHypershift: isHypershiftWizard,
    });

    let notEnoughQuota = options.length < 1;

    // for BYOC lacking node quota machineType will be undefined
    if (isByoc && !isEditingCluster && !isMachinePool) {
      notEnoughQuota = !machineType || options.length < 1;
    }

    const optionLabel = (value) => {
      let labelNumber = value;
      if (isHypershiftWizard) {
        labelNumber = value / optionValueIncrement;
      } else if (isMultiAz) {
        labelNumber = value / 3;
      }
      return labelNumber.toString();
    };

    // Set up options for nodes
    const option = (value) => (
      <FormSelectOption
        key={value}
        value={value}
        // we want the value to be the actual value sent to the server,
        // but for multiAz the user selects the amount of nodes per zone, instead of total
        // so it needs to be divided by 3 for display
        label={optionLabel(value)}
      />
    );

    const formSelect = (
      <FormSelect
        aria-label="Compute nodes"
        isDisabled={notEnoughQuota}
        className="quota-dropdown"
        {...input}
      >
        {options.map((value) => option(value))}
      </FormSelect>
    );

    const showTotalNodes = () => {
      if (isHypershiftWizard) {
        return (
          <span>
            x {poolNumber} machine pools = {input.value} compute nodes
          </span>
        );
      }
      if (isMultiAz) {
        return <span>× 3 zones = {input.value} compute nodes</span>;
      }
      return null;
    };

    return (
      <FormGroup
        fieldId={input.name}
        label={label}
        helperText={helpText}
        labelIcon={
          extendedHelpText && (
            <PopoverHint hint={extendedHelpText} buttonAriaLabel={buttonAriaLabel} />
          )
        }
      >
        {notEnoughQuota ? (
          <Tooltip content={noQuotaTooltip} position="right">
            <div>{formSelect}</div>
          </Tooltip>
        ) : (
          formSelect
        )}
        {showTotalNodes()}
      </FormGroup>
    );
  }
}

NodeCountInput.propTypes = {
  isEditingCluster: PropTypes.bool,
  currentNodeCount: PropTypes.number,
  minNodes: PropTypes.number,
  label: PropTypes.string,
  helpText: PropTypes.string,
  extendedHelpText: PropTypes.string,
  quota: PropTypes.object.isRequired,
  isByoc: PropTypes.bool,
  isMachinePool: PropTypes.bool,
  isMultiAz: PropTypes.bool,
  machineType: PropTypes.string,
  machineTypes: PropTypes.object,
  input: PropTypes.shape({
    name: PropTypes.string.isRequired,
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    onChange: PropTypes.func.isRequired,
  }),
  cloudProviderID: PropTypes.string.isRequired,
  product: PropTypes.oneOf(Object.keys(normalizedProducts)).isRequired,
  billingModel: PropTypes.oneOf(Object.values(billingModels)).isRequired,
  increment: PropTypes.number,
  isHypershiftWizard: PropTypes.bool,
  poolNumber: PropTypes.number,
  buttonAriaLabel: PropTypes.string,
};

export default NodeCountInput;
