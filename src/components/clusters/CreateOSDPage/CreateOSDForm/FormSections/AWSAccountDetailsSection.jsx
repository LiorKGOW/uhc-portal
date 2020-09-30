import PropTypes from 'prop-types';
import React from 'react';
import { Field } from 'redux-form';
import { GridItem, Alert } from '@patternfly/react-core';
import ReduxVerticalFormGroup from '../../../../common/ReduxFormComponents/ReduxVerticalFormGroup';
import { billingModelConstants, constants } from '../CreateOSDFormConstants';
import { required, awsNumericAccountID } from '../../../../../common/validators';
import ExternalLink from '../../../../common/ExternalLink';
import ReduxCheckbox from '../../../../common/ReduxFormComponents/ReduxCheckbox';

function AWSAccountDetailsSection({ pending }) {
  return (
    <>
      <GridItem span={4}>
        <Field
          component={ReduxVerticalFormGroup}
          name="account_id"
          label="AWS account ID"
          type="text"
          validate={awsNumericAccountID}
          disabled={pending}
          extendedHelpText={(
            <>
              The 12 digits numeric identifier of your AWS account.
              <br />
              See
              {' '}
              <ExternalLink href="https://docs.aws.amazon.com/general/latest/gr/acct-identifiers.html">AWS documentation</ExternalLink>
              {' '}
              for more details.
            </>
        )}
          isRequired
        />
      </GridItem>
      <GridItem span={8} />
      <GridItem span={4}>
        <h4>AWS IAM user credentials</h4>
      </GridItem>
      <GridItem span={8} />
      <GridItem span={8}>
        <Alert className="bottom-alert" variant="warning" title={billingModelConstants.awsCredentialsWarning} isInline />
      </GridItem>
      <GridItem span={4} />
      <GridItem span={4}>
        <Field
          component={ReduxVerticalFormGroup}
          name="access_key_id"
          label="AWS access key ID"
          type="text"
          validate={required}
          disabled={pending}
          isRequired
        />
      </GridItem>
      <GridItem span={8} />
      <GridItem span={4}>
        <Field
          component={ReduxVerticalFormGroup}
          name="secret_access_key"
          label="AWS secret access key"
          type="text"
          validate={required}
          disabled={pending}
          isRequired
        />
      </GridItem>
      <GridItem span={8} />
      <GridItem span={4}>
        <Field
          component={ReduxCheckbox}
          name="disable_scp_checks"
          label="Bypass AWS Service Control Policy (SCP) checks"
          extendedHelpText={constants.bypassSCPChecksHint}
        />
      </GridItem>
    </>
  );
}

AWSAccountDetailsSection.propTypes = {
  pending: PropTypes.bool,
};

export default AWSAccountDetailsSection;
