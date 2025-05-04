import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { calculateProcess } from '../../../utils/calculateProcess';
import SimulationDataTable from '../components/SimulationDataTable';
import AddWorkProductDialog from '../components/AddWorkProductDialog';
import CalculationResultTable from '../components/CalculationResultTable';
import GanttChart from '../components/GanttChart';
import BudgetOverview from '../components/BudgetOverview';
import ResourcesSummary from '../components/ResourcesSummary';
import '@syncfusion/ej2-base/styles/material.css';
import '@syncfusion/ej2-buttons/styles/material.css';
import '@syncfusion/ej2-calendars/styles/material.css';
import '@syncfusion/ej2-dropdowns/styles/material.css';
import '@syncfusion/ej2-inputs/styles/material.css';
import '@syncfusion/ej2-lists/styles/material.css';
import '@syncfusion/ej2-navigations/styles/material.css';
import '@syncfusion/ej2-popups/styles/material.css';
import '@syncfusion/ej2-splitbuttons/styles/material.css';
import '@syncfusion/ej2-grids/styles/material.css';
import '@syncfusion/ej2-treegrid/styles/material.css';
import '@syncfusion/ej2-react-gantt/styles/material.css';

const ProcessCalculation = () => {
  const { id, type } = useParams();
  const navigate = useNavigate();
  const [entity, setEntity] = useState(null);
  const [activities, setActivities] = useState([]);
  const [releases, setReleases] = useState([]);
  const [workProducts, setWorkProducts] = useState([]);
  const [simulationData, setSimulationData] = useState(() => {
    const savedData = localStorage.getItem(`simulationData_${id}`);
    return savedData ? JSON.parse(savedData) : { workProducts: [] };
  });
  const [calculatedActivities, setCalculatedActivities] = useState([]);
  const [resourcesSummary, setResourcesSummary] = useState([]);
  const [totalCost, setTotalCost] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newWorkProduct, setNewWorkProduct] = useState(null);
  const [known, setKnown] = useState('');
  const [unknown, setUnknown] = useState('');
  const [editIndex, setEditIndex] = useState(null);
  const [editedValues, setEditedValues] = useState({ known: '', unknown: '' });
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [availableWorkProducts, setAvailableWorkProducts] = useState([]);
  const COST_THRESHOLD = 2000;

  const effectiveType = type && (type === 'process' || type === 'project') ? type : 'process';

  useEffect(() => {
    const fetchData = async () => {
      try {
        let entityResponse, releasesResponse, activitiesResponse;

        console.log('Type:', type, 'Effective Type:', effectiveType, 'ID:', id);

        if (effectiveType === 'process') {
          entityResponse = await fetch(`http://localhost:5001/api/processes/${id}`).then(r => {
            if (!r.ok) throw new Error(`Fehler beim Laden des Prozesses: ${r.statusText}`);
            return r.json();
          });
          activitiesResponse = await fetch('http://localhost:5001/api/activities').then(r => {
            if (!r.ok) throw new Error(`Fehler beim Laden der Aktivitäten: ${r.statusText}`);
            return r.json();
          });
          const processActivities = activitiesResponse.filter((a: any) => (a.process?._id?.toString() || a.process?.toString()) === id) || [];
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
        setWorkProducts(workProductsResponse);

        const wpList = workProductsResponse.map((wp: any) => ({
          _id: wp._id,
          label: wp.name,
        }));
        setAvailableWorkProducts(wpList);
        setLoading(false);
      } catch (err) {
        setError(err.message);
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
    localStorage.setItem(`simulationData_${id}`, JSON.stringify(simulationData));
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
        name: newWorkProduct.label,
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

  const handleEdit = (index: any) => {
    setEditIndex(index);
    const wp = simulationData.workProducts[index];
    setEditedValues({ known: wp.known || '', unknown: wp.unknown || '' });
  };

  const handleSave = (index: any) => {
    const updatedWorkProducts = [...simulationData.workProducts];
    updatedWorkProducts[index] = { ...updatedWorkProducts[index], known: parseFloat(editedValues.known), unknown: parseFloat(editedValues.unknown) };
    setSimulationData({ ...simulationData, workProducts: updatedWorkProducts });
    setEditIndex(null);
  };

  const handleDeleteWorkProduct = (index: any) => {
    const updatedWorkProducts = simulationData.workProducts.filter((_: any, i: any) => i !== index);
    setSimulationData({ ...simulationData, workProducts: updatedWorkProducts });
  };

  const handleChange = (e: any) => {
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
      const result = await calculateProcess(activities, simulationData, new Date(), id, releases, effectiveType === 'project' ? entity.plannedBudget : null);
      let formattedResult;
      if (Array.isArray(result)) {
        formattedResult = result.map((activity: any) => {
          const startDate = new Date(activity.start);
          const endDate = new Date(activity.end);
          const originalActivity = activities.find((a: any) => a._id === activity.id) || {};
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
            hasError: !originalActivity.trigger?.workProducts?.length,
            triggeredBy: originalActivity.trigger?.workProducts?.length ? originalActivity.trigger.workProducts : null,
          };
        });
        setCalculatedActivities(formattedResult);
        setResourcesSummary([]);
        setTotalCost(0);
      } else {
        const { calculatedActivities, resourcesSummary, totalCost } = result;
        formattedResult = calculatedActivities.map((activity: any) => {
          const startDate = new Date(activity.start);
          const endDate = new Date(activity.end);
          const originalActivity = activities.find((a: any) => a._id === activity.id) || {};
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
            hasError: !originalActivity.trigger?.workProducts?.length,
            triggeredBy: originalActivity.trigger?.workProducts?.length ? originalActivity.trigger.workProducts : null,
          };
        });
        setCalculatedActivities(formattedResult);
        setResourcesSummary(resourcesSummary || []);
        setTotalCost(totalCost || 0);

        if (effectiveType === 'project') {
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
      setError(error.message);
    }
  };

  const ganttData = calculatedActivities
    .filter((activity: any) => !activity.hasError)
    .map((activity: any) => ({
      TaskID: activity.id,
      TaskName: activity.name,
      StartDate: new Date(activity.start),
      EndDate: new Date(activity.end),
      Duration: activity.duration,
      Cost: activity.cost,
      HasStartConflict: activity.startConflict,
      DateConflict: activity.dateConflict || false,
    }));

  const activitiesWithoutTrigger = calculatedActivities ? calculatedActivities.filter((activity: any) => activity.hasError) : [];

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
                {(activitiesWithoutTrigger || []).map((activity: any) => (
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

          {effectiveType === 'project' && totalCost > 0 && (
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