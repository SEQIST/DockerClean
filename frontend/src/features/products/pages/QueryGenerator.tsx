// src/features/products/pages/QueryGenerator.jsx
import React from 'react';
import { Box, Typography } from '@mui/material';
import QueryForm from '../components/QueryForm';
import QueryResults from '../components/QueryResults';
import useQueryData from '../hooks/useQueryData.ts';
import { saveAs } from 'file-saver';
import { Document, Packer, Paragraph, TextRun } from 'docx';

const QueryGenerator = () => {
  const {
    entities,
    selectedEntity,
    setSelectedEntity,
    fields,
    selectedFields,
    setSelectedFields,
    data,
    dependencies,
    setDependencies,
    selectedDependencies,
    setSelectedDependencies,
    dependencyHierarchy,
    setDependencyHierarchy,
    dependencyFields,
    setDependencyFields,
    dependencyData,
    results,
    setResults,
    loading,
    error,
    fetchDependencyData,
    handleQuery,
    savedQueries,
    selectedQuery,
    setSelectedQuery,
    handleLoadQuery,
  } = useQueryData();

  const handleSaveQuery = async (queryName) => {
    if (!queryName) {
      alert('Bitte geben Sie einen Abfrage-Namen ein.');
      return;
    }

    const query = {
      name: queryName,
      entity: selectedEntity,
      fields: selectedFields,
      dependencies: dependencyHierarchy,
      dependencyFields,
    };

    try {
      const response = await fetch('http://localhost:5001/api/queries', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(query),
      });

      if (!response.ok) throw new Error('Fehler beim Speichern der Abfrage');
      alert('Abfrage erfolgreich gespeichert!');
    } catch (error) {
      console.error('Fehler beim Speichern der Abfrage:', error);
      alert('Fehler beim Speichern der Abfrage');
    }
  };

  const handleExportWord = () => {
    const doc = new Document({
      sections: [
        {
          properties: {},
          children: [
            new Paragraph({
              children: [
                new TextRun({
                  text: 'Abfrage-Ergebnisse',
                  bold: true,
                  size: 24,
                }),
              ],
            }),
            ...results.flatMap((result, index) => [
              new Paragraph({
                children: [
                  new TextRun({
                    text: `Eintrag ${index + 1}`,
                    bold: true,
                    size: 20,
                  }),
                ],
              }),
              ...selectedFields.map(field => new Paragraph({
                children: [
                  new TextRun({
                    text: `${field}: ${result[field]}`,
                  }),
                ],
              })),
              ...(dependencyHierarchy || []).flatMap(dep => {
                const depItems = result[dep] || [];
                return [
                  new Paragraph({
                    children: [
                      new TextRun({
                        text: dep,
                        bold: true,
                      }),
                    ],
                  }),
                  ...depItems.map(depItem => new Paragraph({
                    children: [
                      new TextRun({
                        text: `- ${(dependencyFields[dep] || []).map(field => `${field}: ${depItem[field]}`).join(', ')}`,
                      }),
                    ],
                  })),
                ];
              }),
            ]),
          ],
        },
      ],
    });

    Packer.toBlob(doc).then(blob => {
      saveAs(blob, 'query-results.docx');
    });
  };

  console.log('QueryGenerator - dependencyHierarchy:', dependencyHierarchy);

  return (
    <Box sx={{ p: 3 }}>
      <QueryForm
        entities={entities}
        selectedEntity={selectedEntity}
        setSelectedEntity={setSelectedEntity}
        fields={fields}
        selectedFields={selectedFields}
        setSelectedFields={setSelectedFields}
        dependencies={dependencies}
        setDependencies={setDependencies}
        dependencyHierarchy={dependencyHierarchy}
        setDependencyHierarchy={setDependencyHierarchy}
        dependencyFields={dependencyFields}
        setDependencyFields={setDependencyFields}
        fetchDependencyData={fetchDependencyData}
        handleQuery={handleQuery}
        handleSaveQuery={handleSaveQuery}
        handleExportWord={handleExportWord}
        results={results}
        setResults={setResults}
        savedQueries={savedQueries}
        selectedQuery={selectedQuery}
        setSelectedQuery={setSelectedQuery}
        handleLoadQuery={handleLoadQuery}
      />
      {loading && <Typography>Lade...</Typography>}
      {error && <Typography color="error">{error}</Typography>}
      {results.length > 0 && (
        <QueryResults
          results={results}
          selectedFields={selectedFields}
          dependencyHierarchy={dependencyHierarchy}
          dependencyFields={dependencyFields}
        />
      )}
    </Box>
  );
};

export default QueryGenerator;