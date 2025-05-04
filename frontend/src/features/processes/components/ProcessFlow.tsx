import React, { useEffect } from 'react';
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
  Node,
  Edge,
  Position,
  NodeChange,
  EdgeChange,
} from '@xyflow/react';
import dagre from 'dagre';
import '@xyflow/react/dist/style.css';
import { fetchFlowPositions, saveFlowPositions, Activity, Role } from '../services/processService';

// Define types for node data
interface CustomNodeData {
  label: string;
  executedByName: string;
  resultName: string;
  resultId: string;
  knownTime: number;
  estimatedTime: number;
  multiplicator: number;
  compressor: string;
  [key: string]: unknown;
}

// Define type for saved positions
interface PositionData {
  x: number;
  y: number;
}

interface SavedPositions {
  [key: string]: PositionData;
}

const dagreGraph = new dagre.graphlib.Graph().setDefaultEdgeLabel(() => ({}));
const getLayoutedElements = (nodes: Node[], edges: Edge[], savedPositions: SavedPositions) => {
  dagreGraph.setGraph({ rankdir: 'TB' });

  nodes.forEach((node: Node) => {
    dagreGraph.setNode(node.id, { width: 200, height: 120 });
  });

  edges.forEach((edge: Edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  const layoutedNodes = nodes.map((node: Node) => {
    const position = savedPositions[node.id] || {
      x: dagreGraph.node(node.id).x - 100,
      y: dagreGraph.node(node.id).y - 60,
    };
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

const CustomNode = ({ data }: { data: CustomNodeData }) => {
  return (
    <div
      style={{
        width: '200px',
        height: '120px',
        border: '1px solid #333',
        borderRadius: '8px',
        background: '#fff',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '8px',
        position: 'relative',
      }}
      className="dark:bg-gray-800 dark:border-gray-600"
    >
      <Handle
        type="target"
        position={Position.Left}
        style={{ background: '#555', borderRadius: '50%' }}
      />
      <Handle
        type="source"
        position={Position.Right}
        style={{ background: '#555', borderRadius: '50%' }}
      />
      <div
        style={{
          textAlign: 'center',
          fontWeight: 'bold',
          fontSize: '14px',
        }}
        className="text-gray-800 dark:text-gray-200"
      >
        {data.label}
      </div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <svg className="w-4 h-4 mr-1 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
          </svg>
          <span
            style={{ fontSize: '12px' }}
            className="text-gray-600 dark:text-gray-400"
          >
            {data.executedByName || 'Unbekannt'}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <svg className="w-4 h-4 mr-1 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V7m-9 4h10"></path>
          </svg>
          <span
            style={{ fontSize: '12px' }}
            className="text-gray-600 dark:text-gray-400"
          >
            {data.resultName || 'Keins'}
          </span>
        </div>
      </div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginTop: '4px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <svg className="w-4 h-4 text-green-500 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          <span
            style={{ fontSize: '12px' }}
            className="text-gray-600 dark:text-gray-400"
          >
            {data.knownTime || 0}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <svg className="w-4 h-4 text-red-500 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          <span
            style={{ fontSize: '12px' }}
            className="text-gray-600 dark:text-gray-400"
          >
            {data.estimatedTime || 0}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          {data.compressor === 'multiply' ? (
            <svg className="w-4 h-4 mr-1 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
            </svg>
          ) : (
            <svg className="w-4 h-4 mr-1 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
            </svg>
          )}
          <span
            style={{ fontSize: '12px' }}
            className="text-gray-600 dark:text-gray-400"
          >
            {data.multiplicator || 1}
          </span>
        </div>
      </div>
    </div>
  );
};

const nodeTypes = { custom: CustomNode };

interface ProcessFlowProps {
  activities: Activity[];
  style: React.CSSProperties;
  onNodeClick: (activity: Activity) => void;
  processId: string | undefined;
}

const ProcessFlow: React.FC<ProcessFlowProps> = ({ activities, style, onNodeClick, processId }) => {
  const [nodes, setNodes] = useNodesState<Node<CustomNodeData>>([]);
  const [edges, setEdges] = useEdgesState<Edge>([]);

  const saveFlowPositionsHandler = async (positions: SavedPositions) => {
    try {
      if (!processId) return; // Sicherstellen, dass processId definiert ist
      console.log('Sende Positionen an Backend:', positions);
      const response = await saveFlowPositions(processId, positions);
      console.log('Backend-Antwort nach Speichern:', response);
    } catch (error) {
      console.error('Fehler beim Speichern der Flow-Positionen:', error);
    }
  };

  useEffect(() => {
    if (activities.length > 0 && processId) {
      const loadPositionsAndLayout = async () => {
        try {
          const savedPositionsResponse = await fetchFlowPositions(processId);
          const savedPositions: SavedPositions = savedPositionsResponse || {};
          console.log('Geladene Positionen vom Backend:', savedPositions);

          const activityNodes: Node<CustomNodeData>[] = activities.map((activity: Activity) => ({
            id: activity._id,
            type: 'custom',
            data: {
              label: activity.name,
              executedByName: typeof activity.executedBy === 'string' ? 'Unbekannt' : (activity.executedBy as Role)?.name || 'Unbekannt',
              resultName: typeof activity.result === 'string' ? 'Keins' : (activity.result as { name: string })?.name || 'Keins',
              resultId: typeof activity.result === 'string' ? activity.result : (activity.result as { _id: string })?._id || '',
              knownTime: activity.knownTime || 0,
              estimatedTime: activity.knownTime || 0,
              multiplicator: activity.multiplicator || 1,
              compressor: activity.compressor || 'multiply',
            },
            position: savedPositions[activity._id] || { x: 0, y: 0 },
            draggable: true,
          }));

          const activityEdges: Edge[] = [];
          let edgeIdCounter = 0;

          activities.forEach((sourceActivity: Activity) => {
            const sourceResultId = typeof sourceActivity.result === 'string' ? sourceActivity.result : (sourceActivity.result as { _id: string })?._id;
            if (!sourceResultId) return;

            activities.forEach((targetActivity: Activity) => {
              if (sourceActivity._id === targetActivity._id) return;

              const hasTrigger = targetActivity.trigger?.workProducts?.some((wp: { _id: string | { _id: string }; completionPercentage: number }) => {
                const wpId = typeof wp._id === 'string' ? wp._id : (wp._id as { _id: string })?._id?.toString();
                return wpId === sourceResultId?.toString();
              });

              if (hasTrigger) {
                activityEdges.push({
                  id: `e${edgeIdCounter++}`,
                  source: sourceActivity._id,
                  target: targetActivity._id,
                  type: 'step',
                  markerEnd: { type: MarkerType.ArrowClosed, width: 20, height: 20, color: '#333' },
                  style: { stroke: '#333', strokeWidth: 2 },
                  animated: true,
                });
              }
            });
          });

          const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(activityNodes, activityEdges, savedPositions);
          setNodes(layoutedNodes);
          setEdges(layoutedEdges);
        } catch (error) {
          console.error('Fehler beim Laden der Positionen:', error);
        }
      };

      loadPositionsAndLayout();
    }
  }, [activities, processId, setNodes, setEdges]);

  const onNodesChangeHandler = (changes: NodeChange[]) => {
    const updatedNodes = applyNodeChanges(changes, nodes);
    if (changes.some((change) => change.type === 'position')) {
      const positions: SavedPositions = {};
      updatedNodes.forEach((node: Node) => {
        if (node.position) {
          positions[node.id] = node.position;
        }
      });
      saveFlowPositionsHandler(positions);
    }
    setNodes(updatedNodes);
  };

  const onEdgesChangeHandler = (changes: EdgeChange[]) => {
    const updatedEdges = applyEdgeChanges(changes, edges);
    setEdges(updatedEdges);
  };

  const handleNodeClick = (_event: React.MouseEvent, node: Node) => {
    if (onNodeClick) {
      const activity = activities.find((act: Activity) => act._id.toString() === node.id);
      if (activity) {
        onNodeClick(activity);
      }
    }
  };

  return (
    <div style={{ height: '600px', border: '1px solid #ccc' }} className="dark:border-gray-700">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChangeHandler}
        onEdgesChange={onEdgesChangeHandler}
        nodeTypes={nodeTypes}
        onNodeClick={handleNodeClick}
        style={style}
        fitView
      >
        <Background color="#aaa" gap={16} />
        <Controls />
      </ReactFlow>
    </div>
  );
};

export default ProcessFlow;