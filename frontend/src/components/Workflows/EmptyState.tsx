import React from 'react';
import { Card, CardContent, Button } from '@components/UI';
import { Workflow, Plus } from 'lucide-react';

interface EmptyStateProps {
  searchTerm: string;
  statusFilter: string;
  className?: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({ searchTerm, statusFilter, className = '' }) => {
  const hasFilters = searchTerm || statusFilter !== 'all';

  return (
    <Card className={className}>
      <CardContent className="text-center py-12">
        <Workflow className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">No workflows found</h3>
        <p className="mt-1 text-sm text-gray-500">
          {hasFilters 
            ? 'Try adjusting your search or filter criteria.'
            : 'Get started by creating your first automation workflow.'
          }
        </p>
        {!hasFilters && (
          <Button className="mt-4" leftIcon={<Plus className="h-4 w-4" />}>
            Create Workflow
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default EmptyState;
