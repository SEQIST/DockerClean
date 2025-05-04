import React from 'react';
import CalenderIcon from '../../../icons/CalenderIcon';
import PieChartIcon from '../../../icons/PieChartIcon';
import { Project } from '../types';

interface ProjectSectionProps {
  project: Project;
  editMode: boolean;
  onClose: () => void;
  onChange: (field: string, value: any) => void;
  onSave: () => void;
  setEditMode: React.Dispatch<React.SetStateAction<boolean>>; // Hinzugefügt
}

const ProjectSection: React.FC<ProjectSectionProps> = ({
  project,
  editMode,
  onClose,
  onChange,
  onSave,
  setEditMode, // Hinzugefügt
}) => {
  // Datumskonvertierung in tt.mm.jjjj Format
  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return 'Nicht angegeben';
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) {
        console.error('Ungültiges Datum:', dateStr);
        return 'Nicht angegeben';
      }
      return `${date.getDate().toString().padStart(2, '0')}.${(date.getMonth() + 1).toString().padStart(2, '0')}.${date.getFullYear()}`;
    } catch (err) {
      console.error('Fehler bei der Datumskonvertierung:', err);
      return 'Nicht angegeben';
    }
  };

  return (
    <>
      <h2 className="text-2xl font-bold mb-4 text-blue-600 dark:text-blue-400">Projekt:</h2>
      <div className="border-b border-gray-200 dark:border-gray-700 mb-3"></div>

      {editMode ? (
        <div className="bg-white dark:bg-gray-900 p-4 rounded-lg shadow-md mb-4">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Projektname
              </label>
              <input
                type="text"
                value={project.name}
                onChange={(e) => onChange('name', e.target.value)}
                className="w-full p-2 text-sm text-gray-800 dark:text-white bg-transparent border border-gray-300 dark:border-gray-700 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-800"
                placeholder="Projektname"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Geplanter Start
              </label>
              <input
                type="text"
                value={formatDate(project.plannedStartDate)}
                onChange={(e) => onChange('plannedStartDate', e.target.value)}
                className="w-full p-2 text-sm text-gray-800 dark:text-white bg-transparent border border-gray-300 dark:border-gray-700 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-800"
                placeholder="tt.mm.jjjj"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Geplantes Ende
              </label>
              <input
                type="text"
                value={formatDate(project.plannedEndDate)}
                onChange={(e) => onChange('plannedEndDate', e.target.value)}
                className="w-full p-2 text-sm text-gray-800 dark:text-white bg-transparent border border-gray-300 dark:border-gray-700 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-800"
                placeholder="tt.mm.jjjj"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Geplantes Budget
              </label>
              <input
                type="number"
                value={project.plannedBudget || ''}
                onChange={(e) => onChange('plannedBudget', e.target.value)}
                className="w-full p-2 text-sm text-gray-800 dark:text-white bg-transparent border border-gray-300 dark:border-gray-700 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-800"
                placeholder="Geplantes Budget"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Berechnetes Budget
              </label>
              <input
                type="number"
                value={(project.calculatedBudget !== null ? project.calculatedBudget : project.calculatedCost) || ''}
                readOnly
                className="w-full p-2 text-sm text-gray-800 dark:text-white bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg shadow-sm cursor-not-allowed"
                placeholder="Berechnetes Budget"
              />
            </div>
          </div>
          <div className="flex gap-3 justify-end mt-4">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              Abbrechen
            </button>
            <button
              onClick={onSave}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Speichern
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
              </svg>
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-900 p-4 rounded-lg shadow-md mb-4">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Projektname
              </label>
              <input
                type="text"
                value={project.name || 'Nicht angegeben'}
                readOnly
                className="w-full p-2 text-sm text-gray-800 dark:text-white bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg shadow-sm cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Geplanter Start
              </label>
              <input
                type="text"
                value={formatDate(project.plannedStartDate)}
                readOnly
                className="w-full p-2 text-sm text-gray-800 dark:text-white bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg shadow-sm cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Geplantes Ende
              </label>
              <input
                type="text"
                value={formatDate(project.plannedEndDate)}
                readOnly
                className="w-full p-2 text-sm text-gray-800 dark:text-white bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg shadow-sm cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Geplantes Budget
              </label>
              <input
                type="text"
                value={project.plannedBudget || 'Nicht angegeben'}
                readOnly
                className="w-full p-2 text-sm text-gray-800 dark:text-white bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg shadow-sm cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Berechnetes Budget
              </label>
              <input
                type="text"
                value={(project.calculatedBudget !== null ? project.calculatedBudget : project.calculatedCost) || 'Nicht angegeben'}
                readOnly
                className="w-full p-2 text-sm text-gray-800 dark:text-white bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg shadow-sm cursor-not-allowed"
              />
            </div>
          </div>
          <div className="flex gap-2 mt-2">
            <button
              onClick={() => setEditMode(true)} // Korrigiert
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Bearbeiten
            </button>
            <button
              onClick={() => setEditMode(false)} // Korrigiert
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
            >
              Abbrechen
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default ProjectSection;