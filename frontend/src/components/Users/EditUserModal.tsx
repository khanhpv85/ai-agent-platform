import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, Button, Input, Select } from '@components/UI';
import { User, Mail, Shield, X } from 'lucide-react';
import { User as UserType } from '@interfaces/auth.interface';

interface EditUserModalProps {
  isOpen: boolean;
  user: UserType | null;
  onClose: () => void;
  onSubmit: (id: string, userData: any) => void;
  loading?: boolean;
}

const EditUserModal: React.FC<EditUserModalProps> = ({
  isOpen,
  user,
  onClose,
  onSubmit,
  loading = false,
}) => {
  const [formData, setFormData] = useState({
    email: '',
    first_name: '',
    last_name: '',
    role: 'user',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const roleOptions = [
    { value: 'user', label: 'User' },
    { value: 'manager', label: 'Manager' },
    { value: 'admin', label: 'Admin' },
  ];

  // Update form data when user changes
  useEffect(() => {
    if (user) {
      setFormData({
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        role: user.role,
      });
      setErrors({});
    }
  }, [user]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.first_name) {
      newErrors.first_name = 'First name is required';
    }

    if (!formData.last_name) {
      newErrors.last_name = 'Last name is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm() && user) {
      onSubmit(user.id, formData);
    }
  };

  const handleClose = () => {
    setErrors({});
    onClose();
  };

  if (!user) return null;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-1 bg-primary-100 rounded">
              <User className="h-5 w-5" />
            </div>
            <CardTitle>Edit User</CardTitle>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClose}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="First Name"
            type="text"
            value={formData.first_name}
            onChange={(e) => handleInputChange('first_name', e.target.value)}
            error={errors.first_name}
            required
          />
          
          <Input
            label="Last Name"
            type="text"
            value={formData.last_name}
            onChange={(e) => handleInputChange('last_name', e.target.value)}
            error={errors.last_name}
            required
          />
        </div>

        <Input
          label="Email"
          type="email"
          value={formData.email}
          onChange={(e) => handleInputChange('email', e.target.value)}
          error={errors.email}
          leftIcon={<Mail className="h-4 w-4" />}
          required
        />

        <Select
          label="Role"
          value={formData.role}
          onChange={(e) => handleInputChange('role', e.target.value)}
          options={roleOptions}
          leftIcon={<Shield className="h-4 w-4" />}
        />

        <div className="flex justify-end gap-3 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            loading={loading}
          >
            Update User
          </Button>
        </div>
      </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default EditUserModal;
