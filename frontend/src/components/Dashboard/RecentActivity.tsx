import React from 'react';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from '@components/UI';
import { 
  Activity, 
  CheckCircle, 
  Bot, 
  AlertCircle, 
  Clock
} from 'lucide-react';

interface RecentActivityProps {
  className?: string;
}

interface ActivityItem {
  id: number;
  type: 'workflow' | 'agent';
  title: string;
  status: 'completed' | 'active' | 'failed' | 'idle';
  time: string;
  icon: React.ReactNode;
}

const RecentActivity: React.FC<RecentActivityProps> = ({ className = '' }) => {
  const recentActivities: ActivityItem[] = [
    {
      id: 1,
      type: 'workflow',
      title: 'Data Processing Workflow',
      status: 'completed',
      time: '2 minutes ago',
      icon: <CheckCircle className="h-4 w-4 text-green-500" />,
    },
    {
      id: 2,
      type: 'agent',
      title: 'Customer Support Agent',
      status: 'active',
      time: '5 minutes ago',
      icon: <Bot className="h-4 w-4 text-blue-500" />,
    },
    {
      id: 3,
      type: 'workflow',
      title: 'Email Campaign',
      status: 'failed',
      time: '10 minutes ago',
      icon: <AlertCircle className="h-4 w-4 text-red-500" />,
    },
    {
      id: 4,
      type: 'agent',
      title: 'Sales Assistant Agent',
      status: 'idle',
      time: '15 minutes ago',
      icon: <Clock className="h-4 w-4 text-gray-500" />,
    },
  ];

  const getStatusBadge = (status: string) => {
    const statusClasses = {
      completed: 'bg-green-100 text-green-800',
      active: 'bg-blue-100 text-blue-800',
      failed: 'bg-red-100 text-red-800',
      idle: 'bg-gray-100 text-gray-800',
    };

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusClasses[status as keyof typeof statusClasses] || statusClasses.idle}`}>
        {status}
      </span>
    );
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Recent Activity
        </CardTitle>
        <CardDescription>
          Latest updates from your agents and workflows
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {recentActivities.map((activity) => (
            <div key={activity.id} className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="flex-shrink-0">
                {activity.icon}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {activity.title}
                </p>
                <p className="text-xs text-gray-500">
                  {activity.time}
                </p>
              </div>
              <div className="flex-shrink-0">
                {getStatusBadge(activity.status)}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default RecentActivity;
