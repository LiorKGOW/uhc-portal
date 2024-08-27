import React from 'react';
import PropTypes from 'prop-types';

import { Flex, FlexItem, Title } from '@patternfly/react-core';

import { advisorBaseName } from '~/common/getBaseName';

import { getSeverityName } from '../overviewHelpers';

import InfoPopover from './InfoPopover';

function ChartByRisks({ riskHits }) {
  return (
    <Flex className="ocm-insights--risk-chart" direction={{ default: 'column' }}>
      <FlexItem spacer={{ default: 'spacerLg' }}>
        <Title className="ocm-insights--risk-chart__title" size="lg" headingLevel="h2">
          Advisor recommendations by severity
        </Title>
        <InfoPopover />
      </FlexItem>
      <FlexItem className="ocm-insights--risk-chart__items" spacer={{ default: 'spacerLg' }}>
        <Flex
          justifyContent={{ default: 'justifyContentFlexStart' }}
          fullWidth={{ default: '50%' }}
          spaceItems={{
            sm: 'spaceItemsXl',
            md: 'spaceItemsLg',
            lg: 'spaceItems2xl',
            '2xl': 'spaceItems4xl',
          }}
        >
          {Object.entries({
            1: 0,
            2: 0,
            3: 0,
            4: 0,
            ...riskHits,
          })
            .reverse()
            .map(([riskNumber, count]) => (
              <FlexItem
                className="ocm-insights--items__risk-item"
                data-testid="ocm-insights--items__risk-item"
                key={riskNumber}
              >
                <Flex
                  direction={{ default: 'column' }}
                  alignItems={{ default: 'alignItemsCenter' }}
                  spaceItems={{ default: 'spaceItemsNone' }}
                >
                  <FlexItem className="ocm-insights--risk-item__count">
                    <Title size="2xl" headingLevel="h1">
                      <a href={`${advisorBaseName}/recommendations?total_risk=${riskNumber}`}>
                        {count}
                      </a>
                    </Title>
                  </FlexItem>
                  <FlexItem className="ocm-insights--risk-item__label">
                    {getSeverityName(riskNumber)}
                  </FlexItem>
                </Flex>
              </FlexItem>
            ))}
        </Flex>
      </FlexItem>
    </Flex>
  );
}

export default ChartByRisks;

ChartByRisks.propTypes = {
  riskHits: PropTypes.object.isRequired,
};
