import React, { SyntheticEvent } from 'react';
import { Department, TreeNode } from '../types/Department';

interface DepartmentTreeItemsProps {
  nodes: TreeNode[];
  expandedNodes: string[];
  handleItemExpansionToggle: (event: SyntheticEvent | null, nodeIds: string[]) => void;
  departments: Department[];
  handleAddJunior: (parentId: string) => void;
  handleEditOpen: (dept: Department) => void;
  handleDelete: (id: string) => void;
}

const DepartmentTreeItems: React.FC<DepartmentTreeItemsProps> = ({
  nodes,
  expandedNodes,
  handleItemExpansionToggle,
  departments,
  handleAddJunior,
  handleEditOpen,
  handleDelete,
}) => {
  if (!nodes || nodes.length === 0) {
    return (
      <div className="text-gray-500 dark:text-gray-400 p-4 text-center">
        Keine Abteilungen gefunden.
      </div>
    );
  }

  return (
    <>
      {nodes.map((node) => (
        <div key={node.id} className="mb-2">
          <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
            <div className="flex items-center space-x-3 flex-1">
              <div className="w-64 flex items-center">
                <button
                  onClick={() => {
                    const nodeId = node.id;
                    handleItemExpansionToggle(null, expandedNodes.includes(nodeId) ? expandedNodes.filter(id => id !== nodeId) : [...expandedNodes, nodeId]);
                  }}
                  className="mr-2 text-gray-500 dark:text-gray-400"
                >
                  {expandedNodes.includes(node.id) ? '▼' : '▶'}
                </button>
                <span className="font-semibold text-gray-800 dark:text-gray-200">
                  {node.name}
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAddJunior(node.id);
                  }}
                  className="ml-2 text-blue-600 hover:text-blue-700 dark:text-blue-500 dark:hover:text-blue-400"
                >
                  <svg className="w-4 h-4 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                  </svg>
                </button>
              </div>
              <div className="w-32 text-gray-500 dark:text-gray-400">{node.location}</div>
              <div className="w-32 text-gray-500 dark:text-gray-400">{node.head}</div>
              <div className="w-32 text-gray-500 dark:text-gray-400">{node.children.length}</div>
            </div>
            <div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleEditOpen(departments.find(dept => dept._id === node.id)!);
                }}
                className="text-blue-600 hover:text-blue-700 dark:text-blue-500 dark:hover:text-blue-400 font-medium mr-4"
              >
                Bearbeiten
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(node.id);
                }}
                className="text-red-600 hover:text-red-700 dark:text-red-500 dark:hover:text-red-400 font-medium"
              >
                Löschen
              </button>
            </div>
          </div>
          {expandedNodes.includes(node.id) && node.children && node.children.length > 0 && (
            <div className="ml-6 mt-2">
              <DepartmentTreeItems
                nodes={node.children}
                expandedNodes={expandedNodes}
                handleItemExpansionToggle={handleItemExpansionToggle}
                departments={departments}
                handleAddJunior={handleAddJunior}
                handleEditOpen={handleEditOpen}
                handleDelete={handleDelete}
              />
            </div>
          )}
        </div>
      ))}
    </>
  );
};

export default DepartmentTreeItems;