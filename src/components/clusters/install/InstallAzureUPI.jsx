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

class InstallAzureUPI extends Component {
  componentDidMount() {
    scrollToTop();
    document.title = 'Install OpenShift 4 | Red Hat OpenShift Cluster Manager | Azure User-Provisioned Infrastructure';

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
        { label: 'User-provisioned infrastructure' },
      ]}
      />
    );

    return (
      <>
        <PageTitle title={instructionsMapping.azure.upi.title} breadcrumbs={breadcrumbs} />
        <PageSection>
          <OCPInstructions
            token={token}
            breadcrumbs={breadcrumbs}
            cloudProviderID="azure"
            customizations={instructionsMapping.azure.customizations}
            {...instructionsMapping.azure.ipi}
          />
        </PageSection>
      </>
    );
  }
}

InstallAzureUPI.propTypes = {
  token: PropTypes.object.isRequired,
  dispatch: PropTypes.func.isRequired,
};

const mapStateToProps = state => ({ token: state.tollbooth.token });

export default connect(mapStateToProps)(InstallAzureUPI);
