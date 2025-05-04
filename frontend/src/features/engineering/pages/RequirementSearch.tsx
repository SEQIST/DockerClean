import React, { useState } from 'react';
import { Box, TextField, FormControl, InputLabel, Select, MenuItem } from '@mui/material';

const RequirementSearch = ({ onSearch, onFilter }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [isRequirementFilter, setIsRequirementFilter] = useState('all');

  const handleSearchChange = (event) => {
    const value = event.target.value;
    setSearchTerm(value);
    onSearch(value);
  };

  const handleCategoryFilterChange = (event) => {
    const value = event.target.value;
    setCategoryFilter(value);
    onFilter({ category: value, isRequirement: isRequirementFilter });
  };

  const handleIsRequirementFilterChange = (event) => {
    const value = event.target.value;
    setIsRequirementFilter(value);
    onFilter({ category: categoryFilter, isRequirement: value });
  };

  return (
    <Box sx={{ mb: 2 }}>
      <TextField
        label="Suche"
        value={searchTerm}
        onChange={handleSearchChange}
        fullWidth
        margin="normal"
      />
      <FormControl fullWidth sx={{ mt: 1 }}>
        <InputLabel>Kategorie</InputLabel>
        <Select
          value={categoryFilter}
          onChange={handleCategoryFilterChange}
          label="Kategorie"
        >
          <MenuItem value="all">Alle</MenuItem>
          <MenuItem value="customer">Kundenanforderungen</MenuItem>
          <MenuItem value="system">Systemanforderungen</MenuItem>
          <MenuItem value="functional">Funktionale Sicht</MenuItem>
          <MenuItem value="logical">Logische Sicht</MenuItem>
          <MenuItem value="physical">Physische Sicht</MenuItem>
        </Select>
      </FormControl>
      <FormControl fullWidth sx={{ mt: 1 }}>
        <InputLabel>Ist Requirement</InputLabel>
        <Select
          value={isRequirementFilter}
          onChange={handleIsRequirementFilterChange}
          label="Ist Requirement"
        >
          <MenuItem value="all">Alle</MenuItem>
          <MenuItem value="yes">Ja</MenuItem>
          <MenuItem value="no">Nein</MenuItem>
        </Select>
      </FormControl>
    </Box>
  );
};

export default RequirementSearch;