import { connect } from 'react-redux';

import type { GlobalState } from '~/redux/store';

import { CloudRegionSelectField } from './CloudRegionSelectField';
import { checkRegion } from './validRegions';

type OwnProps = {
  cloudProviderID: string;
  isBYOC: boolean;
  isMultiAz: boolean;
  isHypershiftSelected?: boolean;
};

const mapStateToProps = (state: GlobalState, ownProps: OwnProps) => {
  const { cloudProviders } = state;
  const regions = cloudProviders.providers?.[ownProps.cloudProviderID]?.regions || {};

  return {
    cloudProviders,
    regions: Object.values(regions).map((region) => checkRegion(region, ownProps)),
  };
};

export default connect<ReturnType<typeof mapStateToProps>, {}, OwnProps, GlobalState>(
  mapStateToProps,
)(CloudRegionSelectField);
