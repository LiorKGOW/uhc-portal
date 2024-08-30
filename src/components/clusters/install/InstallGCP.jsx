import React from 'react';

import { PageSection } from '@patternfly/react-core';

import { AppPage } from '~/components/App/AppPage';

import links from '../../../common/installLinks.mjs';
import Breadcrumbs from '../../common/Breadcrumbs';

import { InstructionsChooser } from './instructions/InstructionsChooser';
import { InstructionsChooserPageTitle } from './instructions/InstructionsChooserPageTitle';

const InstallGCP = () => {
  const breadcrumbs = (
    <Breadcrumbs
      path={[
        { label: 'Cluster List' },
        { label: 'Cluster Type', path: '/create' },
        { label: 'Google Cloud Platform' },
      ]}
    />
  );

  return (
    <AppPage title="Install OpenShift 4 | Red Hat OpenShift Cluster Manager | GCP">
      <InstructionsChooserPageTitle cloudName="GCP" breadcrumbs={breadcrumbs} />
      <PageSection>
        <InstructionsChooser
          ipiPageLink="/install/gcp/installer-provisioned"
          ipiLearnMoreLink={links.INSTALL_GCPIPI_LEARN_MORE}
          upiPageLink="/install/gcp/user-provisioned"
          upiLearnMoreLink={links.INSTALL_GCPUPI_GETTING_STARTED}
          providerSpecificFeatures={{
            ipi: ['Hosts controlled with Google Cloud Provider'],
          }}
          name="gcp"
        />
      </PageSection>
    </AppPage>
  );
};

export default InstallGCP;
