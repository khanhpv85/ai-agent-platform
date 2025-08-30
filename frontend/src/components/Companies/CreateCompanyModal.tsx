import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, Button, Input } from '@components/UI';

interface CompanyFormData {
  name: string;
  domain: string;
  subscription_plan: string;
  max_agents: number;
}

interface CreateCompanyModalProps {
  isOpen: boolean;
  formData: CompanyFormData;
  onFormDataChange: (data: CompanyFormData) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
}

const CreateCompanyModal: React.FC<CreateCompanyModalProps> = ({
  isOpen,
  formData,
  onFormDataChange,
  onSubmit,
  onCancel
}) => {
  if (!isOpen) return null;

  const handleInputChange = (field: keyof CompanyFormData, value: string | number) => {
    onFormDataChange({ ...formData, [field]: value });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Create New Company</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4">
            <Input
              label="Company Name"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="Enter company name"
              required
            />
            <Input
              label="Domain (Optional)"
              value={formData.domain}
              onChange={(e) => handleInputChange('domain', e.target.value)}
              placeholder="company.com"
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Subscription Plan
              </label>
              <select
                value={formData.subscription_plan}
                onChange={(e) => handleInputChange('subscription_plan', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="free">Free</option>
                <option value="pro">Pro</option>
                <option value="enterprise">Enterprise</option>
              </select>
            </div>
            <Input
              label="Max Agents"
              type="number"
              value={formData.max_agents}
              onChange={(e) => handleInputChange('max_agents', parseInt(e.target.value))}
              min="1"
              required
            />
            <div className="flex gap-2 pt-4">
              <Button type="submit" className="flex-1">
                Create Company
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default CreateCompanyModal;
