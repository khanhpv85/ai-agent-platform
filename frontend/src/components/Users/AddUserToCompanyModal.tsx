import React, { useState, useEffect } from 'react';
import { X, User as UserIcon, Building, Shield } from 'lucide-react';
import { Card, Button, Input, Select } from '@components/UI';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import { CompanyData } from '../../interfaces/company.interface';
import { User } from '../../interfaces/auth.interface';

interface AddUserToCompanyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { userId: string; companyId: string; companyRole: string }) => Promise<void>;
  availableUsers: User[];
  selectedUser?: User | null;
}

const AddUserToCompanyModal: React.FC<AddUserToCompanyModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  availableUsers,
  selectedUser,
}) => {
  const { companies } = useSelector((state: RootState) => state.company);
  
  const [formData, setFormData] = useState({
    userId: selectedUser?.id || '',
    companyId: '',
    companyRole: 'member',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.userId) {
      newErrors.userId = 'User is required';
    }

    if (!formData.companyId) {
      newErrors.companyId = 'Company is required';
    }

    if (!formData.companyRole) {
      newErrors.companyRole = 'Company role is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      await onSubmit(formData);
      handleClose();
    } catch (error) {
      console.error('Error adding user to company:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormData({
      userId: selectedUser?.id || '',
      companyId: '',
      companyRole: 'member',
    });
    setErrors({});
    setIsSubmitting(false);
    onClose();
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Building className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Add User to Company</h2>
                <p className="text-sm text-gray-600">
                  Add an existing user to a company
                </p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* User Selection */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
                <UserIcon className="h-5 w-5" />
                Select User
              </h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  User *
                </label>
                <Select
                  value={formData.userId}
                  onChange={(value) => handleInputChange('userId', value)}
                  options={availableUsers.map(user => ({
                    value: user.id,
                    label: `${user.first_name} ${user.last_name} (${user.email})`,
                  }))}
                  placeholder="Select a user"
                  error={errors.userId}
                />
              </div>
            </div>

            {/* Company Selection */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
                <Building className="h-5 w-5" />
                Select Company
              </h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Company *
                </label>
                <Select
                  value={formData.companyId}
                  onChange={(value) => handleInputChange('companyId', value)}
                  options={companies.map(company => ({
                    value: company.id,
                    label: company.name,
                  }))}
                  placeholder="Select a company"
                  error={errors.companyId}
                />
              </div>
            </div>

            {/* Company Role */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Company Role
              </h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Role in Company
                </label>
                <Select
                  value={formData.companyRole}
                  onChange={(value) => handleInputChange('companyRole', value)}
                  options={[
                    { value: 'member', label: 'Member' },
                    { value: 'admin', label: 'Admin' },
                    { value: 'manager', label: 'Manager' },
                  ]}
                  placeholder="Select a role"
                  error={errors.companyRole}
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-6 border-t border-gray-200">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Adding...
                  </>
                ) : (
                  <>
                    <Building className="h-4 w-4" />
                    Add to Company
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </Card>
    </div>
  );
};

export default AddUserToCompanyModal;
