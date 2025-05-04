import React, { useState, useEffect, useCallback } from 'react';
import { ReactFlow, Background, Controls, useNodesState, useEdgesState, applyNodeChanges, applyEdgeChanges } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Box, Typography, Slider, FormControl, FormLabel } from '@mui/material';

const CustomNode = ({ data }) => {
  return (
    <div style={{
      padding: 10,
      border: '1px solid #ccc',
      borderRadius: 5,
      backgroundColor: data.backgroundColor,
      width: data.width,
      position: 'relative',
    }}>
      <div style={{ fontWeight: 'bold', marginBottom: 5 }}>{data.label}</div>
      <div style={{ fontSize: 12, color: '#666', position: 'absolute', bottom: 5, right: 5 }}>
        Eigentümer: {data.owner}
      </div>
    </div>
  );
};

const nodeTypes = { custom: CustomNode };

const Compliance = () => {
  const [processes, setProcesses] = useState([]);
  const [roles, setRoles] = useState([]);
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const [nodeWidth, setNodeWidth] = useState(() => {
    const savedWidth = localStorage.getItem('complianceNodeWidth');
    return savedWidth ? parseInt(savedWidth, 10) : 300;
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        const [processesResponse, rolesResponse] = await Promise.all([
          fetch('http://localhost:5001/api/processes').then(res => res.json()),
          fetch('http://localhost:5001/api/roles').then(res => res.json()),
        ]);
        console.log('Processes:', processesResponse);
        console.log('Roles:', rolesResponse);
        setProcesses(processesResponse);
        setRoles(rolesResponse);
        setIsDataLoaded(true);
      } catch (error) {
        console.error('Error loading data:', error);
        setIsDataLoaded(true);
      }
    };
    loadData();
  }, []);

  // Speichere die Breite im localStorage
  useEffect(() => {
    localStorage.setItem('complianceNodeWidth', nodeWidth.toString());
  }, [nodeWidth]);

  // Lade gespeicherte Positionen aus dem localStorage
  const loadSavedPositions = () => {
    const savedPositions = localStorage.getItem('complianceNodePositions');
    return savedPositions ? JSON.parse(savedPositions) : {};
  };

  // Speichere Positionen im localStorage
  const savePositions = useCallback((nodes) => {
    const positions = {};
    nodes.forEach(node => {
      positions[node.id] = { x: node.position.x, y: node.position.y };
    });
    localStorage.setItem('complianceNodePositions', JSON.stringify(positions));
  }, []);

  useEffect(() => {
    if (isDataLoaded && processes.length > 0 && roles.length > 0) {
      buildProcessFlow();
    }
  }, [isDataLoaded, processes, roles, nodeWidth]);

  const buildProcessFlow = () => {
    const savedPositions = loadSavedPositions();
    const nodes = [];
    const edges = [];

    // Organisiere Prozesse in eine Hierarchie
    const processMap = new Map();
    processes.forEach(process => {
      processMap.set(process._id, { ...process, children: [] });
    });

    const hierarchy = [];
    processes.forEach(process => {
      if (process.isChildOf) {
        const parent = processMap.get(process.isChildOf._id);
        if (parent) {
          parent.children.push(processMap.get(process._id));
        }
      } else {
        hierarchy.push(processMap.get(process._id));
      }
    });

    // Erstelle Knoten für Prozesse und Unterprozesse
    let yOffset = 0;
    hierarchy.forEach((process, index) => {
      const ownerId = process.owner?._id;
      const backgroundColor = getColorForOwner(ownerId);
      const ownerName = process.owner?.name || 'Unbekannt';

      // Hauptebene-Prozess
      const processNodeId = `process-${process._id}`;
      const savedPosition = savedPositions[processNodeId] || { x: 0, y: yOffset };
      nodes.push({
        id: processNodeId,
        type: 'custom',
        data: {
          label: process.name || 'Unbekannter Prozess',
          owner: ownerName,
          backgroundColor,
          width: nodeWidth,
        },
        position: savedPosition,
        draggable: true,
      });

      yOffset += 100;

      // Unterprozesse
      if (process.children && process.children.length > 0) {
        process.children.forEach((child, childIndex) => {
          const childNodeId = `process-${child._id}`;
          const childSavedPosition = savedPositions[childNodeId] || { x: 200, y: yOffset };
          nodes.push({
            id: childNodeId,
            type: 'custom',
            data: {
              label: child.name || 'Unbekannter Prozess',
              owner: ownerName,
              backgroundColor,
              width: nodeWidth,
            },
            position: childSavedPosition,
            draggable: true,
          });

          // Kante zwischen Hauptebene-Prozess und Unterprozess
          edges.push({
            id: `e-${processNodeId}-${childNodeId}`,
            source: processNodeId,
            target: childNodeId,
            type: 'smoothstep',
            animated: true,
          });

          yOffset += 100;
        });
      }

      // Kante zwischen Hauptebene-Prozessen
      if (index < hierarchy.length - 1) {
        const nextProcess = hierarchy[index + 1];
        const nextProcessNodeId = `process-${nextProcess._id}`;
        edges.push({
          id: `e-${processNodeId}-${nextProcessNodeId}`,
          source: processNodeId,
          target: nextProcessNodeId,
          type: 'smoothstep',
          animated: true,
        });
      }
    });

    console.log('Nodes:', nodes);
    console.log('Edges:', edges);

    setNodes(nodes);
    setEdges(edges);
  };

  // Farbzuordnung für Eigentümer (Rollen)
  const getColorForOwner = (ownerId) => {
    switch (ownerId) {
      case '67e1833eb5abb2fe1e56f62f': // Geschäftsführung
        return '#90caf9'; // Blau
      case '67e18360b5abb2fe1e56f631': // Operations
        return '#a5d6a7'; // Grün
      case '67e18389b5abb2fe1e56f63d': // Admin Chief
        return '#fff59d'; // Gelb
      default:
        return '#e0e0e0'; // Grau für unbekannte Eigentümer
    }
  };

  const handleWidthChange = (event, newValue) => {
    setNodeWidth(newValue);
  };

  const onNodesChangeHandler = useCallback((changes) => {
    setNodes((nds) => {
      const updatedNodes = applyNodeChanges(changes, nds);
      savePositions(updatedNodes);
      return updatedNodes;
    });
  }, [setNodes, savePositions]);

  const onEdgesChangeHandler = useCallback((changes) => {
    setEdges((eds) => applyEdgeChanges(changes, eds));
  }, [setEdges]);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', width: '1000px', height: 'calc(100vh - 80px)', padding: 2, backgroundColor: '#f5f5f5' }}>
      <Typography variant="h4" sx={{ mb: 2, color: '#333' }}>Compliance</Typography>
      <Box sx={{ mb: 2 }}>
        <FormControl sx={{ width: '300px' }}>
          <FormLabel>Breite der Prozesse anpassen</FormLabel>
          <Slider
            value={nodeWidth}
            onChange={handleWidthChange}
            min={200}
            max={800}
            step={10}
            valueLabelDisplay="auto"
            sx={{ mt: 1 }}
          />
        </FormControl>
      </Box>
      <Box sx={{ flex: 1, backgroundColor: '#ffffff', boxShadow: '0 2px 5px rgba(0,0,0,0.1)', borderRadius: 2 }}>
        {isDataLoaded ? (
          nodes.length > 0 ? (
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChangeHandler}
              onEdgesChange={onEdgesChangeHandler}
              nodeTypes={nodeTypes}
              fitView
              style={{ width: '100%', height: '100%' }}
            >
              <Background />
              <Controls />
            </ReactFlow>
          ) : (
            <Typography sx={{ p: 2, color: '#666' }}>Keine Prozesse verfügbar</Typography>
          )
        ) : (
          <Typography sx={{ p: 2, color: '#666' }}>Lade Daten...</Typography>
        )}
      </Box>
    </Box>
  );
};

export default Compliance;