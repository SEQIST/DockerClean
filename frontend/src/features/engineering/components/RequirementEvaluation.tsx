// features/engineering/components/RequirementEvaluation.jsx
import React, { useEffect, useState } from 'react';
import { Box, Typography, Button } from '@mui/material';
import SystemRequirementDialog from './SystemRequirementDialog';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import EvaluationSection from './EvaluationSection';
import CommentSection from './CommentSection';
import TextEditorSection from './TextEditorSection';
import { useNavigate } from 'react-router-dom'; // Füge useNavigate hinzu

// Registriere die Chart.js-Komponenten
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const RequirementEvaluation = ({
  selectedRequirement,
  classification,
  setClassification,
  rflpData,
  setRflpData,
  selectedProject,
  dialogOpen,
  setDialogOpen,
  contextCustomerRequirement,
  setContextCustomerRequirement,
  allItems,
  setAllItems,
  setSelectedRequirement,
}) => {
  const navigate = useNavigate(); // Verwende useNavigate
  const [editorContent, setEditorContent] = useState(selectedRequirement?.text || '');
  const [comment, setComment] = useState(selectedRequirement?.comment || '');

  // Synchronisiere classification mit selectedRequirement
  useEffect(() => {
    if (selectedRequirement) {
      setClassification(selectedRequirement.classification || '');
      setEditorContent(selectedRequirement.text || '');
      setComment(selectedRequirement.comment || '');
    }
  }, [selectedRequirement, setClassification]);

  const handleClassificationChange = (event) => {
    const newClassification = event.target.value;
    setClassification(newClassification);

    if (selectedProject && selectedRequirement) {
      const updatedRflpData = { ...rflpData };
      const projectData = updatedRflpData[selectedProject];
      const updatedCustomerRequirements = projectData.customerRequirements.map(req =>
        req.id === selectedRequirement.id ? { ...req, classification: newClassification } : req
      );
      const updatedSystemRequirements = projectData.systemRequirements.map(req =>
        req.id === selectedRequirement.id ? { ...req, classification: newClassification } : req
      );
      updatedRflpData[selectedProject] = {
        ...projectData,
        customerRequirements: updatedCustomerRequirements,
        systemRequirements: updatedSystemRequirements,
      };
      setRflpData(updatedRflpData);
      localStorage.setItem('rflpData', JSON.stringify(updatedRflpData));

      // Aktualisiere allItems
      const updatedAllItems = allItems.map(item =>
        item.id === selectedRequirement.id ? { ...item, classification: newClassification } : item
      );
      setAllItems(updatedAllItems);
    }
  };

  const handleCompletedChange = (event) => {
    const isCompleted = event.target.checked;
    if (selectedProject && selectedRequirement) {
      const updatedRflpData = { ...rflpData };
      const projectData = updatedRflpData[selectedProject];
      const updatedCustomerRequirements = projectData.customerRequirements.map(req =>
        req.id === selectedRequirement.id ? { ...req, completed: isCompleted } : req
      );
      const updatedSystemRequirements = projectData.systemRequirements.map(req =>
        req.id === selectedRequirement.id ? { ...req, completed: isCompleted } : req
      );
      updatedRflpData[selectedProject] = {
        ...projectData,
        customerRequirements: updatedCustomerRequirements,
        systemRequirements: updatedSystemRequirements,
      };
      setRflpData(updatedRflpData);
      localStorage.setItem('rflpData', JSON.stringify(updatedRflpData));

      // Aktualisiere allItems
      const updatedAllItems = allItems.map(item =>
        item.id === selectedRequirement.id ? { ...item, completed: isCompleted } : item
      );
      setAllItems(updatedAllItems);
    }
  };

  const handleCommentChange = (event) => {
    const newComment = event.target.value;
    setComment(newComment);

    if (selectedProject && selectedRequirement) {
      const updatedRflpData = { ...rflpData };
      const projectData = updatedRflpData[selectedProject];
      const updatedCustomerRequirements = projectData.customerRequirements.map(req =>
        req.id === selectedRequirement.id ? { ...req, comment: newComment } : req
      );
      updatedRflpData[selectedProject] = {
        ...projectData,
        customerRequirements: updatedCustomerRequirements,
      };
      setRflpData(updatedRflpData);
      localStorage.setItem('rflpData', JSON.stringify(updatedRflpData));
    }
  };

  const handleEditorChange = (content) => {
    setEditorContent(content);

    if (selectedProject && selectedRequirement) {
      const updatedRflpData = { ...rflpData };
      const projectData = updatedRflpData[selectedProject];
      const updatedSystemRequirements = projectData.systemRequirements.map(req =>
        req.id === selectedRequirement.id ? { ...req, text: content } : req
      );
      updatedRflpData[selectedProject] = {
        ...projectData,
        systemRequirements: updatedSystemRequirements,
      };
      setRflpData(updatedRflpData);
      localStorage.setItem('rflpData', JSON.stringify(updatedRflpData));

      // Aktualisiere allItems
      const updatedAllItems = allItems.map(item =>
        item.id === selectedRequirement.id ? { ...item, text: content } : item
      );
      setAllItems(updatedAllItems);
    }
  };

  const handleCreateSystemRequirement = () => {
    setContextCustomerRequirement(selectedRequirement);
    setDialogOpen(true);
  };

  const handleSystemRequirementClick = (systemReqId) => {
    const systemReq = rflpData[selectedProject]?.systemRequirements.find(req => req.id === systemReqId);
    if (systemReq) {
      const formattedItem = {
        id: systemReq.id,
        text: systemReq.header || systemReq.text || 'Unbenanntes Element',
        type: systemReq.type || systemReq.classification || 'Requirement',
        classification: systemReq.classification || '',
        completed: systemReq.completed || false,
        groupId: systemReq.parentId ? `system-group-${systemReq.parentId}` : null,
      };
      setSelectedRequirement(formattedItem);

      // Navigiere zur Systemanforderungsseite
      navigate(`/system-requirements/${selectedProject}`);
    }
  };

  // Daten für die Grafik
  const totalItems = allItems.length;
  const withDepartment = allItems.filter(item => item.classification === 'Requirement').length;
  const completedItems = allItems.filter(item => item.classification === 'Requirement' && item.completed).length;

  const chartData = {
    labels: ['Anforderungen'],
    datasets: [
      {
        label: 'Gesamt',
        data: [totalItems],
        backgroundColor: '#1976d2',
      },
      {
        label: 'Mit Abteilung',
        data: [withDepartment],
        backgroundColor: '#d32f2f',
      },
      {
        label: 'Vollständig',
        data: [completedItems],
        backgroundColor: '#388e3c',
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Anforderungsübersicht',
      },
    },
    scales: {
      x: {
        stacked: true,
      },
      y: {
        stacked: true,
        beginAtZero: true,
      },
    },
  };

  // Finde abgeleitete Systemanforderungen
  const linkedSystemRequirements = selectedRequirement?.id
    ? (rflpData[selectedProject]?.systemRequirements || []).filter(sysReq =>
        sysReq.traces?.customerRequirementId === selectedRequirement.id
      )
    : [];

  // Prüfe, ob es sich um eine Systemanforderung handelt
  const isSystemRequirement = selectedRequirement?.id?.startsWith('system-');

  return (
    <>
      <Box sx={{ flexGrow: 1, p: 3, borderLeft: '1px solid #ccc' }}>
        <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
          Anforderungsübersicht
        </Typography>
        <Box sx={{ height: 200, mb: 4 }}>
          <Bar data={chartData} options={chartOptions} />
        </Box>

        {selectedRequirement ? (
          <>
            <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
              Bewertung
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <EvaluationSection
                classification={classification}
                handleClassificationChange={handleClassificationChange}
                selectedRequirement={selectedRequirement}
                handleCompletedChange={handleCompletedChange}
              />

              {!isSystemRequirement && (
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleCreateSystemRequirement}
                >
                  Systemanforderung ableiten
                </Button>
              )}

              {/* Zeige abgeleitete Systemanforderungen direkt unter den Bewertungsoptionen */}
              {linkedSystemRequirements.length > 0 && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
                    Abgeleitete Systemanforderungen
                  </Typography>
                  {linkedSystemRequirements.map(sysReq => (
                    <Box
                      key={sysReq.id}
                      sx={{
                        p: 2,
                        mb: 2,
                        border: '1px solid #ccc',
                        borderRadius: 1,
                        cursor: 'pointer',
                        '&:hover': { bgcolor: '#f0f0f0' },
                      }}
                      onClick={() => handleSystemRequirementClick(sysReq.id)}
                    >
                      <Typography variant="subtitle1" gutterBottom>
                        {sysReq.header || 'Kein Header'}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        {sysReq.text || 'Kein Text'}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              )}

              {/* Kommentarfeld für Kundenanforderungen, TinyMCE für Systemanforderungen */}
              {isSystemRequirement ? (
                <TextEditorSection
                  editorContent={editorContent}
                  handleEditorChange={handleEditorChange}
                />
              ) : (
                <CommentSection
                  comment={comment}
                  handleCommentChange={handleCommentChange}
                />
              )}
            </Box>
          </>
        ) : (
          <Typography>Wählen Sie ein Element aus der Liste aus.</Typography>
        )}
      </Box>

      {/* Dialog für neue Systemanforderung */}
      <SystemRequirementDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSave={(newSystemRequirement) => {
          if (selectedProject) {
            const updatedRflpData = { ...rflpData };
            const projectData = updatedRflpData[selectedProject];
            const newSystemReq = {
              id: `system-req-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
              header: newSystemRequirement.header,
              text: newSystemRequirement.text,
              parentId: null,
              traces: {
                customerRequirementId: newSystemRequirement.customerRequirementId,
              },
              completed: false,
            };
            const updatedCustomerRequirements = projectData.customerRequirements.map(req =>
              req.id === newSystemRequirement.customerRequirementId
                ? {
                    ...req,
                    traces: {
                      ...req.traces,
                      systemRequirementIds: [
                        ...(req.traces?.systemRequirementIds || []),
                        newSystemReq.id,
                      ],
                    },
                  }
                : req
            );
            updatedRflpData[selectedProject] = {
              ...projectData,
              customerRequirements: updatedCustomerRequirements,
              systemRequirements: [...projectData.systemRequirements, newSystemReq],
            };
            setRflpData(updatedRflpData);
            localStorage.setItem('rflpData', JSON.stringify(updatedRflpData));
          }
        }}
        customerRequirement={contextCustomerRequirement}
      />
    </>
  );
};

export default RequirementEvaluation;