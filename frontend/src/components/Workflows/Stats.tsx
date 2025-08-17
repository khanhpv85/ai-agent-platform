import React from 'react';
import { Card, CardContent } from '@components/UI';
import { Workflow, Zap, CheckCircle, AlertCircle } from 'lucide-react';
import { Workflow as WorkflowType } from '@interfaces/workflow.interface';

interface StatsProps {
  workflows: WorkflowType[];
  className?: string;
}

const Stats: React.FC<StatsProps> = ({ workflows, className = '' }) => {
  const stats = [
    {
      title: 'Total',
      value: workflows.length,
      icon: <Workflow className="h-5 w-5 text-blue-600" />,
      bgColor: 'bg-blue-100',
    },
    {
      title: 'Active',
      value: workflows.filter(w => w.status === 'active').length,
      icon: <Zap className="h-5 w-5 text-green-600" />,
      bgColor: 'bg-green-100',
    },
    {
      title: 'Completed',
      value: workflows.filter(w => w.status === 'completed').length,
      icon: <CheckCircle className="h-5 w-5 text-blue-600" />,
      bgColor: 'bg-blue-100',
    },
    {
      title: 'Failed',
      value: workflows.filter(w => w.status === 'failed').length,
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
