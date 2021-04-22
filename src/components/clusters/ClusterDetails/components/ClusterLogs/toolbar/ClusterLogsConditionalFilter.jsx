import React, { Component } from 'react';
import {
  ConditionalFilter,
  conditionalFilterType,
} from '@redhat-cloud-services/frontend-components';
import PropTypes from 'prop-types';
import { SEVERITY_TYPES } from '../clusterLogConstants';
import { buildFilterURLParams } from '../../../../../../common/queryHelpers';

class ClusterLogsConditionalFilter extends Component {
  constructor(props) {
    super(props);
    this.updateFilter = this.updateFilter.bind(this);
    this.updateFlags = this.updateFlags.bind(this);
    this.inputTimeoutID = null;
  }

  state = {
    // The current input value is in the local state, while the currently
    // set filter is in the redux state.
    // This is done to allow some delay between the user's input and
    // the actual filtering, to give them time to finish typing.
    description: '',

    // flags
    severityTypes: [],
  };

  componentDidMount() {
    const { currentFilter, currentFlags } = this.props;
    if (currentFilter) {
      this.setState({ ...currentFilter });
    }
    if (currentFlags) {
      this.setState({ severityTypes: currentFlags.severityTypes });
    }
  }

  // eslint-disable-next-line camelcase
  UNSAFE_componentWillReceiveProps(nextProps) {
    const { currentFilter, currentFlags } = this.props;
    if (nextProps.currentFilter !== currentFilter) {
      this.setState({ ...nextProps.currentFilter });
    }
    if (nextProps.currentFlags !== currentFlags) {
      this.setState({ severityTypes: nextProps.currentFlags.severityTypes });
    }
  }

  updateFilter() {
    const { setFilter } = this.props;
    const { description } = this.state;

    setFilter({
      description,
    });
  }

  updateFlags(value, field) {
    const { setFlags, history: { push } } = this.props;

    this.setState({ [field]: value }, () => {
      const { severityTypes } = this.state;
      setFlags({ severityTypes });
      push({
        search: buildFilterURLParams({ severityTypes }),
      });
    });
  }

  updateCurrentValue(value, field) {
    if (this.inputTimeoutID !== null) {
      clearTimeout(this.inputTimeoutID);
    }
    this.setState({ [field]: value });
    this.inputTimeoutID = setTimeout(this.updateFilter, 300);
  }

  render() {
    const {
      description,
      severityTypes,
    } = this.state;

    const descriptionFilter = {
      type: conditionalFilterType.text,
      value: 'Description',
      label: 'Description',
      filterValues: {
        'aria-label': 'Description Filter Input',
        onChange: (event, value) => this.updateCurrentValue(value, 'description'),
        value: description,
      },
    };

    const severityTypesCheckbox = {
      type: conditionalFilterType.checkbox,
      label: 'Severity',
      value: 'Severity',
      filterValues: {
        onChange: (event, value) => this.updateFlags(value, 'severityTypes'),
        items: SEVERITY_TYPES.map(key => ({
          label: key,
          value: key,
        })),
        value: severityTypes,
      },
    };

    return (
      <ConditionalFilter
        items={[
          descriptionFilter,
          severityTypesCheckbox,
        ]}
      />
    );
  }
}

ClusterLogsConditionalFilter.propTypes = {
  currentFilter: PropTypes.shape({
    description: PropTypes.string,
  }).isRequired,
  currentFlags: PropTypes.shape({
    severityTypes: PropTypes.arrayOf(PropTypes.string),
  }).isRequired,
  setFilter: PropTypes.func.isRequired,
  setFlags: PropTypes.func.isRequired,
  history: PropTypes.shape({
    push: PropTypes.func.isRequired,
  }).isRequired,
};

export default ClusterLogsConditionalFilter;
