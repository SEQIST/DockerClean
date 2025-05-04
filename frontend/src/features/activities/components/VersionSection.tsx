// src/features/activities/components/VersionSection.tsx
import React from 'react';
import { Activity } from '../../processes/services/processService'; // Verwende Typ aus processService.ts

interface VersionSectionProps {
  activity: Activity;
  setActivity: (activity: Activity) => void;
}

const VersionSection: React.FC<VersionSectionProps> = ({ activity, setActivity }) => {
  const handleVersionChange = (field: 'versionMajor' | 'versionMinor', value: number) => {
    setActivity({ ...activity, [field]: value });
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Version Major</label>
        <input
          type="number"
          value={activity.versionMajor || 1}
          onChange={(e) => handleVersionChange('versionMajor', Number(e.target.value))}
          className="w-full px-3 py-2 text-sm text-gray-800 dark:text-white bg-transparent border border-gray-300 dark:border-gray-700 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-800"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Version Minor</label>
        <input
          type="number"
          value={activity.versionMinor || 0}
          onChange={(e) => handleVersionChange('versionMinor', Number(e.target.value))}
          className="w-full px-3 py-2 text-sm text-gray-800 dark:text-white bg-transparent border border-gray-300 dark:border-gray-700 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-800"
        />
      </div>
    </div>
  );
};

export default VersionSection;