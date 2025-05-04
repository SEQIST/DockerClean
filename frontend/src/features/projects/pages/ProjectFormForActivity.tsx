import React, { useState, useEffect } from 'react';
import { Editor } from '@tinymce/tinymce-react';
import { fetchAllActivities }  from '../../processes/services/processService';
import { Activity as ProcessActivity } from '../../processes/services/processService';

interface Activity extends ProcessActivity {
  description?: string;
  executionMode?: string;
  estimatedTime?: number;
  timeUnit?: string;
  timeFactor?: number;
  duration?: number;
  effort?: number;
}

interface ActivityEditProps {
  activityId: string;
  onClose: () => void;
  onSave: (activity: Activity) => Promise<void>;
  activities: Activity[];
  defaultProcess: string;
}

const ActivityEdit: React.FC<ActivityEditProps> = ({ activityId, onClose, onSave, activities, defaultProcess }) => {
  const [activity, setActivity] = useState<Activity | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [abbreviation, setAbbreviation] = useState('');
  const [executionMode, setExecutionMode] = useState('sequential');
  const [estimatedTime, setEstimatedTime] = useState<number | ''>('');
  const [timeUnit, setTimeUnit] = useState('hours');
  const [timeFactor, setTimeFactor] = useState<number | ''>('');
  const [duration, setDuration] = useState<number | ''>('');
  const [effort, setEffort] = useState<number | ''>('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchActivity = async () => {
      try {
        const allActivities = await fetchAllActivities();
        const foundActivity = allActivities.find((act: Activity) => act._id === activityId);
        if (foundActivity) {
          setActivity(foundActivity);
          setName(foundActivity.name || '');
          setDescription(foundActivity.description || '');
          setAbbreviation(foundActivity.abbreviation || '');
          setExecutionMode(foundActivity.executionMode || 'sequential');
          setEstimatedTime(foundActivity.estimatedTime || '');
          setTimeUnit(foundActivity.timeUnit || 'hours');
          setTimeFactor(foundActivity.timeFactor || '');
          setDuration(foundActivity.duration || '');
          setEffort(foundActivity.effort || '');
        } else {
          setError('Aktivität nicht gefunden');
        }
        setLoading(false);
      } catch (err) {
        setError((err as Error).message);
        setLoading(false);
      }
    };
    fetchActivity();
  }, [activityId]);

  const handleSave = async () => {
    if (!activity) return;

    try {
      const updatedActivity: Activity = {
        ...activity,
        name,
        description,
        abbreviation,
        executionMode,
        estimatedTime: estimatedTime === '' ? undefined : Number(estimatedTime),
        timeUnit,
        timeFactor: timeFactor === '' ? undefined : Number(timeFactor),
        duration: duration === '' ? undefined : Number(duration),
        effort: effort === '' ? undefined : Number(effort),
      };
      await onSave(updatedActivity);
      onClose();
    } catch (err) {
      setError((err as Error).message);
    }
  };

  if (loading) return <div className="text-gray-500 dark:text-gray-400 p-4">Lade...</div>;
  if (error) return <div className="text-red-500 dark:text-red-400 p-4">Fehler: {error}</div>;
  if (!activity) return <div className="text-gray-700 dark:text-gray-300 p-4">Aktivität nicht gefunden</div>;

  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold text-blue-600 dark:text-blue-400 mb-4">Aktivität bearbeiten</h2>
      {error && (
        <div className="text-red-500 dark:text-red-400 mb-4">
          {error}
        </div>
      )}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 text-sm text-gray-800 dark:text-white bg-transparent border border-gray-300 dark:border-gray-700 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-800"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Abkürzung</label>
          <input
            type="text"
            value={abbreviation}
            onChange={(e) => setAbbreviation(e.target.value)}
            className="w-full px-3 py-2 text-sm text-gray-800 dark:text-white bg-transparent border border-gray-300 dark:border-gray-700 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-800"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Beschreibung</label>
          <Editor
            apiKey={import.meta.env.VITE_TINYMCE_API_KEY}
            value={description}
            onEditorChange={(content) => setDescription(content)}
            init={{
              height: 200,
              menubar: false,
              plugins: 'lists link image code',
              toolbar: 'undo redo | formatselect | bold italic | alignleft aligncenter alignright alignjustify | bullist numlist | link image | code',
              content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:14px }',
            }}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Ausführungsmodus</label>
          <select
            value={executionMode}
            onChange={(e) => setExecutionMode(e.target.value)}
            className="w-full px-3 py-2 text-sm text-gray-800 dark:text-white bg-transparent border border-gray-300 dark:border-gray-700 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-800"
          >
            <option value="sequential">Sequenziell</option>
            <option value="parallel">Parallel</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Geschätzte Zeit</label>
          <input
            type="number"
            value={estimatedTime}
            onChange={(e) => setEstimatedTime(e.target.value === '' ? '' : Number(e.target.value))}
            className="w-full px-3 py-2 text-sm text-gray-800 dark:text-white bg-transparent border border-gray-300 dark:border-gray-700 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-800"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Zeiteinheit</label>
          <select
            value={timeUnit}
            onChange={(e) => setTimeUnit(e.target.value)}
            className="w-full px-3 py-2 text-sm text-gray-800 dark:text-white bg-transparent border border-gray-300 dark:border-gray-700 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-800"
          >
            <option value="minutes">Minuten</option>
            <option value="hours">Stunden</option>
            <option value="days">Tage</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Zeitfaktor</label>
          <input
            type="number"
            value={timeFactor}
            onChange={(e) => setTimeFactor(e.target.value === '' ? '' : Number(e.target.value))}
            className="w-full px-3 py-2 text-sm text-gray-800 dark:text-white bg-transparent border border-gray-300 dark:border-gray-700 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-800"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Dauer</label>
          <input
            type="number"
            value={duration}
            onChange={(e) => setDuration(e.target.value === '' ? '' : Number(e.target.value))}
            className="w-full px-3 py-2 text-sm text-gray-800 dark:text-white bg-transparent border border-gray-300 dark:border-gray-700 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-800"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Aufwand</label>
          <input
            type="number"
            value={effort}
            onChange={(e) => setEffort(e.target.value === '' ? '' : Number(e.target.value))}
            className="w-full px-3 py-2 text-sm text-gray-800 dark:text-white bg-transparent border border-gray-300 dark:border-gray-700 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-800"
          />
        </div>
        <div className="flex gap-3 justify-end mt-4">
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
            onClick={onClose}
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
  );
};

export default ActivityEdit;