import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import ProcessEditTab from '../components/ProcessEditTab';
import { fetchProcessById, fetchActivities, fetchRoles, fetchProcesses, Process, Activity, Role } from '../services/processService';

const ProcessEditPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [process, setProcess] = useState<Process | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [allProcesses, setAllProcesses] = useState<Process[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!id) throw new Error('Prozess-ID fehlt');
        const [processData, activitiesData, rolesData, processesData] = await Promise.all([
          fetchProcessById(id),
          fetchActivities(id),
          fetchRoles(),
          fetchProcesses(),
        ]);
        setProcess(processData);
        setActivities(activitiesData);
        setRoles(rolesData);
        setAllProcesses(processesData.filter((p) => p._id !== id));
        setLoading(false);
      } catch (error) {
        console.error('Fehler beim Laden der Daten:', error);
        setError((error as Error).message);
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }
  if (error) return <div className="text-red-500 dark:text-red-400 p-4">Fehler: {error}</div>;
  if (!process || !id) return <div className="text-gray-700 dark:text-gray-300 p-4">Prozess nicht gefunden</div>;

  return (
    <div className="min-h-screen flex justify-center pt-8 pb-4 px-4">
      <div className="w-full max-w-[1800px] min-w-[1200px]">
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl p-6">
          <h2 className="text-2xl font-bold mb-4 text-blue-600 dark:text-blue-400">
            Prozess bearbeiten: {process.name}
          </h2>
          <ProcessEditTab
            process={process}
            setProcess={setProcess}
            activities={activities}
            setActivities={setActivities}
            roles={roles}
            error={error}
            setError={setError}
            processId={id}
            allProcesses={allProcesses}
          />
        </div>
      </div>
    </div>
  );
};

export default ProcessEditPage;