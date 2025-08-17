import React from 'react';
import { 
  Welcome, 
  Stats, 
  RecentActivity, 
  QuickActions, 
  SystemStatus 
} from '../components/Dashboard';

const Dashboard: React.FC = () => {
  return (
    <div className="space-y-4">
      {/* Welcome Section */}
      <Welcome />

      {/* Stats Grid */}
      <Stats />

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <div className="lg:col-span-2">
          <RecentActivity />
        </div>

        {/* Quick Actions and System Status */}
        <div className="space-y-6">
          <QuickActions />
          <SystemStatus />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
