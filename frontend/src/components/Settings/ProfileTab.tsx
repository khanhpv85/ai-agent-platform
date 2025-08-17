import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, store } from '@store';
import { updateProfile } from '@services/auth.service';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, Button, Input, Select } from '@components/UI';
import { Save, CheckCircle, AlertCircle, User } from 'lucide-react';
import toast from 'react-hot-toast';
import { UserRole } from '@types';

interface ProfileTabProps {
  className?: string;
}

const ProfileTab: React.FC<ProfileTabProps> = ({ className = '' }) => {
  const dispatch = useDispatch();
  const { user, loading, error } = useSelector((state: RootState) => state.auth);
  
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    role: '',
    is_active: true,
    email_verified: false
  });
  
  const [isDirty, setIsDirty] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Dynamic role options generator from UserRole enum
  const generateRoleOptions = () => {
    return Object.values(UserRole).map((role) => ({
      value: role,
      label: role.charAt(0).toUpperCase() + role.slice(1), // Capitalize first letter
    }));
  };

  const roleOptions = generateRoleOptions();

  // Initialize form data from user state
  useEffect(() => {
    if (user) {
      setFormData({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        role: user.role || '',
        is_active: true, // Assuming user is active if they can access this
        email_verified: user.email_verified || false
      });
    }
  }, [user]);

  // Track form changes
  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    setIsDirty(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isDirty) {
      toast.error('No changes to save');
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Debug: Check if user is authenticated
      const state = store.getState();
      console.log('Auth state:', {
        isAuthenticated: state.auth.isAuthenticated,
        hasToken: !!state.auth.accessToken,
        token: state.auth.accessToken?.substring(0, 20) + '...'
      });
      
      await dispatch(updateProfile({
        first_name: formData.first_name,
        last_name: formData.last_name,
        role: formData.role,
        is_active: formData.is_active,
        email_verified: formData.email_verified
      }) as any);
      
      setIsDirty(false);
      toast.success('Profile updated successfully!');
    } catch (error: any) {
      console.error('Profile update error:', error);
      toast.error(error.message || 'Failed to update profile');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormValid = formData.first_name.trim() && 
                     formData.last_name.trim();

  return (
    <div className={`space-y-6 ${className}`}>
      <Card>
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
          <CardDescription>
            Update your personal details and contact information
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="First Name"
                placeholder="John"
                value={formData.first_name}
                onChange={(e) => handleInputChange('first_name', e.target.value)}
                required
                disabled={isSubmitting}
              />
              <Input
                label="Last Name"
                placeholder="Doe"
                value={formData.last_name}
                onChange={(e) => handleInputChange('last_name', e.target.value)}
                required
                disabled={isSubmitting}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select
                label="Role"
                value={formData.role}
                onChange={(value) => handleInputChange('role', value)}
                options={roleOptions}
                placeholder="Select a role"
                disabled={isSubmitting}
                leftIcon={<User className="h-4 w-4" />}
                helperText="Choose your role in the system"
              />
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="email_verified"
                  checked={formData.email_verified}
                  onChange={(e) => handleInputChange('email_verified', e.target.checked)}
                  disabled={isSubmitting}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <label htmlFor="email_verified" className="text-sm font-medium text-gray-700">
                  Email Verified
                </label>
              </div>
            </div>
            
            {/* Read-only email display */}
            <div className="bg-gray-50 p-3 rounded-md">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Address (Read-only)
              </label>
              <p className="text-gray-900">{user?.email}</p>
              <p className="text-xs text-gray-500 mt-1">
                Email address cannot be changed through this form
              </p>
            </div>

            {/* Status Messages */}
            {error && (
              <div className="flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-md">
                <AlertCircle className="h-5 w-5 text-red-500" />
                <span className="text-red-700 text-sm">{error}</span>
              </div>
            )}

            {isDirty && !error && (
              <div className="flex items-center space-x-2 p-3 bg-blue-50 border border-blue-200 rounded-md">
                <AlertCircle className="h-5 w-5 text-blue-500" />
                <span className="text-blue-700 text-sm">You have unsaved changes</span>
              </div>
            )}

            <div className="flex items-center justify-between pt-4">
              <Button
                type="submit"
                leftIcon={isSubmitting ? undefined : <Save className="h-4 w-4" />}
                disabled={!isFormValid || !isDirty || isSubmitting}
                loading={isSubmitting}
                className="bg-primary-600 hover:bg-primary-700"
              >
                {isSubmitting ? 'Saving...' : 'Save Changes'}
              </Button>
              
              {!isDirty && !isSubmitting && (
                <div className="flex items-center space-x-2 text-green-600">
                  <CheckCircle className="h-4 w-4" />
                  <span className="text-sm">All changes saved</span>
                </div>
              )}
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfileTab;
