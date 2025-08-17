import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@store';
import { changePassword } from '@services';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, Button, Input, Badge } from '@components/UI';
import { Save, Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

interface SecurityTabProps {
  className?: string;
}

const SecurityTab: React.FC<SecurityTabProps> = ({ className = '' }) => {
  const dispatch = useDispatch();
  const { loading, error } = useSelector((state: RootState) => state.auth);
  
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // Track form changes
  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    setIsDirty(true);
    
    // Clear errors when user starts typing
    if (apiError) {
      setApiError(null);
    }
    if (fieldErrors[field]) {
      setFieldErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isDirty) {
      toast.error('No changes to save');
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    if (formData.newPassword.length < 8) {
      toast.error('New password must be at least 8 characters long');
      return;
    }

    setIsSubmitting(true);
    setApiError(null);
    setFieldErrors({});
    
    const result = await dispatch(changePassword({
      current_password: formData.currentPassword,
      new_password: formData.newPassword,
    }) as any);
    if (result.meta.requestStatus === 'fulfilled') {
      // Check if fulfilled but still has error or unsuccessful status
      if (result.payload?.error || result.payload?.statusCode !== 200) {
        const errorMessage = result.payload?.message || result.payload?.error || 'Failed to change password';
        setApiError(errorMessage);
        toast.error(errorMessage);
      } else {
        // Reset form on success
        setFormData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        });
        setIsDirty(false);
        toast.success('Password changed successfully!');
      }
    } else if (result.meta.requestStatus === 'rejected') {
      // Handle error from rejected action
      console.error('Password change error:', result);
      
      const errorMessage = result.payload || result.error?.message || 'Failed to change password';
      
      // Check for specific error messages and map them to fields
      if (errorMessage.toLowerCase().includes('current password') || 
          errorMessage.toLowerCase().includes('incorrect password')) {
        setFieldErrors({
          currentPassword: 'Current password is incorrect'
        });
        setApiError('Please check your current password and try again.');
      } else if (errorMessage.toLowerCase().includes('new password') ||
                 errorMessage.toLowerCase().includes('password requirements')) {
        setFieldErrors({
          newPassword: 'New password does not meet requirements'
        });
        setApiError('Please ensure your new password meets the security requirements.');
      } else {
        setApiError(errorMessage);
      }
      
      toast.error(errorMessage);
    }
    
    setIsSubmitting(false);
  };

  const isFormValid = formData.currentPassword.trim() && 
                     formData.newPassword.trim() && 
                     formData.confirmPassword.trim() &&
                     formData.newPassword === formData.confirmPassword &&
                     formData.newPassword.length >= 8;

  return (
    <div className={`space-y-6 ${className}`}>
      <Card>
        <CardHeader>
          <CardTitle>Change Password</CardTitle>
          <CardDescription>
            Update your password to keep your account secure
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Current Password"
              type={showPassword ? 'text' : 'password'}
              value={formData.currentPassword}
              onChange={(e) => handleInputChange('currentPassword', e.target.value)}
              placeholder="Enter current password"
              required
              disabled={isSubmitting}
              error={fieldErrors.currentPassword}
              rightIcon={
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              }
            />
            <Input
              label="New Password"
              type={showNewPassword ? 'text' : 'password'}
              value={formData.newPassword}
              onChange={(e) => handleInputChange('newPassword', e.target.value)}
              placeholder="Enter new password"
              required
              disabled={isSubmitting}
              helperText="Must be at least 8 characters"
              error={fieldErrors.newPassword}
              rightIcon={
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              }
            />
            <Input
              label="Confirm New Password"
              type={showConfirmPassword ? 'text' : 'password'}
              value={formData.confirmPassword}
              onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
              placeholder="Confirm new password"
              required
              disabled={isSubmitting}
              error={formData.confirmPassword && formData.newPassword !== formData.confirmPassword ? 'Passwords do not match' : undefined}
              rightIcon={
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              }
            />

            {/* Status Messages */}
            {apiError && (
              <div className="flex items-start space-x-3 p-4 bg-red-50 border border-red-200 rounded-md">
                <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <h4 className="text-sm font-medium text-red-800 mb-1">Password Update Failed</h4>
                  <p className="text-sm text-red-700">{apiError}</p>
                </div>
              </div>
            )}

            {isDirty && !apiError && (
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
                {isSubmitting ? 'Updating...' : 'Update Password'}
              </Button>
              
              {!isDirty && !isSubmitting && (
                <div className="flex items-center space-x-2 text-green-600">
                  <CheckCircle className="h-4 w-4" />
                  <span className="text-sm">Password is secure</span>
                </div>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Two-Factor Authentication</CardTitle>
          <CardDescription>
            Add an extra layer of security to your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900">2FA Status</p>
              <p className="text-sm text-gray-500">Currently disabled</p>
            </div>
            <Badge variant="error" icon={<AlertCircle className="h-3 w-3" />}>
              Disabled
            </Badge>
          </div>
          <Button variant="outline" className="mt-4">
            Enable 2FA
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default SecurityTab;
