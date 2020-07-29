import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import {
  PageSection,
} from '@patternfly/react-core';
import Breadcrumbs from '../common/Breadcrumbs';
import { tollboothActions } from '../../../redux/actions';
import { scrollToTop } from '../../../common/helpers';
import instructionsMapping from './instructions/instructionsMapping';
import OCPInstructions from './instructions/OCPInstructions';
import PageTitle from '../../common/PageTitle';

class InstallAzureIPI extends Component {
  componentDidMount() {
    scrollToTop();
    document.title = 'Install OpenShift 4 | Red Hat OpenShift Cluster Manager | Azure Installer-Provisioned Infrastructure';

    const { dispatch } = this.props;
    dispatch(tollboothActions.createAuthToken());
  }

  render() {
    const { token } = this.props;
    const breadcrumbs = (
      <Breadcrumbs path={[
        { label: 'Clusters' },
        { label: 'Create', path: '/create' },
        { label: 'OpenShift Container Platform', path: '/install' },
        { label: 'Microsoft Azure', path: '/install/azure' },
        { label: 'Installer-provisioned infrastructure' },
      ]}
      />
    );

    return (
      <>
        <PageTitle title={instructionsMapping.azure.ipi.title} breadcrumbs={breadcrumbs} />
        <PageSection>
          <OCPInstructions
            token={token}
            cloudProvider={instructionsMapping.azure.cloudProvider}
            customizations={instructionsMapping.azure.customizations}
            {...instructionsMapping.azure.ipi}
          />
        </PageSection>
      </>
    );
  }
}

InstallAzureIPI.propTypes = {
  token: PropTypes.object.isRequired,
  dispatch: PropTypes.func.isRequired,
};

const mapStateToProps = state => ({ token: state.tollbooth.token });

export default connect(mapStateToProps)(InstallAzureIPI);
