import React, { useRef, useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@components/UI';
import { Bot, Settings, Trash2, Move } from 'lucide-react';
import { Agent } from '@interfaces/agent.interface';

interface WorkflowNodeProps {
  agent: Agent;
  position: { x: number; y: number };
  isSelected: boolean;
  onSelect: (agentId: string) => void;
  onDelete: (agentId: string) => void;
  onMove: (agentId: string, position: { x: number; y: number }) => void;
  onConfigure: (agentId: string) => void;
}

const WorkflowNode: React.FC<WorkflowNodeProps> = ({
  agent,
  position,
  isSelected,
  onSelect,
  onDelete,
  onMove,
  onConfigure
}) => {
  const nodeRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'border-green-500 bg-green-50';
      case 'inactive':
        return 'border-yellow-500 bg-yellow-50';
      case 'draft':
        return 'border-gray-500 bg-gray-50';
      default:
        return 'border-gray-300 bg-white';
    }
  };

  const getAgentTypeIcon = (type: string) => {
    switch (type) {
      case 'workflow':
        return <Settings className="h-4 w-4" />;
      case 'chatbot':
        return <Bot className="h-4 w-4" />;
      case 'assistant':
        return <Bot className="h-4 w-4" />;
      default:
        return <Bot className="h-4 w-4" />;
    }
  };

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button !== 0) return; // Only left mouse button
    
    e.preventDefault();
    e.stopPropagation();
    
    const rect = nodeRef.current?.getBoundingClientRect();
    if (rect) {
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      });
    }
    
    setIsDragging(true);
    onSelect(agent.id);
  }, [agent.id, onSelect]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging) return;
    
    e.preventDefault();
    e.stopPropagation();
    
    const newPosition = {
      x: e.clientX - dragOffset.x,
      y: e.clientY - dragOffset.y
    };
    
    onMove(agent.id, newPosition);
  }, [isDragging, dragOffset, agent.id, onMove]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Add global mouse event listeners for dragging
  React.useEffect(() => {
    if (isDragging) {
      const handleGlobalMouseMove = (e: MouseEvent) => {
        e.preventDefault();
        const newPosition = {
          x: e.clientX - dragOffset.x,
          y: e.clientY - dragOffset.y
        };
        onMove(agent.id, newPosition);
      };

      const handleGlobalMouseUp = (e: MouseEvent) => {
        e.preventDefault();
        setIsDragging(false);
      };

      document.addEventListener('mousemove', handleGlobalMouseMove, { passive: false });
      document.addEventListener('mouseup', handleGlobalMouseUp, { passive: false });

      return () => {
        document.removeEventListener('mousemove', handleGlobalMouseMove);
        document.removeEventListener('mouseup', handleGlobalMouseUp);
      };
    }
  }, [isDragging, dragOffset, agent.id, onMove]);

  return (
    <div
      ref={nodeRef}
      className={`absolute transition-all duration-200 ${
        isSelected ? 'z-20' : 'z-10'
      } ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
      style={{
        left: position.x,
        top: position.y,
        transform: 'translate(-50%, -50%)',
        userSelect: 'none'
      }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    >
      <Card
        className={`w-48 shadow-lg transition-all duration-200 ${
          isSelected 
            ? 'ring-2 ring-primary-500 scale-105' 
            : 'hover:shadow-xl hover:scale-105'
        } ${getStatusColor(agent.status)} ${isDragging ? 'shadow-2xl' : ''}`}
      >
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1 bg-primary-100 rounded">
                {getAgentTypeIcon(agent.agent_type)}
              </div>
              <CardTitle className="text-sm font-medium truncate">
                {agent.name}
              </CardTitle>
            </div>
            <div className="flex items-center gap-1">
              <button
                className="p-1 hover:bg-gray-200 rounded text-gray-600"
                onClick={(e) => {
                  e.stopPropagation();
                  onConfigure(agent.id);
                }}
                title="Configure"
              >
                <Settings className="h-3 w-3" />
              </button>
              <button
                className="p-1 hover:bg-gray-200 rounded text-gray-600"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(agent.id);
                }}
                title="Delete"
              >
                <Trash2 className="h-3 w-3" />
              </button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs text-gray-600">
              <Move className="h-3 w-3" />
              <span>{isDragging ? 'Dragging...' : 'Drag to move'}</span>
            </div>
            {agent.description && (
              <p className="text-xs text-gray-600 line-clamp-2">
                {agent.description}
              </p>
            )}
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500 capitalize">
                {agent.agent_type}
              </span>
              <span className={`text-xs px-2 py-1 rounded-full capitalize ${
                agent.status === 'active' ? 'bg-green-100 text-green-800' :
                agent.status === 'inactive' ? 'bg-yellow-100 text-yellow-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {agent.status}
              </span>
            </div>
          </div>
        </CardContent>
        
        {/* Connection point indicators */}
        <div className="absolute -top-1 -left-1 w-3 h-3 bg-blue-500 rounded-full border-2 border-white shadow-sm"></div>
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white shadow-sm"></div>
        <div className="absolute -bottom-1 -left-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white shadow-sm"></div>
        <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-yellow-500 rounded-full border-2 border-white shadow-sm"></div>
      </Card>
    </div>
  );
};

export default WorkflowNode;
