// src/features/processes/services/processService.ts
export interface Role {
  _id: string;
  name: string;
}

export interface WorkProduct {
  _id?: string;
  name: string;
  number?: string;
  abbreviation?: string;
  description: string;
  useMode?: 'None' | 'Internal' | 'FromCustomer' | 'FromSupplier' | 'ToCustomer';
  cost?: number | null;
  digitalisierbarDurch?: string[];
}

export interface Process {
  _id: string;
  name: string;
  description?: string;
  workProducts?: { workProductId: string; known: number; unknown: number }[];
  abbreviation?: string;
  processPurpose?: string;
  owner?: Role | string;
  isChildOf?: Process | string;
  isChildOfImmutable?: boolean;
}

export interface Activity {
  _id: string;
  name: string;
  process: string | { _id: string; name: string } | null; // Angepasst
  trigger?: {
    workProducts: { _id: string | { _id: string }; completionPercentage: number; isWorkloadDetermining?: boolean }[];
    andOr?: 'AND' | 'OR';
    timeTrigger?: { unit: string; value: number; repetition: string };
    determiningFactorId?: string | { _id: string } | null;
  };
  result?: string | { _id: string; name: string } | null;
  roles?: string[];
  executedBy?: string | { _id: string; name: string } | null; // Angepasst
  knownTime?: number;
  multiplicator?: number;
  compressor?: string;
  abbreviation?: string;
  description?: string;
  executionMode?: string;
  estimatedTime?: number;
  timeUnit?: string;
  timeFactor?: number;
  duration?: number;
  effort?: number;
  versionMajor?: number;
  versionMinor?: number;
  icon?: string;
}

export interface BPMNPositions {
  positions: { [key: string]: any };
  laneDimensions?: { [key: string]: any };
}

interface SavedPositions {
  [key: string]: { x: number; y: number };
}

export const fetchProcesses = async (): Promise<Process[]> => {
  try {
    const response = await fetch('http://localhost:5001/api/processes');
    if (!response.ok) {
      if (response.status === 404) throw new Error('Keine Prozesse gefunden');
      throw new Error(`HTTP-Fehler! Status: ${response.status} - ${response.statusText}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching processes:', error);
    throw error;
  }
};

export const fetchProcessById = async (id: string): Promise<Process> => {
  try {
    const response = await fetch(`http://localhost:5001/api/processes/${id}`);
    if (!response.ok) {
      throw new Error('Fehler beim Abrufen des Prozesses');
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching process:', error);
    throw error;
  }
};

export const fetchActivities = async (processId: string): Promise<Activity[]> => {
  try {
    const response = await fetch(`http://localhost:5001/api/activities?process=${processId}`);
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Fehler beim Abrufen der Aktivitäten: ${response.status} - ${errorText}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching activities:', error);
    throw error;
  }
};

export const fetchAllActivities = async (): Promise<Activity[]> => {
  try {
    const response = await fetch('http://localhost:5001/api/activities');
    if (!response.ok) throw new Error('Aktivitäten konnten nicht geladen werden');
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching activities:', error);
    throw error;
  }
};

export const fetchRoles = async (): Promise<Role[]> => {
  try {
    const response = await fetch('http://localhost:5001/api/roles');
    if (!response.ok) throw new Error('Fehler beim Abrufen der Rollen');
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching roles:', error);
    throw error;
  }
};

export const addProcess = async (newProcess: Omit<Process, '_id'>): Promise<Process> => {
  try {
    const response = await fetch('http://localhost:5001/api/processes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newProcess),
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Fehler beim Hinzufügen des Prozesses');
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error adding process:', error);
    throw error;
  }
};

export const updateProcess = async (processId: string, updatedProcess: Partial<Process>): Promise<Process> => {
  try {
    const response = await fetch(`http://localhost:5001/api/processes/${processId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedProcess),
    });
    if (!response.ok) throw new Error('Fehler beim Speichern');
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error updating process:', error);
    throw error;
  }
};

export const addActivity = async (newActivity: Omit<Activity, '_id'>): Promise<Activity> => {
  try {
    const response = await fetch('http://localhost:5001/api/activities', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newActivity),
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Fehler beim Hinzufügen der Aktivität');
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error adding activity:', error);
    throw error;
  }
};

export const updateActivity = async (activityId: string, updatedActivity: Partial<Activity>): Promise<Activity> => {
  try {
    const response = await fetch(`http://localhost:5001/api/activities/${activityId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedActivity),
    });
    if (!response.ok) throw new Error('Fehler beim Aktualisieren der Aktivität');
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error updating activity:', error);
    throw error;
  }
};

export const deleteActivity = async (activityId: string): Promise<void> => {
  try {
    const response = await fetch(`http://localhost:5001/api/activities/${activityId}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Fehler beim Löschen der Aktivität');
  } catch (error) {
    console.error('Error deleting activity:', error);
    throw error;
  }
};

export const fetchBPMNPositions = async (processId: string): Promise<BPMNPositions> => {
  try {
    const response = await fetch(`http://localhost:5001/api/processes/${processId}/bpmn-positions`);
    if (!response.ok) throw new Error('Fehler beim Abrufen der BPMN-Positionen');
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching BPMN positions:', error);
    throw error;
  }
};

export const saveBPMNPositions = async (processId: string, positions: { [key: string]: any }): Promise<any> => {
  try {
    const response = await fetch(`http://localhost:5001/api/processes/${processId}/bpmn-positions`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ positions }),
    });
    if (!response.ok) throw new Error('Fehler beim Speichern der BPMN-Positionen');
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error saving BPMN positions:', error);
    throw error;
  }
};

export const fetchFlowPositions = async (processId: string): Promise<SavedPositions> => {
  try {
    const response = await fetch(`http://localhost:5001/api/processes/${processId}/flow-positions`);
    if (!response.ok) throw new Error('Fehler beim Abrufen der Flow-Positionen');
    const data = await response.json();
    return data.positions || {};
  } catch (error) {
    console.error('Error fetching Flow positions:', error);
    throw error;
  }
};

export const saveFlowPositions = async (processId: string, positions: { [key: string]: any }): Promise<any> => {
  try {
    const response = await fetch(`http://localhost:5001/api/processes/${processId}/flow-positions`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ positions }),
    });
    if (!response.ok) throw new Error('Fehler beim Speichern der Flow-Positionen');
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error saving Flow positions:', error);
    throw error;
  }
};