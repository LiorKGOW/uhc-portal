import { billingModels } from '../../../../../common/subscriptionTypes';
import { humanizeValueWithUnitGiB } from '../../../../../common/units';

/**
 * reviewValues structure - key: field name
 * {
 *  title - human readable title
 *  values - map from values to human readable strings. optional.
 *           when unspecified, actual value is shown.
 *  valueTransfrom - function to transform current value to human readable string,
 *                   gets two parameters: value (current value), allValues (all form values)
 *                   only executed when `values` is not defined. optional.
 *  isBoolean - when set to `true`, value `undefined` will be treated as `false`,
 *             to match the behaviour of a boolean field.
 * }
 */
const reviewValues = {
  billing_model: {
    title: 'Subscription type',
    values: {
      [billingModels.STANDARD]: 'Annual: Fixed capacity subscription from Red Hat',
      [billingModels.MARKETPLACE]: 'On-demand: Flexible usage billed through the Red Hat Marketplace',
      'standard-trial': 'Free trial (upgradeable)',
    },
  },
  byoc: {
    title: 'Infrastracture type',
    isBoolean: true,
    values: { // note: keys here are strings, on purpose, to match redux-form behaviour
      true: 'Customer cloud subscription',
      false: 'Red Hat cloud account',
    },
  },
  cloud_provider: {
    title: 'Cloud provider',
    valueTransform: value => value.toUpperCase(),
  },
  name: {
    title: 'Cluster name',
  },
  region: {
    title: 'Region',
  },
  multi_az: {
    title: 'Availability',
    isBoolean: true,
    values: {
      true: 'Multi zone',
      false: 'Single zone',
    },
  },
  persistent_storage: {
    title: 'Persistent storage',
    valueTransform: (value) => {
      const humanized = humanizeValueWithUnitGiB(parseFloat(value));
      return `${humanized.value} GiB`;
    },
  },
  load_balancers: {
    title: 'Load balancers',
  },
  upgrade_policy: {
    title: 'Updates',
  },
  node_drain_grace_period: {
    title: 'Node draining',
    valueTransform: value => `${value} minutes`,
  },
  etcd_encryption: {
    title: 'etcd encryption',
    isBoolean: true,
    values: {
      true: 'Enabled',
      false: 'Disabled',
    },
  },
  network_configuration_toggle: {
    title: 'Networking',
  },
  machine_type: {
    title: 'Node instance type',
  },
  autoscalingEnabled: {
    title: 'Autoscaling',
    isBoolean: true,
    values: {
      true: 'Enabled',
      false: 'Disabled',
    },
  },
  nodes_compute: {
    title: 'Compute node count',
    valueTransform: (value, allValues) => {
      if (allValues.multi_az === 'true') {
        return `${value} (× 3 zones = ${value * 3} compute nodes)`;
      }
      return value;
    },
  },
};

export default reviewValues;
