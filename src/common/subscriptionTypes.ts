/**
 * names of all subscriptioin settings
 * @enum string
 */
const subscriptionSettings = {
  SUPPORT_LEVEL: 'support_level',
  USAGE: 'usage',
  SERVICE_LEVEL: 'service_level',
  PRODUCT_BUNDLE: 'product_bundle',
  SYSTEM_UNITS: 'system_units',
  CPU_TOTAL: 'cpu_total',
  SOCKET_TOTAL: 'socket_total',
  CLUSTER_BILLING_MODEL: 'cluster_billing_model',
  EVALUATION_EXPIRATION_DATE: 'evaluation_expiration_date',
};

/**
 * support_levels
 * @enum string
 */
const subscriptionSupportLevels = {
  EVAL: 'Eval',
  STANDARD: 'Standard',
  PREMIUM: 'Premium',
  SELF_SUPPORT: 'Self-Support',
  SUPPORT_BY_IBM: 'Supported by IBM',
  NONE: 'None',
};

/**
 * service_levels
 * @enum string
 */
const subscriptionServiceLevels = {
  L1_L3: 'L1-L3',
  L3_ONLY: 'L3-only',
};

/**
 * usage
 * @enum string
 */
const subscriptionUsages = {
  PRODUCTION: 'Production',
  DEV_TEST: 'Development/Test',
  DISASTER_RECOVERY: 'Disaster Recovery',
};

/**
 * product_bundle
 * @enum string
 */
const subscriptionProductBundles = {
  OPENSHIFT: 'Openshift',
  JBOSS_MIDDLEWARE: 'JBoss-Middleware',
  IBM_CLOUDPAK: 'IBM-CloudPak',
};

/**
 * system_units
 * @enum string
 */
const subscriptionSystemUnits = {
  CORES_VCPU: 'Cores/vCPU',
  SOCKETS: 'Sockets',
};

/**
 * status
 * @enum string
 */
const subscriptionStatuses = {
  ACTIVE: 'Active',
  ARCHIVED: 'Archived',
  DEPROVISIONED: 'Deprovisioned',
  RESERVED: 'Reserved',
  STALE: 'Stale',
  DISCONNECTED: 'Disconnected',
};

/**
 * Possible results of normalizeProductID() that are actual products.
 * See `normalizedProducts` for the other possible results.
 * @enum string
 */
const knownProducts = {
  OSD: 'OSD',
  OSDTrial: 'OSDTrial',
  OCP: 'OCP',
  RHMI: 'RHMI',
  ROSA: 'ROSA',
  ROSA_HyperShift: 'ROSA-HyperShift',
  ARO: 'ARO',
  OCP_Assisted_Install: 'OCP-AssistedInstall',
  RHACS: 'RHACS',
  RHACSTrial: 'RHACSTrial',
  RHOSR: 'RHOSR',
  RHOSRTrial: 'RHOSRTrial',
  RHOSAK: 'RHOSAK',
  RHOSAKTrial: 'RHOSAKTrial',
  RHOSE: 'RHOSE',
  RHOSETrial: 'RHOSETrial',
  RHOIC: 'RHOIC',
};

// Extracted separately normalizeProductID() converts MOA into ROSA
// But for the actual allow list it needs actual values
const additionalProducts = {
  MOA: 'MOA',
  MOA_HOSTEDCONTROLPLANE: 'MOA-HostedControlPlane',
};

// List of allowed products to display
const allowedProducts = [
  knownProducts.OSD,
  knownProducts.OSDTrial,
  knownProducts.OCP,
  knownProducts.RHMI,
  knownProducts.ROSA,
  knownProducts.RHOIC,
  additionalProducts.MOA,
  additionalProducts.MOA_HOSTEDCONTROLPLANE,
  knownProducts.ROSA_HyperShift,
  knownProducts.ARO,
  knownProducts.OCP_Assisted_Install,
];

/**
 * cluster.product.id, subscription.plan.type, subscription.plan.id,
 * quota_cost.related_resources[].product
 * use related but different values (see https://issues.redhat.com/browse/SDB-1625).
 * They should all be passed through normalizeProductID(), should result in one of the values here.
 * @enum string
 */
