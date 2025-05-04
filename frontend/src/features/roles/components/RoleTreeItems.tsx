import React, { SyntheticEvent } from 'react';
import { Role, RecurringTask } from '../types/Role';

interface RoleTreeItemsProps {
  nodes: Role[];
  expandedNodes: string[];
  handleItemExpansionToggle: (event: SyntheticEvent | null, nodeIds: string[]) => void;
  roles: Role[];
  tasks?: RecurringTask[];
  handleAddJunior: (parentId: string) => void;
  handleEditOpen: (role: Role) => void;
  handleDelete: (id: string) => void;
  onOpenTaskDialog: (roleId: string) => void;
}

const RoleTreeItems: React.FC<RoleTreeItemsProps> = ({
  nodes,
  expandedNodes,
  handleItemExpansionToggle,
  roles,
  tasks = [],
  handleAddJunior,
  handleEditOpen,
  handleDelete,
  onOpenTaskDialog,
}) => {
  if (!nodes || nodes.length === 0) {
    return (
      <div className="text-gray-500 dark:text-gray-400 p-4 text-center">
        Keine Rollen gefunden.
      </div>
    );
  }

  const hasRepetitiveLoad = (roleId: string) => (tasks ? tasks.filter((t) => t.role._id === roleId).length > 0 : false);
  const getTaskCount = (roleId: string) => (tasks ? tasks.filter((t) => t.role._id === roleId).length : 0);

  return (
    <>
      {nodes.map((node) => {
        // Berechnung des Abteilungsnamens
        const departmentName = typeof node.department === 'string' 
          ? node.department 
          : node.department?.name || 'Keine Abteilung';

        // Berechnung des Vorgesetztennamens
        const supervisorName = typeof node.supervisorRole === 'string' 
          ? node.supervisorRole 
          : node.supervisorRole?.name || 'Kein Leiter';

        return (
          <div key={node._id} className="mb-2">
            <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
              <div className="flex items-center space-x-3 flex-1">
                <div className="w-64 flex items-center">
                  <button
                    onClick={() => {
                      const nodeId = node._id;
                      handleItemExpansionToggle(null, expandedNodes.includes(nodeId) ? expandedNodes.filter(id => id !== nodeId) : [...expandedNodes, nodeId]);
                    }}
                    className="mr-2 text-gray-500 dark:text-gray-400"
                  >
                    {node.children && node.children.length > 0 && (expandedNodes.includes(node._id) ? '▼' : '▶')}
                  </button>
                  <span style={{ marginLeft: `${(node.level || 0) * 16}px` }} className="font-semibold text-gray-800 dark:text-gray-200">
                    {node.name}
                  </span>
                  <button
                    onClick={(e: React.SyntheticEvent) => {
                      e.stopPropagation();
                      handleAddJunior(node._id);
                    }}
                    className="ml-2 text-blue-600 hover:text-blue-700 dark:text-blue-500 dark:hover:text-blue-400"
                  >
                    <svg className="w-4 h-4 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                    </svg>
                  </button>
                </div>
                <div className="w-32 text-gray-500 dark:text-gray-400">{departmentName}</div>
                <div className="w-32 text-gray-500 dark:text-gray-400">{supervisorName}</div>
                <div className="w-32 text-gray-500 dark:text-gray-400">{node.numberOfHolders}</div>
                <div className="w-32 text-gray-500 dark:text-gray-400">{node.workHoursDayMaxLoad?.toFixed(3) || 'N/A'}</div>
                <div className="w-32 text-gray-500 dark:text-gray-400">{node.availableDailyHours?.toFixed(3) || 'N/A'}</div>
              </div>
              <div>
                <button
                  onClick={(e: React.SyntheticEvent) => {
                    e.stopPropagation();
                    onOpenTaskDialog(node._id);
                  }}
                  className={hasRepetitiveLoad(node._id) ? "text-green-600 hover:text-green-700 dark:text-green-500 dark:hover:text-green-400 font-medium mr-4" : "text-blue-600 hover:text-blue-700 dark:text-blue-500 dark:hover:text-blue-400 font-medium mr-4"}
                >
                  <svg className="w-5 h-5 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                  {hasRepetitiveLoad(node._id) && (
                    <span className="ml-1 text-green-600">{getTaskCount(node._id)}</span>
                  )}
                </button>
                <button
                  onClick={(e: React.SyntheticEvent) => {
                    e.stopPropagation();
                    handleEditOpen(roles.find(role => role._id === node._id)!);
                  }}
                  className="text-blue-600 hover:text-blue-700 dark:text-blue-500 dark:hover:text-blue-400 font-medium mr-4"
                >
                  Bearbeiten
                </button>
                <button
                  onClick={(e: React.SyntheticEvent) => {
                    e.stopPropagation();
                    handleDelete(node._id);
                  }}
                  className="text-red-600 hover:text-red-700 dark:text-red-500 dark:hover:text-red-400 font-medium"
                >
                  Löschen
                </button>
              </div>
            </div>
            {expandedNodes.includes(node._id) && node.children && node.children.length > 0 && (
              <div className="ml-6 mt-2">
                <RoleTreeItems
                  nodes={node.children}
                  expandedNodes={expandedNodes}
                  handleItemExpansionToggle={handleItemExpansionToggle}
                  roles={roles}
                  tasks={tasks}
                  handleAddJunior={handleAddJunior}
                  handleEditOpen={handleEditOpen}
                  handleDelete={handleDelete}
                  onOpenTaskDialog={onOpenTaskDialog}
                />
              </div>
            )}
          </div>
        );
      })}
    </>
  );
};

export default RoleTreeItems;