import React, { useState, useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { toast } from 'react-hot-toast';
import { Card, CardContent, CardHeader, CardTitle, Button, Input, Badge } from '@components/UI';
import { Bot, Save, CheckCircle } from 'lucide-react';
import { LLMConfig, LLMProvider } from '@interfaces/agent.interface';
import { updateLLMConfiguration } from '@services/agent.service';
import { AppDispatch } from '@store/index';

interface LLMSettingsBlockProps {
  agentId: string;
  llmConfig: LLMConfig;
  onUpdate: (config: LLMConfig) => void;
  loading?: boolean;
}

const LLMSettingsBlock: React.FC<LLMSettingsBlockProps> = ({
  agentId,
  llmConfig,
  onUpdate,
  loading = false
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [localConfig, setLocalConfig] = useState<LLMConfig>(llmConfig);
  const initialConfigRef = useRef<LLMConfig>(llmConfig);
  const currentAgentIdRef = useRef<string>(agentId);

  // Reset state when agentId changes (switching between agents)
  useEffect(() => {
    if (currentAgentIdRef.current !== agentId) {
      // Agent changed, reset all state
      console.log('LLMSettingsBlock Agent Change:', {
        from: currentAgentIdRef.current,
        to: agentId,
        newConfig: JSON.stringify(llmConfig)
      });
      
      setLocalConfig(llmConfig);
      initialConfigRef.current = llmConfig;
      setHasChanges(false);
      setIsSaving(false);
      currentAgentIdRef.current = agentId;
    } else if (currentAgentIdRef.current === agentId && !hasChanges) {
      // Same agent, but no local changes - sync with new prop data
      setLocalConfig(llmConfig);
      initialConfigRef.current = llmConfig;
    }
  }, [agentId, llmConfig, hasChanges]);

  // Simple change detection function
  const checkForChanges = () => {
    const currentString = JSON.stringify(localConfig);
    const initialString = JSON.stringify(initialConfigRef.current);
    const hasLocalChanges = currentString !== initialString;
    setHasChanges(hasLocalChanges);
    
    console.log('LLMSettingsBlock Change Check:', {
      agentId: currentAgentIdRef.current,
      hasChanges: hasLocalChanges,
      current: currentString,
      initial: initialString
    });
  };

  // Check for changes whenever localConfig changes
  useEffect(() => {
    checkForChanges();
  }, [localConfig]);

  const updateConfig = (updates: Partial<LLMConfig>) => {
    const newConfig = { ...localConfig, ...updates };
    setLocalConfig(newConfig);
    
    // Don't call onUpdate immediately to avoid parent re-renders
    // Only call onUpdate when saving
    
    console.log('LLMSettingsBlock Update:', {
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
      const response = await dispatch(updateLLMConfiguration({
        agentId,
        llmConfig: localConfig
      })).unwrap();
      
      // Update local config with the response data to ensure consistency
      if (response?.configuration?.llm) {
        setLocalConfig(response.configuration.llm);
        initialConfigRef.current = response.configuration.llm;
      }
      
      // Now call onUpdate to sync with parent
      onUpdate(localConfig);
      
      toast.success('LLM settings saved successfully');
      setHasChanges(false);
    } catch (error: any) {
      toast.error(error.message || 'Failed to save LLM settings');
    } finally {
      setIsSaving(false);
    }
  };

  // Debug logging for component state
  console.log('LLMSettingsBlock Render:', {
    agentId: currentAgentIdRef.current,
    hasChanges,
    isSaving,
    loading,
    localConfig: JSON.stringify(localConfig),
    initialConfig: JSON.stringify(initialConfigRef.current)
  });

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center">
            <Bot className="w-4 h-4 text-primary-600" />
          </div>
          <div>
            <CardTitle className="text-lg">LLM Settings</CardTitle>
            <p className="text-sm text-gray-600">Configure language model parameters</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
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
              Provider
            </label>
            <select
              value={localConfig.provider}
              onChange={(e) => updateConfig({ provider: e.target.value as LLMProvider })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              {Object.values(LLMProvider).map(provider => (
                <option key={provider} value={provider}>
                  {provider.charAt(0).toUpperCase() + provider.slice(1)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Model
            </label>
            <Input
              value={localConfig.model}
              onChange={(e) => updateConfig({ model: e.target.value })}
              placeholder="e.g., gpt-3.5-turbo"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Temperature: {localConfig.temperature}
            </label>
            <div className="flex items-center gap-2">
              <input
                type="range"
                min="0"
                max="2"
                step="0.1"
                value={localConfig.temperature}
                onChange={(e) => updateConfig({ temperature: parseFloat(e.target.value) })}
                className="flex-1"
              />
              <span className="text-xs text-gray-500 w-8">0</span>
              <span className="text-xs text-gray-500 w-8">2</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {localConfig.temperature < 0.3 ? 'More focused' : 
               localConfig.temperature > 1.0 ? 'More creative' : 'Balanced'}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Max Tokens
            </label>
            <Input
              type="number"
              value={localConfig.max_tokens}
              onChange={(e) => updateConfig({ max_tokens: parseInt(e.target.value) })}
              placeholder="1000"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Top P: {localConfig.top_p}
            </label>
            <div className="flex items-center gap-2">
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={localConfig.top_p}
                onChange={(e) => updateConfig({ top_p: parseFloat(e.target.value) })}
                className="flex-1"
              />
              <span className="text-xs text-gray-500 w-8">0</span>
              <span className="text-xs text-gray-500 w-8">1</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Frequency Penalty: {localConfig.frequency_penalty}
            </label>
            <div className="flex items-center gap-2">
              <input
                type="range"
                min="-2"
                max="2"
                step="0.1"
                value={localConfig.frequency_penalty}
                onChange={(e) => updateConfig({ frequency_penalty: parseFloat(e.target.value) })}
                className="flex-1"
              />
              <span className="text-xs text-gray-500 w-8">-2</span>
              <span className="text-xs text-gray-500 w-8">2</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Presence Penalty: {localConfig.presence_penalty}
            </label>
            <div className="flex items-center gap-2">
              <input
                type="range"
                min="-2"
                max="2"
                step="0.1"
                value={localConfig.presence_penalty}
                onChange={(e) => updateConfig({ presence_penalty: parseFloat(e.target.value) })}
                className="flex-1"
              />
              <span className="text-xs text-gray-500 w-8">-2</span>
              <span className="text-xs text-gray-500 w-8">2</span>
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            System Prompt
          </label>
          <textarea
            value={localConfig.system_prompt || ''}
            onChange={(e) => updateConfig({ system_prompt: e.target.value })}
            placeholder="Enter system prompt that defines the agent's role and behavior..."
            rows={6}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
          <p className="text-xs text-gray-500 mt-1">
            {localConfig.system_prompt?.length || 0} characters
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Custom Headers (Optional)
          </label>
          <textarea
            value={JSON.stringify(localConfig.custom_headers || {}, null, 2)}
            onChange={(e) => {
              try {
                const headers = JSON.parse(e.target.value);
                updateConfig({ custom_headers: headers });
              } catch (error) {
                // Invalid JSON, ignore
              }
            }}
            placeholder='{"Authorization": "Bearer your-token", "Custom-Header": "value"}'
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 font-mono text-sm"
          />
        </div>

        {hasChanges && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-blue-900">Unsaved Changes</h4>
                <p className="text-sm text-blue-700 mt-1">
                  You have unsaved changes to your LLM settings. Click "Save" to persist your changes.
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default LLMSettingsBlock;
