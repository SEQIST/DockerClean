// features/engineering/pages/SystemRequirementsPage.jsx
import React, { useState, useEffect } from 'react';
import { Box, Typography } from '@mui/material';
import RequirementsTree from '../components/RequirementsTree';
import RequirementEvaluation from '../components/RequirementEvaluation';
import { useParams } from 'react-router-dom';

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

const SystemRequirementsPage = ({ setSelectedProject: setSelectedProjectGlobal }) => {
  const { projectId } = useParams(); // Hole projectId aus der URL
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(projectId || null);
  const [projectData, setProjectData] = useState(null);
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
      const systemRequirements = rflpData[selectedProject].systemRequirements || [];
      // Stelle sicher, dass systemRequirements korrekt formatiert ist
      const formattedSystemRequirements = systemRequirements.map(req => ({
        ...req,
        id: req.id,
        text: req.text || req.header || 'Unbenanntes Element',
        type: req.type || req.classification || 'Requirement',
        classification: req.classification || '',
        completed: req.completed || false,
        groupId: req.parentId ? `system-group-${req.parentId}` : null,
        ungrouped: req.parentId ? undefined : [req], // Für ungruppierte Elemente
        groups: req.parentId ? [{ id: req.parentId, name: `Systemanforderung (Parent: ${req.parentId})`, items: [req] }] : undefined,
      }));
      setProcessedSystemRequirements(formattedSystemRequirements);

      // Initialisiere allItems mit den Systemanforderungen aus rflpData
      const systemItems = formattedSystemRequirements.map(req => ({
        id: req.id,
        text: req.header || req.text || 'Unbenanntes Element',
        type: req.type || req.classification || 'Requirement',
        classification: req.classification || '',
        completed: req.completed || false,
        groupId: req.parentId ? `system-group-${req.parentId}` : null,
      }));
      setAllItems(systemItems);

      // Setze selectedProject im globalen State
      setSelectedProjectGlobal(selectedProject);
    } else {
      setProjectData(null);
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
          processedCustomerRequirements={[]}
          processedSystemRequirements={processedSystemRequirements}
          selectedRequirement={selectedRequirement}
          setSelectedRequirement={setSelectedRequirement}
          setContextCustomerRequirement={setContextCustomerRequirement}
          dialogOpen={dialogOpen}
          setDialogOpen={setDialogOpen}
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

export default SystemRequirementsPage;