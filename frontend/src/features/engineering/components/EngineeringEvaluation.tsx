// features/engineering/components/EngineeringEvaluation.jsx
import React from 'react';
import { Box, Typography, TextField, Autocomplete, Checkbox, FormControlLabel, Button } from '@mui/material';

const EngineeringEvaluation = ({
  selectedContent,
  editEvaluation,
  setEditEvaluation,
  roles,
  processes,
  activities,
  workProducts,
  handleEditEvaluation,
}) => {
  return (
    <Box
      sx={{
        width: '20%',
        p: 2,
        backgroundColor: '#ffffff',
        boxShadow: '-2px 0 5px rgba(0,0,0,0.1)',
        overflowY: 'auto',
      }}
    >
      <Typography variant="h6" sx={{ mb: 2, color: '#333' }}>
        Bewertung
      </Typography>
      {selectedContent ? (
        editEvaluation ? (
          <Box>
            <TextField
              select
              label="Typ"
              value={editEvaluation.type || ''}
              onChange={(e) => setEditEvaluation({ ...editEvaluation, type: e.target.value })}
              fullWidth
              SelectProps={{ native: true }}
              sx={{ mb: 2 }}
              variant="outlined"
            >
              <option value="Header">Header</option>
              <option value="Definition">Definition</option>
              <option value="Information">Information</option>
              <option value="Functional Requirement">Requirement</option>
              <option value="Non-Functional Requirement">Requirement</option>
              <option value="Logical Requirement">Requirement</option>
              <option value="Physical Requirement">Requirement</option>
            </TextField>
            <Typography sx={{ mb: 1, color: '#666' }}>Evidenced by:</Typography>
            <Autocomplete
              multiple
              options={roles}
              getOptionLabel={(option) => option.name}
              value={editEvaluation.evidencedBy?.roles || []}
              onChange={(e, newValue) => setEditEvaluation({ ...editEvaluation, evidencedBy: { ...editEvaluation.evidencedBy, roles: newValue } })}
              renderInput={(params) => <TextField {...params} label="Rollen" variant="outlined" />}
              sx={{ mb: 2 }}
              isOptionEqualToValue={(option, value) => option._id === value._id}
            />
            <Autocomplete
              multiple
              options={processes}
              getOptionLabel={(option) => option.name}
              value={editEvaluation.evidencedBy?.processes || []}
              onChange={(e, newValue) => setEditEvaluation({ ...editEvaluation, evidencedBy: { ...editEvaluation.evidencedBy, processes: newValue } })}
              renderInput={(params) => <TextField {...params} label="Prozesse" variant="outlined" />}
              sx={{ mb: 2 }}
              isOptionEqualToValue={(option, value) => option._id === value._id}
            />
            <Autocomplete
              multiple
              options={activities}
              getOptionLabel={(option) => option.name}
              value={editEvaluation.evidencedBy?.activities || []}
              onChange={(e, newValue) => setEditEvaluation({ ...editEvaluation, evidencedBy: { ...editEvaluation.evidencedBy, activities: newValue } })}
              renderInput={(params) => <TextField {...params} label="Aktivitäten" variant="outlined" />}
              sx={{ mb: 2 }}
              isOptionEqualToValue={(option, value) => option._id === value._id}
            />
            <Autocomplete
              multiple
              options={workProducts}
              getOptionLabel={(option) => option.name}
              value={editEvaluation.evidencedBy?.workProducts || []}
              onChange={(e, newValue) => setEditEvaluation({ ...editEvaluation, evidencedBy: { ...editEvaluation.evidencedBy, workProducts: newValue } })}
              renderInput={(params) => <TextField {...params} label="Work Products" variant="outlined" />}
              sx={{ mb: 2 }}
              isOptionEqualToValue={(option, value) => option._id === value._id}
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={editEvaluation.completed || false}
                  onChange={(e) => setEditEvaluation({ ...editEvaluation, completed: e.target.checked })}
                  color="primary"
                />
              }
              label="Completed"
              sx={{ mb: 2 }}
            />
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
              <Button
                variant="contained"
                onClick={handleEditEvaluation}
                sx={{
                  backgroundColor: '#1976d2',
                  '&:hover': { backgroundColor: '#115293' },
                }}
              >
                Speichern
              </Button>
              <Button
                variant="outlined"
                onClick={() => setEditEvaluation(null)}
                sx={{
                  borderColor: '#1976d2',
                  color: '#1976d2',
                  '&:hover': { borderColor: '#115293', color: '#115293' },
                }}
              >
                Abbrechen
              </Button>
            </Box>
          </Box>
        ) : (
          <Typography sx={{ color: '#666' }}>Keine Bewertung verfügbar</Typography>
        )
      ) : (
        <Typography sx={{ color: '#666' }}>Wähle ein Inhaltselement aus der Liste</Typography>
      )}
    </Box>
  );
};

export default EngineeringEvaluation;