import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ProcessGantt from './ProcessGantt';

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

interface Project {
  _id: string;
  name: string;
  plannedStartDate: string;
  plannedEndDate: string;
  plannedBudget: number;
  calculatedCost: number;
  releases: Release[];
}

interface CalculatedActivity {
  id: string;
  name: string;
  start: string;
  end: string;
  role: string;
  duration: number;
  knownDuration: number;
  estimatedDuration: number;
  cost: number;
  hasStartConflict: boolean;
  totalMinutes: number;
  minutesKnown: number;
  minutesUnknown: number;
  totalHours: number;
  workingHoursPerDay: number;
  numRoles: number;
  trigger: string;
  startConflict: string;
  dateConflict: string;
  budgetConflict: string;
  activityCostConflict: string;
  status: string;
  releaseId: string;
  releaseName: string;
  processId: string;
  processName: string;
  hasError?: boolean;
  warning?: string;
}

interface ResourceSummary {
  name: string;
  hours: number;
}

interface SimulationResult {
  release: Release;
  simulationResult: {
    calculatedActivities: CalculatedActivity[];
    resourcesSummary: ResourceSummary[];
    totalCost: number;
  };
}

const ProjectCalculation = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [project, setProject] = useState<Project | null>(null);
  const [simulationResults, setSimulationResults] = useState<SimulationResult[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const response = await fetch(`http://localhost:5001/api/projects/${id}`);
        if (!response.ok) {
          throw new Error('Fehler beim Laden des Projekts');
        }
        const data = await response.json();
        setProject(data.project);
        setLoading(false);
      } catch (err) {
        const error = err as Error; // Explizite Typisierung
        setError(error.message);
        setLoading(false);
      }
    };
    fetchProject();
  }, [id]);

  useEffect(() => {
    const simulate = async () => {
      if (!project) return;
      if (!project.releases || project.releases.length === 0) {
        setSimulationResults([]); // Keine Releases, also leeres Array
        return;
      }

      const results: SimulationResult[] = [];
      for (const release of project.releases) {
        const simulationResult = {
          calculatedActivities: [],
          resourcesSummary: [],
          totalCost: 0,
        };
        results.push({ release, simulationResult });
      }

      setSimulationResults(results);
    };

    if (project) {
      simulate();
    }
  }, [project]);

  const ganttData = simulationResults.flatMap(({ release, simulationResult }) =>
    simulationResult.calculatedActivities.map((activity: CalculatedActivity) => ({
      TaskID: `${release.name}-${activity.processId}-${activity.id}`,
      TaskName: activity.name,
      StartDate: new Date(activity.start),
      EndDate: new Date(activity.end),
      Duration: activity.duration,
      Cost: activity.cost,
      HasStartConflict: activity.hasStartConflict,
      DateConflict: activity.dateConflict === 'Datumskonflikt',
      releaseId: release.name,
      releaseName: release.name,
      processId: activity.processId,
      processName: activity.processName,
    }))
  );

  if (loading) return <div className="text-gray-500 dark:text-gray-400 p-4">Lade...</div>;
  if (error) return <div className="text-red-500 dark:text-red-400 p-4">Fehler: {error}</div>;
  if (!project) return <div className="text-gray-700 dark:text-gray-300 p-4">Projekt nicht gefunden.</div>;

  return (
    <div className="min-h-screen flex justify-center pt-8 pb-4 px-4">
      <div className="w-full max-w-[1800px] min-w-[1200px]">
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl p-6">
          <h2 className="text-2xl font-bold mb-4 text-blue-600 dark:text-blue-400">
            Projektsimulation: {project.name || 'Kein Name'}
          </h2>
          <ProcessGantt calculatedResults={simulationResults} />
          <div className="mt-3">
            <button
              onClick={() => navigate('/projects')}
              className="px-4 py-2 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              Zurück zur Projektliste
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectCalculation;