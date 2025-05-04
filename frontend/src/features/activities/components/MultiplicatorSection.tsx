// src/features/activities/components/MultiplicatorSection.tsx
import React from 'react';
import { Activity } from '../../processes/services/processService'; // Verwende Typ aus processService.ts

interface MultiplicatorSectionProps {
  activity: Activity;
  setActivity: (activity: Activity) => void;
}

const MultiplicatorSection: React.FC<MultiplicatorSectionProps> = ({ activity, setActivity }) => {
  const handleCompressorChange = (value: string) => {
    setActivity({ ...activity, compressor: value });
  };

  const handleMultiplicatorChange = (value: number) => {
    setActivity({ ...activity, multiplicator: value });
  };

  return (
    <div className="space-y-2">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Kompressor</label>
        <select
          value={activity.compressor}
          onChange={(e) => handleCompressorChange(e.target.value)}
          className="w-full px-3 py-2 text-sm text-gray-800 dark:text-white bg-transparent border border-gray-300 dark:border-gray-700 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-800"
        >
          <option value="multiply">Multiplizieren</option>
          <option value="add">Addieren</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Multiplikator</label>
        <input
          type="number"
          value={activity.multiplicator || 1}
          onChange={(e) => handleMultiplicatorChange(Number(e.target.value))}
          className="w-full px-3 py-2 text-sm text-gray-800 dark:text-white bg-transparent border border-gray-300 dark:border-gray-700 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-800"
        />
      </div>
    </div>
  );
};

export default MultiplicatorSection;