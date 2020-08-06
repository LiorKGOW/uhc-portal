import React from 'react';
import { shallow } from 'enzyme';

import { InstallBareMetalUPI } from './InstallBareMetalUPI';

describe('BareMetal UPI install', () => {
  it('renders correctly', () => {
    const wrapper = shallow(<InstallBareMetalUPI dispatch={() => {}} />);
    expect(wrapper).toMatchSnapshot();
  });
});
