export interface Department {
  _id: string;
  name: string;
  description?: string;
  isJuniorTo?: Department | string | null;
  headOfDepartment?: Role | string | null;
}

export interface Role {
  _id: string;
  name: string;
}

export interface TreeNode {
  id: string;
  name: string;
  head: string;
  location: string;
  children: TreeNode[];
}