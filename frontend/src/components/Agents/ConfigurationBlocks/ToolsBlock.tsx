import React, { useState, useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { toast } from 'react-hot-toast';
import { Card, CardContent, CardHeader, CardTitle, Button, Input, Badge } from '@components/UI';
import { 
  Wrench, Save, CheckCircle, Plus, Trash2, Search, Calculator, FileText, 
  Globe, Database, Mail, Calendar, Code, Zap 
} from 'lucide-react';
import { AgentTool, ToolType } from '@interfaces/agent.interface';
import { updateToolsConfiguration } from '@services/agent.service';
import { AppDispatch } from '@store/index';

interface ToolsBlockProps {
  agentId: string;
  tools: AgentTool[];
  onUpdate: (tools: AgentTool[]) => void;
  loading?: boolean;
}

const ToolsBlock: React.FC<ToolsBlockProps> = ({
  agentId,
  tools = [],
  onUpdate,
  loading = false
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [localTools, setLocalTools] = useState<AgentTool[]>(tools);
  const currentAgentIdRef = useRef<string>(agentId);

  // Reset state when agentId changes (switching between agents)
  useEffect(() => {
    if (currentAgentIdRef.current !== agentId) {
      // Agent changed, reset all state
      console.log('ToolsBlock Agent Change:', {
        from: currentAgentIdRef.current,
        to: agentId,
        newTools: tools
      });
      
      setLocalTools(tools || []);
      setHasChanges(false);
      setIsSaving(false);
      currentAgentIdRef.current = agentId;
    } else if (currentAgentIdRef.current === agentId && !hasChanges) {
      // Same agent, but no local changes - sync with new prop data
      setLocalTools(tools || []);
    }
  }, [agentId, tools, hasChanges]);

  // Check for changes whenever localTools changes
  useEffect(() => {
    const hasLocalChanges = JSON.stringify(localTools) !== JSON.stringify(tools);
    setHasChanges(hasLocalChanges);
    
    console.log('ToolsBlock Change Check:', {
      agentId: currentAgentIdRef.current,
      hasChanges: hasLocalChanges,
      localTools: JSON.stringify(localTools),
      tools: JSON.stringify(tools)
    });
  }, [localTools, tools]);

  const updateTools = (newTools: AgentTool[]) => {
    setLocalTools(newTools);
    
    console.log('ToolsBlock Update:', {
      agentId: currentAgentIdRef.current,
      newTools: JSON.stringify(newTools)
    });
  };

  const handleSave = async () => {
    if (!hasChanges) {
      toast.info('No changes to save');
      return;
    }

    setIsSaving(true);
    try {
      const response = await dispatch(updateToolsConfiguration({
        agentId,
        tools: localTools
      })).unwrap();
      
      // Update local tools with the response data to ensure consistency
      if (response?.configuration?.tools) {
        setLocalTools(response.configuration.tools);
      }
      
      // Now call onUpdate to sync with parent
      onUpdate(localTools);
      
      toast.success('Tools configuration saved successfully');
      setHasChanges(false);
    } catch (error: any) {
      toast.error(error.message || 'Failed to save tools configuration');
    } finally {
      setIsSaving(false);
    }
  };

  const addTool = (type: ToolType) => {
    const newTool: AgentTool = {
      id: `tool-${Date.now()}`,
      name: type.replace('_', ' ').toLowerCase(),
      type,
      description: `Configure ${type.replace('_', ' ').toLowerCase()} tool`,
      config: {},
      is_enabled: true,
      order: localTools.length
    };
    updateTools([...localTools, newTool]);
  };

  const updateTool = (index: number, updates: Partial<AgentTool>) => {
    const updatedTools = [...localTools];
    updatedTools[index] = { ...updatedTools[index], ...updates };
    updateTools(updatedTools);
  };

  const removeTool = (index: number) => {
    const updatedTools = localTools.filter((_, i) => i !== index);
    updateTools(updatedTools);
  };

  const getToolIcon = (type: ToolType) => {
    switch (type) {
      case ToolType.WEB_SEARCH: return <Search className="w-5 h-5 text-gray-600" />;
      case ToolType.CALCULATOR: return <Calculator className="w-5 h-5 text-gray-600" />;
      case ToolType.FILE_READER: return <FileText className="w-5 h-5 text-gray-600" />;
      case ToolType.API_CALLER: return <Globe className="w-5 h-5 text-gray-600" />;
      case ToolType.DATABASE_QUERY: return <Database className="w-5 h-5 text-gray-600" />;
      case ToolType.EMAIL_SENDER: return <Mail className="w-5 h-5 text-gray-600" />;
      case ToolType.CALENDAR: return <Calendar className="w-5 h-5 text-gray-600" />;
      case ToolType.CUSTOM_FUNCTION: return <Code className="w-5 h-5 text-gray-600" />;
      default: return <Wrench className="w-5 h-5 text-gray-600" />;
    }
  };

  // Debug logging for component state
  console.log('ToolsBlock Render:', {
    agentId: currentAgentIdRef.current,
    hasChanges,
    isSaving,
    loading,
    localTools: JSON.stringify(localTools),
    tools: JSON.stringify(tools)
  });

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center">
            <Wrench className="w-4 h-4 text-primary-600" />
          </div>
          <div>
            <CardTitle className="text-lg">Tools</CardTitle>
            <p className="text-sm text-gray-600">Configure tools and capabilities for your agent</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs">
            {localTools?.length || 0} tools
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
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-600">
            Add tools to extend your agent's capabilities
          </p>
          <div className="flex items-center gap-2">
            <select
              onChange={(e) => {
                if (e.target.value) {
                  addTool(e.target.value as ToolType);
                  e.target.value = '';
                }
              }}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm"
            >
              <option value="">Add Tool</option>
              {Object.values(ToolType).map(type => (
                <option key={type} value={type}>
                  {type.replace('_', ' ').toLowerCase()}
                </option>
              ))}
            </select>
          </div>
        </div>
        
        {!localTools || localTools.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
            <Wrench className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <p className="text-gray-600 font-medium">No tools configured</p>
            <p className="text-sm text-gray-500 mb-4">Add tools to enhance your agent's capabilities</p>
            <Button variant="outline" size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Add Your First Tool
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {localTools.map((tool, index) => (
              <div
                key={tool.id}
                className="border border-gray-200 rounded-lg p-4"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                      {getToolIcon(tool.type)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Input
                          value={tool.name}
                          onChange={(e) => updateTool(index, { name: e.target.value })}
                          className="w-48"
                          placeholder="Tool name"
                        />
                        <Badge variant="outline" className="text-xs">
                          {tool.type.replace('_', ' ').toLowerCase()}
                        </Badge>
                        <label className="flex items-center gap-1">
                          <input
                            type="checkbox"
                            checked={tool.is_enabled}
                            onChange={(e) => updateTool(index, { is_enabled: e.target.checked })}
                            className="w-4 h-4"
                          />
                          <span className="text-xs text-gray-600">Enabled</span>
                        </label>
                      </div>
                      <Input
                        value={tool.description}
                        onChange={(e) => updateTool(index, { description: e.target.value })}
                        placeholder="Tool description"
                        className="mb-2"
                      />
                      <div className="text-xs text-gray-500">
                        Order: {tool.order} | ID: {tool.id}
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeTool(index)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {localTools && localTools.length > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-blue-900">Tools Integration</h4>
                <p className="text-sm text-blue-700 mt-1">
                  Configured tools will be available to your agent during conversations and task execution.
                  The agent will automatically select and use the most appropriate tools based on the context.
                </p>
              </div>
            </div>
          </div>
        )}

        {hasChanges && (
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-orange-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-orange-900">Unsaved Changes</h4>
                <p className="text-sm text-orange-700 mt-1">
                  You have unsaved changes to your tools configuration. Click "Save" to persist your changes.
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ToolsBlock;
