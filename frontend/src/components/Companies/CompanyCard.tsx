import React from 'react';
import { 
  Building, 
  Globe, 
  Users, 
  Calendar,
  Edit, 
  Trash2, 
  MoreHorizontal,
  Star,
  StarOff,
  Hash
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, Button, Badge } from '@components/UI';
import { CompanyData } from '@interfaces/company.interface';

interface CompanyCardProps {
  company: CompanyData;
  onEdit: (company: CompanyData) => void;
  onDelete: (company: CompanyData) => void;
  onSetDefault: (company: CompanyData) => void;
}

const CompanyCard: React.FC<CompanyCardProps> = ({ company, onEdit, onDelete, onSetDefault }) => {
  const getSubscriptionPlanColor = (plan: string) => {
    switch (plan) {
      case 'free': return 'default';
      case 'pro': return 'primary';
      case 'enterprise': return 'success';
      default: return 'default';
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'owner': return 'success';
      case 'admin': return 'primary';
      case 'member': return 'default';
      default: return 'default';
    }
  };

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary-100 rounded-lg">
              <Building className="h-5 w-5 text-primary-600" />
            </div>
            <div>
              <CardTitle className="text-lg">{company.name}</CardTitle>
              <Badge variant={getSubscriptionPlanColor(company.subscription_plan)}>
                {company.subscription_plan}
              </Badge>
            </div>
          </div>
          <div className="relative">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                // Dropdown menu would go here
              }}
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Hash className="h-4 w-4" />
            <span className="font-mono text-xs">{company.id}</span>
          </div>
          {company.domain && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Globe className="h-4 w-4" />
              <span>{company.domain}</span>
            </div>
          )}
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Users className="h-4 w-4" />
            <span>Max {company.max_agents} agents</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Calendar className="h-4 w-4" />
            <span>Created {new Date(company.created_at).toLocaleDateString()}</span>
          </div>
          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-2">
              <Badge variant={getRoleColor(company.role)}>
                {company.role}
              </Badge>
              {company.is_default && (
                <Badge variant="success" className="flex items-center gap-1">
                  <Star className="h-3 w-3" />
                  Default
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2">
              {!company.is_default && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onSetDefault(company)}
                  title="Set as default company"
                >
                  <StarOff className="h-4 w-4" />
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onEdit(company)}
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDelete(company)}
                className="text-red-600 hover:text-red-700"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CompanyCard;
