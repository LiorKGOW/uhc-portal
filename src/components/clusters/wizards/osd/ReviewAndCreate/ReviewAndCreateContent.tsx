import React from 'react';
import isEmpty from 'lodash/isEmpty';

import {
  Bullseye,
  Spinner,
  Stack,
  StackItem,
  Title,
  useWizardContext,
} from '@patternfly/react-core';

import config from '~/config';
import ReviewSection, {
  ReviewItem,
} from '~/components/clusters/wizards/common/ReviewCluster/ReviewSection';
import { useFormState } from '~/components/clusters/wizards/hooks';
import { hasSelectedSecurityGroups } from '~/common/securityGroupsHelpers';
import {
  CloudProviderType,
  UpgradePolicyType,
} from '~/components/clusters/wizards/common/constants';
import { FieldId, StepId } from '~/components/clusters/wizards/osd/constants';
import useCanClusterAutoscale from '~/components/clusters/ClusterDetails/components/MachinePools/components/EditMachinePoolModal/hooks/useCanClusterAutoscale';
import { GCP_SECURE_BOOT_UI } from '~/redux/constants/featureConstants';
import { useFeatureGate } from '~/hooks/useFeatureGate';
import { DebugClusterRequest } from '~/components/clusters/wizards/common/DebugClusterRequest';
import { canSelectImds } from '../../rosa/constants';

interface ReviewAndCreateContentProps {
  isPending: boolean;
}

