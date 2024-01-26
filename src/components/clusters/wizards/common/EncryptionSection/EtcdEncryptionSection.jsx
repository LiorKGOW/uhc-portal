import React from 'react';
import PropTypes from 'prop-types';
import { FormGroup, GridItem } from '@patternfly/react-core';
import { Field } from 'redux-form';
import ExternalLink from '~/components/common/ExternalLink';
import links from '~/common/installLinks.mjs';
import ReduxCheckbox from '~/components/common/ReduxFormComponents/ReduxCheckbox';
import { constants } from '../../../common/CreateOSDFormConstants';
import AWSCustomerManagedEncryption from './AWSCustomerManagedEncryption';

import './encryptionSection.scss';

function EtcdEncryptionSection({
  isRosa,
  isHypershiftSelected,
  isEtcdEncryptionSelected,
  isFipsCryptoSelected,
  selectedRegion,
  etcdKeyArn,
}) {
  const needsCustomEtcdKey = isEtcdEncryptionSelected && isHypershiftSelected;
  return (
    <GridItem md={6}>
      <FormGroup fieldId="etcd_encryption" id="etcdEncryption" label="etcd encryption">
        <Field
          component={ReduxCheckbox}
          name="etcd_encryption"
          label={
            isHypershiftSelected
              ? 'Encrypt etcd with a custom KMS key'
              : 'Enable additional etcd encryption'
          }
          isDisabled={isFipsCryptoSelected}
          extendedHelpText={
            <>
              {isHypershiftSelected
                ? constants.enableAdditionalEtcdHypershiftHint
                : constants.enableAdditionalEtcdHint}{' '}
              <ExternalLink
                href={isRosa ? links.ROSA_SERVICE_ETCD_ENCRYPTION : links.OSD_ETCD_ENCRYPTION}
              >
                Learn more about etcd encryption
              </ExternalLink>
            </>
          }
        />

        <div className="ocm-c--reduxcheckbox-description">
          {isHypershiftSelected
            ? 'Etcd is always encrypted, but you can specify a custom KMS key if desired.'
            : 'Add more encryption for OpenShift and Kubernetes API resources.'}
        </div>
        {needsCustomEtcdKey && (
          <GridItem>
            <AWSCustomerManagedEncryption
              fieldName="etcd_key_arn"
              region={selectedRegion}
              keyArn={etcdKeyArn}
            />
          </GridItem>
        )}
      </FormGroup>
    </GridItem>
  );
}

EtcdEncryptionSection.propTypes = {
  isRosa: PropTypes.bool.isRequired,
  isHypershiftSelected: PropTypes.bool.isRequired,
  isEtcdEncryptionSelected: PropTypes.bool.isRequired,
  isFipsCryptoSelected: PropTypes.bool,
  selectedRegion: PropTypes.string,
  etcdKeyArn: PropTypes.string,
};

export default EtcdEncryptionSection;
