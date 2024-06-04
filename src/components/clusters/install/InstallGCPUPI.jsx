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

export class InstallGCPUPI extends Component {
  componentDidMount() {
    const { dispatch } = this.props;
    dispatch(tollboothActions.createAuthToken());
  }

  render() {
    const { token } = this.props;
    const breadcrumbs = (
      <Breadcrumbs
        path={[
          { label: 'Clusters' },
          { label: 'Cluster Type', path: '/create' },
          { label: 'Google Cloud Platform', path: '/install/gcp' },
          { label: 'User-provisioned infrastructure' },
        ]}
      />
    );

    return (
      <AppPage title="Install OpenShift 4 | Red Hat OpenShift Cluster Manager | GCP User-Provisioned Infrastructure">
        <PageTitle title={instructionsMapping.gcp.upi.title} breadcrumbs={breadcrumbs} />
        <PageSection>
          <OCPInstructions
            token={token}
            cloudProviderID="gcp"
            isUPI
            {...instructionsMapping.gcp.upi}
          />
        </PageSection>
      </AppPage>
    );
  }
}

InstallGCPUPI.propTypes = {
  token: PropTypes.object.isRequired,
  dispatch: PropTypes.func.isRequired,
};

const mapStateToProps = (state) => ({ token: state.tollbooth.token });

export default connect(mapStateToProps)(InstallGCPUPI);
