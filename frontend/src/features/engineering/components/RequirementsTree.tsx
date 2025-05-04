// features/engineering/components/RequirementsTree.jsx
import React, { useState, useEffect } from 'react';
import { Box, FormControl, InputLabel, Select, MenuItem, Typography } from '@mui/material';
import RequirementTreeView from '../pages//RequirementTreeView';

const RequirementsTree = ({
  projects,
  selectedProject,
  setSelectedProject,
  projectData,
  processedCustomerRequirements,
  processedSystemRequirements,
  selectedRequirement,
  setSelectedRequirement,
  setContextCustomerRequirement,
  dialogOpen,
  setDialogOpen,
  setAllItems,
}) => {
  return (
    <Box sx={{ width: '100%', p: 2, overflowY: 'auto', maxHeight: 'calc(100vh - 200px)' }}>
      <FormControl fullWidth sx={{ mb: 2 }}>
        <InputLabel id="anforderung-label">Anforderung</InputLabel>
        <Select
          labelId="anforderung-label"
          name="anforderung"
          value={selectedProject || ''}
          onChange={(e) => setSelectedProject(e.target.value)}
          label="Anforderung"
        >
          <MenuItem value="">Wählen Sie eine Anforderung</MenuItem>
          {projects.map(project => (
            <MenuItem key={project.id} value={project.id}>
              {project.name || 'Unbenanntes Projekt'}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      {projectData ? (
        <RequirementTreeView
          filteredCustomerRequirements={processedCustomerRequirements.length > 0 ? processedCustomerRequirements : processedSystemRequirements}
          selectedRequirement={selectedRequirement}
          setSelectedRequirement={setSelectedRequirement}
          selectedProject={selectedProject}
          setAllItems={setAllItems}
        />
      ) : (
        <Typography>Wählen Sie eine Anforderung aus.</Typography>
      )}
    </Box>
  );
};

export default RequirementsTree;