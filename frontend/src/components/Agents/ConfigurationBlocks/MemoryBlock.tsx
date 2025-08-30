import React, { useState, useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { toast } from 'react-hot-toast';
import { Card, CardContent, CardHeader, CardTitle, Button, Badge } from '@components/UI';
import { Brain, Save, CheckCircle } from 'lucide-react';
import { MemoryConfig, MemoryType } from '@interfaces/agent.interface';
import { updateMemoryConfiguration } from '@services/agent.service';
import { AppDispatch } from '@store/index';

interface MemoryBlockProps {
  agentId: string;
  memoryConfig: MemoryConfig;
  onUpdate: (config: MemoryConfig) => void;
  loading?: boolean;
}

const MemoryBlock: React.FC<MemoryBlockProps> = ({
  agentId,
  memoryConfig = {
    type: MemoryType.SHORT_TERM,
    max_tokens: 2000,
    retention_days: 30,
    include_context: true,
    include_metadata: false
  },
  onUpdate,
  loading = false
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [localConfig, setLocalConfig] = useState<MemoryConfig>(memoryConfig);
  const currentAgentIdRef = useRef<string>(agentId);

  // Reset state when agentId changes (switching between agents)
  useEffect(() => {
    if (currentAgentIdRef.current !== agentId) {
      // Agent changed, reset all state
      console.log('MemoryBlock Agent Change:', {
        from: currentAgentIdRef.current,
        to: agentId,
        newConfig: memoryConfig
      });
      
      setLocalConfig(memoryConfig || {
        type: MemoryType.SHORT_TERM,
        max_tokens: 2000,
        retention_days: 30,
        include_context: true,
        include_metadata: false
      });
      setHasChanges(false);
      setIsSaving(false);
      currentAgentIdRef.current = agentId;
    } else if (currentAgentIdRef.current === agentId && !hasChanges) {
      // Same agent, but no local changes - sync with new prop data
      setLocalConfig(memoryConfig || {
        type: MemoryType.SHORT_TERM,
        max_tokens: 2000,
        retention_days: 30,
        include_context: true,
        include_metadata: false
      });
    }
  }, [agentId, memoryConfig, hasChanges]);

  // Check for changes whenever localConfig changes
  useEffect(() => {
    const hasLocalChanges = JSON.stringify(localConfig) !== JSON.stringify(memoryConfig);
    setHasChanges(hasLocalChanges);
    
    console.log('MemoryBlock Change Check:', {
      agentId: currentAgentIdRef.current,
      hasChanges: hasLocalChanges,
      localConfig: JSON.stringify(localConfig),
      memoryConfig: JSON.stringify(memoryConfig)
    });
  }, [localConfig, memoryConfig]);

  const updateConfig = (updates: Partial<MemoryConfig>) => {
    const newConfig = { ...localConfig, ...updates };
    setLocalConfig(newConfig);
    
    console.log('MemoryBlock Update:', {
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
      const response = await dispatch(updateMemoryConfiguration({
        agentId,
        memoryConfig: localConfig
      })).unwrap();
      
      // Update local config with the response data to ensure consistency
      if (response?.configuration?.memory) {
        setLocalConfig(response.configuration.memory);
      }
      
      // Now call onUpdate to sync with parent
      onUpdate(localConfig);
      
      toast.success('Memory configuration saved successfully');
      setHasChanges(false);
    } catch (error: any) {
      toast.error(error.message || 'Failed to save memory configuration');
    } finally {
      setIsSaving(false);
    }
  };

  // Debug logging for component state
  console.log('MemoryBlock Render:', {
    agentId: currentAgentIdRef.current,
    hasChanges,
    isSaving,
    loading,
    localConfig: JSON.stringify(localConfig),
    memoryConfig: JSON.stringify(memoryConfig)
  });

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center">
            <Brain className="w-4 h-4 text-primary-600" />
          </div>
          <div>
            <CardTitle className="text-lg">Memory</CardTitle>
            <p className="text-sm text-gray-600">Configure agent memory and context retention</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs">
            {localConfig?.type?.replace('_', ' ').toLowerCase() || 'short-term'}
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
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Memory Type
            </label>
            <select
              value={localConfig?.type || MemoryType.SHORT_TERM}
              onChange={(e) => updateConfig({ type: e.target.value as MemoryType })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              {Object.values(MemoryType).map(type => (
                <option key={type} value={type}>
                  {type.replace('_', ' ').toLowerCase()}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Max Tokens: {localConfig?.max_tokens || 2000}
            </label>
            <input
              type="range"
              min="500"
              max="10000"
              step="500"
              value={localConfig?.max_tokens || 2000}
              onChange={(e) => updateConfig({ max_tokens: parseInt(e.target.value) })}
              className="w-full"
            />
            <p className="text-xs text-gray-500 mt-1">
              Maximum tokens to store in memory
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Retention Days: {localConfig?.retention_days || 30}
            </label>
            <input
              type="range"
              min="1"
              max="365"
              step="1"
              value={localConfig?.retention_days || 30}
              onChange={(e) => updateConfig({ retention_days: parseInt(e.target.value) })}
              className="w-full"
            />
            <p className="text-xs text-gray-500 mt-1">
              How long to keep memory data
            </p>
          </div>

          <div className="space-y-3">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={localConfig?.include_context || false}
                onChange={(e) => updateConfig({ include_context: e.target.checked })}
                className="w-4 h-4 text-primary-600"
              />
              <span className="text-sm font-medium text-gray-700">Include Context</span>
            </label>
            <p className="text-xs text-gray-500 ml-6">
              Include conversation context in memory
            </p>
            
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={localConfig?.include_metadata || false}
                onChange={(e) => updateConfig({ include_metadata: e.target.checked })}
                className="w-4 h-4 text-primary-600"
              />
              <span className="text-sm font-medium text-gray-700">Include Metadata</span>
            </label>
            <p className="text-xs text-gray-500 ml-6">
              Store additional metadata with memories
            </p>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Brain className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-blue-900">Memory Types</h4>
              <ul className="text-sm text-blue-700 mt-2 space-y-1">
                <li>• <strong>Short-term:</strong> Temporary memory for current session</li>
                <li>• <strong>Long-term:</strong> Persistent memory across sessions</li>
                <li>• <strong>Episodic:</strong> Memory of specific events and conversations</li>
                <li>• <strong>Semantic:</strong> Memory of facts and knowledge</li>
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
                  You have unsaved changes to your memory configuration. Click "Save" to persist your changes.
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MemoryBlock;
