import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, Button, Input } from '@components/UI';
import { X, Search, Bot, Plus } from 'lucide-react';
import { Agent } from '@interfaces/agent.interface';

interface AgentSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectAgent: (agentId: string) => void;
  agents: Agent[];
  existingAgentIds: string[];
}

const AgentSelectionModal: React.FC<AgentSelectionModalProps> = ({
  isOpen,
  onClose,
  onSelectAgent,
  agents,
  existingAgentIds
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  if (!isOpen) return null;

  // Filter out agents that are already in the workflow
  const availableAgents = agents.filter(agent => !existingAgentIds.includes(agent.id));
  
  // Filter by search term
  const filteredAgents = availableAgents.filter(agent =>
    agent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    agent.agent_type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelectAgent = (agentId: string) => {
    onSelectAgent(agentId);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[80vh] overflow-hidden">
        <CardHeader className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5" />
            Add Agent to Workflow
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search agents..."
              className="pl-10"
            />
          </div>

          {/* Agent List */}
          <div className="max-h-96 overflow-y-auto space-y-2">
            {filteredAgents.length === 0 ? (
              <div className="text-center py-8">
                <Bot className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <p className="text-gray-600">
                  {searchTerm ? 'No agents found matching your search.' : 'No available agents to add.'}
                </p>
              </div>
            ) : (
              filteredAgents.map(agent => (
                <div
                  key={agent.id}
                  className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                  onClick={() => handleSelectAgent(agent.id)}
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary-100 rounded-lg">
                      <Bot className="h-4 w-4 text-primary-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">{agent.name}</h4>
                      <p className="text-sm text-gray-600 capitalize">{agent.agent_type}</p>
                      {agent.description && (
                        <p className="text-xs text-gray-500 line-clamp-1">{agent.description}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-2 py-1 rounded-full capitalize ${
                      agent.status === 'active' ? 'bg-green-100 text-green-800' :
                      agent.status === 'inactive' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {agent.status}
                    </span>
                    <Plus className="h-4 w-4 text-gray-400" />
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t">
            <Button
              variant="outline"
              onClick={onClose}
            >
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AgentSelectionModal;
