import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { CompatRouter } from 'react-router-dom-v5-compat';
import { Provider } from 'react-redux';
import * as useChromeHook from '@redhat-cloud-services/frontend-components/useChrome';
import { mockRestrictedEnv, render, screen } from '~/testUtils';
import Router from './Router';
import { store } from '../../redux/store';

global.insights = {
  chrome: {
    ...global.insights.chrome,
    on: () => () => {}, // a function that returns a function
    appNavClick: () => {},
    auth: {
      getOfflineToken: () => Promise.resolve({ data: { refresh_token: 'hello' } }),
    },
  },
};

const routes = [
  { path: '/', metadata: { ocm_resource_type: 'all' } },
  { path: '/token/rosa', metadata: { ocm_resource_type: 'moa' } },
  { path: '/token/rosa/show', metadata: { ocm_resource_type: 'moa' } },
  { path: '/token', metadata: { ocm_resource_type: 'all' } },
  { path: '/token/show', metadata: { ocm_resource_type: 'all' } },
  { path: '/downloads', metadata: { ocm_resource_type: 'all' } },
  { path: '/details/:id', metadata: { ocm_resource_type: 'all' } },
  {
    path: '/details/s/:id',
    metadata: { ocm_resource_type: 'unknown', title: 'View Cluster', path: '/openshift/details/s' },
  },
  {
    path: '/details/s/:id/add-idp/:idpTypeName',
    metadata: {
      ocm_resource_type: 'unknown',
      title: 'Add IdP',
      path: '/openshift/details/s/add-idp',
    },
  },
  {
    path: '/details/s/:id/edit-idp/:idpName',
    metadata: {
      ocm_resource_type: 'unknown',
      title: 'Edit IdP',
      path: '/openshift/details/s/edit-idp',
    },
  },
  { path: '/create/osd/aws', metadata: { ocm_resource_type: 'osd' } },
  { path: '/create/osd/gcp', metadata: { ocm_resource_type: 'osd' } },
  { path: '/create/osd', metadata: { ocm_resource_type: 'osd' } },
  { path: '/create', metadata: { ocm_resource_type: 'all' } },
  { path: '/register', metadata: { ocm_resource_type: 'ocp' } },
  { path: '/quota', metadata: { ocm_resource_type: 'all' } },
  { path: '/archived', metadata: { ocm_resource_type: 'all' } },
  { path: '/releases', metadata: { ocm_resource_type: 'ocp' } },
].map((route) =>
  Object.assign(route, {
    toString() {
      return route.path;
    },
  }),
);

describe('Router', () => {
  const useChromeSpy = jest.spyOn(useChromeHook, 'default');
  const mockSetPageMetadata = jest.fn();
  beforeAll(() => {
    useChromeSpy.mockImplementation(() => ({
      segment: {
        setPageMetadata: mockSetPageMetadata,
      },
    }));
    mockRestrictedEnv();
  });
  describe('Every route should render: ', () =>
    test.each(routes)(
      '%s',
      async (route) => {
        const { path, metadata } = route;
        render(
          <Provider store={store}>
            <MemoryRouter keyLength={0} initialEntries={[{ pathname: path, key: 'testKey' }]}>
              <CompatRouter>
                <Router />
              </CompatRouter>
            </MemoryRouter>
          </Provider>,
        );

        expect(screen.queryByText('We lost that page')).not.toBeInTheDocument();

        expect(mockSetPageMetadata).lastCalledWith(metadata);
      },
      2000,
    ));
});
