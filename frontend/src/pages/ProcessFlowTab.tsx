import React from 'react';
import { Box } from '@mui/material';
import { ReactFlow, Background, Controls } from '@xyflow/react';

const ProcessFlowTab = ({ nodes, edges }) => {
  console.log('ProcessFlowTab.jsx: Rendering with nodes:', nodes); // Debugging-Log
  console.log('ProcessFlowTab.jsx: Rendering with edges:', edges); // Debugging-Log

  return (
    <Box sx={{ mb: 3 }}>
      <Box sx={{ height: '800px', width: '800px', border: '1px solid #ccc', borderRadius: 5, mt: 3 }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          fitView
          style={{ width: '100%', height: '100%' }}
        >
          <Background />
          <Controls />
        </ReactFlow>
      </Box>
    </Box>
  );
};

export default ProcessFlowTab;