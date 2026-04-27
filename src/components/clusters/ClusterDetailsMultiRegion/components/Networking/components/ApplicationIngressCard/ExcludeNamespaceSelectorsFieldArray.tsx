import * as React from 'react';
import { Field, FieldArray, useField } from 'formik';

import {
  Button,
  Content,
  ContentVariants,
  Grid,
  GridItem,
  TextInput,
} from '@patternfly/react-core';
import { MinusCircleIcon } from '@patternfly/react-icons/dist/esm/icons/minus-circle-icon';
import { PlusCircleIcon } from '@patternfly/react-icons/dist/esm/icons/plus-circle-icon';

export type SelectorRow = { key: string; values: string };

type Props = {
  name: string;
  disabled?: boolean;
};

const ExcludeNamespaceSelectorsFieldArray: React.FC<Props> = ({ name, disabled }) => {
  const [field] = useField<SelectorRow[]>(name);
  const rows = field.value ?? [];

  return (
    <FieldArray
      name={name}
      render={({ push, remove }) => (
        <>
          <Content component="p">
            Namespaces matching any of these label selectors will be excluded from the default
            ingress controller.
          </Content>
          {rows.length > 0 && (
            <Grid hasGutter>
              <GridItem span={5}>
                <Content component={ContentVariants.small}>Key</Content>
              </GridItem>
              <GridItem span={6}>
                <Content component={ContentVariants.small}>Values (comma-separated)</Content>
              </GridItem>
              <GridItem span={1} />
              {rows.map((_, index) => (
                // eslint-disable-next-line react/no-array-index-key
                <React.Fragment key={index}>
                  <GridItem span={5}>
                    <Field name={`${name}[${index}].key`}>
                      {({ field: f }: any) => (
                        <TextInput
                          {...f}
                          id={`${name}-key-${index}`}
                          isDisabled={disabled}
                          aria-label={`Selector key ${index + 1}`}
                        />
                      )}
                    </Field>
                  </GridItem>
                  <GridItem span={6}>
                    <Field name={`${name}[${index}].values`}>
                      {({ field: f }: any) => (
                        <TextInput
                          {...f}
                          id={`${name}-values-${index}`}
                          isDisabled={disabled}
                          aria-label={`Selector values ${index + 1}`}
                        />
                      )}
                    </Field>
                  </GridItem>
                  <GridItem span={1}>
                    <Button
                      variant="link"
                      isInline
                      isDisabled={disabled}
                      icon={
                        <MinusCircleIcon color="var(--pf-t--global--color--status--danger--default)" />
                      }
                      onClick={() => remove(index)}
                      aria-label={`Remove selector ${index + 1}`}
                    />
                  </GridItem>
                </React.Fragment>
              ))}
            </Grid>
          )}
          <Button
            variant="link"
            isInline
            icon={<PlusCircleIcon />}
            onClick={() => push({ key: '', values: '' })}
            isDisabled={disabled}
          >
            Add selector
          </Button>
        </>
      )}
    />
  );
};

export default ExcludeNamespaceSelectorsFieldArray;
