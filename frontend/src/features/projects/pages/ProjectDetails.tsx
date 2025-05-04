import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ProjectInfoSection from './ProjectInfoSection';
import WorkProductsSection from './WorkProductsSection';
import ReleasesSection from './ReleasesSection';

// Typdefinition anpassen, um die verschachtelte Struktur der API-Antwort zu berücksichtigen
interface WorkProduct {
  workProduct: string;
  knownItems: number;
  unknownItems: number;
}

interface Release {
  name: string;
  startDate: string;
  endDate: string;
  workProducts: WorkProduct[];
}

interface ProjectData {
  project: {
    _id?: string;
    name: string;
    plannedStartDate: string;
    plannedEndDate: string;
    plannedBudget: number;
    calculatedCost: number; // Umbenannt von calculatedBudget zu calculatedCost
    workProducts?: WorkProduct[];
    releases?: Release[];
  };
  releases: Release[];
  workProducts: WorkProduct[];
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

const ProjectDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [projectData, setProjectData] = useState<ProjectData | null>(null);
  const [editMode, setEditMode] = useState<boolean>(false);
  const [tempProject, setTempProject] = useState({
    name: '',
    plannedStartDate: '',
    plannedEndDate: '',
    plannedBudget: 0,
  });
  const [workProducts, setWorkProducts] = useState<WorkProduct[]>([]);
  const [releases, setReleases] = useState<Release[]>([]);
  const [availableWorkProducts, setAvailableWorkProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // console.log('Lade Projekt mit ID:', id);
        const projectResponse = await fetch(`http://localhost:5001/api/projects/${id}`);
        if (!projectResponse.ok) {
          const errorText = await projectResponse.text();
          throw new Error(`Fehler beim Laden des Projekts: ${errorText}`);
        }
        const projectData: ProjectData = await projectResponse.json();
        // console.log('Geladene Projektdaten:', projectData);

        // Leere Work Products entfernen
        const cleanedWorkProducts = (projectData.project.workProducts || []).filter(
          (wp) => wp.workProduct && wp.knownItems >= 0 && wp.unknownItems >= 0
        );

        setProjectData({
          ...projectData,
          workProducts: cleanedWorkProducts,
        });
        setWorkProducts(cleanedWorkProducts);
        setReleases(projectData.project.releases || []);
        setTempProject({
          name: projectData.project.name || '',
          plannedStartDate: projectData.project.plannedStartDate ? formatDate(projectData.project.plannedStartDate) : '',
          plannedEndDate: projectData.project.plannedEndDate ? formatDate(projectData.project.plannedEndDate) : '',
          plannedBudget: projectData.project.plannedBudget || 0,
        });

        // Work Products laden
        const workProductsResponse = await fetch('http://localhost:5001/api/workproducts');
        if (!workProductsResponse.ok) {
          const errorText = await workProductsResponse.text();
          throw new Error(`Fehler beim Laden der Work Products: ${errorText}`);
        }
        const workProductsData = await workProductsResponse.json();
        // console.log('Geladene Work Products:', workProductsData);
        setAvailableWorkProducts(workProductsData);

        setLoading(false);
      } catch (err) {
        // console.error('Fehler:', err);
        setError((err as Error).message);
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleEditToggle = () => {
    if (editMode) {
      // Zurücksetzen auf ursprüngliche Werte, wenn Bearbeitung abgebrochen wird
      setTempProject({
        name: projectData?.project.name || '',
        plannedStartDate: projectData?.project.plannedStartDate ? formatDate(projectData.project.plannedStartDate) : '',
        plannedEndDate: projectData?.project.plannedEndDate ? formatDate(projectData.project.plannedEndDate) : '',
        plannedBudget: projectData?.project.plannedBudget || 0,
      });
    }
    setEditMode(!editMode);
  };

  const handleProjectChange = (field: keyof ProjectData['project'], value: any) => {
    setTempProject((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleProjectSave = async () => {
    try {
      if (!projectData) return;

      const updatedProject = {
        name: tempProject.name,
        plannedStartDate: parseDate(tempProject.plannedStartDate) || projectData.project.plannedStartDate,
        plannedEndDate: parseDate(tempProject.plannedEndDate) || projectData.project.plannedEndDate,
        plannedBudget: Number(tempProject.plannedBudget) || 0,
        workProducts: workProducts,
        releases: releases,
      };

      // console.log('Gesendete Daten:', updatedProject);

      const response = await fetch(`http://localhost:5001/api/projects/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedProject),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Fehler beim Speichern des Projekts: ${errorText}`);
      }

      const updatedData = await response.json();
      // console.log('Antwort des Backends (Projekt):', updatedData);
      setProjectData({
        ...projectData,
        project: updatedData,
        workProducts: updatedData.workProducts || [],
        releases: updatedData.releases || [],
      });
      setEditMode(false);
    } catch (err) {
      // console.error('Fehler:', err);
      setError((err as Error).message);
    }
  };

  const handleWorkProductSave = async (updatedWorkProducts: WorkProduct[]) => {
    try {
      if (!projectData) return;

      const updatedProject = {
        name: projectData.project.name,
        plannedStartDate: projectData.project.plannedStartDate,
        plannedEndDate: projectData.project.plannedEndDate,
        plannedBudget: projectData.project.plannedBudget,
        workProducts: updatedWorkProducts,
        releases: releases,
      };

      // console.log('Gesendete Daten (Work Products):', updatedProject);

      const response = await fetch(`http://localhost:5001/api/projects/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedProject),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Fehler beim Speichern der Work Products: ${errorText}`);
      }

      const updatedData = await response.json();
      // console.log('Antwort des Backends (Work Products):', updatedData);
      setProjectData({
        ...projectData,
        project: updatedData,
        workProducts: updatedData.workProducts || [],
        releases: updatedData.releases || [],
      });
    } catch (err) {
      // console.error('Fehler:', err);
      setError((err as Error).message);
    }
  };

  const handleReleaseSave = async (updatedReleases: Release[]) => {
    try {
      if (!projectData) return;

      // Validierung der Releases
      const validReleases = updatedReleases.filter(release => 
        release.name && release.startDate && release.endDate
      );

      if (validReleases.length !== updatedReleases.length) {
        throw new Error('Einige Releases haben ungültige Daten. Bitte stellen Sie sicher, dass Name, Startdatum und Enddatum ausgefüllt sind.');
      }

      const updatedProject = {
        name: projectData.project.name,
        plannedStartDate: projectData.project.plannedStartDate,
        plannedEndDate: projectData.project.plannedEndDate,
        plannedBudget: projectData.project.plannedBudget,
        workProducts: workProducts,
        releases: validReleases,
      };

      // console.log('Gesendete Daten (Releases):', updatedProject);

      const response = await fetch(`http://localhost:5001/api/projects/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedProject),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Fehler beim Speichern der Releases: ${errorText}`);
      }

      const updatedData = await response.json();
      // console.log('Antwort des Backends (Releases):', updatedData);
      setProjectData({
        ...projectData,
        project: updatedData,
        releases: updatedData.releases || [],
        workProducts: updatedData.workProducts || [],
      });
    } catch (err) {
      // console.error('Fehler:', err);
      setError((err as Error).message);
    }
  };

  const handleSimulate = () => {
    navigate(`/projects/simulation/${id}`);
  };

  const handleSave = () => {
    // console.log('Speichere Projekt:', projectData);
  };

  const handleSaveState = () => {
    navigate(`/project-calculation/save/${id}`);
  };

  if (loading) return <div className="text-gray-500 dark:text-gray-400 p-4">Lade...</div>;
  if (error) return <div className="text-red-500 dark:text-red-400 p-4">Fehler: {error}</div>;
  if (!projectData || !projectData.project) return <div className="text-gray-700 dark:text-gray-300 p-4">Projekt nicht gefunden.</div>;

  return (
    <div className="min-h-screen flex justify-center pt-8 pb-4 px-4">
      <div className="w-full max-w-[1800px] min-w-[1200px]">
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl p-6">
          <ProjectInfoSection
            project={projectData.project}
            editMode={editMode}
            tempProject={tempProject}
            handleEditToggle={handleEditToggle}
            handleProjectChange={handleProjectChange}
            handleProjectSave={handleProjectSave}
            formatDate={formatDate}
          />

          <WorkProductsSection
            workProducts={workProducts}
            setWorkProducts={setWorkProducts}
            availableWorkProducts={availableWorkProducts}
            onSave={handleWorkProductSave}
            releases={releases}
          />

          <ReleasesSection
            releases={releases}
            setReleases={setReleases}
            onSave={handleReleaseSave}
            availableWorkProducts={availableWorkProducts}
          />

          <div className="flex gap-2 mt-4">
            <button
              onClick={handleSimulate}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Simulieren
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Speichern
            </button>
            <button
              onClick={handleSaveState}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Zustand speichern
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetails;