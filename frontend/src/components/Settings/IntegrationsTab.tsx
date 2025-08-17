import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, Button, Badge } from '@components/UI';
import { Globe, Zap, CheckCircle, AlertCircle } from 'lucide-react';

interface IntegrationsTabProps {
  className?: string;
}

const IntegrationsTab: React.FC<IntegrationsTabProps> = ({ className = '' }) => {
  return (
    <div className={`space-y-6 ${className}`}>
      <Card>
        <CardHeader>
          <CardTitle>Connected Services</CardTitle>
          <CardDescription>
            Manage your third-party integrations
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Globe className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Slack</p>
                <p className="text-sm text-gray-500">Connected for notifications</p>
              </div>
            </div>
            <Badge variant="success" icon={<CheckCircle className="h-3 w-3" />}>
              Connected
            </Badge>
          </div>
          
          <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Zap className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Zapier</p>
                <p className="text-sm text-gray-500">Automation workflows</p>
              </div>
            </div>
            <Badge variant="error" icon={<AlertCircle className="h-3 w-3" />}>
              Disconnected
            </Badge>
          </div>
          
          <Button variant="outline">
            Add Integration
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default IntegrationsTab;
