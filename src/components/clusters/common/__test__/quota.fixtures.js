import { userActions } from '../../../../redux/actions/userActions';

import * as quotaCostFixtures from './quota_cost.fixtures';

// This is the quota we use in mockdata mode, pretty much everything is allowed.
import * as mockQuotaCost from '../../../../../mockdata/api/accounts_mgmt/v1/organizations/1HAXGgCYqHpednsRDiwWsZBmDlA/quota_cost.json';

// Fragments of processed quotaList state

export const mockQuotaList = userActions.processQuota({ data: mockQuotaCost });

export const emptyQuotaList = userActions.processQuota({ data: { items: [] } });

export const ROSAQuotaList = userActions.processQuota(
  { data: { items: quotaCostFixtures.unlimitedROSA } },
);
export const CCSQuotaList = userActions.processQuota({
  data: { items: quotaCostFixtures.dedicatedCCS },
});
export const CCSOneNodeRemainingQuotaList = userActions.processQuota({
  data: { items: quotaCostFixtures.dedicatedCCSOneNodeRemaining },
});
export const TrialQuotaList = userActions.processQuota({
  data: { items: quotaCostFixtures.dedicatedTrial },
});
export const ROSACCSQuotaList = userActions.processQuota({
  data: { items: [...quotaCostFixtures.unlimitedROSA, ...quotaCostFixtures.dedicatedCCS] },
});
export const CCSROSAQuotaList = userActions.processQuota({
  data: { items: [...quotaCostFixtures.dedicatedCCS, ...quotaCostFixtures.unlimitedROSA] },
});
export const TrialCCSQuotaList = userActions.processQuota({
  data: { items: [...quotaCostFixtures.dedicatedTrial, ...quotaCostFixtures.dedicatedCCS] },
});
export const CCSTrialQuotaList = userActions.processQuota({
  data: { items: [...quotaCostFixtures.dedicatedCCS, ...quotaCostFixtures.dedicatedTrial] },
});

export const rhQuotaList = userActions.processQuota({
  data: { items: quotaCostFixtures.dedicatedRhInfra },
});

export const crcWorkspacesAddonQuota = userActions.processQuota({
  data: { items: quotaCostFixtures.crcWorkspacesAddon },
});

export const loggingAddonQuota = userActions.processQuota({
  data: { items: quotaCostFixtures.loggingAddon },
});

export const dbaAddonQuota = userActions.processQuota({
  data: { items: quotaCostFixtures.dbaAddon },
});

export const serviceMeshAddonQuota = userActions.processQuota({
  data: { items: quotaCostFixtures.serviceMeshAddon },
});

export const addonsQuota = userActions.processQuota({
  data: {
    items: [].concat(
      quotaCostFixtures.crcWorkspacesAddon,
      quotaCostFixtures.loggingAddon,
      quotaCostFixtures.dbaAddon,
      quotaCostFixtures.serviceMeshAddon,
    ),
  },
});

// Values for `clustersQuota` prop passed down by CreateOSDPage.

export const awsByocRhInfraGcpRhInfraClustersQuota = {
  hasStandardOSDQuota: true,
  hasProductQuota: true,
  hasAwsQuota: true,
  hasGcpQuota: true,
  aws: {
    byoc: {
      singleAz: { available: 5 },
      multiAz: { available: 5 },
      totalAvailable: 10,
    },
    rhInfra: {
      singleAz: { available: 5 },
      multiAz: { available: 5 },
      totalAvailable: 10,
    },
  },
  gcp: {
    rhInfra: {
      singleAz: { available: 5 },
      multiAz: { available: 5 },
      totalAvailable: 10,
    },
  },
  hasMarketplaceProductQuota: false,
};

export const awsRhInfraGcpRhInfraClustersQuota = {
  hasStandardOSDQuota: true,
  hasProductQuota: true,
  hasAwsQuota: true,
  hasGcpQuota: true,
  aws: {
    byoc: {
      multiAz: { available: 0 },
      singleAz: { available: 0 },
      hasQuota: false,
      totalAvailable: 0,
    },
    rhInfra: {
      hasQuota: true,
      multiAz: { available: 1 },
      singleAz: { available: 1 },
      totalAvailable: 1,
    },
  },
  gcp: {
    rhInfra: {
      hasQuota: true,
      multiAz: { available: 1 },
      singleAz: { available: 1 },
      totalAvailable: 1,
    },
  },
  hasMarketplaceProductQuota: false,
};

export const storageQuotaList = userActions.processQuota(
  { data: { items: quotaCostFixtures.storage } },
);
