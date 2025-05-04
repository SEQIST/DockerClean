import React, { useState } from 'react';
import { Box, Typography, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';
import { Warning as WarningIcon } from '@mui/icons-material';
import { calculateProcess } from '../features/utils/calculateProcess.ts';

const ProcessCalculationTab = ({ activities, simulationData, setCalculatedActivities }) => {
  const [calculationResult, setCalculationResult] = useState([]);
  const COST_THRESHOLD = 2000; // Schwellenwert für Kosten (z. B. 2000 €)

  const calculate = () => {
    console.log('Simulation Data:', simulationData); // Debugging-Log
    const result = calculateProcess(activities, simulationData);
    
    const formattedResult = result.map(activity => {
      const startDate = new Date(activity.start);
      const endDate = new Date(activity.end);

      // Startkonflikt basierend auf Abhängigkeiten und Rollenverfügbarkeit
      let startConflict = activity.hasStartConflict;

      // Wenn die Aktivität einen Trigger hat, prüfe, ob die Trigger-Work-Products fertig sind
      if (activity.trigger?.workProducts?.length) {
        const triggerWorkProducts = activity.trigger.workProducts;
        const hasUnfinishedTrigger = triggerWorkProducts.some(wp => {
          const wpId = wp._id?._id || wp._id;
          const simWp = simulationData.workProducts.find(w => w._id === wpId || w.name === wp.name);
          // Wenn das Work Product in den Simulationsdaten ist, ist es 100% fertig
          if (simWp) return false;
          // Andernfalls prüfe, ob es eine produzierende Aktivität gibt, die noch nicht fertig ist
          const producingActivity = activities.find(a => (a.result?._id || a.result) === wpId);
          if (producingActivity) {
            const prodActivity = result.find(a => a.id === producingActivity._id);
            if (!prodActivity) return true; // Produzierende Aktivität nicht berechnet
            const requiredCompletion = wp.completionPercentage || 100;
            const durationDays = prodActivity.duration;
            const daysToCompletion = (requiredCompletion / 100) * durationDays;
            const completionDate = new Date(prodActivity.start);
            completionDate.setDate(completionDate.getDate() + daysToCompletion);
            return completionDate > startDate;
          }
          return true; // Keine produzierende Aktivität gefunden
        });
        startConflict = startConflict || hasUnfinishedTrigger;
      }

      return {
        ...activity,
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0],
        duration: activity.duration,
        cost: activity.cost,
        startConflict,
        highCost: activity.cost > COST_THRESHOLD,
      };
    });

    console.log('ProcessCalculationTab.jsx: Calculation Result:', formattedResult);
    setCalculationResult(formattedResult);
    setCalculatedActivities(formattedResult);
  };

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom sx={{ color: '#1976d2' }}>
        Berechnungsergebnis
      </Typography>
      <Button variant="contained" onClick={calculate} sx={{ mb: 2, backgroundColor: '#1976d2', color: '#fff' }}>
        Berechnen
      </Button>
      {calculationResult.length > 0 ? (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Aktivität</TableCell>
                <TableCell>Startdatum</TableCell>
                <TableCell>Enddatum</TableCell>
                <TableCell>Dauer (Tage)</TableCell>
                <TableCell>Kosten (€)</TableCell>
                <TableCell>Startkonflikt</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {calculationResult.map((activity) => (
                <TableRow key={activity._id}>
                  <TableCell>{activity.name}</TableCell>
                  <TableCell>{activity.startDate}</TableCell>
                  <TableCell>{activity.endDate}</TableCell>
                  <TableCell>{activity.duration}</TableCell>
                  <TableCell sx={{ color: activity.highCost ? 'orange' : 'inherit' }}>
                    {activity.cost}
                    {activity.highCost && (
                      <Box component="span" sx={{ ml: 1, display: 'inline-flex', alignItems: 'center' }}>
                        <WarningIcon sx={{ fontSize: '1rem', color: 'orange' }} />
                        <Typography variant="caption" sx={{ ml: 0.5, color: 'orange' }}>
                          Hohe Kosten
                        </Typography>
                      </Box>
                    )}
                  </TableCell>
                  <TableCell>
                    {activity.startConflict ? (
                      <Box sx={{ display: 'flex', alignItems: 'center', color: 'red' }}>
                        <WarningIcon sx={{ mr: 1 }} />
                        Startkonflikt
                      </Box>
                    ) : (
                      'Kein Konflikt'
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        <Typography>Bitte klicken Sie auf "Berechnen", um die Ergebnisse anzuzeigen.</Typography>
      )}
    </Box>
  );
};

export default ProcessCalculationTab;