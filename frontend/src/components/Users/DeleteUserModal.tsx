import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, Button } from '@components/UI';
import { User, AlertTriangle, X } from 'lucide-react';
import { User as UserType } from '@interfaces/auth.interface';

interface DeleteUserModalProps {
  isOpen: boolean;
  user: UserType | null;
  onClose: () => void;
  onConfirm: (id: string) => void;
  loading?: boolean;
}

const DeleteUserModal: React.FC<DeleteUserModalProps> = ({
  isOpen,
  user,
  onClose,
  onConfirm,
  loading = false,
}) => {
  const handleConfirm = () => {
    if (user) {
      onConfirm(user.id);
    }
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
            <CardTitle>Delete User</CardTitle>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
      <div className="space-y-4">
        <div className="flex items-center gap-3 p-4 bg-red-50 rounded-lg">
          <AlertTriangle className="h-5 w-5 text-red-600" />
          <div>
            <h4 className="font-medium text-red-900">Warning</h4>
            <p className="text-sm text-red-700">
              This action cannot be undone. The user will be permanently deleted.
            </p>
          </div>
        </div>

        <div className="text-center">
          <p className="text-gray-600 mb-4">
            Are you sure you want to delete{' '}
            <span className="font-semibold text-gray-900">
              {user.first_name} {user.last_name}
            </span>
            ?
          </p>
          
          <div className="bg-gray-50 p-3 rounded-lg">
            <p className="text-sm text-gray-600">
              <strong>Email:</strong> {user.email}
            </p>
            <p className="text-sm text-gray-600">
              <strong>Role:</strong> {user.role}
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="danger"
            onClick={handleConfirm}
            loading={loading}
          >
            Delete User
          </Button>
        </div>
      </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DeleteUserModal;
