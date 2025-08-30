import React from 'react';
import { Users, Plus, CheckCircle, XCircle, Trash2, Building } from 'lucide-react';
import { Button } from '@components/UI';

interface HeaderProps {
  onCreate: () => void;
  onAddToCompany: () => void;
  totalUsers: number;
  filteredUsers: number;
  selectedUsers: number;
  showBulkActions: boolean;
  onBulkActivate: () => void;
  onBulkDeactivate: () => void;
  onBulkDelete: () => void;
  activeUsers: number;
  verifiedUsers: number;
  adminUsers: number;
}

const Header: React.FC<HeaderProps> = ({
  onCreate,
  onAddToCompany,
  totalUsers,
  filteredUsers,
  selectedUsers,
  showBulkActions,
  onBulkActivate,
  onBulkDeactivate,
  onBulkDelete,
  activeUsers,
  verifiedUsers,
  adminUsers,
}) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Users className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Users</h1>
            <p className="text-sm text-gray-600">
              Manage users and their permissions
              {totalUsers !== filteredUsers && (
                <span className="ml-2 text-blue-600">
                  ({filteredUsers} of {totalUsers} shown)
                </span>
              )}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {showBulkActions && (
            <div className="flex items-center gap-2 mr-4 p-2 bg-blue-50 rounded-lg border border-blue-200">
              <span className="text-sm font-medium text-blue-700">
                {selectedUsers} selected
              </span>
              <div className="flex items-center gap-1">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={onBulkActivate}
                  className="h-8 px-3 text-green-600 border-green-200 hover:bg-green-50"
                >
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Activate
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={onBulkDeactivate}
                  className="h-8 px-3 text-orange-600 border-orange-200 hover:bg-orange-50"
                >
                  <XCircle className="h-4 w-4 mr-1" />
                  Deactivate
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={onBulkDelete}
                  className="h-8 px-3 text-red-600 border-red-200 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Delete
                </Button>
              </div>
            </div>
          )}
          
          <Button onClick={onAddToCompany} variant="outline" className="flex items-center gap-2">
            <Building className="h-4 w-4" />
            Add to Company
          </Button>
          <Button onClick={onCreate} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add User
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-gray-200">
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-900">{totalUsers}</div>
          <div className="text-sm text-gray-600">Total Users</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">
            {totalUsers > 0 ? Math.round((activeUsers / totalUsers) * 100) : 0}%
          </div>
          <div className="text-sm text-gray-600">Active</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600">
            {totalUsers > 0 ? Math.round((verifiedUsers / totalUsers) * 100) : 0}%
          </div>
          <div className="text-sm text-gray-600">Verified</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-purple-600">
            {adminUsers}
          </div>
          <div className="text-sm text-gray-600">Admins</div>
        </div>
      </div>
    </div>
  );
};

export default Header;
