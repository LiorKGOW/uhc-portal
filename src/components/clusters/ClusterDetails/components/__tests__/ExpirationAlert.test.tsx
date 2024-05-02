import React from 'react';
import dayjs from 'dayjs';

import { render, screen } from '~/testUtils';

import modals from '../../../../common/Modal/modals';
import ExpirationAlert from '../ExpirationAlert';

describe('<ExpirationAlert />', () => {
  it('expiration has passed', () => {
    // Arrange
    const expirationTimestamp = '2021-11-12T23:22:13.100597Z';
    const timeDifference = dayjs.utc().to(dayjs.utc(expirationTimestamp));

    // Act
    render(<ExpirationAlert expirationTimestamp={expirationTimestamp} />);

    // Assert
    expect(screen.getByTestId('expiration-alert-passed')).toBeInTheDocument();
    expect(screen.getByTestId('expiration-alert-passed')).toHaveTextContent(
      `Warning alert:Cluster failed to deleteThis cluster should have been deleted ${timeDifference} but is still running. Contact our customer support (new window or tab).`,
    );
  });

  describe('expiration will be deleted', () => {
    it.each([
      [12, 'pf-m-danger'],
      [25, 'pf-m-warning'],
      [49, 'pf-m-info'],
    ])('%p hours difference', (hoursToAdd, expectedClass) => {
      // Arrange
      const expirationTimestamp = dayjs
        .utc()
        .add(hoursToAdd, 'hour')
        .local()
        .format('YYYY-MM-DDTHH:mm:ss.SSSZ');
      const timeDifference = dayjs.utc().to(dayjs.utc(expirationTimestamp));
      const expirationTimeString = dayjs
        .utc(expirationTimestamp)
        .local()
        .format('dddd, MMMM Do YYYY, h:mm a');

      // Act
      render(<ExpirationAlert expirationTimestamp={expirationTimestamp} />);

      // Assert
      expect(screen.getByTestId('expiration-alert-will-delete')).toBeInTheDocument();
      expect(screen.getByTestId('expiration-alert-will-delete')).toHaveClass(expectedClass);
      expect(screen.getByTestId('expiration-alert-will-delete')).toHaveTextContent(
        `This cluster will be deleted ${timeDifference}.This cluster is scheduled for deletion on ${expirationTimeString}`,
      );
    });

    describe('trialExpiration true', () => {
      it('properly renders the button', () => {
        // Arrange
        const expirationTimestamp = dayjs
          .utc()
          .add(12, 'hour')
          .local()
          .format('YYYY-MM-DDTHH:mm:ss.SSSZ');

        // Act
        render(<ExpirationAlert expirationTimestamp={expirationTimestamp} trialExpiration />);

        // Assert
        expect(screen.getByTestId('trial-button')).toBeInTheDocument();
      });

      it('test button works on click', async () => {
        // Arrange
        const openModalMockFn = jest.fn();
        const expirationTimestamp = dayjs
          .utc()
          .add(12, 'hour')
          .local()
          .format('YYYY-MM-DDTHH:mm:ss.SSSZ');
        const cluster = { id: 'id' };

        const { user } = render(
          <ExpirationAlert
            expirationTimestamp={expirationTimestamp}
            trialExpiration
            openModal={openModalMockFn}
            cluster={cluster}
          />,
        );
        expect(openModalMockFn).toBeCalledTimes(0);

        // Act
        await user.click(screen.getByTestId('trial-button'));

        // Assert
        expect(openModalMockFn).toBeCalledTimes(1);
        expect(openModalMockFn).toBeCalledWith(modals.UPGRADE_TRIAL_CLUSTER, {
          title: 'Upgrade cluster from Trial',
          clusterID: 'id',
          cluster,
        });
      });
    });

    describe('OSDRHMExpiration true', () => {
      it('properly renders the button', () => {
        // Arrange
        const expirationTimestamp = dayjs
          .utc()
          .add(12, 'hour')
          .local()
          .format('YYYY-MM-DDTHH:mm:ss.SSSZ');
        const timeDifference = dayjs.utc().to(dayjs.utc(expirationTimestamp));
        const expirationTimeString = dayjs
          .utc(expirationTimestamp)
          .local()
          .format('dddd, MMMM Do YYYY, h:mm a');

        // Act
        render(<ExpirationAlert expirationTimestamp={expirationTimestamp} OSDRHMExpiration />);

        // Assert
        expect(screen.getByTestId('expiration-alert-will-delete')).toHaveTextContent(
          `This cluster will be deleted ${timeDifference}.Your cluster subscription was purchased from Red Hat Marketplace and will expire on ${expirationTimeString}`,
        );
      });
    });
  });
});
