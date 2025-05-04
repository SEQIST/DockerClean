// src/features/products/components/WorkProductNode.jsx
import React from 'react';
import { Handle } from "reactflow";

const WorkProductNode = ({ data, isCollapsed, onToggle }) => {
  console.log('WorkProductNode data:', data); // Debugging

  return (
    <div style={{ padding: '10px', border: '1px solid #ccc', borderRadius: '5px', background: '#f0f0f0', textAlign: 'left', position: 'relative' }}>
      <Handle
        type="target"
        position="right"
        style={{ background: '#555', borderRadius: '50%' }}
      />
      <Handle
        type="source"
        position="left"
        style={{ background: '#555', borderRadius: '50%' }}
      />
      {data.showWorkProducts && <div><strong>Work Product:</strong> {data.workProduct || 'N/A'}</div>}
      {data.showActivities && data.activity !== 'N/A' && <div><strong>Aktivitäten:</strong> {data.activity || 'N/A'}</div>}
      {data.showRoles && data.role !== 'N/A' && <div><strong>Rollen:</strong> {data.role || 'N/A'}</div>}
      {data.hasChildren && (
        <div
          style={{
            position: 'absolute',
            right: '5px',
            top: '50%',
            transform: 'translateY(-50%)',
            cursor: 'pointer',
          }}
          onClick={(e) => {
            e.stopPropagation();
            onToggle(data.id);
          }}
        >
          {isCollapsed ? '▶' : '▼'}
        </div>
      )}
    </div>
  );
};

export default WorkProductNode;