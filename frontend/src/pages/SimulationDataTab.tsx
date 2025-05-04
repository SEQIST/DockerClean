import React, { useState } from 'react';
import { Box, Typography, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, TextField, IconButton, Autocomplete } from '@mui/material';
import { Delete as DeleteIcon } from '@mui/icons-material';

const SimulationDataTab = ({ simulationData, setSimulationData, activities, workProducts }) => {
  const [newWorkProduct, setNewWorkProduct] = useState(null);
  const [known, setKnown] = useState('');
  const [unknown, setUnknown] = useState('');

  const handleAddWorkProduct = () => {
    if (!newWorkProduct || !known || !unknown) {
      alert('Bitte füllen Sie alle Felder aus.');
      return;
    }

    const updatedWorkProducts = [
      ...simulationData.workProducts,
      {
        _id: newWorkProduct._id, // Speichere die _id des Work Products
        name: newWorkProduct.name,
        known: parseFloat(known),
        unknown: parseFloat(unknown),
      },
    ];

    setSimulationData({ ...simulationData, workProducts: updatedWorkProducts });
    setNewWorkProduct(null);
    setKnown('');
    setUnknown('');
  };

  const handleDeleteWorkProduct = (index) => {
    const updatedWorkProducts = simulationData.workProducts.filter((_, i) => i !== index);
    setSimulationData({ ...simulationData, workProducts: updatedWorkProducts });
  };

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom sx={{ color: '#1976d2' }}>
        Simulation Data
      </Typography>
      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
        <Autocomplete
          options={workProducts}
          getOptionLabel={(option) => option.name}
          value={newWorkProduct}
          onChange={(e, newValue) => setNewWorkProduct(newValue)}
          renderInput={(params) => <TextField {...params} label="Work Product" fullWidth />}
          sx={{ width: 300 }}
        />
        <TextField
          label="Known (Tage)"
          type="number"
          value={known}
          onChange={(e) => setKnown(e.target.value)}
          sx={{ width: 150 }}
        />
        <TextField
          label="Unknown (Tage)"
          type="number"
          value={unknown}
          onChange={(e) => setUnknown(e.target.value)}
          sx={{ width: 150 }}
        />
        <Button variant="contained" onClick={handleAddWorkProduct} sx={{ backgroundColor: '#1976d2', color: '#fff' }}>
          Hinzufügen
        </Button>
      </Box>
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
            {simulationData.workProducts.map((wp, index) => (
              <TableRow key={wp._id || index}>
                <TableCell>{wp.name}</TableCell>
                <TableCell>{wp.known}</TableCell>
                <TableCell>{wp.unknown}</TableCell>
                <TableCell>
                  <IconButton color="error" onClick={() => handleDeleteWorkProduct(index)}>
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default SimulationDataTab;