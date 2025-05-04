import React from 'react';

const ImportHintTooltip: React.FC = () => (
  <div className="relative inline-block">
    <button className="text-blue-600 dark:text-blue-400">
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-9-4a1 1 0 10-2 0 1 1 0 002 0zm1 4a1 1 0 00-1-1H8a1 1 0 00-1 1v3a1 1 0 002 0v-2h1a1 1 0 001-1z" clipRule="evenodd" />
      </svg>
    </button>
    <div className="absolute z-10 hidden group-hover:block w-64 bg-white dark:bg-gray-800 shadow-lg p-2 rounded-lg">
      <p className="text-sm text-gray-700 dark:text-gray-300">
        <strong>Excel (.xlsx):</strong> Spalte A: Name, Spalte B: Nummer, Spalte C: Use Mode, Spalte D: Kosten
      </p>
      <p className="text-sm text-gray-700 dark:text-gray-300">
        <strong>Word (.docx):</strong> Jede Zeile im Format "[Name], [Nummer], [Use Mode], [Kosten]"
      </p>
    </div>
  </div>
);

export default ImportHintTooltip;