// features/engineering/pages/EngineeringPage.jsx
import React, { useState, useEffect } from 'react';
import { Box, Typography } from '@mui/material'; // Füge Typography hinzu
import RequirementsTree from '../components/RequirementsTree';
import RequirementEvaluation from '../components/RequirementEvaluation';

// Beispiel: ErrorBoundary-Komponente
const ErrorBoundary = ({ children }) => {
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const handleError = (error, info) => {
      console.error('ErrorBoundary caught an error:', error, info);
      setHasError(true);
    };
    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, []);

  if (hasError) {
    return <Typography>Ein Fehler ist aufgetreten.</Typography>;
  }
  return children;
};

const EngineeringPage = ({ setSelectedProject: setSelectedProjectGlobal }) => {
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [projectData, setProjectData] = useState(null);
  const [processedCustomerRequirements, setProcessedCustomerRequirements] = useState([]);
  const [processedSystemRequirements, setProcessedSystemRequirements] = useState([]);
  const [selectedRequirement, setSelectedRequirement] = useState(null);
  const [contextCustomerRequirement, setContextCustomerRequirement] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [rflpData, setRflpData] = useState({});
  const [classification, setClassification] = useState('');
  const [allItems, setAllItems] = useState([]);

  useEffect(() => {
    const storedRflpData = localStorage.getItem('rflpData');
    if (storedRflpData) {
      setRflpData(JSON.parse(storedRflpData));
    }
  }, []);

  useEffect(() => {
    if (rflpData) {
      setProjects(Object.keys(rflpData).map(id => ({ id, name: rflpData[id].name || 'Unbenanntes Projekt' })));
    }
  }, [rflpData]);

  useEffect(() => {
    if (selectedProject && rflpData[selectedProject]) {
      setProjectData(rflpData[selectedProject]);
      setProcessedCustomerRequirements(rflpData[selectedProject].customerRequirements || []);
      setProcessedSystemRequirements(rflpData[selectedProject].systemRequirements || []);

      // Initialisiere allItems mit den Kundenanforderungen aus rflpData
      const customerItems = (rflpData[selectedProject].customerRequirements || []).map(req => ({
        id: req.id,
        text: req.name || req.text || req.header || 'Unbenanntes Element',
        type: req.type || req.classification || 'Requirement',
        classification: req.classification || '',
        completed: req.completed || false,
        groupId: null,
      }));
      setAllItems(customerItems);

      // Setze selectedProject im globalen State
      setSelectedProjectGlobal(selectedProject);
    } else {
      setProjectData(null);
      setProcessedCustomerRequirements([]);
      setProcessedSystemRequirements([]);
      setAllItems([]);
      setSelectedProjectGlobal(null);
    }
  }, [selectedProject, rflpData, setSelectedProjectGlobal]);

  return (
    <ErrorBoundary>
      <Box sx={{ display: 'flex', height: '100vh' }}>
        <RequirementsTree
          projects={projects}
          selectedProject={selectedProject}
          setSelectedProject={setSelectedProject}
          projectData={projectData}
          processedCustomerRequirements={processedCustomerRequirements}
          processedSystemRequirements={processedSystemRequirements}
          selectedRequirement={selectedRequirement}
          setSelectedRequirement={setSelectedRequirement}
          setContextCustomerRequirement={setContextCustomerRequirement}
          dialogOpen={dialogOpen}
          setDialogOpen={setDialogOpen}
          navigate={navigate}
          setAllItems={setAllItems}
        />
        <RequirementEvaluation
          selectedRequirement={selectedRequirement}
          setSelectedRequirement={setSelectedRequirement}
          classification={classification}
          setClassification={setClassification}
          rflpData={rflpData}
          setRflpData={setRflpData}
          selectedProject={selectedProject}
          dialogOpen={dialogOpen}
          setDialogOpen={setDialogOpen}
          contextCustomerRequirement={contextCustomerRequirement}
          setContextCustomerRequirement={setContextCustomerRequirement}
          allItems={allItems}
          setAllItems={setAllItems}
        />
      </Box>
    </ErrorBoundary>
  );
};

// Beispiel für navigate (falls erforderlich)
const navigate = (path) => {
  window.location.href = path; // Ersetze dies durch die tatsächliche Navigation (z. B. react-router-dom)
};

export default EngineeringPage;