import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, Button, Input } from '@components/UI';
import { Agent } from '@interfaces/agent.interface';

interface CreateAgentModalProps {
  isOpen: boolean;
  companyId: string;
  onClose: () => void;
  onSubmit: (agentData: Partial<Agent>) => void;
  loading?: boolean;
}

const CreateAgentModal: React.FC<CreateAgentModalProps> = ({
  isOpen,
  companyId,
  onClose,
  onSubmit,
  loading = false
}) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    agent_type: 'workflow',
    status: 'draft'
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;
    
    onSubmit({
      ...formData,
      company_id: companyId
    });
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Create New Agent</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Agent Name"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="Enter agent name"
              required
            />
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Enter agent description"
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Agent Type
              </label>
              <select
                value={formData.agent_type}
                onChange={(e) => handleInputChange('agent_type', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="workflow">Workflow</option>
                <option value="chatbot">Chatbot</option>
                <option value="assistant">Assistant</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => handleInputChange('status', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="draft">Draft</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
            
            <div className="flex gap-2 pt-4">
              <Button 
                type="submit" 
                className="flex-1"
                loading={loading}
              >
                Create Agent
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={loading}
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default CreateAgentModal;
