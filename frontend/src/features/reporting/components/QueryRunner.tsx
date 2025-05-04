interface QueryTable {
  name: string;
  label: string;
  fields: QueryField[];
}

interface QueryField {
  name: string;
  label: string;
}

interface QueryCondition {
  field: string;
  value: string;
}

interface DependentTable {
  table: string;
  fields: string[];
  dependent?: DependentTable;
}

interface QueryRunnerProps {
  selectedTable: string;
  conditions: QueryCondition[];
  dependentTables: DependentTable[];
  setResults: (results: any[]) => void;
  setDependentResults: (results: any[]) => void;
  queryTables: QueryTable[];
}

export const runQuery = async (
  selectedTable: string,
  conditions: QueryCondition[],
  dependentTables: DependentTable[],
  setResults: (results: any[]) => void,
  setDependentResults: (results: any[]) => void,
  queryTables: QueryTable[]
) => {
  try {
    const response = await fetch(`http://localhost:5001/api/${selectedTable}`);
    if (!response.ok) {
      throw new Error('Fehler beim Abrufen der Daten');
    }
    const data = await response.json();
    console.log('Geladene Daten:', data);

    let filteredResults = data;
    conditions.forEach((condition) => {
      if (condition.value.trim() !== '') {
        filteredResults = filteredResults.filter((item: any) => {
          const fieldValue = item[condition.field]?.toString().toLowerCase() || '';
          const filterValue = condition.value.toLowerCase();
          return fieldValue.includes(filterValue);
        });
      }
    });

    setResults(filteredResults);
    console.log('Gefilterte Ergebnisse:', filteredResults);

    let dependentData: any[] = [];
    if (dependentTables.length > 0 && filteredResults.length > 0) {
      const primaryIds = filteredResults.map((item: any) => item._id);
      for (const depTable of dependentTables) {
        if (!depTable.table) continue;
        const dependentResponse = await fetch(`http://localhost:5001/api/${depTable.table}`);
        if (!dependentResponse.ok) {
          throw new Error(`Fehler beim Abrufen der Daten von ${depTable.table}`);
        }
        const dependentDataRaw = await dependentResponse.json();

        let levelData: any[] = [];
        if (depTable.table === 'activities' && selectedTable === 'roles') {
          levelData = dependentDataRaw.filter((activity: any) =>
            primaryIds.includes(
              typeof activity.executedBy === 'string' ? activity.executedBy : activity.executedBy?._id
            )
          );
        } else if (depTable.table === 'activities' && selectedTable === 'processes') {
          levelData = dependentDataRaw.filter((activity: any) =>
            primaryIds.includes(
              typeof activity.process === 'string' ? activity.process : activity.process?._id
            )
          );
        } else if (depTable.table === 'roles' && selectedTable === 'departments') {
          levelData = dependentDataRaw.filter((role: any) =>
            primaryIds.includes(
              typeof role.department === 'string' ? role.department : role.department?._id
            )
          );
        } else if (depTable.table === 'workproducts' && selectedTable === 'activities') {
          levelData = dependentDataRaw.filter((wp: any) =>
            filteredResults.some((activity: any) =>
              activity.trigger?.workProducts?.some((trigger: any) =>
                trigger._id === wp._id || trigger === wp._id
              )
            )
          );
        } else if (depTable.table === 'roles' && selectedTable === 'activities') {
          levelData = dependentDataRaw.filter((role: any) =>
            filteredResults.some((activity: any) =>
              role._id === (typeof activity.executedBy === 'string' ? activity.executedBy : activity.executedBy?._id)
            )
          );
        } else if (depTable.table === 'processes' && selectedTable === 'activities') {
          levelData = dependentDataRaw.filter((process: any) =>
            filteredResults.some((activity: any) =>
              process._id === (typeof activity.process === 'string' ? activity.process : activity.process?._id)
            )
          );
        }

        levelData = levelData.map((item: any) => {
          const filteredItem: any = {};
          depTable.fields.forEach((field: string) => {
            filteredItem[field] = item[field];
          });
          return filteredItem;
        });

        dependentData.push({ table: depTable.table, data: levelData });

        if (depTable.dependent) {
          const secondaryIds = levelData.map((item: any) => item._id);
          const secondaryResponse = await fetch(`http://localhost:5001/api/${depTable.dependent.table}`);
          if (!secondaryResponse.ok) {
            throw new Error(`Fehler beim Abrufen der Daten von ${depTable.dependent.table}`);
          }
          const secondaryDataRaw = await secondaryResponse.json();

          let secondaryLevelData: any[] = [];
          if (depTable.dependent.table === 'activities' && depTable.table === 'roles') {
            secondaryLevelData = secondaryDataRaw.filter((activity: any) =>
              secondaryIds.includes(
                typeof activity.executedBy === 'string' ? activity.executedBy : activity.executedBy?._id
              )
            );
          } else if (depTable.dependent.table === 'roles' && depTable.table === 'departments') {
            secondaryLevelData = secondaryDataRaw.filter((role: any) =>
              secondaryIds.includes(
                typeof role.department === 'string' ? role.department : role.department?._id
              )
            );
          }

          secondaryLevelData = secondaryLevelData.map((item: any) => {
            const filteredItem: any = {};
            depTable.dependent!.fields.forEach((field: string) => {
              filteredItem[field] = item[field];
            });
            return filteredItem;
          });

          dependentData.push({ table: depTable.dependent.table, data: secondaryLevelData });
        }
      }
    } else if (selectedTable === 'roles' && filteredResults.length > 0) {
      const roleIds = filteredResults.map((role: any) => role._id);
      const activitiesResponse = await fetch(`http://localhost:5001/api/activities`);
      if (!activitiesResponse.ok) {
        throw new Error('Fehler beim Abrufen der Aktivitäten');
      }
      const activitiesData = await activitiesResponse.json();
      const activities = activitiesData.filter((activity: any) =>
        roleIds.includes(
          typeof activity.executedBy === 'string' ? activity.executedBy : activity.executedBy?._id
        )
      );

      const rolesResponse = await fetch(`http://localhost:5001/api/roles`);
      if (!rolesResponse.ok) {
        throw new Error('Fehler beim Abrufen der Rollen');
      }
      const rolesData = await rolesResponse.json();

      dependentData = filteredResults.map((role: any) => {
        const subordinateRoles = rolesData.filter((subRole: any) =>
          role.subordinateRoles?.includes(subRole._id)
        );
        return {
          activities,
          subordinateRoles,
        };
      });
    } else if (selectedTable === 'activities' && filteredResults.length > 0) {
      const activityIds = filteredResults.map((activity: any) => activity._id);

      const triggersResponse = await fetch(`http://localhost:5001/api/workproducts`);
      if (!triggersResponse.ok) {
        throw new Error('Fehler beim Abrufen der Work Products');
      }
      const triggersData = await triggersResponse.json();

      const resultsResponse = await fetch(`http://localhost:5001/api/workproducts`);
      if (!resultsResponse.ok) {
        throw new Error('Fehler beim Abrufen der Ergebnisse');
      }
      const resultsData = await resultsResponse.json();

      dependentData = filteredResults.map((activity: any) => {
        const activityTriggers = triggersData.filter((wp: any) =>
          activity.trigger?.workProducts?.some((trigger: any) =>
            trigger._id === wp._id || trigger === wp._id
          )
        );
        const activityResult = resultsData.find((res: any) =>
          activity.result?._id === res._id || activity.result === res._id
        );
        return {
          triggers: activityTriggers,
          result: activityResult?.name || activity.result || 'N/A',
        };
      });
    }

    setDependentResults(dependentData);
    console.log('Abhängige Ergebnisse:', dependentData);
  } catch (err: any) {
    console.error('Fehler beim Ausführen der Abfrage:', err);
    setResults([]);
    setDependentResults([]);
  }
};

const QueryRunner: React.FC<QueryRunnerProps> = ({
  selectedTable,
  conditions,
  dependentTables,
  setResults,
  setDependentResults,
  queryTables,
}) => {
  return (
    <button
      onClick={() => runQuery(selectedTable, conditions, dependentTables, setResults, setDependentResults, queryTables)}
      className="px-4 py-2 bg-[#2563eb] text-[#ffffff] rounded hover:bg-[#60a5fa] focus:outline-none focus:ring-2 focus:ring-[#2563eb]"
    >
      Abfrage ausführen
    </button>
  );
};

export default QueryRunner;