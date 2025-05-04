// alte Datei - die korrekte liegt in prozesse - sollte gelöscht werden
 import React, { useState, useEffect } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  useNodesState,
  useEdgesState,
  applyNodeChanges,
  applyEdgeChanges,
  MarkerType,
  Handle,
} from '@xyflow/react';
import dagre from 'dagre';
import '@xyflow/react/dist/style.css';

const dagreGraph = new dagre.graphlib.Graph().setDefaultEdgeLabel(() => ({}));
const getLayoutedElements = (nodes, edges, savedPositions) => {
  dagreGraph.setGraph({ rankdir: 'TB' });

  nodes.forEach((node) => {
    const savedPos = savedPositions[node.id] || { x: 0, y: 0 };
    dagreGraph.setNode(node.id, { width: 200, height: 120 });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  const layoutedNodes = nodes.map((node) => {
    const position = savedPositions[node.id] || {
      x: dagreGraph.node(node.id).x - 100,
      y: dagreGraph.node(node.id).y - 60,
    };
    console.log(`Node ${node.id} position:`, position);
    return {
      ...node,
      position,
    };
  });

  return {
    nodes: layoutedNodes,
    edges,
  };
};

const CustomNode = ({ data }) => {
  console.log('CustomNode data:', data);

  return (
    <div className="w-[200px] h-[120px] border border-gray-700 rounded-lg bg-white flex flex-col justify-between p-2 relative">
      <Handle
        type="target"
        position="left"
        style={{ background: '#555', borderRadius: '50%' }}
      />
      <Handle
        type="source"
        position="right"
        style={{ background: '#555', borderRadius: '50%' }}
      />
      <div className="text-center font-bold text-sm">{data.label}</div>
      <div className="flex justify-between items-center">
        <div className="flex items-center">
          <svg className="w-4 h-4 mr-1 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
          </svg>
          <span className="text-xs">{data.executedByName || 'Unbekannt'}</span>
        </div>
        <div className="flex items-center">
          <svg className="w-4 h-4 mr-1 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V7m-9 4h10"></path>
          </svg>
          <span className="text-xs">{data.resultName || 'Keins'}</span>
        </div>
      </div>
      <div className="flex justify-between items-center mt-1">
        <div className="flex items-center">
          <svg className="w-4 h-4 text-green-500 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          <span className="text-xs">{data.knownTime || 0}</span>
        </div>
        <div className="flex items-center">
          <svg className="w-4 h-4 text-red-500 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          <span className="text-xs">{data.estimatedTime || 0}</span>
        </div>
        <div className="flex items-center">
          {data.compressor === 'multiply' ? (
            <svg className="w-4 h-4 mr-1 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
            </svg>
          ) : (
            <svg className="w-4 h-4 mr-1 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
            </svg>
          )}
          <span className="text-xs">{data.multiplicator || 1}</span>
        </div>
      </div>
    </div>
  );
};

const nodeTypes = { custom: CustomNode };

const ProcessFlow = ({ activities, style, onNodeClick }) => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  const loadSavedPositions = () => {
    const savedPositions = localStorage.getItem('nodePositions');
    console.log('Geladene Positionen aus localStorage:', savedPositions);
    return savedPositions ? JSON.parse(savedPositions) : {};
  };

  const savePositions = (updatedNodes) => {
    const positions = {};
    updatedNodes.forEach((node) => {
      if (node.position) {
        positions[node.id] = node.position;
      }
    });
    console.log('Speichere Positionen:', positions);
    try {
      localStorage.setItem('nodePositions', JSON.stringify(positions));
    } catch (e) {
      console.error('Fehler beim Speichern in localStorage:', e);
    }
  };

  useEffect(() => {
    if (activities.length > 0) {
      const savedPositions = loadSavedPositions();
      const activityNodes = activities.map((activity) => ({
        id: activity._id,
        type: 'custom',
        data: {
          label: activity.name,
          executedByName: activity.executedBy?.name || 'Unbekannt',
          resultName: activity.result?.name || 'Keins',
          resultId: activity.result?._id || activity.result,
          knownTime: activity.knownTime || 0,
          estimatedTime: activity.knownTime || 0,
          multiplicator: activity.multiplicator || 1,
          compressor: activity.compressor || 'multiply',
        },
        position: savedPositions[activity._id] || { x: 0, y: 0 },
        draggable: true,
      }));

      const activityEdges = [];
      let edgeIdCounter = 0;

      activities.forEach((sourceActivity) => {
        const sourceResultId = sourceActivity.result?._id || sourceActivity.result;
        if (!sourceResultId) return;

        activities.forEach((targetActivity) => {
          if (sourceActivity._id === targetActivity._id) return;

          console.log(`Processing trigger for targetActivity ${targetActivity.name}:`, targetActivity.trigger?.workProducts);

          const hasTrigger = targetActivity.trigger?.workProducts?.some((wp, index) => {
            if (!wp || !wp._id) {
              console.warn(`Skipping invalid work product at index ${index} in trigger.workProducts:`, wp);
              return false;
            }
            const wpId = wp._id?._id ? wp._id._id.toString() : wp._id.toString();
            return wpId === sourceResultId.toString();
          }) || false;

          if (hasTrigger) {
            activityEdges.push({
              id: `e${edgeIdCounter++}`,
              source: sourceActivity._id,
              target: targetActivity._id,
              type: 'step',
              markerEnd: { type: MarkerType.ArrowClosed, width: 20, height: 20, color: '#333' },
              sourcePosition: 'right',
              targetPosition: 'left',
              style: { stroke: '#333', strokeWidth: 2 },
              animated: true,
            });
          }
        });
      });

      const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(activityNodes, activityEdges, savedPositions);
      setNodes(layoutedNodes);
      setEdges(layoutedEdges);
    }
  }, [activities]);

  const onNodesChangeHandler = (changes) => {
    console.log('Knotenänderungen erkannt:', changes);
    const updatedNodes = applyNodeChanges(changes, nodes);
    if (changes.some((change) => change.type === 'position')) {
      console.log('Positionsänderung erkannt, speichere...');
      savePositions(updatedNodes);
    }
    setNodes(updatedNodes);
  };

  const handleNodeClick = (event, node) => {
    if (onNodeClick) {
      const activity = activities.find(act => act._id.toString() === node.id);
      if (activity) {
        onNodeClick(activity);
      }
    }
  };

  console.log('ProcessFlow.jsx: Nodes:', nodes);
  console.log('ProcessFlow.jsx: Edges:', edges);

  return (
    <div className="h-[600px] border border-gray-300">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChangeHandler}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        onNodeClick={handleNodeClick}
        style={style}
        fitView
      >
        <Background color="#aaa" gap={16} variant="lines" /> {/* Punkte entfernt, Linien als Hintergrund */}
        <Controls />
      </ReactFlow>
    </div>
  );
};

export default ProcessFlow;