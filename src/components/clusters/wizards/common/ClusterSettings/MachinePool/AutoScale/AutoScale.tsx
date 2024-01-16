import React from 'react';
import { FormGroup, GridItem, HelperTextItem, Flex, Button } from '@patternfly/react-core';
import { Field } from 'formik';
import { useDispatch } from 'react-redux';

import { FieldId } from '~/components/clusters/wizards/common/constants';
import PopoverHint from '~/components/common/PopoverHint';
import { constants } from '~/components/clusters/CreateOSDPage/CreateOSDForm/CreateOSDFormConstants';
import ExternalLink from '~/components/common/ExternalLink';
import links from '~/common/installLinks.mjs';
import { openModal } from '~/components/common/Modal/ModalActions';
import modals from '~/components/common/Modal/modals';
import { normalizedProducts } from '~/common/subscriptionTypes';
import { required, validateNumericInput } from '~/common/validators';
import getMinNodesAllowed from '~/components/clusters/CreateOSDPage/CreateOSDForm/FormSections/ScaleSection/AutoScaleSection/AutoScaleHelper';
import { CheckboxField } from '~/components/clusters/wizards/form/CheckboxField';
import { useFormState } from '~/components/clusters/wizards/hooks';
import { MAX_NODES } from '~/components/clusters/common/machinePools/constants';
import { FormGroupHelperText } from '~/components/common/FormGroupHelperText';
import { NodesInput } from './NodesInput';
import ClusterAutoScaleSettingsDialog from './ClusterAutoScaleSettingsDialog';

interface AutoScaleProps {
  isDefaultMachinePool: boolean;
}

