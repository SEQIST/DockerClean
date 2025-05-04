import React, { useState, useEffect, ChangeEvent } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { calculateProcess } from '../../../utils/calculateProcess';
import SimulationDataTable from '../../ProcessCalculation/components/SimulationDataTable';
import AddWorkProductDialog from '../../ProcessCalculation/components/AddWorkProductDialog';
import CalculationResultTable from '../../ProcessCalculation/components/CalculationResultTable';
import GanttChart from '../../ProcessCalculation/components/GanttChart';
import BudgetOverview from '../../ProcessCalculation/components/BudgetOverview';
import ResourcesSummary from '../../ProcessCalculation/components/ResourcesSummary';
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
import { Activity } from '../services/processService';

interface Entity {
  _id: string;
  name: string;
  plannedBudget?: number;
}

interface Release {
  _id: string;
}

interface WorkProduct {
  _id: string;
  name: string;
  label?: string;
}

interface SimulationData {
  workProducts: { _id: string; name: string; known: number; unknown: number }[];
}

interface CalculatedActivity {
  id: string;
  name: string;
  start: string;
  end: string;
  duration: number;
  cost: number;
  hasStartConflict: boolean;
  dateConflict?: boolean;
  budgetConflict?: boolean;
  highCost: boolean;
  totalMinutes: number;
  minutesKnown: number;
  minutesUnknown: number;
  totalHours: number;
  workingHoursPerDay: number;
  numRoles: number;
  hasError: boolean;
  triggeredBy: any;
  startDate: string;
  endDate: string;
}

interface ResourceSummary {
  name: string;
  hours: number;
}

