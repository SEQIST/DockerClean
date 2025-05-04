import React from 'react';
import { GanttComponent } from '@syncfusion/ej2-react-gantt';
import '@syncfusion/ej2-base/styles/material.css';
import '@syncfusion/ej2-buttons/styles/material.css';
import '@syncfusion/ej2-calendars/styles/material.css';
import '@syncfusion/ej2-dropdowns/styles/material.css';
import '@syncfusion/ej2-gantt/styles/material.css';
import '@syncfusion/ej2-grids/styles/material.css';
import '@syncfusion/ej2-inputs/styles/material.css';
import '@syncfusion/ej2-layouts/styles/material.css';
import '@syncfusion/ej2-lists/styles/material.css';
import '@syncfusion/ej2-navigations/styles/material.css';
import '@syncfusion/ej2-popups/styles/material.css';
import '@syncfusion/ej2-richtexteditor/styles/material.css';
import '@syncfusion/ej2-treegrid/styles/material.css';

const ProcessGantt = ({ calculatedResults }: { calculatedResults: any }) => {
  // Gantt-Daten hierarchisch aufbereiten: Release → Prozess → Aktivität
  const ganttData = calculatedResults.flatMap((releaseResult: any, releaseIndex: number) => {
    const releaseActivities = releaseResult.activities;

    // Gruppieren nach Prozess
    const processMap = releaseActivities.reduce((acc: any, activity: any) => {
      if (!acc[activity.processId]) {
        acc[activity.processId] = {
          processId: activity.processId,
          processName: activity.processName,
          activities: [],
        };
      }
      acc[activity.processId].activities.push(activity);
      return acc;
    }, {});

    const processData = Object.values(processMap).map((process: any, processIndex: number) => ({
      TaskID: `R${releaseIndex}_P${processIndex}`,
      TaskName: process.processName,
      StartDate: null,
      EndDate: null,
      subtasks: process.activities.map((activity: any, activityIndex: number) => ({
        TaskID: `R${releaseIndex}_P${processIndex}_A${activityIndex}`,
        TaskName: activity.name,
        StartDate: new Date(activity.start),
        EndDate: new Date(activity.end),
        Duration: activity.duration,
        Cost: activity.cost,
        HasStartConflict: activity.startConflict,
        DateConflict: activity.dateConflict || false,
        BudgetConflict: activity.budgetConflict,
        ActivityCostConflict: activity.activityCostConflict,
      })),
    }));

    return [{
      TaskID: `R${releaseIndex}`,
      TaskName: releaseResult.releaseName,
      StartDate: null,
      EndDate: null,
      subtasks: processData,
    }];
  });

  const taskbarTemplate = (props: any) => {
    const { HasStartConflict, DateConflict, BudgetConflict, ActivityCostConflict } = props;
    let backgroundColor = '#1976d2'; // Standardfarbe
    if (HasStartConflict) {
      backgroundColor = '#ff4444'; // Rot für Startkonflikt
    } else if (DateConflict) {
      backgroundColor = '#ffbb33'; // Orange für Datumskonflikt
    } else if (BudgetConflict) {
      backgroundColor = '#ff8800'; // Dunkelorange für Budgetkonflikt
    } else if (ActivityCostConflict) {
      backgroundColor = '#ff5555'; // Hellrot für Aktivitätskostenkonflikt
    }

    return (
      <div
        className="e-gantt-child-taskbar"
        style={{
          backgroundColor,
          height: '100%',
          borderRadius: '5px',
        }}
      >
        <span style={{ color: '#fff', padding: '5px' }}>{props.TaskName}</span>
      </div>
    );
  };

  const tooltipTemplate = (props: any) => {
    const { HasStartConflict, DateConflict, BudgetConflict, ActivityCostConflict, TaskName, Cost } = props;
    const conflicts = [];
    if (HasStartConflict) conflicts.push('Startkonflikt: Rolle nicht verfügbar');
    if (DateConflict) conflicts.push('Datumskonflikt: Außerhalb der Release-Daten');
    if (BudgetConflict) conflicts.push('Budgetkonflikt: Budget überschritten');
    if (ActivityCostConflict) conflicts.push('Aktivitätskostenkonflikt: Kosten überschreiten Limit');

    return (
      <div className="bg-white dark:bg-gray-800 p-2 rounded-lg shadow-md text-gray-800 dark:text-gray-200">
        <strong>{TaskName}</strong>
        {Cost !== undefined && <div>Kosten: {Cost} €</div>}
        {conflicts.length > 0 ? (
          <div>
            <strong>Konflikte:</strong>
            <ul className="list-disc list-inside">
              {conflicts.map((conflict: any, index: number) => (
                <li key={index}>{conflict}</li>
              ))}
            </ul>
          </div>
        ) : (
          <div>Keine Konflikte</div>
        )}
      </div>
    );
  };

  return (
    <div className="mb-4">
      <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">
        Gantt-Diagramm (Release → Prozess → Aktivität)
      </h3>
      {ganttData.length > 0 ? (
        <GanttComponent
          dataSource={ganttData}
          taskFields={{
            id: 'TaskID',
            name: 'TaskName',
            startDate: 'StartDate',
            endDate: 'EndDate',
            duration: 'Duration',
            child: 'subtasks',
          }}
          dayWorkingTime={[{ from: 0, to: 24 }]}
          workWeek={['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']}
          includeWeekend={true}
          height="450px"
          width="100%"
          taskbarTemplate={taskbarTemplate}
          tooltipSettings={{
            showTooltip: true,
            taskbar: tooltipTemplate,
          }}
        />
      ) : (
        <p className="text-gray-700 dark:text-gray-300">
          Bitte führen Sie die Simulation durch, um das Gantt-Diagramm anzuzeigen.
        </p>
      )}
    </div>
  );
};

export default ProcessGantt;