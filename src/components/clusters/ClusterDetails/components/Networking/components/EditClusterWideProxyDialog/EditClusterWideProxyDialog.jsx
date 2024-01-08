import React, { useEffect, useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import { Field } from 'redux-form';
import { Form, Grid, GridItem, Text, Alert, Button } from '@patternfly/react-core';

import links from '~/common/installLinks.mjs';
import { validateUrl, validateCA, checkNoProxyDomains } from '~/common/validators';

import Modal from '~/components/common/Modal/Modal';
import ErrorBox from '~/components/common/ErrorBox';
import PopoverHint from '~/components/common/PopoverHint';
import ExternalLink from '~/components/common/ExternalLink';
import ReduxFileUpload from '~/components/common/ReduxFormComponents/ReduxFileUpload';
import ReduxVerticalFormGroup from '~/components/common/ReduxFormComponents/ReduxVerticalFormGroup';
import { stringToArray } from '~/common/helpers';
import {
  HTTPS_PROXY_PLACEHOLDER,
  HTTP_PROXY_PLACEHOLDER,
  TRUST_BUNDLE_PLACEHOLDER,
  TRUST_BUNDLE_HELPER_TEXT,
  DISABLED_NO_PROXY_PLACEHOLDER,
  NO_PROXY_PLACEHOLDER,
  NO_PROXY_HELPER_TEXT,
} from '~/components/clusters/CreateOSDPage/CreateOSDForm/FormSections/NetworkingSection/networkingConstants';
import { MAX_FILE_SIZE, ACCEPT } from '../../../IdentityProvidersPage/components/CAUpload';

const validateUrlHttp = (value) => validateUrl(value, 'http');
const validateUrlHttps = (value) => validateUrl(value, 'https');

const EditClusterWideProxyDialog = (props) => {
  const {
    isOpen,
    closeModal,
    sendError,
    reset,
    handleSubmit,
    editClusterProxyResponse,
    clearClusterProxyResponse,
    additionalTrustBundle,
    anyTouched,
    noClusterProxyValues,
    noUrlValues,
    change,
  } = props;

  const clusterProxyError = editClusterProxyResponse.error && (
    <ErrorBox message="Error editing cluster-wide proxy" response={editClusterProxyResponse} />
  );
  // sets trust bundle file upload depending on whether or not a trust bundle is already uploaded
  const [openFileUpload, setOpenFileUpload] = useState(!additionalTrustBundle);

  const validateAtLeastOne = useCallback((value, allValues) => {
    if (!allValues.http_proxy_url && !allValues.https_proxy_url && !additionalTrustBundle) {
      return 'Configure at least one of the cluster-wide proxy fields.';
    }
    return undefined;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleClose = useCallback(() => {
    reset();
    setOpenFileUpload(!additionalTrustBundle);
    clearClusterProxyResponse();
    closeModal();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (noUrlValues) {
      change('no_proxy_domains', '');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [noUrlValues]);

  useEffect(() => {
    if (
      editClusterProxyResponse.fulfilled &&
      !editClusterProxyResponse.pending &&
      !editClusterProxyResponse.error
    ) {
      handleClose();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editClusterProxyResponse]);

  const onFileRejected = () => {
    sendError();
  };

  const atLeastOneAlert = (
    <Alert isInline variant="warning" title="Complete at least 1 of the fields above." />
  );

  return (
    isOpen && (
      <Modal
        onClose={handleClose}
        title="Edit cluster-wide Proxy"
        onPrimaryClick={handleSubmit}
        primaryText="Save"
        onSecondaryClick={handleClose}
        isPending={editClusterProxyResponse.pending}
        width="max(30%, 600px)"
      >
        {clusterProxyError}
        <Form>
          <Grid hasGutter>
            <GridItem>
              <Text>
                Enable an HTTP or HTTPS proxy to deny direct access to the Internet from your
                cluster
              </Text>
              <Text className="pf-v5-u-mt-sm">
                <ExternalLink href={links.CONFIGURE_PROXY_URL}>
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

            <GridItem sm={12} md={10} xl2={11}>
              <Field
                component={ReduxVerticalFormGroup}
                name="http_proxy_url"
                label="HTTP Proxy URL"
                placeholder={HTTP_PROXY_PLACEHOLDER}
                type="text"
                validate={[validateUrlHttp, validateAtLeastOne]}
                helpText="Specify a proxy URL to use for HTTP connections outside the cluster."
                showHelpTextOnError={false}
              />
            </GridItem>

            <GridItem sm={12} md={10} xl2={11}>
              <Field
                component={ReduxVerticalFormGroup}
                name="https_proxy_url"
                label="HTTPS Proxy URL"
                placeholder={HTTPS_PROXY_PLACEHOLDER}
                type="text"
                validate={[validateUrlHttps, validateAtLeastOne]}
                helpText="Specify a proxy URL to use for HTTPS connections outside the cluster."
                showHelpTextOnError={false}
              />
            </GridItem>
            <GridItem sm={12} md={10} xl2={11}>
              <Field
                component={ReduxVerticalFormGroup}
                name="no_proxy_domains"
                label="No Proxy domains"
                placeholder={noUrlValues ? DISABLED_NO_PROXY_PLACEHOLDER : NO_PROXY_PLACEHOLDER}
                type="text"
                normalize={(value) => stringToArray(value)}
                validate={checkNoProxyDomains}
                helpText={NO_PROXY_HELPER_TEXT}
                showHelpTextOnError={false}
                isDisabled={noUrlValues}
              />
            </GridItem>
            <GridItem sm={12} md={10} xl2={11}>
              {!openFileUpload ? (
                <>
                  <Text className="ocm-c-networking-vpc-details__card pf-v5-c-form__label-text pf-v5-c-form__group-label">
                    Additional Trust Bundle{' '}
                    <PopoverHint
                      headerContent="Additional trust bundle"
                      bodyContent={TRUST_BUNDLE_HELPER_TEXT}
                    />
                  </Text>
                  <Text>
                    File Uploaded Successfully{' '}
                    <Button
                      // opens field to replace addition trust bundle
                      onClick={() => setOpenFileUpload(true)}
                      variant="link"
                      isInline
                      className="ocm-c-networking-vpc-details__card--replace-button"
                    >
                      Replace file
                    </Button>
                  </Text>
                </>
              ) : (
                <Field
                  component={ReduxFileUpload}
                  name="additional_trust_bundle"
                  label="Additional trust bundle"
                  placeholder={TRUST_BUNDLE_PLACEHOLDER}
                  extendedHelpTitle="Additional trust bundle"
                  extendedHelpText="An additional trust bundle is a PEM encoded X.509 certificate bundle that will be added to the nodes' trusted certificate store."
                  validate={[validateCA, validateAtLeastOne]}
                  dropzoneProps={{
                    accept: ACCEPT,
                    maxSize: MAX_FILE_SIZE,
                    onDropRejected: onFileRejected,
                  }}
                  helpText="Upload or paste a PEM encoded X.509 certificate."
                />
              )}
            </GridItem>
            <GridItem sm={0} md={2} xl2={4} />
            <GridItem>{anyTouched && noClusterProxyValues && atLeastOneAlert}</GridItem>
          </Grid>
        </Form>
      </Modal>
    )
  );
};

EditClusterWideProxyDialog.propTypes = {
  closeModal: PropTypes.func.isRequired,
  isOpen: PropTypes.bool,
  reset: PropTypes.func.isRequired,
  handleSubmit: PropTypes.func.isRequired,
  additionalTrustBundle: PropTypes.string,
  editClusterProxyResponse: PropTypes.shape({
    error: PropTypes.bool,
    fulfilled: PropTypes.bool,
    pending: PropTypes.bool,
  }).isRequired,
  sendError: PropTypes.func,
  anyTouched: PropTypes.bool,
  clearClusterProxyResponse: PropTypes.func,
  noClusterProxyValues: PropTypes.bool,
  noUrlValues: PropTypes.bool,
  change: PropTypes.func,
};

export default EditClusterWideProxyDialog;
