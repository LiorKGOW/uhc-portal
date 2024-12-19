/* eslint-disable max-len */

import { splitVersion } from '~/common/versionHelpers';

const isSTSCluster = (state) =>
  state.clusters.details.cluster.aws?.sts?.role_arn &&
  state.clusters.details.cluster.aws?.sts?.role_arn !== '';

export const getClusterIdFromState = (state) => state.clusters?.details?.cluster?.id;

export const getClusterOpenShiftVersion = (state) =>
  state.clusters?.details?.cluster?.openshift_version;

export const getFromVersionFromState = (state) =>
  state.clusters.details.cluster.version?.raw_id || null;

export const getToVersionFromState = (state) => {
  const scheduledUpdate = state.clusterUpgrades?.schedules?.items?.find(
    (schedule) => schedule.version && schedule.version !== getFromVersionFromState(state),
  );
  if (!scheduledUpdate) {
    if (
      !state.clusters.details.cluster.version?.available_upgrades ||
      state.clusters.details.cluster.version?.available_upgrades.length === 0
    ) {
      return null;
    }
    const versionArray = state.clusters.details.cluster.version.available_upgrades;
    return versionArray[versionArray.length - 1];
  }
  return scheduledUpdate.version;
};

export const getIsManual = (state) =>
  !state.clusterUpgrades.schedules.items.some((policy) => policy.schedule_type === 'automatic');

export const getModalDataFromState = (state) => state.modal.data;

const getClusterMetAcks = (state) => state.clusters.details.cluster.upgradeGates || [];

export const getUpgradeGates = (state) => state.clusters.upgradeGates?.gates || [];

export const getClusterAcks = (state, upgradeVersion) => {
  const clusterId = getClusterIdFromState(state);
  if (!clusterId) {
    return [[], []];
  }
  const toVersion = upgradeVersion || getToVersionFromState(state);
  const fromVersion = getFromVersionFromState(state);
  const clusterAcks = getClusterMetAcks(state);
  const upgradeGates = getUpgradeGates(state) || [];

  const [toMajor, toMinor] = splitVersion(toVersion);
  const [fromMajor, fromMinor] = splitVersion(fromVersion);

  if (!toMajor || !toMinor || !fromMajor || !fromMinor) {
    return [[], []];
  }

  const possibleGates = upgradeGates.filter((gate) => {
    if (gate.sts_only && !isSTSCluster(state)) {
      return false;
    }
    const [gateMajor, gateMinor] = splitVersion(gate.version_raw_id_prefix);
    if (!gateMajor || !gateMinor) {
      return false;
    }
    return (
      (gateMajor > fromMajor && gateMajor <= toMajor) ||
      (gateMajor === fromMajor && gateMinor > fromMinor && gateMinor <= toMinor)
    );
  });

  const unMetAcks = [];
  const metAcks = [];

  possibleGates.forEach((gate) => {
    const clusterAck = clusterAcks.find((ack) => ack.version_gate.id === gate.id);
    if (clusterAck) {
      metAcks.push(clusterAck);
    } else {
      unMetAcks.push(gate);
    }
  });

  return [unMetAcks, metAcks];
};

export const getClusterUnMetClusterAcks = (state, upgradeVersion) => {
  const toVersion = upgradeVersion || getToVersionFromState(state);
  return getClusterAcks(state, toVersion)[0];
};

export const getHasUnMetClusterAcks = (state, upgradeVersion) =>
  getClusterUnMetClusterAcks(state, upgradeVersion).length > 0;

export const getHasScheduledManual = (state) =>
  getIsManual(state) &&
  state.clusterUpgrades.schedules.items.some(
    (schedule) => schedule.version !== getFromVersionFromState(state),
  );

export const getAutomaticUpgradePolicyId = (state) => {
  const automaticPolicy = state.clusterUpgrades.schedules.items.find(
    (policy) => policy.schedule_type === 'automatic',
  );
  return automaticPolicy?.id;
};

export const isManualUpdateSchedulingRequired = (state, upgradeVersion) => {
  // is this a minor or greater version upgrade?
  const toVersion = upgradeVersion || getToVersionFromState(state);
  const fromVersion = getFromVersionFromState(state);
  const [toMajor, toMinor] = splitVersion(toVersion);
  const [fromMajor, fromMinor] = splitVersion(fromVersion);
  if (!toMajor || !toMinor || !fromMajor || !fromMinor) {
    return false;
  }
  const minorPlusUpgrade = toMajor > fromMajor || toMinor > fromMinor;

  // is the ControlPlaneUpgradePolicy schedule type automatic and is enable_minor_version_upgrades true?
  const automaticUpdatePolicyExists = !!state?.clusterUpgrades?.schedules?.items.find(
    (policy) => policy?.schedule_type === 'automatic',
  );
  const enableMinorVersionUpgrade = !!state?.clusterUpgrades?.schedules?.items.find(
    (policy) => policy?.enable_minor_version_upgrades === 'true',
  );

  // is the ControlPlaneUpgradePolicy pending?
  const upgradePolicyPending = !!state?.clusterUpgrades?.schedules?.items.find(
    (policy) => policy?.state?.value === 'pending',
  );

  return (
    minorPlusUpgrade &&
    automaticUpdatePolicyExists &&
    !enableMinorVersionUpgrade &&
    upgradePolicyPending
  );
};
