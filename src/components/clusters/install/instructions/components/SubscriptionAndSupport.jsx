import React from 'react';
import {
  List,
  ListItem,
  Text,
  TextContent,
} from '@patternfly/react-core';

const SubscriptionAndSupport = () => {
  const bullet1 = (
    <span>
      Choose &quot;Edit subscriptions settings &quot; from the actions menu in
      the upper right of the cluster details pages.
    </span>
  );
  const bullet2 = (
    <span>
      Select the options that apply to your cluster in the dialog and save.
    </span>
  );
  return (
    <TextContent>
      <Text component="h2">Subscription and support</Text>
      <Text component="p">
        You cluster will be automatically registered with a 60 day evaluation subscription
        which does not include support. In order to receive support for your cluster, you
        will need to edit the subscription settings  the cluster details page here in
        OpenShift Cluster Manager.
      </Text>
      <List>
        <ListItem>{bullet1}</ListItem>
        <ListItem>{bullet2}</ListItem>
      </List>
    </TextContent>
  );
};

export default SubscriptionAndSupport;
