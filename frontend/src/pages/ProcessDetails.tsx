import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, Modal, IconButton, TextField, Autocomplete, Collapse } from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import ProcessFlowintern from './ProcessFlowintern';
import ActivityForm from './ActivityForm';
import { Add, ExpandMore, ExpandLess } from '@mui/icons-material';

const activityModalStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 1000,
  bgcolor: 'background.paper',
  boxShadow: 24,
  p: 4,
  borderRadius: 2,
};

const ProcessDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [process, setProcess] = useState(null);
  const [activities, setActivities] = useState([]);
  const [allProcesses, setAllProcesses] = useState([]);
  const [roles, setRoles] = useState([]);
  const [editActivity, setEditActivity] = useState(null);
  const [editActivityModalOpen, setEditActivityModalOpen] = useState(false);
  const [addActivityModalOpen, setAddActivityModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tempName, setTempName] = useState('');
  const [tempAbbreviation, setTempAbbreviation] = useState('');
  const [tempDescription, setTempDescription] = useState('');
  const [tempOwner, setTempOwner] = useState(null);
  const [tempIsChildOf, setTempIsChildOf] = useState(null);
  const [isEditSectionOpen, setIsEditSectionOpen] = useState(false); // Für Auf-/Einklappmechanismus

  useEffect(() => {
    fetchProcess();
    fetchActivities();
    fetchRoles();
    fetchAllProcesses();
  }, [id]);

  useEffect(() => {
    if (process && roles.length > 0 && allProcesses.length > 0) {
      setTempName(process.name || '');
      setTempAbbreviation(process.abbreviation || '');
      setTempDescription(process.description || '');
      setTempOwner(roles.find(role => role._id === (process.owner?._id || process.owner)) || null);
      setTempIsChildOf(allProcesses.find(p => p._id === (process.isChildOf?._id || process.isChildOf)) || null);
    }
  }, [process, roles, allProcesses]);

  const fetchProcess = async () => {
    try {
      const response = await fetch(`http://localhost:5001/api/processes/${id}`);
      if (!response.ok) throw new Error('Fehler beim Abrufen des Prozesses');
      const data = await response.json();
      setProcess(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching process:', error);
      setError(error.message);
      setLoading(false);
    }
  };

  const fetchActivities = async () => {
    try {
      console.log('Lade Aktivitäten für Prozess:', id);
      const response = await fetch(`http://localhost:5001/api/activities?process=${id}`);
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Fehler beim Abrufen der Aktivitäten: ${response.status} - ${errorText}`);
      }
      const data = await response.json();
      console.log('Geladene Aktivitäten:', data);
      setActivities(data);
    } catch (error) {
      console.error('Error fetching activities:', error);
      setError('Fehler beim Abrufen der Aktivitäten: ' + error.message);
    }
  };

  const fetchRoles = async () => {
    try {
      const response = await fetch('http://localhost:5001/api/roles');
      if (!response.ok) throw new Error('Fehler beim Abrufen der Rollen');
      const data = await response.json();
      setRoles(data);
    } catch (error) {
      console.error('Error fetching roles:', error);
      setError('Fehler beim Abrufen der Rollen: ' + error.message);
    }
  };

  const fetchAllProcesses = async () => {
    try {
      const response = await fetch('http://localhost:5001/api/processes');
      if (!response.ok) throw new Error('Fehler beim Abrufen der Prozesse');
      const data = await response.json();
      setAllProcesses(data.filter(p => p._id !== id));
    } catch (error) {
      console.error('Error fetching processes:', error);
      setError('Fehler beim Abrufen der Prozesse: ' + error.message);
    }
  };

  const handleSave = async () => {
    try {
      const response = await fetch(`http://localhost:5001/api/processes/${process._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: tempName,
          abbreviation: tempAbbreviation,
          description: tempDescription,
          owner: tempOwner ? tempOwner._id : null,
          isChildOf: tempIsChildOf ? tempIsChildOf._id : null,
        }),
      });
      if (!response.ok) throw new Error('Fehler beim Speichern');
      const updatedProcess = await response.json();
      setProcess(updatedProcess);
     //  alert('Prozess erfolgreich aktualisiert');
    } catch (error) {
     // console.error('Fehler:', error);
    //  setError('Fehler beim Speichern: ' + error.message);
    }
  };

  const handleEditActivityModalOpen = (activity) => {
    console.log('Opening edit modal for activity:', activity); // Debugging-Log
    if (!activity) {
      console.error('Activity is undefined');
      return;
    }
    setEditActivity({
      ...activity,
      executedBy: activity.executedBy?._id || activity.executedBy,
      process: activity.process?._id || activity.process,
      result: activity.result?._id || activity.result,
      trigger: {
        workProducts: activity.trigger?.workProducts || [],
        determiningFactorId: activity.trigger?.determiningFactorId?._id || activity.trigger?.determiningFactorId || null,
      },
    });
    setEditActivityModalOpen(true);
  };

  const handleEditActivityModalClose = () => {
    setEditActivityModalOpen(false);
    setEditActivity(null);
  };

  const handleAddActivityModalOpen = () => {
    setAddActivityModalOpen(true);
  };

  const handleAddActivityModalClose = () => {
    setAddActivityModalClose(false);
  };

  const handleAddActivity = async (newActivity) => {
    try {
      const response = await fetch('http://localhost:5001/api/activities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newActivity, process: id }),
      });
      if (!response.ok) throw new Error('Fehler beim Hinzufügen der Aktivität');
      const savedActivity = await response.json();
      setActivities([...activities, savedActivity]);
      handleAddActivityModalClose();
      alert('Aktivität erfolgreich hinzugefügt');
    } catch (error) {
      console.error('Fehler beim Hinzufügen der Aktivität:', error);
      setError('Fehler beim Hinzufügen der Aktivität: ' + error.message);
    }
  };

  const handleActivityUpdate = (updatedActivity) => {
    const updatedActivities = activities.map(a =>
      a._id === updatedActivity._id ? updatedActivity : a
    );
    setActivities(updatedActivities);
    handleEditActivityModalClose();
  };

  const toggleEditSection = () => {
    setIsEditSectionOpen(!isEditSectionOpen);
  };

  if (loading) return <Typography>Lade Prozess...</Typography>;
  if (error) return <Typography sx={{ color: 'red' }}>Fehler: {error}</Typography>;
  if (!process) return <Typography>Prozess nicht gefunden</Typography>;

  return (
    <Box sx={{ padding: 0, paddingTop: '80px', width: '100%', height: '100vh', overflow: 'hidden' }}>
      <Box sx={{ px: 4 }}>
        <Typography variant="h4" gutterBottom sx={{ color: '#1976d2', fontWeight: 'bold' }}>
          Prozess bearbeiten: {process.name}
        </Typography>
        {error && (
          <Typography sx={{ color: 'red', mb: 2 }}>
            {error}
          </Typography>
        )}
        {/* Auf-/Einklappbarer Bereich für Prozessdetails */}
        <Box sx={{ mb: 2 }}>
          <Button
            onClick={toggleEditSection}
            endIcon={isEditSectionOpen ? <ExpandLess /> : <ExpandMore />}
            sx={{ color: '#1976d2', textTransform: 'none' }}
          >
            Prozessdetails {isEditSectionOpen ? 'einklappen' : 'ausklappen'}
          </Button>
          <Collapse in={isEditSectionOpen}>
            <Box sx={{ mt: 2, mb: 3 }}>
              <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
                <TextField
                  label="Name"
                  value={tempName}
                  onChange={(e) => setTempName(e.target.value)}
                  fullWidth
                  variant="outlined"
                  sx={{ mb: 2, maxWidth: '250px' }}
                />
                <TextField
                  label="Abkürzung"
                  value={tempAbbreviation}
                  onChange={(e) => setTempAbbreviation(e.target.value)}
                  fullWidth
                  variant="outlined"
                  sx={{ mb: 2, maxWidth: '250px' }}
                />
                <Autocomplete
                  options={roles}
                  getOptionLabel={(option) => option.name || ''}
                  value={tempOwner}
                  onChange={(e, newValue) => setTempOwner(newValue)}
                  renderInput={(params) => (
                    <TextField {...params} label="Eigentümer" fullWidth sx={{ mb: 2, maxWidth: '250px' }} />
                  )}
                />
                <Autocomplete
                  options={allProcesses}
                  getOptionLabel={(option) => option.name || ''}
                  value={tempIsChildOf}
                  onChange={(e, newValue) => setTempIsChildOf(newValue)}
                  renderInput={(params) => (
                    <TextField {...params} label="Ist Unterprozess von" fullWidth sx={{ mb: 2, maxWidth: '250px' }} />
                  )}
                />
              </Box>
              <Typography variant="body2" sx={{ mb: 1, color: '#424242' }}>
                Beschreibung
              </Typography>
              <ReactQuill
                value={tempDescription}
                onChange={setTempDescription}
                theme="snow"
                style={{ height: '150px', marginBottom: '20px' }}
              />
              <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                <Button
                  variant="contained"
                  onClick={handleSave}
                  sx={{ backgroundColor: '#1976d2', color: '#fff' }}
                >
                  Speichern
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => navigate('/quality/processes')}
                  sx={{ borderColor: '#1976d2', color: '#1976d2' }}
                >
                  Abbrechen
                </Button>
              </Box>
            </Box>
          </Collapse>
        </Box>
        <Box sx={{ mb: 2, display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
          <IconButton
            onClick={handleAddActivityModalOpen}
            sx={{ color: '#1976d2' }}
          >
            <Add />
          </IconButton>
        </Box>
        <Typography variant="h6" sx={{ color: '#424242', mb: 1 }}>
          Prozessfluss
        </Typography>
      </Box>
      <Box sx={{ width: '100%', height: 'calc(100vh - 200px)', overflow: 'hidden' }}>
        <ProcessFlowintern
          activities={activities}
          style={{ width: '1400px', height: '100%' }}
          onNodeClick={handleEditActivityModalOpen}
        />
      </Box>

      {/* Add Activity Modal */}
      <Modal open={addActivityModalOpen} onClose={handleAddActivityModalClose}>
        <Box sx={activityModalStyle}>
          <ActivityForm
            activityId={null}
            onClose={handleAddActivityModalClose}
            onSave={handleAddActivity}
            activities={activities}
          />
        </Box>
      </Modal>

      {/* Edit Activity Modal */}
      <Modal open={editActivityModalOpen} onClose={handleEditActivityModalClose}>
        <Box sx={activityModalStyle}>
          {editActivity && (
            <ActivityForm
              activityId={editActivity._id}
              onClose={handleEditActivityModalClose}
              onSave={handleActivityUpdate}
              activities={activities}
            />
          )}
        </Box>
      </Modal>
    </Box>
  );
};

export default ProcessDetails;