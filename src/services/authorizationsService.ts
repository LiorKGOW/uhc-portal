import apiRequest from '~/services/apiRequest';
import type {
  AccessReviewResponse,
  FeatureReviewResponse,
  SelfAccessReview,
  SelfResourceReview,
  SelfResourceReviewRequest,
  SelfTermsReview,
  TermsReviewResponse,
} from '~/types/accounts_mgmt.v1';

const selfResourceReview = (params: SelfResourceReviewRequest) =>
  apiRequest.post<SelfResourceReview>('/api/authorizations/v1/self_resource_review', params);

const selfAccessReview = (params: SelfAccessReview) =>
  apiRequest.post<AccessReviewResponse>('/api/authorizations/v1/self_access_review', params);

const selfTermsReview = (params?: SelfTermsReview) =>
  apiRequest.post<TermsReviewResponse>('/api/authorizations/v1/self_terms_review', params);

const selfFeatureReview = (featureID: string) =>
  apiRequest.post<FeatureReviewResponse>('/api/authorizations/v1/self_feature_review', {
    feature: featureID,
  });

const authorizationsService = {
  selfResourceReview,
  selfAccessReview,
  selfTermsReview,
  selfFeatureReview,
};

export default authorizationsService;
