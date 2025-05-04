import React from 'react';

interface Role {
  _id: string;
  name: string;
  abbreviation?: string;
  department?: { _id: string; name: string } | string;
  supervisorRole?: { _id: string; name: string } | string;
  subordinateRoles?: (Role | string)[];
  company?: string;
  subsidiary?: { _id: string } | string;
  availableDailyHours?: number;
  workHoursDayMaxLoad?: number;
  paymentType: string;
  paymentValue: number;
  numberOfHolders: number;
  rights?: string;
  tasks?: any[];
}

interface TreeNode {
  id: string;
  name: string;
  department: string;
  head: string;
  numberOfHolders: number;
  maxHoursPerDay?: number;
  availableHours?: number;
  children: TreeNode[];
  level: number;
}

interface RoleListProps {
  roles: Role[];
  setRoles: (roles: Role[]) => void;
  tasks: any[];
  onEdit: (role: Role) => void;
  onAddJunior: (preFilledValues: { supervisorRole: string; department: string }) => void;
  onOpenTaskDialog: (roleId: string) => void;
}

const RoleList: React.FC<RoleListProps> = ({
  roles,
  setRoles,
  tasks,
  onEdit,
  onAddJunior,
  onOpenTaskDialog,
}) => {
  const handleDeleteRole = (id: string) => {
    fetch(`http://localhost:5001/api/roles/${id}`, { method: 'DELETE' })
      .then(response => {
        if (!response.ok) throw new Error(`HTTP-Fehler! Status: ${response.status} - ${response.statusText}`);
        setRoles(roles.filter(r => r._id !== id));
      })
      .catch(error => {
        console.error('Fehler beim Löschen der Rolle:', error);
      });
  };

  const handleAddJunior = (parentId: string) => {
    const parentRole = roles.find(role => role._id === parentId);
    if (!parentRole) {
      console.error('Übergeordnete Rolle nicht gefunden.');
      return;
    }
    const department = typeof parentRole.department === 'object' ? parentRole.department?._id : parentRole.department || '';
    onAddJunior({
      supervisorRole: parentId,
      department: department,
    });
  };

  const hasRepetitiveLoad = (roleId: string) => tasks.filter((t: any) => t.role._id === roleId).length > 0;

  const renderTreeItems = (nodes: TreeNode[]) => {
    if (!nodes || nodes.length === 0) {
      return (
        <tr>
          <td colSpan={7} className="px-4 py-4 border border-gray-100 dark:border-white/[0.05] dark:text-white/90 whitespace-nowrap">
            <div className="flex gap-3">
              <div>
                <p className="block font-medium text-gray-500 text-sm dark:text-gray-400">
                  Keine Rollen gefunden.
                </p>
              </div>
            </div>
          </td>
        </tr>
      );
    }

    return nodes.map((node: TreeNode, index: number) => (
      <React.Fragment key={index}>
        <tr className="hover:bg-gray-100 dark:hover:bg-gray-800">
          <td className="px-4 py-4 border border-gray-100 dark:border-white/[0.05] dark:text-white/90 whitespace-nowrap">
            <div className="flex items-center gap-2">
              <div style={{ marginLeft: `${node.level * 16}px` }} className="flex items-center gap-2">
                <button
                  onClick={(e: any) => {
                    e.stopPropagation();
                    handleAddJunior(node.id);
                  }}
                  className="text-blue-600 hover:text-blue-700"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path>
                  </svg>
                </button>
                <span className="block font-medium text-gray-800 text-sm dark:text-white/90">
                  {node.name}
                </span>
              </div>
            </div>
          </td>
          <td className="px-4 py-4 font-normal text-gray-800 border border-gray-100 dark:border-white/[0.05] text-sm dark:text-gray-400 whitespace-nowrap">
            {node.department}
          </td>
          <td className="px-4 py-4 font-normal text-gray-800 border border-gray-100 dark:border-white/[0.05] text-sm dark:text-gray-400 whitespace-nowrap">
            {node.head}
          </td>
          <td className="px-4 py-4 font-normal text-gray-800 border border-gray-100 dark:border-white/[0.05] text-sm dark:text-gray-400 whitespace-nowrap">
            {node.numberOfHolders}
          </td>
          <td className="px-4 py-4 font-normal text-gray-800 border border-gray-100 dark:border-white/[0.05] text-sm dark:text-gray-400 whitespace-nowrap">
            {typeof node.maxHoursPerDay === 'number' ? node.maxHoursPerDay.toFixed(3) : 'N/A'}
          </td>
          <td className="px-4 py-4 font-normal text-gray-800 border border-gray-100 dark:border-white/[0.05] text-sm dark:text-gray-400 whitespace-nowrap">
            {typeof node.availableHours === 'number' ? node.availableHours.toFixed(3) : 'N/A'}
          </td>
          <td className="px-4 py-4 font-normal text-gray-800 border border-gray-100 dark:border-white/[0.05] text-sm dark:text-white/90 whitespace-nowrap">
            <div className="flex items-center gap-2">
              <button
                onClick={(e: any) => {
                  e.stopPropagation();
                  onEdit(roles.find((role: any) => role._id === node.id)!);
                }}
                className="text-blue-600 hover:text-blue-700"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.536L16.732 3.732z"></path>
                </svg>
              </button>
              <button
                onClick={(e: any) => {
                  e.stopPropagation();
                  onOpenTaskDialog(node.id);
                }}
                className={hasRepetitiveLoad(node.id) ? "text-green-600 hover:text-green-700" : "text-blue-600 hover:text-blue-700"}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                {hasRepetitiveLoad(node.id) && (
                  <span className="ml-1 text-green-600">{tasks.filter((t: any) => t.role._id === node.id).length}</span>
                )}
              </button>
              <button
                onClick={(e: any) => {
                  e.stopPropagation();
                  handleDeleteRole(node.id);
                }}
                className="text-red-600 hover:text-red-700"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>
          </td>
        </tr>
        {node.children && node.children.length > 0 && renderTreeItems(node.children)}
      </React.Fragment>
    ));
  };

  const buildTreeData = (roles: Role[]): TreeNode[] => {
    const roleMap = new Map<string, { node: TreeNode; level: number }>();
    const treeData: TreeNode[] = [];

    roles.forEach((role: Role) => {
      const nodeId = role._id.toString();
      const head = typeof role.supervisorRole === 'object' ? role.supervisorRole?.name : (typeof role.supervisorRole === 'string' ? role.supervisorRole : 'Kein Leiter');

      const node: TreeNode = {
        id: nodeId,
        name: role.name || 'Kein Name',
        department: typeof role.department === 'object' ? role.department?.name : 'Keine Abteilung',
        head: head || 'Kein Leiter',
        numberOfHolders: role.numberOfHolders || 0,
        maxHoursPerDay: role.workHoursDayMaxLoad,
        availableHours: role.availableDailyHours,
        children: [],
        level: 0,
      };
      roleMap.set(nodeId, { node, level: 0 });
    });

    roles.forEach((role: Role) => {
      const nodeId = role._id.toString();
      const parentId = typeof role.supervisorRole === 'object' ? role.supervisorRole?._id?.toString() : (typeof role.supervisorRole === 'string' ? role.supervisorRole : '') || null;
      const currentEntry = roleMap.get(nodeId);

      console.log(`Building tree for role ${role.name}: nodeId=${nodeId}, parentId=${parentId}`);

      if (parentId && roleMap.has(parentId) && currentEntry) {
        const parentEntry = roleMap.get(parentId)!;
        currentEntry.node.level = parentEntry.level + 1;
        parentEntry.node.children.push(currentEntry.node);
        console.log(`Added ${currentEntry.node.name} as child of ${parentEntry.node.name} at level ${currentEntry.node.level}`);
      } else if (currentEntry) {
        treeData.push(currentEntry.node);
        console.log(`Added ${currentEntry.node.name} to treeData at level ${currentEntry.node.level}`);
      } else {
        console.warn(`No entry found for nodeId ${nodeId}`);
      }
    });

    console.log('Final treeData:', treeData);
    return treeData;
  };

  const treeData = buildTreeData(roles);

  return (
    <tbody>
      {renderTreeItems(treeData)}
    </tbody>
  );
};

export default RoleList;