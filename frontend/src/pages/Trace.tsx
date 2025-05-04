import React, { useState, useEffect } from 'react';
import ReactFlow, { Background, Controls } from 'reactflow';
import 'reactflow/dist/style.css';
import { Box, Typography, List, ListItem, ListItemText } from '@mui/material';
import { Verified } from '@mui/icons-material';

const Trace = () => {
  const [regulatoryISOs, setRegulatoryISOs] = useState([]);
  const [requirements, setRequirements] = useState([]); // Aktuell angezeigte Requirements (mit Pagination)
  const [cachedRequirements, setCachedRequirements] = useState([]); // Alle Requirements für Zählerberechnung
  const [regulatoryEvaluations, setRegulatoryEvaluations] = useState([]);
  const [selectedRegulatory, setSelectedRegulatory] = useState(null);
  const [selectedRequirement, setSelectedRequirement] = useState(null);
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [loadingRequirements, setLoadingRequirements] = useState(false);
  const [page, setPage] = useState(1);
  const itemsPerPage = 20;

  useEffect(() => {
    fetchRegulatoryISOs();
  }, []);

  useEffect(() => {
    if (selectedRegulatory) {
      setPage(1); // Reset page to 1 when changing regulatory
      setRequirements([]); // Clear current requirements
      fetchRequirements(selectedRegulatory._id, 1); // Lade die erste Seite
      fetchAllRequirementsForCache(selectedRegulatory._id); // Lade den Rest in den Cache
      fetchRegulatoryEvaluations(selectedRegulatory._id); // Lade die Bewertungen
    } else {
      setRequirements([]);
      setCachedRequirements([]);
      setRegulatoryEvaluations([]);
      setNodes([]);
      setEdges([]);
    }
  }, [selectedRegulatory]);

  useEffect(() => {
    if (selectedRequirement) {
      buildFlowGraph();
    } else {
      setNodes([]);
      setEdges([]);
    }
  }, [selectedRequirement]);

  const fetchRegulatoryISOs = async () => {
    try {
      const response = await fetch('http://localhost:5001/api/regulatory-isos');
      if (!response.ok) throw new Error('Fehler beim Abrufen der Regulatorien');
      const data = await response.json();
      console.log('Regulatory ISOs:', data);
      setRegulatoryISOs(data);
    } catch (error) {
      console.error('Error fetching regulatory ISOs:', error);
    }
  };

  const fetchRequirements = async (regulatoryISOId, pageNum) => {
    setLoadingRequirements(true);
    try {
      const response = await fetch(`http://localhost:5001/api/regulatory-content?regulatoryISO=${regulatoryISOId}&page=${pageNum}&limit=${itemsPerPage}`);
      if (!response.ok) throw new Error('Fehler beim Abrufen der Inhaltselemente');
      const data = await response.json();
      console.log('Fetched requirements (Page ' + pageNum + '):', data);
      const requirementsData = data.filter(content => content.type === 'Requirement');
      console.log('Filtered requirements (Page ' + pageNum + '):', requirementsData);
      setRequirements(prev => pageNum === 1 ? requirementsData : [...prev, ...requirementsData]);
    } catch (error) {
      console.error('Error fetching requirements:', error);
    } finally {
      setLoadingRequirements(false);
    }
  };

  const fetchAllRequirementsForCache = async (regulatoryISOId) => {
    try {
      const response = await fetch(`http://localhost:5001/api/regulatory-content?regulatoryISO=${regulatoryISOId}`);
      if (!response.ok) throw new Error('Fehler beim Abrufen der Inhaltselemente für Cache');
      const data = await response.json();
      console.log('All contents from API:', data); // Debugging: Alle Inhaltselemente anzeigen
      data.forEach((content, index) => {
        console.log(`Content ${index + 1}:`, { id: content._id, text: content.text, type: content.type }); // Debugging: Type-Eigenschaft jedes Inhaltselements anzeigen
      });
      const requirementsData = data.filter(content => content.type === 'Requirement');
      console.log('Cached requirements:', requirementsData);
      setCachedRequirements(requirementsData);
    } catch (error) {
      console.error('Error fetching all requirements for cache:', error);
    }
  };

  const fetchRegulatoryEvaluations = async (regulatoryISOId) => {
    try {
      const contents = await fetch(`http://localhost:5001/api/regulatory-content?regulatoryISO=${regulatoryISOId}`).then(res => res.json());
      const contentIds = contents.map(content => content._id);
      const response = await fetch('http://localhost:5001/api/regulatory-evaluations');
      if (!response.ok) throw new Error('Fehler beim Abrufen der Bewertungen');
      const data = await response.json();
      const filteredEvaluations = data.filter(evaluation => evaluation.regulatoryContent && contentIds.includes(evaluation.regulatoryContent._id));
      console.log('Filtered Regulatory Evaluations:', filteredEvaluations);
      setRegulatoryEvaluations(filteredEvaluations);
    } catch (error) {
      console.error('Error fetching regulatory evaluations:', error);
    }
  };

  const buildFlowGraph = () => {
    if (!selectedRequirement) return;

    const evaluation = regulatoryEvaluations.find(evaluation => evaluation.regulatoryContent._id === selectedRequirement._id);
    const nodes = [];
    const edges = [];

    // Haupt-Requirement-Node
    nodes.push({
      id: 'req',
      data: { label: selectedRequirement.text },
      position: { x: 0, y: 0 },
      style: { backgroundColor: '#ffcc80', border: '1px solid #ff9800' },
    });

    // Evidences
    let xOffset = 200;
    let yOffset = 0;

    if (evaluation) {
      // Rollen
      evaluation.evidencedBy.roles.forEach((role, index) => {
        const nodeId = `role-${index}`;
        nodes.push({
          id: nodeId,
          data: { label: role.name },
          position: { x: xOffset, y: yOffset },
          style: { backgroundColor: '#90caf9', border: '1px solid #2196f3' },
        });
        edges.push({
          id: `e-req-${nodeId}`,
          source: 'req',
          target: nodeId,
          type: 'smoothstep',
        });
        yOffset += 100;
      });

      // Prozesse
      evaluation.evidencedBy.processes.forEach((process, index) => {
        const nodeId = `process-${index}`;
        nodes.push({
          id: nodeId,
          data: { label: process.name },
          position: { x: xOffset, y: yOffset },
          style: { backgroundColor: '#a5d6a7', border: '1px solid #4caf50' },
        });
        edges.push({
          id: `e-req-${nodeId}`,
          source: 'req',
          target: nodeId,
          type: 'smoothstep',
        });
        yOffset += 100;
      });

      // Aktivitäten
      evaluation.evidencedBy.activities.forEach((activity, index) => {
        const nodeId = `activity-${index}`;
        nodes.push({
          id: nodeId,
          data: { label: activity.name },
          position: { x: xOffset, y: yOffset },
          style: { backgroundColor: '#f48fb1', border: '1px solid #e91e63' },
        });
        edges.push({
          id: `e-req-${nodeId}`,
          source: 'req',
          target: nodeId,
          type: 'smoothstep',
        });
        yOffset += 100;
      });

      // Work Products
      evaluation.evidencedBy.workProducts.forEach((wp, index) => {
        const nodeId = `wp-${index}`;
        nodes.push({
          id: nodeId,
          data: { label: wp.name },
          position: { x: xOffset, y: yOffset },
          style: { backgroundColor: '#ce93d8', border: '1px solid #9c27b0' },
        });
        edges.push({
          id: `e-req-${nodeId}`,
          source: 'req',
          target: nodeId,
          type: 'smoothstep',
        });
        yOffset += 100;
      });
    }

    setNodes(nodes);
    setEdges(edges);
  };

  return (
    <Box sx={{ display: 'flex', height: 'calc(100vh - 80px)', padding: 2 }}>
      {/* Linke Spalte - Liste der Regulatorien */}
      <Box sx={{ width: '200px', borderRight: '1px solid #ccc', pr: 2, overflowY: 'auto' }}>
        <Typography variant="h6">Regulatorien</Typography>
        <List>
          {regulatoryISOs.map(iso => (
            <ListItem
              key={iso._id}
              button
              selected={selectedRegulatory && selectedRegulatory._id === iso._id}
              onClick={() => {
                setSelectedRegulatory(iso);
                setSelectedRequirement(null);
              }}
            >
              <ListItemText primary={iso.name} />
            </ListItem>
          ))}
        </List>
      </Box>

      {/* Mittlere Spalte - Liste der Requirements */}
      <Box sx={{ width: '250px', px: 2, borderRight: '1px solid #ccc', overflowY: 'auto' }}>
        <Typography variant="h6">Requirements</Typography>
        {selectedRegulatory ? (
          loadingRequirements && cachedRequirements.length === 0 ? (
            <Typography>Lade Requirements...</Typography>
          ) : cachedRequirements.length === 0 ? (
            <Typography>Keine Requirements verfügbar.</Typography>
          ) : (
            <List>
              {cachedRequirements.map(content => (
                <ListItem
                  key={content._id}
                  button
                  selected={selectedRequirement && selectedRequirement._id === content._id}
                  onClick={() => setSelectedRequirement(content)}
                >
                  <Verified sx={{ color: 'blue', mr: 1 }} />
                  <ListItemText primary={content.text} />
                </ListItem>
              ))}
            </List>
          )
        ) : (
          <Typography>Wähle eine Regulatorie aus der Liste</Typography>
        )}
      </Box>

      {/* Rechte Spalte - ReactFlow-Diagramm */}
      <Box sx={{ width: '900px', height: '100%' }}>
        <Typography variant="h6">Trace</Typography>
        {selectedRequirement ? (
          <div style={{ width: '100%', height: '900px' }}>
            <ReactFlow
              nodes={nodes}
              edges={edges}
              fitView
              style={{ width: '100%', height: '100%' }}
            >
              <Background />
              <Controls />
            </ReactFlow>
          </div>
        ) : (
          <Typography>Wähle ein Requirement aus der Liste</Typography>
        )}
      </Box>
    </Box>
  );
};

export default Trace;