import React, { useState } from 'react';
import FileUpload from '../components/FileUpload';
import ImportPreview from '../components/ImportPreview';
import { parseCSV, parseWord } from '../utils/importUtils';
import { uploadPDF } from '../services/dataImportService';
import { ImportedData } from '../types/dataImportTypes';

const DataImportPage: React.FC = () => {
  const [importedData, setImportedData] = useState<ImportedData[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleFileUpload = async (file: File) => {
    setError(null);
    const fileType = file.type;

    try {
      if (fileType === 'text/csv') {
        parseCSV(file, (data) => {
          const cleanedData = data.map(item => {
            const { _id, ...rest } = item;
            return rest;
          });
          setImportedData(cleanedData);
        }, (err) => {
          setError(`Fehler beim Parsen der CSV-Datei: ${err}`);
        });
      } else if (fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        parseWord(file, (data) => {
          const cleanedData = data.map(item => {
            const { _id, ...rest } = item;
            return rest;
          });
          setImportedData(cleanedData);
        }, (err) => {
          setError(`Fehler beim Parsen der Word-Datei: ${err}`);
        });
      } else if (fileType === 'application/pdf') {
        const data = await uploadPDF(file);
        const cleanedData = data.map((item: any) => {
          const { _id, ...rest } = item;
          return rest;
        });
        setImportedData(cleanedData);
      } else {
        setError('Nicht unterstütztes Dateiformat. Bitte lade eine CSV-, Word- oder PDF-Datei hoch.');
      }
    } catch (err) {
      setError('Fehler beim Verarbeiten der Datei');
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-4">Datenimport</h1>
      <FileUpload onFileUpload={handleFileUpload} />
      {error && <p className="text-red-500 mt-2">{error}</p>}
      {importedData.length > 0 && <ImportPreview data={importedData} />}
    </div>
  );
};

export default DataImportPage;