const ProcessCalculation: React.FC = () => {
  const { id, type } = useParams<{ id: string; type?: string }>();
  const navigate = useNavigate();
  const [entity, setEntity] = useState<Entity | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [releases, setReleases] = useState<Release[]>([]);
  const [simulationData, setSimulationData] = useState<SimulationData>(() => {
    const savedData = localStorage.getItem(` simulationData_${id}`);
    return savedData ? JSON.parse(savedData) : { workProducts: [] };
  });
  const [calculatedActivities, setCalculatedActivities] = useState<CalculatedActivity[]>([]);
  const [resourcesSummary, setResourcesSummary] = useState<ResourceSummary[]>([]);
  const [totalCost, setTotalCost] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [newWorkProduct, setNewWorkProduct] = useState<WorkProduct | null>(null);
  const [known, setKnown] = useState<string>('');
  const [unknown, setUnknown] = useState<string>('');
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [editedValues, setEditedValues] = useState<{ known: string; unknown: string }>({ known: '', unknown: '' });
  const [addDialogOpen, setAddDialogOpen] = useState<boolean>(false);
  const [availableWorkProducts, setAvailableWorkProducts] = useState<WorkProduct[]>([]);
  const COST_THRESHOLD = 2000;

  const effectiveType = type && (type === 'process' || type === 'project') ? type : 'process';

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!id) throw new Error('ID fehlt');
        let entityResponse, releasesResponse, activitiesResponse;

        if (effectiveType === 'process') {
          entityResponse = await fetch(`http://localhost:5001/api/processes/${id}`).then(r => {
            if (!r.ok) throw new Error(`Fehler beim Laden des Prozesses: ${r.statusText}`);
            return r.json();
          });
          activitiesResponse = await fetch('http://localhost:5001/api/activities').then(r => {
            if (!r.ok) throw new Error(`Fehler beim Laden der Aktivitäten: ${r.statusText}`);
            return r.json();
          });
          const processActivities = activitiesResponse.filter((a: Activity) => {
            const processId = typeof a.process === 'string' ? a.process : a.process?._id?.toString();
            return processId === id;
          }) || [];
          setActivities(processActivities);
          setReleases([]);
        } else if (effectiveType === 'project') {
          entityResponse = await fetch(`http://localhost:5001/api/projects/${id}`).then(r => {
            if (!r.ok) throw new Error(`Fehler beim Laden des Projekts: ${r.statusText}`);
            return r.json();
          });
          releasesResponse = await fetch(`http://localhost:5001/api/releases?projectId=${id}`).then(r => {
            if (!r.ok) throw new Error(`Fehler beim Laden der Releases: ${r.statusText}`);
            return r.json();
          });
          setReleases(releasesResponse || []);
          setActivities([]);
        } else {
          throw new Error('Ungültiger Typ: Muss "process" oder "project" sein.');
        }

        const workProductsResponse = await fetch('http://localhost:5001/api/workproducts').then(r => {
          if (!r.ok) throw new Error(`Fehler beim Laden der Work Products: ${r.statusText}`);
          return r.json();
        });

        setEntity(entityResponse);
        setAvailableWorkProducts(workProductsResponse.map((wp: WorkProduct) => ({
          _id: wp._id,
          label: wp.name,
        })));
        setLoading(false);
      } catch (err) {
        setError((err as Error).message);
        setLoading(false);
      }
    };
    fetchData();
  }, [id, effectiveType]);

  useEffect(() => {
    if (entity) {
      document.title = `Berechnung: ${entity.name}`;
    }
  }, [entity]);

  useEffect(() => {
    if (id) {
      localStorage.setItem(`simulationData_${id}`, JSON.stringify(simulationData));
    }
  }, [simulationData, id]);

  const handleAddWorkProduct = () => {
    if (!newWorkProduct || !known || !unknown) {
      alert('Bitte füllen Sie alle Felder aus.');
      return;
    }
    const updatedWorkProducts = [
      ...simulationData.workProducts,
      {
        _id: newWorkProduct._id,
        name: newWorkProduct.label || 'Unbekannt',
        known: parseFloat(known),
        unknown: parseFloat(unknown),
      },
    ];
    setSimulationData({ ...simulationData, workProducts: updatedWorkProducts });
    setNewWorkProduct(null);
    setKnown('');
    setUnknown('');
    setAddDialogOpen(false);
  };

  const handleEdit = (index: number) => {
    setEditIndex(index);
    const wp = simulationData.workProducts[index];
    setEditedValues({ known: wp.known.toString() || '', unknown: wp.unknown.toString() || '' });
  };

  const handleSave = (index: number) => {
    const updatedWorkProducts = [...simulationData.workProducts];
    updatedWorkProducts[index] = { ...updatedWorkProducts[index], known: parseFloat(editedValues.known), unknown: parseFloat(editedValues.unknown) };
    setSimulationData({ ...simulationData, workProducts: updatedWorkProducts });
    setEditIndex(null);
  };

  const handleDeleteWorkProduct = (index: number) => {
    const updatedWorkProducts = simulationData.workProducts.filter((_, i) => i !== index);
    setSimulationData({ ...simulationData, workProducts: updatedWorkProducts });
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditedValues({ ...editedValues, [name]: value });
  };

  const handleAddDialogOpen = () => setAddDialogOpen(true);
  const handleAddDialogClose = () => {
    setAddDialogOpen(false);
    setNewWorkProduct(null);
    setKnown('');
    setUnknown('');
  };

  const calculate = async () => {
    try {
      if (!id) throw new Error('ID fehlt');
      const result = await calculateProcess(
        activities,
        simulationData,
        new Date(),
        id, // Entfernt: id! – id ist bereits string | undefined
        releases,
        effectiveType === 'project' ? (entity?.plannedBudget ?? null) : null
      );
      let formattedResult: CalculatedActivity[];
      if (Array.isArray(result)) {
        formattedResult = result.map((activity: any) => {
          const startDate = new Date(activity.start);
          const endDate = new Date(activity.end);
          const originalActivity = activities.find((a) => a._id === activity.id);
          return {
            ...activity,
            startDate: startDate.toISOString().split('T')[0],
            endDate: endDate.toISOString().split('T')[0],
            duration: activity.duration,
            cost: activity.cost,
            startConflict: activity.hasStartConflict,
            highCost: activity.cost > COST_THRESHOLD,
            totalMinutes: activity.totalMinutes,
            minutesKnown: activity.minutesKnown,
            minutesUnknown: activity.minutesUnknown,
            totalHours: activity.totalHours,
            workingHoursPerDay: activity.workingHoursPerDay,
            numRoles: activity.numRoles,
            hasError: !originalActivity?.trigger?.workProducts?.length,
            triggeredBy: originalActivity?.trigger?.workProducts?.length ? originalActivity.trigger.workProducts : null,
          };
        });
        setCalculatedActivities(formattedResult);
        setResourcesSummary([]);
        setTotalCost(0);
      } else {
        const { calculatedActivities, resourcesSummary, totalCost } = result as { calculatedActivities: any[], resourcesSummary: ResourceSummary[], totalCost: number };
        formattedResult = calculatedActivities.map((activity: any) => {
          const startDate = new Date(activity.start);
          const endDate = new Date(activity.end);
          const originalActivity = activities.find((a) => a._id === activity.id);
          return {
            ...activity,
            startDate: startDate.toISOString().split('T')[0],
            endDate: endDate.toISOString().split('T')[0],
            duration: activity.duration,
            cost: activity.cost,
            startConflict: activity.hasStartConflict,
            dateConflict: activity.dateConflict || false,
            budgetConflict: activity.budgetConflict,
            highCost: activity.cost > COST_THRESHOLD,
            totalMinutes: activity.totalMinutes,
            minutesKnown: activity.minutesKnown,
            minutesUnknown: activity.minutesUnknown,
            totalHours: activity.totalHours,
            workingHoursPerDay: activity.workingHoursPerDay,
            numRoles: activity.numRoles,
            hasError: !originalActivity?.trigger?.workProducts?.length,
            triggeredBy: originalActivity?.trigger?.workProducts?.length ? originalActivity.trigger.workProducts : null,
          };
        });
        setCalculatedActivities(formattedResult);
        setResourcesSummary(resourcesSummary || []);
        setTotalCost(totalCost || 0);

        if (effectiveType === 'project' && entity) {
          await fetch(`http://localhost:5001/api/projects/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              ...entity,
              resourcesSummary: JSON.stringify(resourcesSummary),
              calculatedCost: totalCost,
            }),
          });
        }
      }
    } catch (error) {
      setError((error as Error).message);
    }
  };

  const activitiesWithoutTrigger = calculatedActivities ? calculatedActivities.filter((activity) => activity.hasError) : [];

  if (loading) return <div className="text-gray-500 dark:text-gray-400 p-4">Lade...</div>;
  if (error) return <div className="text-red-500 dark:text-red-400 p-4">Fehler: {error}</div>;
  if (!entity) return <div className="text-gray-700 dark:text-gray-300 p-4">Entität nicht gefunden.</div>;

  return (
    <div className="min-h-screen flex justify-center pt-8 pb-4 px-4">
      <div className="w-full max-w-[1800px] min-w-[1200px]">
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl p-6">
          <h2 className="text-2xl font-bold mb-4 text-blue-600 dark:text-blue-400">
            {effectiveType === 'process' ? 'Prozessberechnung' : 'Projektberechnung'}: {entity.name || 'Kein Name'}
          </h2>

          <SimulationDataTable
            simulationData={simulationData}
            setSimulationData={setSimulationData}
            editIndex={editIndex}
            editedValues={editedValues}
            handleEdit={handleEdit}
            handleSave={handleSave}
            handleDeleteWorkProduct={handleDeleteWorkProduct}
            handleChange={handleChange}
            handleAddDialogOpen={handleAddDialogOpen}
          />

          <AddWorkProductDialog
            open={addDialogOpen}
            onClose={handleAddDialogClose}
            newWorkProduct={newWorkProduct}
            setNewWorkProduct={setNewWorkProduct}
            known={known}
            setKnown={setKnown}
            unknown={unknown}
            setUnknown={setUnknown}
            availableWorkProducts={availableWorkProducts}
            handleAddWorkProduct={handleAddWorkProduct}
          />

          {activitiesWithoutTrigger.length > 0 && (
            <div className="bg-yellow-100 dark:bg-yellow-900 border-l-4 border-yellow-500 dark:border-yellow-600 text-yellow-700 dark:text-yellow-300 p-4 mb-4">
              <p className="font-medium">Warnung</p>
              <p>Die folgenden Aktivitäten haben keinen Trigger und werden im Gantt-Diagramm nicht angezeigt:</p>
              <ul className="list-disc list-inside mt-2">
                {(activitiesWithoutTrigger || []).map((activity) => (
                  <li key={activity.id}>{activity.name}</li>
                ))}
              </ul>
            </div>
          )}

          <CalculationResultTable
            calculatedActivities={calculatedActivities}
            activities={activities}
            COST_THRESHOLD={COST_THRESHOLD}
            calculate={calculate}
          />

          <GanttChart calculatedActivities={calculatedActivities} />

          {effectiveType === 'project' && totalCost > 0 && entity && (
            <BudgetOverview entity={entity} totalCost={totalCost} />
          )}

          {effectiveType === 'project' && resourcesSummary.length > 0 && (
            <ResourcesSummary resourcesSummary={resourcesSummary} />
          )}

          <div className="mt-3">
            <button
              onClick={() => navigate(effectiveType === 'process' ? '/quality/processes' : '/projects')}
              className="px-4 py-2 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              Zurück zur {effectiveType === 'process' ? 'Prozessliste' : 'Projektliste'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProcessCalculation;