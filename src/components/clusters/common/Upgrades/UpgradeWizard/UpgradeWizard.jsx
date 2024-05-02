import React from 'react';
import PropTypes from 'prop-types';

import { Title } from '@patternfly/react-core';
import { Wizard as WizardDeprecated } from '@patternfly/react-core/deprecated';
import { DateFormat } from '@redhat-cloud-services/frontend-components/DateFormat';
import { Spinner } from '@redhat-cloud-services/frontend-components/Spinner';

import clusterService from '../../../../../services/clusterService';
import modals from '../../../../common/Modal/modals';
import { isHypershiftCluster } from '../../clusterStates';
import UpgradeAcknowledgeStep from '../UpgradeAcknowledge/UpgradeAcknowledgeStep';

import FinishedStep from './FinishedStep';
import UpgradeTimeSelection from './UpgradeTimeSelection';
import VersionSelectionGrid from './VersionSelectionGrid';

import './UpgradeWizard.scss';

class UpgradeWizard extends React.Component {
  state = {
    selectedVersion: undefined,
    upgradeTimestamp: undefined,
    requireAcknowledgement: false,
    acknowledged: false,
    scheduleType: 'now',
  };

  componentDidMount() {
    const { fetchClusterDetails, subscriptionID } = this.props;
    // make sure cluster data is fresh
    fetchClusterDetails(subscriptionID);
  }

  close = () => {
    const { closeModal, clearPostedUpgradeScheduleResponse } = this.props;
    this.setState({ selectedVersion: undefined, upgradeTimestamp: undefined, scheduleType: 'now' });
    clearPostedUpgradeScheduleResponse();
    closeModal();
  };

  selectVersion = (version) => {
    const { getUnMetClusterAcknowledgements } = this.props;
    const requireAcknowledgement = getUnMetClusterAcknowledgements(version).length > 0;
    this.setState({ selectedVersion: version, requireAcknowledgement });
  };

  setSchedule = ({ timestamp, type }) =>
    this.setState({
      upgradeTimestamp: timestamp,
      scheduleType: type,
    });

  onNext = (newStep) => {
    const { clusterDetails, postSchedule, getUnMetClusterAcknowledgements, setGate, rejectGate } =
      this.props;
    const { selectedVersion, scheduleType, upgradeTimestamp } = this.state;
    const MINUTES_IN_MS = 1000 * 60;
    if (newStep.id === 'finish') {
      const nextRun =
        scheduleType === 'now'
          ? new Date(new Date().getTime() + 6 * MINUTES_IN_MS).toISOString()
          : upgradeTimestamp;

      let error = null;

      const promises = getUnMetClusterAcknowledgements(selectedVersion).map((upgradeGate) => {
        if (!error) {
          return (
            // post upgrade_gate agreement
            clusterService
              .postClusterGateAgreement(clusterDetails.cluster.id, upgradeGate.id)
              .then(() => {
                setGate(upgradeGate.id);
              })
              .catch((e) => {
                error = e;
              })
          );
        }
        return true;
      });

      Promise.allSettled(promises).then(() => {
        if (!error) {
          postSchedule(
            clusterDetails.cluster.id,
            {
              schedule_type: 'manual',
              upgrade_type: isHypershiftCluster(clusterDetails.cluster) ? 'ControlPlane' : 'OSD',
              next_run: nextRun,
              version: selectedVersion,
            },
            isHypershiftCluster(clusterDetails.cluster),
          );
        } else {
          rejectGate(error);
        }
      });
    }
  };

