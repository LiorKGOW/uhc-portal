import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Field } from 'formik';
import { Spinner } from '@redhat-cloud-services/frontend-components/Spinner';
import { useFormState } from '~/components/clusters/wizards/hooks';
import { FieldId } from '~/components/clusters/wizards/rosa_v2/constants';

import {
  Alert,
  Button,
  Form,
  FormGroup,
  Grid,
  GridItem,
  Text,
  TextContent,
  TextVariants,
  Title,
  ToggleGroup,
  ToggleGroupItem,
} from '@patternfly/react-core';

import useAnalytics from '~/hooks/useAnalytics';
import { trackEvents } from '~/common/analytics';
import ReduxHiddenCheckbox from '~/components/common/FormikFormComponents/HiddenCheckbox';
import {
  getForcedByoOidcReason,
  getOperatorRolesCommand,
} from '~/components/clusters/wizards/rosa_v2/ClusterRolesScreen/clusterRolesHelper';
import ExternalLink from '../../../../common/ExternalLink';
import ErrorBox from '../../../../common/ErrorBox';
import InstructionCommand from '../../../../common/InstructionCommand';
import RadioButtons from '../../../../common/ReduxFormComponents/RadioButtons';
import PopoverHint from '../../../../common/PopoverHint';
import links from '../../../../../common/installLinks.mjs';
import { required } from '../../../../../common/validators';
import { secureRandomValueInRange } from '../../../../../common/helpers';
import { BackToAssociateAwsAccountLink } from '../common/BackToAssociateAwsAccountLink';
import CustomOperatorRoleNames from './CustomOperatorRoleNames';
import CustomerOIDCConfiguration from './CustomerOIDCConfiguration';

export const createOperatorRolesHashPrefix = () => {
  // random 4 alphanumeric hash
  const prefixArray = Array.from(crypto.getRandomValues(new Uint8Array(4))).map((value) =>
    (value % 36).toString(36),
  );
  // cannot start with a number
  const alphabet = 'abcdefghijklmnopqrstuvwxyz';
  const randomCharacter = alphabet[secureRandomValueInRange(0, 25)];
  prefixArray[0] = randomCharacter;
  return prefixArray.join('');
};

const roleModes = {
  MANUAL: 'manual',
  AUTO: 'auto',
};

