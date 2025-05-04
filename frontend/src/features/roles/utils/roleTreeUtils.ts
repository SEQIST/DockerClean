import { Role } from '../types/Role';

export const buildTreeData = (filteredRoles: Role[]): Role[] => {
  const roleMap = new Map<string, Role>();
  const treeData: Role[] = [];

  filteredRoles.forEach((role: Role) => {
    const node: Role = {
      ...role,
      children: [],
      level: 0,
    };
    roleMap.set(role._id.toString(), node);
  });

  filteredRoles.forEach((role: Role) => {
    const nodeId = role._id.toString();
    const parentId = typeof role.supervisorRole === 'string' ? role.supervisorRole : role.supervisorRole?._id?.toString() || null;
    const node = roleMap.get(nodeId);
    if (parentId && roleMap.has(parentId) && node) {
      const parent = roleMap.get(parentId)!;
      node.level = (parent.level || 0) + 1;
      parent.children = parent.children || [];
      parent.children.push(node);
    } else if (node) {
      treeData.push(node);
    }
  });

  return treeData;
};