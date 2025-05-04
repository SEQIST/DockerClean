// src/features/products/components/WorkProductFilter.jsx
import React from 'react';
import { Autocomplete, TextField, Checkbox, FormControlLabel, Box } from '@mui/material';

const WorkProductFilter = ({
  workProducts,
  selectedEndProduct,
  setSelectedEndProduct,
  showWorkProducts,
  setShowWorkProducts,
  showActivities,
  setShowActivities,
  showRoles,
  setShowRoles,
}) => {
  return (
    <Box sx={{ mb: 2, display: 'flex', gap: 2, alignItems: 'center' }}>
      <Autocomplete
        options={workProducts}
        getOptionLabel={(option) => option.name || ''}
        value={selectedEndProduct}
        onChange={(event, newValue) => setSelectedEndProduct(newValue)}
        renderInput={(params) => (
          <TextField
            {...params}
            label="Endprodukt auswählen"
            variant="outlined"
            size="small"
            sx={{ width: '300px' }}
          />
        )}
      />
      <FormControlLabel
        control={
          <Checkbox
            checked={showWorkProducts}
            onChange={(e) => setShowWorkProducts(e.target.checked)}
          />
        }
        label="Work Product"
      />
      <FormControlLabel
        control={
          <Checkbox
            checked={showActivities}
            onChange={(e) => setShowActivities(e.target.checked)}
          />
        }
        label="Activity"
      />
      <FormControlLabel
        control={
          <Checkbox
            checked={showRoles}
            onChange={(e) => setShowRoles(e.target.checked)}
          />
        }
        label="Role"
      />
    </Box>
  );
};

export default WorkProductFilter;