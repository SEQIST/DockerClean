import React, { useMemo, useState, useEffect } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  Handle,
  useNodesState,
  useEdgesState,
  Position,
  Node,
  Edge,
  BackgroundVariant,
} from "reactflow";
import { Resizable } from 'react-resizable';
import { useLocation } from 'react-router-dom';
import useWorkProductsData from './../../products/hooks/useWorkProductsData.ts';
import PageMeta from "../../../components/common/PageMeta";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import 'react-resizable/css/styles.css';

// Custom Node Component
const CustomNode = ({ data }: { data: { workProduct?: string; activity?: string; role?: string } }) => {
  return (
    <div
      style={{
        padding: '10px',
        background: '#fff',
        border: '1px solid #000',
        borderRadius: 4,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        justifyContent: 'center',
        width: 200,
        minHeight: 80,
        fontSize: '12px',
      }}
    >
      <Handle type="target" position={Position.Right} style={{ background: '#000', width: 8, height: 8 }} />
      <Handle type="source" position={Position.Left} style={{ background: '#000', width: 8, height: 8 }} />

      {data.workProduct && (
        <div className="flex items-center mb-1">
          <svg className="w-4 h-4 mr-2 text-blue-600" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
            <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
            <path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clipRule="evenodd" />
          </svg>
          <span className="text-blue-800">{data.workProduct}</span>
        </div>
      )}
      {data.activity && (
        <div className="flex items-center mb-1">
          <svg className="w-4 h-4 mr-2 text-green-600" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
            <path d="M2 4a2 2 0 012-2h6a2 2 0 012 2v2h4a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2V6H2V4zm4 10h10V8H6v6zm0-8V4h6v2H6z" />
          </svg>
          <span className="text-gray-700">{data.activity}</span>
        </div>
      )}
      {data.role && (
        <div className="flex items-center">
          <svg className="w-4 h-4 mr-2 text-purple-600" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
          </svg>
          <span className="text-gray-700">{data.role}</span>
        </div>
      )}
    </div>
  );
};

// Definiere nodeTypes außerhalb der Komponente
const nodeTypes = {
  custom: CustomNode,
};

interface WorkProduct {
  _id: string;
  name: string;
  number: string;
  useMode: string;
  cost: string;
  description: string;
}

interface Activity {
  _id: string;
  name: string;
  executedBy?: string | { _id: string };
  result: { _id: string };
  trigger?: { workProducts: Array<{ _id: string | { _id: string } }> };
}

interface Role {
  _id: string;
  name: string;
}

interface WorkProductsData {
  workProducts: WorkProduct[];
  roles: Role[];
  activities: Activity[];
  loading: boolean;
  error: string | null;
}

