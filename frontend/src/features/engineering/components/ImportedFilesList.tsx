// features/engineering/components/ImportedFilesList.jsx
import React from 'react';
import { Box, Typography, List, ListItem, ListItemText, IconButton, Button, Divider } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';

const ImportedFilesList = ({ importedFiles, handleDeleteFile, handleClearAllData }) => {
  return (
    <>
      <Divider sx={{ my: 2 }} />
      <Typography variant="h6" gutterBottom>
        Importierte Dateien
      </Typography>
      {importedFiles.length > 0 ? (
        <List>
          {importedFiles.map((file, index) => (
            <ListItem
              key={file.key || index}
              secondaryAction={
                <IconButton
                  edge="end"
                  aria-label="delete"
                  onClick={() => handleDeleteFile(file.key)}
                  color="error"
                >
                  <DeleteIcon />
                </IconButton>
              }
            >
              <ListItemText
                primary={file.name}
                secondary="Erfolgreich importiert"
              />
            </ListItem>
          ))}
        </List>
      ) : (
        <Typography>Keine Dateien importiert.</Typography>
      )}
      <Button
        variant="outlined"
        color="error"
        onClick={handleClearAllData}
        sx={{ mt: 2 }}
      >
        Alle Daten löschen
      </Button>
    </>
  );
};

export default ImportedFilesList;