import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, Button, Input, Badge } from '@components/UI';
import { X, Plus, Settings, Bot } from 'lucide-react';
import { CreateWorkflowData } from '@interfaces/workflow.interface';
import { Agent } from '@interfaces/agent.interface';

interface CreateWorkflowModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (workflowData: CreateWorkflowData) => void;
  agents: Agent[];
  company_id: string;
  loading?: boolean;
}

const CreateWorkflowModal: React.FC<CreateWorkflowModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  agents = [],
  company_id,
  loading = false
}) => {
  const [formData, setFormData] = useState<CreateWorkflowData>({
    name: '',
    description: '',
    company_id: company_id,
    status: 'draft',
    steps: [],
    triggers: {}
  });

  const [errors, setErrors] = useState<{[key: string]: string}>({});

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setFormData({
        name: '',
        description: '',
        company_id: company_id,
        status: 'draft',
        steps: [],
        triggers: {}
      });
      setErrors({});
    }
  }, [isOpen, company_id]);

  const validateForm = (): boolean => {
    const newErrors: {[key: string]: string} = {};

    console.log('Validating form with data:', formData);

    if (!formData.name.trim()) {
      newErrors.name = 'Workflow name is required';
      console.log('Name validation failed');
    }

    if (!formData.company_id) {
      newErrors.company_id = 'Company ID is required';
      console.log('Company ID validation failed');
    }

    if (!formData.steps || formData.steps.length === 0) {
      newErrors.steps = 'At least one step is required';
      console.log('Steps validation failed - no steps');
    }

    // Validate that each step has an agent selected
    formData.steps.forEach((step, index) => {
      if (!step.agent_id) {
        newErrors[`step_${index}_agent`] = 'Please select an agent for this step';
        console.log(`Step ${index} agent validation failed`);
      }
    });

    console.log('Validation errors:', newErrors);
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('Form submitted with data:', formData);
    console.log('Current errors:', errors);
    
    if (validateForm()) {
      console.log('Form validation passed, calling onSubmit');
      onSubmit(formData);
    } else {
      console.log('Form validation failed');
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const addStep = () => {
    const newStep = {
      type: 'ai_reasoning',
      agent_id: '', // Add agent_id field
      config: { model: 'gpt-3.5-turbo' },
      order: formData.steps.length + 1,
      name: `Step ${formData.steps.length + 1}`
    };

    setFormData(prev => ({
      ...prev,
      steps: [...prev.steps, newStep]
    }));
  };

  const removeStep = (index: number) => {
    setFormData(prev => ({
      ...prev,
      steps: prev.steps.filter((_, i) => i !== index)
    }));
  };

  const updateStep = (index: number, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      steps: prev.steps.map((step, i) => 
        i === index ? { ...step, [field]: value } : step
      )
    }));

    // Clear step-specific error when user makes changes
    if (errors[`step_${index}_agent`]) {
      setErrors(prev => ({
        ...prev,
        [`step_${index}_agent`]: ''
      }));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
              <Settings className="w-6 h-6 text-primary-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Create New Workflow</h2>
              <p className="text-sm text-gray-600">Define your workflow steps and assign agents to each step</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Basic Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Workflow Name *
                </label>
                <Input
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Enter workflow name"
                  className={errors.name ? 'border-red-500' : ''}
                />
                {errors.name && (
                  <p className="text-red-500 text-sm mt-1">{errors.name}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => handleInputChange('status', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="draft">Draft</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Describe what this workflow does..."
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Workflow Steps */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Workflow Steps</h3>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addStep}
                leftIcon={<Plus className="h-4 w-4" />}
              >
                Add Step
              </Button>
            </div>

            {formData.steps.length === 0 ? (
              <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                <Bot className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <p className="text-gray-600">No steps added yet</p>
                <p className="text-sm text-gray-500 mb-4">Click "Add Step" to get started</p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addStep}
                  leftIcon={<Plus className="h-4 w-4" />}
                >
                  Add Your First Step
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {formData.steps.map((step, index) => (
                  <div key={`step-${index}-${step.type}`} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium">Step {index + 1}</h4>
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={() => removeStep(index)}
                      >
                        Remove
                      </Button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Step Name
                        </label>
                        <Input
                          value={step.name || ''}
                          onChange={(e) => updateStep(index, 'name', e.target.value)}
                          placeholder="Step name"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Step Type
                        </label>
                        <select
                          value={step.type}
                          onChange={(e) => updateStep(index, 'type', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        >
                          <option value="ai_reasoning">AI Reasoning</option>
                          <option value="api_call">API Call</option>
                          <option value="data_processing">Data Processing</option>
                          <option value="condition">Condition</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Agent *
                        </label>
                        <select
                          value={step.agent_id || ''}
                          onChange={(e) => updateStep(index, 'agent_id', e.target.value)}
                          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                            errors[`step_${index}_agent`] ? 'border-red-500' : 'border-gray-300'
                          }`}
                        >
                          <option value="">Select an agent</option>
                          {agents.map(agent => (
                            <option key={agent.id} value={agent.id}>
                              {agent.name} ({agent.agent_type})
                            </option>
                          ))}
                        </select>
                        {errors[`step_${index}_agent`] && (
                          <p className="text-red-500 text-sm mt-1">{errors[`step_${index}_agent`]}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {errors.steps && (
              <p className="text-red-500 text-sm">{errors.steps}</p>
            )}
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-3 pt-6 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              loading={loading}
            >
              Create Workflow
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateWorkflowModal;
