import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import CalculateProjectResultsTable from './CalculateProjectResultsTable';
import ProcessGantt from './ProcessGantt';
import ProjectBudgetOverview from '../components/ProjectBudgetOverview';
import ResourcesSummary from '../../ProcessCalculation/components/ResourcesSummary';
import { buildDAG, topologicalSort } from '../../utils/dagUtils';
import { calculateProject } from '../../utils/calculateProject';
import { fetchProcesses, fetchActivities } from '../../processes/services/processService';
import '@syncfusion/ej2-base/styles/material.css';
import '@syncfusion/ej2-buttons/styles/material.css';
import '@syncfusion/ej2-calendars/styles/material.css';
import '@syncfusion/ej2-dropdowns/styles/material.css';
import '@syncfusion/ej2-gantt/styles/material.css';
import '@syncfusion/ej2-grids/styles/material.css';
import '@syncfusion/ej2-inputs/styles/material.css';
import '@syncfusion/ej2-layouts/styles/material.css';
import '@syncfusion/ej2-lists/styles/material.css';
import '@syncfusion/ej2-navigations/styles/material.css';
import '@syncfusion/ej2-popups/styles/material.css';
import '@syncfusion/ej2-richtexteditor/styles/material.css';
import '@syncfusion/ej2-treegrid/styles/material.css';

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

interface Process {
  _id: string;
  name: string;
}

