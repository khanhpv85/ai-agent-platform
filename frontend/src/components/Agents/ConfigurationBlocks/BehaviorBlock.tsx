import React, { useState, useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { toast } from 'react-hot-toast';
import { Card, CardContent, CardHeader, CardTitle, Button, Badge } from '@components/UI';
import { User, Save, CheckCircle } from 'lucide-react';
import { BehaviorConfig } from '@interfaces/agent.interface';
import { updateBehaviorConfiguration } from '@services/agent.service';
import { AppDispatch } from '@store/index';

interface BehaviorBlockProps {
  agentId: string;
  behaviorConfig: BehaviorConfig;
  onUpdate: (config: BehaviorConfig) => void;
  loading?: boolean;
}

const BehaviorBlock: React.FC<BehaviorBlockProps> = ({
  agentId,
  behaviorConfig = {
    personality: '',
    communication_style: 'professional',
    response_length: 'medium',
    formality_level: 'neutral',
    empathy_level: 'medium',
    humor_level: 'none',
    creativity_level: 'medium',
    decision_making_style: 'analytical'
  },
  onUpdate,
  loading = false
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [localConfig, setLocalConfig] = useState<BehaviorConfig>(behaviorConfig);
  const currentAgentIdRef = useRef<string>(agentId);

  // Reset state when agentId changes (switching between agents)
  useEffect(() => {
    if (currentAgentIdRef.current !== agentId) {
      // Agent changed, reset all state
      console.log('BehaviorBlock Agent Change:', {
        from: currentAgentIdRef.current,
        to: agentId,
        newConfig: behaviorConfig
      });
      
      setLocalConfig(behaviorConfig || {
        personality: '',
        communication_style: 'professional',
        response_length: 'medium',
        formality_level: 'neutral',
        empathy_level: 'medium',
        humor_level: 'none',
        creativity_level: 'medium',
        decision_making_style: 'analytical'
      });
      setHasChanges(false);
      setIsSaving(false);
      currentAgentIdRef.current = agentId;
    } else if (currentAgentIdRef.current === agentId && !hasChanges) {
      // Same agent, but no local changes - sync with new prop data
      setLocalConfig(behaviorConfig || {
        personality: '',
        communication_style: 'professional',
        response_length: 'medium',
        formality_level: 'neutral',
        empathy_level: 'medium',
        humor_level: 'none',
        creativity_level: 'medium',
        decision_making_style: 'analytical'
      });
    }
  }, [agentId, behaviorConfig, hasChanges]);

  // Check for changes whenever localConfig changes
  useEffect(() => {
    const hasLocalChanges = JSON.stringify(localConfig) !== JSON.stringify(behaviorConfig);
    setHasChanges(hasLocalChanges);
    
    console.log('BehaviorBlock Change Check:', {
      agentId: currentAgentIdRef.current,
      hasChanges: hasLocalChanges,
      localConfig: JSON.stringify(localConfig),
      behaviorConfig: JSON.stringify(behaviorConfig)
    });
  }, [localConfig, behaviorConfig]);

  const updateConfig = (updates: Partial<BehaviorConfig>) => {
    const newConfig = { ...localConfig, ...updates };
    setLocalConfig(newConfig);
    
    console.log('BehaviorBlock Update:', {
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
      const response = await dispatch(updateBehaviorConfiguration({
        agentId,
        behaviorConfig: localConfig
      })).unwrap();
      
      // Update local config with the response data to ensure consistency
      if (response?.configuration?.behavior) {
        setLocalConfig(response.configuration.behavior);
      }
      
      // Now call onUpdate to sync with parent
      onUpdate(localConfig);
      
      toast.success('Behavior configuration saved successfully');
      setHasChanges(false);
    } catch (error: any) {
      toast.error(error.message || 'Failed to save behavior configuration');
    } finally {
      setIsSaving(false);
    }
  };

  // Debug logging for component state
  console.log('BehaviorBlock Render:', {
    agentId: currentAgentIdRef.current,
    hasChanges,
    isSaving,
    loading,
    localConfig: JSON.stringify(localConfig),
    behaviorConfig: JSON.stringify(behaviorConfig)
  });

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center">
            <User className="w-4 h-4 text-primary-600" />
          </div>
          <div>
            <CardTitle className="text-lg">Behavior</CardTitle>
            <p className="text-sm text-gray-600">Configure agent personality and behavior</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs">
            {localConfig?.communication_style || 'professional'}
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
              Personality Description
            </label>
            <textarea
              value={localConfig?.personality || ''}
              onChange={(e) => updateConfig({ personality: e.target.value })}
              placeholder="Describe the agent's personality, traits, and characteristics..."
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Communication Style
              </label>
              <select
                value={localConfig?.communication_style || 'professional'}
                onChange={(e) => updateConfig({ communication_style: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="professional">Professional</option>
                <option value="casual">Casual</option>
                <option value="friendly">Friendly</option>
                <option value="formal">Formal</option>
                <option value="direct">Direct</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Response Length
              </label>
              <select
                value={localConfig?.response_length || 'medium'}
                onChange={(e) => updateConfig({ response_length: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="short">Short</option>
                <option value="medium">Medium</option>
                <option value="long">Long</option>
                <option value="detailed">Detailed</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Formality Level
              </label>
              <select
                value={localConfig?.formality_level || 'neutral'}
                onChange={(e) => updateConfig({ formality_level: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="very_formal">Very Formal</option>
                <option value="formal">Formal</option>
                <option value="neutral">Neutral</option>
                <option value="casual">Casual</option>
                <option value="very_casual">Very Casual</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Empathy Level
              </label>
              <select
                value={localConfig?.empathy_level || 'medium'}
                onChange={(e) => updateConfig({ empathy_level: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="none">None</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="very_high">Very High</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Humor Level
              </label>
              <select
                value={localConfig?.humor_level || 'none'}
                onChange={(e) => updateConfig({ humor_level: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="none">None</option>
                <option value="subtle">Subtle</option>
                <option value="moderate">Moderate</option>
                <option value="playful">Playful</option>
                <option value="very_playful">Very Playful</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Creativity Level
              </label>
              <select
                value={localConfig?.creativity_level || 'medium'}
                onChange={(e) => updateConfig({ creativity_level: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="none">None</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="very_high">Very High</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Decision Making Style
              </label>
              <select
                value={localConfig?.decision_making_style || 'analytical'}
                onChange={(e) => updateConfig({ decision_making_style: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="analytical">Analytical</option>
                <option value="intuitive">Intuitive</option>
                <option value="conservative">Conservative</option>
                <option value="aggressive">Aggressive</option>
                <option value="balanced">Balanced</option>
              </select>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <User className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-blue-900">Behavior Guidelines</h4>
              <ul className="text-sm text-blue-700 mt-2 space-y-1">
                <li>• <strong>Personality:</strong> Defines the agent's core character and traits</li>
                <li>• <strong>Communication Style:</strong> How the agent interacts and responds</li>
                <li>• <strong>Response Length:</strong> Controls the detail level of responses</li>
                <li>• <strong>Formality:</strong> Sets the tone and language formality</li>
                <li>• <strong>Empathy:</strong> How understanding and supportive the agent is</li>
                <li>• <strong>Humor:</strong> Level of wit and playfulness in responses</li>
                <li>• <strong>Creativity:</strong> How innovative and original the agent is</li>
                <li>• <strong>Decision Making:</strong> Approach to problem-solving and choices</li>
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
                  You have unsaved changes to your behavior configuration. Click "Save" to persist your changes.
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default BehaviorBlock;