const WorkProductsTree: React.FC = () => {
  const { workProducts, roles, activities, loading, error } = useWorkProductsData() as WorkProductsData;
  const location = useLocation();
  const [selectedEndProduct, setSelectedEndProduct] = useState<WorkProduct | null>(null);
  const [showWorkProducts, setShowWorkProducts] = useState<boolean>(true);
  const [showActivities, setShowActivities] = useState<boolean>(true);
  const [showRoles, setShowRoles] = useState<boolean>(true);
  const [nodes, setNodes, onNodesChange] = useNodesState<Node[]>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge[]>([]);
  const [dimensions, setDimensions] = useState({ width: 1200, height: 600 });
  const [searchQuery, setSearchQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    console.log('Geladene Rollen:', roles);
  }, [roles]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const selectedId = params.get('selected');
    if (selectedId && workProducts.length > 0) {
      const selectedProduct = workProducts.find((wp: WorkProduct) => wp._id === selectedId);
      if (selectedProduct) {
        setSelectedEndProduct(selectedProduct);
        setSearchQuery(selectedProduct.name);
      } else {
        setSelectedEndProduct(null);
        setSearchQuery('');
      }
    } else if (workProducts.length > 0 && !selectedEndProduct) {
      setSelectedEndProduct(workProducts[0]);
      setSearchQuery(workProducts[0].name);
    }
  }, [workProducts, location.search]);

  // Funktion zur Berechnung der maximalen Tiefe des Baums
  const calculateMaxDepth = (endProductId: string, visited = new Set<string>(), currentDepth = 0): number => {
    if (visited.has(endProductId)) {
      return currentDepth;
    }
    visited.add(endProductId);

    const endProduct = workProducts.find((wp: WorkProduct) => wp._id.toString() === endProductId.toString());
    if (!endProduct) {
      return currentDepth;
    }

    const relatedActivity = activities.find((activity: Activity) =>
      activity.result && activity.result._id && activity.result._id.toString() === endProductId.toString()
    );

    if (!relatedActivity || !relatedActivity.trigger?.workProducts?.length) {
      return currentDepth;
    }

    let maxDepth = currentDepth;
    for (const triggerWp of relatedActivity.trigger.workProducts) {
      const triggerId = typeof triggerWp._id === 'string' ? triggerWp._id : triggerWp._id._id;
      const depth = calculateMaxDepth(triggerId, new Set(visited), currentDepth + 1);
      maxDepth = Math.max(maxDepth, depth);
    }

    return maxDepth;
  };

  // Rekursive Funktion zum Aufbau der Baumstruktur
  const buildTree = (
    endProductId: string,
    maxDepth: number,
    depth = 0,
    yOffset = 0,
    visited = new Set<string>(),
    localEdgeCounter = { count: 0 }
  ): { nodes: Node[]; edges: Edge[] } => {
    const nodes: Node[] = [];
    const edges: Edge[] = [];

    if (visited.has(endProductId)) {
      return { nodes, edges };
    }
    visited.add(endProductId);

    const endProduct = workProducts.find((wp: WorkProduct) => wp._id.toString() === endProductId.toString());
    if (!endProduct) {
      console.warn(`Work Product mit ID ${endProductId} nicht gefunden.`);
      return { nodes, edges };
    }

    const relatedActivity = activities.find((activity: Activity) =>
      activity.result && activity.result._id && activity.result._id.toString() === endProductId.toString()
    );
    console.log(`Zugehörige Aktivität für Work Product ${endProductId} (${endProduct?.name}):`, relatedActivity);

    let role: Role | null = null;
    if (relatedActivity && relatedActivity.executedBy) {
      const executedById = typeof relatedActivity.executedBy === 'object' ? relatedActivity.executedBy._id.toString() : relatedActivity.executedBy.toString();
      role = roles.find((r: Role) => r._id.toString() === executedById) || null;
      if (!role) {
        console.error(`Rolle mit ID ${executedById} nicht in roles gefunden. Verfügbare Rollen:`, roles);
      }
    }
    console.log(`Ausführende Rolle für Work Product ${endProductId} (${endProduct?.name}):`, role);

    const labelParts: { workProduct?: string; activity?: string; role?: string } = {};
    if (showWorkProducts) labelParts.workProduct = `Work Product: ${endProduct.name}`;
    if (showActivities && relatedActivity) labelParts.activity = `Aktivität: ${relatedActivity.name}`;
    if (showRoles) labelParts.role = role ? `Rolle: ${role.name}` : 'Rolle: Keine Rolle';

    const endProductNode: Node = {
      id: `wp-${endProductId}-${depth}`,
      type: 'custom',
      data: labelParts,
      position: { x: (maxDepth - depth) * 300, y: yOffset },
      draggable: true,
    };

    nodes.push(endProductNode);

    if (relatedActivity && relatedActivity.trigger) {
      const trigger = relatedActivity.trigger;
      if (trigger.workProducts?.length > 0) {
        const triggerCount = trigger.workProducts.length;
        trigger.workProducts.forEach((triggerWp: { _id: string | { _id: string } }, index: number) => {
          const triggerId = typeof triggerWp._id === 'string' ? triggerWp._id : triggerWp._id._id;
          const triggerWorkProduct = workProducts.find((wp: WorkProduct) => wp._id.toString() === triggerId.toString());
          if (!triggerWorkProduct) {
            console.warn(`Trigger-Work Product mit ID ${triggerId} nicht gefunden.`);
            return;
          }

          const childYOffset = yOffset + (index - (triggerCount - 1) / 2) * 150;
          const { nodes: childNodes, edges: childEdges } = buildTree(
            triggerId,
            maxDepth,
            depth + 1,
            childYOffset,
            new Set(visited),
            localEdgeCounter
          );

          nodes.push(...childNodes);
          edges.push(...childEdges);

          if (childNodes.length > 0) {
            const edgeId = `edge-${endProductNode.id}-trigger-${triggerId}-${localEdgeCounter.count++}`;
            const newEdge: Edge = {
              id: edgeId,
              source: endProductNode.id,
              target: childNodes[0].id,
              type: 'smoothstep',
              style: { stroke: '#000', strokeWidth: 1, strokeDasharray: '5,5' },
              label: '>>>',
              labelStyle: { fill: '#000', fontSize: 10 },
              labelBgPadding: [4, 2],
              labelBgBorderRadius: 4,
              labelBgStyle: { fill: '#fff', stroke: '#000', strokeWidth: 1 },
            };
            edges.push(newEdge);
            console.log(`Erstellte Kante:`, newEdge);
          }
        });
      }
    }

    console.log(`Nodes für Work Product ${endProductId}:`, nodes);
    console.log(`Edges für Work Product ${endProductId}:`, edges);

    return { nodes, edges };
  };

  const filteredWorkProducts = searchQuery
    ? workProducts.filter(
        (wp: WorkProduct) =>
          wp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          wp._id.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : workProducts;

  const handleSelectWorkProduct = (wp: WorkProduct) => {
    setSearchQuery(wp.name);
    setSelectedEndProduct(wp);
    setShowDropdown(false);
  };

  const { nodes: computedNodes, edges: computedEdges } = useMemo(() => {
    if (!selectedEndProduct || !activities || !workProducts) {
      return { nodes: [], edges: [] };
    }

    const maxDepth = calculateMaxDepth(selectedEndProduct._id);
    return buildTree(selectedEndProduct._id, maxDepth);
  }, [selectedEndProduct, activities, workProducts, showWorkProducts, showActivities, showRoles]);

  useEffect(() => {
    setNodes(computedNodes);
    setEdges(computedEdges);
    console.log('Final Nodes:', computedNodes);
    console.log('Final Edges:', computedEdges);
  }, [computedNodes, computedEdges, setNodes, setEdges]);

  const handleResize = (event: any, { size }: { size: { width: number; height: number } }) => {
    setDimensions({ width: size.width, height: size.height });
  };

  if (loading) return <p className="text-gray-500 dark:text-gray-400 p-4">Lade Daten...</p>;
  if (error) return <p className="text-red-500 dark:text-red-400 p-4">Fehler: {error}</p>;

  return (
    <>
      <PageMeta
        title="Work Products Tree | SEQ.IST - Project Management Solution"
        description="Visualize work products tree in the SEQ.IST Project Management Solution"
      />
      <PageBreadcrumb pageTitle="Work Products Tree" />
      <div className="flex justify-center pt-4 pb-4 px-2">
        <div className="w-full">
          <h2 className="text-2xl font-bold text-center mb-4 text-blue-600 dark:text-blue-400">
            Work Products Tree
          </h2>

          <div className="flex justify-center mb-4 gap-4">
            <div className="w-72 relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowDropdown(true);
                }}
                onFocus={() => setShowDropdown(true)}
                onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
                placeholder="Endprodukt suchen..."
                className="w-full py-2 pl-3 pr-8 text-sm text-gray-800 bg-transparent border border-gray-300 rounded-lg appearance-none dark:bg-dark-900 h-9 shadow-theme-xs placeholder:text-gray-400 focus:border-blue-300 focus:outline-hidden focus:ring-3 focus:ring-blue-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-blue-800"
              />
              {showDropdown && searchQuery && (
                <div className="absolute z-20 w-full max-h-60 overflow-y-auto bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg mt-1">
                  {filteredWorkProducts.length > 0 ? (
                    filteredWorkProducts.map((wp) => (
                      <div
                        key={wp._id}
                        className="px-4 py-2 text-sm text-gray-800 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                        onClick={() => handleSelectWorkProduct(wp)}
                      >
                        {wp.name}
                      </div>
                    ))
                  ) : (
                    <div className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400">
                      Keine Ergebnisse gefunden
                    </div>
                  )}
                </div>
              )}
            </div>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={showWorkProducts}
                onChange={(e) => setShowWorkProducts(e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="ml-2 text-sm text-gray-900 dark:text-gray-300">Work Products anzeigen</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={showActivities}
                onChange={(e) => setShowActivities(e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="ml-2 text-sm text-gray-900 dark:text-gray-300">Aktivitäten anzeigen</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={showRoles}
                onChange={(e) => setShowRoles(e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="ml-2 text-sm text-gray-900 dark:text-gray-300">Rollen anzeigen</span>
            </label>
          </div>

          <div className="flex justify-center">
            <div className="bg-white dark:bg-gray-900 shadow-xl p-4 rounded-lg">
              <Resizable
                width={dimensions.width}
                height={dimensions.height}
                onResize={handleResize}
                minConstraints={[800, 400]}
                maxConstraints={[1600, 800]}
                resizeHandles={['se']}
              >
                <div style={{ width: dimensions.width, height: dimensions.height, border: '1px solid #e5e7eb', borderRadius: 8 }}>
                  <ReactFlow
                    nodes={nodes}
                    edges={edges}
                    fitView
                    style={{ background: '#f9fafb' }}
                    nodesDraggable={true}
                    nodeTypes={nodeTypes}
                    onNodesChange={(changes) => {
                      console.log('Nodes Change:', changes);
                      onNodesChange(changes);
                    }}
                    onEdgesChange={(changes) => {
                      console.log('Edges Change:', changes);
                      onEdgesChange(changes);
                    }}
                    defaultViewport={{ x: 0, y: 0, zoom: 0.8 }}
                    minZoom={0.2}
                    maxZoom={2}
                  >
                    <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="#d1d5db" />
                    <Controls />
                  </ReactFlow>
                </div>
              </Resizable>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default WorkProductsTree;