import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Field, FieldArray } from 'redux-form';
import {
  Form, Grid, GridItem,
} from '@patternfly/react-core';

import Modal from '../../../../../../common/Modal/Modal';
import ErrorBox from '../../../../../../common/ErrorBox';

import { ReduxFormDropdown, ReduxFormTaints } from '../../../../../../common/ReduxFormComponents';

class EditTaintsModal extends Component {
  componentDidMount() {
    const {
      machinePoolsList,
      getMachinePools,
    } = this.props;

    if (!machinePoolsList.pending) {
      getMachinePools();
    }
  }

  componentDidUpdate() {
    const { editTaintsResponse } = this.props;

    if (editTaintsResponse.fulfilled
      && !editTaintsResponse.pending
      && !editTaintsResponse.error) {
      this.cancelEdit();
    }
  }

  handleMachinePoolChange = (_, value) => {
    const { change, machinePoolsList } = this.props;
    const selectedMachinePoolTaints = machinePoolsList.data
      .find(machinePool => machinePool.id === value)?.taints;

    change('taints', selectedMachinePoolTaints || [{ effect: 'NoSchedule' }]);
  };


  cancelEdit = () => {
    const {
      resetEditTaintsResponse,
      resetGetMachinePoolsResponse,
      closeModal,
      reset,
    } = this.props;
    resetEditTaintsResponse();
    resetGetMachinePoolsResponse();
    closeModal();
    reset();
  };

  render() {
    const {
      machinePoolsList,
      handleSubmit,
      editTaintsResponse,
      pristine,
    } = this.props;

    const error = editTaintsResponse.error ? (
      <ErrorBox message="Error editing taints" response={editTaintsResponse} />
    ) : null;


    const { pending } = editTaintsResponse;

    return (
      <Modal
        title="Edit taints"
        onClose={this.cancelEdit}
        primaryText="Save"
        onPrimaryClick={handleSubmit}
        onSecondaryClick={this.cancelEdit}
        isPrimaryDisabled={pending || pristine}
        isPending={pending}
        modalSize="medium"
      >
        <>
          {error}
          <Form onSubmit={handleSubmit}>
            <Grid hasGutter>
              <GridItem span={5}>
                <Field
                  component={ReduxFormDropdown}
                  name="machinePoolId"
                  label="Machine pool"
                  options={machinePoolsList.data.map(machinePool => ({
                    name: machinePool.id,
                    value: machinePool.id,
                  }))}
                  onChange={this.handleMachinePoolChange}
                />
              </GridItem>
              <GridItem span={7} />
              <GridItem span={12}>
                <FieldArray name="taints" component={ReduxFormTaints} />
              </GridItem>
            </Grid>
          </Form>
        </>
      </Modal>
    );
  }
}

EditTaintsModal.propTypes = {
  closeModal: PropTypes.func.isRequired,
  handleSubmit: PropTypes.func.isRequired,
  editTaintsResponse: PropTypes.object.isRequired,
  getMachinePools: PropTypes.func.isRequired,
  resetEditTaintsResponse: PropTypes.func.isRequired,
  resetGetMachinePoolsResponse: PropTypes.func.isRequired,
  machinePoolsList: PropTypes.object.isRequired,
  change: PropTypes.func.isRequired,
  reset: PropTypes.func.isRequired,
  pristine: PropTypes.bool.isRequired,
};

export default EditTaintsModal;
