import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '@store/index';
import { fetchWorkflows } from '@services/workflow.service';
import { Header, Stats, Filters, WorkflowCard, EmptyState } from '@components/Workflows';
import { Workflow } from 'lucide-react';

const Workflows: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { workflows, loading, error } = useSelector((state: RootState) => state.workflows);
  const { currentCompany } = useSelector((state: RootState) => state.company);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    if (currentCompany?.id) {
      dispatch(fetchWorkflows(currentCompany.id));
    }
  }, [dispatch, currentCompany]);

  const filteredWorkflows = workflows.filter(workflow => {
    const matchesSearch = workflow.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         workflow.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || workflow.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (!currentCompany) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Workflow className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Company Selected</h3>
          <p className="text-gray-600">Please select a company to view workflows.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading workflows...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-red-600">Error loading workflows: {error}</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Header />
      <Stats workflows={workflows} />
      <Filters 
        searchTerm={searchTerm}
        statusFilter={statusFilter}
        onSearchChange={setSearchTerm}
        onStatusChange={setStatusFilter}
      />
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredWorkflows.map((workflow) => (
          <WorkflowCard key={workflow.id} workflow={workflow} />
        ))}
      </div>

      {filteredWorkflows.length === 0 && (
        <EmptyState 
          searchTerm={searchTerm}
          statusFilter={statusFilter}
        />
      )}
    </div>
  );
};

export default Workflows;
