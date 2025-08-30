import React from 'react';
import { Button } from '@components/UI';
import { Building, AlertTriangle, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@router/constants';

interface NoDefaultCompanyWarningProps {
  title?: string;
  message?: string;
  showActionButton?: boolean;
}

const NoDefaultCompanyWarning: React.FC<NoDefaultCompanyWarningProps> = ({
  title = 'No Default Company Set',
  message = 'You need to set a default company to access this feature. Please go to the Companies page and set a default company.',
  showActionButton = true
}) => {
  const navigate = useNavigate();

  const handleGoToCompanies = () => {
    navigate(ROUTES.COMPANIES);
  };

  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="text-center max-w-md mx-auto p-6">
        <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertTriangle className="h-8 w-8 text-yellow-600" />
        </div>
        
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          {title}
        </h3>
        
        <p className="text-gray-600 mb-6">
          {message}
        </p>
        
        {showActionButton && (
          <Button
            onClick={handleGoToCompanies}
            leftIcon={<Building className="h-4 w-4" />}
            rightIcon={<ArrowRight className="h-4 w-4" />}
            className="mx-auto"
          >
            Go to Companies
          </Button>
        )}
      </div>
    </div>
  );
};

export default NoDefaultCompanyWarning;
