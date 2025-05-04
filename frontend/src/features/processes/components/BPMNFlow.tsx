import React, { useEffect, useState, useCallback } from 'react';
import {
  ReactFlow,
  Controls,
  Handle,
  useNodesState,
  useEdgesState,
  MarkerType,
  applyNodeChanges,
  applyEdgeChanges,
  Node,
  Edge,
  Position,
  EdgeMarkerType,
} from '@xyflow/react';
import { Resizable } from 'react-resizable';
import '@xyflow/react/dist/style.css';
import 'react-resizable/css/styles.css';
import { fetchBPMNPositions, saveBPMNPositions, Activity, Role } from '../services/processService';

// Define types for saved positions and lane dimensions
interface PositionData {
  x: number;
  y: number;
}

interface LaneDimension {
  width: number;
  height: number;
}

interface SavedPositions {
  [key: string]: PositionData | Edge | LaneDimension;
}

interface BPMNPositions {
  positions: SavedPositions;
}

// Define custom node data types
interface BPMNNodeData {
  label: string;
  resultName: string;
  [key: string]: unknown;
}

interface SwimlaneNodeData {
  label: string;
  width: number;
  height: number;
  roleId: string;
  [key: string]: unknown;
}

interface RoleLabelNodeData {
  label: string;
  [key: string]: unknown;
}

// Custom Node für BPMN-Aktivitäten
const BPMNNode = ({ data }: { data: BPMNNodeData }) => {
  return (
    <div
      style={{
        width: 150,
        height: 80,
        border: '2px solid #333',
        borderRadius: 10,
        background: '#fff',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 10,
        fontSize: 12,
        boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
        zIndex: 10,
      }}
      className="dark:bg-gray-800 dark:border-gray-600"
    >
      <Handle type="target" position={Position.Left} style={{ background: '#555', borderRadius: '50%' }} />
      <Handle type="source" position={Position.Right} style={{ background: '#555', borderRadius: '50%' }} />
      <div className="font-bold text-center text-gray-800 dark:text-gray-200">{data.label}</div>
      <div className="text-[10px] text-gray-600 dark:text-gray-400">{data.resultName || 'Kein Ergebnis'}</div>
    </div>
  );
};

// Custom Node für Swimlanes
const SwimlaneNode = ({ data, onResize }: { data: SwimlaneNodeData; onResize: (roleId: string, width: number, height: number) => void }) => {
  return (
    <Resizable
      width={data.width || 1400}
      height={data.height || 150}
      onResize={(_event, { size }) => onResize(data.roleId, size.width, size.height)}
      minConstraints={[300, 80]}
      maxConstraints={[3000, 300]}
      resizeHandles={['se']}
    >
      <div
        style={{
          width: data.width || 1400,
          height: data.height || 150,
          border: '1px solid #3b82f6',
          borderRadius: 8,
          display: 'flex',
          alignItems: 'center',
          paddingLeft: 150,
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
          zIndex: 1,
        }}
        className="bg-blue-50 dark:bg-blue-900 dark:border-blue-700"
      />
    </Resizable>
  );
};

// Custom Node für Rollennamen
const RoleLabelNode = ({ data }: { data: RoleLabelNodeData }) => {
  return (
    <div
      style={{
        width: 130,
        height: 40,
        background: 'transparent',
        border: 'none',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-start',
        fontWeight: 'bold',
        fontSize: 16,
        zIndex: 5,
      }}
      className="text-blue-900 dark:text-blue-300"
    >
      {data.label}
    </div>
  );
};

// Definiere nodeTypes außerhalb der Komponente
const nodeTypes = {
  bpmnNode: BPMNNode,
  swimlane: SwimlaneNode,
  roleLabel: RoleLabelNode,
};

// Define the types for the swimlane structure
interface Swimlane {
  roleId: string;
  roleName: string;
  yPosition: number;
}

