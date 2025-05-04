import React from 'react';
import { GanttComponent } from '@syncfusion/ej2-react-gantt';

const GanttChart = ({ calculatedActivities }: { calculatedActivities: any }) => {
  const ganttData = calculatedActivities
    .filter((activity: any) => !activity.hasError)
    .map((activity: any) => ({
      TaskID: activity.id,
      TaskName: activity.name,
      StartDate: new Date(activity.start),
      EndDate: new Date(activity.end),
      Duration: activity.duration,
      Cost: activity.cost,
      HasStartConflict: activity.startConflict,
      DateConflict: activity.dateConflict,
      BudgetConflict: activity.budgetConflict,
      ActivityCostConflict: activity.activityCostConflict,
    }));

  // Anpassung der Taskbar-Stile basierend auf Konflikten
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

  // Tooltip-Template für Konflikte
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
        <div>Kosten: {Cost} €</div>
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
        Gantt-Diagramm
      </h3>
      {calculatedActivities.length > 0 ? (
        <GanttComponent
          dataSource={ganttData}
          taskFields={{
            id: 'TaskID',
            name: 'TaskName',
            startDate: 'StartDate',
            endDate: 'EndDate',
            duration: 'Duration',
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
          Bitte führen Sie die Berechnung durch, um das Gantt-Diagramm anzuzeigen.
        </p>
      )}
    </div>
  );
};

export default GanttChart;