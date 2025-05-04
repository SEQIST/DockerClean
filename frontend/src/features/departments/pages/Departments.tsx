import { useState, useEffect, SyntheticEvent } from 'react';
import { Link } from 'react-router-dom';
import PageMeta from "../../../components/common/PageMeta";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import DepartmentFilters from '../components/DepartmentFilters';
import DepartmentEditModal from '../components/DepartmentEditModal';
import DepartmentAddModal from '../components/DepartmentAddModal';
import DepartmentImport from '../components/DepartmentImport';
import DepartmentTreeItems from '../components/DepartmentTreeItems'; // Neue Komponente importieren
import { Department, Role } from '../types/Department';
import { buildTreeData } from '../utils/departmentTreeUtils';

const DepartmentsPage = () => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [filteredDepartments, setFilteredDepartments] = useState<Department[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [newName, setNewName] = useState<string>('');
  const [newDescription, setNewDescription] = useState<string>('');
  const [newIsJuniorTo, setNewIsJuniorTo] = useState<string | null>(null);
  const [newHeadOfDepartment, setNewHeadOfDepartment] = useState<string | null>(null);
  const [editDepartment, setEditDepartment] = useState<Department | null>(null);
  const [openAddModal, setOpenAddModal] = useState<boolean>(false);
  const [openEditModal, setOpenEditModal] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortOption, setSortOption] = useState<string>('name-asc');
  const [error, setError] = useState<string | null>(null);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [expandedNodes, setExpandedNodes] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    fetchDepartments();
    fetchRoles();
  }, []);

  useEffect(() => {
    let filtered = [...departments];
    if (searchQuery) {
      filtered = filtered.filter((dept) =>
        dept.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    if (sortOption === 'name-asc') {
      filtered.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortOption === 'name-desc') {
      filtered.sort((a, b) => b.name.localeCompare(a.name));
    }
    setFilteredDepartments(filtered);

    const firstLevelNodes: string[] = [];
    const deptMap = new Map<string, Department>();

    filtered.forEach((dept) => {
      const nodeId = dept._id.toString();
      deptMap.set(nodeId, dept);
    });

    filtered.forEach((dept) => {
      const nodeId = dept._id.toString();
      const parentId = typeof dept.isJuniorTo === 'string' ? dept.isJuniorTo : dept.isJuniorTo?._id?.toString() || null;
      if (!parentId || !deptMap.has(parentId)) {
        firstLevelNodes.push(nodeId);
      }
    });

    setExpandedNodes(firstLevelNodes);
  }, [departments, searchQuery, sortOption]);

  const fetchDepartments = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5001/api/departments');
      if (!response.ok) throw new Error('Fehler beim Abrufen der Abteilungen');
      const data = await response.json();
      setDepartments(data);
      setError(null);
    } catch (error: any) {
      console.error('Error fetching departments:', error);
      setError('Fehler beim Abrufen der Abteilungen: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchRoles = async () => {
    try {
      const response = await fetch('http://localhost:5001/api/roles');
      if (!response.ok) throw new Error('Fehler beim Abrufen der Rollen');
      const data = await response.json();
      setRoles(data);
    } catch (error: any) {
      console.error('Error fetching roles:', error);
      setError('Fehler beim Abrufen der Rollen: ' + error.message);
    }
  };

  const handleAdd = async () => {
    if (!newName) {
      setError('Bitte geben Sie einen Namen für die Abteilung ein.');
      return;
    }

    const cleanDescription = newDescription && newDescription !== '<p></p>' ? newDescription : '';

    const newDept: Partial<Department> = {
      name: newName,
      description: cleanDescription,
      isJuniorTo: newIsJuniorTo || null,
      headOfDepartment: newHeadOfDepartment || null,
    };

    console.log('Daten, die an das Backend gesendet werden:', newDept);

    try {
      const response = await fetch('http://localhost:5001/api/departments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newDept),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Fehler beim Speichern der Abteilung');
      }
      const data = await response.json();
      setDepartments([...departments, data]);
      setNewName('');
      setNewDescription('');
      setNewIsJuniorTo(null);
      setNewHeadOfDepartment(null);
      setError(null);
      setOpenAddModal(false);
    } catch (error: any) {
      console.error('Error adding department:', error);
      console.log('Fehlermeldung vom Backend:', error.message);
      setError('Fehler beim Speichern der Abteilung: ' + error.message);
    }
  };

  const handleAddJunior = (parentId: string) => {
    setNewName('');
    setNewDescription('');
    setNewIsJuniorTo(parentId);
    setNewHeadOfDepartment(null);
    setEditDepartment(null);
    setOpenAddModal(true);
  };

  const handleEditOpen = (dept: Department) => {
    if (!dept || !dept._id) {
      setError('Keine Abteilung zum Bearbeiten ausgewählt.');
      return;
    }
    setEditDepartment(dept);
    setOpenEditModal(true);
  };

  const handleEditClose = () => {
    setOpenEditModal(false);
    setEditDepartment(null);
  };

  const handleAddClose = () => {
    setOpenAddModal(false);
    setNewName('');
    setNewDescription('');
    setNewIsJuniorTo(null);
    setNewHeadOfDepartment(null);
  };

  const handleEditChange = (field: keyof Department, value: any) => {
    setEditDepartment((prev: Department | null) => prev ? ({ ...prev, [field]: value }) : null);
  };

  const handleEditSave = async () => {
    if (!editDepartment || !editDepartment._id) {
      setError('Keine Abteilung zum Bearbeiten ausgewählt.');
      return;
    }

    const cleanDescription = editDepartment.description && editDepartment.description !== '<p></p>' ? editDepartment.description : '';

    const updatedDept: Partial<Department> = {
      ...editDepartment,
      description: cleanDescription,
    };

    try {
      const response = await fetch(`http://localhost:5001/api/departments/${editDepartment._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedDept),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Fehler beim Bearbeiten der Abteilung');
      }
      const data = await response.json();
      setDepartments(departments.map(dept => (dept._id === editDepartment._id ? data : dept)));
      setError(null);
      handleEditClose();
    } catch (error: any) {
      console.error('Error editing department:', error);
      console.log('Fehlermeldung vom Backend:', error.message);
      setError('Fehler beim Bearbeiten der Abteilung: ' + error.message);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`http://localhost:5001/api/departments/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Fehler beim Löschen der Abteilung');
      setDepartments(departments.filter(dept => dept._id !== id));
        setError(null);
    } catch (error: any) {
      console.error('Error deleting department:', error);
      setError('Fehler beim Löschen der Abteilung: ' + error.message);
    }
  };

  const handleItemExpansionToggle = (_event: SyntheticEvent | null, nodeIds: string[]) => {
    setExpandedNodes(nodeIds);
  };

  if (loading) return <div className="p-4 text-gray-500 dark:text-gray-400">Loading...</div>;
  if (error) return <div className="p-4 text-red-500 dark:text-red-400">{error}</div>;

  const treeData = buildTreeData(filteredDepartments, roles);

  return (
    <>
      <PageMeta
        title="Departments | SEQ.IST - Project Management Solution"
        description="Manage departments in the SEQ.IST Project Management Solution"
      />
      <PageBreadcrumb pageTitle="Departments" />
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Abteilungen Hierarchie
          </h3>
          <div className="flex items-center space-x-3">
            <DepartmentFilters
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              sortOption={sortOption}
              setSortOption={setSortOption}
            />
            <DepartmentImport
              importFile={importFile}
              setImportFile={setImportFile}
              setError={setError}
              setDepartments={setDepartments}
              departments={departments}
            />
            <button
              onClick={() => setOpenAddModal(true)}
              className="inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-5 py-2 text-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200"
            >
              Neue Abteilung
            </button>
          </div>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] p-5">
          <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
            <div className="flex items-center space-x-3 flex-1">
              <div className="w-64 font-semibold text-gray-500 dark:text-gray-400 uppercase text-xs">
                Abteilung
              </div>
              <div className="w-32 font-semibold text-gray-500 dark:text-gray-400 uppercase text-xs">
                Standort
              </div>
              <div className="w-32 font-semibold text-gray-500 dark:text-gray-400 uppercase text-xs">
                Leiter
              </div>
              <div className="w-32 font-semibold text-gray-500 dark:text-gray-400 uppercase text-xs">
                Mitarbeiteranzahl
              </div>
            </div>
            <div className="w-32 font-semibold text-gray-500 dark:text-gray-400 uppercase text-xs text-right">
              Aktionen
            </div>
          </div>
          <div className="mt-2">
            <DepartmentTreeItems
              nodes={treeData}
              expandedNodes={expandedNodes}
              handleItemExpansionToggle={handleItemExpansionToggle}
              departments={departments}
              handleAddJunior={handleAddJunior}
              handleEditOpen={handleEditOpen}
              handleDelete={handleDelete}
            />
          </div>
        </div>

        <DepartmentAddModal
          open={openAddModal}
          onClose={handleAddClose}
          departments={departments}
          roles={roles}
          newName={newName}
          setNewName={setNewName}
          newDescription={newDescription}
          setNewDescription={setNewDescription}
          newIsJuniorTo={newIsJuniorTo}
          setNewIsJuniorTo={setNewIsJuniorTo}
          newHeadOfDepartment={newHeadOfDepartment}
          setNewHeadOfDepartment={setNewHeadOfDepartment}
          onAdd={handleAdd}
        />

        <DepartmentEditModal
          open={openEditModal}
          onClose={handleEditClose}
          editDepartment={editDepartment}
          departments={departments}
          roles={roles}
          onChange={handleEditChange}
          onSave={handleEditSave}
        />
      </div>
    </>
  );
};

export default DepartmentsPage;