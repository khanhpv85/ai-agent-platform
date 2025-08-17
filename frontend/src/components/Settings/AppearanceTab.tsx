import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, Button } from '@components/UI';
import { Save } from 'lucide-react';

interface AppearanceTabProps {
  className?: string;
}

const AppearanceTab: React.FC<AppearanceTabProps> = ({ className = '' }) => {
  return (
    <div className={`space-y-6 ${className}`}>
      <Card>
        <CardHeader>
          <CardTitle>Theme Settings</CardTitle>
          <CardDescription>
            Customize the appearance of your dashboard
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700">Theme</label>
            <div className="mt-2 space-y-2">
              <label className="flex items-center">
                <input type="radio" name="theme" value="light" defaultChecked className="mr-2" />
                <span className="text-sm text-gray-700">Light</span>
              </label>
              <label className="flex items-center">
                <input type="radio" name="theme" value="dark" className="mr-2" />
                <span className="text-sm text-gray-700">Dark</span>
              </label>
              <label className="flex items-center">
                <input type="radio" name="theme" value="auto" className="mr-2" />
                <span className="text-sm text-gray-700">Auto (follow system)</span>
              </label>
            </div>
          </div>
          <Button leftIcon={<Save className="h-4 w-4" />}>
            Apply Theme
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default AppearanceTab;
