import React from 'react';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from '@components/UI';
import { TrendingUp } from 'lucide-react';

interface SystemStatusProps {
  className?: string;
}

interface StatusItem {
  id: string;
  name: string;
  status: 'online' | 'offline' | 'warning';
}

const SystemStatus: React.FC<SystemStatusProps> = ({ className = '' }) => {
  const statusItems: StatusItem[] = [
    { id: 'ai-service', name: 'AI Service', status: 'online' },
    { id: 'database', name: 'Database', status: 'online' },
    { id: 'queue-service', name: 'Queue Service', status: 'online' },
  ];

  const getStatusBadge = (status: string) => {
    const statusClasses = {
      online: 'bg-green-100 text-green-800',
      offline: 'bg-red-100 text-red-800',
      warning: 'bg-yellow-100 text-yellow-800',
    };

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusClasses[status as keyof typeof statusClasses] || statusClasses.offline}`}>
        {status === 'online' ? 'Online' : status === 'offline' ? 'Offline' : 'Warning'}
      </span>
    );
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          System Status
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {statusItems.map((item) => (
            <div key={item.id} className="flex items-center justify-between">
              <span className="text-sm text-gray-600">{item.name}</span>
              {getStatusBadge(item.status)}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default SystemStatus;
