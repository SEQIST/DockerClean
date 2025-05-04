// src/features/products/components/QueryForm.jsx
import React, { useState } from 'react';
import { Box, FormControl, InputLabel, Select, MenuItem, Checkbox, ListItemText, TextField, Button } from '@mui/material';

const QueryForm = ({
  entities,
  selectedEntity,
  setSelectedEntity,
  fields,
  selectedFields,
  setSelectedFields,
  dependencies,
  setDependencies,
  dependencyHierarchy,
  setDependencyHierarchy,
  dependencyFields,
  setDependencyFields,
  fetchDependencyData,
  handleQuery,
  handleSaveQuery,
  handleExportWord,
  results,
  setResults,
  savedQueries,
  selectedQuery,
  setSelectedQuery,
  handleLoadQuery,
}) => {
  const [queryName, setQueryName] = useState('');

  const handleEntityChange = (event) => {
    setSelectedEntity(event.target.value);
    setSelectedFields([]);
    setDependencyHierarchy([]);
    setDependencyFields({});
    setResults([]);
  };

  const handleFieldChange = (event) => {
    const value = event.target.value;
    setSelectedFields(value);
  };

  const handleDependencyChange = (level, event) => {
    const selected = event.target.value;
    const newHierarchy = [...dependencyHierarchy];
    newHierarchy[level] = selected;
  
    // Kein Abschneiden der nachfolgenden Ebenen, sondern dynamische Anpassung
    setDependencyHierarchy(newHierarchy);
    console.log(`Dependency Hierarchy nach Änderung (Ebene ${level + 1}):`, newHierarchy);
  
    // Abhängigkeiten für die nächste Ebene dynamisch setzen
    let nextDeps = [];
    if (level === 0) {
      if (selected.includes('Aktivitäten')) {
        nextDeps = ['Work Products', 'Rollen', 'Prozesse'];
      } else if (selected.includes('Rollen')) {
        nextDeps = ['Aktivitäten', 'Work Products'];
      } else if (selected.includes('Prozesse')) {
        nextDeps = ['Aktivitäten'];
      } else if (selected.includes('Work Products')) {
        nextDeps = ['Aktivitäten', 'Rollen'];
      }
    } else if (level === 1) {
      if (selected.includes('Work Products')) {
        nextDeps = ['Rollen', 'Aktivitäten'];
      } else if (selected.includes('Rollen')) {
        nextDeps = ['Work Products', 'Aktivitäten'];
      } else if (selected.includes('Prozesse')) {
        nextDeps = ['Aktivitäten'];
      } else if (selected.includes('Aktivitäten')) {
        nextDeps = ['Work Products', 'Rollen', 'Prozesse'];
      }
    } else if (level === 2) {
      if (selected.includes('Work Products')) {
        nextDeps = ['Rollen', 'Aktivitäten'];
      } else if (selected.includes('Rollen')) {
        nextDeps = ['Work Products', 'Aktivitäten'];
      } else if (selected.includes('Prozesse')) {
        nextDeps = ['Aktivitäten'];
      } else if (selected.includes('Aktivitäten')) {
        nextDeps = ['Work Products', 'Rollen', 'Prozesse'];
      }
    }
    setDependencies(nextDeps);
  
    // Daten für die ausgewählten Abhängigkeiten laden
    selected.forEach(dep => {
      fetchDependencyData(dep).then(data => {
        console.log(`Daten für ${dep} (Ebene ${level + 1}):`, data); // Debugging
      });
    });
  };

  const handleDependencyFieldChange = (dep, event) => {
    const selectedFields = event.target.value;
    setDependencyFields(prev => ({
      ...prev,
      [dep]: selectedFields,
    }));
    console.log(`Dependency Fields für ${dep}:`, selectedFields);
  };

  const handleSavedQueryChange = (event) => {
    const queryId = event.target.value;
    const query = savedQueries.find(q => q.id === queryId);
    setSelectedQuery(query);
    if (query) {
      handleLoadQuery(query);
      setQueryName(query.name);
    } else {
      setSelectedEntity('');
      setSelectedFields([]);
      setDependencyHierarchy([]);
      setDependencyFields({});
      setResults([]);
      setQueryName('');
    }
  };

  return (
    <Box sx={{ mb: 2 }}>
      <FormControl fullWidth sx={{ mb: 2 }}>
        <InputLabel>Vorhandene Abfrage auswählen</InputLabel>
        <Select
          value={selectedQuery ? selectedQuery.id : ''}
          onChange={handleSavedQueryChange}
          label="Vorhandene Abfrage auswählen"
        >
          <MenuItem key="none" value="">Keine</MenuItem>
          {Array.isArray(savedQueries) && savedQueries.map(query => (
            <MenuItem key={query.id} value={query.id}>{query.name}</MenuItem>
          ))}
        </Select>
      </FormControl>
      <FormControl fullWidth sx={{ mb: 2 }}>
        <InputLabel>Entität auswählen</InputLabel>
        <Select
          value={selectedEntity}
          onChange={handleEntityChange}
          label="Entität auswählen"
        >
          {entities.map(entity => (
            <MenuItem key={entity} value={entity}>{entity}</MenuItem>
          ))}
        </Select>
      </FormControl>
      {selectedEntity && (
        <>
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Felder auswählen</InputLabel>
            <Select
              multiple
              value={selectedFields}
              onChange={handleFieldChange}
              label="Felder auswählen"
              renderValue={(selected) => selected.join(', ')}
            >
              {fields.map(field => (
                <MenuItem key={field} value={field}>
                  <Checkbox checked={selectedFields.includes(field)} />
                  <ListItemText primary={field} />
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          {[...Array(dependencyHierarchy.length + 1)].map((_, level) => (
            <Box key={level}>
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Unterabhängigkeiten auswählen (Ebene {level + 1})</InputLabel>
                <Select
                  multiple
                  value={dependencyHierarchy[level] || []}
                  onChange={(event) => handleDependencyChange(level, event)}
                  label={`Unterabhängigkeiten auswählen (Ebene ${level + 1})`}
                  renderValue={(selected) => selected.join(', ')}
                >
                  {(dependencies || []).map(dep => (
                    <MenuItem key={dep} value={dep}>
                      <Checkbox checked={(dependencyHierarchy[level] || []).includes(dep)} />
                      <ListItemText primary={dep} />
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              {(dependencyHierarchy[level] || []).map(dep => (
                <FormControl fullWidth sx={{ mb: 2 }} key={dep}>
                  <InputLabel>Felder für {dep} auswählen</InputLabel>
                  <Select
                    multiple
                    value={dependencyFields[dep] || []}
                    onChange={(event) => handleDependencyFieldChange(dep, event)}
                    label={`Felder für ${dep} auswählen`}
                    renderValue={(selected) => selected.join(', ')}
                  >
                    {(dependencyFields[dep] || []).map(field => (
                      <MenuItem key={field} value={field}>
                        <Checkbox checked={(dependencyFields[dep] || []).includes(field)} />
                        <ListItemText primary={field} />
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              ))}
            </Box>
          ))}
          <TextField
            label="Abfrage-Name"
            value={queryName}
            onChange={(e) => setQueryName(e.target.value)}
            fullWidth
            sx={{ mb: 2 }}
          />
          <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
            <Button variant="contained" onClick={handleQuery}>
              Abfrage ausführen
            </Button>
            <Button variant="outlined" onClick={() => handleSaveQuery(queryName)}>
              Abfrage speichern
            </Button>
            {results.length > 0 && (
              <Button variant="outlined" onClick={handleExportWord}>
                Als Word exportieren
              </Button>
            )}
          </Box>
        </>
      )}
    </Box>
  );
};

export default QueryForm;