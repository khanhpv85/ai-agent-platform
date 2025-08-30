import React from 'react';
import { 
  Edit, 
  Trash2, 
  CheckCircle, 
  XCircle, 
  Mail, 
  Key, 
  User as UserIcon,
  Shield,
  ShieldCheck,
  ShieldX,
  CheckSquare,
  Square,
  MoreHorizontal,
  Building
} from 'lucide-react';
import { Button, Badge } from '@components/UI';
import { User } from '@interfaces/auth.interface';
import { UserRole } from '../../types/auth.types';

interface UserTableProps {
  users: User[];
  currentUser: User | null;
  onEdit: (user: User) => void;
  onDelete: (user: User) => void;
  onActivate: (user: User) => void;
  onDeactivate: (user: User) => void;
  onResendVerification: (user: User) => void;
  onResetPassword: (user: User) => void;
  onAddToCompany: (user: User) => void;
  selectedUsers: string[];
  onSelectionChange: (userId: string, isSelected: boolean) => void;
  onSelectAll: (isSelected: boolean) => void;
  isAllSelected: boolean;
  isIndeterminate: boolean;
}

const UserTable: React.FC<UserTableProps> = ({
  users,
  currentUser,
  onEdit,
  onDelete,
  onActivate,
  onDeactivate,
  onResendVerification,
  onResetPassword,
  onAddToCompany,
  selectedUsers,
  onSelectionChange,
  onSelectAll,
  isAllSelected,
  isIndeterminate,
}) => {
  // Ensure users is always an array
  const safeUsers = Array.isArray(users) ? users : [];
  const safeSelectedUsers = Array.isArray(selectedUsers) ? selectedUsers : [];
  
  // Debug logging
  if (!Array.isArray(users)) {
    console.warn('UserTable: users prop is not an array:', users);
  }
  const canManageUsers = currentUser?.role === UserRole.ADMIN;

  const getRoleColor = (role: string) => {
    switch (role) {
      case UserRole.ADMIN:
        return 'bg-red-100 text-red-800';
      case UserRole.MANAGER:
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (isActive: boolean, isVerified: boolean) => {
    if (!isActive) return 'bg-red-100 text-red-800';
    if (!isVerified) return 'bg-yellow-100 text-yellow-800';
    return 'bg-green-100 text-green-800';
  };

  const getStatusText = (isActive: boolean, isVerified: boolean) => {
    if (!isActive) return 'Inactive';
    if (!isVerified) return 'Unverified';
    return 'Active';
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6 overflow-hidden">
      {/* Debug info */}
      <div className="text-xs text-gray-500 mb-2">
        Table: 1000px min width | Users: {safeUsers.length} | Scroll to see all columns
      </div>
      
      {/* Force horizontal scroll with explicit width */}
      <div 
        className="overflow-x-auto" 
        style={{ 
          width: '100%', 
          maxWidth: '100%',
          overflowX: 'auto',
          overflowY: 'hidden'
        }}
      >
        <table 
          className="divide-y divide-gray-200" 
          style={{ 
            minWidth: '1000px',
            width: '100%',
            borderCollapse: 'collapse'
          }}
        >
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-3 sm:px-6 py-3 text-left whitespace-nowrap" style={{ minWidth: '50px' }}>
                <div className="flex items-center">
                  <button
                    onClick={() => onSelectAll(!isAllSelected)}
                    className="flex items-center"
                  >
                    {isAllSelected ? (
                      <CheckSquare className="h-4 w-4 text-blue-600" />
                    ) : isIndeterminate ? (
                      <div className="h-4 w-4 border-2 border-blue-600 bg-blue-600 rounded-sm flex items-center justify-center">
                        <div className="h-0.5 w-2 bg-white"></div>
                      </div>
                    ) : (
                      <Square className="h-4 w-4 text-gray-400" />
                    )}
                  </button>
                </div>
              </th>
              <th scope="col" className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap" style={{ minWidth: '200px' }}>
                User
              </th>
              <th scope="col" className="hidden md:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap" style={{ minWidth: '120px' }}>
                Role
              </th>
              <th scope="col" className="hidden sm:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap" style={{ minWidth: '120px' }}>
                Status
              </th>
              <th scope="col" className="hidden lg:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap" style={{ minWidth: '150px' }}>
                Email Verified
              </th>
              <th scope="col" className="hidden xl:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap" style={{ minWidth: '150px' }}>
                Last Login
              </th>
              <th scope="col" className="hidden xl:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap" style={{ minWidth: '150px' }}>
                Created
              </th>
              <th scope="col" className="px-3 sm:px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap" style={{ minWidth: '300px' }}>
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {safeUsers.map((user) => {
              const isCurrentUser = currentUser?.id === user.id;
              const canEdit = currentUser?.role === UserRole.ADMIN || isCurrentUser;
              const canDelete = currentUser?.role === UserRole.ADMIN && !isCurrentUser;
              const isSelected = safeSelectedUsers.includes(user.id);

              return (
                <tr 
                  key={user.id} 
                  className={`hover:bg-gray-50 transition-colors ${
                    isSelected ? 'bg-blue-50' : ''
                  }`}
                >
                  <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => onSelectionChange(user.id, !isSelected)}
                      className="flex items-center"
                    >
                      {isSelected ? (
                        <CheckSquare className="h-4 w-4 text-blue-600" />
                      ) : (
                        <Square className="h-4 w-4 text-gray-400" />
                      )}
                    </button>
                  </td>
                  
                  <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-8 w-8 sm:h-10 sm:w-10">
                        <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-gray-100 flex items-center justify-center">
                          <UserIcon className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600" />
                        </div>
                      </div>
                      <div className="ml-2 sm:ml-4 min-w-0 flex-1">
                        <div className="text-sm font-medium text-gray-900 truncate">
                          {user.first_name} {user.last_name}
                        </div>
                        <div className="text-sm text-gray-500 truncate">
                          {user.email}
                        </div>
                        {/* Show role and status on mobile */}
                        <div className="md:hidden flex items-center gap-2 mt-1">
                          <Badge className={getRoleColor(user.role)}>
                            {user.role}
                          </Badge>
                          <Badge className={getStatusColor(user.is_active, user.email_verified)}>
                            {getStatusText(user.is_active, user.email_verified)}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </td>
                  
                  <td className="hidden md:table-cell px-6 py-4 whitespace-nowrap">
                    <Badge className={getRoleColor(user.role)}>
                      {user.role}
                    </Badge>
                  </td>
                  
                  <td className="hidden sm:table-cell px-6 py-4 whitespace-nowrap">
                    <Badge className={getStatusColor(user.is_active, user.email_verified)}>
                      {getStatusText(user.is_active, user.email_verified)}
                    </Badge>
                  </td>
                  
                  <td className="hidden lg:table-cell px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {user.email_verified ? (
                        <ShieldCheck className="h-4 w-4 text-green-500" />
                      ) : (
                        <ShieldX className="h-4 w-4 text-yellow-500" />
                      )}
                      <span className="ml-2 text-sm text-gray-900">
                        {user.email_verified ? 'Verified' : 'Unverified'}
                      </span>
                    </div>
                  </td>
                  
                  <td className="hidden xl:table-cell px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatDate(user.last_login_at)}
                  </td>
                  
                  <td className="hidden xl:table-cell px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatDate(user.created_at)}
                  </td>
                  
                  <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-1 sm:space-x-2">
                      {canEdit && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onEdit(user)}
                          className="flex items-center gap-1"
                        >
                          <Edit className="h-3 w-3" />
                          <span className="hidden sm:inline">Edit</span>
                        </Button>
                      )}

                      {canManageUsers && !user.email_verified && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onResendVerification(user)}
                          className="flex items-center gap-1 text-blue-600 border-blue-200 hover:bg-blue-50"
                        >
                          <Mail className="h-3 w-3" />
                          <span className="hidden sm:inline">Resend</span>
                        </Button>
                      )}

                      {canManageUsers && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onResetPassword(user)}
                          className="flex items-center gap-1 text-orange-600 border-orange-200 hover:bg-orange-50"
                        >
                          <Key className="h-3 w-3" />
                          <span className="hidden sm:inline">Reset</span>
                        </Button>
                      )}

                      {canManageUsers && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onAddToCompany(user)}
                          className="flex items-center gap-1 text-green-600 border-green-200 hover:bg-green-50"
                        >
                          <Building className="h-3 w-3" />
                          <span className="hidden sm:inline">Add to Company</span>
                        </Button>
                      )}

                      {canManageUsers && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => user.is_active ? onDeactivate(user) : onActivate(user)}
                          className={`flex items-center gap-1 ${
                            user.is_active 
                              ? 'text-orange-600 border-orange-200 hover:bg-orange-50' 
                              : 'text-green-600 border-green-200 hover:bg-green-50'
                          }`}
                        >
                          {user.is_active ? (
                            <>
                              <XCircle className="h-3 w-3" />
                              <span className="hidden sm:inline">Deactivate</span>
                            </>
                          ) : (
                            <>
                              <CheckCircle className="h-3 w-3" />
                              <span className="hidden sm:inline">Activate</span>
                            </>
                          )}
                        </Button>
                      )}

                      {canDelete && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onDelete(user)}
                          className="flex items-center gap-1 text-red-600 border-red-200 hover:bg-red-50"
                        >
                          <Trash2 className="h-3 w-3" />
                          <span className="hidden sm:inline">Delete</span>
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      
      {safeUsers.length === 0 && (
        <div className="text-center py-12">
          <UserIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No users found</h3>
          <p className="mt-1 text-sm text-gray-500">
            Get started by creating a new user.
          </p>
        </div>
      )}

      {/* Scroll indicator for mobile */}
      <div className="md:hidden px-4 py-2 bg-gray-50 border-t border-gray-200 mt-4">
        <div className="flex items-center justify-center space-x-2">
          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16l-4-4m0 0l4-4m-4 4h18" />
          </svg>
          <p className="text-xs text-gray-500">
            Scroll horizontally to see more columns
          </p>
          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </div>
      </div>

      {/* Desktop scroll indicator */}
      <div className="hidden sm:block lg:hidden px-4 py-2 bg-gray-50 border-t border-gray-200 mt-4">
        <div className="flex items-center justify-center space-x-2">
          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16l-4-4m0 0l4-4m-4 4h18" />
          </svg>
          <p className="text-xs text-gray-500">
            Use horizontal scroll to see all columns
          </p>
          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </div>
      </div>
    </div>
  );
};

export default UserTable;
