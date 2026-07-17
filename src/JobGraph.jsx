import React from 'react';
import './JobGraph.css';

export default function JobGraph({ jobs, currentLevel }) {
  // Simple algorithm to structure stages based on dependencies
  // Stage 0: Trigger
  // Stage 1: No needs
  // Stage 2: Needs Stage 1
  // Stage 3: Needs Stage 2
  
  const calculateStages = () => {
    const jobList = [...jobs];
    const stages = [[{ id: 'trigger', label: '⚡ Trigger', needs: [], isTrigger: true }]];
    
    // Stage 1: No dependencies
    const stage1 = jobList.filter(j => !j.needs || j.needs.length === 0);
    if (stage1.length > 0) {
      stages.push(stage1);
    }
    
    // Stage 2: Depends on Stage 1
    const stage1Ids = stage1.map(j => j.id);
    const stage2 = jobList.filter(j => j.needs && j.needs.some(dep => stage1Ids.includes(dep)));
    if (stage2.length > 0) {
      stages.push(stage2);
    }
    
    // Stage 3: Any remaining jobs that have needs not covered
    const stage2Ids = stage2.map(j => j.id);
    const stage3 = jobList.filter(j => 
      j.needs && 
      j.needs.length > 0 && 
      !stage1Ids.includes(j.id) && 
      !stage2Ids.includes(j.id)
    );
    if (stage3.length > 0) {
      stages.push(stage3);
    }
    
    return stages;
  };

  const stages = calculateStages();
  
  // Define SVG Viewbox dimensions
  const width = 600;
  const height = 240;
  
  // Calculate coordinates for nodes
  const nodes = [];
  const connections = [];
  
  const colWidth = width / (stages.length || 1);
  
  stages.forEach((stageJobs, colIndex) => {
    const x = colWidth * colIndex + colWidth / 2;
    const rowHeight = height / (stageJobs.length + 1);
    
    stageJobs.forEach((job, rowIndex) => {
      const y = rowHeight * (rowIndex + 1);
      nodes.push({
        ...job,
        x,
        y
      });
    });
  });

  // Calculate lines for connections
  nodes.forEach(node => {
    if (node.needs && node.needs.length > 0) {
      node.needs.forEach(parentName => {
        const parent = nodes.find(n => n.id === parentName);
        if (parent) {
          connections.push({
            id: `${parent.id}-${node.id}`,
            fromX: parent.x,
            fromY: parent.y,
            toX: node.x,
            toY: node.y,
            isActive: parent.status === 'success' && node.status === 'running'
          });
        }
      });
    } else if (!node.isTrigger && stages.length > 1) {
      // Connect trigger node to all Stage 1 nodes
      const trigger = nodes.find(n => n.isTrigger);
      if (trigger) {
        connections.push({
          id: `trigger-${node.id}`,
          fromX: trigger.x,
          fromY: trigger.y,
          toX: node.x,
          toY: node.y,
          isActive: node.status === 'running' || node.status === 'queued'
        });
      }
    }
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'success': return '#00e676';
      case 'failed': return '#ff3d00';
      case 'running': return '#00f2fe';
      case 'queued': return '#4facfe';
      default: return '#64748b';
    }
  };

  return (
    <div className="job-graph-container glass-panel">
      <div className="graph-header">
        <h3>📊 Visual Workflow Graph</h3>
        <span className="graph-subtitle">Live Job Dependency Tree</span>
      </div>
      
      <div className="graph-svg-wrapper">
        <svg width="100%" height="100%" viewBox={`0 0 ${width} ${height}`}>
          <defs>
            <marker id="arrow" viewBox="0 0 10 10" refX="22" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 0 L 10 5 L 0 10 z" fill="#334155" />
            </marker>
            <marker id="arrow-active" viewBox="0 0 10 10" refX="22" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 0 L 10 5 L 0 10 z" fill="#00f2fe" />
            </marker>
          </defs>
          
          {/* Render Connections */}
          {connections.map(conn => (
            <line
              key={conn.id}
              x1={conn.fromX}
              y1={conn.fromY}
              x2={conn.toX}
              y2={conn.toY}
              className={`graph-edge ${conn.isActive ? 'active' : ''}`}
              markerEnd={conn.isActive ? "url(#arrow-active)" : "url(#arrow)"}
            />
          ))}
          
          {/* Render Nodes */}
          {nodes.map(node => (
            <g key={node.id} className="graph-node-group">
              <circle
                cx={node.x}
                cy={node.y}
                r="18"
                className={`graph-node-circle ${node.status}`}
                style={{
                  fill: node.isTrigger ? '#1e293b' : 'rgba(15, 23, 42, 0.95)',
                  stroke: getStatusColor(node.status || 'pending'),
                  strokeWidth: node.status === 'running' ? 3 : 2
                }}
              />
              <text
                x={node.x}
                y={node.y + 35}
                className="graph-node-label"
                textAnchor="middle"
              >
                {node.label}
              </text>
              {/* Optional Mini Status icon inside the node */}
              <text
                x={node.x}
                y={node.y + 4}
                className="graph-node-icon"
                textAnchor="middle"
                style={{
                  fill: getStatusColor(node.status || 'pending'),
                  fontSize: '10px',
                  fontWeight: 'bold'
                }}
              >
                {node.isTrigger ? '⚡' : 
                 node.status === 'success' ? '✔' : 
                 node.status === 'failed' ? '✖' : 
                 node.status === 'running' ? '●' : 
                 node.status === 'queued' ? '🕒' : '○'}
              </text>
            </g>
          ))}
        </svg>
      </div>
    </div>
  );
}
