import React, { useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-hot-toast';
import { 
  fetchUsers, 
  createUser, 
  updateUser, 
  deleteUser, 
  activateUser, 
  deactivateUser, 
  resendUserVerification, 
  resetUserPassword 
} from '@services/auth.service';
import { addUserToCompany, fetchUserCompanies } from '@services/company.service';
import { RootState } from '@store/store';
import { User } from '@interfaces/auth.interface';
import { 
  Header, 
  Filters, 
  UserTable, 
  EmptyState, 
  CreateUserModal, 
  EditUserModal, 
  DeleteUserModal,
  AddUserToCompanyModal
} from '@components/Users';
import { UserRole } from '../types/auth.types';

const Users: React.FC = () => {
  const dispatch = useDispatch();
  const { user: currentUser, users, loading, error, isAuthenticated } = useSelector((state: RootState) => state.auth);
  const { companies } = useSelector((state: RootState) => state.company);
  
  // Ensure users is always an array to prevent runtime errors
  const safeUsers = Array.isArray(users) ? users : [];
  
  // Debug logging
  if (!Array.isArray(users)) {
    console.warn('Users component: users prop is not an array:', users);
  }
  
  // Local state
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  
  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showAddToCompanyModal, setShowAddToCompanyModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  
  // Bulk operations
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [showBulkActions, setShowBulkActions] = useState(false);

  // Load all users when authenticated (only if not already loaded)
  useEffect(() => {
    // Only run when user is authenticated, has access token, and users haven't been loaded yet
    if (!isAuthenticated || !currentUser || safeUsers.length > 0) {
      return;
    }
    
    // Add a small delay to ensure authentication is fully initialized
    const timer = setTimeout(() => {
      console.log('🔍 Fetching users for authenticated user:', currentUser?.email);
      dispatch(fetchUsers());
    }, 100);
    
    return () => clearTimeout(timer);
  }, [dispatch, isAuthenticated, currentUser, safeUsers]);

  // Load companies when authenticated
  useEffect(() => {
    if (!isAuthenticated || !currentUser || companies.length > 0) {
      return;
    }
    
    const timer = setTimeout(() => {
      console.log('🏢 Fetching companies for authenticated user:', currentUser?.email);
      dispatch(fetchUserCompanies());
    }, 100);
    
    return () => clearTimeout(timer);
  }, [dispatch, isAuthenticated, currentUser, companies]);

  // Handle error display
  useEffect(() => {
    if (error) {
      // Check if it's an authentication error
      if (error.includes('401') || error.includes('Unauthorized') || error.includes('Authentication failed')) {
        console.log('🔐 Authentication error detected in Users page:', error);
        toast.error('Your session has expired. Please log in again.');
        // The HTTP client interceptor should handle the logout automatically
      } else {
        toast.error(error);
      }
    }
  }, [error]);

  // Filter users based on search and filters
  const filteredUsers = safeUsers.filter(user => {
    const matchesSearch = searchTerm === '' || 
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.last_name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'active' && user.is_active) ||
      (statusFilter === 'inactive' && !user.is_active) ||
      (statusFilter === 'verified' && user.email_verified) ||
      (statusFilter === 'unverified' && !user.email_verified);
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  // Handle user selection for bulk operations
  const handleUserSelection = (userId: string, isSelected: boolean) => {
    if (isSelected) {
      setSelectedUsers(prev => [...prev, userId]);
    } else {
      setSelectedUsers(prev => prev.filter(id => id !== userId));
    }
  };

  // Handle bulk selection
  const handleSelectAll = (isSelected: boolean) => {
    if (isSelected) {
      setSelectedUsers(filteredUsers.map(user => user.id));
    } else {
      setSelectedUsers([]);
    }
  };

  // Bulk operations
  const handleBulkActivate = async () => {
    try {
      await Promise.all(selectedUsers.map(userId => 
        dispatch(activateUser(userId))
      ));
      toast.success(`${selectedUsers.length} users activated successfully`);
      setSelectedUsers([]);
    } catch (error) {
      toast.error('Failed to activate users');
    }
  };

  const handleBulkDeactivate = async () => {
    try {
      await Promise.all(selectedUsers.map(userId => 
        dispatch(deactivateUser(userId))
      ));
      toast.success(`${selectedUsers.length} users deactivated successfully`);
      setSelectedUsers([]);
    } catch (error) {
      toast.error('Failed to deactivate users');
    }
  };

  const handleBulkDelete = async () => {
    try {
      await Promise.all(selectedUsers.map(userId => 
        dispatch(deleteUser(userId))
      ));
      toast.success(`${selectedUsers.length} users deleted successfully`);
      setSelectedUsers([]);
    } catch (error) {
      toast.error('Failed to delete users');
    }
  };

  // User action handlers
  const handleCreate = () => {
    setSelectedUser(null);
    setShowCreateModal(true);
  };

  const handleEdit = (user: User) => {
    setSelectedUser(user);
    setShowEditModal(true);
  };

  const handleDelete = (user: User) => {
    setSelectedUser(user);
    setShowDeleteModal(true);
  };

  const handleActivate = async (user: User) => {
    try {
      await dispatch(activateUser(user.id));
      toast.success('User activated successfully');
    } catch (error) {
      toast.error('Failed to activate user');
    }
  };

  const handleDeactivate = async (user: User) => {
    try {
      await dispatch(deactivateUser(user.id));
      toast.success('User deactivated successfully');
    } catch (error) {
      toast.error('Failed to deactivate user');
    }
  };

  const handleResendVerification = async (user: User) => {
    try {
      await dispatch(resendUserVerification(user.id));
      toast.success('Verification email sent successfully');
    } catch (error) {
      toast.error('Failed to send verification email');
    }
  };

  const handleResetPassword = async (user: User) => {
    try {
      await dispatch(resetUserPassword(user.id));
      toast.success('Password reset email sent successfully');
    } catch (error) {
      toast.error('Failed to send password reset email');
    }
  };

  const handleAddToCompany = (user?: User) => {
    if (user) {
      // If a specific user is provided, pre-select them in the modal
      setSelectedUser(user);
    }
    setShowAddToCompanyModal(true);
  };

  const handleAddUserToCompany = async (data: { userId: string; companyId: string; companyRole: string }) => {
    try {
      // Get the user data from the selected user
      const user = safeUsers.find(u => u.id === data.userId);
      if (!user) {
        throw new Error('User not found');
      }

      // Prepare user data for the API
      const userData = {
        email: user.email,
        password: 'temporary-password', // This will be changed by the user
        first_name: user.first_name,
        last_name: user.last_name,
        role: user.role,
        company_role: data.companyRole,
      };

      await dispatch(addUserToCompany({ companyId: data.companyId, userData }));
      toast.success('User added to company successfully');
    } catch (error) {
      toast.error('Failed to add user to company');
    }
  };

  // Close modals
  const closeModals = () => {
    setShowCreateModal(false);
    setShowEditModal(false);
    setShowDeleteModal(false);
    setShowAddToCompanyModal(false);
    setSelectedUser(null);
  };

  // Update bulk actions visibility
  useEffect(() => {
    setShowBulkActions(selectedUsers.length > 0);
  }, [selectedUsers]);

  // Check if user has permission to view users
  const canViewUsers = currentUser?.role === UserRole.ADMIN || currentUser?.role === UserRole.MANAGER;

  // Show loading while authentication is being checked
  if (!isAuthenticated || !currentUser) {
    return (
      <div className="w-full space-y-6">
        <div className="flex justify-center items-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-sm text-gray-500">Checking authentication...</p>
          </div>
        </div>
      </div>
    );
  }

  // Show permission error if user doesn't have access
  if (!canViewUsers) {
    return (
      <div className="w-full space-y-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                Access Denied
              </h3>
              <div className="mt-2 text-sm text-red-700">
                <p>You don't have permission to view the Users page. Only administrators and managers can access this feature.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6 overflow-x-hidden">
      <Header 
        onCreate={handleCreate}
        onAddToCompany={handleAddToCompany}
        totalUsers={safeUsers.length}
        filteredUsers={filteredUsers.length}
        selectedUsers={selectedUsers.length}
        showBulkActions={showBulkActions}
        onBulkActivate={handleBulkActivate}
        onBulkDeactivate={handleBulkDeactivate}
        onBulkDelete={handleBulkDelete}
        activeUsers={safeUsers.filter(u => u.is_active).length}
        verifiedUsers={safeUsers.filter(u => u.email_verified).length}
        adminUsers={safeUsers.filter(u => u.role === 'admin').length}
      />
      
      <Filters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        roleFilter={roleFilter}
        onRoleFilterChange={setRoleFilter}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        onSelectAll={handleSelectAll}
        isAllSelected={selectedUsers.length === filteredUsers.length && filteredUsers.length > 0}
        isIndeterminate={selectedUsers.length > 0 && selectedUsers.length < filteredUsers.length}
      />

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : filteredUsers.length === 0 ? (
        <EmptyState 
          searchTerm={searchTerm}
          roleFilter={roleFilter}
          statusFilter={statusFilter}
          onCreate={handleCreate}
        />
      ) : (
        <UserTable
          users={filteredUsers}
          currentUser={currentUser}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onActivate={handleActivate}
          onDeactivate={handleDeactivate}
          onResendVerification={handleResendVerification}
          onResetPassword={handleResetPassword}
          onAddToCompany={handleAddToCompany}
          selectedUsers={selectedUsers}
          onSelectionChange={handleUserSelection}
          onSelectAll={handleSelectAll}
          isAllSelected={selectedUsers.length === filteredUsers.length && filteredUsers.length > 0}
          isIndeterminate={selectedUsers.length > 0 && selectedUsers.length < filteredUsers.length}
        />
      )}

      {/* Modals */}
      {showCreateModal && (
        <CreateUserModal
          isOpen={showCreateModal}
          onClose={closeModals}
          onSubmit={async (userData) => {
            try {
              await dispatch(createUser(userData));
              toast.success('User created successfully');
              closeModals();
            } catch (error) {
              toast.error('Failed to create user');
            }
          }}
        />
      )}

      {showEditModal && selectedUser && (
        <EditUserModal
          isOpen={showEditModal}
          onClose={closeModals}
          user={selectedUser}
          onSubmit={async (userData) => {
            try {
              await dispatch(updateUser({ id: selectedUser.id, ...userData }));
              toast.success('User updated successfully');
              closeModals();
            } catch (error) {
              toast.error('Failed to update user');
            }
          }}
        />
      )}

      {showDeleteModal && selectedUser && (
        <DeleteUserModal
          isOpen={showDeleteModal}
          onClose={closeModals}
          user={selectedUser}
          onConfirm={async () => {
            try {
              await dispatch(deleteUser(selectedUser.id));
              toast.success('User deleted successfully');
              closeModals();
            } catch (error) {
              toast.error('Failed to delete user');
            }
          }}
        />
      )}

      {showAddToCompanyModal && (
        <AddUserToCompanyModal
          isOpen={showAddToCompanyModal}
          onClose={closeModals}
          onSubmit={handleAddUserToCompany}
          availableUsers={safeUsers}
          selectedUser={selectedUser}
        />
      )}
    </div>
  );
};

export default Users;
