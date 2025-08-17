import React from 'react';
import ComingSoon from '@components/UI/ComingSoon';

const Companies: React.FC = () => {
  const companyIcon = (
    <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
    </svg>
  );

  return (
    <ComingSoon
      title="Companies"
      description="This page is under development. Companies functionality will be available soon."
      featureDescription="The companies management feature is currently being developed. You'll be able to manage your company settings and configurations here."
      icon={companyIcon}
    />
  );
};

export default Companies;
