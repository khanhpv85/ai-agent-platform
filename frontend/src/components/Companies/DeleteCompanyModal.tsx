import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, Button } from '@components/UI';
import { CompanyData } from '@interfaces/company.interface';

interface DeleteCompanyModalProps {
  isOpen: boolean;
  company: CompanyData | null;
  onConfirm: () => void;
  onCancel: () => void;
}

const DeleteCompanyModal: React.FC<DeleteCompanyModalProps> = ({
  isOpen,
  company,
  onConfirm,
  onCancel
}) => {
  if (!isOpen || !company) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Delete Company</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 mb-4">
            Are you sure you want to delete "{company.name}"? This action cannot be undone.
          </p>
          <div className="flex gap-2">
            <Button
              onClick={onConfirm}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </Button>
            <Button
              variant="outline"
              onClick={onCancel}
            >
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DeleteCompanyModal;
