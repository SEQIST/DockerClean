import { useState, useEffect, SyntheticEvent } from 'react';
import PageMeta from "../../../components/common/PageMeta";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import RoleFilters from '../components/RoleFilters';
import RoleEditModal from '../components/RoleEditModal';
import RoleAddModal from '../components/RoleAddModal';
import RoleImport from '../components/RoleImport';
import RoleTreeItems from '../components/RoleTreeItems';
import TaskForm from '../components/TaskForm';
import { Role, RecurringTask } from '../types/Role';
import { WorkProduct } from '../../reporting/types/ReportingTypes'; // Import von WorkProduct aus ReportingTypes
import { buildTreeData } from '../utils/roleTreeUtils';
import { calculateRoleHours } from '../components/calculateRoleHours';

const RolesPage = () => {
  const [roles, setRoles] = useState<Role[]>([]);
  const [filteredRoles, setFilteredRoles] = useState<Role[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [company, setCompany] = useState<any>(null);
  const [subsidiaries, setSubsidiaries] = useState<any[]>([]);
  const [tasks, setTasks] = useState<RecurringTask[]>([]);
  const [workProducts, setWorkProducts] = useState<WorkProduct[]>([]);
  const [newName, setNewName] = useState<string>('');
  const [newAbbreviation, setNewAbbreviation] = useState<string>('');
  const [newDepartment, setNewDepartment] = useState<string | undefined>(undefined);
  const [newPaymentType, setNewPaymentType] = useState<string>('yearly');
  const [newPaymentValue, setNewPaymentValue] = useState<number>(0);
  const [newNumberOfHolders, setNewNumberOfHolders] = useState<number>(0);
  const [newRights, setNewRights] = useState<string>('');
  const [newSupervisorRole, setNewSupervisorRole] = useState<string | undefined>(undefined);
  const [newSubordinateRoles, setNewSubordinateRoles] = useState<string[]>([]);
  const [newSubsidiary, setNewSubsidiary] = useState<string | undefined>(undefined);
  const [editRole, setEditRole] = useState<Role | null>(null);
  const [openAddModal, setOpenAddModal] = useState<boolean>(false);
  const [openEditModal, setOpenEditModal] = useState<boolean>(false);
  const [openTaskModal, setOpenTaskModal] = useState<boolean>(false);
  const [selectedRoleId, setSelectedRoleId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortOption, setSortOption] = useState<string>('name-asc');
  const [error, setError] = useState<string | null>(null);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [expandedNodes, setExpandedNodes] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    fetchRoles();
    fetchDepartments();
    fetchCompany();
    fetchTasks();
    fetchWorkProducts();
  }, []);

  useEffect(() => {
    let filtered = [...roles];
    if (searchQuery) {
      filtered = filtered.filter((role) =>
        role.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    if (sortOption === 'name-asc') {
      filtered.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortOption === 'name-desc') {
      filtered.sort((a, b) => b.name.localeCompare(a.name));
    }
    setFilteredRoles(filtered);

    const firstLevelNodes: string[] = [];
    const roleMap = new Map<string, Role>();

    filtered.forEach((role) => {
      const nodeId = role._id.toString();
      roleMap.set(nodeId, role);
    });

    filtered.forEach((role) => {
      const nodeId = role._id.toString();
      const parentId = typeof role.supervisorRole === 'string' ? role.supervisorRole : role.supervisorRole?._id?.toString() || null;
      if (!parentId || !roleMap.has(parentId)) {
        firstLevelNodes.push(nodeId);
      }
    });

    setExpandedNodes(firstLevelNodes);
  }, [roles, searchQuery, sortOption]);

  const fetchRoles = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5001/api/roles');
      if (!response.ok) throw new Error(`HTTP-Fehler! Status: ${response.status} - ${response.statusText}`);
      const data = await response.json();
      const updatedRoles = data.map((role: Role) => {
        const { workHoursDayMaxLoad, availableDailyHours } = calculateRoleHours(role, company, subsidiaries, tasks);
        return {
          ...role,
          workHoursDayMaxLoad,
          availableDailyHours,
        };
      });
      setRoles(updatedRoles || []);
      setError(null);
    } catch (error: any) {
      console.error('Error fetching roles:', error);
      setError('Fehler beim Abrufen der Rollen: ' + error.message);
    }
  };

  const fetchDepartments = async () => {
    try {
      const response = await fetch('http://localhost:5001/api/departments');
      if (!response.ok) throw new Error(`HTTP-Fehler! Status: ${response.status} - ${response.statusText}`);
      const data = await response.json();
      setDepartments(data || []);
    } catch (error: any) {
      console.error('Error fetching departments:', error);
      setError('Fehler beim Abrufen der Abteilungen: ' + error.message);
    }
  };

  const fetchCompany = async () => {
    try {
      const response = await fetch('http://localhost:5001/api/company');
      if (!response.ok) throw new Error(`HTTP-Fehler! Status: ${response.status} - ${response.statusText}`);
      const data = await response.json();
      setCompany(data || null);
      setSubsidiaries(data?.subsidiaries || []);
    } catch (error: any) {
      console.error('Error fetching company:', error);
      setError('Fehler beim Abrufen der Unternehmensdaten: ' + error.message);
    }
  };

  const fetchTasks = async () => {
    try {
      const response = await fetch('http://localhost:5001/api/recurringTasks');
      if (!response.ok) throw new Error(`HTTP-Fehler! Status: ${response.status} - ${response.statusText}`);
      const data = await response.json();
      setTasks(data || []);
    } catch (error: any) {
      console.error('Error fetching tasks:', error);
      setError('Fehler beim Abrufen der Aufgaben: ' + error.message);
    }
  };

  const fetchWorkProducts = async () => {
    try {
      const response = await fetch('http://localhost:5001/api/workproducts');
      if (!response.ok) throw new Error(`HTTP-Fehler! Status: ${response.status} - ${response.statusText}`);
      const data = await response.json();
      setWorkProducts(data || []);
    } catch (error: any) {
      console.error('Error fetching work products:', error);
      setError('Fehler beim Abrufen der Arbeitspakete: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async () => {
    if (!newName) {
      setError('Bitte geben Sie einen Namen für die Rolle ein.');
      return;
    }

    const cleanRights = newRights && newRights !== '<p></p>' ? newRights : '';

    const newRole: Partial<Role> = {
      name: newName,
      abbreviation: newAbbreviation,
      department: newDepartment,
      paymentType: newPaymentType,
      paymentValue: newPaymentValue,
      numberOfHolders: newNumberOfHolders,
      rights: cleanRights,
      supervisorRole: newSupervisorRole,
      subordinateRoles: newSubordinateRoles || [],
      subsidiary: newSubsidiary,
    };

    console.log('Daten, die an das Backend gesendet werden:', newRole);

    try {
      const response = await fetch('http://localhost:5001/api/roles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newRole),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Fehler beim Speichern der Rolle');
      }
      const data = await response.json();
      const { workHoursDayMaxLoad, availableDailyHours } = calculateRoleHours(data, company, subsidiaries, tasks);
      const updatedRole: Role = { ...data, workHoursDayMaxLoad, availableDailyHours };
      setRoles([...roles, updatedRole]);
      setNewName('');
      setNewAbbreviation('');
      setNewDepartment(undefined);
      setNewPaymentType('yearly');
      setNewPaymentValue(0);
      setNewNumberOfHolders(0);
      setNewRights('');
      setNewSupervisorRole(undefined);
      setNewSubordinateRoles([]);
      setNewSubsidiary(undefined);
      setError(null);
      setOpenAddModal(false);
    } catch (error: any) {
      console.error('Error adding role:', error);
      console.log('Fehlermeldung vom Backend:', error.message);
      setError('Fehler beim Speichern der Rolle: ' + error.message);
    }
  };

  const handleAddJunior = (parentId: string) => {
    setNewName('');
    setNewAbbreviation('');
    setNewDepartment(undefined);
    setNewPaymentType('yearly');
    setNewPaymentValue(0);
    setNewNumberOfHolders(0);
    setNewRights('');
    setNewSupervisorRole(parentId);
    setNewSubordinateRoles([]);
    setNewSubsidiary(undefined);
    setEditRole(null);
    setOpenAddModal(true);
  };

  const handleEditOpen = (role: Role) => {
    if (!role || !role._id) {
      setError('Keine Rolle zum Bearbeiten ausgewählt.');
      return;
    }
    setEditRole(role);
    setOpenEditModal(true);
  };

  const handleEditClose = () => {
    setOpenEditModal(false);
    setEditRole(null);
  };

  const handleAddClose = () => {
    setOpenAddModal(false);
    setNewName('');
    setNewAbbreviation('');
    setNewDepartment(undefined);
    setNewPaymentType('yearly');
    setNewPaymentValue(0);
    setNewNumberOfHolders(0);
    setNewRights('');
    setNewSupervisorRole(undefined);
    setNewSubordinateRoles([]);
    setNewSubsidiary(undefined);
  };

  const handleEditChange = (field: keyof Role, value: any) => {
    setEditRole((prev: Role | null) => prev ? ({ ...prev, [field]: value }) : null);
  };

  const handleEditRole = (id: string, updatedRole: Role) => {
    const { availableDailyHours, workHoursDayMaxLoad } = calculateRoleHours(updatedRole, company, subsidiaries, tasks);

    const supervisorRoleId = typeof updatedRole.supervisorRole === 'object' ? updatedRole.supervisorRole?._id : updatedRole.supervisorRole || undefined;
    const subordinateRoleIds = updatedRole.subordinateRoles?.map(role => typeof role === 'object' ? role._id : role) || [];

    if (supervisorRoleId && subordinateRoleIds.includes(supervisorRoleId)) {
      setError('Fehler: Die Vorgesetztenrolle kann nicht auch eine untergebene Rolle sein.');
      return;
    }

    const cleanedRole: Role = {
      ...updatedRole,
      supervisorRole: supervisorRoleId,
      subordinateRoles: subordinateRoleIds,
      company: company?._id,
      subsidiary: updatedRole.subsidiary || undefined,
      availableDailyHours: availableDailyHours,
      workHoursDayMaxLoad: workHoursDayMaxLoad,
      name: updatedRole.name || '',
      abbreviation: updatedRole.abbreviation || '',
      department: typeof updatedRole.department === 'object' ? updatedRole.department?._id : updatedRole.department || undefined,
      paymentType: updatedRole.paymentType || 'yearly',
      paymentValue: parseFloat(updatedRole.paymentValue.toString()) || 0,
      numberOfHolders: parseInt(updatedRole.numberOfHolders.toString()) || 0,
    };

    fetch(`http://localhost:5001/api/roles/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(cleanedRole),
    })
      .then(response => {
        if (!response.ok) {
          return response.json().then(err => {
            throw new Error(`HTTP-Fehler! Status: ${response.status} - ${err.error || response.statusText}`);
          });
        }
        return response.json();
      })
      .then(data => {
        const updatedRoleWithHours: Role = { ...data, workHoursDayMaxLoad, availableDailyHours };
        setRoles(roles.map(r => (r._id === id ? updatedRoleWithHours : r)));
      })
      .catch((error: unknown) => {
        const errorMessage = error instanceof Error ? error.message : 'Unbekannter Fehler';
        console.error('Fehler beim Bearbeiten der Rolle:', error);
        setError('Fehler beim Bearbeiten der Rolle: ' + errorMessage);
      });
  };

  const handleEditSave = async () => {
    if (!editRole || !editRole._id) {
      setError('Keine Rolle zum Bearbeiten ausgewählt.');
      return;
    }

    const cleanRights = editRole.rights && editRole.rights !== '<p></p>' ? editRole.rights : '';

    const updatedRole: Partial<Role> = {
      ...editRole,
      rights: cleanRights,
      supervisorRole: typeof editRole.supervisorRole === 'object' ? editRole.supervisorRole?._id : editRole.supervisorRole || undefined,
      subordinateRoles: editRole.subordinateRoles?.map(role => typeof role === 'object' ? role._id : role) || [],
      department: typeof editRole.department === 'object' ? editRole.department?._id : editRole.department || undefined,
      subsidiary: typeof editRole.subsidiary === 'object' ? editRole.subsidiary?._id : editRole.subsidiary || undefined,
    };

    try {
      const response = await fetch(`http://localhost:5001/api/roles/${editRole._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedRole),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Fehler beim Bearbeiten der Rolle');
      }
      const data = await response.json();
      const { workHoursDayMaxLoad, availableDailyHours } = calculateRoleHours(data, company, subsidiaries, tasks);
      const updatedRoleWithHours: Role = { ...data, workHoursDayMaxLoad, availableDailyHours };
      setRoles(roles.map(r => (r._id === editRole._id ? updatedRoleWithHours : r)));
      setError(null);
      handleEditClose();
    } catch (error: any) {
      console.error('Error editing role:', error);
      console.log('Fehlermeldung vom Backend:', error.message);
      setError('Fehler beim Bearbeiten der Rolle: ' + error.message);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`http://localhost:5001/api/roles/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Fehler beim Löschen der Rolle');
      setRoles(roles.filter(role => role._id !== id));
      setError(null);
    } catch (error: any) {
      console.error('Error deleting role:', error);
      setError('Fehler beim Löschen der Rolle: ' + error.message);
    }
  };

  const handleOpenTaskDialog = (roleId: string) => {
    setSelectedRoleId(roleId);
    setOpenTaskModal(true);
  };

  const handleCloseTaskDialog = () => {
    setSelectedRoleId(null);
    setOpenTaskModal(false);
  };

  const handleItemExpansionToggle = (_event: SyntheticEvent | null, nodeIds: string[]) => {
    setExpandedNodes(nodeIds);
  };

  if (loading) return <div className="p-4 text-gray-500 dark:text-gray-400">Loading...</div>;
  if (error) return <div className="p-4 text-red-500 dark:text-red-400">{error}</div>;

  const treeData = buildTreeData(filteredRoles);

  return (
    <>
      <PageMeta
        title="Roles | SEQ.IST - Project Management Solution"
        description="Manage roles in the SEQ.IST Project Management Solution"
      />
      <PageBreadcrumb pageTitle="Roles" />
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Rollen Hierarchie
          </h3>
          <div className="flex items-center space-x-3">
            <RoleFilters
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              sortOption={sortOption}
              setSortOption={setSortOption}
            />
            <RoleImport
              importFile={importFile}
              setImportFile={setImportFile}
              setError={setError}
              setRoles={setRoles}
              roles={roles}
            />
            <button
              onClick={() => setOpenAddModal(true)}
              className="inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-5 py-2 text-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200"
            >
              Neue Rolle
            </button>
          </div>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] p-5">
          <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
            <div className="flex items-center space-x-3 flex-1">
              <div className="w-64 font-semibold text-gray-500 dark:text-gray-400 uppercase text-xs">
                Rolle
              </div>
              <div className="w-32 font-semibold text-gray-500 dark:text-gray-400 uppercase text-xs">
                Abteilung
              </div>
              <div className="w-32 font-semibold text-gray-500 dark:text-gray-400 uppercase text-xs">
                Leiter
              </div>
              <div className="w-32 font-semibold text-gray-500 dark:text-gray-400 uppercase text-xs">
                Mitarbeiteranzahl
              </div>
              <div className="w-32 font-semibold text-gray-500 dark:text-gray-400 uppercase text-xs">
                Max Std/Tag
              </div>
              <div className="w-32 font-semibold text-gray-500 dark:text-gray-400 uppercase text-xs">
                Verfügbar
              </div>
            </div>
            <div className="w-32 font-semibold text-gray-500 dark:text-gray-400 uppercase text-xs text-right">
              Aktionen
            </div>
          </div>
          <div className="mt-2">
            <RoleTreeItems
              nodes={treeData}
              expandedNodes={expandedNodes}
              handleItemExpansionToggle={handleItemExpansionToggle}
              roles={roles}
              tasks={tasks}
              handleAddJunior={handleAddJunior}
              handleEditOpen={handleEditOpen}
              handleDelete={handleDelete}
              onOpenTaskDialog={handleOpenTaskDialog}
            />
          </div>
        </div>

        <RoleAddModal
          open={openAddModal}
          onClose={handleAddClose}
          roles={roles}
          departments={departments}
          subsidiaries={subsidiaries}
          newName={newName}
          setNewName={setNewName}
          newAbbreviation={newAbbreviation}
          setNewAbbreviation={setNewAbbreviation}
          newDepartment={newDepartment}
          setNewDepartment={setNewDepartment}
          newPaymentType={newPaymentType}
          setNewPaymentType={setNewPaymentType}
          newPaymentValue={newPaymentValue}
          setNewPaymentValue={setNewPaymentValue}
          newNumberOfHolders={newNumberOfHolders}
          setNewNumberOfHolders={setNewNumberOfHolders}
          newRights={newRights}
          setNewRights={setNewRights}
          newSupervisorRole={newSupervisorRole}
          setNewSupervisorRole={setNewSupervisorRole}
          newSubordinateRoles={newSubordinateRoles}
          setNewSubordinateRoles={setNewSubordinateRoles}
          newSubsidiary={newSubsidiary}
          setNewSubsidiary={setNewSubsidiary}
          onAdd={handleAdd}
        />

        <RoleEditModal
          open={openEditModal}
          onClose={handleEditClose}
          editRole={editRole}
          roles={roles}
          departments={departments}
          subsidiaries={subsidiaries}
          onChange={handleEditChange}
          onSave={handleEditSave}
        />

        {selectedRoleId && openTaskModal && (
          <TaskForm
            selectedRoleId={selectedRoleId}
            tasks={tasks}
            setTasks={setTasks}
            roles={roles}
            company={company}
            subsidiaries={subsidiaries}
            calculateRoleHours={calculateRoleHours}
            handleEditRole={handleEditRole}
            setError={setError}
            onClose={handleCloseTaskDialog}
          />
        )}
      </div>
    </>
  );
};

export default RolesPage;