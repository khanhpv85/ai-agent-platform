import React from 'react';
import { Card, CardContent } from '@components/UI';
import { Search, Filter } from 'lucide-react';

interface FiltersProps {
  searchTerm: string;
  statusFilter: string;
  agentTypeFilter: string;
  onSearchChange: (value: string) => void;
  onStatusChange: (value: string) => void;
  onAgentTypeChange: (value: string) => void;
  className?: string;
}

const Filters: React.FC<FiltersProps> = ({ 
  searchTerm, 
  statusFilter,
  agentTypeFilter,
  onSearchChange, 
  onStatusChange,
  onAgentTypeChange,
  className = '' 
}) => {
  return (
    <Card className={className}>
      <CardContent className="p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search agents..."
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => onStatusChange(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="draft">Draft</option>
            </select>
            <select
              value={agentTypeFilter}
              onChange={(e) => onAgentTypeChange(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="all">All Types</option>
              <option value="workflow">Workflow</option>
              <option value="chatbot">Chatbot</option>
              <option value="assistant">Assistant</option>
            </select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default Filters;
