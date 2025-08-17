import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@store/index';
import { Card, CardContent } from '@components/UI';
import { 
  Bot, 
  Workflow, 
  CheckCircle, 
  Zap
} from 'lucide-react';

interface StatsProps {
  className?: string;
}

interface StatCard {
  title: string;
  value: number;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  description: string;
}

const Stats: React.FC<StatsProps> = ({ className = '' }) => {
  const agents = useSelector((state: RootState) => state.agents);
  const workflows = useSelector((state: RootState) => state.workflows);

  const [stats, setStats] = useState({
    totalAgents: 0,
    activeAgents: 0,
    totalWorkflows: 0,
    completedWorkflows: 0,
    pendingWorkflows: 0,
    failedWorkflows: 0,
  });

  useEffect(() => {
    // Calculate stats from Redux state
    setStats({
      totalAgents: agents.agents.length,
      activeAgents: agents.agents.filter(agent => agent.status === 'active').length,
      totalWorkflows: workflows.workflows.length,
      completedWorkflows: workflows.workflows.filter(w => w.status === 'completed').length,
      pendingWorkflows: workflows.workflows.filter(w => w.status === 'pending').length,
      failedWorkflows: workflows.workflows.filter(w => w.status === 'failed').length,
    });
  }, [agents.agents, workflows.workflows]);

  const statCards: StatCard[] = [
    {
      title: 'Total Agents',
      value: stats.totalAgents,
      icon: <Bot className="h-6 w-6" />,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      description: 'AI agents in your system',
    },
    {
      title: 'Active Agents',
      value: stats.activeAgents,
      icon: <Zap className="h-6 w-6" />,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      description: 'Currently running agents',
    },
    {
      title: 'Total Workflows',
      value: stats.totalWorkflows,
      icon: <Workflow className="h-6 w-6" />,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
      description: 'Automated workflows',
    },
    {
      title: 'Completed Tasks',
      value: stats.completedWorkflows,
      icon: <CheckCircle className="h-6 w-6" />,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-100',
      description: 'Successfully completed',
    },
  ];

  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 ${className}`}>
      {statCards.map((stat, index) => (
        <Card key={index} className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-xs text-gray-500 mt-1">{stat.description}</p>
              </div>
              <div className={`p-3 rounded-full ${stat.bgColor} ${stat.color}`}>
                {stat.icon}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default Stats;
