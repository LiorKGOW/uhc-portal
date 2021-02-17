import React from 'react';
import { shallow } from 'enzyme';

import AddMachinePoolModal from './AddMachinePoolModal';

describe('<AddMachinePoolModal />', () => {
  const closeModal = jest.fn();
  const clearAddMachinePoolResponse = jest.fn();
  const submit = jest.fn();
  const cluster = {
    managed: true,
    cloud_provider: {
      id: 'aws',
    },
    subscription: {
      plan: {
        id: 'OSD',
      },
    },
    multi_az: false,
  };
  const getOrganizationAndQuota = jest.fn();
  const getMachineTypes = jest.fn();
  const change = jest.fn();
  const pendingRequest = {
    pending: true,
    fulfilled: false,
    error: false,
  };
  const wrapper = shallow(
    <AddMachinePoolModal
      isOpen
      closeModal={closeModal}
      submit={submit}
      clearAddMachinePoolResponse={clearAddMachinePoolResponse}
      cluster={cluster}
      getOrganizationAndQuota={getOrganizationAndQuota}
      getMachineTypes={getMachineTypes}
      machineTypes={pendingRequest}
      pristine={false}
      canAutoScale
      autoscalingEnabled
      change={change}
    />,
  );
  it('renders correctly', () => {
    expect(wrapper).toMatchSnapshot();
  });
});
