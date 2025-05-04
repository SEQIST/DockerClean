import React from 'react';
import ProcessCalculationTab from './ProcessCalculationTab';

const CalculationResultTab = ({ activities, simulationData, setCalculatedActivities }) => {
  console.log('CalculationResultTab.jsx: Rendering with activities:', activities); // Debugging-Log
  console.log('CalculationResultTab.jsx: Rendering with simulationData:', simulationData); // Debugging-Log

  return (
    <ProcessCalculationTab
      activities={activities}
      simulationData={simulationData}
      setCalculatedActivities={setCalculatedActivities}
    />
  );
};

export default CalculationResultTab;