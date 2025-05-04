// features/engineering/pages/DataImportPage.jsx
import React, { useState, useEffect } from 'react';
import { Box, Typography, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useRFLP } from '../context/RFLPContext';
import FileUploader from '../components/FileUploader';
import ParsedDataView from '../components/ParsedDataView';
import RtfPreview from '../components/RtfPreview';
import ImportedFilesList from '../components/ImportedFilesList';
import useDataImport from '../components/useDataImport.ts';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';

const DataImportPage = () => {
  const navigate = useNavigate();
  const { rflpData, setRflpData } = useRFLP();
  const [importedFiles, setImportedFiles] = useState([]);
  const [importType, setImportType] = useState('customerRequirements');

  const {
    selectedFile,
    handleFileChange,
    handleParse,
    parsedItems,
    groupedItems,
    createGroup,
    addToGroup,
    onDragEnd,
    handleTypeChange,
    rteContent,
    errorMessage,
    setErrorMessage,
  } = useDataImport();

  // Lade importierte Dateien aus localStorage
  useEffect(() => {
    const storedFiles = localStorage.getItem('importedFiles');
    if (storedFiles) {
      try {
        setImportedFiles(JSON.parse(storedFiles));
      } catch (error) {
        console.error('Fehler beim Parsen von importedFiles:', error);
        setImportedFiles([]);
      }
    }
  }, []);

  // Finaler Import
  const handleFinalImport = async () => {
    if (!parsedItems.length) {
      setErrorMessage('Keine Daten zum Importieren vorhanden.');
      return;
    }

    try {
      const grouped = groupedItems.map(group => ({
        ...group,
        items: parsedItems.filter(item => item.groupId === group.id),
      }));
      const ungrouped = parsedItems.filter(item => !item.groupId);

      const importData = {
        projectId: uuidv4(),
        importType,
        groups: grouped.map(group => ({
          name: group.name,
          requirements: group.items.map(item => ({
            text: item.text,
            type: item.type,
          })),
        })),
        ungrouped: ungrouped.map(item => ({
          text: item.text,
          type: item.type,
        })),
      };

      // Sende an Backend mit dynamischer API-URL
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001';
      const response = await axios.post(`${apiUrl}/api/engineering/import`, importData);

      // Aktualisiere rflpData (nur relevante Anforderungen)
      const uniqueKey = `${selectedFile.name}-${Date.now()}`;
      const newProjectData = {
        [uniqueKey]: {
          id: uniqueKey,
          name: selectedFile.name,
          customerRequirements: importType === 'customerRequirements' ? response.data.requirements : [],
          systemRequirements: importType === 'systemRequirements' ? response.data.requirements : [],
          functional: [],
          logical: [],
          physical: [],
        },
      };

      const updatedRflpData = { ...rflpData, ...newProjectData };
      setRflpData(updatedRflpData);
      localStorage.setItem('rflpData', JSON.stringify(updatedRflpData));

      // Aktualisiere importedFiles
      const updatedImportedFiles = [
        ...importedFiles,
        { name: selectedFile.name, data: importData, key: uniqueKey },
      ];
      setImportedFiles(updatedImportedFiles);
      localStorage.setItem('importedFiles', JSON.stringify(updatedImportedFiles));

      // Navigiere zur Engineering-Seite
      navigate('/engineering');
    } catch (error) {
      console.error('Fehler beim finalen Import:', error);
      setErrorMessage('Fehler beim Import: ' + error.message);
    }
  };

  // Datei löschen
  const handleDeleteFile = (fileKey) => {
    const updatedImportedFiles = importedFiles.filter(file => file.key !== fileKey);
    setImportedFiles(updatedImportedFiles);
    localStorage.setItem('importedFiles', JSON.stringify(updatedImportedFiles));

    const updatedRflpData = { ...rflpData };
    delete updatedRflpData[fileKey];
    setRflpData(updatedRflpData);
    localStorage.setItem('rflpData', JSON.stringify(updatedRflpData));

    alert(`Datei erfolgreich gelöscht.`);
  };

  // Alle Daten löschen
  const handleClearAllData = () => {
    localStorage.removeItem('rflpData');
    localStorage.removeItem('importedFiles');
    setRflpData({});
    setImportedFiles([]);
    alert('Alle Daten wurden gelöscht.');
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Datenimport
      </Typography>
      <FileUploader
        selectedFile={selectedFile}
        handleFileChange={handleFileChange}
        importType={importType}
        setImportType={setImportType}
        handleParse={handleParse}
        errorMessage={errorMessage}
      />
      {parsedItems.length > 0 && (
        <>
          <ParsedDataView
            parsedItems={parsedItems}
            groupedItems={groupedItems}
            addToGroup={addToGroup}
            handleTypeChange={handleTypeChange}
          />
          <RtfPreview rteContent={rteContent} />
          <Button
            variant="contained"
            color="success"
            onClick={handleFinalImport}
            sx={{ mt: 2 }}
          >
            Import bestätigen
          </Button>
        </>
      )}
      <ImportedFilesList
        importedFiles={importedFiles}
        handleDeleteFile={handleDeleteFile}
        handleClearAllData={handleClearAllData}
      />
    </Box>
  );
};

export default DataImportPage;