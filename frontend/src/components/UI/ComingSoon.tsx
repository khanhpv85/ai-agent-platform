import React from 'react';

interface ComingSoonProps {
  title?: string;
  description?: string;
  featureDescription?: string;
  icon?: React.ReactNode;
}

const ComingSoon: React.FC<ComingSoonProps> = ({
  title = "Coming Soon",
  description = "This page is under development. Functionality will be available soon.",
  featureDescription = "This feature is currently being developed. You'll be able to access it here soon.",
  icon
}) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">{title}</h1>
        <p className="text-lg text-gray-600 mb-8">
          {description}
        </p>
        <div className="bg-white rounded-lg shadow-md p-8 max-w-md mx-auto">
          <div className="text-gray-500 mb-4">
            {icon || (
              <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )}
          </div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Coming Soon</h2>
          <p className="text-gray-600">
            {featureDescription}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ComingSoon;
