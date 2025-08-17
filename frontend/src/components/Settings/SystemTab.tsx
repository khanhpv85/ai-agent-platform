import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, Button } from '@components/UI';

interface SystemTabProps {
  className?: string;
}

const SystemTab: React.FC<SystemTabProps> = ({ className = '' }) => {
  return (
    <div className={`space-y-6 ${className}`}>
      <Card>
        <CardHeader>
          <CardTitle>System Information</CardTitle>
          <CardDescription>
            View system status and configuration
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-gray-700">API Version</p>
              <p className="text-sm text-gray-900">v1.2.3</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700">Database</p>
              <p className="text-sm text-gray-900">MySQL 8.0</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700">Queue System</p>
              <p className="text-sm text-gray-900">Redis</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700">Last Updated</p>
              <p className="text-sm text-gray-900">2024-01-15 10:30 AM</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Danger Zone</CardTitle>
          <CardDescription>
            Irreversible and destructive actions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border border-red-200 rounded-lg bg-red-50">
              <div>
                <p className="text-sm font-medium text-red-900">Delete Account</p>
                <p className="text-sm text-red-700">Permanently delete your account and all data</p>
              </div>
              <Button variant="destructive">
                Delete Account
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SystemTab;
