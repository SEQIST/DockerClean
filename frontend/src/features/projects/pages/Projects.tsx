import React, { useState, useEffect, ChangeEvent } from 'react';
import ProjectList from './ProjectList';
import ErrorBoundary from '../../workproducts/components/ErrorBoundary';
import PageMeta from "../../../components/common/PageMeta";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import Pagination from "../../../components/tables/DataTables/TableThree/Pagination";

interface Project {
  _id?: string;
  name: string;
  plannedStartDate: string;
  plannedEndDate: string;
  plannedBudget: number;
  calculatedCost: number; // Umbenannt von calculatedBudget zu calculatedCost
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

// Hilfsfunktion zum Parsen von DD.MM.YYYY in ISO-Format
const parseDate = (dateStr: string): string | null => {
  if (!dateStr || dateStr === 'Nicht angegeben') return null;
  const [day, month, year] = dateStr.split('.').map(Number);
  if (!day || !month || !year) return null;
  return new Date(year, month - 1, day).toISOString();
};

const Projects: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
  const [formData, setFormData] = useState<Partial<Project>>({
    _id: '',
    name: '',
    plannedStartDate: '',
    plannedEndDate: '',
    plannedBudget: 0,
  });
  const [editProject, setEditProject] = useState<Project | null>(null);
  const [openAddModal, setOpenAddModal] = useState<boolean>(false);
  const [openEditModal, setOpenEditModal] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [rowsPerPage, setRowsPerPage] = useState<number>(20);
  const [currentPage, setCurrentPage] = useState<number>(1);

  useEffect(() => {
    fetchProjects();
  }, []);

