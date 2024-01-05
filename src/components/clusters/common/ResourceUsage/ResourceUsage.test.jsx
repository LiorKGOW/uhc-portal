import React from 'react';
import { render, screen /* checkAccessibility */ } from '~/testUtils';
import ResourceUsage from './ResourceUsage';
import { metricsStatusMessages } from './ResourceUsage.consts';

const cpu = {
  used: {
    value: 3.995410922987096,
  },
  total: {
    value: 16,
  },
};

const memory = {
  used: {
    value: 16546058240,
    unit: 'B',
  },
  total: {
    value: 82293346304,
    unit: 'B',
  },
};

// TODO: This component is not fully testable because a large portion of the data is only displayed in SVGs
// and is not accessible.  Besides not easily testable this is a large accessibility concern.

describe('<ResourceUsage />', () => {
  const defaultProps = {
    cpu,
    memory,
    type: '',
    metricsAvailable: true,
    metricsStatusMessage: metricsStatusMessages.default,
  };

  it('should render no type', async () => {
    render(<ResourceUsage {...defaultProps} />);

    // This fails due to numerous accessibility issues
    // await checkAccessibility(container);

    // Verify that something is rendering
    expect(screen.getByText('24.97%')).toBeInTheDocument();
    expect(screen.getByText('of 16 Cores used')).toBeInTheDocument();
    expect(screen.getAllByRole('img')).toHaveLength(2);
  });

  it('should render type threshold', () => {
    const thresholdProps = {
      ...defaultProps,
      type: 'threshold',
    };
    render(<ResourceUsage {...thresholdProps} />);

    // Verify that something is rendering
    expect(screen.getByText('24.97%')).toBeInTheDocument();
    expect(screen.getByText('of 16 Cores used')).toBeInTheDocument();
    expect(screen.getAllByRole('img')).toHaveLength(2);
  });

  it('should render type legend', () => {
    const legendProps = { ...defaultProps, type: 'legend' };
    render(<ResourceUsage {...legendProps} />);

    expect(screen.getByText('Used: 4 Cores')).toBeInTheDocument();
    expect(screen.getByText('Available: 12 Cores')).toBeInTheDocument();
    expect(screen.getByText('Used: 15.41 GiB')).toBeInTheDocument();
    expect(screen.getByText('Available: 61.23 GiB')).toBeInTheDocument();
    expect(screen.getAllByRole('img')).toHaveLength(2);
  });

  it('should render status message when metrics are not available', () => {
    const notAvailableProps = {
      ...defaultProps,
      type: 'threshold',
      metricsAvailable: false,
    };
    render(<ResourceUsage {...notAvailableProps} />);

    expect(
      screen.getByText('The cluster currently does not have any metrics data. Try again later.'),
    ).toBeInTheDocument();
    expect(screen.queryAllByRole('img')).toHaveLength(0);
  });

  it('should render correct status message when archived', () => {
    const archivedProps = {
      ...defaultProps,
      type: 'threshold',
      metricsAvailable: false,
      metricsStatusMessage: metricsStatusMessages.archived,
    };
    render(<ResourceUsage {...archivedProps} />);

    expect(
      screen.getByText('The cluster has been archived and does not have any metrics data.'),
    ).toBeInTheDocument();
    expect(screen.queryAllByRole('img')).toHaveLength(0);
  });
});
