import apiRequest from './apiRequest';

const getCurrentAccount = () => apiRequest({
  method: 'get',
  url: '/api/accounts_mgmt/v1/current_account',
});

const getOrganization = organizationID => apiRequest({
  method: 'get',
  params: {
    fetchCapabilities: true,
  },
  url: `/api/accounts_mgmt/v1/organizations/${organizationID}`,
});

const getSubscriptions = params => apiRequest({
  method: 'get',
  params: {
    page: params.page,
    size: params.page_size,
    orderBy: params.order,
    search: params.filter,
    fetchAccounts: true,
    fetchCapabilities: true,
  },
  url: '/api/accounts_mgmt/v1/subscriptions',
});

const getSubscription = subscriptionID => apiRequest({
  method: 'get',
  params: {
    fetchAccounts: true,
    fetchCpuAndSocket: true,
    fetchCapabilities: true,
  },
  url: `/api/accounts_mgmt/v1/subscriptions/${subscriptionID}`,
});

const fetchSubscriptionByExternalId = clusterExternalID => apiRequest({
  method: 'get',
  url: '/api/accounts_mgmt/v1/subscriptions',
  params: {
    search: `external_cluster_id='${clusterExternalID}'`,
    fetchAccounts: true,
    fetchCpuAndSocket: true,
    fetchCapabilities: true,
    fetchMetrics: true,
  },
});

const getUnhealthyClusters = (orgId, params) => {
  let search = `
    organization_id = '${orgId}'
    and status NOT IN ('Deprovisioned', 'Archived')
    and metrics.health_state = 'unhealthy'
  `;
  if (params.filter && params.filter !== '') {
    search += ` and ${params.filter}`;
  }
  return apiRequest({
    method: 'get',
    url: '/api/accounts_mgmt/v1/subscriptions',
    params: {
      page: params.page,
      size: params.page_size,
      order: params.order,
      search,
    },
  });
};

const editSubscription = (subscriptionID, data) => apiRequest({
  method: 'patch',
  data,
  url: `/api/accounts_mgmt/v1/subscriptions/${subscriptionID}`,
});

const registerDisconnected = data => apiRequest({
  method: 'post',
  url: '/api/accounts_mgmt/v1/subscriptions',
  data,
});

const getNotificationContacts = subscriptionID => apiRequest({
  method: 'get',
  url: `/api/accounts_mgmt/v1/subscriptions/${subscriptionID}/notification_contacts`,
});

const addNotificationContact = (subscriptionID, accountIdentifier) => apiRequest({
  method: 'post',
  data: { account_identifier: accountIdentifier },
  url: `/api/accounts_mgmt/v1/subscriptions/${subscriptionID}/notification_contacts`,
});

const deleteNotificationContact = (subscriptionID, accountID) => apiRequest({
  method: 'delete',
  url: `/api/accounts_mgmt/v1/subscriptions/${subscriptionID}/notification_contacts/${accountID}`,
});

const getOrganizationQuota = organizationID => apiRequest({
  method: 'get',
  params: {
    fetchRelatedResources: true,
  },
  url: `/api/accounts_mgmt/v1/organizations/${organizationID}/quota_cost`,
});

const getSupportCases = subscriptionID => apiRequest({
  method: 'get',
  url: `/api/accounts_mgmt/v1/subscriptions/${subscriptionID}/support_cases`,
});

function getRequest(pathParams, params = {}) {
  const type = pathParams[0];
  let url;
  if (type === 'quota_summary') {
    url = `/api/accounts_mgmt/v1/organizations/${pathParams[1]}/quota_summary`;
  } else {
    url = null;
  }
  return apiRequest({ method: 'get', params, url });
}

const getFeature = (featureID, organizationID) => apiRequest({
  method: 'post',
  data: {
    organization_id: organizationID,
  },
  url: `/api/accounts_mgmt/v1/feature_toggles/${featureID}/query`,
});

const accountsService = {
  getCurrentAccount,
  getOrganization,
  getSubscription,
  getSubscriptions,
  getUnhealthyClusters,
  getNotificationContacts,
  addNotificationContact,
  deleteNotificationContact,
  getOrganizationQuota,
  editSubscription,
  registerDisconnected,
  getRequest,
  getFeature,
  getSupportCases,
  fetchSubscriptionByExternalId,
};

export default accountsService;
