import { TextInput } from '@patternfly/react-core';
import React from 'react';
import { useDispatch } from 'react-redux';
import { onListFilterSet } from '~/redux/actions/viewOptionsActions';
import { useGlobalState } from '~/redux/hooks';

type ClusterListFilterProps = {
  view: string;
  isDisabled?: boolean;
};

const ClusterListFilter = ({ view, isDisabled }: ClusterListFilterProps) => {
  const dispatch = useDispatch();

  // The current input value is in the local state, while the currently
  // set filter is in the redux state.
  // This is done to allow some delay between the user's input and
  // the actual filtering, to give them time to finish typing.
  const [currentValue, setCurrentValue] = React.useState<
    | string
    | { description?: string; loggedBy?: string; timestampFrom?: string; timestampTo?: string }
  >('');
  const [inputTimeoutID, setInputTimeoutID] = React.useState<any>(undefined);
  const currentFilter = useGlobalState((state) => state.viewOptions[view].filter);

  const updateCurrentValue = (value: string) => {
    if (inputTimeoutID !== undefined) {
      clearTimeout(inputTimeoutID);
    }
    setInputTimeoutID(setTimeout(() => dispatch(onListFilterSet(value, view)), 300));
    setCurrentValue(value);
  };

  React.useEffect(() => {
    if (currentFilter) {
      setCurrentValue(currentFilter);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <TextInput
      type="text"
      aria-label="Filter"
      className="cluster-list-filter"
      value={currentValue as any}
      placeholder="Filter by name or ID..."
      data-testid="filterInputClusterList"
      onChange={(_event, inputVal: string) => updateCurrentValue(inputVal)}
      isDisabled={isDisabled}
    />
  );
};

export default ClusterListFilter;
