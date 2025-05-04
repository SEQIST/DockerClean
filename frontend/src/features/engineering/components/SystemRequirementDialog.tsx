import React, { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField } from '@mui/material';
// import ReactQuill from 'react-quill';
// Entferne den CSS-Import, da wir es über das CDN laden
// import 'react-quill/dist/quill.snow.css';

const SystemRequirementDialog = ({ open, onClose, onSave, customerRequirement }) => {
  const [header, setHeader] = useState('');
  const [text, setText] = useState('');

  const handleSave = () => {
    onSave({
      header,
      text, // RTF-Text
      customerRequirementId: customerRequirement.id, // Für den Trace
    });
    setHeader('');
    setText('');
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>Neue Systemanforderung erstellen</DialogTitle>
      <DialogContent>
        <TextField
          label="Header"
          value={header}
          onChange={(e) => setHeader(e.target.value)}
          fullWidth
          margin="normal"
        />
        <ReactQuill
          value={text}
          onChange={setText}
          style={{ height: '200px', marginBottom: '50px' }}
          theme="snow"
          modules={{
            toolbar: [
              [{ header: [1, 2, false] }],
              ['bold', 'italic', 'underline'],
              ['link', 'image'],
              ['clean'],
            ],
          }}
          formats={[
            'header',
            'bold',
            'italic',
            'underline',
            'link',
            'image',
          ]}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Abbrechen</Button>
        <Button onClick={handleSave} variant="contained">Speichern</Button>
      </DialogActions>
    </Dialog>
  );
};

export default SystemRequirementDialog;