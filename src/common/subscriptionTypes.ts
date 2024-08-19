import { ClusterAuthorizationRequest } from '~/types/accounts_mgmt.v1';
import { BillingModel } from '~/types/clusters_mgmt.v1';

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

const rosaProducts = {
  ROSA: 'ROSA',
  ROSA_HyperShift: 'ROSA-HyperShift',
};

const anyUnknownProducts = {
  ANY: 'ANY', // used in quota_cost
  UNKNOWN: 'UNKNOWN', // normally should not happen except during loading
};

/**
 * Possible results of normalizeProductID() that are actual products.
 * See `normalizedProducts` for the other possible results.
 * @enum string
 */
const {
  OSD,
  OSDTRIAL,
  OCP,
  RHMI,
  ARO,
  OCP_ASSISTED_INSTALL,
  RHACS,
  RHACSTRIAL,
  RHOSR,
  RHOSRTRIAL,
  RHOSAK,
  RHOSAKTRIAL,
  RHOSE,
  RHOSETRIAL,
  RHOIC,
} = ClusterAuthorizationRequest.product_id;

const knownProducts = {
  OSD,
  OSDTRIAL,
  OCP,
  RHMI,
  ARO,
  OCP_ASSISTED_INSTALL,
  RHACS,
  RHACSTRIAL,
  RHOSR,
  RHOSRTRIAL,
  RHOSAK,
  RHOSAKTRIAL,
  RHOSE,
  RHOSETRIAL,
  RHOIC,
  ...rosaProducts,
};

// List of allowed products to display
const allowedProducts = [
  ClusterAuthorizationRequest.product_id.OSD,
  ClusterAuthorizationRequest.product_id.OSDTRIAL,
  ClusterAuthorizationRequest.product_id.OCP,
  ClusterAuthorizationRequest.product_id.RHMI,
  rosaProducts.ROSA,
  ClusterAuthorizationRequest.product_id.RHOIC,
  ClusterAuthorizationRequest.product_id.MOA,
  ClusterAuthorizationRequest.product_id.MOA_HOSTED_CONTROL_PLANE,
  rosaProducts.ROSA_HyperShift,
  ClusterAuthorizationRequest.product_id.ARO,
  ClusterAuthorizationRequest.product_id.OCP_ASSISTED_INSTALL,
];

/**
 * cluster.product.id, subscription.plan.type, subscription.plan.id,
 * quota_cost.related_resources[].product
 * use related but different values (see https://issues.redhat.com/browse/SDB-1625).
 * They should all be passed through normalizeProductID(), should result in one of the values here.
 * @enum string
 */
const normalizedProducts = { ...knownProducts, ...anyUnknownProducts };

/**
 * product IDs that are managed by Clusters Service
 *
 */
const clustersServiceProducts = [
  ClusterAuthorizationRequest.product_id.OSD,
  ClusterAuthorizationRequest.product_id.OSDTRIAL,
  rosaProducts.ROSA,
  rosaProducts.ROSA_HyperShift,
  ClusterAuthorizationRequest.product_id.RHMI,
  ClusterAuthorizationRequest.product_id.ARO,
];

/**
 * Products by which UI allows to filter.
 * key is used internally and for URL ?plan_id=.
 * label is how it's shown in the UI.
 * plansToQuery are pre-normalization value to send to account-manager in ?search= query.
 */
const productFilterOptions = [
  {
    key: ClusterAuthorizationRequest.product_id.OCP,
    label: 'OCP',
    plansToQuery: ['OCP', 'OCP-AssistedInstall'],
  },
  { key: ClusterAuthorizationRequest.product_id.OSD, label: 'OSD', plansToQuery: ['OSD'] },
  {
    key: rosaProducts.ROSA,
    label: 'ROSA',
    plansToQuery: ['MOA', 'ROSA', 'MOA-HostedControlPlane'],
  },
  { key: ClusterAuthorizationRequest.product_id.ARO, label: 'ARO', plansToQuery: ['ARO'] },
  { key: ClusterAuthorizationRequest.product_id.RHOIC, label: 'RHOIC', plansToQuery: ['RHOIC'] },
];

/**
 * The cluster_billing_model field on subscription indicates what kind
 * of quota this subscription is using.
 */
const billingModels = {
  ...BillingModel,
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
    excludeProductIds: [rosaProducts.ROSA_HyperShift],
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
  allowedProducts,
  billingModels,
  clustersServiceProducts,
  knownProducts,
  normalizedProducts,
  ocmRoles,
  productFilterOptions,
  subscriptionSettings,
};
