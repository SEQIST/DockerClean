// features/engineering/components/FileUploader.jsx
import React from 'react';
import { Box, Typography, TextField, FormControl, InputLabel, Select, MenuItem, Button } from '@mui/material';

const FileUploader = ({ selectedFile, handleFileChange, importType, setImportType, handleParse, errorMessage }) => {
  return (
    <Box sx={{ position: 'sticky', top: 0, bgcolor: 'background.paper', zIndex: 2, pb: 2 }}>
      <Typography variant="h6" gutterBottom>
        Datei auswählen
      </Typography>
      <TextField
        type="file"
        onChange={handleFileChange}
        fullWidth
        variant="outlined"
        inputProps={{ accept: '.json,.csv,.txt,.doc,.docx,.pdf,.xlsx,.xls,.reqif,.md' }}
      />
      <Box sx={{ mt: 2, mb: 2 }}>
        <FormControl fullWidth>
          <InputLabel>Import-Typ</InputLabel>
          <Select
            value={importType}
            onChange={(e) => setImportType(e.target.value)}
            label="Import-Typ"
          >
            <MenuItem value="customerRequirements">Kundenanforderungen</MenuItem>
            <MenuItem value="systemRequirements">Systemanforderungen</MenuItem>
          </Select>
        </FormControl>
      </Box>
      <Button
        variant="contained"
        color="primary"
        onClick={handleParse}
        disabled={!selectedFile}
        sx={{ mb: 2 }}
      >
        Datei parsen
      </Button>
      {errorMessage && (
        <Typography color="error" sx={{ mb: 2 }}>
          {errorMessage}
        </Typography>
      )}
    </Box>
  );
};

export default FileUploader;