import { useState, useEffect } from 'react';
import { Dispatch, SetStateAction } from 'react';

// Typdefinitionen für Rollen
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

interface UseRolesDataReturn {
  roles: Role[];
  setRoles: Dispatch<SetStateAction<Role[]>>;
  departments: any[];
  company: any;
  subsidiaries: any[];
  tasks: RecurringTask[];
  setTasks: (tasks: RecurringTask[]) => void;
  loading: boolean;
  error: string | null;
  setError: (error: string | null) => void;
}

const useRolesData = (calculateRoleHours: (role: Role, company: any, subsidiaries: any[], tasks: RecurringTask[]) => { workHoursDayMaxLoad: number; availableDailyHours: number }): UseRolesDataReturn => {
  const [roles, setRoles] = useState<Role[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [company, setCompany] = useState<any>(null);
  const [subsidiaries, setSubsidiaries] = useState<any[]>([]);
  const [tasks, setTasks] = useState<RecurringTask[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    Promise.all([
      fetch('http://localhost:5001/api/roles').then(r => {
        if (!r.ok) throw new Error(`HTTP-Fehler! Status: ${r.status} - ${r.statusText}`);
        return r.json();
      }),
      fetch('http://localhost:5001/api/departments').then(r => {
        if (!r.ok) throw new Error(`HTTP-Fehler! Status: ${r.status} - ${r.statusText}`);
        return r.json();
      }),
      fetch('http://localhost:5001/api/company').then(r => {
        if (!r.ok) throw new Error(`HTTP-Fehler! Status: ${r.status} - ${r.statusText}`);
        return r.json();
      }),
    ])
      .then(([rolesData, depts, comp]) => {
        console.log('Company Data:', comp);
        console.log('Subsidiaries:', comp?.subsidiaries);

        // Extrahiere alle Tasks aus den Rollen
        const allTasks: RecurringTask[] = rolesData.flatMap((role: Role) => 
          (role.dailyTasks || []).map(task => ({
            ...task,
            role: { _id: role._id },
            rhythm: task.rhythm || 'daily',
            unit: task.unit || 'minutes',
            frequency: task.frequency || 1,
            duration: task.duration || 0,
          }))
        );

        const updatedRoles = rolesData.map((role: Role) => {
          const { workHoursDayMaxLoad, availableDailyHours } = calculateRoleHours(role, comp, comp?.subsidiaries || [], allTasks);
          return {
            ...role,
            workHoursDayMaxLoad,
            availableDailyHours,
          };
        });
        setRoles(updatedRoles || []);
        setDepartments(depts || []);
        setCompany(comp || null);
        setSubsidiaries(comp?.subsidiaries || []);
        setTasks(allTasks);
        setLoading(false);
      })
      .catch((error: unknown) => {
        const errorMessage = error instanceof Error ? error.message : 'Unbekannter Fehler';
        console.error('Fehler beim Laden der Daten:', error);
        setError(errorMessage);
        setRoles([]);
        setDepartments([]);
        setCompany(null);
        setSubsidiaries([]);
        setTasks([]);
        setLoading(false);
      });
  }, [calculateRoleHours]);

  return {
    roles,
    setRoles,
    departments,
    company,
    subsidiaries,
    tasks,
    setTasks,
    loading,
    error,
    setError,
  };
};

export default useRolesData;