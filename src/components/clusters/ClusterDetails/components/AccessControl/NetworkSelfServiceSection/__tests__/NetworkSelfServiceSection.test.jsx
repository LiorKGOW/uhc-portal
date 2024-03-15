import React from 'react';
import { shallow } from 'enzyme';

import { screen, render, checkAccessibility } from '~/testUtils';

import NetworkSelfServiceSection from '../NetworkSelfServiceSection';

jest.useFakeTimers({
  legacyFakeTimers: true, // TODO 'modern'
});

const baseResponse = {
  fulfilled: false,
  pending: false,
  error: false,
};
const fakeGrants = [
  {
    user_arn: 'fake-arn',
    state: 'pending',
    role: {
      id: 'network-mgmt',
    },
    id: 'fake-id-1',
    roleName: 'Network Management',
    console_url: 'http://example.com',
  },
  {
    user_arn: 'fake-arn2',
    state: 'pending',
    role: {
      id: 'read-only',
    },
    id: 'fake-id-2',
    roleName: 'Read Only',
    console_url: 'http://example.com',
  },
];

describe('<NetworkSelfServiceSection />', () => {
  let wrapper;

  const getRoles = jest.fn();
  const getGrants = jest.fn();
  const deleteGrant = jest.fn();
  const openAddGrantModal = jest.fn();
  const addNotification = jest.fn();

  const props = {
    canEdit: true,
    getRoles,
    getGrants,
    deleteGrant,
    openAddGrantModal,
    addNotification,
    grants: { ...baseResponse, data: [] },
    deleteGrantResponse: baseResponse,
    addGrantResponse: baseResponse,
    clusterHibernating: false,
    isReadOnly: false,
  };

  beforeEach(() => {
    wrapper = shallow(<NetworkSelfServiceSection {...props} />);
  });
  afterEach(() => {
    getRoles.mockClear();
    getGrants.mockClear();
    deleteGrant.mockClear();
    openAddGrantModal.mockClear();
    addNotification.mockClear();
  });

  it.skip('is accessible with no data', async () => {
    // This test throws an Async callback was not invoked within the 5000 ms timeout specified by jest.setTimeout.Timeout
    // error when trying to check accessibility

    const { container } = render(<NetworkSelfServiceSection {...props} />);
    await checkAccessibility(container);
  });

  it('should call getGrants and getRoles on mount', () => {
    expect(getRoles).toBeCalled();
    expect(getGrants).toBeCalled();
  });

  it('should open modal when needed', () => {
    wrapper.find('.access-control-add').simulate('click');
    expect(setTimeout).toBeCalledTimes(1);
    jest.runAllTimers();
    expect(openAddGrantModal).toBeCalled();
  });

  it('should call getGrants() when a grant is added', () => {
    wrapper.setProps({ addGrantResponse: { ...baseResponse, pending: true } });
    wrapper.setProps({ addGrantResponse: { ...baseResponse, fulfilled: true } });
    expect(getGrants).toHaveBeenCalledTimes(2); // one on mount, one on refresh
  });

  it('should call getGrants() when a grant is removed', () => {
    wrapper.setProps({ deleteGrantResponse: { ...baseResponse, pending: true } });
    wrapper.setProps({ deleteGrantResponse: { ...baseResponse, fulfilled: true } });
    expect(getGrants).toHaveBeenCalledTimes(2); // one on mount, one now
  });

  it('should render skeleton when pending and no grants are set', () => {
    const newProps = { ...props, grants: { ...baseResponse, pending: true, data: [] } };
    const { container } = render(<NetworkSelfServiceSection {...newProps} />);
    expect(container.querySelectorAll('.pf-v5-c-skeleton').length).toBeGreaterThan(0);
  });

  it('is accessible with grants', () => {
    const newProps = {
      ...props,
      grants: {
        ...baseResponse,
        fulfilled: true,
        data: fakeGrants,
      },
    };
    render(<NetworkSelfServiceSection {...newProps} />);
    expect(screen.getByRole('cell', { name: 'fake-arn' })).toBeInTheDocument();
    expect(screen.getByRole('cell', { name: 'fake-arn2' })).toBeInTheDocument();
  });

  it('should notify when a grant fails', () => {
    wrapper.setProps({ grants: { ...baseResponse, pending: true, data: fakeGrants } });
    wrapper.setProps({
      grants: {
        ...baseResponse,
        fulfilled: true,
        data: [
          {
            ...fakeGrants[0],
            state: 'failed',
            state_description: 'some failure',
          },
          fakeGrants[1],
        ],
      },
    });
    expect(addNotification).toBeCalledWith({
      variant: 'danger',
      title: 'Role creation failed for fake-arn',
      description: 'some failure',
      dismissDelay: 8000,
      dismissable: false,
    });
  });
  it('should notify when a grant succeeds', () => {
    wrapper.setProps({ grants: { ...baseResponse, pending: true, data: fakeGrants } });
    wrapper.setProps({
      grants: {
        ...baseResponse,
        fulfilled: true,
        data: [
          fakeGrants[0],
          {
            ...fakeGrants[1],
            state: 'ready',
          },
        ],
      },
    });
    expect(addNotification).toBeCalledWith({
      variant: 'success',
      title: 'Read Only role successfully created for fake-arn2',
      dismissDelay: 8000,
      dismissable: false,
    });
  });

  it('should disable add button when canEdit is false', () => {
    wrapper = shallow(
      <NetworkSelfServiceSection
        canEdit={false}
        getRoles={getRoles}
        getGrants={getGrants}
        deleteGrant={deleteGrant}
        openAddGrantModal={openAddGrantModal}
        addNotification={addNotification}
        grants={{ ...baseResponse, fulfilled: true, data: fakeGrants }}
        deleteGrantResponse={baseResponse}
        addGrantResponse={baseResponse}
        clusterHibernating={false}
        isReadOnly={false}
      />,
    );
    expect(wrapper.find('.access-control-add').props().disableReason).toBeTruthy();
  });

  it('should disable add button when hibernating', () => {
    wrapper = shallow(
      <NetworkSelfServiceSection
        canEdit
        getRoles={getRoles}
        getGrants={getGrants}
        deleteGrant={deleteGrant}
        openAddGrantModal={openAddGrantModal}
        addNotification={addNotification}
        grants={{ ...baseResponse, fulfilled: true, data: fakeGrants }}
        deleteGrantResponse={baseResponse}
        addGrantResponse={baseResponse}
        clusterHibernating
        isReadOnly={false}
      />,
    );
    expect(wrapper.find('.access-control-add').props().disableReason).toBeTruthy();
  });

  it('should disable add button when read_only', () => {
    wrapper = shallow(
      <NetworkSelfServiceSection
        canEdit
        getRoles={getRoles}
        getGrants={getGrants}
        deleteGrant={deleteGrant}
        openAddGrantModal={openAddGrantModal}
        addNotification={addNotification}
        grants={{ ...baseResponse, fulfilled: true, data: fakeGrants }}
        deleteGrantResponse={baseResponse}
        addGrantResponse={baseResponse}
        clusterHibernating={false}
        isReadOnly
      />,
    );
    expect(wrapper.find('.access-control-add').props().disableReason).toBeTruthy();
  });
});
