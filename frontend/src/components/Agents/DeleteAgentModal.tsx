import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, Button } from '@components/UI';
import { Agent } from '@interfaces/agent.interface';
import { AlertTriangle } from 'lucide-react';

interface DeleteAgentModalProps {
  isOpen: boolean;
  agent: Agent | null;
  onClose: () => void;
  onConfirm: (id: string) => void;
  loading?: boolean;
}

const DeleteAgentModal: React.FC<DeleteAgentModalProps> = ({
  isOpen,
  agent,
  onClose,
  onConfirm,
  loading = false
}) => {
  if (!isOpen || !agent) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <AlertTriangle className="h-5 w-5 text-red-600" />
            </div>
            <CardTitle>Delete Agent</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 mb-4">
            Are you sure you want to delete <strong>"{agent.name}"</strong>? 
            This action cannot be undone and will permanently remove the agent and all its data.
          </p>
          
          <div className="bg-gray-50 p-3 rounded-md mb-4">
            <p className="text-sm text-gray-600">
              <strong>Agent Details:</strong>
            </p>
            <p className="text-sm text-gray-600">Type: {agent.agent_type}</p>
            <p className="text-sm text-gray-600">Status: {agent.status}</p>
            {agent.description && (
              <p className="text-sm text-gray-600">Description: {agent.description}</p>
            )}
          </div>
          
          <div className="flex gap-2">
            <Button
              onClick={() => onConfirm(agent.id)}
              className="bg-red-600 hover:bg-red-700"
              loading={loading}
            >
              Delete Agent
            </Button>
            <Button
              variant="outline"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DeleteAgentModal;
