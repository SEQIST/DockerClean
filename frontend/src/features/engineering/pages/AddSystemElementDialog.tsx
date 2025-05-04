import React, { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, FormControlLabel, Checkbox } from '@mui/material';

const AddSystemElementDialog = ({ open, onClose, onSave, parentElement }) => {
  const [name, setName] = useState('');
  const [isHeading, setIsHeading] = useState(false);

  const handleSave = () => {
    onSave({
      name,
      isHeading,
      parentId: parentElement ? parentElement.id : null,
    });
    setName('');
    setIsHeading(false);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Neues Element hinzufügen</DialogTitle>
      <DialogContent>
        <TextField
          label="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          fullWidth
          margin="normal"
        />
        <FormControlLabel
          control={
            <Checkbox
              checked={isHeading}
              onChange={(e) => setIsHeading(e.target.checked)}
            />
          }
          label="Ist Überschrift"
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Abbrechen</Button>
        <Button onClick={handleSave} variant="contained">Speichern</Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddSystemElementDialog;