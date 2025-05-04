// features/engineering/components/EngineeringList.jsx
import React from 'react';
import { Box, Typography, List, ListItem, ListItemText, Button, TextField, IconButton } from '@mui/material';
import { Add, Delete, Upload } from '@mui/icons-material';

const EngineeringList = ({
  engineeringStandards,
  selectedStandard,
  newStandardName,
  setEngineeringStandards,
  setSelectedStandard,
  setSelectedContent,
  setNewStandardName,
  handleAddStandard,
  handleDeleteStandard,
  handleFileUpload,
}) => {
  return (
    <Box
      sx={{
        width: '20%',
        borderRight: '1px solid #e0e0e0',
        p: 2,
        backgroundColor: '#ffffff',
        boxShadow: '2px 0 5px rgba(0,0,0,0.1)',
        overflowY: 'auto',
      }}
    >
      <Typography variant="h6" sx={{ mb: 2, color: '#333' }}>
        Anforderungen
      </Typography>
      <Box sx={{ mb: 2 }}>
        <TextField
          label="Neues Anforderungsdokument"
          value={newStandardName}
          onChange={(e) => setNewStandardName(e.target.value)}
          fullWidth
          size="small"
          variant="outlined"
          sx={{ mb: 1 }}
        />
        <Button
          variant="contained"
          onClick={handleAddStandard}
          sx={{
            mb: 1,
            backgroundColor: '#1976d2',
            '&:hover': { backgroundColor: '#115293' },
          }}
        >
          Hinzufügen 
          PDF, Word, Excel
        </Button>
        <Button
          variant="outlined"
          component="label"
          startIcon={<Upload />}
          sx={{
            mb: 1,
            borderColor: '#1976d2',
            color: '#1976d2',
            '&:hover': { borderColor: '#115293', color: '#115293' },
          }}
        >
          Datei hochladen
          <input type="file" hidden onChange={handleFileUpload} accept=".pdf,.docx,.xlsx" />
        </Button>
      </Box>
      <List>
        {engineeringStandards.map(standard => (
          <ListItem
            key={standard._id}
            button
            selected={selectedStandard && selectedStandard._id === standard._id}
            onClick={() => {
              setSelectedStandard(standard);
              setSelectedContent(null);
            }}
            sx={{
              borderRadius: 1,
              mb: 0.5,
              backgroundColor: selectedStandard && selectedStandard._id === standard._id ? '#e3f2fd' : 'transparent',
              '&:hover': { backgroundColor: '#f0f0f0' },
            }}
          >
            <ListItemText primary={standard.name} sx={{ color: '#333' }} />
            <IconButton onClick={() => handleDeleteStandard(standard._id)} color="error">
              <Delete />
            </IconButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );
};

export default EngineeringList;