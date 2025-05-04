import React from 'react';

// Typdefinition für wiederkehrende Aufgaben
interface RecurringTask {
  _id?: string;
  role: { _id: string };
  name: string;
  frequency: number;
  rhythm: string;
  duration: number;
  unit: string;
}

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
  dailyTasks?: RecurringTask[];
}

interface TaskListProps {
  tasks: RecurringTask[];
  selectedRoleId: string;
  setTasks: (tasks: RecurringTask[]) => void;
  roles: Role[];
  company: any;
  subsidiaries: any[];
  calculateRoleHours: (role: Role, company: any, subsidiaries: any[], tasks: RecurringTask[]) => { workHoursDayMaxLoad: number; availableDailyHours: number };
  handleEditRole: (id: string, updatedRole: Role) => void;
  setError: (error: string | null) => void;
}

const TaskList: React.FC<TaskListProps> = ({
  tasks,
  selectedRoleId,
  setTasks,
  roles,
  company,
  subsidiaries,
  calculateRoleHours,
  handleEditRole,
  setError,
}) => {
  const handleDeleteTask = async (task: RecurringTask) => {
    try {
      // Entferne die Aufgabe aus der Liste
      const updatedTasks = tasks.filter(t => t !== task);
      setTasks(updatedTasks);

      // Aktualisiere die Rolle
      const role = roles.find(r => r._id === selectedRoleId);
      if (role) {
        const updatedRole: Role = {
          ...role,
          dailyTasks: updatedTasks.filter(t => t.role._id === selectedRoleId),
        };
        const { workHoursDayMaxLoad, availableDailyHours } = calculateRoleHours(updatedRole, company, subsidiaries, updatedTasks);
        updatedRole.workHoursDayMaxLoad = workHoursDayMaxLoad;
        updatedRole.availableDailyHours = availableDailyHours;
        handleEditRole(selectedRoleId, updatedRole);
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unbekannter Fehler';
      console.error('Fehler beim Löschen der Aufgabe:', error);
      setError('Fehler beim Löschen der Aufgabe: ' + errorMessage);
    }
  };

  const filteredTasks = tasks.filter(task => task.role._id === selectedRoleId);

  if (filteredTasks.length === 0) {
    return null;
  }

  return (
    <div className="p-4 bg-white dark:bg-gray-900 rounded-lg shadow w-full">
      <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
        Aufgabenliste
      </h3>
      <table className="w-full table-auto">
        <tbody>
          <tr className="bg-gray-50 dark:bg-gray-800">
            <td className="px-4 py-3 border border-gray-100 dark:border-white/[0.05] font-medium text-gray-700 text-sm dark:text-gray-400">
              Name
            </td>
            <td className="px-4 py-3 border border-gray-100 dark:border-white/[0.05] font-medium text-gray-700 text-sm dark:text-gray-400">
              Wie oft
            </td>
            <td className="px-4 py-3 border border-gray-100 dark:border-white/[0.05] font-medium text-gray-700 text-sm dark:text-gray-400">
              Rhythmus
            </td>
            <td className="px-4 py-3 border border-gray-100 dark:border-white/[0.05] font-medium text-gray-700 text-sm dark:text-gray-400">
              Dauer
            </td>
            <td className="px-4 py-3 border border-gray-100 dark:border-white/[0.05] font-medium text-gray-700 text-sm dark:text-gray-400">
              Einheit
            </td>
            <td className="px-4 py-3 border border-gray-100 dark:border-white/[0.05] font-medium text-gray-700 text-sm dark:text-gray-400">
              Aktionen
            </td>
          </tr>
          {filteredTasks.map((task, index) => (
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
                    onClick={() => {
                      // Bearbeitungslogik kann hier hinzugefügt werden
                    }}
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
    </div>
  );
};

export default TaskList;