const ClusterRolesScreen = ({
  getOCMRole,
  getOCMRoleResponse,
  clearGetOcmRoleResponse,
  getUserOidcConfigurations,
}) => {
  const {
    setFieldValue,
    getFieldProps,
    getFieldMeta,
    values: {
      [FieldId.ClusterName]: clusterName,
      [FieldId.Hypershift]: hypershiftValue,
      [FieldId.SharedVpc]: sharedVpcSettings,
      [FieldId.AssociatedAwsId]: awsAccountID,
      [FieldId.RosaRolesProviderCreationMode]: rosaCreationMode,
      [FieldId.CustomOperatorRolesPrefix]: customOperatorRolesPrefix,
      [FieldId.ByoOidcConfigId]: byoOidcConfigID,
      [FieldId.InstallerRoleArn]: installerRoleArn,
    },
  } = useFormState();
  const sharedVpcRoleArn = sharedVpcSettings?.hosted_zone_role_arn;
  const isSharedVpcSelected = sharedVpcSettings.is_selected;
  const isHypershiftSelected = hypershiftValue === 'true';
  let forcedByoOidcType;
  if (isHypershiftSelected) {
    forcedByoOidcType = 'Hypershift';
  } else if (isSharedVpcSelected) {
    forcedByoOidcType = 'SharedVPC';
  }

  const [isAutoModeAvailable, setIsAutoModeAvailable] = useState(false);
  const [hasByoOidcConfig, setHasByoOidcConfig] = useState(
    !!(forcedByoOidcType || byoOidcConfigID),
  );

  const [getOCMRoleErrorBox, setGetOCMRoleErrorBox] = useState(null);
  const track = useAnalytics();

  const toggleByoOidcConfig = (isChecked) => () => {
    if (isChecked) {
      setFieldValue(
        FieldId.RosaRolesProviderCreationMode,
        isAutoModeAvailable ? roleModes.AUTO : roleModes.MANUAL,
      );
    } else {
      setFieldValue(FieldId.ByoOidcConfigId, '');
      setFieldValue(FieldId.ByoOidcConfigIdManaged, '');
    }
    setHasByoOidcConfig(isChecked);
  };

  const onSelectOIDCConfig = (oidcConfig) => {
    setFieldValue(FieldId.ByoOidcConfigId, oidcConfig ? oidcConfig.id : '');
    setFieldValue(
      FieldId.ByoOidcConfigIdManaged,
      !oidcConfig || oidcConfig.managed ? 'true' : 'false',
    );
  };

  useEffect(() => {
    if (!customOperatorRolesPrefix) {
      setFieldValue(
        FieldId.CustomOperatorRolesPrefix,
        `${clusterName}-${createOperatorRolesHashPrefix()}`,
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [customOperatorRolesPrefix, clusterName]);

  useEffect(() => {
    // clearing the ocm_role_response results in ocm role being re-fetched
    // when navigating to this step (from Next or Back)
    setFieldValue(FieldId.DetectedOcmRole, false);
    clearGetOcmRoleResponse();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!rosaCreationMode && getOCMRoleResponse.fulfilled) {
    setFieldValue(
      FieldId.RosaRolesProviderCreationMode,
      getOCMRoleResponse.data?.isAdmin ? roleModes.AUTO : roleModes.MANUAL,
    );
  }

  useEffect(() => {
    if (getOCMRoleResponse.pending) {
      setGetOCMRoleErrorBox(null);
    } else if (getOCMRoleResponse.fulfilled) {
      setFieldValue(FieldId.RosaCreatorArn, getOCMRoleResponse.data?.arn);
      setFieldValue(FieldId.DetectedOcmRole, true);
      const isAdmin = getOCMRoleResponse.data?.isAdmin;
      setIsAutoModeAvailable(isAdmin);
      setGetOCMRoleErrorBox(null);
    } else if (getOCMRoleResponse.error) {
      // display error
      setGetOCMRoleErrorBox(
        <ErrorBox
          message="ocm-role is no longer linked to your Red Hat organization"
          response={getOCMRoleResponse}
          isExpandable
        >
          <BackToAssociateAwsAccountLink />
        </ErrorBox>,
      );
    } else {
      getOCMRole(awsAccountID);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [getOCMRoleResponse]);

  const handleRefresh = () => {
    clearGetOcmRoleResponse();
    setFieldValue(FieldId.RosaRolesProviderCreationMode, undefined);
    track(trackEvents.OCMRoleRefreshed);
  };

  const handleCreationModeChange = (_, value) => {
    // Going to Next step and Back, triggers this onChange with value undefined?!
    if (value) {
      setFieldValue(FieldId.RosaRolesProviderCreationMode, value);
      track(trackEvents.RosaCreationMode, {
        customProperties: {
          value,
        },
      });
    }
  };

  const EnableAutoModeTip = (
    <Alert
      className="pf-v5-u-ml-lg"
      variant="info"
      isInline
      isExpandable
      title="If you would like to enable auto mode, expand the alert and follow the steps below."
    >
      <TextContent className="pf-v5-u-font-size-sm">
        <Text component={TextVariants.p} className="pf-v5-u-mb-sm">
          Create the Admin OCM role using the following command in the ROSA CLI. Only one OCM role
          can be linked per Red Hat org.{' '}
          <PopoverHint title="If an OCM role with basic privileges exists in your account, you might need to delete or unlink the role before creating an OCM role with administrative privileges." />
        </Text>
        <InstructionCommand
          textAriaLabel="Copyable ROSA create ocm-role command"
          trackEvent={trackEvents.CopyOCMRoleCreateAdmin}
        >
          rosa create ocm-role --admin
        </InstructionCommand>
        <Text component={TextVariants.p} className="pf-v5-u-mb-sm">
          If not yet linked, run the following command to associate the OCM role with your AWS{' '}
          account.
        </Text>
        <InstructionCommand
          textAriaLabel="Copyable ROSA link ocm-role command"
          trackEvent={trackEvents.CopyOCMRoleLink}
        >
          rosa link ocm-role &lt;arn&gt;
        </InstructionCommand>
        <Text component={TextVariants.p} className="pf-v5-u-mb-sm">
          After running the command, you may need to refresh using the button below to enable auto
          mode.
        </Text>
        <Button onClick={handleRefresh} variant="secondary">
          Refresh to enable auto mode
        </Button>
      </TextContent>
    </Alert>
  );

  const roleModeOptions = [
    {
      value: roleModes.MANUAL,
      label: 'Manual',
      description: (
        <>
          You can choose from two options to manually generate the necessary roles and policies for
          your cluster operators and the OIDC provider: ROSA CLI commands, or AWS CLI commands.{' '}
          <strong>
            You must complete one of those options after cluster review for your cluster to complete
            installation.
          </strong>
        </>
      ),
    },
    {
      disabled: !isAutoModeAvailable,
      value: roleModes.AUTO,
      label: 'Auto',
      description:
        'Immediately create the necessary cluster operator roles and OIDC provider. This mode requires an admin privileged OCM role.',
      extraField: getOCMRoleResponse.fulfilled && !isAutoModeAvailable && EnableAutoModeTip,
    },
  ];

  const operatorRolesCliCommand = getOperatorRolesCommand({
    forcedByoOidcType,
    byoOidcConfigID,
    customOperatorRolesPrefix,
    installerRoleArn,
    sharedVpcRoleArn,
  });

  const forcedByoOidcReason = getForcedByoOidcReason(forcedByoOidcType);

  return (
    <Form onSubmit={() => false}>
      <Grid hasGutter>
        <GridItem>
          <Title headingLevel="h3">Cluster roles and policies</Title>
        </GridItem>
        {forcedByoOidcType ? (
          <Alert isInline id="rosa-require-byo-oidc" variant="info" title={forcedByoOidcReason} />
        ) : (
          <>
            <GridItem>
              <Text component={TextVariants.p}>
                Set whether you&apos;d like to create the OIDC now or wait to create the OIDC until
                after installation.
              </Text>
            </GridItem>
            <GridItem>
              <ToggleGroup>
                <ToggleGroupItem
                  text="Create OIDC Later"
                  buttonId="managed-oidc-configuration"
                  isSelected={!hasByoOidcConfig}
                  onChange={toggleByoOidcConfig(false)}
                />
                <ToggleGroupItem
                  text="Create OIDC Now"
                  buttonId="customer-oidc-configuration"
                  isSelected={hasByoOidcConfig}
                  onChange={toggleByoOidcConfig(true)}
                />
              </ToggleGroup>
            </GridItem>
          </>
        )}
        <ReduxHiddenCheckbox name="detected_ocm_role" />
        {getOCMRoleErrorBox && <GridItem>{getOCMRoleErrorBox}</GridItem>}
        {getOCMRoleResponse.pending && (
          <GridItem>
            <div className="spinner-fit-container">
              <Spinner />
            </div>
            <div className="spinner-loading-text pf-v5-u-ml-xl">Checking for admin OCM role...</div>
          </GridItem>
        )}
        {getOCMRoleResponse.fulfilled && !hasByoOidcConfig && (
          <>
            <GridItem>
              <Text component={TextVariants.p}>
                Choose the preferred mode for creating the operator roles and OIDC provider.{' '}
                <ExternalLink href={links.ROSA_AWS_IAM_ROLES}>
                  Learn more about ROSA roles
                </ExternalLink>
              </Text>
            </GridItem>
            <GridItem span={10}>
              <FormGroup isRequired fieldId="role_mode">
                <Field
                  component={RadioButtons}
                  name={FieldId.RosaRolesProviderCreationMode}
                  className="radio-button"
                  disabled={getOCMRoleResponse.pending}
                  options={roleModeOptions}
                  onChange={handleCreationModeChange}
                  disableDefaultValueHandling
                  input={{
                    ...getFieldProps(FieldId.RosaRolesProviderCreationMode),
                    onChange: (value) => {
                      setFieldValue(FieldId.RosaRolesProviderCreationMode, value, false);
                    },
                  }}
                  meta={getFieldMeta(FieldId.RosaRolesProviderCreationMode)}
                />
              </FormGroup>
            </GridItem>
          </>
        )}
        {hasByoOidcConfig ? (
          <Field
            component={CustomerOIDCConfiguration}
            name={FieldId.ByoOidcConfigId}
            label="Config ID"
            awsAccountID={awsAccountID}
            getUserOidcConfigurations={getUserOidcConfigurations}
            byoOidcConfigID={byoOidcConfigID}
            operatorRolesCliCommand={operatorRolesCliCommand}
            validate={required}
            onSelect={onSelectOIDCConfig}
          />
        ) : (
          <CustomOperatorRoleNames />
        )}
      </Grid>
    </Form>
  );
};

ClusterRolesScreen.propTypes = {
  getOCMRole: PropTypes.func.isRequired,
  getOCMRoleResponse: PropTypes.func.isRequired,
  getUserOidcConfigurations: PropTypes.func.isRequired,
  clearGetOcmRoleResponse: PropTypes.func.isRequired,
};

export default ClusterRolesScreen;
