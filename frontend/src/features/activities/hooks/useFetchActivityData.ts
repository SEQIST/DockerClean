// src/features/activities/hooks/useFetchActivityData.ts
import { useState, useEffect } from 'react';
import { WorkProduct, Process, Role, Activity } from '../../processes/services/processService';

interface FetchActivityDataResult {
  roles: Role[];
  workProducts: WorkProduct[];
  allWorkProducts: WorkProduct[];
  processes: Process[];
  activity: Activity;
  loading: boolean;
  error: string | null;
}

const useFetchActivityData = (activityId?: string, defaultProcess?: string): FetchActivityDataResult => {
  const [roles, setRoles] = useState<Role[]>([]);
  const [workProducts, setWorkProducts] = useState<WorkProduct[]>([]);
  const [allWorkProducts, setAllWorkProducts] = useState<WorkProduct[]>([]);
  const [processes, setProcesses] = useState<Process[]>([]);
  const [activity, setActivity] = useState<Activity>({
    _id: '',
    name: '',
    process: null,
    executedBy: null,
    result: null,
    roles: [],
    multiplicator: 1,
    compressor: 'multiply',
    executionMode: 'parallel',
    knownTime: 0,
    estimatedTime: 0,
    timeUnit: 'minutes',
    versionMajor: 1,
    versionMinor: 0,
    icon: '',
    description: '',
    abbreviation: '',
    trigger: {
      workProducts: [],
      andOr: 'AND',
      timeTrigger: { unit: 'sec', value: 0, repetition: '' },
      determiningFactorId: null,
    },
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [rolesResponse, availableWorkProductsResponse, allWorkProductsResponse, processesResponse, activityResponse] = await Promise.all([
          fetch('http://localhost:5001/api/roles').then(r => r.json()),
          fetch('http://localhost:5001/api/activities/available-workproducts').then(r => {
            if (!r.ok) {
              console.error('Fehlerstatus vom Endpunkt /available-workproducts:', r.status, r.statusText);
              return [];
            }
            return r.json();
          }).catch(err => {
            console.error('Fehler beim Abrufen der verfügbaren Work Products:', err);
            return [];
          }),
          fetch('http://localhost:5001/api/workproducts').then(r => {
            if (!r.ok) {
              console.error('Fehlerstatus vom Endpunkt /workproducts:', r.status, r.statusText);
              return [];
            }
            return r.json();
          }).catch(err => {
            console.error('Fehler beim Abrufen aller Work Products:', err);
            return [];
          }),
          fetch('http://localhost:5001/api/processes').then(r => {
            if (!r.ok) {
              console.error('Fehlerstatus vom Endpunkt /processes:', r.status, r.statusText);
              return [];
            }
            return r.json();
          }).catch(err => {
            console.error('Fehler beim Abrufen der Prozesse:', err);
            return [];
          }),
          activityId ? fetch(`http://localhost:5001/api/activities/${activityId}`).then(r => {
            if (!r.ok) throw new Error('Aktivität nicht gefunden');
            return r.json();
          }) : Promise.resolve(null),
        ]);

        console.log('Geladene Rollen:', rolesResponse);
        console.log('Geladene verfügbare Work Products:', availableWorkProductsResponse);
        console.log('Geladene alle Work Products:', allWorkProductsResponse);
        console.log('Geladene Prozesse:', processesResponse);
        console.log('Geladene Aktivität:', activityResponse);

        setRoles(Array.isArray(rolesResponse) ? rolesResponse : []);
        setWorkProducts(Array.isArray(availableWorkProductsResponse) ? availableWorkProductsResponse : []);
        setAllWorkProducts(Array.isArray(allWorkProductsResponse) ? allWorkProductsResponse : []);
        setProcesses(Array.isArray(processesResponse) ? processesResponse : []);

        if (activityResponse) {
          const updatedActivity: Activity = {
            ...activityResponse,
            process: activityResponse.process?._id || activityResponse.process || defaultProcess || null,
            executedBy: activityResponse.executedBy?._id || activityResponse.executedBy || null,
            result: activityResponse.result?._id || activityResponse.result || null,
            multiplicator: Number(activityResponse.multiplicator) || 1,
            compressor: activityResponse.compressor || 'multiply',
            executionMode: activityResponse.executionMode || 'parallel',
            knownTime: Number(activityResponse.knownTime) || 0,
            estimatedTime: Number(activityResponse.estimatedTime) || 0,
            timeUnit: activityResponse.timeUnit || 'minutes',
            versionMajor: Number(activityResponse.versionMajor) || 1,
            versionMinor: Number(activityResponse.versionMinor) || 0,
            icon: activityResponse.icon || '',
            description: activityResponse.description || '',
            abbreviation: activityResponse.abbreviation || '',
            trigger: {
              workProducts: (activityResponse.trigger?.workProducts || []).map((wp: any) => ({
                _id: wp._id?._id || wp._id || '',
                completionPercentage: Number(wp.completionPercentage) || 100,
                isWorkloadDetermining: wp.isWorkloadDetermining || false,
              })),
              andOr: activityResponse.trigger?.andOr || 'AND',
              timeTrigger: {
                unit: activityResponse.trigger?.timeTrigger?.unit || 'sec',
                value: Number(activityResponse.trigger?.timeTrigger?.value) || 0,
                repetition: activityResponse.trigger?.timeTrigger?.repetition || '',
              },
              determiningFactorId: activityResponse.trigger?.determiningFactorId?._id || activityResponse.trigger?.determiningFactorId || null,
            },
          };

          console.log('Transformierte Aktivität:', updatedActivity);
          console.log('Trigger Work Products:', updatedActivity.trigger?.workProducts);

          // Explizite Typprüfung für trigger.workProducts
          const workProducts = updatedActivity.trigger?.workProducts || [];
          if (workProducts.length === 1) {
            workProducts[0].isWorkloadDetermining = true;
          }
          updatedActivity.trigger = {
            ...updatedActivity.trigger,
            workProducts,
            andOr: updatedActivity.trigger?.andOr || 'AND',
            timeTrigger: updatedActivity.trigger?.timeTrigger || { unit: 'sec', value: 0, repetition: '' },
            determiningFactorId: updatedActivity.trigger?.determiningFactorId || null,
          };

          setActivity(updatedActivity);

          if (updatedActivity.result) {
            const currentWorkProduct = allWorkProductsResponse.find((wp: WorkProduct) => wp._id === updatedActivity.result);
            if (currentWorkProduct && Array.isArray(availableWorkProductsResponse) && !availableWorkProductsResponse.some((wp: WorkProduct) => wp._id === currentWorkProduct._id)) {
              setWorkProducts(prev => [...prev, currentWorkProduct]);
            }
          }
        }
        setLoading(false);
      } catch (error: any) {
        console.error('Fehler beim Laden der Daten:', error);
        setError(error.message);
        setLoading(false);
      }
    };

    fetchData();
  }, [activityId, defaultProcess]);

  return { roles, workProducts, allWorkProducts, processes, activity, loading, error };
};

export default useFetchActivityData;