export const AutoScale = ({ isDefaultMachinePool }: AutoScaleProps) => {
  const {
    setFieldValue,
    getFieldProps,
    getFieldMeta,
    values: {
      [FieldId.AutoscalingEnabled]: autoscalingEnabled,
      [FieldId.MultiAz]: multiAz,
      [FieldId.MinReplicas]: minReplicas,
      [FieldId.MaxReplicas]: maxReplicas,
      [FieldId.Product]: product,
      [FieldId.Byoc]: byoc,
    },
  } = useFormState();
  const dispatch = useDispatch();
  const openEditClusterAutoScalingModal = () =>
    dispatch(openModal(modals.EDIT_CLUSTER_AUTOSCALING_V2));

  const [minErrorMessage, setMinErrorMessage] = React.useState<string>();
  const [maxErrorMessage, setMaxErrorMessage] = React.useState<string>();
  const isMultiAz = multiAz === 'true';
  const isBYOC = byoc === 'true';
  const isRosa = product === normalizedProducts.ROSA;
  const autoScalingUrl = isRosa ? links.ROSA_AUTOSCALING : links.APPLYING_AUTOSCALING;

  React.useEffect(() => {
    const minAllowed = getMinNodesAllowed({
      isDefaultMachinePool,
      product,
      isBYOC,
      isMultiAz,
    });

    if (minAllowed) {
      const defaultReplicas = isMultiAz ? (minAllowed / 3).toString() : minAllowed.toString();

      if (!minReplicas) {
        setFieldValue(FieldId.MinReplicas, defaultReplicas);
      }
      if (!maxReplicas) {
        setFieldValue(FieldId.MaxReplicas, defaultReplicas);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [minReplicas, isBYOC, isDefaultMachinePool, isMultiAz, product, setFieldValue]);

  const minNodes = React.useMemo(() => {
    const minNodesAllowed = getMinNodesAllowed({
      isDefaultMachinePool,
      product,
      isBYOC,
      isMultiAz,
    });

    if (minNodesAllowed) {
      return minNodesAllowed / (isMultiAz ? 3 : 1);
    }

    return undefined;
  }, [isDefaultMachinePool, product, isBYOC, isMultiAz]);

  const validateNodes = React.useCallback(
    (value: string) => {
      const requiredError = required(value?.toString());
      const minNodesError = validateNumericInput(value, { min: minNodes, allowZero: true });
      const maxNodesError = validateNumericInput(value, {
        max: isMultiAz ? MAX_NODES / 3 : MAX_NODES,
        allowZero: true,
      });

      return requiredError || minNodesError || maxNodesError || undefined;
    },
    [isMultiAz, minNodes],
  );

  const validateMaxNodes = React.useCallback(
    (value: string) => {
      const nodesError = validateNodes(value);

      if (nodesError) {
        return nodesError;
      }

      if (minReplicas && parseInt(value, 10) < parseInt(minReplicas, 10)) {
        return 'Max nodes cannot be less than min nodes.';
      }

      return undefined;
    },
    [minReplicas, validateNodes],
  );

  const azFormGroups = (
    <Flex
      flexWrap={{ default: 'nowrap' }}
      spaceItems={{ default: 'spaceItemsMd' }}
      className="pf-v5-u-mt-md"
    >
      <FormGroup
        label={isMultiAz ? 'Minimum nodes per zone' : 'Minimum node count'}
        isRequired
        fieldId="nodes_min"
        className="autoscaling__nodes-formGroup"
      >
        <Field
          component={NodesInput}
          name={FieldId.MinReplicas}
          type="text"
          ariaLabel="Minimum nodes"
          validate={validateNodes}
          displayError={(_: string, error: string) => setMinErrorMessage(error)}
          hideError={() => setMinErrorMessage(undefined)}
          limit="min"
          min={minNodes}
          max={isMultiAz ? MAX_NODES / 3 : MAX_NODES}
          input={{
            ...getFieldProps(FieldId.MinReplicas),
            onChange: (value: string) => setFieldValue(FieldId.MinReplicas, value),
          }}
          meta={getFieldMeta(FieldId.MinReplicas)}
        />

        <FormGroupHelperText>
          {isMultiAz && (
            <HelperTextItem>{`x 3 zones = ${(parseInt(minReplicas, 10) || 0) * 3}`}</HelperTextItem>
          )}
          {minErrorMessage && (
            <HelperTextItem variant="error" hasIcon>
              {minErrorMessage}
            </HelperTextItem>
          )}
        </FormGroupHelperText>
      </FormGroup>
      <FormGroup
        label={isMultiAz ? 'Maximum nodes per zone' : 'Maximum node count'}
        isRequired
        fieldId="nodes_max"
        className="autoscaling__nodes-formGroup"
        labelIcon={
          <PopoverHint
            hint={
              <>
                {constants.computeNodeCountHint}
                <br />
                {isRosa ? (
                  <>
                    <ExternalLink href={links.ROSA_WORKER_NODE_COUNT}>
                      Learn more about worker/compute node count
                    </ExternalLink>
                    <br />
                  </>
                ) : null}
              </>
            }
          />
        }
      >
        <Field
          component={NodesInput}
          name={FieldId.MaxReplicas}
          type="text"
          ariaLabel="Maximum nodes"
          validate={validateMaxNodes}
          displayError={(_: string, error: string) => setMaxErrorMessage(error)}
          hideError={() => setMaxErrorMessage(undefined)}
          limit="max"
          min={minNodes}
          max={isMultiAz ? MAX_NODES / 3 : MAX_NODES}
          input={{
            ...getFieldProps(FieldId.MaxReplicas),
            onChange: (value: string) => setFieldValue(FieldId.MaxReplicas, value),
          }}
          meta={getFieldMeta(FieldId.MaxReplicas)}
        />

        <FormGroupHelperText>
          {isMultiAz && (
            <HelperTextItem>{`x 3 zones = ${(parseInt(maxReplicas, 10) || 0) * 3}`}</HelperTextItem>
          )}
          {maxErrorMessage && (
            <HelperTextItem variant="error" hasIcon>
              {maxErrorMessage}
            </HelperTextItem>
          )}
        </FormGroupHelperText>
      </FormGroup>
    </Flex>
  );

  return (
    <>
      <GridItem id="autoscaling">
        <FormGroup
          fieldId="autoscaling"
          label="Autoscaling"
          labelIcon={
            <PopoverHint
              hint={
                <>
                  {constants.autoscaleHint}{' '}
                  <ExternalLink href={autoScalingUrl}>
                    Learn more about autoscaling
                    {isRosa ? ' with ROSA' : ''}
                  </ExternalLink>
                </>
              }
            />
          }
        />

        <CheckboxField name={FieldId.AutoscalingEnabled} label="Enable autoscaling" />

        <GridItem md={3}>
          <Button
            data-testid="set-cluster-autoscaling-btn"
            variant="secondary"
            className="pf-v5-u-mt-md"
            onClick={openEditClusterAutoScalingModal}
            isDisabled={!autoscalingEnabled}
          >
            Edit cluster autoscaling settings
          </Button>
        </GridItem>
        <ClusterAutoScaleSettingsDialog isWizard isRosa={isRosa} />
        {autoscalingEnabled && azFormGroups}
      </GridItem>
    </>
  );
};
