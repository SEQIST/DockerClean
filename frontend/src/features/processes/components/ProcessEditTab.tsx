import React, { useState, useEffect } from 'react';
import { Editor } from '@tinymce/tinymce-react';
import ProcessFlow from './ProcessFlow';
import BPMNFlow from './BPMNFlow';
import ConvertToSubprocessModal from './ConvertToSubprocessModal';
import { updateProcess, deleteActivity, Process, Activity, Role } from '../services/processService';
import { useNavigate } from 'react-router-dom';

interface ProcessEditTabProps {
  process: Process;
  setProcess: React.Dispatch<React.SetStateAction<Process | null>>;
  activities: Activity[];
  setActivities: React.Dispatch<React.SetStateAction<Activity[]>>;
  roles: Role[];
  error: string | null;
  setError: React.Dispatch<React.SetStateAction<string | null>>;
  processId: string;
  allProcesses: Process[];
}

const ProcessEditTab: React.FC<ProcessEditTabProps> = ({ process, setProcess, activities, setActivities, roles, error, setError, processId, allProcesses }) => {
  const navigate = useNavigate();
  const [description, setDescription] = useState(process?.description || '');
  const [tempName, setTempName] = useState(process?.name || '');
  const [tempAbbreviation, setTempAbbreviation] = useState(process?.abbreviation || '');
  const [tempDescription, setTempDescription] = useState(process?.description || '');
  const [tempOwner, setTempOwner] = useState<Role | null>(null);
  const [tempIsChildOf, setTempIsChildOf] = useState<string | undefined>(undefined);
  const [filteredActivities, setFilteredActivities] = useState<Activity[]>([]);
  const [convertActivity, setConvertActivity] = useState<Activity | null>(null);
  const [editProcessModalOpen, setEditProcessModalOpen] = useState(false);
  const [activitiesModalOpen, setActivitiesModalOpen] = useState(false);
  const [convertModalOpen, setConvertModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [activeTab, setActiveTab] = useState<'process-flow' | 'bpmn-view'>('process-flow');

  useEffect(() => {
    if (process) {
      setDescription(process.description || '');
      setTempName(process.name || '');
      setTempAbbreviation(process.abbreviation || '');
      setTempDescription(process.description || '');
      const owner = typeof process.owner === 'string' ? roles.find((role) => role._id === process.owner) || null : process.owner || null;
      setTempOwner(owner);
      const isChildOf = process.isChildOf ? (typeof process.isChildOf === 'string' ? process.isChildOf : process.isChildOf._id) : undefined;
      setTempIsChildOf(isChildOf);
    }
  }, [process, roles]);

  useEffect(() => {
    let filtered = [...activities];
    if (searchQuery) {
      filtered = filtered.filter((activity) =>
        activity.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    filtered.sort((a, b) => {
      if (sortOrder === 'asc') {
        return a.name.localeCompare(b.name);
      } else {
        return b.name.localeCompare(a.name);
      }
    });
    setFilteredActivities(filtered);
  }, [activities, searchQuery, sortOrder]);

  const handleSave = async () => {
    try {
      const updatedProcess = await updateProcess(process._id, {
        name: tempName,
        abbreviation: tempAbbreviation,
        description: tempDescription,
        owner: tempOwner ? tempOwner._id : undefined,
        isChildOf: tempIsChildOf || undefined,
      });
      setProcess(updatedProcess);
      setDescription(tempDescription);
      setEditProcessModalOpen(false);
      alert('Prozess erfolgreich aktualisiert');
    } catch (error) {
      console.error('Fehler:', error);
      setError('Fehler beim Speichern: ' + (error as Error).message);
    }
  };

  const handleEditActivityModalOpen = (activity: Activity) => {
    navigate(`/quality/activities/edit/${activity._id}`);
  };

  const handleConvertActivityModalOpen = (activity: Activity) => {
    setConvertActivity(activity);
    setConvertModalOpen(true);
  };

  const handleConvertActivityModalClose = () => {
    setConvertActivity(null);
    setConvertModalOpen(false);
  };

  const handleAddActivityModalOpen = () => {
    navigate('/quality/activities/add');
  };

  const handleActivitiesModalOpen = () => {
    setActivitiesModalOpen(true);
  };

  const handleActivitiesModalClose = () => {
    setActivitiesModalOpen(false);
  };

  const handleDeleteActivity = async (activityId: string) => {
    try {
      await deleteActivity(activityId);
      setActivities(activities.filter((activity) => activity._id !== activityId));
      setError(null);
    } catch (error) {
      console.error('Error deleting activity:', error);
      setError('Fehler beim Löschen der Aktivität: ' + (error as Error).message);
    }
  };

  const handleConvertActivity = (newProcess: Process) => {
    alert(`Unterprozess "${newProcess.name}" erfolgreich erstellt.`);
  };

  const handleEditProcessModalOpen = () => {
    setEditProcessModalOpen(true);
  };

  const handleEditProcessModalClose = () => {
    setEditProcessModalOpen(false);
    setTempName(process.name || '');
    setTempAbbreviation(process.abbreviation || '');
    setTempDescription(description);
    const owner = typeof process.owner === 'string' ? roles.find((role) => role._id === process.owner) || null : process.owner || null;
    setTempOwner(owner);
    const isChildOf = process.isChildOf ? (typeof process.isChildOf === 'string' ? process.isChildOf : process.isChildOf._id) : undefined;
    setTempIsChildOf(isChildOf);
  };

  const handleNodeClick = (activity: Activity) => {
    navigate(`/quality/activities/edit/${activity._id}`);
  };

  const handleTabChange = (value: 'process-flow' | 'bpmn-view') => {
    setActiveTab(value);
  };

  const renderActivity = (activity: Activity) => (
    <div key={activity._id} className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-800">
      <div>
        <div className="font-medium text-gray-800 dark:text-gray-200">{activity.name}</div>
        <div className="text-sm text-gray-600 dark:text-gray-400">
          Abk.: {activity.abbreviation || 'Keine'}, Eigentümer: {typeof activity.executedBy === 'string' ? 'Kein Eigentümer' : (activity.executedBy as Role)?.name || 'Kein Eigentümer'}
        </div>
      </div>
      <div className="flex gap-2">
        <button
          onClick={() => handleEditActivityModalOpen(activity)}
          className="text-blue-600 hover:text-blue-800"
        >
          ✏️
        </button>
        <button
          onClick={() => handleConvertActivityModalOpen(activity)}
          className="text-purple-600 hover:text-purple-800"
        >
          🔄
        </button>
        <button
          onClick={() => handleDeleteActivity(activity._id)}
          className="text-red-600 hover:text-red-800"
        >
          🗑️
        </button>
      </div>
    </div>
  );

  return (
    <div className="w-full flex flex-col">
      {/* Oberer Bereich: Formular */}
      <div className="p-4">
        {error && (
          <div className="text-red-500 dark:text-red-400 mb-2">
            {error}
          </div>
        )}
        <div className="mb-2 flex gap-2">
          <button
            onClick={handleEditProcessModalOpen}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Prozess bearbeiten
          </button>
          <button
            onClick={handleActivitiesModalOpen}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Aktivitäten bearbeiten
          </button>
          <button
            onClick={handleAddActivityModalOpen}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Aktivität hinzufügen
          </button>
        </div>
        <div className="text-gray-600 dark:text-gray-400 text-lg mb-1">Prozessansichten</div>
      </div>

      {/* Tabs und React Flow */}
      <div className="flex-1 flex flex-col">
        <div className="flex border-b border-gray-200 dark:border-gray-800 mb-2 px-4">
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
        <div className="flex-1 overflow-auto">
          {activeTab === 'process-flow' && (
            <div className="w-full h-[calc(100vh-250px)]">
              <ProcessFlow
                activities={activities}
                style={{ width: '100%', height: '100%' }}
                onNodeClick={handleNodeClick}
                processId={processId}
              />
            </div>
          )}
          {activeTab === 'bpmn-view' && (
            <div className="w-full h-[calc(100vh-250px)]">
              <BPMNFlow
                activities={activities}
                roles={roles}
                style={{ width: '100%', height: '100%' }}
                processId={processId}
              />
            </div>
          )}
        </div>
      </div>

      {convertModalOpen && convertActivity && (
        <ConvertToSubprocessModal
          activity={convertActivity}
          parentProcessId={process._id}
          onClose={handleConvertActivityModalClose}
          onConvert={handleConvertActivity}
        />
      )}

      {editProcessModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl w-[800px] max-h-[90vh] overflow-y-auto p-6">
            <h2 className="text-xl font-semibold text-blue-600 dark:text-blue-400 mb-4">Prozess bearbeiten</h2>
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name</label>
                  <input
                    type="text"
                    value={tempName}
                    onChange={(e) => setTempName(e.target.value)}
                    className="w-full px-3 py-2 text-sm text-gray-800 dark:text-white bg-transparent border border-gray-300 dark:border-gray-700 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-800"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Abkürzung</label>
                  <input
                    type="text"
                    value={tempAbbreviation}
                    onChange={(e) => setTempAbbreviation(e.target.value)}
                    className="w-full px-3 py-2 text-sm text-gray-800 dark:text-white bg-transparent border border-gray-300 dark:border-gray-700 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-800"
                  />
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Eigentümer</label>
                  <select
                    value={tempOwner ? tempOwner._id : ''}
                    onChange={(e) => {
                      const selected = roles.find((role) => role._id === e.target.value);
                      setTempOwner(selected || null);
                    }}
                    className="w-full px-3 py-2 text-sm text-gray-800 dark:text-white bg-transparent border border-gray-300 dark:border-gray-700 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-800"
                  >
                    <option value="">Wähle einen Eigentümer</option>
                    {roles.map((role) => (
                      <option key={role._id} value={role._id}>{role.name}</option>
                    ))}
                  </select>
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Ist Unterprozess von</label>
                  <select
                    value={tempIsChildOf || ''}
                    onChange={(e) => setTempIsChildOf(e.target.value || undefined)}
                    disabled={process.isChildOfImmutable}
                    className={`w-full px-3 py-2 text-sm text-gray-800 dark:text-white bg-transparent border border-gray-300 dark:border-gray-700 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-800 ${process.isChildOfImmutable ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <option value="">Kein Unterprozess</option>
                    {allProcesses.map((p) => (
                      <option key={p._id} value={p._id}>{p.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Beschreibung</label>
                <Editor
                  apiKey={import.meta.env.VITE_TINYMCE_API_KEY}
                  value={tempDescription}
                  onEditorChange={(content) => setTempDescription(content)}
                  init={{
                    height: 300,
                    menubar: false,
                    plugins: 'lists link image code',
                    toolbar: 'undo redo | formatselect | bold italic | alignleft aligncenter alignright alignjustify | bullist numlist | link image | code',
                    content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:14px }',
                  }}
                />
              </div>
              <div className="flex gap-3 justify-end mt-6">
                <button
                  onClick={async () => {
                    await handleSave();
                    handleEditProcessModalClose();
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  Speichern und schließen
                </button>
                <button
                  onClick={handleSave}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"></path>
                  </svg>
                  Speichern
                </button>
                <button
                  onClick={handleEditProcessModalClose}
                  className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-500"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                  Abbrechen
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {activitiesModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl w-[800px] max-h-[90vh] overflow-y-auto p-4">
            <h2 className="text-xl font-semibold text-blue-600 dark:text-blue-400 mb-2">Aktivitäten im Prozess</h2>
            <div className="mb-2 flex items-center gap-2">
              <input
                type="text"
                placeholder="Suche"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-[300px] px-3 py-2 text-sm text-gray-800 dark:text-white bg-transparent border border-gray-300 dark:border-gray-700 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-800"
              />
              <button
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                Sortieren ({sortOrder === 'asc' ? 'A-Z' : 'Z-A'})
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                </svg>
              </button>
              <button
                onClick={handleAddActivityModalOpen}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Aktivität hinzufügen
              </button>
            </div>
            <div className="max-h-[400px] overflow-y-auto">
              {filteredActivities.length > 0 ? (
                filteredActivities.map((activity) => renderActivity(activity))
              ) : (
                <div className="text-gray-700 dark:text-gray-300">Keine Aktivitäten gefunden</div>
              )}
            </div>
            <div className="flex justify-end mt-4">
              <button
                onClick={handleActivitiesModalClose}
                className="px-4 py-2 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                Schließen
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProcessEditTab;