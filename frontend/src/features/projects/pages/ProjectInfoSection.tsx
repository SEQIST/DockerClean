import React, { ChangeEvent } from 'react';

interface Project {
  _id?: string;
  name: string;
  plannedStartDate: string;
  plannedEndDate: string;
  plannedBudget: number;
  calculatedCost: number;
}

interface ProjectInfoSectionProps {
  project: Project;
  editMode: boolean;
  tempProject: {
    name: string;
    plannedStartDate: string;
    plannedEndDate: string;
    plannedBudget: number;
  };
  handleEditToggle: () => void;
  handleProjectChange: (field: keyof Project, value: any) => void;
  handleProjectSave: () => void;
  formatDate: (dateStr: string) => string;
}

const ProjectInfoSection: React.FC<ProjectInfoSectionProps> = ({
  project,
  editMode,
  tempProject,
  handleEditToggle,
  handleProjectChange,
  handleProjectSave,
  formatDate,
}) => {
  return (
    <div className="mb-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-blue-600 dark:text-blue-400">Projekt:</h2>
        {editMode ? (
          <div className="flex gap-2">
            <button
              onClick={handleProjectSave}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Speichern
            </button>
            <button
              onClick={handleEditToggle}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              Abbrechen
            </button>
          </div>
        ) : (
          <button
            onClick={handleEditToggle}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Bearbeiten
          </button>
        )}
      </div>
      <table className="w-full table-auto border-collapse border border-gray-300 dark:border-gray-700">
        <thead>
          <tr className="bg-gray-50 dark:bg-gray-800">
            <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-700">Projektname</th>
            <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-700">Kunde</th>
            <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-700">Budget geplant</th>
            <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-700">Budget berechnet</th>
            <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-700">Geplanter Start</th>
            <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-700">Geplantes Ende</th>
            <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-700">Beschreibung RTF</th>
          </tr>
        </thead>
        <tbody>
          <tr className="hover:bg-gray-100 dark:hover:bg-gray-800">
            <td className="px-4 py-2 text-sm text-gray-800 dark:text-gray-200 border border-gray-300 dark:border-gray-700">
              {editMode ? (
                <input
                  type="text"
                  value={tempProject.name}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => handleProjectChange('name', e.target.value)}
                  className="w-full p-2 text-sm text-gray-800 dark:text-white bg-transparent border border-gray-300 dark:border-gray-700 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-800"
                />
              ) : (
                project.name
              )}
            </td>
            <td className="px-4 py-2 text-sm text-gray-800 dark:text-gray-200 border border-gray-300 dark:border-gray-700">Nicht angegeben</td>
            <td className="px-4 py-2 text-sm text-gray-800 dark:text-gray-200 border border-gray-300 dark:border-gray-700">
              {editMode ? (
                <input
                  type="number"
                  value={tempProject.plannedBudget}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => handleProjectChange('plannedBudget', parseFloat(e.target.value) || 0)}
                  className="w-full p-2 text-sm text-gray-800 dark:text-white bg-transparent border border-gray-300 dark:border-gray-700 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-800"
                />
              ) : (
                project.plannedBudget !== undefined && project.plannedBudget !== null
                  ? `${project.plannedBudget.toFixed(2)} €`
                  : 'Nicht angegeben'
              )}
            </td>
            <td className="px-4 py-2 text-sm text-gray-800 dark:text-gray-200 border border-gray-300 dark:border-gray-700">
              {project.calculatedCost !== undefined && project.calculatedCost !== null
                ? `${project.calculatedCost.toFixed(2)} €`
                : 'Nicht angegeben'}
            </td>
            <td className="px-4 py-2 text-sm text-gray-800 dark:text-gray-200 border border-gray-300 dark:border-gray-700">
              {editMode ? (
                <input
                  type="text"
                  value={tempProject.plannedStartDate}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => handleProjectChange('plannedStartDate', e.target.value)}
                  placeholder="tt.mm.jjjj"
                  className="w-full p-2 text-sm text-gray-800 dark:text-white bg-transparent border border-gray-300 dark:border-gray-700 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-800"
                />
              ) : (
                formatDate(project.plannedStartDate)
              )}
            </td>
            <td className="px-4 py-2 text-sm text-gray-800 dark:text-gray-200 border border-gray-300 dark:border-gray-700">
              {editMode ? (
                <input
                  type="text"
                  value={tempProject.plannedEndDate}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => handleProjectChange('plannedEndDate', e.target.value)}
                  placeholder="tt.mm.jjjj"
                  className="w-full p-2 text-sm text-gray-800 dark:text-white bg-transparent border border-gray-300 dark:border-gray-700 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-800"
                />
              ) : (
                formatDate(project.plannedEndDate)
              )}
            </td>
            <td className="px-4 py-2 text-sm text-gray-800 dark:text-gray-200 border border-gray-300 dark:border-gray-700">Nicht angegeben</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default ProjectInfoSection;