interface CalculatedActivity {
  id: string;
  name: string;
  start: string;
  end: string;
  role: string;
  duration: number;
  knownDuration: number;
  estimatedDuration: number;
  cost: number;
  hasStartConflict: boolean;
  totalMinutes: number;
  minutesKnown: number;
  minutesUnknown: number;
  totalHours: number;
  workingHoursPerDay: number;
  numRoles: number;
  trigger: string;
  startConflict: string;
  dateConflict: string;
  budgetConflict: string;
  activityCostConflict: string;
  status: string;
  releaseId: string;
  releaseName: string;
  processId: string;
  processName: string;
  hasError?: boolean;
  warning?: string; // Hinzugefügt
}

interface Activity {
  _id: string;
  name: string;
  knownTime: number;
  estimatedTime: number;
}

interface Props {
  calculatedActivities: CalculatedActivity[];
  activities: Activity[];
  COST_THRESHOLD: number;
  calculate: () => void;
}

const CalculateProjectResultsTable: React.FC<Props> = ({ calculatedActivities, activities, COST_THRESHOLD, calculate }) => {
  return (
    <div>
      <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">
        Berechnungsergebnis
      </h3>
      <button
        onClick={calculate}
        className="mb-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        Berechnen
      </button>
      {calculatedActivities.length > 0 ? (
        <div className="max-w-full overflow-x-auto custom-scrollbar">
          <table className="w-full table-auto border-collapse border border-gray-300 dark:border-gray-700">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-800">
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-700">Release</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-700">Prozess</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-700">Aktivität</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-700">Trigger</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-700">Zeit bekannt (Minuten)</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-700">Zeit unbekannt (Minuten)</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-700">Num Roles</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-700">Startdatum</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-700">Enddatum</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-700">Dauer (Tage)</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-700">Kosten (€)</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-700">Startkonflikt</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-700">Datumskonflikt</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-700">Budgetkonflikt</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-700">Aktivitätskostenkonflikt</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-700">Status</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-700">Warnung</th>
              </tr>
            </thead>
            <tbody>
              {calculatedActivities.map((activity: CalculatedActivity) => {
                const originalActivity: Activity = activities.find((a: Activity) => a._id === activity.id) || { _id: '', name: '', knownTime: 0, estimatedTime: 0 };
                return (
                  <tr
                    key={`${activity.id}-${activity.releaseId}-${activity.processId}`}
                    className={activity.hasError ? 'bg-red-50 dark:bg-red-900' : 'hover:bg-gray-100 dark:hover:bg-gray-800'}
                  >
                    <td className="px-4 py-2 text-sm text-gray-800 dark:text-gray-200 border border-gray-300 dark:border-gray-700">
                      {activity.releaseName}
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-800 dark:text-gray-200 border border-gray-300 dark:border-gray-700">
                      {activity.processName}
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-800 dark:text-gray-200 border border-gray-300 dark:border-gray-700">
                      <div className="flex items-center">
                        {activity.hasError && (
                          <svg className="w-4 h-4 text-red-500 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                          </svg>
                        )}
                        {activity.name}
                      </div>
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-800 dark:text-gray-200 border border-gray-300 dark:border-gray-700">{activity.trigger}</td>
                    <td className="px-4 py-2 text-sm text-gray-800 dark:text-gray-200 border border-gray-300 dark:border-gray-700">{originalActivity.knownTime}</td>
                    <td className="px-4 py-2 text-sm text-gray-800 dark:text-gray-200 border border-gray-300 dark:border-gray-700">{originalActivity.estimatedTime}</td>
                    <td className="px-4 py-2 text-sm text-gray-800 dark:text-gray-200 border border-gray-300 dark:border-gray-700">{activity.numRoles || 0}</td>
                    <td className="px-4 py-2 text-sm text-gray-800 dark:text-gray-200 border border-gray-300 dark:border-gray-700">{activity.start}</td>
                    <td className="px-4 py-2 text-sm text-gray-800 dark:text-gray-200 border border-gray-300 dark:border-gray-700">{activity.end}</td>
                    <td className="px-4 py-2 text-sm text-gray-800 dark:text-gray-200 border border-gray-300 dark:border-gray-700">{activity.duration}</td>
                    <td className={`px-4 py-2 text-sm border border-gray-300 dark:border-gray-700 ${activity.cost > COST_THRESHOLD ? 'text-orange-500 dark:text-orange-400' : 'text-gray-800 dark:text-gray-200'}`}>
                      {activity.cost}
                      {activity.cost > COST_THRESHOLD && (
                        <span className="ml-1 inline-flex items-center">
                          <svg className="w-4 h-4 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                          </svg>
                          <span className="ml-1 text-sm text-orange-500 dark:text-orange-400">
                            Hohe Kosten
                          </span>
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-800 dark:text-gray-200 border border-gray-300 dark:border-gray-700">
                      {activity.startConflict === 'Startkonflikt' ? (
                        <div className="flex items-center text-red-500 dark:text-red-400">
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                          </svg>
                          Startkonflikt
                        </div>
                      ) : (
                        'Kein Konflikt'
                      )}
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-800 dark:text-gray-200 border border-gray-300 dark:border-gray-700">
                      {activity.dateConflict === 'Datumskonflikt' ? (
                        <div className="flex items-center text-red-500 dark:text-red-400">
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                          </svg>
                          Datumskonflikt
                        </div>
                      ) : (
                        'Kein Konflikt'
                      )}
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-800 dark:text-gray-200 border border-gray-300 dark:border-gray-700">
                      {activity.budgetConflict === 'Budgetkonflikt' ? (
                        <div className="flex items-center text-red-500 dark:text-red-400">
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                          </svg>
                          Budgetüberschreitung
                        </div>
                      ) : (
                        'Kein Konflikt'
                      )}
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-800 dark:text-gray-200 border border-gray-300 dark:border-gray-700">
                      {activity.activityCostConflict === 'Hohe Kosten' ? (
                        <div className="flex items-center text-red-500 dark:text-red-400">
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                          </svg>
                          Kostenüberschreitung
                        </div>
                      ) : (
                        'Kein Konflikt'
                      )}
                    </td>
                    <td className={`px-4 py-2 text-sm border border-gray-300 dark:border-gray-700 ${activity.hasError ? 'text-red-500 dark:text-red-400' : 'text-green-500 dark:text-green-400'}`}>
                      {activity.hasError ? 'Fehler: Kein Trigger' : 'OK'}
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-800 dark:text-gray-200 border border-gray-300 dark:border-gray-700">
                      {activity.warning || '-'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-gray-700 dark:text-gray-300 mb-4">
          Bitte klicken Sie auf "Berechnen", um die Ergebnisse anzuzeigen.
        </p>
      )}
    </div>
  );
};

export default CalculateProjectResultsTable;