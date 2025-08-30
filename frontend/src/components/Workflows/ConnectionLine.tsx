import React from 'react';

interface ConnectionLineProps {
  from: { x: number; y: number };
  to: { x: number; y: number };
  isSelected?: boolean;
  onClick?: () => void;
  isBidirectional?: boolean;
  showBackArrow?: boolean;
}

const ConnectionLine: React.FC<ConnectionLineProps> = ({
  from,
  to,
  isSelected = false,
  onClick,
  isBidirectional = false,
  showBackArrow = false
}) => {
  // Calculate the path for the connection
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const distance = Math.sqrt(dx * dx + dy * dy);
  
  // Node dimensions (matching WorkflowNode size)
  const nodeWidth = 192; // 48 * 4 (w-48 = 12rem = 192px)
  const nodeHeight = 160; // Approximate height of the node
  
  // Calculate connection points at node edges instead of centers
  const angle = Math.atan2(dy, dx);
  
  // Calculate the edge points of the nodes with 2px offset to prevent overlap
  const offset = 2;
  const fromEdgeX = from.x + ((nodeWidth / 2) + offset) * Math.cos(angle);
  const fromEdgeY = from.y + ((nodeWidth / 2) + offset) * Math.sin(angle);
  const toEdgeX = to.x - ((nodeWidth / 2) + offset) * Math.cos(angle);
  const toEdgeY = to.y - ((nodeWidth / 2) + offset) * Math.sin(angle);
  
  // Create a curved path between the edge points
  const edgeDx = toEdgeX - fromEdgeX;
  const edgeDy = toEdgeY - fromEdgeY;
  const edgeDistance = Math.sqrt(edgeDx * edgeDx + edgeDy * edgeDy);
  
  // Add some curve to the path
  const curveOffset = Math.min(edgeDistance * 0.3, 80);
  const controlX1 = fromEdgeX + edgeDx * 0.25;
  const controlY1 = fromEdgeY + curveOffset;
  const controlX2 = toEdgeX - edgeDx * 0.25;
  const controlY2 = toEdgeY - curveOffset;
  
  const pathData = `M ${fromEdgeX} ${fromEdgeY} C ${controlX1} ${controlY1} ${controlX2} ${controlY2} ${toEdgeX} ${toEdgeY}`;
  
  // Calculate forward arrow position at the edge
  const arrowLength = 15; // Increased arrow size
  const arrowAngle = Math.PI / 6; // 30 degrees
  
  const arrowX1 = toEdgeX - arrowLength * Math.cos(angle - arrowAngle);
  const arrowY1 = toEdgeY - arrowLength * Math.sin(angle - arrowAngle);
  const arrowX2 = toEdgeX - arrowLength * Math.cos(angle + arrowAngle);
  const arrowY2 = toEdgeY - arrowLength * Math.sin(angle + arrowAngle);
  
  const arrowPath = `M ${toEdgeX} ${toEdgeY} L ${arrowX1} ${arrowY1} M ${toEdgeX} ${toEdgeY} L ${arrowX2} ${arrowY2}`;

  // Calculate back arrow position (if bidirectional)
  const backArrowX1 = fromEdgeX + arrowLength * Math.cos(angle - arrowAngle);
  const backArrowY1 = fromEdgeY + arrowLength * Math.sin(angle - arrowAngle);
  const backArrowX2 = fromEdgeX + arrowLength * Math.cos(angle + arrowAngle);
  const backArrowY2 = fromEdgeY + arrowLength * Math.sin(angle + arrowAngle);
  
  const backArrowPath = `M ${fromEdgeX} ${fromEdgeY} L ${backArrowX1} ${backArrowY1} M ${fromEdgeX} ${fromEdgeY} L ${backArrowX2} ${backArrowY2}`;

  // Enhanced styling
  const strokeColor = isSelected ? '#3b82f6' : '#6b7280';
  const backArrowColor = isSelected ? '#ef4444' : '#dc2626'; // Red color for back arrows
  const strokeWidth = isSelected ? 4 : 3;
  const arrowStrokeWidth = isSelected ? 4 : 3;

  return (
    <g 
      onClick={onClick} 
      style={{ 
        cursor: onClick ? 'pointer' : 'default',
        zIndex: 10 // Ensure arrows appear above nodes
      }}
    >
      {/* Connection line with enhanced styling */}
      <path
        d={pathData}
        stroke={strokeColor}
        strokeWidth={strokeWidth}
        fill="none"
        className="transition-all duration-200"
        style={{
          filter: isSelected ? 'drop-shadow(0 0 4px rgba(59, 130, 246, 0.3))' : 'none'
        }}
      />
      
      {/* Forward arrow with enhanced styling */}
      <path
        d={arrowPath}
        stroke={strokeColor}
        strokeWidth={arrowStrokeWidth}
        fill="none"
        className="transition-all duration-200"
        style={{
          filter: isSelected ? 'drop-shadow(0 0 4px rgba(59, 130, 246, 0.3))' : 'none'
        }}
      />
      
      {/* Forward arrow head fill for better visibility */}
      <path
        d={`M ${toEdgeX} ${toEdgeY} L ${arrowX1} ${arrowY1} L ${arrowX2} ${arrowY2} Z`}
        fill={strokeColor}
        className="transition-all duration-200"
        style={{
          filter: isSelected ? 'drop-shadow(0 0 4px rgba(59, 130, 246, 0.3))' : 'none'
        }}
      />
      
      {/* Back arrow (if bidirectional or showBackArrow is true) */}
      {(isBidirectional || showBackArrow) && (
        <>
          <path
            d={backArrowPath}
            stroke={backArrowColor}
            strokeWidth={arrowStrokeWidth}
            fill="none"
            className="transition-all duration-200"
            style={{
              filter: isSelected ? 'drop-shadow(0 0 4px rgba(239, 68, 68, 0.3))' : 'none'
            }}
          />
          
          {/* Back arrow head fill for better visibility */}
          <path
            d={`M ${fromEdgeX} ${fromEdgeY} L ${backArrowX1} ${backArrowY1} L ${backArrowX2} ${backArrowY2} Z`}
            fill={backArrowColor}
            className="transition-all duration-200"
            style={{
              filter: isSelected ? 'drop-shadow(0 0 4px rgba(239, 68, 68, 0.3))' : 'none'
            }}
          />
        </>
      )}
      
      {/* Clickable area for easier interaction */}
      <path
        d={pathData}
        stroke="transparent"
        strokeWidth="25"
        fill="none"
        style={{ cursor: 'pointer' }}
      />
      
      {/* Connection point indicators */}
      <circle
        cx={fromEdgeX}
        cy={fromEdgeY}
        r="4"
        fill={isBidirectional || showBackArrow ? backArrowColor : strokeColor}
        className="transition-all duration-200"
      />
      <circle
        cx={toEdgeX}
        cy={toEdgeY}
        r="4"
        fill={strokeColor}
        className="transition-all duration-200"
      />
      
      {/* Direction indicator text */}
      {(isBidirectional || showBackArrow) && (
        <text
          x={(fromEdgeX + toEdgeX) / 2}
          y={(fromEdgeY + toEdgeY) / 2 - 10}
          textAnchor="middle"
          dominantBaseline="middle"
          className="text-xs font-bold pointer-events-none"
          style={{
            fontSize: '12px',
            fontWeight: 'bold',
            fill: isSelected ? '#3b82f6' : '#6b7280'
          }}
        >
          ↔
        </text>
      )}
    </g>
  );
};

export default ConnectionLine;
