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
  Settings,
  User
} from 'lucide-react';
import { Agent } from '@interfaces/agent.interface';

interface AgentCardProps {
  agent: Agent;
  className?: string;
  onEdit?: (agent: Agent) => void;
  onDelete?: (agent: Agent) => void;
  onConfigure?: (agent: Agent) => void;
  onStart?: (agent: Agent) => void;
  onPause?: (agent: Agent) => void;
}

const AgentCard: React.FC<AgentCardProps> = ({ 
  agent, 
  className = '',
  onEdit,
  onDelete,
  onConfigure,
  onStart,
  onPause
}) => {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <Zap className="h-4 w-4 text-green-500" />;
      case 'inactive':
        return <Pause className="h-4 w-4 text-yellow-500" />;
      case 'draft':
        return <Settings className="h-4 w-4 text-gray-500" />;
      default:
        return <Clock className="h-4 w-4 text-blue-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="success" icon={getStatusIcon(status)}>Active</Badge>;
      case 'inactive':
        return <Badge variant="warning" icon={getStatusIcon(status)}>Inactive</Badge>;
      case 'draft':
        return <Badge variant="default" icon={getStatusIcon(status)}>Draft</Badge>;
      default:
        return <Badge variant="default" icon={getStatusIcon(status)}>{status}</Badge>;
    }
  };

  const getAgentTypeLabel = (type: string) => {
    switch (type) {
      case 'workflow':
        return 'Workflow Agent';
      case 'chatbot':
        return 'Chatbot';
      case 'assistant':
        return 'Assistant';
      default:
        return 'Custom Agent';
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
                {getAgentTypeLabel(agent.agent_type)}
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
        
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            {getStatusBadge(agent.status)}
            <span className="text-xs text-gray-500">
              Created {new Date(agent.created_at).toLocaleDateString()}
            </span>
          </div>
          
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <User className="h-3 w-3" />
            <span>Created by {agent.created_by}</span>
          </div>
        </div>
        
        <div className="flex items-center gap-2 pt-2">
          {agent.status === 'inactive' && onStart && (
            <Button 
              size="sm" 
              variant="outline" 
              leftIcon={<Play className="h-3 w-3" />}
              onClick={() => onStart(agent)}
            >
              Start
            </Button>
          )}
          
          {agent.status === 'active' && onPause && (
            <Button 
              size="sm" 
              variant="outline" 
              leftIcon={<Pause className="h-3 w-3" />}
              onClick={() => onPause(agent)}
            >
              Pause
            </Button>
          )}
          
          {onConfigure && (
            <Button 
              size="sm" 
              variant="outline" 
              leftIcon={<Settings className="h-3 w-3" />}
              onClick={() => onConfigure(agent)}
            >
              Configure
            </Button>
          )}
          
          {onEdit && (
            <Button 
              size="sm" 
              variant="outline" 
              leftIcon={<Edit className="h-3 w-3" />}
              onClick={() => onEdit(agent)}
            >
              Edit
            </Button>
          )}
          
          {onDelete && (
            <Button 
              size="sm" 
              variant="destructive" 
              leftIcon={<Trash2 className="h-3 w-3" />}
              onClick={() => onDelete(agent)}
            >
              Delete
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default AgentCard;
