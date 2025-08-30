import React from 'react';
import { Button } from '@components/UI';
import { AlertTriangle, Trash2, X } from 'lucide-react';
import { Workflow } from '@interfaces/workflow.interface';

interface DeleteWorkflowModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  workflow: Workflow | null;
  loading?: boolean;
}

const DeleteWorkflowModal: React.FC<DeleteWorkflowModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  workflow,
  loading = false
}) => {
  if (!isOpen || !workflow) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md mx-4 shadow-xl">
        <div className="flex items-center mb-4">
          <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center mr-3">
            <AlertTriangle className="w-6 h-6 text-red-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Delete Workflow</h3>
            <p className="text-sm text-gray-600">This action cannot be undone</p>
          </div>
          <button
            onClick={onClose}
            className="ml-auto p-1 hover:bg-gray-200 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="mb-6">
          <p className="text-gray-700 mb-2">
            Are you sure you want to delete the workflow <strong>"{workflow.name}"</strong>?
          </p>
          <p className="text-sm text-gray-600">
            This will permanently remove the workflow and all its configurations. 
            Any active executions will be stopped.
          </p>
        </div>

        <div className="flex justify-end space-x-3">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            loading={loading}
            leftIcon={<Trash2 className="h-4 w-4" />}
          >
            Delete Workflow
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DeleteWorkflowModal;
