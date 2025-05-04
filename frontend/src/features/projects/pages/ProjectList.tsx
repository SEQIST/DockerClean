import React, { useState, useEffect, Dispatch, SetStateAction } from 'react';
import { useNavigate } from 'react-router-dom';

interface Project {
  _id?: string;
  name: string;
  plannedStartDate: string;
  plannedEndDate: string;
  plannedBudget: number;
  calculatedCost: number; // Umbenannt von calculatedBudget zu calculatedCost
}

interface ProjectListProps {
  projects: Project[];
  setProjects: Dispatch<SetStateAction<Project[]>>;
  setProjectToEdit: Dispatch<SetStateAction<Project | null>>;
  setOpen: Dispatch<SetStateAction<boolean>>;
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
    // console.error('Fehler beim Formatieren des Datums:', error);
    return 'Nicht angegeben';
  }
};

const ProjectList: React.FC<ProjectListProps> = ({
  projects,
  setProjects,
  setProjectToEdit,
  setOpen,
}) => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState<string>('');

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await fetch('http://localhost:5001/api/projects');
      const data: Project[] = await response.json();
      setProjects(data);
    } catch (error) {
      // console.error('Fehler beim Laden der Projekte:', error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`http://localhost:5001/api/projects/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Fehler beim Löschen des Projekts');
      }
      setProjects((prev) => prev.filter((project) => project._id !== id));
    } catch (error) {
      // console.error('Fehler:', error);
    }
  };

  const handleEdit = (project: Project) => {
    // Navigiere zur Detailansicht mit Bearbeitungsmodus
    navigate(`/projects/details/${project._id}?edit=true`);
    setProjectToEdit(project);
    setOpen(true);
  };

  const filteredProjects = projects.filter((project) =>
    project.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-4">
      <input
        type="text"
        placeholder="Suche nach Projektname..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="w-full px-3 py-2 mb-4 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-800 dark:text-gray-200"
      />
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-gray-100 dark:bg-gray-700">
            <th className="border border-gray-300 dark:border-gray-600 p-2">Projektname</th>
            <th className="border border-gray-300 dark:border-gray-600 p-2">Geplanter Start</th>
            <th className="border border-gray-300 dark:border-gray-600 p-2">Geplantes Ende</th>
            <th className="border border-gray-300 dark:border-gray-600 p-2">Geplantes Budget</th>
            <th className="border border-gray-300 dark:border-gray-600 p-2">Berechnete Kosten</th>
            <th className="border border-gray-300 dark:border-gray-600 p-2">Aktionen</th>
          </tr>
        </thead>
        <tbody>
          {filteredProjects.map((project) => (
            <tr key={project._id} className="hover:bg-gray-50 dark:hover:bg-gray-600">
              <td className="border border-gray-300 dark:border-gray-600 p-2">{project.name}</td>
              <td className="border border-gray-300 dark:border-gray-600 p-2">{formatDate(project.plannedStartDate)}</td>
              <td className="border border-gray-300 dark:border-gray-600 p-2">{formatDate(project.plannedEndDate)}</td>
              <td className="border border-gray-300 dark:border-gray-600 p-2">
                {project.plannedBudget !== undefined && project.plannedBudget !== null
                  ? `${project.plannedBudget.toFixed(2)} €`
                  : 'Nicht angegeben'}
              </td>
              <td className="border border-gray-300 dark:border-gray-600 p-2">
                {project.calculatedCost !== undefined && project.calculatedCost !== null
                  ? `${project.calculatedCost.toFixed(2)} €`
                  : 'Nicht angegeben'}
              </td>
              <td className="border border-gray-300 dark:border-gray-600 p-2">
                <button
                  onClick={() => handleEdit(project)}
                  className="px-2 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600 mr-2"
                >
                  Bearbeiten
                </button>
                <button
                  onClick={() => project._id && handleDelete(project._id)}
                  className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                >
                  Löschen
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ProjectList;