import { useState, useEffect, useCallback } from 'react';
import { ReactFlow, Background, Controls, applyNodeChanges, Node, Edge, NodeChange } from '@xyflow/react';
import PageMeta from "../../../components/common/PageMeta";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import EditableNode from '../components/EditableNode'; // Import der ausgelagerten Komponente
import getLayoutedElements from '../utils/getLayoutedElements'; // Import der ausgelagerten Funktion
import '@xyflow/react/dist/style.css';

const DepartmentsFlow = () => {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const onNodesChange = useCallback(
    (changes: NodeChange[]) => setNodes((nds) => applyNodeChanges(changes, nds)),
    []
  );

  const handleLabelChange = useCallback((id: string, newLabel: string) => {
    setNodes((nds: Node[]) =>
      nds.map((node) =>
        node.id === id ? { ...node, data: { ...node.data, label: newLabel } } : node
      )
    );
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const departmentsResponse = await fetch('http://localhost:5001/api/departments');
        if (!departmentsResponse.ok) throw new Error(`Fehler beim Laden der Abteilungen: ${departmentsResponse.status}`);

        const departmentsData = await departmentsResponse.json();

        if (!Array.isArray(departmentsData) || departmentsData.length === 0) {
          setNodes([]);
          setEdges([]);
          setLoading(false);
          return;
        }

        const newNodes: Node[] = departmentsData.map((dept: any) => {
          const headId = typeof dept.headOfDepartment === 'string' ? dept.headOfDepartment : dept.headOfDepartment?._id?.toString() || '';
          const head = dept.headOfDepartment?.name || 'Kein Leiter';

          return {
            id: dept._id,
            type: 'editable',
            data: { label: dept.name, head: head, onLabelChange: handleLabelChange },
            position: { x: 0, y: 0 },
            draggable: true,
          };
        });

        const newEdges: Edge[] = departmentsData
          .filter((dept: any) => dept.isJuniorTo)
          .map((dept: any) => {
            const edge: Edge = {
              id: `e${dept.isJuniorTo._id || dept.isJuniorTo}-${dept._id}`,
              source: dept.isJuniorTo._id || dept.isJuniorTo,
              target: dept._id,
              type: 'step',
              style: { stroke: '#333', strokeWidth: 2 },
            };
            return edge;
          });

        const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(newNodes as any, newEdges as any);
        setNodes(layoutedNodes);
        setEdges(layoutedEdges);
        setLoading(false);
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Unbekannter Fehler';
        console.error('Error fetching data:', error);
        setError(errorMessage);
        setLoading(false);
      }
    };
    fetchData();
  }, [handleLabelChange]);

  if (loading) return <div className="p-4 text-gray-500 dark:text-gray-400">Loading...</div>;
  if (error) return <div className="p-4 text-red-500 dark:text-red-400">{error}</div>;
  if (nodes.length === 0) return <div className="p-4 text-gray-500 dark:text-gray-400">Keine Abteilungen vorhanden</div>;

  return (
    <>
      <PageMeta
        title="Departments Flow | SEQ.IST - Project Management Solution"
        description="View departments in a flow layout in the SEQ.IST Project Management Solution"
      />
      <PageBreadcrumb pageTitle="Organigramm" />
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Abteilungen Hierarchie
          </h3>
        </div>
        <div className="rounded-2xl border border-gray-200 dark:border-gray-800 p-5">
          <div className="w-full h-[600px] border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              nodeTypes={{ editable: EditableNode }}
              fitView
              nodesDraggable={true}
            >
              <Background color="#aaa" gap={16} />
              <Controls showZoom={true} showFitView={true} showInteractive={true} />
            </ReactFlow>
          </div>
        </div>
      </div>
    </>
  );
};

export default DepartmentsFlow;