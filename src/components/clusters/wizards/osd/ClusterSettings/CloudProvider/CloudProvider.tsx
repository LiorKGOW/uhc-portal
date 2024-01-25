import React from 'react';
import { useDispatch } from 'react-redux';

import { Title, Form, Alert } from '@patternfly/react-core';

import { useGlobalState } from '~/redux/hooks/useGlobalState';
import { clearCcsCredientialsInquiry } from '~/redux/actions/ccsInquiriesActions';
import { FieldId } from '~/components/clusters/wizards/osd/constants';
import { useFormState } from '~/components/clusters/wizards/hooks';
import { CloudProviderType } from '~/components/clusters/wizards/common/constants';
import { CloudProviderTileField } from './CloudProviderTileField';
import { AwsByocFields } from './AwsByocFields';
import { GcpByocFields } from './GcpByocFields';

export const CloudProvider = () => {
  const dispatch = useDispatch();
  const {
    values: {
      [FieldId.CloudProvider]: cloudProvider,
      [FieldId.Byoc]: byoc,
      [FieldId.AccountId]: accountId,
      [FieldId.AccessKeyId]: accessKeyId,
      [FieldId.SecretAccessKey]: secretAccessKey,
      [FieldId.GcpServiceAccount]: gcpServiceAccount,
    },
  } = useFormState();
  const { ccsCredentialsValidity } = useGlobalState((state) => state.ccsInquiries);
  const [showValidationAlert, setShowValidationAlert] = React.useState(false);
  const isByoc = byoc === 'true';

  React.useEffect(() => {
    dispatch(clearCcsCredientialsInquiry());

    if (!showValidationAlert && ccsCredentialsValidity.fulfilled) {
      setShowValidationAlert(true);
    }

    if (showValidationAlert) {
      setShowValidationAlert(false);
    }
  }, [
    accountId,
    accessKeyId,
    secretAccessKey,
    gcpServiceAccount,
    ccsCredentialsValidity.fulfilled,
    dispatch,
    showValidationAlert,
  ]);

  return (
    <Form>
      <Title headingLevel="h3">Select a cloud provider</Title>
      <CloudProviderTileField />
      {isByoc && (
        <>
          {cloudProvider === CloudProviderType.Aws ? <AwsByocFields /> : <GcpByocFields />}

          {(ccsCredentialsValidity.error || showValidationAlert) && (
            <Alert
              variant="danger"
              isInline
              title={`${cloudProvider.toUpperCase()} wasn't able to verify your credentials`}
            >
              Verify that your entered{' '}
              {cloudProvider === CloudProviderType.Aws
                ? 'access keys match the access keys provided in your AWS account.'
                : 'service account details are correct.'}
            </Alert>
          )}
        </>
      )}
    </Form>
  );
};
