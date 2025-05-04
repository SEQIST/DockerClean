import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, TextField, Autocomplete, IconButton, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';
import { Add, Delete } from '@mui/icons-material';

const ProcessSimulationTab = ({ simulationData, setSimulationData, activities, workProducts }) => {
  const [selectedWorkProduct, setSelectedWorkProduct] = useState(null);
  const [known, setKnown] = useState('');
  const [unknown, setUnknown] = useState('');

  useEffect(() => {
    console.log('ProcessSimulationTab.jsx: Simulation Data:', simulationData); // Debugging-Log
    console.log('ProcessSimulationTab.jsx: Activities:', activities); // Debugging-Log
    console.log('ProcessSimulationTab.jsx: Work Products:', workProducts); // Debugging-Log
  }, [simulationData, activities, workProducts]);

  const handleAddWorkProduct = () => {
    if (!selectedWorkProduct || known === '' || unknown === '') {
      alert('Bitte füllen Sie alle Felder aus.');
      return;
    }

    const newWorkProduct = {
      name: selectedWorkProduct.name,
      known: parseInt(known),
      unknown: parseInt(unknown),
    };

    const updatedWorkProducts = simulationData.workProducts.filter(wp => wp.name !== selectedWorkProduct.name);
    updatedWorkProducts.push(newWorkProduct);

    setSimulationData({ ...simulationData, workProducts: updatedWorkProducts });
    setSelectedWorkProduct(null);
    setKnown('');
    setUnknown('');
  };

  const handleDeleteWorkProduct = (name) => {
    const updatedWorkProducts = simulationData.workProducts.filter(wp => wp.name !== name);
    setSimulationData({ ...simulationData, workProducts: updatedWorkProducts });
  };

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom sx={{ color: '#1976d2' }}>
        Simulation Data
      </Typography>
      <Box sx={{ mb: 2, display: 'flex', gap: 2, alignItems: 'center' }}>
        <Autocomplete
          options={workProducts}
          getOptionLabel={(option) => option.name}
          value={selectedWorkProduct}
          onChange={(e, newValue) => setSelectedWorkProduct(newValue)}
          renderInput={(params) => (
            <TextField {...params} label="Work Product" fullWidth />
          )}
          sx={{ width: 300 }}
        />
        <TextField
          label="Known (Tage)"
          type="number"
          value={known}
          onChange={(e) => setKnown(e.target.value)}
          sx={{ width: 150 }}
          error={known !== '' && (isNaN(known) || parseInt(known) < 0)}
          helperText={known !== '' && (isNaN(known) || parseInt(known) < 0) ? 'Bitte geben Sie eine positive Zahl ein' : ''}
        />
        <TextField
          label="Unknown (Tage)"
          type="number"
          value={unknown}
          onChange={(e) => setUnknown(e.target.value)}
          sx={{ width: 150 }}
          error={unknown !== '' && (isNaN(unknown) || parseInt(unknown) < 0)}
          helperText={unknown !== '' && (isNaN(unknown) || parseInt(unknown) < 0) ? 'Bitte geben Sie eine positive Zahl ein' : ''}
        />
        <Button
          variant="contained"
          onClick={handleAddWorkProduct}
          startIcon={<Add />}
          sx={{ backgroundColor: '#1976d2', color: '#fff' }}
        >
          Hinzufügen
        </Button>
      </Box>
      {simulationData.workProducts.length > 0 ? (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Work Product</TableCell>
                <TableCell>Known (Tage)</TableCell>
                <TableCell>Unknown (Tage)</TableCell>
                <TableCell>Aktionen</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {simulationData.workProducts.map((wp) => (
                <TableRow key={wp.name}>
                  <TableCell>{wp.name}</TableCell>
                  <TableCell>{wp.known}</TableCell>
                  <TableCell>{wp.unknown}</TableCell>
                  <TableCell>
                    <IconButton color="error" onClick={() => handleDeleteWorkProduct(wp.name)}>
                      <Delete />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        <Typography>Keine Work Products hinzugefügt.</Typography>
      )}
    </Box>
  );
};

export default ProcessSimulationTab;