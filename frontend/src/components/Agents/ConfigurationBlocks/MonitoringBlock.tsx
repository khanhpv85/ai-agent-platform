import React, { useState, useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { toast } from 'react-hot-toast';
import { Card, CardContent, CardHeader, CardTitle, Button, Badge } from '@components/UI';
import { Activity, Save, CheckCircle } from 'lucide-react';
import { MonitoringConfig } from '@interfaces/agent.interface';
import { updateMonitoringConfiguration } from '@services/agent.service';
import { AppDispatch } from '@store/index';

interface MonitoringBlockProps {
  agentId: string;
  monitoringConfig: MonitoringConfig;
  onUpdate: (config: MonitoringConfig) => void;
  loading?: boolean;
}

const MonitoringBlock: React.FC<MonitoringBlockProps> = ({
  agentId,
  monitoringConfig = {
    performance_tracking: true,
    error_tracking: true,
    usage_analytics: true,
    response_time_monitoring: true,
    accuracy_tracking: true,
    alert_thresholds: {
      response_time_ms: 5000,
      error_rate_percent: 5,
      accuracy_threshold: 0.8
    },
    reporting_frequency: 'daily',
    metrics_retention_days: 90
  },
  onUpdate,
  loading = false
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [localConfig, setLocalConfig] = useState<MonitoringConfig>(monitoringConfig);
  const currentAgentIdRef = useRef<string>(agentId);

  // Reset state when agentId changes (switching between agents)
  useEffect(() => {
    if (currentAgentIdRef.current !== agentId) {
      // Agent changed, reset all state
      console.log('MonitoringBlock Agent Change:', {
        from: currentAgentIdRef.current,
        to: agentId,
        newConfig: monitoringConfig
      });
      
      setLocalConfig(monitoringConfig || {
        performance_tracking: true,
        error_tracking: true,
        usage_analytics: true,
        response_time_monitoring: true,
        accuracy_tracking: true,
        alert_thresholds: {
          response_time_ms: 5000,
          error_rate_percent: 5,
          accuracy_threshold: 0.8
        },
        reporting_frequency: 'daily',
        metrics_retention_days: 90
      });
      setHasChanges(false);
      setIsSaving(false);
      currentAgentIdRef.current = agentId;
    } else if (currentAgentIdRef.current === agentId && !hasChanges) {
      // Same agent, but no local changes - sync with new prop data
      setLocalConfig(monitoringConfig || {
        performance_tracking: true,
        error_tracking: true,
        usage_analytics: true,
        response_time_monitoring: true,
        accuracy_tracking: true,
        alert_thresholds: {
          response_time_ms: 5000,
          error_rate_percent: 5,
          accuracy_threshold: 0.8
        },
        reporting_frequency: 'daily',
        metrics_retention_days: 90
      });
    }
  }, [agentId, monitoringConfig, hasChanges]);

  // Check for changes whenever localConfig changes
  useEffect(() => {
    const hasLocalChanges = JSON.stringify(localConfig) !== JSON.stringify(monitoringConfig);
    setHasChanges(hasLocalChanges);
    
    console.log('MonitoringBlock Change Check:', {
      agentId: currentAgentIdRef.current,
      hasChanges: hasLocalChanges,
      localConfig: JSON.stringify(localConfig),
      monitoringConfig: JSON.stringify(monitoringConfig)
    });
  }, [localConfig, monitoringConfig]);

  const updateConfig = (updates: Partial<MonitoringConfig>) => {
    const newConfig = { ...localConfig, ...updates };
    setLocalConfig(newConfig);
    
    console.log('MonitoringBlock Update:', {
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
      const response = await dispatch(updateMonitoringConfiguration({
        agentId,
        monitoringConfig: localConfig
      })).unwrap();
      
      // Update local config with the response data to ensure consistency
      if (response?.configuration?.monitoring) {
        setLocalConfig(response.configuration.monitoring);
      }
      
      // Now call onUpdate to sync with parent
      onUpdate(localConfig);
      
      toast.success('Monitoring configuration saved successfully');
      setHasChanges(false);
    } catch (error: any) {
      toast.error(error.message || 'Failed to save monitoring configuration');
    } finally {
      setIsSaving(false);
    }
  };

  // Debug logging for component state
  console.log('MonitoringBlock Render:', {
    agentId: currentAgentIdRef.current,
    hasChanges,
    isSaving,
    loading,
    localConfig: JSON.stringify(localConfig),
    monitoringConfig: JSON.stringify(monitoringConfig)
  });

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center">
            <Activity className="w-4 h-4 text-primary-600" />
          </div>
          <div>
            <CardTitle className="text-lg">Monitoring</CardTitle>
            <p className="text-sm text-gray-600">Configure monitoring and analytics settings</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs">
            {localConfig?.reporting_frequency || 'daily'}
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
            <h3 className="text-lg font-medium text-gray-900">Tracking Features</h3>
            
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={localConfig?.performance_tracking || false}
                onChange={(e) => updateConfig({ performance_tracking: e.target.checked })}
                className="w-4 h-4 text-primary-600"
              />
              <span className="text-sm font-medium text-gray-700">Performance Tracking</span>
            </label>
            <p className="text-xs text-gray-500 ml-6">
              Track response times and throughput
            </p>
            
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={localConfig?.error_tracking || false}
                onChange={(e) => updateConfig({ error_tracking: e.target.checked })}
                className="w-4 h-4 text-primary-600"
              />
              <span className="text-sm font-medium text-gray-700">Error Tracking</span>
            </label>
            <p className="text-xs text-gray-500 ml-6">
              Monitor and log errors and exceptions
            </p>
            
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={localConfig?.usage_analytics || false}
                onChange={(e) => updateConfig({ usage_analytics: e.target.checked })}
                className="w-4 h-4 text-primary-600"
              />
              <span className="text-sm font-medium text-gray-700">Usage Analytics</span>
            </label>
            <p className="text-xs text-gray-500 ml-6">
              Track user interactions and patterns
            </p>
            
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={localConfig?.response_time_monitoring || false}
                onChange={(e) => updateConfig({ response_time_monitoring: e.target.checked })}
                className="w-4 h-4 text-primary-600"
              />
              <span className="text-sm font-medium text-gray-700">Response Time Monitoring</span>
            </label>
            <p className="text-xs text-gray-500 ml-6">
              Monitor response time performance
            </p>
            
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={localConfig?.accuracy_tracking || false}
                onChange={(e) => updateConfig({ accuracy_tracking: e.target.checked })}
                className="w-4 h-4 text-primary-600"
              />
              <span className="text-sm font-medium text-gray-700">Accuracy Tracking</span>
            </label>
            <p className="text-xs text-gray-500 ml-6">
              Track response accuracy and quality
            </p>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Alert Thresholds</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Response Time Threshold: {localConfig?.alert_thresholds?.response_time_ms || 5000}ms
              </label>
              <input
                type="range"
                min="1000"
                max="10000"
                step="500"
                value={localConfig?.alert_thresholds?.response_time_ms || 5000}
                onChange={(e) => updateConfig({
                  alert_thresholds: {
                    ...localConfig?.alert_thresholds,
                    response_time_ms: parseInt(e.target.value)
                  }
                })}
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Error Rate Threshold: {localConfig?.alert_thresholds?.error_rate_percent || 5}%
              </label>
              <input
                type="range"
                min="1"
                max="20"
                step="1"
                value={localConfig?.alert_thresholds?.error_rate_percent || 5}
                onChange={(e) => updateConfig({
                  alert_thresholds: {
                    ...localConfig?.alert_thresholds,
                    error_rate_percent: parseInt(e.target.value)
                  }
                })}
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Accuracy Threshold: {(localConfig?.alert_thresholds?.accuracy_threshold || 0.8) * 100}%
              </label>
              <input
                type="range"
                min="0.5"
                max="1.0"
                step="0.05"
                value={localConfig?.alert_thresholds?.accuracy_threshold || 0.8}
                onChange={(e) => updateConfig({
                  alert_thresholds: {
                    ...localConfig?.alert_thresholds,
                    accuracy_threshold: parseFloat(e.target.value)
                  }
                })}
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reporting Frequency
              </label>
              <select
                value={localConfig?.reporting_frequency || 'daily'}
                onChange={(e) => updateConfig({ reporting_frequency: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="hourly">Hourly</option>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Metrics Retention: {localConfig?.metrics_retention_days || 90} days
              </label>
              <input
                type="range"
                min="7"
                max="365"
                step="7"
                value={localConfig?.metrics_retention_days || 90}
                onChange={(e) => updateConfig({ metrics_retention_days: parseInt(e.target.value) })}
                className="w-full"
              />
            </div>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Activity className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-blue-900">Monitoring Features</h4>
              <ul className="text-sm text-blue-700 mt-2 space-y-1">
                <li>• <strong>Performance Tracking:</strong> Monitor response times and throughput</li>
                <li>• <strong>Error Tracking:</strong> Log and analyze errors and exceptions</li>
                <li>• <strong>Usage Analytics:</strong> Track user interactions and patterns</li>
                <li>• <strong>Response Time Monitoring:</strong> Monitor performance metrics</li>
                <li>• <strong>Accuracy Tracking:</strong> Measure response quality and accuracy</li>
                <li>• <strong>Alert Thresholds:</strong> Set up automated alerts for issues</li>
                <li>• <strong>Reporting:</strong> Generate regular performance reports</li>
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
                  You have unsaved changes to your monitoring configuration. Click "Save" to persist your changes.
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MonitoringBlock;
