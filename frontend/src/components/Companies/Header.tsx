import React from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@components/UI';

interface HeaderProps {
  onCreateClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ onCreateClick }) => {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Companies</h1>
        <p className="text-gray-600">Manage your companies and organizations</p>
      </div>
      <Button
        onClick={onCreateClick}
        leftIcon={<Plus className="h-4 w-4" />}
        className="bg-primary-600 hover:bg-primary-700"
      >
        Create Company
      </Button>
    </div>
  );
};

export default Header;
