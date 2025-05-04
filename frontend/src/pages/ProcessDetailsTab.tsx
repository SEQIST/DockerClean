import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Typography, Button, Divider } from '@mui/material';
import ReactFlow, { Background, Controls } from 'react-flow-renderer';

const ProcessDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [process, setProcess] = useState(null);
  const [roles, setRoles] = useState([]);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [rolesData, processData, activitiesData] = await Promise.all([
          fetch('http://localhost:5001/api/roles').then(r => {
            if (!r.ok) throw new Error('Rollen konnten nicht geladen werden');
            return r.json();
          }),
          fetch(`http://localhost:5001/api/processes/${id}`).then(r => {
            if (!r.ok) throw new Error('Prozess nicht gefunden');
            return r.json();
          }),
          fetch('http://localhost:5001/api/activities').then(r => {
            if (!r.ok) throw new Error('Aktivitäten konnten nicht geladen werden');
            return r.json();
          }),
        ]);

        console.log('Geladene Rollen:', rolesData);
        console.log('Geladener Prozess:', processData);
        console.log('Geladene Aktivitäten:', activitiesData);

        setRoles(rolesData || []);
        setProcess(processData);
        setActivities(activitiesData || []);

        // Erstelle Knoten und Kanten für React Flow
        const processActivities = activitiesData.filter(activity => 
          (activity.process?._id?.toString() || activity.process?.toString()) === id
        );

        const newNodes = processActivities.map((activity, index) => {
          const triggerCount = activity.trigger?.workProducts?.length || 0;
          const workProductCount = activity.result ? 1 : 0;
          const progress = 50; // Platzhalter für Fortschritt

          return {
            id: activity._id.toString(),
            type: 'default',
            data: {
              label: (
                <div style={{ textAlign: 'center' }}>
                  <div>{activity.name || 'Kein Name'}</div>
                  <div>🔔 {triggerCount} ⏳ {progress}% 📦 {workProductCount}</div>
                </div>
              ),
            },
            position: { x: 250 * (index % 3), y: 100 * Math.floor(index / 3) },
            style: {
              background: triggerCount > 0 ? '#90EE90' : '#D3D3D3',
              border: '1px solid #777',
              padding: 10,
              borderRadius: 5,
            },
          };
        });

        const newEdges = [];
        processActivities.forEach(activity => {
          if (activity.trigger?.workProducts?.length > 0) {
            activity.trigger.workProducts.forEach(wp => {
              const sourceActivity = activitiesData.find(act => 
                (act.result?._id?.toString() || act.result?.toString()) === (wp._id?.toString() || wp.workProduct?.toString())
              );
              if (sourceActivity) {
                newEdges.push({
                  id: `e-${sourceActivity._id}-${activity._id}`,
                  source: sourceActivity._id.toString(),
                  target: activity._id.toString(),
                  type: 'smoothstep',
                  animated: true,
                });
              }
            });
          }
        });

        setNodes(newNodes);
        setEdges(newEdges);
        setLoading(false);
      } catch (error) {
        console.error('Fehler beim Laden der Daten:', error);
        setError(error.message);
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleEditProcess = () => {
    navigate(`/edit-processes/${id}`);
  };

  const handleEditActivities = () => {
    navigate(`/quality/activities`); // Navigiert zur Aktivitäten-Seite (kann angepasst werden)
  };

  if (loading) return <Typography>Lade Prozess...</Typography>;
  if (error) return <Typography sx={{ color: 'red' }}>Fehler: {error}</Typography>;
  if (!process) return <Typography>Prozess nicht gefunden.</Typography>;

  const ownerObj = process.owner || {};
  const ownerId = ownerObj._id?.toString() || ownerObj.toString() || '';
  const owner = ownerObj.name || (roles.find(role => role._id?.toString() === ownerId)?.name || 'Kein Eigentümer');

  return (
    <Box sx={{ padding: 4, maxWidth: 1200, margin: '0 auto' }}>
      <Typography variant="h4" gutterBottom sx={{ color: '#1976d2', fontWeight: 'bold' }}>
        Prozessdetails: {process.name || 'Kein Name'}
      </Typography>
      <Box sx={{ mb: 2 }}>
        <Button
          variant="contained"
          onClick={handleEditProcess}
          sx={{ mr: 2, backgroundColor: '#1976d2', color: '#fff' }}
        >
          Prozess bearbeiten
        </Button>
        <Button
          variant="contained"
          onClick={handleEditActivities}
          sx={{ backgroundColor: '#1976d2', color: '#fff' }}
        >
          Aktivitäten bearbeiten
        </Button>
      </Box>
      <Divider sx={{ borderColor: '#1976d2', mb: 3 }} />
      <Box sx={{ mb: 3 }}>
        <Typography variant="body1"><strong>Abkürzung:</strong> {process.abbreviation || 'Keine'}</Typography>
        <Typography variant="body1"><strong>Eigentümer:</strong> {owner}</Typography>
        <Typography variant="body1"><strong>Prozesszweck:</strong></Typography>
        <div dangerouslySetInnerHTML={{ __html: process.processPurpose || 'Kein Prozesszweck' }} />
      </Box>

      {/* Prozessfluss-Ansicht */}
      <Typography variant="h6" gutterBottom>
        Prozessfluss
      </Typography>
      <Box sx={{ height: '500px', width: '100%', border: '1px solid #ccc', borderRadius: 5 }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          fitView
          style={{ width: '100%', height: '100%' }}
        >
          <Background />
          <Controls />
        </ReactFlow>
      </Box>

      <Box sx={{ mt: 3 }}>
        <Button variant="outlined" onClick={() => navigate('/quality/processes')} sx={{ fontSize: '0.9rem', padding: '4px 8px' }}>
          Zurück zur Prozessliste
        </Button>
      </Box>
    </Box>
  );
};

export default ProcessDetails;