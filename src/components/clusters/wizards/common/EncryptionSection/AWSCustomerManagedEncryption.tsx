import React from 'react';
import { GridItem, Alert } from '@patternfly/react-core';
import { Field } from 'redux-form';
import ReduxVerticalFormGroup from '~/components/common/ReduxFormComponents/ReduxVerticalFormGroup';
import ExternalLink from '~/components/common/ExternalLink';
import { validateAWSKMSKeyARN } from '~/common/validators';
import { constants } from '~/components/clusters/common/CreateOSDFormConstants';

interface Props {
  region: string;
  keyArn: string;
  fieldName: 'kms_key_arn' | 'etcd_key_arn';
}

const AWSCustomerManagedEncryption = ({ fieldName, region, keyArn }: Props) => (
  <>
    <GridItem md={6}>
      <Field
        component={ReduxVerticalFormGroup}
        name={fieldName}
        type="text"
        label="Key ARN"
        placeholder="Key ARN"
        validate={(value: string) => validateAWSKMSKeyARN(value, region)}
        isRequired
        helpText={!keyArn ? 'Provide a custom key ARN' : ''}
        extendedHelpText={
          <>
            <p className="pf-v5-u-mb-sm">{constants.awsKeyARN}</p>
            <ExternalLink href="https://docs.aws.amazon.com/kms/latest/developerguide/find-cmk-id-arn.html">
              Finding the key ID and ARN
            </ExternalLink>
          </>
        }
        showHelpTextOnError={false}
      />
    </GridItem>
    <GridItem md={6}>
      <Alert
        className="key-arn-alert"
        isInline
        isLiveRegion
        variant="info"
        title="If you delete the ARN key, the cluster will no longer be available."
      />
    </GridItem>
    <GridItem md={6} />
  </>
);

export default AWSCustomerManagedEncryption;
