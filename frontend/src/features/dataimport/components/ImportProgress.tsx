import React from 'react';

interface ImportProgressProps {
  progress: number;
}

const ImportProgress: React.FC<ImportProgressProps> = ({ progress }) => {
  return (
    <div className="mt-4">
      <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-2">Importfortschritt</h2>
      <div className="w-full bg-gray-200 rounded-full h-4 dark:bg-gray-700">
        <div
          className="bg-blue-600 h-4 rounded-full"
          style={{ width: `${progress}%` }}
        ></div>
      </div>
      <p className="text-gray-600 dark:text-gray-400 mt-1">{progress}% abgeschlossen</p>
    </div>
  );
};

export default ImportProgress;