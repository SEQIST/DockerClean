import React from 'react';

const CalculationResultTable = ({ calculatedActivities, activities, COST_THRESHOLD, calculate }: { calculatedActivities: any; activities: any; COST_THRESHOLD: number; calculate: any }) => {
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
              </tr>
            </thead>
            <tbody>
              {calculatedActivities.map((activity: any) => {
                const originalActivity = activities.find((a: any) => a._id === activity.id) || {};
                return (
                  <tr key={activity.id} className={activity.hasError ? 'bg-red-50 dark:bg-red-900' : 'hover:bg-gray-100 dark:hover:bg-gray-800'}>
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
                    <td className="px-4 py-2 text-sm text-gray-800 dark:text-gray-200 border border-gray-300 dark:border-gray-700">{activity.triggeredBy ? 'Ja' : 'Nein'}</td>
                    <td className="px-4 py-2 text-sm text-gray-800 dark:text-gray-200 border border-gray-300 dark:border-gray-700">{originalActivity.knownTime || 0}</td>
                    <td className="px-4 py-2 text-sm text-gray-800 dark:text-gray-200 border border-gray-300 dark:border-gray-700">{originalActivity.estimatedTime || 0}</td>
                    <td className="px-4 py-2 text-sm text-gray-800 dark:text-gray-200 border border-gray-300 dark:border-gray-700">{activity.numRoles || 0}</td>
                    <td className="px-4 py-2 text-sm text-gray-800 dark:text-gray-200 border border-gray-300 dark:border-gray-700">{activity.startDate}</td>
                    <td className="px-4 py-2 text-sm text-gray-800 dark:text-gray-200 border border-gray-300 dark:border-gray-700">{activity.endDate}</td>
                    <td className="px-4 py-2 text-sm text-gray-800 dark:text-gray-200 border border-gray-300 dark:border-gray-700">{activity.duration}</td>
                    <td className={`px-4 py-2 text-sm border border-gray-300 dark:border-gray-700 ${activity.highCost ? 'text-orange-500 dark:text-orange-400' : 'text-gray-800 dark:text-gray-200'}`}>
                      {activity.cost}
                      {activity.highCost && (
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
                      {activity.startConflict ? (
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
                      {activity.dateConflict ? (
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
                      {activity.budgetConflict ? (
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
                      {activity.activityCostConflict ? (
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

export default CalculationResultTable;