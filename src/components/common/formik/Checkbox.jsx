import React from 'react';
import { useField } from 'formik';
import PropTypes from 'prop-types';

import { Checkbox as PfCheckbox, FormGroup, Split, SplitItem } from '@patternfly/react-core';

import { FormGroupHelperText } from '~/components/common/FormGroupHelperText';

// To be used inside formik Field component.
function Checkbox({ fieldId }) {
  const [field, { error, touched }] = useField(fieldId);
  return (
    <FormGroup fieldId={fieldId}>
      <Split hasGutter>
        <SplitItem>
          <PfCheckbox {...field} isChecked={!!field.value} id={fieldId} />
        </SplitItem>
      </Split>

      <FormGroupHelperText touched={touched} error={error} />
    </FormGroup>
  );
}

Checkbox.propTypes = {
  fieldId: PropTypes.string.isRequired,
};

export default Checkbox;
