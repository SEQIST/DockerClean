import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Typography, Button, TextField, FormControl, InputLabel, Select, MenuItem, Grid, Divider } from '@mui/material'; // Divider hinzufügen
// import ReactQuill from 'react-quill';
// import 'react-quill/dist/quill.snow.css';

const CreateProcess = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [process, setProcess] = useState({
    name: '',
    abbreviation: '',
    processPurpose: '',
    owner: '',
    isChildOf: '',
  });
  const [roles, setRoles] = useState([]);
  const [processes, setProcesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [rolesData, processesData, processData] = await Promise.all([
          fetch('http://localhost:5001/api/roles').then(r => {
            if (!r.ok) throw new Error('Rollen konnten nicht geladen werden');
            return r.json();
          }),
          fetch('http://localhost:5001/api/processes').then(r => {
            if (!r.ok) throw new Error('Prozesse konnten nicht geladen werden');
            return r.json();
          }),
          id ? fetch(`http://localhost:5001/api/processes/${id}`).then(r => {
            if (!r.ok) throw new Error('Prozess nicht gefunden');
            return r.json();
          }) : Promise.resolve(null),
        ]);

        console.log('Geladene Rollen:', rolesData);
        console.log('Geladene Prozesse:', processesData);
        console.log('Geladener Prozess (falls vorhanden):', processData);

        setRoles(rolesData || []);
        setProcesses(processesData || []);

        if (processData) {
          setProcess({
            name: processData.name || '',
            abbreviation: processData.abbreviation || '',
            processPurpose: processData.processPurpose || '',
            owner: processData.owner?._id || processData.owner || '',
            isChildOf: processData.isChildOf?._id || processData.isChildOf || '',
          });
        }
        setLoading(false);
      } catch (error) {
        console.error('Fehler beim Laden der Daten:', error);
        setError(error.message);
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleChange = (field, value) => {
    setProcess(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!process.name) {
      setError('Name ist erforderlich');
      return;
    }

    const method = id ? 'PUT' : 'POST';
    const url = id ? `http://localhost:5001/api/processes/${id}` : 'http://localhost:5001/api/processes';

    try {
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: process.name,
          abbreviation: process.abbreviation,
          processPurpose: process.processPurpose,
          owner: process.owner || null,
          isChildOf: process.isChildOf || null,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`HTTP-Fehler! Status: ${response.status} - ${errorData.error || 'Unbekannter Fehler'}`);
      }

      navigate('/processes');
    } catch (error) {
      console.error('Fehler beim Speichern des Prozesses:', error);
      setError(error.message);
    }
  };

  if (loading) return <Typography>Lade Prozess...</Typography>;
  if (error) return <Typography sx={{ color: 'red' }}>Fehler: {error}</Typography>;

  return (
    <Box sx={{ padding: 4, maxWidth: 800, margin: '0 auto' }}>
      <Typography variant="h4" gutterBottom sx={{ color: '#1976d2', fontWeight: 'bold' }}>
        {id ? 'Prozess bearbeiten' : 'Neuen Prozess erstellen'}
      </Typography>
      <Divider sx={{ borderColor: '#1976d2', mb: 3 }} />
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <TextField
            label="Name"
            value={process.name}
            onChange={(e) => handleChange('name', e.target.value)}
            fullWidth
            required
            sx={{ mb: 2, '& .MuiInputBase-root': { height: 40, fontSize: '0.9rem' } }}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            label="Abkürzung"
            value={process.abbreviation}
            onChange={(e) => handleChange('abbreviation', e.target.value)}
            fullWidth
            sx={{ mb: 2, '& .MuiInputBase-root': { height: 40, fontSize: '0.9rem' } }}
          />
        </Grid>
        <Grid item xs={12}>
          <Typography variant="subtitle2" sx={{ fontSize: '0.9rem' }}>Prozesszweck</Typography>
          <Box sx={{ mb: 2 }}>
            <ReactQuill
              value={process.processPurpose}
              onChange={(value) => handleChange('processPurpose', value)}
              modules={{ toolbar: [['bold', 'italic', 'underline'], ['link']] }}
              formats={['bold', 'italic', 'underline', 'link']}
              style={{ minHeight: '80px', fontSize: '0.9rem' }}
            />
          </Box>
        </Grid>
        <Grid item xs={12} sm={6}>
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel sx={{ fontSize: '0.9rem' }}>Eigentümer</InputLabel>
            <Select
              value={process.owner || ''}
              onChange={(e) => handleChange('owner', e.target.value)}
              label="Eigentümer"
              sx={{ height: 40, fontSize: '0.9rem' }}
            >
              <MenuItem value="">Keiner</MenuItem>
              {roles.map(role => (
                <MenuItem key={role._id} value={role._id} sx={{ fontSize: '0.9rem' }}>{role.name}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={6}>
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel sx={{ fontSize: '0.9rem' }}>Unterprozess von</InputLabel>
            <Select
              value={process.isChildOf || ''}
              onChange={(e) => handleChange('isChildOf', e.target.value)}
              label="Unterprozess von"
              sx={{ height: 40, fontSize: '0.9rem' }}
            >
              <MenuItem value="">Keiner</MenuItem>
              {processes
                .filter(p => p._id.toString() !== (id || '')) // Sicherstellen, dass id definiert ist
                .map(proc => (
                  <MenuItem key={proc._id} value={proc._id} sx={{ fontSize: '0.9rem' }}>
                    {proc.name || 'Kein Name'}
                  </MenuItem>
                ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12}>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button variant="contained" onClick={handleSave} sx={{ fontSize: '0.9rem', padding: '4px 8px' }}>
              Speichern
            </Button>
            <Button variant="outlined" onClick={() => navigate('/processes')} sx={{ fontSize: '0.9rem', padding: '4px 8px' }}>
              Abbrechen
            </Button>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default CreateProcess;