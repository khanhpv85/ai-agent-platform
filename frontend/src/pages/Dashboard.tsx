import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '@store/index';
import { getDefaultCompany } from '@services/company.service';
import { 
  Welcome, 
  Stats, 
  RecentActivity, 
  QuickActions, 
  SystemStatus 
} from '../components/Dashboard';
import { LoadingSpinner, NoDefaultCompanyWarning } from '@components/UI';

const Dashboard: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const [hasDefaultCompany, setHasDefaultCompany] = useState<boolean | null>(null);

  // Check for default company
  useEffect(() => {
    const checkDefaultCompany = async () => {
      try {
        const defaultCompany = await dispatch(getDefaultCompany() as any).unwrap();
        setHasDefaultCompany(!!defaultCompany);
      } catch (error) {
        console.error('Failed to get default company:', error);
        setHasDefaultCompany(false);
      }
    };

    checkDefaultCompany();
  }, [dispatch]);

  // Show loading state while checking for default company
  if (hasDefaultCompany === null) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // Show warning if no default company is set
  if (hasDefaultCompany === false) {
    return (
      <NoDefaultCompanyWarning 
        title="No Default Company Set"
        message="You need to set a default company to access the dashboard. Please go to the Companies page and set a default company."
      />
    );
  }

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
