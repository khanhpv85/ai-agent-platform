import React from 'react';
import { Card, CardContent, Button } from '@components/UI';
import { Bot, Plus } from 'lucide-react';

interface EmptyStateProps {
  searchTerm: string;
  statusFilter: string;
  agentTypeFilter: string;
  className?: string;
  onCreateClick?: () => void;
}

const EmptyState: React.FC<EmptyStateProps> = ({ 
  searchTerm, 
  statusFilter, 
  agentTypeFilter,
  className = '',
  onCreateClick
}) => {
  const hasFilters = searchTerm || statusFilter !== 'all' || agentTypeFilter !== 'all';

  return (
    <Card className={className}>
      <CardContent className="text-center py-12">
        <Bot className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">No agents found</h3>
        <p className="mt-1 text-sm text-gray-500">
          {hasFilters 
            ? 'Try adjusting your search or filter criteria.'
            : 'Get started by creating your first AI agent.'
          }
        </p>
        {!hasFilters && onCreateClick && (
          <Button 
            className="mt-4" 
            leftIcon={<Plus className="h-4 w-4" />}
            onClick={onCreateClick}
          >
            Create Agent
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default EmptyState;
