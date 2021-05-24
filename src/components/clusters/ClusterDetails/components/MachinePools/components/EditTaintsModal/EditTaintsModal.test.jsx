import React from 'react';
import { shallow } from 'enzyme';

import EditTaintsModal from './EditTaintsModal';

describe('<EditTaintsModal />', () => {
  const closeModal = jest.fn();
  const handleSubmit = jest.fn();
  const resetGetMachinePoolsResponse = jest.fn();
  const resetEditTaintsResponse = jest.fn();
  const getMachinePools = jest.fn();
  const change = jest.fn();
  const reset = jest.fn();

  const mockData = {
    data: [
      {
        availability_zones: ['us-east-1a'],
        href: '/api/clusters_mgmt/v1/clusters/cluster-id/machine_pools/mp-with-taints',
        id: 'mp-with-taints',
        instance_type: 'm5.xlarge',
        kind: 'MachinePool',
        replicas: 1,
        taints: [
          { key: 'foo1', value: 'bazz1', effect: 'NoSchedule' },
          { key: 'foo2', value: 'bazz2', effect: 'NoSchedule' },
        ],
      },
      {
        availability_zones: ['us-east-1a'],
        href: '/api/clusters_mgmt/v1/clusters/cluster-id/machine_pools/mp-with-taints2',
        id: 'mp-withot-taints',
        instance_type: 'm5.xlarge',
        kind: 'MachinePool',
        replicas: 1,
      },
    ],
  };

  const props = {
    closeModal,
    handleSubmit,
    editTaintsResponse: {},
    getMachinePools,
    resetEditTaintsResponse,
    resetGetMachinePoolsResponse,
    machinePoolsList: mockData,
    change,
    reset,
    pristine: true,
    clusterId: 'test-id',
  };

  const EditTaintsModalWithLabelswrapper = shallow(<EditTaintsModal {...props} />);

  it('renders correctl', () => {
    expect(EditTaintsModalWithLabelswrapper).toMatchSnapshot();
  });

  it('should update taints fields when changing machine pool', () => {
    const mpField = EditTaintsModalWithLabelswrapper.find('Field[name="machinePoolId"]');
    const mockEvent = { target: { value: mockData.data[0].id } };
    mpField.props().onChange(mockEvent, mockEvent.target.value);
    expect(change).toHaveBeenCalledWith('taints', mockData.data[0].taints);
  });
});
