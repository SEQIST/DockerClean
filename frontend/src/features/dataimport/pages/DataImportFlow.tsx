import React from 'react';
import { ReactFlow, Background, Controls, Node, Edge, useNodesState, useEdgesState, MarkerType } from '@xyflow/react';
import '@xyflow/react/dist/style.css';

const initialNodes: Node[] = [
  { id: '1', type: 'default', position: { x: 0, y: 0 }, data: { label: 'Datei hochladen' }, style: { backgroundColor: '#FFD700', padding: '10px', borderRadius: '5px' } },
  { id: '2', type: 'default', position: { x: 200, y: 100 }, data: { label: 'Daten parsen' }, style: { backgroundColor: '#1E90FF', color: '#fff', padding: '10px', borderRadius: '5px' } },
  { id: '3', type: 'default', position: { x: 200, y: 200 }, data: { label: 'Vorschau anzeigen' }, style: { backgroundColor: '#FF4500', color: '#fff', padding: '10px', borderRadius: '5px' } },
  { id: '4', type: 'default', position: { x: 200, y: 300 }, data: { label: 'In Datenbank speichern' }, style: { backgroundColor: '#32CD32', color: '#fff', padding: '10px', borderRadius: '5px' } },
];

const initialEdges: Edge[] = [
  { id: 'e1-2', source: '1', target: '2', type: 'step', markerEnd: { type: MarkerType.ArrowClosed } },
  { id: 'e2-3', source: '2', target: '3', type: 'step', markerEnd: { type: MarkerType.ArrowClosed } },
  { id: 'e3-4', source: '3', target: '4', type: 'step', markerEnd: { type: MarkerType.ArrowClosed } },
];

const DataImportFlow: React.FC = () => {
  const [nodes, , onNodesChange] = useNodesState(initialNodes);
  const [edges, , onEdgesChange] = useEdgesState(initialEdges);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-4">Datenimport-Prozess</h1>
      <div style={{ height: 'calc(100vh - 200px)', border: '1px solid #ccc' }} className="dark:border-gray-700">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          fitView
        >
          <Background color="#aaa" gap={16} />
          <Controls />
        </ReactFlow>
      </div>
    </div>
  );
};

export default DataImportFlow;