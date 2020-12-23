import React from 'react';
import {
  Text,
  TextList,
  TextListItem,
} from '@patternfly/react-core';

const DeveloperPreviewStatements = () => (
  <>
    <Text component="p">
      Because these are developer preview builds:
    </Text>
    <TextList>
      <TextListItem>
        Production use is not permitted.
      </TextListItem>
      <TextListItem>
        Installation and use is not eligible for Red Hat production support.
      </TextListItem>
      <TextListItem>
        Clusters installed at pre-release versions cannot be upgraded.
        As we approach a GA milestone with these nightly builds, we will
        allow upgrades from a nightly to a nightly; however, we will not
        support an upgrade from a nightly to the final GA build of OCP.
      </TextListItem>
    </TextList>
  </>
);

export default DeveloperPreviewStatements;
