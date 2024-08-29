import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import { PageSection } from '@patternfly/react-core';

import { AppPage } from '~/components/App/AppPage';

import { tollboothActions } from '../../../redux/actions';
import Breadcrumbs from '../../common/Breadcrumbs';
import PageTitle from '../../common/PageTitle';

import instructionsMapping from './instructions/instructionsMapping';
import OCPInstructions from './instructions/OCPInstructions';

export class InstallIBMZUPI extends Component {
  componentDidMount() {
    const { dispatch } = this.props;
    dispatch(tollboothActions.createAuthToken());
  }

  render() {
    const { token } = this.props;
    const breadcrumbs = (
      <Breadcrumbs
        path={[
          { label: 'Cluster List' },
          { label: 'Cluster Type', path: '/create' },
          { label: 'IBM Z (s390x)', path: '/install/ibmz' },
          { label: 'User-provisioned infrastructure' },
        ]}
      />
    );

    return (
      <AppPage title="Install OpenShift 4 | Red Hat OpenShift Cluster Manager | IBM Z (s390x)">
        <PageTitle
          title={instructionsMapping.baremetal.s390x.upi.title}
          breadcrumbs={breadcrumbs}
        />
        <PageSection>
          <OCPInstructions
            token={token}
            cloudProviderID="baremetal"
            isUPI
            {...instructionsMapping.baremetal.s390x.upi}
          />
        </PageSection>
      </AppPage>
    );
  }
}

InstallIBMZUPI.propTypes = {
  token: PropTypes.object.isRequired,
  dispatch: PropTypes.func.isRequired,
};

const mapStateToProps = (state) => ({ token: state.tollbooth.token });

export default connect(mapStateToProps)(InstallIBMZUPI);
