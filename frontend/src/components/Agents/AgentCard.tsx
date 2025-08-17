import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, Button, Badge } from '@components/UI';
import { 
  Bot, 
  MoreVertical, 
  Play, 
  Pause, 
  Edit, 
  Trash2,
  Zap,
  Clock,
  AlertCircle,
  Settings
} from 'lucide-react';
import { Agent } from '@interfaces/agent.interface';

interface AgentCardProps {
  agent: Agent;
  className?: string;
}

const AgentCard: React.FC<AgentCardProps> = ({ agent, className = '' }) => {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <Zap className="h-4 w-4 text-green-500" />;
      case 'idle':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Settings className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="success" icon={getStatusIcon(status)}>Active</Badge>;
      case 'idle':
        return <Badge variant="warning" icon={getStatusIcon(status)}>Idle</Badge>;
      case 'error':
        return <Badge variant="error" icon={getStatusIcon(status)}>Error</Badge>;
      default:
        return <Badge variant="default" icon={getStatusIcon(status)}>{status}</Badge>;
    }
  };

  return (
    <Card className={`hover:shadow-lg transition-shadow ${className}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary-100 rounded-lg">
              <Bot className="h-5 w-5 text-primary-600" />
            </div>
            <div>
              <CardTitle className="text-lg">{agent.name}</CardTitle>
              <CardDescription className="text-sm">
                {agent.agent_type || 'Custom Agent'}
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
          {agent.description || 'No description available'}
        </p>
        
        <div className="flex items-center justify-between">
          {getStatusBadge(agent.status)}
          <span className="text-xs text-gray-500">
            Created {new Date(agent.created_at).toLocaleDateString()}
          </span>
        </div>
        
        <div className="flex items-center gap-2 pt-2">
          <Button size="sm" variant="outline" leftIcon={<Play className="h-3 w-3" />}>
            Start
          </Button>
          <Button size="sm" variant="outline" leftIcon={<Pause className="h-3 w-3" />}>
            Pause
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

export default AgentCard;
