import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Agent } from '@interfaces/agent.interface';
import { Workflow } from '@interfaces/workflow.interface';
import WorkflowNode from './WorkflowNode';
import ConnectionLine from './ConnectionLine';
import AgentSelectionModal from './AgentSelectionModal';
import { Button } from '@components/UI';
import { Plus, Save, Undo, Redo, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';

interface WorkflowCanvasProps {
  workflow: Workflow | null;
  agents: Agent[];
  onSave: (workflow: Workflow) => void;
  onAddAgent: (agentId: string) => void;
  onRemoveAgent: (agentId: string) => void;
  onUpdateConnections: (connections: Array<{ from: string; to: string }>) => void;
  loading?: boolean;
}

interface NodePosition {
  [agentId: string]: { x: number; y: number };
}

interface Connection {
  from: string;
  to: string;
  id: string;
  isBidirectional?: boolean;
  showBackArrow?: boolean;
}

const WorkflowCanvas: React.FC<WorkflowCanvasProps> = ({
  workflow,
  agents,
  onSave,
  onAddAgent,
  onRemoveAgent,
  onUpdateConnections,
  loading = false
}) => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [selectedConnection, setSelectedConnection] = useState<string | null>(null);
  const [nodePositions, setNodePositions] = useState<NodePosition>({});
  const [connections, setConnections] = useState<Connection[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [autoSave, setAutoSave] = useState(false);
  const [showAgentModal, setShowAgentModal] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);

  // Initialize positions when workflow or agents change
  useEffect(() => {
    console.log('🔄 Initializing WorkflowCanvas with:', { workflow, agentsCount: agents.length });
    
    if (workflow && agents.length > 0) {
      const initialPositions: NodePosition = {};
      
      // Get agents that are part of this workflow
      const workflowAgents = agents.filter(agent => 
        workflow.steps?.some((step: any) => step.agent_id === agent.id) || false
      );
      
      console.log('📊 Workflow agents found:', workflowAgents.length);
      console.log('📋 Workflow steps:', workflow.steps || 'No steps found');
      
      // Initialize positions for each agent
      workflowAgents.forEach((agent, index) => {
        // Check if agent has saved position
        const existingStep = workflow.steps?.find((step: any) => step.agent_id === agent.id);
        if (existingStep?.position) {
          // Use saved position
          initialPositions[agent.id] = existingStep.position;
          console.log(`📍 Using saved position for ${agent.name}:`, existingStep.position);
        } else {
          // Calculate new position in circle
          const angle = (index / workflowAgents.length) * 2 * Math.PI;
          const radius = 200;
          initialPositions[agent.id] = {
            x: Math.cos(angle) * radius + 400,
            y: Math.sin(angle) * radius + 300
          };
          console.log(`📍 Calculated position for ${agent.name}:`, initialPositions[agent.id]);
        }
      });
      
      setNodePositions(initialPositions);
      
      // Initialize connections from workflow
      const workflowConnections: Connection[] = [];
      
      // Use workflow.connections if available, otherwise generate from steps
      if (workflow.connections && Array.isArray(workflow.connections) && workflow.connections.length > 0) {
        workflow.connections.forEach((conn: any, index: number) => {
          if (conn && conn.from && conn.to) {
            workflowConnections.push({
              from: conn.from,
              to: conn.to,
              id: `${conn.from}-${conn.to}`
            });
          }
        });
        console.log('🔗 Using saved connections:', workflow.connections);
      } else {
        // Generate connections from sequential steps
        if (workflow.steps && workflow.steps.length > 1) {
          for (let i = 0; i < workflow.steps.length - 1; i++) {
            const currentStep = workflow.steps[i];
            const nextStep = workflow.steps[i + 1];
            if (currentStep.agent_id && nextStep.agent_id) {
              workflowConnections.push({
                from: currentStep.agent_id,
                to: nextStep.agent_id,
                id: `${currentStep.agent_id}-${nextStep.agent_id}`
              });
            }
          }
        }
        console.log('🔗 Generated connections from steps:', workflowConnections);
      }
      
      setConnections(workflowConnections);
      setIsInitializing(false);
      console.log('✅ WorkflowCanvas initialization complete');
    } else {
      setIsInitializing(false);
      console.log('⚠️ No workflow or agents available for initialization');
    }
  }, [workflow, agents]);

  // Auto-save functionality
  useEffect(() => {
    if (autoSave && workflow && !loading) {
      const timeoutId = setTimeout(() => {
        handleSave();
      }, 2000);
      
      return () => clearTimeout(timeoutId);
    }
  }, [nodePositions, connections, autoSave, workflow, loading]);

  const handleNodeSelect = useCallback((agentId: string) => {
    setSelectedNode(agentId);
    setSelectedConnection(null);
  }, []);

  const handleNodeDelete = useCallback((agentId: string) => {
    onRemoveAgent(agentId);
    setSelectedNode(null);
    
    // Remove connections involving this agent
    setConnections(prev => prev.filter(conn => 
      conn.from !== agentId && conn.to !== agentId
    ));
  }, [onRemoveAgent]);

  const handleNodeMove = useCallback((agentId: string, position: { x: number; y: number }) => {
    setNodePositions(prev => ({
      ...prev,
      [agentId]: position
    }));
  }, []);

  const handleNodeConfigure = useCallback((agentId: string) => {
    // TODO: Open configuration modal
    console.log('Configure agent:', agentId);
  }, []);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    // Only handle panning if clicking on the canvas background
    if (e.target === canvasRef.current || (e.target as HTMLElement).tagName === 'svg') {
      setIsPanning(true);
      setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    }
  }, [pan]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (isPanning) {
      setPan({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  }, [isPanning, dragStart]);

  const handleMouseUp = useCallback(() => {
    setIsPanning(false);
  }, []);

  // Add wheel zoom functionality
  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setZoom(prev => Math.max(0.3, Math.min(3, prev * delta)));
  }, []);

  // Add wheel event listener with non-passive option
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleWheelEvent = (e: WheelEvent) => {
      e.preventDefault();
      const delta = e.deltaY > 0 ? 0.9 : 1.1;
      setZoom(prev => Math.max(0.3, Math.min(3, prev * delta)));
    };

    canvas.addEventListener('wheel', handleWheelEvent, { passive: false });

    return () => {
      canvas.removeEventListener('wheel', handleWheelEvent);
    };
  }, []);

  const handleZoomIn = useCallback(() => {
    setZoom(prev => Math.min(prev * 1.2, 3));
  }, []);

  const handleZoomOut = useCallback(() => {
    setZoom(prev => Math.max(prev / 1.2, 0.3));
  }, []);

  const handleReset = useCallback(() => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  }, []);

  const handleSave = useCallback(() => {
    if (workflow) {
      // Create updated workflow with proper structure
      const updatedWorkflow = {
        ...workflow,
        steps: Object.keys(nodePositions || {}).map(agentId => {
          const existingStep = workflow.steps?.find((step: any) => step.agent_id === agentId);
          return {
            ...existingStep,
            agent_id: agentId,
            position: nodePositions[agentId]
          };
        }),
        connections: connections.map(conn => ({
          from: conn.from,
          to: conn.to
        }))
      };
      
      console.log('Saving workflow:', updatedWorkflow);
      onSave(updatedWorkflow);
    }
  }, [workflow, nodePositions, connections, onSave]);

  const handleAddConnection = useCallback((fromAgentId: string, toAgentId: string) => {
    const newConnection: Connection = {
      from: fromAgentId,
      to: toAgentId,
      id: `${fromAgentId}-${toAgentId}`
    };
    
    // Check if connection already exists
    const exists = connections.some(conn => 
      conn.from === fromAgentId && conn.to === toAgentId
    );
    
    if (!exists) {
      setConnections(prev => [...prev, newConnection]);
    }
  }, [connections]);

  const handleRemoveConnection = useCallback((connectionId: string) => {
    setConnections(prev => prev.filter(conn => conn.id !== connectionId));
    setSelectedConnection(null);
  }, []);

  const handleToggleBackArrow = useCallback((connectionId: string) => {
    setConnections(prev => prev.map(conn => 
      conn.id === connectionId 
        ? { ...conn, showBackArrow: !conn.showBackArrow }
        : conn
    ));
  }, []);

  const handleToggleBidirectional = useCallback((connectionId: string) => {
    setConnections(prev => prev.map(conn => 
      conn.id === connectionId 
        ? { ...conn, isBidirectional: !conn.isBidirectional }
        : conn
    ));
  }, []);

  const workflowAgents = agents.filter(agent => 
    workflow?.steps?.some((step: any) => step.agent_id === agent.id) || false
  );

  // Show loading state while initializing
  if (isInitializing || loading) {
    return (
      <div className="relative w-full h-full bg-gray-50 overflow-hidden flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-2 text-sm text-gray-500">
            {isInitializing ? 'Loading workflow...' : 'Saving...'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full bg-gray-50 overflow-hidden">
      {/* Toolbar */}
      <div className="absolute top-4 left-4 z-30 flex items-center gap-2 bg-white rounded-lg shadow-lg p-2">
        <Button
          size="sm"
          variant="outline"
          onClick={handleZoomIn}
          leftIcon={<ZoomIn className="h-4 w-4" />}
        >
          Zoom In
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={handleZoomOut}
          leftIcon={<ZoomOut className="h-4 w-4" />}
        >
          Zoom Out
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={handleReset}
          leftIcon={<RotateCcw className="h-4 w-4" />}
        >
          Reset
        </Button>
        <div className="w-px h-6 bg-gray-300" />
        <Button
          size="sm"
          variant="outline"
          onClick={handleSave}
          leftIcon={<Save className="h-4 w-4" />}
          loading={loading}
        >
          {autoSave ? 'Auto Save' : 'Save'}
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => {
            console.log('Current workflow state:', workflow);
            console.log('Node positions:', nodePositions);
            console.log('Connections:', connections);
            console.log('Workflow agents:', workflowAgents);
          }}
        >
          Debug
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => {
            setConnections(prev => prev.map(conn => ({ ...conn, showBackArrow: true })));
          }}
        >
          Add Back Arrows
        </Button>
        <div className="text-xs text-gray-500 px-2">
          {workflowAgents.length} agents
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={autoSave}
            onChange={(e) => setAutoSave(e.target.checked)}
            className="rounded"
          />
          Auto Save
        </label>
      </div>

      {/* Canvas */}
      <div
        ref={canvasRef}
        className="w-full h-full relative cursor-grab active:cursor-grabbing"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <svg
          className="absolute inset-0 w-full h-full"
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transformOrigin: '0 0'
          }}
        >
          {/* Grid background */}
          <defs>
            <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#e5e7eb" strokeWidth="1"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />

                    {/* Workflow nodes (rendered first so they appear behind arrows) */}
          {workflowAgents.map(agent => {
            const position = nodePositions[agent.id];
            if (!position) return null;
            
            return (
              <foreignObject
                key={agent.id}
                x={position.x - 96} // Half of node width
                y={position.y - 80} // Half of node height
                width="192"
                height="160"
              >
                <WorkflowNode
                  agent={agent}
                  position={{ x: 96, y: 80 }} // Center within foreignObject
                  isSelected={selectedNode === agent.id}
                  onSelect={handleNodeSelect}
                  onDelete={handleNodeDelete}
                  onMove={handleNodeMove}
                  onConfigure={handleNodeConfigure}
                />
              </foreignObject>
            );
          })}

          {/* Connection lines (rendered after nodes so they appear on top) */}
          {connections.map(connection => {
            const fromPos = nodePositions[connection.from];
            const toPos = nodePositions[connection.to];
            
            if (!fromPos || !toPos) return null;
            
            return (
              <ConnectionLine
                key={connection.id}
                from={fromPos}
                to={toPos}
                isSelected={selectedConnection === connection.id}
                onClick={() => setSelectedConnection(connection.id)}
                isBidirectional={connection.isBidirectional}
                showBackArrow={connection.showBackArrow}
              />
            );
          })}
        </svg>
      </div>

      {/* Add Agent Button */}
      <div className="absolute bottom-4 right-4 z-30">
        <Button
          size="lg"
          className="rounded-full w-14 h-14 shadow-lg"
          leftIcon={<Plus className="h-6 w-6" />}
          onClick={() => setShowAgentModal(true)}
        />
      </div>

      {/* Agent Selection Modal */}
      <AgentSelectionModal
        isOpen={showAgentModal}
        onClose={() => setShowAgentModal(false)}
        onSelectAgent={onAddAgent}
        agents={agents}
        existingAgentIds={workflow?.steps?.map((step: any) => step.agent_id) || []}
      />

      {/* Instructions */}
      <div className="absolute bottom-4 left-4 z-30 bg-white rounded-lg shadow-lg p-3 max-w-xs">
        <h4 className="font-medium text-sm mb-2">Workflow Builder</h4>
        <ul className="text-xs text-gray-600 space-y-1">
          <li>• Drag agents to reposition them</li>
          <li>• Click to select agents or connections</li>
          <li>• Use mouse wheel to zoom</li>
          <li>• Drag canvas to pan</li>
          <li>• Auto-save is enabled by default</li>
        </ul>
      </div>
    </div>
  );
};

export default WorkflowCanvas;
