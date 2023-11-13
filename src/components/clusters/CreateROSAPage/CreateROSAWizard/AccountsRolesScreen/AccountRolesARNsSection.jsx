import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import get from 'lodash/get';
import { Field } from 'redux-form';
import { Link } from 'react-router-dom';
import {
  Alert,
  Button,
  ExpandableSection,
  Grid,
  GridItem,
  TextContent,
  Text,
  TextVariants,
  TextList,
  TextListItem,
  TextListVariants,
  Title,
  Label,
} from '@patternfly/react-core';
import spacing from '@patternfly/react-styles/css/utilities/Spacing/spacing';
import { Spinner } from '@redhat-cloud-services/frontend-components/Spinner';
import links from '~/common/installLinks.mjs';
import { trackEvents } from '~/common/analytics';
import useAnalytics from '~/hooks/useAnalytics';
import { useOCPLatestVersion } from '~/components/releases/hooks';
import { isSupportedMinorVersion, formatMinorVersion } from '~/common/helpers';
import { useFeatureGate } from '~/hooks/useFeatureGate';
import { HCP_USE_UNMANAGED } from '~/redux/constants/featureConstants';
import ErrorBox from '~/components/common/ErrorBox';
import ExternalLink from '~/components/common/ExternalLink';
import InstructionCommand from '~/components/common/InstructionCommand';
import { ReduxSelectDropdown } from '~/components/common/ReduxFormComponents';
import ReduxVerticalFormGroup from '~/components/common/ReduxFormComponents/ReduxVerticalFormGroup';
import {
  MIN_MANAGED_POLICY_VERSION,
  ROSA_HOSTED_CLI_MIN_VERSION,
} from '~/components/clusters/CreateROSAPage/CreateROSAWizard/rosaConstants';
import { AwsRoleErrorAlert } from './AwsRoleErrorAlert';
import { RosaCliCommand } from './constants/cliCommands';

import './AccountsRolesScreen.scss';

const NO_ROLE_DETECTED = 'No role detected';
const noRoleOption = {
  name: NO_ROLE_DETECTED,
  value: NO_ROLE_DETECTED,
};

const hasCompleteRoleSet = (role, isHypershiftSelected) =>
  role.Installer && role.Support && role.Worker && (role.ControlPlane || isHypershiftSelected);

