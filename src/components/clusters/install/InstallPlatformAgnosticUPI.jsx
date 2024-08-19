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

export class InstallPlatformAgnosticUPI extends Component {
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
          { label: 'Platform agnostic (x86_64)', path: '/install/platform-agnostic' },
          { label: 'x86_64 User-provisioned infrastructure' },
        ]}
      />
    );

    return (
      <AppPage title="Install OpenShift 4 | Red Hat OpenShift Cluster Manager | x86_64 User-Provisioned Infrastructure">
        <PageTitle title={instructionsMapping.generic.upi.title} breadcrumbs={breadcrumbs} />
        <PageSection>
          <OCPInstructions
            token={token}
            breadcrumbs={breadcrumbs}
            cloudProviderID="generic"
            isUPI
            {...instructionsMapping.generic.upi}
          />
        </PageSection>
      </AppPage>
    );
  }
}

InstallPlatformAgnosticUPI.propTypes = {
  token: PropTypes.object.isRequired,
  dispatch: PropTypes.func.isRequired,
};

const mapStateToProps = (state) => ({ token: state.tollbooth.token });

export default connect(mapStateToProps)(InstallPlatformAgnosticUPI);
