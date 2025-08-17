import React from 'react';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from '@components/UI';
import { 
  Target, 
  Bot, 
  Workflow, 
  BarChart3
} from 'lucide-react';

interface QuickActionsProps {
  className?: string;
}

interface ActionItem {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  onClick?: () => void;
}

const QuickActions: React.FC<QuickActionsProps> = ({ className = '' }) => {
  const actions: ActionItem[] = [
    {
      id: 'create-agent',
      title: 'Create Agent',
      description: 'Add a new AI agent',
      icon: <Bot className="h-5 w-5 text-blue-600" />,
      onClick: () => console.log('Create Agent clicked'),
    },
    {
      id: 'new-workflow',
      title: 'New Workflow',
      description: 'Create automation',
      icon: <Workflow className="h-5 w-5 text-purple-600" />,
      onClick: () => console.log('New Workflow clicked'),
    },
    {
      id: 'view-analytics',
      title: 'View Analytics',
      description: 'Performance insights',
      icon: <BarChart3 className="h-5 w-5 text-green-600" />,
      onClick: () => console.log('View Analytics clicked'),
    },
  ];

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5" />
          Quick Actions
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {actions.map((action) => (
          <button
            key={action.id}
            onClick={action.onClick}
            className="w-full flex items-center gap-3 p-3 text-left rounded-lg hover:bg-gray-50 transition-colors"
          >
            {action.icon}
            <div>
              <p className="text-sm font-medium text-gray-900">{action.title}</p>
              <p className="text-xs text-gray-500">{action.description}</p>
            </div>
          </button>
        ))}
      </CardContent>
    </Card>
  );
};

export default QuickActions;