interface Activity {
  _id: string;
  name: string;
  description?: string;
  abbreviation?: string;
  executedBy?: { _id: string; name: string };
  process?: string;
  result?: string | { _id: string };
  multiplicator?: number;
  compressor?: 'multiply' | 'compress';
  executionMode?: 'parallel' | 'forEach';
  workMode?: 'Einer' | 'Jeder' | 'Geteilt';
  knownTime: number;
  estimatedTime: number;
  timeUnit: 'minutes' | 'hours';
  versionMajor?: number;
  versionMinor?: number;
  icon?: string;
  trigger?: {
    workProducts: { _id: string; completionPercentage: number; isDeterminingFactor: boolean }[];
    determiningFactorId?: string;
  };
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

const ProjectSimulation = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [project, setProject] = useState<Project | null>(null);
  const [processes, setProcesses] = useState<Process[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [releases, setReleases] = useState<Release[]>([]);
  const [calculatedResults, setCalculatedResults] = useState<any[]>([]);
  const [resourcesSummary, setResourcesSummary] = useState<ResourceSummary[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const COST_THRESHOLD = 2000;

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Projekt laden
        const projectResponse = await fetch(`http://localhost:5001/api/projects/${id}`);
        if (!projectResponse.ok) {
          const errorText = await projectResponse.text();
          throw new Error(`Fehler beim Laden des Projekts: ${errorText}`);
        }
        const projectData = await projectResponse.json();
        // // console.log('Geladene Projektdaten:', projectData);

        setProject(projectData.project);
        setReleases(projectData.project.releases || []);

        // Prozesse laden
        const processesResponse = await fetchProcesses();
        setProcesses(processesResponse);

        // Aktivitäten für alle Prozesse laden
        const allActivities: Activity[] = [];
        for (const process of processesResponse) {
          const activitiesResponse = await fetchActivities(process._id);
          allActivities.push(
            ...activitiesResponse.map((activity: Activity) => ({
              ...activity,
              processId: process._id,
              processName: process.name,
              multiplicator: activity.multiplicator ?? 1,
              compressor: activity.compressor ?? 'multiply',
              executionMode: activity.executionMode ?? 'parallel',
              workMode: activity.workMode ?? 'Einer',
            }))
          );
        }
        setActivities(allActivities);

        setLoading(false);
      } catch (err: unknown) {
        const error = err as Error;
        // // console.error('Fehler beim Laden der Daten:', error);
        setError(error.message);
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  useEffect(() => {
    if (project) {
      document.title = `Simulation: ${project.name}`;
    }
  }, [project]);

  // Automatische Simulation nach dem Laden der Daten
  useEffect(() => {
    if (!loading && activities.length > 0) {
      calculate();
    }
  }, [loading, activities]);

  const calculate = async () => {
    try {
      // Erstelle einen DAG für alle Aktivitäten
      const dag = buildDAG(activities);
      const sortedActivityIds = topologicalSort(dag);
      const sortedActivities = sortedActivityIds
        .map(id => activities.find(activity => activity._id.toString() === id.toString()))
        .filter((activity): activity is Activity => !!activity);

      // Simulationsdaten aus den Releases erstellen
      const simulationData = {
        workProducts: releases.flatMap((release: Release) =>
          release.workProducts.map((wp: WorkProduct) => ({
            _id: wp.workProduct,
            name: wp.workProduct,
            known: wp.knownItems,
            unknown: wp.unknownItems,
          }))
        ),
      };

      const allResults: any[] = [];
      const allResourcesSummary: ResourceSummary[] = [];
      let projectTotalCost = 0;

      // Für jedes Release berechnen
      for (const release of releases) {
        const releaseActivities: CalculatedActivity[] = [];

        // Für jeden Prozess im Release berechnen
        for (const process of processes) {
          const processActivities = sortedActivities.filter(activity => activity.processId === process._id);
          if (processActivities.length === 0) continue;

          // Simulation für den Prozess durchführen
          const result = await calculateProject(
            processActivities,
            simulationData,
            project?.plannedStartDate || new Date().toISOString(),
            id!,
            releases,
            project?.plannedBudget || null
          );

          const { calculatedActivities, resourcesSummary, totalCost } = result;

          // Aktivitäten mit Prozess- und Release-Informationen anreichern und formatieren
          const formattedActivities: CalculatedActivity[] = calculatedActivities.map((activity: CalculatedActivity) => {
            const startDate = new Date(activity.start);
            const endDate = new Date(activity.end);
            const originalActivity: Activity | undefined = activities.find((a) => a._id === activity.id);
            return {
              ...activity,
              start: startDate.toISOString().split('T')[0],
              end: endDate.toISOString().split('T')[0],
              duration: activity.duration,
              cost: activity.cost,
              hasStartConflict: activity.hasStartConflict,
              dateConflict: activity.dateConflict || 'Kein Konflikt',
              budgetConflict: activity.budgetConflict,
              activityCostConflict: activity.activityCostConflict,
              highCost: activity.cost > COST_THRESHOLD,
              totalMinutes: activity.totalMinutes,
              minutesKnown: activity.minutesKnown,
              minutesUnknown: activity.minutesUnknown,
              totalHours: activity.totalHours,
              workingHoursPerDay: activity.workingHoursPerDay,
              numRoles: activity.numRoles,
              hasError: !originalActivity?.trigger?.workProducts?.length,
              triggeredBy: originalActivity?.trigger?.workProducts?.length ? originalActivity.trigger.workProducts : null,
              releaseId: release.name,
              releaseName: release.name,
              processId: process._id,
              processName: process.name,
            };
          });

          releaseActivities.push(...formattedActivities);
          allResourcesSummary.push(...(resourcesSummary || []));
          projectTotalCost += totalCost || 0;
        }

        allResults.push({
          releaseId: release.name,
          releaseName: release.name,
          activities: releaseActivities,
        });
      }

      setCalculatedResults(allResults);
      setResourcesSummary(allResourcesSummary);

      // Projekt mit neuen Werten aktualisieren und aktualisierte Daten laden
      await fetch(`http://localhost:5001/api/projects/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...project,
          resourcesSummary: JSON.stringify(allResourcesSummary),
          calculatedCost: projectTotalCost,
        }),
      });

      // Aktualisierte Projektdaten laden
      const updatedProjectResponse = await fetch(`http://localhost:5001/api/projects/${id}`);
      if (!updatedProjectResponse.ok) {
        throw new Error('Fehler beim Laden der aktualisierten Projektdaten');
      }
      const updatedProjectData = await updatedProjectResponse.json();
      if (updatedProjectData.project) {
        setProject(updatedProjectData.project);
      } else {
        throw new Error('Aktualisierte Projektdaten enthalten kein project-Feld');
      }
    } catch (error: unknown) {
      const err = error as Error;
      // // console.error('Fehler beim Berechnen:', err);
      setError(err.message);
    }
  };

  // Berechne die Projektlaufzeit basierend auf den Prozessen
  const calculateProjectRuntime = () => {
    const allActivities = calculatedResults.flatMap(result => result.activities).filter((activity: CalculatedActivity) => !activity.hasError);
    if (allActivities.length === 0) {
      return { start: new Date(), end: new Date() };
    }

    const startDates = allActivities.map(activity => new Date(activity.start).getTime());
    const endDates = allActivities.map(activity => new Date(activity.end).getTime());

    const earliestStart = new Date(Math.min(...startDates));
    const latestEnd = new Date(Math.max(...endDates));

    return { start: earliestStart, end: latestEnd };
  };

  const projectRuntime = calculateProjectRuntime();
  const runtimeStart = projectRuntime.start.toLocaleDateString('de-DE', { year: 'numeric', month: '2-digit', day: '2-digit' });
  const runtimeEnd = projectRuntime.end.toLocaleDateString('de-DE', { year: 'numeric', month: '2-digit', day: '2-digit' });

  const filteredResults = calculatedResults.map(result => ({
    ...result,
    activities: result.activities.filter((activity: CalculatedActivity) => !activity.hasError),
  }));

  const activitiesWithoutTrigger = calculatedResults
    .flatMap(result => result.activities)
    .filter((activity: CalculatedActivity) => activity.hasError);

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

          {activitiesWithoutTrigger.length > 0 && (
            <div className="bg-yellow-100 dark:bg-yellow-900 border-l-4 border-yellow-500 dark:border-yellow-600 text-yellow-700 dark:text-yellow-300 p-4 mb-4">
              <div className="flex items-center cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
                <svg
                  className={`w-5 h-5 mr-2 transform ${isExpanded ? 'rotate-90' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                </svg>
                <p className="font-medium">Hinweis</p>
              </div>
              {isExpanded && (
                <>
                  <p>Die folgenden Aktivitäten haben keinen Trigger und werden im Gantt-Diagramm nicht angezeigt:</p>
                  <ul className="list-disc list-inside mt-2">
                    {activitiesWithoutTrigger.map((activity: CalculatedActivity) => (
                      <li key={`${activity.releaseId}-${activity.processId}-${activity.id}`}>
                        {activity.name} (Release: {activity.releaseName}, Prozess: {activity.processName})
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </div>
          )}

          <CalculateProjectResultsTable
            calculatedActivities={calculatedResults.flatMap(result => result.activities).filter((activity: CalculatedActivity) => !activity.hasError)}
            activities={activities}
            COST_THRESHOLD={COST_THRESHOLD}
            calculate={calculate}
          />

          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">
            Gantt-Diagramm (Release → Prozess → Aktivität)
          </h3>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            Laufzeit des Projekts basierend auf Prozessen: {runtimeStart} - {runtimeEnd}
          </p>
          <ProcessGantt calculatedResults={filteredResults} />

          <ProjectBudgetOverview entity={project} />

          {resourcesSummary.length > 0 && (
            <ResourcesSummary resourcesSummary={resourcesSummary} />
          )}

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

export default ProjectSimulation;