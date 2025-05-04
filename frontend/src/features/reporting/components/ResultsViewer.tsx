interface QueryCondition {
    field: string;
    value: string;
  }
  
  interface DependentResult {
    table: string;
    data: any[];
  }
  
  interface ResultsViewerProps {
    selectedTable: string;
    dependentTable: string | null;
    results: any[];
    dependentResults: DependentResult[];
    conditions: QueryCondition[];
  }
  
  const ResultsViewer: React.FC<ResultsViewerProps> = ({
    selectedTable,
    dependentTable,
    results,
    dependentResults,
    conditions,
  }) => {
    return (
      <div className="mt-6">
        <h3 className="text-lg font-semibold text-[#374151] mb-2">Ergebnisse</h3>
        {results.length > 0 ? (
          <ul className="list-disc list-inside text-[#374151]">
            {results.map((result, index) => (
              <li key={index} className="mb-4">
                {conditions.map((condition, idx) => {
                  let displayValue = result[condition.field];
                  if (
                    condition.field === 'process' ||
                    condition.field === 'executedBy' ||
                    condition.field === 'department' ||
                    condition.field === 'company' ||
                    condition.field === 'subordinateRoles' ||
                    condition.field === 'supervisorRole'
                  ) {
                    displayValue = displayValue?.name || displayValue?._id || 'N/A';
                  } else if (Array.isArray(displayValue)) {
                    displayValue = displayValue.map((item: any) => item.name || item._id || 'N/A').join(', ') || 'N/A';
                  }
                  return (
                    <div key={idx} className={`ml-${idx * 4}`}>
                      {displayValue || 'N/A'}
                    </div>
                  );
                })}
                {dependentResults.length > 0 && (
                  <div className="ml-8 mt-2">
                    {dependentResults.map((dep: DependentResult, depIndex: number) => (
                      <div key={depIndex} className="mb-4">
                        <div className="font-semibold">Daten aus {dep.table}:</div>
                        <ul className="list-disc list-inside ml-4">
                          {dep.data.length > 0 ? (
                            dep.data.map((dependentItem: any, idx: number) => (
                              <li key={idx}>
                                {Object.keys(dependentItem).map((key, i) => (
                                  <span key={i}>
                                    {dependentItem[key]}{i < Object.keys(dependentItem).length - 1 && ', '}
                                  </span>
                                ))}
                              </li>
                            ))
                          ) : (
                            <li>Keine Daten vorhanden</li>
                          )}
                        </ul>
                      </div>
                    ))}
                  </div>
                )}
                {selectedTable === 'roles' && dependentResults.length > 0 && dependentResults.some(dep => dep.table === 'activities') && (
                  <>
                    <div className="font-semibold">Aktivitäten ausgeführt:</div>
                    <ul className="list-disc list-inside ml-4">
                      {dependentResults.find((dep: DependentResult) => dep.table === 'activities')?.data?.length > 0 ? (
                        dependentResults.find((dep: DependentResult) => dep.table === 'activities')!.data.map((activity: any, idx: number) => (
                          <li key={idx}>{activity.name}</li>
                        ))
                      ) : (
                        <li>Keine Aktivitäten vorhanden</li>
                      )}
                    </ul>
                    <div className="font-semibold mt-2">Untergeordnete Rollen:</div>
                    <ul className="list-disc list-inside ml-4">
                      {dependentResults.find((dep: DependentResult) => dep.table === 'roles')?.data?.length > 0 ? (
                        dependentResults.find((dep: DependentResult) => dep.table === 'roles')!.data.map((subRole: any, idx: number) => (
                          <li key={idx}>{subRole.name}</li>
                        ))
                      ) : (
                        <li>Keine untergeordneten Rollen vorhanden</li>
                      )}
                    </ul>
                  </>
                )}
                {selectedTable === 'activities' && dependentResults.length > 0 && (
                  <>
                    <div className="font-semibold">Trigger:</div>
                    <ul className="list-disc list-inside ml-4">
                      {dependentResults.find((dep: DependentResult) => dep.table === 'workproducts')?.data?.length > 0 ? (
                        dependentResults.find((dep: DependentResult) => dep.table === 'workproducts')!.data.map((trigger: any, idx: number) => (
                          <li key={idx}>{trigger.name || 'Unbekannt'}</li>
                        ))
                      ) : (
                        <li>Keine Trigger vorhanden</li>
                      )}
                    </ul>
                    <div className="font-semibold mt-2">Ergebnis:</div>
                    <div className="ml-4">{dependentResults.find((dep: DependentResult) => dep.table === 'results')?.data?.[0]?.name || 'N/A'}</div>
                  </>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-[#374151]">Keine Ergebnisse gefunden.</p>
        )}
      </div>
    );
  };
  
  export default ResultsViewer;