import React from 'react';
import { Button } from '@components/UI';
import { RefreshCw, Play } from 'lucide-react';

interface HeaderProps {
  className?: string;
}

const Header: React.FC<HeaderProps> = ({ className = '' }) => {
  return (
    <div className={`flex flex-col sm:flex-row sm:items-center sm:justify-between ${className}`}>
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Message Queue</h1>
        <p className="mt-1 text-sm text-gray-600">
          Monitor and manage message processing queue
        </p>
      </div>
      <div className="flex gap-2 mt-4 sm:mt-0">
        <Button variant="outline" leftIcon={<RefreshCw className="h-4 w-4" />}>
          Refresh
        </Button>
        <Button leftIcon={<Play className="h-4 w-4" />}>
          Process All
        </Button>
      </div>
    </div>
  );
};

export default Header;
