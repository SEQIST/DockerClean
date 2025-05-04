import { Department, Role, TreeNode } from '../types/Department';

export const buildTreeData = (
  filteredDepartments: Department[],
  roles: Role[]
): TreeNode[] => {
  const deptMap = new Map<string, TreeNode>();
  const treeData: TreeNode[] = [];

  filteredDepartments.forEach((dept) => {
    const headId = typeof dept.headOfDepartment === 'string' ? dept.headOfDepartment : dept.headOfDepartment?._id?.toString() || '';
    const head = typeof dept.headOfDepartment === 'string' ? roles.find(role => role._id === headId)?.name : dept.headOfDepartment?.name || 'Kein Leiter';

    const nodeId = dept._id.toString();
    const node: TreeNode = {
      id: nodeId,
      name: dept.name || 'Kein Name',
      head: head || 'Kein Leiter',
      location: "Wernau",
      children: [],
    };
    deptMap.set(nodeId, node);
  });

  filteredDepartments.forEach((dept) => {
    const nodeId = dept._id.toString();
    const parentId = typeof dept.isJuniorTo === 'string' ? dept.isJuniorTo : dept.isJuniorTo?._id?.toString() || null;
    const node = deptMap.get(nodeId);
    if (parentId && deptMap.has(parentId) && node) {
      deptMap.get(parentId)!.children.push(node);
    } else if (node) {
      treeData.push(node);
    }
  });

  return treeData;
};