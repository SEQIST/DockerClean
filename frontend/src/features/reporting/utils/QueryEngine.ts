import { Role, Activity, Process, WorkProduct, Trigger } from '../types/ReportingTypes';

interface FetchedData {
  roles: Role[];
  activities: Activity[];
  processes: Process[];
  workProducts: WorkProduct[];
  triggers: Trigger[];
}

export const QueryEngine = {
  async fetchAllData(): Promise<FetchedData> {
    try {
      const [rolesResponse, activitiesResponse, processesResponse, workProductsResponse, triggersResponse] = await Promise.all([
        fetch('http://localhost:5001/api/roles'),
        fetch('http://localhost:5001/api/activities'),
        fetch('http://localhost:5001/api/processes'),
        fetch('http://localhost:5001/api/workproducts'),
        fetch('http://localhost:5001/api/triggers'),
      ]);

      if (!rolesResponse.ok) throw new Error(`Fehler beim Abrufen der Rollen: ${rolesResponse.statusText}`);
      if (!activitiesResponse.ok) throw new Error(`Fehler beim Abrufen der Aktivitäten: ${activitiesResponse.statusText}`);
      if (!processesResponse.ok) throw new Error(`Fehler beim Abrufen der Prozesse: ${processesResponse.statusText}`);
      if (!workProductsResponse.ok) throw new Error(`Fehler beim Abrufen der Arbeitspakete: ${workProductsResponse.statusText}`);
      if (!triggersResponse.ok) throw new Error(`Fehler beim Abrufen der Trigger: ${triggersResponse.statusText}`);

      const roles = await rolesResponse.json();
      const activities = await activitiesResponse.json();
      const processes = await processesResponse.json();
      const workProducts = await workProductsResponse.json();
      const triggers = await triggersResponse.json();

      return {
        roles: roles || [],
        activities: activities || [],
        processes: processes || [],
        workProducts: workProducts || [],
        triggers: triggers || [],
      };
    } catch (error: any) {
      console.error('Fehler beim Abrufen der Daten:', error);
      throw new Error('Fehler beim Abrufen der Daten: ' + error.message);
    }
  },

  // Funktion zum Finden von Aktivitäten einer Rolle, die auf einen Trigger reagieren
  getActivitiesForRole(roleId: string, activities: Activity[], triggers: Trigger[], workProducts: WorkProduct[]): { activity: Activity; trigger: Trigger | null; workProduct: WorkProduct | null }[] {
    const roleActivities = activities.filter(activity => {
      const activityRoleId = typeof activity.role === 'string' ? activity.role : activity.role?._id;
      return activityRoleId === roleId;
    });

    return roleActivities.map(activity => {
      const trigger = triggers.find(t => {
        const triggerTarget = typeof t.target === 'string' ? t.target : t.target?._id;
        return triggerTarget === activity._id;
      }) || null;

      const workProduct = workProducts.find(wp => {
        const activityWorkProductId = typeof activity.workProduct === 'string' ? activity.workProduct : activity.workProduct?._id;
        return activityWorkProductId === wp._id;
      }) || null;

      return { activity, trigger, workProduct };
    });
  },

  // Funktion zum Finden von Prozessen, die einen bestimmten Trigger verwenden
  getProcessesForTrigger(triggerId: string, processes: Process[]): Process[] {
    return processes.filter(process => {
      const processTriggerId = typeof process.trigger === 'string' ? process.trigger : process.trigger?._id;
      return processTriggerId === triggerId;
    });
  },

  // Funktion zum Finden von Aktivitäten, die ein bestimmtes Arbeitspaket konsumieren
  getActivitiesConsumingWorkProduct(workProductId: string, activities: Activity[], triggers: Trigger[]): Activity[] {
    const consumingTriggers = triggers.filter(trigger => {
      const triggerSourceId = typeof trigger.source === 'string' ? trigger.source : trigger.source?._id;
      return triggerSourceId === workProductId;
    });

    return activities.filter(activity => {
      return consumingTriggers.some(trigger => {
        const triggerTargetId = typeof trigger.target === 'string' ? trigger.target : trigger.target?._id;
        return triggerTargetId === activity._id;
      });
    });
  },
};