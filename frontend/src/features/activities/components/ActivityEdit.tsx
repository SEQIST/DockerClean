// src/features/activities/components/ActivityEdit.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ActivityFormMain from './ActivityFormMain';
import { fetchAllActivities } from '../../processes/services/processService';
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
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchActivity = async () => {
      try {
        const allActivities = await fetchAllActivities();
        const foundActivity = allActivities.find((act: Activity) => act._id === activityId);
        if (!foundActivity) {
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

  if (loading) return <div className="text-gray-500 dark:text-gray-400 p-4">Lade...</div>;
  if (error) return <div className="text-red-500 dark:text-red-400 p-4">Fehler: {error}</div>;

  return (
    <div className="p-4">
      <ActivityFormMain
        activityId={activityId}
        defaultProcess={defaultProcess}
        onClose={onClose} // Übergib onClose an ActivityFormMain
      />
    </div>
  );
};

export default ActivityEdit;