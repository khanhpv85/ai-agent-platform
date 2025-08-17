import React from 'react';
import { Card, CardContent } from '@components/UI';
import { MessageSquare, Clock, RefreshCw, AlertCircle } from 'lucide-react';

interface QueueMessage {
  id: number;
  type: string;
  content: string;
  status: string;
  priority: string;
  created_at: string;
  agent: string;
}

interface StatsProps {
  messages: QueueMessage[];
  className?: string;
}

const Stats: React.FC<StatsProps> = ({ messages, className = '' }) => {
  const stats = [
    {
      title: 'Total',
      value: messages.length,
      icon: <MessageSquare className="h-5 w-5 text-blue-600" />,
      bgColor: 'bg-blue-100',
    },
    {
      title: 'Pending',
      value: messages.filter(m => m.status === 'pending').length,
      icon: <Clock className="h-5 w-5 text-yellow-600" />,
      bgColor: 'bg-yellow-100',
    },
    {
      title: 'Processing',
      value: messages.filter(m => m.status === 'processing').length,
      icon: <RefreshCw className="h-5 w-5 text-blue-600" />,
      bgColor: 'bg-blue-100',
    },
    {
      title: 'Failed',
      value: messages.filter(m => m.status === 'failed').length,
      icon: <AlertCircle className="h-5 w-5 text-red-600" />,
      bgColor: 'bg-red-100',
    },
  ];

  return (
    <div className={`grid grid-cols-1 md:grid-cols-4 gap-4 ${className}`}>
      {stats.map((stat, index) => (
        <Card key={index}>
          <CardContent className="p-4">
            <div className="flex items-center">
              <div className={`p-2 ${stat.bgColor} rounded-lg`}>
                {stat.icon}
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <p className="text-lg font-semibold text-gray-900">{stat.value}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default Stats;
