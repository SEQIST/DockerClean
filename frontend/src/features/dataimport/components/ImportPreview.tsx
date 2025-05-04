import React from 'react';
import { ImportedData } from '../types/dataImportTypes';

interface ImportPreviewProps {
  data: ImportedData[];
}

const ImportPreview: React.FC<ImportPreviewProps> = ({ data }) => {
  return (
    <div className="mt-4">
      <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-2">Vorschau der importierten Daten</h2>
      <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg overflow-x-auto">
        <table className="min-w-full table-auto">
          <thead>
            <tr>
              {data.length > 0 &&
                Object.keys(data[0]).map((key) => (
                  <th key={key} className="px-4 py-2 text-left text-gray-800 dark:text-gray-200">
                    {key}
                  </th>
                ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, index) => (
              <tr key={index} className="border-t dark:border-gray-700">
                {Object.values(row).map((value, idx) => (
                  <td key={idx} className="px-4 py-2 text-gray-600 dark:text-gray-400">
                    {typeof value === 'string' ? value : JSON.stringify(value)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ImportPreview;