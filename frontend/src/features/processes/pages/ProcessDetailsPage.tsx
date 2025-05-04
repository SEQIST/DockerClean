import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ProcessFlow from '../components/ProcessFlow';
import BPMNFlow from '../components/BPMNFlow';
import { fetchProcessById, fetchActivities, fetchRoles, Process, Activity, Role } from '../services/processService';

const ProcessDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [process, setProcess] = useState<Process | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'process-flow' | 'bpmn-view'>('process-flow');

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!id) throw new Error('Prozess-ID fehlt');
        const [processData, activitiesData, rolesData] = await Promise.all([
          fetchProcessById(id),
          fetchActivities(id),
          fetchRoles(),
        ]);
        setProcess(processData);
        setActivities(activitiesData.map((activity: Activity) => ({
          ...activity,
          executedBy: typeof activity.executedBy === 'string' ? activity.executedBy : (activity.executedBy as Role)?._id || '',
        })));
        setRoles(rolesData);
        setLoading(false);
      } catch (error) {
        console.error('Fehler beim Laden der Daten:', error);
        setError((error as Error).message);
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleTabChange = (value: 'process-flow' | 'bpmn-view') => {
    setActiveTab(value);
  };

  const handleNodeClick = (activity: Activity) => {
    navigate(`/quality/activities/${activity._id}`);
  };

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
            Prozessdetails: {process.name}
          </h2>
          <div className="mb-4">
            <div className="flex gap-2">
              <div className="flex-1">
                <strong className="text-gray-700 dark:text-gray-300">Name:</strong> {process.name}
              </div>
              <div className="flex-1">
                <strong className="text-gray-700 dark:text-gray-300">Abkürzung:</strong> {process.abbreviation || 'Keine'}
              </div>
            </div>
            <div className="flex gap-2 mt-2">
              <div className="flex-1">
                <strong className="text-gray-700 dark:text-gray-300">Eigentümer:</strong>{' '}
                {typeof process.owner === 'string' ? 'Unbekannt' : (process.owner as Role)?.name || 'Kein Eigentümer'}
              </div>
              <div className="flex-1">
                <strong className="text-gray-700 dark:text-gray-300">Ist Unterprozess von:</strong>{' '}
                {typeof process.isChildOf === 'string' ? process.isChildOf : (process.isChildOf as Process)?.name || 'Kein Unterprozess'}
              </div>
            </div>
            <div className="mt-2">
              <strong className="text-gray-700 dark:text-gray-300">Beschreibung:</strong>
              <div className="text-gray-600 dark:text-gray-400 mt-1" dangerouslySetInnerHTML={{ __html: process.description || 'Keine Beschreibung' }} />
            </div>
          </div>
          <div className="flex border-b border-gray-200 dark:border-gray-800 mb-2">
            <button
              onClick={() => handleTabChange('process-flow')}
              className={`px-4 py-2 text-sm font-medium ${activeTab === 'process-flow' ? 'border-b-2 border-blue-600 text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400'}`}
            >
              Prozessfluss
            </button>
            <button
              onClick={() => handleTabChange('bpmn-view')}
              className={`px-4 py-2 text-sm font-medium ${activeTab === 'bpmn-view' ? 'border-b-2 border-blue-600 text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400'}`}
            >
              BPMN-Ansicht
            </button>
          </div>
          <div className="h-[calc(100vh-300px)]">
            {activeTab === 'process-flow' && (
              <ProcessFlow
                activities={activities}
                style={{ width: '100%', height: '100%' }}
                onNodeClick={handleNodeClick}
                processId={id}
              />
            )}
            {activeTab === 'bpmn-view' && (
              <BPMNFlow
                activities={activities}
                roles={roles}
                style={{ width: '100%', height: '100%' }}
                processId={id}
              />
            )}
          </div>
          <div className="mt-4">
            <button
              onClick={() => navigate('/quality/processes')}
              className="px-4 py-2 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              Zurück zur Prozessliste
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProcessDetailsPage;