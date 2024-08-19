import React from 'react';

import { PageSection } from '@patternfly/react-core';

import { AppPage } from '~/components/App/AppPage';

import links from '../../../common/installLinks.mjs';
import Breadcrumbs from '../../common/Breadcrumbs';

import { InstructionsChooser } from './instructions/InstructionsChooser';
import { InstructionsChooserPageTitle } from './instructions/InstructionsChooserPageTitle';

const InstallIBMZ = () => {
  const breadcrumbs = (
    <Breadcrumbs
      path={[
        { label: 'Cluster List' },
        { label: 'Cluster Type', path: '/create' },
        { label: 'IBM Z (s390x)' },
      ]}
    />
  );

  return (
    <AppPage title="Install OpenShift 4 | Red Hat OpenShift Cluster Manager | IBM Z (s390x)">
      <InstructionsChooserPageTitle cloudName="IBM Z (s390x)" breadcrumbs={breadcrumbs} />
      <PageSection>
        <InstructionsChooser
          aiPageLink="/assisted-installer/clusters/~new"
          aiLearnMoreLink={links.INSTALL_ASSISTED_LEARN_MORE}
          upiPageLink="/install/ibmz/user-provisioned"
          upiLearnMoreLink={links.INSTALL_IBMZ_UPI_GETTING_STARTED}
          agentBasedPageLink="/install/ibmz/agent-based"
          agentBasedLearnMoreLink={links.INSTALL_AGENT_LEARN_MORE}
          hideIPI
          providerSpecificFeatures={{
            abi: ['For connected or air-gapped/restricted networks'],
            ipi: [
              'Hosts controlled with Ibmz Cloud Provider',
              'For connected or air-gapped/restricted networks',
            ],
            upi: ['For connected or air-gapped/restricted networks'],
          }}
          name="Ibmz"
        />
      </PageSection>
    </AppPage>
  );
};

export default InstallIBMZ;