  render() {
    const {
      clusterName,
      upgradeScheduleRequest,
      clusterDetails,
      subscriptionID,
      getUnMetClusterAcknowledgements,
    } = this.props;
    const {
      selectedVersion,
      upgradeTimestamp,
      scheduleType,
      requireAcknowledgement,
      acknowledged,
    } = this.state;
    const { cluster } = clusterDetails;
    const isPending =
      (clusterDetails.pending && !clusterDetails.fulfilled) ||
      cluster?.subscription.id !== subscriptionID;

    const gotAllDetails =
      selectedVersion &&
      (upgradeTimestamp || scheduleType === 'now') &&
      ((requireAcknowledgement && acknowledged) || !requireAcknowledgement);

    const steps = [
      {
        id: 'select-version',
        name: 'Select version',
        component: isPending ? (
          <Spinner centered />
        ) : (
          <VersionSelectionGrid
            availableUpgrades={cluster.version?.available_upgrades}
            clusterVersion={cluster.openshift_version || cluster?.version?.id}
            clusterChannel={cluster.version.channel_group}
            selected={selectedVersion}
            onSelect={this.selectVersion}
            getUnMetClusterAcknowledgements={getUnMetClusterAcknowledgements}
          />
        ),
        enableNext: !!selectedVersion,
      },
      ...(selectedVersion && requireAcknowledgement
        ? [
            {
              id: 'acknowledge_upgrade',
              name: 'Administrator acknowledgement',
              component: (
                <UpgradeAcknowledgeStep
                  confirmed={(isConfirmed) => {
                    this.setState({ acknowledged: isConfirmed });
                  }}
                  unmetAcknowledgements={getUnMetClusterAcknowledgements(selectedVersion)}
                  fromVersion={clusterDetails.cluster.openshift_version}
                  toVersion={selectedVersion}
                  initiallyConfirmed={acknowledged}
                />
              ),
              canJumpTo: !!selectedVersion,
              enableNext: gotAllDetails,
            },
          ]
        : []),
      {
        id: 'schedule-upgrade',
        name: 'Schedule update',
        component: (
          <UpgradeTimeSelection
            onSet={this.setSchedule}
            timestamp={upgradeTimestamp}
            type={scheduleType}
          />
        ),
        canJumpTo: !!selectedVersion && (!requireAcknowledgement || acknowledged),
        enableNext: gotAllDetails,
      },
      {
        id: 'confirmation',
        name: 'Confirmation',
        component: (
          <>
            <Title className="wizard-step-title" size="lg" headingLevel="h3">
              Confirmation of your update
            </Title>
            <dl className="wizard-step-body cluster-upgrade-dl">
              <div>
                <dt>Version</dt>
                <dd>
                  {cluster.openshift_version} &rarr; {selectedVersion}
                </dd>
              </div>
              {requireAcknowledgement ? (
                <div>
                  <dt>Administrator acknowledgement</dt>
                  <dd>{acknowledged ? 'Approved' : 'Not approved'}</dd>
                </div>
              ) : null}

              <dt>Scheduled</dt>
              <dd>
                {scheduleType === 'now' ? (
                  'Within the next hour'
                ) : (
                  <dl>
                    <dt>UTC</dt>
                    <dd>
                      <DateFormat type="exact" date={new Date(upgradeTimestamp)} />
                    </dd>
                    <div>
                      <dt>Local time</dt>
                      <dd>{new Date(upgradeTimestamp).toString()}</dd>
                    </div>
                  </dl>
                )}
              </dd>
            </dl>
          </>
        ),
        nextButtonText: 'Confirm update',
        canJumpTo: gotAllDetails,
      },
      {
        id: 'finish',
        name: 'Finish',
        component: (
          <FinishedStep
            onClose={this.closeWizard}
            scheduleType={scheduleType}
            upgradeTimestamp={upgradeTimestamp}
            requestStatus={upgradeScheduleRequest}
            close={this.close}
          />
        ),
        isFinishedStep: true,
      },
    ];
    return (
      <WizardDeprecated
        title="Update cluster"
        className="ocm-upgrade-wizard"
        description={clusterName}
        isOpen
        steps={steps}
        onNext={this.onNext}
        onClose={this.close}
      />
    );
  }
}

UpgradeWizard.propTypes = {
  closeModal: PropTypes.func.isRequired,
  clusterName: PropTypes.string,
  subscriptionID: PropTypes.string,
  upgradeScheduleRequest: PropTypes.object.isRequired,
  postSchedule: PropTypes.func.isRequired,
  clearPostedUpgradeScheduleResponse: PropTypes.func.isRequired,
  fetchClusterDetails: PropTypes.func.isRequired,
  clusterDetails: PropTypes.shape({
    pending: PropTypes.bool,
    fulfilled: PropTypes.bool,
    cluster: PropTypes.shape({
      id: PropTypes.string,
      subscription: PropTypes.shape({
        id: PropTypes.string,
      }),
      openshift_version: PropTypes.string,
      version: PropTypes.shape({
        channel_group: PropTypes.string,
        id: PropTypes.string,
        available_upgrades: PropTypes.arrayOf(PropTypes.string),
      }),
    }),
  }),
  getUnMetClusterAcknowledgements: PropTypes.func,
  setGate: PropTypes.func,
  rejectGate: PropTypes.func,
};

UpgradeWizard.modalName = modals.UPGRADE_WIZARD;

export default UpgradeWizard;
