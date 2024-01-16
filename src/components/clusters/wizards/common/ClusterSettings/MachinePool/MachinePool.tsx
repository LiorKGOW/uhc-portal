import React from 'react';
import { useDispatch } from 'react-redux';
import { Field } from 'formik';

import { Form, Grid, GridItem, Title, Text, ExpandableSection } from '@patternfly/react-core';

import { required } from '~/common/validators';
import { getMachineTypes } from '~/redux/actions/machineTypesActions';
import MachineTypeSelection from '~/components/clusters/CreateOSDPage/CreateOSDForm/FormSections/ScaleSection/MachineTypeSelection';
import { CloudProviderType, FieldId } from '~/components/clusters/wizards/common/constants';
import { useFormState } from '~/components/clusters/wizards/hooks';
import ExternalLink from '~/components/common/ExternalLink';
import { constants } from '~/components/clusters/CreateOSDPage/CreateOSDForm/CreateOSDFormConstants';
import links from '~/common/installLinks.mjs';
import NodeCountInput from '~/components/clusters/common/NodeCountInput';
import { normalizedProducts } from '~/common/subscriptionTypes';
import { getNodesCount } from '~/components/clusters/CreateOSDPage/CreateOSDForm/FormSections/ScaleSection/AutoScaleSection/AutoScaleHelper';
import { getMinNodesRequired } from '~/components/clusters/ClusterDetails/components/MachinePools/machinePoolsHelper';
import useCanClusterAutoscale from '~/components/clusters/ClusterDetails/components/MachinePools/components/EditMachinePoolModal/hooks/useCanClusterAutoscale';
import { NodeLabelsFieldArray } from './NodeLabelsFieldArray';
import { ImdsSectionField } from './ImdsSectionField/ImdsSectionField';
import { AutoScale } from './AutoScale/AutoScale';

export const MachinePool = () => {
  const dispatch = useDispatch();
  const {
    values: {
      [FieldId.BillingModel]: billingModel,
      [FieldId.Product]: product,
      [FieldId.CloudProvider]: cloudProvider,
      [FieldId.MachineType]: machineType,
      [FieldId.AutoscalingEnabled]: autoscalingEnabled,
      [FieldId.MultiAz]: multiAz,
      [FieldId.Byoc]: byoc,
      [FieldId.NodesCompute]: nodesCompute,
      [FieldId.NodeLabels]: nodeLabels,
    },
    errors,
    getFieldProps,
    setFieldValue,
    getFieldMeta,
    setFieldTouched,
  } = useFormState();
  const isMultiAz = multiAz === 'true';
  const isByoc = byoc === 'true';
  const isRosa = product === normalizedProducts.ROSA;
  const isAWS = cloudProvider === CloudProviderType.Aws;
  const canAutoScale = useCanClusterAutoscale(product);
  const [isNodeLabelsExpanded, setIsNodeLabelsExpanded] = React.useState(false);

  // If no value has been set for compute nodes already,
  // set an initial value based on infrastructure and availability selections.
  React.useEffect(() => {
    if (!nodesCompute) {
      setFieldValue(FieldId.NodesCompute, getNodesCount(isByoc, isMultiAz));
    }
  }, [isByoc, isMultiAz, nodesCompute, setFieldValue]);

  // Expand Node labels section when errors exist
  React.useEffect(() => {
    if (!isNodeLabelsExpanded && errors[FieldId.NodeLabels]) {
      setIsNodeLabelsExpanded(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [errors[FieldId.NodeLabels], isNodeLabelsExpanded]);

  React.useEffect(() => {
    if (nodeLabels[0]?.key) setFieldTouched(FieldId.NodeLabels, true, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  React.useEffect(() => {
    dispatch(getMachineTypes());
  }, [dispatch]);

  React.useEffect(() => {
    if (nodeLabels[0]?.key) setIsNodeLabelsExpanded(true);
  }, [nodeLabels]);

  const nodeLabelsExpandableSection = (
    <ExpandableSection
      toggleText="Add node labels"
      className="pf-v5-u-mt-md"
      onToggle={(_event, isExpanded) => setIsNodeLabelsExpanded(isExpanded)}
      isExpanded={isNodeLabelsExpanded}
      data-testid="node-labels-toggle"
    >
      <Title headingLevel="h3">Node labels (optional)</Title>
      <p className="pf-v5-u-mb-md">
        Configure labels that will apply to all nodes in this machine pool.
      </p>
      <NodeLabelsFieldArray />
    </ExpandableSection>
  );

  // OSD CCS only (or ROSA Classic in the future)
  const imdsSection = isAWS && isByoc && (
    <>
      <GridItem md={8}>
        <ImdsSectionField />
      </GridItem>
      <GridItem md={4} />
    </>
  );

  return (
    <Form>
      <GridItem>
        <Title headingLevel="h3">Default machine pool</Title>
        <Text component="p" className="pf-v5-u-mt-sm">
          Select a compute node instance type and count for your default machine pool. After cluster
          creation, your selected default machine pool instance type is permanent.
        </Text>
      </GridItem>

      <Grid hasGutter>
        <GridItem md={6}>
          <Field
            component={MachineTypeSelection}
            name={FieldId.MachineType}
            validate={required}
            isMultiAz={isMultiAz}
            isBYOC={isByoc}
            cloudProviderID={cloudProvider}
            product={product}
            isMachinePool={false}
            billingModel={billingModel}
            inModal={false}
            machine_type={{
              input: {
                ...getFieldProps(FieldId.MachineType),
                onChange: (value: string) => setFieldValue(FieldId.MachineType, value),
              },
              meta: getFieldMeta(FieldId.MachineType),
            }}
            machine_type_force_choice={{
              input: {
                ...getFieldProps(FieldId.MachineTypeForceChoice),
                onChange: (value: string) => setFieldValue(FieldId.MachineTypeForceChoice, value),
              },
            }}
          />
        </GridItem>

        <GridItem md={6} />

        {canAutoScale && (
          <>
            <GridItem>
              <AutoScale isDefaultMachinePool />
            </GridItem>
            {autoscalingEnabled && imdsSection}
            {autoscalingEnabled && nodeLabelsExpandableSection}
          </>
        )}

        {!autoscalingEnabled && (
          <>
            <GridItem md={6}>
              <Field
                component={NodeCountInput}
                name={FieldId.NodesCompute}
                label={isMultiAz ? 'Compute node count (per zone)' : 'Compute node count'}
                isMultiAz={isMultiAz}
                isByoc={isByoc}
                machineType={machineType}
                extendedHelpText={
                  <>
                    {constants.computeNodeCountHint}{' '}
                    <ExternalLink
                      href={
                        isRosa
                          ? links.ROSA_SERVICE_DEFINITION_COMPUTE
                          : links.OSD_SERVICE_DEFINITION_COMPUTE
                      }
                    >
                      Learn more about compute node count
                    </ExternalLink>
                  </>
                }
                cloudProviderID={cloudProvider}
                product={product}
                isMachinePool={false}
                billingModel={billingModel}
                input={{
                  ...getFieldProps(FieldId.NodesCompute),
                  onChange: (value: string) => setFieldValue(FieldId.NodesCompute, value),
                }}
                minNodes={getMinNodesRequired(true, isByoc, isMultiAz)}
              />
            </GridItem>
            {imdsSection}
            {nodeLabelsExpandableSection}
            <GridItem md={6} />
          </>
        )}
      </Grid>
    </Form>
  );
};
