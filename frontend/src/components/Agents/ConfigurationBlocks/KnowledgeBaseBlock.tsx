import React, { useState, useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { toast } from 'react-hot-toast';
import { Card, CardContent, CardHeader, CardTitle, Button, Input, Badge } from '@components/UI';
import { Database, Save, CheckCircle, Plus, Eye } from 'lucide-react';
import { KnowledgeBase } from '@interfaces/agent.interface';
import { updateKnowledgeBaseConfiguration } from '@services/agent.service';
import { AppDispatch } from '@store/index';

interface KnowledgeBaseBlockProps {
  agentId: string;
  selectedKnowledgeBases: string[];
  availableKnowledgeBases: KnowledgeBase[];
  onUpdate: (knowledgeBases: string[]) => void;
  loading?: boolean;
}

const KnowledgeBaseBlock: React.FC<KnowledgeBaseBlockProps> = ({
  agentId,
  selectedKnowledgeBases = [],
  availableKnowledgeBases = [],
  onUpdate,
  loading = false
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [localSelection, setLocalSelection] = useState<string[]>(selectedKnowledgeBases);
  const currentAgentIdRef = useRef<string>(agentId);

  // Reset state when agentId changes (switching between agents)
  useEffect(() => {
    if (currentAgentIdRef.current !== agentId) {
      // Agent changed, reset all state
      console.log('KnowledgeBaseBlock Agent Change:', {
        from: currentAgentIdRef.current,
        to: agentId,
        newSelection: selectedKnowledgeBases
      });
      
      setLocalSelection(selectedKnowledgeBases || []);
      setHasChanges(false);
      setIsSaving(false);
      currentAgentIdRef.current = agentId;
    } else if (currentAgentIdRef.current === agentId && !hasChanges) {
      // Same agent, but no local changes - sync with new prop data
      setLocalSelection(selectedKnowledgeBases || []);
    }
  }, [agentId, selectedKnowledgeBases, hasChanges]);

  // Check for changes whenever localSelection changes
  useEffect(() => {
    const hasLocalChanges = JSON.stringify(localSelection) !== JSON.stringify(selectedKnowledgeBases);
    setHasChanges(hasLocalChanges);
    
    console.log('KnowledgeBaseBlock Change Check:', {
      agentId: currentAgentIdRef.current,
      hasChanges: hasLocalChanges,
      localSelection: JSON.stringify(localSelection),
      selectedKnowledgeBases: JSON.stringify(selectedKnowledgeBases)
    });
  }, [localSelection, selectedKnowledgeBases]);

  const updateSelection = (newSelection: string[]) => {
    setLocalSelection(newSelection);
    
    console.log('KnowledgeBaseBlock Update:', {
      agentId: currentAgentIdRef.current,
      newSelection: JSON.stringify(newSelection)
    });
  };

  const handleSave = async () => {
    if (!hasChanges) {
      toast.info('No changes to save');
      return;
    }

    setIsSaving(true);
    try {
      const response = await dispatch(updateKnowledgeBaseConfiguration({
        agentId,
        knowledgeBases: localSelection
      })).unwrap();
      
      // Update local selection with the response data to ensure consistency
      if (response?.configuration?.knowledge_bases) {
        setLocalSelection(response.configuration.knowledge_bases);
      }
      
      // Now call onUpdate to sync with parent
      onUpdate(localSelection);
      
      toast.success('Knowledge base selection saved successfully');
      setHasChanges(false);
    } catch (error: any) {
      toast.error(error.message || 'Failed to save knowledge base selection');
    } finally {
      setIsSaving(false);
    }
  };

  const toggleKnowledgeBase = (kbId: string) => {
    const newSelection = localSelection.includes(kbId)
      ? localSelection.filter(id => id !== kbId)
      : [...localSelection, kbId];
    updateSelection(newSelection);
  };

  const selectAll = () => {
    const allIds = (availableKnowledgeBases || []).map(kb => kb.id);
    updateSelection(allIds);
  };

  const selectNone = () => {
    updateSelection([]);
  };

  // Debug logging for component state
  console.log('KnowledgeBaseBlock Render:', {
    agentId: currentAgentIdRef.current,
    hasChanges,
    isSaving,
    loading,
    localSelection: JSON.stringify(localSelection),
    selectedKnowledgeBases: JSON.stringify(selectedKnowledgeBases),
    availableKnowledgeBases: availableKnowledgeBases?.length || 0
  });

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center">
            <Database className="w-4 h-4 text-primary-600" />
          </div>
          <div>
            <CardTitle className="text-lg">Knowledge Bases</CardTitle>
            <p className="text-sm text-gray-600">Connect knowledge sources to your agent</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs">
            {localSelection?.length || 0} selected
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
        {!availableKnowledgeBases || availableKnowledgeBases.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
            <Database className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <p className="text-gray-600 font-medium">No knowledge bases available</p>
            <p className="text-sm text-gray-500 mb-4">Create knowledge bases in the Integrations section</p>
            <Button variant="outline" size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Create Knowledge Base
            </Button>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-600">
                Select knowledge bases to connect to this agent
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={selectAll}
                >
                  Select All
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={selectNone}
                >
                  Select None
                </Button>
              </div>
            </div>
            
            <div className="space-y-4">
              {availableKnowledgeBases.map(kb => (
                <div
                  key={kb.id}
                  className={`flex items-center justify-between p-4 border rounded-lg cursor-pointer transition-colors ${
                    localSelection?.includes(kb.id)
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => toggleKnowledgeBase(kb.id)}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                      <Database className="w-5 h-5 text-gray-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium text-gray-900">{kb.name}</h4>
                        <Badge variant="outline" className="text-xs">
                          {kb.source_type}
                        </Badge>
                        {kb.is_active ? (
                          <Badge className="bg-green-100 text-green-800 text-xs">
                            Active
                          </Badge>
                        ) : (
                          <Badge className="bg-gray-100 text-gray-800 text-xs">
                            Inactive
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{kb.description}</p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                        <span>Created: {new Date(kb.created_at).toLocaleDateString()}</span>
                        <span>Updated: {new Date(kb.updated_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={localSelection?.includes(kb.id) || false}
                      onChange={() => {}}
                      className="w-4 h-4 text-primary-600"
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        // TODO: Open knowledge base details modal
                      }}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {localSelection && localSelection.length > 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-blue-900">Knowledge Base Integration</h4>
                    <p className="text-sm text-blue-700 mt-1">
                      Selected knowledge bases will be automatically searched when the agent needs additional context.
                      The agent will use semantic search to find relevant information from your connected data sources.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {hasChanges && (
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-orange-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-orange-900">Unsaved Changes</h4>
                <p className="text-sm text-orange-700 mt-1">
                  You have unsaved changes to your knowledge base selection. Click "Save" to persist your changes.
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default KnowledgeBaseBlock;
