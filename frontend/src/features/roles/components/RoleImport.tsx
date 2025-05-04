import React from 'react';
import mammoth from 'mammoth';
import { Role } from '../types/Role';

interface RoleImportProps {
  importFile: File | null;
  setImportFile: (file: File | null) => void;
  setError: (error: string | null) => void;
  setRoles: (roles: Role[]) => void;
  roles: Role[];
}

const RoleImport: React.FC<RoleImportProps> = ({ importFile, setImportFile, setError, setRoles, roles }) => {
  const handleImport = async () => {
    if (!importFile) {
      setError('Bitte wählen Sie eine Datei zum Importieren aus.');
      return;
    }

    const fileExtension = importFile.name.split('.').pop()?.toLowerCase();
    let rolesData: any[] = [];

    try {
      if (fileExtension === 'json') {
        const reader = new FileReader();
        reader.onload = async (e) => {
          try {
            rolesData = JSON.parse(e.target?.result as string);
            await importRoles(rolesData);
          } catch (error) {
            setError('Fehler beim Parsen der JSON-Datei: ' + (error as Error).message);
          }
        };
        reader.readAsText(importFile);
      } else if (fileExtension === 'xlsx' || fileExtension === 'xls') {
        setError('Excel-Import wird derzeit nicht unterstützt.');
        return;
      } else if (fileExtension === 'docx') {
        const reader = new FileReader();
        reader.onload = async (e) => {
          try {
            const arrayBuffer = e.target?.result as ArrayBuffer;
            const result = await mammoth.extractRawText({ arrayBuffer });
            const text = result.value;

            const lines = text.split('\n').filter(line => line.trim());
            rolesData = lines.map(line => {
              const parts = line.split(',').map(part => part.trim());
              const role: any = {};
              parts.forEach(part => {
                const [key, value] = part.split(':').map(item => item.trim());
                if (key && value) {
                  if (key.toLowerCase() === 'name') role.name = value;
                  if (key.toLowerCase() === 'abkürzung') role.abbreviation = value;
                  if (key.toLowerCase() === 'rechte') role.rights = value;
                }
              });
              return role;
            }).filter(role => role.name);

            await importRoles(rolesData);
          } catch (error) {
            setError('Fehler beim Parsen der Word-Datei: ' + (error as Error).message);
          }
        };
        reader.readAsArrayBuffer(importFile);
      } else {
        setError('Ungültiges Dateiformat. Bitte verwenden Sie JSON oder Word (docx).');
      }
    } catch (error) {
      setError('Fehler beim Importieren: ' + (error as Error).message);
    }
  };

  const importRoles = async (rolesData: any[]) => {
    if (!Array.isArray(rolesData)) {
      setError('Erwartet ein Array von Rollen');
      return;
    }

    try {
      const response = await fetch('http://localhost:5001/api/roles/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(rolesData),
      });
      if (!response.ok) throw new Error('Fehler beim Importieren der Rollen');
      const importedRoles = await response.json();
      setRoles([...roles, ...importedRoles]);
      setImportFile(null);
    } catch (error) {
      setError('Fehler beim Importieren: ' + (error as Error).message);
    }
  };

  return (
    <div className="flex gap-2 items-center">
      <label className="relative cursor-pointer">
        <div className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
        </div>
        <input
          type="file"
          accept=".json,.docx"
          hidden
          onChange={(e) => setImportFile(e.target.files ? e.target.files[0] : null)}
        />
        <div className="absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer"></div>
      </label>
      {importFile && (
        <button
          onClick={handleImport}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Importieren
        </button>
      )}
      <span className="text-xs text-gray-600 dark:text-gray-400">
        Format: Name, Abkürzung, Rechte
      </span>
    </div>
  );
};

export default RoleImport;