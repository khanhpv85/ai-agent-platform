import React from 'react';
import { Search, Filter } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, Button, Input } from '@components/UI';

interface FilterData {
  search: string;
  subscription_plan: string;
  role: string;
}

interface FiltersProps {
  filters: FilterData;
  onFiltersChange: (filters: FilterData) => void;
  onClearFilters: () => void;
}

const Filters: React.FC<FiltersProps> = ({ filters, onFiltersChange, onClearFilters }) => {
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFiltersChange({ ...filters, search: e.target.value });
  };

  const handlePlanChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onFiltersChange({ ...filters, subscription_plan: e.target.value });
  };

  const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onFiltersChange({ ...filters, role: e.target.value });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Filter className="h-5 w-5" />
          Filters
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Input
            placeholder="Search companies..."
            value={filters.search}
            onChange={handleSearchChange}
            leftIcon={<Search className="h-4 w-4" />}
          />
          <select
            value={filters.subscription_plan}
            onChange={handlePlanChange}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="">All Plans</option>
            <option value="free">Free</option>
            <option value="pro">Pro</option>
            <option value="enterprise">Enterprise</option>
          </select>
          <select
            value={filters.role}
            onChange={handleRoleChange}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="">All Roles</option>
            <option value="owner">Owner</option>
            <option value="admin">Admin</option>
            <option value="member">Member</option>
          </select>
          <Button
            onClick={onClearFilters}
            variant="outline"
          >
            Clear Filters
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default Filters;
