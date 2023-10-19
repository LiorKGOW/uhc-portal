import React from 'react';
import { Alert, Button, ButtonVariant } from '@patternfly/react-core';
import ocmBaseName from '~/common/getBaseName';
import { ENV_OVERRIDE_LOCALSTORAGE_KEY } from '~/common/localStorageConstants';

type Props = {
  env: string;
};

const EnvOverrideMessage = ({ env }: Props) => {
  const goBackToNormal = () => {
    localStorage.removeItem(ENV_OVERRIDE_LOCALSTORAGE_KEY);
    window.location.href = ocmBaseName();
  };
  return (
    <Alert
      variant="warning"
      isInline
      id="env-override-message"
      title="Environment override active"
      actionLinks={
        <Button variant={ButtonVariant.link} isInline onClick={goBackToNormal}>
          Go back to <b>{APP_API_ENV}</b>
        </Button>
      }
    >
      You&apos;re now using the <b>{env}</b> environment API.
    </Alert>
  );
};

export default EnvOverrideMessage;
