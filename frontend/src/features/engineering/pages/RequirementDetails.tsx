import React from 'react';
import { Box, Typography, Link } from '@mui/material';

const RequirementDetails = ({ selectedRequirement, processedSystemRequirements, setSelectedRequirement }) => {
  if (!selectedRequirement) {
    return (
      <Box sx={{ flex: 1, p: 2, overflowY: 'auto' }}>
        <Typography>Wählen Sie ein Element aus der Liste aus.</Typography>
      </Box>
    );
  }

  // Suche nach verknüpften Systemanforderungen (wenn es eine Kundenanforderung ist)
  const linkedSystemRequirements = selectedRequirement.traces?.systemRequirementIds
    ? processedSystemRequirements.filter(req =>
        selectedRequirement.traces.systemRequirementIds.includes(req.id)
      )
    : [];

  return (
    <Box sx={{ flex: 1, p: 2, overflowY: 'auto' }}>
      <Typography variant="h6" gutterBottom>
        {selectedRequirement.name || selectedRequirement.header}
      </Typography>
      <Typography variant="body1">
        {selectedRequirement.description || selectedRequirement.text || 'Keine Beschreibung verfügbar.'}
      </Typography>
      {/* Zeige verknüpfte Systemanforderungen (nur für Kundenanforderungen) */}
      {linkedSystemRequirements.length > 0 && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="subtitle1" gutterBottom>
            Verknüpfte Systemanforderungen:
          </Typography>
          {linkedSystemRequirements.map((systemReq) => (
            <Box key={systemReq.id} sx={{ mb: 1 }}>
              <Link
                component="button"
                variant="body2"
                onClick={() => setSelectedRequirement(systemReq)}
                sx={{ cursor: 'pointer' }}
              >
                {systemReq.header || systemReq.name || `Systemanforderung ${systemReq.id}`}
              </Link>
            </Box>
          ))}
        </Box>
      )}
    </Box>
  );
};

export default RequirementDetails;