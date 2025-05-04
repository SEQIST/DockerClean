import React, { useEffect, useState } from 'react';
import ActivityFormMain from '../components/ActivityFormMain';
import { Activity, ActivityFormMainProps } from '../types';

interface ActivityEditWrapperProps {
  onSave: (updatedActivity: Activity) => void;
}

const ActivityEditWrapper: React.FC<ActivityEditWrapperProps> = ({ onSave }) => {
  const [activities, setActivities] = useState<Activity[]>([]);

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const response = await fetch('http://localhost:5001/api/activities');
        if (!response.ok) throw new Error('Fehler beim Abrufen der Aktivitäten');
        const data: Activity[] = await response.json();
        setActivities(data);
      } catch (error: any) {
        console.error('Fehler beim Abrufen der Aktivitäten:', error);
      }
    };

    fetchActivities();
  }, []);

  const formProps: ActivityFormMainProps = {
    onSave,
    activities,
  };

  return <ActivityFormMain {...formProps} />;
};

export default ActivityEditWrapper;