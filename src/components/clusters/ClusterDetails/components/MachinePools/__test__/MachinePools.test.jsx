import React from 'react';
import { shallow, mount } from 'enzyme';
import { TestWrapper, screen, render, userEvent } from '@testUtils';

import modals from '~/components/common/Modal/modals';
import { normalizedProducts } from '~/common/subscriptionTypes';
import { baseRequestState } from '../../../../../../redux/reduxHelpers';
import MachinePools from '../MachinePools';

const getMachinePools = jest.fn();
const deleteMachinePool = jest.fn();
const openModal = jest.fn();
const getOrganizationAndQuota = jest.fn();
const getMachineTypes = jest.fn();

const defaultMachinePool = {
  id: 'some-id',
  instance_type: 'm5.xlarge',
  availability_zones: ['us-east-1'],
  desired: 1,
};

const getBaseProps = (isHypershift = false, ccs = false, machinePool = defaultMachinePool) => ({
  cluster: {
    product: {
      id: normalizedProducts.ROSA,
    },
    machinePoolsActions: {
      create: true,
      update: true,
      delete: true,
      edit: true,
      list: true,
    },
    hypershift: {
      enabled: isHypershift,
    },
    ccs: {
      enabled: ccs,
    },
    cloud_provider: {
      id: 'aws',
    },
  },
  openModal,
  isAddMachinePoolModalOpen: false,
  isEditTaintsModalOpen: false,
  isEditLabelsModalOpen: false,
  clusterAutoscalerResponse: { ...baseRequestState, autoscaler: undefined },
  deleteMachinePoolResponse: { ...baseRequestState },
  addMachinePoolResponse: { ...baseRequestState },
  scaleMachinePoolResponse: { ...baseRequestState },
  machinePoolsList: { ...baseRequestState, data: [machinePool] },
  getMachinePools,
  deleteMachinePool,
  clearGetMachinePoolsResponse: jest.fn(),
  getOrganizationAndQuota,
  getMachineTypes,
  machineTypes: {},
  hasMachinePoolsQuota: true,
  canMachinePoolBeUpdated: jest.fn(() => false),
  clearDeleteMachinePoolResponse: jest.fn(),
});

const simpleMachinePoolList = {
  data: [
    {
      availability_zones: ['us-east-1a'],
      href: '/api/clusters_mgmt/v1/clusters/cluster-id/machine_pools/test-mp',
      id: 'test-mp',
      instance_type: 'm5.xlarge',
      kind: 'MachinePool',
      replicas: 1,
    },
  ],
};

