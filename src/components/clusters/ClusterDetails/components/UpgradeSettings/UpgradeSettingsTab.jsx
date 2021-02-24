import React from 'react';
import PropTypes from 'prop-types';
import {
  Button, Card, CardBody, CardFooter, CardTitle,
  Form, Flex, FlexItem, Grid, GridItem, Modal,
  Tooltip, Alert,
} from '@patternfly/react-core';
import UpgradeStatus from '../../../common/Upgrades/UpgradeStatus';
import getClusterName from '../../../../../common/getClusterName';
import UpgradeSettingsFields from '../../../common/Upgrades/UpgradeSettingsFields';
import ErrorBox from '../../../../common/ErrorBox';
import modals from '../../../../common/Modal/modals';

class UpgradeSettingsTab extends React.Component {
  state = { confirmationModalOpen: false }

  componentDidMount() {
    const { getSchedules, cluster, upgradeScheduleRequest } = this.props;
    if (cluster.id && !upgradeScheduleRequest.pending) {
      getSchedules(cluster.id);
    }
  }

  componentDidUpdate(prevProps) {
    const { isAutomatic, schedules, pristine } = this.props;
    const scheduledManualUpgrade = schedules.items.find(schedule => schedule.schedule_type === 'manual');
    if (!prevProps.isAutomatic && isAutomatic && !pristine && scheduledManualUpgrade) {
      // eslint-disable-next-line react/no-did-update-set-state
      this.setState({ confirmationModalOpen: true });
    }
  }

  componentWillUnmount() {
    const { clearResponses } = this.props;
    clearResponses();
  }

  closeConfirmationModal = () => {
    this.setState({ confirmationModalOpen: false });
  }

  closeConfirmationModalAndReset = () => {
    const { reset } = this.props;
    this.closeConfirmationModal();
    reset();
  }

