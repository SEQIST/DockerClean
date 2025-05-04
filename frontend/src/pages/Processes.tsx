import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, Divider } from '@mui/material';
import { Add } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { SimpleTreeView, TreeItem } from '@mui/x-tree-view';

const Processes = () => {
  const [processes, setProcesses] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = () => {
    setLoading(true);
    setError(null);
    Promise.all([
      fetch('http://localhost:5001/api/processes').then(r => {
        if (!r.ok) {
          if (r.status === 404) throw new Error('Keine Prozesse gefunden');
          throw new Error(`HTTP-Fehler! Status: ${r.status} - ${r.statusText}`);
        }
        return r.json();
      }),
      fetch('http://localhost:5001/api/roles').then(r => {
        if (!r.ok) throw new Error(`HTTP-Fehler! Status: ${r.status} - ${r.statusText}`);
        return r.json();
      }),
    ])
      .then(([processesData, rolesData]) => {
        console.log('Processes Data:', processesData);
        console.log('Roles Data:', rolesData);
        setProcesses(processesData || []);
        setRoles(rolesData || []);
        setLoading(false);
      })
      .catch(error => {
        console.error('Fehler beim Laden der Daten:', error);
        setError(error.message);
        setProcesses([]);
        setRoles([]);
        setLoading(false);
      });
  };

  const handleAddProcess = () => {
    console.log('Navigating to /create-process');
    navigate('/create-process');
  };

  const handleViewProcess = (processId) => {
    console.log('Navigating to /processes/:id with processId:', processId);
    navigate(`/processes/${processId.toString()}`);
  };

  const handleSimulateProcess = (processId) => {
    console.log('Navigating to /process-calculation/process/:id with processId:', processId);
    navigate(`/process-calculation/process/${processId.toString()}`);
  };

  // Funktion zum Erstellen der hierarchischen Struktur für den TreeView
  const buildTreeData = (processes) => {
    const processMap = new Map();
    const treeData = [];

    processes.forEach((process, index) => {
      const ownerObj = process.owner || {};
      const ownerId = ownerObj._id?.toString() || ownerObj.toString() || '';
      const owner = ownerObj.name || (roles.find(role => role._id?.toString() === ownerId)?.name || 'Kein Eigentümer');

      const nodeId = process._id ? process._id.toString() : `temp-${index}-${Math.random()}`;
      console.log(`Process ID for ${process.name}: ${nodeId}`);

      const node = {
        id: nodeId,
        name: process.name || 'Kein Name',
        abbreviation: process.abbreviation || 'Keine',
        owner: owner,
        children: [],
      };
      processMap.set(nodeId, node);
    });

    processes.forEach((process, index) => {
      const nodeId = process._id ? process._id.toString() : `temp-${index}-${Math.random()}`;
      const parentId = process.isChildOf?._id?.toString() || process.isChildOf?.toString() || null;
      const node = processMap.get(nodeId);
      if (parentId && processMap.has(parentId)) {
        processMap.get(parentId).children.push(node);
      } else {
        treeData.push(node);
      }
    });

    treeData.sort((a, b) => a.name.localeCompare(b.name));
    console.log('Tree Data:', treeData);
    return treeData;
  };

  // Rekursive Funktion zum Rendern der TreeItems
  const renderTreeItems = (nodes) => {
    console.log('Rendering Tree Items:', nodes);
    if (!nodes || nodes.length === 0) {
      return <Typography>Keine Prozesse gefunden.</Typography>;
    }

    return nodes.map(node => (
      <TreeItem
        key={node.id}
        itemId={node.id}
        label={
          <div style={{ display: 'flex', alignItems: 'left', justifyContent: 'space-between', width: '100%', padding: '5px 0' }}>
            <span style={{ fontWeight: 'bold', color: '#1976d2', flex: '1' }}>{node.name}</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flex: '2', justifyContent: 'flex-end' }}>
              <span style={{ minWidth: '250px' }}>Abk.: {node.abbreviation}</span>
              <span style={{ minWidth: '250px' }}>Eigentümer: {node.owner}</span>
              <div style={{ display: 'flex', gap: '10px' }}>
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleViewProcess(node.id);
                  }}
                  size="small"
                  variant="outlined"
                  sx={{ 
                    color: '#1976d2', 
                    borderColor: '#1976d2', 
                    textTransform: 'none',
                    padding: '2px 8px',
                    fontSize: '0.75rem',
                  }}
                >
                  Bearbeiten
                </Button>
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSimulateProcess(node.id);
                  }}
                  size="small"
                  variant="contained"
                  sx={{ 
                    backgroundColor: '#1976d2', 
                    color: '#fff', 
                    textTransform: 'none',
                    padding: '2px 8px',
                    fontSize: '0.75rem',
                  }}
                >
                  Simulieren
                </Button>
              </div>
            </div>
          </div>
        }
      >
        {node.children && node.children.length > 0 ? renderTreeItems(node.children) : null}
      </TreeItem>
    ));
  };

  const getItemId = (item) => {
    console.log('getItemId called with item:', item);
    return item.id;
  };

  console.log('Rendering Processes component');

  if (loading) return <Typography>Lade Prozesse...</Typography>;
  if (error) return <Typography sx={{ color: 'red' }}>Fehler: {error}</Typography>;

  const treeData = buildTreeData(processes);

  return (
    <Box sx={{ padding: 4, paddingTop: '40px', width: '1000px', minWidth: '1200px', margin: '0 auto' }}>
      <Typography variant="h4" gutterBottom sx={{ color: '#1976d2', fontWeight: 'bold' }}>
        Prozesse
      </Typography>
      <Divider sx={{ borderColor: '#1976d2', mb: 3 }} />
      <Button variant="contained" onClick={handleAddProcess} startIcon={<Add />} sx={{ mb: 2, backgroundColor: '#1976d2', color: '#fff' }}>
        Prozess hinzufügen
      </Button>
      <SimpleTreeView
        getItemId={getItemId}
        sx={{ flexGrow: 1, maxWidth: '100%', overflowY: 'auto' }}
      >
        {renderTreeItems(treeData)}
      </SimpleTreeView>
    </Box>
  );
};

export default Processes;