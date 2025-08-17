import React from 'react';
import { Button, Badge } from '@components/UI';
import { 
  MessageSquare, 
  Settings, 
  AlertCircle, 
  Eye, 
  RotateCcw, 
  Trash2 
} from 'lucide-react';

interface QueueMessage {
  id: number;
  type: string;
  content: string;
  status: string;
  priority: string;
  created_at: string;
  agent: string;
}

interface MessageItemProps {
  message: QueueMessage;
  className?: string;
}

const MessageItem: React.FC<MessageItemProps> = ({ message, className = '' }) => {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Settings className="h-4 w-4 text-yellow-500" />;
      case 'processing':
        return <Settings className="h-4 w-4 text-blue-500" />;
      case 'completed':
        return <Settings className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Settings className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="warning" icon={getStatusIcon(status)}>Pending</Badge>;
      case 'processing':
        return <Badge variant="primary" icon={getStatusIcon(status)}>Processing</Badge>;
      case 'completed':
        return <Badge variant="success" icon={getStatusIcon(status)}>Completed</Badge>;
      case 'failed':
        return <Badge variant="error" icon={getStatusIcon(status)}>Failed</Badge>;
      default:
        return <Badge variant="default" icon={getStatusIcon(status)}>{status}</Badge>;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high':
        return <Badge variant="error">High</Badge>;
      case 'medium':
        return <Badge variant="warning">Medium</Badge>;
      case 'low':
        return <Badge variant="default">Low</Badge>;
      default:
        return <Badge variant="default">{priority}</Badge>;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'email':
        return <MessageSquare className="h-4 w-4 text-blue-500" />;
      case 'chat':
        return <MessageSquare className="h-4 w-4 text-green-500" />;
      case 'task':
        return <Settings className="h-4 w-4 text-purple-500" />;
      case 'notification':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <MessageSquare className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <div className={`flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors ${className}`}>
      <div className="flex items-center gap-4 flex-1">
        <div className="flex-shrink-0">
          {getTypeIcon(message.type)}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 truncate">
            {message.content}
          </p>
          <div className="flex items-center gap-4 mt-1">
            <span className="text-xs text-gray-500">
              Agent: {message.agent}
            </span>
            <span className="text-xs text-gray-500">
              {new Date(message.created_at).toLocaleString()}
            </span>
          </div>
        </div>
      </div>
      
      <div className="flex items-center gap-3">
        {getStatusBadge(message.status)}
        {getPriorityBadge(message.priority)}
        
        <div className="flex items-center gap-1">
          <Button size="sm" variant="outline" leftIcon={<Eye className="h-3 w-3" />}>
            View
          </Button>
          {message.status === 'failed' && (
            <Button size="sm" variant="outline" leftIcon={<RotateCcw className="h-3 w-3" />}>
              Retry
            </Button>
          )}
          <Button size="sm" variant="destructive" leftIcon={<Trash2 className="h-3 w-3" />}>
            Delete
          </Button>
        </div>
      </div>
    </div>
  );
};

export default MessageItem;
