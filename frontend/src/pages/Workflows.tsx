import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-hot-toast';
import { RootState, AppDispatch } from '@store/index';
import { fetchWorkflows, fetchWorkflowById, createWorkflow, updateWorkflow, deleteWorkflow, executeWorkflow } from '@services/workflow.service';
import { fetchAgents } from '@services/agent.service';
import { getDefaultCompany } from '@services/company.service';
import { 
  WorkflowSelector,
  WorkflowCanvas,
  Header,
  Stats,
  CreateWorkflowModal,
  DeleteWorkflowModal
} from '@components/Workflows';
import { LoadingSpinner, Button, NoDefaultCompanyWarning } from '@components/UI';
import { Workflow, CreateWorkflowData } from '@interfaces/workflow.interface';
import { Agent } from '@interfaces/agent.interface';
import { Settings, ArrowLeft } from 'lucide-react';

const Workflows: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { workflows, loading, error } = useSelector((state: RootState) => state.workflows);
  const { agents } = useSelector((state: RootState) => state.agents);
  const { currentCompany } = useSelector((state: RootState) => state.company);
  
  // Ensure workflows is always an array
  const safeWorkflows = Array.isArray(workflows) ? workflows : [];
  
  // Local state
  const [selectedWorkflow, setSelectedWorkflow] = useState<Workflow | null>(null);
  const [isBuilderMode, setIsBuilderMode] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [workflowToDelete, setWorkflowToDelete] = useState<Workflow | null>(null);
  const [hasDefaultCompany, setHasDefaultCompany] = useState<boolean | null>(null);

  // Load workflows and agents when currentCompany is available
  useEffect(() => {
    if (currentCompany?.id) {
      setHasDefaultCompany(true);
      dispatch(fetchWorkflows(currentCompany.id));
      dispatch(fetchAgents(currentCompany.id));
    } else {
      // Try to get default company if currentCompany is not set
      const loadDefaultCompany = async () => {
        try {
          const defaultCompany = await dispatch(getDefaultCompany() as any).unwrap();
          if (defaultCompany) {
            setHasDefaultCompany(true);
            dispatch(fetchWorkflows(defaultCompany.id));
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

  // Handle workflow selection
  const handleSelectWorkflow = (workflow: Workflow) => {
    setSelectedWorkflow(workflow);
    setIsBuilderMode(true);
  };

  // Handle create workflow
  const handleCreateWorkflow = () => {
    setShowCreateModal(true);
  };

  // Handle submit workflow creation
  const handleSubmitWorkflow = async (workflowData: CreateWorkflowData) => {
    try {
      console.log('Submitting workflow data:', workflowData);
      
      await dispatch(createWorkflow(workflowData)).unwrap();
      toast.success('Workflow created successfully!');
      setShowCreateModal(false);
      // Refresh workflows list
      if (currentCompany?.id) {
        dispatch(fetchWorkflows(currentCompany.id));
      }
    } catch (error: any) {
      console.error('Failed to create workflow:', error);
      toast.error(error.message || 'Failed to create workflow');
    }
  };

  // Handle edit workflow
  const handleEditWorkflow = async (workflow: Workflow) => {
    try {
      console.log('Loading workflow for editing:', workflow.id);
      
      // Load the full workflow data by ID
      const result = await dispatch(fetchWorkflowById(workflow.id)).unwrap();
      
      console.log('Loaded workflow data:', result);
      
      // Set the loaded workflow as selected
      setSelectedWorkflow(result);
      setIsBuilderMode(true);
      
      toast.success('Workflow loaded for editing!');
    } catch (error: any) {
      console.error('Failed to load workflow for editing:', error);
      toast.error(error.message || 'Failed to load workflow for editing');
    }
  };

  // Handle delete workflow - show confirmation modal
  const handleDeleteWorkflow = (workflow: Workflow) => {
    setWorkflowToDelete(workflow);
    setShowDeleteModal(true);
  };

  // Handle confirm delete workflow
  const handleConfirmDeleteWorkflow = async () => {
    if (!workflowToDelete) return;
    
    try {
      await dispatch(deleteWorkflow(workflowToDelete.id)).unwrap();
      toast.success('Workflow deleted successfully!');
      
      if (selectedWorkflow?.id === workflowToDelete.id) {
        setSelectedWorkflow(null);
        setIsBuilderMode(false);
      }
      
      // Close modal and reset
      setShowDeleteModal(false);
      setWorkflowToDelete(null);
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete workflow');
    }
  };

  // Handle cancel delete workflow
  const handleCancelDeleteWorkflow = () => {
    setShowDeleteModal(false);
    setWorkflowToDelete(null);
  };

  // Handle execute workflow
  const handleExecuteWorkflow = async (workflow: Workflow) => {
    try {
      const result = await dispatch(executeWorkflow({ 
        id: workflow.id, 
        inputData: { test: true } 
      })).unwrap();
      toast.success(`Workflow execution started! Execution ID: ${result.execution_id}`);
    } catch (error: any) {
      toast.error(error.message || 'Failed to execute workflow');
    }
  };

  // Handle save workflow
  const handleSaveWorkflow = async (updatedWorkflow: Workflow) => {
    try {
      const result = await dispatch(updateWorkflow({ 
        id: updatedWorkflow.id, 
        data: updatedWorkflow 
      })).unwrap();
      
      // Update the local selectedWorkflow with the saved data
      setSelectedWorkflow(result);
      
      // Refresh the workflows list to show updated data
      if (currentCompany?.id) {
        dispatch(fetchWorkflows(currentCompany.id));
      }
      
      toast.success('Workflow saved successfully!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to save workflow');
    }
  };

  // Handle add agent to workflow
  const handleAddAgent = (agentId: string) => {
    if (selectedWorkflow) {
      const agent = agents.find(a => a.id === agentId);
      if (agent) {
        const updatedWorkflow = {
          ...selectedWorkflow,
          steps: [
            ...selectedWorkflow.steps,
            { 
              agent_id: agentId, 
              type: 'agent',
              name: agent.name,
              description: agent.description
            }
          ]
        };
        setSelectedWorkflow(updatedWorkflow);
        console.log('Added agent to workflow:', agentId);
      }
    }
  };

  // Handle remove agent from workflow
  const handleRemoveAgent = (agentId: string) => {
    if (selectedWorkflow) {
      const updatedWorkflow = {
        ...selectedWorkflow,
        steps: selectedWorkflow.steps.filter((step: any) => step.agent_id !== agentId),
        connections: selectedWorkflow.connections?.filter((conn: any) => 
          conn.from !== agentId && conn.to !== agentId
        ) || []
      };
      setSelectedWorkflow(updatedWorkflow);
      console.log('Removed agent from workflow:', agentId);
    }
  };

  // Handle update connections
  const handleUpdateConnections = (connections: Array<{ from: string; to: string }>) => {
    if (selectedWorkflow) {
      const updatedWorkflow = {
        ...selectedWorkflow,
        connections: connections
      };
      setSelectedWorkflow(updatedWorkflow);
      console.log('Updated workflow connections:', connections);
    }
  };

  // Handle back to workflow list
  const handleBackToList = () => {
    setIsBuilderMode(false);
    setSelectedWorkflow(null);
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
        message="You need to set a default company to manage workflows. Please go to the Companies page and set a default company."
      />
    );
  }

  // Show loading state
  if (loading && workflows.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Header />
      
             {/* Stats */}
       <Stats workflows={safeWorkflows} />
      
      {/* Main Content */}
      {isBuilderMode && selectedWorkflow ? (
        <div className="space-y-4">
          {/* Builder Header */}
          <div className="flex items-center justify-between bg-white rounded-lg shadow p-4">
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="sm"
                leftIcon={<ArrowLeft className="h-4 w-4" />}
                onClick={handleBackToList}
              >
                Back to Workflows
              </Button>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  {selectedWorkflow.name}
                </h2>
                <p className="text-sm text-gray-600">
                  Workflow Builder - Drag and drop agents to create connections
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleExecuteWorkflow(selectedWorkflow)}
              >
                Execute Workflow
              </Button>
            </div>
          </div>
          
          {/* Workflow Canvas */}
          <div className="bg-white rounded-lg shadow h-[600px]">
            <WorkflowCanvas
              workflow={selectedWorkflow}
              agents={agents}
              onSave={handleSaveWorkflow}
              onAddAgent={handleAddAgent}
              onRemoveAgent={handleRemoveAgent}
              onUpdateConnections={handleUpdateConnections}
              loading={loading}
            />
          </div>
        </div>
      ) : (
                 /* Workflow Selector */
         <WorkflowSelector
           workflows={safeWorkflows}
           selectedWorkflow={selectedWorkflow}
           onSelectWorkflow={handleSelectWorkflow}
           onCreateWorkflow={handleCreateWorkflow}
           onEditWorkflow={handleEditWorkflow}
           onDeleteWorkflow={handleDeleteWorkflow}
           onExecuteWorkflow={handleExecuteWorkflow}
           loading={loading}
         />
      )}

      {/* Create Workflow Modal */}
      <CreateWorkflowModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleSubmitWorkflow}
        agents={agents}
        company_id={currentCompany?.id || ''}
        loading={loading}
      />

      {/* Delete Workflow Modal */}
      <DeleteWorkflowModal
        isOpen={showDeleteModal}
        onClose={handleCancelDeleteWorkflow}
        onConfirm={handleConfirmDeleteWorkflow}
        workflow={workflowToDelete}
        loading={loading}
      />
    </div>
  );
};

export default Workflows;
