// src/features/activities/components/TimeSection.tsx
import React from 'react';
import { Activity } from '../../processes/services/processService'; // Verwende Typ aus processService.ts

interface TimeSectionProps {
  activity: Activity;
  setActivity: (activity: Activity) => void;
}

const TimeSection: React.FC<TimeSectionProps> = ({ activity, setActivity }) => {
  const handleTimeChange = (field: 'knownTime' | 'estimatedTime', value: number) => {
    setActivity({ ...activity, [field]: value });
  };

  const handleTimeUnitChange = (value: string) => {
    setActivity({ ...activity, timeUnit: value });
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Bekannte Zeit</label>
        <input
          type="number"
          value={activity.knownTime || 0}
          onChange={(e) => handleTimeChange('knownTime', Number(e.target.value))}
          className="w-full px-3 py-2 text-sm text-gray-800 dark:text-white bg-transparent border border-gray-300 dark:border-gray-700 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-800"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Geschätzte Zeit</label>
        <input
          type="number"
          value={activity.estimatedTime || 0}
          onChange={(e) => handleTimeChange('estimatedTime', Number(e.target.value))}
          className="w-full px-3 py-2 text-sm text-gray-800 dark:text-white bg-transparent border border-gray-300 dark:border-gray-700 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-800"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Zeiteinheit</label>
        <select
          value={activity.timeUnit || 'minutes'}
          onChange={(e) => handleTimeUnitChange(e.target.value)}
          className="w-full px-3 py-2 text-sm text-gray-800 dark:text-white bg-transparent border border-gray-300 dark:border-gray-700 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-800"
        >
          <option value="minutes">Minuten</option>
          <option value="hours">Stunden</option>
          <option value="days">Tage</option>
        </select>
      </div>
    </div>
  );
};

export default TimeSection;