const normalizedProducts = {
  ...knownProducts,
  ANY: 'ANY', // used in quota_cost
  UNKNOWN: 'UNKNOWN', // normally should not happen except during loading
};

/**
 * product IDs that are managed by Clusters Service
 *
 */
const clustersServiceProducts = [
  normalizedProducts.OSD,
  normalizedProducts.OSDTrial,
  normalizedProducts.ROSA,
  normalizedProducts.ROSA_HyperShift,
  normalizedProducts.RHMI,
  normalizedProducts.ARO,
];

/**
 * Products by which UI allows to filter.
 * key is used internally and for URL ?plan_id=.
 * label is how it's shown in the UI.
 * plansToQuery are pre-normalization value to send to account-manager in ?search= query.
 */
const productFilterOptions = [
  { key: normalizedProducts.OCP, label: 'OCP', plansToQuery: ['OCP', 'OCP-AssistedInstall'] },
  { key: normalizedProducts.OSD, label: 'OSD', plansToQuery: ['OSD'] },
  {
    key: normalizedProducts.ROSA,
    label: 'ROSA',
    plansToQuery: ['MOA', 'ROSA', 'MOA-HostedControlPlane'],
  },
  { key: normalizedProducts.ARO, label: 'ARO', plansToQuery: ['ARO'] },
  { key: normalizedProducts.RHOIC, label: 'RHOIC', plansToQuery: ['RHOIC'] },
];

/**
 * The cluster_billing_model field on subscription indicates what kind
 * of quota this subscription is using.
 */
const billingModels = {
  STANDARD: 'standard', // quota from Red Hat Subscriptions
  MARKETPLACE: 'marketplace', // legacy quota from Red Hat Marketplace
  MARKETPLACE_RHM: 'marketplace-rhm', // quota from Red Hat Marketplace
  MARKETPLACE_AWS: 'marketplace-aws',
  MARKETPLACE_GCP: 'marketplace-gcp',
  STANDARD_TRIAL: 'standard-trial',
};

type OcmRoleItem = {
  id: string;
  name: string;
  description: string;
  // ProductIds for which granting new role bindings should not be allowed
  excludeProductIds?: string[];
};

/**
 * The ocmRoles contains all available roles that a customer
 * can grant to other users within their own organization.
 */
const ocmRoles: Record<string, OcmRoleItem> = {
  CLUSTER_EDITOR: {
    id: 'ClusterEditor',
    name: 'Cluster editor',
    description:
      'Cluster editor role will allow users or groups to manage and configure the cluster.',
  },
  CLUSTER_VIEWER: {
    id: 'ClusterViewer',
    name: 'Cluster viewer',
    description: 'Cluster viewer role will allow users or groups to view cluster details only.',
  },
  CLUSTER_AUTOSCALER_EDITOR: {
    id: 'ClusterAutoscalerEditor',
    name: 'Cluster autoscaler editor',
    description:
      'Cluster autoscaler editor role will allow users or groups to manage and configure the cluster autoscaler settings.',
    excludeProductIds: [knownProducts.ROSA_HyperShift],
  },
  IDP_EDITOR: {
    id: 'IdpEditor',
    name: 'Identity provider editor',
    description:
      'Identity provider editor role will allow users or groups to manage and configure the identity providers.',
  },
  MACHINE_POOL_EDITOR: {
    id: 'MachinePoolEditor',
    name: 'Machine pool editor',
    description:
      'Machine pool editor role will allow users or groups to manage and configure the machine pools.',
  },
};

export {
  subscriptionStatuses,
  subscriptionSettings,
  subscriptionSupportLevels,
  subscriptionServiceLevels,
  subscriptionUsages,
  subscriptionProductBundles,
  subscriptionSystemUnits,
  knownProducts,
  allowedProducts,
  normalizedProducts,
  clustersServiceProducts,
  productFilterOptions,
  billingModels,
  ocmRoles,
};