// Order: current selected role > 'ManagedOpenShift'-prefixed role > first managed policy role > first complete role set > first incomplete role set > 'No Role Detected'
const getDefaultInstallerRole = (
  selectedInstallerRoleARN,
  accountRolesARNs,
  isHypershiftSelected,
) => {
  if (selectedInstallerRoleARN && selectedInstallerRoleARN !== NO_ROLE_DETECTED) {
    return selectedInstallerRoleARN;
  }

  if (accountRolesARNs.length === 0) {
    return NO_ROLE_DETECTED;
  }

  const firstManagedPolicyRole = accountRolesARNs.find(
    (role) => role.managedPolicies || role.hcpManagedPolicies,
  );

  const hasManagedOpenshiftPrefix = accountRolesARNs.find(
    (role) => role.prefix === 'ManagedOpenShift',
  );

  const firstCompleteRoleSet = accountRolesARNs.find((role) =>
    hasCompleteRoleSet(role, isHypershiftSelected),
  );
  const defaultRole =
    hasManagedOpenshiftPrefix ||
    firstManagedPolicyRole ||
    firstCompleteRoleSet ||
    accountRolesARNs[0];

  return defaultRole.Installer;
};
function AccountRolesARNsSection({
  touch,
  change,
  selectedAWSAccountID,
  selectedInstallerRoleARN,
  rosaMaxOSVersion,
  getAWSAccountRolesARNs,
  getAWSAccountRolesARNsResponse,
  clearGetAWSAccountRolesARNsResponse,
  isHypershiftSelected,
  onAccountChanged,
}) {
  const track = useAnalytics();
  const [isExpanded, setIsExpanded] = useState(true);
  const [accountRoles, setAccountRoles] = useState([]);
  const [installerRoleOptions, setInstallerRoleOptions] = useState([noRoleOption]);
  const [selectedInstallerRole, setSelectedInstallerRole] = useState(NO_ROLE_DETECTED);
  const [allARNsFound, setAllARNsFound] = useState(false);
  const [hasARNsError, setHasARNsError] = useState(false);
  const [hasManagedPolicies, setHasManagedPolicies] = useState(false);
  const useHCPManagedAndUnmanaged = useFeatureGate(HCP_USE_UNMANAGED);

  const touchARNsFields = React.useCallback(() => {
    touch('installer_role_arn');
    touch('support_role_arn');
    touch('worker_role_arn');
    if (!isHypershiftSelected) {
      touch('control_plane_role_arn');
    }
  }, [isHypershiftSelected, touch]);

  const updateRoleArns = (role) => {
    change('installer_role_arn', role?.Installer || NO_ROLE_DETECTED);
    change('support_role_arn', role?.Support || NO_ROLE_DETECTED);
    change('worker_role_arn', role?.Worker || NO_ROLE_DETECTED);
    if (!isHypershiftSelected) {
      change('control_plane_role_arn', role?.ControlPlane || NO_ROLE_DETECTED);
    }
  };

  const hasNoTrustedRelationshipOnClusterRoleError = ({ errorDetails }) =>
    errorDetails?.length &&
    errorDetails.some((error) => error?.Error_Key === 'NoTrustedRelationshipOnClusterRole');

  useEffect(() => {
    // this is required to show any validation error messages for the 4 disabled ARNs fields
    touchARNsFields();
  }, [touchARNsFields]);

  useEffect(() => {
    setSelectedInstallerRole(NO_ROLE_DETECTED);
    setAccountRoles([]);
    setInstallerRoleOptions([noRoleOption]);
    updateRoleArns(null);
    setAllARNsFound(false);
    clearGetAWSAccountRolesARNsResponse();
    onAccountChanged();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedAWSAccountID]);

  useEffect(() => {
    accountRoles.forEach((role) => {
      if (role.Installer === selectedInstallerRole) {
        setAllARNsFound(hasCompleteRoleSet(role, isHypershiftSelected));
        updateRoleArns(role);
        change('rosa_max_os_version', role.version);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedInstallerRole]);

  const hasManagedPoliciesByRole = (role) =>
    isHypershiftSelected ? role.hcpManagedPolicies : role.managedPolicies;

  // Determine whether the current selected role has managed policies and set to state managed value
  React.useEffect(() => {
    const selectedRole = accountRoles.find((role) => role.Installer === selectedInstallerRole);

    if (getAWSAccountRolesARNsResponse.fulfilled && selectedRole) {
      setHasManagedPolicies(hasManagedPoliciesByRole(selectedRole));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedAWSAccountID, getAWSAccountRolesARNsResponse, selectedInstallerRole]);

  const setSelectedInstallerRoleAndOptions = (accountRolesARNs) => {
    const installerOptions = [];
    if (accountRolesARNs.length === 0) {
      updateRoleArns(null);
      installerOptions.push(noRoleOption);
      change('rosa_max_os_version', undefined);
      setAllARNsFound(false);
    } else {
      accountRolesARNs.forEach((role) => {
        installerOptions.push({
          name: role.Installer,
          value: role.Installer,
          ...(!isHypershiftSelected &&
            hasManagedPoliciesByRole(role) && {
              label: (
                <Label color="blue" isCompact>
                  Recommended
                </Label>
              ),
            }),
        });
      });
    }
    setInstallerRoleOptions(installerOptions);

    const defaultInstallerRole = getDefaultInstallerRole(
      selectedInstallerRoleARN,
      accountRolesARNs,
      isHypershiftSelected,
    );
    setSelectedInstallerRole(defaultInstallerRole);
  };

  const resolveARNsErrorTitle = React.useCallback(
    (response) =>
      hasNoTrustedRelationshipOnClusterRoleError(response)
        ? 'Cannot detect an OCM role'
        : 'Error getting AWS account ARNs',
    [],
  );

  const trackArnsRefreshed = (response) => {
    track(trackEvents.ARNsRefreshed, {
      customProperties: {
        error: !!response.error,
        ...(response.error && {
          error_title: resolveARNsErrorTitle(response),
          error_message: response.errorMessage || undefined, // omit empty strings
          error_code: response.errorCode,
          error_operation_id: response.operationID,
        }),
      },
    });
  };

  useEffect(() => {
    if (
      !getAWSAccountRolesARNsResponse.pending &&
      !getAWSAccountRolesARNsResponse.fulfilled &&
      !getAWSAccountRolesARNsResponse.error
    ) {
      getAWSAccountRolesARNs(selectedAWSAccountID);
    } else if (getAWSAccountRolesARNsResponse.pending) {
      setHasARNsError(false);
    } else if (getAWSAccountRolesARNsResponse.fulfilled) {
      const accountRolesARNs = get(getAWSAccountRolesARNsResponse, 'data', []).filter((arn) => {
        if (isHypershiftSelected && useHCPManagedAndUnmanaged) {
          return true;
        }
        return isHypershiftSelected
          ? arn.hcpManagedPolicies && arn.managedPolicies
          : !arn.hcpManagedPolicies && !arn.managedPolicies;
      });
      setSelectedInstallerRoleAndOptions(accountRolesARNs);
      setAccountRoles(accountRolesARNs);
    } else if (getAWSAccountRolesARNsResponse.error) {
      change('installer_role_arn', '');
      setSelectedInstallerRoleAndOptions([]);
      setAccountRoles([]);
      setHasARNsError(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedAWSAccountID, getAWSAccountRolesARNsResponse]);

  useEffect(() => {
    if (getAWSAccountRolesARNsResponse.fulfilled || getAWSAccountRolesARNsResponse.error) {
      trackArnsRefreshed(getAWSAccountRolesARNsResponse);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [getAWSAccountRolesARNsResponse]);

  const onToggle = () => {
    setIsExpanded(!isExpanded);
  };

  const onInstallerRoleChange = (_, value) => {
    // changing to a new set of ARNs, which could have different
    // rosa_max_os_version, so clear the cluster_version which
    // will get a new default on next step of the wizard
    change('cluster_version', undefined);
    setSelectedInstallerRole(value);
  };

  const roleARNRequired = (value) =>
    value && value !== NO_ROLE_DETECTED ? undefined : 'ARN field is required.';

  const refreshARNs = () => {
    clearGetAWSAccountRolesARNsResponse();
    getAWSAccountRolesARNs(selectedAWSAccountID);

    // Clear the installer role/version if the latest fetched roles do not possess the previously selected one.
    if (!accountRoles.some((role) => role.Installer === selectedInstallerRole)) {
      change('installer_role_arn', '');
      setSelectedInstallerRole('');
      change('cluster_version', undefined);
    }
  };

  const [latestOCPVersion, latestVersionLoaded] = useOCPLatestVersion('stable');
  const rolesOutOfDate =
    latestVersionLoaded && !isSupportedMinorVersion(latestOCPVersion, rosaMaxOSVersion);
  const hasStandaloneManagedRole = !isHypershiftSelected && hasManagedPolicies;

  const arnsErrorAlert = React.useMemo(() => {
    const alertTitle = resolveARNsErrorTitle(getAWSAccountRolesARNsResponse);

    if (hasNoTrustedRelationshipOnClusterRoleError(getAWSAccountRolesARNsResponse)) {
      return <AwsRoleErrorAlert title={alertTitle} targetRole="ocm" />;
    }

    return <ErrorBox message={alertTitle} response={getAWSAccountRolesARNsResponse} />;
  }, [getAWSAccountRolesARNsResponse, resolveARNsErrorTitle]);

  const arnCompatibilityAlertTitle = React.useMemo(() => {
    if (isHypershiftSelected)
      return 'The selected account-wide roles are compatible with all OpenShift versions which support hosted control planes.';
    if (hasStandaloneManagedRole)
      return `The selected account-wide roles are preferred and compatible with OpenShift version ${MIN_MANAGED_POLICY_VERSION} and newer.`;

    return `The selected account-wide roles are compatible with OpenShift version ${formatMinorVersion(
      rosaMaxOSVersion,
    )} and earlier.`;
  }, [hasStandaloneManagedRole, isHypershiftSelected, rosaMaxOSVersion]);

  return (
    <>
      <GridItem />
      <GridItem>
        <Title headingLevel="h3">Account roles</Title>
      </GridItem>
      {hasARNsError && <GridItem span={8}>{arnsErrorAlert}</GridItem>}
      {!getAWSAccountRolesARNsResponse.pending && !allARNsFound && !hasARNsError && (
        <GridItem span={8}>
          {isHypershiftSelected ? (
            <Alert isInline variant="danger" title="Some account roles ARNs were not detected.">
              <br />
              Create the account roles using the following command in the ROSA CLI
              <InstructionCommand textAriaLabel="Copyable ROSA login command">
                {RosaCliCommand.CreateAccountRolesHCP}
              </InstructionCommand>
              <br />
              After running the command, you may need to refresh using the{' '}
              <strong>Refresh ARNs</strong> button below to populate the ARN fields.
              {isHypershiftSelected && (
                <p>You must use ROSA CLI version {ROSA_HOSTED_CLI_MIN_VERSION} or above.</p>
              )}
            </Alert>
          ) : (
            <AwsRoleErrorAlert
              title="Some account roles ARNs were not detected"
              targetRole="account"
            />
          )}
        </GridItem>
      )}
      {getAWSAccountRolesARNsResponse.pending && (
        <GridItem>
          <div className="spinner-fit-container">
            <Spinner />
          </div>
          <div className="spinner-loading-text">Loading account roles ARNs...</div>
        </GridItem>
      )}
      {!getAWSAccountRolesARNsResponse.pending && (
        <GridItem span={12}>
          <ExpandableSection
            isExpanded={isExpanded}
            onToggle={onToggle}
            toggleText="Account roles ARNs"
          >
            <Text component={TextVariants.p}>
              The following roles were detected in your AWS account.{' '}
              <ExternalLink href={links.ROSA_AWS_IAM_RESOURCES}>
                Learn more about account roles
              </ExternalLink>
              .
            </Text>
            <br />
            <Button
              variant="secondary"
              data-testid="refresh_arns_btn"
              onClick={() => {
                track(trackEvents.RefreshARNs);
                refreshARNs();
              }}
            >
              Refresh ARNs
            </Button>
            <br />
            <br />
            <Grid>
              <GridItem span={8}>
                <Field
                  component={ReduxSelectDropdown}
                  name="installer_role_arn"
                  label="Installer role"
                  type="text"
                  options={installerRoleOptions}
                  onChange={onInstallerRoleChange}
                  isDisabled={installerRoleOptions.length <= 1}
                  validate={roleARNRequired}
                  isRequired
                  helpText=""
                  extendedHelpText={
                    <>
                      An IAM role used by the ROSA installer.
                      <br />
                      For more information see{' '}
                      <ExternalLink href={links.ROSA_AWS_IAM_ROLES}>
                        Table 1 about the installer role policy
                      </ExternalLink>
                      .
                    </>
                  }
                />
                <br />
                <Field
                  component={ReduxVerticalFormGroup}
                  name="support_role_arn"
                  label="Support role"
                  type="text"
                  validate={roleARNRequired}
                  isRequired
                  // An IAM role used by the Red Hat Site Reliability Engineering (SRE) support team.
                  extendedHelpText={
                    <>
                      An IAM role used by the Red Hat Site Reliability Engineering (SRE) support
                      team.
                      <br />
                      For more information see{' '}
                      <ExternalLink href={links.ROSA_AWS_IAM_ROLES}>
                        Table 4 about the support role policy
                      </ExternalLink>
                      .
                    </>
                  }
                  isDisabled
                />
                <br />
                <Field
                  component={ReduxVerticalFormGroup}
                  name="worker_role_arn"
                  label="Worker role"
                  type="text"
                  validate={roleARNRequired}
                  isRequired
                  extendedHelpText={
                    <>
                      An IAM role used by the ROSA compute instances.
                      <br />
                      For more information see{' '}
                      <ExternalLink href={links.ROSA_AWS_IAM_ROLES}>
                        Table 3 about the worker/compute role policy
                      </ExternalLink>
                      .
                    </>
                  }
                  isDisabled
                />
                {!isHypershiftSelected && (
                  <>
                    <br />
                    <Field
                      component={ReduxVerticalFormGroup}
                      name="control_plane_role_arn"
                      label="Control plane role"
                      type="text"
                      validate={roleARNRequired}
                      isRequired
                      extendedHelpText={
                        <>
                          An IAM role used by the ROSA control plane.
                          <br />
                          For more information see{' '}
                          <ExternalLink href={links.ROSA_AWS_IAM_ROLES}>
                            Table 2 about the control plane role policy
                          </ExternalLink>
                          .
                        </>
                      }
                      isDisabled
                    />
                  </>
                )}
              </GridItem>
              {(rosaMaxOSVersion || hasStandaloneManagedRole) && (
                <GridItem>
                  <br />
                  <Alert
                    variant="info"
                    isInline
                    isPlain={hasStandaloneManagedRole || !rolesOutOfDate}
                    title={arnCompatibilityAlertTitle}
                  >
                    {rolesOutOfDate && !(hasStandaloneManagedRole || isHypershiftSelected) && (
                      <TextContent>
                        <Text component={TextVariants.p} className={spacing.mtSm}>
                          <strong>
                            To update account roles to the latest OpenShift version (
                            {formatMinorVersion(latestOCPVersion)}):
                          </strong>
                        </Text>
                        <TextList component={TextListVariants.ol}>
                          <TextListItem>
                            <Text component={TextVariants.p}>
                              Download latest ({formatMinorVersion(latestOCPVersion)}){' '}
                              <Link to="/downloads#tool-ocm">ocm</Link> and{' '}
                              <Link to="/downloads#tool-rosa">rosa</Link> CLIs
                            </Text>
                          </TextListItem>
                          <TextListItem className="pf-u-mb-sm">
                            <Text component={TextVariants.p}>Recreate ARNs using</Text>
                            <Text component={TextVariants.p}>
                              <InstructionCommand textAriaLabel="Copyable ROSA create account-roles command">
                                {RosaCliCommand.CreateAccountRoles}
                              </InstructionCommand>
                            </Text>
                          </TextListItem>
                        </TextList>
                        {/*
                        // TODO restore this when we have a doc URL (see https://issues.redhat.com/browse/OSDOCS-4138)
                        <Text component={TextVariants.p}>
                          <ExternalLink href="#">
                            Learn more about account-role version compatibility
                          </ExternalLink>
                        </Text>
                        */}
                      </TextContent>
                    )}
                  </Alert>
                </GridItem>
              )}
            </Grid>
            <GridItem span={4} />
          </ExpandableSection>
        </GridItem>
      )}
    </>
  );
}

AccountRolesARNsSection.propTypes = {
  touch: PropTypes.func,
  change: PropTypes.func,
  selectedAWSAccountID: PropTypes.string,
  selectedInstallerRoleARN: PropTypes.string,
  rosaMaxOSVersion: PropTypes.string,
  getAWSAccountRolesARNs: PropTypes.func.isRequired,
  getAWSAccountRolesARNsResponse: PropTypes.object.isRequired,
  clearGetAWSAccountRolesARNsResponse: PropTypes.func.isRequired,
  isHypershiftSelected: PropTypes.bool,
  onAccountChanged: PropTypes.func.isRequired,
};

export default AccountRolesARNsSection;
