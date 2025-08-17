import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, Button, Badge } from '@components/UI';
import { 
  Workflow, 
  MoreVertical, 
  Play, 
  Pause, 
  Edit, 
  Trash2,
  Clock,
  CheckCircle,
  AlertCircle,
  Settings,
  BarChart3,
  Calendar,
  Zap
} from 'lucide-react';
import { Workflow as WorkflowType } from '@interfaces/workflow.interface';

interface WorkflowCardProps {
  workflow: WorkflowType;
  className?: string;
}

const WorkflowCard: React.FC<WorkflowCardProps> = ({ workflow, className = '' }) => {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <Zap className="h-4 w-4 text-green-500" />;
      case 'paused':
        return <Pause className="h-4 w-4 text-yellow-500" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-blue-500" />;
      case 'failed':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Settings className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="success" icon={getStatusIcon(status)}>Active</Badge>;
      case 'paused':
        return <Badge variant="warning" icon={getStatusIcon(status)}>Paused</Badge>;
      case 'completed':
        return <Badge variant="primary" icon={getStatusIcon(status)}>Completed</Badge>;
      case 'failed':
        return <Badge variant="error" icon={getStatusIcon(status)}>Failed</Badge>;
      default:
        return <Badge variant="default" icon={getStatusIcon(status)}>{status}</Badge>;
    }
  };

  return (
    <Card className={`hover:shadow-lg transition-shadow ${className}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Workflow className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <CardTitle className="text-lg">{workflow.name}</CardTitle>
              <CardDescription className="text-sm">
                {workflow.workflow_type || 'Custom Workflow'}
              </CardDescription>
            </div>
          </div>
          <button className="p-1 hover:bg-gray-100 rounded">
            <MoreVertical className="h-4 w-4 text-gray-400" />
          </button>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <p className="text-sm text-gray-600 line-clamp-2">
          {workflow.description || 'No description available'}
        </p>
        
        <div className="flex items-center justify-between">
          {getStatusBadge(workflow.status)}
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <Calendar className="h-3 w-3" />
            {new Date(workflow.created_at).toLocaleDateString()}
          </div>
        </div>
        
        <div className="flex items-center gap-2 pt-2">
          <Button size="sm" variant="outline" leftIcon={<Play className="h-3 w-3" />}>
            Start
          </Button>
          <Button size="sm" variant="outline" leftIcon={<Pause className="h-3 w-3" />}>
            Pause
          </Button>
          <Button size="sm" variant="outline" leftIcon={<BarChart3 className="h-3 w-3" />}>
            View
          </Button>
          <Button size="sm" variant="outline" leftIcon={<Edit className="h-3 w-3" />}>
            Edit
          </Button>
          <Button size="sm" variant="destructive" leftIcon={<Trash2 className="h-3 w-3" />}>
            Delete
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default WorkflowCard;
