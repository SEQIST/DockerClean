import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity as ActivityType } from '../../processes/services/processService';

interface UseSaveActivityResult {
  isSaving: boolean;
  error: string | null;
  handleSave: (activity: ActivityType, activityId?: string) => Promise<void>;
  setError: React.Dispatch<React.SetStateAction<string | null>>;
}

const useSaveActivity = (onSave: (activity: ActivityType) => void): UseSaveActivityResult => {
  const navigate = useNavigate();
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  let isSavingGlobally = false;

  const checkNameAndAbbreviationExists = async (name: string, abbreviation: string, activityId?: string): Promise<boolean> => {
    try {
      const trimmedName = name.trim();
      const trimmedAbbreviation = abbreviation.trim();

      const queryParams = new URLSearchParams();
      queryParams.append('name', trimmedName);
      queryParams.append('abbreviation', trimmedAbbreviation);
      const response = await fetch(`http://localhost:5001/api/activities?${queryParams.toString()}`);
      if (!response.ok) throw new Error('Fehler beim Überprüfen der Eindeutigkeit');
      const data: ActivityType[] = await response.json();
      return data.length > 0 && (!activityId || !data.some(act => act._id === activityId));
    } catch (error: any) {
      console.error('Fehler beim Überprüfen der Eindeutigkeit:', error);
      return false;
    }
  };

  const handleSave = async (activity: ActivityType, activityId?: string) => {
    if (isSavingGlobally) return;
    isSavingGlobally = true;
    setIsSaving(true);

    try {
      if (!activity.name) throw new Error('Name ist erforderlich');
      if (!activity.description) throw new Error('Beschreibung ist erforderlich');

      const nameAndAbbreviationExists = await checkNameAndAbbreviationExists(activity.name, activity.abbreviation || '', activityId);
      if (nameAndAbbreviationExists) {
        throw new Error('Eine Aktivität mit diesem Namen und dieser Abkürzung existiert bereits.');
      }

      const validWorkProducts = activity.trigger?.workProducts?.filter(wp => wp._id && wp._id !== '') || [];
      const method = activityId ? 'PUT' : 'POST';
      const url = activityId ? `http://localhost:5001/api/activities/${activityId}` : 'http://localhost:5001/api/activities';

      const updatedActivity = {
        ...activity,
        versionMinor: Number(activity.versionMinor || 0) + 1,
      };

      const cleanedActivity: ActivityType = {
        ...updatedActivity,
        name: updatedActivity.name.trim(),
        description: updatedActivity.description || '',
        abbreviation: updatedActivity.abbreviation ? updatedActivity.abbreviation.trim() : undefined,
        process: typeof updatedActivity.process === 'string' ? updatedActivity.process : updatedActivity.process?._id || '',
        executedBy: updatedActivity.executedBy || undefined,
        result: updatedActivity.result || undefined,
        multiplicator: Number(updatedActivity.multiplicator),
        compressor: updatedActivity.compressor,
        executionMode: updatedActivity.executionMode,
        knownTime: Number(updatedActivity.knownTime),
        estimatedTime: Number(updatedActivity.estimatedTime),
        timeUnit: updatedActivity.timeUnit,
        versionMajor: Number(updatedActivity.versionMajor),
        versionMinor: updatedActivity.versionMinor,
        icon: updatedActivity.icon,
        trigger: {
          workProducts: validWorkProducts.map(wp => ({
            _id: wp._id,
            completionPercentage: Number(wp.completionPercentage) || 100,
            isWorkloadDetermining: wp.isWorkloadDetermining || false,
          })),
          andOr: updatedActivity.trigger?.andOr || 'AND',
          timeTrigger: {
            unit: updatedActivity.trigger?.timeTrigger?.unit || 'sec',
            value: Number(updatedActivity.trigger?.timeTrigger?.value) || 0,
            repetition: updatedActivity.trigger?.timeTrigger?.repetition || '',
          },
          determiningFactorId: updatedActivity.trigger?.determiningFactorId || null,
        },
      };

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cleanedActivity),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`HTTP-Fehler! Status: ${response.status} - ${errorData.error || 'Unbekannter Fehler'}`);
      }

      const updatedActivityResponse: ActivityType = await response.json();
      onSave(updatedActivityResponse);
      navigate('/quality/activities');
    } catch (error: any) {
      console.error('Fehler beim Speichern der Aktivität:', error);
      setError(error.message);
    } finally {
      setIsSaving(false);
      isSavingGlobally = false;
    }
  };

  return { isSaving, error, handleSave, setError };
};

export default useSaveActivity;