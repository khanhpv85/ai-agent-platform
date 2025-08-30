import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, Button, Badge } from '@components/UI';
import { Workflow } from '@interfaces/workflow.interface';
import { Play, Edit, Trash2, Plus, Settings, Clock, CheckCircle, XCircle } from 'lucide-react';

interface WorkflowSelectorProps {
  workflows: Workflow[];
  selectedWorkflow: Workflow | null;
  onSelectWorkflow: (workflow: Workflow) => void;
  onCreateWorkflow: () => void;
  onEditWorkflow: (workflow: Workflow) => void;
  onDeleteWorkflow: (workflow: Workflow) => void;
  onExecuteWorkflow: (workflow: Workflow) => void;
  loading?: boolean;
}

const WorkflowSelector: React.FC<WorkflowSelectorProps> = ({
  workflows,
  selectedWorkflow,
  onSelectWorkflow,
  onCreateWorkflow,
  onEditWorkflow,
  onDeleteWorkflow,
  onExecuteWorkflow,
  loading = false
}) => {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'inactive':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'draft':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      default:
        return <Settings className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="success" icon={getStatusIcon(status)}>Active</Badge>;
      case 'inactive':
        return <Badge variant="error" icon={getStatusIcon(status)}>Inactive</Badge>;
      case 'draft':
        return <Badge variant="warning" icon={getStatusIcon(status)}>Draft</Badge>;
      default:
        return <Badge variant="default" icon={getStatusIcon(status)}>{status}</Badge>;
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Workflow Automation</h2>
          <p className="text-sm text-gray-600">Design, manage, and execute automated workflows with your AI agents</p>
        </div>
        <Button
          onClick={onCreateWorkflow}
          leftIcon={<Plus className="h-4 w-4" />}
          className="bg-primary-600 hover:bg-primary-700"
        >
          Create Workflow
        </Button>
      </div>

      {/* Workflow Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {workflows.map((workflow) => (
          <Card
            key={workflow.id}
            className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
              selectedWorkflow?.id === workflow.id
                ? 'ring-2 ring-primary-500 bg-primary-50'
                : 'hover:bg-gray-50'
            }`}
            onClick={() => onSelectWorkflow(workflow)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary-100 rounded-lg">
                    <Settings className="h-5 w-5 text-primary-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{workflow.name}</CardTitle>
                    {getStatusBadge(workflow.status)}
                  </div>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-3">
              <p className="text-sm text-gray-600 line-clamp-2">
                {workflow.description || 'No description available'}
              </p>
              
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>{workflow.steps?.length || 0} steps</span>
                <span>Created {new Date(workflow.created_at).toLocaleDateString()}</span>
              </div>
              
              <div className="flex items-center gap-2 pt-2">
                <Button
                  size="sm"
                  variant="outline"
                  leftIcon={<Play className="h-3 w-3" />}
                  onClick={(e) => {
                    e.stopPropagation();
                    onExecuteWorkflow(workflow);
                  }}
                >
                  Execute
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  leftIcon={<Edit className="h-3 w-3" />}
                  onClick={(e) => {
                    e.stopPropagation();
                    onEditWorkflow(workflow);
                  }}
                >
                  Edit
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  leftIcon={<Trash2 className="h-3 w-3" />}
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteWorkflow(workflow);
                  }}
                >
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {workflows.length === 0 && !loading && (
        <Card className="text-center py-12">
          <CardContent>
            <Settings className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Ready to Automate?</h3>
            <p className="text-gray-600 mb-4">
              Create your first AI workflow to streamline tasks, process data, and boost productivity. 
              Connect multiple agents to build powerful automation pipelines.
            </p>
            <Button
              onClick={onCreateWorkflow}
              leftIcon={<Plus className="h-4 w-4" />}
              className="bg-primary-600 hover:bg-primary-700"
            >
              Build Your First Workflow
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Loading State */}
      {loading && (
        <Card className="text-center py-12">
          <CardContent>
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading your automation workflows...</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default WorkflowSelector;
