import React from 'react';
import { Button } from '@components/UI';
import { Users, Plus } from 'lucide-react';

interface EmptyStateProps {
  searchTerm: string;
  roleFilter: string;
  statusFilter: string;
  onCreateClick: () => void;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  searchTerm,
  roleFilter,
  statusFilter,
  onCreateClick,
}) => {
  const hasFilters = searchTerm || roleFilter !== 'all' || statusFilter !== 'all';

  return (
    <div className="text-center py-12">
      <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
        <Users className="h-12 w-12 text-gray-400" />
      </div>
      
      <h3 className="text-lg font-medium text-gray-900 mb-2">
        {hasFilters ? 'No users found' : 'No users yet'}
      </h3>
      
      <p className="text-gray-600 mb-6 max-w-md mx-auto">
        {hasFilters 
          ? 'Try adjusting your search or filters to find what you\'re looking for.'
          : 'Get started by creating your first user. You can invite team members and manage their access.'
        }
      </p>
      
      <Button
        onClick={onCreateClick}
        leftIcon={<Plus className="h-4 w-4" />}
      >
        Add User
      </Button>
    </div>
  );
};

export default EmptyState;
