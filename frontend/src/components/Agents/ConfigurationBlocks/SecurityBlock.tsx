import React, { useState, useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { toast } from 'react-hot-toast';
import { Card, CardContent, CardHeader, CardTitle, Button, Badge } from '@components/UI';
import { Shield, Save, CheckCircle } from 'lucide-react';
import { SecurityConfig } from '@interfaces/agent.interface';
import { updateSecurityConfiguration } from '@services/agent.service';
import { AppDispatch } from '@store/index';

interface SecurityBlockProps {
  agentId: string;
  securityConfig: SecurityConfig;
  onUpdate: (config: SecurityConfig) => void;
  loading?: boolean;
}

const SecurityBlock: React.FC<SecurityBlockProps> = ({
  agentId,
  securityConfig = {
    data_encryption: true,
    access_control: 'role_based',
    audit_logging: true,
    rate_limiting: true,
    max_requests_per_minute: 60,
    allowed_domains: [],
    blocked_keywords: [],
    content_filtering: true,
    privacy_compliance: ['gdpr', 'ccpa']
  },
  onUpdate,
  loading = false
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [localConfig, setLocalConfig] = useState<SecurityConfig>(securityConfig);
  const currentAgentIdRef = useRef<string>(agentId);

  // Reset state when agentId changes (switching between agents)
  useEffect(() => {
    if (currentAgentIdRef.current !== agentId) {
      // Agent changed, reset all state
      console.log('SecurityBlock Agent Change:', {
        from: currentAgentIdRef.current,
        to: agentId,
        newConfig: securityConfig
      });
      
      setLocalConfig(securityConfig || {
        data_encryption: true,
        access_control: 'role_based',
        audit_logging: true,
        rate_limiting: true,
        max_requests_per_minute: 60,
        allowed_domains: [],
        blocked_keywords: [],
        content_filtering: true,
        privacy_compliance: ['gdpr', 'ccpa']
      });
      setHasChanges(false);
      setIsSaving(false);
      currentAgentIdRef.current = agentId;
    } else if (currentAgentIdRef.current === agentId && !hasChanges) {
      // Same agent, but no local changes - sync with new prop data
      setLocalConfig(securityConfig || {
        data_encryption: true,
        access_control: 'role_based',
        audit_logging: true,
        rate_limiting: true,
        max_requests_per_minute: 60,
        allowed_domains: [],
        blocked_keywords: [],
        content_filtering: true,
        privacy_compliance: ['gdpr', 'ccpa']
      });
    }
  }, [agentId, securityConfig, hasChanges]);

  // Check for changes whenever localConfig changes
  useEffect(() => {
    const hasLocalChanges = JSON.stringify(localConfig) !== JSON.stringify(securityConfig);
    setHasChanges(hasLocalChanges);
    
    console.log('SecurityBlock Change Check:', {
      agentId: currentAgentIdRef.current,
      hasChanges: hasLocalChanges,
      localConfig: JSON.stringify(localConfig),
      securityConfig: JSON.stringify(securityConfig)
    });
  }, [localConfig, securityConfig]);

  const updateConfig = (updates: Partial<SecurityConfig>) => {
    const newConfig = { ...localConfig, ...updates };
    setLocalConfig(newConfig);
    
    console.log('SecurityBlock Update:', {
      agentId: currentAgentIdRef.current,
      updates,
      newConfig: JSON.stringify(newConfig)
    });
  };

  const handleSave = async () => {
    if (!hasChanges) {
      toast.info('No changes to save');
      return;
    }

    setIsSaving(true);
    try {
      const response = await dispatch(updateSecurityConfiguration({
        agentId,
        securityConfig: localConfig
      })).unwrap();
      
      // Update local config with the response data to ensure consistency
      if (response?.configuration?.security) {
        setLocalConfig(response.configuration.security);
      }
      
      // Now call onUpdate to sync with parent
      onUpdate(localConfig);
      
      toast.success('Security configuration saved successfully');
      setHasChanges(false);
    } catch (error: any) {
      toast.error(error.message || 'Failed to save security configuration');
    } finally {
      setIsSaving(false);
    }
  };

  // Debug logging for component state
  console.log('SecurityBlock Render:', {
    agentId: currentAgentIdRef.current,
    hasChanges,
    isSaving,
    loading,
    localConfig: JSON.stringify(localConfig),
    securityConfig: JSON.stringify(securityConfig)
  });

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center">
            <Shield className="w-4 h-4 text-primary-600" />
          </div>
          <div>
            <CardTitle className="text-lg">Security</CardTitle>
            <p className="text-sm text-gray-600">Configure security and privacy settings</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs">
            {localConfig?.access_control?.replace('_', ' ') || 'role based'}
          </Badge>
          {hasChanges && (
            <Badge variant="outline" className="text-xs text-orange-600">
              Unsaved Changes
            </Badge>
          )}
          <Button
            size="sm"
            onClick={handleSave}
            loading={isSaving}
            disabled={!hasChanges || loading}
            className="flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            Save
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Data Protection</h3>
            
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={localConfig?.data_encryption || false}
                onChange={(e) => updateConfig({ data_encryption: e.target.checked })}
                className="w-4 h-4 text-primary-600"
              />
              <span className="text-sm font-medium text-gray-700">Data Encryption</span>
            </label>
            <p className="text-xs text-gray-500 ml-6">
              Encrypt all data in transit and at rest
            </p>
            
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={localConfig?.audit_logging || false}
                onChange={(e) => updateConfig({ audit_logging: e.target.checked })}
                className="w-4 h-4 text-primary-600"
              />
              <span className="text-sm font-medium text-gray-700">Audit Logging</span>
            </label>
            <p className="text-xs text-gray-500 ml-6">
              Log all access and data modifications
            </p>
            
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={localConfig?.content_filtering || false}
                onChange={(e) => updateConfig({ content_filtering: e.target.checked })}
                className="w-4 h-4 text-primary-600"
              />
              <span className="text-sm font-medium text-gray-700">Content Filtering</span>
            </label>
            <p className="text-xs text-gray-500 ml-6">
              Filter inappropriate or sensitive content
            </p>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Access Control</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Access Control Method
              </label>
              <select
                value={localConfig?.access_control || 'role_based'}
                onChange={(e) => updateConfig({ access_control: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="role_based">Role-based</option>
                <option value="attribute_based">Attribute-based</option>
                <option value="policy_based">Policy-based</option>
                <option value="identity_based">Identity-based</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rate Limiting
              </label>
              <div className="space-y-2">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={localConfig?.rate_limiting || false}
                    onChange={(e) => updateConfig({ rate_limiting: e.target.checked })}
                    className="w-4 h-4 text-primary-600"
                  />
                  <span className="text-sm text-gray-700">Enable Rate Limiting</span>
                </label>
                {localConfig?.rate_limiting && (
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">
                      Max Requests per Minute: {localConfig?.max_requests_per_minute || 60}
                    </label>
                    <input
                      type="range"
                      min="10"
                      max="200"
                      step="10"
                      value={localConfig?.max_requests_per_minute || 60}
                      onChange={(e) => updateConfig({ max_requests_per_minute: parseInt(e.target.value) })}
                      className="w-full"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900">Privacy & Compliance</h3>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Privacy Compliance
            </label>
            <div className="space-y-2">
              {['gdpr', 'ccpa', 'hipaa', 'sox', 'pci'].map(compliance => (
                <label key={compliance} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={localConfig?.privacy_compliance?.includes(compliance) || false}
                    onChange={(e) => {
                      const current = localConfig?.privacy_compliance || [];
                      const updated = e.target.checked
                        ? [...current, compliance]
                        : current.filter(c => c !== compliance);
                      updateConfig({ privacy_compliance: updated });
                    }}
                    className="w-4 h-4 text-primary-600"
                  />
                  <span className="text-sm text-gray-700">{compliance.toUpperCase()}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Shield className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-blue-900">Security Features</h4>
              <ul className="text-sm text-blue-700 mt-2 space-y-1">
                <li>• <strong>Data Encryption:</strong> Protects sensitive information</li>
                <li>• <strong>Access Control:</strong> Manages who can access the agent</li>
                <li>• <strong>Audit Logging:</strong> Tracks all activities for compliance</li>
                <li>• <strong>Rate Limiting:</strong> Prevents abuse and overload</li>
                <li>• <strong>Content Filtering:</strong> Blocks inappropriate content</li>
                <li>• <strong>Privacy Compliance:</strong> Ensures regulatory compliance</li>
              </ul>
            </div>
          </div>
        </div>

        {hasChanges && (
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-orange-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-orange-900">Unsaved Changes</h4>
                <p className="text-sm text-orange-700 mt-1">
                  You have unsaved changes to your security configuration. Click "Save" to persist your changes.
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SecurityBlock;
