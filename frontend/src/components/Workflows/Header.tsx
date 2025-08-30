import React from 'react';
import { Button } from '@components/UI';
import { Plus } from 'lucide-react';

interface HeaderProps {
  className?: string;
}

const Header: React.FC<HeaderProps> = ({ className = '' }) => {
  return (
    <div className={`flex flex-col sm:flex-row sm:items-center sm:justify-between ${className}`}>
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Workflows</h1>
        <p className="mt-1 text-sm text-gray-600">
          Manage your automation workflows and processes
        </p>
      </div>
      {/* <Button className="mt-4 sm:mt-0" leftIcon={<Plus className="h-4 w-4" />}>
        Create Workflow
      </Button> */}
    </div>
  );
};

export default Header;
