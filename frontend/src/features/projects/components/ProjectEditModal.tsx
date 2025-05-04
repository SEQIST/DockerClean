import React from 'react';

interface Project {
  _id?: string;
  name: string;
  plannedStartDate: string;
  plannedEndDate: string;
  plannedBudget: number;
  calculatedBudget: number;
}

interface ProjectEditModalProps {
  open: boolean;
  onClose: () => void;
  project: Project | null;
  onChange: (field: keyof Project, value: any) => void;
  onSave: () => void;
}

// Hilfsfunktion zur Datumsformatierung
const formatDate = (dateStr: string): string => {
  if (!dateStr) return 'Nicht angegeben';
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) {
      return 'Nicht angegeben';
    }
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}.${month}.${year}`;
  } catch (error) {
    console.error('Fehler beim Formatieren des Datums:', error);
    return 'Nicht angegeben';
  }
};

const ProjectEditModal: React.FC<ProjectEditModalProps> = ({
  open,
  onClose,
  project,
  onChange,
  onSave,
}) => {
  if (!open || !project) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg w-[800px] p-6 shadow-xl">
        <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-4">
          Projekt bearbeiten
        </h2>
        <div className="space-y-4">
          <input
            type="text"
            value={project.name || ''}
            onChange={(e) => onChange('name', e.target.value)}
            placeholder="Projektname"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
          />
          <input
            type="text"
            value={project.plannedStartDate ? formatDate(project.plannedStartDate) : ''}
            onChange={(e) => onChange('plannedStartDate', e.target.value)}
            placeholder="Geplanter Start (tt.mm.jjjj)"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
          />
          <input
            type="text"
            value={project.plannedEndDate ? formatDate(project.plannedEndDate) : ''}
            onChange={(e) => onChange('plannedEndDate', e.target.value)}
            placeholder="Geplantes Ende (tt.mm.jjjj)"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
          />
          <input
            type="number"
            value={project.plannedBudget || 0}
            onChange={(e) => onChange('plannedBudget', Number(e.target.value))}
            placeholder="Geplantes Budget"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
          />
          <input
            type="number"
            value={project.calculatedBudget || 0}
            readOnly
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 cursor-not-allowed"
          />
          <div className="flex justify-end gap-2 mt-4">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              Abbrechen
            </button>
            <button
              onClick={onSave}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Speichern
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectEditModal;