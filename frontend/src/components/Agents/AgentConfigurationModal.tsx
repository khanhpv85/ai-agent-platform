import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-hot-toast';
import { Button } from '@components/UI';
import { 
  X, Settings, Bot, Database, Wrench, MessageSquare, Shield, Activity, Brain
} from 'lucide-react';
import { 
  Agent, 
  AgentConfiguration, 
  LLMConfig, 
  AgentTool, 
  PromptConfig, 
  KnowledgeBase,
  MemoryConfig,
  BehaviorConfig,
  SecurityConfig,
  MonitoringConfig
} from '@interfaces/agent.interface';
import { fetchKnowledgeBases } from '@services/agent.service';
import { RootState, AppDispatch } from '@store/index';
import {
  LLMSettingsBlock,
  KnowledgeBaseBlock,
  ToolsBlock,
  PromptsBlock,
  MemoryBlock,
  BehaviorBlock,
  SecurityBlock,
  MonitoringBlock
} from './ConfigurationBlocks';

interface AgentConfigurationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (configuration: AgentConfiguration) => void;
  agent: Agent | null;
  knowledgeBases: KnowledgeBase[];
  loading?: boolean;
}

const AgentConfigurationModal: React.FC<AgentConfigurationModalProps> = ({
  isOpen,
  onClose,
  onSave,
  agent,
  knowledgeBases,
  loading = false
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const { currentCompany } = useSelector((state: RootState) => state.company);
  const { loading: saveLoading, error } = useSelector((state: RootState) => state.agents);
  
  const [activeTab, setActiveTab] = useState('llm');
  const [configuration, setConfiguration] = useState<AgentConfiguration>({
    llm: {
      provider: 'openai' as any,
      model: 'gpt-3.5-turbo',
      temperature: 0.7,
      max_tokens: 1000,
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0,
      system_prompt: ''
    },
    knowledge_bases: [],
    tools: [],
    prompts: {
      system_prompt: '',
      user_prompt_template: '',
      examples: [],
      variables: []
    },
    memory: {
      type: 'short_term' as any,
      max_tokens: 2000,
      retention_days: 7,
      include_context: true,
      include_metadata: false
    },
    behavior: {
      personality: '',
      response_style: 'friendly' as any,
      confidence_threshold: 0.8,
      fallback_response: 'I apologize, but I cannot provide a confident answer to that question.',
      max_conversation_turns: 10,
      auto_escalate: false
    },
    security: {
      data_encryption: true,
      access_control: [],
      content_filtering: true,
      audit_logging: true,
      rate_limiting: {
        requests_per_minute: 60,
        requests_per_hour: 1000,
        burst_limit: 10
      }
    },
    monitoring: {
      performance_tracking: true,
      error_alerting: true,
      usage_analytics: true,
      conversation_logging: true,
      custom_metrics: []
    }
  });

  // Load agent configuration when modal opens
  useEffect(() => {
    if (isOpen && agent?.configuration) {
      setConfiguration(agent.configuration);
    }
  }, [isOpen, agent]);

  // Load knowledge bases when modal opens
  useEffect(() => {
    if (isOpen && currentCompany?.id) {
      dispatch(fetchKnowledgeBases(currentCompany.id));
    }
  }, [isOpen, currentCompany, dispatch]);

  const updateConfiguration = (section: keyof AgentConfiguration, data: any) => {
    setConfiguration(prev => ({
      ...prev,
      [section]: { ...prev[section], ...data }
    }));
  };

  if (!isOpen) return null;

  const tabs = [
    { id: 'llm', label: 'LLM Settings', icon: Bot },
    { id: 'knowledge', label: 'Knowledge Bases', icon: Database },
    { id: 'tools', label: 'Tools', icon: Wrench },
    { id: 'prompts', label: 'Prompts', icon: MessageSquare },
    { id: 'memory', label: 'Memory', icon: Brain },
    { id: 'behavior', label: 'Behavior', icon: Settings },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'monitoring', label: 'Monitoring', icon: Activity }
  ];

  const renderActiveBlock = () => {
    if (!agent?.id) return null;

    switch (activeTab) {
      case 'llm':
        return (
          <LLMSettingsBlock
            agentId={agent.id}
            llmConfig={configuration.llm}
            onUpdate={(config) => updateConfiguration('llm', config)}
            loading={loading}
          />
        );
      case 'knowledge':
        return (
          <KnowledgeBaseBlock
            agentId={agent.id}
            selectedKnowledgeBases={configuration.knowledge_bases}
            availableKnowledgeBases={knowledgeBases}
            onUpdate={(knowledgeBases) => updateConfiguration('knowledge_bases', knowledgeBases)}
            loading={loading}
          />
        );
      case 'tools':
        return (
          <ToolsBlock
            agentId={agent.id}
            tools={configuration.tools}
            onUpdate={(tools) => updateConfiguration('tools', tools)}
            loading={loading}
          />
        );
      case 'prompts':
        return (
          <PromptsBlock
            agentId={agent.id}
            promptsConfig={configuration.prompts}
            onUpdate={(config) => updateConfiguration('prompts', config)}
            loading={loading}
          />
        );
      case 'memory':
        return (
          <MemoryBlock
            agentId={agent.id}
            memoryConfig={configuration.memory}
            onUpdate={(config) => updateConfiguration('memory', config)}
            loading={loading}
          />
        );
      case 'behavior':
        return (
          <BehaviorBlock
            agentId={agent.id}
            behaviorConfig={configuration.behavior}
            onUpdate={(config) => updateConfiguration('behavior', config)}
            loading={loading}
          />
        );
      case 'security':
        return (
          <SecurityBlock
            agentId={agent.id}
            securityConfig={configuration.security}
            onUpdate={(config) => updateConfiguration('security', config)}
            loading={loading}
          />
        );
      case 'monitoring':
        return (
          <MonitoringBlock
            agentId={agent.id}
            monitoringConfig={configuration.monitoring}
            onUpdate={(config) => updateConfiguration('monitoring', config)}
            loading={loading}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full mx-4 max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
              <Settings className="w-6 h-6 text-primary-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Agent Configuration</h2>
              <p className="text-sm text-gray-600">Configure {agent?.name || 'agent'} settings and capabilities</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="flex h-[calc(90vh-120px)]">
          {/* Sidebar */}
          <div className="w-64 border-r bg-gray-50 p-4">
            <nav className="space-y-2">
              {tabs.map(tab => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                      activeTab === tab.id
                        ? 'bg-primary-100 text-primary-700'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {renderActiveBlock()}
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={saveLoading}
          >
            Close
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AgentConfigurationModal;
