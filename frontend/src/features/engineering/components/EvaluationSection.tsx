// features/engineering/components/EvaluationSection.jsx
import React from 'react';
import { FormControl, InputLabel, Select, MenuItem, Checkbox, FormControlLabel } from '@mui/material';

const EvaluationSection = ({
  classification,
  handleClassificationChange,
  selectedRequirement,
  handleCompletedChange,
}) => {
  return (
    <>
      <FormControl fullWidth>
        <InputLabel>Klassifikation</InputLabel>
        <Select
          value={classification}
          onChange={handleClassificationChange}
          label="Klassifikation"
        >
          <MenuItem value="">Keine</MenuItem>
          <MenuItem value="Information">Information</MenuItem>
          <MenuItem value="Header">Header</MenuItem>
          <MenuItem value="Definition">Definition</MenuItem>
          <MenuItem value="Requirement">Requirement</MenuItem>
        </Select>
      </FormControl>
      <FormControlLabel
        control={
          <Checkbox
            checked={selectedRequirement?.completed || false}
            onChange={handleCompletedChange}
          />
        }
        label="Vollständig"
      />
    </>
  );
};

export default EvaluationSection;