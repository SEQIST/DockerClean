import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Typography, Button, Tabs, Tab } from '@mui/material';
import ProcessEditTab from '../features/processes/components/ProcessEditTab';
import SimulationDataTab from './SimulationDataTab';
import CalculationResultTab from './CalculationResultTab';
import GanttTab from './GanttTab';

const ProcessSimulation = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [process, setProcess] = useState(null);
  const [roles, setRoles] = useState([]);
  const [activities, setActivities] = useState([]);
  const [workProducts, setWorkProducts] = useState([]);
  const [simulationData, setSimulationData] = useState(() => {
    // Lade Simulationsdaten aus localStorage, falls vorhanden
    const savedData = localStorage.getItem(`simulationData_${id}`);
    return savedData
      ? JSON.parse(savedData)
      : {
          workProducts: [
            { _id: '67dffd54e763d71a7066e226', name: 'Start WP für Process Test', known: 10, unknown: 10 }
          ]
        };
  });
  const [calculatedActivities, setCalculatedActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const [hasMounted, setHasMounted] = useState(false);

  console.log('ProcessSimulation.jsx: Component loaded'); // Debugging-Log

  useEffect(() => {
    if (hasMounted) return;
    setHasMounted(true);

    const fetchData = async () => {
      try {
        const [processResponse, activitiesResponse, workProductsResponse, rolesResponse] = await Promise.all([
          fetch(`http://localhost:5001/api/processes/${id}`).then(r => {
            if (!r.ok) throw new Error(`Fehler beim Laden des Prozesses: ${r.statusText}`);
            return r.json();
          }),
          fetch('http://localhost:5001/api/activities').then(r => {
            if (!r.ok) throw new Error(`Fehler beim Laden der Aktivitäten: ${r.statusText}`);
            return r.json();
          }),
          fetch('http://localhost:5001/api/workproducts').then(r => {
            if (!r.ok) throw new Error(`Fehler beim Laden der Work Products: ${r.statusText}`);
            return r.json();
          }),
          fetch('http://localhost:5001/api/roles').then(r => {
            if (!r.ok) throw new Error(`Fehler beim Laden der Rollen: ${r.statusText}`);
            return r.json();
          }),
        ]);

        console.log('Geladener Prozess:', processResponse);
        console.log('Geladene Aktivitäten:', activitiesResponse);
        console.log('Geladene Work Products:', workProductsResponse);
        console.log('Geladene Rollen:', rolesResponse);

        setProcess(processResponse);
        setActivities(activitiesResponse.filter(a => (a.process?._id?.toString() || a.process?.toString()) === id) || []);
        setWorkProducts(workProductsResponse || []);
        setRoles(rolesResponse || []);
        setLoading(false);
      } catch (error) {
        console.error('Fehler beim Laden der Daten:', error);
        setError(error.message);
        setLoading(false);
      }
    };

    console.log('ProcessSimulation.jsx: Fetching data for processId:', id); // Debugging-Log
    fetchData();
  }, [id, hasMounted]);

  useEffect(() => {
    if (process) {
      document.title = `Prozesssimulation: ${process.name}`; // Dynamisch den Titel setzen
    }
  }, [process]);

  // Speichere Simulationsdaten in localStorage, wenn sie sich ändern
  useEffect(() => {
    localStorage.setItem(`simulationData_${id}`, JSON.stringify(simulationData));
    console.log('ProcessSimulation.jsx: Saved Simulation Data to localStorage:', simulationData);
  }, [simulationData, id]);

  const handleTabChange = (event, newValue) => {
    console.log('ProcessSimulation.jsx: Tab gewechselt zu:', newValue); // Debugging-Log
    setTabValue(newValue);
  };

  console.log('ProcessSimulation.jsx: Rendering component'); // Debugging-Log
  console.log('ProcessSimulation.jsx: tabValue:', tabValue); // Debugging-Log

  if (loading) {
    console.log('ProcessSimulation.jsx: Rendering loading state'); // Debugging-Log
    return <Typography>Lade Prozess...</Typography>;
  }
  if (error) {
    console.log('ProcessSimulation.jsx: Rendering error state:', error); // Debugging-Log
    return <Typography sx={{ color: 'red' }}>Fehler: {error}</Typography>;
  }
  if (!process) {
    console.log('ProcessSimulation.jsx: Rendering no process state'); // Debugging-Log
    return <Typography>Prozess nicht gefunden.</Typography>;
  }

  console.log('ProcessSimulation.jsx: Rendering main content'); // Debugging-Log
  console.log('ProcessSimulation.jsx: Activities:', activities); // Debugging-Log
  console.log('ProcessSimulation.jsx: Work Products:', workProducts); // Debugging-Log
  console.log('ProcessSimulation.jsx: Simulation Data:', simulationData); // Debugging-Log
  console.log('ProcessSimulation.jsx: Calculated Activities:', calculatedActivities); // Debugging-Log

  return (
    <Box sx={{ padding: 4, maxWidth: 1200, margin: '0 auto', minHeight: '100vh' }}>
      <Typography variant="h4" gutterBottom sx={{ color: '#1976d2', fontWeight: 'bold' }}>
        Prozesssimulation: {process.name || 'Kein Name'}
      </Typography>

      {/* Tabs */}
      <Tabs value={tabValue} onChange={handleTabChange} sx={{ mb: 2, borderBottom: '1px solid #1976d2' }}>
        <Tab label="Process Edit" sx={{ fontSize: '0.9rem' }} />
        <Tab label="Simulation Data" sx={{ fontSize: '0.9rem' }} />
        <Tab label="Calculation Result" sx={{ fontSize: '0.9rem' }} />
        <Tab label="Gantt" sx={{ fontSize: '0.9rem' }} />
      </Tabs>

      {tabValue === 0 && (
        <ProcessEditTab
          process={process}
          setProcess={setProcess}
          activities={activities}
          setActivities={setActivities}
          roles={roles}
          error={error}
          setError={setError}
        />
      )}

      {tabValue === 1 && (
        <SimulationDataTab
          simulationData={simulationData}
          setSimulationData={setSimulationData}
          activities={activities}
          workProducts={workProducts}
        />
      )}

      {tabValue === 2 && (
        <CalculationResultTab
          activities={activities}
          simulationData={simulationData}
          setCalculatedActivities={setCalculatedActivities}
        />
      )}

      {tabValue === 3 && (
        <GanttTab activities={calculatedActivities} />
      )}

      <Box sx={{ mt: 3 }}>
        <Button variant="outlined" onClick={() => navigate('/quality/processes')} sx={{ fontSize: '0.9rem', padding: '4px 8px' }}>
          Zurück zur Prozessliste
        </Button>
      </Box>
    </Box>
  );
};

export default ProcessSimulation;