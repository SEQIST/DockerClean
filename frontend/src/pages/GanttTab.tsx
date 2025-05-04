import React from 'react';
import { GanttComponent } from '@syncfusion/ej2-react-gantt';
import '@syncfusion/ej2-base/styles/material.css';
import '@syncfusion/ej2-buttons/styles/material.css';
import '@syncfusion/ej2-calendars/styles/material.css';
import '@syncfusion/ej2-dropdowns/styles/material.css';
import '@syncfusion/ej2-inputs/styles/material.css';
import '@syncfusion/ej2-navigations/styles/material.css';
import '@syncfusion/ej2-popups/styles/material.css';
import '@syncfusion/ej2-grids/styles/material.css';
import '@syncfusion/ej2-treegrid/styles/material.css';
import '@syncfusion/ej2-gantt/styles/material.css';

const GanttTab = ({ activities }) => {
  console.log('GanttTab.jsx: Rendering with activities:', activities); // Debugging-Log

  const taskFields = {
    id: '_id',
    name: 'name',
    startDate: 'startDate',
    endDate: 'endDate',
    duration: 'duration',
  };

  return (
    <div style={{ height: '500px' }}>
      <GanttComponent
        dataSource={activities}
        taskFields={taskFields}
        height="100%"
        allowResizing={true}
        allowSorting={true}
      />
    </div>
  );
};

export default GanttTab;