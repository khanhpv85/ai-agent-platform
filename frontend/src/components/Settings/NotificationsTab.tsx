import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, Button } from '@components/UI';
import { Save } from 'lucide-react';

interface NotificationsTabProps {
  className?: string;
}

const NotificationsTab: React.FC<NotificationsTabProps> = ({ className = '' }) => {
  return (
    <div className={`space-y-6 ${className}`}>
      <Card>
        <CardHeader>
          <CardTitle>Email Notifications</CardTitle>
          <CardDescription>
            Choose which email notifications you want to receive
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900">Workflow Updates</p>
              <p className="text-sm text-gray-500">Get notified when workflows complete or fail</p>
            </div>
            <input type="checkbox" className="rounded" defaultChecked />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900">Agent Status</p>
              <p className="text-sm text-gray-500">Receive alerts when agents go offline</p>
            </div>
            <input type="checkbox" className="rounded" defaultChecked />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900">System Alerts</p>
              <p className="text-sm text-gray-500">Important system notifications</p>
            </div>
            <input type="checkbox" className="rounded" />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900">Marketing</p>
              <p className="text-sm text-gray-500">Product updates and announcements</p>
            </div>
            <input type="checkbox" className="rounded" />
          </div>
          <Button leftIcon={<Save className="h-4 w-4" />}>
            Save Preferences
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default NotificationsTab;
