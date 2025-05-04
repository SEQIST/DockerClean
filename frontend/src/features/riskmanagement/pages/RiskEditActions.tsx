import React from 'react';
import { Button } from '@mui/material';

const RiskEditActions = {
  ErrorButtons: ({ navigate, isError }) => {
    if (!isError) return null;
    return (
      <Button
        variant="contained"
        onClick={() => navigate('/riskmanagement')}
        sx={{ mt: 2, backgroundColor: '#1976d2', color: '#fff', textTransform: 'none' }}
      >
        Zurück
      </Button>
    );
  },
};

export default RiskEditActions;