import React, { useState, useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { toast } from 'react-hot-toast';
import { Card, CardContent, CardHeader, CardTitle, Button, Input, Badge } from '@components/UI';
import { MessageSquare, Save, CheckCircle, Plus, Trash2 } from 'lucide-react';
import { PromptConfig, PromptExample } from '@interfaces/agent.interface';
import { updatePromptsConfiguration } from '@services/agent.service';
import { AppDispatch } from '@store/index';

interface PromptsBlockProps {
  agentId: string;
  promptsConfig: PromptConfig;
  onUpdate: (config: PromptConfig) => void;
  loading?: boolean;
}

const PromptsBlock: React.FC<PromptsBlockProps> = ({
  agentId,
  promptsConfig = {
    system_prompt: '',
    user_prompt_template: '',
    context_prompt: '',
    examples: [],
    variables: []
  },
  onUpdate,
  loading = false
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [localConfig, setLocalConfig] = useState<PromptConfig>(promptsConfig);
  const currentAgentIdRef = useRef<string>(agentId);

  // Reset state when agentId changes (switching between agents)
  useEffect(() => {
    if (currentAgentIdRef.current !== agentId) {
      // Agent changed, reset all state
      console.log('PromptsBlock Agent Change:', {
        from: currentAgentIdRef.current,
        to: agentId,
        newConfig: promptsConfig
      });
      
      setLocalConfig(promptsConfig || {
        system_prompt: '',
        user_prompt_template: '',
        context_prompt: '',
        examples: [],
        variables: []
      });
      setHasChanges(false);
      setIsSaving(false);
      currentAgentIdRef.current = agentId;
    } else if (currentAgentIdRef.current === agentId && !hasChanges) {
      // Same agent, but no local changes - sync with new prop data
      setLocalConfig(promptsConfig || {
        system_prompt: '',
        user_prompt_template: '',
        context_prompt: '',
        examples: [],
        variables: []
      });
    }
  }, [agentId, promptsConfig, hasChanges]);

  // Check for changes whenever localConfig changes
  useEffect(() => {
    const hasLocalChanges = JSON.stringify(localConfig) !== JSON.stringify(promptsConfig);
    setHasChanges(hasLocalChanges);
    
    console.log('PromptsBlock Change Check:', {
      agentId: currentAgentIdRef.current,
      hasChanges: hasLocalChanges,
      localConfig: JSON.stringify(localConfig),
      promptsConfig: JSON.stringify(promptsConfig)
    });
  }, [localConfig, promptsConfig]);

  const updateConfig = (updates: Partial<PromptConfig>) => {
    const newConfig = { ...localConfig, ...updates };
    setLocalConfig(newConfig);
    
    console.log('PromptsBlock Update:', {
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
      const response = await dispatch(updatePromptsConfiguration({
        agentId,
        promptsConfig: localConfig
      })).unwrap();
      
      // Update local config with the response data to ensure consistency
      if (response?.configuration?.prompts) {
        setLocalConfig(response.configuration.prompts);
      }
      
      // Now call onUpdate to sync with parent
      onUpdate(localConfig);
      
      toast.success('Prompts configuration saved successfully');
      setHasChanges(false);
    } catch (error: any) {
      toast.error(error.message || 'Failed to save prompts configuration');
    } finally {
      setIsSaving(false);
    }
  };

  const addExample = () => {
    const newExample: PromptExample = {
      input: '',
      output: '',
      explanation: ''
    };
    updateConfig({
      examples: [...(localConfig.examples || []), newExample]
    });
  };

  const updateExample = (index: number, updates: Partial<PromptExample>) => {
    const updatedExamples = [...(localConfig.examples || [])];
    updatedExamples[index] = { ...updatedExamples[index], ...updates };
    updateConfig({ examples: updatedExamples });
  };

  const removeExample = (index: number) => {
    const updatedExamples = (localConfig.examples || []).filter((_, i) => i !== index);
    updateConfig({ examples: updatedExamples });
  };

  const addVariable = () => {
    const newVariable = { name: '', description: '', type: 'string' };
    updateConfig({
      variables: [...(localConfig.variables || []), newVariable]
    });
  };

  const updateVariable = (index: number, updates: any) => {
    const updatedVariables = [...(localConfig.variables || [])];
    updatedVariables[index] = { ...updatedVariables[index], ...updates };
    updateConfig({ variables: updatedVariables });
  };

  const removeVariable = (index: number) => {
    const updatedVariables = (localConfig.variables || []).filter((_, i) => i !== index);
    updateConfig({ variables: updatedVariables });
  };

  // Debug logging for component state
  console.log('PromptsBlock Render:', {
    agentId: currentAgentIdRef.current,
    hasChanges,
    isSaving,
    loading,
    localConfig: JSON.stringify(localConfig),
    promptsConfig: JSON.stringify(promptsConfig)
  });

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center">
            <MessageSquare className="w-4 h-4 text-primary-600" />
          </div>
          <div>
            <CardTitle className="text-lg">Prompts</CardTitle>
            <p className="text-sm text-gray-600">Configure prompts and conversation templates</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs">
            {(localConfig.examples?.length || 0) + (localConfig.variables?.length || 0)} items
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
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              System Prompt
            </label>
            <textarea
              value={localConfig.system_prompt || ''}
              onChange={(e) => updateConfig({ system_prompt: e.target.value })}
              placeholder="Define the agent's role, personality, and behavior..."
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              User Prompt Template
            </label>
            <textarea
              value={localConfig.user_prompt_template || ''}
              onChange={(e) => updateConfig({ user_prompt_template: e.target.value })}
              placeholder="Template for user messages with variables like {{variable_name}}..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Context Prompt (Optional)
            </label>
            <textarea
              value={localConfig.context_prompt || ''}
              onChange={(e) => updateConfig({ context_prompt: e.target.value })}
              placeholder="Additional context or instructions..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">Variables</h3>
            <Button
              variant="outline"
              size="sm"
              onClick={addVariable}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Variable
            </Button>
          </div>
          
          {(!localConfig.variables || localConfig.variables.length === 0) ? (
            <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
              <p className="text-gray-600">No variables defined</p>
              <p className="text-sm text-gray-500">Add variables to make your prompts dynamic</p>
            </div>
          ) : (
            <div className="space-y-3">
              {(localConfig.variables || []).map((variable, index) => (
                <div key={index} className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg">
                  <Input
                    value={variable.name}
                    onChange={(e) => updateVariable(index, { name: e.target.value })}
                    placeholder="Variable name"
                    className="flex-1"
                  />
                  <Input
                    value={variable.description}
                    onChange={(e) => updateVariable(index, { description: e.target.value })}
                    placeholder="Description"
                    className="flex-1"
                  />
                  <select
                    value={variable.type}
                    onChange={(e) => updateVariable(index, { type: e.target.value })}
                    className="px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="string">String</option>
                    <option value="number">Number</option>
                    <option value="boolean">Boolean</option>
                  </select>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeVariable(index)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">Examples</h3>
            <Button
              variant="outline"
              size="sm"
              onClick={addExample}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Example
            </Button>
          </div>
          
          {(!localConfig.examples || localConfig.examples.length === 0) ? (
            <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
              <p className="text-gray-600">No examples defined</p>
              <p className="text-sm text-gray-500">Add examples to help the agent understand expected responses</p>
            </div>
          ) : (
            <div className="space-y-4">
              {(localConfig.examples || []).map((example, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium text-gray-900">Example {index + 1}</h4>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeExample(index)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Input</label>
                      <textarea
                        value={example.input}
                        onChange={(e) => updateExample(index, { input: e.target.value })}
                        placeholder="User input example..."
                        rows={2}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Expected Output</label>
                      <textarea
                        value={example.output}
                        onChange={(e) => updateExample(index, { output: e.target.value })}
                        placeholder="Expected agent response..."
                        rows={2}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Explanation</label>
                      <textarea
                        value={example.explanation}
                        onChange={(e) => updateExample(index, { explanation: e.target.value })}
                        placeholder="Why this response is appropriate..."
                        rows={2}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {hasChanges && (
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-orange-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-orange-900">Unsaved Changes</h4>
                <p className="text-sm text-orange-700 mt-1">
                  You have unsaved changes to your prompts configuration. Click "Save" to persist your changes.
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PromptsBlock;
