import React from 'react';

import { PageSection } from '@patternfly/react-core';

import { AppPage } from '~/components/App/AppPage';

import links from '../../../common/installLinks.mjs';
import Breadcrumbs from '../../common/Breadcrumbs';

import { InstructionsChooser } from './instructions/InstructionsChooser';
import { InstructionsChooserPageTitle } from './instructions/InstructionsChooserPageTitle';

const InstallASH = () => {
  const breadcrumbs = (
    <Breadcrumbs
      path={[
        { label: 'Cluster List' },
        { label: 'Cluster Type', path: '/create' },
        { label: 'Microsoft Azure Stack Hub' },
      ]}
    />
  );

  return (
    <AppPage title="Install OpenShift 4 | Red Hat OpenShift Cluster Manager | Azure Stack Hub">
      <InstructionsChooserPageTitle cloudName="Azure Stack Hub" breadcrumbs={breadcrumbs} />
      <PageSection>
        <InstructionsChooser
          ipiPageLink="/install/azure-stack-hub/installer-provisioned"
          ipiLearnMoreLink={links.INSTALL_ASHIPI_GETTING_STARTED}
          upiPageLink="/install/azure-stack-hub/user-provisioned"
          upiLearnMoreLink={links.INSTALL_ASHUPI_GETTING_STARTED}
          providerSpecificFeatures={{
            ipi: ['Hosts controlled with Azure Provider'],
          }}
          name="azure-stack-hub"
        />
      </PageSection>
    </AppPage>
  );
};

export default InstallASH;
