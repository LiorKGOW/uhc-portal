import React from 'react';

import { Content } from '@patternfly/react-core';

import PopoverHint from '~/components/common/PopoverHint';

export const ExcludeNamespaceSelectorsHelpText =
  'Optional list of label selectors to exclude namespaces from exposing routes via the default ingress controller. Format: key=value or key=[value1, value2] (comma-separated).';

export const ExcludeNamespaceSelectorsPopover = () => (
  <PopoverHint
    title="Exclude namespace selectors"
    maxWidth="30rem"
    hint={
      <Content>
        <Content component="p">
          Supply a list of label selectors to exclude namespaces from having routes exposed by the
          default ingress controller. If no selectors are specified, all namespaces will be exposed.
          Format should be comma-separated entries: &quot;key=value&quot; or &quot;key=[value1,
          value2]&quot;.
        </Content>
      </Content>
    }
  />
);
