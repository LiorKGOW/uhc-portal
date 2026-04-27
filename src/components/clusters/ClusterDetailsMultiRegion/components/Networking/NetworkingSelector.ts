import { arrayToString } from '~/common/helpers';
import { Ingress } from '~/types/clusters_mgmt.v1';
import {
  LoadBalancerFlavor,
  NamespaceOwnershipPolicy,
  SchemaNamespaceSelector,
  WildcardPolicy,
} from '~/types/clusters_mgmt.v1/enums';

export const routeSelectorPairsAsStrings = (routeSelectors = {}) =>
  Object.entries(routeSelectors).map((entry) => entry.join('=')) || [];

export const routeSelectorsAsString = (routeSelectors: RouteSelectors = {}) =>
  routeSelectorPairsAsStrings(routeSelectors).join(',') || '';

export const excludedNamespacesAsString = (namespaces?: string[]) =>
  arrayToString(namespaces) || '';

export const excludeNamespaceSelectorsAsString = (
  selectors?: SchemaNamespaceSelector[],
): string => {
  if (!selectors?.length) return '';
  return selectors
    .map((s) => {
      const values = s.values ?? [];
      return `${s.key}=[${values.join(', ')}]`;
    })
    .join(', ');
};

export const stringToExcludeNamespaceSelectors = (input: string): SchemaNamespaceSelector[] => {
  if (!input?.trim()) return [];

  const entries: string[] = [];
  let depth = 0;
  let current = '';
  for (const char of input) {
    if (char === '[') depth++;
    else if (char === ']') depth--;
    else if (char === ',' && depth === 0) {
      entries.push(current.trim());
      current = '';
      continue;
    }
    current += char;
  }
  if (current.trim()) entries.push(current.trim());

  return entries.reduce<SchemaNamespaceSelector[]>((acc, entry) => {
    const eqIdx = entry.indexOf('=');
    if (eqIdx === -1) return acc;
    const key = entry.slice(0, eqIdx).trim();
    if (!key) return acc;
    const rawValue = entry.slice(eqIdx + 1).trim();
    const values =
      rawValue.startsWith('[') && rawValue.endsWith(']')
        ? rawValue
            .slice(1, -1)
            .split(',')
            .map((v) => v.trim())
            .filter(Boolean)
        : [rawValue];
    acc.push({ key, values });
    return acc;
  }, []);
};

export type RouteSelectors = Ingress['route_selectors'];

export type ClusterRouter = {
  routerID?: string;
  isDefault: boolean;
  isPrivate: boolean;
  address?: string;
  loadBalancer?: LoadBalancerFlavor;
  routeSelectors?: RouteSelectors;
  excludedNamespaces?: string[];
  excludeNamespaceSelectors?: SchemaNamespaceSelector[];
  isNamespaceOwnershipPolicyStrict: boolean;
  isWildcardPolicyAllowed: boolean;
  tlsSecretRef?: string;
  hostname?: string;
};

export type ClusterRouters = {
  default?: ClusterRouter;
  additional?: ClusterRouter;
};

const NetworkingSelector = (clusterRouters: Ingress[]): ClusterRouters => {
  const routers: ClusterRouters = {};
  clusterRouters?.forEach((r: Ingress) => {
    const router: ClusterRouter = {
      routerID: r.id,
      isDefault: !!r.default,
      isPrivate: r.listening === 'internal',
      address: r.dns_name,
      loadBalancer: r.load_balancer_type as LoadBalancerFlavor,
      routeSelectors: r.route_selectors,
      excludedNamespaces: r.excluded_namespaces,
      excludeNamespaceSelectors: r.excluded_namespace_selectors,
      // Default is NamespaceOwnershipPolicy.Strict if route_namespace_ownership_policy not set
      isNamespaceOwnershipPolicyStrict:
        r.route_namespace_ownership_policy !== NamespaceOwnershipPolicy.InterNamespaceAllowed,
      isWildcardPolicyAllowed: r.route_wildcard_policy === WildcardPolicy.WildcardsAllowed,
      tlsSecretRef: r.cluster_routes_tls_secret_ref,
      hostname: r.cluster_routes_hostname,
    };

    if (router.isDefault) {
      routers.default = router;
    } else {
      routers.additional = router;
    }
  });
  return routers;
};

export default NetworkingSelector;
