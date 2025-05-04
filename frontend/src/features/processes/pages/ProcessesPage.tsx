import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchProcesses, Process } from '../services/processService';

interface ProcessNode extends Process {
  children: ProcessNode[];
}

const ProcessesPage: React.FC = () => {
  const navigate = useNavigate();
  const [processes, setProcesses] = useState<Process[]>([]);
  const [processTree, setProcessTree] = useState<ProcessNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [expandedProcesses, setExpandedProcesses] = useState<string[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const processesData = await fetchProcesses();
        setProcesses(processesData);
        // Erstelle die Hierarchie
        const tree = buildProcessTree(processesData);
        setProcessTree(tree);
        setLoading(false);
      } catch (error) {
        console.error('Fehler beim Laden der Prozesse:', error);
        setError((error as Error).message);
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Funktion zum Erstellen der Prozess-Hierarchie
  const buildProcessTree = (processes: Process[]): ProcessNode[] => {
    const processMap: { [key: string]: ProcessNode } = {};
    const tree: ProcessNode[] = [];

    // Erstelle eine Map mit allen Prozessen und initialisiere children
    processes.forEach((process) => {
      processMap[process._id] = { ...process, children: [] };
    });

    // Fülle die Hierarchie
    processes.forEach((process) => {
      const node = processMap[process._id];
      if (process.isChildOf) {
        const parentId = typeof process.isChildOf === 'string' ? process.isChildOf : process.isChildOf._id;
        if (processMap[parentId]) {
          processMap[parentId].children.push(node);
        } else {
          tree.push(node); // Falls der Elternprozess nicht existiert, füge ihn der Wurzel hinzu
        }
      } else {
        tree.push(node);
      }
    });

    return tree;
  };

  const handleSort = () => {
    setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
  };

  const handleToggleExpand = (processId: string) => {
    setExpandedProcesses((prev) =>
      prev.includes(processId) ? prev.filter((id) => id !== processId) : [...prev, processId]
    );
  };

  // Rekursive Funktion zum Rendern der Prozess-Hierarchie
  const renderProcessNode = (node: ProcessNode, depth: number = 0) => {
    return (
      <div key={node._id} style={{ marginLeft: depth * 20 }} className="border-b border-gray-100 dark:border-gray-800 py-2">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="font-medium text-gray-800 dark:text-gray-200">{node.name}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Abk.: {node.abbreviation || 'Keine'}, Eigentümer:{' '}
              {typeof node.owner === 'string' ? 'Unbekannt' : (node.owner as { name: string })?.name || 'Kein Eigentümer'},
              Unterprozess von: {node.isChildOf ? (typeof node.isChildOf === 'string' ? node.isChildOf : (node.isChildOf as Process)?.name) : 'Kein Unterprozess'}
            </div>
          </div>
          <div className="flex gap-2 mx-4">
            <button
              onClick={() => navigate(`/quality/processes/add?isChildOf=${node._id}`)} // Unterprozess hinzufügen
              className="text-blue-600 hover:text-blue-800"
            >
              ➕
            </button>
            <button
              onClick={() => handleToggleExpand(node._id)}
              className="text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
            >
              {expandedProcesses.includes(node._id) ? '▼' : '▶'}
            </button>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => navigate(`/quality/processes/edit/${node._id}`)}
              className="text-blue-600 hover:text-blue-800"
            >
              ✏️
            </button>
            <button
              onClick={() => navigate(`/process-calculation/process/${node._id}`)} // Angepasste Route für Simulation
              className="text-green-600 hover:text-green-800"
            >
              📊
            </button>
          </div>
        </div>
        {expandedProcesses.includes(node._id) && node.children.length > 0 && (
          <div className="mt-2">
            {node.children
              .filter((child) =>
                child.name.toLowerCase().includes(searchQuery.toLowerCase())
              )
              .sort((a, b) => {
                if (sortOrder === 'asc') {
                  return a.name.localeCompare(b.name);
                }
                return b.name.localeCompare(a.name);
              })
              .map((child) => renderProcessNode(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  const filteredProcessTree = processTree
    .filter((node) =>
      node.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      node.children.some((child) =>
        child.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    )
    .sort((a, b) => {
      if (sortOrder === 'asc') {
        return a.name.localeCompare(b.name);
      }
      return b.name.localeCompare(a.name);
    });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }
  if (error) return <div className="text-red-500 dark:text-red-400 p-4">Fehler: {error}</div>;

  return (
    <div className="min-h-screen flex justify-center pt-8 pb-4 px-4">
      <div className="w-full max-w-[1800px] min-w-[1200px]">
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl p-6">
          <h2 className="text-2xl font-bold mb-4 text-blue-600 dark:text-blue-400">Prozesse</h2>
          <div className="flex gap-3 mb-4">
            <input
              type="text"
              placeholder="Suche nach Prozessen..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-[300px] px-3 py-2 text-sm text-gray-800 dark:text-white bg-transparent border border-gray-300 dark:border-gray-700 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-800"
            />
            <button
              onClick={handleSort}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              Sortieren ({sortOrder === 'asc' ? 'A-Z' : 'Z-A'})
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
              </svg>
            </button>
            <button
              onClick={() => navigate('/quality/processes/add')}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Prozess hinzufügen
            </button>
          </div>
          <div className="max-h-[calc(100vh-250px)] overflow-y-auto">
            {filteredProcessTree.length > 0 ? (
              filteredProcessTree.map((node) => renderProcessNode(node))
            ) : (
              <div className="text-gray-700 dark:text-gray-300">Keine Prozesse gefunden</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProcessesPage;