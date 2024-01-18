import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { Field } from 'redux-form';
import { Form, Grid, GridItem, Title, Text, Alert, AlertActionLink } from '@patternfly/react-core';
import { WizardContext as WizardContextDeprecated } from '@patternfly/react-core/deprecated';

import { stringToArray } from '~/common/helpers';
import { constants } from '~/components/clusters/common/CreateOSDFormConstants';
import { validateUrl, validateCA, checkNoProxyDomains } from '~/common/validators';
import { normalizedProducts } from '~/common/subscriptionTypes';
import {
  HTTP_PROXY_PLACEHOLDER,
  HTTPS_PROXY_PLACEHOLDER,
  DISABLED_NO_PROXY_PLACEHOLDER,
  NO_PROXY_PLACEHOLDER,
  NO_PROXY_HELPER_TEXT,
  TRUST_BUNDLE_PLACEHOLDER,
  TRUST_BUNDLE_HELPER_TEXT,
} from '~/components/clusters/common/networkingConstants';
import ReduxVerticalFormGroup from '../../../../common/ReduxFormComponents/ReduxVerticalFormGroup';
import ReduxFileUpload from '../../../../common/ReduxFormComponents/ReduxFileUpload';
import ExternalLink from '../../../../common/ExternalLink';
import links from '../../../../../common/installLinks.mjs';

import {
  MAX_FILE_SIZE,
  ACCEPT,
} from '../../../ClusterDetails/components/IdentityProvidersPage/components/CAUpload';

function ClusterProxyScreen({
  product,
  httpProxyUrl,
  httpsProxyUrl,
  additionalTrustBundle,
  sendError,
  change,
}) {
  const [anyTouched, setAnyTouched] = React.useState(false);
  const configureProxyUrl =
    product === normalizedProducts.ROSA
      ? links.ROSA_CLUSTER_WIDE_PROXY
      : links.OSD_CLUSTER_WIDE_PROXY;
  const noUrlValues = !httpProxyUrl && !httpsProxyUrl;

  const onTouched = () => {
    // this lets us know that one of the fields was touched
    if (!anyTouched) {
      setAnyTouched(true);
    }
  };
  const noValues = () => noUrlValues && !additionalTrustBundle;
  const validateUrlHttp = (value) => validateUrl(value, 'http');
  const validateUrlHttps = (value) => validateUrl(value, ['http', 'https']);
  const validateAtLeastOne = (value, allValues) => {
    if (
      !allValues.http_proxy_url &&
      !allValues.https_proxy_url &&
      !allValues.additional_trust_bundle
    ) {
      return 'Configure at least one of the cluster-wide proxy fields.';
    }
    return undefined;
  };

  const atLeastOneAlert = (
    <Alert
      isInline
      variant="warning"
      title={
        <span>
          {
            "Complete at least 1 of the fields above. If you don't want to set a cluster-wide proxy, disable this option in the "
          }
          <strong style={{ fontSize: 'var(--pf-v5-global--FontSize--md)' }}>
            {'Networking > Configuration'}
          </strong>
          {' step.'}
        </span>
      }
      actionLinks={
        <WizardContextDeprecated.Consumer>
          {({ goToStepByName }) => (
            <AlertActionLink onClick={() => goToStepByName('Configuration')}>
              Back to the networking configuration
            </AlertActionLink>
          )}
        </WizardContextDeprecated.Consumer>
      }
    />
  );

  const onFileRejected = () => {
    sendError();
  };

  useEffect(() => {
    if (noUrlValues) {
      change('no_proxy_domains', '');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [noUrlValues]);

  return (
    <Form
      onSubmit={(event) => {
        event.preventDefault();
        return false;
      }}
    >
      <Grid hasGutter>
        <GridItem>
          <Title headingLevel="h3">Cluster-wide proxy</Title>
        </GridItem>
        <GridItem>
          <Text>{constants.clusterProxyHint}</Text>
          <Text className="pf-v5-u-mt-sm">
            <ExternalLink href={configureProxyUrl}>
              Learn more about configuring a cluster-wide proxy
            </ExternalLink>
          </Text>
        </GridItem>
        <GridItem>
          <Alert
            variant="info"
            isInline
            isPlain
            title="Configure at least 1 of the following fields:"
          />
        </GridItem>
        <GridItem sm={12} md={10} xl2={8}>
          <Field
            component={ReduxVerticalFormGroup}
            name="http_proxy_url"
            label="HTTP proxy URL"
            placeholder={HTTP_PROXY_PLACEHOLDER}
            type="text"
            validate={[validateUrlHttp, validateAtLeastOne]}
            helpText="Specify a proxy URL to use for HTTP connections outside the cluster."
            showHelpTextOnError={false}
            onBlur={onTouched}
          />
        </GridItem>
        <GridItem sm={0} md={2} xl2={4} />
        <GridItem sm={12} md={10} xl2={8}>
          <Field
            component={ReduxVerticalFormGroup}
            name="https_proxy_url"
            label="HTTPS proxy URL"
            placeholder={HTTPS_PROXY_PLACEHOLDER}
            type="text"
            validate={[validateUrlHttps, validateAtLeastOne]}
            helpText="Specify a proxy URL to use for HTTPS connections outside the cluster."
            showHelpTextOnError={false}
            onBlur={onTouched}
          />
        </GridItem>
        <GridItem sm={0} md={2} xl2={4} />
        <GridItem sm={12} md={10} xl2={8}>
          <Field
            component={ReduxVerticalFormGroup}
            name="no_proxy_domains"
            label="No Proxy domains"
            placeholder={noUrlValues ? DISABLED_NO_PROXY_PLACEHOLDER : NO_PROXY_PLACEHOLDER}
            type="text"
            validate={checkNoProxyDomains}
            helpText={NO_PROXY_HELPER_TEXT}
            showHelpTextOnError={false}
            normalize={(value) => stringToArray(value)}
            isDisabled={noUrlValues}
          />
        </GridItem>
        <GridItem sm={0} md={2} xl2={4} />
        <GridItem sm={12} md={10} xl2={8}>
          <Field
            component={ReduxFileUpload}
            name="additional_trust_bundle"
            label="Additional trust bundle"
            placeholder={TRUST_BUNDLE_PLACEHOLDER}
            extendedHelpTitle="Additional trust bundle"
            extendedHelpText={TRUST_BUNDLE_HELPER_TEXT}
            validate={[validateCA, validateAtLeastOne]}
            onBlur={onTouched}
            dropzoneProps={{
              accept: ACCEPT,
              maxSize: MAX_FILE_SIZE,
              onDropRejected: onFileRejected,
            }}
            helpText="Upload or paste a PEM encoded X.509 certificate."
          />
        </GridItem>
        <GridItem sm={0} md={2} xl2={4} />
        <GridItem>{anyTouched && noValues() && atLeastOneAlert}</GridItem>
      </Grid>
    </Form>
  );
}

ClusterProxyScreen.propTypes = {
  product: PropTypes.string,
  httpProxyUrl: PropTypes.string,
  httpsProxyUrl: PropTypes.string,
  additionalTrustBundle: PropTypes.string,
  sendError: PropTypes.func,
  change: PropTypes.func,
};

export default ClusterProxyScreen;
