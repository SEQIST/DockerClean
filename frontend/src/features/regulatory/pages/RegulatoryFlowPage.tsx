import React, { useState, useEffect } from 'react';
import RegulatoryList from '../components/RegulatoryList';
import {
  fetchRegulatoryISOs,
  fetchAllContentsForCache,
  fetchRegulatoryEvaluations,
  uploadFile,
  addRegulatory,
  deleteRegulatory,
} from '../services/regulatoryService';
import {
  ReactFlow,
  Background,
  Controls,
  useNodesState,
  useEdgesState,
  MarkerType,
  Node,
  Edge,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

interface RegulatoryISO {
  _id: string;
  name: string;
  description: string;
  source: string;
}

interface Content {
  _id: string;
  text: string;
  type: string;
  regulatoryISO: { _id: string };
}

interface EvidencedBy {
  roles: Array<{ _id: string; name: string }>;
  processes: Array<{ _id: string; name: string }>;
  activities: Array<{ _id: string; name: string }>;
  workProducts: Array<{ _id: string; name: string }>;
}

interface Evaluation {
  _id: string;
  type: 'Header' | 'Definition' | 'Information' | 'Requirement';
  completed: boolean;
  evidencedBy: EvidencedBy;
  regulatoryContent: Content;
}

interface CustomNodeData {
  label: string;
  color: string;
  [key: string]: any;
}

const RegulatoryFlowPage: React.FC = () => {
  const [regulatoryISOs, setRegulatoryISOs] = useState<RegulatoryISO[]>([]);
  const [cachedContents, setCachedContents] = useState<Content[]>([]);
  const [regulatoryEvaluations, setRegulatoryEvaluations] = useState<Evaluation[]>([]);
  const [selectedRegulatory, setSelectedRegulatory] = useState<RegulatoryISO | null>(null);
  const [selectedRequirement, setSelectedRequirement] = useState<Content | null>(null);
  const [newRegulatoryName, setNewRegulatoryName] = useState<string>('');
  const [nodes, setNodes, onNodesChange] = useNodesState<Node<CustomNodeData>[]>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge[]>([]);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const isos = await fetchRegulatoryISOs();
        setRegulatoryISOs(isos);
      } catch (error) {
        console.error('Error fetching initial data:', error);
      }
    };
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (selectedRegulatory) {
      fetchAllContentsForCache(selectedRegulatory._id).then(setCachedContents);
      fetchRegulatoryEvaluations(selectedRegulatory._id).then(setRegulatoryEvaluations);
    }
  }, [selectedRegulatory]);

  useEffect(() => {
    if (selectedRequirement && regulatoryEvaluations) {
      const evaluation = regulatoryEvaluations.find(
        (evaluation) => evaluation.regulatoryContent._id === selectedRequirement._id
      );
      if (!evaluation) return;

      const { evidencedBy } = evaluation;
      const nodes: Node<CustomNodeData>[] = [];
      const edges: Edge[] = [];

      // Requirement Node
      nodes.push({
        id: 'requirement',
        type: 'default',
        position: { x: 0, y: 0 },
        data: { label: selectedRequirement.text, color: '#FFD700' },
        style: { backgroundColor: '#FFD700', color: '#000', padding: '10px', borderRadius: '5px', width: 150, textAlign: 'center' },
      });

      // Rollen
      evidencedBy.roles.forEach((role, index) => {
        const nodeId = `role-${role._id}`;
        nodes.push({
          id: nodeId,
          type: 'default',
          position: { x: 200, y: 50 + index * 100 },
          data: { label: role.name, color: '#1E90FF' },
          style: { backgroundColor: '#1E90FF', color: '#fff', padding: '10px', borderRadius: '5px', width: 150, textAlign: 'center' },
        });
        edges.push({
          id: `edge-req-role-${role._id}`,
          source: 'requirement',
          target: nodeId,
          type: 'step',
          markerEnd: { type: MarkerType.ArrowClosed, width: 20, height: 20, color: '#333' },
          style: { stroke: '#333', strokeWidth: 2 },
        });
      });

      // Prozesse
      evidencedBy.processes.forEach((process, index) => {
        const nodeId = `process-${process._id}`;
        nodes.push({
          id: nodeId,
          type: 'default',
          position: { x: 200, y: 50 + (evidencedBy.roles.length + index) * 100 },
          data: { label: process.name, color: '#FF4500' },
          style: { backgroundColor: '#FF4500', color: '#fff', padding: '10px', borderRadius: '5px', width: 150, textAlign: 'center' },
        });
        edges.push({
          id: `edge-req-process-${process._id}`,
          source: 'requirement',
          target: nodeId,
          type: 'step',
          markerEnd: { type: MarkerType.ArrowClosed, width: 20, height: 20, color: '#333' },
          style: { stroke: '#333', strokeWidth: 2 },
        });
      });

      // Aktivitäten
      evidencedBy.activities.forEach((activity, index) => {
        const nodeId = `activity-${activity._id}`;
        nodes.push({
          id: nodeId,
          type: 'default',
          position: { x: 200, y: 50 + (evidencedBy.roles.length + evidencedBy.processes.length + index) * 100 },
          data: { label: activity.name, color: '#32CD32' },
          style: { backgroundColor: '#32CD32', color: '#fff', padding: '10px', borderRadius: '5px', width: 150, textAlign: 'center' },
        });
        edges.push({
          id: `edge-req-activity-${activity._id}`,
          source: 'requirement',
          target: nodeId,
          type: 'step',
          markerEnd: { type: MarkerType.ArrowClosed, width: 20, height: 20, color: '#333' },
          style: { stroke: '#333', strokeWidth: 2 },
        });
      });

      // Work Products
      evidencedBy.workProducts.forEach((wp, index) => {
        const nodeId = `workproduct-${wp._id}`;
        nodes.push({
          id: nodeId,
          type: 'default',
          position: {
            x: 200,
            y: 50 + (evidencedBy.roles.length + evidencedBy.processes.length + evidencedBy.activities.length + index) * 100,
          },
          data: { label: wp.name, color: '#000000' },
          style: { backgroundColor: '#000000', color: '#fff', padding: '10px', borderRadius: '5px', width: 150, textAlign: 'center' },
        });
        edges.push({
          id: `edge-req-workproduct-${wp._id}`,
          source: 'requirement',
          target: nodeId,
          type: 'step',
          markerEnd: { type: MarkerType.ArrowClosed, width: 20, height: 20, color: '#333' },
          style: { stroke: '#333', strokeWidth: 2 },
        });
      });

      setNodes(nodes);
      setEdges(edges);
    } else {
      setNodes([]);
      setEdges([]);
    }
  }, [selectedRequirement, regulatoryEvaluations]);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const result = await uploadFile(file);
      if (result.regulatoryISO) {
        setRegulatoryISOs(prev => [...prev, result.regulatoryISO]);
      }
      if (result.contents && result.contents.length > 0) {
        setCachedContents(prev => [...prev, ...result.contents]);
      }
      if (selectedRegulatory) {
        fetchAllContentsForCache(selectedRegulatory._id).then(setCachedContents);
        fetchRegulatoryEvaluations(selectedRegulatory._id).then(setRegulatoryEvaluations);
      }
    } catch (error) {
      alert('Fehler beim Verarbeiten der Datei');
    }
  };

  const handleAddRegulatory = async () => {
    if (!newRegulatoryName) return;
    try {
      const savedRegulatoryISO = await addRegulatory(newRegulatoryName);
      setRegulatoryISOs(prev => [...prev, savedRegulatoryISO]);
      setNewRegulatoryName('');
    } catch (error) {
      console.error('Error adding regulatory:', error);
    }
  };

  const handleDeleteRegulatory = async (id: string) => {
    try {
      await deleteRegulatory(id);
      setRegulatoryISOs(prev => prev.filter(iso => iso._id !== id));
      setCachedContents(prev => prev.filter(content => content.regulatoryISO._id !== id));
      setRegulatoryEvaluations(prev => prev.filter(evaluation => evaluation.regulatoryContent.regulatoryISO._id !== id));
      setSelectedRegulatory(null);
      setSelectedRequirement(null);
    } catch (error) {
      console.error('Error deleting regulatory:', error);
    }
  };

  const requirements = cachedContents.filter(content => content.type === 'Requirement');

  return (
    <div className="flex h-[calc(100vh-80px)] bg-gray-100 dark:bg-gray-800">
      {/* Hauptbereich: Soll den gesamten Platz rechts der Sidebar ausfüllen */}
      <div className="flex-1 flex">
        {/* Linke Spalte: Regulatorie-Liste */}
        <div className="w-1/5 p-2">
          <RegulatoryList
            regulatoryISOs={regulatoryISOs}
            selectedRegulatory={selectedRegulatory}
            newRegulatoryName={newRegulatoryName}
            setRegulatoryISOs={setRegulatoryISOs}
            setSelectedRegulatory={setSelectedRegulatory}
            setSelectedContent={setSelectedRequirement}
            setNewRegulatoryName={setNewRegulatoryName}
            handleAddRegulatory={handleAddRegulatory}
            handleDeleteRegulatory={handleDeleteRegulatory}
            handleFileUpload={handleFileUpload}
            showAddOptions={false}
          />
        </div>

        {/* Mittlere Spalte: Requirement-Liste */}
        <div className="w-2/5 p-2 bg-white dark:bg-gray-900 shadow-md overflow-y-auto">
          <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-4">Requirements</h2>
          {selectedRegulatory ? (
            requirements.length > 0 ? (
              <ul>
                {requirements.map((content) => (
                  <li
                    key={content._id}
                    onClick={() => setSelectedRequirement(content)}
                    className={`py-2 px-4 rounded-lg mb-1 cursor-pointer ${
                      selectedRequirement && selectedRequirement._id === content._id
                        ? 'bg-blue-100 dark:bg-blue-900'
                        : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}
                  >
                    <span className="text-gray-800 dark:text-gray-200">{content.text}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-600 dark:text-gray-400">Keine Requirements verfügbar.</p>
            )
          ) : (
            <p className="text-gray-600 dark:text-gray-400">Wähle eine Regulatorie aus der Liste</p>
          )}
        </div>

        {/* Rechte Spalte: ReactFlow-Ansicht mit Legende */}
        <div className="w-2/5 p-2 bg-white dark:bg-gray-900 shadow-md">
          <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-4">Verknüpfungen</h2>
          {selectedRequirement ? (
            <>
              {/* Legende */}
              <div className="mb-4">
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Legende</h3>
                <div className="flex items-center mb-1">
                  <div className="w-4 h-4 mr-2" style={{ backgroundColor: '#FFD700' }}></div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">Requirement</span>
                </div>
                <div className="flex items-center mb-1">
                  <div className="w-4 h-4 mr-2" style={{ backgroundColor: '#1E90FF' }}></div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">Rolle</span>
                </div>
                <div className="flex items-center mb-1">
                  <div className="w-4 h-4 mr-2" style={{ backgroundColor: '#FF4500' }}></div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">Prozess</span>
                </div>
                <div className="flex items-center mb-1">
                  <div className="w-4 h-4 mr-2" style={{ backgroundColor: '#32CD32' }}></div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">Aktivität</span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 mr-2" style={{ backgroundColor: '#000000' }}></div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">Work Product</span>
                </div>
              </div>

              {/* ReactFlow */}
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
            </>
          ) : (
            <p className="text-gray-600 dark:text-gray-400">Wähle ein Requirement aus der Liste</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default RegulatoryFlowPage;