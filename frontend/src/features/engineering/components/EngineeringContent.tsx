// features/engineering/components/EngineeringContent.jsx
import React from 'react';
import { Box, Typography, List, ListItem, ListItemText, IconButton } from '@mui/material';
import { Delete, Verified } from '@mui/icons-material';
import { Chart } from 'react-google-charts';

const EngineeringContent = ({
  selectedStandard,
  engineeringContents,
  cachedContents,
  engineeringEvaluations,
  selectedContent,
  loadingContents,
  setSelectedContent,
  handleDeleteContent,
  getComplianceStats,
  handleScroll,
}) => {
  return (
    <Box
      sx={{
        width: '60%',
        p: 2,
        backgroundColor: '#ffffff',
        boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
        overflowY: 'auto',
        height: 'calc(100vh - 80px)',
      }}
      onScroll={handleScroll}
    >
      <Typography variant="h6" sx={{ mb: 2, color: '#333' }}>
        Inhalt der Anforderungen
      </Typography>
      {selectedStandard && (
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" sx={{ mb: 2, color: '#333' }}>
            Bewertung
          </Typography>
          <Typography variant="body2" sx={{ mb: 1, color: '#666' }}>
            Number of Items: {getComplianceStats.totalItems}
          </Typography>
          <Typography variant="body2" sx={{ mb: 1, color: '#666' }}>
            Requirements No: {getComplianceStats.requirements}
          </Typography>
          <Typography variant="body2" sx={{ mb: 2, color: '#666' }}>
            Completed No: {getComplianceStats.completedRequirements}
          </Typography>
          <Chart
            chartType="PieChart"
            data={getComplianceStats.chartData}
            options={{
              title: 'Compliance-Status',
              colors: ['#ff0000', '#0000ff'],
              chartArea: { width: '80%', height: '70%' },
              legend: { position: 'bottom' },
            }}
            width="100%"
            height="300px"
          />
        </Box>
      )}
      {selectedStandard ? (
        loadingContents && engineeringContents.length === 0 ? (
          <Typography sx={{ color: '#666' }}>Lade Inhaltselemente...</Typography>
        ) : engineeringContents.length === 0 ? (
          <Typography sx={{ color: '#666' }}>Keine Inhaltselemente verfügbar.</Typography>
        ) : (
          <List>
            {engineeringContents.map((content, index) => {
              const evaluation = engineeringEvaluations.find(evaluation => evaluation.regulatoryContent && evaluation.regulatoryContent._id.toString() === content._id.toString());
              const isRequirement = content.type === 'Requirement';
              const isCompleted = evaluation && evaluation.completed;
              const isHeader = content.type === 'Header';
              const previousContent = index > 0 ? engineeringContents[index - 1] : null;
              const isIndented = !isHeader && previousContent && previousContent.type === 'Header';

              return (
                <ListItem
                  key={content._id}
                  button
                  selected={selectedContent && selectedContent._id === content._id}
                  onClick={() => setSelectedContent(content)}
                  sx={{
                    borderRadius: 1,
                    mb: 0.5,
                    backgroundColor: isCompleted ? '#e0ffe0' : isRequirement ? '#f0f4f8' : 'inherit',
                    pl: isIndented ? 4 : 2,
                    borderTop: isHeader ? '1px solid #e0e0e0' : 'none',
                    '&:hover': { backgroundColor: '#f0f0f0' },
                  }}
                >
                  {isRequirement && <Verified sx={{ color: '#1976d2', mr: 1 }} />}
                  <ListItemText primary={content.text} sx={{ color: '#333' }} />
                  <IconButton onClick={() => handleDeleteContent(content._id)} color="error">
                    <Delete />
                  </IconButton>
                </ListItem>
              );
            })}
            {loadingContents && (
              <Typography sx={{ color: '#666', textAlign: 'center', py: 2 }}>
                Lade weitere Inhaltselemente...
              </Typography>
            )}
          </List>
        )
      ) : (
        <Typography sx={{ color: '#666' }}>Wähle einen Standard aus der Liste</Typography>
      )}
    </Box>
  );
};

export default EngineeringContent;