interface BPMNFlowProps {
  activities: Activity[];
  roles: Role[];
  style: React.CSSProperties;
  processId: string | undefined;
}

const BPMNFlow: React.FC<BPMNFlowProps> = ({ activities, roles, style, processId }) => {
  const [nodes, setNodes] = useNodesState<Node>([]);
  const [edges, setEdges] = useEdgesState<Edge>([]);
  const [laneDimensions, setLaneDimensions] = useState<{ [key: string]: LaneDimension }>({});

  // Positionen und Lane-Dimensionen aus dem Backend laden
  useEffect(() => {
    const loadPositions = async () => {
      try {
        if (!activities || activities.length === 0) {
          return;
        }

        if (!roles || roles.length === 0) {
          return;
        }

        if (!processId) return; // Sicherstellen, dass processId definiert ist

        const savedPositionsResponse = await fetchBPMNPositions(processId);
        const savedPositions: SavedPositions = savedPositionsResponse.positions || {};

        // Initialisiere laneDimensions mit den geladenen Daten
        const initialLaneDimensions: { [key: string]: LaneDimension } = {};
        Object.entries(savedPositions).forEach(([key, value]) => {
          if (key.startsWith('swimlane-') && value && typeof value === 'object' && 'width' in value && 'height' in value) {
            const roleId = key.replace('swimlane-', '');
            initialLaneDimensions[roleId] = { width: value.width, height: value.height };
          }
        });
        setLaneDimensions(initialLaneDimensions);

        // Filtere Rollen, die tatsächlich im Prozess verwendet werden
        const usedRoleIds = new Set(
          activities
            .filter((activity) => activity && activity.executedBy)
            .map((activity) => {
              const roleId = typeof activity.executedBy === 'string' ? activity.executedBy : activity.executedBy?._id?.toString();
              return roleId;
            })
            .filter((id) => id)
        );
        const filteredRoles = roles.filter((role) => role && role._id && usedRoleIds.has(role._id.toString()));

        if (filteredRoles.length === 0) {
          return;
        }

        // Erstelle Swimlanes basierend auf gefilterten Rollen
        let yOffset = 0;
        const swimlanes: Swimlane[] = filteredRoles.map((role: Role) => {
          const laneHeight = initialLaneDimensions[role._id]?.height || 150;
          const swimlane = {
            roleId: role._id.toString(),
            roleName: role.name,
            yPosition: yOffset,
          };
          yOffset += laneHeight + 10;
          return swimlane;
        });

        // Erstelle Knoten für Aktivitäten
        const activityNodes: Node<BPMNNodeData>[] = [];
        const activityEdges: Edge[] = [];
        let edgeIdCounter = 0;

        // Berechne die maximale Breite basierend auf den Aktivitäten und gespeicherten Dimensionen
        let maxWidth = 1400;
        let lastXPosition = 200;

        // First, process activities in the "Geschäftsführung" swimlane (assumed to be the first role)
        const primaryRole = swimlanes.find((swimlane: Swimlane) => swimlane.roleName === 'Geschäftsführung');
        if (primaryRole) {
          const activitiesInPrimaryRole = activities.filter(
            (activity) =>
              activity &&
              activity.executedBy &&
              (typeof activity.executedBy === 'string' ? activity.executedBy : activity.executedBy?._id?.toString()) === primaryRole.roleId
          );

          activitiesInPrimaryRole.forEach((activity: Activity) => {
            const nodeId = `activity-${activity._id}`;
            const xPosition = lastXPosition;
            const savedPos = (savedPositions[nodeId] as PositionData) || { x: xPosition, y: primaryRole.yPosition + 35 };
            activityNodes.push({
              id: nodeId,
              type: 'bpmnNode',
              data: {
                label: activity.name || 'Unbenannt',
                resultName: typeof activity.result === 'string' ? 'Kein Ergebnis' : activity.result?.name || 'Kein Ergebnis',
              },
              position: savedPos,
              draggable: true,
            });

            // Update lastXPosition for the next activity
            lastXPosition = xPosition + 250;

            // Berechne die maximale Breite
            const nodeRightEdge = savedPos.x + 150;
            if (nodeRightEdge + 250 > maxWidth) {
              maxWidth = nodeRightEdge + 250;
            }
          });
        }

        // Now process activities in other swimlanes, starting after the last activity in "Geschäftsführung"
        swimlanes.forEach((swimlane: Swimlane) => {
          if (swimlane.roleName === 'Geschäftsführung') return;

          const activitiesInRole = activities.filter(
            (activity) =>
              activity &&
              activity.executedBy &&
              (typeof activity.executedBy === 'string' ? activity.executedBy : activity.executedBy?._id?.toString()) === swimlane.roleId
          );

          activitiesInRole.forEach((activity: Activity, index: number) => {
            const nodeId = `activity-${activity._id}`;
            const xPosition = lastXPosition + (index * 250);
            const savedPos = (savedPositions[nodeId] as PositionData) || { x: xPosition, y: swimlane.yPosition + 35 };
            activityNodes.push({
              id: nodeId,
              type: 'bpmnNode',
              data: {
                label: activity.name || 'Unbenannt',
                resultName: typeof activity.result === 'string' ? 'Kein Ergebnis' : activity.result?.name || 'Kein Ergebnis',
              },
              position: savedPos,
              draggable: true,
            });

            // Update lastXPosition for the next activity
            lastXPosition = xPosition + 250;

            // Berechne die maximale Breite
            const nodeRightEdge = savedPos.x + 150;
            if (nodeRightEdge + 250 > maxWidth) {
              maxWidth = nodeRightEdge + 250;
            }
          });
        });

        // Erstelle Kanten basierend auf Trigger-Beziehungen
        activities.forEach((sourceActivity: Activity) => {
          if (!sourceActivity || !sourceActivity.result) return;

          const sourceResultId = typeof sourceActivity.result === 'string' ? sourceActivity.result : sourceActivity.result?._id;
          if (!sourceResultId) return;

          activities.forEach((targetActivity: Activity) => {
            if (!targetActivity || sourceActivity._id === targetActivity._id) return;

            const hasTrigger = targetActivity.trigger?.workProducts?.some((wp: { _id: string | { _id: string }; completionPercentage: number }) => {
              if (!wp || !wp._id) return false;
              const wpId = typeof wp._id === 'string' ? wp._id : wp._id?._id?.toString();
              return wpId === sourceResultId?.toString();
            }) || false;

            if (hasTrigger) {
              const edgeId = `e${edgeIdCounter++}`;
              const savedEdge = (savedPositions[edgeId] as Edge) || {
                id: edgeId,
                source: `activity-${sourceActivity._id}`,
                target: `activity-${targetActivity._id}`,
                type: 'smoothstep',
                markerEnd: { type: MarkerType.ArrowClosed, width: 20, height: 20, color: '#333' } as EdgeMarkerType,
                style: { stroke: '#333', strokeWidth: 2, zIndex: 20 },
                label: '>>>',
                labelStyle: { fill: '#333', fontSize: 10 },
                animated: true,
                zIndex: 20,
              };
              // Sicherstellen, dass jede Kante eine ID hat
              if (!savedEdge.id) {
                savedEdge.id = edgeId;
              }
              activityEdges.push(savedEdge);
            }
          });
        });

        // Erstelle Swimlane-Knoten (als Hintergrund für Rollen)
        const swimlaneNodes: Node<SwimlaneNodeData>[] = swimlanes.map((swimlane: Swimlane) => {
          const laneDimension = initialLaneDimensions[swimlane.roleId] || { width: maxWidth, height: 150 };
          return {
            id: `swimlane-${swimlane.roleId}`,
            type: 'swimlane',
            data: {
              label: swimlane.roleName,
              width: laneDimension.width,
              height: laneDimension.height,
              roleId: swimlane.roleId,
            },
            position: { x: 0, y: swimlane.yPosition },
            draggable: false,
          };
        });

        // Erstelle Knoten für Rollennamen (links von der Swimlane)
        const roleLabelNodes: Node<RoleLabelNodeData>[] = swimlanes.map((swimlane: Swimlane) => ({
          id: `role-label-${swimlane.roleId}`,
          type: 'roleLabel',
          data: { label: swimlane.roleName },
          position: { x: 10, y: swimlane.yPosition + ((initialLaneDimensions[swimlane.roleId]?.height || 150) / 2) },
          draggable: false,
        }));

        // Kombiniere alle Knoten: Swimlanes zuerst, dann Rollennamen, dann Aktivitäten
        setNodes([...swimlaneNodes, ...roleLabelNodes, ...activityNodes]);
        setEdges(activityEdges);
      } catch (error) {
        console.error('Fehler beim Laden der BPMN-Ansicht:', error);
      }
    };

    if (processId) {
      loadPositions();
    }
  }, [activities, roles, processId, setNodes, setEdges]);

  // Positionen speichern
  const savePositions = useCallback(async (updatedNodes: Node[], updatedEdges: Edge[]) => {
    const positions: SavedPositions = {};
    updatedNodes.forEach((node: Node) => {
      if (node.position) {
        positions[node.id] = node.position;
      }
    });
    updatedEdges.forEach((edge: Edge) => {
      if (edge.id) {
        positions[edge.id] = {
          id: edge.id,
          source: edge.source,
          target: edge.target,
          type: edge.type,
          markerEnd: edge.markerEnd,
          style: edge.style,
          label: edge.label,
          labelStyle: edge.labelStyle,
          animated: edge.animated,
          zIndex: edge.zIndex,
        };
      }
    });

    // Füge laneDimensions zu positions hinzu
    Object.entries(laneDimensions).forEach(([key, value]) => {
      positions[`swimlane-${key}`] = value;
    });

    // Entferne ungültige Schlüssel (z. B. undefined)
    const cleanedPositions = Object.fromEntries(
      Object.entries(positions).filter(([key]) => key !== 'undefined')
    );

    try {
      if (processId) {
        await saveBPMNPositions(processId, cleanedPositions);
      }
    } catch (error) {
      console.error('Fehler beim Speichern der Positionen:', error);
    }
  }, [processId, laneDimensions]);

  // Positionen bei Änderungen speichern
  const onNodesChangeHandler = useCallback(
    (changes: any) => {
      const updatedNodes = applyNodeChanges(changes, nodes);
      if (changes.some((change: any) => change.type === 'position')) {
        savePositions(updatedNodes, edges);
      }
      setNodes(updatedNodes);
    },
    [nodes, edges, savePositions, setNodes]
  );

  const onEdgesChangeHandler = useCallback(
    (changes: any) => {
      const updatedEdges = applyEdgeChanges(changes, edges);
      savePositions(nodes, updatedEdges);
      setEdges(updatedEdges);
    },
    [nodes, edges, savePositions, setEdges]
  );

  // Funktion zum Anpassen der Breite und Höhe einer Lane
  const handleResize = (roleId: string, width: number, height: number) => {
    const newDimensions = {
      ...laneDimensions,
      [roleId]: { width, height },
    };
    setLaneDimensions(newDimensions);
    // Speichere die neuen Dimensionen direkt
    savePositions(nodes, edges);
  };

  return (
    <div style={{ height: '600px', ...style }} className="border border-gray-300 dark:border-gray-700 rounded-lg">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChangeHandler}
        onEdgesChange={onEdgesChangeHandler}
        nodeTypes={{
          ...nodeTypes,
          swimlane: (props: any) => <SwimlaneNode {...props} onResize={handleResize} />,
        }}
        fitView
      >
        <Controls />
      </ReactFlow>
    </div>
  );
};

export default BPMNFlow;