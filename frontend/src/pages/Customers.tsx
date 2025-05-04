import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, TextField, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import { Add, Edit, Delete } from '@mui/icons-material';

const Customers = () => {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [editCustomer, setEditCustomer] = useState(null);
  const [formData, setFormData] = useState({ name: '', description: '' });

  // Kunden abrufen
  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const response = await fetch('http://localhost:5001/api/customers');
        if (!response.ok) throw new Error('Fehler beim Laden der Kunden');
        const data = await response.json();
        setCustomers(data);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };
    fetchCustomers();
  }, []);

  // Dialog öffnen (für Hinzufügen oder Bearbeiten)
  const handleOpenDialog = (customer = null) => {
    setEditCustomer(customer);
    setFormData(customer ? { name: customer.name, description: customer.description || '' } : { name: '', description: '' });
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditCustomer(null);
    setFormData({ name: '', description: '' });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    try {
      const method = editCustomer ? 'PUT' : 'POST';
      const url = editCustomer ? `http://localhost:5001/api/customers/${editCustomer._id}` : 'http://localhost:5001/api/customers';
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (!response.ok) throw new Error(`Fehler beim ${editCustomer ? 'Bearbeiten' : 'Erstellen'} des Kunden`);
      const updatedCustomer = await response.json();
      if (editCustomer) {
        setCustomers(customers.map(c => (c._id === updatedCustomer._id ? updatedCustomer : c)));
      } else {
        setCustomers([...customers, updatedCustomer]);
      }
      handleCloseDialog();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (customerId) => {
    if (!window.confirm('Möchten Sie diesen Kunden wirklich löschen?')) return;
    try {
      const response = await fetch(`http://localhost:5001/api/customers/${customerId}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Fehler beim Löschen des Kunden');
      setCustomers(customers.filter(c => c._id !== customerId));
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) return <Typography>Lade Kunden...</Typography>;
  if (error) return <Typography sx={{ color: 'red' }}>Fehler: {error}</Typography>;

  return (
    <Box sx={{ padding: 4, maxWidth: 1200, margin: '0 auto' }}>
      <Typography variant="h4" gutterBottom sx={{ color: '#1976d2', fontWeight: 'bold' }}>
        Kunden
      </Typography>
      <Button variant="contained" startIcon={<Add />} onClick={() => handleOpenDialog()} sx={{ mb: 2, backgroundColor: '#1976d2', color: '#fff' }}>
        Kunde hinzufügen
      </Button>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Beschreibung</TableCell>
              <TableCell>Aktionen</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {customers.map(customer => (
              <TableRow key={customer._id}>
                <TableCell>{customer.name}</TableCell>
                <TableCell>{customer.description || '-'}</TableCell>
                <TableCell>
                  <Button startIcon={<Edit />} onClick={() => handleOpenDialog(customer)} sx={{ mr: 1 }}>
                    Bearbeiten
                  </Button>
                  <Button startIcon={<Delete />} color="error" onClick={() => handleDelete(customer._id)}>
                    Löschen
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Dialog für Hinzufügen/Bearbeiten */}
      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>{editCustomer ? 'Kunde bearbeiten' : 'Neuen Kunden hinzufügen'}</DialogTitle>
        <DialogContent>
          <TextField
            label="Name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            fullWidth
            required
            sx={{ mt: 2 }}
          />
          <TextField
            label="Beschreibung"
            name="description"
            value={formData.description}
            onChange={handleChange}
            fullWidth
            multiline
            rows={3}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Abbrechen</Button>
          <Button onClick={handleSubmit} variant="contained" disabled={!formData.name}>
            {editCustomer ? 'Speichern' : 'Hinzufügen'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Customers;