import React, { useState } from 'react';
import { addProcess, addActivity, Activity, Process } from '../services/processService';

interface ConvertToSubprocessModalProps {
  activity: Activity;
  parentProcessId: string;
  onClose: () => void;
  onConvert: (newProcess: Process) => void;
}

const ConvertToSubprocessModal: React.FC<ConvertToSubprocessModalProps> = ({ activity, parentProcessId, onClose, onConvert }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConvert = async () => {
    setLoading(true);
    setError(null);
    try {
      // Erstelle den neuen Unterprozess
      const newProcess = await addProcess({
        name: `UP: ${activity.name}`,
        abbreviation: `UP_${activity.abbreviation || 'ACT'}`,
        description: `Unterprozess für Aktivität: ${activity.name}`,
        owner: typeof activity.executedBy === 'string' ? activity.executedBy : activity.executedBy?._id,
        isChildOf: parentProcessId,
        isChildOfImmutable: true, // Neues Feld, um "Ist Unterprozess von" unveränderbar zu machen
      });

      // Erstelle die Start-Aktivität (unveränderbar)
      await addActivity({
        name: `Start UP: ${activity.name}`,
        process: newProcess._id,
        trigger: activity.trigger,
        executedBy: typeof activity.executedBy === 'string' ? activity.executedBy : activity.executedBy?._id,
        description: 'Start-Aktivität des Unterprozesses (unveränderbar)',
        executionMode: 'sequential',
        isImmutable: true, // Benutzerdefiniertes Flag für Unveränderbarkeit
        isDeletable: false, // Benutzerdefiniertes Flag für Unlöschbarkeit
      });

      // Erstelle die Ende-Aktivität (Ergebnis unveränderbar)
      await addActivity({
        name: `Ende UP: ${activity.name}`,
        process: newProcess._id,
        result: activity.result,
        executedBy: typeof activity.executedBy === 'string' ? activity.executedBy : activity.executedBy?._id,
        description: 'Ende-Aktivität des Unterprozesses (Ergebnis unveränderbar)',
        executionMode: 'sequential',
        isResultImmutable: true, // Benutzerdefiniertes Flag für unveränderbares Ergebnis
        isDeletable: false, // Benutzerdefiniertes Flag für Unlöschbarkeit
      });

      onConvert(newProcess);
      onClose();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl w-[500px] p-6">
        <h2 className="text-xl font-semibold text-blue-600 dark:text-blue-400 mb-4">In Unterprozess umwandeln</h2>
        {error && (
          <div className="text-red-500 dark:text-red-400 mb-4">
            {error}
          </div>
        )}
        <p className="text-gray-700 dark:text-gray-300 mb-4">
          Möchten Sie die Aktivität <strong>{activity.name}</strong> in einen Unterprozess umwandeln? Dies erstellt einen neuen Unterprozess mit zwei Aktivitäten: "Start UP: {activity.name}" und "Ende UP: {activity.name}".
        </p>
        <div className="flex gap-3 justify-end">
          <button
            onClick={handleConvert}
            disabled={loading}
            className={`flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {loading ? 'Wird umgewandelt...' : 'Umwandeln'}
          </button>
          <button
            onClick={onClose}
            disabled={loading}
            className={`flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-500 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            Abbrechen
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConvertToSubprocessModal;