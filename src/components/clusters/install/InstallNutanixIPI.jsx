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

export class InstallNutanixIPI extends Component {
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
          { label: 'Nutanix AOS', path: '/install/nutanix' },
          { label: 'Installer-provisioned infrastructure' },
        ]}
      />
    );

    return (
      <AppPage title="Install OpenShift 4 | Red Hat OpenShift Cluster Manager | Nutanix AOS Installer-Provisioned Infrastructure">
        <PageTitle title={instructionsMapping.nutanix.ipi.title} breadcrumbs={breadcrumbs} />
        <PageSection>
          <OCPInstructions
            token={token}
            cloudProviderID="nutanix"
            {...instructionsMapping.nutanix.ipi}
          />
        </PageSection>
      </AppPage>
    );
  }
}

InstallNutanixIPI.propTypes = {
  token: PropTypes.object.isRequired,
  dispatch: PropTypes.func.isRequired,
};

const mapStateToProps = (state) => ({ token: state.tollbooth.token });

export default connect(mapStateToProps)(InstallNutanixIPI);