  useEffect(() => {
    let filtered = [...projects];
    if (searchQuery) {
      filtered = filtered.filter((project) =>
        (project.name && project.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (project.plannedStartDate && project.plannedStartDate.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (project.plannedEndDate && project.plannedEndDate.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }
    setFilteredProjects(filtered);
    setCurrentPage(1);
  }, [projects, searchQuery]);

  const fetchProjects = async () => {
    try {
      const response = await fetch('http://localhost:5001/api/projects');
      if (!response.ok) throw new Error('Fehler beim Abrufen der Projekte');
      const data: Project[] = await response.json();
      setProjects(data);
      setFilteredProjects(data);
    } catch (error) {
      // console.error('Fehler:', error);
    }
  };

  const handleImport = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    alert('Importfunktion kommt bald – Datei bitte im richtigen Format bereitstellen!');
  };

  const handleEditOpen = (project: Project) => {
    setEditProject(project);
    setFormData({
      _id: project._id || '',
      name: project.name || '',
      plannedStartDate: formatDate(project.plannedStartDate),
      plannedEndDate: formatDate(project.plannedEndDate),
      plannedBudget: project.plannedBudget || 0,
    });
    setOpenEditModal(true);
  };

  const handleAddClose = () => {
    setOpenAddModal(false);
    setFormData({ _id: '', name: '', plannedStartDate: '', plannedEndDate: '', plannedBudget: 0 });
  };

  const handleEditClose = () => {
    setOpenEditModal(false);
    setEditProject(null);
    setFormData({ _id: '', name: '', plannedStartDate: '', plannedEndDate: '', plannedBudget: 0 });
  };

  const handleTextChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const newValue = name === 'plannedBudget' ? parseFloat(value) || 0 : value;
    setFormData((prev) => ({ ...prev, [name]: newValue }));
  };

  const handleSave = async () => {
    try {
      if (!formData.name) {
        alert('Name ist ein Pflichtfeld!');
        return;
      }

      const dataToSend = {
        ...formData,
        plannedStartDate: parseDate(formData.plannedStartDate || ''),
        plannedEndDate: parseDate(formData.plannedEndDate || ''),
      };

      const method = formData._id ? 'PUT' : 'POST';
      const url = formData._id
        ? `http://localhost:5001/api/projects/${formData._id}`
        : 'http://localhost:5001/api/projects';

      if (!formData._id || method === 'POST') {
        delete dataToSend._id;
      }

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataToSend),
      });

      if (!response.ok) {
        const errorData = await response.json();
        // console.error('Server-Fehler:', errorData);
        throw new Error(`Fehler beim Speichern des Projekts: ${errorData.message || response.statusText}`);
      }

      const savedProject: Project = await response.json();
      // console.log('Projekt gespeichert:', savedProject);

      if (formData._id) {
        setProjects((prev) =>
          prev.map((project) => (project._id === savedProject._id ? savedProject : project))
        );
      } else {
        setProjects((prev) => [...prev, savedProject]);
      }

      handleEditClose();
      handleAddClose();
    } catch (error: any) {
      // console.error('Fehler beim Speichern:', error.message);
      alert(`Fehler beim Speichern: ${error.message}`);
    }
  };

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleRowsPerPageChange = (e: ChangeEvent<HTMLSelectElement>): void => {
    const newRowsPerPage = parseInt(e.target.value, 10);
    setRowsPerPage(newRowsPerPage);
    setCurrentPage(1);
  };

  const totalPages = Math.ceil(filteredProjects.length / rowsPerPage);
  const currentData = filteredProjects.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );
  const totalEntries = filteredProjects.length;
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = Math.min(startIndex + rowsPerPage, totalEntries);

  return (
    <>
      <PageMeta
        title="Projects | SEQ.IST - Project Management Solution"
        description="Manage projects in the SEQ.IST Project Management Solution"
      />
      <PageBreadcrumb pageTitle="Projects" />
      <div className="overflow-hidden rounded-xl bg-white dark:bg-white/[0.03] w-full">
        <div className="flex flex-col gap-2 px-4 py-4 border border-b-0 border-gray-100 dark:border-white/[0.05] rounded-t-xl sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <span className="text-gray-500 dark:text-gray-400"> Show </span>
            <div className="relative z-20 bg-transparent">
              <select
                className="w-full py-2 pl-3 pr-8 text-sm text-gray-800 bg-transparent border border-gray-300 rounded-lg appearance-none dark:bg-dark-900 h-9 bg-none shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                value={rowsPerPage}
                onChange={handleRowsPerPageChange}
              >
                <option value="20" className="text-gray-500 dark:bg-gray-900 dark:text-gray-400">20</option>
                <option value="50" className="text-gray-500 dark:bg-gray-900 dark:text-gray-400">50</option>
                <option value="100" className="text-gray-500 dark:bg-gray-900 dark:text-gray-400">100</option>
              </select>
              <span className="absolute z-30 text-gray-500 -translate-y-1/2 right-2 top-1/2 dark:text-gray-400">
                <svg
                  className="stroke-current"
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M3.8335 5.9165L8.00016 10.0832L12.1668 5.9165"
                    stroke=""
                    strokeWidth="1.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
            </div>
            <span className="text-gray-500 dark:text-gray-400"> entries </span>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative">
              <button className="absolute text-gray-500 -translate-y-1/2 left-4 top-1/2 dark:text-gray-400">
                <svg
                  className="fill-current w-5 h-5"
                  viewBox="0 0 20 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M3.04199 9.37363C3.04199 5.87693 5.87735 3.04199 9.37533 3.04199C12.8733 3.04199 15.7087 5.87693 15.7087 9.37363C15.7087 12.8703 12.8733 15.7053 9.37533 15.7053C5.87735 15.7053 3.04199 12.8703 3.04199 9.37363ZM9.37533 1.54199C5.04926 1.54199 1.54199 5.04817 1.54199 9.37363C1.54199 13.6991 5.04926 17.2053 9.37533 17.2053C11.2676 17.2053 13.0032 16.5344 14.3572 15.4176L17.1773 18.238C17.4702 18.5309 17.945 18.5309 18.2379 18.238C18.5308 17.9451 18.5309 17.4703 18.238 17.1773L15.4182 14.3573C16.5367 13.0033 17.2087 11.2669 17.2087 9.37363C17.2087 5.04817 13.7014 1.54199 9.37533 1.54199Z"
                    fill=""
                  />
                </svg>
              </button>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Suche nach Name..."
                className="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-300 bg-transparent py-2.5 pl-11 pr-4 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800 xl:w-[300px]"
              />
            </div>
            <button
              onClick={() => {
                setOpenAddModal(true);
                setFormData({ _id: '', name: '', plannedStartDate: '', plannedEndDate: '', plannedBudget: 0 });
              }}
              className="inline-flex items-center gap-2 px-4 py-2 border border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-400 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path>
              </svg>
              Projekt hinzufügen
            </button>
          </div>
        </div>
        <div className="max-w-full overflow-x-auto custom-scrollbar">
          <div className="w-full table-auto">
            <ProjectList
              projects={currentData}
              setProjects={setProjects}
              setProjectToEdit={setEditProject}
              setOpen={setOpenEditModal}
            />
          </div>
        </div>
        <div className="border border-t-0 rounded-b-xl border-gray-100 py-4 pl-[18px] pr-4 dark:border-white/[0.05]">
          <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between">
            <div className="pb-3 xl:pb-0">
              <p className="pb-3 text-sm font-medium text-center text-gray-500 border-b border-gray-100 dark:border-gray-800 dark:text-gray-400 xl:border-b-0 xl:pb-0 xl:text-left">
                Showing {startIndex + 1} to {endIndex} of {totalEntries} entries
              </p>
            </div>
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </div>
        </div>
      </div>

      {/* Modal für das Hinzufügen oder Bearbeiten eines Projekts */}
      {(openAddModal || openEditModal) && (
        <ErrorBoundary>
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg w-[800px] p-6">
              <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-4">
                {openAddModal ? 'Neues Projekt erstellen' : 'Projekt bearbeiten'}
              </h2>
              <div className="space-y-4">
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleTextChange}
                  placeholder="Projektname"
                  className="w-full p-2 text-sm text-gray-800 dark:text-white bg-transparent border border-gray-300 dark:border-gray-700 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-800"
                />
                <input
                  type="text"
                  name="plannedStartDate"
                  value={formData.plannedStartDate}
                  onChange={handleTextChange}
                  placeholder="Geplanter Start (tt.mm.jjjj)"
                  className="w-full p-2 text-sm text-gray-800 dark:text-white bg-transparent border border-gray-300 dark:border-gray-700 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-800"
                />
                <input
                  type="text"
                  name="plannedEndDate"
                  value={formData.plannedEndDate}
                  onChange={handleTextChange}
                  placeholder="Geplantes Ende (tt.mm.jjjj)"
                  className="w-full p-2 text-sm text-gray-800 dark:text-white bg-transparent border border-gray-300 dark:border-gray-700 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-800"
                />
                <input
                  type="number"
                  name="plannedBudget"
                  value={formData.plannedBudget}
                  onChange={handleTextChange}
                  placeholder="Geplantes Budget"
                  className="w-full p-2 text-sm text-gray-800 dark:text-white bg-transparent border border-gray-300 dark:border-gray-700 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-800"
                />
              </div>
              <div className="flex gap-2 mt-4 justify-end">
                <button
                  onClick={handleSave}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Speichern
                </button>
                <button
                  onClick={openAddModal ? handleAddClose : handleEditClose}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
                >
                  Abbrechen
                </button>
              </div>
            </div>
          </div>
        </ErrorBoundary>
      )}
    </>
  );
};

export default Projects;