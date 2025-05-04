import React, { useState, useEffect } from "react";
import { toast } from 'react-toastify';
import { Role, RecurringTask } from '../types/Role';

interface TaskFormProps {
  selectedRoleId: string;
  tasks: RecurringTask[];
  setTasks: (tasks: RecurringTask[]) => void;
  roles: Role[];
  company: any;
  subsidiaries: any[];
  calculateRoleHours: (role: Role, company: any, subsidiaries: any[], tasks: RecurringTask[]) => { workHoursDayMaxLoad: number; availableDailyHours: number };
  handleEditRole: (id: string, updatedRole: Role) => void;
  setError: (error: string | null) => void;
  onClose: () => void;
}

const TaskForm: React.FC<TaskFormProps> = ({
  selectedRoleId,
  tasks,
  setTasks,
  roles,
  company,
  subsidiaries,
  calculateRoleHours,
  handleEditRole,
  setError,
  onClose,
}) => {
  const [localTasks, setLocalTasks] = useState<RecurringTask[]>([]);
  const [editingTask, setEditingTask] = useState<RecurringTask | null>(null);
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    // Filtere die Tasks für die ausgewählte Rolle
    const roleTasks = tasks.filter(task => task.role._id === selectedRoleId);
    setLocalTasks(roleTasks);
  }, [selectedRoleId, tasks]);

  const handleAddTask = () => {
    setEditingTask({
      name: '',
      frequency: 1,
      rhythm: 'daily',
      duration: 0,
      unit: 'minutes',
      role: { _id: selectedRoleId },
    });
    setIsAdding(true);
  };

  const handleEditTask = (task: RecurringTask) => {
    setEditingTask(task);
    setIsAdding(false);
  };

  const handleDeleteTask = async (task: RecurringTask) => {
    try {
      const updatedTasks = localTasks.filter(t => t !== task);
      setLocalTasks(updatedTasks);

      // Aktualisiere die Rolle
      const role = roles.find(r => r._id === selectedRoleId);
      if (role) {
        const updatedRole: Role = {
          ...role,
          dailyTasks: updatedTasks,
        };
        const { workHoursDayMaxLoad, availableDailyHours } = calculateRoleHours(updatedRole, company, subsidiaries, updatedTasks);
        updatedRole.workHoursDayMaxLoad = workHoursDayMaxLoad;
        updatedRole.availableDailyHours = availableDailyHours;
        handleEditRole(selectedRoleId, updatedRole);

        // Aktualisiere die globale Task-Liste
        const allTasks = tasks.filter(t => t.role._id !== selectedRoleId);
        setTasks([...allTasks, ...updatedTasks]);
      }

      toast.success('Task erfolgreich gelöscht');
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unbekannter Fehler';
      console.error('Fehler beim Löschen der Aufgabe:', error);
      setError('Fehler beim Löschen der Aufgabe: ' + errorMessage);
      toast.error('Fehler beim Löschen der Aufgabe');
    }
  };

  const handleSaveTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTask) return;

    try {
      let updatedTasks: RecurringTask[];
      if (isAdding) {
        updatedTasks = [...localTasks, editingTask];
      } else {
        updatedTasks = localTasks.map(t => (t === editingTask ? editingTask : t));
      }
      setLocalTasks(updatedTasks);

      // Aktualisiere die Rolle
      const role = roles.find(r => r._id === selectedRoleId);
      if (role) {
        const updatedRole: Role = {
          ...role,
          dailyTasks: updatedTasks,
        };
        const { workHoursDayMaxLoad, availableDailyHours } = calculateRoleHours(updatedRole, company, subsidiaries, updatedTasks);
        updatedRole.workHoursDayMaxLoad = workHoursDayMaxLoad;
        updatedRole.availableDailyHours = availableDailyHours;
        handleEditRole(selectedRoleId, updatedRole);

        // Aktualisiere die globale Task-Liste
        const allTasks = tasks.filter(t => t.role._id !== selectedRoleId);
        setTasks([...allTasks, ...updatedTasks]);
      }

      toast.success('Task erfolgreich gespeichert');
      setEditingTask(null);
      setIsAdding(false);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unbekannter Fehler';
      console.error('Fehler beim Speichern der Aufgabe:', error);
      setError('Fehler beim Speichern der Aufgabe: ' + errorMessage);
      toast.error('Fehler beim Speichern der Aufgabe');
    }
  };

  const handleCancelEdit = () => {
    setEditingTask(null);
    setIsAdding(false);
  };

  // Hole den Namen der Rolle
  const roleName = roles.find(r => r._id === selectedRoleId)?.name || 'Unbekannt';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg w-[800px] p-6 shadow-xl">
        <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-4">
          Tasks für Rolle bearbeiten ({roleName})
        </h2>
        <div className="space-y-4">
          {/* Tabelle der Tasks */}
          {localTasks.length === 0 ? (
            <p className="text-gray-700 dark:text-gray-300">Keine Tasks vorhanden.</p>
          ) : (
            <table className="w-full table-auto">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-800">
                  <th className="px-4 py-3 border border-gray-100 dark:border-white/[0.05] font-medium text-gray-700 text-sm dark:text-gray-400">
                    Name
                  </th>
                  <th className="px-4 py-3 border border-gray-100 dark:border-white/[0.05] font-medium text-gray-700 text-sm dark:text-gray-400">
                    Häufigkeit
                  </th>
                  <th className="px-4 py-3 border border-gray-100 dark:border-white/[0.05] font-medium text-gray-700 text-sm dark:text-gray-400">
                    Rhythmus
                  </th>
                  <th className="px-4 py-3 border border-gray-100 dark:border-white/[0.05] font-medium text-gray-700 text-sm dark:text-gray-400">
                    Dauer
                  </th>
                  <th className="px-4 py-3 border border-gray-100 dark:border-white/[0.05] font-medium text-gray-700 text-sm dark:text-gray-400">
                    Einheit
                  </th>
                  <th className="px-4 py-3 border border-gray-100 dark:border-white/[0.05] font-medium text-gray-700 text-sm dark:text-gray-400">
                    Aktionen
                  </th>
                </tr>
              </thead>
              <tbody>
                {localTasks.map((task, index) => (
                  <tr key={index} className="hover:bg-gray-100 dark:hover:bg-gray-800">
                    <td className="px-4 py-4 font-normal text-gray-800 border border-gray-100 dark:border-white/[0.05] text-sm dark:text-gray-400 whitespace-nowrap">
                      {task.name}
                    </td>
                    <td className="px-4 py-4 font-normal text-gray-800 border border-gray-100 dark:border-white/[0.05] text-sm dark:text-gray-400 whitespace-nowrap">
                      {task.frequency}
                    </td>
                    <td className="px-4 py-4 font-normal text-gray-800 border border-gray-100 dark:border-white/[0.05] text-sm dark:text-gray-400 whitespace-nowrap">
                      {task.rhythm}
                    </td>
                    <td className="px-4 py-4 font-normal text-gray-800 border border-gray-100 dark:border-white/[0.05] text-sm dark:text-gray-400 whitespace-nowrap">
                      {task.duration}
                    </td>
                    <td className="px-4 py-4 font-normal text-gray-800 border border-gray-100 dark:border-white/[0.05] text-sm dark:text-gray-400 whitespace-nowrap">
                      {task.unit}
                    </td>
                    <td className="px-4 py-4 font-normal text-gray-800 border border-gray-100 dark:border-white/[0.05] text-sm dark:text-white/90 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEditTask(task)}
                          className="text-blue-600 hover:text-blue-700"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.536L16.732 3.732z"></path>
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDeleteTask(task)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {/* Button zum Hinzufügen eines neuen Tasks */}
          <button
            type="button"
            onClick={handleAddTask}
            className="px-4 py-2 text-white bg-green-600 rounded hover:bg-green-700 mb-4"
          >
            Neue Aufgabe hinzufügen
          </button>

          {/* Formular zum Hinzufügen/Bearbeiten eines Tasks */}
          {editingTask && (
            <form onSubmit={handleSaveTask} className="space-y-4 mt-4">
              <div className="mb-2">
                <label className="block text-gray-700 dark:text-gray-300">Name</label>
                <input
                  type="text"
                  value={editingTask.name}
                  onChange={(e) => setEditingTask({ ...editingTask, name: e.target.value })}
                  className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white dark:border-gray-600"
                  required
                />
              </div>
              <div className="mb-2">
                <label className="block text-gray-700 dark:text-gray-300">Häufigkeit</label>
                <input
                  type="number"
                  value={editingTask.frequency}
                  onChange={(e) => setEditingTask({ ...editingTask, frequency: parseInt(e.target.value) })}
                  className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white dark:border-gray-600"
                  min="1"
                  required
                />
              </div>
              <div className="mb-2">
                <label className="block text-gray-700 dark:text-gray-300">Rhythmus</label>
                <select
                  value={editingTask.rhythm}
                  onChange={(e) => setEditingTask({ ...editingTask, rhythm: e.target.value })}
                  className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white dark:border-gray-600"
                >
                  <option value="daily">Täglich</option>
                  <option value="weekly">Wöchentlich</option>
                  <option value="monthly">Monatlich</option>
                </select>
              </div>
              <div className="mb-2">
                <label className="block text-gray-700 dark:text-gray-300">Dauer</label>
                <input
                  type="number"
                  value={editingTask.duration}
                  onChange={(e) => setEditingTask({ ...editingTask, duration: parseInt(e.target.value) })}
                  className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white dark:border-gray-600"
                  min="0"
                  required
                />
              </div>
              <div className="mb-2">
                <label className="block text-gray-700 dark:text-gray-300">Einheit</label>
                <select
                  value={editingTask.unit}
                  onChange={(e) => setEditingTask({ ...editingTask, unit: e.target.value })}
                  className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white dark:border-gray-600"
                >
                  <option value="minutes">Minuten</option>
                  <option value="hours">Stunden</option>
                </select>
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="px-4 py-2 text-gray-700 bg-gray-200 rounded dark:bg-gray-600 dark:text-gray-300"
                >
                  Abbrechen
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-white bg-blue-600 rounded hover:bg-blue-700"
                >
                  Speichern
                </button>
              </div>
            </form>
          )}
        </div>
        <div className="flex justify-end gap-2 mt-4">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
          >
            Abbrechen
          </button>
        </div>
      </div>
    </div>
  );
};

export default TaskForm;