import React from 'react';
import { screen, render, checkAccessibility, within } from '~/testUtils';
import InsightsAdvisorCard from './InsightsAdvisorCard';
import { categoryMapping } from './ChartByGroups';

const initialState = {
  overview: {
    clusters_hit: 0,
  },
  groups: [],
};

describe('<InsightsAdvisorCard />', () => {
  describe('When no Advisor recommendations (no rule hits)', () => {
    it('Displays empty state', () => {
      render(<InsightsAdvisorCard overview={initialState.overview} groups={initialState.groups} />);

      expect(
        screen.getByText(
          'This feature uses the Remote Health functionality of OpenShift Container Platform.',
          { exact: false },
        ),
      ).toBeInTheDocument();
    });
  });

  describe('When recommendations are available (rule hits)', () => {
    const overview = {
      clusters_hit: 3,
      hit_by_risk: {
        1: 1,
        2: 2,
        3: 10,
        4: 1,
      },
      hit_by_tag: {
        fault_tolerance: 2,
        performance: 4,
        security: 3,
        service_availability: 11,
      },
    };
    const groups = [
      {
        title: 'fault_tolerance',
        description: 'fault_tolerance',
        tags: ['fault_tolerance'],
      },
      {
        title: 'performance',
        description: 'performance',
        tags: ['performance'],
      },
      {
        title: 'security',
        description: 'security',
        tags: ['security'],
      },
      {
        title: 'service_availability',
        description: 'service_availability',
        tags: ['service_availability'],
      },
    ];

    it.skip('is accessible', async () => {
      const { container } = render(<InsightsAdvisorCard overview={overview} groups={groups} />);

      // Fails with   "Interactive controls must not be nested (nested-interactive)" error
      await checkAccessibility(container);
    });

    it('renders two charts', () => {
      render(<InsightsAdvisorCard overview={overview} groups={groups} />);

      // ChartByRisks
      expect(screen.getByText('Advisor recommendations by severity')).toBeInTheDocument();

      // ChartByGroups
      expect(screen.getByText('Recommendations by category')).toBeInTheDocument();
    });

    it('renders single "View more" link to OCP Advisor', () => {
      render(<InsightsAdvisorCard overview={overview} groups={groups} />);

      expect(screen.getByRole('link', { name: 'View more in Insights Advisor' })).toHaveAttribute(
        'href',
        '/openshift/insights/advisor',
      );
    });

    it('chart by risks has links to Advisor', () => {
      render(<InsightsAdvisorCard overview={overview} groups={groups} />);

      // Currently there is no other way to easily identify this object
      const riskItems = screen.getAllByTestId('ocm-insights--items__risk-item');

      // four risks in total
      expect(riskItems).toHaveLength(4);
      riskItems.forEach(
        // check whether low risk is mapped to 1, moderate to 2, important to 3, critical to 4
        (item, index) => {
          const link = within(item).getByRole('link');
          expect(link).toHaveAttribute(
            'href',
            `/openshift/insights/advisor/recommendations?total_risk=${4 - index}`,
          );
        },
        //   ),
      );
    });

    it('chart by groups has links to Advisor', () => {
      render(<InsightsAdvisorCard overview={overview} groups={groups} />);

      // Currently there is no other way to easily identify this object
      const titles = screen.getAllByTestId('titleComponent');

      // four categories in total and four TitleComponents rendered
      expect(titles).toHaveLength(4);
      titles.forEach((title) => {
        const link = within(title).getByRole('link');
        const category = link.getAttribute('data-testid');

        expect(link).toHaveAttribute(
          'href',
          `/openshift/insights/advisor/recommendations?category=${categoryMapping[category]}`,
        );
      });
    });
  });
});
