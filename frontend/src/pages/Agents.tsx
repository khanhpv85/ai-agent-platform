import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '@store/index';
import { fetchAgents } from '@services/agent.service';
import { Header, Filters, AgentCard, EmptyState } from '@components/Agents';
import { Bot } from 'lucide-react';

const Agents: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { agents, loading, error } = useSelector((state: RootState) => state.agents);
  const { currentCompany } = useSelector((state: RootState) => state.company);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    if (currentCompany?.id) {
      dispatch(fetchAgents(currentCompany.id));
    }
  }, [dispatch, currentCompany]);

  const filteredAgents = agents.filter(agent => {
    const matchesSearch = agent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         agent.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || agent.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (!currentCompany) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Bot className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Company Selected</h3>
          <p className="text-gray-600">Please select a company to view agents.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading agents...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-red-600">Error loading agents: {error}</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Header />
      <Filters 
        searchTerm={searchTerm}
        statusFilter={statusFilter}
        onSearchChange={setSearchTerm}
        onStatusChange={setStatusFilter}
      />
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAgents.map((agent) => (
          <AgentCard key={agent.id} agent={agent} />
        ))}
      </div>

      {filteredAgents.length === 0 && (
        <EmptyState 
          searchTerm={searchTerm}
          statusFilter={statusFilter}
        />
      )}
    </div>
  );
};

export default Agents;
