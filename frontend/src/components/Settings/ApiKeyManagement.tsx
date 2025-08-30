import React, { useState, useEffect } from 'react';
import { Button } from '@components/UI/Button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@components/UI/Card';
import { Badge } from '@components/UI/Badge';
import { Input } from '@components/UI/Input';
import { Modal } from '@components/UI/Modal';
import MultiSelect from '@components/UI/MultiSelect';
import { useAuth } from '@hooks/useAuth';
import { companyClient } from '@configs/http-client';

interface ApiKey {
  id: string;
  name: string;
  prefix: string;
  status: 'active' | 'inactive' | 'expired' | 'revoked';
  permissions: string[];
  last_used_at?: string;
  expires_at?: string;
  created_at: string;
  updated_at: string;
}

interface CreateApiKeyData {
  name: string;
  permissions: string[];
  expires_at?: string;
}

const ApiKeyManagement: React.FC = () => {
  const { user } = useAuth();
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userCompanies, setUserCompanies] = useState<any[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<string>('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showRegenerateModal, setShowRegenerateModal] = useState(false);
  const [selectedKey, setSelectedKey] = useState<ApiKey | null>(null);
  const [newApiKey, setNewApiKey] = useState<string>('');
  const [createForm, setCreateForm] = useState<CreateApiKeyData>({
    name: '',
    permissions: ['read']
  });

  const permissionOptions = [
    { value: 'read', label: 'Read' },
    { value: 'write', label: 'Write' },
    { value: 'admin', label: 'Admin' },
    { value: 'chat', label: 'Chat' },
    { value: 'workflow_execute', label: 'Workflow Execute' }
  ];

  const statusColors = {
    active: 'green',
    inactive: 'gray',
    expired: 'red',
    revoked: 'red'
  };

  useEffect(() => {
    console.log('🔍 User effect triggered:', { user, selectedCompany });
    
    if (user) {
      console.log('✅ User loaded, fetching companies...');
      fetchUserCompanies();
    }
  }, [user]);

  useEffect(() => {
    console.log('🔍 SelectedCompany effect triggered:', { selectedCompany, user });
    
    if (selectedCompany) {
      console.log('✅ Fetching API keys for company:', selectedCompany);
      fetchApiKeys();
    } else if (user && (!user.companies || user.companies.length === 0)) {
      // User has no companies, don't show loading
      console.log('❌ User has no companies, setting loading to false');
      setLoading(false);
    } else if (user && user.companies && user.companies.length > 0 && !selectedCompany) {
      console.log('⚠️ User has companies but no selected company, this might be a timing issue');
    }
  }, [selectedCompany, user]);

  const fetchUserCompanies = async () => {
    try {
      console.log('🔍 Fetching user companies...');
      const response = await companyClient.get('/companies');
      console.log('✅ User companies response:', response.data);
      
      if (response.data?.companies && Array.isArray(response.data.companies)) {
        setUserCompanies(response.data.companies);
        
        // Set the first company as selected if none is selected
        if (response.data.companies.length > 0 && !selectedCompany) {
          setSelectedCompany(response.data.companies[0].id);
        }
      } else {
        console.error('Unexpected user companies response format:', response.data);
        setError('Failed to load user companies');
      }
    } catch (error: any) {
      console.error('Error fetching user companies:', error);
      setError(error.response?.data?.message || error.message || 'Failed to fetch user companies');
    }
  };

  const fetchApiKeys = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Get the selected company ID
      const companyId = selectedCompany;
      
      if (!companyId) {
        setError('No company selected');
        setApiKeys([]);
        return;
      }
      
      const response = await companyClient.get(`/api-keys/company/${companyId}`);
      
      // Ensure response.data is an array
      if (Array.isArray(response.data)) {
        setApiKeys(response.data);
      } else {
        console.error('Unexpected response format:', response.data);
        setError('Unexpected response format from server');
        setApiKeys([]);
      }
    } catch (error: any) {
      console.error('Error fetching API keys:', error);
      setError(error.response?.data?.message || error.message || 'Failed to fetch API keys');
      setApiKeys([]);
    } finally {
      setLoading(false);
    }
  };

  const createApiKey = async () => {
    try {
      console.log('🔍 Creating API key for company:', selectedCompany);
      console.log('Available companies:', userCompanies);
      
      if (!selectedCompany) {
        setError('No company selected. Please select a company first.');
        return;
      }
      
      const response = await companyClient.post('/api-keys', {
        ...createForm,
        company_id: selectedCompany
      });
      
      console.log('✅ API key created successfully:', response.data);
      setNewApiKey(response.data.key);
      setShowCreateModal(false);
      setCreateForm({ name: '', permissions: ['read'] });
      fetchApiKeys();
    } catch (error: any) {
      console.error('Error creating API key:', error);
      setError(error.response?.data?.message || error.message || 'Failed to create API key');
    }
  };

  const regenerateApiKey = async (keyId: string) => {
    try {
      const response = await companyClient.post(`/api-keys/${keyId}/regenerate`);
      setNewApiKey(response.data.key);
      setShowRegenerateModal(false);
      setSelectedKey(null);
      fetchApiKeys();
    } catch (error) {
      console.error('Error regenerating API key:', error);
    }
  };

  const deleteApiKey = async (keyId: string) => {
    if (!confirm('Are you sure you want to delete this API key? This action cannot be undone.')) {
      return;
    }

    try {
      await companyClient.delete(`/api-keys/${keyId}`);
      fetchApiKeys();
    } catch (error) {
      console.error('Error deleting API key:', error);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('API key copied to clipboard!');
  };

  const testConnection = async () => {
    try {
      const response = await companyClient.get('/api-keys/test');
      console.log('✅ API Keys endpoint test successful:', response.data);
      alert('API Keys endpoint is working! Check console for details.');
    } catch (error) {
      console.error('❌ API Keys endpoint test failed:', error);
      alert('API Keys endpoint test failed. Check console for details.');
    }
  };

  const testCompaniesEndpoint = async () => {
    try {
      console.log('🔍 Testing companies endpoint...');
      const response = await companyClient.get('/companies/test');
      console.log('✅ Companies endpoint test successful:', response.data);
      alert('Companies endpoint is working! Check console for details.');
    } catch (error: any) {
      console.error('❌ Companies endpoint test failed:', error);
      console.error('Error response:', error.response?.data);
      alert('Companies endpoint test failed. Check console for details.');
    }
  };

  const debugAuth = async () => {
    try {
      console.log('🔍 Debugging authentication...');
      console.log('User:', user);
      console.log('User companies (from API):', userCompanies);
      console.log('Selected company:', selectedCompany);
      console.log('Loading state:', loading);
      console.log('Error state:', error);
      
      if (!selectedCompany) {
        console.error('❌ No company selected');
        alert('No company selected. Please select a company first.');
        return;
      }
      
      // Test the protected endpoint
      const response = await companyClient.get(`/api-keys/company/${selectedCompany}`);
      console.log('✅ Protected endpoint response:', response.data);
      alert('Debug info logged to console. Check console for details.');
    } catch (error: any) {
      console.error('❌ Protected endpoint error:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      alert('Debug error logged to console. Check console for details.');
    }
  };

  // Show loading only when we have a selected company and are fetching data
  if (loading && selectedCompany) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-gray-500">Loading API keys...</div>
      </div>
    );
  }

  // Show loading when user is not loaded yet
  if (!user) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-gray-500">Loading user information...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Company Selection Card */}
      {userCompanies && userCompanies.length > 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Company Selection</CardTitle>
            <CardDescription>
              Select which company's API keys to manage
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Active Company
                </label>
                <select
                  value={selectedCompany}
                  onChange={(e) => setSelectedCompany(e.target.value)}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                >
                  {userCompanies.map((company) => (
                    <option key={company.id} value={company.id}>
                      {company.name} ({company.role})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Error Display */}
      {error && (
        <Card>
          <CardContent className="pt-6">
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">Error</h3>
                  <div className="mt-2 text-sm text-red-700">
                    <p>{error}</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* API Keys Management Card */}
      <Card>
        <CardHeader>
          <CardTitle>API Keys</CardTitle>
          <CardDescription>
            Manage API keys for your company. These keys allow secure access to your company's APIs.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2">
            <Button 
              onClick={() => {
                if (!selectedCompany) {
                  setError('Please select a company first before creating an API key.');
                  return;
                }
                setShowCreateModal(true);
              }}
            >
              Create New API Key
            </Button>
            {userCompanies && userCompanies.length > 0 && !selectedCompany && (
              <Button 
                variant="outline" 
                onClick={() => {
                  console.log('🔄 Manually setting selected company');
                  setSelectedCompany(userCompanies[0].id);
                }}
              >
                Set Company
              </Button>
            )}
            {userCompanies && userCompanies.length > 0 && selectedCompany && (
              <Button 
                variant="outline" 
                onClick={() => {
                  console.log('🔄 Refreshing companies and API keys');
                  fetchUserCompanies();
                  fetchApiKeys();
                }}
              >
                Refresh
              </Button>
            )}
            <Button variant="outline" onClick={testConnection}>
              Test API Keys
            </Button>
            <Button variant="outline" onClick={testCompaniesEndpoint}>
              Test Companies
            </Button>
            <Button variant="outline" onClick={debugAuth}>
              Debug Auth
            </Button>
          </div>

          {/* API Keys List */}
          <div className="space-y-4">
            {Array.isArray(apiKeys) && apiKeys.length > 0 ? (
              apiKeys.map((key) => (
                <div key={key.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <svg className="h-5 w-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                      </svg>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-gray-900">{key.name}</p>
                        <Badge color={statusColors[key.status] as any}>
                          {key.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-500 font-mono">{key.prefix}</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {key.permissions.map((permission) => (
                          <Badge key={permission} color="blue" variant="outline" className="text-xs">
                            {permission}
                          </Badge>
                        ))}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        Created: {new Date(key.created_at).toLocaleDateString()}
                        {key.last_used_at && (
                          <span className="ml-4">
                            Last used: {new Date(key.last_used_at).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedKey(key);
                        setShowRegenerateModal(true);
                      }}
                    >
                      Regenerate
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      color="red"
                      onClick={() => deleteApiKey(key.id)}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <div className="mx-auto h-12 w-12 text-gray-400">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                  </svg>
                </div>
                <h3 className="mt-2 text-sm font-medium text-gray-900">No API keys</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Get started by creating your first API key.
                </p>
                <div className="mt-6">
                  <Button 
                    onClick={() => {
                      if (!selectedCompany) {
                        setError('Please select a company first before creating an API key.');
                        return;
                      }
                      setShowCreateModal(true);
                    }}
                  >
                    Create API Key
                  </Button>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Create API Key Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create New API Key"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Name
            </label>
            <Input
              value={createForm.name}
              onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
              placeholder="e.g., Production API Key"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Permissions
            </label>
            <MultiSelect
              value={createForm.permissions}
              onChange={(value) => setCreateForm({ ...createForm, permissions: value })}
              options={permissionOptions}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Expires At (Optional)
            </label>
            <Input
              type="datetime-local"
              value={createForm.expires_at || ''}
              onChange={(e) => setCreateForm({ ...createForm, expires_at: e.target.value })}
            />
          </div>

          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setShowCreateModal(false)}>
              Cancel
            </Button>
            <Button onClick={createApiKey} disabled={!createForm.name}>
              Create API Key
            </Button>
          </div>
        </div>
      </Modal>

      {/* Regenerate API Key Modal */}
      <Modal
        isOpen={showRegenerateModal}
        onClose={() => setShowRegenerateModal(false)}
        title="Regenerate API Key"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            Are you sure you want to regenerate the API key "{selectedKey?.name}"? 
            The old key will be immediately invalidated.
          </p>

          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setShowRegenerateModal(false)}>
              Cancel
            </Button>
            <Button
              color="red"
              onClick={() => selectedKey && regenerateApiKey(selectedKey.id)}
            >
              Regenerate
            </Button>
          </div>
        </div>
      </Modal>

      {/* New API Key Display Modal */}
      {newApiKey && (
        <Modal
          isOpen={!!newApiKey}
          onClose={() => setNewApiKey('')}
          title="API Key Created"
        >
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600 mb-2">
                Your new API key has been created. Copy it now as it won't be shown again:
              </p>
              <div className="bg-white p-3 rounded border font-mono text-sm break-all">
                {newApiKey}
              </div>
            </div>

            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => copyToClipboard(newApiKey)}
              >
                Copy to Clipboard
              </Button>
              <Button onClick={() => setNewApiKey('')}>
                Done
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default ApiKeyManagement;