describe('<MachinePools />', () => {
  it('should call getMachinePools on mount', () => {
    shallow(<MachinePools {...getBaseProps()} />);
    expect(getMachinePools).toBeCalled();
  });

  it('renders with the machine pool', () => {
    const wrapper = shallow(<MachinePools {...getBaseProps()} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('renders with the machine pool when it has labels', () => {
    const props = {
      ...getBaseProps(false, false, {
        ...defaultMachinePool,
        labels: { foo: 'bar', hello: 'world' },
      }),
    };
    const wrapper = shallow(<MachinePools {...props} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('renders with additional machine pools, some with labels and/or taints', () => {
    const props = {
      ...getBaseProps(),
      machinePoolsList: {
        data: [
          {
            availability_zones: ['us-east-1a'],
            href: '/api/clusters_mgmt/v1/clusters/cluster-id/machine_pools/mp-with-labels-and-taints',
            id: 'mp-with-labels-and-taints',
            instance_type: 'm5.xlarge',
            kind: 'MachinePool',
            labels: { foo: 'bar' },
            replicas: 1,
            taints: [
              { key: 'foo1', value: 'bazz1', effect: 'NoSchedule' },
              { key: 'foo2', value: 'bazz2', effect: 'NoSchedule' },
            ],
          },
          {
            availability_zones: ['us-east-1a'],
            href: '/api/clusters_mgmt/v1/clusters/cluster-id/machine_pools/mp-with-labels',
            id: 'mp-with-label',
            instance_type: 'm5.xlarge',
            kind: 'MachinePool',
            labels: { foo: 'bar' },
            replicas: 1,
          },
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
            href: '/api/clusters_mgmt/v1/clusters/cluster-id/machine_pools/mp-with-no-labels-no-taints',
            id: 'mp-with-no-labels-no-taints',
            instance_type: 'm5.xlarge',
            kind: 'MachinePool',
            replicas: 1,
          },
        ],
      },
    };
    const wrapper = shallow(<MachinePools {...props} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('renders with a machine pool with autoscaling enabled', () => {
    const data = [
      {
        autoscaling: { max_replicas: 2, min_replicas: 1 },
        availability_zones: ['us-east-1a'],
        href: '/api/clusters_mgmt/v1/clusters/cluster-id/machine_pools/mp-autoscaling',
        id: 'mp-autoscaling',
        instance_type: 'm5.xlarge',
        kind: 'MachinePool',
        labels: { foo: 'bar' },
        taints: [
          { key: 'foo1', value: 'bazz1', effect: 'NoSchedule' },
          { key: 'foo2', value: 'bazz2', effect: 'NoSchedule' },
        ],
      },
    ];

    const wrapper = shallow(<MachinePools {...getBaseProps()} machinePoolsList={{ data }} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('should open modal', () => {
    const wrapper = shallow(<MachinePools {...getBaseProps()} />);

    wrapper.find('#add-machine-pool').simulate('click');
    expect(openModal).toBeCalledWith(modals.ADD_MACHINE_POOL);
  });

  it('should render skeleton while fetching machine pools', () => {
    const wrapper = shallow(<MachinePools {...getBaseProps()} />);

    wrapper.setProps({ machinePoolsList: { ...baseRequestState, pending: true, data: [] } });
    expect(wrapper).toMatchSnapshot();
    expect(wrapper.find('Skeleton').length).toBeGreaterThan(0);
  });

  it('should not allow adding machine pools to users without enough quota', () => {
    const props = { ...getBaseProps(), hasMachinePoolsQuota: false };
    const wrapper = shallow(<MachinePools {...props} />);

    expect(wrapper.find('#add-machine-pool').props().disableReason).toBeTruthy();
  });

  it('Should disable unavailable actions in kebab menu if hypershift', () => {
    const props = {
      ...getBaseProps(true),
      machineTypes: {
        types: {
          aws: [
            {
              id: 'm5.xlarge',
              cpu: {
                value: 4,
              },
              memory: {
                value: 4,
              },
            },
          ],
        },
      },
      machinePoolsList: {
        data: [
          {
            kind: 'NodePool',
            href: '/api/clusters_mgmt/v1/clusters/21gitfhopbgmmfhlu65v93n4g4n3djde/node_pools/workers',
            id: 'workers',
            replicas: 2,
            auto_repair: true,
            aws_node_pool: {
              instance_type: 'm5.xlarge',
              instance_profile: 'staging-21gitfhopbgmmfhlu65v93n4g4n3djde-jknhystj27-worker',
              tags: {
                'api.openshift.com/environment': 'staging',
              },
            },
            availability_zone: 'us-east-1b',
            subnet: 'subnet-049f90721559000de',
            status: {
              current_replicas: 2,
            },
          },
          {
            kind: 'NodePool',
            href: '/api/clusters_mgmt/v1/clusters/21gitfhopbgmmfhlu65v93n4g4n3djde/node_pools/workers',
            id: 'additional-np',
            replicas: 3,
            auto_repair: true,
            aws_node_pool: {
              instance_type: 'm5.xlarge',
              instance_profile: 'staging-21gitfhopbgmmfhlu65v93n4g4n3djde-jknhystj27-worker',
              tags: {
                'api.openshift.com/environment': 'staging',
              },
            },
            availability_zone: 'us-east-1b',
            subnet: 'subnet-049f90721559000de',
            status: {
              current_replicas: 3,
            },
          },
        ],
      },
    };
    const wrapper = mount(
      <TestWrapper>
        <MachinePools {...props} />
      </TestWrapper>,
    );
    // need to find by classname because action menu doesn't have an accessible label
    const actionMenus = wrapper.find('.pf-c-dropdown__toggle');
    expect(actionMenus).toHaveLength(2);

    actionMenus.forEach((button) => {
      expect(button.props().disabled).toBeFalsy();
      button.simulate('click');
      wrapper.update();
      const menuItems = wrapper.find('.pf-c-dropdown__menu .pf-c-dropdown__menu-item');
      expect(menuItems.length).toBeGreaterThan(0);
      menuItems.forEach((item) => {
        // Only the delete, scale action currently available
        if (
          item.text() === 'Delete' ||
          item.text() === 'Scale' ||
          item.text() === 'Edit labels' ||
          item.text() === 'Edit taints'
        ) {
          expect(item.props()['aria-disabled']).toBeFalsy();
        } else {
          expect(item.props()['aria-disabled']).toBeTruthy();
        }
      });
    });
  });

  it('Should disable delete action in kebab menu if there is only one node pool and hypershift is true', () => {
    const props = {
      ...getBaseProps(true),
      machinePoolsList: {
        data: [
          {
            kind: 'NodePool',
            href: '/api/clusters_mgmt/v1/clusters/21gitfhopbgmmfhlu65v93n4g4n3djde/node_pools/workers',
            id: 'workers',
            replicas: 2,
            auto_repair: true,
            aws_node_pool: {
              instance_type: 'm5.xlarge',
              instance_profile: 'staging-21gitfhopbgmmfhlu65v93n4g4n3djde-jknhystj27-worker',
              tags: {
                'api.openshift.com/environment': 'staging',
              },
            },
            availability_zone: 'us-east-1b',
            subnet: 'subnet-049f90721559000de',
            status: {
              current_replicas: 2,
            },
          },
        ],
      },
    };
    const wrapper = mount(
      <TestWrapper>
        <MachinePools {...props} />
      </TestWrapper>,
    );
    const deleteButton = wrapper.find('ActionsColumn').props().items[3];
    expect(deleteButton.title).toBe('Delete');
    expect(deleteButton.isAriaDisabled).toBeTruthy();
  });

  it('Should enable all actions in kebab menu if hypershift is false', () => {
    const props = {
      ...getBaseProps(false, true),
      machineTypes: {
        types: {
          aws: [
            {
              id: 'm5.xlarge',
              cpu: {
                value: 4,
              },
              memory: {
                value: 4,
              },
            },
          ],
        },
      },
      machinePoolsList: {
        data: [
          {
            kind: 'NodePool',
            href: '/api/clusters_mgmt/v1/clusters/21gitfhopbgmmfhlu65v93n4g4n3djde/node_pools/workers',
            id: 'workers',
            replicas: 2,
            auto_repair: true,
            aws_node_pool: {
              instance_type: 'm5.xlarge',
              instance_profile: 'staging-21gitfhopbgmmfhlu65v93n4g4n3djde-jknhystj27-worker',
              tags: {
                'api.openshift.com/environment': 'staging',
              },
            },
            availability_zone: 'us-east-1b',
            subnet: 'subnet-049f90721559000de',
            status: {
              current_replicas: 2,
            },
          },
          {
            kind: 'NodePool',
            href: '/api/clusters_mgmt/v1/clusters/21gitfhopbgmmfhlu65v93n4g4n3djde/node_pools/workers',
            id: 'workers1',
            replicas: 2,
            auto_repair: true,
            aws_node_pool: {
              instance_type: 'm5.xlarge',
              instance_profile: 'staging-21gitfhopbgmmfhlu65v93n4g4n3djde-jknhystj27-worker',
              tags: {
                'api.openshift.com/environment': 'staging',
              },
            },
            availability_zone: 'us-east-1b',
            subnet: 'subnet-049f90721559000de',
            status: {
              current_replicas: 2,
            },
          },
        ],
      },
    };
    const wrapper = mount(
      <TestWrapper>
        <MachinePools {...props} />
      </TestWrapper>,
    );
    // need to find by classname because action menu doesn't have an accessible label
    const actionMenus = wrapper.find('.pf-c-dropdown__toggle');
    expect(actionMenus).toHaveLength(2);

    actionMenus.forEach((button) => {
      expect(button.props().disabled).toBeFalsy();
      button.simulate('click');
      wrapper.update();
      const menuItems = wrapper.find('.pf-c-dropdown__menu .pf-c-dropdown__menu-item');
      expect(menuItems.length).toBeGreaterThan(0);
      menuItems.forEach((item) => {
        expect(item.props()['aria-disabled']).toBeFalsy();
      });
    });
  });

  it('OpenShift version for machine pools is shown if hypershift', () => {
    const props = {
      ...getBaseProps(true),
      machinePoolsList: {
        data: [
          {
            kind: 'NodePool',
            href: '/api/clusters_mgmt/v1/clusters/21gitfhopbgmmfhlu65v93n4g4n3djde/node_pools/workers',
            id: 'workers',
            replicas: 2,
            auto_repair: true,
            aws_node_pool: {
              instance_type: 'm5.xlarge',
              instance_profile: 'staging-21gitfhopbgmmfhlu65v93n4g4n3djde-jknhystj27-worker',
              tags: {
                'api.openshift.com/environment': 'staging',
              },
            },
            availability_zone: 'us-east-1b',
            subnet: 'subnet-049f90721559000de',
            status: {
              current_replicas: 2,
            },
            version: {
              kind: 'VersionLink',
              id: 'openshift-v4.12.5-candidate',
              href: '/api/clusters_mgmt/v1/versions/openshift-v4.12.5-candidate',
            },
          },
        ],
      },
    };

    const wrapper = shallow(<MachinePools {...props} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('should render error message', () => {
    const props = {
      ...getBaseProps(),
      deleteMachinePoolResponse: { ...baseRequestState, error: true },
    };
    const wrapper = shallow(<MachinePools {...props} />);

    expect(wrapper.find('ErrorBox').length).toBe(1);
  });

  it('should close error message', () => {
    const props = {
      ...getBaseProps(),
      deleteMachinePoolResponse: { ...baseRequestState, error: true },
    };
    const wrapper = shallow(<MachinePools {...props} />);
    const errorBox = wrapper.find('ErrorBox');
    errorBox.props().onCloseAlert();
    expect(wrapper.find('ErrorBox').length).toBe(0);
  });

  it('displays option to update machine pool if machine pool can be updated ', async () => {
    const user = userEvent.setup();
    const props = {
      ...getBaseProps(true),
      machinePoolsList: {
        data: [
          {
            kind: 'NodePool',
            href: '/api/clusters_mgmt/v1/clusters/21gitfhopbgmmfhlu65v93n4g4n3djde/node_pools/workers',
            id: 'workers',
            replicas: 2,
            auto_repair: true,
            aws_node_pool: {
              instance_type: 'm5.xlarge',
              instance_profile: 'staging-21gitfhopbgmmfhlu65v93n4g4n3djde-jknhystj27-worker',
              tags: {
                'api.openshift.com/environment': 'staging',
              },
            },
            availability_zone: 'us-east-1b',
            subnet: 'subnet-049f90721559000de',
            status: {
              current_replicas: 2,
            },
            version: {
              kind: 'VersionLink',
              id: 'openshift-v4.12.5-candidate',
              href: '/api/clusters_mgmt/v1/versions/openshift-v4.12.5-candidate',
            },
          },
        ],
      },
      canMachinePoolBeUpdated: jest.fn(() => true),
    };

    render(<MachinePools {...props} />);

    await user.click(screen.getByRole('button', { name: 'Actions' }));
    expect(screen.getByRole('menuitem', { name: 'Update version' })).toBeInTheDocument();
  });
  it('hides option to update machine pool if machine pool cannot be updated', async () => {
    const user = userEvent.setup();
    const props = {
      ...getBaseProps(true),
      machinePoolsList: {
        data: [
          {
            kind: 'NodePool',
            href: '/api/clusters_mgmt/v1/clusters/21gitfhopbgmmfhlu65v93n4g4n3djde/node_pools/workers',
            id: 'workers',
            replicas: 2,
            auto_repair: true,
            aws_node_pool: {
              instance_type: 'm5.xlarge',
              instance_profile: 'staging-21gitfhopbgmmfhlu65v93n4g4n3djde-jknhystj27-worker',
              tags: {
                'api.openshift.com/environment': 'staging',
              },
            },
            availability_zone: 'us-east-1b',
            subnet: 'subnet-049f90721559000de',
            status: {
              current_replicas: 2,
            },
            version: {
              kind: 'VersionLink',
              id: 'openshift-v4.12.5-candidate',
              href: '/api/clusters_mgmt/v1/versions/openshift-v4.12.5-candidate',
            },
          },
        ],
      },
      canMachinePoolBeUpdated: jest.fn(() => false),
    };

    render(<MachinePools {...props} />);

    await user.click(screen.getByRole('button', { name: 'Actions' }));
    expect(screen.getAllByRole('menuitem').length).not.toEqual(0);
    expect(screen.queryByRole('menuitem', { name: 'Update version' })).not.toBeInTheDocument();
  });

  it('Should disable actions on machine pools if user does not have permissions', () => {
    const defaultProps = getBaseProps(true);
    const props = {
      ...defaultProps,
      cluster: {
        ...defaultProps.cluster,
        machinePoolsActions: {
          create: false,
          update: false,
          delete: false,
          edit: false,
          list: true,
        },
      },
      machinePoolsList: simpleMachinePoolList,
    };
    const { container } = render(<MachinePools {...props} />);
    // add machine pool button is disabled
    expect(container.querySelector('#add-machine-pool')).toHaveAttribute('aria-disabled', 'true');
    // table actions are disabled
    expect(container.querySelector('.pf-c-dropdown__toggle')).toBeDisabled();
  });

  it('Should disable delete action if user does not have permissions', async () => {
    const user = userEvent.setup();
    const defaultProps = getBaseProps(true);
    const props = {
      ...defaultProps,
      cluster: {
        ...defaultProps.cluster,
        machinePoolsActions: {
          create: false,
          update: true,
          delete: false,
          edit: true,
          list: true,
        },
      },
      machinePoolsList: simpleMachinePoolList,
    };
    render(<MachinePools {...props} />);
    await user.click(screen.getByRole('button', { name: 'Actions' }));
    expect(screen.queryByRole('menuitem', { name: 'Delete' })).toHaveAttribute(
      'aria-disabled',
      'true',
    );
  });

  it('Should allow actions on machine pools if user has permissions', () => {
    const props = {
      ...getBaseProps(true),
      machinePoolsList: simpleMachinePoolList,
    };
    const { container } = render(<MachinePools {...props} />);
    // add machine pool button is enabled
    expect(container.querySelector('#add-machine-pool')).toHaveAttribute('aria-disabled', 'false');
    // table actions are enabled
    expect(container.querySelector('.pf-c-dropdown__toggle')).toBeEnabled();
  });

  it('Should render successfully when machinePoolsActions is unset (rendering from cluster list data)', () => {
    const baseProps = getBaseProps(true);
    const props = {
      ...baseProps,
      cluster: {
        ...baseProps.cluster,
        machinePoolsActions: undefined,
      },
      machinePoolsList: simpleMachinePoolList,
    };

    const { container } = render(<MachinePools {...props} />);
    // add machine pool button is disabled
    expect(container.querySelector('#add-machine-pool')).toHaveAttribute('aria-disabled', 'true');
    // the table does not become rendered because "list" permission is missing
    expect(screen.queryByRole('grid', { name: 'Machine pools' })).not.toBeInTheDocument();
  });
});