export const ReviewAndCreateContent = ({ isPending }: ReviewAndCreateContentProps) => {
  const { goToStepById } = useWizardContext();
  const {
    values: {
      [FieldId.Product]: product,
      [FieldId.InstallToVpc]: installToVpc,
      [FieldId.InstallToSharedVpc]: installToSharedVpc,
      [FieldId.ConfigureProxy]: configureProxy,
      [FieldId.Byoc]: byoc,
      [FieldId.CloudProvider]: cloudProvider,
      [FieldId.NodeLabels]: nodeLabels,
      [FieldId.ClusterPrivacy]: clusterPrivacy,
      [FieldId.ClusterVersion]: clusterVersion,
      [FieldId.ApplicationIngress]: applicationIngress,
      [FieldId.SecurityGroups]: securityGroups,
    },
    values: formValues,
  } = useFormState();
  const canAutoScale = useCanClusterAutoscale(product);
  const autoscalingEnabled = canAutoScale && !!formValues[FieldId.AutoscalingEnabled];

  const isByoc = byoc === 'true';
  const isAWS = cloudProvider === CloudProviderType.Aws;
  const isGCP = cloudProvider === CloudProviderType.Gcp;

  const hasSecurityGroups = isByoc && hasSelectedSecurityGroups(securityGroups);
  const isSecureBootFeatureEnabled = useFeatureGate(GCP_SECURE_BOOT_UI);

  const clusterSettingsFields = [
    FieldId.CloudProvider,
    FieldId.ClusterName,
    FieldId.ClusterVersion,
    FieldId.Region,
    FieldId.MultiAz,
    ...(isGCP && isSecureBootFeatureEnabled ? [FieldId.SecureBoot] : []),
    FieldId.EnableUserWorkloadMonitoring,
    ...(isByoc ? [FieldId.CustomerManagedKey] : [FieldId.PersistentStorage]),
    ...(isByoc && isAWS ? [FieldId.DisableScpChecks] : []),
    FieldId.EtcdEncryption,
    FieldId.FipsCryptography,
  ];

  if (isPending) {
    return (
      <Bullseye>
        <Stack>
          <StackItem>
            <Bullseye>
              <Spinner size="xl" />
            </Bullseye>
          </StackItem>
          <StackItem>
            <Bullseye>
              Creating your cluster. Do not refresh this page. This request may take a moment...
            </Bullseye>
          </StackItem>
        </Stack>
      </Bullseye>
    );
  }

  return (
    <div className="ocm-create-osd-review-screen">
      <Title headingLevel="h2">Review your dedicated cluster</Title>

      <ReviewSection title="Billing model" onGoToStep={() => goToStepById(StepId.BillingModel)}>
        <ReviewItem name={FieldId.BillingModel} formValues={formValues} />
        <ReviewItem name={FieldId.Byoc} formValues={formValues} />
      </ReviewSection>

      <ReviewSection
        title="Cluster settings"
        onGoToStep={() => goToStepById(StepId.ClusterSettingsCloudProvider)}
      >
        {clusterSettingsFields.map((name) => (
          <ReviewItem name={name} formValues={formValues} />
        ))}
      </ReviewSection>

      <ReviewSection
        title="Default machine pool"
        onGoToStep={() => goToStepById(StepId.ClusterSettingsMachinePool)}
      >
        <ReviewItem name={FieldId.MachineType} formValues={formValues} />
        {canAutoScale && <ReviewItem name={FieldId.AutoscalingEnabled} formValues={formValues} />}
        {autoscalingEnabled ? (
          <ReviewItem name={FieldId.MinReplicas} formValues={formValues} />
        ) : (
          <ReviewItem name={FieldId.NodesCompute} formValues={formValues} />
        )}
        {!(nodeLabels.length === 1 && isEmpty(nodeLabels[0].key)) && (
          <ReviewItem name={FieldId.NodeLabels} formValues={formValues} />
        )}
        {isAWS && isByoc && canSelectImds(clusterVersion.raw_id) && (
          <ReviewItem name={FieldId.IMDS} formValues={formValues} />
        )}
      </ReviewSection>

      <ReviewSection
        title="Networking"
        onGoToStep={() =>
          goToStepById(isAWS ? StepId.NetworkingConfiguration : StepId.NetworkingCidrRanges)
        }
      >
        <ReviewItem name={FieldId.ClusterPrivacy} formValues={formValues} />
        {isByoc && <ReviewItem name={FieldId.InstallToVpc} formValues={formValues} />}
        {isByoc && clusterPrivacy === 'internal' && installToVpc && (
          <ReviewItem name={FieldId.UsePrivateLink} formValues={formValues} />
        )}
        {isByoc && isGCP && installToSharedVpc && (
          <ReviewItem name={FieldId.SharedHostProjectID} formValues={formValues} />
        )}
        {isByoc && installToVpc && (
          <ReviewItem name={isAWS ? 'aws_standalone_vpc_osd' : 'gpc_vpc'} formValues={formValues} />
        )}
        {isByoc && installToVpc && hasSecurityGroups && (
          <ReviewItem name="securityGroups" formValues={formValues} />
        )}
        {installToVpc && <ReviewItem name={FieldId.ConfigureProxy} formValues={formValues} />}
        {installToVpc && configureProxy && (
          <>
            <ReviewItem name={FieldId.HttpProxyUrl} formValues={formValues} />
            <ReviewItem name={FieldId.HttpsProxyUrl} formValues={formValues} />
            <ReviewItem name={FieldId.NoProxyDomains} formValues={formValues} />
            <ReviewItem name={FieldId.AdditionalTrustBundle} formValues={formValues} />
          </>
        )}
        <ReviewItem name={FieldId.NetworkMachineCidr} formValues={formValues} />
        <ReviewItem name={FieldId.NetworkServiceCidr} formValues={formValues} />
        <ReviewItem name={FieldId.NetworkPodCidr} formValues={formValues} />
        <ReviewItem name={FieldId.NetworkHostPrefix} formValues={formValues} />

        {isByoc && <ReviewItem name={FieldId.ApplicationIngress} formValues={formValues} />}

        {applicationIngress !== 'default' && isByoc && (
          <>
            <ReviewItem name={FieldId.DefaultRouterSelectors} formValues={formValues} />
            <ReviewItem
              name={FieldId.DefaultRouterExcludedNamespacesFlag}
              formValues={formValues}
            />
            <ReviewItem
              name={FieldId.IsDefaultRouterWildcardPolicyAllowed}
              formValues={formValues}
            />
            <ReviewItem
              name={FieldId.IsDefaultRouterNamespaceOwnershipPolicyStrict}
              formValues={formValues}
            />
          </>
        )}
      </ReviewSection>

      <ReviewSection title="Updates" onGoToStep={() => goToStepById(StepId.ClusterUpdates)}>
        <ReviewItem name={FieldId.UpgradePolicy} formValues={formValues} />
        {formValues[FieldId.UpgradePolicy] === UpgradePolicyType.Automatic && (
          <ReviewItem name={FieldId.AutomaticUpgradeSchedule} formValues={formValues} />
        )}
        <ReviewItem name={FieldId.NodeDrainGracePeriod} formValues={formValues} />
      </ReviewSection>

      {config.fakeOSD && (
        <DebugClusterRequest
          cloudProvider={cloudProvider}
          product={product}
          formValues={formValues}
        />
      )}
    </div>
  );
};
