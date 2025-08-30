import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-hot-toast';
import { RootState, AppDispatch } from '@store/index';
import { fetchAgents, createAgent, updateAgent, deleteAgent } from '@services/agent.service';
import { getDefaultCompany } from '@services/company.service';
import { 
  Header, 
  Filters, 
  AgentCard, 
  EmptyState,
  CreateAgentModal,
  EditAgentModal,
  DeleteAgentModal
} from '@components/Agents';
import AgentConfigurationModal from '@components/Agents/AgentConfigurationModal';
import { LoadingSpinner, NoDefaultCompanyWarning } from '@components/UI';
import { Agent } from '@interfaces/agent.interface';
import { Bot } from 'lucide-react';

const Agents: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { agents, loading, error } = useSelector((state: RootState) => state.agents);
  const { currentCompany } = useSelector((state: RootState) => state.company);
  
  // Local state
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [agentTypeFilter, setAgentTypeFilter] = useState('all');
  const [hasDefaultCompany, setHasDefaultCompany] = useState<boolean | null>(null);
  
  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);

  // Load agents when currentCompany is available
  useEffect(() => {
    if (currentCompany?.id) {
      setHasDefaultCompany(true);
      dispatch(fetchAgents(currentCompany.id));
    } else {
      // Try to get default company if currentCompany is not set
      const loadDefaultCompany = async () => {
        try {
          const defaultCompany = await dispatch(getDefaultCompany() as any).unwrap();
          if (defaultCompany) {
            setHasDefaultCompany(true);
            dispatch(fetchAgents(defaultCompany.id));
          } else {
            setHasDefaultCompany(false);
          }
        } catch (error) {
          console.error('Failed to get default company:', error);
          setHasDefaultCompany(false);
        }
      };
      
      loadDefaultCompany();
    }
  }, [dispatch, currentCompany]);

  // Handle error display
  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  // Ensure agents is always an array and filter based on search and filters
  const safeAgents = Array.isArray(agents) ? agents : [];
  const filteredAgents = safeAgents.filter(agent => {
    const matchesSearch = agent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         agent.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || agent.status === statusFilter;
    const matchesType = agentTypeFilter === 'all' || agent.agent_type === agentTypeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  // Handle create agent
  const handleCreateAgent = async (agentData: Partial<Agent>) => {
    try {
      await dispatch(createAgent(agentData as any)).unwrap();
      setShowCreateModal(false);
      toast.success('Agent created successfully!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to create agent');
    }
  };

  // Handle edit agent
  const handleEditAgent = async (id: string, agentData: Partial<Agent>) => {
    try {
      await dispatch(updateAgent({ id, data: agentData })).unwrap();
      setShowEditModal(false);
      setSelectedAgent(null);
      toast.success('Agent updated successfully!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to update agent');
    }
  };

  // Handle delete agent
  const handleDeleteAgent = async (id: string) => {
    try {
      await dispatch(deleteAgent(id)).unwrap();
      setShowDeleteModal(false);
      setSelectedAgent(null);
      toast.success('Agent deleted successfully!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete agent');
    }
  };

  // Handle agent actions
  const handleEdit = (agent: Agent) => {
    setSelectedAgent(agent);
    setShowEditModal(true);
  };

  const handleDelete = (agent: Agent) => {
    setSelectedAgent(agent);
    setShowDeleteModal(true);
  };

  const handleConfigure = (agent: Agent) => {
    setSelectedAgent(agent);
    setShowConfigModal(true);
  };

  const handleSaveConfiguration = async (configuration: any) => {
    if (!selectedAgent) return;
    
    try {
      await dispatch(updateAgent({ 
        id: selectedAgent.id, 
        data: { configuration } 
      })).unwrap();
      setShowConfigModal(false);
      setSelectedAgent(null);
      toast.success('Agent configuration updated successfully!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to update agent configuration');
    }
  };

  const handleStart = (agent: Agent) => {
    // TODO: Implement start agent functionality
    toast.info('Start agent functionality coming soon!');
  };

  const handlePause = (agent: Agent) => {
    // TODO: Implement pause agent functionality
    toast.info('Pause agent functionality coming soon!');
  };

  // Show loading state while checking for default company
  if (hasDefaultCompany === null) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // Show warning if no default company is set
  if (hasDefaultCompany === false) {
    return (
      <NoDefaultCompanyWarning 
        title="No Default Company Set"
        message="You need to set a default company to manage agents. Please go to the Companies page and set a default company."
      />
    );
  }

  // Show loading state
  if (loading && safeAgents.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Header onCreateClick={() => setShowCreateModal(true)} />
      
      <Filters 
        searchTerm={searchTerm}
        statusFilter={statusFilter}
        agentTypeFilter={agentTypeFilter}
        onSearchChange={setSearchTerm}
        onStatusChange={setStatusFilter}
        onAgentTypeChange={setAgentTypeFilter}
      />
      
      {loading && agents.length > 0 && (
        <div className="flex items-center justify-center py-8">
          <LoadingSpinner />
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAgents.map((agent) => (
          <AgentCard 
            key={agent.id} 
            agent={agent}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onConfigure={handleConfigure}
            onStart={handleStart}
            onPause={handlePause}
          />
        ))}
      </div>

      {!loading && filteredAgents.length === 0 && (
        <EmptyState 
          searchTerm={searchTerm}
          statusFilter={statusFilter}
          agentTypeFilter={agentTypeFilter}
          onCreateClick={() => setShowCreateModal(true)}
        />
      )}

      {/* Modals */}
      <CreateAgentModal
        isOpen={showCreateModal}
        companyId={currentCompany.id}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreateAgent}
        loading={loading}
      />

      <EditAgentModal
        isOpen={showEditModal}
        agent={selectedAgent}
        onClose={() => {
          setShowEditModal(false);
          setSelectedAgent(null);
        }}
        onSubmit={handleEditAgent}
        loading={loading}
      />

      <DeleteAgentModal
        isOpen={showDeleteModal}
        agent={selectedAgent}
        onClose={() => {
          setShowDeleteModal(false);
          setSelectedAgent(null);
        }}
        onConfirm={handleDeleteAgent}
        loading={loading}
      />

      <AgentConfigurationModal
        isOpen={showConfigModal}
        agent={selectedAgent}
        knowledgeBases={[]} // TODO: Fetch knowledge bases
        onClose={() => {
          setShowConfigModal(false);
          setSelectedAgent(null);
        }}
        onSave={handleSaveConfiguration}
        loading={loading}
      />
    </div>
  );
};

export default Agents;
