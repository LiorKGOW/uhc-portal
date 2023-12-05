import React from 'react';
import { MemoryRouter, Router } from 'react-router-dom';
import { createMemoryHistory } from 'history';

import { render, checkAccessibility, screen, mockRestrictedEnv } from '~/testUtils';
import * as hooks from '~/hooks/useFeatureGate';
import { HCP_ROSA_GETTING_STARTED_PAGE } from '~/redux/constants/featureConstants';
import CreateClusterDropDown from './CreateClusterDropDown';

const getStartedPath = '/create/rosa/getstarted';

describe('<CreateClusterDropDown />', () => {
  it('is accessible', async () => {
    // Arrange
    const { container } = render(
      <MemoryRouter>
        <CreateClusterDropDown />
      </MemoryRouter>,
    );

    // Assert
    await checkAccessibility(container);
  });

  it('is accessible expanded', async () => {
    // Arrange
    const { container, user } = render(
      <MemoryRouter>
        <CreateClusterDropDown />
      </MemoryRouter>,
    );

    // Act
    await user.click(screen.getByRole('button', { name: 'Create cluster' }));
    expect(screen.getByText(/With CLI/)).toBeInTheDocument();

    // Assert
    await checkAccessibility(container);
  });

  it('CLI option goes to getting started page', async () => {
    // Arrange
    const history = createMemoryHistory();

    const { user } = render(
      // @ts-ignore
      <Router history={history}>
        <CreateClusterDropDown />
      </Router>,
    );

    // Act
    await user.click(screen.getByRole('button', { name: 'Create cluster' }));
    await user.click(screen.getByText(/With CLI/));

    // Assert
    expect(history.location.pathname).toBe(getStartedPath);
  });

  it('Prerequisites link goes to getting started page', async () => {
    // Arrange
    const history = createMemoryHistory();

    const { user } = render(
      // @ts-ignore
      <Router history={history}>
        <CreateClusterDropDown />
      </Router>,
    );

    // Act
    await user.click(screen.getByRole('link', { name: 'Prerequisites' }));

    // Assert
    expect(history.location.pathname).toBe(getStartedPath);
  });

  it('shows hypershift helper text when feature flags are enabled', async () => {
    // Arrange
    jest
      .spyOn(hooks, 'useFeatureGate')
      .mockImplementation((feature) => feature === HCP_ROSA_GETTING_STARTED_PAGE);

    const { user } = render(
      <MemoryRouter>
        <CreateClusterDropDown />
      </MemoryRouter>,
    );

    // Act
    await user.click(screen.getByRole('button', { name: 'Create cluster' }));
    expect(screen.getByText(/With CLI/)).toBeInTheDocument();

    // Arrange
    expect(screen.getByText(/Supports ROSA with Hosted Control Plane/)).toBeInTheDocument();
    expect(screen.getByText(/ROSA with Hosted Control Plane coming soon/)).toBeInTheDocument();
  });

  it('hides hypershift helper text when feature flags are not enabled', async () => {
    // Arrange
    jest
      .spyOn(hooks, 'useFeatureGate')
      .mockImplementation((feature) => feature !== HCP_ROSA_GETTING_STARTED_PAGE);

    const { user } = render(
      <MemoryRouter>
        <CreateClusterDropDown />
      </MemoryRouter>,
    );

    // Act
    await user.click(screen.getByRole('button', { name: 'Create cluster' }));
    expect(screen.getByText(/With CLI/)).toBeInTheDocument();

    // Assert
    expect(screen.queryByText(/Supports ROSA with Hosted Control Plane/)).not.toBeInTheDocument();
    expect(
      screen.queryByText(/ROSA with Hosted Control Plane coming soon/),
    ).not.toBeInTheDocument();
  });

  describe('in Restriced env', () => {
    const isRestrictedEnv = mockRestrictedEnv();

    afterEach(() => {
      isRestrictedEnv.mockReturnValue(false);
    });

    it('does not show hypershift helper text', async () => {
      isRestrictedEnv.mockReturnValue(true);
      jest
        .spyOn(hooks, 'useFeatureGate')
        .mockImplementation((feature) => feature === HCP_ROSA_GETTING_STARTED_PAGE);

      const { user } = render(
        <MemoryRouter>
          <CreateClusterDropDown />
        </MemoryRouter>,
      );

      await user.click(screen.getByRole('button', { name: 'Create cluster' }));
      expect(screen.getByText(/With CLI/)).toBeInTheDocument();
      expect(screen.getByText(/With web interface/)).toBeInTheDocument();

      expect(screen.queryByTestId('cli-helper')).not.toBeInTheDocument();
      expect(screen.queryByTestId('wizard-helper')).not.toBeInTheDocument();
    });
  });
});
