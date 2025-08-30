import React from 'react';
import { Search, Filter, CheckSquare, Square } from 'lucide-react';
import { Input, Select } from '@components/UI';
import { UserRole } from '../../types/auth.types';

interface FiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  roleFilter: string;
  onRoleFilterChange: (value: string) => void;
  statusFilter: string;
  onStatusFilterChange: (value: string) => void;
  onSelectAll: (isSelected: boolean) => void;
  isAllSelected: boolean;
  isIndeterminate: boolean;
}

const Filters: React.FC<FiltersProps> = ({
  searchTerm,
  onSearchChange,
  roleFilter,
  onRoleFilterChange,
  statusFilter,
  onStatusFilterChange,
  onSelectAll,
  isAllSelected,
  isIndeterminate,
}) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4 flex-1">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Role Filter */}
          <Select
            value={roleFilter}
            onChange={onRoleFilterChange}
            options={[
              { value: 'all', label: 'All Roles' },
              { value: UserRole.ADMIN, label: 'Admin' },
              { value: UserRole.USER, label: 'User' },
              { value: UserRole.MANAGER, label: 'Manager' },
            ]}
            className="min-w-[140px]"
          />

          {/* Status Filter */}
          <Select
            value={statusFilter}
            onChange={onStatusFilterChange}
            options={[
              { value: 'all', label: 'All Status' },
              { value: 'active', label: 'Active' },
              { value: 'inactive', label: 'Inactive' },
              { value: 'verified', label: 'Verified' },
              { value: 'unverified', label: 'Unverified' },
            ]}
            className="min-w-[140px]"
          />
        </div>

        {/* Bulk Selection */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => onSelectAll(!isAllSelected)}
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
          >
            {isIndeterminate ? (
              <div className="w-4 h-4 border-2 border-blue-600 bg-blue-600 rounded flex items-center justify-center">
                <div className="w-2 h-0.5 bg-white"></div>
              </div>
            ) : isAllSelected ? (
              <CheckSquare className="h-4 w-4 text-blue-600" />
            ) : (
              <Square className="h-4 w-4 text-gray-400" />
            )}
            {isAllSelected ? 'Deselect All' : 'Select All'}
          </button>

          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Filter className="h-4 w-4" />
            <span>Filters</span>
          </div>
        </div>
      </div>

      {/* Active Filters Display */}
      {(searchTerm || roleFilter !== 'all' || statusFilter !== 'all') && (
        <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-200">
          <span className="text-sm font-medium text-gray-700">Active filters:</span>
          {searchTerm && (
            <span className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
              Search: "{searchTerm}"
              <button
                onClick={() => onSearchChange('')}
                className="ml-1 text-blue-600 hover:text-blue-800"
              >
                ×
              </button>
            </span>
          )}
          {roleFilter !== 'all' && (
            <span className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
              Role: {roleFilter}
              <button
                onClick={() => onRoleFilterChange('all')}
                className="ml-1 text-green-600 hover:text-green-800"
              >
                ×
              </button>
            </span>
          )}
          {statusFilter !== 'all' && (
            <span className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-purple-100 text-purple-800 rounded-full">
              Status: {statusFilter}
              <button
                onClick={() => onStatusFilterChange('all')}
                className="ml-1 text-purple-600 hover:text-purple-800"
              >
                ×
              </button>
            </span>
          )}
          <button
            onClick={() => {
              onSearchChange('');
              onRoleFilterChange('all');
              onStatusFilterChange('all');
            }}
            className="text-sm text-gray-500 hover:text-gray-700 underline"
          >
            Clear all
          </button>
        </div>
      )}
    </div>
  );
};

export default Filters;