  render() {
    const {
      isAutomatic,
      handleSubmit,
      pristine,
      schedules,
      upgradeScheduleRequest,
      deleteScheduleRequest,
      editClusterRequest,
      reset,
      cluster,
      openModal,
      change,
      initialValues,
      clusterHibernating,
    } = this.props;
    const { confirmationModalOpen } = this.state;

    const isDisabled = !schedules.fulfilled
                      || upgradeScheduleRequest.pending;

    const scheduledManualUpgrade = schedules.items.find(schedule => schedule.schedule_type === 'manual');
    const actionsDisabled = isDisabled || pristine || clusterHibernating;

    const scheduledUpgrade = schedules.items.find(schedule => ['manual', 'automatic'].includes(schedule.schedule_type));
    // eslint-disable-next-line camelcase
    const availableUpgrades = cluster?.version?.available_upgrades;

    const showUpdateButton = !!cluster.openshift_version
                            && availableUpgrades?.length > 0
                            && !scheduledUpgrade && !clusterHibernating;

    const isPending = upgradeScheduleRequest.pending
                   || deleteScheduleRequest.pending
                   || editClusterRequest.pending;

    const saveButton = (
      <Button
        variant="primary"
        onClick={handleSubmit}
        isDisabled={actionsDisabled}
        isLoading={isPending}
      >
        Save
      </Button>
    );

    const hibernatingClusterInfo = (
      <Alert
        variant="info"
        className="space-bottom-md"
        isInline
        title="Version updates will not occur while this cluster is Hibernating.
            Once resumed, updates will start according to the selected updates strategy."
      />
    );

    return (
      <Grid hasGutter>
        <GridItem lg={9} md={12}>
          <Card>
            <CardTitle>Update strategy</CardTitle>
            <CardBody>
              {scheduledManualUpgrade && confirmationModalOpen && (
              <Modal
                variant="small"
                title="Automatic updates"
                isOpen
                onClose={() => { this.closeConfirmationModal(); reset(); }}
                actions={[
                  <Button key="confirm" variant="primary" onClick={this.closeConfirmationModal}>
                    Yes, cancel scheduled update
                  </Button>,
                  <Button key="cancel" variant="secondary" onClick={() => { this.closeConfirmationModal(); reset(); }}>
                    No, keep scheduled update
                  </Button>,
                ]}
              >
                By choosing automatic updates, your scheduled manual update will be cancelled.
                {' '}
                Are you sure you want to continue?
              </Modal>
              )}
              {clusterHibernating && hibernatingClusterInfo}
              {upgradeScheduleRequest.error && (
                <ErrorBox response={upgradeScheduleRequest} message="Can't schedule upgrade" />
              )}
              {deleteScheduleRequest.error && (
                <ErrorBox response={deleteScheduleRequest} message="Can't unschedule upgrade" />
              )}
              {editClusterRequest.error && (
                <ErrorBox response={editClusterRequest} message="Can't set grace period" />
              )}
              <Form>
                <Grid hasGutter>
                  <UpgradeSettingsFields
                    isAutomatic={isAutomatic}
                    isDisabled={isDisabled}
                    change={change}
                    initialSceduleValue={initialValues.automatic_upgrade_schedule}
                    showDivider
                  />
                </Grid>
              </Form>
            </CardBody>
            <CardFooter>
              <Flex>
                <FlexItem>
                  {
                    clusterHibernating ? (
                      <Tooltip content="This operation is not available while cluster is hibernating">
                        <span>
                          {saveButton}
                        </span>
                      </Tooltip>
                    ) : saveButton
                  }
                </FlexItem>
                <FlexItem>
                  <Button onClick={reset} variant="link" isDisabled={actionsDisabled}>
                  Cancel
                  </Button>
                </FlexItem>
              </Flex>
            </CardFooter>
          </Card>
        </GridItem>
        <GridItem lg={3} md={12}>
          <Card>
            <CardTitle>
              Update Status
            </CardTitle>
            <CardBody>
              <UpgradeStatus
                clusterID={cluster.id}
                canEdit={cluster.canEdit}
                clusterVersion={cluster.openshift_version}
                scheduledUpgrade={scheduledUpgrade}
                availableUpgrades={availableUpgrades}
                openModal={openModal}
              />
              {showUpdateButton && (
                <Button
                  variant="secondary"
                  onClick={() => openModal(modals.UPGRADE_WIZARD,
                    {
                      clusterName: getClusterName(cluster),
                      subscriptionID: cluster.subscription.id,
                    })}
                >
                  Update
                </Button>
              )}
            </CardBody>
          </Card>
        </GridItem>
      </Grid>
    );
  }
}

UpgradeSettingsTab.propTypes = {
  pristine: PropTypes.bool,
  isAutomatic: PropTypes.bool,
  clusterHibernating: PropTypes.bool,
  cluster: PropTypes.shape({
    canEdit: PropTypes.bool,
    openshift_version: PropTypes.string,
    id: PropTypes.string,
    subscription: PropTypes.shape({
      id: PropTypes.string,
    }),
    version: PropTypes.shape({
      channel_group: PropTypes.string,
      available_upgrades: PropTypes.arrayOf(PropTypes.string),
    }),
  }),
  getSchedules: PropTypes.func.isRequired,
  handleSubmit: PropTypes.func.isRequired,
  schedules: PropTypes.shape({
    fulfilled: PropTypes.bool,
    pending: PropTypes.bool,
    items: PropTypes.array,
  }),
  upgradeScheduleRequest: PropTypes.shape({
    fulfilled: PropTypes.bool,
    pending: PropTypes.bool,
    error: PropTypes.bool,
  }),
  deleteScheduleRequest: PropTypes.shape({
    pending: PropTypes.bool,
    error: PropTypes.bool,
  }),
  editClusterRequest: PropTypes.shape({
    pending: PropTypes.bool,
    error: PropTypes.bool,
  }),
  reset: PropTypes.func,
  openModal: PropTypes.func,
  clearResponses: PropTypes.func,
  change: PropTypes.func,
  initialValues: PropTypes.shape({
    automatic_upgrade_schedule: PropTypes.string,
  }),
};

export default UpgradeSettingsTab;
